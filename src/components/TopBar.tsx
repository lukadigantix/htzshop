import Link from "next/link";
import { contact } from "@/data/site";

export default function TopBar() {
  return (
    <div className="bg-brand-soft text-[12px] text-primary">
      <div className="mx-auto flex h-[30px] max-w-[1900px] items-center justify-between px-4 md:px-9">
        <p className="truncate">
          Imate pitanje? Pozovite{" "}
          <a href={contact.phoneHref} className="font-medium">
            {contact.phone}
          </a>
          .
        </p>
        <p className="hidden xl:block">Zaštitna i radna oprema, Svilajnac. Besplatna isporuka iznad {contact.freeShippingFrom}.</p>
        <nav className="hidden gap-5 md:flex">
          <Link href="/brendovi/" className="hover:underline">Brendovi</Link>
          <Link href="/o-nama/" className="hover:underline">O nama</Link>
          <Link href="/status-porudzbine/" className="hover:underline">Status porudžbine</Link>
          <a href="https://www.posta.rs/cir/alati/pracenje-posiljke.aspx" target="_blank" rel="noreferrer" className="hover:underline">
            Praćenje pošiljke
          </a>
        </nav>
      </div>
    </div>
  );
}
