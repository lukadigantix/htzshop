import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Building2, CircleAlert, Clock3, Landmark, PackageCheck, QrCode, Wallet } from "lucide-react";
import { RadnoVremeTabela } from "@/components/kontakt/Radnja";
import { faqLd, Odeljak, OkvirUslova, Pitanja, Pravila, Pravilo, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import { ArrowRight, Phone, Store, Truck } from "@/components/Icons";
import { contact } from "@/data/site";
import { getUsloviKupovine } from "@/lib/kupovina";
import { REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Plaćanje i isporuka (footer, naplata uz „prihvatam uslove", Kontakt, Kako naručiti). Uslovi su napisani prema tome kako
  backend stvarno radi: tri načina plaćanja (pouzeće, IPS QR, uplata na račun; kartica ne postoji), IPS porudžbina bez
  uplate se posle roka sama otkazuje (rok je podešavanje u adminu, pa ga ne pišemo brojem), dostava po težini pošiljke i
  izabranoj službi, artikli „Besplatna dostava" bez troška, lično preuzimanje besplatno. Kurirske službe i rok za artikle
  na stanju su sa backenda (lib/kupovina.ts), podaci prodavca iz Admin → Podešavanja → Sajt.
  1. Tamni uvod sa četiri kratka odgovora.
  2. Sadržaj levo (lepljiv), odeljci desno: plaćanje, dostava, preuzimanje, firme, prodavac.
  3. Česta pitanja + JSON-LD (WebPage, FAQPage, BreadcrumbList).
*/

const OPIS =
  "Uslovi plaćanja i isporuke u HTZ Shop-u: plaćanje pouzećem, IPS QR kodom ili uplatom na račun, dostava kurirskom službom na adresu širom Srbije i besplatno lično preuzimanje u radnji u Svilajncu.";

export const metadata: Metadata = {
  title: "Plaćanje i isporuka: načini plaćanja, cena i rok dostave - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/placanje-i-isporuka/` },
  openGraph: { title: "Plaćanje i isporuka - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "placanje", naziv: "Načini plaćanja" },
  { id: "dostava", naziv: "Dostava na adresu" },
  { id: "preuzimanje", naziv: "Lično preuzimanje" },
  { id: "firme", naziv: "Kupovina za firme" },
  { id: "prodavac", naziv: "Podaci o prodavcu" },
  { id: "pitanja", naziv: "Česta pitanja" },
];

export default async function PlacanjeIsporukaPage() {
  const [s, uslovi] = await Promise.all([getSajt(), getUsloviKupovine()]);
  const kuriri = uslovi.kuriri.length ? uslovi.kuriri.join(" i ") : null;
  const rok = uslovi.rokNaStanju;
  const [banka, racun] = [contact.bank.replace(/\s+\S+$/, ""), contact.bank.split(" ").at(-1) ?? ""];

  const UKRATKO = [
    { Icon: Wallet, vrednost: "3 načina", opis: "pouzeće, IPS QR, uplata na račun" },
    { Icon: Truck, vrednost: kuriri ?? "Kurirom", opis: "dostava na adresu širom Srbije" },
    { Icon: Clock3, vrednost: rok ?? "Rok na artiklu", opis: rok ? "isporuka artikala na stanju" : "rok piše na strani proizvoda" },
    { Icon: Store, vrednost: "Besplatno", opis: "lično preuzimanje u Svilajncu" },
  ];

  const PLACANJA = [
    {
      Icon: Banknote,
      naslov: "Pouzećem",
      oznaka: "Najčešće",
      opis: "Plaćate gotovinom kuriru kad paket stigne. Kod ličnog preuzimanja plaćate u radnji.",
      koraci: ["Izaberete „Pouzećem“ pri porudžbini.", "Šaljemo porudžbinu bez uplate unapred.", "Iznos iz potvrde plaćate kuriru."],
    },
    {
      Icon: QrCode,
      naslov: "IPS QR kod",
      oznaka: "Bez prepisivanja",
      opis: "Posle porudžbine na ekranu i u e-mailu dobijate QR kod. Skenirate ga u aplikaciji svoje banke i plaćanje je gotovo.",
      koraci: ["Skenirate kod u m-banking aplikaciji.", "Podaci i iznos se upisuju sami.", "Šaljemo čim uplata stigne."],
    },
    {
      Icon: Landmark,
      naslov: "Uplata na račun",
      oznaka: "Za firme",
      opis: "Uplatnicu ili nalog za prenos popunjavate podacima koje dobijate na ekranu i e-mailom. Kao poziv na broj upisujete broj porudžbine.",
      koraci: ["Dobijate podatke za uplatu.", "Uplaćujete iz banke ili e-bankinga.", "Šaljemo kad uplata stigne na račun."],
    },
  ];

  const pitanja = [
    {
      q: "Koje načine plaćanja prihvatate?",
      a: "Pouzećem (gotovinom kuriru ili u radnji pri preuzimanju), IPS QR kodom iz aplikacije banke i uplatom na račun. Plaćanje platnom karticom na sajtu trenutno nije moguće.",
    },
    {
      q: "Koliko košta dostava?",
      a: "Cena dostave zavisi od ukupne težine pošiljke i izabrane kurirske službe. Tačan iznos vidite u koraku „Podaci i isporuka“, pre potvrde porudžbine. Artikli sa oznakom „Besplatna dostava“ ne plaćaju dostavu, a lično preuzimanje je besplatno.",
    },
    {
      q: "Koliko traje isporuka?",
      a: `${rok ? `Artikli na stanju stižu za ${rok}.` : "Rok isporuke piše na strani svakog proizvoda."} Rok se računa od potvrde porudžbine, a kod plaćanja unapred od prijema uplate. Za artikle koji nisu na stanju rok je naveden na strani proizvoda.`,
    },
    {
      q: "Šta ako ne uplatim na vreme preko IPS-a?",
      a: "Rok za uplatu piše na ekranu potvrde i u e-mailu, a pre isteka šaljemo podsetnik. Ako uplata ne stigne do roka, porudžbina se automatski otkazuje i ništa ne dugujete.",
    },
    {
      q: "Da li dostavljate van Srbije?",
      a: "Ne, dostavljamo na adrese u Srbiji. Za drugačiji dogovor pozovite nas.",
    },
    {
      q: "Šta ako je paket oštećen?",
      a: `Pregledajte paket pri preuzimanju. Ako je vidno oštećen, recite to kuriru i javite nam se istog dana na ${s.phone}. Za oštećen ili neispravan proizvod reklamaciju podnosite u roku od ${REKLAMACIJA_ROK_DANA} dana.`,
    },
    {
      q: "Mogu li da dobijem račun na firmu?",
      a: "Možete. Pri porudžbini izaberite „Firma“ i upišite naziv i PIB. Račun glasi na firmu, a za plaćanje izaberite uplatu na račun ili IPS QR kod.",
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/placanje-i-isporuka/#strana`,
        url: `${SITE_URL}/placanje-i-isporuka/`,
        name: "Plaćanje i isporuka - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      faqLd(pitanja),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Plaćanje i isporuka", item: `${SITE_URL}/placanje-i-isporuka/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <UvodUslova
        naziv="Plaćanje i isporuka"
        naslov={
          <>
            Platite kako vam odgovara, <span className="text-brand">oprema stiže na adresu.</span>
          </>
        }
        opis={OPIS}
      >
        <UkratkoUslova stavke={UKRATKO} />
      </UvodUslova>

      {/* 2. sadržaj i odeljci */}
      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o porudžbini" }}>
        <Odeljak
          id="placanje"
          broj="01"
          oznaka="Načini plaćanja"
          naslov="Tri načina plaćanja."
          uvod="Način plaćanja birate pri porudžbini. Sve cene na sajtu su u dinarima, sa uračunatim PDV-om, a iznos koji plaćate vidite pre potvrde."
        >
          <ul className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {PLACANJA.map(({ Icon, naslov, oznaka, opis, koraci }) => (
              <li key={naslov} className="group flex flex-col rounded-[6px] bg-surface p-6 ring-1 ring-subtle transition hover:ring-brand md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-primary text-brand transition group-hover:bg-brand group-hover:text-on-brand">
                    <Icon className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">{oznaka}</span>
                </div>
                <h3 className="mt-6 text-[21px] font-medium">{naslov}</h3>
                <p className="mt-2 text-[15px] leading-[24px] text-secondary">{opis}</p>
                <ol className="mt-6 space-y-2.5 border-t border-subtle pt-5">
                  {koraci.map((k, i) => (
                    <li key={k} className="flex gap-3 text-[14px] leading-[21px]">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-semibold tabular-nums">{i + 1}</span>
                      {k}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
          <Pravila className="mt-6">
            <Pravilo naziv="Rok za IPS uplatu">Rok piše na ekranu potvrde i u e-mailu, a pre isteka šaljemo podsetnik. Porudžbina bez uplate se posle roka automatski otkazuje.</Pravilo>
            <Pravilo naziv="Račun za uplatu">
              {racun ? (
                <>
                  {banka}: <b className="font-semibold text-primary tabular-nums">{racun}</b>.{" "}
                </>
              ) : (
                "Broj računa dobijate na ekranu potvrde i u e-mailu. "
              )}
              Kao poziv na broj upišite broj porudžbine, da uplatu odmah povežemo.
            </Pravilo>
            <Pravilo naziv="Platne kartice">Plaćanje karticom na sajtu trenutno nije moguće.</Pravilo>
            <Pravilo naziv="Kupon za popust">Upisuje se u korpi, a popust se vidi u obračunu pre potvrde porudžbine.</Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak
          id="dostava"
          broj="02"
          oznaka="Dostava na adresu"
          naslov="Dostava na adresu širom Srbije."
          uvod={`Porudžbinu šaljemo kurirskom službom${kuriri ? ` ${kuriri}` : ""}. Službu birate pri porudžbini, a kurir vas zove pre dostave.`}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { Icon: Clock3, naslov: "Rok", tekst: rok ? `${rok} za artikle na stanju. Za ostale artikle rok piše na strani proizvoda.` : "Rok piše na strani svakog proizvoda." },
              { Icon: Truck, naslov: "Cena", tekst: "Po ukupnoj težini pošiljke i izabranoj službi. Tačan iznos vidite pre potvrde." },
              { Icon: PackageCheck, naslov: "Besplatna dostava", tekst: "Artikli sa ovom oznakom na kartici i strani proizvoda ne plaćaju dostavu." },
            ].map(({ Icon, naslov, tekst }) => (
              <div key={naslov} className="rounded-[6px] bg-surface p-6 ring-1 ring-subtle">
                <Icon className="size-6 text-brand-active" strokeWidth={1.6} />
                <p className="mt-5 text-[18px] font-medium">{naslov}</p>
                <p className="mt-1.5 text-[15px] leading-[24px] text-secondary">{tekst}</p>
              </div>
            ))}
          </div>
          <Pravila className="mt-6">
            <Pravilo naziv="Kada šaljemo">
              Porudžbinu plaćenu pouzećem šaljemo posle potvrde. Kod IPS-a i uplate na račun šaljemo kad uplata stigne. Kad je porudžbina poslata, e-mailom dobijate broj pošiljke za praćenje.
            </Pravilo>
            <Pravilo naziv="Prijem paketa">
              Pregledajte paket pri preuzimanju. Ako je vidno oštećen, recite to kuriru i javite nam se istog dana. Za oštećen ili neispravan proizvod reklamaciju podnosite u roku od{" "}
              {REKLAMACIJA_ROK_DANA} dana.
            </Pravilo>
            <Pravilo naziv="Dostava po dogovoru">
              Ako za neki artikal cena dostave nije određena, sajt to javlja pri porudžbini. Tada dostavu dogovaramo telefonom ili birate lično preuzimanje.
            </Pravilo>
            <Pravilo naziv="Područje">Dostavljamo na adrese u Srbiji.</Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak id="preuzimanje" broj="03" oznaka="Lično preuzimanje" naslov="Lično preuzimanje u radnji, bez troška dostave.">
          <div className="grid grid-cols-1 overflow-hidden rounded-[6px] bg-primary text-white md:grid-cols-[1fr_1fr]">
            <div className="relative p-6 md:p-8">
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-[260px] rounded-full bg-brand/15 blur-[80px]" />
              <span className="relative inline-flex rounded-full bg-success px-3 py-1 text-[12px] font-semibold text-white">Besplatno</span>
              <p className="relative mt-5 text-[26px] font-medium leading-tight tracking-[-0.02em] md:text-[30px]">
                {s.street}, {s.city}
              </p>
              <p className="relative mt-4 text-[15px] leading-[24px] text-white/65">
                Izaberite „Lično preuzimanje“ pri porudžbini. Javljamo vam telefonom kad je porudžbina spremna, a plaćate pri preuzimanju ili unapred, IPS-om ili uplatom na račun.
              </p>
              <a href={s.mapsHref} target="_blank" rel="noreferrer" className="btn-primary relative mt-7" style={{ height: 46, padding: "0 24px" }}>
                Kako do nas <ArrowRight width={14} height={14} strokeWidth={1.8} />
              </a>
            </div>
            <div className="bg-white p-5 text-primary md:p-7">
              <RadnoVremeTabela week={s.week} hours={s.hours} />
            </div>
          </div>
        </Odeljak>

        <Odeljak
          id="firme"
          broj="04"
          oznaka="Kupovina za firme"
          naslov="Račun na firmu, ponuda za ceo tim."
          uvod="Firma naručuje kao i svaki kupac: pri porudžbini izaberite „Firma“ i upišite naziv i PIB. Račun glasi na firmu."
        >
          <div className="flex flex-col gap-6 rounded-[6px] bg-brand p-6 text-on-brand md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-brand">
                <Building2 className="size-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[19px] font-medium">Veća količina ili brendiranje?</p>
                <p className="mt-1 max-w-[560px] text-[15px] leading-[24px]">
                  Pošaljite spisak artikala i veličina. Pripremamo ponudu sa cenom, brendiranjem i rokom isporuke, a plaćanje je uplatom na račun.
                </p>
              </div>
            </div>
            <Link href="/kontakt/#ponuda" className="btn-dark shrink-0" style={{ height: 48, padding: "0 26px" }}>
              Zatražite ponudu <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>
        </Odeljak>

        <Odeljak id="prodavac" broj="05" oznaka="Podaci o prodavcu" naslov="Prodavac i podaci za uplatu.">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle sm:grid-cols-2">
            {[
              ["Poslovno ime", contact.legalName],
              ["Adresa", `${s.street}, ${s.city}`],
              ["PIB", s.pib],
              ["Matični broj", s.mb],
              ["Tekući račun", racun && `${racun}, ${banka}`],
              ["Telefon i e-mail", `${s.phone}, ${s.email}`],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="bg-surface px-5 py-4">
                  <dt className="text-[13px] text-secondary">{k}</dt>
                  <dd className="mt-1 break-words text-[15px] font-medium">{v}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-5 flex gap-3 text-[14px] leading-[22px] text-secondary">
            <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            <span>
              Ako artikal posle porudžbine nije dostupan ili se cena promenila, javljamo vam se pre slanja. Vi odlučujete da li porudžbina ide dalje. Pogledajte i{" "}
              <Link href="/kako-naruciti/" className="font-medium text-primary underline underline-offset-2">
                kako naručiti
              </Link>{" "}
              i{" "}
              <Link href="/pravo-na-odustajanje/" className="font-medium text-primary underline underline-offset-2">
                pravo na odustajanje
              </Link>
              .
            </span>
          </p>
        </Odeljak>

        {/* 3. česta pitanja */}
        <Odeljak id="pitanja" broj="06" oznaka="Česta pitanja" naslov="Pitanja o plaćanju i dostavi.">
          <Pitanja pitanja={pitanja} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/prodavnica/" className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
              Pogledajte opremu <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
            <a href={s.phoneHref} className="btn-secondary" style={{ height: 48, padding: "0 24px" }}>
              <Phone width={16} height={16} strokeWidth={1.7} /> {s.phone}
            </a>
          </div>
        </Odeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
