import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Check, Landmark, Mail as MailIcon, Minus, Plus, QrCode, Search as SearchIcon, ShoppingBag, Wallet } from "lucide-react";
import { RadnoVremeTabela } from "@/components/kontakt/Radnja";
import { STIT } from "@/components/logoPutanje";
import Razdvajac from "@/components/Razdvajac";
import { ArrowRight, Phone, Store, Truck } from "@/components/Icons";
import { getUsloviKupovine } from "@/lib/kupovina";
import { REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Kako naručiti (link u footeru, korpi i naplati). Opisuje tačno ono što kupac vidi na sajtu: Dodaj u korpu → Korpa →
  Podaci i isporuka → Potvrda, bez naloga. Kurirske službe i rok isporuke su sa backenda (lib/kupovina.ts), telefon i radno
  vreme iz Admin → Podešavanja → Sajt; cenu dostave ne pišemo jer zavisi od težine pošiljke i službe (vidi se u naplati).
  1. Tamni uvod: naslov, kratko „u četiri koraka", brojke.
  2. Četiri koraka, svaki sa umanjenim prikazom ekrana sa sajta (crtež, ne slika, da prati izgled sajta).
  3. Isporuka i plaćanje.
  4. Posle porudžbine: statusi koje kupac dobija e-mailom, nalog, reklamacija.
  5. Traka „Radije telefonom?" sa radnim vremenom.
  6. Česta pitanja + JSON-LD (HowTo, FAQPage, BreadcrumbList).
*/

const OPIS =
  "Kako naručiti zaštitnu i radnu opremu u HTZ Shop-u: izaberite proizvod i veličinu, dodajte ga u korpu, upišite podatke za isporuku i izaberite način plaćanja. Nalog nije potreban, a možete naručiti i telefonom.";

export const metadata: Metadata = {
  title: "Kako naručiti: poručivanje u četiri koraka - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/kako-naruciti/` },
  openGraph: { title: "Kako naručiti - HTZ Shop", description: OPIS },
};

const TRAKA = "bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_16px,var(--text-primary)_16px_32px)]";

/* ---------- umanjeni prikazi ekrana (ukras, čitač ekrana ih preskače) ---------- */

function Ekran({ adresa, children }: { adresa: string; children: React.ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none select-none overflow-hidden rounded-[8px] bg-surface shadow-[0_40px_80px_-40px_rgba(32,33,36,0.45)] ring-1 ring-subtle">
      <div className="flex items-center gap-3 border-b border-subtle bg-page px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-subtle" />
          <span className="size-2.5 rounded-full bg-subtle" />
          <span className="size-2.5 rounded-full bg-subtle" />
        </span>
        <span className="flex-1 truncate rounded-full bg-surface px-3 py-1 text-[11px] text-secondary ring-1 ring-subtle">htzshop.rs{adresa}</span>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

const Crta = ({ className = "" }: { className?: string }) => <span className={`block h-2.5 rounded-full bg-page ${className}`} />;

function EkranProizvod() {
  return (
    <Ekran adresa="/proizvod/zastitna-cipela/">
      <div className="grid grid-cols-[42%_1fr] gap-5">
        <div className="relative aspect-square overflow-hidden rounded-[6px] bg-white ring-1 ring-subtle">
          <Image src="/images/products/alfa-neos-s1.jpg" alt="" fill sizes="200px" className="object-contain p-3" />
        </div>
        <div className="min-w-0">
          <Crta className="w-1/3" />
          <span className="mt-3 block text-[15px] font-medium leading-snug md:text-[17px]">Zaštitna cipela S1</span>
          <Crta className="mt-3 w-1/2" />
          <span className="mt-4 block text-[11px] font-medium uppercase tracking-[0.12em] text-secondary">Veličina</span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {[41, 42, 43, 44].map((v) => (
              <span key={v} className={`grid h-8 min-w-9 place-items-center rounded-[4px] px-2 text-[12px] font-medium ${v === 43 ? "bg-primary text-white" : "ring-1 ring-subtle"}`}>
                {v}
              </span>
            ))}
          </span>
        </div>
      </div>
      <span className="relative mt-5 flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-[14px] font-medium text-on-brand">
        <ShoppingBag className="size-4" strokeWidth={1.8} /> Dodaj u korpu
        <Kursor className="-bottom-3 right-[22%]" />
      </span>
    </Ekran>
  );
}

function EkranKorpa() {
  return (
    <Ekran adresa="/korpa/">
      <span className="text-[17px] font-semibold tracking-[-0.01em]">Korpa</span>
      <ul className="mt-4 space-y-3">
        {["/images/products/alfa-neos-s1.jpg", "/images/products/allyn-bluza.jpg"].map((src, i) => (
          <li key={src} className="flex items-center gap-3 rounded-[6px] p-2 ring-1 ring-subtle">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-[4px] bg-white">
              <Image src={src} alt="" fill sizes="48px" className="object-contain p-1" />
            </span>
            <span className="min-w-0 flex-1 space-y-2">
              <Crta className={i ? "w-2/3" : "w-4/5"} />
              <Crta className="w-1/3" />
            </span>
            <span className="flex items-center gap-2 rounded-full px-1 ring-1 ring-subtle">
              <Minus className="size-3.5 text-secondary" />
              <span className="w-3 text-center text-[13px] font-medium tabular-nums">{i ? 1 : 2}</span>
              <Plus className="size-3.5" />
            </span>
          </li>
        ))}
      </ul>
      <span className="mt-4 flex items-center justify-between border-t border-subtle pt-4 text-[13px]">
        <span className="text-secondary">Kupon</span>
        <span className="h-8 w-28 rounded-[4px] ring-1 ring-subtle" />
      </span>
      <span className="relative mt-4 flex h-11 items-center justify-center gap-2 rounded-full bg-brand text-[14px] font-medium text-on-brand">
        Nastavite na plaćanje <ArrowRight width={14} height={14} strokeWidth={1.8} />
        <Kursor className="-bottom-3 right-[18%]" />
      </span>
    </Ekran>
  );
}

function Izbor({ Icon, naslov, izabrano }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; naslov: string; izabrano?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 rounded-[6px] p-3 text-[13px] font-medium ${izabrano ? "bg-primary text-white" : "ring-1 ring-subtle"}`}>
      <span className={`grid size-7 shrink-0 place-items-center rounded-full ${izabrano ? "bg-brand text-on-brand" : "bg-page"}`}>
        <Icon className="size-3.5" strokeWidth={1.8} />
      </span>
      {naslov}
    </span>
  );
}

function EkranPodaci() {
  return (
    <Ekran adresa="/porudzbina/">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-secondary">02 Isporuka</span>
      <span className="mt-2 grid grid-cols-2 gap-2">
        <Izbor Icon={Truck} naslov="Na adresu" izabrano />
        <Izbor Icon={Store} naslov="Preuzimanje" />
      </span>
      <span className="mt-3 grid grid-cols-3 gap-2">
        <span className="col-span-2 h-9 rounded-[4px] ring-1 ring-subtle" />
        <span className="h-9 rounded-[4px] ring-1 ring-subtle" />
      </span>
      <span className="mt-5 block text-[11px] font-medium uppercase tracking-[0.12em] text-secondary">03 Plaćanje</span>
      <span className="mt-2 grid gap-2 sm:grid-cols-3">
        <Izbor Icon={Wallet} naslov="Pouzećem" izabrano />
        <Izbor Icon={QrCode} naslov="IPS QR" />
        <Izbor Icon={Landmark} naslov="Na račun" />
      </span>
    </Ekran>
  );
}

function EkranPotvrda() {
  return (
    <Ekran adresa="/porudzbina/">
      <span className="grid size-12 place-items-center rounded-full bg-success text-white">
        <Check className="size-6" strokeWidth={2.4} />
      </span>
      <span className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Porudžbina primljena</span>
      <span className="mt-1.5 block text-[22px] font-semibold leading-tight tracking-[-0.02em] md:text-[26px]">Hvala, porudžbina je primljena.</span>
      <span className="mt-4 flex items-center gap-3 rounded-[6px] bg-page p-3 text-[13px]">
        <MailIcon className="size-4 shrink-0 text-secondary" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="block font-medium">Potvrda je stigla na vaš e-mail</span>
          <Crta className="w-2/3 bg-surface" />
        </span>
      </span>
    </Ekran>
  );
}

// strelica miša preko dugmeta: pokazuje gde se klikće
function Kursor({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`absolute size-6 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] ${className}`}>
      <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="#fff" stroke="#202124" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- strana ---------- */

export default async function KakoNarucitiPage() {
  const [s, uslovi] = await Promise.all([getSajt(), getUsloviKupovine()]);
  const kuriri = uslovi.kuriri.length ? uslovi.kuriri.join(" ili ") : null;
  const rok = uslovi.rokNaStanju;

  const KORACI = [
    {
      naslov: "Izaberite proizvod i veličinu",
      tekst: "Opremu nađete preko pretrage u zaglavlju ili po kategorijama. Na strani proizvoda izaberite veličinu i boju, pa kliknite „Dodaj u korpu“. Tako dodajete i ostale artikle.",
      saveti: ["Na strani proizvoda piše da li je artikal na stanju i rok isporuke.", "Za istu cipelu u dve veličine, dodajte svaku veličinu posebno."],
      link: { naziv: "Idite u prodavnicu", href: "/prodavnica/" },
      Ekran: EkranProizvod,
    },
    {
      naslov: "Proverite korpu",
      tekst: "Korpu otvarate klikom na ikonicu korpe gore desno. Tu menjate količinu, uklanjate artikle i upisujete kupon za popust, ako ga imate. Kad je sve kako treba, kliknite „Nastavite na plaćanje“.",
      saveti: ["Korpa ostaje sačuvana i kad zatvorite sajt.", "Cene u korpi su sa PDV-om."],
      link: { naziv: "Otvorite korpu", href: "/korpa/" },
      Ekran: EkranKorpa,
    },
    {
      naslov: "Upišite podatke, isporuku i plaćanje",
      tekst: "Upišite ime, telefon i e-mail. Firma upisuje i naziv i PIB. Zatim birate dostavu na adresu ili lično preuzimanje u radnji i način plaćanja. Pre potvrde vidite tačan iznos sa dostavom.",
      saveti: ["Nalog nije potreban. Sa nalogom su podaci i adrese već upisani.", "U napomenu možete upisati veličine za tim ili kad ste dostupni za kurira."],
      link: null,
      Ekran: EkranPodaci,
    },
    {
      naslov: "Potvrdite porudžbinu",
      tekst: "Kliknite „Potvrdite porudžbinu“. Na ekranu dobijate broj porudžbine, a potvrda stiže i na e-mail. Kada plaćate pouzećem ništa više ne radite: kurir vas zove pre isporuke.",
      saveti: ["Kod plaćanja IPS-om ili na račun podaci za uplatu su na ekranu i u e-mailu.", "Ako nešto nije na stanju, javljamo vam se pre slanja."],
      link: null,
      Ekran: EkranPotvrda,
    },
  ];

  const STATUSI = [
    { naziv: "Primljena", opis: "Potvrda sa brojem porudžbine i spiskom artikala." },
    { naziv: "U pripremi", opis: "Pripremamo artikle za slanje." },
    { naziv: "Poslata", opis: "Broj pošiljke za praćenje. Kurir vas zove pre dostave." },
    { naziv: "Isporučena", opis: "Potvrda da je paket stigao na adresu." },
  ];

  const pitanja = [
    {
      q: "Da li je za poručivanje potreban nalog?",
      a: "Ne. Porudžbinu možete poslati kao gost, samo sa imenom, telefonom i e-mailom. Uz nalog su podaci i adrese već upisani, a status svake porudžbine vidite na jednom mestu.",
    },
    {
      q: "Mogu li da naručim telefonom?",
      a: `Možete. Pozovite ${s.phone} u radno vreme (${s.hours.map((h) => `${h.days} ${h.hours}`).join(", ")}) i recite šifru ili naziv artikla, veličinu i količinu. Upit možete poslati i na ${s.email}.`,
    },
    {
      q: "Koliko traje isporuka?",
      a: `${rok ? `Za artikle na stanju rok isporuke je ${rok}.` : "Rok isporuke piše na strani svakog proizvoda."} Ako artikal nije na stanju, rok je naveden na strani proizvoda ili vam ga javljamo posle porudžbine.`,
    },
    {
      q: "Koliko košta dostava?",
      a: `Cena dostave zavisi od težine pošiljke i izabrane kurirske službe. Tačan iznos vidite u koraku „Podaci i isporuka“, pre potvrde porudžbine. Artikli sa oznakom „Besplatna dostava“ ne plaćaju dostavu, a lično preuzimanje u radnji u Svilajncu je besplatno.`,
    },
    {
      q: "Kako firma plaća porudžbinu?",
      a: "Izaberite „Firma“, upišite naziv i PIB, a za plaćanje „Uplata na račun“ ili IPS QR kod. Podatke za uplatu dobijate odmah na ekranu i e-mailom, a artikle šaljemo kad uplata stigne. Za veće količine i brendiranje pošaljite upit za ponudu.",
    },
    {
      q: "Mogu li da izmenim ili otkažem porudžbinu?",
      a: `Pozovite ${s.phone} što pre, dok porudžbina nije poslata. Navedite broj porudžbine iz potvrde.`,
    },
    {
      q: "Šta ako veličina ne odgovara ili je proizvod oštećen?",
      a: `Javite nam se telefonom ili e-mailom. Za porudžbinu sa sajta reklamaciju možete podneti u roku od ${REKLAMACIJA_ROK_DANA} dana, a uz nalog i direktno iz odeljka Moj nalog.`,
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/kako-naruciti/#strana`,
        url: `${SITE_URL}/kako-naruciti/`,
        name: "Kako naručiti - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      {
        "@type": "HowTo",
        name: "Kako naručiti zaštitnu i radnu opremu u HTZ Shop-u",
        description: OPIS,
        inLanguage: "sr",
        step: KORACI.map((k, i) => ({ "@type": "HowToStep", position: i + 1, name: k.naslov, text: k.tekst, url: `${SITE_URL}/kako-naruciti/#korak-${i + 1}` })),
      },
      {
        "@type": "FAQPage",
        mainEntity: pitanja.map((p) => ({ "@type": "Question", name: p.q, acceptedAnswer: { "@type": "Answer", text: p.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Kako naručiti", item: `${SITE_URL}/kako-naruciti/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <section className="relative overflow-hidden bg-primary text-white">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[560px] rounded-full bg-brand/15 blur-[120px]" />
        <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -bottom-40 -right-20 hidden h-[600px] w-auto text-white/[0.04] lg:block xl:right-16">
          <path fill="currentColor" fillRule="evenodd" d={STIT} />
        </svg>

        <div className="container-site relative pb-12 pt-10 md:pb-16 md:pt-14 xl:pb-20">
          <nav aria-label="Putanja" className="text-[13px] text-white/50">
            <Link href="/" className="hover:text-white">
              Početna
            </Link>
            <Razdvajac />
            <span className="text-white/80">Kako naručiti</span>
          </nav>

          <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end xl:gap-20">
            <div className="hero-in max-w-[820px]">
              <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Kako naručiti</p>
              <h1 className="mt-5 text-[42px] font-medium leading-[1.03] tracking-[-0.03em] md:text-[64px] xl:text-[80px]">
                Poručivanje u četiri koraka, <span className="text-brand">bez registracije.</span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[16px] leading-[27px] text-white/70 md:text-[17px] md:leading-[28px]">
                Izaberete opremu, proverite korpu, upišete podatke i potvrdite. Ceo postupak traje nekoliko minuta, a ako vam je lakše, naručite telefonom.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#korak-1" className="btn-primary" style={{ height: 52, padding: "0 30px", fontSize: 15 }}>
                  Pogledajte korake <ArrowRight width={15} height={15} strokeWidth={1.8} className="rotate-90" />
                </a>
                <a href={s.phoneHref} className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-medium transition hover:border-brand hover:text-brand">
                  <Phone width={16} height={16} strokeWidth={1.8} /> {s.phone}
                </a>
              </div>
            </div>

            {/* sadržaj koraka: ujedno i brza navigacija */}
            <ol className="overflow-hidden rounded-[6px] bg-white/[0.06] ring-1 ring-white/10 backdrop-blur">
              {KORACI.map((k, i) => (
                <li key={k.naslov} className={i ? "border-t border-white/10" : ""}>
                  <a href={`#korak-${i + 1}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.06]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-semibold text-on-brand tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-[15px] font-medium leading-snug">{k.naslov}</span>
                    <ArrowRight width={14} height={14} strokeWidth={1.8} className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-brand" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div aria-hidden className={`h-2.5 ${TRAKA}`} />
      </section>

      {/* 2. koraci */}
      <section aria-label="Koraci poručivanja" className="container-site py-16 md:py-24">
        <ol className="relative">
          {KORACI.map((k, i) => (
            <li key={k.naslov} id={`korak-${i + 1}`} className="relative scroll-mt-28 pb-16 pl-14 last:pb-0 md:pb-24 md:pl-24 xl:pl-28">
              {/* vertikalna linija koja spaja korake */}
              {i < KORACI.length - 1 && <span aria-hidden className="absolute bottom-0 left-[19px] top-14 w-px border-l-2 border-dashed border-subtle md:left-[31px] md:top-20" />}
              <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-primary text-[16px] font-semibold text-brand tabular-nums md:size-16 md:text-[24px]">{i + 1}</span>

              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-24">
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <p className="eyebrow md:pt-3">Korak {i + 1} od {KORACI.length}</p>
                  <h2 className="h-section mt-2">{k.naslov}</h2>
                  <p className="mt-5 max-w-[540px] text-[16px] leading-[27px] text-secondary md:text-[17px] md:leading-[28px]">{k.tekst}</p>
                  <ul className="mt-6 max-w-[540px] space-y-3">
                    {k.saveti.map((t) => (
                      <li key={t} className="flex gap-3 text-[15px] leading-[23px]">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                          <Check className="size-3" strokeWidth={2.6} />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                  {k.link && (
                    <Link href={k.link.href} className="link-arrow mt-7">
                      {k.link.naziv} <ArrowRight width={14} height={14} strokeWidth={1.8} />
                    </Link>
                  )}
                </div>
                <div className={`relative mx-auto w-full max-w-[520px] ${i % 2 ? "lg:order-1" : ""}`}>
                  <div aria-hidden className="absolute -inset-4 -z-10 rounded-[14px] bg-[radial-gradient(circle_at_70%_30%,var(--brand-primary-soft),transparent_70%)] md:-inset-8" />
                  <k.Ekran />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. isporuka i plaćanje */}
      <section id="isporuka-i-placanje" className="scroll-mt-24 bg-surface py-16 md:py-24">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[640px]">
              <p className="eyebrow">Isporuka i plaćanje</p>
              <h2 className="h-section mt-3">Birate kako stiže i kako plaćate.</h2>
            </div>
            <Link href="/placanje-i-isporuka/" className="link-arrow">
              Svi uslovi plaćanja i isporuke <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 lg:grid-cols-2">
            <div className="rounded-[6px] bg-page p-6 md:p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-secondary">Isporuka</h3>
              <ul className="mt-6 divide-y divide-subtle">
                <li className="flex gap-4 pb-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-brand">
                    <Truck width={20} height={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="text-[18px] font-medium">Dostava na adresu</p>
                    <p className="mt-1.5 text-[15px] leading-[24px] text-secondary">
                      {kuriri ? `Šaljemo kurirskom službom ${kuriri}, na adresu bilo gde u Srbiji.` : "Šaljemo kurirskom službom, na adresu bilo gde u Srbiji."}{" "}
                      {rok && `Rok za artikle na stanju je ${rok}. `}
                      Cena zavisi od težine pošiljke i vidi se pre potvrde. Artikli sa oznakom „Besplatna dostava“ ne plaćaju dostavu.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 pt-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-brand">
                    <Store width={20} height={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[18px] font-medium">
                      Lično preuzimanje <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[12px] font-semibold text-success">Besplatno</span>
                    </p>
                    <p className="mt-1.5 text-[15px] leading-[24px] text-secondary">
                      U radnji, {s.street}, {s.city}. Javljamo vam telefonom kad je porudžbina spremna, a plaćate pri preuzimanju.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-[6px] bg-page p-6 md:p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-secondary">Plaćanje</h3>
              <ul className="mt-6 divide-y divide-subtle">
                {[
                  { Icon: Wallet, naslov: "Pouzećem", opis: "Plaćate kuriru gotovinom kad paket stigne, ili u radnji pri preuzimanju." },
                  { Icon: QrCode, naslov: "IPS QR kod", opis: "Posle porudžbine skenirate kod u aplikaciji svoje banke. Šaljemo čim uplata stigne." },
                  { Icon: Landmark, naslov: "Uplata na račun", opis: "Podaci za uplatu su na ekranu i u e-mailu. Pogodno za firme, šaljemo posle uplate." },
                ].map(({ Icon, naslov, opis }, i) => (
                  <li key={naslov} className={`flex gap-4 ${i ? "pt-5" : ""} ${i < 2 ? "pb-5" : ""}`}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-brand">
                      <Icon className="size-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <p className="text-[18px] font-medium">{naslov}</p>
                      <p className="mt-1.5 text-[15px] leading-[24px] text-secondary">{opis}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* firme */}
          <div className="mt-4 flex flex-col gap-6 rounded-[6px] bg-brand p-6 text-on-brand md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-brand">
                <Building2 className="size-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[18px] font-medium">Opremate ceo tim?</p>
                <p className="mt-1 max-w-[620px] text-[15px] leading-[24px]">Pošaljite spisak artikala i veličina, a mi pripremamo ponudu za firmu, sa brendiranjem i rokom isporuke.</p>
              </div>
            </div>
            <Link href="/kontakt/#ponuda" className="btn-dark shrink-0" style={{ height: 48, padding: "0 26px" }}>
              Zatražite ponudu <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. posle porudžbine */}
      <section className="container-site py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <p className="eyebrow">Posle porudžbine</p>
            <h2 className="h-section mt-3">O svakom koraku vas obaveštavamo e-mailom.</h2>
          </div>
          <Link href="/moj-nalog/porudzbine/" className="link-arrow">
            Moje porudžbine <ArrowRight width={14} height={14} strokeWidth={1.8} />
          </Link>
        </div>
        <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
          {STATUSI.map((st, i) => (
            <li key={st.naziv} className="relative bg-surface p-6 md:p-8">
              <span className="flex items-center gap-3">
                <span className={`grid size-8 place-items-center rounded-full text-[13px] font-semibold tabular-nums ${i === STATUSI.length - 1 ? "bg-success text-white" : "bg-primary text-brand"}`}>
                  {i === STATUSI.length - 1 ? <Check className="size-4" strokeWidth={2.6} /> : i + 1}
                </span>
                <span aria-hidden className="h-px flex-1 bg-subtle" />
              </span>
              <p className="mt-6 text-[20px] font-medium">{st.naziv}</p>
              <p className="mt-2 text-[15px] leading-[24px] text-secondary">{st.opis}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[760px] text-[15px] leading-[24px] text-secondary">
          Uz{" "}
          <Link href="/registracija/" className="font-medium text-primary underline underline-offset-2">
            nalog
          </Link>{" "}
          status i praćenje pošiljke vidite u svakom trenutku, a reklamaciju podnosite u nekoliko klikova, u roku od {REKLAMACIJA_ROK_DANA} dana.
        </p>
      </section>

      {/* 5. telefonom */}
      <section className="container-site pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[6px] bg-primary text-white">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[360px] rounded-full bg-brand/15 blur-[90px]" />
          <div className="relative grid grid-cols-1 gap-10 p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center xl:p-14">
            <div>
              <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Radije telefonom?</p>
              <p className="mt-4 text-[30px] font-medium leading-[1.12] tracking-[-0.02em] md:text-[42px]">Recite nam šta vam treba, a porudžbinu upisujemo mi.</p>
              <p className="mt-4 max-w-[520px] text-[15px] leading-[24px] text-white/60">Dovoljni su naziv ili šifra artikla, veličina, količina i adresa za isporuku. Pomažemo i oko izbora veličine i standarda zaštite.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={s.phoneHref} className="btn-primary" style={{ height: 52, padding: "0 28px", fontSize: 16 }}>
                  <Phone width={17} height={17} strokeWidth={1.8} /> {s.phone}
                </a>
                <a href={`mailto:${s.email}`} className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-medium transition hover:border-brand hover:text-brand">
                  <MailIcon className="size-4" strokeWidth={1.8} /> {s.email}
                </a>
              </div>
            </div>
            <div className="rounded-[6px] bg-white p-5 text-primary md:p-6">
              <RadnoVremeTabela week={s.week} hours={s.hours} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. česta pitanja */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
          <div>
            <p className="eyebrow">Kako naručiti</p>
            <h2 className="h-section mt-3">Česta pitanja</h2>
            <p className="p-muted mt-5 max-w-[420px] text-[15px]">
              Niste našli odgovor? Pozovite{" "}
              <a href={s.phoneHref} className="font-medium text-primary hover:underline">
                {s.phone}
              </a>
              .
            </p>
            <Link href="/prodavnica/" className="btn-primary mt-8" style={{ height: 48, padding: "0 26px" }}>
              <SearchIcon className="size-4" strokeWidth={1.8} /> Pogledajte opremu
            </Link>
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
