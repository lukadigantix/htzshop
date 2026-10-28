import Link from "next/link";

/* Koraci kupovine iznad korpe i naplate: 1 Korpa, 2 Podaci i isporuka, 3 Potvrda. Prođeni korak je link nazad. */
const KORACI = [
  { naziv: "Korpa", href: "/korpa/" },
  { naziv: "Podaci i isporuka", href: "/porudzbina/" },
  { naziv: "Potvrda", href: null },
];

export default function Koraci({ aktivan }: { aktivan: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Koraci kupovine" className="flex items-center gap-2 text-[13px] sm:gap-3 sm:text-[14px]">
      {KORACI.map((k, i) => {
        const prodjen = i < aktivan;
        const sadrzaj = (
          <>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold leading-none tabular-nums ${
                i === aktivan ? "bg-brand text-on-brand" : prodjen ? "bg-primary text-white" : "bg-surface text-secondary ring-1 ring-subtle"
              }`}
            >
              {prodjen ? (
                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m2.5 6.2 2.3 2.3 4.7-5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={`${i === aktivan ? "font-semibold text-primary" : "text-secondary"} ${i === aktivan ? "" : "hidden sm:inline"}`}>{k.naziv}</span>
          </>
        );
        return (
          <li key={k.naziv} aria-current={i === aktivan ? "step" : undefined} className="flex items-center gap-2 sm:gap-3">
            {prodjen && k.href ? (
              <Link href={k.href} className="flex items-center gap-2 transition hover:opacity-75">
                {sadrzaj}
              </Link>
            ) : (
              <span className="flex items-center gap-2">{sadrzaj}</span>
            )}
            {i < KORACI.length - 1 && <span aria-hidden className={`h-px w-6 sm:w-10 ${prodjen ? "bg-primary" : "bg-input"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
