import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { MALI, Prazno, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { StatusPilula, TrakaStatusa } from "@/components/nalog/Status";
import Razdvajac from "@/components/Razdvajac";
import { ArrowRight, ChevronRight } from "@/components/Icons";
import { PORUKA_SERVER } from "@/lib/api";
import { rsd } from "@/lib/filteri";
import { getMojePorudzbine, zahtevajKorisnika } from "@/lib/nalog";
import { datum, placanjeOpis, ZAVRSENE, type PorudzbinaNaloga } from "@/lib/nalog-deo";

export const metadata: Metadata = { title: "Moje porudžbine - HTZ Shop", robots: { index: false } };

/** GET /orders/my-orders: najnovije prve, one u toku odvojene od završenih; kartica pokazuje šta je poručeno i dokle je stiglo. */
export default async function PorudzbinePage() {
  await zahtevajKorisnika("/moj-nalog/porudzbine/");
  const lista = await getMojePorudzbine();
  if (!lista) throw new Error(PORUKA_SERVER);
  const grupe = (
    [
      ["U toku", lista.filter((p) => !ZAVRSENE.has(p.status))],
      ["Završene", lista.filter((p) => ZAVRSENE.has(p.status))],
    ] as const
  ).filter(([, g]) => g.length > 0);

  return (
    <StranaNaloga naslov="Moje porudžbine" uvod={lista.length ? `Ukupno ${lista.length}. Kliknite na porudžbinu za stavke, isporuku i plaćanje.` : undefined}>
      {lista.length === 0 ? (
        <Prazno Icon={Package} naslov="Još nema porudžbina" opis="Kad poručite, ovde pratite status i istoriju kupovina. Porudžbine bez naloga se ne prikazuju ovde.">
          <Link href="/prodavnica/" className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
            Idite u prodavnicu <ArrowRight width={15} height={15} strokeWidth={1.8} />
          </Link>
        </Prazno>
      ) : (
        <div className="space-y-10">
          {grupe.map(([naslov, g]) => (
            <section key={naslov} aria-label={naslov}>
              {grupe.length > 1 && (
                <h2 className={`${MALI} mb-3`}>
                  {naslov} ({g.length})
                </h2>
              )}
              <ul className="space-y-3">
                {g.map((p) => (
                  <li key={p.id}>
                    <Kartica p={p} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </StranaNaloga>
  );
}

function Kartica({ p }: { p: PorudzbinaNaloga }) {
  const slike = p.items.filter((s) => s.product?.image).slice(0, 3);
  return (
    <Link
      href={`/moj-nalog/porudzbine/${p.id}/`}
      className="group block rounded-[6px] bg-surface p-4 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ring-1 ring-transparent transition hover:ring-brand md:p-6"
    >
      <div className="flex items-start gap-4">
        {slike.length > 0 && (
          <ul className="hidden shrink-0 -space-x-3 sm:flex">
            {slike.map((s) => (
              <li key={s.id} className="grid size-16 place-items-center overflow-hidden rounded-[4px] bg-white ring-1 ring-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element -- slika sa backenda */}
                <img src={s.product!.image!} alt="" className="size-full object-contain p-1" />
              </li>
            ))}
          </ul>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="text-[20px] font-semibold tracking-[-0.01em] tabular-nums">#{p.orderNumber}</span>
              <StatusPilula status={p.status} />
            </div>
            <span className="text-[19px] font-semibold tabular-nums">{rsd(p.totalAmount)}</span>
          </div>
          <p className="mt-1 text-[13px] text-secondary">
            {datum(p.createdAt)}
            <Razdvajac />
            {placanjeOpis(p)}
            {p.isPaid && (
              <>
                <Razdvajac />
                <span className="text-success">plaćeno</span>
              </>
            )}
          </p>
          {p.items.length > 0 && (
            <p className="mt-3 line-clamp-2 text-[14px] leading-[21px]">
              {p.items.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && <Razdvajac />}
                  {s.quantity} × {s.productName}
                </span>
              ))}
            </p>
          )}
          {!ZAVRSENE.has(p.status) && <TrakaStatusa status={p.status} className="mt-5 max-w-[560px]" />}
          <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-medium">
            Detalji
            <ChevronRight width={13} height={13} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
