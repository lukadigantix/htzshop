import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import KontaktForma from "@/components/kontakt/KontaktForma";
import Mapa from "@/components/kontakt/Mapa";
import { Kopiraj, RadnoVremeTabela, StatusRadnje } from "@/components/kontakt/Radnja";
import { ArrowRight, Facebook, Instagram, Mail, Phone, Pin } from "@/components/Icons";
import { companySteps, contact, printMethods } from "@/data/site";
import { getSajt } from "@/lib/sajt";
import Razdvajac from "@/components/Razdvajac";

/*
  Kontakt. Podaci iz Admin → Podešavanja → Sajt (adresa, telefon, e-mail, PIB/MB, mreže, radno vreme po danima).
  1. Tamni uvod preko crno-bele fotografije prodavnice: veliki naslov, status radnje uživo, tri kartice za brz kontakt.
  2. Forma (#ponuda - link „Zatraži ponudu" iz zaglavlja) uz korake za firme.
  3. Mapa (mapcn) sa karticom radnje preko nje (#mapa).
  4. Podaci o firmi sa kopiranjem, za fakturu i porudžbenicu.
  5. Česta pitanja.
*/

export const metadata: Metadata = {
  title: "Kontakt - HTZ Shop",
  description: "Pozovite nas, pišite nam ili svratite u radnju u Svilajncu. Pitanja, ponude za firme i brendiranje radne odeće.",
};

const STRELICA = (
  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-current/20 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-on-brand/30">
    <ArrowRight width={15} height={15} strokeWidth={1.8} className="-rotate-45" />
  </span>
);

