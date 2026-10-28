import Link from "next/link";
import { MessageSquareWarning, ShoppingBag } from "lucide-react";
import Razdvajac from "../Razdvajac";
import { ArrowRight } from "../Icons";
import { KurirZnacka, StatusPilula, TrakaPosiljke, TrakaStatusa } from "./Status";
import { KARTICA, MALI } from "./stil";
import { rsd } from "@/lib/filteri";
import { datum, datumVreme, ISPORUKA_OPIS, KURIR_LABEL, placanjeOpis, SLEDI, STATUS_PLACANJA, type PorudzbinaNaloga, type Posiljka } from "@/lib/nalog-deo";

/**
 * Porudžbina kupca: stanje i tok, pošiljke, stavke sa iznosima, isporuka i plaćanje. Ista za nalog (/moj-nalog/porudzbine/[id])
 * i za javnu stranu „Status porudžbine" (`gost`): gost vidi kretanje pošiljke ovde, a ne na strani praćenja u nalogu, i nema
 * tačnu adresu (backend je ne šalje bez prijave). Bez serverskog koda, jer je na javnoj strani prikazuje klijentska forma.
 */
export type Radnja = { name: string; street: string; city: string; phone: string; phoneHref: string };

export default function DetaljPorudzbine({ p, posiljke, radnja, gost = false }: { p: PorudzbinaNaloga; posiljke: Posiljka[]; radnja: Radnja; gost?: boolean }) {
  const otkazana = p.status === "odustao";
  const kom = p.items.reduce((a, x) => a + x.quantity, 0);
  const cekaUplatu = !p.isPaid && !otkazana && p.paymentMethod !== "pouzece";
  const saBrojem = posiljke.filter((x) => x.number);

  return (
    <>
      {/* stanje */}
      <section aria-label="Stanje porudžbine" className={KARTICA}>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPilula status={p.status} />
          <p className="text-[15px] text-secondary">{SLEDI[p.status]}</p>
        </div>
        {otkazana && p.cancelReason && <p className="mt-3 text-[14px] text-secondary">Razlog: {p.cancelReason}</p>}
        <TrakaStatusa status={p.status} className="mt-6" />
        {saBrojem.map((x) =>
          gost ? (
            <div key={x.id} className="mt-5 rounded-[4px] bg-page p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px]">
                <KurirZnacka courier={x.courier} label={x.courierLabel} />
                <b className="font-semibold tabular-nums">{x.number}</b>
                <span className="text-secondary">{x.statusLabel}</span>
                {x.expectedDelivery && <span className="ml-auto text-[13px] text-secondary">Očekivana isporuka: {datum(x.expectedDelivery)}</span>}
              </div>
              <TrakaPosiljke status={x.status} className="mt-4" />
              {x.history.length > 0 && (
                <ol className="mt-4 space-y-2 border-t border-subtle pt-3 text-[13px]">
                  {x.history.slice(0, 4).map((h, i) => (
                    <li key={`${h.date}-${i}`} className="flex flex-wrap gap-x-3">
                      <span className="w-[120px] shrink-0 tabular-nums text-secondary">{h.date ? datumVreme(h.date) : ""}</span>
                      <span className={i === 0 ? "font-medium" : "text-secondary"}>
                        {h.name}
                        {h.location ? `, ${h.location}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <Link
              key={x.id}
              href={`/moj-nalog/pracenje/?broj=${encodeURIComponent(x.number!)}`}
              className="group mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[4px] bg-page px-4 py-3 text-[14px] transition hover:bg-brand-soft"
            >
              <KurirZnacka courier={x.courier} label={x.courierLabel} />
              <b className="font-semibold tabular-nums">{x.number}</b>
              <span className="text-secondary">{x.statusLabel}</span>
              <span className="ml-auto inline-flex items-center gap-1 font-medium">
                Pratite pošiljku <ArrowRight width={14} height={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ),
        )}
        {p.trackingNumber && saBrojem.length === 0 && (
          <p className="mt-5 text-[14px] text-secondary">
            Broj pošiljke: <b className="font-semibold text-primary">{p.trackingNumber}</b>
          </p>
        )}
      </section>

      <div className="mt-4 grid items-start gap-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5">
        <section aria-labelledby="stavke" className={KARTICA}>
          <h2 id="stavke" className={MALI}>
            Artikli ({kom} kom)
          </h2>
          <ul className="mt-3 divide-y divide-subtle">
            {p.items.map((x) => (
              <li key={x.id} className="flex items-center gap-4 py-4">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[4px] bg-white ring-1 ring-subtle">
                  {x.product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- slika sa backenda
                    <img src={x.product.image} alt="" className="size-full object-contain p-1" />
                  ) : (
                    <ShoppingBag className="size-5 text-secondary" strokeWidth={1.6} aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  {x.brandName && <span className="block text-[12px] uppercase tracking-[0.12em] text-secondary">{x.brandName}</span>}
                  {x.product ? (
                    <Link href={`/proizvod/${x.product.slug}/`} className="block text-[15px] font-medium leading-snug underline-offset-2 hover:underline">
                      {x.productName}
                    </Link>
                  ) : (
                    <span className="block text-[15px] font-medium leading-snug">{x.productName}</span>
                  )}
                  <span className="mt-0.5 block text-[13px] text-secondary">
                    {x.variantLabel && (
                      <>
                        {x.variantLabel}
                        <Razdvajac />
                      </>
                    )}
                    {x.quantity} × {rsd(x.unitPrice)}
                  </span>
                </span>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">{rsd(x.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <dl className="ml-auto mt-2 max-w-[360px] space-y-2 border-t border-subtle pt-4 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-secondary">Artikli</dt>
              <dd className="font-medium tabular-nums">{rsd(p.subtotalAmount)}</dd>
            </div>
            {p.discountAmount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Popust{p.couponCode ? ` (${p.couponCode})` : ""}</dt>
                <dd className="font-medium tabular-nums text-success">− {rsd(p.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-secondary">Dostava</dt>
              <dd className={`font-medium tabular-nums ${p.shippingCost > 0 ? "" : "text-success"}`}>{p.shippingCost > 0 ? rsd(p.shippingCost) : "Besplatno"}</dd>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-subtle pt-3">
              <dt className="font-semibold">Ukupno</dt>
              <dd className="text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{rsd(p.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-4">
          <div className={KARTICA}>
            <h2 className={MALI}>Isporuka</h2>
            <p className="mt-2 text-[15px] font-medium">{ISPORUKA_OPIS[p.deliveryType]}</p>
            {p.deliveryType === "adresa" ? (
              <>
                {(p.shippingAddress || p.shippingCity) && (
                  <p className="mt-1 text-[14px] text-secondary">{[p.shippingAddress, [p.shippingZipCode, p.shippingCity].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</p>
                )}
                {p.courier && <p className="mt-1 text-[14px] text-secondary">Kurirska služba: {KURIR_LABEL[p.courier] ?? p.courier}</p>}
              </>
            ) : (
              <p className="mt-1 text-[14px] text-secondary">
                {radnja.name}, {radnja.street}, {radnja.city}
              </p>
            )}
            {p.companyName && <p className="mt-3 text-[14px] text-secondary">Kupac: {p.companyName}</p>}
          </div>
          <div className={KARTICA}>
            <h2 className={MALI}>Plaćanje</h2>
            <p className="mt-2 text-[15px] font-medium">{placanjeOpis(p)}</p>
            <p className={`mt-1 text-[14px] ${p.isPaid ? "text-success" : "text-secondary"}`}>
              {STATUS_PLACANJA[p.paymentStatus] ?? p.paymentStatus}
              {p.paidAt ? `, ${datum(p.paidAt)}` : ""}
            </p>
            {cekaUplatu && !gost && (
              <p className="mt-3 rounded-[4px] bg-brand-soft px-3.5 py-3 text-[13.5px] leading-[20px]">
                Poziv na broj <b className="font-semibold">{p.orderNumber}</b>, iznos <b className="font-semibold">{rsd(p.totalAmount)}</b>. Podaci za uplatu i IPS QR kod su u mejlu potvrde. Šaljemo čim uplata stigne.
              </p>
            )}
          </div>
          {p.notes && (
            <div className={KARTICA}>
              <h2 className={MALI}>Napomena</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-[21px]">{p.notes}</p>
            </div>
          )}
          {/* reklamacija: u nalogu forma za ovu porudžbinu (14 dana, jedna po porudžbini); gost na javnoj strani reklamacije */}
          {!otkazana && (gost || p.canComplain) && (
            <Link
              href={gost ? "/reklamacija-proizvoda/" : `/moj-nalog/reklamacije/nova/?porudzbina=${p.id}`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface text-[14px] font-medium ring-1 ring-subtle transition hover:ring-input"
            >
              <MessageSquareWarning className="size-4" strokeWidth={1.8} aria-hidden />
              Nešto nije u redu? Reklamacija
            </Link>
          )}
          <a href={radnja.phoneHref} className="block text-center text-[13px] text-secondary hover:text-primary">
            Pitanje o porudžbini: <span className="font-medium text-primary">{radnja.phone}</span>
          </a>
        </aside>
      </div>
    </>
  );
}
