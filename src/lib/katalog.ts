import { cacheLife } from "next/cache";
import { API_URL, fileUrl } from "./api";
import { brands as lokalniBrendovi, categories, productTabs } from "@/data/site";
import { type Facete, type Filteri, type Sort } from "./filteri";

/**
 * Lista prodavnice: GET /products (jedan red po modelu - sve veličine i boje istog proizvoda su jedna kartica) i GET /filters
 * (fasete sa brojem modela). Grupe i brendovi su u URL-u kao slug, a backend traži ID - prevod ide preko javnih lista
 * GET /categories i GET /brands/active.
 * Dok katalog nije uvezen (backend vrati nula artikala) ili backend ne odgovara, lista radi nad artiklima sa naslovne
 * (data/site.ts): grupa, brend, cena i sortiranje rade, ostali filteri se ne nude jer ti podaci ne postoje.
 */

export type Kartica = {
  slug: string;
  name: string;
  brand: string | null;
  brandLogo: string | null;
  group: string;
  price: number;
  /** precrtana cena (akcija) */
  basePrice: number | null;
  /** „sa PDV-om" ili „+ PDV" */
  priceLabel: string;
  image: string | null;
  inStock: boolean;
  deliveryTime: string | null;
  shipping: { free: boolean; label: string | null } | null;
  badges: string[];
};
export type Meta = { page: number; limit: number; total: number; totalPages: number };
export type Katalog = { items: Kartica[]; meta: Meta; facete: Facete | null; lokalno: boolean };

const PO_STRANI = 12;

type ApiStavka = {
  slug: string;
  name: string;
  image: string | null;
  brand: { name: string; logoUrl?: string | null } | null;
  groups?: { name: string }[];
  priceDisplay: { price: number | null; basePrice: number | null; label: string } | null;
  inStock: boolean;
  deliveryTime: string | null;
  shipping: { free: boolean; label: string | null } | null;
  badges?: { name: string }[];
};
type ApiFacete = {
  total: number;
  price: { min: number | null; max: number | null };
  groups: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string; logoUrl: string | null; count: number }[];
  size: { value: string | number; label: string; count: number }[];
  color: ApiFacete["size"];
  standard: ApiFacete["size"];
  material: ApiFacete["size"];
  gender: ApiFacete["size"];
  onPromotion: { value: string; count: number }[];
};

async function api<T>(path: string): Promise<{ data: T; meta?: Meta } | null> {
  "use cache";
  cacheLife("minutes");
  const r = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(8_000) });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return (await r.json()) as { data: T; meta?: Meta };
}
const probaj = <T,>(path: string) => api<T>(path).catch(() => null);

/** slug → id za grupe i brendove (javne liste, keš par minuta) */
async function mape() {
  const [g, b] = await Promise.all([probaj<{ id: string; slug: string }[]>("/categories"), probaj<{ id: string; slug: string }[]>("/brands/active")]);
  return { grupe: new Map((g?.data ?? []).map((x) => [x.slug, x.id])), brendovi: new Map((b?.data ?? []).map((x) => [x.slug, x.id])) };
}

function upit(f: Filteri, m: Awaited<ReturnType<typeof mape>>) {
  const sp = new URLSearchParams({ groupByModel: "true" });
  const ids = (slugovi: string[], mapa: Map<string, string>) => slugovi.map((s) => mapa.get(s)).filter((x): x is string => !!x);
  if (f.grupa.length) sp.set("groupIds", ids(f.grupa, m.grupe).join(",") || "-");
  if (f.brend.length) sp.set("brandIds", ids(f.brend, m.brendovi).join(",") || "-");
  if (f.velicina.length) sp.set("sizes", f.velicina.join(","));
  if (f.boja.length) sp.set("colors", f.boja.join(","));
  if (f.standard.length) sp.set("standards", f.standard.join(","));
  if (f.materijal.length) sp.set("materials", f.materijal.join(","));
  if (f.pol.length) sp.set("genders", f.pol.join(","));
  if (f.akcija) sp.set("onPromotion", "true");
  if (f.cenaOd != null) sp.set("minPrice", String(f.cenaOd));
  if (f.cenaDo != null) sp.set("maxPrice", String(f.cenaDo));
  return sp;
}

const opcije = (o: ApiFacete["size"] | undefined) => (o ?? []).map((x) => ({ value: String(x.value), label: String(x.label ?? x.value), count: Number(x.count) || 0 }));

