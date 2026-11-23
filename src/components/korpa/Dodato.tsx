"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleAlert, X } from "lucide-react";
import { zbirKorpe, type StanjeDodavanja } from "@/app/korpa/actions";
import { DOGADJAJ_DODATO } from "@/lib/korpa-deo";
import { rsd } from "@/lib/filteri";
import { ArrowRight } from "../Icons";
import Razdvajac from "../Razdvajac";

/*
  Obaveštenje „Dodato u korpu" (jedno za ceo sajt, u layout-u): izleti gore desno, 12 px ispod zaglavlja (meri se pri
  prikazu, jer gornja traka pri skrolovanju nestaje), na telefonu odozdo.
  - gore (belo): potvrda, slika, naziv, varijanta, količina i cena dodatog artikla
  - dole (tamno, kao kartica proizvoda): stanje korpe (broj artikala i iznos, stiže trenutak kasnije da dodavanje ne čeka
    obračun), „Nastavi kupovinu" i „Idi u korpu"
  - žuta traka na dnu pokazuje koliko još stoji (6 s); dok je miš na obaveštenju, traka i zatvaranje staju
  Greška (nema na stanju, server) ide u istu kutiju, crveno.
*/
const TRAJE_MS = 6000;
const artikala = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "artikal" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "artikla" : "artikala");

export default function Dodato() {
  const [s, setS] = useState<StanjeDodavanja | null>(null);
  const [vidljivo, setVidljivo] = useState(false);
  const [zbir, setZbir] = useState<{ broj: number; subtotal: number } | null>(null);
  // novi ključ pri svakom dodavanju: traka kreće ispočetka
  const [kljuc, setKljuc] = useState(0);
  // na računaru 12 px ispod donje ivice zaglavlja (gornja traka nestaje pri skrolovanju, zaglavlje ostaje)
  const [vrh, setVrh] = useState(132);
  const tajmer = useRef<number | undefined>(undefined);
  const preostalo = useRef(TRAJE_MS);
  const pocetak = useRef(0);
  const pathname = usePathname();

  const sakrij = () => setVidljivo(false);
  const pokreni = useCallback((ms: number) => {
    window.clearTimeout(tajmer.current);
    pocetak.current = Date.now();
    preostalo.current = ms;
    tajmer.current = window.setTimeout(() => setVidljivo(false), ms);
  }, []);
  const pauza = () => {
    window.clearTimeout(tajmer.current);
    preostalo.current = Math.max(800, preostalo.current - (Date.now() - pocetak.current));
  };

  useEffect(() => {
    const na = (e: Event) => {
      const detalj = (e as CustomEvent<StanjeDodavanja>).detail;
      const zaglavlje = document.querySelector("header");
      setVrh(zaglavlje ? Math.max(12, Math.round(zaglavlje.getBoundingClientRect().bottom) + 12) : 132);
      setS(detalj);
      setVidljivo(true);
      setKljuc((k) => k + 1);
      setZbir(null);
      pokreni(TRAJE_MS);
      if (detalj.ok) zbirKorpe().then((z) => z && setZbir(z)).catch(() => {});
    };
    window.addEventListener(DOGADJAJ_DODATO, na);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && sakrij();
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener(DOGADJAJ_DODATO, na);
      window.removeEventListener("keydown", esc);
      window.clearTimeout(tajmer.current);
    };
  }, [pokreni]);

  // prelazak na drugu stranu (npr. klik na „Idi u korpu") zatvara obaveštenje
  const [putanja, setPutanja] = useState(pathname);
  if (putanja !== pathname) {
    setPutanja(pathname);
    setVidljivo(false);
  }

  if (!s) return null;
  const broj = zbir?.broj ?? (s.ok ? s.broj : 0);
  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={pauza}
      onMouseLeave={() => pokreni(preostalo.current)}
      style={{ "--dodato-vrh": `${vrh}px` } as React.CSSProperties}
      className={`dodato fixed inset-x-3 bottom-3 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-[var(--dodato-vrh)] sm:w-[400px] ${
        vidljivo ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0 sm:-translate-y-3"
      }`}
    >
      <div className="overflow-hidden rounded-[14px] bg-surface shadow-[0_30px_70px_-20px_rgba(32,33,36,0.5),0_0_0_1px_rgba(32,33,36,0.06)]">
        <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
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
          <button type="button" onClick={sakrij} aria-label="Zatvori" className="-mr-1.5 grid size-8 place-items-center rounded-full text-secondary transition hover:bg-page hover:text-primary">
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        {s.ok ? (
          <>
            {/* dodati artikal */}
            <div className="flex gap-3.5 px-4 pb-4 pt-3">
              <span className="relative grid size-[84px] shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white ring-1 ring-subtle">
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
                  {s.artikal.uKorpi > s.artikal.qty && <> (u korpi {s.artikal.uKorpi})</>}
                </p>
                {s.artikal.price != null && <p className="mt-1.5 text-[18px] font-bold tabular-nums">{rsd(s.artikal.price * s.artikal.qty)}</p>}
              </div>
            </div>
            {s.napomena && <p className="mx-4 mb-3 rounded-[8px] bg-brand-soft px-3 py-2 text-[13px]">{s.napomena}</p>}

            {/* korpa */}
            <div className="relative bg-[#18191b] px-4 pb-4 pt-3.5 text-white">
              <p className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="text-white/65">
                  U korpi: <b className="font-semibold text-white">{broj} {artikala(broj)}</b>
                </span>
                {zbir ? (
                  <span className="text-[16px] font-bold tabular-nums">{rsd(zbir.subtotal)}</span>
                ) : (
                  <span aria-hidden className="h-4 w-20 animate-pulse rounded bg-white/10" />
                )}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={sakrij} className="h-11 rounded-full border border-white/20 text-[14px] font-medium transition hover:border-white/60">
                  Nastavi kupovinu
                </button>
                <Link href="/korpa/" className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-brand text-[14px] font-semibold text-on-brand transition hover:bg-brand-hover">
                  Idi u korpu
                  <ArrowRight width={14} height={14} strokeWidth={2} />
                </Link>
              </div>
              {/* koliko još stoji */}
              <span key={kljuc} aria-hidden className="dodato-tajmer absolute inset-x-0 bottom-0 h-[3px] bg-brand" />
            </div>
          </>
        ) : (
          <div className="relative px-4 pb-4 pt-2">
            <p className="text-[14px] leading-[21px] text-secondary">{s.greska}</p>
            <span key={kljuc} aria-hidden className="dodato-tajmer absolute inset-x-0 bottom-0 h-[3px] bg-sale" />
          </div>
        )}
      </div>
    </div>
  );
}
