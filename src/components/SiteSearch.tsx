"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";

/*
  Dugme pretrage u zaglavlju i prečice (⌘K / Ctrl+K, „/"). Sam prozor (PretragaProzor: cmdk + Radix dijalog) se učitava
  tek kad zatreba, pa nije deo početnog JavaScript-a svake strane; kod se preuzima unapred kad strana miruje ili kad
  miš pređe preko dugmeta, da se prozor otvori bez čekanja.
*/

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Pilule kategorija i brendova: zaglavlje ih prosleđuje. */
export type Kat = { name: string; slug: string };
export type Brend = Kat & { logo?: string | null };

const ucitajProzor = () => import("./PretragaProzor");
const PretragaProzor = dynamic(ucitajProzor, { ssr: false });

/**
 * Modal postoji samo jednom, u zaglavlju. Ostali (npr. mobilni meni) ga otvaraju ovim događajem -
 * da se ne ugasi zajedno sa komponentom iz koje je pozvan.
 */
const OTVORI = "htz-pretraga";
export const otvoriPretragu = () => window.dispatchEvent(new Event(OTVORI));

/** Dugme-pilula za mobilni meni: zatvori meni pa otvori pretragu u zaglavlju. */
export function SearchPill({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        otvoriPretragu();
      }}
      className={cn("flex w-full items-center gap-3 rounded-2xl bg-[#f2f2f5] px-4 py-3.5 text-[14px] font-medium text-[#86868b] transition-colors hover:bg-[#e9e9ee]", className)}
    >
      <Search className="size-4.5 shrink-0 text-primary" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">Pretraži opremu, </span>npr. rukavice, šlem, 3M
    </button>
  );
}

/** Dugme pretrage; prozor se crta od prvog otvaranja (posle ostaje, da se ne učitava ponovo). */
export function SiteSearch({ className, kategorije = [], brendovi = [] }: { className?: string; kategorije?: Kat[]; brendovi?: Brend[] }) {
  const [open, setOpen] = useState(false);
  const [koristi, setKoristi] = useState(false);
  const otvori = useCallback(() => {
    setKoristi(true);
    setOpen(true);
  }, []);

  // kod prozora unapred, kad strana miruje (ne usporava učitavanje strane)
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = w.requestIdleCallback ? w.requestIdleCallback(() => void ucitajProzor(), { timeout: 5000 }) : window.setTimeout(() => void ucitajProzor(), 3000);
    return () => {
      const w2 = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (w2.cancelIdleCallback) w2.cancelIdleCallback(t);
      else window.clearTimeout(t);
    };
  }, []);

  // ⌘K / Ctrl+K sa bilo kog mesta; „/" samo kad korisnik već ne kuca u polje
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const u = e.target as HTMLElement | null;
      const kuca = u && (u.tagName === "INPUT" || u.tagName === "TEXTAREA" || u.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !kuca)) {
        e.preventDefault();
        otvori();
      }
    };
    const spolja = () => otvori();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OTVORI, spolja);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OTVORI, spolja);
    };
  }, [otvori]);

  return (
    <>
      <button type="button" onClick={otvori} onPointerEnter={() => void ucitajProzor()} onFocus={() => void ucitajProzor()} aria-label="Pretraga" className={className}>
        <Search className="size-5" strokeWidth={1.6} aria-hidden />
      </button>
      {koristi && <PretragaProzor open={open} setOpen={setOpen} kategorije={kategorije} brendovi={brendovi} />}
    </>
  );
}
