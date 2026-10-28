"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Brend } from "@/lib/brendovi";
import { ArrowRight } from "../Icons";
import ZnakBrenda from "./ZnakBrenda";

const proizvoda = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "proizvod" : "proizvoda");

/**
 * Mreža brendova: bela pločica sa logom (ili imenom kao znakom), ispod naziv i broj proizvoda; na prelaz žuti okvir. Pretraga po imenu se pojavi tek kad brendova ima više od 12 - za par brendova bi bila višak.
 */
export default function Mreza({ brendovi }: { brendovi: Brend[] }) {
  const [q, setQ] = useState("");
  const upit = q.trim().toLowerCase();
  const vidljivi = upit ? brendovi.filter((b) => b.name.toLowerCase().includes(upit)) : brendovi;
  const najveci = brendovi[0]?.count ? brendovi[0].slug : null;

  return (
    <>
      {brendovi.length > 12 && (
        <label className="relative mb-6 block max-w-[420px]">
          <span className="sr-only">Pretražite brendove</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-secondary" strokeWidth={1.8} aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretražite brendove"
            className="h-12 w-full rounded-full border border-subtle bg-surface pl-11 pr-4 text-[15px] outline-none transition focus:border-primary focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)]"
          />
        </label>
      )}

      {vidljivi.length === 0 ? (
        <p className="rounded-[6px] bg-surface p-8 text-center text-[15px] text-secondary">Nema brenda „{q}“. Pozovite nas, proverićemo ponudu.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {vidljivi.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/brendovi/${b.slug}/`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[6px] bg-surface shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ring-1 ring-transparent transition duration-300 hover:-translate-y-1 hover:ring-brand"
              >
                {b.slug === najveci && (
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-brand">Najveći izbor</span>
                )}
                <span className="grid h-44 place-items-center px-6 md:h-52">
                  <span className="transition duration-500 group-hover:scale-105">
                    <ZnakBrenda b={b} />
                  </span>
                </span>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-subtle px-5 py-4">
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] font-medium">{b.name}</span>
                    <span className="mt-0.5 block text-[13px] text-secondary">{b.count > 0 ? `${b.count} ${proizvoda(b.count)}` : "Uskoro u ponudi"}</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-page transition group-hover:bg-brand">
                    <ArrowRight width={15} height={15} strokeWidth={1.8} className="-rotate-45 transition group-hover:rotate-0" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
