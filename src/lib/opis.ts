// Opis artikla od dobavljača → uredan HTML za prikaz. Sređuje se pri prikazu (baza ostaje kakva jeste), pa važi
// za sve artikle odjednom i za buduće uvoze:
// - čist tekst (Promosolution): redovi → pasusi, „Ključne karakteristike:" → naslov, „a • b • c" → lista
// - kratak pasus koji je ceo podebljan, završava se dvotačkom ili je poznat naslov („Deklaracija") → naslov
// - redovi sa „•" (i u pasusu sa <br>, i pasus po pasus) → lista
// - tabela sa dve kolone (Proizvođač / Poreklo / Uvoznik, Karakteristike) → tabela „ključ – vrednost"
// - tabela veličina: prvi red je zaglavlje; prazna kolona između dve polovine se uklanja, a polovine se slažu
//   jedna ispod druge
// - prazni pasusi, &nbsp; i prazni redovi/kolone se uklanjaju

const POZNATI_NASLOVI = /^(deklaracija|karakteristike|tehničke karakteristike|tehnički podaci|tabela veličina( [^:]*)?\*?|primena|prednosti|sastav( jakne| materijala)?|dostupn[aei] (veličine|boje|modeli|pakovanja)|standardi?|napomena|opis|sistemske informacije|industrije i primena|ključne (karakteristike|funkcionalnosti)|primenjene tehnologije|tehničke specifikacije)$/i;
const BLOK = "p|div|table|thead|tbody|tr|td|th|h[1-6]|ul|ol|li";
const ZNAK_LISTE = /^(?:•|·|▪|►|✓|✔|[-–]\s)\s*/;
const VELICINA = /^(\d+([,.]\d+)?(\s*[-/]\s*\d+([,.]\d+)?)?|\d?X{0,3}[SML]|\d?XL|XXL|uni(verzalna)?)$/i;

