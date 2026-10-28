import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Banknote, Building2, CalendarClock, CircleCheck, Landmark, MailCheck, Package, PackageX, QrCode, RefreshCw, Store, Undo2, Wallet } from "lucide-react";
import { faqLd, Odeljak, OkvirUslova, Pitanja, Pravila, Pravilo, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import { ArrowRight, Phone, Truck } from "@/components/Icons";
import { contact } from "@/data/site";
import { REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Povraćaj novca i robe (footer „Pravno", Pravo na odustajanje). Objedinjuje sve slučajeve kada kupac vraća robu ili dobija
  novac nazad, sa istim rokovima kao Uslovi korišćenja (čl. 8, 19, 20, 23) i Pravo na odustajanje: odustanak 14 dana,
  povraćaj najkasnije 14 dana od prijema izjave, reklamacija, nedostupan artikal ili promena cene, otkazana porudžbina.
  Način povraćaja prati način plaćanja (backend šalje e-mail „Novac je vraćen" kad je povraćaj evidentiran).
  1. Tamni uvod sa četiri kratka odgovora.
  2. Kada vraćamo novac, kako se roba vraća, kako stiže novac, tok povraćaja, česta pitanja.
*/

const OPIS =
  "Povraćaj novca i robe u HTZ Shop-u: kada vraćamo novac, kako se roba šalje nazad, na koji račun stiže povraćaj i u kom roku. Važi za odustanak od kupovine, reklamacije i otkazane porudžbine.";

export const metadata: Metadata = {
  title: "Povraćaj novca i robe: rokovi i postupak - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/povracaj-novca/` },
  openGraph: { title: "Povraćaj novca i robe - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "kada", naziv: "Kada vraćamo novac" },
  { id: "roba", naziv: "Vraćanje robe" },
  { id: "nacin", naziv: "Kako stiže novac" },
  { id: "tok", naziv: "Tok povraćaja" },
  { id: "pitanja", naziv: "Česta pitanja" },
];

export default async function PovracajNovcaPage() {
  const s = await getSajt();

  const SLUCAJEVI = [
    {
      Icon: Undo2,
      naslov: "Odustanak od kupovine",
      tekst: "Predomislili ste se ili veličina ne odgovara. Odustajete u roku od 14 dana od prijema robe, bez navođenja razloga.",
      rok: "do 14 dana od prijema izjave",
      trosak: "Plaćate vi",
      link: { naziv: "Pravo na odustajanje", href: "/pravo-na-odustajanje/" },
    },
    {
      Icon: PackageX,
      naslov: "Reklamacija",
      tekst: "Stigao je oštećen, neispravan ili pogrešan proizvod. Ako reklamaciju ne rešimo popravkom ili zamenom, vraćamo novac.",
      rok: "po rešenju reklamacije",
      trosak: "Plaćamo mi",
      link: { naziv: "Reklamacija proizvoda", href: "/reklamacija-proizvoda/" },
    },
    {
      Icon: Ban,
      naslov: "Artikal nije dostupan",
      tekst: "Ako posle uplate artikla nema ili se cena promenila, javljamo vam se. Vraćamo ceo iznos ili razliku, kako odlučite.",
      rok: "do 14 dana od dogovora",
      trosak: "Bez troškova za vas",
      link: null,
    },
    {
      Icon: RefreshCw,
      naslov: "Otkazana porudžbina",
      tekst: "Porudžbinu plaćenu unapred možete otkazati dok nije poslata. Pozovite nas i navedite broj porudžbine.",
      rok: "do 14 dana od otkazivanja",
      trosak: "Bez troškova za vas",
      link: null,
    },
  ];

  const NACINI = [
    { Icon: Wallet, naslov: "Pouzećem", tekst: "Na tekući račun koji navedete u Dodatku uz izjavu o odustanku ili u e-mailu. Bez troškova za vas." },
    { Icon: QrCode, naslov: "IPS QR kodom", tekst: "Na račun sa kog ste platili, odnosno na račun koji navedete." },
    { Icon: Landmark, naslov: "Uplatom na račun", tekst: "Na račun sa kog je stigla uplata, odnosno na račun koji navedete." },
    { Icon: Building2, naslov: "Kupovina na firmu", tekst: "Na tekući račun firme, uz knjižno odobrenje za račun koji smo izdali." },
  ];

  const TOK = [
    { Icon: MailCheck, naslov: "Primamo vaš zahtev", tekst: "Izjavu o odustanku, reklamaciju ili zahtev za otkazivanje potvrđujemo e-mailom." },
    { Icon: Package, naslov: "Primamo robu", tekst: "Proveravamo da li je proizvod vraćen kompletan, čist i nekorišćen." },
    { Icon: Banknote, naslov: "Vraćamo novac", tekst: "Bez odlaganja, a kod odustanka najkasnije 14 dana od prijema izjave." },
    { Icon: CircleCheck, naslov: "Šaljemo potvrdu", tekst: "E-mailom javljamo kad je povraćaj izvršen. Vidljivost na računu zavisi od banke." },
  ];

  const pitanja = [
    {
      q: "Za koliko dana dobijam novac nazad?",
      a: "Kod odustanka od kupovine novac vraćamo bez odlaganja, a najkasnije 14 dana od dana kada smo primili izjavu o odustanku. Povraćaj možemo da odložimo dok ne primimo robu ili dok ne pošaljete dokaz da je roba poslata. Kad je povraćaj izvršen, dobijate e-mail.",
    },
    {
      q: "Platio sam pouzećem. Kako dobijam novac?",
      a: "Na tekući račun koji navedete u Dodatku uz izjavu o odustanku ili u e-mailu, uz ime vlasnika računa i naziv banke. Povraćaj je bez troškova za vas.",
    },
    {
      q: "Da li se vraća i trošak dostave?",
      a: "Kod odustanka od cele porudžbine vraćamo iznos koji ste platili po porudžbini, uključujući trošak dostave do vas. Trošak slanja proizvoda nazad snosite vi, osim kod reklamacije, kada ga snosimo mi.",
    },
    {
      q: "Vraćam samo jedan proizvod iz porudžbine. Šta dobijam?",
      a: "Vraćamo cenu proizvoda koje vraćate. Ako je na porudžbinu primenjen popust ili kupon, iznos povraćaja računa se po ceni koju ste stvarno platili za te proizvode.",
    },
    {
      q: "Mogu li umesto povraćaja da uzmem drugu veličinu?",
      a: `Možete. Pozovite ${s.phone} pre slanja proizvoda. Ako je druga veličina na stanju, dogovaramo zamenu, pa povraćaj novca nije potreban.`,
    },
    {
      q: "Mogu li proizvod da vratim lično?",
      a: `Možete, u radnji na adresi ${s.street}, ${s.city}, u radno vreme. Ponesite broj porudžbine ili račun.`,
    },
    {
      q: "Šta ako je proizvod korišćen?",
      a: "Isprobavanje veličine je dozvoljeno, kao u radnji. Ako je proizvod korišćen više od toga, iznos povraćaja umanjuje se srazmerno umanjenoj vrednosti proizvoda.",
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/povracaj-novca/#strana`,
        url: `${SITE_URL}/povracaj-novca/`,
        name: "Povraćaj novca i robe - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      {
        "@type": "MerchantReturnPolicy",
        "@id": `${SITE_URL}/povracaj-novca/#politika`,
        url: `${SITE_URL}/povracaj-novca/`,
        applicableCountry: "RS",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: ["https://schema.org/ReturnByMail", "https://schema.org/ReturnInStore"],
        returnFees: "https://schema.org/ReturnShippingFees",
        refundType: "https://schema.org/FullRefund",
      },
      faqLd(pitanja),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Povraćaj novca i robe", item: `${SITE_URL}/povracaj-novca/` },
        ],
      },
    ],
  };

  return (
    <main>
      <UvodUslova naziv="Povraćaj novca i robe" naslov={<>Vraćate robu? <span className="text-brand">Novac stiže u roku od 14 dana.</span></>} opis={OPIS}>
        <UkratkoUslova
          stavke={[
            { Icon: CalendarClock, vrednost: "14 dana", opis: "za odustanak od prijema robe" },
            { Icon: Banknote, vrednost: "14 dana", opis: "najkasnije za povraćaj novca" },
            { Icon: Truck, vrednost: "Poštom ili kurirom", opis: "ili lično u radnji u Svilajncu" },
            { Icon: Store, vrednost: "Na vaš račun", opis: "i kada ste platili pouzećem" },
          ]}
        />
      </UvodUslova>

      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o povraćaju" }}>
        <Odeljak id="kada" broj="01" oznaka="Kada vraćamo novac" naslov="Četiri slučaja povraćaja." uvod="U svakom slučaju vraćamo iznos koji ste stvarno platili. Rok i trošak slanja robe nazad zavise od razloga.">
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SLUCAJEVI.map(({ Icon, naslov, tekst, rok, trosak, link }) => (
              <li key={naslov} className="flex flex-col rounded-[6px] bg-surface p-6 ring-1 ring-subtle md:p-7">
                <span className="grid size-11 place-items-center rounded-full bg-primary text-brand">
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-[20px] font-medium">{naslov}</h3>
                <p className="mt-2 text-[15px] leading-[24px] text-secondary">{tekst}</p>
                <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] bg-subtle text-[13px] ring-1 ring-subtle">
                  <div className="bg-page px-3 py-2.5">
                    <dt className="text-secondary">Povraćaj</dt>
                    <dd className="mt-0.5 font-medium">{rok}</dd>
                  </div>
                  <div className="bg-page px-3 py-2.5">
                    <dt className="text-secondary">Slanje nazad</dt>
                    <dd className="mt-0.5 font-medium">{trosak}</dd>
                  </div>
                </dl>
                {link && (
                  <Link href={link.href} className="link-arrow mt-auto pt-5">
                    {link.naziv} <ArrowRight width={14} height={14} strokeWidth={1.8} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Odeljak>

        <Odeljak id="roba" broj="02" oznaka="Vraćanje robe" naslov="Kako da pošaljete robu nazad.">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-[6px] bg-primary p-6 text-white md:p-8">
              <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Adresa za vraćanje</p>
              <p className="mt-4 text-[24px] font-medium leading-tight tracking-[-0.01em] md:text-[28px]">
                {s.name}
                <br />
                {s.street}
                <br />
                {s.city}
              </p>
              <p className="mt-4 text-[14px] leading-[22px] text-white/60">
                Poštom ili kurirskom službom, o vašem trošku. Pošiljku ne šaljite na teret primaoca. Robu možete doneti i lično u radnju, u radno vreme.
              </p>
              <a href={s.mapsHref} target="_blank" rel="noreferrer" className="btn-primary mt-6" style={{ height: 46, padding: "0 22px" }}>
                Kako do nas <ArrowRight width={14} height={14} strokeWidth={1.8} />
              </a>
            </div>
            <div className="rounded-[6px] bg-surface p-6 ring-1 ring-subtle md:p-8">
              <p className="kicker">U paketu</p>
              <ul className="mt-4 space-y-3">
                {[
                  "Proizvod čist i nekorišćen, sa etiketama",
                  "Originalna ambalaža, kutija za obuću",
                  "Broj porudžbine ili kopija računa",
                  "Kod odustanka, popunjen Dodatak uz izjavu",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-[23px]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft">
                      <CircleCheck className="size-3.5 text-primary" strokeWidth={2.2} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Pravila className="mt-6">
            <Pravilo naziv="Rok za slanje">Kod odustanka, najkasnije 14 dana od dana kada ste nam poslali izjavu o odustanku.</Pravilo>
            <Pravilo naziv="Pakovanje">Spakujte proizvod tako da se ne ošteti u transportu, najbolje u originalnu kutiju i zaštitni karton.</Pravilo>
            <Pravilo naziv="Šta se ne vraća">
              Brendirana odeća i proizvodi rađeni po vašem zahtevu, kao i higijenska i jednokratna oprema otvorenog pakovanja.{" "}
              <Link href="/pravo-na-odustajanje/#izuzeci" className="font-medium text-primary underline underline-offset-2">
                Izuzeci
              </Link>
            </Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak id="nacin" broj="03" oznaka="Kako stiže novac" naslov="Novac vraćamo prema načinu plaćanja." uvod="Povraćaj ide na tekući račun, i kada ste platili pouzećem.">
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle sm:grid-cols-2">
            {NACINI.map(({ Icon, naslov, tekst }) => (
              <li key={naslov} className="flex gap-4 bg-surface p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page">
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="text-[17px] font-medium">{naslov}</p>
                  <p className="mt-1 text-[15px] leading-[24px] text-secondary">{tekst}</p>
                </div>
              </li>
            ))}
          </ul>
          <Pravila className="mt-6">
            <Pravilo naziv="Šta vraćamo">Iznos koji ste platili po porudžbini. Kod odustanka od cele porudžbine i trošak dostave do vas.</Pravilo>
            <Pravilo naziv="Umanjenje">Ako je proizvod korišćen više nego što je potrebno da se isproba, iznos se umanjuje srazmerno umanjenoj vrednosti.</Pravilo>
            <Pravilo naziv="Podaci za povraćaj">Broj tekućeg računa, ime vlasnika računa i naziv banke. Pošaljite ih na {s.email}, uz broj porudžbine.</Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak id="tok" broj="04" oznaka="Tok povraćaja" naslov="Od zahteva do novca na računu.">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOK.map(({ Icon, naslov, tekst }, i) => (
              <li key={naslov} className="relative rounded-[6px] bg-surface p-6 ring-1 ring-subtle">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-full ${i === TOK.length - 1 ? "bg-success text-white" : "bg-primary text-brand"}`}>
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-subtle" />
                  <span className="text-[13px] font-semibold tabular-nums text-secondary">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-[18px] font-medium">{naslov}</h3>
                <p className="mt-1.5 text-[14px] leading-[22px] text-secondary">{tekst}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[14px] leading-[22px] text-secondary">
            Kod reklamacije rok zavisi od rešenja: na reklamaciju odgovaramo u roku od osam dana, a uz nalog je podnosite iz odeljka Moj nalog, u roku od{" "}
            {REKLAMACIJA_ROK_DANA} dana od porudžbine.
          </p>
        </Odeljak>

        <Odeljak id="pitanja" broj="05" oznaka="Česta pitanja" naslov="Pitanja o povraćaju.">
          <Pitanja pitanja={pitanja} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/pravo-na-odustajanje/#obrasci" className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
              Obrasci za odustanak <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
            <a href={s.phoneHref} className="btn-secondary" style={{ height: 48, padding: "0 24px" }}>
              <Phone width={16} height={16} strokeWidth={1.7} /> {s.phone}
            </a>
          </div>
          <p className="mt-8 text-[13px] leading-[20px] text-secondary">
            Prodavac: {contact.legalName}. Uslovi su deo{" "}
            <Link href="/uslovi-koriscenja/#odustanak" className="font-medium text-primary underline underline-offset-2">
              Uslova korišćenja
            </Link>
            .
          </p>
        </Odeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
