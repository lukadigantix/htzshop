import type { Metadata } from "next";
import Link from "next/link";
import { categoryHref } from "@/data/site";
import { SearchPill } from "@/components/SiteSearch";
import { STIT } from "@/components/logoPutanje";
import { ArrowRight } from "@/components/Icons";

/*
  404, mirno: „4 [štit] 4" - štit iz loga stoji umesto nule. Brojevi se pojave, žuti štit jednom „padne" na mesto,
  blago odskoči i ostane; ništa se ne kreće u krug. Ispod jasna poruka i izlazi: početna, prodavnica, pretraga, grupe.
  Animacije su u globals.css („404"): pri punom učitavanju kreću kad se preloader povuče; „smanji pokrete" - sve stoji.
  Next ovu stranu sam označava sa noindex.
*/

export const metadata: Metadata = {
  title: "Stranica nije pronađena - HTZ Shop",
  description: "Tražena stranica ne postoji. Pogledajte HTZ opremu u prodavnici: radna odeća, zaštitna obuća, rukavice i lična zaštitna oprema.",
};

const grupe = [
  { name: "Radna odeća", slug: "zastitna-i-radna-odeca" },
  { name: "Zaštitna obuća", slug: "zastitna-i-radna-obuca" },
  { name: "Rukavice", slug: "zastitne-i-radne-rukavice" },
  { name: "Zaštita glave", slug: "zastita-glave" },
  { name: "Rad na visini", slug: "zastita-od-pada" },
];

export default function NotFound() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <section className="container-site flex flex-col items-center pb-20 pt-14 text-center md:pb-28 md:pt-20">
        <p className="kicker n4-ulaz">Greška 404</p>

        {/* „4 [štit] 4" */}
        <p aria-hidden className="mt-6 flex select-none items-center justify-center gap-[0.04em] text-[clamp(140px,26vw,320px)] font-semibold leading-none tracking-[-0.06em] text-primary md:mt-8">
          <span className="n4-ulaz" style={{ "--n4-d": "0.05s" } as React.CSSProperties}>
            4
          </span>
          <span className="n4-stit mx-[0.04em] block h-[0.78em]">
            <svg viewBox="0 0 296 354" className="h-full w-auto drop-shadow-[0_18px_30px_rgba(245,197,24,0.35)]">
              <path fill="var(--brand-primary)" fillRule="evenodd" d={STIT} />
            </svg>
          </span>
          <span className="n4-ulaz" style={{ "--n4-d": "0.15s" } as React.CSSProperties}>
            4
          </span>
        </p>

        <h1 style={{ "--n4-d": "0.7s" } as React.CSSProperties} className="n4-ulaz mt-10 max-w-[680px] text-balance text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:mt-16 md:text-[44px]">
          Ova stranica je zatvorena za prolaz.
        </h1>
        <p style={{ "--n4-d": "0.8s" } as React.CSSProperties} className="p-muted n4-ulaz mt-4 max-w-[540px] text-balance text-[16px] leading-[26px]">
          Stranica koju tražite ne postoji ili je premeštena. Vratite se na sigurno ili potražite opremu koja vam treba.
        </p>

        <div style={{ "--n4-d": "0.9s" } as React.CSSProperties} className="n4-ulaz mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary" style={{ height: 48, padding: "0 26px", fontSize: 15 }}>
            Nazad na početnu
          </Link>
          <Link href="/prodavnica/" className="btn-secondary" style={{ height: 48, padding: "0 26px", fontSize: 15 }}>
            Pogledajte prodavnicu
          </Link>
        </div>

        <div style={{ "--n4-d": "1s" } as React.CSSProperties} className="n4-ulaz mt-6 w-full max-w-[420px]">
          <SearchPill className="bg-surface ring-1 ring-subtle hover:bg-surface hover:ring-input" />
        </div>

        <nav aria-label="Najtraženije grupe" style={{ "--n4-d": "1.1s" } as React.CSSProperties} className="n4-ulaz mt-10">
          <p className="text-[13px] text-secondary">Najtraženije</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {grupe.map((g) => (
              <li key={g.slug}>
                <Link href={categoryHref(g.slug)} className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-subtle bg-surface px-4 text-[14px] font-medium transition hover:border-primary">
                  {g.name}
                  <ArrowRight width={13} height={13} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </main>
  );
}
