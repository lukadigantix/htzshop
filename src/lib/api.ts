import { cacheLife } from "next/cache";
import type { HeroSlide } from "@/data/site";

// Backend (htz-shop-backend). Server-side poziv, pa adresa nije javna promenljiva.
export const API_URL = (process.env.HTZ_API_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
// Slike iz admina su putanje /uploads/…, servira ih backend sa svoje adrese (bez /api/v1)
const API_ORIGIN = API_URL.replace(/\/api\/v1$/, "");

type ApiSlide = {
  id: string;
  type: "glavni" | "inline" | "brend";
  imageUrl: string;
  imageAlt: string | null;
  imagePosition: string | null;
  label: string | null;
  kicker: string | null;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  // Boja prelaza (#rrggbb) i jačina 0–100 (null = 100)
  fadeColor: string | null;
  fadeOpacity: number | null;
};

// Prelaz odozdo nagore iza teksta, preko cele visine slajdera: skoro puna boja dole (95%), tamno do trećine (85%),
// pa nestaje oko polovine (55% na 45% visine, providno od 60%).
// Admin bira boju (podrazumevano crna) i jačinu (podrazumevano 100%).
function fadeBackground(color: string | null, opacity: number | null): string {
  const hex = (color ?? "#000000").replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const k = (opacity ?? 100) / 100;
  const rgba = (a: number) => `rgba(${r}, ${g}, ${b}, ${+(a * k).toFixed(3)})`;
  return `linear-gradient(to top, ${rgba(0.95)} 0%, ${rgba(0.85)} 30%, ${rgba(0.55)} 45%, ${rgba(0)} 60%)`;
}

export const fileUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`);

// Aktivni slajdovi naslovne (Admin → Podešavanja → Baneri), redom kao u adminu
async function fetchHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("minutes");
  const res = await fetch(`${API_URL}/slider`);
  if (!res.ok) throw new Error(`Slajdovi: HTTP ${res.status}`);
  const { data } = (await res.json()) as { data: ApiSlide[] };
  return data
    .filter((s) => s.type === "glavni" && s.title)
    .map((s) => ({
      key: s.id,
      label: s.label || s.title || "",
      eyebrow: s.kicker ?? "",
      title: s.title ?? "",
      text: s.subtitle ?? "",
      cta: { label: s.buttonText ?? "Pogledaj", href: s.buttonUrl ?? "/" },
      secondary: s.secondaryButtonText && s.secondaryButtonUrl ? { label: s.secondaryButtonText, href: s.secondaryButtonUrl } : undefined,
      image: fileUrl(s.imageUrl),
      imageAlt: s.imageAlt ?? "",
      imagePosition: s.imagePosition ?? undefined,
      fade: fadeBackground(s.fadeColor, s.fadeOpacity),
    }));
}

// Kad backend ne odgovara, naslovna radi bez slajdera (greška se ne kešira, pa sledeći zahtev pokušava ponovo)
export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    return await fetchHeroSlides();
  } catch (err) {
    console.error("Hero slajdovi nisu učitani:", err);
    return [];
  }
}

/**
 * Poziv backenda sa servera, za nalog kupca (po uzoru na klikdogume lib/api.ts): odgovor je `{ success, data }` odnosno
 * `{ success: false, message }`. Token ide u Authorization i nikad u pregledač. `status: 0` = backend ne odgovara.
 * Mrežna greška se ponavlja jednom samo za GET; POST (registracija, slanje koda, porudžbina) se nikad ne šalje dvaput.
 */
export type Odgovor<T> = { ok: true; data: T; status: number } | { ok: false; status: number; message: string };

export const PORUKA_SERVER = "Server trenutno ne odgovara. Pokušajte ponovo za koji trenutak ili nas pozovite.";

export async function pozovi<T = unknown>(
  putanja: string,
  o: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; token?: string | null; timeout?: number } = {},
): Promise<Odgovor<T>> {
  const { method = "GET", body, token, timeout = 10_000 } = o;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const pokusaja = method === "GET" ? 2 : 1;
  for (let i = 0; i < pokusaja; i++) {
    try {
      const r = await fetch(`${API_URL}${putanja}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(timeout),
      });
      const j = (await r.json().catch(() => null)) as { success?: boolean; data?: T; message?: string } | null;
      if (r.ok && j?.success !== false) return { ok: true, data: j?.data as T, status: r.status };
      return { ok: false, status: r.status, message: j?.message || PORUKA_SERVER };
    } catch {
      // mreža ili isteklo vreme - GET još jednom
    }
  }
  return { ok: false, status: 0, message: PORUKA_SERVER };
}
