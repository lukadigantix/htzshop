import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Zaglavlje from "@/components/katalog/Zaglavlje";
import Lista, { KosturListe } from "@/components/katalog/Lista";
import { categories } from "@/data/site";

/* Strana grupe: ista lista kao /prodavnica, grupa je zaključana putanjom (odeljak „Grupa" se ne prikazuje). */

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kategorija-proizvoda/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = categories.find((x) => x.slug === slug);
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
  const c = categories.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <>
      <main>
        <Zaglavlje
          naslov={c.name}
          tekst={c.subs.length ? `${c.subs.map((s) => s.name).join(", ")}. Suzite izbor filterima po brendu, veličini ili ceni.` : "Suzite izbor filterima po brendu, veličini, standardu ili ceni."}
          putanja={[{ label: "Prodavnica", href: "/prodavnica/" }, { label: c.name }]}
          aktivna={c.slug}
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
