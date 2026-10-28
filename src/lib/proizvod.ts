import { cacheLife } from "next/cache";
import { API_URL } from "./api";
import { categories, productTabs, type Product } from "@/data/site";

/**
 * Stranica proizvoda: `GET /products/slug/:slug` (artikal + varijante istog modela + slični).
 * Svaka veličina i boja je poseban artikal sa svojim slug-om, pa birač varijante vodi na drugi URL.
 */
export type Varijanta = { slug: string; size: string | null; color: string | null; inStock: boolean; price: number | null; image: string | null };
export type Proizvod = {
  slug: string;
  code: string | null;
  name: string;
  /** HTML iz editora u adminu */
  description: string | null;
  brand: { name: string; slug: string } | null;
  group: { name: string; slug: string } | null;
  images: string[];
  price: number | null;
  /** precrtana cena kad je artikal na akciji */
  basePrice: number | null;
  /** „sa PDV-om" ili „+ PDV" */
  priceLabel: string;
  inStock: boolean;
  deliveryTime: string | null;
  shippingLabel: string | null;
  badges: { code: string; name: string }[];
  size: string | null;
  color: string | null;
  /** tehnički podaci za tabelu: standard, materijal, pol, poreklo… pa ostale karakteristike iz admina */
  specs: { key: string; value: string }[];
  /** „Zašto baš ovaj - Prednosti": HTML i slika */
  advantages: string | null;
  advantagesImage: string | null;
  catalogPdfUrl: string | null;
  videoEmbedUrl: string | null;
  rating: { average: number; count: number } | null;
  variants: Varijanta[];
  similar: Product[];
};

type ApiProizvod = {
  slug: string;
  code: string;
  name: string;
  description: string | null;
  brand: { name: string; slug: string } | null;
  groups?: { name: string; slug: string }[];
  images: string[];
  image: string | null;
  priceDisplay: { price: number | null; basePrice: number | null; label: string } | null;
  inStock: boolean;
  deliveryTime: string | null;
  shipping: { free: boolean; label: string | null } | null;
  badges: { code: string; name: string }[];
  size: string | null;
  color: string | null;
  standard: string | null;
  material: string | null;
  genderLabel: string | null;
  countryOfOrigin: string | null;
  importer: string | null;
  manufacturerCode: string | null;
  ean: string | null;
  weightKg: number | null;
  specifications: { key: string; value: string }[];
  advantages: string | null;
  advantagesImageUrl: string | null;
  catalogPdfUrl: string | null;
  video: { embedUrl: string | null } | null;
  ratingAverage: number | null;
  ratingCount: number;
  variants?: { slug: string; size: string | null; color: string | null; inStock: boolean; finalPrice: number | null; image: string | null }[];
  related?: { similar?: ApiProizvod[] };
};

const uKarticu = (p: ApiProizvod): Product => ({
  slug: p.slug,
  name: p.name,
  group: p.groups?.[0]?.name ?? "",
  brand: p.brand?.name,
  price: p.priceDisplay?.price ?? 0,
  image: p.image ?? "/images/logo/htz-logo.svg",
  inStock: p.inStock,
});

