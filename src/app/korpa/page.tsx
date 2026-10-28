import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CircleAlert, ShieldCheck, Store, Truck } from "lucide-react";
import Koraci from "@/components/korpa/Koraci";
import Kupon from "@/components/korpa/Kupon";
import Stavke from "@/components/korpa/Stavke";
import { ArrowRight, Phone } from "@/components/Icons";
import { STIT } from "@/components/logoPutanje";
import { categoryHref, contact } from "@/data/site";
import { rsd } from "@/lib/filteri";
import { getKorpa, getKupon, obracunajKorpu, PORUKA_MREZA } from "@/lib/korpa";

/*
  Korpa (po uzoru na klikdogume /korpa): stavke iz kolačića, cene iz POST /cart/quote (trenutna cena, stanje, kupon).
  Dostava i plaćanje se biraju u sledećem koraku (/porudzbina), pa se korpa obračunava kao lično preuzimanje - bez
  cene dostave, da kupac ovde ne vidi poruke o dostavi koju još nije izabrao.
  Levo stavke, desno pregled (kupon, iznosi, PDV, „Nastavi na plaćanje"); prazna korpa vodi u prodavnicu.
*/

export const metadata: Metadata = { title: "Korpa - HTZ Shop", robots: { index: false } };

export default function KorpaPage() {
  return (
    <main className="flex-1">
      <div className="container-site pb-16 pt-8 md:pb-24 md:pt-10">
        <Koraci aktivan={0} />
        <Suspense fallback={<Kostur />}>
          <Korpa />
        </Suspense>
      </div>
    </main>
  );
}

