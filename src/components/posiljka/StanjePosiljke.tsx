import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Razdvajac from "../Razdvajac";
import { ChevronRight, Clock, Pin } from "../Icons";
import { KurirZnacka, TrakaPosiljke } from "../nalog/Status";
import { MALI } from "../nalog/stil";
import { datumVreme, type Posiljka, type StatusPosiljke } from "@/lib/nalog-deo";

/** šta status znači za kupca, jednom rečenicom */
export const SLEDI_POSILJKA: Record<StatusPosiljke, string> = {
  kreirana: "Pošiljka je prijavljena kuriru i čeka preuzimanje.",
  preuzeta: "Kurir je preuzeo pošiljku i ona je na putu.",
  u_isporuci: "Pošiljka je kod kurira za isporuku i stiže danas. Držite telefon pri ruci.",
  isporucena: "Pošiljka je isporučena.",
  vracena: "Pošiljka je vraćena pošiljaocu. Pozovite nas da dogovorimo novu isporuku.",
  greska: "Stanje kod kurira trenutno ne može da se proveri. Pokušajte kasnije ili nas pozovite.",
};

/**
 * Stanje jedne pošiljke: služba, broj, veliki status sa trakom, poslednje kod kurira i kretanje (najnovije gore).
 * Ista u nalogu (/moj-nalog/pracenje) i na javnoj strani (/pracenje-posiljke); `porudzbinaId` daje link na porudžbinu u nalogu.
 */
export default function StanjePosiljke({ s, porudzbinaId }: { s: Posiljka; porudzbinaId?: string }) {
  const napomena = s.status === "vracena" || s.status === "greska";
  return (
    <section aria-label="Stanje pošiljke" className="mt-4 overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-40px_rgba(32,33,36,0.45)]">
      <div aria-hidden className="h-2 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_14px,var(--text-primary)_14px_28px)]" />
      <div className="p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <KurirZnacka courier={s.courier} label={s.courierLabel} />
            <span className="text-[16px] font-semibold tabular-nums">{s.number}</span>
          </div>
          {s.orderNumber &&
            (porudzbinaId ? (
              <Link href={`/moj-nalog/porudzbine/${porudzbinaId}/`} className="link-arrow">
                Porudžbina #{s.orderNumber} <ChevronRight width={13} height={13} strokeWidth={2} />
              </Link>
            ) : (
              <span className="text-[14px] text-secondary">Porudžbina #{s.orderNumber}</span>
            ))}
        </div>

        <p className="mt-5 text-[32px] font-semibold leading-none tracking-[-0.03em] md:text-[40px]">{s.statusLabel}</p>
        <TrakaPosiljke status={s.status} className="mt-6" />
        <p className={`mt-4 text-[15px] leading-[23px] ${napomena ? "rounded-[4px] bg-[#fff4e5] px-4 py-3" : "text-secondary"}`}>{SLEDI_POSILJKA[s.status]}</p>

        {(s.courierStatus || s.location || s.statusAt || s.expectedDelivery) && (
          <dl className="mt-6 grid gap-4 border-t border-subtle pt-5 text-[14px] sm:grid-cols-2">
            {(s.courierStatus || s.location || s.statusAt) && (
              <div>
                <dt className="text-[12px] uppercase tracking-[0.14em] text-secondary">Poslednje kod kurira</dt>
                <dd className="mt-1 font-medium">{s.courierStatus ?? s.statusLabel}</dd>
                {(s.location || s.statusAt) && (
                  <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-secondary">
                    {s.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <Pin width={13} height={13} strokeWidth={1.8} />
                        {s.location}
                      </span>
                    )}
                    {s.statusAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock width={13} height={13} strokeWidth={1.8} />
                        {datumVreme(s.statusAt)}
                      </span>
                    )}
                  </dd>
                )}
              </div>
            )}
            {s.expectedDelivery && s.status !== "isporucena" && (
              <div>
                <dt className="text-[12px] uppercase tracking-[0.14em] text-secondary">Očekivana isporuka</dt>
                <dd className="mt-1 font-medium">{s.expectedDelivery}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-6 border-t border-subtle pt-5">
          <h3 className={MALI}>Kretanje pošiljke</h3>
          {s.history.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-[14px] text-secondary">
              <PackageSearch className="size-4 shrink-0" strokeWidth={1.8} aria-hidden />
              Kurir još nije upisao kretanje. Prvi podaci stižu kad preuzme pošiljku.
            </p>
          ) : (
            <ol className="mt-4">
              {s.history.map((h, i) => (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < s.history.length - 1 && <span aria-hidden className="absolute left-[6px] top-5 h-[calc(100%-14px)] w-0.5 bg-subtle" />}
                  <span aria-hidden className={`mt-1 size-3.5 shrink-0 rounded-full ${i === 0 ? "bg-brand ring-4 ring-brand-soft" : "bg-subtle"}`} />
                  <div className="min-w-0 leading-tight">
                    <p className={`text-[15px] ${i === 0 ? "font-semibold" : "font-medium"}`}>{h.name}</p>
                    {(h.date || h.location) && (
                      <p className="mt-1 text-[13px] text-secondary">
                        {h.date && datumVreme(h.date)}
                        {h.date && h.location && <Razdvajac />}
                        {h.location}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        {s.lastCheckedAt && <p className="mt-5 text-[12px] text-secondary">Stanje provereno kod kurira: {datumVreme(s.lastCheckedAt)}</p>}
      </div>
    </section>
  );
}
