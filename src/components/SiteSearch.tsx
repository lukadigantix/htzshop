"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import type { PogodakGrupa, PogodakProizvod } from "@/lib/pretraga";
import { categoryHref } from "@/data/site";
import Razdvajac from "./Razdvajac";

/*
  Modal pretrage preuzet 1:1 sa klikdogume (components/site/site-search.tsx): cmdk lista u Radix dijalogu,
  traka za kucanje i ispod nje panel sa predlozima. Razlike: boje su HTZ-ove (#202124 umesto teget),
  sadržaj je HTZ oprema umesto guma (nema prečice za dimenziju).
*/

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Pilule kategorija i brendova: zaglavlje ih prosleđuje. */
type Kat = { name: string; slug: string };
type Brend = Kat & { logo?: string | null };

/** naslov grupe u listi (cmdk sam crta element, pa ga stilizujemo selektorom) */
const NASLOV =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[#a1a1a6]";
/** grupa čije stavke idu kao pilule u redove koji se prelamaju (popularno, kategorije) */
const PILULE = "[&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-wrap [&_[cmdk-group-items]]:gap-2 [&_[cmdk-group-items]]:px-3 [&_[cmdk-group-items]]:pb-1";
/** jedna pilula - izabrana strelicama dobija tamnu podlogu, isto kao na hover */
const PILULA =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-primary ring-1 ring-black/8 transition-colors data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:ring-primary";

/** Rezerva za „Popularne pretrage" dok GET /search/popular ne vrati ništa (nov sajt bez istorije) ili kad API ne radi. */
const POPULARNO = ["Rukavice", "Šlem", "Antifon", "Bluza", "Pantalone", "Maska za zavarivanje"];

const SENKA = "shadow-[0_24px_60px_-20px_rgba(32,33,36,.5)]";
const cena = new Intl.NumberFormat("sr-RS");

/** Pločica uz brend u rezultatima: logo, inače prvo slovo imena. */
function BrendLogo({ brend }: { brend: Brend }) {
  return (
    <span className="relative flex h-9 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white px-1.5 ring-1 ring-black/6">
      {brend.logo ? (
        <Image src={brend.logo} alt="" width={52} height={28} className="h-7 w-auto object-contain" />
      ) : (
        <span className="text-[13px] font-semibold uppercase text-primary">{brend.name.slice(0, 1)}</span>
      )}
    </span>
  );
}

/**
 * Modal postoji samo jednom, u zaglavlju. Ostali (npr. mobilni meni) ga otvaraju ovim događajem -
 * da se ne ugasi zajedno sa komponentom iz koje je pozvan.
 */
const OTVORI = "htz-pretraga";
export const otvoriPretragu = () => window.dispatchEvent(new Event(OTVORI));

/** Dugme-pilula za mobilni meni: zatvori meni pa otvori pretragu u zaglavlju. */
export function SearchPill({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        otvoriPretragu();
      }}
      className={cn("flex w-full items-center gap-3 rounded-2xl bg-[#f2f2f5] px-4 py-3.5 text-[14px] font-medium text-[#86868b] transition-colors hover:bg-[#e9e9ee]", className)}
    >
      <Search className="size-4.5 shrink-0 text-primary" strokeWidth={2.25} aria-hidden />
      <span className="sr-only">Pretraži opremu, </span>npr. rukavice, šlem, 3M
    </button>
  );
}

/**
 * Modal pretrage: kucanje → posle 250 ms `/api/pretraga?q=` (backend GET /search: artikli + grupe; backend loguje upit za popularne).
 * „Popularne pretrage" sa servera (GET /search/popular) uz rezervu. Enter → /pretraga/?q=.
 */
