import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/*
  Adresar D Express-a za kasu (backend /geo/dexpress/*):
    ?vrsta=ulice&q=kneza                  - nazivi ulica; uz &mesto=<TownID> samo ulice tog mesta (može i bez q)
    ?vrsta=mesta&ulica=Kneza Miloša&q=be  - mesta u kojima je ta ulica; bez ulice (?vrsta=mesta&q=ralja) sva mesta
    ?vrsta=pronadji&mesto=Niš&ptt=18000&ulica=… - mesto za sačuvanu adresu upisanu nazivima
  503 kad backend ili šifarnik ne rade - kasa tada prelazi na slobodan unos mesta i poštanskog broja.
*/
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const vrsta = u.get("vrsta");
  const q = (u.get("q") ?? "").trim().slice(0, 60);
  const ulica = (u.get("ulica") ?? "").trim().slice(0, 100);
  const upit = new URLSearchParams();
  let putanja: string;
  if (vrsta === "ulice") {
    const mesto = Number(u.get("mesto")) > 0 ? String(Number(u.get("mesto"))) : "";
    if (q.length < 2 && !mesto) return NextResponse.json({ data: [] });
    putanja = "streets";
    if (q) upit.set("q", q);
    if (mesto) upit.set("townId", mesto);
    upit.set("limit", "12");
  } else if (vrsta === "mesta") {
    if (!ulica && q.length < 2) return NextResponse.json({ data: [] });
    putanja = "towns";
    if (ulica) upit.set("street", ulica);
    if (q) upit.set("q", q);
    upit.set("limit", "40");
  } else if (vrsta === "pronadji") {
    putanja = "resolve";
    upit.set("city", (u.get("mesto") ?? "").slice(0, 100));
    upit.set("zipCode", (u.get("ptt") ?? "").slice(0, 10));
    upit.set("street", ulica);
  } else {
    return NextResponse.json({ greska: "Nepoznat upit" }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_URL}/geo/dexpress/${putanja}?${upit}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json({ greska: "Adresar trenutno ne radi." }, { status: 503 });
    const { data } = (await res.json()) as { data: unknown };
    return NextResponse.json({ data }, { headers: { "Cache-Control": "private, max-age=600" } });
  } catch {
    return NextResponse.json({ greska: "Adresar trenutno ne radi." }, { status: 503 });
  }
}
