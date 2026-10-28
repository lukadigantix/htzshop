"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MapPin, MessageSquareWarning, Package, Truck, UserRound, type LucideIcon } from "lucide-react";

/** Odeljci naloga - isti spisak u bočnom meniju (računar) i u traci (telefon). */
export const ODELJCI: { href: string; label: string; kratko: string; Icon: LucideIcon }[] = [
  { href: "/moj-nalog/", label: "Pregled", kratko: "Pregled", Icon: LayoutGrid },
  { href: "/moj-nalog/porudzbine/", label: "Moje porudžbine", kratko: "Porudžbine", Icon: Package },
  { href: "/moj-nalog/pracenje/", label: "Praćenje pošiljke", kratko: "Praćenje", Icon: Truck },
  { href: "/moj-nalog/adrese/", label: "Adrese za dostavu", kratko: "Adrese", Icon: MapPin },
  { href: "/moj-nalog/podaci/", label: "Moji podaci", kratko: "Podaci", Icon: UserRound },
  { href: "/moj-nalog/reklamacije/", label: "Reklamacije", kratko: "Reklamacije", Icon: MessageSquareWarning },
];

/** otvoren odeljak po putanji (putanja stiže i sa i bez završne kose crte); detalj porudžbine pripada porudžbinama */
function aktivan(putanja: string) {
  const p = `${putanja.replace(/\/$/, "")}/`;
  if (p === "/moj-nalog/") return "/moj-nalog/";
  return ODELJCI.find((o) => o.href !== "/moj-nalog/" && p.startsWith(o.href))?.href ?? null;
}

/** Bočni meni na tamnoj koloni: otvoren odeljak je svetla traka sa žutom ikonom i žutom crtom levo. */
export function BocniMeni() {
  const putanja = usePathname();
  const on = aktivan(putanja);
  return (
    <ul className="space-y-0.5">
      {ODELJCI.map(({ href, label, Icon }) => {
        const jeste = href === on;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={jeste ? "page" : undefined}
              className={`relative flex h-11 items-center gap-3 rounded-[4px] px-3.5 text-[15px] transition ${jeste ? "bg-white/[0.09] font-medium text-white" : "text-white/65 hover:bg-white/[0.05] hover:text-white"}`}
            >
              {jeste && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand" />}
              <Icon className={`size-[18px] shrink-0 ${jeste ? "text-brand" : "text-white/45"}`} strokeWidth={1.8} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Odeljci na telefonu i tabletu: red pilula koji se prevlači prstom; otvoren odeljak se sam dovuče na vidik. */
export function TrakaMenija() {
  const putanja = usePathname();
  const on = aktivan(putanja);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = ref.current;
    const el = ul?.querySelector<HTMLElement>("[aria-current]");
    if (ul && el) ul.scrollLeft = Math.max(0, el.offsetLeft + el.offsetWidth + 16 - ul.clientWidth);
  }, [putanja]);

  return (
    <nav aria-label="Moj nalog" className="-mx-4 mb-6 lg:hidden">
      <ul ref={ref} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {ODELJCI.map(({ href, kratko, Icon }) => {
          const jeste = href === on;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={jeste ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition ${jeste ? "bg-primary text-white" : "bg-surface text-primary ring-1 ring-subtle hover:ring-input"}`}
              >
                <Icon className={`size-4 shrink-0 ${jeste ? "text-brand" : "text-secondary"}`} strokeWidth={1.8} aria-hidden />
                {kratko}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
