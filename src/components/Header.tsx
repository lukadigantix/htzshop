"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MegaMenu } from "@/data/site";
import type { Odeljak } from "@/lib/grupe";
import type { Brend as BrendPretrage } from "./SiteSearch";
import { DOGADJAJ_KORPA, komadaUKolacicu } from "@/lib/korpa-deo";
import { prijavljenIzKolacica } from "@/lib/nalog-deo";
import Logo from "./Logo";
import { SearchPill, SiteSearch } from "./SiteSearch";
import { Cart, ChevronDown, ChevronRight, Close, User } from "./Icons";

/*
  Header po uzoru na pitbike.vercel.app: 80 px, sticky, bela površina.
  Desktop (od 1280 px): meni levo, logo u sredini, desno pilula + ikone; mega-meni na klik: levo grupe (prelaz mišem bira grupu) i tamna kartica (brendiranje / pomoć / ponuda), desno sve podgrupe izabrane grupe kao pločice sa slikom; traka sa „Sve iz menija" i Zatvori.
  Ispod 1280 px: burger levo, logo u sredini, ikone desno; meni je panel ispod headera preko celog
  ekrana sa harmonikom. Animacije izmerene na Pitbike-u 1:1:
  - burger: tri linije 20×1,5 px; otvoreno gornja/donja ±5,25 px i ±45°, srednja scale-x-0 + opacity-0; 300 ms expo-out
  - panel: fade + 16 px odozgo, 500 ms expo-out (klase .menu-panel-* u globals.css)
  - sadržaj harmonike: fade + 14 px, 450 ms ease-out pri otvaranju (.menu-in); strelica rotira 200 ms
*/
const EXPO = "ease-[cubic-bezier(0.16,1,0.3,1)]";

const pratiKorpu = (javi: () => void) => {
  window.addEventListener(DOGADJAJ_KORPA, javi);
  window.addEventListener("focus", javi);
  return () => {
    window.removeEventListener(DOGADJAJ_KORPA, javi);
    window.removeEventListener("focus", javi);
  };
};

/*
  usePathname je podatak koji postoji tek u zahtevu; Next (16.4.6+) zato traži da bude ispod <Suspense>. Zaglavlje se u
  statičkom delu strane crta bez aktivne putanje (ništa nije podvučeno), pa ga odmah zameni verzija sa putanjom.
*/
// Meni, grupe i brendovi stižu iz admina (HeaderPodaci.tsx: lib/grupe.ts i GET /brands/active)
// podgrupa po grupi u mega-meniju pre „Prikaži još"
const PODGRUPA = 6;

export type PodaciZaglavlja = { meniji: MegaMenu[]; kategorije: Odeljak[]; brendovi: BrendPretrage[] };

export default function Header(podaci: PodaciZaglavlja) {
  return (
    <Suspense fallback={<Zaglavlje pathname="" {...podaci} />}>
      <ZaglavljeSaPutanjom {...podaci} />
    </Suspense>
  );
}

function ZaglavljeSaPutanjom(podaci: PodaciZaglavlja) {
  return <Zaglavlje pathname={usePathname()} {...podaci} />;
}

