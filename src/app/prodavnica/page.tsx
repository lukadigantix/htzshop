import type { Metadata } from "next";
import { Suspense } from "react";
import Zaglavlje from "@/components/katalog/Zaglavlje";
import Lista, { KosturListe } from "@/components/katalog/Lista";

export const metadata: Metadata = {
  title: "Prodavnica - HTZ Shop",
  description: "Radna odeća, zaštitna obuća, rukavice i kompletna HTZ oprema. Filtrirajte po grupi, brendu, veličini, standardu i ceni.",
};

/* Prodavnica: sve grupe, filteri levo (fioka na telefonu), kartice i strane. Lista čita URL, pa je u Suspense-u (Cache Components). */
export default function ProdavnicaPage({ searchParams }: PageProps<"/prodavnica">) {
  return (
    <>
      <main>
        <Zaglavlje
          naslov="Sva zaštitna i radna oprema"
          tekst="Odeća, obuća, rukavice i lična zaštita vodećih evropskih brendova. Suzite izbor filterima - po grupi, brendu, veličini ili ceni."
          putanja={[{ label: "Prodavnica" }]}
        />
        <div className="container-site py-8 md:py-10">
          <Suspense fallback={<KosturListe />}>
            <Lista searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
