// Sav sadržaj početne stranice HTZ Shop-a. Podaci su preuzeti sa htzshop.rs (26.10.2026).
// Brojevi artikala po kategoriji su stanje prodavnice tog dana.

export const contact = {
  name: "HTZ Shop",
  // poslovno ime iz APR-a (preduzetnik), za obrasce, podatke prodavca i JSON-LD
  legalName: "TANJA MARJANOVIĆ PR TRGOVINSKA RADNJA HTZ SHOP SVILAJNAC",
  address: "Karađorđeva 24",
  city: "35210 Svilajnac",
  phone: "035/88-15-322",
  phoneHref: "tel:+381358815322",
  phone2: "035/277-32-49",
  phone2Href: "tel:+381352773249",
  email: "info@htzshop.rs",
  hours: [
    { days: "Pon - pet", time: "07:00 - 15:00" },
    { days: "Subota", time: "07:00 - 14:00" },
    { days: "Nedelja", time: "zatvoreno" },
  ],
  pib: "110276071",
  mb: "64777858",
  // Račun u Banca Intesi (160-492241-81) je ugašen 6. 6. 2026; aktivni računi su u Raiffeisen banci. Dok firma ne potvrdi
  // koji je za uplate kupaca, sajt ne prikazuje račun. Format: „Naziv banke broj-računa".
  bank: "",
  founded: 2017,
  facebook: "https://www.facebook.com/profile.php?id=100064679481924",
  instagram: "https://instagram.com/htz_oprema_Shop",
  freeShippingFrom: "8.000 RSD",
  totalProducts: 359,
  // Radnja na mapi (Karađorđeva 24, OpenStreetMap). Ako se adresa u adminu promeni, treba promeniti i ovo.
  coords: { lat: 44.23167, lng: 21.2008 },
};

export type Category = {
  slug: string;
  name: string;
  short: string;
  count: number;
  image: string;
  subs: { name: string; slug: string }[];
};

export const categories: Category[] = [
  {
    slug: "zastitna-i-radna-odeca",
    name: "Zaštitna i radna odeća",
    short: "Odeća",
    count: 60,
    image: "/images/cats/odeca.jpg",
    subs: [
      { name: "Bluze", slug: "bluze" },
      { name: "Pantalone", slug: "pantalone-zastitna-i-radna-odeca" },
      { name: "Polukombinezoni", slug: "polukombinezoni" },
      { name: "Šorcevi", slug: "sorts" },
      { name: "Majice", slug: "majice" },
      { name: "Polo majice", slug: "polo-majice" },
      { name: "Duksevi", slug: "duksevi" },
    ],
  },
  {
    slug: "zastitna-i-radna-obuca",
    name: "Zaštitna i radna obuća",
    short: "Obuća",
    count: 72,
    image: "/images/cats/obuca.jpg",
    subs: [
      { name: "Plitke cipele", slug: "plitke-cipele" },
      { name: "Duboke cipele", slug: "duboke-cipele" },
      { name: "Čizme", slug: "cizme-zastitna-i-radna-obuca" },
      { name: "Kaljače", slug: "kaljace-zastitna-i-radna-obuca" },
      { name: "Klompe i papuče", slug: "klompe-papuce-zastitna-i-radna-obuca" },
      { name: "Sandale", slug: "sandale-zastitna-i-radna-obuca" },
    ],
  },
  {
    slug: "zastitne-i-radne-rukavice",
    name: "Zaštitne i radne rukavice",
    short: "Rukavice",
    count: 77,
    image: "/images/cats/rukavice.jpg",
    subs: [
      { name: "Radne rukavice", slug: "radne" },
      { name: "Zaštitne rukavice", slug: "zastitne" },
      { name: "Rukavice za zavarivanje", slug: "rukavice-za-zavarivanje" },
    ],
  },
  {
    slug: "zastita-glave",
    name: "Zaštita glave",
    short: "Glava",
    count: 34,
    image: "/images/cats/glava2.jpg",
    subs: [
      { name: "Šlemovi i zaštitne kape", slug: "slemovi-i-zastitne-kape-zastita-glave" },
      { name: "Viziri i nosači vizira", slug: "viziri-i-nosaci-vizira-zastita-glave" },
    ],
  },
  {
    slug: "zastita-ociju-i-lica",
    name: "Zaštita očiju i lica",
    short: "Oči i lice",
    count: 27,
    image: "/images/cats/oci.jpg",
    subs: [
      { name: "Maske za zavarivanje", slug: "maske-za-zavarivanje-zastita-ociju-i-lica" },
      { name: "Zaštitne naočare za zavarivače", slug: "zastitne-naocare-za-zavarivace-zastita-ociju-i-lica" },
    ],
  },
  { slug: "zastita-disajnih-organa", name: "Zaštita disajnih organa", short: "Disajni organi", count: 19, image: "/images/cats/disajni.jpg", subs: [] },
  { slug: "zastita-sluha", name: "Zaštita sluha", short: "Sluh", count: 14, image: "/images/cats/sluh.jpg", subs: [] },
  { slug: "zastita-od-pada", name: "Zaštita od pada", short: "Rad na visini", count: 30, image: "/images/cats/pad.jpg", subs: [] },
  { slug: "zastita-za-zavarivanje", name: "Zaštita za zavarivanje", short: "Zavarivanje", count: 18, image: "/images/cats/zavarivanje.jpg", subs: [] },
  {
    slug: "oprema-i-bezbednost",
    name: "Oprema i bezbednost",
    short: "Bezbednost",
    count: 39,
    image: "/images/cats/oprema.jpg",
    subs: [
      { name: "Prva pomoć i nosila", slug: "prva-pomoc-i-nosila" },
      { name: "Bezbednosna i saobraćajna signalizacija", slug: "bezbedonosna-i-saobracajna-signalizacija" },
    ],
  },
  { slug: "jednokratna-zastitna-oprema", name: "Jednokratna zaštitna oprema", short: "Jednokratno", count: 6, image: "/images/cats/jednokratna.jpg", subs: [] },
];