function Zaglavlje({ pathname, meniji: megaMenus, kategorije: categories, brendovi: brands }: { pathname: string } & PodaciZaglavlja) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  // grupa u mega-meniju čije se podgrupe prikazuju desno (prelaz mišem); bez izbora prva grupa menija
  const [aktivnaGrupa, setAktivnaGrupa] = useState<string | null>(null);
  const menu = megaMenus.find((m) => m.key === open) ?? null;
  const grupa = menu ? (menu.items.find((i) => i.href === aktivnaGrupa) ?? menu.items[0]) : null;

  // Zaglavlje je u zajedničkom layoutu i ostaje pri prelasku između strana, zajedno sa svojim stanjem - meni bi ostao
  // otvoren (npr. „Sva radna odeća" pa logo nazad na početnu). Promena putanje zatvara sve menije.
  const [putanja, setPutanja] = useState(pathname);
  if (putanja !== pathname) {
    setPutanja(pathname);
    setOpen(null);
    setMobileOpen(false);
    setAcc(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(null); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // broj komada u korpi čita se iz kolačića pri svakom crtanju (i pri promeni strane); akcije korpe javljaju promenu događajem
  const uKorpi = useSyncExternalStore(pratiKorpu, () => komadaUKolacicu(document.cookie), () => 0);
  // inicijali prijavljenog kupca (kolačić koji upisuje prijava); prazno = gost. Čita se pri svakom crtanju, a prijava i
  // odjava uvek menjaju stranu, pa se zaglavlje tada ponovo crta.
  const prijavljen = useSyncExternalStore(pratiKorpu, () => prijavljenIzKolacica(document.cookie), () => "");

  // Dok je otvoren mobilni ili mega-meni, stranica ispod se ne pomera. Na desktopu se širina nestale trake za
  // pomeranje nadoknađuje razmakom desno, da sadržaj i zaglavlje ne skoče u stranu.
  const zakljucano = mobileOpen || Boolean(menu);
  useEffect(() => {
    if (!zakljucano) return;
    const b = document.body.style;
    const traka = window.innerWidth - document.documentElement.clientWidth;
    b.overflow = "hidden";
    if (traka > 0) b.paddingRight = `${traka}px`;
    return () => { b.overflow = ""; b.paddingRight = ""; };
  }, [zakljucano]);

  // Brendiranje i Kontakt: aktivna strana je podvučena kao otvoren mega-meni
  const linkovi = [
    { href: "/brendiranje-odece/", label: "Brendiranje" },
    { href: "/kontakt/", label: "Kontakt" },
  ];
  // putanja stiže i sa i bez završne kose crte (server / pregledač), pa se poredi sa dodatom
  const aktivan = (href: string) => `${pathname.replace(/\/$/, "")}/`.startsWith(href);

  const closeAll = () => { setOpen(null); setMobileOpen(false); setAcc(null); };
  const toggleMobile = () => { setOpen(null); if (mobileOpen) setAcc(null); setMobileOpen(!mobileOpen); };

  return (
    <>
      <header className="sticky top-0 z-40 h-20 border-b border-subtle bg-surface">
        <div className="container-site relative flex h-full items-center justify-between">
          {/* burger (ispod 1280) */}
          <button type="button" onClick={toggleMobile} aria-label={mobileOpen ? "Zatvori meni" : "Otvori meni"} aria-expanded={mobileOpen} className="-ml-2 grid size-10 place-items-center text-primary xl:hidden">
            <span className="relative block h-5 w-5">
              <span className={`absolute left-0 top-[4px] block h-[1.5px] w-5 bg-current transition-transform duration-300 ${EXPO} ${mobileOpen ? "translate-y-[5.25px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[9.25px] block h-[1.5px] w-5 bg-current transition-all duration-300 ${EXPO} ${mobileOpen ? "scale-x-0 opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14.5px] block h-[1.5px] w-5 bg-current transition-transform duration-300 ${EXPO} ${mobileOpen ? "-translate-y-[5.25px] -rotate-45" : ""}`} />
            </span>
          </button>

          {/* desktop meni */}
          <nav className="hidden items-center xl:flex xl:gap-4 2xl:gap-7">
            {megaMenus.map((m) => (
              <button key={m.key} type="button" onClick={() => { setOpen(open === m.key ? null : m.key); setAktivnaGrupa(null); }} aria-expanded={open === m.key} className="relative flex h-11 items-center gap-1.5 text-[15px] text-primary 2xl:text-[16px]">
                {m.label}
                <ChevronDown width={14} height={14} strokeWidth={1.6} className={`transition ${open === m.key ? "rotate-180" : ""}`} />
                <span className={`absolute inset-x-0 -bottom-[18px] h-px bg-primary transition-opacity ${open === m.key ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
            {linkovi.map((l) => (
              <Link key={l.href} href={l.href} onClick={closeAll} aria-current={aktivan(l.href) ? "page" : undefined} className="relative flex h-11 items-center text-[15px] text-primary hover:text-secondary 2xl:text-[16px]">
                {l.label}
                <span className={`absolute inset-x-0 bottom-1.5 h-[2px] rounded-full bg-brand transition-opacity ${aktivan(l.href) ? "opacity-100" : "opacity-0"}`} />
              </Link>
            ))}
          </nav>

          <div onClick={closeAll} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logo height={32} className="h-5 md:h-7 xl:h-[22px] 2xl:h-8" />
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <span className="hidden lg:block">
              <Link href="/kontakt/#ponuda" onClick={closeAll} className="btn-primary">Zatraži ponudu</Link>
            </span>
            <div className="flex items-center gap-0.5 text-primary md:gap-1">
              <SiteSearch kategorije={categories} brendovi={brands} className="grid size-10 place-items-center rounded-full transition hover:bg-page" />
              {prijavljen ? (
                <Link href="/moj-nalog/" onClick={closeAll} aria-label="Moj nalog" title="Moj nalog" className="grid size-10 place-items-center rounded-full transition hover:bg-page">
                  <span className="grid size-[30px] place-items-center rounded-full bg-primary text-[11px] font-semibold tracking-[0.02em] text-brand ring-2 ring-brand/0 transition hover:ring-brand">{prijavljen}</span>
                </Link>
              ) : (
                <Link href="/prijava/" onClick={closeAll} aria-label="Prijava" title="Prijava" className="grid size-10 place-items-center rounded-full transition hover:bg-page"><User width={20} height={20} strokeWidth={1.6} /></Link>
              )}
              <Link href="/korpa/" onClick={closeAll} aria-label={`Korpa, ${uKorpi} kom`} className="relative grid size-10 place-items-center rounded-full transition hover:bg-page">
                <Cart width={20} height={20} strokeWidth={1.6} />
                <span key={uKorpi} className={`absolute right-0 top-0.5 grid h-[16px] min-w-[16px] place-items-center rounded-full px-1 text-[10px] font-semibold leading-none ring-2 ring-surface ${uKorpi > 0 ? "korpa-bedz bg-brand text-on-brand" : "bg-primary text-white"}`}>
                  {uKorpi > 99 ? "99+" : uKorpi}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* desktop mega-meni */}
        <div className={`absolute inset-x-0 top-full hidden max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-b border-subtle bg-surface transition-opacity duration-200 xl:block ${menu ? "visible opacity-100" : "invisible opacity-0"}`}>
          {menu && (
            <div>
              <div className="container-site grid grid-cols-[300px_minmax(0,1fr)] gap-10 pb-10 pt-8 2xl:grid-cols-[340px_minmax(0,1fr)] 2xl:gap-14">
                {/* levo: grupe menija; prelaz mišem (ili fokus) bira grupu čije se podgrupe vide desno, klik vodi na grupu */}
                <div className="flex flex-col">
                  <ul className="space-y-1">
                    {menu.items.map((it) => {
                      const on = it.href === grupa?.href;
                      return (
                        <li key={it.href}>
                          <Link
                            href={it.href}
                            onClick={closeAll}
                            onMouseEnter={() => setAktivnaGrupa(it.href)}
                            onFocus={() => setAktivnaGrupa(it.href)}
                            aria-current={on ? "true" : undefined}
                            className={`relative flex min-h-14 items-center gap-3 rounded-[12px] py-2 pl-2 pr-3 transition-colors ${on ? "bg-page" : "hover:bg-page/60"}`}
                          >
                            <span aria-hidden className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-brand transition-opacity ${on ? "opacity-100" : "opacity-0"}`} />
                            <span className="relative ml-2 size-10 shrink-0 overflow-hidden rounded-[8px] bg-surface ring-1 ring-subtle">
                              <Image src={it.image} alt="" fill sizes="40px" className={it.foto ? "object-cover" : "object-contain p-1 mix-blend-multiply"} />
                            </span>
                            <span className={`line-clamp-2 min-w-0 flex-1 text-[15px] leading-snug text-primary ${on ? "font-semibold" : ""}`}>{it.name}</span>
                            <ChevronRight width={15} height={15} strokeWidth={1.8} className={`shrink-0 transition ${on ? "text-primary" : "text-secondary/50"}`} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* brendiranje / pomoć pri izboru / ponuda za firme */}
                  {menu.promo && (
                    <Link href={menu.promo.href} onClick={closeAll} className="group/p mt-6 flex items-center gap-4 rounded-[14px] bg-[#18191b] p-4 text-white">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-[10px]">
                        <Image src={menu.promo.image} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{menu.promo.kicker}</span>
                        <span className="mt-1 block text-[15px] font-semibold leading-snug">{menu.promo.title}</span>
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition group-hover/p:bg-brand-hover">
                        <ChevronRight width={16} height={16} strokeWidth={2} />
                      </span>
                    </Link>
                  )}
                </div>

                {/* desno: podgrupe izabrane grupe kao pločice sa slikom */}
                {grupa && (
                  <div key={grupa.href} className="menu-prelaz min-w-0 border-l border-subtle pl-10 2xl:pl-14">
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-primary">{grupa.name}</h3>
                        {grupa.sub && <p className="mt-1 text-[14px] text-secondary">{grupa.sub}</p>}
                      </div>
                      <Link href={grupa.href} onClick={closeAll} className="btn-primary shrink-0">
                        Pogledaj sve <ChevronRight width={14} height={14} strokeWidth={2} />
                      </Link>
                    </div>
                    {grupa.subs && grupa.subs.length > 0 ? (
                      <ul className="mt-6 grid grid-cols-3 gap-3 2xl:grid-cols-4">
                        {grupa.subs.map((p) => (
                          <li key={p.href}>
                            <Link href={p.href} onClick={closeAll} className="group/s flex h-[76px] items-center gap-3.5 rounded-[12px] border border-subtle bg-surface p-2.5 pr-4 transition hover:border-primary/25 hover:shadow-[0_8px_24px_-16px_rgba(32,33,36,0.35)]">
                              <span className="relative size-14 shrink-0 overflow-hidden rounded-[8px] bg-page">
                                {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply transition-transform duration-300 group-hover/s:scale-110" />}
                              </span>
                              <span className="line-clamp-2 text-[15px] font-medium leading-snug text-primary">{p.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-6 text-[15px] text-secondary">Ova grupa nema podgrupe - pogledajte sve artikle.</p>
                    )}
                  </div>
                )}
              </div>

              {/* traka: sve iz menija levo, zatvaranje desno */}
              <div className="border-t border-subtle bg-page">
                <div className="container-site flex h-14 items-center justify-between">
                  <Link href={menu.allHref} onClick={closeAll} className="link-arrow">{menu.allLabel} <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
                  <button type="button" onClick={() => setOpen(null)} className="inline-flex items-center gap-2 text-[14px] text-secondary transition-colors hover:text-primary">
                    Zatvori <Close width={16} height={16} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* mobilni meni (ispod 1280): panel ispod headera, uvek u DOM-u, ulazi fade + 16 px */}
        <div className={`absolute left-0 top-full h-[calc(100dvh-80px)] w-full xl:hidden ${mobileOpen ? "" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
          <nav className={`menu-panel h-full overflow-y-auto bg-surface px-6 pb-12 pt-2 ${mobileOpen ? "menu-panel-open" : "menu-panel-closed"}`}>
            <SearchPill onClick={closeAll} className="mb-2 mt-4" />
            {megaMenus.map((m) => {
              const expanded = acc === m.key;
              return (
                <div key={m.key} className="border-b border-subtle">
                  <button type="button" onClick={() => setAcc(expanded ? null : m.key)} aria-expanded={expanded} className="flex h-14 w-full items-center justify-between text-[16px] text-primary">
                    {m.label}
                    <ChevronDown width={16} height={16} strokeWidth={1.6} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="menu-in space-y-6 pb-7 pt-2">
                      {m.items.map((it) => (
                        <div key={it.href}>
                          <Link href={it.href} onClick={closeAll} className="flex items-center gap-3">
                            <span className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-page ring-1 ring-subtle">
                              <Image src={it.image} alt="" fill sizes="48px" className={it.foto ? "object-cover" : "object-contain p-1 mix-blend-multiply"} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[16px] font-semibold text-primary">{it.name}</span>
                              {it.sub && <span className="block text-[13px] text-secondary">{it.sub}</span>}
                            </span>
                            <ChevronRight width={16} height={16} strokeWidth={1.6} className="shrink-0 text-secondary" />
                          </Link>
                          {it.subs && it.subs.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 pl-[60px]">
                              {it.subs.slice(0, PODGRUPA).map((p) => (
                                <Link key={p.href} href={p.href} onClick={closeAll} className="inline-flex h-8 items-center rounded-full border border-subtle px-3 text-[13px] text-primary">
                                  {p.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {m.promo && (
                        <Link href={m.promo.href} onClick={closeAll} className="flex items-center gap-4 rounded-[12px] bg-[#18191b] p-4 text-white">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">{m.promo.kicker}</span>
                            <span className="mt-1 block text-[15px] font-semibold leading-snug">{m.promo.title}</span>
                          </span>
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                            <ChevronRight width={16} height={16} strokeWidth={2} />
                          </span>
                        </Link>
                      )}
                      <Link href={m.allHref} onClick={closeAll} className="link-arrow">{m.allLabel} <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
                    </div>
                  )}
                </div>
              );
            })}
            {linkovi.map((l) => (
              <Link key={l.href} href={l.href} onClick={closeAll} aria-current={aktivan(l.href) ? "page" : undefined} className={`flex h-14 items-center justify-between border-b border-subtle text-[16px] text-primary ${aktivan(l.href) ? "font-semibold" : ""}`}>
                {l.label}
                {aktivan(l.href) && <span aria-hidden className="size-2 rounded-full bg-brand" />}
              </Link>
            ))}
            <Link href="/o-nama/" onClick={closeAll} className="flex h-14 items-center border-b border-subtle text-[16px] text-primary">O nama</Link>
            <Link href={prijavljen ? "/moj-nalog/" : "/prijava/"} onClick={closeAll} className="flex h-14 items-center gap-3 border-b border-subtle text-[16px] text-primary">
              {prijavljen ? <span className="grid size-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-brand">{prijavljen}</span> : <User width={18} height={18} strokeWidth={1.6} />}
              {prijavljen ? "Moj nalog" : "Prijava i novi nalog"}
            </Link>
            <div className="pt-8 lg:hidden">
              <Link href="/kontakt/#ponuda" onClick={closeAll} className="btn-primary w-full">Zatraži ponudu</Link>
            </div>
          </nav>
        </div>
      </header>
      {/* zatamnjenje stranice dok je desktop meni otvoren */}
      <div className={`fixed inset-0 z-30 bg-black/30 transition-opacity ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setOpen(null)} aria-hidden />
    </>
  );
}
