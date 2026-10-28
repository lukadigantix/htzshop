import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Mapa from "@/components/kontakt/Mapa";
import { RadnoVremeTabela, StatusRadnje } from "@/components/kontakt/Radnja";
import { STIT } from "@/components/logoPutanje";
import Razdvajac from "@/components/Razdvajac";
import { ArrowRight, Mail, Phone, Pin } from "@/components/Icons";
import ZnakBrenda from "@/components/brendovi/ZnakBrenda";
import { categories, categoryHref, contact, printMethods } from "@/data/site";
import { getBrendovi } from "@/lib/brendovi";
import { getSajt } from "@/lib/sajt";
import { jsonLd, podaciFirme, SITE_URL } from "@/lib/seo";

/*
  O nama. Činjenice su sa originalne stranice htzshop.rs/o-nama (osnovani 2017, 1.000 artikala, 670 kupaca na veliko,
  8.000 kupaca na malo, izložbeni salon, brendiranje, cilj „bezbedno, zdravo i efikasno", sve na jednom mestu);
  ništa preko toga ne tvrdimo. Kontakt i radno vreme iz Admin → Podešavanja → Sajt.
  1. Tamni uvod: naslov iz njihove misije, opis firme u jednoj rečenici (za Google i AI), brojke.
  2. Ko smo: tekst i fotografije.
  3. Šta radimo: četiri usluge, svaka vodi na svoju stranu.
  4. Asortiman: sve kategorije (interni linkovi).
  5. Cilj: tamna traka sa tri načela.
  6. Brendovi: logotipi, svaki vodi na filter prodavnice.
  7. Posetite nas: adresa, status radnje, radno vreme, podaci firme.
  8. Česta pitanja + JSON-LD (AboutPage sa prodavnicom, FAQPage, BreadcrumbList).
*/

const OPIS =
  "HTZ Shop je prodavnica zaštitne i radne opreme u Svilajncu, osnovana 2017. godine: radna odeća, zaštitna obuća, rukavice i lična zaštitna oprema za firme i pojedince, sa brendiranjem odeće i isporukom širom Srbije.";

export const metadata: Metadata = {
  title: "O nama: prodavnica zaštitne i radne opreme od 2017. - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/o-nama/` },
  openGraph: { title: "O nama - HTZ Shop", description: OPIS, images: ["/images/photo/prodavnica.jpg"] },
};

const BROJKE = [
  { vrednost: "2017.", opis: "godina osnivanja" },
  { vrednost: "1.000+", opis: "artikala u ponudi" },
  { vrednost: "670", opis: "kupaca na veliko" },
  { vrednost: "8.000", opis: "kupaca na malo" },
];

const NACELA = [
  { naslov: "Oprema po propisima", opis: "Radimo u skladu sa važećim zakonima i propisima, a nudimo opremu koja prati potrebe posla i standarde zaštite na radu." },
  { naslov: "Sve na jednom mestu", opis: "Odeća, obuća, rukavice i lična zaštita za ceo tim, uz brendiranje, u jednoj porudžbini." },
  { naslov: "Stalno napredujemo", opis: "Firma je u razvoju: širimo asortiman i unapređujemo uslugu prema onome što kupci traže." },
];

