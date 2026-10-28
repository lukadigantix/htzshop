"use server";

import { PORUKA_SERVER, pozovi } from "@/lib/api";
import { zaKupca, type ApiPorudzbina } from "@/lib/nalog";
import type { PorudzbinaNaloga, Posiljka } from "@/lib/nalog-deo";

/**
 * Status porudžbine bez prijave: POST /orders/lookup sa brojem porudžbine i e-mailom iz porudžbine. Backend vraća porudžbinu
 * bez kontakt podataka i tačne adrese, pošiljke sa kretanjem i, dok uplata ne stigne, podatke za IPS uplatu.
 */
export type IpsUplata = { dataUrl: string; account: string; amount: number; reference: string; purpose: string; recipient: string };
export type Pronadjena = { porudzbina: PorudzbinaNaloga; ime: string | null; posiljke: Posiljka[]; ips: IpsUplata | null; rokUplate: string | null };
export type StanjeProvere = { ok: true; data: Pronadjena } | { ok: false; greska: string; polja?: string[] } | undefined;

type ApiOdgovor = ApiPorudzbina & { customerFirstName?: string | null; shipments?: Posiljka[]; ipsQr?: IpsUplata | null; payBy?: string | null };

export async function proveriStatus(_: StanjeProvere, fd: FormData): Promise<StanjeProvere> {
  const broj = String(fd.get("broj") ?? "")
    .trim()
    .replace(/^#/, "");
  const email = String(fd.get("email") ?? "").trim();
  const polja: string[] = [];
  if (!/^\d{4}-\d{1,8}$/.test(broj)) polja.push("broj");
  if (!/^\S+@\S+\.\S+$/.test(email)) polja.push("email");
  if (polja.length)
    return { ok: false, greska: polja.includes("broj") ? "Broj porudžbine je u obliku 2026-0012. Nalazi se u e-mailu potvrde." : "Upišite e-mail adresu iz porudžbine.", polja };

  const r = await pozovi<ApiOdgovor>("/orders/lookup", { method: "POST", body: { orderNumber: broj, email } });
  if (!r.ok) {
    if (r.status === 404) return { ok: false, greska: "Porudžbina nije pronađena. Proverite broj porudžbine i e-mail koji ste upisali pri poručivanju.", polja: ["broj", "email"] };
    if (r.status === 429) return { ok: false, greska: "Previše pokušaja. Sačekajte nekoliko minuta i pokušajte ponovo." };
    return { ok: false, greska: PORUKA_SERVER };
  }
  const d = r.data;
  return {
    ok: true,
    data: {
      porudzbina: zaKupca(d),
      ime: d.customerFirstName ?? null,
      posiljke: (d.shipments ?? []).filter((x) => x.number),
      ips: d.ipsQr ?? null,
      rokUplate: d.payBy ?? null,
    },
  };
}
