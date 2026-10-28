import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { categoryHref, contact } from "@/data/site";
import { getSajt } from "@/lib/sajt";
import { jsonLd, podaciFirme } from "@/lib/seo";
import { RadnoVremeTabela } from "./kontakt/Radnja";
import { STIT } from "./logoPutanje";
import Newsletter from "./footer/Newsletter";
import NaVrh from "./footer/NaVrh";
import Razdvajac from "./Razdvajac";

/*
  Footer kao signalizacija na gradilištu: tamna površina, žuta je znak (traka, strelice), ne ukras.
  1. Traka upozorenja: žuta „pažnja" traka sa šrafurom na ivicama, blago iskošena; tekst polako klizi (staje na hover / „smanji pokrete")
  2. Uvod: naslov sa ključnim pojmovima pretrage i opis firme, dva dugmeta; logo desno u umerenoj veličini
  3. Tehnička mreža sa tankim linijama i brojevima 01-05, kao natpisna pločica na opremi: kontakt i podaci firme, radno vreme, linkovi
  4. Novosti u jednom redu, polje kao na papirnom obrascu (samo donja linija)
  5. Donja traka: pravne strane, mreže, „Na vrh"
  6. Na samom dnu, ispod linije: © i potpis agencije (Zeroblynk)
  Kontakt podaci i radno vreme iz Admin → Podešavanja → Sajt.
*/

const kupovina = [
  { name: "Sva oprema", href: "/prodavnica/" },
  { name: "Radna odeća", href: categoryHref("zastitna-i-radna-odeca") },
  { name: "Zaštitna obuća", href: categoryHref("zastitna-i-radna-obuca") },
  { name: "Rukavice", href: categoryHref("zastitne-i-radne-rukavice") },
  { name: "Zaštita glave", href: categoryHref("zastita-glave") },
  { name: "Rad na visini", href: categoryHref("zastita-od-pada") },
];
const pomoc = [
  { name: "Plaćanje i isporuka", href: "/placanje-i-isporuka/" },
  { name: "Kako naručiti", href: "/kako-naruciti/" },
  { name: "Status porudžbine", href: "/status-porudzbine/" },
  { name: "Praćenje pošiljke", href: "/pracenje-posiljke/" },
  { name: "Reklamacija", href: "/reklamacija-proizvoda/" },
  { name: "Pravo na odustajanje", href: "/pravo-na-odustajanje/" },
];
const firma = [
  { name: "O nama", href: "/o-nama/" },
  { name: "Brendiranje odeće", href: "/brendiranje-odece/" },
  { name: "Brendovi", href: "/brendovi/" },
  { name: "Kontakt", href: "/kontakt/" },
  { name: "Moj nalog", href: "/moj-nalog/" },
];
const pravno = [
  { name: "Uslovi korišćenja", href: "/uslovi-koriscenja/" },
  { name: "Politika privatnosti", href: "/politika-privatnosti/" },
  { name: "Povraćaj novca i robe", href: "/povracaj-novca/" },
];

const traka = ["Radna odeća", "Zaštitna obuća", "Rukavice", "Zaštita glave", "Zaštita sluha", "Rad na visini", "Brendiranje odeće", `Besplatna isporuka iznad ${contact.freeShippingFrom}`, `Svilajnac, od ${contact.founded}.`];
const SRAFURA = "repeating-linear-gradient(-45deg, var(--brand-primary) 0 9px, var(--brand-on-primary) 9px 18px)";

// godina za ©: Cache Components ne dozvoljava `new Date()` u prerenderu, pa ide kroz keširanu funkciju (osvežava se dnevno)
async function tekucaGodina() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** zaglavlje ćelije tehničke mreže: „01 — RADNJA" */
function Oznaka({ broj, children }: { broj: string; children: string }) {
  return (
    <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-white/55">
      <span className="tabular-nums text-brand">{broj}</span>
      <span className="h-px w-6 bg-white/25" aria-hidden />
      {children}
    </p>
  );
}

