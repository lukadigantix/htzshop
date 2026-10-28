"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brands, categories, megaMenus } from "@/data/site";
import { DOGADJAJ_KORPA, komadaUKolacicu } from "@/lib/korpa-deo";
import { prijavljenIzKolacica } from "@/lib/nalog-deo";
import Logo from "./Logo";
import { SearchPill, SiteSearch } from "./SiteSearch";
import { Cart, ChevronDown, ChevronRight, Close, User } from "./Icons";

/*
  Header po uzoru na pitbike.vercel.app: 80 px, sticky, bela površina.
  Desktop (od 1280 px): meni levo, logo u sredini, desno pilula + ikone; mega-meni na klik.
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

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  const menu = megaMenus.find((m) => m.key === open) ?? null;

  // Zaglavlje je u zajedničkom layoutu i ostaje pri prelasku između strana, zajedno sa svojim stanjem - meni bi ostao
  // otvoren (npr. „Sva radna odeća" pa logo nazad na početnu). Promena putanje zatvara sve menije.
  const pathname = usePathname();
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
              <button key={m.key} type="button" onClick={() => setOpen(open === m.key ? null : m.key)} aria-expanded={open === m.key} className="relative flex h-11 items-center gap-1.5 text-[15px] text-primary 2xl:text-[16px]">
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
        <div className={`absolute inset-x-0 top-full hidden border-b border-subtle bg-surface transition-opacity duration-200 xl:block ${menu ? "visible opacity-100" : "invisible opacity-0"}`}>
          {menu && (
            <div className="relative">
              {/* × poravnat sa desnom ivicom sadržaja (container-site), kao ikone u zaglavlju */}
              <div className="pointer-events-none absolute inset-x-0 top-6">
                <div className="container-site flex justify-end">
                  <button type="button" onClick={() => setOpen(null)} aria-label="Zatvori meni" className="pointer-events-auto text-primary hover:text-secondary">
                    <Close width={18} height={18} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
              <div className="mx-auto grid w-full max-w-[1600px] grid-cols-4 gap-9 px-16 pb-10 pt-[72px]">
                {menu.items.map((it) => (
                  <div key={it.href} className="flex flex-col items-center text-center">
                    <h3 className="text-[24px] font-medium leading-tight text-primary">{it.name}</h3>
                    <p className="mt-1.5 text-[14px] text-secondary">{it.sub}</p>
                    <Link href={it.href} onClick={closeAll} className="relative mt-6 block h-[260px] w-full">
                      <Image src={it.image} alt={it.name} fill sizes="340px" className="object-contain mix-blend-multiply" />
                    </Link>
                    <div className="mt-7 flex items-center gap-6">
                      <Link href={it.href} onClick={closeAll} className="btn-primary">Kupi</Link>
                      <Link href={it.href} onClick={closeAll} className="link-arrow">Pogledaj <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex h-14 items-center justify-center border-t border-subtle">
                <Link href={menu.allHref} onClick={closeAll} className="link-arrow">{menu.allLabel} <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
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
                    <div className="menu-in pb-8 pt-4">
                      {m.items.map((it) => (
                        <div key={it.href} className="flex flex-col items-center py-6 text-center">
                          <h3 className="text-[24px] font-medium leading-tight text-primary">{it.name}</h3>
                          <p className="mt-1.5 text-[14px] text-secondary">{it.sub}</p>
                          <Link href={it.href} onClick={closeAll} className="relative mt-5 block h-[240px] w-full max-w-[340px]">
                            <Image src={it.image} alt={it.name} fill sizes="340px" className="object-contain mix-blend-multiply" />
                          </Link>
                          <div className="mt-6 flex items-center gap-6">
                            <Link href={it.href} onClick={closeAll} className="btn-primary">Kupi</Link>
                            <Link href={it.href} onClick={closeAll} className="link-arrow">Pogledaj <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center pt-2">
                        <Link href={m.allHref} onClick={closeAll} className="link-arrow">{m.allLabel} <ChevronRight width={14} height={14} strokeWidth={1.8} /></Link>
                      </div>
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
