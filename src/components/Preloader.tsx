"use client";

import { useState } from "react";
import { SLOVA, STIT } from "./logoPutanje";
import Razdvajac from "./Razdvajac";

/*
  Intro pri svakom učitavanju stranice (otvaranje, osvežavanje); prelazak između strana unutar sajta ga ne ponavlja,
  jer je u korenskom layoutu koji ostaje. Sve je CSS animacija (globals.css, „Preloader"), pa se sklanja sama i kad JS
  kasni; JS ga posle izlaza samo izbaci iz DOM-a. Redosled (ukupno ~2,8 s):
    0,15 s  obris štita se iscrta žutom linijom (šlem i H su deo obrisa)
    0,75 s  štit se puni žutom odozdo nagore; 1,2 s preko njega prođe odsjaj kao na reflektujućoj traci
    0,95 s  slova H-T-Z-S-H-O-P izranjaju jedno za drugim iza maske
    0,2 s   šrafura napretka se puni ispod logoa; 1,2 s natpis se skupi u razmaku slova
    1,95 s  sadržaj se podigne i nestane, 2,05 s ceo panel ode nagore kao roletna, sa šrafurom na donjoj ivici
  „Smanji pokrete": bez crtanja, samo kratak fade gotovog logoa.
*/
export default function Preloader() {
  const [gotovo, setGotovo] = useState(false);
  if (gotovo) return null;

  return (
    <div
      className="preloader"
      aria-hidden
      onAnimationEnd={(e) => {
        // ostaje još malo u DOM-u (nevidljiv): strane čije ulazne animacije čekaju preloader (404, body:has(.preloader))
        // ne smeju da promene zakašnjenje usred animacije
        if (e.target === e.currentTarget) window.setTimeout(() => setGotovo(true), 1800);
      }}
    >
      <div className="pl-sadrzaj flex flex-col items-center">
        <svg viewBox="-8 -8 1800 370" className="w-[min(560px,78vw)] overflow-visible">
          <defs>
            <clipPath id="pl-stit">
              <path d={STIT} clipRule="evenodd" />
            </clipPath>
            {/* maska iz koje slova izranjaju */}
            <clipPath id="pl-slova">
              <rect x="330" y="80" width="1460" height="194" />
            </clipPath>
          </defs>

          <path d={STIT} className="pl-obris" pathLength={1} fill="none" stroke="var(--brand-primary)" strokeWidth="5" strokeLinejoin="round" />
          <path d={STIT} className="pl-ispuna" fill="var(--brand-primary)" fillRule="evenodd" />
          <g clipPath="url(#pl-stit)">
            <rect className="pl-odsjaj" x="-180" y="-20" width="70" height="400" fill="#fff" transform="skewX(-20)" />
          </g>

          <g clipPath="url(#pl-slova)">
            {SLOVA.map((d, i) => (
              <path key={i} d={d} className="pl-slovo" fill="#fff" fillRule="evenodd" style={{ animationDelay: `${0.95 + i * 0.055}s` }} />
            ))}
          </g>
        </svg>

        <div className="mt-5 h-1.5 w-[min(240px,50vw)] overflow-hidden rounded-full bg-white/10 lg:mt-10">
          <div className="pl-napredak h-full rounded-full" />
        </div>
        <p className="pl-natpis mt-3.5 text-[11px] font-medium uppercase text-white/55 lg:mt-5">Zaštitna i radna oprema
          <Razdvajac />
          Svilajnac</p>
      </div>
    </div>
  );
}
