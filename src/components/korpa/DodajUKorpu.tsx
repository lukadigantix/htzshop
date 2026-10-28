"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { Cart } from "../Icons";
import { dodajUKorpu } from "@/app/korpa/actions";
import { DOGADJAJ_DODATO, DOGADJAJ_KORPA } from "@/lib/korpa-deo";

/*
  „Dodaj u korpu" (kartica i strana proizvoda): akcija dodaje artikal po slug-u, pa javlja ostatku strane -
  zaglavlje osveži bedž (DOGADJAJ_KORPA), a obaveštenje (Dodato.tsx) pokaže šta je dodato ili zašto nije.
  Dugme za to vreme pokazuje da radi, pa kratko „Dodato".
*/
export function useDodaj() {
  const [radi, start] = useTransition();
  const [gotovo, setGotovo] = useState(false);
  const dodaj = (slug: string, kom = 1) =>
    start(async () => {
      const r = await dodajUKorpu(slug, kom);
      if (r.ok) {
        window.dispatchEvent(new CustomEvent(DOGADJAJ_KORPA, { detail: r.broj }));
        setGotovo(true);
        window.setTimeout(() => setGotovo(false), 1800);
      }
      window.dispatchEvent(new CustomEvent(DOGADJAJ_DODATO, { detail: r }));
    });
  return { radi, gotovo, dodaj };
}

export default function DodajUKorpu({ slug, inStock, className }: { slug: string; inStock: boolean; className: string }) {
  const { radi, gotovo, dodaj } = useDodaj();
  return (
    <button type="button" disabled={!inStock || radi} aria-busy={radi} onClick={() => dodaj(slug)} className={className}>
      {radi ? <LoaderCircle className="size-[18px] animate-spin" strokeWidth={2} aria-hidden /> : gotovo ? <Check className="size-[18px]" strokeWidth={2.4} aria-hidden /> : <Cart width={18} height={18} strokeWidth={2} />}
      {!inStock ? "Nema na stanju" : gotovo ? "Dodato u korpu" : "Dodaj u korpu"}
    </button>
  );
}