export const categoryHref = (slug: string) => `/kategorija-proizvoda/${slug}/`;

export type Product = {
  slug: string;
  name: string;
  group: string; // kratak opis vrste proizvoda, prikazuje se iznad naziva
  brand?: string;
  price: number;
  priceTo?: number;
  image: string;
  inStock: boolean;
  colors?: string[]; // hex vrednosti varijanti boja
  tag?: string;
};

export const productTabs: { key: string; label: string; products: Product[] }[] = [
  {
    key: "odeca",
    label: "Radna odeća",
    products: [
      { slug: "allyn-bluza", name: "Allyn bluza", group: "Radna bluza", brand: "Allyn", price: 5940, image: "/images/products/allyn-bluza.jpg", inStock: true, colors: ["#1a1a1a", "#2f7d32", "#1f4e9c"] },
      { slug: "emerton-bluza", name: "Emerton bluza", group: "Radna bluza", brand: "Emerton", price: 4160, image: "/images/products/emerton-bluza.jpg", inStock: true },
      { slug: "coen-bluza-za-zavarivace-vatrootporna-i-antistatik", name: "Coen bluza za zavarivače", group: "Vatrootporna, antistatik", brand: "CRV", price: 7840, image: "/images/products/coen-bluza.png", inStock: true, tag: "Za zavarivače" },
      { slug: "cobalt-radne-pantalone", name: "Cobalt radne pantalone", group: "Radne pantalone", price: 7110, image: "/images/products/cobalt-pantalone.jpg", inStock: true },
    ],
  },
  {
    key: "obuca",
    label: "Zaštitna obuća",
    products: [
      { slug: "antares-s1-zastitne-cipele-sa-celicnom-kapom", name: "Antares S1", group: "Cipele sa čeličnom kapom", price: 3860, image: "/images/products/antares-s1.jpg", inStock: true, tag: "Najprodavanije" },
      { slug: "ardita-s3-m-hro-src", name: "Ardita S3 M HRO SRC", group: "Cipele za zavarivače", price: 8450, image: "/images/products/ardita-s3.jpg", inStock: true },
      { slug: "atene-plitka-zastitna-cipela-s3-src", name: "Atene S3 SRC", group: "Plitka zaštitna cipela", price: 8900, image: "/images/products/atene-s3.jpg", inStock: true },
      { slug: "alfa-neos-6911n-s1-src", name: "Alfa Neos 6911N S1", group: "Plitka zaštitna cipela", price: 3950, image: "/images/products/alfa-neos-s1.jpg", inStock: true },
    ],
  },
  {
    key: "rukavice",
    label: "Rukavice",
    products: [
      { slug: "atg-rukavice-maxiflex-cut-3", name: "ATG MaxiFlex Cut 3", group: "Rukavice protiv prosecanja", price: 1800, image: "/images/products/atg-maxiflex.jpeg", inStock: true },
      { slug: "eon-carbon", name: "EON Carbon", group: "ESD radne rukavice", brand: "EON", price: 169, image: "/images/products/eon-carbon.jpg", inStock: true },
      { slug: "calandra", name: "Calandra", group: "Kožne radne rukavice", price: 1820, image: "/images/products/calandra.jpg", inStock: true },
      { slug: "basler", name: "Basler", group: "Rukavice sa lateks premazom", brand: "Dankers", price: 125, image: "/images/products/basler.jpg", inStock: true },
    ],
  },
  {
    key: "zastita",
    label: "Zaštita",
    products: [
      { slug: "slem-3m-g3000-sa-ventilacijom-i-pin-lock-trakom", name: "Šlem 3M G3000", group: "Sa ventilacijom i Pin-Lock trakom", brand: "3M", price: 3510, image: "/images/products/slem-3m-g3000.jpg", inStock: true },
      { slug: "climax-420-automatska-maska-za-zavarivanje", name: "Climax 420", group: "Automatska maska za zavarivanje", price: 5670, image: "/images/products/climax-420.jpg", inStock: true },
      { slug: "antifon-peltor-optime-iii", name: "Peltor Optime III", group: "Antifon", brand: "3M", price: 4450, image: "/images/products/peltor-optime-iii.jpg", inStock: true },
      { slug: "komplet-blockmax-ac-010", name: "Komplet Blockmax AC 010", group: "Protivpadni komplet", price: 11950, image: "/images/products/blockmax-komplet.jpg", inStock: true },
    ],
  },
];

