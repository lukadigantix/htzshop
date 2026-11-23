import type { Metadata } from "next";
import { Suspense } from "react";
import Zaglavlje from "@/components/katalog/Zaglavlje";
import Lista, { KosturListe } from "@/components/katalog/Lista";

/*
  Rezultati pretrage (Enter ili „Prikaži sve rezultate" u prozoru pretrage): isti katalog kao prodavnica, sa filterima,
  sortiranjem i stranama, sužen na ?q=. Ne ide u Google (svaki upit bi bila nova strana).
*/
export const metadata: Metadata = { title: "Pretraga - HTZ Shop", robots: { index: false, follow: true } };

export default function PretragaPage({ searchParams }: PageProps<"/pretraga">) {
  return (
    <main>
      <Suspense fallback={<Zaglavlje naslov="Pretraga" tekst="Rezultati pretrage opreme." putanja={[{ label: "Prodavnica", href: "/prodavnica/" }, { label: "Pretraga" }]} />}>
        <Naslov searchParams={searchParams} />
      </Suspense>
      <div className="container-site py-8 md:py-10">
        <Suspense fallback={<KosturListe />}>
          <Lista searchParams={searchParams} pretraga />
        </Suspense>
      </div>
    </main>
  );
}

async function Naslov({ searchParams }: { searchParams: PageProps<"/pretraga">["searchParams"] }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  return (
    <Zaglavlje
      naslov={q ? `Pretraga: „${q}"` : "Pretraga"}
      tekst={q ? "Svi proizvodi koji odgovaraju pretrazi. Suzite izbor filterima - po grupi, brendu, veličini ili ceni." : "Upišite pojam u pretragu (gore desno) - npr. rukavice, šlem ili 3M."}
      putanja={[{ label: "Prodavnica", href: "/prodavnica/" }, { label: "Pretraga" }]}
    />
  );
}
