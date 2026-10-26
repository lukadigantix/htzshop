import Image from "next/image";
import Link from "next/link";
import { brands } from "@/data/site";

// Sekcija 7 (Pitbike „Strecken. Storys. Fahrer."): tekst levo, mreža desno - ovde logoi brendova.
export default function Brands() {
  return (
    <section className="container-site grid grid-cols-1 gap-10 pb-16 md:pb-24 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <h2 className="h-section">Brendovi kojima veruju profesionalci.</h2>
        <p className="p-muted mt-5 max-w-[440px]">
          Zastupamo {brands.length} evropskih proizvođača zaštitne opreme. Svaki artikal nosi deklarisan EN standard.
        </p>
        <Link href="/brendovi/" className="btn-secondary mt-6">
          Svi brendovi
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {brands.map((b) => (
          <Link key={b.slug} href={`/brend/${b.slug}/`} title={b.name} className="flex aspect-[5/4] items-center justify-center rounded-[4px] bg-surface p-4 transition hover:bg-brand-soft">
            <Image src={b.logo} alt={b.name} width={96} height={54} className="opacity-80" />
          </Link>
        ))}
      </div>
    </section>
  );
}
