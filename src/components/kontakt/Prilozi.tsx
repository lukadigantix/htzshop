"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileImage, FileText, Paperclip, X } from "lucide-react";
import Razdvajac from "../Razdvajac";

/*
  Prilozi uz kontakt formu (brendiranje: logo, skice, primeri). Polje je cela površina: klik otvara izbor fajlova,
  a fajlovi mogu i da se prevuku. Ista ograničenja kao na backendu (upload.middleware → contactAttachmentsUpload),
  pa kupac grešku vidi odmah, pre slanja. Slike dobijaju sličicu (object URL, samo u pregledaču).
*/
export const TIPOVI = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".ai", ".eps", ".cdr", ".psd"];
export const MAX_FAJLOVA = 5;
const MAX_FAJL = 10 * 1024 * 1024;
const MAX_UKUPNO = 15 * 1024 * 1024;

const ext = (ime: string) => ime.slice(ime.lastIndexOf(".")).toLowerCase();
const velicina = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const jeSlika = (f: File) => /^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(f.type);

/** Samo slike (fotografije uz reklamaciju); podrazumevano su dozvoljeni i PDF i fajlovi za štampu (logo za brendiranje). */
export const SLIKE = [".jpg", ".jpeg", ".png", ".webp"];

export default function Prilozi({
  fajlovi,
  onChange,
  naziv = "Logo i primeri",
  poziv = "Dodajte logo ili primere",
  tipovi = TIPOVI,
}: {
  fajlovi: File[];
  onChange: (f: File[]) => void;
  naziv?: string;
  poziv?: string;
  tipovi?: string[];
}) {
  const samoSlike = tipovi === SLIKE;
  const ulaz = useRef<HTMLInputElement>(null);
  const [vuce, setVuce] = useState(false);
  const [greska, setGreska] = useState<string | null>(null);

  const slicice = useMemo(() => fajlovi.map((f) => (jeSlika(f) ? URL.createObjectURL(f) : null)), [fajlovi]);
  useEffect(() => () => slicice.forEach((u) => u && URL.revokeObjectURL(u)), [slicice]);

  function dodaj(lista: FileList | null) {
    if (!lista?.length) return;
    const novi = [...fajlovi];
    let poruka: string | null = null;
    for (const f of Array.from(lista)) {
      if (!tipovi.includes(ext(f.name))) poruka = samoSlike ? `„${f.name}" nije slika. Pošaljite JPG, PNG ili WEBP.` : `„${f.name}" nije podržan. Pošaljite sliku, PDF ili AI, EPS, CDR, PSD fajl.`;
      else if (f.size > MAX_FAJL) poruka = `„${f.name}" je veći od 10 MB.`;
      else if (novi.length >= MAX_FAJLOVA) poruka = `Možete priložiti najviše ${MAX_FAJLOVA} fajlova.`;
      else if (novi.reduce((n, x) => n + x.size, 0) + f.size > MAX_UKUPNO) poruka = "Prilozi zajedno mogu imati najviše 15 MB.";
      else if (!novi.some((x) => x.name === f.name && x.size === f.size)) novi.push(f);
    }
    setGreska(poruka);
    onChange(novi);
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-primary">
        {naziv} <span className="font-normal text-secondary">(nije obavezno)</span>
      </span>

      {fajlovi.length < MAX_FAJLOVA && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => ulaz.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ulaz.current?.click())}
          onDragOver={(e) => (e.preventDefault(), setVuce(true))}
          onDragLeave={() => setVuce(false)}
          onDrop={(e) => {
            e.preventDefault();
            setVuce(false);
            dodaj(e.dataTransfer.files);
          }}
          className={`group flex cursor-pointer items-center gap-4 rounded-[4px] border-[1.5px] border-dashed px-4 py-4 outline-none transition focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_rgba(245,197,24,0.25)] sm:px-5 ${
            vuce ? "border-brand bg-brand-soft" : "border-input bg-page hover:border-primary hover:bg-surface"
          }`}
        >
          <span className={`grid size-11 shrink-0 place-items-center rounded-full transition ${vuce ? "bg-brand text-on-brand" : "bg-surface text-primary group-hover:bg-brand group-hover:text-on-brand"}`}>
            <Paperclip className="size-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-snug">
              {vuce ? "Pustite fajlove ovde" : fajlovi.length ? "Dodajte još fajlova" : poziv}
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-[18px] text-secondary">
              Kliknite ili prevucite fajl. {samoSlike ? "JPG, PNG ili WEBP" : "Slika, PDF, AI, EPS, CDR ili PSD"}, do {MAX_FAJLOVA} fajlova, ukupno 15 MB.
            </span>
          </span>
          <input
            ref={ulaz}
            type="file"
            multiple
            accept={tipovi.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label="Izaberite fajlove"
            onChange={(e) => {
              dodaj(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {greska && (
        <p role="alert" className="mt-2 text-[13px] text-error">
          {greska}
        </p>
      )}

      {fajlovi.length > 0 && (
        <ul className="mt-2 space-y-1.5" aria-label="Priloženi fajlovi">
          {fajlovi.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className="flex items-center gap-3 rounded-[4px] border border-subtle bg-surface p-2 pr-2.5">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-page">
                {slicice[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- lokalni object URL
                  <img src={slicice[i]!} alt="" className="size-full object-contain" />
                ) : ext(f.name) === ".pdf" ? (
                  <FileText className="size-[18px] text-secondary" strokeWidth={1.6} aria-hidden />
                ) : (
                  <FileImage className="size-[18px] text-secondary" strokeWidth={1.6} aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{f.name}</span>
                <span className="block text-[12px] uppercase tracking-[0.06em] text-secondary">
                  {ext(f.name).slice(1)}
                  <Razdvajac />
                  {velicina(f.size)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => (setGreska(null), onChange(fajlovi.filter((_, j) => j !== i)))}
                aria-label={`Ukloni ${f.name}`}
                className="grid size-8 shrink-0 place-items-center rounded-full text-secondary transition hover:bg-page hover:text-primary"
              >
                <X className="size-4" strokeWidth={1.8} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
