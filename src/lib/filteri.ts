/**
 * Filteri prodavnice: stanje iz URL-a (kratki srpski parametri: ?grupa=bluze&brend=3m,cerva&velicina=42,43&cena=2000-8000),
 * nazad u URL i u upit za GET /products i GET /filters. Čist modul bez API-ja - koristi ga i klijentski panel filtera.
 * Isti obrazac kao lib/filteri.ts na klikdogume, sa HTZ poljima (veličina, boja, standard, materijal, pol) umesto guma.
 */

export type Opcija = { value: string; label: string; count: number };

/** Odgovor GET /filters, sveden na ono što panel crta. Backend svaku fasetu broji bez sopstvenog filtera. */
export type Facete = {
  total: number;
  /** opseg sa PDV-om, bez filtera cene */
  price: { min: number; max: number };
  groups: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string; logo: string | null; count: number }[];
  size: Opcija[];
  color: Opcija[];
  standard: Opcija[];
  material: Opcija[];
  gender: Opcija[];
  /** broj artikala na akciji (0 = nema akcija, prekidač se ne nudi) */
  onPromotion: number;
};

export type Filteri = {
  /** slugovi grupa artikala */
  grupa: string[];
  /** slugovi brendova */
  brend: string[];
  velicina: string[];
  boja: string[];
  standard: string[];
  materijal: string[];
  /** muski / zenski / unisex */
  pol: string[];
  akcija: boolean | null;
  cenaOd: number | null;
  cenaDo: number | null;
};

export const PRAZNI: Filteri = { grupa: [], brend: [], velicina: [], boja: [], standard: [], materijal: [], pol: [], akcija: null, cenaOd: null, cenaDo: null };

const LISTE = ["grupa", "brend", "velicina", "boja", "standard", "materijal", "pol"] as const;
type Lista = (typeof LISTE)[number];
/** URL parametri filtera - sve ostalo (sort, q) strana prenosi netaknuto */
export const PARAMETRI = [...LISTE, "akcija", "cena"] as const;

export type Sort = "recommended" | "price_asc" | "price_desc" | "newest" | "brand";
export const SORT: { id: Sort; label: string }[] = [
  { id: "recommended", label: "Preporučeno" },
  { id: "price_asc", label: "Cena: od najniže" },
  { id: "price_desc", label: "Cena: od najviše" },
  { id: "newest", label: "Najnovije" },
  { id: "brand", label: "Brend A-Ž" },
];
export const sortIzUrl = (v: string | undefined): Sort => SORT.find((s) => s.id === v)?.id ?? "recommended";

type Ulaz = URLSearchParams | Record<string, string | string[] | undefined>;
const uzmi = (sp: Ulaz, k: string): string => {
  if (sp instanceof URLSearchParams) return sp.get(k) ?? "";
  const v = sp[k];
  return (Array.isArray(v) ? v[0] : v) ?? "";
};
const lista = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))];

export function filteriIzUrl(sp: Ulaz): Filteri {
  const f: Filteri = { ...PRAZNI };
  for (const k of LISTE) f[k] = lista(uzmi(sp, k));
  const akcija = uzmi(sp, "akcija");
  f.akcija = akcija === "1" || akcija === "da" ? true : null;
  const [od, doo] = uzmi(sp, "cena").split("-").map((x) => (x === "" ? NaN : Number(x)));
  f.cenaOd = Number.isFinite(od) && od > 0 ? od : null;
  f.cenaDo = Number.isFinite(doo) && doo > 0 ? doo : null;
  return f;
}

/** novi upit: filteri iz `f`, ostali parametri (sort, q) ostaju; strana se vraća na prvu */
export function filteriUUrl(f: Filteri, sp: URLSearchParams): URLSearchParams {
  const q = new URLSearchParams(sp);
  for (const k of PARAMETRI) q.delete(k);
  q.delete("strana");
  for (const k of LISTE) if (f[k].length) q.set(k, f[k].join(","));
  if (f.akcija) q.set("akcija", "1");
  if (f.cenaOd != null || f.cenaDo != null) q.set("cena", `${f.cenaOd ?? ""}-${f.cenaDo ?? ""}`);
  return q;
}

export const brojFiltera = (f: Filteri) => LISTE.reduce((a, k) => a + f[k].length, 0) + (f.akcija ? 1 : 0) + (f.cenaOd != null || f.cenaDo != null ? 1 : 0);

export const rsd = (n: number) => `${n.toLocaleString("sr-RS").replace(/,/g, ".")} RSD`;

export const POL_LABEL: Record<string, string> = { muski: "Muški", zenski: "Ženski", unisex: "Unisex" };

/** liste filtera koje se nižu u panel i u čipove */
export const ODELJCI_LISTE: { k: Exclude<Lista, "grupa" | "brend">; faseta: "size" | "color" | "standard" | "material" | "gender"; naslov: string }[] = [
  { k: "velicina", faseta: "size", naslov: "Veličina" },
  { k: "boja", faseta: "color", naslov: "Boja" },
  { k: "pol", faseta: "gender", naslov: "Pol" },
  { k: "standard", faseta: "standard", naslov: "Standard" },
  { k: "materijal", faseta: "material", naslov: "Materijal" },
];
