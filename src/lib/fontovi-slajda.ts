import type { CSSProperties } from "react";

// Fontovi za tekst banera (izbor u adminu: Podešavanja → Baneri). Ključevi su isti kao u panelu (lib/slide-fonts.ts) i
// backendu (entities/Slide.ts); @font-face je u app/fontovi-slajda.css, fajlovi u public/fonts/slajd.
const PORODICE: Record<string, string> = {
  "barlow-condensed": "HTZ Barlow Condensed",
  "oswald": "HTZ Oswald",
  "bebas-neue": "HTZ Bebas Neue",
  "anton": "HTZ Anton",
  "saira-condensed": "HTZ Saira Condensed",
  "big-shoulders": "HTZ Big Shoulders Display",
  "archivo": "HTZ Archivo",
  "teko": "HTZ Teko",
  "roboto-condensed": "HTZ Roboto Condensed",
};

/** Stil za tekst banera; nepoznat ili prazan ključ = font sajta */
export function fontSlajda(key: string | null | undefined): CSSProperties | undefined {
  const fam = key ? PORODICE[key] : undefined;
  return fam ? { fontFamily: `"${fam}", sans-serif`, fontSynthesisWeight: "none" } : undefined;
}