export async function getKatalog(f: Filteri, sort: Sort, strana: number): Promise<Katalog> {
  const m = await mape();
  const sp = upit(f, m);
  const lista = new URLSearchParams(sp);
  lista.set("page", String(strana));
  lista.set("limit", String(PO_STRANI));
  if (sort !== "recommended") lista.set("sort", sort);
  const [proizvodi, fasete] = await Promise.all([probaj<ApiStavka[]>(`/products?${lista}`), probaj<ApiFacete>(`/filters?${sp}`)]);

  // backend ne radi ili je katalog prazan → artikli sa naslovne
  if (!proizvodi || !fasete || (await praznaBaza(fasete.data.total))) return lokalniKatalog(f, sort, strana);

  const d = fasete.data;
  return {
    lokalno: false,
    meta: proizvodi.meta ?? { page: strana, limit: PO_STRANI, total: proizvodi.data.length, totalPages: 1 },
    items: proizvodi.data.map(uKarticu),
    facete: {
      total: d.total,
      price: { min: d.price.min ?? 0, max: d.price.max ?? 0 },
      groups: d.groups.map((g) => ({ slug: g.slug, name: g.name, count: Number(g.count) })),
      brands: d.brands.map((b) => ({ slug: b.slug, name: b.name, logo: b.logoUrl ? fileUrl(b.logoUrl) : null, count: Number(b.count) })),
      size: opcije(d.size),
      color: opcije(d.color),
      standard: opcije(d.standard),
      material: opcije(d.material),
      gender: opcije(d.gender),
      onPromotion: d.onPromotion.find((o) => o.value === "true")?.count ?? 0,
    },
  };
}

const uKarticu = (p: ApiStavka): Kartica => ({
  slug: p.slug,
  name: p.name,
  brand: p.brand?.name ?? null,
  brandLogo: p.brand?.logoUrl ? fileUrl(p.brand.logoUrl) : null,
  group: p.groups?.[0]?.name ?? "",
  price: p.priceDisplay?.price ?? 0,
  basePrice: p.priceDisplay?.basePrice ?? null,
  priceLabel: p.priceDisplay?.label ?? "sa PDV-om",
  image: p.image,
  inStock: p.inStock,
  deliveryTime: p.deliveryTime,
  shipping: p.shipping,
  badges: (p.badges ?? []).map((b) => b.name),
});

/* ---------- izdvojeno na naslovnoj ---------- */

export type IzdvojenTab = { key: string; label: string; items: Kartica[] };
type ApiGrupa = { id: string; slug: string; name: string; parentId: string | null; sortOrder: number };

const IZDVOJENO_TABOVA = 4;
const IZDVOJENO_PO_TABU = 4;

/**
 * Tabovi „Izdvajamo iz ponude": glavne grupe artikala (sa svim podgrupama), po 4 modela koja prodavnica prikazuje
 * (imaju cenu). Kada je u ponudi samo jedna glavna grupa (npr. „Radna oprema"), tabovi su njene podgrupe.
 * Grupe bez artikala se preskaču; bez ijednog artikla sekcija se ne prikazuje.
 */
export async function getIzdvojeno(): Promise<IzdvojenTab[]> {
  const grupe = (await probaj<ApiGrupa[]>("/categories"))?.data ?? [];
  const deca = new Map<string | null, ApiGrupa[]>();
  for (const g of [...grupe].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "sr"))) {
    deca.set(g.parentId ?? null, [...(deca.get(g.parentId ?? null) ?? []), g]);
  }
  const saPodgrupama = (g: ApiGrupa): string[] => [g.id, ...(deca.get(g.id) ?? []).flatMap(saPodgrupama)];

  const tabovi = async (kandidati: ApiGrupa[]) =>
    (
      await Promise.all(
        kandidati.map(async (g) => {
          const sp = new URLSearchParams({ groupByModel: "true", limit: String(IZDVOJENO_PO_TABU), groupIds: saPodgrupama(g).join(",") });
          const r = await probaj<ApiStavka[]>(`/products?${sp}`);
          return { key: g.slug, label: g.name, items: (r?.data ?? []).map(uKarticu) };
        }),
      )
    ).filter((t) => t.items.length);

  let rezultat = await tabovi(deca.get(null) ?? []);
  if (rezultat.length === 1) {
    const koren = grupe.find((g) => g.slug === rezultat[0].key);
    const podgrupe = koren ? await tabovi(deca.get(koren.id) ?? []) : [];
    if (podgrupe.length > 1) rezultat = podgrupe;
  }
  return rezultat.slice(0, IZDVOJENO_TABOVA);
}

/** da li u bazi uopšte ima artikala (filteri mogu dati nulu i kad katalog postoji) */
async function praznaBaza(total: number) {
  if (total > 0) return false;
  const sve = await probaj<ApiFacete>("/filters?groupByModel=true");
  return !sve || sve.data.total === 0;
}

/* ---------- artikli sa naslovne (dok katalog nije uvezen) ---------- */