async function Korpa() {
  const [stavke, kupon] = await Promise.all([getKorpa(), getKupon()]);
  const ob = await obracunajKorpu(stavke, { deliveryType: "preuzimanje", couponCode: kupon || undefined });

  if (!ob) {
    return (
      <div className="mt-8 rounded-[6px] bg-surface p-8 text-center">
        <p className="text-[16px]">{PORUKA_MREZA}</p>
        <a href={contact.phoneHref} className="btn-primary mt-6" style={{ height: 48, padding: "0 26px" }}>
          Pozovite {contact.phone}
        </a>
      </div>
    );
  }

  const broj = ob.items.reduce((n, s) => n + s.quantity, 0);
  const nestali = stavke.length - ob.items.length;
  if (ob.items.length === 0) return <Prazna nestali={nestali > 0} />;

  // problemi sa stavkama (stanje); poruke koje backend vezuje za stavku već stoje uz nju (note)
  const problemi = ob.problems.filter((p) => !ob.items.some((s) => s.note && p.includes(s.product.name)));

  return (
    <>
      <h1 className="mt-8 flex items-baseline gap-3 text-[40px] font-semibold leading-none tracking-[-0.03em] md:text-[52px]">
        Korpa
        <span className="text-[16px] font-medium tracking-normal text-secondary md:text-[18px]">{broj} kom</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
        <div className="space-y-5">
          <section aria-label="Stavke u korpi" className="rounded-[6px] bg-surface p-5 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] md:p-8">
            {(problemi.length > 0 || nestali > 0) && (
              <ul className="mb-6 space-y-1.5 rounded-[4px] bg-[#fff4e5] px-4 py-3 text-[14px]">
                {nestali > 0 && (
                  <li className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden />
                    Neki artikli koji su bili u korpi više nisu u ponudi, pa su izostavljeni.
                  </li>
                )}
                {problemi.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            )}
            <Stavke stavke={ob.items} />
          </section>

          <Link href="/prodavnica/" className="link-arrow">
            Nastavite kupovinu <ArrowRight width={14} height={14} strokeWidth={1.8} />
          </Link>

          {/* zašto kupovati ovde - samo činjenice koje važe za svaku porudžbinu */}
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[6px] bg-subtle sm:grid-cols-3">
            {[
              { Icon: Truck, naslov: "Isporuka širom Srbije", opis: "Kurirskom službom na vašu adresu" },
              { Icon: Store, naslov: "Lično preuzimanje", opis: `${contact.address}, Svilajnac` },
              { Icon: ShieldCheck, naslov: "Plaćanje pouzećem", opis: "Ili IPS QR kodom i uplatom na račun" },
            ].map(({ Icon, naslov, opis }) => (
              <li key={naslov} className="flex items-center gap-3.5 bg-surface p-4 md:p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft">
                  <Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{naslov}</span>
                  <span className="block text-[13px] text-secondary">{opis}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside aria-label="Pregled porudžbine" className="overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-40px_rgba(32,33,36,0.45)] lg:sticky lg:top-28">
          <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_12px,var(--text-primary)_12px_24px)]" />
          <div className="p-5 md:p-7">
            <h2 className="text-[20px] font-semibold">Pregled</h2>
            <div className="mt-5">
              <Kupon primenjen={kupon} greskaObracuna={ob.couponError} />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-subtle pt-5 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Artikli ({broj} kom)</dt>
                <dd className="font-medium tabular-nums">{rsd(ob.subtotal)}</dd>
              </div>
              {ob.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-secondary">Popust{ob.coupon ? ` (${ob.coupon.code})` : ""}</dt>
                  <dd className="font-semibold tabular-nums text-success">− {rsd(ob.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Dostava</dt>
                <dd className="text-right text-[14px] text-secondary">bira se u sledećem koraku</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-subtle pt-5">
              <span className="text-[15px] font-semibold">Ukupno</span>
              <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {ob.total.toLocaleString("sr-RS").replace(/,/g, ".")}
                <span className="ml-1 text-[15px] font-semibold tracking-normal text-secondary">RSD</span>
              </span>
            </div>
            {ob.vat && (
              <p className="mt-1.5 text-right text-[12px] text-secondary">
                PDV {ob.vat.rate}% je uračunat: {rsd(ob.vat.amount)}
              </p>
            )}

            {ob.canOrder ? (
              <Link
                href="/porudzbina/"
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand text-[16px] font-semibold text-on-brand shadow-[0_14px_28px_-12px_rgba(245,197,24,0.95)] transition hover:bg-brand-hover"
              >
                Nastavite na plaćanje
                <ArrowRight width={16} height={16} strokeWidth={2} />
              </Link>
            ) : (
              <p className="mt-6 rounded-[4px] bg-page px-4 py-3 text-[14px] text-secondary">Uskladite stavke označene levo, pa nastavite na plaćanje.</p>
            )}

            <a href={contact.phoneHref} className="mt-5 flex items-center gap-3 rounded-[6px] bg-page p-3.5 transition hover:bg-brand-soft">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface">
                <Phone width={17} height={17} strokeWidth={1.6} />
              </span>
              <span>
                <span className="block text-[12px] text-secondary">Pomoć pri porudžbini</span>
                <span className="block text-[16px] font-semibold">{contact.phone}</span>
              </span>
            </a>
            <Link href="/kako-naruciti/" className="mt-3 block text-center text-[13px] text-secondary underline underline-offset-2 hover:text-primary">
              Prvi put naručujete? Pogledajte kako.
            </Link>
          </div>
        </aside>
      </div>

      {/* telefon i tablet: ukupno i „Nastavite" uvek pri dnu ekrana (pregled je ispod stavki) */}
      {ob.canOrder && (
        <>
          <div aria-hidden className="h-20 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-subtle bg-surface/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgba(32,33,36,0.35)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-[720px] items-center gap-4">
              <div className="min-w-0">
                <p className="text-[12px] text-secondary">Ukupno, {broj} kom</p>
                <p className="text-[20px] font-semibold leading-tight tabular-nums">{rsd(ob.total)}</p>
              </div>
              <Link href="/porudzbina/" className="ml-auto flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[15px] font-semibold text-on-brand">
                Nastavite <ArrowRight width={15} height={15} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const GRUPE = [
  { name: "Radna odeća", slug: "zastitna-i-radna-odeca" },
  { name: "Zaštitna obuća", slug: "zastitna-i-radna-obuca" },
  { name: "Rukavice", slug: "zastitne-i-radne-rukavice" },
  { name: "Zaštita glave", slug: "zastita-glave" },
];

function Prazna({ nestali }: { nestali: boolean }) {
  return (
    <section className="mt-8 overflow-hidden rounded-[6px] bg-surface">
      <div className="flex flex-col items-center px-6 py-14 text-center md:py-20">
        <span className="relative grid size-24 place-items-center rounded-full bg-page">
          <svg viewBox="0 0 296 354" className="h-12 w-auto opacity-90" aria-hidden>
            <path fill="var(--brand-primary)" fillRule="evenodd" d={STIT} />
          </svg>
        </span>
        <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">Korpa je prazna</h1>
        <p className="p-muted mt-3 max-w-[460px] text-balance text-[15px] leading-[24px]">
          {nestali ? "Artikli koji su bili u korpi više nisu u ponudi. " : ""}
          Pogledajte radnu odeću, zaštitnu obuću i opremu u prodavnici, ili nas pozovite za savet pri izboru.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/prodavnica/" className="btn-primary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
            Idite u prodavnicu <ArrowRight width={15} height={15} strokeWidth={1.8} />
          </Link>
          <a href={contact.phoneHref} className="btn-secondary" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
            Pozovite {contact.phone}
          </a>
        </div>
      </div>
      <nav aria-label="Najtraženije grupe" className="border-t border-subtle bg-page/60 px-6 py-6">
        <ul className="flex flex-wrap justify-center gap-2">
          {GRUPE.map((g) => (
            <li key={g.slug}>
              <Link href={categoryHref(g.slug)} className="inline-flex h-10 items-center rounded-full border border-subtle bg-surface px-4 text-[14px] font-medium transition hover:border-primary">
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

function Kostur() {
  return (
    <div aria-hidden className="mt-8 animate-pulse">
      <div className="h-12 w-48 rounded-[4px] bg-subtle" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="h-[360px] rounded-[6px] bg-surface" />
        <div className="h-[420px] rounded-[6px] bg-surface" />
      </div>
    </div>
  );
}