export const brands: { name: string; slug: string; logo: string }[] = [
  { name: "3M", slug: "3m", logo: "/images/brands/3m.png" },
  { name: "Cerva", slug: "cerva", logo: "/images/brands/cerva.png" },
  { name: "Cofra", slug: "cofra", logo: "/images/brands/cofra.png" },
  { name: "Dunlop", slug: "dunlop", logo: "/images/brands/dunlop.png" },
  { name: "Emerton", slug: "emerton", logo: "/images/brands/emerton.png" },
  { name: "EON", slug: "eon", logo: "/images/brands/eon.png" },
  { name: "Exena", slug: "exena", logo: "/images/brands/exena.png" },
  { name: "FreeHand", slug: "freehand", logo: "/images/brands/freehand.png" },
  { name: "Tekton Pro", slug: "tekton-pro", logo: "/images/brands/tekton-pro-workwear.png" },
  { name: "Allyn", slug: "allyn", logo: "/images/brands/allyn.png" },
  { name: "Bicap", slug: "bicap", logo: "/images/brands/bicap.png" },
  { name: "Catamount", slug: "catamount", logo: "/images/brands/catamount.png" },
  { name: "Catamount Sport", slug: "catamount-sport", logo: "/images/brands/catamount-sport.png" },
  { name: "CRV", slug: "crv", logo: "/images/brands/crv.png" },
  { name: "Dankers", slug: "dankers", logo: "/images/brands/dankers.png" },
  { name: "Desman", slug: "desman", logo: "/images/brands/desman.png" },
  { name: "Stenberg", slug: "stenberg", logo: "/images/brands/stenberg-1.png" },
  { name: "Stanmore", slug: "stanmore", logo: "/images/brands/stanmore.png" },
];

// Tehnike i opisi sa originalne stranice „Brendiranje odeće" (htzshop.rs); `za` je sažetak istog opisa za stranicu brendiranja
export const printMethods = [
  { name: "Sito štampa", text: "Najpopularniji vid brendiranja tekstila. Postojan, dugotrajan i kvalitetan otisak, idealan za veće serije.", za: "Veće serije" },
  { name: "Flex štampa", text: "Tanka poliuretanska folija visoke postojanosti. Štampa u jednoj ili dve boje, oštre ivice logotipa.", za: "Logo u jednoj ili dve boje" },
  { name: "DTF štampa", text: "Za sve vrste odeće, torbi i uniformi. Ultra tanak otisak koji je rastegljiv i postojan na pranje.", za: "Odeća, torbe i uniforme" },
];

