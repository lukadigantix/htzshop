import { Check } from "lucide-react";
import {
  KURIR_LABEL,
  POSILJKA_KORACI,
  REKLAMACIJA_LABEL,
  STATUS_KORACI,
  STATUS_LABEL,
  type StatusPorudzbine,
  type StatusPosiljke,
  type StatusReklamacije,
} from "@/lib/nalog-deo";

/* Statusi porudžbine, reklamacije i pošiljke: pilule i trake toka (po uzoru na klikdogume status-pilula.tsx i posiljka.tsx). */

const PILULA = "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em]";

/** završena zeleno, otkazana sivo, u toku žuto; `naTamnom` za tamnu karticu na pregledu */
export function StatusPilula({ status, naTamnom }: { status: StatusPorudzbine; naTamnom?: boolean }) {
  const gotova = status === "isporuceno" || status === "fakturisano";
  const otkazana = status === "odustao";
  const boja = naTamnom
    ? gotova ? "bg-brand text-on-brand" : otkazana ? "bg-white/10 text-white/60" : "bg-white/12 text-white"
    : gotova ? "bg-[#e8f3ec] text-success" : otkazana ? "bg-page text-secondary ring-1 ring-subtle" : "bg-brand-soft text-[#6b5200]";
  return <span className={`${PILULA} ${boja}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function ReklamacijaPilula({ status }: { status: StatusReklamacije }) {
  const boja = status === "accepted" ? "bg-[#e8f3ec] text-success" : status === "rejected" ? "bg-page text-secondary ring-1 ring-subtle" : "bg-brand-soft text-[#6b5200]";
  return <span className={`${PILULA} ${boja}`}>{REKLAMACIJA_LABEL[status] ?? status}</span>;
}

export function PosiljkaPilula({ status, label }: { status: StatusPosiljke; label: string }) {
  const boja = status === "isporucena" ? "bg-[#e8f3ec] text-success" : status === "vracena" || status === "greska" ? "bg-page text-secondary ring-1 ring-subtle" : "bg-brand-soft text-[#6b5200]";
  return <span className={`${PILULA} ${boja}`}>{label}</span>;
}

/** Oznaka kurirske službe, da se na prvi pogled vidi čija je pošiljka. */
export function KurirZnacka({ courier, label }: { courier: string; label?: string }) {
  const boja = courier === "postexpress" ? "bg-[#ffd200] text-primary" : courier === "bex" ? "bg-primary text-white" : "bg-page text-secondary";
  return <span className={`inline-flex shrink-0 items-center rounded-[3px] px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.06em] ${boja}`}>{label ?? KURIR_LABEL[courier] ?? courier}</span>;
}

/** Traka u četiri koraka sa žutim napretkom; zajednička za porudžbinu i pošiljku. */
function Traka({ koraci, korak, naTamnom, oznaka, className = "" }: { koraci: string[]; korak: number; naTamnom?: boolean; oznaka: string; className?: string }) {
  return (
    <ol aria-label={oznaka} className={`grid grid-cols-4 gap-1.5 ${className}`}>
      {koraci.map((k, i) => {
        const gotov = i <= korak;
        return (
          <li key={k} className="min-w-0" aria-current={i === korak ? "step" : undefined}>
            <span aria-hidden className={`block h-1.5 rounded-full ${gotov ? "bg-brand" : naTamnom ? "bg-white/12" : "bg-subtle"}`} />
            <span
              className={`mt-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.04em] sm:text-[12px] ${
                gotov ? (naTamnom ? "text-white" : "text-primary") : naTamnom ? "text-white/40" : "text-secondary/70"
              }`}
            >
              {/* kvačica tek od sm, na telefonu bi „Primljena" bila isečena */}
              {gotov && <Check className="hidden size-3 shrink-0 sm:block" strokeWidth={3} aria-hidden />}
              <span className="truncate">{k}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Tok porudžbine (primljena → isporučena); otkazana nema traku. */
export function TrakaStatusa({ status, naTamnom, className }: { status: StatusPorudzbine; naTamnom?: boolean; className?: string }) {
  if (status === "odustao") return null;
  const korak = STATUS_KORACI.indexOf(status === "fakturisano" ? "isporuceno" : status);
  return <Traka koraci={STATUS_KORACI.map((s) => STATUS_LABEL[s])} korak={korak} naTamnom={naTamnom} oznaka="Tok porudžbine" className={className} />;
}

/** Tok pošiljke (prijavljena → isporučena); vraćena nema traku, greška stoji na prvom koraku. */
export function TrakaPosiljke({ status, className }: { status: StatusPosiljke; className?: string }) {
  if (status === "vracena") return null;
  const korak = Math.max(0, POSILJKA_KORACI.findIndex((k) => k.status === status));
  return <Traka koraci={POSILJKA_KORACI.map((k) => k.label)} korak={korak} oznaka="Tok pošiljke" className={className} />;
}
