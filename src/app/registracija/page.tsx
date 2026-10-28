import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PrijavaOkvir from "@/components/nalog/PrijavaOkvir";
import { FormaRegistracija } from "@/components/nalog/PrijavaForme";
import { getKorisnik } from "@/lib/nalog";

export const metadata: Metadata = { title: "Novi nalog - HTZ Shop", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function RegistracijaPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<main className="min-h-[880px] flex-1 bg-primary" />}>
      <Registracija searchParams={searchParams} />
    </Suspense>
  );
}

async function Registracija({ searchParams }: Props) {
  const sp = await searchParams;
  const nazad = Array.isArray(sp.nazad) ? sp.nazad[0] : sp.nazad;
  if (await getKorisnik()) redirect("/moj-nalog/");
  return (
    <PrijavaOkvir kicker="Novi nalog" naslov="Otvorite nalog" uvod="Traje minut i nalog je odmah spreman, bez potvrde mejla." tab="registracija" nazad={nazad} scena={["Otvorite nalog", "za minut."]}>
      <FormaRegistracija nazad={nazad} />
    </PrijavaOkvir>
  );
}
