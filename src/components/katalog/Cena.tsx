"use client";

import { useState } from "react";
import { Slider } from "radix-ui";
import { rsd } from "@/lib/filteri";

/**
 * Opseg cene: klizač sa dva palca + dva polja (od / do), kao na klikdogume. Klizač je logaritamski - oprema košta od
 * stotinak dinara (rukavice) do desetina hiljada (protivpadni kompleti), pa bi linearna skala jeftine artikle stisla u
 * prvih par piksela. Primenjuje se na puštanje palca odnosno Enter/napuštanje polja (svaka primena je poziv serveru).
 */
export default function Cena({ min, max, donja: od, gornja: doo, onPromena }: { min: number; max: number; donja: number | null; gornja: number | null; onPromena: (od: number | null, doo: number | null) => void }) {
  const lo = Math.max(1, Math.floor(min));
  const hi = Math.max(lo + 1, Math.ceil(max));
  const uPoz = (v: number) => Math.round((1000 * Math.log(Math.min(hi, Math.max(lo, v)) / lo)) / Math.log(hi / lo));
  const izPoz = (t: number) => lepo(lo * Math.pow(hi / lo, t / 1000), lo, hi);
  const spolja: [number, number] = [uPoz(od ?? lo), uPoz(doo ?? hi)];

  // dok se vuče, položaj je lokalni; kad stigne nova vrednost spolja (primenjeno), lokalni se pušta - isto za polja
  const [poz, setPoz] = useState<[number, number] | null>(null);
  const [tekst, setTekst] = useState<[string, string] | null>(null);
  const [bilo, setBilo] = useState<[number | null, number | null]>([od, doo]);
  if (bilo[0] !== od || bilo[1] !== doo) {
    setBilo([od, doo]);
    setPoz(null);
    setTekst(null);
  }
  const vrednost = poz ?? spolja;
  const prikazOd = tekst ? tekst[0] : String(poz ? izPoz(poz[0]) : (od ?? lo));
  const prikazDo = tekst ? tekst[1] : String(poz ? izPoz(poz[1]) : (doo ?? hi));

  const primeni = (a: number, b: number) => {
    const x = Math.max(lo, Math.min(a, b));
    const y = Math.min(hi, Math.max(a, b));
    onPromena(x <= lo ? null : x, y >= hi ? null : y);
  };
  const izPolja = () => {
    if (!tekst) return;
    const a = Number(tekst[0]), b = Number(tekst[1]);
    primeni(Number.isFinite(a) && tekst[0] !== "" ? a : lo, Number.isFinite(b) && tekst[1] !== "" ? b : hi);
  };

  return (
    <div>
      <div className="flex items-center justify-between text-[13px] font-medium tabular-nums">
        <span>{rsd(izPoz(vrednost[0]))}</span>
        <span>{rsd(izPoz(vrednost[1]))}</span>
      </div>
      <Slider.Root
        min={0}
        max={1000}
        step={1}
        minStepsBetweenThumbs={10}
        value={vrednost}
        onValueChange={(v) => setPoz([v[0], v[1]])}
        onValueCommit={(v) => primeni(izPoz(v[0]), izPoz(v[1]))}
        className="relative mt-2 flex h-6 w-full touch-none select-none items-center"
        aria-label="Opseg cene"
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-subtle">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        {(["Najniža cena", "Najviša cena"] as const).map((l) => (
          <Slider.Thumb key={l} aria-label={l} className="block size-5 rounded-full border-2 border-primary bg-brand shadow-[0_2px_6px_rgba(32,33,36,0.25)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40" />
        ))}
      </Slider.Root>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Polje label="Najniža cena" value={prikazOd} onChange={(v) => setTekst([v, prikazDo])} onCommit={izPolja} />
        <span className="h-px w-3 bg-[#c4c7cc]" aria-hidden />
        <Polje label="Najviša cena" value={prikazDo} onChange={(v) => setTekst([prikazOd, v])} onCommit={izPolja} />
      </div>
    </div>
  );
}

function Polje({ label, value, onChange, onCommit }: { label: string; value: string; onChange: (v: string) => void; onCommit: () => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="polje h-10 w-full rounded-[4px] border border-subtle bg-page pl-3 pr-10 text-[14px] font-medium tabular-nums outline-none transition focus:border-primary focus:bg-surface"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-secondary" aria-hidden>
        RSD
      </span>
    </label>
  );
}

/** zaokruži na „lep" iznos: do 2.000 na desetinu, do 20.000 na stotinu, iznad na 500; krajevi ostaju tačni */
function lepo(v: number, lo: number, hi: number) {
  if (v <= lo) return lo;
  if (v >= hi) return hi;
  const korak = v < 2_000 ? 10 : v < 20_000 ? 100 : 500;
  return Math.round(v / korak) * korak;
}