export const footerLinks = {
  info: [
    { name: "Plaćanje i isporuka", href: "/placanje-i-isporuka/" },
    { name: "Kako naručiti", href: "/kako-naruciti/" },
    { name: "Pravo na odustajanje", href: "/pravo-na-odustajanje/" },
    { name: "Reklamacija proizvoda", href: "/reklamacija-proizvoda/" },
    { name: "Povraćaj novca i robe", href: "/povracaj-novca/" },
    { name: "Politika privatnosti", href: "/politika-privatnosti/" },
    { name: "Uslovi korišćenja", href: "/uslovi-koriscenja/" },
  ],
  shop: [
    { name: "Prodavnica", href: "/prodavnica/" },
    { name: "Brendiranje odeće", href: "/brendiranje-odece/" },
    { name: "Brendovi", href: "/brendovi/" },
    { name: "O nama", href: "/o-nama/" },
    { name: "Kontakt", href: "/kontakt/" },
    { name: "Status porudžbine", href: "/status-porudzbine/" },
    { name: "Moj nalog", href: "/moj-nalog/" },
  ],
};

export const formatPrice = (n: number) => n.toLocaleString("sr-RS").replace(/,/g, ".") + " RSD";

// Grupe kategorija za početnu: svaka grupa je jedan blok (fotografija + 2×2 pločice) sa naslovom i tekstom.
export type GroupTile = { name: string; sub: string; image: string; href: string };
export type CategoryGroup = {
  key: string;
  title: string;
  menuTitle: string;
  allLabel: string;
  allHref: string;
  text: string;
  photo: string;
  photoAlt: string;
  photoPosition?: string;
  photoSide: "left" | "right";
  tiles: GroupTile[];
};

const catTile = (slug: string): GroupTile => {
  const c = categories.find((x) => x.slug === slug)!;
  return { name: c.name, sub: `${c.count} artikala`, image: c.image, href: categoryHref(c.slug) };
};

export const categoryGroups: CategoryGroup[] = [
  {
    key: "odeca",
    title: "Radna odeća i obuća",
    menuTitle: "Odeća i obuća",
    allLabel: "Sva radna odeća i obuća",
    allHref: "/prodavnica/?grupa=odeca-i-obuca",
    text: "Odeća, obuća i rukavice koje izdrže svaki radni dan. Brendovi Cerva, Emerton, Cofra i Dunlop, sve veličine na lageru u Svilajncu.",
    photo: "/images/photo/brendiranje.jpg",
    photoAlt: "Radnici u radnim uniformama",
    photoPosition: "center 40%",
    photoSide: "left",
    tiles: [
      catTile("zastitna-i-radna-odeca"),
      catTile("zastitna-i-radna-obuca"),
      catTile("zastitne-i-radne-rukavice"),
      { name: "Brendiranje odeće", sub: "Štampa vašeg logotipa", image: "/images/products/muska-majica.png", href: "/brendiranje-odece/" },
    ],
  },
  {
    key: "zastita",
    title: "Lična zaštita",
    menuTitle: "Lična zaštita",
    allLabel: "Sva lična zaštita",
    allHref: "/prodavnica/?grupa=licna-zastita",
    text: "Šlemovi, naočare i viziri, maske i filteri, antifoni i čepići. Sertifikovano po EN standardima, od proizvođača kao što su 3M, uvex i Climax.",
    photo: "/images/photo/naocare.jpg",
    photoAlt: "Radnik namešta zaštitne naočare",
    photoPosition: "55% center",
    photoSide: "right",
    tiles: [catTile("zastita-glave"), catTile("zastita-ociju-i-lica"), catTile("zastita-disajnih-organa"), catTile("zastita-sluha")],
  },
  {
    key: "bezbednost",
    title: "Rad na visini, zavarivanje i bezbednost",
    menuTitle: "Visina, zavarivanje, bezbednost",
    allLabel: "Sva oprema za bezbednost",
    allHref: "/prodavnica/?grupa=bezbednost",
    text: "Protivpadni kompleti i gurtne, oprema za zavarivače, jednokratne rukavice i maske, prva pomoć i saobraćajna signalizacija za gradilište i pogon.",
    photo: "/images/photo/slide-zavarivanje.jpg",
    photoAlt: "Varilac sa zaštitnom maskom",
    photoPosition: "center 40%",
    photoSide: "left",
    tiles: [catTile("zastita-od-pada"), catTile("zastita-za-zavarivanje"), catTile("oprema-i-bezbednost"), catTile("jednokratna-zastitna-oprema")],
  },
];

// Hero slajder: smenjuju se najjače kategorije sa opisom (uzor fristads.com).
// Slajdovi se unose u admin panelu (Podešavanja → Baneri) i stižu preko API-ja (lib/api.ts).
export type HeroSlide = {
  key: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  imageAlt: string;
  imagePosition?: string;
  // Prelaz odozdo nagore iza teksta (CSS background, boja i jačina iz admina)
  fade: string;
};

