import { revalidateTag } from "next/cache";
import { KATALOG } from "@/lib/kes";

/*
  Backend javlja da se katalog promenio (obračun cena, uvoz, izmena u adminu): POST sa zaglavljem x-revalidate-secret.
  Briše se sav keš sa oznakom „katalog" (artikli, filteri, grupe, brendovi, podešavanja sajta), pa sledeći zahtev čita
  sveže podatke. Backend posle ovoga sam otvori najposećenije strane, da ih kupci dobiju već spremne.
*/
export async function POST(req: Request) {
  const tajna = process.env.SHOP_REVALIDATE_SECRET;
  if (!tajna || req.headers.get("x-revalidate-secret") !== tajna) return Response.json({ ok: false }, { status: 401 });
  revalidateTag(KATALOG, { expire: 0 });
  return Response.json({ ok: true });
}
