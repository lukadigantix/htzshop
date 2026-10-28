import type { Metadata } from "next";
import Link from "next/link";
import FormaReklamacija, { type PorudzbinaZaIzbor } from "@/components/nalog/FormaReklamacija";
import { KARTICA, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { PORUKA_SERVER } from "@/lib/api";
import { rsd } from "@/lib/filteri";
import { getMojePorudzbine, getMojeReklamacije, zahtevajKorisnika } from "@/lib/nalog";
import { datum } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";

export const metadata: Metadata = { title: "Nova reklamacija - HTZ Shop", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Porudžbine u roku koje još nemaju reklamaciju; ?porudzbina=<id> je unapred izabrana (dugme sa strane porudžbine). */
export default async function NovaReklamacijaPage({ searchParams }: Props) {
  await zahtevajKorisnika("/moj-nalog/reklamacije/nova/");
  const sp = await searchParams;
  const izabrana = Array.isArray(sp.porudzbina) ? sp.porudzbina[0] : sp.porudzbina;
  const [porudzbine, reklamacije, s] = await Promise.all([getMojePorudzbine(), getMojeReklamacije(), getSajt()]);
  if (!porudzbine || !reklamacije) throw new Error(PORUKA_SERVER);
  const moguce: PorudzbinaZaIzbor[] = porudzbine
    .filter((p) => p.canComplain && p.status !== "odustao")
    .map((p) => ({ id: p.id, orderNumber: p.orderNumber, datum: datum(p.createdAt), iznos: rsd(p.totalAmount) }));
  const postojeca = izabrana ? reklamacije.find((r) => r.orderId === izabrana) : undefined;

  return (
    <StranaNaloga naslov="Nova reklamacija" uvod="Opišite šta nije u redu. Javljamo se u najkraćem roku, odgovor stiže i na e-mail." nazad={{ label: "Reklamacije", href: "/moj-nalog/reklamacije/" }}>
      {postojeca ? (
        <p className={`${KARTICA} text-[15px]`}>
          Za ovu porudžbinu već postoji reklamacija.{" "}
          <Link href={`/moj-nalog/reklamacije/${postojeca.id}/`} className="font-medium underline underline-offset-2">
            Pogledajte je
          </Link>
          .
        </p>
      ) : moguce.length === 0 ? (
        <p className={`${KARTICA} text-[15px] leading-[24px]`}>
          Trenutno nema porudžbine koja može da se reklamira: rok je 14 dana od porudžbine, jedna reklamacija po porudžbini. Za starije porudžbine pozovite{" "}
          <a href={s.phoneHref} className="font-medium underline underline-offset-2">
            {s.phone}
          </a>{" "}
          ili pogledajte stranu{" "}
          <Link href="/reklamacija-proizvoda/" className="font-medium underline underline-offset-2">
            Reklamacija proizvoda
          </Link>
          .
        </p>
      ) : (
        <div className={`${KARTICA} max-w-[720px]`}>
          <FormaReklamacija porudzbine={moguce} izabrana={moguce.some((p) => p.id === izabrana) ? izabrana : undefined} />
        </div>
      )}
    </StranaNaloga>
  );
}
