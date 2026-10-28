import { cacheLife } from "next/cache";
import { API_URL } from "./api";
import { KURIR_LABEL } from "./nalog-deo";

/**
 * Uslovi kupovine za informativne strane (Kako naručiti): kurirske službe koje imaju cenovnik (GET /cart/couriers) i rok
 * isporuke za artikle na stanju (GET /delivery-times, Admin → Rokovi isporuke). Prazno kad backend ne odgovara, pa strana
 * piše opšte („kurirskom službom") umesto da izmišlja.
 */
export type UsloviKupovine = { kuriri: string[]; rokNaStanju: string | null };

async function procitaj<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(5_000) });
    if (!r.ok) return null;
    return ((await r.json()) as { data: T }).data;
  } catch {
    return null;
  }
}

export async function getUsloviKupovine(): Promise<UsloviKupovine> {
  "use cache";
  cacheLife("minutes");
  const [kuriri, rokovi] = await Promise.all([procitaj<{ courier: string; label: string }[]>("/cart/couriers"), procitaj<{ inStockText: string | null }>("/delivery-times")]);
  return {
    kuriri: (kuriri ?? []).map((k) => KURIR_LABEL[k.courier] ?? k.label),
    rokNaStanju: rokovi?.inStockText?.trim() || null,
  };
}
