import { NextResponse, type NextRequest } from "next/server";
import { SESIJA } from "@/lib/nalog-deo";

/*
  Brza provera pre strana naloga: bez kolačića sesije kupac odmah ide na prijavu, sa adresom na koju se vraća.
  Pravu proveru tokena radi strana (GET /auth/me); istekao token vodi na /api/nalog/istekao, koji briše kolačiće.
*/
export function proxy(req: NextRequest) {
  if (req.cookies.has(SESIJA)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/prijava/";
  url.search = `?nazad=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: "/moj-nalog/:path*" };
