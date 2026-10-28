"use client";

import { useState } from "react";
import { ArrowRight } from "../Icons";

/* Prijava na newsletter (tamni footer): polje i žuto dugme u jednom redu, jasna poruka posle slanja (i kad je adresa već prijavljena). */
export default function Newsletter() {
  const [stanje, setStanje] = useState<"spremno" | "saljem" | "gotovo" | "vec" | "greska">("spremno");
  const [poruka, setPoruka] = useState("");

  async function posalji(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setStanje("saljem");
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const j = (await r.json().catch(() => null)) as { success?: boolean; alreadySubscribed?: boolean; message?: string | null } | null;
      if (!r.ok || !j?.success) throw new Error(j?.message === "Neispravan email" ? "Proverite e-mail adresu." : (j?.message ?? "Prijava nije uspela. Pokušajte ponovo."));
      setStanje(j.alreadySubscribed ? "vec" : "gotovo");
    } catch (err) {
      setStanje("greska");
      setPoruka(err instanceof Error ? err.message : "Prijava nije uspela. Pokušajte ponovo.");
    }
  }

  if (stanje === "gotovo" || stanje === "vec") {
    return (
      <p role="status" className="flex h-14 items-center gap-3 border-b-2 border-brand text-[17px] font-medium text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
        {stanje === "vec" ? "Ova adresa je već prijavljena. Hvala!" : "Hvala! Prijavljeni ste."}
      </p>
    );
  }

  return (
    <form onSubmit={posalji}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-[13px] text-white/55">Vaša e-mail adresa</span>
          {/* samo donja linija, kao polje na obrascu - čita se i bez okvira */}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ime@firma.rs"
            className="polje h-14 w-full border-b-2 border-white/30 bg-transparent text-[20px] text-white outline-none transition placeholder:text-white/30 hover:border-white/60 focus:border-brand"
          />
        </label>
        <button type="submit" disabled={stanje === "saljem"} className="btn-primary shrink-0 disabled:opacity-60" style={{ height: 56, padding: "0 28px", fontSize: 15 }}>
          {stanje === "saljem" ? "Prijavljujem…" : "Prijavi me"}
          {stanje !== "saljem" && <ArrowRight width={16} height={16} strokeWidth={1.8} />}
        </button>
      </div>
      {stanje === "greska" && (
        <p role="alert" className="mt-2 text-[14px] font-medium text-[#ffb4ab]">
          {poruka}
        </p>
      )}
      <p className="mt-3 text-[12px] leading-[18px] text-white/45">Prijavom pristajete da vam šaljemo novosti i akcije. Odjava je moguća u svakom mejlu.</p>
    </form>
  );
}
