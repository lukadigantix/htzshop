"use client";

import { useState } from "react";
import Form from "next/form";
import { Search } from "lucide-react";
import { KURIR_LABEL, prepoznajKurira } from "@/lib/nalog-deo";
import { POLJE } from "./Polja";

/**
 * Broj pošiljke + „Pratite": GET forma na ?broj=…, pa je rezultat sa servera i adresa može da se podeli.
 * Dok kupac kuca, ispod piše koju službu broj liči (isto pravilo kao na backendu).
 */
/** `akcija`: strana na koju forma šalje ?broj= (nalog ili javna strana praćenja) */
export default function FormaPracenja({ broj, akcija = "/moj-nalog/pracenje/" }: { broj: string; akcija?: string }) {
  const [vrednost, setVrednost] = useState(broj);
  const kurir = prepoznajKurira(vrednost);
  return (
    <Form action={akcija} className="rounded-[6px] bg-surface p-5 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] md:p-7">
      <label htmlFor="broj-posiljke" className="mb-1.5 block text-[13px] font-medium">
        Broj pošiljke
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="broj-posiljke"
          name="broj"
          value={vrednost}
          onChange={(e) => setVrednost(e.target.value)}
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="npr. 2611504 ili PE123456785RS"
          aria-describedby="broj-posiljke-opis"
          className={`${POLJE} sm:flex-1`}
        />
        <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-medium text-white transition hover:bg-[#3a3d42]">
          <Search className="size-4" strokeWidth={2} aria-hidden />
          Pratite
        </button>
      </div>
      <p id="broj-posiljke-opis" aria-live="polite" className="mt-2 text-[13px] text-secondary">
        {kurir ? (
          <>
            Prepoznato: <b className="font-semibold text-primary">{KURIR_LABEL[kurir]}</b>
          </>
        ) : (
          "Broj je u mejlu o slanju. BEX ima samo cifre, Post Express na primer PE123456785RS."
        )}
      </p>
    </Form>
  );
}
