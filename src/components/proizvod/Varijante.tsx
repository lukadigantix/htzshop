import Link from "next/link";
import type { Varijanta } from "@/lib/proizvod";

/*
  Birač boje i veličine. Svaka varijanta je poseban artikal sa svojim slug-om, pa su izbori linkovi
  (bez JS-a, rade i sa „nazad" u browseru). Veličine se prikazuju za trenutno izabranu boju.
*/

// Nazivi boja iz admina → nijansa za kružić; nepoznata boja ide kao tekstualna pilula
const BOJE: Record<string, string> = {
  crna: "#1a1a1a",
  bela: "#ffffff",
  siva: "#8a8d91",
  "tamno siva": "#4a4d52",
  plava: "#1f4e9c",
  teget: "#1c2a48",
  "svetlo plava": "#6fa3d8",
  zelena: "#2f7d32",
  "tamno zelena": "#1f4a2a",
  maslinasta: "#6b6b3a",
  crvena: "#b42318",
  bordo: "#6d1a24",
  narandžasta: "#f26b1d",
  žuta: "#f5c518",
  braon: "#6b4a2b",
  bež: "#d8c3a5",
};
export const nijansa = (boja: string): string | undefined => BOJE[boja.trim().toLowerCase()];

const RED = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL"];
const poredak = (s: string) => {
  const i = RED.indexOf(s.toUpperCase());
  if (i >= 0) return i;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? 100 + n : 1000;
};

export default function Varijante({ varijante, size, color }: { varijante: Varijanta[]; size: string | null; color: string | null }) {
  const boje = [...new Set(varijante.map((v) => v.color).filter((c): c is string => Boolean(c)))];
  const uBoji = varijante.filter((v) => !color || !v.color || v.color === color);
  const velicine = uBoji.filter((v) => v.size).sort((a, b) => poredak(a.size!) - poredak(b.size!));

  // za drugu boju: ista veličina ako postoji, inače prva koja je na stanju
  const zaBoju = (c: string) => {
    const sve = varijante.filter((v) => v.color === c);
    return (sve.find((v) => v.size === size) ?? sve.find((v) => v.inStock) ?? sve[0]).slug;
  };

  if (boje.length < 2 && velicine.length < 2) return null;

  return (
    <div className="space-y-6">
      {boje.length > 1 && (
        <div>
          <p className="text-[14px]">
            <span className="text-secondary">Boja:</span> <span className="font-medium">{color}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {boje.map((c) => {
              const hex = nijansa(c);
              const izabrana = c === color;
              return hex ? (
                <Link
                  key={c}
                  href={`/proizvod/${zaBoju(c)}/`}
                  scroll={false}
                  title={c}
                  aria-label={`Boja ${c}`}
                  aria-current={izabrana}
                  className={`grid size-10 place-items-center rounded-full ring-1 ring-offset-2 transition ${izabrana ? "ring-primary" : "ring-transparent hover:ring-subtle"}`}
                >
                  <span className="size-8 rounded-full border border-black/10" style={{ background: hex }} />
                </Link>
              ) : (
                <Link
                  key={c}
                  href={`/proizvod/${zaBoju(c)}/`}
                  scroll={false}
                  aria-current={izabrana}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-[14px] transition ${izabrana ? "border-primary bg-primary text-white" : "border-subtle bg-surface hover:border-primary"}`}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {velicine.length > 1 && (
        <div>
          <p className="text-[14px]">
            <span className="text-secondary">Veličina:</span> <span className="font-medium">{size ?? "izaberite"}</span>
          </p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2">
            {velicine.map((v) => {
              const izabrana = v.size === size;
              return (
                <Link
                  key={`${v.slug}-${v.size}`}
                  href={`/proizvod/${v.slug}/`}
                  scroll={false}
                  aria-current={izabrana}
                  title={v.inStock ? undefined : "Trenutno nema na stanju"}
                  className={`flex h-11 items-center justify-center rounded-[4px] border text-[14px] font-medium transition ${
                    izabrana
                      ? "border-primary bg-primary text-white"
                      : v.inStock
                        ? "border-subtle bg-surface hover:border-primary"
                        : "border-subtle bg-page text-secondary line-through decoration-1 hover:border-input"
                  }`}
                >
                  {v.size}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
