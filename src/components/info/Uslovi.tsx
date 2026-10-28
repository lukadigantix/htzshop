import type { ReactNode } from "react";
import Link from "next/link";
import { contact } from "@/data/site";
import type { Sajt } from "@/lib/sajt";
import { STIT } from "../logoPutanje";
import Razdvajac from "../Razdvajac";
import { Phone } from "../Icons";

/*
  Zajednički delovi strana sa uslovima (Plaćanje i isporuka, Pravo na odustajanje…): tamni uvod sa trakom upozorenja,
  lepljiv sadržaj levo sa telefonom, numerisani odeljci desno, redovi pravila i česta pitanja. Svaka strana daje samo tekst.
*/

export type Odeljci = { id: string; naziv: string }[];
export type Pitanje = { q: string; a: string };

const TRAKA = "bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_16px,var(--text-primary)_16px_32px)]";

/** Tamni uvod: putanja, nadnaslov, krupan naslov (žuti deo kao <span className="text-brand">), opis; ispod opisa `children` (npr. brojke). */
export function UvodUslova({ naziv, naslov, opis, children }: { naziv: string; naslov: ReactNode; opis: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-brand/15 blur-[120px]" />
      <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -right-24 top-10 hidden h-[620px] w-auto text-white/[0.04] lg:block xl:right-10">
        <path fill="currentColor" fillRule="evenodd" d={STIT} />
      </svg>

      <div className="container-site relative pb-12 pt-10 md:pb-16 md:pt-14 xl:pb-20">
        <nav aria-label="Putanja" className="text-[13px] text-white/50">
          <Link href="/" className="hover:text-white">
            Početna
          </Link>
          <Razdvajac />
          <span className="text-white/80">{naziv}</span>
        </nav>

        <div className="hero-in mt-10 max-w-[900px] md:mt-14">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">{naziv}</p>
          <h1 className="mt-5 text-[42px] font-medium leading-[1.03] tracking-[-0.03em] md:text-[64px] xl:text-[80px]">{naslov}</h1>
          <p className="mt-6 max-w-[620px] text-[16px] leading-[27px] text-white/70 md:text-[17px] md:leading-[28px]">{opis}</p>
        </div>
        {children}
      </div>
      <div aria-hidden className={`h-2.5 ${TRAKA}`} />
    </section>
  );
}

