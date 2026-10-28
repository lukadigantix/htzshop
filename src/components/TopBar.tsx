import Link from "next/link";
import { contact } from "@/data/site";
import { getSajt } from "@/lib/sajt";
import { StatusRadnje } from "./kontakt/Radnja";
import Poruke from "./topbar/Poruke";
import { Phone } from "./Icons";

/*
  Gornja traka u jeziku footera: tamna, žuta kao signal; slova 14 px da se lako čitaju.
  Levo status radnje uživo i telefon, u sredini poruke koje se smenjuju (samo podaci koji postoje na sajtu), desno linkovi.
  Do 1024 px: telefon levo, status desno; od 1024 px status i telefon levo, linkovi desno; od 1280 px i poruke u sredini.
*/

const poruke = [
  `Besplatna isporuka za porudžbine iznad ${contact.freeShippingFrom}`,
  "Brendiranje radne odeće u našoj radionici",
  "Ponude za firme i opremanje celih timova",
  "HTZ oprema vodećih evropskih brendova",
];

const linkovi = [
  { name: "Brendovi", href: "/brendovi/" },
  { name: "O nama", href: "/o-nama/" },
  { name: "Status porudžbine", href: "/status-porudzbine/" },
];

export default async function TopBar() {
  const s = await getSajt();
  return (
    // z-40 kao zaglavlje: zatamnjenje ispod mega-menija (z-30) ne sme da pređe preko trake
    <div className="relative z-40 bg-[#18191b] text-[13px] text-white/85 sm:text-[14px]">
      <div className="container-site grid h-11 grid-cols-[1fr_auto] items-center gap-4 xl:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-5">
          <span className="hidden lg:inline-flex">
            <StatusRadnje week={s.week} mali />
          </span>
          <span className="hidden h-3.5 w-px bg-white/15 lg:block" aria-hidden />
          <a href={s.phoneHref} className="group inline-flex items-center gap-2 font-medium text-white">
            <Phone width={15} height={15} strokeWidth={1.8} className="text-brand" />
            <span className="decoration-brand underline-offset-4 group-hover:underline">{s.phone}</span>
          </a>
        </div>

        <div className="hidden xl:block">
          <Poruke poruke={poruke} />
        </div>

        <div className="flex items-center justify-end">
          {/* telefon i tablet: status desno (od 1024 px je levo, uz broj) */}
          <span className="lg:hidden">
            <StatusRadnje week={s.week} mali />
          </span>
          <nav aria-label="Brzi linkovi" className="hidden items-center gap-6 lg:flex">
            {linkovi.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-brand">
                {l.name}
              </Link>
            ))}
            <Link href="/pracenje-posiljke/" className="transition hover:text-brand">
              Praćenje pošiljke
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
