import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Mreza from "@/components/brendovi/Mreza";
import { STIT } from "@/components/logoPutanje";
import Razdvajac from "@/components/Razdvajac";
import { ArrowRight, Phone } from "@/components/Icons";
import { getBrendovi } from "@/lib/brendovi";
import { getSajt } from "@/lib/sajt";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Brendovi (link u gornjoj traci, footeru i na naslovnoj). Spisak je sa backenda: GET /brands/active + broj proizvoda iz
  GET /filters; svaka pločica vodi na stranu brenda (/brendovi/[slug]) sa celim katalogom tog brenda.
  1. Tamni uvod sa brojem brendova i proizvoda.
  2. Mreža brendova (pretraga kad ih ima više od 12).
  3. Traka „Tražite određeni brend?" sa telefonom i upitom.
  JSON-LD: CollectionPage sa listom brendova i putanja.
*/

const OPIS = "Brendovi zaštitne i radne opreme u ponudi HTZ Shop-a: radna odeća, zaštitna obuća, rukavice i lična zaštitna oprema proverenih proizvođača, sa isporukom širom Srbije.";

export const metadata: Metadata = {
  title: "Brendovi zaštitne i radne opreme - HTZ Shop",
  description: OPIS,
  alternates: { canonical: `${SITE_URL}/brendovi/` },
  openGraph: { title: "Brendovi - HTZ Shop", description: OPIS },
};

export default async function BrendoviPage() {
  const [brendovi, s] = await Promise.all([getBrendovi(), getSajt()]);
  const lista = brendovi ?? [];
  const ukupno = lista.reduce((a, b) => a + b.count, 0);

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/brendovi/#strana`,
        url: `${SITE_URL}/brendovi/`,
        name: "Brendovi - HTZ Shop",
        description: OPIS,
        inLanguage: "sr",
        isPartOf: { "@id": `${SITE_URL}/#firma` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: lista.length,
          itemListElement: lista.map((b, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/brendovi/${b.slug}/`, item: { "@type": "Brand", name: b.name, ...(b.logo ? { logo: b.logo.startsWith("http") ? b.logo : `${SITE_URL}${b.logo}` } : {}) } })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Brendovi", item: `${SITE_URL}/brendovi/` },
        ],
      },
    ],
  };

  return (
    <main>
      {/* 1. uvod */}
      <section className="relative overflow-hidden bg-primary text-white">
        <Image src="/images/photo/slide-zastita.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-[0.18] grayscale" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[560px] rounded-full bg-brand/15 blur-[120px]" />
        <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -bottom-32 right-[-80px] hidden h-[560px] w-auto text-white/[0.04] lg:block xl:right-16">
          <path fill="currentColor" fillRule="evenodd" d={STIT} />
        </svg>

        <div className="container-site relative pb-12 pt-10 md:pb-16 md:pt-14 xl:pb-20">
          <nav aria-label="Putanja" className="text-[13px] text-white/50">
            <Link href="/" className="hover:text-white">
              Početna
            </Link>
            <Razdvajac />
            <span className="text-white/80">Brendovi</span>
          </nav>
          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="hero-in max-w-[860px]">
              <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">Brendovi</p>
              <h1 className="mt-5 text-[42px] font-medium leading-[1.03] tracking-[-0.03em] md:text-[64px] xl:text-[80px]">
                Proverena oprema, <span className="text-brand">poznati proizvođači.</span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[16px] leading-[27px] text-white/70 md:text-[17px] md:leading-[28px]">{OPIS}</p>
            </div>
            {lista.length > 0 && (
              <dl className="flex gap-px overflow-hidden rounded-[6px] bg-white/10">
                <div className="flex flex-col-reverse bg-primary/90 px-6 py-5 backdrop-blur md:px-8 md:py-6">
                  <dt className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/55">brendova</dt>
                  <dd className="text-[40px] font-medium leading-none tracking-[-0.04em] text-brand tabular-nums md:text-[52px]">{lista.length}</dd>
                </div>
                {ukupno > 0 && (
                  <div className="flex flex-col-reverse bg-primary/90 px-6 py-5 backdrop-blur md:px-8 md:py-6">
                    <dt className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/55">proizvoda</dt>
                    <dd className="text-[40px] font-medium leading-none tracking-[-0.04em] tabular-nums md:text-[52px]">{ukupno}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
        <div aria-hidden className="h-2.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_16px,var(--text-primary)_16px_32px)]" />
      </section>

      {/* 2. brendovi */}
      <section className="container-site py-12 md:py-16 xl:py-20">
        {brendovi === null ? (
          <p className="rounded-[6px] bg-surface p-10 text-center text-[15px] text-secondary">
            Spisak brendova se trenutno ne učitava. Pogledajte{" "}
            <Link href="/prodavnica/" className="font-medium text-primary underline underline-offset-2">
              prodavnicu
            </Link>{" "}
            ili pokušajte ponovo za koji trenutak.
          </p>
        ) : (
          <Mreza brendovi={lista} />
        )}
      </section>

      {/* 3. tražite određeni brend */}
      <section className="container-site pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[6px] bg-primary p-6 text-white md:p-10 xl:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[340px] rounded-full bg-brand/15 blur-[90px]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[620px]">
              <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Ne vidite brend koji tražite?</p>
              <p className="mt-3 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[36px]">Pitajte nas za određeni brend ili model.</p>
              <p className="mt-3 text-[15px] leading-[24px] text-white/60">Za firme pripremamo ponudu po spisku, sa veličinama, brendiranjem i rokom isporuke.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/kontakt/#ponuda" className="btn-primary" style={{ height: 52, padding: "0 28px", fontSize: 15 }}>
                Pošaljite upit <ArrowRight width={15} height={15} strokeWidth={1.8} />
              </Link>
              <a href={s.phoneHref} className="inline-flex h-[52px] items-center gap-2 rounded-full border border-white/25 px-6 text-[15px] font-medium transition hover:border-brand hover:text-brand">
                <Phone width={16} height={16} strokeWidth={1.8} /> {s.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
