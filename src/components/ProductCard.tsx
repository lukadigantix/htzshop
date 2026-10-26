import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/data/site";
import { Cart, Heart } from "./Icons";

export default function ProductCard({ p }: { p: Product }) {
  const href = `/proizvod/${p.slug}/`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-[4px] bg-surface transition hover:shadow-[0_20px_40px_-28px_rgba(32,33,36,0.35)]">
      <Link href={href} className="relative block aspect-square overflow-hidden">
        <Image src={p.image} alt={p.name} fill sizes="320px" className="object-contain p-5 mix-blend-multiply transition duration-500 group-hover:scale-[1.04] md:p-10" />
        {p.tag && <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-medium text-on-brand md:left-4 md:top-4 md:px-3 md:py-1 md:text-[12px]">{p.tag}</span>}
        <button type="button" aria-label="Dodaj na listu želja" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-surface text-secondary opacity-0 shadow transition hover:text-primary group-hover:opacity-100">
          <Heart width={16} height={16} strokeWidth={1.6} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col border-t border-subtle p-3 md:p-5">
        <p className="truncate text-[12px] text-secondary">{p.brand ? `${p.brand} · ${p.group}` : p.group}</p>
        <h3 className="mt-1 text-[15px] font-medium leading-snug md:text-[18px]">
          <Link href={href} className="hover:underline">{p.name}</Link>
        </h3>
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          <span className={`size-2 rounded-full ${p.inStock ? "bg-success" : "bg-error"}`} />
          <span className={p.inStock ? "text-success" : "text-error"}>{p.inStock ? "Na stanju" : "Trenutno nema"}</span>
          {p.colors && (
            <span className="ml-auto flex gap-1">
              {p.colors.map((c) => (
                <span key={c} className="size-3.5 rounded-full border border-black/10" style={{ background: c }} />
              ))}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-5">
          <p className="text-[16px] font-medium md:text-[18px]">
            {formatPrice(p.price)}
            {p.priceTo && <span className="text-[13px] text-secondary"> - {formatPrice(p.priceTo)}</span>}
          </p>
          <button type="button" className="btn-primary w-full sm:w-auto">
            <Cart width={15} height={15} strokeWidth={1.8} />
            U korpu
          </button>
        </div>
      </div>
    </article>
  );
}
