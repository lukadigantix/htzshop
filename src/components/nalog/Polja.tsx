"use client";

import { useActionState, useId, useState, useTransition, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { ArrowRight } from "../Icons";

/*
  Elementi formi naloga, isti izgled kao polja naplate (components/korpa/Naplata.tsx): svetlo polje sa žutim sjajem u fokusu,
  pogrešno popunjeno crveno sa porukom ispod. Lozinka ima oko za prikaz.
*/

export const POLJE =
  "h-12 w-full rounded-[4px] border border-subtle bg-page px-4 text-[15px] text-primary outline-none transition placeholder:text-[#9a9ea5] hover:border-input focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)] disabled:cursor-not-allowed disabled:text-secondary disabled:hover:border-subtle";
export const POLJE_GRESKA = "border-sale! bg-[#fdecea]! focus:shadow-[0_0_0_4px_rgba(180,35,24,0.15)]!";
export const LABELA = "mb-1.5 block text-[13px] font-medium";

/**
 * Forma sa server akcijom bez praznjenja polja: `<form action>` posle svake akcije vraća polja na početne vrednosti, pa bi
 * kupac posle greške kucao sve ponovo. Ovde se akcija šalje iz onSubmit (u tranziciji), a `pokusaj` broji slanja - polje
 * označeno kao pogrešno prestaje da bude crveno čim ga kupac izmeni.
 */
export function useForma<S>(akcija: (s: Awaited<S>, fd: FormData) => Promise<S>, pocetno: Awaited<S>) {
  const [stanje, posalji, salje] = useActionState<S, FormData>(akcija, pocetno);
  const [, start] = useTransition();
  const [pokusaj, setPokusaj] = useState(0);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPokusaj((n) => n + 1);
    start(() => posalji(fd));
  };
  return { stanje, onSubmit, salje, pokusaj };
}

type PoljeProps = ComponentProps<"input"> & {
  label: ReactNode;
  pomoc?: ReactNode;
  /** polje je pogrešno popunjeno (vratio ga je server) */
  greska?: boolean;
  /** šta tačno ne valja - crveno ispod polja, umesto pomoći */
  poruka?: string;
  pokusaj?: number;
  /** dodatak desno od natpisa (npr. „Zaboravljena lozinka?") */
  uzNatpis?: ReactNode;
};

export function Polje({ label, pomoc, greska, poruka, pokusaj = 0, uzNatpis, className = "", type, onChange, ...rest }: PoljeProps) {
  const id = useId();
  const [vidi, setVidi] = useState(false);
  const [izmenjenoU, setIzmenjenoU] = useState(-1);
  const lozinka = type === "password";
  const pogresno = !!greska && izmenjenoU !== pokusaj;
  const opis = pogresno && poruka ? poruka : pomoc;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={`${LABELA} ${pogresno ? "text-error" : ""}`}>
          {label}
        </label>
        {uzNatpis}
      </div>
      <div className="relative">
        <input
          id={id}
          type={lozinka && vidi ? "text" : type}
          aria-invalid={pogresno || undefined}
          aria-describedby={opis ? `${id}-opis` : undefined}
          onChange={(e) => {
            setIzmenjenoU(pokusaj);
            onChange?.(e);
          }}
          {...rest}
          className={`${POLJE} ${lozinka ? "pr-12" : ""} ${pogresno ? POLJE_GRESKA : ""}`}
        />
        {lozinka && (
          <button
            type="button"
            onClick={() => setVidi((v) => !v)}
            aria-label={vidi ? "Sakrij lozinku" : "Prikaži lozinku"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-[4px] text-secondary transition hover:text-primary"
          >
            {vidi ? <EyeOff className="size-[18px]" strokeWidth={1.8} aria-hidden /> : <Eye className="size-[18px]" strokeWidth={1.8} aria-hidden />}
          </button>
        )}
      </div>
      {opis && (
        <p id={`${id}-opis`} className={`mt-1.5 text-[12.5px] leading-[18px] ${pogresno && poruka ? "font-medium text-error" : "text-secondary"}`}>
          {opis}
        </p>
      )}
    </div>
  );
}

/** Glavno dugme forme: velika žuta pilula kao „Potvrdite porudžbinu"; dok akcija traje piše šta radi. */
export function Dugme({ salje, radi = "Sačekajte…", children, className = "", ...rest }: ComponentProps<"button"> & { salje?: boolean; radi?: string }) {
  return (
    <button
      type="submit"
      disabled={salje}
      aria-busy={salje || undefined}
      {...rest}
      className={`group flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-on-brand shadow-[0_14px_28px_-14px_rgba(245,197,24,0.95)] transition hover:bg-brand-hover active:bg-brand-active disabled:cursor-wait disabled:opacity-80 ${className}`}
    >
      {salje ? (
        <>
          <LoaderCircle className="size-[18px] animate-spin" aria-hidden />
          {radi}
        </>
      ) : (
        <>
          {children}
          <ArrowRight width={16} height={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export function Greska({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-[4px] bg-[#fdecea] px-3.5 py-3 text-[14px] leading-[20px] text-error">
      <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Uspeh({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="flex items-start gap-2.5 rounded-[4px] bg-[#e8f3ec] px-3.5 py-3 text-[14px] leading-[20px] text-success">
      <CircleCheck className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Polja koja je server označio, iz stanja akcije. */
export const oznacena = (s: { ok: boolean; polja?: string[] } | undefined) => new Set(s && !s.ok ? (s.polja ?? []) : []);
