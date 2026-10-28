"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Building2, CircleAlert, Landmark, LoaderCircle, MapPin, Plus, QrCode, Store, Truck, User, Wallet } from "lucide-react";
import { naruci, preracunaj, type Izbor, type StanjeNaplate } from "@/app/korpa/actions";
import { DOGADJAJ_KORPA, varijanta, type NacinPlacanja, type Obracun, type TipIsporuke, type TipKupca } from "@/lib/korpa-deo";
import { rsd } from "@/lib/filteri";
import type { Adresa, Korisnik } from "@/lib/nalog-deo";
import type { Sajt } from "@/lib/sajt";
import { RadnoVremeTabela } from "../kontakt/Radnja";
import { ArrowRight } from "../Icons";
import Koraci from "./Koraci";
import Potvrda from "./Potvrda";

/*
  Naplata (po uzoru na klikdogume components/korpa/naplata.tsx, bez kartice - HTZ backend je nema):
  01 kupac (fizičko lice ili firma), 02 isporuka (adresa sa kurirskom službom ili lično preuzimanje u radnji),
  03 plaćanje (pouzećem, IPS QR kod, uplata na račun), napomena i saglasnost. Desno pregled sa stavkama i iznosom.
  Svaka promena isporuke, plaćanja ili službe ponovo obračunava korpu na serveru (cena dostave zavisi od njih).
  Posle uspešne akcije `naruci` korpa je obrisana, a ista komponenta crta potvrdu.
  Prijavljenom kupcu su ime, telefon i e-mail već upisani, a sačuvane adrese bira karticom; porudžbina ide na njegov nalog.
  Akcija se šalje iz onSubmit, ne kroz `<form action>`: tako React ne prazni polja posle greške u formi.
*/

const POLJE =
  "h-12 w-full rounded-[4px] border bg-page px-4 text-[15px] text-primary outline-none transition placeholder:text-[#9a9ea5] hover:border-input focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)]";
const LABELA = "mb-1.5 block text-[13px] font-medium";

function Polje({ name, label, greska, className = "", ...rest }: { name: string; label: string; greska: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={LABELA}>{label}</span>
      <input name={name} aria-invalid={greska || undefined} className={`${POLJE} ${greska ? "border-sale bg-[#fdecea]" : "border-subtle"}`} {...rest} />
    </label>
  );
}

