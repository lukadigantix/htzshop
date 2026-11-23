import { API_URL } from "@/lib/api";

/*
  PDF predračuna porudžbine (uplata na račun) sa backenda: GET /api/predracun/<UUID porudžbine>, uz ?preuzmi=1 kao prilog.
  UUID kupac ima sa strane potvrde, iz naloga i sa strane „Status porudžbine" (isti pristup kao provera uplate).
*/
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return new Response("Predračun nije pronađen.", { status: 404 });
  const preuzmi = new URL(req.url).searchParams.has("preuzmi");
  try {
    const res = await fetch(`${API_URL}/orders/${id}/predracun${preuzmi ? "?preuzmi=1" : ""}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return new Response(res.status === 404 ? "Predračun nije pronađen." : "Predračun trenutno nije dostupan. Pokušajte ponovo za minut.", { status: res.status === 404 ? 404 : 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    return new Response(res.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": res.headers.get("content-disposition") ?? (preuzmi ? "attachment" : "inline"),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Predračun trenutno nije dostupan. Pokušajte ponovo za minut.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
