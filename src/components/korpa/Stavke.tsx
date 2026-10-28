"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { CircleAlert, Minus, Plus, Trash2 } from "lucide-react";
import { promeniKolicinu } from "@/app/korpa/actions";
import { DOGADJAJ_KORPA, varijanta, type ObracunStavka } from "@/lib/korpa-deo";
import { rsd } from "@/lib/filteri";
import Razdvajac from "../Razdvajac";

/*
  Stavke korpe: slika na beloj podlozi, brend i naziv (link na proizvod), varijanta, cena po komadu, količina (− broj +),
  ukloni i iznos stavke. Količina se menja odmah na ekranu (useOptimistic), akcija upiše kolačić i strana se ponovo obračuna.
  Stavka koja nije dostupna u traženoj količini dobija napomenu sa backenda (note) i dugme da se svede na stanje.
*/
export default function Stavke({ stavke }: { stavke: ObracunStavka[] }) {
  const [radi, start] = useTransition();
  const [kolicine, postavi] = useOptimistic(Object.fromEntries(stavke.map((s) => [s.productId, s.quantity])) as Record<string, number>, (st, [id, q]: [string, number]) => ({ ...st, [id]: q }));

  const promeni = (id: string, q: number) =>
    start(async () => {
      postavi([id, q]);
      await promeniKolicinu(id, q);
      window.dispatchEvent(new Event(DOGADJAJ_KORPA));
    });

  return (
    <ul aria-busy={radi} className="divide-y divide-subtle">
      {stavke.map((s) => {
        const q = kolicine[s.productId] ?? s.quantity;
        if (q < 1) return null;
        const p = s.product;
        const href = `/proizvod/${p.slug}/`;
        const max = Math.max(1, s.maxQuantity || p.availableQty || 1);
        const v = varijanta(p);
        return (
          <li key={s.productId} className={`grid grid-cols-[84px_1fr] gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[112px_1fr] sm:gap-6 ${!s.available ? "opacity-90" : ""}`}>
            <Link href={href} className="relative grid aspect-square place-items-center overflow-hidden rounded-[6px] bg-white ring-1 ring-subtle">
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element -- slika sa backenda
                <img src={p.image} alt="" className="size-full object-contain p-2" />
              )}
            </Link>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {p.brand?.name && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">{p.brand.name}</p>}
                  <h3 className="mt-0.5 text-[16px] font-semibold leading-snug sm:text-[18px]">
                    <Link href={href} className="hover:underline hover:underline-offset-2">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[13px] text-secondary">
                    {v && (
                      <>
                        {v}
                        <Razdvajac />
                      </>
                    )}
                    <span className="tabular-nums">{rsd(s.unitPrice)}</span> / kom
                  </p>
                </div>
                <p className="hidden shrink-0 text-right text-[18px] font-semibold tabular-nums sm:block">{rsd(s.unitPrice * q)}</p>
              </div>

              {s.note && (
                <p className="mt-2.5 flex items-start gap-2 rounded-[4px] bg-[#fff4e5] px-3 py-2 text-[13px] leading-[19px] text-primary">
                  <CircleAlert className="mt-px size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden />
                  <span>
                    {s.note}
                    {s.maxQuantity > 0 && q > s.maxQuantity && (
                      <button type="button" onClick={() => promeni(s.productId, s.maxQuantity)} className="ml-1.5 font-semibold underline underline-offset-2">
                        Svedi na {s.maxQuantity} kom
                      </button>
                    )}
                  </span>
                </p>
              )}

              <div className="mt-3.5 flex items-center justify-between gap-3">
                <div className="flex h-10 items-center rounded-full border border-input bg-surface">
                  <button type="button" onClick={() => promeni(s.productId, q - 1)} disabled={q <= 1} aria-label={`Smanji količinu: ${p.name}`} className="grid h-full w-10 place-items-center text-primary transition disabled:text-[#c4c7cc]">
                    <Minus className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                  <span aria-live="polite" className="w-8 text-center text-[15px] font-semibold tabular-nums">
                    {q}
                  </span>
                  <button type="button" onClick={() => promeni(s.productId, q + 1)} disabled={q >= max} aria-label={`Povećaj količinu: ${p.name}`} className="grid h-full w-10 place-items-center text-primary transition disabled:text-[#c4c7cc]">
                    <Plus className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <p className="text-[16px] font-semibold tabular-nums sm:hidden">{rsd(s.unitPrice * q)}</p>
                <button type="button" onClick={() => promeni(s.productId, 0)} className="hidden items-center gap-1.5 text-[13px] font-medium text-secondary transition hover:text-sale sm:flex">
                  <Trash2 className="size-4" strokeWidth={1.8} aria-hidden />
                  Ukloni
                </button>
              </div>
              <button type="button" onClick={() => promeni(s.productId, 0)} className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-secondary transition hover:text-sale sm:hidden">
                <Trash2 className="size-4" strokeWidth={1.8} aria-hidden />
                Ukloni
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
