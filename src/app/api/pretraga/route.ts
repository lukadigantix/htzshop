import { NextResponse } from "next/server";
import { getPopularnePretrage, pretrazi } from "@/lib/pretraga";

/** Modal pretrage: /api/pretraga?q=cipele → { products, categories, popular } ili { popular } bez upita. 503 kad backend ne odgovara. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ query: "", products: [], categories: [], popular: await getPopularnePretrage() }, { headers: { "Cache-Control": "private, max-age=300" } });
  const r = await pretrazi(q);
  if (!r) return NextResponse.json({ greska: "Pretraga trenutno ne radi." }, { status: 503 });
  if (r.popular.length === 0) r.popular = await getPopularnePretrage();
  return NextResponse.json(r);
}
