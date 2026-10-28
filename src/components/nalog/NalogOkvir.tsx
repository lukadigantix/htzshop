import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { odjava } from "@/app/moj-nalog/actions";
import { getKorisnik } from "@/lib/nalog";
import { inicijali } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { ChevronLeft, Mail, Phone } from "../Icons";
import { BocniMeni } from "./Meni";
import { KARTICA } from "./stil";

// kartica i mali naslov žive u stil.ts (bez serverskog koda), da ih koriste i klijentske komponente
export { KARTICA, MALI } from "./stil";

/**
 * Leva kolona naloga na računaru (po uzoru na klikdogume nalog-okvir.tsx): tamna kartica sa trakom upozorenja, inicijali
 * u žutom krugu, ime i e-mail, odeljci, pomoć telefonom i odjava. Lepljiva ispod zaglavlja (80 px).
 */
export async function BocnaKolona() {
  const [k, s] = await Promise.all([getKorisnik(), getSajt()]);
  if (!k) return null;
  const ime = `${k.firstName} ${k.lastName}`.trim() || k.email;
  return (
    <div className="sticky top-28 overflow-hidden rounded-[6px] bg-primary text-white">
      <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_12px,#2c2d30_12px_24px)]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[260px] rounded-full bg-brand/10 blur-[80px]" />
      <div className="relative p-3">
        <div className="flex items-center gap-3 px-3 pb-5 pt-4">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-[16px] font-semibold tracking-[0.02em] text-on-brand">
            {inicijali(k)}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[16px] font-medium">{ime}</span>
            <span className="mt-1 block truncate text-[13px] text-white/50">{k.email}</span>
          </span>
        </div>
        <nav aria-label="Moj nalog">
          <BocniMeni />
        </nav>
        <div className="mt-3 border-t border-white/10 px-3 pt-5">
          <a href={s.phoneHref} className="group flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-brand transition group-hover:bg-brand group-hover:text-on-brand">
              <Phone width={17} height={17} strokeWidth={1.8} />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-white/45">Pitanje o porudžbini?</span>
              <span className="mt-1 block text-[16px] font-medium">{s.phone}</span>
            </span>
          </a>
        </div>
        <form action={odjava} className="mt-4 border-t border-white/10 pt-2">
          <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-[4px] px-3.5 text-[15px] text-white/65 transition hover:bg-white/[0.05] hover:text-white">
            <LogOut className="size-[18px] shrink-0 text-white/45" strokeWidth={1.8} aria-hidden />
            Odjavite se
          </button>
        </form>
      </div>
    </div>
  );
}

/** Na telefonu (na dnu svake strane naloga): pomoć i odjava, koje su na računaru u levoj koloni. */
export async function PomocDole() {
  const s = await getSajt();
  return (
    <div className="mt-10 overflow-hidden rounded-[6px] bg-primary text-white lg:hidden">
      <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_12px,#2c2d30_12px_24px)]" />
      <div className="p-5">
        <a href={s.phoneHref} className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
            <Phone width={18} height={18} strokeWidth={1.8} />
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] uppercase tracking-[0.16em] text-white/50">Pitanje o porudžbini?</span>
            <span className="mt-1 block text-[18px] font-medium">{s.phone}</span>
          </span>
        </a>
        <a href={`mailto:${s.email}`} className="mt-3 inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white">
          <Mail width={15} height={15} strokeWidth={1.8} />
          {s.email}
        </a>
        <form action={odjava} className="mt-5 border-t border-white/10 pt-4">
          <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-[14px] font-medium transition hover:bg-white/15">
            <LogOut className="size-4" strokeWidth={1.8} aria-hidden />
            Odjavite se
          </button>
        </form>
      </div>
    </div>
  );
}

type Strana = {
  kicker?: string;
  naslov: string;
  uvod?: ReactNode;
  /** dugme desno od naslova (npr. „Nova reklamacija") */
  akcija?: ReactNode;
  /** dugme nazad iznad naslova; pregled (/moj-nalog) ga nema */
  nazad?: { label: string; href: string } | null;
  children: ReactNode;
};

/** Naslov strane naloga i sadržaj ispod. Svaka strana osim pregleda ima dugme nazad (odeljak → Moj nalog, detalj → odeljak). */
export function StranaNaloga({ kicker, naslov, uvod, akcija, nazad = { label: "Moj nalog", href: "/moj-nalog/" }, children }: Strana) {
  return (
    <>
      {nazad && (
        <Link href={nazad.href} className="group mb-5 inline-flex h-9 items-center gap-1 rounded-full bg-surface pl-2.5 pr-4 text-[14px] font-medium ring-1 ring-subtle transition hover:ring-input">
          <ChevronLeft width={16} height={16} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
          {nazad.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {kicker && <p className="kicker">{kicker}</p>}
          <h1 className={`text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[44px] ${kicker ? "mt-2" : ""}`}>{naslov}</h1>
          {uvod && <p className="mt-3 max-w-[640px] text-[15px] leading-[24px] text-secondary">{uvod}</p>}
        </div>
        {akcija && <div className="shrink-0">{akcija}</div>}
      </div>
      <div className="mt-6 md:mt-8">{children}</div>
    </>
  );
}

/** Prazno stanje u kartici: ikonica u krugu, naslov, rečenica i (po potrebi) dugme. */
export function Prazno({ Icon, naslov, opis, children }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; naslov: string; opis: string; children?: ReactNode }) {
  return (
    <div className={`${KARTICA} flex flex-col items-center px-6 py-12 text-center md:py-16`}>
      <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-primary">
        <Icon className="size-6" strokeWidth={1.7} />
      </span>
      <p className="mt-4 text-[20px] font-semibold tracking-[-0.01em]">{naslov}</p>
      <p className="mt-1.5 max-w-[420px] text-[15px] leading-[23px] text-secondary">{opis}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
