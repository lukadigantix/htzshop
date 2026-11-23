"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";

/*
  Izbor drugog brenda na strani brenda (umesto pilule za svih ~200 brendova):
  - red: „Svi brendovi", trenutni brend i najjači brendovi po broju proizvoda
  - polje „Pronađi brend": predlozi dok se kuca, Enter otvara prvi
  - „+ još N": ceo spisak po abecedi u kolonama, sa brojem proizvoda
  Brendovi bez proizvoda u prodavnici se ne prikazuju.
*/

export type BrendStavka = { slug: string; name: string; count: number };

const NAJJACI = 12;
const PILULA = "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-subtle bg-surface px-4 text-[14px] font-medium transition hover:border-primary";
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj");

export default function OstaliBrendovi({ trenutni, brendovi }: { trenutni: { slug: string; name: string }; brendovi: BrendStavka[] }) {
  const router = useRouter();
  const [upit, setUpit] = useState("");
  const [svi, setSvi] = useState(false);
  const polje = useRef<HTMLInputElement>(null);

  const saProizvodima = useMemo(() => brendovi.filter((b) => b.count > 0 && b.slug !== trenutni.slug), [brendovi, trenutni.slug]);
  const najjaci = saProizvodima.slice(0, NAJJACI);
  const poAbecedi = useMemo(() => [...saProizvodima].sort((a, b) => a.name.localeCompare(b.name, "sr")), [saProizvodima]);
  const q = norm(upit.trim());
  const predlozi = q ? saProizvodima.filter((b) => norm(b.name).includes(q)).sort((a, b) => Number(!norm(a.name).startsWith(q)) - Number(!norm(b.name).startsWith(q)) || b.count - a.count).slice(0, 8) : [];
  const ostalo = saProizvodima.length - najjaci.length;

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <ul aria-label="Brendovi" className="no-scrollbar -mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <li className="shrink-0">
            <Link href="/brendovi/" className={PILULA}>
              Svi brendovi
            </Link>
          </li>
          <li className="shrink-0">
            <span aria-current="page" className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-[14px] font-medium text-white">
              {trenutni.name}
            </span>
          </li>
          {najjaci.map((b) => (
            <li key={b.slug} className="shrink-0">
              <Link href={`/brendovi/${b.slug}/`} className={PILULA}>
                {b.name}
                <span className="text-[12px] font-normal text-secondary tabular-nums">{b.count}</span>
              </Link>
            </li>
          ))}
          {ostalo > 0 && (
            <li className="shrink-0">
              <button type="button" onClick={() => setSvi((v) => !v)} aria-expanded={svi} className={`${PILULA} ${svi ? "border-primary" : ""}`}>
                {svi ? "Manje" : `+ još ${ostalo}`}
                <ChevronDown className={`size-4 transition-transform ${svi ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden />
              </button>
            </li>
          )}
        </ul>

        {/* pretraga brenda */}
        <div className="relative w-full shrink-0 lg:w-[260px]">
          <label className="flex h-10 items-center gap-2 rounded-full border border-subtle bg-surface px-4 transition focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(245,197,24,0.25)]">
            <Search className="size-4 shrink-0 text-secondary" strokeWidth={1.8} aria-hidden />
            <span className="sr-only">Pronađi brend</span>
            <input
              ref={polje}
              value={upit}
              onChange={(e) => setUpit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && predlozi[0]) router.push(`/brendovi/${predlozi[0].slug}/`);
                if (e.key === "Escape") setUpit("");
              }}
              placeholder={`Pronađi brend (${saProizvodima.length + 1})`}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-secondary"
            />
            {upit && (
              <button type="button" onClick={() => { setUpit(""); polje.current?.focus(); }} aria-label="Obriši" className="text-secondary hover:text-primary">
                <X className="size-4" strokeWidth={1.8} />
              </button>
            )}
          </label>
          {q && (
            <div className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-[6px] border border-subtle bg-surface py-1 shadow-[0_14px_34px_-18px_rgba(32,33,36,0.45)]">
              {predlozi.length ? (
                predlozi.map((b) => (
                  <Link key={b.slug} href={`/brendovi/${b.slug}/`} className="flex items-center justify-between px-4 py-2.5 text-[14px] hover:bg-brand-soft">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-[12px] text-secondary tabular-nums">{b.count}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-2.5 text-[13px] text-secondary">Nema brenda „{upit.trim()}“ u ponudi.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ceo spisak po abecedi */}
      {svi && (
        <div className="mt-5 rounded-[6px] border border-subtle bg-page p-5 md:p-6">
          <ul className="columns-2 gap-6 text-[14px] sm:columns-3 lg:columns-5">
            {poAbecedi.map((b) => (
              <li key={b.slug} className="break-inside-avoid">
                <Link href={`/brendovi/${b.slug}/`} className="flex items-baseline justify-between gap-2 py-1 hover:text-secondary">
                  <span className="truncate">{b.name}</span>
                  <span className="shrink-0 text-[12px] text-secondary tabular-nums">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
