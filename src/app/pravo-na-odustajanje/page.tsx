import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CalendarDays, Download, FileText, Mail, MessageCircleOff, PackageOpen, Ruler, Send, Stamp, Undo2 } from "lucide-react";
import { faqLd, Odeljak, OkvirUslova, Pitanja, Pravila, Pravilo, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import { ArrowRight, Phone, Truck } from "@/components/Icons";
import { IZDATO, OBRASCI } from "@/lib/dokumenti";
import { REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Pravo na odustajanje (footer, naplata uz „prihvatam uslove", Plaćanje i isporuka). Po uzoru na klikdogume
  /pomoc/reklamacije-i-povrat#odustanak, prilagođeno HTZ opremi: roba se vraća u radnju u Svilajncu (nema magacina
  dobavljača), izuzeci su brendirana odeća, roba po posebnom zahtevu i higijenska/jednokratna oprema otvorenog pakovanja.
  Obrasci (izjava i dodatak) su u public/files/ (lib/dokumenti.ts, izvor u docs/obrasci/).
  1. Tamni uvod sa četiri kratka odgovora.
  2. Sadržaj levo, odeljci desno: koraci, obrasci, uslovi, izuzeci, povraćaj novca, odustanak ili reklamacija, pitanja.
  JSON-LD: WebPage, FAQPage, BreadcrumbList.
*/

const OPIS =
  "Pravo na odustajanje od kupovine u HTZ Shop-u: od kupovine na daljinu možete odustati u roku od 14 dana od prijema robe, bez navođenja razloga. Obrasci za preuzimanje, uslovi vraćanja i povraćaj novca.";

export const metadata: Metadata = {
  title: "Pravo na odustajanje: povraćaj robe u roku od 14 dana - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/pravo-na-odustajanje/` },
  openGraph: { title: "Pravo na odustajanje - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "kako", naziv: "Kako odustati" },
  { id: "obrasci", naziv: "Obrasci" },
  { id: "uslovi", naziv: "Uslovi vraćanja" },
  { id: "izuzeci", naziv: "Šta se ne vraća" },
  { id: "povracaj", naziv: "Povraćaj novca" },
  { id: "reklamacija", naziv: "Odustanak ili reklamacija" },
  { id: "pitanja", naziv: "Česta pitanja" },
];

export default async function PravoNaOdustajanjePage() {
  const s = await getSajt();
  const mail = `mailto:${s.email}?subject=${encodeURIComponent("Odustanak od ugovora - porudžbina ")}`;

  const KORACI = [
    { Icon: FileText, naslov: "Popunite obrasce", tekst: "Izjavu o odustanku i Dodatak uz izjavu. Dovoljno je da ih popunite na računaru ili telefonu, štampanje nije obavezno." },
    { Icon: Send, naslov: "Pošaljite ih e-mailom", tekst: `Na ${s.email}, sa e-mail adrese iz porudžbine, u roku od 14 dana od prijema robe. Prijem vam potvrđujemo e-mailom.` },
    { Icon: Truck, naslov: "Vratite proizvod", tekst: `Najkasnije 14 dana od slanja izjave: poštom ili kurirom na adresu ${s.street}, ${s.city}, ili lično u radnji.` },
    { Icon: Banknote, naslov: "Vraćamo novac", tekst: "Bez odlaganja, a najkasnije 14 dana od prijema izjave, na tekući račun koji navedete u Dodatku." },
  ];

  const IZUZECI = [
    {
      Icon: Stamp,
      naslov: "Brendirana odeća",
      tekst: "Odeća i oprema sa logom ili natpisom koji smo odštampali ili izvezli po vašem zahtevu.",
      link: { naziv: "Brendiranje odeće", href: "/brendiranje-odece/" },
    },
    { Icon: Ruler, naslov: "Po posebnom zahtevu", tekst: "Proizvodi izrađeni po meri ili naručeni posebno za vas, prema vašim zahtevima." },
    { Icon: PackageOpen, naslov: "Higijenska i jednokratna oprema", tekst: "Maske, polumaske, čepići za uši, jednokratne rukavice i odeća, ako je originalno pakovanje otvoreno." },
  ];

  const pitanja = [
    {
      q: "Da li moram da navedem razlog odustanka?",
      a: "Ne. Od kupovine na daljinu možete odustati u roku od 14 dana od prijema robe, bez navođenja razloga. Polje za razlog u obrascu nije obavezno.",
    },
    {
      q: "Od kada teče rok od 14 dana?",
      a: "Od dana kada ste vi, ili lice koje ste odredili, primili robu. Ako je porudžbina stigla u više paketa, rok teče od prijema poslednjeg paketa.",
    },
    {
      q: "Da li moram da odštampam obrazac?",
      a: `Ne. Obrasce možete popuniti na računaru ili telefonu i poslati na ${s.email}. Izjavu možete dati i običnim e-mailom, ako jasno navedete da odustajete od ugovora, broj porudžbine i proizvod.`,
    },
    {
      q: "Veličina ne odgovara. Mogu li da je zamenim?",
      a: `Pozovite ${s.phone} pre nego što pošaljete proizvod. Ako je druga veličina na stanju, dogovaramo zamenu, a u suprotnom vraćamo novac po pravu na odustajanje.`,
    },
    {
      q: "Ko plaća vraćanje proizvoda?",
      a: "Trošak slanja proizvoda nazad snosi kupac. Ako je stigao pogrešan, oštećen ili neispravan proizvod, to nije odustanak nego reklamacija, i trošak snosimo mi.",
    },
    {
      q: "Važi li pravo na odustajanje za firme?",
      a: "Zakonsko pravo na odustajanje imaju potrošači, odnosno fizička lica koja kupuju za ličnu upotrebu. Za kupovinu na firmu vraćanje robe dogovaramo pojedinačno.",
    },
    {
      q: "Važi li za kupovinu u radnji?",
      a: "Ne, pravo na odustajanje važi za kupovinu na daljinu: preko sajta, telefonom ili e-mailom. U radnji opremu možete pogledati i isprobati pre kupovine.",
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/pravo-na-odustajanje/#strana`,
        url: `${SITE_URL}/pravo-na-odustajanje/`,
        name: "Pravo na odustajanje - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      faqLd(pitanja),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Pravo na odustajanje", item: `${SITE_URL}/pravo-na-odustajanje/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <UvodUslova naziv="Pravo na odustajanje" naslov={<>Predomislili ste se? <span className="text-brand">Imate 14 dana.</span></>} opis={OPIS}>
        <UkratkoUslova
          stavke={[
            { Icon: CalendarDays, vrednost: "14 dana", opis: "od prijema robe za odustanak" },
            { Icon: MessageCircleOff, vrednost: "Bez razloga", opis: "razlog ne morate da navedete" },
            { Icon: Banknote, vrednost: "14 dana", opis: "za povraćaj novca od prijema izjave" },
            { Icon: Undo2, vrednost: "Poštom ili lično", opis: `vraćanje u radnju u Svilajncu` },
          ]}
        />
      </UvodUslova>

      {/* 2. sadržaj i odeljci */}
      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o vraćanju" }}>
        <Odeljak id="kako" broj="01" oznaka="Kako odustati" naslov="Odustanak u četiri koraka." uvod="Pravo na odustajanje imate kada kupujete na daljinu: preko sajta, telefonom ili e-mailom.">
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle sm:grid-cols-2">
            {KORACI.map(({ Icon, naslov, tekst }, i) => (
              <li key={naslov} className="relative bg-surface p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-primary text-brand">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-subtle" />
                  <span className="text-[13px] font-semibold tabular-nums text-secondary">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-[20px] font-medium">{naslov}</h3>
                <p className="mt-2 text-[15px] leading-[24px] text-secondary">{tekst}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#obrasci" className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
              <Download className="size-4" strokeWidth={1.8} /> Preuzmite obrasce
            </a>
            <a href={mail} className="btn-secondary" style={{ height: 48, padding: "0 24px" }}>
              <Mail className="size-4" strokeWidth={1.7} /> {s.email}
            </a>
          </div>
        </Odeljak>

        <Odeljak
          id="obrasci"
          broj="02"
          oznaka="Obrasci"
          naslov="Obrasci za preuzimanje."
          uvod={`Pošaljite oba obrasca zajedno, na ${s.email}. Slanjem sa e-mail adrese iz porudžbine smatra se da ste ih potpisali.`}
        >
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[OBRASCI.izjava, OBRASCI.dodatak].map((d, i) => (
              <li key={d.id}>
                <a href={d.fajl} target="_blank" rel="noopener" className="group flex h-full flex-col rounded-[6px] bg-primary p-6 text-white transition hover:-translate-y-1 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    {/* list papira sa presavijenim uglom i žutom oznakom formata */}
                    <span aria-hidden className="relative grid h-16 w-[52px] place-items-end overflow-hidden rounded-[3px] bg-white pb-2 text-[10px] font-bold tracking-[0.08em] text-primary [clip-path:polygon(0_0,72%_0,100%_22%,100%_100%,0_100%)]">
                      <span className="absolute right-0 top-0 size-[14px] bg-[#d9dadc]" />
                      <span className="mx-auto rounded-[2px] bg-brand px-1.5 py-0.5">PDF</span>
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">Obrazac {i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-[20px] font-medium leading-snug">{d.naziv}</h3>
                  <p className="mt-2 text-[15px] leading-[24px] text-white/60">{d.opis}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[14px] font-medium text-brand">
                    <Download className="size-4" strokeWidth={1.8} /> Preuzmite PDF
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-secondary">Obrasci važe od {IZDATO}</p>
        </Odeljak>

        <Odeljak id="uslovi" broj="03" oznaka="Uslovi vraćanja" naslov="Kako proizvod treba da stigne nazad.">
          <Pravila>
            <Pravilo naziv="Rok za odustanak">14 dana od dana prijema robe. Ako je porudžbina stigla u više paketa, od prijema poslednjeg.</Pravilo>
            <Pravilo naziv="Rok za vraćanje">Proizvod pošaljite ili donesite najkasnije 14 dana od dana kada ste nam poslali izjavu o odustanku.</Pravilo>
            <Pravilo naziv="Stanje proizvoda">Čist i nekorišćen, sa etiketama i u originalnoj ambalaži. Isprobavanje veličine, kao u radnji, je dozvoljeno.</Pravilo>
            <Pravilo naziv="Umanjena vrednost">Ako je proizvod korišćen više nego što je potrebno da se isproba, iznos povraćaja se umanjuje srazmerno umanjenoj vrednosti.</Pravilo>
            <Pravilo naziv="Adresa za vraćanje">
              {s.name}, {s.street}, {s.city}. Poštom, kurirskom službom ili lično u radnji, u radno vreme. Pošiljku ne šaljite na teret primaoca.
            </Pravilo>
            <Pravilo naziv="Trošak vraćanja">Snosi kupac. Ako je isporučen pogrešan, oštećen ili neispravan proizvod, trošak snosimo mi.</Pravilo>
            <Pravilo naziv="Ko ima pravo">Potrošač, odnosno fizičko lice koje kupuje za ličnu upotrebu. Za kupovinu na firmu vraćanje dogovaramo pojedinačno.</Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak id="izuzeci" broj="04" oznaka="Šta se ne vraća" naslov="Proizvodi na koje se odustanak ne odnosi." uvod="Po Zakonu o zaštiti potrošača pravo na odustajanje ne važi za robu izrađenu prema posebnim zahtevima kupca i za robu koja se iz higijenskih razloga ne može vratiti kad je otpakovana.">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {IZUZECI.map(({ Icon, naslov, tekst, link }) => (
              <li key={naslov} className="flex flex-col rounded-[6px] bg-surface p-6 ring-1 ring-subtle">
                <span className="grid size-11 place-items-center rounded-full bg-[#fdecea] text-sale">
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <p className="mt-5 text-[18px] font-medium">{naslov}</p>
                <p className="mt-1.5 text-[15px] leading-[24px] text-secondary">{tekst}</p>
                {link && (
                  <Link href={link.href} className="link-arrow mt-auto pt-5">
                    {link.naziv} <ArrowRight width={14} height={14} strokeWidth={1.8} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Odeljak>

        <Odeljak id="povracaj" broj="05" oznaka="Povraćaj novca" naslov="Novac vraćamo u roku od 14 dana.">
          <Pravila>
            <Pravilo naziv="Rok">Bez odlaganja, a najkasnije 14 dana od dana kada smo primili izjavu o odustanku.</Pravilo>
            <Pravilo naziv="Šta vraćamo">Cenu proizvoda i trošak dostave koji ste platili za porudžbinu. Trošak slanja proizvoda nazad snosite vi.</Pravilo>
            <Pravilo naziv="Na koji račun">
              Za porudžbinu plaćenu pouzećem, na tekući račun koji navedete u Dodatku. Za IPS i uplatu na račun, na račun sa kog ste platili, odnosno koji navedete.
            </Pravilo>
            <Pravilo naziv="Zadržavanje povraćaja">Povraćaj možemo da odložimo dok ne primimo proizvod ili dok nam ne pošaljete dokaz da je proizvod poslat.</Pravilo>
            <Pravilo naziv="Deo porudžbine">Ako vraćate samo neke proizvode, vraćamo iznos za te proizvode.</Pravilo>
          </Pravila>
          <Link href="/povracaj-novca/" className="link-arrow mt-6">
            Sve o povraćaju novca i robe <ArrowRight width={14} height={14} strokeWidth={1.8} />
          </Link>
        </Odeljak>

        <Odeljak id="reklamacija" broj="06" oznaka="Odustanak ili reklamacija" naslov="Predomislili ste se ili nešto nije u redu?">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-[6px] bg-surface p-6 ring-1 ring-subtle md:p-8">
              <p className="kicker">Odustanak</p>
              <p className="mt-3 text-[22px] font-medium leading-tight">Proizvod je ispravan, ali vam ne odgovara.</p>
              <ul className="mt-5 space-y-2 text-[15px] leading-[24px] text-secondary">
                <li>Predomislili ste se ili veličina ne odgovara.</li>
                <li>Rok je 14 dana od prijema robe.</li>
                <li>Trošak vraćanja snosite vi.</li>
              </ul>
              <a href="#obrasci" className="link-arrow mt-6">
                Obrasci za odustanak <ArrowRight width={14} height={14} strokeWidth={1.8} />
              </a>
            </div>
            <div className="rounded-[6px] bg-primary p-6 text-white md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Reklamacija</p>
              <p className="mt-3 text-[22px] font-medium leading-tight">Stigao je oštećen, neispravan ili pogrešan proizvod.</p>
              <ul className="mt-5 space-y-2 text-[15px] leading-[24px] text-white/65">
                <li>Pogrešna veličina ili model u odnosu na porudžbinu, oštećenje ili greška.</li>
                <li>Uz nalog je podnosite direktno iz odeljka Moj nalog, u roku od {REKLAMACIJA_ROK_DANA} dana.</li>
                <li>Trošak vraćanja snosimo mi.</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/reklamacija-proizvoda/" className="btn-primary" style={{ height: 46, padding: "0 22px" }}>
                  Podnesite reklamaciju <ArrowRight width={14} height={14} strokeWidth={1.8} />
                </Link>
                <a href={s.phoneHref} className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/25 px-5 text-[14px] font-medium transition hover:border-brand hover:text-brand">
                  <Phone width={15} height={15} strokeWidth={1.8} /> {s.phone}
                </a>
              </div>
            </div>
          </div>
        </Odeljak>

        <Odeljak id="pitanja" broj="07" oznaka="Česta pitanja" naslov="Pitanja o vraćanju robe.">
          <Pitanja pitanja={pitanja} />
          <p className="mt-8 text-[14px] leading-[22px] text-secondary">
            Pogledajte i{" "}
            <Link href="/placanje-i-isporuka/" className="font-medium text-primary underline underline-offset-2">
              plaćanje i isporuku
            </Link>{" "}
            i{" "}
            <Link href="/kako-naruciti/" className="font-medium text-primary underline underline-offset-2">
              kako naručiti
            </Link>
            .
          </p>
        </Odeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
