import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { Heart } from "../Icons";
import DodajUKorpu from "../korpa/DodajUKorpu";
import Razdvajac from "../Razdvajac";
import { rsd } from "@/lib/filteri";
import type { Kartica as K } from "@/lib/katalog";

/*
  Kartica proizvoda (ista u prodavnici, na naslovnoj i u „Sličnim proizvodima"), po uzoru na karticu sa klikdogume:
  - bela scena: logo brenda gore levo, značke ispod, srce desno; proizvod krupno (na hover se izdigne)
  - brend | vrsta sitno, naziv krupno i jako, stanje sa rokom isporuke i dostava u dva reda sa ikonama
  - cena krupno, pa „Dodaj u korpu" kao veliko žuto dugme preko cele širine (najvažnija radnja), „Saznaj više" ispod
  Uska kartica (dve u redu na telefonu) skraćuje tekstove preko container query-ja.
*/
export default function Kartica({ p, prva = false }: { p: K; /** u prvom redu, vidljiva odmah - slika se učitava bez čekanja */ prva?: boolean }) {
  const href = `/proizvod/${p.slug}/`;
  const popust = p.basePrice && p.basePrice > p.price ? Math.round((1 - p.price / p.basePrice) * 100) : 0;
  const isporuka = p.deliveryTime ?? "1-2 radna dana";

  return (
    <article className="group/k @container relative flex flex-col overflow-hidden rounded-[6px] bg-surface shadow-[0_14px_34px_-22px_rgba(32,33,36,0.35),0_0_0_1px_rgba(32,33,36,0.05)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_56px_-28px_rgba(32,33,36,0.45),0_0_0_1px_rgba(32,33,36,0.06)]">
      {/* scena */}
      <Link href={href} aria-label={p.name} className="relative block aspect-[5/4] overflow-hidden bg-surface">
        <span className="absolute left-4 right-14 top-4 z-10 flex h-7 items-center">
          {p.brandLogo ? (
            <span className="relative block h-6 w-[96px] @min-[260px]:h-7 @min-[260px]:w-[120px]">
              <Image src={p.brandLogo} alt={p.brand ?? ""} fill sizes="120px" unoptimized={/^https?:/.test(p.brandLogo)} className="object-contain object-left" />
            </span>
          ) : (
            p.brand && <span className="text-[13px] font-semibold uppercase tracking-[0.12em]">{p.brand}</span>
          )}
        </span>
        {(popust > 0 || p.badges.length > 0) && (
          <span className="absolute left-4 top-12 z-10 flex flex-wrap gap-1.5">
            {popust > 0 && <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-semibold leading-none text-white">-{popust}%</span>}
            {p.badges.map((b) => (
              <span key={b} className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold leading-none text-on-brand">
                {b}
              </span>
            ))}
          </span>
        )}
        {p.image && (
          <Image
            src={p.image}
            alt=""
            fill
            loading={prva ? "eager" : undefined}
            fetchPriority={prva ? "high" : undefined}
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 100vw"
            unoptimized={/^https?:/.test(p.image)}
            className="object-contain px-[12%] pb-[4%] pt-[18%] transition-transform duration-500 ease-out will-change-transform group-hover/k:-translate-y-1.5 group-hover/k:scale-[1.04]"
          />
        )}
      </Link>
      <button type="button" aria-label="Dodaj na listu želja" className="absolute right-3.5 top-3.5 z-10 grid size-10 place-items-center rounded-full bg-surface text-primary shadow-[0_2px_10px_rgba(32,33,36,0.12)] ring-1 ring-black/5 transition hover:text-sale">
        <Heart width={18} height={18} strokeWidth={1.7} />
      </button>

      {/* podaci */}
      <div className="flex flex-1 flex-col px-3.5 pb-4 pt-2 @min-[260px]:px-5 @min-[260px]:pb-5">
        {(p.brand || p.group) && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
            {p.brand}
            {p.brand && p.group && <Razdvajac />}
            {p.group}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-[17px] font-semibold leading-[1.2] tracking-[-0.01em] @min-[260px]:text-[21px]">
          <Link href={href}>{p.name}</Link>
        </h3>

        <div className="mt-3 space-y-1.5 border-t border-subtle pt-3 text-[13px] text-secondary">
          <p className="flex items-center gap-2">
            <span aria-hidden className="grid size-4 shrink-0 place-items-center">
              <span className={`size-2 rounded-full ${p.inStock ? "bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.18)]" : "bg-[#c4c7cc]"}`} />
            </span>
            {p.inStock ? (
              <span className="truncate">
                Na stanju
                <span className="hidden @min-[260px]:inline">
                  <Razdvajac />
                  <b className="font-semibold text-primary">isporuka {isporuka}</b>
                </span>
              </span>
            ) : (
              <span>
                Nema na stanju
                <Razdvajac />
                <Link href="/kontakt/" className="font-semibold text-primary underline-offset-2 hover:underline">
                  pitajte nas
                </Link>
              </span>
            )}
          </p>
          {p.shipping?.label && (
            <p className="flex items-center gap-2">
              <Truck className={`size-4 shrink-0 ${p.shipping.free ? "text-success" : "text-[#9a9ea5]"}`} strokeWidth={1.8} aria-hidden />
              {p.shipping.free ? <b className="font-semibold text-success">{p.shipping.label}</b> : <span>{p.shipping.label}</span>}
            </p>
          )}
        </div>

        {/* cena i dugme */}
        <div className="mt-auto pt-4">
          <div className="border-t border-subtle pt-4">
            {popust > 0 && <p className="text-[13px] text-secondary line-through tabular-nums">{rsd(p.basePrice!)}</p>}
            <p className={`whitespace-nowrap text-[23px] font-semibold leading-none tracking-[-0.03em] tabular-nums @min-[260px]:text-[28px] ${popust > 0 ? "text-sale" : ""}`}>
              {p.price.toLocaleString("sr-RS").replace(/,/g, ".")}
              <span className="ml-1 text-[13px] font-semibold tracking-normal text-secondary">RSD</span>
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">{p.priceLabel === "+ PDV" ? "+ PDV" : "sa PDV-om"}</p>
          </div>
          <DodajUKorpu
            slug={p.slug}
            inStock={p.inStock}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-[14px] font-semibold text-on-brand shadow-[0_10px_22px_-10px_rgba(245,197,24,0.9)] transition duration-200 hover:bg-brand-hover hover:shadow-[0_14px_28px_-10px_rgba(245,197,24,1)] active:scale-[0.98] disabled:bg-disabled disabled:text-secondary disabled:shadow-none aria-busy:bg-brand aria-busy:text-on-brand @min-[260px]:h-12 @min-[260px]:text-[15px]"
          />
          <Link href={href} className="mx-auto mt-3 flex w-fit items-center gap-1 text-[13px] font-medium text-secondary transition hover:text-primary">
            Saznaj više <ArrowRight className="size-3.5 transition-transform group-hover/k:translate-x-0.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
