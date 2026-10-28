import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Proba from "@/components/brendiranje/Proba";
import KontaktForma from "@/components/kontakt/KontaktForma";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Mail, Phone } from "@/components/Icons";
import { categoryHref, contact, printMethods, productTabs } from "@/data/site";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Brendiranje odeće (link „Brendiranje" u zaglavlju). Činjenice su sa originalne stranice htzshop.rs: tri tehnike
  (sito, flex, DTF), cena na upit (telefon za brendiranje), prsluk sa štampom 450 RSD. Rokovi i minimalne količine nisu
  objavljeni, pa ih ne navodimo.
  1. Tamni uvod sa crno-belom fotografijom radionice; desno „Probajte svoj logo" (majica, pozicije, učitavanje logoa).
  2. Tri tehnike štampe.
  3. Kako do brendirane odeće, u četiri koraka + šta je potrebno za ponudu.
  4. Aktuelna ponuda (traka).
  5. Odeća za brendiranje (kartice).
  6. Forma sa izabranom temom „Brendiranje odeće" (#upit) + telefon za brendiranje.
  7. Česta pitanja (i FAQPage u JSON-LD-u, zajedno sa uslugom).
*/

const OPIS =
  "Brendiranje radne odeće logotipom vaše firme: sito, flex i DTF štampa na majicama, bluzama, duksevima, prslucima i uniformama. Kupite odeću i brendirajte je na jednom mestu, sa isporukom širom Srbije.";

export const metadata: Metadata = {
  title: "Brendiranje radne odeće: sito, flex i DTF štampa logotipa - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/brendiranje-odece/` },
  openGraph: { title: "Brendiranje radne odeće - HTZ Shop", description: OPIS, images: ["/images/photo/brendiranje-presa.jpg"] },
};

const KORACI = [
  { naslov: "Pošaljite logo", opis: "Priložite ga uz formu na ovoj stranici ili pošaljite mejlom, sa spiskom odeće i količinama." },
  { naslov: "Izaberemo tehniku", opis: "Savetujemo sito, flex ili DTF štampu prema logou, materijalu i broju komada." },
  { naslov: "Dobijate ponudu", opis: "Jedna ponuda za odeću i brendiranje, sa cenom i rokom isporuke." },
  { naslov: "Štampamo i šaljemo", opis: "Odeću brendiramo u našoj radionici i šaljemo na adresu firme." },
];

const POTREBNO = [
  { naslov: "Logo", opis: "Vektorski fajl (AI, EPS, PDF, SVG) ili PNG u visokoj rezoluciji." },
  { naslov: "Odeća i veličine", opis: "Koji artikli, u kojoj boji i koliko komada po veličini." },
  { naslov: "Pozicija", opis: "Grudi, leđa ili rukav. Ako niste sigurni, predložićemo." },
];

export default async function BrendiranjePage() {
  const s = await getSajt();
  const odeca = productTabs.find((t) => t.key === "odeca")?.products.slice(0, 4) ?? [];

  const pitanja = [
    {
      q: "Koje tehnike brendiranja radite?",
      a: `${printMethods.map((m) => `${m.name}: ${m.text.charAt(0).toLowerCase()}${m.text.slice(1)}`).join(" ")}`,
    },
    {
      q: "Koliko košta brendiranje odeće?",
      a: `Cena zavisi od tehnike, veličine logoa, broja boja i količine. Za tačnu cenu pozovite ${contact.phone2} ili pišite na ${s.email}, a ponudu šaljemo zajedno sa cenom odeće.`,
    },
    {
      q: "Šta je potrebno da pošaljem za ponudu?",
      a: `${POTREBNO.map((p) => `${p.naslov}: ${p.opis.charAt(0).toLowerCase()}${p.opis.slice(1)}`).join(" ")}`,
    },
    {
      q: "Koju tehniku da izaberem?",
      a: "Za veće serije najčešće sito štampu, za logo u jednoj ili dve boje flex štampu, a DTF štampu za sve vrste odeće, torbi i uniformi. Pomoći ćemo vam da izaberete kad vidimo logo i odeću.",
    },
    {
      q: "Da li je otisak postojan na pranje?",
      a: "Da. Sito štampa daje postojan i dugotrajan otisak, flex folija je visoke postojanosti, a DTF otisak je rastegljiv i postojan na pranje.",
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE_URL}/brendiranje-odece/#usluga`,
        name: "Brendiranje radne odeće",
        serviceType: "Štampa logotipa na radnoj odeći",
        description: OPIS,
        provider: { "@id": `${SITE_URL}/#firma` },
        areaServed: { "@type": "Country", name: "Srbija" },
        url: `${SITE_URL}/brendiranje-odece/`,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Tehnike brendiranja",
          itemListElement: printMethods.map((m) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: m.name, description: m.text } })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: pitanja.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Brendiranje odeće", item: `${SITE_URL}/brendiranje-odece/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <section className="relative overflow-hidden bg-primary text-white">
        <Image src="/images/photo/brendiranje-presa.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_60%] opacity-[0.2] grayscale" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/30" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-1/3 size-[560px] rounded-full bg-brand/15 blur-[130px]" />

        <div className="container-site relative grid grid-cols-1 items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 xl:gap-20 xl:py-20">
          <div className="hero-in">
            <nav aria-label="Putanja" className="text-[13px] text-white/55">
              <Link href="/" className="transition hover:text-white">Početna</Link>
              <span aria-hidden className="mx-2">/</span>
              <span className="text-white/80">Brendiranje odeće</span>
            </nav>
            <h1 className="mt-6 text-[42px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[60px] xl:text-[68px]">
              Brendiranje radne odeće <span className="text-brand">logom vaše firme.</span>
            </h1>
            <p className="mt-6 max-w-[540px] text-[16px] leading-[26px] text-white/70 md:text-[17px] md:leading-[28px]">
              Sito, flex i DTF štampa na majicama, bluzama, duksevima, prslucima i uniformama. Odeću kupujete kod nas i odmah je brendiramo u našoj radionici:
              jedan dobavljač, jedna ponuda, jedan račun.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#upit" className="btn-primary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
                Zatražite ponudu
                <ArrowRight width={15} height={15} strokeWidth={1.8} />
              </a>
              <a href={contact.phone2Href} className="inline-flex h-[50px] items-center gap-2.5 rounded-full border border-white/20 px-6 text-[15px] font-medium transition hover:border-white">
                <Phone width={17} height={17} strokeWidth={1.6} />
                {contact.phone2}
              </a>
            </div>

            <ul className="mt-12 grid max-w-[540px] grid-cols-3 border-t border-white/15">
              {printMethods.map((m, i) => (
                <li key={m.name} className={`pt-4 ${i > 0 ? "border-l border-white/15 pl-4" : ""}`}>
                  <span className="text-[12px] tabular-nums text-brand">0{i + 1}</span>
                  <p className="mt-1 text-[15px] font-medium md:text-[17px]">{m.name.replace(" štampa", "")}</p>
                  <p className="mt-0.5 text-[12px] leading-[17px] text-white/50 md:text-[13px]">{m.za}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-in [animation-delay:120ms]">
            <Proba />
          </div>
        </div>
      </section>

      {/* 2. tehnike */}
      <section className="container-site py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Tehnike štampe</p>
            <h2 className="h-section mt-3 max-w-[620px]">Tri tehnike, za svaki logo i svaku količinu.</h2>
          </div>
          <p className="p-muted max-w-[400px] text-[15px]">Tehniku biramo prema logou, materijalu odeće i broju komada. Ne morate da znate unapred, savetujemo vas pri izboru.</p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3">
          {printMethods.map((m, i) => (
            <li key={m.name} className="group relative flex flex-col overflow-hidden rounded-[6px] bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_56px_-30px_rgba(32,33,36,0.45)] md:p-8">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100" />
              <span className="text-[56px] font-semibold leading-none tracking-[-0.04em] text-brand-active md:text-[64px]">0{i + 1}</span>
              <h3 className="mt-8 text-[24px] font-semibold leading-tight tracking-[-0.01em]">{m.name}</h3>
              <p className="p-muted mt-3 text-[15px] leading-[24px]">{m.text}</p>
              <p className="mt-auto pt-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-page px-3.5 py-2 text-[13px] font-medium">
                  <span aria-hidden className="size-1.5 rounded-full bg-brand-active" />
                  Najbolje za: {m.za.charAt(0).toLowerCase() + m.za.slice(1)}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. koraci + šta je potrebno */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-site">
          <p className="eyebrow">Kako radimo</p>
          <h2 className="h-section mt-3 max-w-[620px]">Od logoa do brendirane odeće u četiri koraka.</h2>

          <ol className="relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-subtle lg:block" />
            {KORACI.map((k, i) => (
              <li key={k.naslov} className="relative">
                <span className={`relative grid size-10 place-items-center rounded-full text-[15px] font-semibold tabular-nums leading-none ring-[6px] ring-surface ${i === 0 ? "bg-brand text-on-brand" : "bg-primary text-white"}`}>{i + 1}</span>
                <h3 className="mt-5 text-[19px] font-semibold leading-snug">{k.naslov}</h3>
                <p className="p-muted mt-1.5 max-w-[280px] text-[15px] leading-[24px]">{k.opis}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid grid-cols-1 overflow-hidden rounded-[6px] bg-page lg:grid-cols-[0.8fr_1.2fr]">
            <div className="p-6 md:p-10">
              <p className="kicker">Za brzu ponudu</p>
              <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.01em] md:text-[30px]">Šta nam je potrebno</h3>
              <p className="p-muted mt-3 max-w-[340px] text-[15px]">Pošaljite ovo i ponudu dobijate bez dodatnih pitanja.</p>
            </div>
            <ul className="grid grid-cols-1 gap-px bg-subtle sm:grid-cols-3">
              {POTREBNO.map((p) => (
                <li key={p.naslov} className="bg-page p-6 md:p-8">
                  <span aria-hidden className="grid size-6 place-items-center rounded-full bg-brand text-on-brand">
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2.5 6.2 2.3 2.3 4.7-5" />
                    </svg>
                  </span>
                  <h4 className="mt-4 text-[17px] font-semibold">{p.naslov}</h4>
                  <p className="p-muted mt-1 text-[14px] leading-[22px]">{p.opis}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. aktuelna ponuda */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div aria-hidden className="h-2.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_14px,var(--text-primary)_14px_28px)]" />
        <div className="container-site flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Aktuelna ponuda</p>
            <p className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[36px]">
              Radni prsluk sa štampom <span className="whitespace-nowrap text-brand">450 RSD</span>
            </p>
            <p className="mt-1 text-[14px] text-white/55">sa PDV-om, uz štampu logoa vaše firme</p>
          </div>
          <a href="#upit" className="btn-primary shrink-0 self-start md:self-auto" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
            Naručite prsluke
            <ArrowRight width={15} height={15} strokeWidth={1.8} />
          </a>
        </div>
      </section>

      {/* 5. odeća */}
      {odeca.length > 0 && (
        <section className="container-site py-16 md:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Odeća za brendiranje</p>
              <h2 className="h-section mt-3">Izaberite odeću, logo dodajemo mi.</h2>
            </div>
            <Link href={categoryHref("zastitna-i-radna-odeca")} className="link-arrow shrink-0">
              Sva radna odeća <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {odeca.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* 6. forma */}
      <section id="upit" className="container-site scroll-mt-24 pb-16 md:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Ponuda za brendiranje</p>
            <h2 className="h-section mt-3">Pošaljite nam logo i šta vam treba.</h2>
            <p className="p-muted mt-5 max-w-[440px] text-[15px]">
              Odgovaramo radnim danom, sa ponudom za odeću i štampu zajedno. Logo i primere priložite uz poruku, a u tekstu navedite odeću, količinu i poziciju.
            </p>
            <div className="mt-8 divide-y divide-subtle overflow-hidden rounded-[6px] bg-surface">
              <a href={contact.phone2Href} className="group flex items-center gap-4 p-5 transition hover:bg-brand-soft">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                  <Phone width={19} height={19} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-secondary">Telefon za brendiranje</span>
                  <span className="block text-[19px] font-semibold">{contact.phone2}</span>
                </span>
              </a>
              <a href={`mailto:${s.email}?subject=${encodeURIComponent("Brendiranje odeće")}`} className="group flex items-center gap-4 p-5 transition hover:bg-brand-soft">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page">
                  <Mail width={19} height={19} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-secondary">Ili pišite na e-mail</span>
                  <span className="block break-all text-[19px] font-semibold">{s.email}</span>
                </span>
              </a>
            </div>
          </div>

          <div className="rounded-[6px] bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(32,33,36,0.35)] md:p-10 xl:p-12">
            <KontaktForma tema="Brendiranje odeće" />
          </div>
        </div>
      </section>

      {/* 7. česta pitanja */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
          <div>
            <p className="eyebrow">Brendiranje odeće</p>
            <h2 className="h-section mt-3">Česta pitanja</h2>
            <p className="p-muted mt-5 max-w-[420px] text-[15px]">
              Niste našli odgovor? Pozovite <a href={contact.phone2Href} className="font-medium text-primary hover:underline">{contact.phone2}</a>.
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
