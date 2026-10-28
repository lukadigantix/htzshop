"use client";

import { useState, useSyncExternalStore } from "react";
import type { Dan, RadnoVreme } from "@/lib/sajt";
import Razdvajac from "../Razdvajac";

/*
  Radnja „uživo": status otvoreno/zatvoreno i tabela radnog vremena sa istaknutim današnjim danom,
  po beogradskom vremenu (kupac može biti i u drugoj zoni). Na serveru se ne zna „sada", pa se status
  crta tek u browseru (useSyncExternalStore sa praznim server snimkom) - bez razlike pri hidrataciji.
*/

const DANI = ["", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota", "Nedelja"];
const U_DAN = ["", "u ponedeljak", "u utorak", "u sredu", "u četvrtak", "u petak", "u subotu", "u nedelju"];
const KRATKO: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

// „dan:minut u danu" u Beogradu; string je stabilan snimak za useSyncExternalStore
function snimak() {
  const d = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Belgrade", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return `${KRATKO[d.weekday]}:${Number(d.hour) * 60 + Number(d.minute)}`;
}
const pretplata = (javi: () => void) => {
  const t = window.setInterval(javi, 30_000);
  return () => window.clearInterval(t);
};

function useBeograd(): { dan: number; min: number } | null {
  const s = useSyncExternalStore(pretplata, snimak, () => null);
  if (!s) return null;
  const [dan, min] = s.split(":").map(Number);
  return { dan, min };
}

const uMin = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// `detalj` ide posle razdvajača: „Zatvoreno | otvaramo u 07:00"
function status(week: Dan[], dan: number, min: number): { otvoreno: boolean; tekst: string; detalj?: string } | null {
  if (!week.length) return null;
  const danas = week.find((d) => d.day === dan);
  const od = uMin(danas?.open ?? null);
  const doo = uMin(danas?.close ?? null);
  if (danas?.isOpen && od != null && doo != null && min >= od && min < doo) {
    return { otvoreno: true, tekst: doo - min <= 60 ? `Zatvaramo uskoro, u ${danas.close}` : `Otvoreno do ${danas.close}` };
  }
  if (danas?.isOpen && od != null && min < od) return { otvoreno: false, tekst: "Zatvoreno", detalj: `otvaramo u ${danas.open}` };
  for (let i = 1; i <= 7; i++) {
    const n = ((dan - 1 + i) % 7) + 1;
    const d = week.find((x) => x.day === n);
    if (d?.isOpen && d.open) return { otvoreno: false, tekst: "Zatvoreno", detalj: `otvaramo ${i === 1 ? "sutra" : U_DAN[n]} u ${d.open}` };
  }
  return null;
}

/** `tamno`: pilula na tamnoj podlozi; `mali`: bez pilule, samo tačka i tekst (gornja traka) */
export function StatusRadnje({ week, tamno = false, mali = false }: { week: Dan[]; tamno?: boolean; mali?: boolean }) {
  const sada = useBeograd();
  const s = sada && status(week, sada.dan, sada.min);
  // dok se ne zna vreme (server, prvi crtež) drži mesto da se raspored ne pomera
  if (!s) return <span className={`inline-block ${mali ? "h-4" : "h-8"}`} aria-hidden />;
  return (
    <span className={mali ? "inline-flex items-center gap-2 whitespace-nowrap" : `inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium ${tamno ? "bg-white/10 text-white" : "bg-page text-primary"}`}>
      <span className="relative flex size-2">
        {s.otvoreno && <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3ddc84] opacity-75" />}
        <span className={`relative inline-flex size-2 rounded-full ${s.otvoreno ? "bg-[#3ddc84]" : "bg-[#f97066]"}`} />
      </span>
      <span>
        {s.tekst}
        {s.detalj && (
          <>
            <Razdvajac />
            {s.detalj}
          </>
        )}
      </span>
    </span>
  );
}

/** Svih sedam dana sa istaknutim današnjim; bez podataka po danima (API ne radi) ide grupisan prikaz. */
export function RadnoVremeTabela({ week, hours, tamno = false }: { week: Dan[]; hours: RadnoVreme[]; /** na tamnoj podlozi (footer): danas je žuta traka */ tamno?: boolean }) {
  const sada = useBeograd();
  if (!week.length) {
    return (
      <dl className="space-y-2 text-[14px]">
        {hours.map((h) => (
          <div key={h.days} className="flex justify-between gap-4">
            <dt className="text-secondary">{h.days}</dt>
            <dd className={h.isOpen ? "font-medium" : "text-secondary"}>{h.hours}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className="-mx-3 text-[14px]">
      {[...week]
        .sort((a, b) => a.day - b.day)
        .map((d) => {
          const danas = sada?.dan === d.day;
          return (
            <div key={d.day} className={`flex justify-between gap-4 rounded-[4px] px-3 py-1.5 ${danas ? (tamno ? "bg-brand text-on-brand" : "bg-brand-soft") : ""}`}>
              <dt className={danas ? "font-medium" : tamno ? "text-white/55" : "text-secondary"}>
                {DANI[d.day]}
                {danas && <span className={`ml-2 text-[11px] font-medium uppercase tracking-[0.12em] ${tamno ? "text-on-brand/70" : "text-warning"}`}>danas</span>}
              </dt>
              <dd className={d.isOpen ? "font-medium tabular-nums" : tamno ? (danas ? "text-on-brand/70" : "text-white/55") : "text-secondary"}>{d.isOpen && d.open && d.close ? `${d.open} - ${d.close}` : "Zatvoreno"}</dd>
            </div>
          );
        })}
    </dl>
  );
}

export function Kopiraj({ tekst, label }: { tekst: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(tekst);
          setOk(true);
          window.setTimeout(() => setOk(false), 1600);
        } catch {
          // bez dozvole za clipboard dugme ostaje kakvo jeste; vrednost se i dalje može označiti i kopirati ručno
        }
      }}
      aria-label={`Kopiraj: ${label}`}
      className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition ${ok ? "bg-success text-white" : "bg-page text-secondary hover:bg-brand-soft hover:text-primary"}`}
    >
      {ok ? "Kopirano" : "Kopiraj"}
    </button>
  );
}
