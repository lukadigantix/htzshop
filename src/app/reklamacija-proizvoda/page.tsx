import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CalendarClock, Camera, CircleCheck, CircleX, ClipboardCheck, Hammer, MailCheck, MessageSquareReply, PackageCheck, RefreshCw, Scale, ShieldCheck, Truck as TruckIcon } from "lucide-react";
import { faqLd, Odeljak, OkvirUslova, Pitanja, Pravila, Pravilo, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import FormaReklamacija, { type PorudzbinaZaIzbor } from "@/components/nalog/FormaReklamacija";
import { ReklamacijaPilula } from "@/components/nalog/Status";
import FormaGost from "@/components/reklamacija/FormaGost";
import { ArrowRight } from "@/components/Icons";
import { rsd } from "@/lib/filteri";
import { getKorisnik, getMojePorudzbine, getMojeReklamacije } from "@/lib/nalog";
import { datum, REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt, type Sajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Reklamacija proizvoda (footer „Pomoć", Uslovi korišćenja čl. 23, Povraćaj novca, Pravo na odustajanje, nova reklamacija u nalogu).
  Podnošenje odmah na strani, prema tome ko je kupac:
  - prijavljen: postojeća forma iz naloga (POST /complaints: porudžbine u roku od 14 dana, jedna reklamacija po porudžbini)
    i spisak njegovih reklamacija sa statusom;
  - gost ili bez porudžbine u roku: forma sa fotografijama kroz kontakt rutu (components/reklamacija/FormaGost.tsx), jer
    backend prima reklamacije samo od prijavljenih kupaca.
  Deo sa formom čita kolačić sesije, pa je u Suspense-u; ostatak strane je statičan.
  Zatim: postupak i rokovi, šta pokriva nesaobraznost (HTZ oprema), pravila, česta pitanja.
*/

const OPIS =
  "Reklamacija proizvoda u HTZ Shop-u: prijava oštećene, neispravne ili pogrešno isporučene zaštitne opreme preko sajta, e-mailom ili u radnji. Postupak, rokovi i šta pokriva odgovornost za nesaobraznost.";

export const metadata: Metadata = {
  title: "Reklamacija proizvoda: prijava i rokovi - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/reklamacija-proizvoda/` },
  openGraph: { title: "Reklamacija proizvoda - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "prijava", naziv: "Prijava reklamacije" },
  { id: "postupak", naziv: "Postupak i rokovi" },
  { id: "pokriva", naziv: "Šta pokriva" },
  { id: "pravila", naziv: "Pravila" },
  { id: "pitanja", naziv: "Česta pitanja" },
];

const KARTICA = "rounded-[6px] bg-surface p-6 ring-1 ring-subtle md:p-8";

/** Kostur dok se proverava prijava (kolačić) - iste visine kao forma, da strana ne skače. */
function KosturPrijave() {
  return <div aria-hidden className={`${KARTICA} h-[560px] animate-pulse`} />;
}

/** Forma za podnošenje: prijavljenom kupcu iz naloga, ostalima forma sa fotografijama. */
async function Prijava({ s }: { s: Sajt }) {
  const korisnik = await getKorisnik();
  if (!korisnik) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
        <div className={KARTICA}>
          <p className="kicker">Poručili ste bez naloga</p>
          <h3 className="mt-2 text-[22px] font-medium leading-tight">Pošaljite reklamaciju ovde.</h3>
          <p className="mt-2 mb-6 text-[15px] leading-[24px] text-secondary">Upišite broj porudžbine iz e-maila potvrde, opišite problem i dodajte fotografije.</p>
          <FormaGost />
        </div>
        <aside className="flex flex-col gap-3">
          <div className="rounded-[6px] bg-primary p-6 text-white">
            <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Imate nalog?</p>
            <p className="mt-3 text-[18px] font-medium leading-snug">Prijavite se i izaberite porudžbinu sa spiska.</p>
            <Link href="/prijava/?nazad=/reklamacija-proizvoda/" className="btn-primary mt-5" style={{ height: 44, padding: "0 22px" }}>
              Prijava <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>
          <div className={`${KARTICA} !p-6`}>
            <p className="kicker">Ili direktno</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <a href={s.phoneHref} className="font-medium hover:underline">
                  {s.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${s.email}?subject=${encodeURIComponent("Reklamacija - porudžbina ")}`} className="font-medium hover:underline">
                  {s.email}
                </a>
              </li>
              <li className="text-secondary">
                U radnji: {s.street}, {s.city}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    );
  }

  const [porudzbine, reklamacije] = await Promise.all([getMojePorudzbine(), getMojeReklamacije()]);
  const moguce: PorudzbinaZaIzbor[] = (porudzbine ?? [])
    .filter((p) => p.canComplain && p.status !== "odustao")
    .map((p) => ({ id: p.id, orderNumber: p.orderNumber, datum: datum(p.createdAt), iznos: rsd(p.totalAmount) }));

  return (
    <div className="space-y-3">
      <div className={KARTICA}>
        <p className="kicker">Prijavljeni ste kao {korisnik.firstName}</p>
        {moguce.length ? (
          <>
            <h3 className="mt-2 text-[22px] font-medium leading-tight">Izaberite porudžbinu i opišite problem.</h3>
            <p className="mt-2 mb-6 text-[15px] leading-[24px] text-secondary">Status reklamacije i naš odgovor pratite u nalogu, a stižu i na e-mail.</p>
            <div className="max-w-[720px]">
              <FormaReklamacija porudzbine={moguce} />
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-2 text-[22px] font-medium leading-tight">Nema porudžbine za reklamaciju preko naloga.</h3>
            <p className="mt-2 mb-6 text-[15px] leading-[24px] text-secondary">
              Preko naloga se reklamiraju porudžbine do {REKLAMACIJA_ROK_DANA} dana od kupovine, jedna reklamacija po porudžbini. Za stariju porudžbinu, kupovinu u radnji
              ili porudžbinu bez naloga pošaljite reklamaciju ovde. Odgovornost za nesaobraznost traje dve godine.
            </p>
            <FormaGost kupac={{ ime: korisnik.firstName, prezime: korisnik.lastName, email: korisnik.email, telefon: korisnik.phone ?? "" }} />
          </>
        )}
      </div>
      {reklamacije && reklamacije.length > 0 && (
        <div className={KARTICA}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="kicker">Vaše reklamacije</p>
            <Link href="/moj-nalog/reklamacije/" className="link-arrow">
              Sve u nalogu <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-subtle">
            {reklamacije.slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link href={`/moj-nalog/reklamacije/${r.id}/`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-brand-active">
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{r.subject}</span>
                    <span className="block text-[13px] text-secondary">
                      {r.order ? `#${r.order.orderNumber}, ` : ""}
                      {datum(r.createdAt)}
                    </span>
                  </span>
                  <ReklamacijaPilula status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default async function ReklamacijaPage() {
  const s = await getSajt();

  const POSTUPAK = [
    { Icon: ClipboardCheck, naslov: "Prijavljujete", tekst: "Preko sajta, e-mailom, telefonom ili u radnji, uz broj porudžbine ili račun i fotografije." },
    { Icon: MailCheck, naslov: "Potvrđujemo prijem", tekst: "Bez odlaganja, sa brojem pod kojim je reklamacija zavedena." },
    { Icon: MessageSquareReply, naslov: "Odgovaramo", tekst: "Najkasnije u roku od osam dana: da li prihvatamo reklamaciju i kako je rešavamo." },
    { Icon: CircleCheck, naslov: "Rešavamo", tekst: "Popravkom, zamenom, umanjenjem cene ili povraćajem novca, u zakonskom roku." },
  ];

  const pitanja = [
    {
      q: "Koliko imam vremena da reklamiram proizvod?",
      a: `Za nesaobraznost robe odgovaramo dve godine od dana kada ste je primili. Preko naloga na sajtu reklamaciju podnosite u roku od ${REKLAMACIJA_ROK_DANA} dana od porudžbine, a posle toga preko forme na ovoj strani, e-mailom, telefonom ili u radnji.`,
    },
    {
      q: "Da li odmah da pošaljem proizvod?",
      a: "Ne. Prvo prijavite reklamaciju sa fotografijama. Javljamo vam se i dogovaramo kako se proizvod šalje ili donosi. Kada je reklamacija opravdana, trošak slanja snosimo mi.",
    },
    {
      q: "Stigla je pogrešna veličina. Da li je to reklamacija?",
      a: "Ako je stigla veličina ili model koji niste poručili, da: to je reklamacija i trošak zamene snosimo mi. Ako ste sami poručili veličinu koja ne odgovara, to je odustanak od kupovine ili zamena po dogovoru.",
    },
    {
      q: "Paket je stigao oštećen. Šta da radim?",
      a: `Ako je ambalaža vidno oštećena, recite to kuriru pri preuzimanju ili odbijte prijem, i javite nam se istog dana na ${s.phone}. Fotografišite paket i proizvod pre raspakivanja, ako je moguće.`,
    },
    {
      q: "Šta ako je reklamacija odbijena?",
      a: "U odgovoru navodimo razlog. Ako se ne slažete, možete pokrenuti vansudsko rešavanje potrošačkog spora ili sudski postupak, kako je opisano u Uslovima korišćenja.",
    },
    {
      q: "Mogu li da reklamiram opremu kupljenu u radnji?",
      a: "Možete. Donesite proizvod i račun u radnju ili pošaljite reklamaciju preko forme na ovoj strani, uz broj računa umesto broja porudžbine.",
    },
  ];

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/reklamacija-proizvoda/#strana`,
        url: `${SITE_URL}/reklamacija-proizvoda/`,
        name: "Reklamacija proizvoda - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      faqLd(pitanja),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Reklamacija proizvoda", item: `${SITE_URL}/reklamacija-proizvoda/` },
        ],
      },
    ],
  };

  return (
    <main>
      <UvodUslova naziv="Reklamacija proizvoda" naslov={<>Nešto nije u redu sa opremom? <span className="text-brand">Rešavamo.</span></>} opis={OPIS}>
        <UkratkoUslova
          stavke={[
            { Icon: ShieldCheck, vrednost: "2 godine", opis: "odgovornost za nesaobraznost" },
            { Icon: CalendarClock, vrednost: "8 dana", opis: "najkasnije za odgovor na reklamaciju" },
            { Icon: TruckIcon, vrednost: "O našem trošku", opis: "slanje kad je reklamacija opravdana" },
            { Icon: Camera, vrednost: "Online", opis: "sa fotografijama, i bez naloga" },
          ]}
        />
      </UvodUslova>

      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o reklamaciji" }}>
        <Odeljak id="prijava" broj="01" oznaka="Prijava reklamacije" naslov="Prijavite reklamaciju." uvod="Najbrže ide uz fotografije proizvoda i oštećenja. Proizvod nam ne šaljite dok se ne javimo.">
          <Suspense fallback={<KosturPrijave />}>
            <Prijava s={s} />
          </Suspense>
        </Odeljak>

        <Odeljak id="postupak" broj="02" oznaka="Postupak i rokovi" naslov="Šta se dešava posle prijave.">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {POSTUPAK.map(({ Icon, naslov, tekst }, i) => (
              <li key={naslov} className="rounded-[6px] bg-surface p-6 ring-1 ring-subtle">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-full ${i === POSTUPAK.length - 1 ? "bg-success text-white" : "bg-primary text-brand"}`}>
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
          <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-subtle ring-1 ring-subtle md:grid-cols-4">
            {[
              { Icon: Hammer, naziv: "Popravka" },
              { Icon: RefreshCw, naziv: "Zamena" },
              { Icon: Scale, naziv: "Umanjenje cene" },
              { Icon: PackageCheck, naziv: "Povraćaj novca" },
            ].map(({ Icon, naziv }) => (
              <div key={naziv} className="flex items-center gap-3 bg-page px-5 py-4 text-[15px] font-medium">
                <Icon className="size-5 text-brand-active" strokeWidth={1.7} /> {naziv}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-[22px] text-secondary">
            Birate između popravke i zamene, a umanjenje cene ili povraćaj novca moguć je u slučajevima koje propisuje Zakon o zaštiti potrošača. Kad se reklamacija
            rešava povraćajem novca, važi postupak sa strane{" "}
            <Link href="/povracaj-novca/" className="font-medium text-primary underline underline-offset-2">
              Povraćaj novca i robe
            </Link>
            .
          </p>
        </Odeljak>

        <Odeljak id="pokriva" broj="03" oznaka="Šta pokriva" naslov="Kada je reklamacija opravdana." uvod="Odgovaramo za nedostatke koje je proizvod imao pri isporuci, a koji se pokažu u roku od dve godine. Habanje od upotrebe nije nedostatak.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className={KARTICA}>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-success">
                <CircleCheck className="size-5" strokeWidth={2} /> Reklamacija je opravdana
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-[23px] text-secondary">
                <li>Fabrička greška: popucao šav, odlepljen đon, neispravan rajsferšlus ili kopča</li>
                <li>Stigla je druga veličina, model ili boja od poručene</li>
                <li>Proizvod je oštećen u transportu, a prijavili ste odmah po prijemu</li>
                <li>Proizvod nema svojstva iz opisa ili sa deklaracije (npr. klasa zaštite)</li>
              </ul>
            </div>
            <div className={KARTICA}>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-sale">
                <CircleX className="size-5" strokeWidth={2} /> Reklamacija nije opravdana
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-[23px] text-secondary">
                <li>Uobičajeno habanje: istrošen đon, izbledela boja od pranja i sunca</li>
                <li>Upotreba suprotna nameni ili uputstvu (npr. obuća bez vodootpornosti u vodi)</li>
                <li>Oštećenje od nepravilnog pranja, sušenja ili održavanja</li>
                <li>Mehaničko oštećenje nastalo u radu, posle isporuke, i prepravke proizvoda</li>
              </ul>
            </div>
          </div>
        </Odeljak>

        <Odeljak id="pravila" broj="04" oznaka="Pravila" naslov="Šta treba da znate.">
          <Pravila>
            <Pravilo naziv="Rok">Dve godine od prijema robe. Preko naloga na sajtu, do {REKLAMACIJA_ROK_DANA} dana od porudžbine, jedna reklamacija po porudžbini.</Pravilo>
            <Pravilo naziv="Šta priložiti">Broj porudžbine ili račun, opis problema i fotografije proizvoda, oštećenja i deklaracije.</Pravilo>
            <Pravilo naziv="Slanje proizvoda">Posle našeg odgovora. Kad je reklamacija opravdana, trošak slanja snosimo mi. Proizvod treba da bude čist.</Pravilo>
            <Pravilo naziv="Odgovor i rešavanje">Prijem potvrđujemo bez odlaganja, odgovaramo najkasnije u roku od osam dana, a reklamaciju rešavamo u roku propisanom zakonom.</Pravilo>
            <Pravilo naziv="Garancija proizvođača">Za proizvode sa garancijom proizvođača prava možete ostvariti i po osnovu garancije, uz garantni list.</Pravilo>
            <Pravilo naziv="Odustanak">
              Ako je proizvod ispravan, ali vam ne odgovara, to nije reklamacija nego{" "}
              <Link href="/pravo-na-odustajanje/" className="font-medium text-primary underline underline-offset-2">
                odustanak od kupovine
              </Link>
              .
            </Pravilo>
          </Pravila>
        </Odeljak>

        <Odeljak id="pitanja" broj="05" oznaka="Česta pitanja" naslov="Pitanja o reklamaciji.">
          <Pitanja pitanja={pitanja} />
          <p className="mt-8 text-[14px] leading-[22px] text-secondary">
            Reklamacije su uređene i{" "}
            <Link href="/uslovi-koriscenja/#reklamacije" className="font-medium text-primary underline underline-offset-2">
              Uslovima korišćenja
            </Link>
            .
          </p>
        </Odeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
