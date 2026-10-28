import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PrijavaOkvir from "@/components/nalog/PrijavaOkvir";
import { FormaReset } from "@/components/nalog/PrijavaForme";
import { getKorisnik } from "@/lib/nalog";

export const metadata: Metadata = { title: "Zaboravljena lozinka - HTZ Shop", robots: { index: false } };

export default function ZaboravljenaLozinkaPage() {
  return (
    <Suspense fallback={<main className="min-h-[640px] flex-1 bg-primary" />}>
      <Reset />
    </Suspense>
  );
}

async function Reset() {
  if (await getKorisnik()) redirect("/moj-nalog/");
  return (
    <PrijavaOkvir kicker="Pomoć pri prijavi" naslov="Nova lozinka" uvod="Upišite e-mail, unesite kod koji stigne i izaberite novu lozinku." scena={["Nova lozinka", "u tri koraka."]}>
      <FormaReset />
    </PrijavaOkvir>
  );
}
