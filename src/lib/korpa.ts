import { cookies } from "next/headers";
import { API_URL } from "./api";
import { KORPA, KUPON, parsirajKorpu, PRAZAN_OBRACUN, type Obracun, type ObracunUpit, type Stavka } from "./korpa-deo";

/**
 * Korpa na serveru: stavke iz kolačića i obračun sa backenda (POST /cart/quote - trenutna cena, stanje, kupon, dostava;
 * ništa se ne čuva). Kolačić menjaju samo serverske akcije (app/korpa/actions.ts). Nalog kupca na sajtu još ne postoji,
 * pa je korpa uvek „gostujuća"; backend je isti kao na klikdogume, pa se prijava kasnije dodaje bez promene obračuna.
 */
const TRAJANJE = 60 * 60 * 24 * 30;

/** Kolačić korpe nije httpOnly: zaglavlje iz njega čita samo broj komada (u njemu su samo id-jevi i količine). */
export const korpaOpcije = () => ({ sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TRAJANJE });

export async function getKorpa(): Promise<Stavka[]> {
  return parsirajKorpu((await cookies()).get(KORPA)?.value);
}

export async function getKupon(): Promise<string> {
  return (await cookies()).get(KUPON)?.value ?? "";
}

/** Cene korpe sa servera. `null` = API ne odgovara (strana tada kaže da proba ponovo, ne glumi praznu korpu). */
export async function obracunajKorpu(stavke: Stavka[], upit: ObracunUpit = {}): Promise<Obracun | null> {
  if (stavke.length === 0) return PRAZAN_OBRACUN;
  const body: Record<string, unknown> = { items: stavke.map((s) => ({ productId: s.productId, quantity: s.qty })) };
  for (const [k, v] of Object.entries(upit)) if (v) body[k] = v;
  // POST bez nuspojava, sme da se ponovi
  for (let pokusaj = 0; pokusaj < 2; pokusaj++) {
    try {
      const r = await fetch(`${API_URL}/cart/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      const j = (await r.json().catch(() => null)) as { data?: Obracun } | null;
      if (r.ok && j?.data) return j.data;
      if (r.status < 500) return null;
    } catch {
      // mreža - još jedan pokušaj
    }
  }
  return null;
}

export const PORUKA_MREZA = "Server trenutno ne odgovara. Pokušajte ponovo za koji trenutak ili nas pozovite.";
