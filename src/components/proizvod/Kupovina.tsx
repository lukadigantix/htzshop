"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { Cart, Heart } from "../Icons";
import { useDodaj } from "../korpa/DodajUKorpu";

/* Količina + „Dodaj u korpu" (isto kao na karticama: akcija po slug-u izabrane varijante) + lista želja. */
export default function Kupovina({ slug, inStock }: { slug: string; inStock: boolean }) {
  const [kolicina, setKolicina] = useState(1);
  const { radi, gotovo, dodaj } = useDodaj();
  const promeni = (d: number) => setKolicina((k) => Math.min(999, Math.max(1, k + d)));

  return (
    <div className="flex gap-3">
      <div className="flex h-[52px] shrink-0 items-center rounded-full border border-input bg-surface">
        <button type="button" onClick={() => promeni(-1)} disabled={kolicina <= 1} aria-label="Smanji količinu" className="grid h-full w-11 place-items-center text-[20px] leading-none text-primary disabled:text-disabled">
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={999}
          value={kolicina}
          onChange={(e) => setKolicina(Math.min(999, Math.max(1, Number(e.target.value) || 1)))}
          aria-label="Količina"
          className="w-9 bg-transparent text-center text-[15px] font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" onClick={() => promeni(1)} aria-label="Povećaj količinu" className="grid h-full w-11 place-items-center text-[20px] leading-none text-primary">
          +
        </button>
      </div>
      {/* .btn-primary je van Tailwind slojeva, pa visina i razmak idu kroz style */}
      <button
        type="button"
        disabled={!inStock || radi}
        aria-busy={radi}
        onClick={() => dodaj(slug, kolicina)}
        style={{ height: 52, padding: "0 24px", fontSize: 15, ...(inStock ? {} : { background: "var(--disabled-background)", color: "var(--disabled-text)" }) }}
        className="btn-primary flex-1"
      >
        {radi ? <LoaderCircle className="size-[18px] animate-spin" strokeWidth={2} aria-hidden /> : gotovo ? <Check className="size-[18px]" strokeWidth={2.4} aria-hidden /> : <Cart width={18} height={18} strokeWidth={1.8} />}
        {!inStock ? "Trenutno nema" : gotovo ? "Dodato u korpu" : "Dodaj u korpu"}
      </button>
      <button type="button" aria-label="Dodaj na listu želja" className="grid size-[52px] shrink-0 place-items-center rounded-full border border-input bg-surface text-primary transition hover:bg-brand-soft">
        <Heart width={20} height={20} strokeWidth={1.6} />
      </button>
    </div>
  );
}
