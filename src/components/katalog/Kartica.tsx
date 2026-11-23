import Image from "next/image";
import Link from "next/link";
import { Heart } from "../Icons";
import DodajUKorpu from "../korpa/DodajUKorpu";
import Razdvajac from "../Razdvajac";
import { rsd } from "@/lib/filteri";
import type { Kartica as K } from "@/lib/katalog";
import { bezOptimizacije } from "@/lib/slike";

/*
  Kartica proizvoda (ista u prodavnici, na naslovnoj i u „Sličnim proizvodima"):
  - bela scena sa fotografijom: brend gore levo (logo ili naziv), ispod njega značke, srce desno
  - kategorija iznad naziva; naziv; boja i veličina („Neon žuta · Univerzalna veličina")
  - cena krupno sa „RSD" i „sa PDV-om" u istom redu; stanje i isporuka odmah iznad dugmeta
  - žuto dugme „Dodaj u korpu" preko cele širine; slika i naziv vode na stranu proizvoda
  Donja polovina (podaci) je tamna, iste boje kao podnožje sajta (#18191b). Celine su odvojene razmakom (bez linija). Uska kartica (dve u redu na telefonu) ima manja slova (container query):
  kategorija 12/13, naziv 18/20, osobine 14, cena 24/26, valuta 16, „sa PDV-om" 13, stanje 14, dugme 16 px.
*/
export default function Kartica({ p, prva = false }: { p: K; /** u prvom redu, vidljiva odmah - slika se učitava bez čekanja */ prva?: boolean }) {
  const href = `/proizvod/${p.slug}/`;
  const popust = p.basePrice && p.basePrice > p.price ? Math.round((1 - p.price / p.basePrice) * 100) : 0;
  const isporuka = (p.deliveryTime ?? "1-2 radna dana").replace(/(\d)\s*-\s*(\d)/, "$1–$2");
  const znacke = [...p.badges, ...(p.shipping?.free ? ["Besplatna dostava"] : [])];

  return (
    <article className="group/k @container relative flex flex-col overflow-hidden rounded-[14px] bg-surface shadow-[0_14px_34px_-22px_rgba(32,33,36,0.35),0_0_0_1px_rgba(32,33,36,0.05)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_56px_-28px_rgba(32,33,36,0.45),0_0_0_1px_rgba(32,33,36,0.06)]">
      {/* scena */}
      <Link href={href} aria-label={p.name} className="relative block aspect-[5/4] overflow-hidden bg-surface">
        {/* brend gore levo: logo, inače naziv */}
        {(p.brandLogo || p.brand) && (
          <span className="absolute left-4 right-16 top-4 z-10 flex h-7 items-center">
            {p.brandLogo ? (
              <span className="relative block h-6 w-[96px] @min-[260px]:h-7 @min-[260px]:w-[120px]">
                <Image src={p.brandLogo} alt={p.brand ?? ""} fill sizes="120px" unoptimized={bezOptimizacije(p.brandLogo)} className="object-contain object-left" />
              </span>
            ) : (
              <span className="truncate text-[12px] font-semibold uppercase tracking-[0.1em] text-primary @min-[260px]:text-[13px]">{p.brand}</span>
            )}
          </span>
        )}
        {(popust > 0 || znacke.length > 0) && (
          <span className={`absolute left-4 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-1.5 ${p.brandLogo || p.brand ? "top-12" : "top-4"}`}>
            {popust > 0 && <span className="rounded-full bg-sale px-2.5 py-1 text-[11px] font-semibold leading-none text-white">-{popust}%</span>}
            {znacke.map((b) => (
              <span key={b} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${b === "Besplatna dostava" ? "bg-success text-white" : "bg-brand text-on-brand"}`}>
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
            sizes="(min-width: 1280px) 360px, (min-width: 1024px) 30vw, 50vw"
            unoptimized={bezOptimizacije(p.image)}
            className="object-contain px-[8%] pb-[3%] pt-[14%] transition-transform duration-500 ease-out will-change-transform group-hover/k:-translate-y-1 group-hover/k:scale-[1.03]"
          />
        )}
      </Link>
      <button type="button" aria-label="Dodaj na listu želja" className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-surface text-primary shadow-[0_2px_10px_rgba(32,33,36,0.12)] ring-1 ring-black/5 transition hover:text-sale">
        <Heart width={18} height={18} strokeWidth={1.7} />
      </button>

      {/* podaci */}
      <div className="flex flex-1 flex-col bg-[#18191b] px-3.5 pb-4 pt-3 text-white @min-[260px]:px-5 @min-[260px]:pb-5 @min-[260px]:pt-4">
        {p.group && <p className="truncate text-[12px] font-semibold uppercase tracking-[0.1em] text-white/60 @min-[260px]:text-[13px]">{p.group}</p>}
        <h3 className="mt-1 line-clamp-2 text-[18px] font-semibold leading-[1.22] tracking-[-0.01em] @min-[260px]:text-[20px]">
          <Link href={href}>{p.name}</Link>
        </h3>
        {p.osobine && <p className="mt-1.5 line-clamp-1 text-[14px] text-white/60">{p.osobine}</p>}

        {/* cena, stanje i dugme: uvek na dnu kartice */}
        <div className="mt-auto pt-4">
          {popust > 0 && <p className="text-[13px] text-white/50 line-through tabular-nums">{rsd(p.basePrice!)}</p>}
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={`whitespace-nowrap text-[24px] font-bold leading-none tracking-[-0.03em] tabular-nums @min-[260px]:text-[26px] ${popust > 0 ? "text-[#ff6b5b]" : ""}`}>
              {p.price.toLocaleString("sr-RS").replace(/,/g, ".")}
              <span className="ml-1 text-[16px] font-semibold tracking-normal">RSD</span>
            </span>
            <span className="text-[13px] text-white/60">{p.priceLabel === "+ PDV" ? "+ PDV" : "sa PDV-om"}</span>
          </p>

          <p className="mt-3 flex items-start gap-2 text-[14px] text-white/60">
            <span aria-hidden className="mt-[7px] size-2 shrink-0 rounded-full" style={{ background: p.inStock ? "#22c55e" : "#6b6f76" }} />
            {p.inStock ? (
              <span>
                <b className="font-medium text-white">Na stanju</b>
                <Razdvajac />
                Isporuka {isporuka}
              </span>
            ) : (
              <span>
                <b className="font-medium text-white">Nema na stanju</b>
                <Razdvajac />
                <Link href="/kontakt/" className="font-medium text-white underline-offset-2 hover:underline">
                  pitajte nas
                </Link>
              </span>
            )}
          </p>

          <DodajUKorpu
            slug={p.slug}
            inStock={p.inStock}
            className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[16px] font-semibold text-on-brand transition duration-200 hover:bg-brand-hover active:scale-[0.98] disabled:bg-white/10 disabled:text-white/50 aria-busy:bg-brand aria-busy:text-on-brand"
          />
        </div>
      </div>
    </article>
  );
}
