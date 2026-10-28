import { NextResponse, type NextRequest } from "next/server";
import { PRIJAVLJEN, SESIJA, sigurnoNazad } from "@/lib/nalog-deo";

/**
 * Token je istekao ili ga backend ne prihvata (strana naloga to vidi preko GET /auth/me): brišu se oba kolačića
 * (komponenta strane ne sme da ih menja) i kupac ide na prijavu sa porukom, pa nazad gde je bio.
 */
export function GET(req: NextRequest) {
  const nazad = sigurnoNazad(req.nextUrl.searchParams.get("nazad"));
  const url = req.nextUrl.clone();
  url.pathname = "/prijava/";
  url.search = `?poruka=istekla&nazad=${encodeURIComponent(nazad)}`;
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESIJA);
  res.cookies.delete(PRIJAVLJEN);
  return res;
}
