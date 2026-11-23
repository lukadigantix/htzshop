import { cacheLife, cacheTag } from "next/cache";
import { KATALOG, KES_KATALOGA } from "./kes";
import { API_URL, fileUrl } from "./api";
import { categories as rezervneGrupe, categoryHref, contact, type CategoryGroup, type MegaItem, type MegaMenu, type MegaPromo } from "@/data/site";

/**
 * Glavne grupe artikala (odeljci) iz admina: `GET /categories` (naziv, redosled, podgrupe, slika) i `GET /categories/counts`
 * (broj modela koje prodavnica prikazuje). Od njih se prave meni, pločice na početnoj, pilule kataloga i predlozi pretrage.
 * U kodu ostaje samo raspored (koja grupa ide u koji meni), kratki nazivi za pilule i slike dok grupa u adminu nema svoju.
 * Grupa bez artikala se ne prikazuje; grupa koje nema u rasporedu ide u prvi meni (posle svojih grupa, pre Brendiranja),
 * jer zaglavlje ima mesta za tačno tri menija pored logotipa na sredini. Kad backend ne odgovara, koristi se
 * spisak iz data/site.ts (bez brojeva).
 */
export type Odeljak = { slug: string; name: string; short: string; count: number | null; image: string; subs: { name: string; slug: string; count?: number | null }[] };

// Slika i kratak naziv po slug-u (dok grupa u adminu nema sliku)
// (pripremljene slike artikala na beloj podlozi); grupa bez slike i ovde dobija sliku svog najpreporučenijeg artikla
const SLIKE: Record<string, string> = Object.fromEntries(rezervneGrupe.map((g) => [g.slug, g.image]));
const KRATKO: Record<string, string> = {
  ...Object.fromEntries(rezervneGrupe.map((g) => [g.slug, g.short])),
  "higijena-i-odrzavanje": "Higijena",
  "torbe-putovanje": "Torbe",
  tekstil: "Tekstil",
};
const PODRAZUMEVANA_SLIKA = "/images/cats/oprema.jpg";

// Raspored u meniju i na početnoj (tekstovi blokova su uređivački, ostaju ovde)
const RASPORED = [
  {
    key: "odeca",
    label: "Odeća i obuća",
    allLabel: "Sva radna odeća i obuća",
    slugs: ["zastitna-i-radna-odeca", "zastitna-i-radna-obuca", "zastitne-i-radne-rukavice"],
    brendiranje: true,
    promo: {
      kicker: "Brendiranje",
      title: "Vaš logo na radnoj odeći",
      text: "Sito, flex i DTF štampa u našoj radionici u Svilajncu, za jakne, prsluke, majice i kape.",
      cta: "Saznajte više",
      href: "/brendiranje-odece/",
      image: "/images/photo/brendiranje-presa.jpg",
    },
    blok: {
      title: "Radna odeća i obuća",
      text: "Odeća, obuća i rukavice koje izdrže svaki radni dan. Brendovi Cerva, Emerton, Cofra i Dunlop, sve veličine na lageru u Svilajncu.",
      photo: "/images/photo/brendiranje.jpg",
      photoAlt: "Radnici u radnim uniformama",
      photoPosition: "center 40%",
    },
  },
  {
    key: "zastita",
    label: "Lična zaštita",
    allLabel: "Sva lična zaštita",
    slugs: ["zastita-glave", "zastita-ociju-i-lica", "zastita-disajnih-organa", "zastita-sluha"],
    promo: {
      kicker: "Pomoć pri izboru",
      title: "Niste sigurni koji standard vam treba?",
      text: `Pozovite nas na ${contact.phone}, pon - pet 07:00 - 15:00. Pomoći ćemo da izaberete zaštitu za vaš posao.`,
      cta: "Pozovite nas",
      href: contact.phoneHref,
      image: "/images/photo/naocare.jpg",
    },
    blok: {
      title: "Lična zaštita",
      text: "Šlemovi, naočare i viziri, maske i filteri, antifoni i čepići. Sertifikovano po EN standardima, od proizvođača kao što su 3M, uvex i Climax.",
      photo: "/images/photo/naocare.jpg",
      photoAlt: "Radnik namešta zaštitne naočare",
      photoPosition: "55% center",
    },
  },
  {
    key: "bezbednost",
    label: "Bezbednost",
    allLabel: "Sva oprema za bezbednost",
    slugs: ["zastita-od-pada", "oprema-i-bezbednost", "jednokratna-zastitna-oprema", "higijena-i-odrzavanje"],
    promo: {
      kicker: "Za firme",
      title: "Opremanje cele ekipe",
      text: "Pošaljite spisak i veličine, a mi šaljemo kompletnu ponudu sa rokom isporuke.",
      cta: "Zatražite ponudu",
      href: "/kontakt/#ponuda",
      image: "/images/photo/slide-zavarivanje.jpg",
    },
    blok: {
      title: "Rad na visini, bezbednost i higijena",
      text: "Protivpadni kompleti i gurtne, jednokratna zaštita, prva pomoć, signalizacija i higijena za gradilište i pogon.",
      photo: "/images/photo/slide-zavarivanje.jpg",
      photoAlt: "Varilac sa zaštitnom maskom",
      photoPosition: "center 40%",
    },
  },
] as const;

