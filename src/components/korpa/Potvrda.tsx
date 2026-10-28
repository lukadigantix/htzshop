"use client";

import Link from "next/link";
import { Landmark, QrCode, Store, Truck, Wallet } from "lucide-react";
import { PLACANJE_NAZIV, type Porudzbina } from "@/lib/korpa-deo";
import { rsd } from "@/lib/filteri";
import type { Sajt } from "@/lib/sajt";
import { Kopiraj } from "../kontakt/Radnja";
import { ArrowRight } from "../Icons";
import Razdvajac from "../Razdvajac";
import Koraci from "./Koraci";

/*
  Potvrda posle POST /orders, iz odgovora (gost kasnije ne može da je otvori - zato je sve bitno ovde i u mejlu).
  Uz plaćanje unapred (IPS, uplata na račun) backend vraća IPS QR kod i podatke za uplatu: QR za aplikaciju banke
  i polja uplatnice sa „Kopiraj". Pouzeće i preuzimanje: šta sledi. Ispod stavke i iznosi.
*/
export default function Potvrda({ p, sajt, prijavljen }: { p: Porudzbina; sajt: Sajt; prijavljen: boolean }) {
  const unapred = p.paymentMethod !== "pouzece";
  const qr = p.ipsQr;
  const rok = p.payBy ? new Date(p.payBy).toLocaleString("sr-RS", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
  const uplata = qr
    ? [
        { label: "Primalac", vrednost: qr.recipient },
        { label: "Račun primaoca", vrednost: qr.account },
        { label: "Iznos", vrednost: rsd(qr.amount), kopija: String(qr.amount) },
        { label: "Poziv na broj", vrednost: qr.reference },
        { label: "Svrha uplate", vrednost: qr.purpose },
      ]
    : [];

  return (
    <>
      <Koraci aktivan={2} />
      <div className="mx-auto mt-8 max-w-[880px]">
        <section className="overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-40px_rgba(32,33,36,0.45)]">
          <div aria-hidden className="h-2 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_14px,var(--text-primary)_14px_28px)]" />
          <div className="p-6 md:p-10">
            <span className="potvrda-kvacica grid size-16 place-items-center rounded-full bg-brand text-on-brand">
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-secondary">Porudžbina {p.orderNumber}</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[48px]">
              {unapred ? "Porudžbina je primljena. Još samo uplata." : "Hvala, porudžbina je primljena."}
            </h1>
            <p className="p-muted mt-4 max-w-[600px] text-[16px] leading-[26px]">
              {p.guestEmail && (
                <>
                  Potvrdu smo poslali na <b className="font-semibold text-primary">{p.guestEmail}</b>.{" "}
                </>
              )}
              {unapred
                ? `Artikle šaljemo čim uplata stigne${rok ? `, a rok za uplatu je ${rok}` : ""}.`
                : p.deliveryType === "preuzimanje"
                  ? "Javljamo vam telefonom kad porudžbina bude spremna za preuzimanje u radnji."
                  : "Kurir vas zove pre isporuke. Plaćate mu gotovinom kad paket stigne."}
            </p>

            {/* plaćanje unapred: QR i uplatnica */}
            {unapred && qr && (
              <div className="mt-8 overflow-hidden rounded-[6px] bg-primary text-white">
                <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[auto_1fr] md:gap-8 md:p-7">
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL sa backenda */}
                    <img src={qr.dataUrl} alt="IPS QR kod za uplatu" width={220} height={220} className="size-[220px] rounded-[6px] bg-white p-2.5" />
                    <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-white/60">
                      <QrCode className="size-3.5" strokeWidth={2} aria-hidden />
                      IPS skeniraj u aplikaciji banke
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">{p.paymentMethod === "ips" ? "IPS uplata" : "Podaci za uplatu"}</p>
                    <p className="mt-1 text-[34px] font-semibold leading-tight tracking-[-0.02em] tabular-nums">{rsd(qr.amount)}</p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-[14px] leading-[21px] text-white/70">
                      <li>Otvorite aplikaciju svoje banke i izaberite „IPS skeniraj“.</li>
                      <li>Skenirajte kod: primalac, iznos i poziv na broj se popunjavaju sami.</li>
                      <li>Potvrdite plaćanje. Šaljemo čim uplata stigne.</li>
                    </ol>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2">
                  {uplata.map((u) => (
                    <div key={u.label} className="flex items-center justify-between gap-3 bg-primary px-5 py-3.5 md:px-7">
                      <div className="min-w-0">
                        <dt className="text-[11px] uppercase tracking-[0.14em] text-white/50">{u.label}</dt>
                        <dd className="mt-0.5 break-words text-[15px] font-medium tabular-nums">{u.vrednost}</dd>
                      </div>
                      <Kopiraj tekst={u.kopija ?? u.vrednost} label={u.label} />
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {unapred && !qr && (
              <p className="mt-8 rounded-[6px] bg-page p-5 text-[15px] leading-[24px]">
                Podatke za uplatu šaljemo na e-mail. Poziv na broj je <b className="font-semibold">{p.orderNumber}</b>, iznos <b className="font-semibold">{rsd(p.totalAmount)}</b>. Za pomoć pozovite{" "}
                <a href={sajt.phoneHref} className="font-semibold underline underline-offset-2">
                  {sajt.phone}
                </a>
                .
              </p>
            )}

            {/* ukratko */}
            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle sm:grid-cols-3">
              <div className="bg-page p-4">
                <dt className="text-[12px] text-secondary">Iznos</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums">{rsd(p.totalAmount)}</dd>
              </div>
              <div className="bg-page p-4">
                <dt className="text-[12px] text-secondary">Plaćanje</dt>
                <dd className="mt-1 flex items-center gap-2 text-[15px] font-semibold">
                  {p.paymentMethod === "pouzece" ? <Wallet className="size-4" strokeWidth={1.8} aria-hidden /> : p.paymentMethod === "ips" ? <QrCode className="size-4" strokeWidth={1.8} aria-hidden /> : <Landmark className="size-4" strokeWidth={1.8} aria-hidden />}
                  {p.paymentMethod === "pouzece" && p.deliveryType === "preuzimanje" ? "Pri preuzimanju" : PLACANJE_NAZIV[p.paymentMethod]}
                </dd>
              </div>
              <div className="bg-page p-4">
                <dt className="text-[12px] text-secondary">Isporuka</dt>
                <dd className="mt-1 flex items-start gap-2 text-[15px] font-semibold">
                  {p.deliveryType === "preuzimanje" ? <Store className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden /> : <Truck className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden />}
                  <span>
                    {p.deliveryType === "preuzimanje" ? `Radnja, ${sajt.street}` : `${p.shippingAddress}, ${p.shippingZipCode} ${p.shippingCity}`}
                  </span>
                </dd>
              </div>
            </dl>

            <ul className="mt-6 divide-y divide-subtle border-y border-subtle">
              {p.items.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-4 py-3 text-[14px]">
                  <span className="min-w-0">
                    <span className="block font-medium">{s.productName}</span>
                    <span className="text-secondary">
                      {s.variantLabel && (
                        <>
                          {s.variantLabel}
                          <Razdvajac />
                        </>
                      )}
                      {s.quantity} × {rsd(s.unitPrice)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{rsd(s.totalPrice)}</span>
                </li>
              ))}
            </ul>
            <dl className="ml-auto mt-4 max-w-[320px] space-y-1.5 text-[14px]">
              {p.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-secondary">Popust</dt>
                  <dd className="font-medium text-success">− {rsd(p.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-secondary">Dostava</dt>
                <dd className="font-medium">{p.shippingCost > 0 ? rsd(p.shippingCost) : "Besplatno"}</dd>
              </div>
              <div className="flex justify-between border-t border-subtle pt-2 text-[16px]">
                <dt className="font-semibold">Ukupno</dt>
                <dd className="font-semibold tabular-nums">{rsd(p.totalAmount)}</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              {prijavljen ? (
                <Link href={`/moj-nalog/porudzbine/${p.id}/`} className="btn-primary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
                  Pratite porudžbinu u nalogu <ArrowRight width={15} height={15} strokeWidth={1.8} />
                </Link>
              ) : (
                <Link href="/prodavnica/" className="btn-primary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
                  Nastavite kupovinu <ArrowRight width={15} height={15} strokeWidth={1.8} />
                </Link>
              )}
              <a href={sajt.phoneHref} className="btn-secondary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
                Pitanje o porudžbini? {sajt.phone}
              </a>
            </div>
            {!prijavljen && (
              <p className="mt-5 text-[14px] text-secondary">
                Status porudžbine proveravate na strani{" "}
                <Link href={`/status-porudzbine/?broj=${encodeURIComponent(p.orderNumber)}`} className="font-medium text-primary underline underline-offset-2">
                  Status porudžbine
                </Link>
                , sa brojem {p.orderNumber} i e-mailom iz porudžbine.
              </p>
            )}
          </div>
        </section>

        {/* gost: nalog za sledeći put (porudžbine bez naloga se ne vezuju naknadno, pa to ne obećavamo) */}
        {!prijavljen && (
          <div className="mt-4 flex flex-col gap-4 rounded-[6px] bg-primary p-5 text-white sm:flex-row sm:items-center sm:justify-between md:p-7">
            <div>
              <p className="text-[17px] font-medium">Sledeći put brže, uz nalog.</p>
              <p className="mt-1 text-[14px] leading-[21px] text-white/60">Podaci i adrese su sačuvani, a status svake porudžbine vidite na jednom mestu.</p>
            </div>
            <Link href="/registracija/" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/25 px-6 text-[14px] font-medium transition hover:border-brand hover:text-brand">
              Otvorite nalog
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
