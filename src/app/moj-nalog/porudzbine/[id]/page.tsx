import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetaljPorudzbine from "@/components/nalog/DetaljPorudzbine";
import { StranaNaloga } from "@/components/nalog/NalogOkvir";
import { PORUKA_SERVER } from "@/lib/api";
import { getMojaPorudzbina, getMojePosiljke, zahtevajKorisnika } from "@/lib/nalog";
import { datum } from "@/lib/nalog-deo";
import { getSajt } from "@/lib/sajt";

export const metadata: Metadata = { title: "Porudžbina - HTZ Shop", robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

/** GET /orders/my-orders/{id}: tok, stavke (link na proizvod), isporuka, plaćanje, pošiljka i reklamacija. Tuđa ili nepostojeća → 404. */
export default async function PorudzbinaPage({ params }: Props) {
  const { id } = await params;
  await zahtevajKorisnika(`/moj-nalog/porudzbine/${id}/`);
  const [p, posiljke, s] = await Promise.all([getMojaPorudzbina(id), getMojePosiljke(), getSajt()]);
  if (p === null) notFound();
  if (!p) throw new Error(PORUKA_SERVER);
  const mojePosiljke = (posiljke ?? []).filter((x) => x.orderNumber === p.orderNumber && x.number);

  return (
    <StranaNaloga kicker={datum(p.createdAt)} naslov={`Porudžbina #${p.orderNumber}`} nazad={{ label: "Moje porudžbine", href: "/moj-nalog/porudzbine/" }}>
      <DetaljPorudzbine p={p} posiljke={mojePosiljke} radnja={s} />
    </StranaNaloga>
  );
}
