"use client";

import { useEffect, useState } from "react";
import { Building2, MessageCircle, Shirt } from "lucide-react";
import { ArrowRight } from "../Icons";
import Prilozi from "./Prilozi";

/*
  Kontakt forma: tema (pitanje, ponuda za firmu, brendiranje), podaci i poruka → /api/kontakt → backend POST /contact.
  Backend prima ime, prezime, email, telefon i poruku; tema i firma se upisuju na početak poruke.
  Uz „Brendiranje odeće" mogu da se prilože logo i primeri: tada forma šalje multipart, a fajlovi stižu kao prilog mejla.
  Link „Zatraži ponudu" iz zaglavlja vodi na /kontakt/#ponuda i tada je unapred izabrana ponuda.
  `tema` bira početnu temu (stranica brendiranja otvara formu sa „Brendiranje odeće").
*/
const TEME = [
  { naziv: "Pitanje", opis: "Proizvod, veličina, dostava", Icon: MessageCircle },
  { naziv: "Ponuda za firmu", opis: "Oprema za ceo tim", Icon: Building2 },
  { naziv: "Brendiranje odeće", opis: "Vaš logo na odeći", Icon: Shirt },
] as const;
export type Tema = (typeof TEME)[number]["naziv"];

// .polje: globalni okvir za fokus se ovde zamenjuje žutim sjajem (globals.css)
export const POLJE =
  "polje h-12 w-full rounded-[4px] border border-subtle bg-page px-4 text-[15px] text-primary outline-none transition placeholder:text-[#9a9ea5] hover:border-input focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)]";
export const LABELA = "mb-1.5 block text-[13px] font-medium text-primary";

export default function KontaktForma({ tema: pocetna = "Pitanje" }: { tema?: Tema }) {
  const [tema, setTema] = useState<Tema>(pocetna);
  const [stanje, setStanje] = useState<"spremno" | "saljem" | "poslato" | "greska">("spremno");
  const [poruka, setPoruka] = useState<string | null>(null);
  const [fajlovi, setFajlovi] = useState<File[]>([]);

  useEffect(() => {
    const izHasha = () => window.location.hash === "#ponuda" && setTema("Ponuda za firmu");
    izHasha();
    window.addEventListener("hashchange", izHasha);
    return () => window.removeEventListener("hashchange", izHasha);
  }, []);

  const firma = tema !== "Pitanje";

  async function posalji(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tekst = String(f.get("poruka") ?? "").trim();
    if (tekst.length < 10) {
      setStanje("greska");
      setPoruka("Poruka treba da ima bar 10 znakova.");
      return;
    }
    const nazivFirme = String(f.get("firma") ?? "").trim();
    setStanje("saljem");
    setPoruka(null);
    try {
      const podaci = {
        firstName: String(f.get("ime") ?? ""),
        lastName: String(f.get("prezime") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("telefon") ?? "") || undefined,
        message: `[${tema}]${firma && nazivFirme ? `\nFirma: ${nazivFirme}` : ""}\n\n${tekst}`,
      };
      const prilozi = tema === "Brendiranje odeće" ? fajlovi : [];
      let telo: BodyInit = JSON.stringify(podaci);
      if (prilozi.length) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(podaci)) if (v) fd.append(k, v);
        for (const fajl of prilozi) fd.append("files", fajl);
        telo = fd;
      }
      const r = await fetch("/api/kontakt", {
        method: "POST",
        // za FormData pregledač sam postavlja tip sa granicom
        headers: prilozi.length ? undefined : { "Content-Type": "application/json" },
        body: telo,
      });
      const j = (await r.json().catch(() => null)) as { success?: boolean; message?: string | null } | null;
      if (!r.ok || !j?.success) throw new Error(j?.message ?? "Poruka nije poslata. Pokušajte ponovo.");
      setStanje("poslato");
      setFajlovi([]);
    } catch (err) {
      setStanje("greska");
      setPoruka(err instanceof Error ? err.message : "Poruka nije poslata. Pokušajte ponovo.");
    }
  }

  if (stanje === "poslato") {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand text-on-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="mt-6 text-[24px] font-medium leading-tight">Hvala, poruka je poslata.</h3>
        <p className="p-muted mt-3 max-w-[420px] text-[15px]">Javljamo se radnim danom. Ako je hitno, pozovite nas telefonom.</p>
        <button type="button" onClick={() => setStanje("spremno")} className="btn-secondary mt-8">
          Pošalji novu poruku
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={posalji} className="space-y-5">
      <fieldset>
        <legend className={LABELA}>O čemu se radi?</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TEME.map(({ naziv, opis, Icon }) => {
            const izabrana = tema === naziv;
            return (
              <button
                key={naziv}
                type="button"
                onClick={() => setTema(naziv)}
                aria-pressed={izabrana}
                className={`group flex items-center gap-3 rounded-[4px] border p-3.5 text-left transition sm:flex-col sm:items-start sm:gap-4 sm:p-4 ${
                  izabrana ? "border-primary bg-primary text-white" : "border-subtle bg-surface hover:border-input"
                }`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-full transition ${izabrana ? "bg-brand text-on-brand" : "bg-page text-primary group-hover:bg-brand-soft"}`}>
                  <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                </span>
                <span>
                  <span className="block text-[14px] font-medium leading-tight">{naziv}</span>
                  <span className={`mt-0.5 block text-[12px] leading-snug ${izabrana ? "text-white/65" : "text-secondary"}`}>{opis}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label>
          <span className={LABELA}>Ime</span>
          <input name="ime" required autoComplete="given-name" className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>Prezime</span>
          <input name="prezime" required autoComplete="family-name" className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={POLJE} />
        </label>
        <label>
          <span className={LABELA}>
            Telefon <span className="font-normal text-secondary">(nije obavezno)</span>
          </span>
          <input name="telefon" type="tel" autoComplete="tel" className={POLJE} />
        </label>
        {firma && (
          <label className="sm:col-span-2">
            <span className={LABELA}>
              Firma <span className="font-normal text-secondary">(nije obavezno)</span>
            </span>
            <input name="firma" autoComplete="organization" className={POLJE} />
          </label>
        )}
      </div>

      <label className="block">
        <span className={LABELA}>Poruka</span>
        <textarea
          name="poruka"
          required
          rows={6}
          placeholder={
            tema === "Pitanje"
              ? "Kako možemo da pomognemo?"
              : tema === "Ponuda za firmu"
                ? "Šta vam treba i u kojim količinama? Npr. 20 pari cipela S3, veličine 40-46."
                : "Koja odeća, koliko komada i gde ide logo?"
          }
          className={`${POLJE} h-auto resize-y py-3 leading-[22px]`}
        />
      </label>

      {tema === "Brendiranje odeće" && <Prilozi fajlovi={fajlovi} onChange={setFajlovi} />}

      {stanje === "greska" && poruka && (
        <p role="alert" className="rounded-[4px] bg-[#fdecea] px-4 py-3 text-[14px] text-error">
          {poruka}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-[18px] text-secondary sm:max-w-[300px]">Podatke koristimo samo da bismo vam odgovorili.</p>
        <button type="submit" disabled={stanje === "saljem"} className="btn-primary disabled:opacity-60" style={{ height: 48, padding: "0 28px", fontSize: 15 }}>
          {stanje === "saljem" ? "Šaljem…" : "Pošalji poruku"}
          {stanje !== "saljem" && <ArrowRight width={15} height={15} strokeWidth={1.8} />}
        </button>
      </div>
    </form>
  );
}
