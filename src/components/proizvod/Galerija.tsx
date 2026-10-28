"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "../Icons";

/*
  Galerija proizvoda: velika slika na beloj površini, sličice ispod (desktop) i prevlačenje sa tačkama (mobilni).
  Slike proizvoda su na beloj podlozi, pa idu object-contain + mix-blend-multiply kao na karticama.
*/
export default function Galerija({ images, alt, badges }: { images: string[]; alt: string; badges: { code: string; name: string }[] }) {
  const [active, setActive] = useState(0);
  const traka = useRef<HTMLDivElement>(null);
  const vise = images.length > 1;

  const idiNa = (i: number) => {
    const n = (i + images.length) % images.length;
    setActive(n);
    traka.current?.scrollTo({ left: n * traka.current.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="group relative overflow-hidden rounded-[4px] bg-surface">
        {/* traka slika: na mobilnom se prevlači (scroll-snap), na desktopu je menjaju strelice i sličice */}
        <div
          ref={traka}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-square w-full shrink-0 snap-center lg:aspect-[5/4]">
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt}, slika ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 60vw, 100vw"
                unoptimized={/^https?:/.test(src)}
                className="object-contain p-8 mix-blend-multiply md:p-14"
              />
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 md:left-6 md:top-6">
            {badges.map((b) => (
              <span key={b.code} className="rounded-full bg-brand px-3 py-1 text-[12px] font-medium text-on-brand">{b.name}</span>
            ))}
          </div>
        )}

        {vise && (
          <>
            <button type="button" onClick={() => idiNa(active - 1)} aria-label="Prethodna slika" className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-subtle bg-surface text-primary opacity-0 transition group-hover:opacity-100 hover:bg-page lg:grid">
              <ChevronLeft width={18} height={18} strokeWidth={1.6} />
            </button>
            <button type="button" onClick={() => idiNa(active + 1)} aria-label="Sledeća slika" className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-subtle bg-surface text-primary opacity-0 transition group-hover:opacity-100 hover:bg-page lg:grid">
              <ChevronRight width={18} height={18} strokeWidth={1.6} />
            </button>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
              {images.map((src, i) => (
                <span key={src + i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-primary" : "w-1.5 bg-primary/25"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {vise && (
        <div className="mt-3 hidden grid-cols-6 gap-3 lg:grid">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => idiNa(i)}
              aria-label={`Slika ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-[4px] bg-surface ring-1 transition ${i === active ? "ring-primary" : "ring-transparent hover:ring-subtle"}`}
            >
              <Image src={src} alt="" fill sizes="120px" unoptimized={/^https?:/.test(src)} className="object-contain p-2 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
