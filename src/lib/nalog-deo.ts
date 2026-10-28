import type { NacinPlacanja, TipIsporuke } from "./korpa-deo";

/**
 * Nalog kupca - deo koji sme i u pregledač: tipovi odgovora backenda, natpisi i sitne pomoćne funkcije.
 * Pozivi sa tokenom su u lib/nalog.ts (samo server). Isti backend kao klikdogume, pa su i oblici isti.
 */

/** Kolačić sa JWT-om (httpOnly). */
export const SESIJA = "htz_sesija";
/** Kolačić koji vidi i zaglavlje: samo inicijali prijavljenog kupca, da ikonica naloga zna da je prijavljen. */
export const PRIJAVLJEN = "htz_prijavljen";

export type Korisnik = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "admin" | "customer" | "marketing";
  isActive: boolean;
  createdAt?: string;
};

export type StatusPorudzbine = "otvoren" | "poruceno_od_dobavljaca" | "poslato" | "isporuceno" | "fakturisano" | "odustao";
export type StatusPlacanja = "unpaid" | "paid" | "refunded";

export type StavkaNaloga = {
  id: string;
  productCode: string;
  productName: string;
  brandName: string | null;
  variantLabel: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /** artikal iz kataloga; null kad je obrisan */
  product: { slug: string; image: string | null } | null;
};

export type PorudzbinaNaloga = {
  id: string;
  orderNumber: string;
  status: StatusPorudzbine;
  cancelReason: string | null;
  customerType: "fizicko" | "pravno";
  companyName: string | null;
  paymentMethod: NacinPlacanja;
  paymentStatus: StatusPlacanja;
  isPaid: boolean;
  paidAt: string | null;
  deliveryType: TipIsporuke;
  subtotalAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  couponCode: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZipCode: string | null;
  courier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  items: StavkaNaloga[];
  /** 14 dana od porudžbine i još bez reklamacije (backend) */
  canComplain: boolean;
};

export type Adresa = { id: string; fullName: string; phone: string; address: string; city: string; zipCode: string; country: string; isDefault: boolean };

export type StatusReklamacije = "pending" | "accepted" | "rejected";
export type Reklamacija = {
  id: string;
  orderId: string;
  subject: string;
  description: string;
  status: StatusReklamacije;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  order?: { id: string; orderNumber: string; createdAt: string } | null;
};

export type StatusPosiljke = "kreirana" | "preuzeta" | "u_isporuci" | "isporucena" | "vracena" | "greska";
export type Posiljka = {
  id: string;
  number: string | null;
  courier: string;
  courierLabel: string;
  orderNumber: string | null;
  status: StatusPosiljke;
  statusLabel: string;
  courierStatus: string | null;
  location: string | null;
  statusAt: string | null;
  expectedDelivery: string | null;
  sentAt: string | null;
  lastCheckedAt: string | null;
  history: { date: string | null; name: string; location: string | null }[];
};

export const STATUS_LABEL: Record<StatusPorudzbine, string> = {
  otvoren: "Primljena",
  poruceno_od_dobavljaca: "U pripremi",
  poslato: "Poslata",
  isporuceno: "Isporučena",
  fakturisano: "Završena",
  odustao: "Otkazana",
};
/** koraci trake statusa; otkazana je van trake */
export const STATUS_KORACI: StatusPorudzbine[] = ["otvoren", "poruceno_od_dobavljaca", "poslato", "isporuceno"];
export const ZAVRSENE = new Set<StatusPorudzbine>(["isporuceno", "fakturisano", "odustao"]);

/** jedna rečenica: šta se sa porudžbinom dešava sada */
export const SLEDI: Record<StatusPorudzbine, string> = {
  otvoren: "Primili smo porudžbinu. Sledi priprema za slanje.",
  poruceno_od_dobavljaca: "Porudžbina se priprema za slanje.",
  poslato: "Paket je kod kurira i stiže uskoro.",
  isporuceno: "Porudžbina je isporučena.",
  fakturisano: "Porudžbina je isporučena i završena.",
  odustao: "Porudžbina je otkazana.",
};

export const PLACANJE_OPIS: Record<NacinPlacanja, string> = {
  pouzece: "Pouzećem",
  ips: "IPS QR kod",
  uplata_na_racun: "Uplata na račun",
};
export const placanjeOpis = (p: Pick<PorudzbinaNaloga, "paymentMethod" | "deliveryType">) =>
  p.paymentMethod === "pouzece" && p.deliveryType === "preuzimanje" ? "Pri preuzimanju" : (PLACANJE_OPIS[p.paymentMethod] ?? p.paymentMethod);
export const ISPORUKA_OPIS: Record<TipIsporuke, string> = { adresa: "Dostava na adresu", preuzimanje: "Lično preuzimanje u radnji" };
export const STATUS_PLACANJA: Record<StatusPlacanja, string> = { unpaid: "Nije plaćeno", paid: "Plaćeno", refunded: "Novac vraćen" };
export const KURIR_LABEL: Record<string, string> = { bex: "BEX", postexpress: "Post Express" };

export const REKLAMACIJA_LABEL: Record<StatusReklamacije, string> = { pending: "U obradi", accepted: "Prihvaćena", rejected: "Odbijena" };
export const REKLAMACIJA_ROK_DANA = 14;

export const POSILJKA_KORACI: { status: StatusPosiljke; label: string }[] = [
  { status: "kreirana", label: "Prijavljena" },
  { status: "preuzeta", label: "Preuzeta" },
  { status: "u_isporuci", label: "U isporuci" },
  { status: "isporucena", label: "Isporučena" },
];

const MESECI = ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
/** „27. oktobra 2026." */
export function datum(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${d.getDate()}. ${MESECI[d.getMonth()]} ${d.getFullYear()}.`;
}
/** datum i vreme događaja kod kurira, po beogradskom vremenu (strana se crta na serveru) */
export function datumVreme(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("sr-Latn-RS", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade" });
}

/** „Marko Petrović" → „MP"; bez imena prvo slovo e-pošte */
export function inicijali(k: Pick<Korisnik, "firstName" | "lastName" | "email">) {
  const s = `${k.firstName?.trim()[0] ?? ""}${k.lastName?.trim()[0] ?? ""}`;
  return (s || k.email[0] || "?").toUpperCase();
}

/** Inicijali iz kolačića `htz_prijavljen` (zaglavlje); prazno = gost. */
export function prijavljenIzKolacica(cookie: string) {
  const red = cookie.split("; ").find((c) => c.startsWith(`${PRIJAVLJEN}=`));
  if (!red) return "";
  try {
    return decodeURIComponent(red.slice(PRIJAVLJEN.length + 1)).slice(0, 3);
  } catch {
    return "";
  }
}

/** broj pošiljke kako ga backend traži: bez razmaka, velika slova */
export const normalizujBroj = (broj: string) => broj.replace(/\s+/g, "").toUpperCase();

/** Služba po izgledu broja, isto pravilo kao na backendu: Post Express „PE123456785RS", BEX samo cifre. */
export function prepoznajKurira(broj: string): "bex" | "postexpress" | null {
  const n = normalizujBroj(broj);
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(n)) return "postexpress";
  if (/^\d{5,15}$/.test(n)) return "bex";
  return null;
}

/** Samo interne putanje - da niko preko ?nazad= ne pošalje kupca na tuđ sajt. */
export const sigurnoNazad = (v: string | null | undefined, podrazumevano = "/moj-nalog/") => (v && v.startsWith("/") && !v.startsWith("//") ? v : podrazumevano);
