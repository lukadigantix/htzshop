import Link from "next/link";
import { ChevronRight } from "./Icons";

/*
  Putanja (breadcrumbs) kao posebna siva traka odmah ispod navigacije: odvaja beli navbar od belog zaglavlja strane.
  Početna je kućica, poslednja stavka (trenutna strana) je tamna i deblja. Na telefonu se traka prevlači vodoravno.
*/
export default function Putanja({ stavke }: { stavke: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Putanja" className="border-b border-subtle bg-[#eef0f3]">
      <ol className="container-site no-scrollbar flex h-11 items-center gap-2 overflow-x-auto whitespace-nowrap text-[13px] text-secondary">
        <li className="shrink-0">
          <Link href="/" aria-label="Početna" className="grid size-7 place-items-center rounded-full transition hover:bg-white hover:text-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
            </svg>
          </Link>
        </li>
        {stavke.map((s, i) => (
          <li key={`${s.label}-${i}`} className="flex min-w-0 items-center gap-2">
            <ChevronRight width={12} height={12} strokeWidth={1.8} aria-hidden className="shrink-0 opacity-60" />
            {s.href && i < stavke.length - 1 ? (
              <Link href={s.href} className="transition hover:text-primary">{s.label}</Link>
            ) : (
              <span aria-current="page" className="truncate font-medium text-primary">{s.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
