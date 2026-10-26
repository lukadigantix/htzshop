import Link from "next/link";
import { categories, categoryHref, contact } from "@/data/site";
import Logo from "./Logo";
import { Facebook, Instagram } from "./Icons";

// Footer po uzoru na pitbike.vercel.app: tamna površina, 4 kolone, newsletter, donja traka, centriran logo.
const wear = categories.slice(0, 3);
const protection = categories.slice(3);
const shop = [
  { name: "Kontakt", href: "/kontakt/" },
  { name: "O nama", href: "/o-nama/" },
  { name: "Brendiranje odeće", href: "/brendiranje-odece/" },
  { name: "Status porudžbine", href: "/status-porudzbine/" },
  { name: "Plaćanje i isporuka", href: "/placanje-i-isporuka/" },
  { name: "Reklamacija proizvoda", href: "/reklamacija-proizvoda/" },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-site">
        <div className="grid grid-cols-1 gap-10 pb-12 pt-14 md:grid-cols-2 md:gap-12 md:pb-16 md:pt-20 lg:grid-cols-4">
          <div>
            <h3 className="h-card">Odeća i obuća</h3>
            <ul className="mt-6 space-y-3 text-[14px]">
              {wear.map((c) => (
                <li key={c.slug}><Link href={categoryHref(c.slug)} className="hover:underline">{c.name}</Link></li>
              ))}
              <li><Link href="/brendiranje-odece/" className="hover:underline">Brendiranje odeće</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="h-card">Zaštita</h3>
            <ul className="mt-6 space-y-3 text-[14px]">
              {protection.map((c) => (
                <li key={c.slug}><Link href={categoryHref(c.slug)} className="hover:underline">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h-card">Prodavnica</h3>
            <ul className="mt-6 space-y-3 text-[14px]">
              {shop.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:underline">{l.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h-card">Ostanite u toku.</h3>
            <p className="mt-6 text-[14px] text-white/80">Nove kolekcije i akcije, jednom mesečno.</p>
            <form className="mt-4 space-y-2">
              <input type="email" placeholder="Vaša e-mail adresa" className="h-11 w-full rounded-[4px] bg-white/10 px-4 text-[14px] text-white outline-none placeholder:text-white/50" />
              <button type="button" className="btn-primary h-11 w-full">Prijavi me</button>
              <label className="flex items-start gap-2 pt-1 text-[11px] leading-[16px] text-white/60">
                <input type="checkbox" className="mt-0.5" />
                Želim da primam obaveštenja od HTZ Shopa. Odjava je moguća u svakom trenutku.
              </label>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-8 text-[13px] text-white/70 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>© 2026 {contact.name}</span>
            <Link href="/politika-privatnosti/" className="hover:text-white">Politika privatnosti</Link>
            <Link href="/pravo-na-odustajanje/" className="hover:text-white">Pravo na odustajanje</Link>
            <Link href="/povracaj-novca/" className="hover:text-white">Povraćaj novca</Link>
          </div>
          <span>PIB {contact.pib} · Matični broj {contact.mb}</span>
          <div className="flex gap-2">
            <a href={contact.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-9 place-items-center rounded-full border border-white/25 hover:bg-white/10"><Facebook width={15} height={15} /></a>
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-9 place-items-center rounded-full border border-white/25 hover:bg-white/10"><Instagram width={15} height={15} /></a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pb-10 pt-2">
          <Logo light height={28} />
          <p className="px-4 text-center text-[12px] text-white/60">Zaštitna i radna oprema, {contact.address}, Svilajnac - od {contact.founded}.</p>
          <p className="text-[12px] text-white/60">
            design &amp; developed by{" "}
            <a href="https://zeroblynk.com" target="_blank" rel="noreferrer" className="text-brand">Zeroblynk</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
