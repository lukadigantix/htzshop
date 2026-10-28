import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CalendarDays, Download, FileText, ShieldCheck } from "lucide-react";
import { OkvirUslova, PdfZaglavlje, PravniOdeljak, UkratkoUslova, UvodUslova } from "@/components/info/Uslovi";
import { contact } from "@/data/site";
import { USLOVI_DONETO, USLOVI_NA_SNAZI, USLOVI_PDF } from "@/lib/dokumenti";
import { REKLAMACIJA_ROK_DANA } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Uslovi korišćenja (footer „Pravno", registracija, naplata uz „prihvatam uslove"). Zamenjuju stranu „Izjava o odricanju od
  odgovornosti": deo o odgovornosti je odeljak 10. Osnova je tekst klikdogume.rs/uslovi-koriscenja, prilagođen HTZ Shop-u:
  prodavac je preduzetnik (poslovno ime iz APR-a u data/site.ts), nema plaćanja karticom ni magacina dobavljača, roba se vraća
  u radnju u Svilajncu, izuzeci od odustanka su brendirana odeća i higijenska oprema. Rokovi i postupci isti su kao na
  stranama Plaćanje i isporuka i Pravo na odustajanje; pri izmeni jedne proveriti i ostale.
  Članovi zakona se ne navode brojem (zakoni se menjaju), samo naziv zakona.
*/

const OPIS = "Uslovi korišćenja internet prodavnice HTZ Shop: ko je prodavac, kako se zaključuje ugovor, cene, plaćanje, isporuka, odustanak od ugovora, reklamacije, odgovornost i rešavanje sporova.";

export const metadata: Metadata = {
  title: "Uslovi korišćenja internet prodavnice - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/uslovi-koriscenja/` },
  openGraph: { title: "Uslovi korišćenja - HTZ Shop", description: OPIS },
};

const ODELJCI = [
  { id: "osnovne", naziv: "Osnovne odredbe" },
  { id: "korisnik", naziv: "Korisnik i nalog" },
  { id: "obavestenja", naziv: "Obaveštenja pre ugovora" },
  { id: "porucivanje", naziv: "Poručivanje i ugovor" },
  { id: "cene", naziv: "Cene" },
  { id: "placanje", naziv: "Plaćanje" },
  { id: "isporuka", naziv: "Isporuka" },
  { id: "odustanak", naziv: "Odustanak od ugovora" },
  { id: "reklamacije", naziv: "Reklamacije" },
  { id: "odgovornost", naziv: "Proizvodi i odgovornost" },
  { id: "podaci", naziv: "Podaci o ličnosti" },
  { id: "autorska", naziv: "Autorska prava" },
  { id: "suspenzija", naziv: "Suspenzija i prestanak" },
  { id: "sporovi", naziv: "Rešavanje sporova" },
  { id: "zavrsne", naziv: "Završne odredbe" },
];