export function SiteSearch({ className, kategorije = [], brendovi = [] }: { className?: string; kategorije?: Kat[]; brendovi?: Brend[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rez, setRez] = useState<{ za: string; products: PogodakProizvod[]; categories: PogodakGrupa[]; rezerva: boolean }>({ za: "", products: [], categories: [], rezerva: false });
  const [popularno, setPopularno] = useState<string[]>(POPULARNO);
  const [trazim, setTrazim] = useState(false);
  const zahtev = useRef(0);
  const router = useRouter();

  // popularni pojmovi jednom po otvaranju; dok ih server ima malo, dopunjuju se rezervom do šest
  useEffect(() => {
    if (!open) return;
    fetch("/api/pretraga")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { popular?: string[] } | null) => {
        if (!j?.popular?.length) return;
        const sa = new Set(j.popular.map((s) => s.toLowerCase()));
        setPopularno([...j.popular, ...POPULARNO.filter((s) => !sa.has(s.toLowerCase()))].slice(0, 6));
      })
      .catch(() => {});
  }, [open]);

  // pretraga sa pauzom; stariji odgovor ne sme da pregazi noviji
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) return; // ispod dva znaka se ništa ne traži; stari rezultati se ne crtaju (vidi `aktivan`)
    const id = ++zahtev.current;
    const timer = window.setTimeout(async () => {
      setTrazim(true);
      try {
        const r = await fetch(`/api/pretraga?q=${encodeURIComponent(t)}`);
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { products: PogodakProizvod[]; categories: PogodakGrupa[] };
        if (id === zahtev.current) setRez({ za: t, products: j.products, categories: j.categories, rezerva: false });
      } catch {
        // kažemo da pretraga ne radi (poruka ispod liste)
        if (id === zahtev.current) setRez({ za: t, products: [], categories: [], rezerva: true });
      } finally {
        if (id === zahtev.current) setTrazim(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  const otvori = useCallback(() => setOpen(true), []);

  // ⌘K / Ctrl+K sa bilo kog mesta; „/" samo kad korisnik već ne kuca u polje
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const u = e.target as HTMLElement | null;
      const kuca = u && (u.tagName === "INPUT" || u.tagName === "TEXTAREA" || u.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !kuca)) {
        e.preventDefault();
        otvori();
      }
    };
    const spolja = () => otvori();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OTVORI, spolja);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OTVORI, spolja);
    };
  }, [otvori]);

  const aktivan = q.trim().length >= 2;
  const upit = q.trim().toLowerCase();
  const nadjeno = aktivan ? rez.products : [];
  /** Brendovi i grupe se poklapaju i lokalno, po listama iz zaglavlja - kupac koji ukuca brend mora nekud da stigne. Backendove grupe idu prve. */
  const brendPogoci = useMemo(() => (aktivan ? brendovi.filter((b) => b.name.toLowerCase().includes(upit) || b.slug.includes(upit)).slice(0, 4) : []), [aktivan, upit, brendovi]);
  const grupe = useMemo(() => {
    if (!aktivan) return [];
    const sa = new Set(rez.categories.map((k) => k.slug));
    return [...rez.categories, ...kategorije.filter((k) => k.name.toLowerCase().includes(upit) && !sa.has(k.slug))].slice(0, 6);
  }, [aktivan, upit, rez.categories, kategorije]);
  const sviRezultati = `/pretraga/?q=${encodeURIComponent(q.trim())}`;

  const idi = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <>
      <button type="button" onClick={otvori} aria-label="Pretraga" className={className}>
        <Search className="size-5" strokeWidth={1.6} aria-hidden />
      </button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-primary/55 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 top-[5vh] z-50 mx-auto w-[calc(100%-1.5rem)] max-w-[720px] outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 sm:top-[8vh] sm:w-[calc(100%-2rem)]"
          >
            <DialogPrimitive.Title className="sr-only">Pretraga opreme</DialogPrimitive.Title>
            {/* dve odvojene ploče: traka za kucanje i ispod nje panel sa predlozima */}
            <Command shouldFilter={false} loop className="block">
              <div className={cn("flex items-center gap-3 rounded-[22px] bg-white px-4 py-4 sm:gap-3.5 sm:px-5 sm:py-4.5", SENKA)}>
                <Search className="size-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                <Command.Input
                  value={q}
                  onValueChange={setQ}
                  onKeyDown={(e) => {
                    // Enter bez izabrane stavke (cmdk ne nađe ništa) → svi rezultati
                    if (e.key === "Enter" && q.trim().length >= 2 && nadjeno.length === 0 && brendPogoci.length === 0 && grupe.length === 0) {
                      e.preventDefault();
                      idi(sviRezultati);
                    }
                  }}
                  autoFocus
                  placeholder="npr. rukavice, šlem, 3M"
                  aria-label="Pretraži opremu, grupu ili brend"
                  className="min-w-0 flex-1 bg-transparent text-[16px] text-primary outline-none placeholder:text-[#a1a1a6] sm:text-[17px]"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="Obriši upit"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f2f2f5] text-[#6e6e73] transition-colors hover:bg-[#e6e6eb] hover:text-primary"
                  >
                    <X className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </button>
                ) : (
                  <kbd className="hidden shrink-0 rounded-md bg-[#f2f2f5] px-2 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-[#86868b] sm:block">Esc</kbd>
                )}
              </div>

              <Command.List className={cn("mt-2.5 max-h-[min(66vh,560px)] overflow-y-auto overscroll-contain rounded-[22px] bg-white py-2 [scrollbar-width:thin]", SENKA)}>
                {q.trim() === "" ? (
                  <>
                    {popularno.length > 0 && (
                      <Command.Group heading="Popularne pretrage" className={cn("px-2", NASLOV, PILULE)}>
                        {popularno.map((s) => (
                          <Command.Item key={s} value={s} onSelect={() => setQ(s)} className={PILULA}>
                            <Search className="size-3.5 shrink-0 opacity-45" strokeWidth={2.5} aria-hidden />
                            {s}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    {kategorije.length > 0 && (
                      <Command.Group heading="Kategorije" className={cn("mt-1.5 px-2 pb-1", NASLOV, PILULE)}>
                        {kategorije.map((k) => (
                          <Command.Item key={k.slug} value={`kat-${k.slug}`} onSelect={() => idi(categoryHref(k.slug))} className={PILULA}>
                            {k.name}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    <p className="px-5 pb-2 pt-3 text-[12.5px] leading-relaxed text-secondary">
                      Tražite po nazivu, brendu ili vrsti opreme, na primer <b className="font-semibold text-primary">rukavice</b> ili <b className="font-semibold text-primary">Peltor</b>.
                    </p>
                  </>
                ) : (
                  <>
                    {q.trim().length < 2 ? (
                      <p className="px-5 py-6 text-center text-[14px] text-secondary">Upišite bar dva znaka.</p>
                    ) : trazim && rez.za !== q.trim() ? (
                      <p className="px-5 py-6 text-center text-[14px] text-secondary">Tražim…</p>
                    ) : (
                      <Command.Empty className="px-5 py-8 text-center text-[14px] text-secondary">
                        Nema pogodaka za „{q}“. Probajte vrstu opreme, na primer rukavice ili šlem.
                      </Command.Empty>
                    )}
                    {brendPogoci.length > 0 && (
                      <Command.Group heading="Brendovi" className={cn("px-2", NASLOV)}>
                        {brendPogoci.map((b) => (
                          <Command.Item key={`b-${b.slug}`} value={`brend-${b.slug}`} onSelect={() => idi(`/brend/${b.slug}/`)} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-[14.5px] font-medium text-primary data-[selected=true]:bg-[#f5f5f7]">
                            <BrendLogo brend={b} />
                            <span className="min-w-0 flex-1 truncate">Sva oprema brenda {b.name}</span>
                            <ArrowRight className="size-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.25} aria-hidden />
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                    {grupe.length > 0 && (
                      <Command.Group heading="Grupe" className={cn("px-2", NASLOV)}>
                        {grupe.map((k) => (
                          <Command.Item key={`k-${k.slug}`} value={`grupa-${k.slug}`} onSelect={() => idi(categoryHref(k.slug))} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium text-primary data-[selected=true]:bg-[#f5f5f7]">
                            <ArrowRight className="size-4 shrink-0 text-[#c7c7cc]" strokeWidth={2.25} aria-hidden />
                            {k.name}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                    {nadjeno.length > 0 && (
                      <Command.Group heading={`Proizvodi (${nadjeno.length})`} className={cn("px-2", NASLOV)}>
                        {nadjeno.map((p) => (
                          <Command.Item key={p.slug} value={p.slug} onSelect={() => idi(`/proizvod/${p.slug}/`)} className="flex cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 data-[selected=true]:bg-[#f5f5f7]">
                            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                              {p.image ? (
                                <Image src={p.image} alt="" width={80} height={80} unoptimized={/^https?:/.test(p.image)} className="size-12 object-contain mix-blend-multiply" />
                              ) : (
                                <Search className="size-5 text-[#c7c7cc]" strokeWidth={2} aria-hidden />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[16px] font-semibold leading-tight tracking-tight text-primary">{p.name}</span>
                              {(p.brand || p.group) && (
                                <span className="mt-0.5 block truncate text-[13px] text-secondary">
                                  {[p.brand, p.group].filter(Boolean).map((t, i) => (
                                    <span key={t}>
                                      {i > 0 && <Razdvajac />}
                                      {t}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </span>
                            {p.price != null && (
                              <span className="shrink-0 text-right">
                                <span className="block text-[16px] font-semibold leading-none text-primary">{cena.format(p.price)}</span>
                                <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-secondary">RSD{p.plusPdv ? " + PDV" : ""}</span>
                              </span>
                            )}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                    {aktivan && rez.rezerva && <p className="px-5 pt-2 text-[12px] text-secondary">Pretraga trenutno ne radi. Pokušajte za koji sekund ili izaberite grupu iznad.</p>}
                    {q.trim().length >= 2 && (
                      <div className="mt-1 border-t border-black/6 px-5 py-3">
                        <button type="button" onClick={() => idi(sviRezultati)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary transition-colors hover:text-secondary">
                          Prikaži sve rezultate <ArrowRight className="size-3.5" strokeWidth={2.5} aria-hidden />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </Command.List>

              {/* podsetnik na tastere - stoji preko tamne podloge modala, ne oduzima mesto listi */}
              <div className="mt-3 hidden items-center justify-center gap-5 text-[11.5px] text-white/75 sm:flex">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold">↑ ↓</kbd> kretanje
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold">
                    <CornerDownLeft className="size-3" strokeWidth={2.5} aria-hidden />
                  </kbd>
                  otvori
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold">Esc</kbd> zatvori
                </span>
              </div>
            </Command>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
