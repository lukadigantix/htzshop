import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Zaglavlje from "@/components/katalog/Zaglavlje";
import Lista, { KosturListe } from "@/components/katalog/Lista";
import { categoryHref } from "@/data/site";
import { getGrupa } from "@/lib/katalog";
import { getOdeljci } from "@/lib/grupe";

/* Strana grupe: ista lista kao /prodavnica, grupa je zaključana putanjom (odeljak „Grupa" se ne prikazuje).
   Glavne grupe i podgrupe su iz admina (lib/grupe.ts, npr. /kategorija-proizvoda/zastitne-naocare). */

// glavna grupa ili podgrupa; putanja vodi kroz nadređenu grupu, a pilula glavne grupe je označena
async function nadjiGrupu(slug: string) {
  const odeljci = await getOdeljci();
  const c = odeljci.find((x) => x.slug === slug);
  if (c) return { slug: c.slug, name: c.name, subs: c.subs.map((s) => s.name), parent: null, aktivna: c.slug };
  const g = await getGrupa(slug);
  if (!g) return null;
  return { ...g, aktivna: odeljci.some((x) => x.slug === g.parent?.slug) ? g.parent!.slug : undefined };
}

export async function generateStaticParams() {
  return (await getOdeljci()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategorija-proizvoda/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await nadjiGrupu(slug);
  return c ? { title: `${c.name} - HTZ Shop`, description: `${c.name} u ponudi HTZ Shop-a. Filtrirajte po brendu, veličini, standardu i ceni.` } : {};
}

// params se čitaju unutar Suspense-a: prelazak na stranu grupe je trenutan (kostur liste), sadržaj stiže odmah za njim
export default function GrupaPage({ params, searchParams }: PageProps<"/kategorija-proizvoda/[slug]">) {
  return (
    <Suspense
      fallback={
        <main className="container-site py-8 md:py-10">
          <KosturListe />
        </main>
      }
    >
      <Grupa params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Grupa({ params, searchParams }: PageProps<"/kategorija-proizvoda/[slug]">) {
  const { slug } = await params;
  const c = await nadjiGrupu(slug);
  if (!c) notFound();

  return (
    <>
      <main>
        <Zaglavlje
          naslov={c.name}
          tekst={c.subs.length ? `${c.subs.join(", ")}. Suzite izbor filterima po brendu, veličini ili ceni.` : "Suzite izbor filterima po brendu, veličini, standardu ili ceni."}
          putanja={[
            { label: "Prodavnica", href: "/prodavnica/" },
            ...(c.parent ? [{ label: c.parent.name, href: categoryHref(c.parent.slug) }] : []),
            { label: c.name },
          ]}
          aktivna={c.aktivna}
        />
        <div className="container-site py-8 md:py-10">
          <Suspense fallback={<KosturListe />}>
            <Lista searchParams={searchParams} grupa={c.slug} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
