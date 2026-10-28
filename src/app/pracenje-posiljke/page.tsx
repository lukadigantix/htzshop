import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, Mail, PackageSearch, SearchX, Truck as TruckIcon, UserRound } from "lucide-react";
import { UvodUslova } from "@/components/info/Uslovi";
import FormaPracenja from "@/components/nalog/FormaPracenja";
import { KurirZnacka, PosiljkaPilula } from "@/components/nalog/Status";
import { KARTICA } from "@/components/nalog/stil";
import StanjePosiljke, { SLEDI_POSILJKA } from "@/components/posiljka/StanjePosiljke";
import { ArrowRight, ChevronRight, Phone } from "@/components/Icons";
import { getKorisnik, getMojePorudzbine, getMojePosiljke, pratiJavno } from "@/lib/nalog";
import { KURIR_LABEL, normalizujBroj, POSILJKA_KORACI, prepoznajKurira } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";
import { SITE_URL } from "@/lib/seo";

/*
  Praćenje pošiljke (gornja traka, footer, Status porudžbine, e-mail „Porudžbina je poslata").
  Broj pošiljke ide u adresu (?broj=…), pa se rezultat može podeliti i otvoriti iz e-maila.
  - Prijavljen kupac: pretraga preko rute naloga (radi odmah) i spisak njegovih pošiljki iznad forme.
  - Ostali: javna ruta GET /orders/track?number=… (lib/nalog.ts → pratiJavno), koja se dodaje sa integracijom kurirske
    službe. Dok je nema, ili kad broj nije naš, strana kaže da pošiljka nije pronađena i nudi praćenje na sajtu službe.
  Kurirske službe i njihove strane za praćenje su u KURIRI ispod; nova služba se dodaje tu i u KURIR_LABEL/prepoznajKurira.
*/

const OPIS = "Pratite pošiljku iz HTZ Shop-a: upišite broj pošiljke iz e-maila o slanju i vidite gde je paket, kretanje kod kurira i kada stiže.";

export const metadata: Metadata = {
  title: "Praćenje pošiljke - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/pracenje-posiljke/` },
  openGraph: { title: "Praćenje pošiljke - HTZ Shop", description: OPIS },
};

