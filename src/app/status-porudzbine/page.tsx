import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Mail, PackageSearch, ShieldCheck, UserRound } from "lucide-react";
import { UvodUslova } from "@/components/info/Uslovi";
import { KARTICA } from "@/components/nalog/stil";
import { StatusPilula } from "@/components/nalog/Status";
import ProveraStatusa from "@/components/status/ProveraStatusa";
import { ArrowRight, Phone } from "@/components/Icons";
import { rsd } from "@/lib/filteri";
import { getKorisnik, getMojePorudzbine } from "@/lib/nalog";
import { datum, SLEDI, STATUS_KORACI, STATUS_LABEL } from "@/lib/nalog-deo";
import { getSajt, type Sajt } from "@/lib/sajt";
import { SITE_URL } from "@/lib/seo";

/*
  Status porudžbine (gornja traka, footer, e-mailovi o porudžbini za kupce bez naloga: ?broj=…).
  - Kupac bez naloga: broj porudžbine + e-mail iz porudžbine → POST /orders/lookup (app/status-porudzbine/actions.ts), prikaz
    kao u nalogu, sa kretanjem pošiljke i IPS uplatom dok ne stigne. Samo broj nije dovoljan: brojevi idu redom.
  - Prijavljen kupac: iznad forme poslednje porudžbine iz naloga, sa linkom na svaku.
  Delovi koji čitaju kolačić i adresu (?broj) su u Suspense-u.
*/

const OPIS = "Proverite status porudžbine iz HTZ Shop-a: da li je primljena, u pripremi, poslata ili isporučena, i gde je pošiljka. Bez naloga, sa brojem porudžbine i e-mailom.";