function Linkovi({ broj, naslov, linkovi }: { broj: string; naslov: string; linkovi: { name: string; href: string }[] }) {
  return (
    <nav aria-label={naslov}>
      <Oznaka broj={broj}>{naslov}</Oznaka>
      <ul className="mt-6 space-y-2.5">
        {linkovi.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[16px] leading-snug text-white/90 decoration-brand decoration-2 underline-offset-[5px] transition hover:text-white hover:underline">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const podvuci = "decoration-brand decoration-2 underline-offset-[6px] hover:underline";

export default async function Footer() {
  const [s, godina] = await Promise.all([getSajt(), tekucaGodina()]);
  const mreze = [
    { href: s.facebook, label: "Facebook" },
    { href: s.instagram, label: "Instagram" },
  ].filter((m) => m.href);
  const stavkeTrake = [...traka, ...traka];

  return (
    <footer className="relative overflow-hidden bg-[#18191b] text-white">
      {/* 1. traka upozorenja */}
      <div className="traka relative -ml-[5%] mt-10 w-[110%] -rotate-[1.4deg] md:mt-14" aria-hidden>
        <div className="h-2" style={{ background: SRAFURA }} />
        <div className="overflow-hidden bg-brand py-3.5 text-on-brand md:py-4">
          <div className="traka-tece flex w-max items-center">
            {stavkeTrake.map((t, i) => (
              <span key={i} className="flex items-center gap-6 pr-6 text-[15px] font-medium uppercase tracking-[0.16em] md:text-[17px]">
                {t}
                <svg viewBox="0 0 296 354" className="h-4 w-auto" aria-hidden>
                  <path fill="currentColor" fillRule="evenodd" d={STIT} />
                </svg>
              </span>
            ))}
          </div>
        </div>
        <div className="h-2" style={{ background: SRAFURA }} />
      </div>

      <div className="container-site">
        {/* 2. uvod: poruka i dva dugmeta levo, logo desno (umeren, ne kao naslov) - telefon i ostali podaci su u „01 Kontakt" */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/12 pb-12 pt-14 md:pb-16 md:pt-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2 className="max-w-[900px] text-balance text-[28px] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[36px] md:text-[52px] md:leading-[1.05]">
              {/* ključni pojmovi pretrage („HTZ oprema", „zaštita na radu") u naslovu, dva reda približno iste dužine */}
              HTZ oprema za profesionalce.
              <br />
              <span className="text-brand">Zaštita na radu, bez kompromisa.</span>
            </h2>
            <p className="mt-5 max-w-[540px] text-[15px] leading-[25px] text-white/65 lg:max-w-[680px]">
              Radna odeća, zaštitna obuća, rukavice i lična zaštitna oprema vodećih evropskih brendova,
              {/* na desktopu „uz stručan savet…" počinje u drugom redu */}
              <br className="hidden lg:block" /> uz stručan savet pri izboru, ponude za firme i isporuku širom Srbije.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kontakt/#ponuda" className="btn-primary" style={{ height: 48, padding: "0 26px", fontSize: 15 }}>
                Zatražite ponudu
              </Link>
              <Link href="/prodavnica/" className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-medium transition hover:border-brand hover:text-brand">
                Pogledajte prodavnicu
              </Link>
            </div>
          </div>

          {/* logo desno: belo-žuta verzija za tamnu podlogu, ispod kratak potpis */}
          <Link href="/" aria-label="HTZ Shop - početna" className="group flex flex-col items-start gap-3 lg:items-end">
            <Image src="/images/logo/htz-logo-white.svg" alt="HTZ Shop" width={1784} height={354} className="h-11 w-auto transition-opacity group-hover:opacity-85 md:h-14" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">Zaštitna i radna oprema
              <Razdvajac />
              od {contact.founded}.</span>
          </Link>
        </div>

        {/* 3. tehnička mreža */}
        <div className="grid grid-cols-1 gap-y-12 border-b border-white/12 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-12 lg:gap-y-0">
          <div className="sm:pr-8 lg:col-span-3">
            <Oznaka broj="01">Kontakt</Oznaka>
            <p className="mt-6 text-[24px] font-medium leading-[1.15] tracking-[-0.01em]">
              {s.street}
              <br />
              {s.city}
            </p>
            <a href={s.mapsHref} target="_blank" rel="noreferrer" className={`mt-4 inline-block text-[15px] font-medium ${podvuci}`}>
              Otvori na mapi <span className="text-brand">↗</span>
            </a>
            {/* svi podaci firme na jednom mestu: kontakt iz admina (Podešavanja → Sajt), tekući račun iz data/site.ts */}
            <dl className="mt-6 space-y-2.5 border-t border-white/12 pt-5 text-[15px]">
              {[
                { k: "Telefon", v: s.phone, href: s.phoneHref },
                { k: "E-mail", v: s.email, href: `mailto:${s.email}` },
                { k: "PIB", v: s.pib },
                { k: "Matični br.", v: s.mb },
                { k: "Račun", v: contact.bank },
              ]
                .filter((r) => r.v)
                .map((r) => (
                  <div key={r.k} className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3">
                    <dt className="text-[13px] text-white/45">{r.k}</dt>
                    <dd className="break-words tabular-nums">
                      {r.href ? (
                        <a href={r.href} className={podvuci}>
                          {r.v}
                        </a>
                      ) : (
                        r.v
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
          <div className="lg:col-span-3 lg:border-l lg:border-white/12 lg:px-8">
            <Oznaka broj="02">Radno vreme</Oznaka>
            <div className="mt-5 text-[15px]">
              <RadnoVremeTabela week={s.week} hours={s.hours} tamno />
            </div>
          </div>
          <div className="lg:col-span-2 lg:border-l lg:border-white/12 lg:px-8">
            <Linkovi broj="03" naslov="Kupovina" linkovi={kupovina} />
          </div>
          <div className="lg:col-span-2 lg:border-l lg:border-white/12 lg:px-8">
            <Linkovi broj="04" naslov="Pomoć" linkovi={pomoc} />
          </div>
          <div className="lg:col-span-2 lg:border-l lg:border-white/12 lg:pl-8">
            <Linkovi broj="05" naslov="HTZ Shop" linkovi={firma} />
          </div>
        </div>

        {/* 4. novosti */}
        <div className="grid grid-cols-1 gap-8 border-b border-white/12 py-12 md:py-14 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16">
          <h2 className="text-[30px] font-medium leading-[1.08] tracking-[-0.02em] md:text-[42px]">
            Akcije jednom mesečno.
            <br />
            <span className="text-white/40">Ništa više od toga.</span>
          </h2>
          <Newsletter />
        </div>

        {/* 5. donja traka */}
        <div className="flex flex-col gap-6 py-8 text-[13px] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-white/50">
              {pravno.map((l) => (
                <Link key={l.href} href={l.href} className="underline-offset-4 transition hover:text-white hover:underline">
                  {l.name}
                </Link>
              ))}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {mreze.map((m) => (
              <a key={m.label} href={m.href} target="_blank" rel="noreferrer" className={`text-[14px] font-medium ${podvuci}`}>
                {m.label} <span className="text-brand">↗</span>
              </a>
            ))}
            <NaVrh />
          </div>
        </div>

        {/* 6. na samom dnu, odvojeno linijom: © levo, potpis agencije desno (svetla verzija Zeroblynk logoa kao na klikdogume, vodi na zeroblynk.com) */}
        <div className="flex flex-col gap-3 border-t border-white/12 py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/70">
            © {godina} {s.name}
          </p>
          <p className="flex items-center gap-2 text-white/55">
            Design &amp; developed by
            <a href="https://zeroblynk.com" target="_blank" rel="noopener noreferrer" aria-label="Zeroblynk - dizajn i izrada sajta" className="group/zb opacity-75 transition hover:opacity-100">
              {/* crno-beli u mirovanju, u boji na hover */}
              <Image src="/zeroblynk/logo-light.svg" alt="Zeroblynk" width={152} height={30} className="h-[15px] w-auto grayscale transition duration-300 group-hover/zb:grayscale-0" />
            </a>
          </p>
        </div>
      </div>

      {/* strukturirani podaci o firmi (schema.org Store) na svakoj strani - za Google i AI pretragu */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(podaciFirme(s)) }} />
    </footer>
  );
}
