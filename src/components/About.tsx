import Image from "next/image";
import Link from "next/link";
import { aboutStats, contact, mapsHref } from "@/data/site";
import { Clock, Pin } from "./Icons";
import Razdvajac from "./Razdvajac";

/*
  O nama / prodavnica: bela kartica levo (naslov, tekst, četiri brojke, adresa, dugmad),
  fotografija prodavnice desno sa plutajućom oznakom radnog vremena. Ogledalo sekcije Brendiranje.
*/
export default function About() {
  return (
    <section id="o-nama" className="container-site pb-16 md:pb-24">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <div className="flex flex-col rounded-[4px] bg-surface p-6 md:p-10 xl:p-14">
          <p className="kicker">Prodavnica u Svilajncu</p>
          <h2 className="h-section mt-4">Od 2017. opremamo one koji rade.</h2>
          <p className="p-muted mt-5 max-w-[520px] text-[15px]">
            HTZ Shop je specijalizovana prodavnica zaštitne i radne opreme. U radnji u centru Svilajnca možete probati
            obuću i odeću pre kupovine, a firmama šaljemo opremu na adresu širom Srbije.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-subtle py-6 md:mt-10 md:grid-cols-4 md:py-8">
            {aboutStats.map((s) => (
              <div key={s.label}>
                <dt className="text-[28px] font-medium leading-none tracking-[-0.01em] md:text-[32px]">{s.value}</dt>
                <dd className="mt-2 text-[13px] text-secondary">{s.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex items-start gap-3">
            <Pin width={18} height={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-secondary" />
            <div>
              <p className="text-[16px] font-medium">
                {contact.address}, {contact.city}
              </p>
              <p className="mt-0.5 text-[14px] text-secondary">
                <a href={contact.phoneHref} className="hover:text-primary">{contact.phone}</a>
                <Razdvajac />
                <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8 md:gap-4 md:pt-10">
            <a href={mapsHref} target="_blank" rel="noreferrer" className="btn-primary">
              Kako do nas
            </a>
            <Link href="/o-nama/" className="btn-secondary">
              O nama
            </Link>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[4px] bg-surface md:min-h-[520px] lg:min-h-[620px]">
          <Image src="/images/photo/prodavnica.jpg" alt="Radne čizme izložene na zidu prodavnice" fill sizes="700px" className="object-cover object-center" />
          <div className="absolute bottom-4 left-4 flex items-start gap-3 rounded-[4px] bg-surface px-4 py-3 md:bottom-6 md:left-6 md:px-5 md:py-4 shadow-[0_12px_30px_-12px_rgba(32,33,36,0.45)]">
            <Clock width={18} height={18} strokeWidth={1.6} className="mt-0.5 text-secondary" />
            <div>
              <p className="kicker">Radno vreme</p>
              <ul className="mt-1.5 space-y-0.5 text-[14px]">
                {contact.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-6">
                    <span className="text-secondary">{h.days}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