/** Kratki odgovori u uvodu: ikonica, vrednost i opis, četiri u redu na širokom ekranu. */
export function UkratkoUslova({ stavke }: { stavke: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; vrednost: string; opis: string }[] }) {
  return (
    <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-white/10 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
      {stavke.map(({ Icon, vrednost, opis }, i) => (
        <div key={opis} className="flex items-start gap-4 bg-primary/90 p-5 backdrop-blur md:p-7">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full ${i === 0 ? "bg-brand text-on-brand" : "bg-white/10 text-brand"}`}>
            <Icon className="size-5" strokeWidth={1.7} />
          </span>
          <div className="flex min-w-0 flex-col-reverse">
            <dt className="mt-1 text-[13px] leading-[19px] text-white/55">{opis}</dt>
            <dd className="text-[22px] font-medium leading-tight tracking-[-0.01em] md:text-[24px]">{vrednost}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Sadržaj levo (lepljiv na širokom ekranu, red dugmića na telefonu) i odeljci desno. */
/** `gusto` za pravni tekst sa mnogo kratkih odeljaka (manji razmak između njih) */
export function OkvirUslova({ odeljci, telefon, gusto, children }: { odeljci: Odeljci; telefon: { label: string; href: string; natpis: string }; gusto?: boolean; children: ReactNode }) {
  return (
    <div className="container-site grid grid-cols-1 gap-10 py-12 md:py-20 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-24 print:block print:py-0">
      <aside className="lg:sticky lg:top-28 lg:self-start print:hidden">
        <nav aria-label="Sadržaj strane">
          <p className="kicker">Sadržaj</p>
          <ol className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
            {odeljci.map((o, i) => (
              <li key={o.id} className="shrink-0">
                <a
                  href={`#${o.id}`}
                  className={`group flex h-10 items-center gap-3 rounded-full bg-surface px-4 text-[14px] font-medium ring-1 ring-subtle transition hover:ring-brand lg:h-auto lg:rounded-[4px] lg:bg-transparent lg:px-3 lg:ring-0 lg:hover:bg-surface ${gusto ? "lg:py-1.5" : "lg:py-2.5"}`}
                >
                  <span className="hidden text-[12px] tabular-nums text-secondary group-hover:text-brand-active lg:inline">{String(i + 1).padStart(2, "0")}</span>
                  {o.naziv}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {/* uz dugačak sadržaj (gusto) telefon ne bi stao u visinu ekrana pored lepljivog sadržaja */}
        <a href={telefon.href} className={`mt-8 hidden items-center gap-3 rounded-[6px] bg-primary p-4 text-white transition hover:bg-[#2b2d31] ${gusto ? "" : "lg:flex"}`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
            <Phone width={17} height={17} strokeWidth={1.7} />
          </span>
          <span>
            <span className="block text-[12px] text-white/55">{telefon.natpis}</span>
            <span className="block text-[16px] font-semibold">{telefon.label}</span>
          </span>
        </a>
      </aside>

      <div className={`min-w-0 ${gusto ? "space-y-10 md:space-y-12 print:space-y-0" : "space-y-16 md:space-y-24"}`}>{children}</div>
    </div>
  );
}

/** Odeljak: „01 — NAZIV" (naziv iz sadržaja), naslov, uvod, sadržaj. */
export function Odeljak({ id, broj, oznaka, naslov, uvod, children }: { id: string; broj: string; oznaka: string; naslov: string; uvod?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-naslov`} className="scroll-mt-28">
      <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-secondary">
        <span className="tabular-nums text-brand-active">{broj}</span>
        <span aria-hidden className="h-px w-6 bg-subtle" />
        {oznaka}
      </p>
      <h2 id={`${id}-naslov`} className="h-section mt-4">
        {naslov}
      </h2>
      {uvod && <p className="mt-4 max-w-[680px] text-[16px] leading-[27px] text-secondary md:text-[17px] md:leading-[28px]">{uvod}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Pravila({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <dl className={`divide-y divide-subtle border-y border-subtle ${className}`}>{children}</dl>;
}

/** red pravila: oznaka levo, tekst desno (na telefonu jedno ispod drugog) */
export function Pravilo({ naziv, children }: { naziv: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5 py-5 sm:grid-cols-[200px_1fr] sm:gap-8">
      <dt className="text-[15px] font-medium">{naziv}</dt>
      <dd className="text-[15px] leading-[25px] text-secondary">{children}</dd>
    </div>
  );
}

export function Pitanja({ pitanja }: { pitanja: Pitanje[] }) {
  return (
    <div className="border-t border-subtle">
      {pitanja.map((p) => (
        <details key={p.q} className="group border-b border-subtle">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium leading-snug md:py-6 md:text-[18px] [&::-webkit-details-marker]:hidden">
            {p.q}
            <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-subtle transition group-open:border-brand group-open:bg-brand">
              <span className="absolute h-px w-3.5 bg-current" />
              <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:scale-0" />
            </span>
          </summary>
          <p className="p-muted max-w-[680px] pb-6 pr-14 text-[15px] leading-[25px]">{p.a}</p>
        </details>
      ))}
    </div>
  );
}

/** JSON-LD za FAQPage iz istih pitanja koja strana prikazuje */
export const faqLd = (pitanja: Pitanje[]) => ({
  "@type": "FAQPage",
  mainEntity: pitanja.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
});

/**
 * Odeljak pravnog teksta (Uslovi korišćenja…): numerisan naslov i tekst po članovima. Unutrašnji h3/p/ol/ul/a dobijaju
 * stil ovde, pa strana piše običan HTML bez klasa.
 */
export function PravniOdeljak({ id, broj, naslov, children }: { id: string; broj: number; naslov: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-naslov`} className="scroll-mt-28 border-t border-subtle pt-8 first:border-t-0 first:pt-0 print:mt-5 print:pt-4">
      <h2 id={`${id}-naslov`} className="flex items-baseline gap-4 text-[24px] font-medium leading-tight tracking-[-0.01em] md:text-[28px] print:break-after-avoid print:text-[14pt]">
        <span className="shrink-0 text-[15px] font-semibold tabular-nums text-brand-active md:text-[17px]">{String(broj).padStart(2, "0")}</span>
        {naslov}
      </h2>
      <div className="mt-5 max-w-[760px] space-y-3 text-[15px] leading-[26px] text-secondary print:mt-3 print:max-w-none print:space-y-2 print:text-[9.5pt] print:leading-[1.5] print:text-[#3c4043] [&_h3]:break-after-avoid [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h3]:pt-3 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.12em] [&_h3]:text-primary [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_b]:font-semibold [&_b]:text-primary">
        {children}
      </div>
    </section>
  );
}

/** Zaglavlje samo za štampu i PDF pravnih dokumenata: logo, traka, naslov, prodavac i datumi (kao na obrascima). */
export function PdfZaglavlje({ naslov, s, doneto, naSnazi, putanja }: { naslov: string; s: Sajt; doneto: string; naSnazi: string; putanja: string }) {
  return (
    <div className="hidden print:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo/htz-logo.svg" alt="HTZ Shop" className="mx-auto h-[13mm] w-auto" />
      <div className="mb-[6mm] mt-[5mm] h-[2.2mm] bg-[repeating-linear-gradient(-45deg,#f5c518_0_3mm,#202124_3mm_6mm)]" />
      <h1 className="text-[17pt] font-semibold leading-tight">{naslov}</h1>
      <p className="mt-2 text-[9.5pt] text-[#5f6368]">
        {contact.legalName}, {s.street}, {s.city} | PIB: {s.pib} | Matični broj: {s.mb}
        <br />
        Doneto {doneto} Na snazi od {naSnazi} Objavljeno na htzshop.rs{putanja}
      </p>
    </div>
  );
}
