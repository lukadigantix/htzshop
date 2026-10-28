import { cacheLife } from "next/cache";
import { API_URL } from "./api";
import { productTabs } from "@/data/site";

/**
 * Pretraga sa backenda: `GET /search?q=` (artikli + grupe, min 2 znaka; backend loguje upit za popularne) i `GET /search/popular`.
 * Modal u zaglavlju zove `/api/pretraga` (tanka ruta). Isti tok kao na klikdogume.
 */
/** `price` je cena za prikaz: bez PDV-a kad je `plusPdv`, inače sa PDV-om */
export type PogodakProizvod = { slug: string; name: string; brand?: string; group: string; price: number | null; plusPdv?: boolean; image: string | null };
export type PogodakGrupa = { name: string; slug: string };
export type Pretraga = { query: string; products: PogodakProizvod[]; categories: PogodakGrupa[]; popular: string[] };

type ApiPogodak = {
  slug: string;
  name: string;
  image: string | null;
  brand: { name: string } | null;
  priceDisplay?: { price: number | null; withVat: boolean } | null;
};
type SearchOdgovor = { query: string; popularSearches?: string[]; categories: { id: string; name: string; slug: string }[]; products: ApiPogodak[] };

const uPogodak = (p: ApiPogodak): PogodakProizvod => ({
  slug: p.slug,
  name: p.name,
  brand: p.brand?.name,
  group: "",
  price: p.priceDisplay?.price ?? null,
  plusPdv: p.priceDisplay ? !p.priceDisplay.withVat : false,
  image: p.image,
});

/**
 * Dok katalog nije uvezen u backend, /search vraća nula artikala - tada se traži po artiklima sa naslovne (data/site.ts),
 * da modal ne bude prazan. Kad backend ima artikle, ovo se ne koristi.
 */
const lokalno = productTabs.flatMap((t) => t.products);
function lokalniPogoci(q: string, limit: number): PogodakProizvod[] {
  const t = q.toLowerCase();
  return lokalno
    .filter((p) => [p.name, p.group, p.brand ?? ""].some((s) => s.toLowerCase().includes(t)))
    .slice(0, limit)
    .map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, group: p.group, price: p.price, image: p.image }));
}

/** `null` = API ne odgovara. */
export async function pretrazi(q: string, productLimit = 6, categoryLimit = 4): Promise<Pretraga | null> {
  const sp = new URLSearchParams({ q, productLimit: String(productLimit), categoryLimit: String(categoryLimit) });
  try {
    const r = await fetch(`${API_URL}/search?${sp}`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (!r.ok) return null;
    const { data } = (await r.json()) as { data: SearchOdgovor };
    const products = (data.products ?? []).map(uPogodak);
    return {
      query: data.query ?? q,
      products: products.length ? products : lokalniPogoci(q, productLimit),
      categories: (data.categories ?? []).map((k) => ({ name: k.name, slug: k.slug })),
      popular: (data.popularSearches ?? []).filter(smislenPojam),
    };
  } catch {
    return null;
  }
}

/**
 * Pojam vredi prikazati drugima? Backend loguje sve što je iko ukucao, pa u „popularno" upadne i smeće:
 * „zzzz", šifre artikala („55390"). Puštamo reči (bar tri znaka); same cifre i ponovljeni isti znak se izbacuju.
 */
function smislenPojam(s: string): boolean {
  const t = s.trim();
  if (t.length < 3 || t.length > 40) return false;
  const zbijeno = t.replace(/\s+/g, "");
  if (/^(.)\1+$/.test(zbijeno)) return false;
  if (/^\d+$/.test(zbijeno)) return false;
  return true;
}

async function fetchPopularne(limit: number): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  // tražimo više nego što prikazujemo jer filter izbaci deo
  const r = await fetch(`${API_URL}/search/popular?limit=${limit * 3}&days=30`, { signal: AbortSignal.timeout(5_000) });
  if (!r.ok) throw new Error(`Popularne pretrage: HTTP ${r.status}`);
  const { data } = (await r.json()) as { data: unknown[] };
  const vidjeno = new Set<string>();
  return data
    .filter((s): s is string => typeof s === "string" && smislenPojam(s))
    .map((s) => s.trim())
    .filter((s) => !vidjeno.has(s.toLowerCase()) && vidjeno.add(s.toLowerCase()))
    .slice(0, limit);
}

/** Najtraženiji pojmovi (GET /search/popular, 30 dana), bez smeća iz loga. Prazno kad API ne odgovara (greška se ne kešira). */
export async function getPopularnePretrage(limit = 6): Promise<string[]> {
  try {
    return await fetchPopularne(limit);
  } catch {
    return [];
  }
}
