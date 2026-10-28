import type { Metadata } from "next";
import Adrese from "@/components/nalog/Adrese";
import { StranaNaloga } from "@/components/nalog/NalogOkvir";
import { PORUKA_SERVER } from "@/lib/api";
import { getAdrese, zahtevajKorisnika } from "@/lib/nalog";

export const metadata: Metadata = { title: "Adrese za dostavu - HTZ Shop", robots: { index: false } };

/** GET /addresses (najviše tri): dodavanje, izmena, brisanje, glavna. Naplata ih nudi kao izbor. */
export default async function AdresePage() {
  const k = await zahtevajKorisnika("/moj-nalog/adrese/");
  const adrese = await getAdrese();
  if (!adrese) throw new Error(PORUKA_SERVER);
  return (
    <StranaNaloga naslov="Adrese za dostavu" uvod="Do tri adrese: firma, magacin, gradilište. Glavna adresa je na naplati već izabrana.">
      <Adrese adrese={adrese} predlog={{ ime: `${k.firstName} ${k.lastName}`.trim(), telefon: k.phone ?? "" }} />
    </StranaNaloga>
  );
}
