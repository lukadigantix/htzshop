import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * Kontakt forma → backend POST /contact (poruka ide na adresu iz Admin → Podešavanja → Obaveštenja). IP kupca se prosleđuje zbog ograničenja broja poruka.
 * Sa prilozima (brendiranje: logo, primeri) forma šalje multipart i on se prosleđuje kakav jeste; backend proverava tip i veličinu fajlova.
 */
const MAX_TELO = 16 * 1024 * 1024; // 15 MB priloga + tekst forme

export async function POST(req: Request) {
  const tip = req.headers.get("content-type") ?? "application/json";
  if (Number(req.headers.get("content-length") ?? 0) > MAX_TELO) {
    return NextResponse.json({ success: false, message: "Prilozi zajedno mogu imati najviše 15 MB." }, { status: 413 });
  }
  const multipart = tip.startsWith("multipart/form-data");
  const body = multipart ? await req.formData() : await req.text();
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  try {
    const r = await fetch(`${API_URL}/contact`, {
      method: "POST",
      // za FormData fetch sam postavlja Content-Type sa granicom (boundary)
      headers: { ...(multipart ? {} : { "Content-Type": "application/json" }), ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body,
      signal: AbortSignal.timeout(multipart ? 60_000 : 15_000),
    });
    const j = (await r.json().catch(() => null)) as { success?: boolean; message?: string } | null;
    return NextResponse.json({ success: r.ok && j?.success !== false, message: j?.message ?? null }, { status: r.status });
  } catch {
    return NextResponse.json({ success: false, message: "Slanje trenutno ne radi. Pozovite nas ili pokušajte za koji minut." }, { status: 503 });
  }
}