// grupa za svaki artikal sa naslovne: tabovi odeća/obuća/rukavice su po jedna grupa, „Zaštita" je mešana pa ide po artiklu
const GRUPA_TABA: Record<string, string> = { odeca: "zastitna-i-radna-odeca", obuca: "zastitna-i-radna-obuca", rukavice: "zastitne-i-radne-rukavice" };
const GRUPA_ARTIKLA: Record<string, string> = {
  "slem-3m-g3000-sa-ventilacijom-i-pin-lock-trakom": "zastita-glave",
  "climax-420-automatska-maska-za-zavarivanje": "zastita-ociju-i-lica",
  "antifon-peltor-optime-iii": "zastita-sluha",
  "komplet-blockmax-ac-010": "zastita-od-pada",
};
const slugBrenda = (ime: string) => lokalniBrendovi.find((b) => b.name.toLowerCase() === ime.toLowerCase())?.slug ?? ime.toLowerCase().replace(/\s+/g, "-");
const LOKALNO = productTabs.flatMap((t, ti) =>
  t.products.map((p, i) => ({ p, red: ti * 100 + i, grupa: GRUPA_ARTIKLA[p.slug] ?? GRUPA_TABA[t.key], brend: p.brand ? slugBrenda(p.brand) : null })),
);

function lokalniKatalog(f: Filteri, sort: Sort, strana: number): Katalog {
  const uCeni = (c: number) => (f.cenaOd == null || c >= f.cenaOd) && (f.cenaDo == null || c <= f.cenaDo);
  const prolazi = (x: (typeof LOKALNO)[number], bez?: "grupa" | "brend" | "cena") =>
    (bez === "grupa" || !f.grupa.length || f.grupa.includes(x.grupa)) &&
    (bez === "brend" || !f.brend.length || (x.brend != null && f.brend.includes(x.brend))) &&
    (bez === "cena" || uCeni(x.p.price)) &&
    // ostali filteri ne postoje za ove artikle - izbor bilo čega od njih znači da nema pogodaka
    !f.velicina.length && !f.boja.length && !f.standard.length && !f.materijal.length && !f.pol.length && !f.akcija;

  const nadjeno = LOKALNO.filter((x) => prolazi(x));
  const poredjano = [...nadjeno].sort((a, b) =>
    sort === "price_asc" ? a.p.price - b.p.price : sort === "price_desc" ? b.p.price - a.p.price : sort === "brand" ? (a.p.brand ?? "~").localeCompare(b.p.brand ?? "~", "sr") : a.red - b.red,
  );
  const totalPages = Math.max(1, Math.ceil(poredjano.length / PO_STRANI));
  const strana1 = poredjano.slice((strana - 1) * PO_STRANI, strana * PO_STRANI);

  const brojPo = <K extends string>(lista: (typeof LOKALNO)[number][], kljuc: (x: (typeof LOKALNO)[number]) => K | null) => {
    const m = new Map<K, number>();
    for (const x of lista) {
      const k = kljuc(x);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const poGrupi = brojPo(LOKALNO.filter((x) => prolazi(x, "grupa")), (x) => x.grupa);
  const poBrendu = brojPo(LOKALNO.filter((x) => prolazi(x, "brend")), (x) => x.brend);
  const cene = LOKALNO.map((x) => x.p.price);

  return {
    lokalno: true,
    meta: { page: strana, limit: PO_STRANI, total: poredjano.length, totalPages },
    items: strana1.map(({ p }) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand ?? null,
      brandLogo: lokalniBrendovi.find((b) => b.name === p.brand)?.logo ?? null,
      group: p.group,
      price: p.price,
      basePrice: null,
      priceLabel: "sa PDV-om",
      image: p.image,
      inStock: p.inStock,
      deliveryTime: null,
      shipping: null,
      badges: p.tag ? [p.tag] : [],
    })),
    facete: {
      total: poredjano.length,
      price: { min: Math.min(...cene), max: Math.max(...cene) },
      groups: categories.filter((c) => poGrupi.has(c.slug) || f.grupa.includes(c.slug)).map((c) => ({ slug: c.slug, name: c.name, count: poGrupi.get(c.slug) ?? 0 })),
      brands: [...poBrendu.keys()]
        .map((slug) => {
          const b = lokalniBrendovi.find((x) => x.slug === slug);
          return { slug, name: b?.name ?? LOKALNO.find((x) => x.brend === slug)?.p.brand ?? slug, logo: b?.logo ?? null, count: poBrendu.get(slug) ?? 0 };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "sr")),
      size: [],
      color: [],
      standard: [],
      material: [],
      gender: [],
      onPromotion: 0,
    },
  };
}