/** strane za praćenje na sajtovima kurirskih službi (rezerva dok naša provera ne nađe broj) */
const KURIRI: { id: string; naziv: string; url: string; broj: string }[] = [
  { id: "postexpress", naziv: "Post Express", url: "https://www.posta.rs/cir/alati/pracenje-posiljke.aspx", broj: "Npr. PE123456785RS" },
  { id: "bex", naziv: "BEX", url: "https://www.bex.rs/", broj: "Samo cifre, npr. 2611504" },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Prijavljenom kupcu: njegove pošiljke (klik upisuje broj); gostu poziv na nalog. */
async function MojePosiljke() {
  const korisnik = await getKorisnik();
  if (!korisnik) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[6px] bg-primary px-5 py-4 text-white md:px-7">
        <p className="flex items-center gap-3 text-[15px]">
          <UserRound className="size-5 shrink-0 text-brand" strokeWidth={1.7} />
          Poručili ste uz nalog? Pošiljke vidite u nalogu, bez upisivanja broja.
        </p>
        <Link href="/prijava/?nazad=/pracenje-posiljke/" className="btn-primary" style={{ height: 42, padding: "0 20px" }}>
          Prijava <ArrowRight width={14} height={14} strokeWidth={1.8} />
        </Link>
      </div>
    );
  }
  const posiljke = ((await getMojePosiljke()) ?? []).filter((s) => s.number).slice(0, 3);
  return (
    <div className={KARTICA}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">Vaše pošiljke</p>
        <Link href="/moj-nalog/pracenje/" className="link-arrow">
          Sve u nalogu <ArrowRight width={14} height={14} strokeWidth={1.8} />
        </Link>
      </div>
      {posiljke.length ? (
        <ul className="mt-3 divide-y divide-subtle">
          {posiljke.map((s) => (
            <li key={s.id}>
              <Link href={`/pracenje-posiljke/?broj=${encodeURIComponent(s.number!)}`} className="group flex flex-wrap items-center gap-x-3 gap-y-2 py-3.5">
                <KurirZnacka courier={s.courier} label={s.courierLabel} />
                <span className="text-[15px] font-semibold tabular-nums">{s.number}</span>
                <PosiljkaPilula status={s.status} label={s.statusLabel} />
                <span className="text-[13px] text-secondary">{s.orderNumber ? `#${s.orderNumber}` : ""}</span>
                <ChevronRight width={14} height={14} strokeWidth={2} className="ml-auto text-secondary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-secondary">Još nema poslatih pošiljki. Kada pošaljemo porudžbinu, ovde vidite broj i stanje.</p>
      )}
    </div>
  );
}

/** Forma i rezultat za ?broj= */
async function Pracenje({ searchParams }: Props) {
  const sp = await searchParams;
  const broj = normalizujBroj((Array.isArray(sp.broj) ? sp.broj[0] : sp.broj) ?? "").slice(0, 30);
  const [rezultat, porudzbine] = await Promise.all([broj ? pratiJavno(broj) : null, broj ? getMojePorudzbine() : null]);
  const kurir = prepoznajKurira(broj);
  const sajtKurira = KURIRI.filter((k) => !kurir || k.id === kurir);
  const idPorudzbine = rezultat?.ok && rezultat.posiljka.orderNumber ? (porudzbine ?? []).find((p) => p.orderNumber === rezultat.posiljka.orderNumber)?.id : undefined;

  return (
    <>
      <FormaPracenja key={broj} broj={broj} akcija="/pracenje-posiljke/" />
      {rezultat &&
        (rezultat.ok ? (
          <StanjePosiljke s={rezultat.posiljka} porudzbinaId={idPorudzbine} />
        ) : (
          <div role="alert" className={`${KARTICA} mt-4`}>
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page">
                <SearchX className="size-5" strokeWidth={1.7} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold">{rezultat.nema ? "Pošiljka nije pronađena" : "Provera trenutno nije uspela"}</p>
                <p className="mt-1 text-[14px] leading-[21px] text-secondary">{rezultat.poruka}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-subtle pt-4">
              <p className="text-[14px] text-secondary">
                Pošiljku možete pratiti i direktno na sajtu {kurir ? "kurirske službe" : "kurirske službe koja je dostavlja"}:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sajtKurira.map((k) => (
                  <a key={k.id} href={k.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ height: 42, padding: "0 18px" }}>
                    {k.naziv} <ExternalLink className="size-3.5" strokeWidth={1.8} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

export default async function PracenjePosiljkePage({ searchParams }: Props) {
  const s = await getSajt();
  return (
    <main>
      <UvodUslova naziv="Praćenje pošiljke" naslov={<>Gde je moj <span className="text-brand">paket?</span></>} opis={OPIS} />

      <div className="container-site py-10 md:py-14">
        <div className="space-y-4">
          <Suspense fallback={<div aria-hidden className="h-[74px] animate-pulse rounded-[6px] bg-surface" />}>
            <MojePosiljke />
          </Suspense>
          <section aria-label="Pretraga po broju pošiljke">
            <Suspense fallback={<div aria-hidden className={`${KARTICA} h-[150px] animate-pulse`} />}>
              <Pracenje searchParams={searchParams} />
            </Suspense>
          </section>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 md:mt-16 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="statusi" className={KARTICA}>
            <h2 id="statusi" className="text-[20px] font-medium">
              Šta znači koji status
            </h2>
            <ol className="mt-5 space-y-4">
              {POSILJKA_KORACI.map((k, i) => (
                <li key={k.status} className="flex gap-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums ${i === POSILJKA_KORACI.length - 1 ? "bg-success text-white" : "bg-primary text-brand"}`}>
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium">{k.label}</span>
                    <span className="block text-[14px] leading-[22px] text-secondary">{SLEDI_POSILJKA[k.status]}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="space-y-3">
            <section aria-labelledby="broj" className={KARTICA}>
              <h2 id="broj" className="flex items-center gap-2.5 text-[17px] font-medium">
                <Mail className="size-5 text-brand-active" strokeWidth={1.7} /> Gde je broj pošiljke?
              </h2>
              <p className="mt-2 text-[14px] leading-[22px] text-secondary">
                U e-mailu „Porudžbina je poslata“, koji stiže kad paket predamo kurirskoj službi. Pre toga pošiljka nema broj, a stanje porudžbine vidite na strani{" "}
                <Link href="/status-porudzbine/" className="font-medium text-primary underline underline-offset-2">
                  Status porudžbine
                </Link>
                .
              </p>
            </section>
            <section aria-labelledby="sluzbe" className={KARTICA}>
              <h2 id="sluzbe" className="flex items-center gap-2.5 text-[17px] font-medium">
                <TruckIcon className="size-5 text-brand-active" strokeWidth={1.7} /> Kurirske službe
              </h2>
              <ul className="mt-3 divide-y divide-subtle">
                {KURIRI.map((k) => (
                  <li key={k.id}>
                    <a href={k.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 py-3">
                      <KurirZnacka courier={k.id} label={KURIR_LABEL[k.id] ?? k.naziv} />
                      <span className="text-[13px] text-secondary">{k.broj}</span>
                      <ExternalLink className="ml-auto size-4 text-secondary transition group-hover:text-primary" strokeWidth={1.7} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            <a href={s.phoneHref} className={`${KARTICA} flex items-center gap-3 transition hover:ring-1 hover:ring-brand`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-brand">
                <Phone width={17} height={17} strokeWidth={1.7} />
              </span>
              <span>
                <span className="block text-[12px] text-secondary">Paket kasni ili je oštećen?</span>
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
