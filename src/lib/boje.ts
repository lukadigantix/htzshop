// Naziv boje iz admina / od dobavljača → pozadina kružića (CSS background). Svaka boja je kružić, i kad je
// naziv neobičan: „tamno/svetlo/fluo/neon X" menja osnovnu nijansu, „crno-crvena" i „siva/teget" su kružić iz
// dve polovine, „maskirna", „višebojno" i „providne" imaju svoj uzorak, a nepoznat naziv dobija neutralan
// prugast kružić (naziv se vidi u title-u).

const OSNOVNE: Record<string, string> = {
  crna: "#1a1a1a", bela: "#ffffff", siva: "#8a8d91", plava: "#1f4e9c", crvena: "#b42318", teget: "#1c2a48",
  zelena: "#2f7d32", maslinasta: "#6b6b3a", žuta: "#f5c518", bež: "#d8c3a5", braon: "#6b4a2b", smeđa: "#6b4a2b",
  bordo: "#6d1a24", narandžasta: "#f26b1d", oranž: "#f26b1d", roze: "#f4a6c0", pink: "#e85d9a", ružičasta: "#e85d9a",
  ljubičasta: "#6a3d9a", lila: "#b39ddb", ciklama: "#c2185b", petrol: "#1d5c63", "petrol plava": "#1d5c63",
  tirkizna: "#1fa3a3", "tirkizno plava": "#1f9bb3", "rojal plava": "#2747b8", "royal plava": "#2747b8",
  pepeljasta: "#b8b8b0", antracit: "#3b3e42", "antracit siva": "#3b3e42", karamel: "#b9783d", senf: "#c9a227",
  "senf žuta": "#c9a227", perla: "#e8e4da", krem: "#f3ead7", "krem-bela": "#f5efe0", srebrna: "#c0c4c8",
  zlatna: "#c9a54a", moka: "#6f4e37", koral: "#ff7f50", mint: "#9fe2bf", šampanj: "#f1e3c4", mango: "#ffb347",
  "keli zelena": "#4cbb17", "beneton zelena": "#00a651", "žele zelena": "#7dc242", "kivi zelena": "#8ee53f",
  "grašak zelena": "#8fbc3a", "pastelno zelena": "#b8e0b0", "smaragdno zelena": "#1f8a5b", "perlato zelena": "#8fb9a8",
  "dinamo plava": "#2a5fc1", "azurno plava": "#2f8ae0", "fume siva": "#6e6e6e", "led siva": "#c9d1d6",
  "melanž siva": "#9b9b9b", "puder roze": "#f2c4cc", "mint svetlo plava": "#a8e0e6",
};

// Prefiksi: tamnija / svetlija nijansa osnovne; fluo i neon imaju svoje jarke nijanse
const FLUO: Record<string, string> = {
  žuta: "#d4ff1a", oranž: "#ff6a13", narandžasta: "#ff6a13", zelena: "#39e01f", roze: "#ff4fa3", ružičasta: "#ff2d95",
};

// Pridev u složenoj boji („crno-crvena", „sivo-žuta") → naziv boje
const PRIDEV: Record<string, string> = {
  crno: "crna", belo: "bela", sivo: "siva", plavo: "plava", zeleno: "zelena", crveno: "crvena", žuto: "žuta",
  braon: "braon", teget: "teget", narandžasto: "narandžasta", roze: "roze",
};

const UZORCI: Record<string, string> = {
  višebojno: "conic-gradient(#e53935, #fbc02d, #43a047, #1e88e5, #8e24aa, #e53935)",
  šarene: "conic-gradient(#e53935, #fbc02d, #43a047, #1e88e5, #8e24aa, #e53935)",
  maskirna: "radial-gradient(circle at 30% 30%, #4b5320 0 22%, transparent 23%), radial-gradient(circle at 70% 65%, #6b4a2b 0 20%, transparent 21%), radial-gradient(circle at 65% 25%, #2f3a1f 0 14%, transparent 15%), #8a8f5a",
  transparentna: "repeating-conic-gradient(#e6e8eb 0 25%, #ffffff 0 50%) 0 0 / 10px 10px",
  providne: "repeating-conic-gradient(#e6e8eb 0 25%, #ffffff 0 50%) 0 0 / 10px 10px",
};

/** Nepoznata boja: neutralan prugast kružić */
export const NEPOZNATA = "repeating-linear-gradient(45deg,#e2e4e8 0 3px,#fff 3px 6px)";

function pomesaj(hex: string, sa: string, udeo: number): string {
  const c = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const k = [0, 1, 2].map((i) => Math.round(c(hex, i) * (1 - udeo) + c(sa, i) * udeo));
  return `#${k.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Normalizovan naziv: mala slova, bez engleskog dodatka u zagradi i bez brojeva („siva 0030", „krem 029")
const cist = (naziv: string) =>
  naziv.toLowerCase().replace(/\(.*?\)/g, "").replace(/\d+/g, "").replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim();

/** Jedna boja (bez kombinacija) → hex */
function jedna(naziv: string): string | null {
  const n = PRIDEV[naziv] ?? naziv;
  if (OSNOVNE[n]) return OSNOVNE[n];
  const m = n.match(/^(tamno|svetlo|fluo|neon) (.+)$/);
  if (m) {
    const osnova = PRIDEV[m[2]] ?? m[2];
    if (m[1] === "fluo" || m[1] === "neon") return FLUO[osnova] ?? (OSNOVNE[osnova] ? pomesaj(OSNOVNE[osnova], "#ffffff", 0.15) : null);
    const hex = jedna(osnova);
    if (hex) return m[1] === "tamno" ? pomesaj(hex, "#000000", 0.35) : pomesaj(hex, "#ffffff", 0.45);
  }
  // „X zelena", „X plava"…: nepoznat pridev ispred poznate boje → ta boja
  const posl = n.split(" ").pop()!;
  return n.includes(" ") && OSNOVNE[posl] ? OSNOVNE[posl] : null;
}

/** CSS pozadina kružića za naziv boje (nepoznata → prugasta) */
export function bojaPozadina(naziv: string): string {
  const n = cist(naziv);
  if (UZORCI[n.split(" ")[0]]) return UZORCI[n.split(" ")[0]];
  // Naziv iz rečnika ima prednost („krem-bela"), pa kombinacija dve (ili više) boje: kružić iz polovina
  if (OSNOVNE[n]) return OSNOVNE[n];
  const delovi = n.split(/[-/,]| i /).map((d) => d.trim()).filter(Boolean);
  const hexovi = [...new Set(delovi.map(jedna).filter((h): h is string => Boolean(h)))];
  if (delovi.length > 1 && hexovi.length && delovi.every((d) => jedna(d))) {
    const [a, b] = hexovi;
    if (hexovi.length === 1) return a;
    return hexovi.length === 2
      ? `linear-gradient(135deg, ${a} 50%, ${b} 50%)`
      : `conic-gradient(${hexovi.map((h, i) => `${h} ${(i * 100) / hexovi.length}% ${((i + 1) * 100) / hexovi.length}%`).join(", ")})`;
  }
  return jedna(n) ?? hexovi[0] ?? NEPOZNATA;
}

/** Svetla boja (bela, žuta, krem…): na njoj se kvačica crta tamno */
export function svetlaBoja(naziv: string): boolean {
  const pozadina = bojaPozadina(naziv);
  const hex = pozadina.match(/#[0-9a-f]{6}/i)?.[0];
  if (!hex || pozadina === NEPOZNATA) return true;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
}
