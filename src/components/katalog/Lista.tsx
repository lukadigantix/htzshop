import Kartica from "./Kartica";
import Okvir, { type Odeljak } from "./Okvir";
import Paginacija from "./Paginacija";
import { filteriIzUrl, sortIzUrl } from "@/lib/filteri";
import { getKatalog } from "@/lib/katalog";

type Upit = Record<string, string | string[] | undefined>;

/**
 * Lista prodavnice (server): filteri iz URL-a → GET /products + GET /filters → okvir sa filterima, mreža kartica i strane.
 * Koriste je /prodavnica, strana grupe (grupa zaključana putanjom) i strana brenda (brend zaključan putanjom).
 */
export default async function Lista({ searchParams, grupa, brend }: { searchParams: Promise<Upit>; grupa?: string; brend?: string }) {
  const sp = await searchParams;
  const f = filteriIzUrl(sp);
  if (grupa) f.grupa = [grupa];
  if (brend) f.brend = [brend];
  const sort = sortIzUrl(typeof sp.sort === "string" ? sp.sort : undefined);
  const strana = Math.max(1, Number(typeof sp.strana === "string" ? sp.strana : 1) || 1);
  const k = await getKatalog(f, sort, strana);

  const upit = new URLSearchParams();
  for (const [key, v] of Object.entries(sp)) if (typeof v === "string") upit.set(key, v);
  const sakrij: Odeljak[] = [...(grupa ? (["grupa"] as const) : []), ...(brend ? (["brend"] as const) : [])];

  return (
    <Okvir
      facete={k.facete}
      aktivno={f}
      sakrij={sakrij}
      ukupno={k.meta.total}
      stavki={k.items.length}
      strana={k.meta.page}
      strane={k.meta.totalPages}
      sort={sort}
      napomena={k.lokalno ? "Katalog se još uvozi - za sada su ovde izdvojeni proizvodi sa naslovne, pa filteri za veličinu, boju i standard još nisu dostupni." : undefined}
    >
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        {k.items.map((p, i) => (
          <Kartica key={p.slug} p={p} prva={i < 3} />
        ))}
      </div>
      <Paginacija strana={k.meta.page} ukupno={k.meta.totalPages} upit={upit} />
    </Okvir>
  );
}

/** kostur dok lista čeka backend - isti raspored, pa se ništa ne pomera kad podaci stignu */
export function KosturListe() {
  const siva = "animate-pulse rounded-[4px] bg-black/[0.06]";
  return (
    <div className="lg:grid lg:grid-cols-[288px_minmax(0,1fr)] lg:gap-8" aria-busy="true" aria-label="Učitavanje">
      <div className="hidden space-y-2 lg:block">
        <div className={`h-12 ${siva}`} />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 rounded-[4px] bg-surface" />
        ))}
      </div>
      <div>
        <div className="flex justify-between">
          <div className={`h-10 w-40 ${siva}`} />
          <div className={`h-10 w-44 ${siva}`} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[520px] rounded-[4px] bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
