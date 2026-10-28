"use client";

import { useEffect, useId, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog } from "radix-ui";
import { Banknote, Check, ChevronDown, Layers, LayoutGrid, Loader2, Palette, Percent, RotateCcw, Ruler, Search, ShieldCheck, SlidersHorizontal, Tag, Users, X, type LucideIcon } from "lucide-react";
import { brojFiltera, filteriUUrl, ODELJCI_LISTE, POL_LABEL, PRAZNI, rsd, type Facete, type Filteri, type Opcija, type Sort } from "@/lib/filteri";
import { nijansa } from "../proizvod/Varijante";
import Cena from "./Cena";
import Sortiranje from "./Sortiranje";
import Razdvajac from "../Razdvajac";

/*
  Okvir liste sa filterima (po uzoru na KatalogOkvir sa klikdogume): levo panel (desktop), na telefonu dugme „Filteri" + fioka
  odozdo sa istim panelom i dugmetom „Prikaži N proizvoda"; iznad liste čipovi izabranih filtera sa ×. Svaka promena odmah ide
  u URL (router.replace u tranziciji) pa server vrati novu listu i fasete; do tada je izbor optimističan, a lista prigušena.
  Svaki odeljak je bela kartica: ikona (žuta kad ima izbora), naslov, broj izabranog, sažetak kad je sklopljen, × za taj odeljak.
*/

export type Odeljak = "grupa" | "brend";

const broj = (n: number) => n.toLocaleString("sr-RS");
// 1 proizvod, 21 proizvod; sve ostalo „proizvoda" (2, 5, 11…)
export const proizvoda = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? "proizvod" : "proizvoda");

type Props = {
  facete: Facete | null;
  aktivno: Filteri;
  /** odeljci koje strana zaključava putanjom (grupa na strani grupe) */
  sakrij?: Odeljak[];
  ukupno: number;
  stavki: number;
  strana: number;
  strane: number;
  sort: Sort;
  /** filteri koji za ove artikle ne postoje (lista sa naslovne dok katalog nije uvezen) - kratka napomena iznad panela */
  napomena?: string;
  children: ReactNode;
};