// Mega-meni po uzoru na pitbike.vercel.app: velika slika, naziv, podnaslov, dugme + link, na dnu link „Sve …"
export type MegaItem = { name: string; sub: string; image: string; href: string };
export type MegaMenu = { key: string; label: string; allLabel: string; allHref: string; items: MegaItem[] };

const cat = (slug: string) => categories.find((c) => c.slug === slug)!;
const megaCat = (slug: string, name?: string): MegaItem => ({ name: name ?? cat(slug).name, sub: `${cat(slug).count} artikala`, image: cat(slug).image, href: categoryHref(slug) });

export const megaMenus: MegaMenu[] = [
  {
    key: "odeca",
    label: "Odeća i obuća",
    allLabel: "Sva radna odeća i obuća",
    allHref: "/prodavnica/",
    items: [
      megaCat("zastitna-i-radna-odeca", "Radna odeća"),
      megaCat("zastitna-i-radna-obuca", "Zaštitna obuća"),
      megaCat("zastitne-i-radne-rukavice", "Rukavice"),
      { name: "Brendiranje odeće", sub: "Sito, flex i DTF štampa", image: "/images/products/muska-majica.png", href: "/brendiranje-odece/" },
    ],
  },
  {
    key: "zastita",
    label: "Lična zaštita",
    allLabel: "Sva lična zaštita",
    allHref: "/prodavnica/",
    items: [megaCat("zastita-glave"), megaCat("zastita-ociju-i-lica"), megaCat("zastita-disajnih-organa"), megaCat("zastita-sluha")],
  },
  {
    key: "bezbednost",
    label: "Bezbednost",
    allLabel: "Sva oprema za bezbednost",
    allHref: "/prodavnica/",
    items: [megaCat("zastita-od-pada"), megaCat("zastita-za-zavarivanje"), megaCat("oprema-i-bezbednost"), megaCat("jednokratna-zastitna-oprema", "Jednokratna oprema")],
  },
];

// Kartice „Radna odeća i obuća" (sekcija 3)
export const wearCards = [
  { name: "Radna odeća", text: "Bluze, pantalone i polukombinezoni. Cerva, Emerton, Desman.", image: "/images/cats/odeca.jpg", href: categoryHref("zastitna-i-radna-odeca") },
  { name: "Zaštitna obuća", text: "Cipele i čizme klase S1 do S3, sa čeličnom ili kompozitnom kapom.", image: "/images/cats/obuca.jpg", href: categoryHref("zastitna-i-radna-obuca") },
  { name: "Rukavice", text: "Radne, zaštitne, protiv prosecanja i za zavarivanje.", image: "/images/cats/rukavice.jpg", href: categoryHref("zastitne-i-radne-rukavice") },
];

// Karusel „Zaštita za svaki posao" (sekcija 5)
export const protectionCards = ["zastita-glave", "zastita-ociju-i-lica", "zastita-disajnih-organa", "zastita-sluha", "zastita-od-pada", "zastita-za-zavarivanje", "oprema-i-bezbednost", "jednokratna-zastitna-oprema"].map((s) => ({
  name: cat(s).name,
  count: cat(s).count,
  image: cat(s).image,
  href: categoryHref(s),
}));

// „Za firme i timove" (sekcija 8)
export const companySteps = [
  { title: "Pošaljite spisak i veličine", meta: "mejlom ili telefonom, bez obaveze", tag: "Korak 1" },
  { title: "Dobijate kompletnu ponudu", meta: "sa brendiranjem i rokom isporuke", tag: "Korak 2" },
  { title: "Isporuka na adresu firme", meta: "kurirom ili preuzimanje u Svilajncu", tag: "Korak 3" },
];

// „O nama": brojke sa originalne stranice O nama (klijentove tvrdnje: 1000 artikala, 8000 MP kupaca) + ono što smo izbrojali
export const aboutStats = [
  { value: "2017.", label: "godina osnivanja" },
  { value: "1.000+", label: "artikala u ponudi" },
  { value: "18", label: "evropskih brendova" },
  { value: "8.000+", label: "zadovoljnih kupaca" },
];
export const mapsHref = "https://www.google.com/maps/search/?api=1&query=Kara%C4%91or%C4%91eva+24%2C+Svilajnac";
