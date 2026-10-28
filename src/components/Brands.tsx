import Link from "next/link";
import { getBrendovi } from "@/lib/brendovi";
import ZnakBrenda from "./brendovi/ZnakBrenda";

// Sekcija 7 (Pitbike „Strecken. Storys. Fahrer."): tekst levo, mreža desno - brendovi sa backenda, svaki vodi na svoju stranu.
export default async function Brands() {
  const brendovi = (await getBrendovi()) ?? [];
  if (brendovi.length === 0) return null;
  return (
    <section className="container-site grid grid-cols-1 gap-10 pb-16 md:pb-24 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <h2 className="h-section">Brendovi kojima veruju profesionalci.</h2>
        <p className="p-muted mt-5 max-w-[440px]">
          Zaštitna i radna oprema proverenih proizvođača. Svaki artikal nosi deklarisan EN standard.
        </p>
        <Link href="/brendovi/" className="btn-secondary mt-6">
          Svi brendovi
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {brendovi.slice(0, 18).map((b) => (
          <Link key={b.slug} href={`/brendovi/${b.slug}/`} title={b.name} className="flex aspect-[5/4] items-center justify-center rounded-[4px] bg-surface p-3 transition hover:bg-brand-soft">
            <ZnakBrenda b={b} velicina="mali" />
          </Link>
        ))}
      </div>
    </section>
  );
}
