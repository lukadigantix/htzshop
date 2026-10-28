"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlide } from "@/data/site";
import { ChevronLeft, ChevronRight } from "./Icons";

const DURATION = 7000;

/*
  Hero kao na pitbike.vercel.app: puna širina, 702 px, fotografija preko celog ekrana,
  tekst dole levo (nadnaslov 14, naslov 40/500, pasus 14, pilula + mali tekst).
  Smena slajdova: crossfade, imena slajdova i dve tanke strelice dole desno.
  Slajdovi dolaze iz admina (Podešavanja → Baneri) preko Hero.tsx.
*/
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = slides.length;

  const go = useCallback((i: number) => { setActive(((i % n) + n) % n); setCycle((c) => c + 1); }, [n]);

  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(() => go(active + 1), DURATION);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, paused, cycle, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(active + 1); if (e.key === "ArrowLeft") go(active - 1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  return (
    <section className="relative h-[620px] overflow-hidden bg-[#15181d] text-white md:h-[680px] xl:h-[702px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Istaknute kategorije">
      {slides.map((s, i) => {
        const isActive = i === active;
        return (
          <div key={s.key} className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!isActive}>
            <Image src={s.image} alt={s.imageAlt} fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: s.imagePosition ?? "center" }} />
            <div className="absolute inset-0" style={{ backgroundImage: s.fade }} />
            <div key={isActive ? `t-${cycle}` : "t"} className={`absolute bottom-[96px] left-4 right-4 md:bottom-14 md:left-14 md:right-auto md:w-[480px] lg:w-[560px] xl:w-[640px] ${isActive ? "hero-in" : ""}`}>
              <p className="text-[14px] text-white/90 md:text-[16px]">{s.eyebrow}</p>
              <h1 className="mt-3 text-[34px] font-medium leading-[36px] md:text-[48px] md:leading-[52px]">{s.title}</h1>
              <p className="mt-3 max-w-[540px] text-[14px] leading-[21px] text-white/85 md:mt-4 md:text-[16px] md:leading-[24px]">{s.text}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 md:gap-4">
                <Link href={s.cta.href} className="btn-primary">{s.cta.label}</Link>
                {s.secondary && (
                  <Link href={s.secondary.href} className="btn-secondary">
                    {s.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 right-4 z-10 flex h-10 items-center gap-5 md:bottom-14 md:right-14 md:gap-8">
        <nav aria-label="Slajdovi" className="hidden items-center gap-5 xl:flex">
          {slides.map((s, i) => (
            <button key={s.key} type="button" onClick={() => go(i)} aria-current={i === active} className={`relative flex h-10 items-center text-[13px] uppercase tracking-[0.14em] transition-colors ${i === active ? "text-white" : "text-white/55 hover:text-white"}`}>
              {s.label}
              <span className={`absolute inset-x-0 bottom-1.5 h-px bg-white transition-opacity ${i === active ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </nav>
        <span className="text-[12px] tracking-[0.14em] text-white/70 xl:hidden"><span className="text-white">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(active - 1)} aria-label="Prethodni slajd" className="grid size-10 place-items-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10"><ChevronLeft width={16} height={16} strokeWidth={1.5} /></button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Sledeći slajd" className="grid size-10 place-items-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10"><ChevronRight width={16} height={16} strokeWidth={1.5} /></button>
        </div>
      </div>
    </section>
  );
}