function izApi(p: ApiProizvod): Proizvod {
  const specs = [
    { key: "Standard", value: p.standard },
    { key: "Materijal", value: p.material },
    { key: "Pol", value: p.genderLabel },
    { key: "Zemlja porekla", value: p.countryOfOrigin },
    { key: "Uvoznik", value: p.importer },
    { key: "Kataloški broj", value: p.manufacturerCode },
    { key: "EAN", value: p.ean },
    { key: "Težina", value: p.weightKg != null ? `${String(p.weightKg).replace(".", ",")} kg` : null },
  ].filter((s): s is { key: string; value: string } => Boolean(s.value));
  return {
    slug: p.slug,
    code: p.code,
    name: p.name,
    description: p.description,
    brand: p.brand ? { name: p.brand.name, slug: p.brand.slug } : null,
    group: p.groups?.[0] ? { name: p.groups[0].name, slug: p.groups[0].slug } : null,
    images: p.images,
    price: p.priceDisplay?.price ?? null,
    basePrice: p.priceDisplay?.basePrice ?? null,
    priceLabel: p.priceDisplay?.label ?? "sa PDV-om",
    inStock: p.inStock,
    deliveryTime: p.deliveryTime,
    shippingLabel: p.shipping?.label ?? null,
    badges: p.badges.map((b) => ({ code: b.code, name: b.name })),
    size: p.size,
    color: p.color,
    specs: [...specs, ...p.specifications.filter((s) => s.key && s.value)],
    advantages: p.advantages,
    advantagesImage: p.advantagesImageUrl,
    catalogPdfUrl: p.catalogPdfUrl,
    videoEmbedUrl: p.video?.embedUrl ?? null,
    rating: p.ratingCount > 0 && p.ratingAverage != null ? { average: p.ratingAverage, count: p.ratingCount } : null,
    variants: (p.variants ?? []).map((v) => ({ slug: v.slug, size: v.size, color: v.color, inStock: v.inStock, price: v.finalPrice, image: v.image })),
    similar: (p.related?.similar ?? []).slice(0, 4).map(uKarticu),
  };
}

/**
 * Dok katalog nije uvezen u backend, artikli sa naslovne (data/site.ts) imaju svoju stranicu sa onim što se o njima zna
 * (naziv, cena, slika, stanje); opis, specifikacije i varijante se tada ne prikazuju.
 */
const lokalno = productTabs.flatMap((t) => t.products.map((p) => ({ p, tab: t.key })));
const grupaTaba: Record<string, string> = {
  odeca: "zastitna-i-radna-odeca",
  obuca: "zastitna-i-radna-obuca",
  rukavice: "zastitne-i-radne-rukavice",
};
function izLokalnih(slug: string): Proizvod | null {
  const nadjen = lokalno.find((x) => x.p.slug === slug);
  if (!nadjen) return null;
  const { p, tab } = nadjen;
  const grupa = categories.find((c) => c.slug === grupaTaba[tab]);
  return {
    slug: p.slug,
    code: null,
    name: p.name,
    description: null,
    brand: p.brand ? { name: p.brand, slug: p.brand.toLowerCase().replace(/\s+/g, "-") } : null,
    group: grupa ? { name: grupa.name, slug: grupa.slug } : null,
    images: [p.image],
    price: p.price,
    basePrice: null,
    priceLabel: "sa PDV-om",
    inStock: p.inStock,
    deliveryTime: null,
    shippingLabel: null,
    badges: p.tag ? [{ code: "tag", name: p.tag }] : [],
    size: null,
    color: null,
    specs: [],
    advantages: null,
    advantagesImage: null,
    catalogPdfUrl: null,
    videoEmbedUrl: null,
    rating: null,
    variants: [],
    similar: lokalno.filter((x) => x.tab === tab && x.p.slug !== slug).map((x) => x.p),
  };
}

async function fetchProizvod(slug: string): Promise<Proizvod | null> {
  "use cache";
  cacheLife("minutes");
  const r = await fetch(`${API_URL}/products/slug/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(8_000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Proizvod ${slug}: HTTP ${r.status}`);
  const { data } = (await r.json()) as { data: ApiProizvod };
  return izApi(data);
}

/** `null` = nema takvog artikla (ni u backendu ni među artiklima sa naslovne). Kad backend ne odgovara, greška se ne kešira. */
export async function getProizvod(slug: string): Promise<Proizvod | null> {
  try {
    return (await fetchProizvod(slug)) ?? izLokalnih(slug);
  } catch (err) {
    console.error("Proizvod nije učitan:", err);
    return izLokalnih(slug);
  }
}

/** slug-ovi za generateStaticParams (Cache Components traži bar jedan) */
export const lokalniSlugovi = () => lokalno.map((x) => x.p.slug);
