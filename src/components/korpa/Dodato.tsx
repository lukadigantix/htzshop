"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleAlert, X } from "lucide-react";
import type { StanjeDodavanja } from "@/app/korpa/actions";
import { DOGADJAJ_DODATO } from "@/lib/korpa-deo";
import { rsd } from "@/lib/filteri";
import { ArrowRight } from "../Icons";
import Razdvajac from "../Razdvajac";

/*
  Obaveštenje „Dodato u korpu" (jedno za ceo sajt, u layout-u): izleti gore desno ispod zaglavlja, na telefonu odozdo.
  Slika na beloj podlozi, naziv, varijanta, cena i koliko ih je u korpi; „Idi u korpu" je glavno dugme, „Nastavi kupovinu"
  ga zatvara. Samo se skloni posle 6 s (stoji dok je miš na njemu). Greška (nema na stanju, server) ide u istu kutiju, crveno.
*/
export default function Dodato() {
  const [s, setS] = useState<StanjeDodavanja | null>(null);
  const [vidljivo, setVidljivo] = useState(false);
  const tajmer = useRef<number | undefined>(undefined);
  const pathname = usePathname();

  const sakrij = () => setVidljivo(false);
  const zakazi = useCallback(() => {
    window.clearTimeout(tajmer.current);
    tajmer.current = window.setTimeout(() => setVidljivo(false), 6000);
  }, []);

  useEffect(() => {
    const na = (e: Event) => {
      setS((e as CustomEvent<StanjeDodavanja>).detail);
      setVidljivo(true);
      zakazi();
    };
    window.addEventListener(DOGADJAJ_DODATO, na);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && sakrij();
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener(DOGADJAJ_DODATO, na);
      window.removeEventListener("keydown", esc);
      window.clearTimeout(tajmer.current);
    };
  }, [zakazi]);

  // prelazak na drugu stranu (npr. klik na „Idi u korpu") zatvara obaveštenje
  const [putanja, setPutanja] = useState(pathname);
  if (putanja !== pathname) {
    setPutanja(pathname);
    setVidljivo(false);
  }

  if (!s) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => window.clearTimeout(tajmer.current)}
      onMouseLeave={zakazi}
      className={`fixed inset-x-3 bottom-3 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[132px] sm:w-[400px] ${
        vidljivo ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0 sm:-translate-y-3"
      }`}
    >
      <div className="overflow-hidden rounded-[8px] bg-surface shadow-[0_30px_70px_-20px_rgba(32,33,36,0.45),0_0_0_1px_rgba(32,33,36,0.06)]">
        {/* traka upozorenja kao potpis sajta */}
        <div aria-hidden className={`h-1.5 ${s.ok ? "bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_10px,var(--text-primary)_10px_20px)]" : "bg-sale"}`} />
        <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
          <p className={`flex items-center gap-2 text-[14px] font-semibold ${s.ok ? "text-primary" : "text-sale"}`}>
            {s.ok ? (
              <span className="grid size-5 place-items-center rounded-full bg-success text-white">
                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m2.5 6.2 2.3 2.3 4.7-5" />
                </svg>
              </span>
            ) : (
              <CircleAlert className="size-5" strokeWidth={2} aria-hidden />
            )}
            {s.ok ? "Dodato u korpu" : "Nije dodato u korpu"}
          </p>
          <button type="button" onClick={sakrij} aria-label="Zatvori" className="-mr-1.5 -mt-1 grid size-8 place-items-center rounded-full text-secondary transition hover:bg-page hover:text-primary">
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        {s.ok ? (
          <>
            <div className="flex gap-3.5 px-4 pb-4 pt-3">
              <span className="relative grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-[6px] bg-white ring-1 ring-subtle">
                {s.artikal.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- slika sa backenda, mala
                  <img src={s.artikal.image} alt="" className="size-full object-contain p-1.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[15px] font-semibold leading-snug">{s.artikal.name}</p>
                <p className="mt-1 text-[13px] text-secondary">
                  {s.artikal.varijanta && (
                    <>
                      {s.artikal.varijanta}
                      <Razdvajac />
                    </>
                  )}
                  {s.artikal.qty} kom
                </p>
                {s.artikal.price != null && <p className="mt-1.5 text-[17px] font-semibold tabular-nums">{rsd(s.artikal.price * s.artikal.qty)}</p>}
              </div>
            </div>
            {s.napomena && <p className="mx-4 mb-3 rounded-[4px] bg-brand-soft px-3 py-2 text-[13px]">{s.napomena}</p>}
            <div className="grid grid-cols-2 gap-2 border-t border-subtle p-3">
              <button type="button" onClick={sakrij} className="h-11 rounded-full border border-input text-[14px] font-medium transition hover:border-primary">
                Nastavi kupovinu
              </button>
              <Link href="/korpa/" className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-brand text-[14px] font-semibold text-on-brand transition hover:bg-brand-hover">
                Idi u korpu ({s.broj})
                <ArrowRight width={14} height={14} strokeWidth={2} />
              </Link>
            </div>
          </>
        ) : (
          <p className="px-4 pb-4 pt-2 text-[14px] leading-[21px] text-secondary">{s.greska}</p>
        )}
      </div>
    </div>
  );
}
