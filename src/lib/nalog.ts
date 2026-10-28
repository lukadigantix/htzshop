import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fileUrl, PORUKA_SERVER, pozovi } from "./api";
import { normalizujBroj, SESIJA, type Adresa, type Korisnik, type PorudzbinaNaloga, type Posiljka, type Reklamacija } from "./nalog-deo";

/**
 * Nalog kupca na serveru (po uzoru na klikdogume lib/auth.ts i lib/porudzbine-api.ts). JWT backenda je u httpOnly kolačiću
 * `htz_sesija`; svaki poziv ga nosi u Authorization. Funkcije su keširane po zahtevu (React `cache`), pa okvir naloga
 * i strana dele jedan poziv. Rezultat `null` = backend ne odgovara (strana tada kaže da proba ponovo).
 */

/** Backend izdaje token na 7 dana (JWT_EXPIRES_IN) - kolačić traje isto. */
const TRAJANJE = 60 * 60 * 24 * 7;

export const sesijaOpcije = () => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRAJANJE });

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESIJA)?.value ?? null;
}

/**
 * GET /auth/me proverava token i vraća sveže podatke. Razlikuje istekao token (kupac je gost) od backenda koji ne odgovara
 * (kupac ostaje prijavljen, strana kaže da pokuša ponovo).
 */
const proveriSesiju = cache(async (): Promise<{ korisnik: Korisnik } | { korisnik: null; istekao: boolean }> => {
  const token = await getToken();
  if (!token) return { korisnik: null, istekao: false };
  const r = await pozovi<Korisnik>("/auth/me", { token, timeout: 8_000 });
  if (r.ok) return { korisnik: r.data };
  return { korisnik: null, istekao: r.status === 401 || r.status === 403 || r.status === 404 };
});

/** Prijavljen kupac ili null (gost, istekao token ili backend ne odgovara) - za naplatu i strane prijave. */
export async function getKorisnik(): Promise<Korisnik | null> {
  return (await proveriSesiju()).korisnik;
}

/**
 * Za strane naloga: prijavljen kupac, ili preusmerenje. Bez sesije → prijava; istekao token → /api/nalog/istekao (briše
 * kolačiće); backend ne odgovara → greška (moj-nalog/error.tsx nudi „Pokušajte ponovo").
 */
export async function zahtevajKorisnika(putanja: string): Promise<Korisnik> {
  const s = await proveriSesiju();
  if (s.korisnik) return s.korisnik;
  const nazad = encodeURIComponent(putanja);
  if (!(await getToken())) redirect(`/prijava/?nazad=${nazad}`);
  if (s.istekao) redirect(`/api/nalog/istekao?nazad=${nazad}`);
  throw new Error(PORUKA_SERVER);
}

type ApiStavka = Omit<PorudzbinaNaloga["items"][number], "product" | "unitPrice" | "totalPrice"> & {
  unitPrice: number | string;
  totalPrice: number | string;
  product?: { slug: string; images?: string[] | null } | null;
};
export type ApiPorudzbina = Omit<PorudzbinaNaloga, "items" | "subtotalAmount" | "discountAmount" | "shippingCost" | "totalAmount" | "canComplain"> & {
  items?: ApiStavka[];
  subtotalAmount: number | string;
  discountAmount: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  canComplain?: boolean;
};

/**
 * Samo polja koja kupac sme da vidi. Backend uz porudžbinu šalje i nabavne cene, dobavljača i trošak kurira (polja za admin);
 * sve što ide u klijentske komponente prolazi kroz ovo (isto pravilo kao `zaKupca` na klikdogume).
 */
export function zaKupca(p: ApiPorudzbina): PorudzbinaNaloga {
  return {
    id: p.id,
    orderNumber: p.orderNumber,
    status: p.status,
    cancelReason: p.cancelReason ?? null,
    customerType: p.customerType,
    companyName: p.companyName ?? null,
    paymentMethod: p.paymentMethod,
    paymentStatus: p.paymentStatus,
    isPaid: p.isPaid,
    paidAt: p.paidAt ?? null,
    deliveryType: p.deliveryType,
    subtotalAmount: Number(p.subtotalAmount),
    discountAmount: Number(p.discountAmount),
    shippingCost: Number(p.shippingCost),
    totalAmount: Number(p.totalAmount),
    couponCode: p.couponCode ?? null,
    shippingAddress: p.shippingAddress ?? null,
    shippingCity: p.shippingCity ?? null,
    shippingZipCode: p.shippingZipCode ?? null,
    courier: p.courier ?? null,
    trackingNumber: p.trackingNumber ?? null,
    notes: p.notes ?? null,
    createdAt: p.createdAt,
    canComplain: p.canComplain ?? false,
    items: (p.items ?? []).map((s) => ({
      id: s.id,
      productCode: s.productCode,
      productName: s.productName,
      brandName: s.brandName ?? null,
      variantLabel: s.variantLabel ?? null,
      quantity: s.quantity,
      unitPrice: Number(s.unitPrice),
      totalPrice: Number(s.totalPrice),
      product: s.product?.slug ? { slug: s.product.slug, image: s.product.images?.[0] ? fileUrl(s.product.images[0]) : null } : null,
    })),
  };
}

