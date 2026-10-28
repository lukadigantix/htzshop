/**
 * Korpa - deo koji sme i u pregledač (zaglavlje čita broj komada iz kolačića). Serverski deo je u lib/korpa.ts.
 * Kupac bez naloga drži korpu u kolačiću `htz_korpa`: samo id artikla i količina. Cene, stanje, kupon i dostavu uvek
 * računa backend (POST /cart/quote), isto kao na klikdogume.
 */
export const KORPA = "htz_korpa";
export const KUPON = "htz_kupon";
/** backend prima najviše 50 stavki u obračunu; 50 uuid-ova u kolačiću je ~2,5 KB (granica je 4 KB) */
export const KORPA_MAX_STAVKI = 50;
export const KORPA_MAX_KOM = 999;
/** događaji u pregledaču: promena korpe (bedž u zaglavlju) i „dodato u korpu" (obaveštenje) */
export const DOGADJAJ_KORPA = "htz:korpa";
export const DOGADJAJ_DODATO = "htz:dodato";

export type Stavka = { productId: string; qty: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const jeUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

/** Stavke iz kolačića; sve što ne liči na stavku se preskače (stari ili pokvaren kolačić ne sme da obori stranu). */
export function parsirajKorpu(raw: string | undefined | null): Stavka[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!Array.isArray(v)) return [];
    const out: Stavka[] = [];
    for (const x of v as { p?: unknown; q?: unknown }[]) {
      if (!jeUuid(x?.p)) continue;
      const q = Math.floor(Number(x.q));
      if (!Number.isFinite(q) || q < 1 || out.some((s) => s.productId === x.p)) continue;
      out.push({ productId: x.p, qty: Math.min(KORPA_MAX_KOM, q) });
      if (out.length >= KORPA_MAX_STAVKI) break;
    }
    return out;
  } catch {
    return [];
  }
}

export const serijalizujKorpu = (stavke: Stavka[]) => JSON.stringify(stavke.map((s) => ({ p: s.productId, q: s.qty })));

/** Broj komada iz `document.cookie` - za bedž u zaglavlju. */
export function komadaUKolacicu(cookie: string): number {
  const red = cookie.split("; ").find((c) => c.startsWith(`${KORPA}=`));
  return parsirajKorpu(red?.slice(KORPA.length + 1)).reduce((a, s) => a + s.qty, 0);
}

export type TipIsporuke = "adresa" | "preuzimanje";
export type NacinPlacanja = "pouzece" | "uplata_na_racun" | "ips";
export type TipKupca = "fizicko" | "pravno";

/** Kurirska služba koju obračun nudi; `priced: false` = služba nema cenu dostave za neki artikal. */
export type KurirOpcija = { courier: string; label: string; cost: number; priced?: boolean; missing?: string[] };

/** Stavka obračuna (POST /cart/quote) - artikal je ceo, kao u listi artikala. */
export type ObracunStavka = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    code: string;
    size: string | null;
    color: string | null;
    image: string | null;
    availableQty: number;
    brand: { name: string } | null;
    priceDisplay: { price: number | null; basePrice: number | null; label: string } | null;
  };
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  available: boolean;
  maxQuantity: number;
  note: string | null;
};

export type Obracun = {
  items: ObracunStavka[];
  subtotal: number;
  coupon: { code: string; discountType: "percentage" | "fixed"; discountValue: number; discountAmount?: number } | null;
  couponError: string | null;
  discount: number;
  shippingCost: number;
  courier: string | null;
  couriers: KurirOpcija[];
  total: number;
  canOrder: boolean;
  problems: string[];
  vat?: { rate: number; base: number; amount: number; total: number };
};

export type ObracunUpit = { couponCode?: string; deliveryType?: TipIsporuke; paymentMethod?: NacinPlacanja; courier?: string };

export const PRAZAN_OBRACUN: Obracun = { items: [], subtotal: 0, coupon: null, couponError: null, discount: 0, shippingCost: 0, courier: null, couriers: [], total: 0, canOrder: false, problems: [] };

/** Porudžbina kako je backend vraća kupcu (POST /orders), samo polja koja crtamo. */
export type Porudzbina = {
  id: string;
  orderNumber: string;
  paymentMethod: NacinPlacanja;
  deliveryType: TipIsporuke;
  isPaid: boolean;
  subtotalAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  courier: string | null;
  guestName: string | null;
  guestEmail: string | null;
  companyName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZipCode: string | null;
  items: { id: string; productName: string; variantLabel: string | null; quantity: number; unitPrice: number; totalPrice: number }[];
  ipsQr: { dataUrl: string; account: string; amount: number; reference: string; purpose: string; recipient: string } | null;
  payBy: string | null;
};

export const PLACANJE_NAZIV: Record<NacinPlacanja, string> = {
  pouzece: "Pouzećem",
  ips: "IPS QR kod",
  uplata_na_racun: "Uplata na račun",
};

/** varijanta stavke: „L | crna" */
export const varijanta = (p: { size: string | null; color: string | null }) => [p.size, p.color].filter(Boolean).join(", ");
