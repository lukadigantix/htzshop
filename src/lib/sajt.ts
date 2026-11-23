import { cacheLife, cacheTag } from "next/cache";
import { KATALOG, KES_KATALOGA } from "./kes";
import { API_URL } from "./api";
import { contact } from "@/data/site";

/**
 * Admin → Podešavanja → Sajt i Firma: podnožje, kontakt i podaci firme (`GET /footer`) i radno vreme
 * (`GET /working-hours/display`). Polje koje je u adminu prazno (ili backend ne odgovara) uzima vrednost iz data/site.ts,
 * pa sajt nikad ne ostaje bez adrese ili telefona. Prag besplatne dostave i brojke (artikli, brendovi) postoje samo iz
 * backenda: bez njih sajt ih ne pominje.
 */
export type RadnoVreme = { days: string; hours: string; isOpen: boolean; note: string | null };
/** jedan dan u nedelji (1 = ponedeljak … 7 = nedelja), vreme kao „08:00"; za status „otvoreno/zatvoreno" */
export type Dan = { day: number; isOpen: boolean; open: string | null; close: string | null };
export type Sajt = {
  name: string;
  description: string;
  street: string;
  city: string;
  phone: string;
  phoneHref: string;
  email: string;
  pib: string;
  mb: string;
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  hours: RadnoVreme[];
  week: Dan[];
  mapsHref: string;
  /** poslovno ime iz APR-a (pravne strane, JSON-LD) */
  legalName: string;
  /** drugi telefon (brendiranje odeće) */
  phone2: string;
  phone2Href: string;
  founded: number;
  /** radnja na mapi */
  map: { lat: number; lng: number };
  /** tekući račun, samo kada je u adminu uključen prikaz */
  bank: { name: string; account: string } | null;
  /** besplatna dostava iznad ovog iznosa (RSD); null = nema besplatne dostave */
  freeShippingFrom: number | null;
  customersRetail: number | null;
  customersWholesale: number | null;
  /** modeli i brendovi koje prodavnica prikazuje; null kada backend ne odgovara */
  productCount: number | null;
  brandCount: number | null;
};

type ApiFooter = Partial<Record<"description" | "facebook" | "instagram" | "twitter" | "tiktok" | "name" | "street" | "city" | "phone" | "email" | "pib" | "mb" | "legalName" | "phone2", string>> & {
  founded?: number | null;
  map?: { lat: number; lng: number } | null;
  bank?: { name: string; account: string } | null;
  freeShippingFrom?: number | null;
  customersRetail?: number | null;
  customersWholesale?: number | null;
  productCount?: number;
  brandCount?: number;
};
type ApiSati = { days: string; hours: string; isOpen: number | boolean; note: string | null }[];
type ApiDani = { dayOfWeek: number; isOpen: number | boolean; openTime: string | null; closeTime: string | null }[];

// „035/88-15-322" → tel:+381358815322 (domaći broj bez nule, sa pozivnim za Srbiju)
const telHref = (phone: string) => {
  const cifre = phone.replace(/[^\d+]/g, "");
  if (cifre.startsWith("+")) return `tel:${cifre}`;
  if (cifre.startsWith("00")) return `tel:+${cifre.slice(2)}`;
  return `tel:+381${cifre.replace(/^0/, "")}`;
};

async function api<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(5_000) });
    if (!r.ok) return null;
    return ((await r.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

export async function getSajt(): Promise<Sajt> {
  "use cache";
  cacheLife(KES_KATALOGA);
  cacheTag(KATALOG);
  const [f, sati, dani] = await Promise.all([api<ApiFooter>("/footer"), api<ApiSati>("/working-hours/display"), api<ApiDani>("/working-hours")]);
  const v = (x: string | undefined, rezerva: string) => x?.trim() || rezerva;

  const street = v(f?.street, contact.address);
  const city = v(f?.city, contact.city);
  const phone = v(f?.phone, contact.phone);
  const adresa = encodeURIComponent(`${street}, ${city}`);
  return {
    name: v(f?.name, contact.name),
    description: v(f?.description, ""),
    street,
    city,
    phone,
    phoneHref: f?.phone?.trim() ? telHref(phone) : contact.phoneHref,
    email: v(f?.email, contact.email),
    pib: v(f?.pib, contact.pib),
    mb: v(f?.mb, contact.mb),
    facebook: v(f?.facebook, contact.facebook),
    instagram: v(f?.instagram, contact.instagram),
    twitter: v(f?.twitter, ""),
    tiktok: v(f?.tiktok, ""),
    hours: sati?.length
      ? sati.map((s) => ({ days: s.days, hours: s.hours, isOpen: Boolean(s.isOpen), note: s.note }))
      : contact.hours.map((h) => ({ days: h.days, hours: h.time, isOpen: h.time !== "zatvoreno", note: null })),
    week: (dani ?? []).map((d) => ({ day: d.dayOfWeek, isOpen: Boolean(d.isOpen), open: d.openTime, close: d.closeTime })),
    mapsHref: `https://www.google.com/maps/search/?api=1&query=${adresa}`,
    legalName: v(f?.legalName, contact.legalName),
    phone2: v(f?.phone2, contact.phone2),
    phone2Href: f?.phone2?.trim() ? telHref(f.phone2) : contact.phone2Href,
    founded: f?.founded ?? contact.founded,
    map: f?.map ?? contact.coords,
    bank: f?.bank ?? null,
    freeShippingFrom: f?.freeShippingFrom ?? null,
    customersRetail: f?.customersRetail ?? null,
    customersWholesale: f?.customersWholesale ?? null,
    productCount: f?.productCount ?? null,
    brandCount: f?.brandCount ?? null,
  };
}

/** 8000 → „8.000 RSD" */
export const iznos = (n: number) => `${n.toLocaleString("sr-RS").replace(/,/g, ".")} RSD`;
/** 1841 → „1.800+" (zaokruženo naniže na stotinu, za brojke tipa „više od") */
export const okruglo = (n: number) => (n >= 100 ? `${(Math.floor(n / 100) * 100).toLocaleString("sr-RS").replace(/,/g, ".")}+` : String(n));
