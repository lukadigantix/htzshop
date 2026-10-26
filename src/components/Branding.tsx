import Image from "next/image";
import Link from "next/link";
import { contact, printMethods } from "@/data/site";

/*
  Brendiranje odeće: fotografija radionice levo, desno bela kartica sa naslovom, tri tehnike štampe
  (sito, flex, DTF sa originalnog sajta) i pozivom na ponudu. Na fotografiji plutajuća oznaka sa
  aktuelnom ponudom (radni prsluk sa štampom, 450 RSD, sa originalnog sajta).
*/
export default function Branding() {
  return (
    <section id="brendiranje" className="container-site pb-16 md:pb-24">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr] lg:gap-8">
        <div className="relative min-h-[380px] overflow-hidden rounded-[4px] bg-surface md:min-h-[480px] lg:min-h-0">
          <Image src="/images/photo/brendiranje-presa.jpg" alt="Štampa logotipa na radnoj majici toplom presom" fill sizes="760px" className="object-cover object-[55%_center]" />
          <div className="absolute bottom-4 left-4 rounded-[4px] bg-surface px-4 py-3 md:bottom-6 md:left-6 md:px-5 md:py-4 shadow-[0_12px_30px_-12px_rgba(32,33,36,0.45)]">
            <p className="kicker">Aktuelna ponuda</p>
            <p className="mt-1 text-[18px] font-medium leading-tight">Radni prsluk sa štampom</p>
            <p className="mt-1 text-[14px] text-secondary">
              <span className="font-medium text-primary">450 RSD</span> sa PDV-om
            </p>
          </div>
        </div>

        <div className="flex flex-col rounded-[4px] bg-surface p-6 md:p-10 xl:p-14">
          <p className="kicker">Brendiranje odeće</p>
          <h2 className="h-section mt-4">Vaš logo na radnoj odeći. Sve na jednom mestu.</h2>
          <p className="p-muted mt-5 max-w-[520px] text-[15px]">
            Kupite radnu odeću kod nas i odmah je obeležimo logotipom vaše firme u sopstvenoj radionici. Tim izgleda
            uigrano, a vi dobijate jednog dobavljača i jedan račun.
          </p>

          <ol className="mt-10 border-t border-subtle">
            {printMethods.map((m, i) => (
              <li key={m.name} className="grid grid-cols-[56px_1fr] items-start border-b border-subtle py-5">
                <span className="pt-1 text-[13px] text-secondary">0{i + 1}</span>
                <div>
                  <h3 className="text-[18px] font-medium leading-snug">{m.name}</h3>
                  <p className="p-muted mt-1 max-w-[460px]">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-auto pt-8 md:pt-10">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <Link href="/kontakt/#ponuda" className="btn-primary">Zatraži ponudu</Link>
              <Link href="/brendiranje-odece/" className="btn-secondary">Sve o brendiranju</Link>
            </div>
            <p className="mt-5 text-[13px] text-secondary">
              Za cene brendiranja pozovite{" "}
              <a href={contact.phone2Href} className="font-medium text-primary">{contact.phone2}</a> ili pišite na{" "}
              <a href={`mailto:${contact.email}`} className="font-medium text-primary">{contact.email}</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
