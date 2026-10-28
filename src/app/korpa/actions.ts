"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { API_URL } from "@/lib/api";
import { getKorpa, getKupon, korpaOpcije, obracunajKorpu, PORUKA_MREZA } from "@/lib/korpa";
import { getToken } from "@/lib/nalog";
import { jeUuid, KORPA, KORPA_MAX_KOM, KORPA_MAX_STAVKI, KUPON, serijalizujKorpu, varijanta, type NacinPlacanja, type Obracun, type Porudzbina, type Stavka, type TipIsporuke } from "@/lib/korpa-deo";

/*
  Akcije korpe (po uzoru na klikdogume, components/korpa/actions.ts i naplata-actions.ts). Kolačić menjaju samo one.
  Posle promene `refresh()` ponovo crta trenutnu stranu (korpa se čita bez keša); bedž u zaglavlju čita kolačić sam.
*/

async function sacuvaj(stavke: Stavka[]) {
  const c = await cookies();
  if (stavke.length === 0) c.delete(KORPA);
  else c.set(KORPA, serijalizujKorpu(stavke), { ...korpaOpcije(), httpOnly: false });
}

type ApiArtikal = {
  id: string;
  name: string;
  image: string | null;
  size: string | null;
  color: string | null;
  inStock: boolean;
  availableQty: number;
  priceDisplay: { price: number | null } | null;
};

export type Dodato = {
  name: string;
  image: string | null;
  price: number | null;
  varijanta: string;
  /** dodato sada */
  qty: number;
  /** ovog artikla u korpi posle dodavanja */
  uKorpi: number;
};
export type StanjeDodavanja = { ok: true; broj: number; artikal: Dodato; napomena?: string } | { ok: false; greska: string };

/**
 * „Dodaj u korpu" sa kartice ili strane proizvoda, po slug-u (svaka veličina i boja je poseban artikal sa svojim slug-om).
 * Artikal se čita sa backenda: id za korpu, stanje i podaci za obaveštenje. Ako je već u korpi, količina se sabira,
 * najviše do stanja - backend ionako proverava stanje pri obračunu i porudžbini, ali kupac ne sme da završi sa više
 * komada u korpi nego što ih ima.
 */
