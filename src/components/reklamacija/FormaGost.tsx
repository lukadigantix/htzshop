"use client";

import { useState } from "react";
import { CircleHelp, PackageX, Ruler, Wrench } from "lucide-react";
import { LABELA, POLJE } from "../kontakt/KontaktForma";
import Prilozi, { SLIKE } from "../kontakt/Prilozi";
import { ArrowRight } from "../Icons";

/*
  Reklamacija bez naloga. Backend prima reklamacije (POST /complaints) samo od prijavljenih kupaca, pa kupac koji je poručio
  kao gost šalje reklamaciju kroz kontakt rutu (/api/kontakt → POST /contact): poruka počinje sa „[Reklamacija]", uz broj
  porudžbine i vrstu problema, a fotografije idu kao prilozi mejla. Backend kupcu odmah šalje potvrdu sa sadržajem poruke.
*/
const PROBLEMI = [
  { naziv: "Oštećen proizvod", Icon: PackageX },
  { naziv: "Pogrešna veličina ili model", Icon: Ruler },
  { naziv: "Neispravan proizvod", Icon: Wrench },
  { naziv: "Nešto drugo", Icon: CircleHelp },
] as const;
type Problem = (typeof PROBLEMI)[number]["naziv"];

/** `kupac`: podaci prijavljenog kupca, unapred upisani (reklamacija za stariju porudžbinu ili kupovinu u radnji). */
export default function FormaGost({ kupac }: { kupac?: { ime: string; prezime: string; email: string; telefon: string } }) {
  const [problem, setProblem] = useState<Problem>("Oštećen proizvod");
  const [stanje, setStanje] = useState<"spremno" | "saljem" | "poslato" | "greska">("spremno");
  const [poruka, setPoruka] = useState<string | null>(null);
  const [fajlovi, setFajlovi] = useState<File[]>([]);

  async function posalji(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const broj = String(f.get("porudzbina") ?? "").trim();
    const opis = String(f.get("opis") ?? "").trim();
    if (!broj) return (setStanje("greska"), setPoruka("Upišite broj porudžbine ili računa."));
    if (opis.length < 20) return (setStanje("greska"), setPoruka("Opišite problem u bar 20 znakova."));
    setStanje("saljem");
    setPoruka(null);
    try {
      const podaci = {
        firstName: String(f.get("ime") ?? ""),
        lastName: String(f.get("prezime") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("telefon") ?? ""),
        message: `[Reklamacija]\nBroj porudžbine: ${broj}\nProblem: ${problem}${f.get("prijem") ? `\nDatum prijema: ${f.get("prijem")}` : ""}\n\n${opis}`,
      };
      let telo: BodyInit = JSON.stringify(podaci);
      if (fajlovi.length) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(podaci)) if (v) fd.append(k, v);
        for (const fajl of fajlovi) fd.append("files", fajl);
        telo = fd;
      }
      const r = await fetch("/api/kontakt", { method: "POST", headers: fajlovi.length ? undefined : { "Content-Type": "application/json" }, body: telo });
      const j = (await r.json().catch(() => null)) as { success?: boolean; message?: string | null } | null;
      if (!r.ok || !j?.success) throw new Error(j?.message ?? "Reklamacija nije poslata. Pokušajte ponovo ili nas pozovite.");
      setStanje("poslato");
      setFajlovi([]);
    } catch (err) {
      setStanje("greska");
      setPoruka(err instanceof Error ? err.message : "Reklamacija nije poslata. Pokušajte ponovo ili nas pozovite.");
    }
  }

  if (stanje === "poslato") {
    return (
      <div className="flex min-h-[360px] flex-col items-start justify-center">
        <span className="grid size-12 place-items-center rounded-full bg-success text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="mt-6 text-[24px] font-medium leading-tight">Reklamacija je poslata.</h3>
        <p className="p-muted mt-3 max-w-[460px] text-[15px] leading-[24px]">
          Kopija sa sadržajem reklamacije stiže na vaš e-mail. Javljamo vam se sa brojem pod kojim je reklamacija zavedena i dogovorom oko proizvoda, a odgovor dobijate
          najkasnije u roku od osam dana.
        </p>
        <p className="mt-3 text-[14px] font-medium">Proizvod nam ne šaljite dok se ne javimo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={posalji} className="space-y-5">
      <fieldset>
        <legend className={LABELA}>Šta nije u redu?</legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {PROBLEMI.map(({ naziv, Icon }) => {
            const izabran = problem === naziv;
            return (
              <button
                key={naziv}
                type="button"
                onClick={() => setProblem(naziv)}
                aria-pressed={izabran}
                className={`flex flex-col items-start gap-3 rounded-[4px] border p-3.5 text-left text-[14px] font-medium leading-tight transition ${
                  izabran ? "border-primary bg-primary text-white" : "border-subtle bg-surface hover:border-input"
                }`}
              >
                <span className={`grid size-9 place-items-center rounded-full ${izabran ? "bg-brand text-on-brand" : "bg-page"}`}>
                  <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                </span>
                {naziv}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label>
          <span className={LABELA}>Broj porudžbine ili računa</span>
          <input name="porudzbina" required placeholder="Iz e-maila potvrde" className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>
            Datum prijema <span className="font-normal text-secondary">(nije obavezno)</span>
          </span>
          <input name="prijem" type="date" className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>Ime</span>
          <input name="ime" required autoComplete="given-name" defaultValue={kupac?.ime} className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>Prezime</span>
          <input name="prezime" required autoComplete="family-name" defaultValue={kupac?.prezime} className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={kupac?.email} className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>Telefon</span>
          <input name="telefon" type="tel" required autoComplete="tel" defaultValue={kupac?.telefon} className={POLJE} />
        </label>
      </div>

      <label className="block">
        <span className={LABELA}>Opis problema</span>
        <textarea
          name="opis"
          required
          rows={5}
          placeholder="Koji proizvod, šta tačno nije u redu i kada ste primetili. Npr. đon se odlepio posle nedelju dana nošenja."
          className={`${POLJE} h-auto resize-y py-3 leading-[22px]`}
        />
      </label>

      <Prilozi fajlovi={fajlovi} onChange={setFajlovi} naziv="Fotografije" poziv="Dodajte fotografije proizvoda i oštećenja" tipovi={SLIKE} />

      {stanje === "greska" && poruka && (
        <p role="alert" className="rounded-[4px] bg-[#fdecea] px-4 py-3 text-[14px] text-error">
          {poruka}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-[18px] text-secondary sm:max-w-[320px]">Podatke koristimo samo za rešavanje reklamacije, u skladu sa politikom privatnosti.</p>
        <button type="submit" disabled={stanje === "saljem"} className="btn-primary disabled:opacity-60" style={{ height: 48, padding: "0 28px", fontSize: 15 }}>
          {stanje === "saljem" ? "Šaljem…" : "Pošaljite reklamaciju"}
          {stanje !== "saljem" && <ArrowRight width={15} height={15} strokeWidth={1.8} />}
        </button>
      </div>
    </form>
  );
}