export default async function UsloviKoriscenjaPage() {
  const s = await getSajt();
  const prodavac = `${contact.legalName}, ${s.street}, ${s.city}, Republika Srbija, matični broj: ${s.mb}, PIB: ${s.pib}`;
  const mail = <a href={`mailto:${s.email}`}>{s.email}</a>;
  const tel = <a href={s.phoneHref}>{s.phone}</a>;

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/uslovi-koriscenja/#strana`,
        url: `${SITE_URL}/uslovi-koriscenja/`,
        name: "Uslovi korišćenja - HTZ Shop",
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
          { "@type": "ListItem", position: 2, name: "Uslovi korišćenja", item: `${SITE_URL}/uslovi-koriscenja/` },
        ],
      },
    ],
  };

  return (
    <main>
      <div className="print:hidden">
        <UvodUslova
          naziv="Uslovi korišćenja"
          naslov={
            <>
              Uslovi korišćenja <span className="text-brand">internet prodavnice.</span>
            </>
          }
          opis={OPIS}
        >
          <UkratkoUslova
            stavke={[
              { Icon: FileText, vrednost: "Prodavac", opis: "Tanja Marjanović PR, HTZ Shop Svilajnac" },
              { Icon: Banknote, vrednost: "Cene sa PDV-om", opis: "u dinarima, kako piše na sajtu" },
              { Icon: CalendarDays, vrednost: "14 dana", opis: "za odustanak od kupovine na daljinu" },
              { Icon: ShieldCheck, vrednost: "2 godine", opis: "odgovornost za nesaobraznost robe" },
            ]}
          />
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[13px] text-white/50">
              Doneto {USLOVI_DONETO} Na snazi od {USLOVI_NA_SNAZI}
            </p>
            <a href={USLOVI_PDF} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[14px] font-medium text-brand hover:underline">
              <Download className="size-4" strokeWidth={1.8} /> Preuzmite PDF
            </a>
          </div>
        </UvodUslova>
      </div>

      <PdfZaglavlje naslov="Uslovi korišćenja internet prodavnice HTZ Shop" s={s} doneto={USLOVI_DONETO} naSnazi={USLOVI_NA_SNAZI} putanja="/uslovi-koriscenja" />

      <OkvirUslova odeljci={ODELJCI} telefon={{ label: s.phone, href: s.phoneHref, natpis: "Pitanje o uslovima" }} gusto>
        <PravniOdeljak id="osnovne" broj={1} naslov="Osnovne odredbe">
          <h3>Član 1</h3>
          <p>
            Ovim uslovima korišćenja (u daljem tekstu: Uslovi) utvrđuju se uslovi pod kojima {prodavac} (u daljem tekstu: Prodavac) prodaje robu i pruža usluge preko sopstvene internet prodavnice na
            adresi htzshop.rs (u daljem tekstu: sajt), kao i međusobna prava i obaveze Prodavca i korisnika sajta (u daljem tekstu: Korisnik).
          </p>
          <p>Uslovi su obavezujući za Prodavca i svakog Korisnika i primenjuju se na sve njihove ugovorne odnose, osim ako posebnim ugovorom nije drugačije ugovoreno.</p>
          <h3>Član 2</h3>
          <p>
            Prodaja se obavlja u skladu sa Zakonom o trgovini, Zakonom o elektronskoj trgovini, Zakonom o zaštiti potrošača, Zakonom o zaštiti podataka o ličnosti, Zakonom o obligacionim odnosima i
            drugim propisima Republike Srbije.
          </p>
          <p>
            Preko sajta Prodavac obavlja trgovinu na malo, a firmama i preduzetnicima i trgovinu na veliko. Na kupovinu fizičkih lica koja robu kupuju za ličnu upotrebu (u daljem tekstu: potrošač)
            primenjuju se i odredbe Zakona o zaštiti potrošača.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="korisnik" broj={2} naslov="Korisnik i nalog">
          <h3>Član 3</h3>
          <p>Korisnik može biti svako poslovno sposobno fizičko lice, preduzetnik ili pravno lice.</p>
          <p>Korisnikom se postaje pristupom sajtu. Pristupom sajtu i slanjem porudžbine Korisnik potvrđuje da je upoznat sa ovim Uslovima i da je sa njima saglasan.</p>
          <h3>Član 4</h3>
          <p>
            Porudžbina se može poslati bez otvaranja naloga. Korisnik koji želi može otvoriti nalog na sajtu, popunjavanjem formulara za registraciju. Otvaranjem naloga Korisnik potvrđuje da je
            upoznat sa ovim Uslovima i da je sa njima saglasan.
          </p>
          <p>
            Korisnik je dužan da pri porudžbini i registraciji navede tačne podatke i da ih u nalogu ažurira kada se promene. Korisnik je odgovoran za čuvanje svoje lozinke i za sve radnje izvršene
            preko svog naloga.
          </p>
          <h3>Član 5</h3>
          <p>
            Korisnik navodi samo podatke koji su neophodni za izvršenje porudžbine. Prodavac podatke prikuplja i koristi u skladu sa <Link href="/politika-privatnosti/">Politikom privatnosti</Link>,
            koja je sastavni deo ovih Uslova.
          </p>
          <p>Pravo na korišćenje naloga ne može se preneti na treće lice bez saglasnosti Prodavca.</p>
        </PravniOdeljak>

        <PravniOdeljak id="obavestenja" broj={3} naslov="Obaveštenja pre zaključenja ugovora na daljinu">
          <h3>Član 6</h3>
          <p>Prodavac, u skladu sa Zakonom o zaštiti potrošača, pre zaključenja ugovora na daljinu obaveštava potrošača:</p>
          <ol>
            <li>o osnovnim obeležjima robe, na strani svakog proizvoda;</li>
            <li>
              o poslovnom imenu, matičnom broju, adresi sedišta i kontakt podacima, u članu 1 ovih Uslova i na strani <Link href="/kontakt/">Kontakt</Link>;
            </li>
            <li>
              o prodajnoj ceni i troškovima dostave, na strani proizvoda i u koraku „Podaci i isporuka“, pre potvrde porudžbine, kao i na strani{" "}
              <Link href="/placanje-i-isporuka/">Plaćanje i isporuka</Link>;
            </li>
            <li>o načinu plaćanja, načinu i roku isporuke, u odeljcima 6 i 7 ovih Uslova;</li>
            <li>o zakonskoj odgovornosti za nesaobraznost robe i načinu izjavljivanja reklamacije, u odeljku 9 ovih Uslova;</li>
            <li>
              o uslovima, roku i postupku odustanka od ugovora, u odeljku 8 ovih Uslova i na strani <Link href="/pravo-na-odustajanje/">Pravo na odustajanje</Link>, gde su i obrasci za odustanak;
            </li>
            <li>o mogućnosti vansudskog rešavanja sporova, u odeljku 14 ovih Uslova.</li>
          </ol>
          <p>
            Adresa na kojoj Prodavac posluje je {s.street}, {s.city}. Reklamaciju i izjavu o odustanku potrošač može dostaviti na e-mail {mail}, poštom na navedenu adresu ili lično u radnji.
          </p>
          <p>
            Troškove komunikacije na daljinu (internet, telefon) ne naplaćuje Prodavac, već operater sa kojim je potrošač u ugovornom odnosu. Svi podaci iz ovih Uslova sastavni su deo ugovora
            zaključenog na daljinu.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="porucivanje" broj={4} naslov="Poručivanje i zaključenje ugovora">
          <h3>Član 7</h3>
          <p>
            Korisnik poručuje robu dodavanjem u korpu, upisivanjem podataka za isporuku, izborom načina isporuke i plaćanja i potvrdom porudžbine. Pre potvrde Korisnik vidi ukupan iznos sa troškom
            dostave i može da ispravi unete podatke. Postupak je opisan na strani <Link href="/kako-naruciti/">Kako naručiti</Link>.
          </p>
          <p>Po prijemu porudžbine Prodavac na ekranu i e-mailom potvrđuje prijem, sa brojem porudžbine i spiskom robe. Porudžbina se može poslati i telefonom ili e-mailom.</p>
          <h3>Član 8</h3>
          <p>Ugovor je zaključen:</p>
          <ul>
            <li>potvrdom porudžbine na sajtu, kada se roba plaća pouzećem ili pri ličnom preuzimanju;</li>
            <li>prijemom uplate, kada se roba plaća IPS QR kodom ili uplatom na račun.</li>
          </ul>
          <p>
            Zbog tehničkih ograničenja u praćenju zaliha u realnom vremenu, na sajtu može biti prikazan artikal koji trenutno nije na stanju. Ako poručeni artikal nije dostupan ili se njegova cena
            promenila, Prodavac obaveštava Korisnika pre slanja, a Korisnik odlučuje da li porudžbina ide dalje, sa izmenom ili bez tog artikla. Ako je Korisnik već platio, razlika ili ceo iznos vraća
            mu se u roku od 14 dana.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="cene" broj={5} naslov="Cene">
          <h3>Član 9</h3>
          <p>Prodavac samostalno utvrđuje cene i druge komercijalne uslove, u skladu sa svojom poslovnom politikom.</p>
          <p>Sve cene na sajtu iskazane su u dinarima (RSD), sa uračunatim PDV-om. Trošak dostave iskazuje se posebno, pre potvrde porudžbine.</p>
          <h3>Član 10</h3>
          <p>
            Prodavac zadržava pravo izmene cena i uslova prodaje. Za porudžbinu važi cena prikazana u trenutku potvrde porudžbine. Popust po kuponu ili akciji važi pod uslovima navedenim uz kupon,
            odnosno akciju.
          </p>
          <p>
            U slučaju očigledne greške u ceni (npr. pogrešno upisana cena), Prodavac obaveštava Korisnika pre slanja, a Korisnik može da prihvati ispravnu cenu ili da odustane od porudžbine bez
            ikakvih troškova.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="placanje" broj={6} naslov="Plaćanje">
          <h3>Član 11</h3>
          <p>Korisnik pri porudžbini bira jedan od načina plaćanja:</p>
          <ul>
            <li>
              <b>pouzećem</b>: gotovinom kurirskoj službi pri prijemu pošiljke, odnosno u radnji pri ličnom preuzimanju;
            </li>
            <li>
              <b>IPS QR kodom</b>: skeniranjem QR koda u aplikaciji banke, u roku navedenom u potvrdi porudžbine. Porudžbina za koju uplata ne stigne u tom roku automatski se otkazuje;
            </li>
            <li>
              <b>uplatom na račun</b>: prema podacima za uplatu iz potvrde porudžbine, sa brojem porudžbine kao pozivom na broj.
            </li>
          </ul>
          <p>Plaćanje platnim karticama preko sajta trenutno nije omogućeno. Izabrani način plaćanja ne može se menjati za već poslatu porudžbinu, osim u dogovoru sa Prodavcem.</p>
          <h3>Član 12</h3>
          <p>
            Račun sadrži poslovno ime i podatke Prodavca, podatke o prodatoj robi, prodajnu cenu, datum izdavanja i ukupan iznos za plaćanje sa iskazanim PDV-om i troškom dostave. Prodavac račun
            dostavlja e-mailom, a na zahtev Korisnika i u štampanom obliku, uz pošiljku ili poštom. Korisnik sa nalogom porudžbine i njihov status vidi i u odeljku{" "}
            <Link href="/moj-nalog/porudzbine/">Moj nalog</Link>.
          </p>
          <p>Na zahtev firme Prodavac izdaje predračun, e-mailom.</p>
          <h3>Član 13</h3>
          <p>
            Prodavac ne odgovara ako Korisnik ne primi potvrdu, predračun ili račun zbog greške u e-mail adresi, kvara na mreži Korisnika ili propusta poštanske službe. Korisnik je dužan da u tom
            slučaju obavesti Prodavca i zatraži ponovno slanje.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="isporuka" broj={7} naslov="Isporuka">
          <h3>Član 14</h3>
          <p>
            Prodavac isporučuje robu na adrese u Republici Srbiji, kurirskom službom koju Korisnik izabere pri porudžbini, ili Korisnik robu lično preuzima u radnji na adresi {s.street}, {s.city}, u
            radno vreme.
          </p>
          <p>
            Trošak dostave zavisi od ukupne težine pošiljke i izabrane kurirske službe i prikazuje se pre potvrde porudžbine. Artikli označeni kao „Besplatna dostava“ ne plaćaju dostavu. Lično
            preuzimanje je besplatno.
          </p>
          <h3>Član 15</h3>
          <p>
            Rok isporuke naveden je na strani proizvoda. Rok teče od zaključenja ugovora (član 8). Porudžbinu plaćenu unapred Prodavac šalje po prijemu uplate. Kada je porudžbina poslata, Korisnik
            e-mailom dobija broj pošiljke za praćenje.
          </p>
          <p>Kod ličnog preuzimanja Prodavac telefonom obaveštava Korisnika kada je porudžbina spremna.</p>
          <h3>Član 16</h3>
          <p>
            Kurirska služba odgovara za isporuku pošiljke od trenutka preuzimanja od Prodavca. Kurir pre dostave kontaktira Korisnika telefonom iz porudžbine. Korisnik je dužan da obezbedi da na
            adresi bude lice koje može da preuzme pošiljku. Ako pošiljka ne bude uručena, kurirska služba je vraća Prodavcu, a Prodavac kontaktira Korisnika radi dogovora o ponovnom slanju.
          </p>
          <h3>Član 17</h3>
          <p>
            Pri preuzimanju Korisnik pregleda pošiljku. Ako je ambalaža vidno oštećena, Korisnik može odbiti prijem ili oštećenje navesti kuriru, i o tome istog dana obavestiti Prodavca. Neoštećenu
            pošiljku Korisnik preuzima potpisivanjem potvrde o prijemu.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="odustanak" broj={8} naslov="Odustanak od ugovora">
          <h3>Član 18</h3>
          <p>
            Potrošač ima pravo da odustane od ugovora zaključenog na daljinu u roku od 14 dana, bez navođenja razloga i bez dodatnih troškova, osim troška vraćanja robe. Rok počinje od dana kada roba
            dospe u državinu potrošača, odnosno lica koje je potrošač odredio, a koje nije prevoznik. Ako je porudžbina isporučena u više pošiljaka, rok teče od prijema poslednje.
          </p>
          <p>
            Potrošač odustaje Izjavom o odustanku, uz Dodatak uz izjavu, koje šalje na e-mail {mail} ili poštom. Obrasci su na strani{" "}
            <Link href="/pravo-na-odustajanje/#obrasci">Pravo na odustajanje</Link>. Izjava se može dati i na drugi nedvosmislen način. Prodavac prijem izjave potvrđuje e-mailom.
          </p>
          <h3>Član 19</h3>
          <p>
            Potrošač vraća robu bez odlaganja, a najkasnije 14 dana od dana slanja izjave, o svom trošku, poštom ili kurirskom službom na adresu {s.street}, {s.city}, ili lično u radnji. Roba se vraća
            čista i nekorišćena, sa etiketama i u originalnoj ambalaži.
          </p>
          <p>
            Potrošač odgovara za umanjenu vrednost robe nastalu rukovanjem koje prevazilazi ono što je potrebno da se utvrde priroda, karakteristike i funkcionalnost robe. Isprobavanje veličine, kao u
            radnji, je dozvoljeno.
          </p>
          <h3>Član 20</h3>
          <p>
            Prodavac vraća potrošaču iznos koji je platio po osnovu ugovora bez odlaganja, a najkasnije u roku od 14 dana od prijema izjave o odustanku. Prodavac može da odloži povraćaj dok ne primi
            robu ili dok potrošač ne dostavi dokaz da je robu poslao, u zavisnosti od toga šta nastupi pre.
          </p>
          <p>
            Prihvatanjem ovih Uslova potrošač daje izričitu saglasnost da se povraćaj za robu plaćenu pouzećem izvrši na tekući račun koji navede, bez troškova za potrošača. Za robu plaćenu IPS QR
            kodom ili uplatom na račun povraćaj se vrši na račun sa kog je plaćeno, odnosno na račun koji potrošač navede.
          </p>
          <h3>Član 21</h3>
          <p>Potrošač nema pravo na odustanak od ugovora u slučaju:</p>
          <ol>
            <li>robe izrađene prema posebnim zahtevima potrošača, uključujući odeću i opremu brendiranu logom ili natpisom po zahtevu potrošača (štampa, vez) i robu izrađenu po meri;</li>
            <li>
              zapečaćene robe koja se ne može vratiti zbog zaštite zdravlja ili higijenskih razloga, a koja je otpečaćena nakon isporuke (npr. maske, polumaske, čepići za uši, jednokratne rukavice i
              odeća).
            </li>
          </ol>
          <p>Pravo na odustanak ne odnosi se na kupovinu u radnji niti na kupovinu firmi i preduzetnika za potrebe njihove delatnosti, osim ako je drugačije dogovoreno.</p>
        </PravniOdeljak>

        <PravniOdeljak id="reklamacije" broj={9} naslov="Reklamacije">
          <h3>Član 22</h3>
          <p>
            Prodavac odgovara za nesaobraznost robe ugovoru u skladu sa Zakonom o zaštiti potrošača, u roku od dve godine od dana prelaska rizika na potrošača. Za proizvode sa garancijom proizvođača,
            potrošač prava može ostvariti i po osnovu garancije.
          </p>
          <h3>Član 23</h3>
          <p>
            Reklamaciju potrošač izjavljuje preko strane <Link href="/reklamacija-proizvoda/">Reklamacija proizvoda</Link>, e-mailom na {mail}, telefonom {tel}, poštom ili
            lično u radnji, uz račun ili drugi dokaz o kupovini (npr. broj porudžbine). Korisnik sa nalogom reklamaciju može podneti i iz odeljka{" "}
            <Link href="/moj-nalog/reklamacije/">Moj nalog</Link>, u roku od {REKLAMACIJA_ROK_DANA} dana od porudžbine. Uz reklamaciju je poželjno dostaviti fotografije
            nedostatka.
          </p>
          <p>
            Prodavac bez odlaganja potvrđuje prijem reklamacije, u roku od osam dana od prijema odgovara potrošaču na reklamaciju, a reklamaciju rešava u roku propisanom Zakonom o zaštiti potrošača.
            Ako je isporučena pogrešna, oštećena ili neispravna roba, trošak njenog vraćanja snosi Prodavac.
          </p>
          <h3>Član 24</h3>
          <p>
            Ako Korisnik smatra da obračun nije pravilno izvršen, može to prijaviti e-mailom, uz navođenje broja porudžbine i opisa greške. Prodavac u roku od osam dana obaveštava Korisnika o ishodu
            i, ako je prijava osnovana, izdaje ispravljen račun ili vraća razliku.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="odgovornost" broj={10} naslov="Informacije o proizvodima i odgovornost">
          <h3>Član 25</h3>
          <p>
            Prodavac nastoji da opisi, fotografije, tehnički podaci i cene na sajtu budu tačni i potpuni. Opisi i tehnički podaci, uključujući oznake standarda zaštite (npr. EN standardi) i klase
            zaštite, preuzeti su od proizvođača i dobavljača. Fotografije su ilustrativne: boja na ekranu može se razlikovati od stvarne, a ambalaža i sitni detalji mogu se razlikovati zbog izmena kod
            proizvođača.
          </p>
          <h3>Član 26</h3>
          <p>
            Informacije o zaštitnoj opremi na sajtu su opšteg karaktera. Izbor lične zaštitne opreme za određeno radno mesto, u skladu sa procenom rizika i propisima o bezbednosti i zdravlju na radu,
            obaveza je poslodavca, odnosno korisnika opreme. Prodavac na zahtev pomaže savetom pri izboru, ali ne odgovara za štetu nastalu upotrebom opreme suprotno njenoj nameni, uputstvu
            proizvođača ili propisima, niti za izbor opreme koji ne odgovara stvarnim uslovima rada.
          </p>
          <h3>Član 27</h3>
          <p>
            Korisnik samostalno odgovara za svoje postupke pri korišćenju sajta. Prodavac ne odgovara za štetu nastalu usled prekida ili otežanog rada interneta i sajta na koje ne može da utiče,
            neovlašćenog korišćenja naloga od strane trećih lica, privremene obustave rada sajta radi održavanja, više sile i drugih uzroka van kontrole Prodavca.
          </p>
          <p>Sajt može sadržati linkove ka sajtovima trećih lica (npr. proizvođača ili kurirskih službi). Prodavac ne odgovara za sadržaj tih sajtova.</p>
          <p>Ništa u ovom odeljku ne ograničava prava koja potrošač ima po Zakonu o zaštiti potrošača.</p>
        </PravniOdeljak>

        <PravniOdeljak id="podaci" broj={11} naslov="Podaci o ličnosti i podaci pravnih lica">
          <h3>Član 28</h3>
          <p>
            Prikupljanje i obrada podataka o ličnosti uređeni su <Link href="/politika-privatnosti/">Politikom privatnosti</Link>, koja je sastavni deo ovih Uslova.
          </p>
          <h3>Član 29</h3>
          <p>
            Podatke o firmama Prodavac prikuplja radi zaključenja i izvršenja ugovora i obaveštavanja o sopstvenoj ponudi, u skladu sa dobrim poslovnim običajima, i ne koristi ih u druge svrhe bez
            saglasnosti firme. Podatke koje je firma označila kao poverljive Prodavac čuva kao poverljive tokom poslovne saradnje i dve godine nakon njenog prestanka.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="autorska" broj={12} naslov="Autorska prava">
          <h3>Član 30</h3>
          <p>
            Prodavac je nosilac prava na sadržaj sajta: tekstove, vizuelni identitet, fotografije koje je sam napravio, raspored i bazu podataka. Nazivi, žigovi, logotipi i fotografije proizvođača
            pripadaju njihovim nosiocima i koriste se radi prikaza robe u ponudi.
          </p>
          <p>Preuzimanje i korišćenje sadržaja sajta u celini ili delimično, bez prethodne pisane saglasnosti Prodavca, smatra se povredom prava i podleže odgovornosti u skladu sa zakonom.</p>
        </PravniOdeljak>

        <PravniOdeljak id="suspenzija" broj={13} naslov="Suspenzija i prestanak korisničkog odnosa">
          <h3>Član 31</h3>
          <p>
            Prodavac može privremeno ograničiti korišćenje sajta ili naloga Korisniku ako postoji osnovana sumnja na prevaru ili drugu nedozvoljenu radnju koja može naneti štetu Prodavcu, drugim
            korisnicima ili trećim licima, o čemu obaveštava Korisnika. Ako Korisnik i posle upozorenja nastavi sa takvim ponašanjem, Prodavac može trajno ugasiti nalog.
          </p>
          <p>Prodavac može privremeno obustaviti rad sajta radi održavanja ili otklanjanja kvarova.</p>
          <h3>Član 32</h3>
          <p>
            Korisnik može u svakom trenutku zatražiti gašenje naloga, e-mailom na {mail}. Prestanak korisničkog odnosa ne utiče na obaveze iz već zaključenih ugovora, uključujući obavezu plaćanja
            poručene robe i prava potrošača po osnovu odustanka i reklamacije.
          </p>
        </PravniOdeljak>

        <PravniOdeljak id="sporovi" broj={14} naslov="Rešavanje sporova">
          <h3>Član 33</h3>
          <p>Ovi Uslovi tumače se na način koji doprinosi izvršenju ugovornih obaveza na obostranu korist. Na sve što nije uređeno ovim Uslovima primenjuju se propisi Republike Srbije.</p>
          <h3>Član 34</h3>
          <p>
            Prodavac i Korisnik nastoje da sporove reše mirnim putem. Potrošač ima pravo na vansudsko rešavanje potrošačkog spora pred telom za vansudsko rešavanje potrošačkih sporova sa liste koju
            vodi ministarstvo nadležno za zaštitu potrošača. Sudski ili vansudski postupak potrošač može pokrenuti nakon prijema odgovora Prodavca na izjavljenu reklamaciju. Za sporove sa potrošačem
            nadležan je sud prema prebivalištu, odnosno boravištu potrošača.
          </p>
          <p>Za sporove sa Korisnikom koji je pravno lice ili preduzetnik nadležan je stvarno nadležan sud prema sedištu Prodavca.</p>
        </PravniOdeljak>

        <PravniOdeljak id="zavrsne" broj={15} naslov="Završne odredbe">
          <h3>Član 35</h3>
          <p>
            Prodavac može izmeniti ove Uslove u skladu sa promenama propisa i uslova poslovanja. Izmene se objavljuju na sajtu najmanje osam dana pre početka primene, a Korisnici sa nalogom o tome se
            obaveštavaju i e-mailom. Na porudžbine poslate pre početka primene izmena primenjuju se Uslovi koji su tada važili.
          </p>
          <h3>Član 36</h3>
          <p>Ovi Uslovi primenjuju se od dana objavljivanja na sajtu.</p>
          <p>
            U Svilajncu, doneto {USLOVI_DONETO} Na snazi od {USLOVI_NA_SNAZI}
            <br />
            {contact.legalName}
          </p>
        </PravniOdeljak>
      </OkvirUslova>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
