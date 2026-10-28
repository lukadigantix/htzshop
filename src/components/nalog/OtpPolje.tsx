"use client";

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const DUZINA = 6;
const GRUPA = 3;

/**
 * Šestocifreni kod iz mejla kao šest kućica (3 i 3), kao na klikdogume. Vrednost ide serveru kroz skriveno polje; lepljenje
 * i automatsko popunjavanje na telefonu („one-time-code") rasporede cifre, a kad je upisana i šesta, forma se sama šalje.
 */
export default function OtpPolje({ label, name, greska }: { label: string; name: string; greska?: boolean }) {
  const id = useId();
  const [cifre, setCifre] = useState<string[]>(() => Array(DUZINA).fill(""));
  const polja = useRef<(HTMLInputElement | null)[]>([]);

  function upisi(od: number, unos: string) {
    const nove = unos.replace(/\D/g, "").slice(0, DUZINA - od).split("");
    if (!nove.length) return;
    const sledece = [...cifre];
    nove.forEach((c, i) => (sledece[od + i] = c));
    setCifre(sledece);
    polja.current[Math.min(od + nove.length, DUZINA - 1)]?.focus();
    if (sledece.every(Boolean)) {
      const forma = polja.current[0]?.form;
      // posle crtanja, da skriveno polje već nosi ceo kod
      requestAnimationFrame(() => forma?.requestSubmit());
    }
  }

  function taster(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const sledece = [...cifre];
      const gde = cifre[i] ? i : Math.max(i - 1, 0);
      sledece[gde] = "";
      setCifre(sledece);
      polja.current[gde]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      polja.current[Math.max(i - 1, 0)]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      polja.current[Math.min(i + 1, DUZINA - 1)]?.focus();
    }
  }

  const kucica = (i: number) => (
    <input
      key={i}
      ref={(el) => {
        polja.current[i] = el;
      }}
      id={i === 0 ? id : undefined}
      value={cifre[i]}
      onChange={(e) => upisi(i, e.target.value.replace(cifre[i], "") || e.target.value)}
      onKeyDown={(e) => taster(i, e)}
      onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        upisi(i, e.clipboardData.getData("text"));
      }}
      onFocus={(e) => e.target.select()}
      inputMode="numeric"
      autoComplete={i === 0 ? "one-time-code" : "off"}
      maxLength={DUZINA}
      aria-label={i === 0 ? undefined : `Cifra ${i + 1} od ${DUZINA}`}
      aria-invalid={greska || undefined}
      className={`size-11 shrink-0 rounded-[4px] border p-0 text-center text-[20px] font-semibold tabular-nums text-primary outline-none transition focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)] sm:size-12 ${
        greska ? "border-sale bg-[#fdecea]" : cifre[i] ? "border-primary bg-surface" : "border-subtle bg-page hover:border-input"
      }`}
    />
  );

  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-[13px] font-medium ${greska ? "text-error" : ""}`}>
        {label}
      </label>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: GRUPA }, (_, i) => kucica(i))}
        <span className="mx-1 h-0.5 w-3 shrink-0 rounded-full bg-input" aria-hidden />
        {Array.from({ length: DUZINA - GRUPA }, (_, i) => kucica(i + GRUPA))}
      </div>
      <input type="hidden" name={name} value={cifre.join("")} />
    </div>
  );
}