export default async function KontaktPage() {
  const s = await getSajt();
  const mreze = [
    { href: s.facebook, label: "Facebook", Icon: Facebook },
    { href: s.instagram, label: "Instagram", Icon: Instagram },
  ].filter((m) => m.href);
  const navigacija = `https://www.google.com/maps/dir/?api=1&destination=${contact.coords.lat},${contact.coords.lng}`;

  const brzo = [
    { kicker: "Pozovite", vrednost: s.phone, opis: "Savet pri izboru opreme i veličine", href: s.phoneHref, Icon: Phone },
    { kicker: "Pišite", vrednost: s.email, opis: "Upiti, ponude i dokumentacija", href: `mailto:${s.email}`, Icon: Mail },
    { kicker: "Posetite", vrednost: s.street, opis: `${s.city}, probajte pre kupovine`, href: "#mapa", Icon: Pin },
  ];

  const podaci = [
    { label: "Poslovno ime", vrednost: contact.legalName },
    { label: "Adresa", vrednost: `${s.street}, ${s.city}` },
    { label: "PIB", vrednost: s.pib },
    { label: "Matični broj", vrednost: s.mb },
    // „Banca Intesa 160-492241-81": banka ide u naziv polja, kopira se samo broj računa
    { label: "Tekući račun", banka: contact.bank.replace(/\s+\S+$/, ""), vrednost: contact.bank.split(" ").at(-1) ?? "" },
    { label: "E-mail", vrednost: s.email },
  ].filter((p) => p.vrednost);

  const pitanja = [
    {
      q: "Mogu li da probam obuću i odeću pre kupovine?",
      a: (
        <>
          Da. U radnji u ulici {s.street} u Svilajncu možete probati obuću i odeću i proveriti veličinu pre kupovine. Radno vreme je iznad, na mapi.
        </>
      ),
    },
    {
      q: "Koliko košta dostava?",
      a: (
        <>
          Isporuka je besplatna za porudžbine iznad {contact.freeShippingFrom}. Ostale uslove i načine plaćanja pogledajte na stranici{" "}
          <Link href="/placanje-i-isporuka/" className="text-primary underline underline-offset-2">Plaćanje i isporuka</Link>.
        </>
      ),
    },
    {
      q: "Kako da dobijem ponudu za firmu?",
      a: (
        <>
          {companySteps.map((k) => `${k.title} (${k.meta})`).join(", ")}. Najbrže je preko forme iznad, sa izabranom temom „Ponuda za firmu“.
        </>
      ),
    },
    {
      q: "Da li brendirate odeću kupljenu kod vas?",
      a: (
        <>
          Da, u sopstvenoj radionici: {printMethods.map((m) => m.name.toLowerCase()).join(", ")}. Više na stranici{" "}
          <Link href="/brendiranje-odece/" className="text-primary underline underline-offset-2">Brendiranje odeće</Link>.
        </>
      ),
    },
    {
      q: "Kako da reklamiram proizvod?",
      a: (
        <>
          Postupak je opisan na stranici{" "}
          <Link href="/reklamacija-proizvoda/" className="text-primary underline underline-offset-2">Reklamacija proizvoda</Link>. Ako nešto nije jasno, pozovite nas na{" "}
          <a href={s.phoneHref} className="text-primary underline underline-offset-2">{s.phone}</a>.
        </>
      ),
    },
  ];

  return (
    <>
      <main>
        {/* 1. uvod */}
        <section className="relative overflow-hidden bg-primary text-white">
          {/* pozadina: fotografija prodavnice crno-bela i prigušena, tamni prelaz sleva (tekst) i odozdo (kartice), blagi žuti sjaj */}
          <Image src="/images/photo/prodavnica.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_35%] opacity-[0.22] grayscale" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary via-primary/75 to-primary/20" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-brand/15 blur-[120px]" />

          <div className="container-site relative pb-12 pt-16 md:pb-16 md:pt-24 xl:pb-20 xl:pt-32">
            <div className="hero-in max-w-[920px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[12px] uppercase tracking-[0.18em] text-white/60">Kontakt</span>
                <StatusRadnje week={s.week} tamno />
              </div>
              <h1 className="mt-6 text-[44px] font-medium leading-[1.02] tracking-[-0.03em] md:text-[64px] xl:text-[84px]">
                Razgovarajmo o opremi <span className="text-brand">za vaš tim.</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-[16px] leading-[26px] text-white/70 md:text-[17px] md:leading-[28px]">
                {s.description ||
                  "Pitanje o veličini, ponuda za celu firmu ili logo na radnoj odeći - pozovite, pišite ili svratite u radnju u Svilajncu."}
              </p>
            </div>
          </div>

          {/* tri kartice za brz kontakt */}
          <div className="container-site relative pb-14 md:pb-20">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              {brzo.map(({ kicker, vrednost, opis, href, Icon }) => (
                <a
                  key={kicker}
                  href={href}
                  className="group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-[4px] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-brand hover:bg-brand hover:text-on-brand md:min-h-[210px] md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-full bg-white/10 transition duration-300 group-hover:bg-on-brand group-hover:text-brand">
                      <Icon width={19} height={19} strokeWidth={1.6} />
                    </span>
                    {STRELICA}
                  </div>
                  <div className="mt-8">
                    <p className="text-[12px] uppercase tracking-[0.18em] text-white/55 transition group-hover:text-on-brand/70">{kicker}</p>
                    <p className="mt-2 break-all text-[22px] font-medium leading-tight tracking-[-0.01em] md:text-[24px]">{vrednost}</p>
                    <p className="mt-1.5 text-[14px] text-white/55 transition group-hover:text-on-brand/70">{opis}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 2. forma */}
        <section className="container-site py-16 md:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">Pišite nam</p>
              <h2 className="h-section mt-3">Pošaljite upit, mi preuzimamo dalje.</h2>
              <p className="p-muted mt-5 max-w-[460px] text-[15px]">
                Odgovaramo radnim danom. Za firme pripremamo kompletnu ponudu, sa brendiranjem i rokom isporuke.
              </p>

              <ol className="mt-10 border-t border-subtle">
                {companySteps.map((k, i) => (
                  <li key={k.title} className="grid grid-cols-[56px_1fr] items-baseline border-b border-subtle py-5">
                    <span className="text-[28px] font-medium leading-none tracking-[-0.02em] text-brand-active">0{i + 1}</span>
                    <div>
                      <h3 className="text-[17px] font-medium leading-snug">{k.title}</h3>
                      <p className="p-muted mt-0.5">{k.meta}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex items-center gap-4 rounded-[4px] bg-surface p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft">
                  <Phone width={19} height={19} strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] text-secondary">Radije telefonom?</p>
                  <a href={s.phoneHref} className="text-[18px] font-medium hover:underline">{s.phone}</a>
                </div>
              </div>
            </div>

            <div id="ponuda" className="scroll-mt-28 rounded-[4px] bg-surface p-6 shadow-[0_30px_60px_-40px_rgba(32,33,36,0.35)] md:p-10 xl:p-12">
              <KontaktForma />
            </div>
          </div>
        </section>

        {/* 3. mapa */}
        <section id="mapa" className="container-site scroll-mt-24">
          <div className="relative overflow-hidden rounded-[4px] bg-surface">
            <div className="h-[380px] md:h-[480px] lg:h-[600px]">
              <Mapa name={s.name} />
            </div>

            <div className="border-t border-subtle p-6 md:p-8 lg:absolute lg:left-6 lg:top-6 lg:w-[400px] lg:rounded-[4px] lg:border-0 lg:bg-surface lg:shadow-[0_30px_60px_-30px_rgba(32,33,36,0.45)]">
              <p className="kicker">Radnja</p>
              <h2 className="mt-2 text-[26px] font-medium leading-tight tracking-[-0.01em]">{s.name} Svilajnac</h2>
              <p className="mt-2 text-[15px] text-secondary">
                {s.street}, {s.city}
              </p>
              <div className="mt-5">
                <StatusRadnje week={s.week} />
              </div>
              <div className="mt-5 border-t border-subtle pt-4">
                <RadnoVremeTabela week={s.week} hours={s.hours} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={navigacija} target="_blank" rel="noreferrer" className="btn-primary">
                  Navigacija
                </a>
                <a href={s.phoneHref} className="btn-secondary">
                  Pozovite
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. podaci o firmi */}
        <section className="container-site pt-16 md:pt-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Za fakturu i porudžbenicu</p>
              <h2 className="h-section mt-3">Podaci o firmi</h2>
            </div>
            {mreze.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-secondary">Pratite nas</span>
                {mreze.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-subtle bg-surface transition hover:border-brand hover:bg-brand">
                    <Icon width={16} height={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[4px] bg-subtle sm:grid-cols-2 lg:grid-cols-3">
            {podaci.map((p) => (
              <div key={p.label} className="flex items-center justify-between gap-4 bg-surface px-5 py-5 md:px-6">
                <div className="min-w-0">
                  <dt className="text-[12px] uppercase tracking-[0.14em] text-secondary">
                    {p.label}
                    {"banka" in p && p.banka && (
                      <>
                        <Razdvajac />
                        {p.banka}
                      </>
                    )}
                  </dt>
                  <dd className="mt-1 break-words text-[16px] font-medium tabular-nums">{p.vrednost}</dd>
                </div>
                <Kopiraj tekst={p.vrednost} label={p.label} />
              </div>
            ))}
          </dl>
        </section>

        {/* 5. česta pitanja */}
        <section className="container-site py-16 md:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 xl:gap-24">
            <div>
              <p className="eyebrow">Pre nego što pišete</p>
              <h2 className="h-section mt-3">Česta pitanja</h2>
              <p className="p-muted mt-5 max-w-[420px] text-[15px]">
                Niste našli odgovor? Pozovite nas na <a href={s.phoneHref} className="font-medium text-primary hover:underline">{s.phone}</a>.
              </p>
            </div>
            <div className="border-t border-subtle">
              {pitanja.map((p) => (
                <details key={p.q} className="group border-b border-subtle">
                  <summary className="flex list-none items-center justify-between gap-6 py-5 text-[17px] font-medium leading-snug md:py-6 md:text-[18px] [&::-webkit-details-marker]:hidden">
                    {p.q}
                    <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-subtle transition group-open:border-brand group-open:bg-brand">
                      <span className="absolute h-px w-3.5 bg-current" />
                      <span className="absolute h-3.5 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:scale-0" />
                    </span>
                  </summary>
                  <p className="p-muted max-w-[640px] pb-6 pr-14 text-[15px] leading-[25px]">{p.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
