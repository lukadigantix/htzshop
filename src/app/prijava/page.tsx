import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PrijavaOkvir from "@/components/nalog/PrijavaOkvir";
import { FormaPrijava } from "@/components/nalog/PrijavaForme";
import { getKorisnik } from "@/lib/nalog";
import { sigurnoNazad } from "@/lib/nalog-deo";

export const metadata: Metadata = { title: "Prijava - HTZ Shop", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const prvi = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const PORUKE: Record<string, string> = {
  "nova-lozinka": "Lozinka je promenjena. Prijavite se novom lozinkom.",
  istekla: "Prijava je istekla. Prijavite se ponovo.",
};

/** /prijava/?nazad=/gde-je-bio - posle prijave vraća na tu stranu. Već prijavljen kupac ide pravo tamo. */
export default function PrijavaPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<main className="min-h-[720px] flex-1 bg-primary" />}>
      <Prijava searchParams={searchParams} />
    </Suspense>
  );
}

async function Prijava({ searchParams }: Props) {
  const sp = await searchParams;
  const nazad = prvi(sp.nazad);
  if (await getKorisnik()) redirect(sigurnoNazad(nazad));
  return (
    <PrijavaOkvir kicker="Dobro došli nazad" naslov="Prijavite se" uvod="Upišite e-mail i lozinku i nastavite kupovinu." tab="prijava" nazad={nazad}>
      <FormaPrijava nazad={nazad} poruka={PORUKE[prvi(sp.poruka) ?? ""]} />
    </PrijavaOkvir>
  );
}