export default function Okvir({ facete, aktivno, sakrij = [], ukupno, stavki, strana, strane, sort, napomena, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [ceka, start] = useTransition();
  const [f, setF] = useOptimistic(aktivno);
  // zaključana grupa ili brend (strana grupe / brenda) se ne broji, ne briše i ne piše u adresu - zadaje ga putanja
  const bezZakljucanih = (x: Filteri): Filteri => ({ ...x, grupa: sakrij.includes("grupa") ? [] : x.grupa, brend: sakrij.includes("brend") ? [] : x.brend });
  const n = brojFiltera(bezZakljucanih(f));
  const [otvoreno, setOtvoreno] = useState(false);

  const primeni = (next: Filteri) =>
    start(() => {
      setF(next);
      const q = filteriUUrl(bezZakljucanih(next), sp);
      router.replace(q.size ? `${pathname}?${q}` : pathname, { scroll: false });
    });
  // zaključana grupa i brend ostaju i kad se brišu svi filteri
  const obrisiSve = () => primeni({ ...PRAZNI, grupa: sakrij.includes("grupa") ? f.grupa : [], brend: sakrij.includes("brend") ? f.brend : [] });

  // plutajuće dugme „Filteri" na telefonu tek kad traka sa dugmetom ode iznad ekrana
  const traka = useRef<HTMLDivElement>(null);
  const [plutaj, setPlutaj] = useState(false);
  useEffect(() => {
    const el = traka.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => setPlutaj(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-80px 0px 0px 0px" });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const brojProizvoda = ukupno > 0 ? `${broj(ukupno)} ${proizvoda(ukupno)}` : "Nema proizvoda za ovaj izbor";
  const panel = facete ? <Panel facete={facete} f={f} sakrij={sakrij} primeni={primeni} /> : <p className="rounded-[4px] bg-surface p-4 text-[13px] text-secondary">Filteri trenutno nisu dostupni.</p>;
  const dugmeObrisi = (klase: string) =>
    n > 0 && (
      <button type="button" onClick={obrisiSve} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-subtle px-3 text-[12.5px] font-medium transition hover:border-primary ${klase}`}>
        <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
        Obriši sve <span className="tabular-nums text-secondary">({n})</span>
      </button>
    );
  const znacka = n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full leading-none bg-brand px-1.5 text-[11px] font-semibold tabular-nums text-on-brand">{n}</span>;

  return (
    <div className="lg:grid lg:grid-cols-[288px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <aside aria-label="Filteri" className="hidden lg:block">
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="h-card">Filteri</h2>
            <p aria-busy={ceka} className="text-[13px] tabular-nums text-secondary transition-opacity aria-busy:opacity-50">{brojProizvoda}</p>
          </div>
          {dugmeObrisi("bg-surface")}
        </div>
        {napomena && <p className="mb-3 rounded-[4px] bg-brand-soft px-4 py-3 text-[12.5px] leading-[18px] text-warning">{napomena}</p>}
        <div className="space-y-2">{panel}</div>
      </aside>

      <div className="min-w-0">
        <div ref={traka} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Dialog.Root open={otvoreno} onOpenChange={setOtvoreno}>
              <Dialog.Trigger asChild>
                <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full bg-primary pl-4 pr-3.5 text-[13px] font-medium text-white transition hover:bg-[#3a3d42] lg:hidden">
                  <SlidersHorizontal className="size-4" strokeWidth={1.8} aria-hidden />
                  Filteri
                  {znacka}
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-primary/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
                <Dialog.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col rounded-t-[16px] bg-page outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom">
                  <div className="shrink-0 rounded-t-[16px] bg-surface px-5 pb-3.5 pt-2.5">
                    <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-subtle" aria-hidden />
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Dialog.Title className="h-card">Filteri</Dialog.Title>
                        <p aria-busy={ceka} className="text-[13px] tabular-nums text-secondary transition-opacity aria-busy:opacity-50">{brojProizvoda}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {dugmeObrisi("bg-page")}
                        <Dialog.Close asChild>
                          <button type="button" aria-label="Zatvori filtere" className="grid size-9 place-items-center rounded-full bg-page transition hover:bg-subtle">
                            <X className="size-4" strokeWidth={2} aria-hidden />
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
                    {napomena && <p className="rounded-[4px] bg-brand-soft px-4 py-3 text-[12.5px] leading-[18px] text-warning">{napomena}</p>}
                    {panel}
                  </div>
                  <div className="shrink-0 border-t border-subtle bg-surface px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                    <Dialog.Close asChild>
                      <button type="button" aria-busy={ceka} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-on-brand transition hover:bg-brand-hover">
                        {ceka && <Loader2 className="size-4 animate-spin" aria-hidden />}
                        {ukupno > 0 ? `Prikaži ${broj(ukupno)} ${proizvoda(ukupno)}` : "Nema proizvoda za ovaj izbor"}
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <p aria-busy={ceka} className="hidden text-[14px] text-secondary transition-opacity aria-busy:opacity-50 sm:block">
              <b className="font-medium text-primary tabular-nums">{broj(ukupno)}</b> {proizvoda(ukupno)}
              {strane > 1 && (
                <>
                  <Razdvajac />
                  strana {strana} od {strane}
                </>
              )}
            </p>
          </div>
          <Sortiranje key={sort} trenutno={sort} />
        </div>

        {/* plutajuće dugme kad se lista skroluje (telefon) */}
        <div className={`pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center transition duration-200 lg:hidden ${plutaj ? "opacity-100" : "translate-y-3 opacity-0"}`} aria-hidden={!plutaj}>
          <button type="button" tabIndex={plutaj ? 0 : -1} onClick={() => setOtvoreno(true)} className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-[14px] font-medium text-on-brand shadow-[0_12px_32px_-8px_rgba(32,33,36,0.6)]">
            <SlidersHorizontal className="size-4" strokeWidth={1.8} aria-hidden />
            Filteri
            {/* žuto dugme (vidi se i preko tamnog footera), pa je značka tamna */}
            {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full leading-none bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-white">{n}</span>}
          </button>
        </div>

        <Cipovi f={f} facete={facete} sakrij={sakrij} primeni={primeni} obrisiSve={obrisiSve} />

        <div aria-busy={ceka} className="transition-opacity duration-200 aria-busy:pointer-events-none aria-busy:opacity-50">
          {stavki > 0 ? (
            children
          ) : (
            <div className="mt-5 rounded-[4px] bg-surface px-6 py-14 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-page">
                <Search className="size-5 text-secondary" strokeWidth={1.8} aria-hidden />
              </span>
              <p className="mt-4 text-[20px] font-medium">{n > 0 ? "Nema proizvoda za ovaj izbor" : strana > 1 ? "Ova strana ne postoji" : "Ništa za prikaz"}</p>
              <p className="p-muted mx-auto mt-2 max-w-[380px]">{n > 0 ? "Skinite neki od filtera ili proširite opseg cene." : strana > 1 ? "Vratite se na prvu stranu." : "U ovoj grupi trenutno nema proizvoda. Pozovite nas - većinu opreme nabavljamo po porudžbini."}</p>
              {n > 0 && (
                <button type="button" onClick={obrisiSve} className="btn-dark mt-6">
                  Obriši filtere
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- čipovi izabranih filtera ---------- */

function Cipovi({ f, facete, sakrij, primeni, obrisiSve }: { f: Filteri; facete: Facete | null; sakrij: Odeljak[]; primeni: (f: Filteri) => void; obrisiSve: () => void }) {
  const stavke: { k: string; label: string; ukloni: () => Filteri }[] = [];
  const izLista = (k: "grupa" | "brend" | "velicina" | "boja" | "standard" | "materijal" | "pol", label: (v: string) => string) => {
    for (const v of f[k]) stavke.push({ k: `${k}:${v}`, label: label(v), ukloni: () => ({ ...f, [k]: f[k].filter((x) => x !== v) }) });
  };
  if (!sakrij.includes("grupa")) izLista("grupa", (v) => facete?.groups.find((g) => g.slug === v)?.name ?? v);
  if (!sakrij.includes("brend")) izLista("brend", (v) => facete?.brands.find((b) => b.slug === v)?.name ?? v);
  izLista("velicina", (v) => `Veličina ${v}`);
  izLista("boja", (v) => v);
  izLista("pol", (v) => POL_LABEL[v] ?? v);
  izLista("standard", (v) => v);
  izLista("materijal", (v) => v);
  if (f.akcija) stavke.push({ k: "akcija", label: "Na akciji", ukloni: () => ({ ...f, akcija: null }) });
  if (f.cenaOd != null || f.cenaDo != null) stavke.push({ k: "cena", label: opisCene(f.cenaOd, f.cenaDo), ukloni: () => ({ ...f, cenaOd: null, cenaDo: null }) });
  if (stavke.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Izabrani filteri">
      {stavke.map((s) => (
        <li key={s.k}>
          <button type="button" onClick={() => primeni(s.ukloni())} className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary pl-3.5 pr-2 text-[13px] font-medium text-white transition hover:bg-[#3a3d42]">
            {s.label}
            <span className="grid size-5 place-items-center rounded-full bg-white/15 transition group-hover:bg-brand group-hover:text-on-brand">
              <X className="size-3" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="sr-only">, ukloni</span>
          </button>
        </li>
      ))}
      {stavke.length > 1 && (
        <li>
          <button type="button" onClick={obrisiSve} className="inline-flex h-9 items-center px-3 text-[13px] font-medium text-secondary underline-offset-2 transition hover:text-primary hover:underline">
            Obriši sve
          </button>
        </li>
      )}
    </ul>
  );
}

const opisCene = (od: number | null, doo: number | null) => (od != null && doo != null ? `${rsd(od)} - ${rsd(doo)}` : od != null ? `od ${rsd(od)}` : `do ${rsd(doo!)}`);

/* ---------- panel ---------- */

/** opcije koje ima smisla nuditi: sa bar jednim artiklom ili već izabrane (da se mogu skinuti) */
function ponuda(opcije: Opcija[], izabrano: string[]) {
  const vidljive = opcije.filter((o) => o.count > 0 || izabrano.includes(o.value));
  for (const v of izabrano) if (!vidljive.some((o) => o.value === v)) vidljive.push({ value: v, label: v, count: 0 });
  return vidljive;
}

const IKONA: Record<(typeof ODELJCI_LISTE)[number]["k"], LucideIcon> = { velicina: Ruler, boja: Palette, pol: Users, standard: ShieldCheck, materijal: Layers };

function Panel({ facete, f, sakrij, primeni }: { facete: Facete; f: Filteri; sakrij: Odeljak[]; primeni: (f: Filteri) => void }) {
  const menjaj = (k: "grupa" | "brend" | "velicina" | "boja" | "standard" | "materijal" | "pol", v: string) =>
    primeni({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const ponisti = (deo: Partial<Filteri>) => () => primeni({ ...f, ...deo });
  const pokazi = (n: number, izabrano: unknown[]) => n >= 2 || izabrano.length > 0;

  const grupe = facete.groups.filter((g) => g.count > 0 || f.grupa.includes(g.slug));
  const brendovi = facete.brands.filter((b) => b.count > 0 || f.brend.includes(b.slug));
  const imaCene = facete.price.max > facete.price.min;

  return (
    <>
      {/* cena je uvek prva, pa ostali filteri */}
      {imaCene && (
        <Sekcija ikona={Banknote} naslov="Cena" aktivno={f.cenaOd != null || f.cenaDo != null ? 1 : 0} sazetak={f.cenaOd != null || f.cenaDo != null ? opisCene(f.cenaOd, f.cenaDo) : ""} onPonisti={ponisti({ cenaOd: null, cenaDo: null })}>
          <Cena min={facete.price.min} max={facete.price.max} donja={f.cenaOd} gornja={f.cenaDo} onPromena={(od, doo) => primeni({ ...f, cenaOd: od, cenaDo: doo })} />
        </Sekcija>
      )}

      {!sakrij.includes("grupa") && pokazi(grupe.length, f.grupa) && (
        <Sekcija ikona={LayoutGrid} naslov="Grupa" aktivno={f.grupa.length} sazetak={f.grupa.map((s) => grupe.find((g) => g.slug === s)?.name ?? s).join(", ")} onPonisti={ponisti({ grupa: [] })}>
          {grupe.map((g) => (
            <Red key={g.slug} checked={f.grupa.includes(g.slug)} onChange={() => menjaj("grupa", g.slug)} count={g.count}>
              {g.name}
            </Red>
          ))}
        </Sekcija>
      )}

      {!sakrij.includes("brend") && pokazi(brendovi.length, f.brend) && (
        <Sekcija ikona={Tag} naslov="Brend" aktivno={f.brend.length} sazetak={f.brend.map((s) => brendovi.find((b) => b.slug === s)?.name ?? s).join(", ")} onPonisti={ponisti({ brend: [] })}>
          <Brendovi brendovi={brendovi} izabrano={f.brend} onToggle={(s) => menjaj("brend", s)} />
        </Sekcija>
      )}


      {ODELJCI_LISTE.map(({ k, faseta, naslov }) => {
        const opc = ponuda(facete[faseta], f[k]);
        if (!pokazi(opc.length, f[k])) return null;
        const labela = (v: string) => (k === "pol" ? (POL_LABEL[v] ?? v) : (opc.find((o) => o.value === v)?.label ?? v));
        return (
          <Sekcija key={k} ikona={IKONA[k]} naslov={naslov} aktivno={f[k].length} sazetak={f[k].map(labela).join(", ")} onPonisti={ponisti({ [k]: [] })} otvoreno={k !== "standard" && k !== "materijal"}>
            {k === "velicina" ? (
              <Plocice opcije={opc} izabrano={f.velicina} onToggle={(v) => menjaj("velicina", v)} />
            ) : k === "boja" ? (
              <Boje opcije={opc} izabrano={f.boja} onToggle={(v) => menjaj("boja", v)} />
            ) : (
              opc.map((o) => (
                <Red key={o.value} checked={f[k].includes(o.value)} onChange={() => menjaj(k, o.value)} count={o.count}>
                  {labela(o.value)}
                </Red>
              ))
            )}
          </Sekcija>
        );
      })}

      {(facete.onPromotion > 0 || f.akcija) && (
        <Sekcija ikona={Percent} naslov="Akcija" aktivno={f.akcija ? 1 : 0} sazetak={f.akcija ? "Na akciji" : ""} onPonisti={ponisti({ akcija: null })}>
          <Red checked={!!f.akcija} onChange={() => primeni({ ...f, akcija: f.akcija ? null : true })} count={facete.onPromotion}>
            Samo proizvodi na akciji
          </Red>
        </Sekcija>
      )}
    </>
  );
}

/* ---------- gradivni delovi ---------- */

function Sekcija({ ikona: I, naslov, otvoreno = true, aktivno = 0, sazetak, onPonisti, children }: { ikona: LucideIcon; naslov: string; otvoreno?: boolean; aktivno?: number; sazetak?: string; onPonisti?: () => void; children: ReactNode }) {
  // odeljak sa izborom je uvek otvoren na početku, ostali po podrazumevanom
  const [open, setOpen] = useState(otvoreno || aktivno > 0);
  const id = useId();
  return (
    <section className="rounded-[4px] bg-surface">
      <div className="flex items-center gap-0.5 pr-2.5">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-3.5 text-left">
          <span className={`grid size-9 shrink-0 place-items-center rounded-[4px] transition-colors ${aktivno > 0 ? "bg-brand text-on-brand" : "bg-page text-primary"}`}>
            <I className="size-4" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium leading-tight">{naslov}</span>
            {!open && sazetak && <span className="mt-0.5 block truncate text-[12px] leading-tight text-secondary">{sazetak}</span>}
          </span>
          {aktivno > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full leading-none bg-primary px-1.5 text-[11px] font-medium tabular-nums text-white">
              {aktivno}
              <span className="sr-only"> izabrano</span>
            </span>
          )}
          <ChevronDown className={`size-4 shrink-0 text-secondary transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.8} aria-hidden />
        </button>
        {aktivno > 0 && onPonisti && (
          <button type="button" onClick={onPonisti} aria-label={`Poništi: ${naslov}`} className="grid size-8 shrink-0 place-items-center rounded-full text-secondary transition hover:bg-page hover:text-primary">
            <X className="size-3.5" strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
      {open && (
        <div id={id} className="px-3.5 pb-3.5">
          {children}
        </div>
      )}
    </section>
  );
}

function Red({ checked, onChange, count, ikona, children }: { checked: boolean; onChange: () => void; count: number; ikona?: ReactNode; children: ReactNode }) {
  return (
    <label className={`group -mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-[4px] px-1.5 py-2 text-[14px] transition-colors hover:bg-page ${checked ? "font-medium" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-[4px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${checked ? "border-primary bg-primary" : "border-[#c4c7cc] bg-surface group-hover:border-input"}`}>
        {checked && <Check className="size-3.5 text-white" strokeWidth={3} />}
      </span>
      {ikona}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11.5px] tabular-nums ${count > 0 ? "bg-page text-secondary" : "text-[#9a9ea5]"}`}>{broj(count)}</span>
    </label>
  );
}

/** veličine kao pločice (S, M, L… ili 38, 39…) - više izbora odjednom */
function Plocice({ opcije, izabrano, onToggle }: { opcije: Opcija[]; izabrano: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {opcije.map((o) => {
        const on = izabrano.includes(o.value);
        return (
          <button key={o.value} type="button" aria-pressed={on} disabled={o.count === 0 && !on} onClick={() => onToggle(o.value)} title={`${o.label}: ${broj(o.count)}`} className={`flex h-12 flex-col items-center justify-center rounded-[4px] border transition-colors disabled:opacity-35 ${on ? "border-primary bg-primary text-white" : "border-subtle bg-surface hover:border-primary"}`}>
            <span className="text-[14px] font-medium leading-none">{o.label}</span>
            <span className={`mt-1 text-[10px] leading-none tabular-nums ${on ? "text-white/60" : "text-secondary"}`}>{broj(o.count)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** boje kao kružići sa nazivom; boja bez poznate nijanse dobija šrafuru */
function Boje({ opcije, izabrano, onToggle }: { opcije: Opcija[]; izabrano: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {opcije.map((o) => {
        const on = izabrano.includes(o.value);
        const hex = nijansa(o.label);
        return (
          <button key={o.value} type="button" aria-pressed={on} onClick={() => onToggle(o.value)} className={`flex items-center gap-2 rounded-[4px] border px-2 py-1.5 text-left text-[13px] transition-colors ${on ? "border-primary bg-page font-medium" : "border-subtle bg-surface hover:border-input"}`}>
            <span className={`grid size-6 shrink-0 place-items-center rounded-full border border-black/10 ${on ? "ring-2 ring-primary ring-offset-1" : ""}`} style={{ background: hex ?? "repeating-linear-gradient(45deg,#e2e4e8 0 3px,#fff 3px 6px)" }}>
              {on && <Check className={`size-3.5 ${hex && ["#ffffff", "#f5c518", "#d8c3a5"].includes(hex) ? "text-primary" : "text-white"}`} strokeWidth={3} aria-hidden />}
            </span>
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            <span className="text-[11px] tabular-nums text-secondary">{broj(o.count)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** brendovi sa logoom; pretraga kad ih je mnogo, izabrani su uvek vidljivi */
const PRVIH = 10;
function Brendovi({ brendovi, izabrano, onToggle }: { brendovi: Facete["brands"]; izabrano: string[]; onToggle: (slug: string) => void }) {
  const [upit, setUpit] = useState("");
  const [sve, setSve] = useState(false);
  const q = upit.trim().toLowerCase();
  const nadjeni = q ? brendovi.filter((b) => b.name.toLowerCase().includes(q)) : brendovi;
  const prikaz = sve || q ? nadjeni : nadjeni.filter((b, i) => izabrano.includes(b.slug) || i < PRVIH);
  const skriveno = nadjeni.length - prikaz.length;
  return (
    <div>
      {brendovi.length > PRVIH && (
        <label className="relative mb-1.5 block">
          <span className="sr-only">Traži brend</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" strokeWidth={1.8} aria-hidden />
          <input type="search" value={upit} onChange={(e) => setUpit(e.target.value)} placeholder="Traži brend" autoComplete="off" className="polje h-10 w-full rounded-[4px] border border-subtle bg-page pl-9 pr-3 text-[16px] outline-none transition placeholder:text-[#9a9ea5] focus:border-primary focus:bg-surface sm:text-[14px]" />
        </label>
      )}
      {prikaz.map((b) => (
        <Red
          key={b.slug}
          checked={izabrano.includes(b.slug)}
          onChange={() => onToggle(b.slug)}
          count={b.count}
          ikona={
            <span className="grid h-6 w-11 shrink-0 place-items-center overflow-hidden rounded-[3px] border border-subtle bg-surface">
              {b.logo ? (
                <span className="relative block h-4 w-9">
                  <Image src={b.logo} alt="" fill sizes="36px" unoptimized={/^https?:/.test(b.logo)} className="object-contain" />
                </span>
              ) : <span className="text-[10px] font-semibold uppercase text-secondary">{b.name.slice(0, 2)}</span>}
            </span>
          }
        >
          {b.name}
        </Red>
      ))}
      {prikaz.length === 0 && <p className="py-2 text-[13px] text-secondary">Nema brenda „{upit.trim()}“ u ponudi.</p>}
      {!q && (skriveno > 0 || sve) && (
        <button type="button" onClick={() => setSve(!sve)} className="mt-1.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-page text-[13px] font-medium transition hover:bg-subtle">
          {sve ? "Prikaži manje" : `Prikaži sve brendove (${brendovi.length})`}
          <ChevronDown className={`size-3.5 transition-transform ${sve ? "rotate-180" : ""}`} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}
