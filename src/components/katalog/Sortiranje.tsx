"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover } from "radix-ui";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { SORT, type Sort } from "@/lib/filteri";

/**
 * Sortiranje: dugme sa menijem (sistemska padajuća lista se ne može stilizovati), menja `?sort=` i vraća na prvu stranu;
 * podrazumevano ne ide u URL. Izbor se drži lokalno i odmah prikaže dok server ne vrati novu listu (isto kao na klikdogume).
 */
export default function Sortiranje({ trenutno }: { trenutno: Sort }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [vrednost, setVrednost] = useState<Sort>(trenutno);
  const [open, setOpen] = useState(false);
  const [ceka, start] = useTransition();
  const label = SORT.find((s) => s.id === vrednost)?.label ?? "";

  const izaberi = (v: Sort) => {
    setVrednost(v);
    setOpen(false);
    const n = new URLSearchParams(sp.toString());
    if (v === "recommended") n.delete("sort");
    else n.set("sort", v);
    n.delete("strana");
    const q = n.toString();
    start(() => router.replace(q ? `?${q}` : "?", { scroll: false }));
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" aria-busy={ceka} aria-label={`Sortiranje: ${label}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-subtle bg-surface pl-3.5 pr-3 text-[13px] font-medium text-primary transition hover:border-primary aria-busy:opacity-60 data-[state=open]:border-primary">
          <ArrowUpDown className="size-4 text-secondary" strokeWidth={1.8} aria-hidden />
          <span className="hidden text-secondary sm:inline">Sortiraj:</span>
          {label}
          <ChevronDown className={`size-4 text-secondary transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} className="z-50 w-60 rounded-[4px] border border-subtle bg-surface p-1.5 shadow-[0_20px_50px_-20px_rgba(32,33,36,0.35)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
          <ul role="listbox" aria-label="Sortiranje">
            {SORT.map((s) => {
              const on = s.id === vrednost;
              return (
                <li key={s.id} role="option" aria-selected={on}>
                  <button type="button" onClick={() => izaberi(s.id)} className={`flex w-full items-center justify-between gap-3 rounded-[4px] px-3 py-2.5 text-left text-[14px] transition-colors ${on ? "bg-page font-medium" : "hover:bg-page"}`}>
                    {s.label}
                    {on && <Check className="size-4 text-brand-active" strokeWidth={2.5} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