export default async function ONamaPage() {
  const [s, brands] = await Promise.all([getSajt(), getBrendovi().then((b) => b ?? [])]);
  // „sito, flex i DTF"
  const imena = printMethods.map((m) => m.name.replace(/ štampa$/, "").replace(/^(Sito|Flex)$/, (x) => x.toLowerCase()));
  const tehnike = `${imena.slice(0, -1).join(", ")} i ${imena.at(-1)}`;

  const USLUGE = [
    {
      broj: "01",
      naslov: "Izložbeni salon",
      opis: `U radnji u ulici ${s.street} pogledate, isprobate i izaberete obuću, odeću i opremu pre kupovine.`,
      link: "Kako do nas",
      href: "#posetite-nas",
    },
    {
      broj: "02",
      naslov: "Opremanje firmi",
      opis: "Pošaljete spisak i veličine, a mi kompletnu ponudu za ceo tim, sa brendiranjem i rokom isporuke.",
      link: "Zatražite ponudu",
      href: "/kontakt/#ponuda",
    },
    {
      broj: "03",
      naslov: "Brendiranje odeće",
      opis: `Logo vaše firme na radnoj odeći, u našoj radionici: ${tehnike} štampa.`,
      link: "Brendiranje odeće",
      href: "/brendiranje-odece/",
    },
    {
      broj: "04",
      naslov: "Isporuka širom Srbije",
      opis: `Poručite na sajtu ili telefonom. Isporuka je besplatna za porudžbine iznad ${contact.freeShippingFrom}.`,
      link: "Prodavnica",
      href: "/prodavnica/",
    },
  ];

  const pitanja = [
    {
      q: "Šta je HTZ Shop?",
      a: `${OPIS} Na jednom mestu nudimo sve što je potrebno za profesionalan i bezbedan rad.`,
    },
    {
      q: "Gde se nalazi HTZ Shop?",
      a: `Radnja i izložbeni salon su na adresi ${s.street}, ${s.city}. Telefon je ${s.phone}, e-mail ${s.email}. Radno vreme: ${s.hours.map((h) => `${h.days} ${h.hours}`).join(", ")}.`,
    },
    {
      q: "Od kada radi HTZ Shop?",
      a: `Od ${contact.founded}. godine. Danas imamo više od 1.000 artikala u ponudi, 670 kupaca na veliko i 8.000 kupaca na malo.`,
    },
    {
      q: "Šta sve prodajete?",
      a: `Higijensku i tehničku zaštitnu opremu, od kecelja za restorane do šlemova za gradilišta: ${categories.map((c) => c.name.toLowerCase()).join(", ")}.`,
    },
    {
      q: "Da li prodajete firmama na veliko?",
      a: "Da. Imamo 670 kupaca na veliko. Firmama pripremamo ponudu po spisku i veličinama, sa brendiranjem i rokom isporuke. Ponudu možete zatražiti preko strane Kontakt ili telefonom.",
    },
    {
      q: "Koje brendove imate?",
      a: `${brands.map((b) => b.name).join(", ")}.`,
    },
  ];

  // prodavnica iz lib/seo.ts, bez sopstvenog @context (ide u @graph)
  const firma: Record<string, unknown> = { ...podaciFirme(s) };
  delete firma["@context"];
  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/o-nama/#strana`,
        url: `${SITE_URL}/o-nama/`,
        name: "O nama - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        mainEntity: { "@id": `${SITE_URL}/#firma` },
      },
      firma,
      {
        "@type": "FAQPage",
        mainEntity: pitanja.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "O nama", item: `${SITE_URL}/o-nama/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <section className="relative overflow-hidden bg-primary text-white">
        <Image src="/images/photo/slide-obuca.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_60%] opacity-[0.22] grayscale" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/30" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[560px] rounded-full bg-brand/15 blur-[120px]" />
        {/* štit iz loga, krupno i jedva vidljivo desno */}
        <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -right-24 top-10 hidden h-[620px] w-auto text-white/[0.04] lg:block xl:right-10">
          <path fill="currentColor" fillRule="evenodd" d={STIT} />
        </svg>

        <div className="container-site relative pb-14 pt-10 md:pb-20 md:pt-16 xl:pb-24 xl:pt-24">
          <nav aria-label="Putanja" className="text-[13px] text-white/50">
            <Link href="/" className="hover:text-white">
              Početna
            </Link>
            <Razdvajac />
            <span className="text-white/80">O nama</span>
          </nav>

          <div className="hero-in mt-10 max-w-[980px] md:mt-14">
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">O nama</p>
            <h1 className="mt-6 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[68px] xl:text-[88px]">
              Sve za bezbedan rad, <span className="text-brand">na jednom mestu.</span>
            </h1>
            <p className="mt-7 max-w-[640px] text-[16px] leading-[27px] text-white/70 md:text-[18px] md:leading-[30px]">{OPIS}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/prodavnica/" className="btn-primary" style={{ height: 52, padding: "0 30px", fontSize: 15 }}>
                Pogledajte prodavnicu <ArrowRight width={15} height={15} strokeWidth={1.8} />
              </Link>
              <Link href="/kontakt/#ponuda" className="inline-flex h-[52px] items-center rounded-full border border-white/25 px-7 text-[15px] font-medium transition hover:border-brand hover:text-brand">
                Ponuda za firmu
              </Link>
            </div>
          </div>

          {/* brojke */}
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-white/10 md:mt-24 lg:grid-cols-4">
            {BROJKE.map((b, i) => (
              <div key={b.opis} className="bg-primary/90 p-5 backdrop-blur md:p-8">
                <dt className="sr-only">{b.opis}</dt>
                <dd className={`text-[40px] font-medium leading-none tracking-[-0.04em] tabular-nums md:text-[64px] ${i === 0 ? "text-brand" : ""}`}>{b.vrednost}</dd>
                <dd aria-hidden className="mt-3 text-[11px] uppercase tracking-[0.1em] text-white/55 sm:text-[13px] sm:tracking-[0.14em] md:text-[14px]">
                  {b.opis}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div aria-hidden className="h-2.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_16px,var(--text-primary)_16px_32px)]" />
      </section>

      {/* 2. ko smo */}
      <section className="container-site py-16 md:py-24 xl:py-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 xl:gap-28">
          <div>
            <p className="eyebrow">Ko smo</p>
            <h2 className="mt-4 text-[30px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[42px] xl:text-[48px]">
              Specijalizovana prodavnica HTZ opreme, <span className="bg-[linear-gradient(transparent_62%,var(--brand-primary)_62%)] px-1">od kecelja za restorane do šlemova za gradilišta.</span>
            </h2>
            <div className="mt-8 grid gap-6 text-[16px] leading-[27px] text-secondary md:grid-cols-2 md:gap-8">
              <p>
                HTZ Shop radi od {contact.founded}. godine u Svilajncu. Nudimo širok asortiman higijenske i tehničke zaštitne opreme: radnu odeću, zaštitnu obuću, rukavice i
                opremu za zaštitu glave, očiju, sluha, disajnih organa i od pada.
              </p>
              <p>
                U izložbenom salonu kupci opremu pogledaju, isprobaju i izaberu. Firmama pripremamo kompletnu ponudu, a radnu odeću brendiramo logotipom, da tim bude prepoznatljiv na
                svakom radnom mestu.
              </p>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2">
              {["Radna odeća", "Zaštitna obuća", "Rukavice", "Lična zaštita", "Brendiranje", "Isporuka širom Srbije"].map((t) => (
                <li key={t} className="rounded-full bg-surface px-4 py-2 text-[14px] ring-1 ring-subtle">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* dve fotografije, druga preklapa prvu; žuta oznaka godine */}
          <div className="relative mx-auto w-full max-w-[620px] pb-16 pr-10 sm:pb-20 sm:pr-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-surface">
              <Image src="/images/photo/prodavnica.jpg" alt="Zaštitna obuća izložena na zidu prodavnice" fill sizes="(min-width: 1024px) 520px, 90vw" className="object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 aspect-square w-[48%] overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-30px_rgba(32,33,36,0.6)] ring-8 ring-page">
              <Image src="/images/photo/brendiranje-vez.jpg" alt="Mašina za vez u radionici za brendiranje odeće" fill sizes="300px" className="object-cover" />
            </div>
            <div className="absolute left-5 top-5 rounded-[4px] bg-brand px-4 py-3 text-on-brand shadow-[0_14px_30px_-14px_rgba(32,33,36,0.6)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Od</p>
              <p className="text-[34px] font-semibold leading-none tracking-[-0.03em]">{contact.founded}.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. šta radimo */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[620px]">
              <p className="eyebrow">Šta radimo</p>
              <h2 className="h-section mt-3">Od izbora opreme do isporuke na adresu firme.</h2>
            </div>
            <a href={s.phoneHref} className="link-arrow">
              Pozovite {s.phone} <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </a>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 xl:grid-cols-4 xl:gap-4">
            {USLUGE.map((u) => (
              <li key={u.broj}>
                <Link
                  href={u.href}
                  className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[6px] bg-page p-6 transition duration-300 hover:-translate-y-1 hover:bg-primary hover:text-white md:p-8"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_10px,var(--text-primary)_10px_20px)] transition-transform duration-500 group-hover:scale-x-100" />
                  <span className="text-[44px] font-medium leading-none tracking-[-0.04em] text-brand-active transition group-hover:text-brand">{u.broj}</span>
                  <span className="mt-12 block text-[22px] font-medium leading-tight tracking-[-0.01em]">{u.naslov}</span>
                  <span className="mt-3 block text-[15px] leading-[24px] text-secondary transition group-hover:text-white/65">{u.opis}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[14px] font-medium">
                    {u.link}
                    <ArrowRight width={14} height={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. asortiman */}
      <section className="container-site py-16 md:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Asortiman</p>
            <h2 className="h-section mt-3">Oprema za svaki posao.</h2>
            <p className="p-muted mt-5 max-w-[420px] text-[15px]">
              Više od 1.000 artikala proverenih evropskih brendova. Ako artikal trenutno nije dostupan ili se cena promenila, javljamo vam se posle porudžbine.
            </p>
            <Link href="/prodavnica/" className="btn-primary mt-8" style={{ height: 48, padding: "0 26px" }}>
              Sva oprema <ArrowRight width={15} height={15} strokeWidth={1.8} />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[...categories.map((c) => ({ key: c.slug, name: c.name, image: c.image, href: categoryHref(c.slug) })), { key: "brendiranje", name: "Brendiranje odeće", image: "/images/products/muska-majica.png", href: "/brendiranje-odece/" }].map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-[6px] bg-surface ring-1 ring-transparent transition hover:ring-brand">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-white">
                    <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 240px, 45vw" className="object-contain p-4 mix-blend-multiply transition duration-500 group-hover:scale-105" />
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2 border-t border-subtle px-4 py-3.5">
                    <span className="text-[14px] font-medium leading-snug md:text-[15px]">{c.name}</span>
                    <ArrowRight width={14} height={14} strokeWidth={1.8} className="shrink-0 -rotate-45 text-secondary transition group-hover:rotate-0 group-hover:text-primary" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. cilj */}
      <section className="relative overflow-hidden bg-primary py-16 text-white md:py-24 xl:py-28">
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 size-[560px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="container-site relative">
          <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Naš cilj</p>
          <p className="mt-6 max-w-[1100px] text-[30px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[46px] xl:text-[56px]">
            Da ljudi i radna mesta budu <span className="text-brand">bezbedni, zdravi i efikasni</span>, uz kvalitetne proizvode koji prate potrebe kupaca.
          </p>
          <ul className="mt-14 grid grid-cols-1 border-t border-white/10 md:mt-20 md:grid-cols-3">
            {NACELA.map((n, i) => (
              <li key={n.naslov} className={`py-8 md:px-8 md:py-10 ${i > 0 ? "border-t border-white/10 md:border-l md:border-t-0" : "md:pl-0"}`}>
                <span className="grid size-10 place-items-center rounded-full bg-brand text-[14px] font-semibold text-on-brand">{i + 1}</span>
                <h3 className="mt-6 text-[21px] font-medium">{n.naslov}</h3>
                <p className="mt-3 max-w-[380px] text-[15px] leading-[24px] text-white/60">{n.opis}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. brendovi */}
      <section className="container-site py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[620px]">
            <p className="eyebrow">Brendovi</p>
            <h2 className="h-section mt-3">{brands.length} proverenih proizvođača.</h2>
          </div>
          <Link href="/brendovi/" className="link-arrow">
            Svi brendovi <ArrowRight width={14} height={14} strokeWidth={1.8} />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle sm:grid-cols-3 md:mt-12 lg:grid-cols-6">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link href={`/brendovi/${b.slug}/`} title={`${b.name}: svi proizvodi`} className="group relative grid h-28 place-items-center bg-surface px-6 transition hover:bg-brand-soft md:h-32">
                <span className="opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0">
                  <ZnakBrenda b={b} velicina="mali" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. posetite nas */}
      <section id="posetite-nas" className="container-site scroll-mt-24 pb-16 md:pb-24">
        <div className="grid grid-cols-1 overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-40px_rgba(32,33,36,0.35)] lg:grid-cols-[1fr_1.1fr]">
          {/* mapa radnje (ista kao na strani Kontakt), bez kartice preko nje */}
          <div className="relative h-[360px] md:h-[440px] lg:h-auto lg:min-h-[640px]">
            <div className="absolute inset-0">
              <Mapa name={s.name} levo={0} />
            </div>
          </div>
          <div className="p-6 md:p-10 xl:p-14">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Posetite nas</p>
              <StatusRadnje week={s.week} />
            </div>
            <h2 className="mt-4 text-[30px] font-medium leading-tight tracking-[-0.02em] md:text-[38px]">Probajte opremu pre kupovine.</h2>
            <p className="mt-3 text-[17px] text-secondary">
              Izložbeni salon: {s.street}, {s.city}
            </p>
            <ul className="mt-6 space-y-3 text-[15px]">
              <li>
                <a href={s.phoneHref} className="inline-flex items-center gap-3 hover:text-brand-active">
                  <Phone width={17} height={17} strokeWidth={1.6} className="text-secondary" />
                  {s.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-3 hover:text-brand-active">
                  <Mail width={17} height={17} strokeWidth={1.6} className="text-secondary" />
                  {s.email}
                </a>
              </li>
            </ul>
            <div className="mt-8 rounded-[6px] bg-page p-5">
              <RadnoVremeTabela week={s.week} hours={s.hours} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={s.mapsHref} target="_blank" rel="noreferrer" className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
                <Pin width={16} height={16} strokeWidth={1.8} /> Kako do nas
              </a>
              <Link href="/kontakt/" className="btn-secondary" style={{ height: 48, padding: "0 26px" }}>
                Kontakt
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-subtle pt-6 text-[13px] sm:grid-cols-3">
              {[
                ["Poslovno ime", contact.legalName],
                ["PIB", s.pib],
                ["Matični broj", s.mb],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className={k === "Poslovno ime" ? "col-span-full" : ""}>
                    <dt className="text-secondary">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 8. česta pitanja */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
          <div>
            <p className="eyebrow">O nama</p>
            <h2 className="h-section mt-3">Česta pitanja</h2>
            <p className="p-muted mt-5 max-w-[420px] text-[15px]">
              Niste našli odgovor? Pozovite{" "}
              <a href={s.phoneHref} className="font-medium text-primary hover:underline">
                {s.phone}
              </a>
              .
            </p>
          </div>
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
                <p className="p-muted max-w-[640px] pb-6 pr-14 text-[15px] leading-[25px]">{p.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
