"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, RotateCcw } from "lucide-react";

/*
  „Probajte svoj logo": majica na beloj sceni, logo na izabranoj poziciji u žutom okviru za štampu.
  Posetilac može da učita svoj logo - slika se prikazuje samo u njegovom pregledaču (object URL), nigde se ne šalje.
  Majica se gleda napred ili pozadi; svaka strana ima svoje pozicije, u procentima kvadratne slike (800×800).
  Leđa (muska-majica-ledja.png) su napravljena od prednje fotografije: ogledalo, izrez popunjen tkaninom sa grudi i
  iscrtan šav kragne - fotografije iste majice sa leđa nema, a oblik je isti.
*/
const STRANE = {
  napred: {
    naziv: "Napred",
    slika: "/images/products/muska-majica.png",
    pozicije: [
      { naziv: "Grudi levo", x: 63, y: 29, w: 17, r: 0 },
      { naziv: "Grudi desno", x: 37, y: 29, w: 17, r: 0 },
      { naziv: "Sredina", x: 50, y: 44, w: 38, r: 0 },
      { naziv: "Rukav", x: 15, y: 35, w: 9, r: 26 },
    ],
  },
  pozadi: {
    naziv: "Pozadi",
    slika: "/images/products/muska-majica-ledja.png",
    pozicije: [
      { naziv: "Ispod kragne", x: 50, y: 11, w: 13, r: 0 },
      { naziv: "Leđa gore", x: 50, y: 24, w: 40, r: 0 },
      { naziv: "Leđa sredina", x: 50, y: 44, w: 46, r: 0 },
      { naziv: "Rukav", x: 15, y: 35, w: 9, r: 26 },
    ],
  },
} as const;
type Strana = keyof typeof STRANE;

const HTZ = "/images/logo/htz-logo-white.svg";

export default function Proba() {
  const [strana, setStrana] = useState<Strana>("napred");
  const [poz, setPoz] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const ulaz = useRef<HTMLInputElement>(null);
  const s = STRANE[strana];
  const p = s.pozicije[poz];

  // object URL se oslobađa kad se logo zameni ili komponenta nestane
  useEffect(() => () => void (logo && URL.revokeObjectURL(logo)), [logo]);

  return (
    <div className="overflow-hidden rounded-[6px] bg-surface text-primary shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
      <div className="relative aspect-[6/5]">
        {/* majica u kvadratu (slike su 800×800) - pozicije logoa su procenti tog kvadrata; na telefonu je kvadrat niže, ispod izbora strane */}
        <div className="absolute bottom-[3%] left-1/2 top-[15%] aspect-square -translate-x-1/2 sm:bottom-[5%] sm:top-[5%]">
          {(Object.keys(STRANE) as Strana[]).map((k) => (
            <Image
              key={k}
              src={STRANE[k].slika}
              alt={k === strana ? `Crna majica ${k === "napred" ? "spreda" : "sa leđa"}, logo na poziciji ${p.naziv.toLowerCase()}` : ""}
              fill
              priority={k === "napred"}
              sizes="(min-width: 1024px) 560px, 100vw"
              className={`object-contain transition-opacity duration-500 ${k === strana ? "opacity-100" : "opacity-0"}`}
            />
          ))}

          {/* okvir za štampu sa logom, u procentima kvadrata. Pri promeni strane okvir se pojavi na novom mestu (key), a ne preleće preko majice. */}
          <div
            key={strana}
            className="absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, transform: `translate(-50%, -50%) rotate(${p.r}deg)` }}
          >
            {/* ulazna animacija je na unutrašnjem elementu: spoljni nosi položaj kroz transform */}
            <div className="relative animate-in fade-in zoom-in-90 delay-150 fill-mode-both duration-500">
              <div className="rounded-[2px] p-[8%] outline outline-[1.5px] outline-offset-0 outline-dashed outline-brand">
                {/* eslint-disable-next-line @next/next/no-img-element -- lokalni object URL ili SVG, bez optimizacije */}
                <img src={logo ?? HTZ} alt="" className="block max-h-[140px] w-full object-contain" />
              </div>
              <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.1em] text-on-brand" style={{ transform: `translateX(-50%) rotate(${-p.r}deg)` }}>
                {p.naziv}
              </span>
            </div>
          </div>
        </div>

        {/* napred / pozadi */}
        <div role="radiogroup" aria-label="Strana majice" className="absolute left-3 top-3 z-10 flex rounded-full bg-page p-1 ring-1 ring-subtle md:left-4 md:top-4">
          {(Object.keys(STRANE) as Strana[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={strana === k}
              onClick={() => {
                setStrana(k);
                setPoz(0);
              }}
              className={`h-9 rounded-full px-4 text-[14px] font-semibold transition ${strana === k ? "bg-primary text-white shadow-[0_4px_12px_-4px_rgba(32,33,36,0.5)]" : "text-secondary hover:text-primary"}`}
            >
              {STRANE[k].naziv}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-subtle p-4 md:p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-secondary">Pozicija logoa</p>
        <div role="radiogroup" aria-label="Pozicija logoa" className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {s.pozicije.map((x, i) => (
            <button
              key={x.naziv}
              type="button"
              role="radio"
              aria-checked={poz === i}
              onClick={() => setPoz(i)}
              className={`h-10 rounded-full border text-[14px] font-medium transition ${poz === i ? "border-primary bg-primary text-white" : "border-subtle hover:border-primary"}`}
            >
              {x.naziv}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <input
            ref={ulaz}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setLogo(URL.createObjectURL(f));
              e.target.value = "";
            }}
          />
          <button type="button" onClick={() => ulaz.current?.click()} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-[15px] font-semibold text-on-brand transition hover:bg-brand-hover sm:flex-none">
            <ImageUp className="size-[18px]" strokeWidth={1.8} aria-hidden />
            Probajte svoj logo
          </button>
          {logo && (
            <button type="button" onClick={() => setLogo(null)} className="flex items-center gap-1.5 text-[13px] font-medium text-secondary transition hover:text-primary">
              <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
              Vrati primer
            </button>
          )}
        </div>
        <p className="mt-2.5 text-[12px] leading-[18px] text-secondary">Logo ostaje na vašem uređaju i nigde se ne šalje. Najbolje izgleda PNG sa providnom pozadinom.</p>
      </div>
    </div>
  );
}
