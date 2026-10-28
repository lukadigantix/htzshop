import { cacheLife } from "next/cache";
import { brands as lokalniLogotipi } from "@/data/site";
import { API_URL, fileUrl } from "./api";

/**
 * Brendovi sa backenda: GET /brands/active (naziv, opis, SEO, logo, sajt proizvođača) i broj modela po brendu iz
 * GET /filters (isti broj koji pokazuje filter prodavnice). Logo iz admina ima prednost; dok ga nema, koristi se logo
 * sa starog sajta (data/site.ts) ako se slug poklapa, a bez toga strana crta ime brenda kao znak.
 */
export type Brend = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  opis: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  website: string | null;
  /** broj proizvoda (modela) u prodavnici */
  count: number;
};

type ApiBrend = { id: string; slug: string; name: string; logoUrl: string | null; description: string | null; seoTitle: string | null; seoDescription: string | null; website: string | null };

async function procitaj<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(8_000) });
    if (!r.ok) return null;
    return ((await r.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

/** „TEKTON PRO" → „Tekton Pro": backend iz uvoza piše velikim slovima; kratki nazivi (3M, CRV, EON) ostaju kakvi jesu */
export function lepoIme(name: string) {
  if (name !== name.toUpperCase() || name.replace(/[^A-Za-zŠĐČĆŽšđčćž]/g, "").length <= 4) return name;
  return name.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Aktivni brendovi, najviše proizvoda prvo. `null` = backend ne odgovara. */
export async function getBrendovi(): Promise<Brend[] | null> {
  "use cache";
  cacheLife("minutes");
  const [lista, fasete] = await Promise.all([procitaj<ApiBrend[]>("/brands/active"), procitaj<{ brands: { id: string; count: number | string }[] }>("/filters?groupByModel=true")]);
  if (!lista) return null;
  const broj = new Map((fasete?.brands ?? []).map((b) => [b.id, Number(b.count) || 0]));
  return lista
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      name: lepoIme(b.name),
      logo: b.logoUrl ? fileUrl(b.logoUrl) : (lokalniLogotipi.find((l) => l.slug === b.slug)?.logo ?? null),
      opis: b.description?.trim() || null,
      seoTitle: b.seoTitle?.trim() || null,
      seoDescription: b.seoDescription?.trim() || null,
      website: b.website?.trim() || null,
      count: broj.get(b.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "sr"));
}

export async function getBrend(slug: string): Promise<Brend | null | undefined> {
  const sve = await getBrendovi();
  if (!sve) return undefined;
  return sve.find((b) => b.slug === slug) ?? null;
}