const BRENDIRANJE = { name: "Brendiranje odeće", sub: "Sito, flex i DTF štampa", image: "/images/products/muska-majica.png", href: "/brendiranje-odece/" };

type ApiGrupa = { slug: string; name: string; parentId: string | null; id: string; isActive: boolean; mergedIntoId?: string | null; sortOrder: number; imageUrl: string | null };

async function api<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(6_000) });
    if (!r.ok) return null;
    return ((await r.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

/**
 * Slika za grupu koja nema svoju: preporučeni artikal iz prve podgrupe (po redosledu iz admina - npr. Rančevi, Majice),
 * jer najpreporučeniji artikal cele grupe zna da bude sitnica koja je ne predstavlja. Bez podgrupa: iz cele grupe.
 */
async function slikaGrupe(g: ApiGrupa, podgrupe: ApiGrupa[]): Promise<string | null> {
  for (const p of podgrupe.slice(0, 3)) {
    const s = await slikaArtikla([p.id]);
    if (s) return s;
  }
  return slikaArtikla([g.id, ...podgrupe.map((p) => p.id)]);
}

async function slikaArtikla(groupIds: string[]): Promise<string | null> {
  const sp = new URLSearchParams({ groupByModel: "true", limit: "12", sort: "recommended", groupIds: groupIds.join(",") });
  const lista = await api<{ image: string | null; images?: string[] }[]>(`/products?${sp}`);
  const s = lista?.map((p) => p.image ?? p.images?.[0]).find(Boolean);
  return s ? fileUrl(s) : null;
}

/** Glavne grupe redom kao u adminu, sa podgrupama i brojem artikala; bez praznih */
export async function getOdeljci(): Promise<Odeljak[]> {
  "use cache";
  cacheLife(KES_KATALOGA);
  cacheTag(KATALOG);
  const [sve, broj] = await Promise.all([api<ApiGrupa[]>("/categories"), api<Record<string, number>>("/categories/counts")]);
  if (!sve?.length) {
    return rezervneGrupe.map((g) => ({ slug: g.slug, name: g.name, short: g.short, count: null, image: g.image, subs: g.subs }));
  }
  const aktivne = sve.filter((g) => g.isActive && !g.mergedIntoId);
  const poredak = (a: ApiGrupa, b: ApiGrupa) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "sr");
  const glavne = aktivne.filter((g) => !g.parentId).sort(poredak);
  const saArtikla = new Map(
    await Promise.all(
      glavne
        .filter((g) => !g.imageUrl && !SLIKE[g.slug])
        .map(async (g) => [g.slug, await slikaGrupe(g, aktivne.filter((p) => p.parentId === g.id && (broj?.[p.slug] ?? 1) > 0).sort(poredak))] as const),
    ),
  );
  return glavne
    .map((g) => ({
      slug: g.slug,
      name: g.name,
      short: KRATKO[g.slug] ?? g.name,
      count: broj?.[g.slug] ?? null,
      image: g.imageUrl ? fileUrl(g.imageUrl) : SLIKE[g.slug] ?? saArtikla.get(g.slug) ?? PODRAZUMEVANA_SLIKA,
      subs: aktivne
        .filter((p) => p.parentId === g.id && (broj?.[p.slug] ?? 1) > 0)
        .sort(poredak)
        .map((p) => ({ name: p.name, slug: p.slug, count: broj?.[p.slug] ?? null })),
    }))
    .filter((g) => g.count == null || g.count > 0);
}

const brArtikala = (n: number | null) => (n == null ? "" : `${n.toLocaleString("sr-RS").replace(/,/g, ".")} ${n % 10 === 1 && n % 100 !== 11 ? "artikal" : "artikala"}`);
const stavka = (g: Odeljak) => ({ name: g.name, sub: brArtikala(g.count), image: g.image, href: categoryHref(g.slug) });

// U meniju: sve podgrupe (redosled iz admina), svaka sa slikom svog preporučenog artikla
const stavkaMenija = (g: Odeljak, slike: Record<string, string | null>): MegaItem => ({
  ...stavka(g),
  foto: g.image.includes("/images/photo/"),
  subs: g.subs.map((p) => ({ name: p.name, href: categoryHref(p.slug), count: p.count ?? null, image: slike[p.slug] ?? null })),
});

/** Slika za svaku podgrupu (preporučeni artikal), za pločice u mega-meniju; posebno keširano, po 8 upita odjednom */
async function getSlikePodgrupa(): Promise<Record<string, string | null>> {
  "use cache";
  cacheLife(KES_KATALOGA);
  cacheTag(KATALOG);
  const sve = await api<ApiGrupa[]>("/categories");
  const podgrupe = (sve ?? []).filter((g) => g.parentId && g.isActive && !g.mergedIntoId);
  const out: Record<string, string | null> = {};
  for (let i = 0; i < podgrupe.length; i += 8) {
    await Promise.all(
      podgrupe.slice(i, i + 8).map(async (g) => {
        out[g.slug] = g.imageUrl ? fileUrl(g.imageUrl) : await slikaArtikla([g.id]);
      }),
    );
  }
  return out;
}
const sveIz = (grupe: Odeljak[]) => `/prodavnica/?grupa=${grupe.map((g) => g.slug).join(",")}`;

/** Meni u zaglavlju: blokovi iz rasporeda (samo grupe koje postoje i imaju artikle, sa podgrupama); nerasporedjene idu u prvi meni.
 *  Brendiranje, pomoć i ponuda su tamna kartica (promo) desno od grupa. */
export async function getMeni(): Promise<MegaMenu[]> {
  const [odeljci, slike] = await Promise.all([getOdeljci(), getSlikePodgrupa()]);
  const po = new Map(odeljci.map((g) => [g.slug, g]));
  const rasporedjeno = new Set<string>(RASPORED.flatMap((r) => [...r.slugs]));
  const ostalo = odeljci.filter((g) => !rasporedjeno.has(g.slug));
  const meniji: MegaMenu[] = RASPORED.map((r, i) => {
    const grupe = [...r.slugs.map((s) => po.get(s)).filter((g): g is Odeljak => Boolean(g)), ...(i === 0 ? ostalo : [])];
    return {
      key: r.key,
      label: r.label,
      allLabel: r.allLabel,
      allHref: grupe.length ? sveIz(grupe) : "/prodavnica/",
      items: grupe.map((g) => stavkaMenija(g, slike)),
      promo: r.promo as MegaPromo,
    };
  }).filter((m) => m.items.length);
  return meniji;
}

/** Blokovi na početnoj: fotografija + do 4 pločice grupa iz istog rasporeda kao meni */
export async function getBlokovi(): Promise<CategoryGroup[]> {
  const odeljci = await getOdeljci();
  const po = new Map(odeljci.map((g) => [g.slug, g]));
  return RASPORED.map((r, i) => {
    const grupe = r.slugs.map((s) => po.get(s)).filter((g): g is Odeljak => Boolean(g));
    return {
      key: r.key,
      title: r.blok.title,
      menuTitle: r.label,
      allLabel: r.allLabel,
      allHref: grupe.length ? sveIz(grupe) : "/prodavnica/",
      text: r.blok.text,
      photo: r.blok.photo,
      photoAlt: r.blok.photoAlt,
      photoPosition: r.blok.photoPosition,
      photoSide: (i % 2 ? "right" : "left") as "left" | "right",
      tiles: [...grupe.map(stavka), ...("brendiranje" in r && r.brendiranje ? [BRENDIRANJE] : [])].slice(0, 4),
    };
  }).filter((b) => b.tiles.length);
}