function Sekcija({ broj, naslov, opis, children }: { broj: string; naslov: string; opis?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[6px] bg-surface p-5 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] md:p-8">
      <div className="flex items-baseline gap-3">
        <span className="text-[13px] font-semibold tabular-nums text-brand-active">{broj}</span>
        <h2 className="text-[20px] font-semibold leading-tight md:text-[22px]">{naslov}</h2>
      </div>
      {opis && <p className="mt-1 pl-[34px] text-[14px] text-secondary">{opis}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Kartica-izbor (radio): ceo okvir je klikabilan, izabrana je tamna sa žutom ikonom - kao teme u kontakt formi. */
function Izbor<T extends string>({ name, value, izabrano, onIzbor, Icon, naslov, opis, desno }: { name: string; value: T; izabrano: T; onIzbor: (v: T) => void; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; naslov: string; opis: string; desno?: React.ReactNode }) {
  const on = izabrano === value;
  return (
    <label className={`group flex cursor-pointer items-center gap-4 rounded-[6px] border p-4 transition has-[:focus-visible]:shadow-[0_0_0_4px_rgba(245,197,24,0.35)] ${on ? "border-primary bg-primary text-white" : "border-subtle bg-surface hover:border-input"}`}>
      <input type="radio" name={name} value={value} checked={on} onChange={() => onIzbor(value)} className="sr-only" />
      <span className={`grid size-11 shrink-0 place-items-center rounded-full transition ${on ? "bg-brand text-on-brand" : "bg-page text-primary group-hover:bg-brand-soft"}`}>
        <Icon className="size-5" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{naslov}</span>
        <span className={`mt-1 block text-[13px] leading-[18px] ${on ? "text-white/65" : "text-secondary"}`}>{opis}</span>
      </span>
      {desno && <span className={`shrink-0 text-right text-[14px] font-semibold tabular-nums ${on ? "text-brand" : ""}`}>{desno}</span>}
    </label>
  );
}

type Props = { pocetni: Obracun; kupon: string; sajt: Sajt; korisnik: Korisnik | null; adrese: Adresa[] };

export default function Naplata({ pocetni, kupon, sajt, korisnik, adrese }: Props) {
  const [stanje, posalji, salje] = useActionState<StanjeNaplate, FormData>(naruci, undefined);
  const [, startSlanje] = useTransition();
  const [ob, setOb] = useState(pocetni);
  const [racuna, start] = useTransition();
  // sačuvana adresa (id) ili „nova"; glavna adresa je izabrana unapred
  const [adresaId, setAdresaId] = useState<string>(adrese.find((a) => a.isDefault)?.id ?? adrese[0]?.id ?? "nova");
  const sacuvana = adrese.find((a) => a.id === adresaId) ?? null;
  const [kupac, setKupac] = useState<TipKupca>("fizicko");
  const [izbor, setIzbor] = useState<Izbor>({ deliveryType: "adresa", paymentMethod: "pouzece", courier: pocetni.courier ?? undefined });
  const forma = useRef<HTMLFormElement>(null);

  const promeni = (novo: Partial<Izbor>) => {
    const sledeci = { ...izbor, ...novo };
    setIzbor(sledeci);
    start(async () => {
      const r = await preracunaj(sledeci);
      if (r) {
        setOb(r);
        // služba koju je backend obračunao (izabrana ili najjeftinija)
        if (sledeci.deliveryType === "adresa" && r.courier && r.courier !== sledeci.courier) setIzbor((x) => ({ ...x, courier: r.courier ?? undefined }));
      }
    });
  };

  const greske = new Set(stanje && !stanje.ok ? (stanje.polja ?? []) : []);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startSlanje(() => posalji(fd));
  };

  // posle neuspeha: prvo označeno polje u fokus; posle uspeha: bedž korpe na 0 i potvrda od vrha
  useEffect(() => {
    if (!stanje) return;
    if (stanje.ok) {
      window.dispatchEvent(new Event(DOGADJAJ_KORPA));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const prvo = forma.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    prvo?.focus();
  }, [stanje]);

  if (stanje?.ok) return <Potvrda p={stanje.porudzbina} sajt={sajt} prijavljen={!!korisnik} />;

  if (ob.items.length === 0) {
    return (
      <>
        <Koraci aktivan={1} />
        <div className="mt-8 rounded-[6px] bg-surface px-6 py-14 text-center">
          <h1 className="text-[30px] font-semibold tracking-[-0.02em]">Korpa je prazna</h1>
          <p className="p-muted mt-2 text-[15px]">Dodajte artikle u korpu, pa se vratite na porudžbinu.</p>
          <Link href="/prodavnica/" className="btn-primary mt-7" style={{ height: 50, padding: "0 28px", fontSize: 15 }}>
            Idite u prodavnicu
          </Link>
        </div>
      </>
    );
  }

  const adresa = izbor.deliveryType === "adresa";
  const broj = ob.items.reduce((n, s) => n + s.quantity, 0);
  const kurir = ob.couriers.find((k) => k.courier === ob.courier) ?? null;
  // dostava na adresu bez cene za neki artikal (cenovnik u adminu) - poruka i predlog da se izabere preuzimanje
  const bezDostave = adresa && !ob.canOrder && (ob.couriers.length === 0 || kurir?.priced === false);
  const PLACANJA: { value: NacinPlacanja; Icon: typeof Wallet; naslov: string; opis: string }[] = [
    { value: "pouzece", Icon: Wallet, naslov: adresa ? "Pouzećem" : "Pri preuzimanju", opis: adresa ? "Plaćate kuriru gotovinom kad paket stigne." : "Plaćate u radnji kad preuzimate porudžbinu." },
    { value: "ips", Icon: QrCode, naslov: "IPS QR kod", opis: "Skenirate kod u aplikaciji svoje banke. Šaljemo čim uplata stigne." },
    { value: "uplata_na_racun", Icon: Landmark, naslov: "Uplata na račun", opis: "Uplatnica sa svim podacima stiže odmah. Pogodno za firme." },
  ];

  return (
    <>
      <Koraci aktivan={1} />
      <h1 className="mt-8 text-[36px] font-semibold leading-none tracking-[-0.03em] md:text-[48px]">Podaci i isporuka</h1>

      {korisnik ? (
        <p className="mt-4 text-[14px] leading-[24px] text-secondary">
          <span className="mr-2 inline-grid size-6 place-items-center rounded-full bg-primary align-middle text-[10px] font-semibold text-brand">{`${korisnik.firstName[0] ?? ""}${korisnik.lastName[0] ?? ""}`.toUpperCase()}</span>
          Poručujete kao <b className="font-semibold text-primary">{korisnik.firstName} {korisnik.lastName}</b>. Porudžbina će biti u vašem nalogu.
        </p>
      ) : (
        <p className="mt-4 text-[14px] text-secondary">
          Imate nalog?{" "}
          <Link href="/prijava/?nazad=/porudzbina/" className="font-medium text-primary underline underline-offset-2">
            Prijavite se
          </Link>{" "}
          i podaci su već upisani. Možete poručiti i bez naloga.
        </p>
      )}

      <form ref={forma} onSubmit={onSubmit} noValidate className="mt-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
        <input type="hidden" name="courier" value={adresa ? (izbor.courier ?? "") : ""} />
        <div className="space-y-5">
          <Sekcija broj="01" naslov="Vaši podaci" opis="Na e-mail šaljemo potvrdu, a telefonom vas zovemo ako nešto treba proveriti.">
            <div role="radiogroup" aria-label="Kupujete kao" className="inline-flex rounded-full bg-page p-1 ring-1 ring-subtle">
              {(
                [
                  ["fizicko", "Fizičko lice", User],
                  ["pravno", "Firma", Building2],
                ] as const
              ).map(([v, naziv, Icon]) => (
                <button key={v} type="button" role="radio" aria-checked={kupac === v} onClick={() => setKupac(v)} className={`flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold transition ${kupac === v ? "bg-primary text-white" : "text-secondary hover:text-primary"}`}>
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                  {naziv}
                </button>
              ))}
            </div>
            <input type="hidden" name="customerType" value={kupac} />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Polje name="guestName" label="Ime i prezime" autoComplete="name" defaultValue={korisnik ? `${korisnik.firstName} ${korisnik.lastName}`.trim() : undefined} greska={greske.has("guestName")} className="sm:col-span-2" />
              <Polje name="guestPhone" label="Telefon" type="tel" inputMode="tel" autoComplete="tel" placeholder="06x xxx xxxx" defaultValue={korisnik?.phone ?? undefined} greska={greske.has("guestPhone")} />
              <Polje name="guestEmail" label="E-mail" type="email" inputMode="email" autoComplete="email" defaultValue={korisnik?.email} greska={greske.has("guestEmail")} />
              {/* polja firme i adrese se sakrivaju, ne uklanjaju - upisano ostaje kad kupac menja izbor; server ih čita samo kad važe */}
              <div className={kupac === "pravno" ? "contents" : "hidden"}>
                  <Polje name="companyName" label="Naziv firme" autoComplete="organization" greska={greske.has("companyName")} className="sm:col-span-2" />
                  <Polje name="pib" label="PIB" inputMode="numeric" maxLength={9} placeholder="9 cifara" greska={greske.has("pib")} />
                  <Polje name="mb" label="Matični broj (nije obavezno)" inputMode="numeric" maxLength={8} greska={false} />
              </div>
            </div>
          </Sekcija>

          <Sekcija broj="02" naslov="Isporuka">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Izbor<TipIsporuke> name="deliveryType" value="adresa" izabrano={izbor.deliveryType} onIzbor={(v) => promeni({ deliveryType: v })} Icon={Truck} naslov="Dostava na adresu" opis="Kurirskom službom, širom Srbije" />
              <Izbor<TipIsporuke> name="deliveryType" value="preuzimanje" izabrano={izbor.deliveryType} onIzbor={(v) => promeni({ deliveryType: v })} Icon={Store} naslov="Lično preuzimanje" opis={`${sajt.street}, Svilajnac`} desno="Besplatno" />
            </div>

            {/* sačuvane adrese iz naloga: izbor popunjava polja ispod (key ih ponovo postavlja), „Nova adresa" ih prazni */}
            {adresa && adrese.length > 0 && (
              <fieldset className="mt-6">
                <legend className={LABELA}>Sačuvane adrese</legend>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {adrese.map((a) => (
                    <Izbor<string> key={a.id} name="sacuvanaAdresa" value={a.id} izabrano={adresaId} onIzbor={setAdresaId} Icon={MapPin} naslov={a.address} opis={`${a.zipCode} ${a.city}`} />
                  ))}
                  <Izbor<string> name="sacuvanaAdresa" value="nova" izabrano={adresaId} onIzbor={setAdresaId} Icon={Plus} naslov="Druga adresa" opis="Upišite je ispod" />
                </div>
              </fieldset>
            )}

            <div key={adresaId} className={`mt-5 grid-cols-1 gap-4 sm:grid-cols-[1fr_140px_1fr] ${adresa ? "grid" : "hidden"}`}>
              <Polje name="shippingAddress" label="Ulica i broj" autoComplete="street-address" defaultValue={sacuvana?.address} greska={greske.has("shippingAddress")} className="sm:col-span-3" />
              <Polje name="shippingZipCode" label="Poštanski broj" inputMode="numeric" maxLength={5} autoComplete="postal-code" defaultValue={sacuvana?.zipCode} greska={greske.has("shippingZipCode")} />
              <Polje name="shippingCity" label="Mesto" autoComplete="address-level2" defaultValue={sacuvana?.city} greska={greske.has("shippingCity")} className="sm:col-span-2" />
            </div>

            {adresa ? (
              <>

                {ob.couriers.length > 0 && (
                  <fieldset className="mt-6">
                    <legend className={LABELA}>Kurirska služba</legend>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {ob.couriers.map((k) => (
                        <Izbor<string>
                          key={k.courier}
                          name="kurir"
                          value={k.courier}
                          izabrano={izbor.courier ?? ""}
                          onIzbor={(v) => promeni({ courier: v })}
                          Icon={Truck}
                          naslov={k.label}
                          opis={k.priced === false ? "Nema cenu za sve artikle" : "Dostava na adresu"}
                          desno={k.priced === false ? "-" : k.cost === 0 ? "Besplatno" : rsd(k.cost)}
                        />
                      ))}
                    </div>
                  </fieldset>
                )}

                {bezDostave && (
                  <div className="mt-5 flex flex-col gap-3 rounded-[6px] bg-[#fff4e5] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-2.5 text-[14px] leading-[21px]">
                      <CircleAlert className="mt-0.5 size-[18px] shrink-0 text-warning" strokeWidth={2} aria-hidden />
                      <span>
                        Za ove artikle dostavu dogovaramo telefonom: pozovite{" "}
                        <a href={sajt.phoneHref} className="font-semibold underline underline-offset-2">
                          {sajt.phone}
                        </a>{" "}
                        ili izaberite lično preuzimanje.
                      </span>
                    </p>
                    <button type="button" onClick={() => promeni({ deliveryType: "preuzimanje" })} className="h-10 shrink-0 rounded-full bg-primary px-4 text-[14px] font-semibold text-white">
                      Lično preuzimanje
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-5 rounded-[6px] bg-page p-5 sm:grid-cols-2">
                <div>
                  <p className="kicker">Preuzimanje u radnji</p>
                  <p className="mt-2 text-[17px] font-semibold">{sajt.name}</p>
                  <p className="text-[15px] text-secondary">
                    {sajt.street}, {sajt.city}
                  </p>
                  <p className="mt-3 text-[14px] leading-[21px] text-secondary">Javljamo vam telefonom kad je porudžbina spremna. Ponesite broj porudžbine.</p>
                </div>
                <RadnoVremeTabela week={sajt.week} hours={sajt.hours} />
              </div>
            )}
          </Sekcija>

          <Sekcija broj="03" naslov="Plaćanje">
            <div className="grid grid-cols-1 gap-2.5">
              {PLACANJA.map((p) => (
                <Izbor<NacinPlacanja> key={p.value} name="paymentMethod" value={p.value} izabrano={izbor.paymentMethod} onIzbor={(v) => promeni({ paymentMethod: v })} Icon={p.Icon} naslov={p.naslov} opis={p.opis} />
              ))}
            </div>

            <label className="mt-6 block">
              <span className={LABELA}>
                Napomena <span className="font-normal text-secondary">(nije obavezno)</span>
              </span>
              <textarea name="notes" rows={3} maxLength={1000} placeholder="Npr. veličine za tim, vreme kad ste dostupni za kurira…" className={`${POLJE} h-auto resize-y border-subtle py-3 leading-[22px]`} />
            </label>
          </Sekcija>
        </div>

        {/* pregled */}
        <aside aria-label="Pregled porudžbine" className="overflow-hidden rounded-[6px] bg-surface shadow-[0_30px_60px_-40px_rgba(32,33,36,0.45)] lg:sticky lg:top-28">
          <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_12px,var(--text-primary)_12px_24px)]" />
          <div className="p-5 md:p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[20px] font-semibold">Vaša porudžbina</h2>
              <Link href="/korpa/" className="text-[13px] font-medium text-secondary underline-offset-2 hover:text-primary hover:underline">
                Izmeni korpu
              </Link>
            </div>

            {/* pt-2: bedž količine viri iznad slike, a overflow-y-auto bi ga odsekao */}
            <ul className="mt-2 max-h-[300px] space-y-3 overflow-y-auto pr-1 pt-2">
              {ob.items.map((s) => (
                <li key={s.productId} className="flex items-center gap-3">
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-[4px] bg-white ring-1 ring-subtle">
                    {s.product.image && (
                      // eslint-disable-next-line @next/next/no-img-element -- slika sa backenda
                      <img src={s.product.image} alt="" className="size-full object-contain p-1" />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-white">{s.quantity}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14px] font-medium leading-snug">{s.product.name}</span>
                    {varijanta(s.product) && <span className="block text-[12px] text-secondary">{varijanta(s.product)}</span>}
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums">{rsd(s.itemTotal)}</span>
                </li>
              ))}
            </ul>

            <dl aria-busy={racuna} className={`mt-5 space-y-2.5 border-t border-subtle pt-5 text-[15px] transition-opacity ${racuna ? "opacity-50" : ""}`}>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Artikli ({broj} kom)</dt>
                <dd className="font-medium tabular-nums">{rsd(ob.subtotal)}</dd>
              </div>
              {ob.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-secondary">Popust{kupon ? ` (${kupon})` : ""}</dt>
                  <dd className="font-semibold tabular-nums text-success">− {rsd(ob.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">{adresa ? `Dostava${kurir ? ` (${kurir.label})` : ""}` : "Lično preuzimanje"}</dt>
                <dd className={`font-medium tabular-nums ${!adresa || (ob.shippingCost === 0 && !bezDostave) ? "text-success" : bezDostave ? "text-secondary" : ""}`}>
                  {!adresa ? "Besplatno" : bezDostave ? "po dogovoru" : ob.shippingCost === 0 ? "Besplatno" : rsd(ob.shippingCost)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-subtle pt-5">
              <span className="text-[15px] font-semibold">Ukupno</span>
              <span className="flex items-center gap-2 text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {racuna && <LoaderCircle className="size-5 animate-spin text-secondary" aria-hidden />}
                {ob.total.toLocaleString("sr-RS").replace(/,/g, ".")}
                <span className="text-[15px] font-semibold tracking-normal text-secondary">RSD</span>
              </span>
            </div>
            {ob.vat && <p className="mt-1.5 text-right text-[12px] text-secondary">PDV {ob.vat.rate}% je uračunat: {rsd(ob.vat.amount)}</p>}

            <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-[4px] p-1 text-[13px] leading-[19px] ${greske.has("uslovi") ? "bg-[#fdecea] ring-1 ring-sale" : ""}`}>
              <input type="checkbox" name="uslovi" value="1" aria-invalid={greske.has("uslovi") || undefined} className="mt-0.5 size-[18px] shrink-0 accent-[var(--text-primary)]" />
              <span className="text-secondary">
                Pročitao/la sam i prihvatam{" "}
                <Link href="/uslovi-koriscenja/" target="_blank" className="text-primary underline underline-offset-2">
                  uslove korišćenja
                </Link>
                ,{" "}
                <Link href="/placanje-i-isporuka/" target="_blank" className="text-primary underline underline-offset-2">
                  uslove plaćanja i isporuke
                </Link>
                ,{" "}
                <Link href="/pravo-na-odustajanje/" target="_blank" className="text-primary underline underline-offset-2">
                  pravo na odustajanje
                </Link>{" "}
                i{" "}
                <Link href="/politika-privatnosti/" target="_blank" className="text-primary underline underline-offset-2">
                  politiku privatnosti
                </Link>
                .
              </span>
            </label>

            {stanje && !stanje.ok && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-[4px] bg-[#fdecea] px-3.5 py-3 text-[14px] leading-[20px] text-error">
                <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
                {stanje.greska}
              </p>
            )}

            <button
              type="submit"
              disabled={salje || racuna || !ob.canOrder}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand text-[16px] font-semibold text-on-brand shadow-[0_14px_28px_-12px_rgba(245,197,24,0.95)] transition hover:bg-brand-hover disabled:bg-disabled disabled:text-secondary disabled:shadow-none"
            >
              {salje ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  Šaljemo porudžbinu…
                </>
              ) : (
                <>
                  Potvrdite porudžbinu
                  <ArrowRight width={16} height={16} strokeWidth={2} />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[12px] text-secondary">Porudžbina je obavezujuća. Potvrdu dobijate na e-mail.</p>
          </div>
        </aside>
      </form>
    </>
  );
}
