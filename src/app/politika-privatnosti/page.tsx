import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, Download, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { OkvirUslova, PdfZaglavlje, PravniOdeljak, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import { contact } from "@/data/site";
import { PRIVATNOST_DONETO, PRIVATNOST_NA_SNAZI, PRIVATNOST_PDF } from "@/lib/dokumenti";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Politika privatnosti (footer „Pravno", registracija, naplata, Uslovi korišćenja čl. 5 i 28). Osnova je pravilnik sa
  klikdogume.rs/politika-privatnosti, prilagođen onome što HTZ sajt stvarno radi:
  - kolačići su samo neophodni: htz_korpa (30 dana), htz_sesija i htz_prijavljen (7 dana); nema Google Analytics-a ni Meta
    piksela (polja u Admin → Marketing su prazna i sajt ih ne učitava). Ako se uvedu, ovde dodati odeljak i traku za pristanak;
  - podaci: porudžbina, nalog i adrese, reklamacije i odustanak, kontakt i upit za ponudu (sa prilozima), newsletter
    (odjava linkom u svakom e-mailu), IP adresa za ograničenje slanja formulara;
  - primaoci: kurirske službe, banka (IPS), knjigovodstvo, hosting (United Internet / unlimited.rs; server baze je u Beogradu,
    proveren whois-om IP adrese) i e-mail servis (SMTP iz admina, naziv nepoznat).
  PDF je štampa ove strane (docs/obrasci/uslovi-pdf.mjs).
*/

const OPIS =
  "Politika privatnosti HTZ Shop-a: koje podatke o ličnosti prikupljamo pri kupovini i korišćenju sajta, zašto i koliko dugo ih čuvamo, kome ih prosleđujemo, koje kolačiće koristimo i kako ostvarujete svoja prava.";

export const metadata: Metadata = {
  title: "Politika privatnosti i zaštita podataka o ličnosti - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/politika-privatnosti/` },
  openGraph: { title: "Politika privatnosti - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "opste", naziv: "Opšte odredbe" },
  { id: "rukovalac", naziv: "Rukovalac podacima" },
  { id: "obrada", naziv: "Podaci, svrha i osnov" },
  { id: "kolacici", naziv: "Kolačići" },
  { id: "primaoci", naziv: "Primaoci podataka" },
  { id: "cuvanje", naziv: "Rok čuvanja" },
  { id: "prava", naziv: "Vaša prava" },
  { id: "bezbednost", naziv: "Bezbednost" },
  { id: "zavrsne", naziv: "Završne odredbe" },
];

/** podatak, svrha, pravni osnov */
const OBRADA: [string, string, string][] = [
  [
    "Ime i prezime, telefon, e-mail, adresa isporuke, napomena uz porudžbinu",
    "Prijem i isporuka porudžbine, obaveštenja o statusu porudžbine i pošiljke, izdavanje računa",
    "Izvršenje ugovora i zakonska obaveza (računi i evidencije)",
  ],
  ["Naziv firme i PIB", "Porudžbina i račun na firmu, ponuda za firmu", "Izvršenje ugovora i zakonska obaveza"],
  [
    "Podaci naloga: ime, e-mail, telefon, lozinka (čuva se šifrovana), sačuvane adrese, istorija porudžbina",
    "Prijava na nalog, brže poručivanje, pregled porudžbina, praćenje pošiljke i reklamacije",
    "Izvršenje ugovora (otvaranjem naloga)",
  ],
  [
    "Podaci iz reklamacije i izjave o odustanku: opis, fotografije, broj porudžbine, tekući račun za povraćaj novca",
    "Rešavanje reklamacije, odustanak od ugovora i povraćaj novca",
    "Zakonska obaveza (Zakon o zaštiti potrošača)",
  ],
  [
    "Podaci iz kontakt forme i upita za ponudu: ime, e-mail, telefon, firma, poruka i priloženi fajlovi (npr. logo za brendiranje)",
    "Odgovor na pitanje, priprema ponude i brendiranja",
    "Radnje pre zaključenja ugovora, na vaš zahtev; legitimni interes",
  ],
  ["E-mail adresa za newsletter", "Slanje obaveštenja o ponudi i akcijama", "Pristanak, koji možete opozvati linkom „Odjavi se“ u svakom e-mailu"],
  ["E-mail adresa kupca", "Jedan e-mail posle isporuke sa molbom za ocenu kupljene opreme", "Legitimni interes; možete se usprotiviti odgovorom na taj e-mail"],
  ["IP adresa i tehnički podaci zahteva", "Zaštita sajta od zloupotrebe i ograničenje broja slanja formulara", "Legitimni interes"],
];

/** naziv, svrha, trajanje */
const KOLACICI: [string, string, string][] = [
  ["htz_korpa", "Pamti artikle i količine u korpi kupca bez naloga", "30 dana"],
  ["htz_sesija", "Prijava na nalog (šifrovani token, nedostupan skriptama na stranici)", "7 dana ili do odjave"],
  ["htz_prijavljen", "Prikaz inicijala prijavljenog kupca u zaglavlju sajta", "7 dana ili do odjave"],
];

const PREGLEDACI: [string, string][] = [
  ["Google Chrome", "https://support.google.com/chrome/answer/95647"],
  ["Mozilla Firefox", "https://support.mozilla.org/kb/clear-cookies-and-site-data-firefox"],
  ["Safari", "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"],
  ["Microsoft Edge", "https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"],
];

export default async function PolitikaPrivatnostiPage() {
  const s = await getSajt();
  const mail = <a href={`mailto:${s.email}`}>{s.email}</a>;

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/politika-privatnosti/#strana`,
        url: `${SITE_URL}/politika-privatnosti/`,
        name: "Politika privatnosti - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        datePublished: "2026-10-27",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
        publisher: { "@id": `${SITE_URL}/#firma` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Politika privatnosti", item: `${SITE_URL}/politika-privatnosti/` },
        ],
      },
    ],
  };

  return (
    <main>
      <div className="print:hidden">
        <UvodUslova naziv="Politika privatnosti" naslov={<>Vaši podaci služe samo <span className="text-brand">za vašu porudžbinu.</span></>} opis={OPIS}>
          <UkratkoUslova
            stavke={[
              { Icon: UserCheck, vrednost: "Samo potrebno", opis: "podaci za porudžbinu, nalog i upite" },
              { Icon: Cookie, vrednost: "3 kolačića", opis: "samo neophodni, bez praćenja i reklama" },
              { Icon: Lock, vrednost: "Ne prodajemo", opis: "podatke ne ustupamo radi reklamiranja" },
              { Icon: ShieldCheck, vrednost: "Vaša prava", opis: "uvid, ispravka, brisanje, prigovor" },
            ]}
          />
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[13px] text-white/50">
              Doneto {PRIVATNOST_DONETO} Na snazi od {PRIVATNOST_NA_SNAZI}
            </p>
            <a href={PRIVATNOST_PDF} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[14px] font-medium text-brand hover:underline">
              <Download className="size-4" strokeWidth={1.8} /> Preuzmite PDF
            </a>
          </div>
        </UvodUslova>
      </div>

      <PdfZaglavlje naslov="Politika privatnosti i zaštita podataka o ličnosti" s={s} doneto={PRIVATNOST_DONETO} naSnazi={PRIVATNOST_NA_SNAZI} putanja="/politika-privatnosti" />

      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o podacima" }} gusto>
        <PravniOdeljak id="opste" broj={1} naslov="Opšte odredbe">
          <h3>Član 1</h3>
          <p>
            Ovom politikom privatnosti (u daljem tekstu: Politika), u skladu sa Zakonom o zaštiti podataka o ličnosti, {contact.legalName} (u daljem tekstu:
            Rukovalac) obaveštava korisnike sajta htzshop.rs i kupce (u daljem tekstu: vi) o tome koje podatke o ličnosti prikuplja, u koje svrhe, na kom pravnom
            osnovu, kome ih prosleđuje, koliko ih čuva i koja prava imate.
          </p>
          <p>
            Politika je sastavni deo <Link href="/uslovi-koriscenja/">Uslova korišćenja</Link>. Primenjuje se na podatke prikupljene preko sajta, e-mailom, telefonom i
            u radnji.
          </p>
          <h3>Član 2</h3>
          <p>
            Prikupljamo samo podatke koji su potrebni za određenu svrhu i ne koristimo ih u svrhe koje nisu navedene u ovoj Politici. Ako se pojavi potreba za obradom
            u drugu svrhu, pre toga ćemo vas obavestiti o toj svrsi i, kada je potrebno, tražiti vaš pristanak.
          </p>
          <p>
            Ne prikupljamo posebne vrste podataka o ličnosti (npr. podatke o zdravlju, verskom ili političkom uverenju) i molimo vas da nam ih ne šaljete. Ne
            prikupljamo namerno podatke maloletnih lica. Ako saznate da nam je maloletno lice dostavilo podatke, javite nam se da ih obrišemo.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="rukovalac" broj={2} naslov="Rukovalac podacima">
          <h3>Član 3</h3>
          <p>Rukovalac vašim podacima je:</p>
          <p>
            <b>{contact.legalName}</b>
            <br />
            {s.street}, {s.city}, Republika Srbija
            <br />
            Matični broj: {s.mb}, PIB: {s.pib}
            <br />
            Telefon: <a href={s.phoneHref}>{s.phone}</a>, e-mail: {mail}
          </p>
          <p>Zahteve u vezi sa vašim podacima možete poslati na navedeni e-mail, poštom na navedenu adresu ili predati lično u radnji, u radno vreme.</p>
        </PravniOdeljak>

        <PravniOdeljak id="obrada" broj={3} naslov="Podaci koje obrađujemo, svrha i pravni osnov">
          <h3>Član 4</h3>
          <p>
            Podatke prikupljamo direktno od vas: kada poručujete, otvarate nalog, podnosite reklamaciju, popunjavate kontakt formu, prijavljujete se na newsletter ili
            nam se obraćate telefonom i e-mailom. Deo tehničkih podataka (IP adresa, kolačići) nastaje automatski pri korišćenju sajta.
          </p>
          <div className="!mt-5 overflow-hidden rounded-[6px] ring-1 ring-subtle print:rounded-none">
            <div className="hidden grid-cols-[1.2fr_1fr_0.9fr] gap-4 bg-page px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-primary md:grid print:grid">
              <span>Podatak</span>
              <span>Svrha</span>
              <span>Pravni osnov</span>
            </div>
            {OBRADA.map(([podatak, svrha, osnov]) => (
              <div key={podatak} className="grid gap-1.5 border-t border-subtle bg-surface px-5 py-4 first:border-t-0 md:grid-cols-[1.2fr_1fr_0.9fr] md:gap-4 md:first:border-t print:grid-cols-[1.2fr_1fr_0.9fr] print:gap-4 print:break-inside-avoid">
                <span className="font-medium text-primary">{podatak}</span>
                <span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary md:hidden print:hidden">Svrha: </span>
                  {svrha}
                </span>
                <span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary md:hidden print:hidden">Osnov: </span>
                  {osnov}
                </span>
              </div>
            ))}
          </div>
          <h3>Član 5</h3>
          <p>
            Podatke o platnim karticama ne prikupljamo, jer plaćanje karticom na sajtu nije omogućeno. Kod plaćanja IPS QR kodom ili uplatom na račun, podatke o računu
            sa kog plaćate obrađuje vaša banka, a mi vidimo samo podatke o uplati koje banka dostavlja primaocu.
          </p>
          <p>
            Davanje podataka je dobrovoljno. Bez podataka potrebnih za porudžbinu (ime, telefon, e-mail, adresa isporuke) porudžbinu ne možemo da primimo i isporučimo,
            a bez podataka iz reklamacije ne možemo da je rešimo.
          </p>
          <p>Ne vršimo automatizovano donošenje odluka niti profilisanje koje bi proizvodilo pravne posledice po vas.</p>
        </PravniOdeljak>

        <PravniOdeljak id="kolacici" broj={4} naslov="Kolačići">
          <h3>Član 6</h3>
          <p>
            Kolačići su male tekstualne datoteke koje sajt čuva u vašem pregledaču. Sajt koristi samo neophodne kolačiće, bez kojih korpa i prijava na nalog ne bi
            radili. Za njih nije potreban pristanak. Ne koristimo kolačiće za analitiku, praćenje ni reklame, niti kolačiće trećih strana.
          </p>
          <div className="!mt-5 overflow-hidden rounded-[6px] ring-1 ring-subtle print:rounded-none">
            {KOLACICI.map(([naziv, svrha, trajanje]) => (
              <div key={naziv} className="grid gap-1 border-t border-subtle bg-surface px-5 py-4 first:border-t-0 sm:grid-cols-[150px_1fr_auto] sm:gap-4 print:grid-cols-[150px_1fr_auto] print:gap-4">
                <code className="font-mono text-[13px] font-semibold text-primary">{naziv}</code>
                <span>{svrha}</span>
                <span className="text-[13px] sm:text-right">{trajanje}</span>
              </div>
            ))}
          </div>
          <p>
            Kolačiće možete obrisati ili blokirati u podešavanjima pregledača, ali tada korpa i prijava neće raditi. Uputstva:{" "}
            {PREGLEDACI.map(([naziv, url], i) => (
              <span key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {naziv}
                </a>
                {i < PREGLEDACI.length - 2 ? ", " : i === PREGLEDACI.length - 2 ? " i " : "."}
              </span>
            ))}
          </p>
          <p>Ako sajt počne da koristi i druge kolačiće (npr. za merenje posećenosti), pre toga ćemo ih navesti u ovoj Politici i tražiti vaš pristanak.</p>
        </PravniOdeljak>

        <PravniOdeljak id="primaoci" broj={5} naslov="Primaoci podataka">
          <h3>Član 7</h3>
          <p>Vaše podatke ne prodajemo i ne ustupamo trećim licima radi reklamiranja. Podatke prosleđujemo samo u meri potrebnoj za određenu svrhu:</p>
          <ul>
            <li>kurirskim službama (npr. BEX, Post Express): ime, adresu, telefon i iznos za naplatu pouzećem, radi isporuke pošiljke;</li>
            <li>bankama i platnim institucijama, radi izvršenja i evidentiranja uplata i povraćaja novca;</li>
            <li>knjigovodstvenoj agenciji, radi vođenja poslovnih knjiga i poreskih obaveza;</li>
            <li>
              pružaocu usluge hostinga, na čijim serverima se nalaze sajt i baza podataka: UNITED INTERNET DOO, Milutina Milankovića 1c, 11073 Beograd (unlimited.rs);
            </li>
            <li>pružaocima usluga slanja e-mailova i održavanja sajta;</li>
            <li>nadležnim državnim organima, kada je to propisano zakonom.</li>
          </ul>
          <p>Pružaoci usluga podatke obrađuju samo po našem nalogu i ne smeju ih koristiti za svoje potrebe.</p>
          <p>
            Podatke obrađujemo i čuvamo u Republici Srbiji, na serverima pružaoca usluge hostinga u Beogradu. Ako bi neki pružalac usluga obrađivao podatke van Srbije,
            to ćemo učiniti samo uz mere zaštite propisane Zakonom o zaštiti podataka o ličnosti.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="cuvanje" broj={6} naslov="Rok čuvanja">
          <h3>Član 8</h3>
          <p>Podatke čuvamo samo dok je potrebno za svrhu za koju su prikupljeni, a zatim ih brišemo:</p>
          <ul>
            <li>podatke o porudžbinama i računima, u rokovima propisanim propisima o računovodstvu i porezima;</li>
            <li>evidenciju reklamacija, najmanje dve godine od podnošenja reklamacije, kako propisuje Zakon o zaštiti potrošača;</li>
            <li>podatke naloga, dok nalog postoji; nalog možete ugasiti zahtevom na {mail}, posle čega brišemo podatke koje nismo dužni da čuvamo po zakonu;</li>
            <li>e-mail za newsletter, do odjave;</li>
            <li>poruke iz kontakt forme i upite za ponudu, dok je potrebno za odgovor i dalju saradnju povodom upita;</li>
            <li>kolačiće, najduže koliko je navedeno u odeljku 4.</li>
          </ul>
        </PravniOdeljak>

        <PravniOdeljak id="prava" broj={7} naslov="Vaša prava">
          <h3>Član 9</h3>
          <p>U vezi sa obradom svojih podataka imate pravo:</p>
          <ul>
            <li>
              <b>na pristup</b>: da saznate da li obrađujemo vaše podatke i da dobijete njihovu kopiju;
            </li>
            <li>
              <b>na ispravku i dopunu</b>: netačne podatke ispravljamo bez odlaganja. Podatke naloga i adrese možete sami izmeniti u odeljku{" "}
              <Link href="/moj-nalog/podaci/">Moj nalog</Link>;
            </li>
            <li>
              <b>na brisanje</b>: kada podaci više nisu potrebni, kada opozovete pristanak ili podnesete prigovor, osim podataka koje smo dužni da čuvamo po zakonu;
            </li>
            <li>
              <b>na ograničenje obrade</b>: npr. dok proveravamo tačnost podataka koju osporavate;
            </li>
            <li>
              <b>na prigovor</b>: na obradu zasnovanu na legitimnom interesu, uključujući slanje e-maila sa molbom za ocenu;
            </li>
            <li>
              <b>na prenosivost</b>: da podatke koje ste nam dali dobijete u uobičajenom elektronskom obliku;
            </li>
            <li>
              <b>na opoziv pristanka</b>: u svakom trenutku, bez uticaja na zakonitost obrade pre opoziva (npr. odjava sa newslettera).
            </li>
          </ul>
          <p>
            Zahtev pošaljite na {mail} ili poštom na adresu Rukovaoca. Odgovaramo bez odlaganja, a najkasnije u roku od 30 dana od prijema zahteva. Radi zaštite vaših
            podataka možemo zatražiti potvrdu identiteta (npr. slanje zahteva sa e-mail adrese iz porudžbine).
          </p>
          <h3>Član 10</h3>
          <p>
            Ako smatrate da obrada vaših podataka nije zakonita, imate pravo da podnesete pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o
            ličnosti, Bulevar kralja Aleksandra 15, 11120 Beograd,{" "}
            <a href="https://www.poverenik.rs" target="_blank" rel="noopener noreferrer">
              www.poverenik.rs
            </a>
            .
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="bezbednost" broj={8} naslov="Bezbednost podataka">
          <h3>Član 11</h3>
          <p>
            Primenjujemo tehničke i organizacione mere zaštite: sajt radi preko šifrovane veze (HTTPS), lozinke se čuvaju isključivo u šifrovanom obliku, pristup
            podacima imaju samo lica kojima je potreban za posao, a kolačić za prijavu nije dostupan skriptama na stranici.
          </p>
          <p>
            Nijedan sistem nije potpuno otporan na napade. U slučaju povrede podataka o ličnosti preduzimamo mere za otklanjanje posledica i o tome obaveštavamo
            Poverenika i vas, kada to propisuje zakon. Čuvajte svoju lozinku i ne delite je sa drugima.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="zavrsne" broj={9} naslov="Završne odredbe">
          <h3>Član 12</h3>
          <p>
            Politiku možemo menjati u skladu sa promenama propisa i načina poslovanja. Izmenjena Politika objavljuje se na ovoj strani sa datumom početka primene, a
            o bitnim izmenama korisnike sa nalogom obaveštavamo e-mailom.
          </p>
          <h3>Član 13</h3>
          <p>Ova Politika primenjuje se od dana objavljivanja na sajtu.</p>
          <p>
            U Svilajncu, doneto {PRIVATNOST_DONETO} Na snazi od {PRIVATNOST_NA_SNAZI}
            <br />
            {contact.legalName}
          </p>
        </PravniOdeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