export async function dodajUKorpu(slug: string, trazeno = 1): Promise<StanjeDodavanja> {
  const kom = Math.min(KORPA_MAX_KOM, Math.max(1, Math.floor(Number(trazeno)) || 1));
  let a: ApiArtikal;
  try {
    const r = await fetch(`${API_URL}/products/slug/${encodeURIComponent(slug)}`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (r.status === 404) return { ok: false, greska: "Ovaj artikal trenutno nije u prodaji. Pozovite nas, proverićemo zalihe." };
    if (!r.ok) return { ok: false, greska: PORUKA_MREZA };
    a = ((await r.json()) as { data: ApiArtikal }).data;
  } catch {
    return { ok: false, greska: PORUKA_MREZA };
  }
  if (!a.inStock || a.availableQty < 1 || a.priceDisplay?.price == null) return { ok: false, greska: "Ovog artikla trenutno nema na stanju." };

  const korpa = await getKorpa();
  const postoji = korpa.find((s) => s.productId === a.id);
  if (!postoji && korpa.length >= KORPA_MAX_STAVKI) return { ok: false, greska: `Korpa prima najviše ${KORPA_MAX_STAVKI} različitih artikala.` };
  const vec = postoji?.qty ?? 0;
  const moze = Math.max(0, Math.min(KORPA_MAX_KOM, a.availableQty) - vec);
  if (moze === 0) return { ok: false, greska: `Na stanju je ${a.availableQty} kom i svi su već u vašoj korpi.` };
  const dodato = Math.min(kom, moze);
  const nova = postoji ? korpa.map((s) => (s.productId === a.id ? { ...s, qty: vec + dodato } : s)) : [...korpa, { productId: a.id, qty: dodato }];
  await sacuvaj(nova);
  refresh();
  return {
    ok: true,
    broj: nova.reduce((n, s) => n + s.qty, 0),
    artikal: { name: a.name, image: a.image, price: a.priceDisplay.price, varijanta: varijanta(a), qty: dodato, uKorpi: vec + dodato },
    napomena: dodato < kom ? `Na stanju je ${a.availableQty} kom, pa je u korpi sada ${vec + dodato}.` : undefined,
  };
}

/** Količina na strani korpe; 0 = ukloni. */
export async function promeniKolicinu(productId: string, qty: number) {
  if (!jeUuid(productId)) return;
  const q = Math.floor(Number(qty));
  const korpa = await getKorpa();
  await sacuvaj(!Number.isFinite(q) || q < 1 ? korpa.filter((s) => s.productId !== productId) : korpa.map((s) => (s.productId === productId ? { ...s, qty: Math.min(KORPA_MAX_KOM, q) } : s)));
  refresh();
}

export async function isprazniKorpu() {
  await sacuvaj([]);
  refresh();
}

/** Kupon: proveri obračunom (backend kaže zašto ne važi), pa zapamti u kolačiću; obračun ga primenjuje svuda. */
export async function primeniKupon(kod: string): Promise<{ ok: boolean; greska?: string }> {
  const code = kod.trim().toUpperCase().slice(0, 40);
  if (!code) return { ok: false, greska: "Upišite kod kupona." };
  const ob = await obracunajKorpu(await getKorpa(), { couponCode: code });
  if (!ob) return { ok: false, greska: PORUKA_MREZA };
  if (ob.couponError || !ob.coupon) return { ok: false, greska: ob.couponError ?? "Kupon nije važeći." };
  (await cookies()).set(KUPON, code, korpaOpcije());
  refresh();
  return { ok: true };
}

export async function ukloniKupon() {
  (await cookies()).delete(KUPON);
  refresh();
}

/* ---------- naplata ---------- */

const ISPORUKE: TipIsporuke[] = ["adresa", "preuzimanje"];
const PLACANJA: NacinPlacanja[] = ["pouzece", "uplata_na_racun", "ips"];

export type Izbor = { deliveryType: TipIsporuke; paymentMethod: NacinPlacanja; courier?: string };

/** Obračun za izbor sa forme (isporuka, plaćanje, kurirska služba) uz zapamćeni kupon. Služba ide samo uz dostavu na adresu. */
async function obracun(izbor: Izbor): Promise<Obracun | null> {
  return obracunajKorpu(await getKorpa(), {
    deliveryType: izbor.deliveryType,
    paymentMethod: izbor.paymentMethod,
    courier: izbor.deliveryType === "adresa" ? izbor.courier : undefined,
    couponCode: (await getKupon()) || undefined,
  });
}

/** Ponovni obračun kad kupac promeni isporuku, plaćanje ili službu. Služba koja više nije u ponudi se izostavlja (backend uzme najjeftiniju). */
export async function preracunaj(izbor: Izbor): Promise<Obracun | null> {
  const r = await obracun(izbor);
  if (r && izbor.courier && r.couriers.length > 0 && !r.couriers.some((c) => c.courier === izbor.courier)) return obracun({ ...izbor, courier: undefined });
  return r;
}

export type StanjeNaplate = { ok: true; porudzbina: Porudzbina } | { ok: false; greska: string; polja?: string[] } | undefined;

const tekst = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** imena polja u poruci kod dugmeta - kupac odmah vidi šta da popravi, i kad je polje ekran iznad */
const NAZIV: Record<string, string> = {
  guestName: "ime i prezime",
  guestPhone: "telefon",
  guestEmail: "e-mail",
  companyName: "naziv firme",
  pib: "PIB",
  shippingAddress: "ulica i broj",
  shippingZipCode: "poštanski broj",
  shippingCity: "mesto",
  uslovi: "saglasnost sa uslovima kupovine",
};

/**
 * POST /orders (ime, e-mail i telefon obavezni; prijavljen kupac šalje i token, pa je porudžbina u njegovom nalogu). Cene računa server; pre slanja još jednom obračun (canOrder),
 * da kupac ne dobije poruku o zalihama tek na kraju. Uspeh: korpa i kupon se brišu, strana crta potvrdu iz odgovora
 * (broj, iznos, IPS QR kod i podaci za uplatu uz plaćanje unapred).
 */
export async function naruci(_prev: StanjeNaplate, fd: FormData): Promise<StanjeNaplate> {
  const stavke = await getKorpa();
  if (stavke.length === 0) return { ok: false, greska: "Korpa je prazna." };
  const d = tekst(fd, "deliveryType") as TipIsporuke;
  const p = tekst(fd, "paymentMethod") as NacinPlacanja;
  const izbor: Izbor = { deliveryType: ISPORUKE.includes(d) ? d : "adresa", paymentMethod: PLACANJA.includes(p) ? p : "pouzece", courier: tekst(fd, "courier") || undefined };
  const customerType = tekst(fd, "customerType") === "pravno" ? "pravno" : "fizicko";
  const polja: string[] = [];

  const guestName = tekst(fd, "guestName"), guestPhone = tekst(fd, "guestPhone"), guestEmail = tekst(fd, "guestEmail");
  if (guestName.length < 3) polja.push("guestName");
  if (guestPhone.replace(/\D/g, "").length < 8) polja.push("guestPhone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) polja.push("guestEmail");

  const body: Record<string, unknown> = {
    customerType,
    guestName,
    guestPhone,
    guestEmail,
    deliveryType: izbor.deliveryType,
    paymentMethod: izbor.paymentMethod,
    items: stavke.map((s) => ({ productId: s.productId, quantity: s.qty })),
    shippingCountry: "Srbija",
  };
  const kupon = await getKupon();
  if (kupon) body.couponCode = kupon;
  const notes = tekst(fd, "notes");
  if (notes) body.notes = notes.slice(0, 1000);

  if (customerType === "pravno") {
    const companyName = tekst(fd, "companyName"), pib = tekst(fd, "pib").replace(/\s/g, ""), mb = tekst(fd, "mb").replace(/\s/g, "");
    if (companyName.length < 2) polja.push("companyName");
    if (!/^\d{9}$/.test(pib)) polja.push("pib");
    Object.assign(body, { companyName, pib, ...(mb ? { mb } : {}) });
  }
  if (izbor.deliveryType === "adresa") {
    const shippingAddress = tekst(fd, "shippingAddress"), shippingZipCode = tekst(fd, "shippingZipCode"), shippingCity = tekst(fd, "shippingCity");
    if (shippingAddress.length < 3) polja.push("shippingAddress");
    if (!/^\d{5}$/.test(shippingZipCode)) polja.push("shippingZipCode");
    if (shippingCity.length < 2) polja.push("shippingCity");
    Object.assign(body, { shippingAddress, shippingZipCode, shippingCity });
    if (izbor.courier) body.courier = izbor.courier;
  }
  if (fd.get("uslovi") !== "1") polja.push("uslovi");
  if (polja.length) return { ok: false, greska: `Proverite označena polja: ${polja.map((k) => NAZIV[k] ?? k).join(", ")}.`, polja };

  // bez zamene službe: porudžbina mora da ima službu i cenu koje je kupac video
  const ob = await obracun(izbor);
  if (!ob) return { ok: false, greska: PORUKA_MREZA };
  if (!ob.canOrder) return { ok: false, greska: ob.problems[0] ?? "Neki artikal iz korpe trenutno nije dostupan. Pogledajte korpu." };

  // jedan pokušaj: porudžbina ne sme da se napravi dvaput
  let porudzbina: Porudzbina;
  try {
    // prijavljen kupac: porudžbina ide na njegov nalog (backend čita token, optionalAuthenticate). Istekao token backend odbija
    // sa 401 pre pravljenja porudžbine - tada se ista porudžbina šalje kao gostujuća (podaci kupca su u formi).
    const posalji = (token: string | null) =>
      fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
    const token = await getToken();
    let r = await posalji(token);
    if (r.status === 401 && token) r = await posalji(null);
    const j = (await r.json().catch(() => null)) as { data?: Porudzbina; message?: string } | null;
    if (!r.ok || !j?.data) return { ok: false, greska: j?.message ?? PORUKA_MREZA };
    porudzbina = j.data;
  } catch {
    return { ok: false, greska: PORUKA_MREZA };
  }

  const c = await cookies();
  c.delete(KORPA);
  c.delete(KUPON);
  // samo ono što potvrda crta (backend vraća i interna polja porudžbine)
  const { id, orderNumber, paymentMethod, deliveryType, isPaid, subtotalAmount, discountAmount, shippingCost, totalAmount, courier, guestEmail: email, companyName, shippingAddress, shippingCity, shippingZipCode, items, ipsQr, payBy } = porudzbina;
  return {
    ok: true,
    porudzbina: {
      id, orderNumber, paymentMethod, deliveryType, isPaid, courier, companyName, shippingAddress, shippingCity, shippingZipCode, ipsQr, payBy,
      guestName: porudzbina.guestName,
      guestEmail: email,
      subtotalAmount: Number(subtotalAmount),
      discountAmount: Number(discountAmount),
      shippingCost: Number(shippingCost),
      totalAmount: Number(totalAmount),
      items: (items ?? []).map((s) => ({ id: s.id, productName: s.productName, variantLabel: s.variantLabel, quantity: s.quantity, unitPrice: Number(s.unitPrice), totalPrice: Number(s.totalPrice) })),
    },
  };
}