export const metadata: Metadata = {
  title: "Status porudžbine i praćenje pošiljke - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/status-porudzbine/` },
  openGraph: { title: "Status porudžbine - HTZ Shop", description: OPIS },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Prijavljenom kupcu: poslednje porudžbine iz naloga; ostalima poziv da se prijave. */
async function Nalog() {
  const korisnik = await getKorisnik();
  if (!korisnik) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[6px] bg-primary px-5 py-4 text-white md:px-7">
        <p className="flex items-center gap-3 text-[15px]">
          <UserRound className="size-5 shrink-0 text-brand" strokeWidth={1.7} />
          Imate nalog? Sve porudžbine i praćenje pošiljki vidite u nalogu, bez upisivanja broja.
        </p>
        <Link href="/prijava/?nazad=/moj-nalog/porudzbine/" className="btn-primary" style={{ height: 42, padding: "0 20px" }}>
          Prijava <ArrowRight width={14} height={14} strokeWidth={1.8} />
        </Link>
      </div>
    );
  }
  const porudzbine = (await getMojePorudzbine()) ?? [];
  return (
    <div className={KARTICA}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">Prijavljeni ste kao {korisnik.firstName}</p>
        <Link href="/moj-nalog/porudzbine/" className="link-arrow">
          Sve porudžbine <ArrowRight width={14} height={14} strokeWidth={1.8} />
        </Link>
      </div>
      {porudzbine.length ? (
        <ul className="mt-3 divide-y divide-subtle">
          {porudzbine.slice(0, 3).map((p) => (
            <li key={p.id}>
              <Link href={`/moj-nalog/porudzbine/${p.id}/`} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5 hover:text-brand-active">
                <span className="text-[15px] font-semibold tabular-nums">#{p.orderNumber}</span>
                <span className="text-[14px] text-secondary">{datum(p.createdAt)}</span>
                <span className="text-[14px] font-medium tabular-nums">{rsd(p.totalAmount)}</span>
                <span className="ml-auto">
                  <StatusPilula status={p.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-secondary">U nalogu nema porudžbina. Porudžbinu poslatu bez naloga proverite ispod.</p>
      )}
    </div>
  );
}

async function Provera({ searchParams, s }: Props & { s: Sajt }) {
  const sp = await searchParams;
  const broj = (Array.isArray(sp.broj) ? sp.broj[0] : sp.broj)?.slice(0, 20);
  return <ProveraStatusa radnja={s} broj={broj} />;
}

export default async function StatusPorudzbinePage({ searchParams }: Props) {
  const s = await getSajt();

  return (
    <main>
      <UvodUslova naziv="Status porudžbine" naslov={<>Gde je moja <span className="text-brand">porudžbina?</span></>} opis={OPIS} />

      <div className="container-site py-10 md:py-14">
        <div className="space-y-4 lg:space-y-5">
          <Suspense fallback={<div aria-hidden className="h-[74px] animate-pulse rounded-[6px] bg-surface" />}>
            <Nalog />
          </Suspense>

          <section aria-labelledby="provera">
            <h2 id="provera" className="sr-only">
              Provera statusa
            </h2>
            <Suspense fallback={<div aria-hidden className={`${KARTICA} h-[210px] animate-pulse`} />}>
              <Provera searchParams={searchParams} s={s} />
            </Suspense>
          </section>
        </div>

        {/* šta znače statusi i gde je broj porudžbine */}
        <div className="mt-12 grid grid-cols-1 gap-3 md:mt-16 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="statusi" className={KARTICA}>
            <h2 id="statusi" className="text-[20px] font-medium">
              Šta znači koji status
            </h2>
            <ol className="mt-5 space-y-4">
              {STATUS_KORACI.map((st, i) => (
                <li key={st} className="flex gap-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums ${i === STATUS_KORACI.length - 1 ? "bg-success text-white" : "bg-primary text-brand"}`}>
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium">{STATUS_LABEL[st]}</span>
                    <span className="block text-[14px] leading-[22px] text-secondary">{SLEDI[st]}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-subtle pt-4 text-[14px] leading-[22px] text-secondary">
              O svakoj promeni statusa šaljemo e-mail. Kada je porudžbina poslata, u e-mailu je i broj pošiljke, koji pratite na strani{" "}
              <Link href="/pracenje-posiljke/" className="font-medium text-primary underline underline-offset-2">
                Praćenje pošiljke
              </Link>
              . Kurir vas zove pre dostave.
            </p>
          </section>

          <div className="space-y-3">
            <section aria-labelledby="broj" className={KARTICA}>
              <h2 id="broj" className="flex items-center gap-2.5 text-[17px] font-medium">
                <Mail className="size-5 text-brand-active" strokeWidth={1.7} /> Gde je broj porudžbine?
              </h2>
              <p className="mt-2 text-[14px] leading-[22px] text-secondary">
                U e-mailu „Primili smo vašu porudžbinu“, u naslovu i u tabeli porudžbine (npr. 2026-0012). Dugme „Pogledaj porudžbinu“ u tom e-mailu otvara ovu stranu sa
                upisanim brojem.
              </p>
            </section>
            <section aria-labelledby="zastita" className={KARTICA}>
              <h2 id="zastita" className="flex items-center gap-2.5 text-[17px] font-medium">
                <ShieldCheck className="size-5 text-brand-active" strokeWidth={1.7} /> Zašto i e-mail?
              </h2>
              <p className="mt-2 text-[14px] leading-[22px] text-secondary">Da porudžbinu vidite samo vi. Bez prijave ne prikazujemo telefon ni tačnu adresu isporuke.</p>
            </section>
            <a href={s.phoneHref} className={`${KARTICA} flex items-center gap-3 transition hover:ring-1 hover:ring-brand`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-brand">
                <Phone width={17} height={17} strokeWidth={1.7} />
              </span>
              <span>
                <span className="block text-[12px] text-secondary">Ne možete da nađete porudžbinu?</span>
                <span className="block text-[16px] font-semibold">{s.phone}</span>
              </span>
              <PackageSearch className="ml-auto size-5 text-secondary" strokeWidth={1.6} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
