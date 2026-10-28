import Link from "next/link";
import { ChevronLeft, ChevronRight } from "../Icons";

/** Strane kao linkovi (rade bez JS-a, Google ih prati); `?strana=` se dodaje na postojeći upit, prva strana je bez parametra. */
export default function Paginacija({ strana, ukupno, upit }: { strana: number; ukupno: number; upit: URLSearchParams }) {
  if (ukupno <= 1) return null;
  const href = (n: number) => {
    const sp = new URLSearchParams(upit);
    if (n <= 1) sp.delete("strana");
    else sp.set("strana", String(n));
    const q = sp.toString();
    return q ? `?${q}` : "?";
  };
  // prozor: 1 … s-1 s s+1 … n
  const brojevi = [...new Set([1, strana - 1, strana, strana + 1, ukupno].filter((n) => n >= 1 && n <= ukupno))].sort((a, b) => a - b);
  const stavke: (number | "…")[] = [];
  brojevi.forEach((n, i) => {
    if (i > 0 && n - brojevi[i - 1] > 1) stavke.push("…");
    stavke.push(n);
  });
  const dugme = "grid size-10 place-items-center rounded-full text-[14px] font-medium transition-colors";
  const strelica = (n: number, label: string, ikona: React.ReactNode) =>
    n >= 1 && n <= ukupno && n !== strana ? (
      <Link href={href(n)} aria-label={label} className={`${dugme} border border-subtle bg-surface hover:border-primary hover:bg-primary hover:text-white`}>
        {ikona}
      </Link>
    ) : (
      <span className={`${dugme} text-[#c4c7cc]`} aria-hidden>
        {ikona}
      </span>
    );

  return (
    <nav aria-label="Strane" className="mt-12 flex items-center justify-center gap-1.5">
      {strelica(strana - 1, "Prethodna strana", <ChevronLeft width={16} height={16} strokeWidth={1.8} />)}
      {stavke.map((s, i) =>
        s === "…" ? (
          <span key={`e${i}`} className="w-6 text-center text-secondary" aria-hidden>
            …
          </span>
        ) : s === strana ? (
          <span key={s} aria-current="page" className={`${dugme} bg-primary text-white`}>
            {s}
          </span>
        ) : (
          <Link key={s} href={href(s)} className={`${dugme} border border-subtle bg-surface hover:border-primary`}>
            {s}
          </Link>
        ),
      )}
      {strelica(strana + 1, "Sledeća strana", <ChevronRight width={16} height={16} strokeWidth={1.8} />)}
    </nav>
  );
}
