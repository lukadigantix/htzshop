"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, TicketPercent, X } from "lucide-react";
import { primeniKupon, ukloniKupon } from "@/app/korpa/actions";

/* Kupon u pregledu korpe: polje se otvara na klik; primenjen kod stoji kao oznaka sa „×". Backend kaže zašto kod ne važi. */
export default function Kupon({ primenjen, greskaObracuna }: { primenjen: string; greskaObracuna: string | null }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [kod, setKod] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [radi, start] = useTransition();

  if (primenjen && !greskaObracuna) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[6px] bg-brand-soft px-3.5 py-3">
        <span className="flex items-center gap-2 text-[14px]">
          <TicketPercent className="size-[18px]" strokeWidth={1.8} aria-hidden />
          Kupon <b className="font-semibold tracking-[0.04em]">{primenjen}</b>
        </span>
        <button type="button" disabled={radi} onClick={() => start(() => ukloniKupon())} aria-label="Ukloni kupon" className="grid size-7 place-items-center rounded-full transition hover:bg-black/10">
          <X className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    );
  }

  if (!otvoreno && !greskaObracuna) {
    return (
      <button type="button" onClick={() => setOtvoreno(true)} className="flex items-center gap-2 text-[14px] font-medium text-primary underline-offset-2 hover:underline">
        <TicketPercent className="size-[18px]" strokeWidth={1.8} aria-hidden />
        Imate kupon za popust?
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await primeniKupon(kod);
          setGreska(r.ok ? null : (r.greska ?? null));
          if (r.ok) setKod("");
        });
      }}
    >
      <label htmlFor="kupon" className="mb-1.5 block text-[13px] font-medium">
        Kod kupona
      </label>
      <div className="flex gap-2">
        <input
          id="kupon"
          value={kod}
          onChange={(e) => setKod(e.target.value.toUpperCase())}
          autoComplete="off"
          autoFocus
          placeholder="npr. POPUST10"
          className="h-11 min-w-0 flex-1 rounded-[4px] border border-subtle bg-page px-3.5 text-[15px] uppercase tracking-[0.04em] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-[#9a9ea5] focus:border-primary focus:bg-surface"
        />
        <button type="submit" disabled={radi || !kod.trim()} className="flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-[#3a3d42] disabled:opacity-50">
          {radi && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          Primeni
        </button>
      </div>
      {(greska || greskaObracuna) && (
        <p role="alert" className="mt-2 text-[13px] text-sale">
          {greska ?? `Kupon ${primenjen}: ${greskaObracuna}`}
        </p>
      )}
    </form>
  );
}
