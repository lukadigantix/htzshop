"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Backend ne odgovara (lib/nalog.ts): kupac ostaje prijavljen, a strana nudi novi pokušaj. */
export default function Greska({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const [radi, start] = useTransition();
  return (
    <div className="rounded-[6px] bg-surface px-6 py-14 text-center shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)]">
      <p className="text-[24px] font-semibold tracking-[-0.02em]">Podaci se trenutno ne učitavaju</p>
      <p className="mx-auto mt-2 max-w-[440px] text-[15px] leading-[23px] text-secondary">Server ne odgovara. Vaše porudžbine i podaci nisu izgubljeni, pokušajte ponovo za koji trenutak.</p>
      <button
        type="button"
        onClick={() => start(() => { router.refresh(); reset(); })}
        disabled={radi}
        className="btn-primary mt-7"
        style={{ height: 48, padding: "0 26px" }}
      >
        <RefreshCw className={`size-4 ${radi ? "animate-spin" : ""}`} strokeWidth={2} aria-hidden />
        Pokušajte ponovo
      </button>
    </div>
  );
}
