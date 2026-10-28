import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { getSajt } from "@/lib/sajt";
import { STIT } from "../logoPutanje";
import { Phone } from "../Icons";

/*
  Okvir strana prijave, registracije i nove lozinke (po uzoru na klikdogume components/nalog/okvir.tsx, u HTZ jeziku):
  tamna scena kao uvod strane Kontakt (crno-bela fotografija radnje, žuti sjaj, veliki štit iz loga), levo naslov i šta
  nalog donosi, desno bela kartica sa trakom upozorenja i formom. Na telefonu: kratak naslov, kartica, pa prednosti i telefon.
*/

const PREDNOSTI = [
  { naslov: "Porudžbine na jednom mestu", opis: "Status, stavke i iznos svake porudžbine, i kad je kod kurira." },
  { naslov: "Sačuvane adrese", opis: "Do tri adrese za dostavu: firma, magacin, gradilište." },
  { naslov: "Brža kupovina", opis: "Vaši podaci su već upisani na naplati." },
];

const TABOVI = [
  { id: "prijava", label: "Prijava", href: "/prijava/" },
  { id: "registracija", label: "Novi nalog", href: "/registracija/" },
] as const;

type Props = {
  kicker: string;
  naslov: string;
  uvod?: ReactNode;
  children: ReactNode;
  /** naslov scene u dva dela, drugi je žut */
  scena?: [string, string];
  /** aktivan tab Prijava | Novi nalog; bez njega tabova nema (nova lozinka) */
  tab?: (typeof TABOVI)[number]["id"];
  /** ?nazad= se prenosi i na drugi tab */
  nazad?: string;
};

export default async function PrijavaOkvir({ kicker, naslov, uvod, children, scena = ["Vaš nalog", "u HTZ Shopu."], tab, nazad }: Props) {
  const s = await getSajt();
  const upit = nazad ? `?nazad=${encodeURIComponent(nazad)}` : "";

  return (
    <main className="relative flex-1 overflow-hidden bg-primary text-white">
      <Image src="/images/photo/prodavnica.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_35%] opacity-[0.16] grayscale" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[560px] rounded-full bg-brand/15 blur-[120px]" />
      {/* štit iz loga, krupno i jedva vidljivo iza kartice */}
      <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -bottom-24 right-[-120px] hidden h-[720px] w-auto text-white/[0.035] lg:block">
        <path fill="currentColor" fillRule="evenodd" d={STIT} />
      </svg>

      <div className="container-site relative grid gap-8 py-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:gap-16 lg:py-20 xl:grid-cols-[minmax(0,1fr)_560px] xl:gap-24">
        {/* scena: naslov (na telefonu samo on, iznad kartice) */}
        <div className="hero-in lg:self-stretch lg:py-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Moj nalog</p>
          <p className="mt-3 text-[34px] font-medium leading-[1.04] tracking-[-0.03em] md:text-[48px] lg:mt-6 xl:text-[64px]">
            {scena[0]} <span className="block text-brand">{scena[1]}</span>
          </p>

          <ul aria-label="Šta donosi nalog" className="mt-10 hidden max-w-[440px] space-y-6 lg:block">
            {PREDNOSTI.map((p) => (
              <li key={p.naslov} className="flex gap-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                  <Check className="size-4" strokeWidth={2.6} aria-hidden />
                </span>
                <span>
                  <span className="block text-[17px] font-medium leading-tight">{p.naslov}</span>
                  <span className="mt-1 block text-[14px] leading-[21px] text-white/60">{p.opis}</span>
                </span>
              </li>
            ))}
          </ul>

          <Pomoc telefon={s.phone} href={s.phoneHref} className="mt-12 hidden lg:flex" />
        </div>

        {/* kartica sa formom */}
        <div className="relative overflow-hidden rounded-[6px] bg-surface text-primary shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
          <div aria-hidden className="h-2 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_14px,var(--text-primary)_14px_28px)]" />
          <div className="p-5 sm:p-8 xl:p-10">
            {tab && (
              <nav aria-label="Prijava ili novi nalog" className="mb-7 grid grid-cols-2 rounded-full bg-page p-1 ring-1 ring-subtle">
                {TABOVI.map((t) => {
                  const on = t.id === tab;
                  return (
                    <Link
                      key={t.id}
                      href={`${t.href}${upit}`}
                      aria-current={on ? "page" : undefined}
                      className={`flex h-10 items-center justify-center rounded-full text-[14px] font-semibold transition ${on ? "bg-primary text-white" : "text-secondary hover:text-primary"}`}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </nav>
            )}
            <p className="kicker">{kicker}</p>
            <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[36px]">{naslov}</h1>
            {uvod && <p className="mt-3 text-[15px] leading-[24px] text-secondary">{uvod}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </div>

        {/* telefon: prednosti i pomoć ispod kartice */}
        <div className="lg:hidden">
          <ul aria-label="Šta donosi nalog" className="grid gap-3 sm:grid-cols-3">
            {PREDNOSTI.map((p) => (
              <li key={p.naslov} className="flex gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                  <Check className="size-3.5" strokeWidth={2.8} aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] font-medium leading-tight">{p.naslov}</span>
                  <span className="mt-1 block text-[13px] leading-[19px] text-white/60">{p.opis}</span>
                </span>
              </li>
            ))}
          </ul>
          <Pomoc telefon={s.phone} href={s.phoneHref} className="mt-6 flex" />
        </div>
      </div>
    </main>
  );
}

function Pomoc({ telefon, href, className = "" }: { telefon: string; href: string; className?: string }) {
  return (
    <a href={href} className={`group items-center gap-3.5 ${className}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition group-hover:bg-white">
        <Phone width={18} height={18} strokeWidth={1.8} />
      </span>
      <span className="leading-tight">
        <span className="block text-[11px] uppercase tracking-[0.16em] text-white/50">Pomoć oko naloga</span>
        <span className="mt-1 block text-[18px] font-medium">{telefon}</span>
      </span>
    </a>
  );
}