const tekst = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&(lt|gt|#\d+);/gi, "x").replace(/\s+/g, " ").trim();

// Znakovi koje dobavljači pišu kao entitete (&bull;, &scaron;…) → pravi znak, da se prepoznaju liste i naslovi
const ENTITETI: Record<string, string> = {
  bull: "•", middot: "·", ndash: "–", mdash: "—", rarr: "→", larr: "←", hellip: "…", deg: "°", sup2: "²", sup3: "³",
  scaron: "š", Scaron: "Š", zcaron: "ž", Zcaron: "Ž", ccaron: "č", Ccaron: "Č", cacute: "ć", Cacute: "Ć", dstrok: "đ", Dstrok: "Đ",
  quot: '"', rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", bdquo: "„", reg: "®", trade: "™", copy: "©", le: "≤", ge: "≥",
  plusmn: "±", times: "×", micro: "µ", frac12: "½", euro: "€", laquo: "«", raquo: "»",
};
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const bezDvotacke = (s: string) => s.replace(/\s*:\s*$/, "");

/** Red (jedan red pasusa) je naslov: kratak, bez tačke na kraju, i ceo podebljan / sa dvotačkom / poznat */
function jeNaslov(red: string): boolean {
  const t = tekst(red);
  if (!t || t.length > 70 || /[.!?]$/.test(t) || ZNAK_LISTE.test(t) || t.startsWith("*")) return false;
  // „Dimenzije: 40 cm", „crvena : S, XL" su podatak (ključ: vrednost), ne naslov
  if (/:\s*\S/.test(t)) return false;
  const podebljan = /^<(b|strong)>[\s\S]*<\/\1>$/i.test(red) && !/<\/(b|strong)>[\s\S]*\S[\s\S]*<(b|strong)>/i.test(red);
  return podebljan || t.endsWith(":") || POZNATI_NASLOVI.test(bezDvotacke(t));
}

const naslov = (red: string) => `<h4>${bezDvotacke(red.replace(/<\/?(b|strong|em|i|u)>/gi, "").trim())}</h4>`;

/** Redovi jednog pasusa → naslov / lista / pasus */
function redovi(linije: string[]): string {
  const out: string[] = [];
  let lista: string[] | null = null;
  let pasus: string[] = [];
  const zatvoriPasus = () => {
    if (pasus.length) out.push(pasus[0].trimStart().startsWith("*") && pasus.length === 1 ? `<p class="napomena">${pasus[0]}</p>` : `<p>${pasus.join("<br>")}</p>`);
    pasus = [];
  };
  const zatvoriListu = () => {
    if (lista) out.push(`<ul>${lista.map((l) => `<li>${l}</li>`).join("")}</ul>`);
    lista = null;
  };
  linije.forEach((red, i) => {
    const t = tekst(red);
    if (ZNAK_LISTE.test(t)) {
      zatvoriPasus();
      (lista ??= []).push(red.replace(/^((?:\s|<(?:b|strong|em)>)*)(?:•|·|▪|►|✓|✔|[-–](?=\s))\s*/, "$1").trim());
    } else if (lista && !jeNaslov(red)) {
      // nastavak stavke („• Upija vlagu<br><b>100% pamuk:</b> …")
      lista[lista.length - 1] += `<br>${red}`;
    } else if (jeNaslov(red) && (i < linije.length - 1 || linije.length === 1)) {
      zatvoriPasus();
      zatvoriListu();
      out.push(naslov(red));
    } else {
      zatvoriListu();
      pasus.push(red);
    }
  });
  zatvoriPasus();
  zatvoriListu();
  return out.join("");
}

function pasus(sadrzaj: string): string {
  const linije = sadrzaj.split(/<br\s*\/?>/i).map((l) => l.trim()).filter((l) => tekst(l));
  if (!linije.length) return "";
  // „a • b • c" u jednom redu
  if (linije.length === 1 && tekst(linije[0]).split(" • ").length > 2) {
    return `<ul>${linije[0].split(/\s•\s/).map((l) => `<li>${l.trim()}</li>`).join("")}</ul>`;
  }
  return redovi(linije);
}

/** Tabela → čista tabela: „kv" (ključ – vrednost) ili „mere" (zaglavlje + redovi) */
function tabela(html: string): string {
  let red = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[dh]>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
      c[1].replace(/<br\s*\/?>/gi, " ").replace(/<(b|strong|em|i)>\s*<\/\1>/gi, "").replace(/\s+/g, " ").trim(),
    ),
  );
  red = red.filter((r) => r.some((c) => tekst(c)));
  if (!red.length) return "";
  const kolona = Math.max(...red.map((r) => r.length));
  red = red.map((r) => [...r, ...Array(kolona - r.length).fill("")]);
  const prazne = [...Array(kolona).keys()].filter((k) => red.every((r) => !tekst(r[k])));

  // Tabela veličina u dve polovine („veličina | dužina | (prazno) | veličina | dužina") → jedna ispod druge
  if (prazne.length === 1 && prazne[0] > 0) {
    const k = prazne[0];
    const levo = red.map((r) => r.slice(0, k));
    const desno = red.map((r) => r.slice(k + 1));
    if (levo[0].length === desno[0].length && levo[0].map(tekst).join("|") === desno[0].map(tekst).join("|")) {
      red = [...levo, ...desno.slice(1)].filter((r) => r.some((c) => tekst(c)));
    }
  }
  const ostaju = [...Array(red[0].length).keys()].filter((k) => red.some((r) => tekst(r[k] ?? "")));
  red = red.map((r) => ostaju.map((k) => r[k] ?? ""));

  const prvaKolona = red.slice(1).map((r) => tekst(r[0]));
  const mere = red[0].length > 2 || red[0].every((c) => /^<(em|i|b|strong)>/i.test(c)) ||
    (prvaKolona.length > 1 && prvaKolona.filter((t) => VELICINA.test(t)).length / prvaKolona.length >= 0.6);

  if (!mere) {
    return `<div class="opis-tabela"><table class="kv"><tbody>${red
      .map((r) => `<tr><td>${bezDvotacke(r[0].replace(/<\/?(b|strong|em|i)>/gi, ""))}</td><td>${r.slice(1).join(" ")}</td></tr>`)
      .join("")}</tbody></table></div>`;
  }
  const [zaglavlje, ...telo] = red;
  const celija = (c: string) => c.replace(/<\/?(b|strong|em|i)>/gi, "");
  return `<div class="opis-tabela"><table class="mere"><thead><tr>${zaglavlje.map((c) => `<th>${celija(c)}</th>`).join("")}</tr></thead><tbody>${telo
    .map((r) => `<tr>${r.map((c) => `<td>${celija(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function izTeksta(opis: string): string {
  const linije = opis.split(/\r?\n/).map((l) => escape(l.trim())).filter(Boolean);
  const out: string[] = [];
  for (const l of linije) {
    if (l.split(" • ").length > 2) out.push(`<ul>${l.split(" • ").map((s) => `<li>${s.trim()}</li>`).join("")}</ul>`);
    else out.push(pasus(l));
  }
  return spoji(out.join(""));
}

// Uzastopne liste (svaka stavka u svom pasusu) → jedna lista
const spoji = (html: string) => html.replace(/<\/ul><ul>/g, "");

/** Blok iz izvora: naslov se čisti (bez podebljanja i dvotačke), lista i tabela ostaju */
function blok(tag: string, html: string): string {
  const h = tag.match(/^h(\d)$/);
  if (!h) return html.replace(/<\/?p>/g, "");
  const t = html.replace(/<[^>]+>/g, "").trim();
  const n = Math.max(3, Number(h[1]));
  return t ? `<h${n}>${bezDvotacke(t)}</h${n}>` : "";
}

export function urediOpis(opis: string | null | undefined): string | null {
  if (!opis?.trim()) return null;
  if (!/<[a-z][^>]*>/i.test(opis)) return izTeksta(opis);

  let html = opis
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/&([a-z0-9]+);/gi, (m, e) => ENTITETI[e] ?? m)
    .replace(/<(\/?)(\w+)[^>]*?(\/?)>/g, (_, z, tag, s) => `<${z}${tag.toLowerCase()}${s}>`) // bez atributa
    .replace(new RegExp(`\\s*(<\\/?(?:${BLOK})>)\\s*`, "g"), "$1")
    .replace(/<\/(b|strong)><\1>/g, "")
    .replace(/<(b|strong|em|i|u)>(\s*)<\/\1>/g, "$2");

  // Tabela upisana u ćeliju druge tabele → samo unutrašnja
  html = html.replace(/<table><tbody><tr><td>(<table>[\s\S]*?<\/table>)<\/td>(<td>\s*<\/td>)*<\/tr><\/tbody><\/table>/g, "$1");
  html = html.replace(/<table>[\s\S]*?<\/table>/g, tabela);

  // Deljenje na blokove (lista, tabela, naslov) i tekst između njih. Pasusi se ne uparuju po <p>…</p>, jer
  // dobavljači ume da ostave listu u nezatvorenom pasusu („<p>tekst<ul>…</ul>tekst</p>"): <p> i </p> su samo
  // granice pasusa, pa svaki komad teksta postaje svoj pasus
  const out: string[] = [];
  const tekstDeo = (s: string) => s.split(/<\/?p>/).forEach((d) => out.push(pasus(d)));
  const re = /<(\/?)(ul|ol|div|h[1-6])\b[^>]*>/g;
  let start = 0, otvoren = "", dubina = 0, pocetak = 0;
  for (let m; (m = re.exec(html)); ) {
    const [, zatvara, tag] = m;
    if (!otvoren) {
      if (zatvara) continue; // zalutali zatvarajući tag
      tekstDeo(html.slice(start, m.index));
      otvoren = tag; dubina = 1; pocetak = m.index;
    } else if (tag === otvoren) {
      dubina += zatvara ? -1 : 1;
      if (!dubina) {
        start = re.lastIndex;
        out.push(blok(otvoren, html.slice(pocetak, start)));
        otvoren = "";
      }
    }
  }
  if (otvoren) out.push(blok(otvoren, html.slice(pocetak)));
  else tekstDeo(html.slice(start));
  html = out.join("");
  return spoji(html).trim() || null;
}