/** GET /orders/my-orders, najnovije prve. */
export const getMojePorudzbine = cache(async (): Promise<PorudzbinaNaloga[] | null> => {
  const token = await getToken();
  if (!token) return [];
  const r = await pozovi<ApiPorudzbina[]>("/orders/my-orders", { token });
  return r.ok ? r.data.map(zaKupca).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : null;
});

/** Jedna moja porudžbina: `null` = nema je (ili je tuđa), `undefined` = backend ne odgovara. */
export const getMojaPorudzbina = cache(async (id: string): Promise<PorudzbinaNaloga | null | undefined> => {
  const token = await getToken();
  if (!token) return null;
  const r = await pozovi<ApiPorudzbina>(`/orders/my-orders/${encodeURIComponent(id)}`, { token });
  if (r.ok) return zaKupca(r.data);
  return r.status === 0 ? undefined : null;
});

export const getAdrese = cache(async (): Promise<Adresa[] | null> => {
  const token = await getToken();
  if (!token) return [];
  const r = await pozovi<Adresa[]>("/addresses", { token, timeout: 6_000 });
  return r.ok ? [...r.data].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)) : null;
});

export const getMojeReklamacije = cache(async (): Promise<Reklamacija[] | null> => {
  const token = await getToken();
  if (!token) return [];
  const r = await pozovi<Reklamacija[]>("/complaints/my", { token });
  return r.ok ? [...r.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : null;
});

export const getMojaReklamacija = cache(async (id: string): Promise<Reklamacija | null | undefined> => {
  const token = await getToken();
  if (!token) return null;
  const r = await pozovi<Reklamacija>(`/complaints/my/${encodeURIComponent(id)}`, { token });
  if (r.ok) return r.data;
  return r.status === 0 ? undefined : null;
});

/** Pošiljke predate kuriru (GET /orders/my-shipments), najnovije prve. */
export const getMojePosiljke = cache(async (): Promise<Posiljka[] | null> => {
  const token = await getToken();
  if (!token) return [];
  const r = await pozovi<Posiljka[]>("/orders/my-shipments", { token });
  return r.ok ? r.data : null;
});

/** Praćenje po broju: backend osveži status kod kurira ako je stariji od 10 minuta. 404 nosi poruku za kupca. */
/**
 * Javno praćenje po broju pošiljke (strana /pracenje-posiljke, bez prijave). Prijavljen kupac ide preko postojeće rute
 * naloga. Za ostale je predviđena javna ruta GET /orders/track?number=… koja vraća isti oblik kao my-shipments/track
 * (služba, status, kretanje; bez imena i adrese primaoca). Dok je backend nema, odgovor je 404 i strana nudi sajt kurira.
 */
export const pratiJavno = cache(async (broj: string): Promise<{ ok: true; posiljka: Posiljka } | { ok: false; poruka: string; nema?: boolean }> => {
  const n = normalizujBroj(broj);
  if ((await getToken()) && (await getKorisnik())) {
    const r = await pratiPosiljku(n);
    if (r.ok) return r;
  }
  const r = await pozovi<Posiljka>(`/orders/track?number=${encodeURIComponent(n)}`, { timeout: 15_000 });
  if (r.ok) return { ok: true, posiljka: r.data };
  // 401/403: javna ruta još ne postoji, pa zahtev završi na admin ruti /orders/:id - za kupca je to isto što i „nije pronađena"
  if ([400, 401, 403, 404].includes(r.status)) return { ok: false, nema: true, poruka: "Pošiljka sa ovim brojem nije pronađena kod nas. Proverite broj iz e-maila o slanju." };
  return { ok: false, poruka: r.message || PORUKA_SERVER };
});

export const pratiPosiljku = cache(async (broj: string): Promise<{ ok: true; posiljka: Posiljka } | { ok: false; poruka: string }> => {
  const token = await getToken();
  if (!token) return { ok: false, poruka: "Prijavite se da biste pratili pošiljku." };
  const r = await pozovi<Posiljka>(`/orders/my-shipments/track?number=${encodeURIComponent(normalizujBroj(broj))}`, { token, timeout: 15_000 });
  return r.ok ? { ok: true, posiljka: r.data } : { ok: false, poruka: r.message };
});
