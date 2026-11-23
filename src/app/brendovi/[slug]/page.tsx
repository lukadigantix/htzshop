import type { Metadata } from "next";
import { Suspense } from "react";
import Putanja from "@/components/Putanja";
import { notFound } from "next/navigation";
import ZnakBrenda from "@/components/brendovi/ZnakBrenda";
import OstaliBrendovi from "@/components/brendovi/OstaliBrendovi";
import Lista, { KosturListe } from "@/components/katalog/Lista";
import { getBrend, getBrendovi, type Brend } from "@/lib/brendovi";
import { PORUKA_SERVER } from "@/lib/api";
import { jsonLd, SITE_URL } from "@/lib/seo";

/*
  Strana brenda: ista lista kao /prodavnica, brend je zaključan putanjom (odeljak „Brend" se ne prikazuje). Zaglavlje:
  logo (ili ime kao znak), naziv, opis iz admina (ili podrazumevani), sajt proizvođača i izbor drugog brenda
  (najjači brendovi, pretraga i ceo spisak na klik - components/brendovi/OstaliBrendovi).
  SEO naslov i opis iz admina (Brendovi → SEO) imaju prednost.
*/

const proizvoda = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "proizvod" : "proizvoda");
const podrazumevaniOpis = (b: Brend) =>
  `${b.name} u ponudi HTZ Shop-a${b.count ? `: ${b.count} ${proizvoda(b.count)}` : ""}. Zaštitna i radna oprema sa isporukom širom Srbije, a firmama šaljemo ponudu sa brendiranjem.`;

/**
 * Brendovi poznati u trenutku izgradnje se prave unapred (i zaglavlje tada zna putanju bez čekanja); novi brend iz admina
 * radi i bez toga, crta se na zahtev. Bez backenda pri izgradnji ostaje brend sa najviše proizvoda, da lista ne bude prazna.
 */
export async function generateStaticParams() {
  const sve = await getBrendovi();
  return sve?.length ? sve.map((b) => ({ slug: b.slug })) : [{ slug: "tekton-pro" }];
}

export async function generateMetadata({ params }: PageProps<"/brendovi/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBrend(slug);
  if (!b) return { title: "Brend - HTZ Shop" };
  const opis = b.seoDescription ?? b.opis ?? podrazumevaniOpis(b);
  return {
    title: b.seoTitle ?? `${b.name}: zaštitna i radna oprema - HTZ Shop`,
    description: opis.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/brendovi/${b.slug}/` },
    openGraph: { title: `${b.name} - HTZ Shop`, description: opis.slice(0, 300), ...(b.logo ? { images: [b.logo] } : {}) },
  };
}

// params se čitaju unutar Suspense-a: prelazak na stranu brenda je trenutan (kostur), sadržaj stiže odmah za njim
export default function BrendPage({ params, searchParams }: PageProps<"/brendovi/[slug]">) {
  return (
    <Suspense
      fallback={
        <main>
          <div aria-hidden className="h-[300px] border-b border-subtle bg-surface" />
          <div className="container-site py-8 md:py-10">
            <KosturListe />
          </div>
        </main>
      }
    >
      <Brend params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Brend({ params, searchParams }: PageProps<"/brendovi/[slug]">) {
  const { slug } = await params;
  const [b, svi] = await Promise.all([getBrend(slug), getBrendovi()]);
  if (b === null) notFound();
  if (!b) throw new Error(PORUKA_SERVER);
  const ostali = (svi ?? []).filter((x) => x.slug !== b.slug);
  const opis = b.opis ?? podrazumevaniOpis(b);
  const sajt = b.website ? (/^https?:\/\//.test(b.website) ? b.website : `https://${b.website}`) : null;

  const strukturirano = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: `${SITE_URL}/brendovi/${b.slug}/`,
        name: `${b.name} - HTZ Shop`,
        description: opis,
        inLanguage: "sr",
        about: { "@type": "Brand", name: b.name, ...(sajt ? { url: sajt } : {}), ...(b.logo ? { logo: b.logo.startsWith("http") ? b.logo : `${SITE_URL}${b.logo}` } : {}) },
        isPartOf: { "@id": `${SITE_URL}/#firma` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Početna", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Brendovi", item: `${SITE_URL}/brendovi/` },
          { "@type": "ListItem", position: 3, name: b.name, item: `${SITE_URL}/brendovi/${b.slug}/` },
        ],
      },
    ],
  };

  return (
    <main>
      <Putanja stavke={[{ label: "Brendovi", href: "/brendovi/" }, { label: b.name }]} />
      <section className="border-b border-subtle bg-surface">
        <div className="container-site pb-8 pt-8 md:pb-10 md:pt-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            <div className="relative grid h-36 w-full shrink-0 place-items-center overflow-hidden rounded-[6px] bg-page ring-1 ring-subtle md:h-44 md:w-72">
              <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_10px,var(--text-primary)_10px_20px)]" />
              <ZnakBrenda b={b} velicina="veliki" />
            </div>
            <div className="min-w-0">
              <p className="kicker">Brend</p>
              <h1 className="h-section mt-3">{b.name}</h1>
              <p className="p-muted mt-3 max-w-[680px] text-[15px] md:text-[16px] md:leading-[26px]">{opis}</p>
              {sajt && (
                <a href={sajt} target="_blank" rel="noopener noreferrer" className="link-arrow mt-4">
                  Sajt proizvođača <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </div>

          {ostali.length > 0 && <OstaliBrendovi trenutni={{ slug: b.slug, name: b.name }} brendovi={ostali.map((x) => ({ slug: x.slug, name: x.name, count: x.count }))} />}
        </div>
      </section>

      <div className="container-site py-8 md:py-10">
        <Suspense fallback={<KosturListe />}>
          <Lista searchParams={searchParams} brend={b.slug} />
        </Suspense>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(strukturirano) }} />
    </main>
  );
}
