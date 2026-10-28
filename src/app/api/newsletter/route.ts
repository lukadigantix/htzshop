import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/** Prijava na newsletter iz footera → backend POST /newsletter/subscribe. IP kupca se prosleđuje zbog ograničenja broja prijava. */
export async function POST(req: Request) {
  const body = await req.text();
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  try {
    const r = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    const j = (await r.json().catch(() => null)) as { success?: boolean; alreadySubscribed?: boolean; message?: string } | null;
    return NextResponse.json({ success: r.ok && j?.success !== false, alreadySubscribed: j?.alreadySubscribed ?? false, message: j?.message ?? null }, { status: r.status });
  } catch {
    return NextResponse.json({ success: false, message: "Prijava trenutno ne radi. Pokušajte za koji minut." }, { status: 503 });
  }
}
