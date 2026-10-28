"use client";

import { useEffect, useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { obrisiAdresu, postaviPodrazumevanu, sacuvajAdresu, type Stanje } from "@/app/moj-nalog/actions";
import type { Adresa } from "@/lib/nalog-deo";
import Razdvajac from "../Razdvajac";
import { Dugme, Greska, oznacena, Polje, useForma } from "./Polja";

const MAX = 3;

/**
 * Adrese za dostavu (najviše tri, backend): kartice sa „glavna", izmena u istoj kartici, brisanje uz potvrdu u kartici,
 * nova adresa. Posle svake akcije strana se ponovo crta sa listom sa servera (glavna je uvek prva).
 */
export default function Adrese({ adrese, predlog }: { adrese: Adresa[]; predlog: { ime: string; telefon: string } }) {
  const [uredi, setUredi] = useState<string | null>(adrese.length === 0 ? "nova" : null);
  const [brise, setBrise] = useState<string | null>(null);
  const [ceka, start] = useTransition();

  return (
    <div aria-busy={ceka} className={`transition-opacity ${ceka ? "opacity-60" : ""}`}>
      {adrese.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {adrese.map((a) =>
            uredi === a.id ? (
              <li key={a.id} className="md:col-span-2">
                <Forma adresa={a} onGotovo={() => setUredi(null)} />
              </li>
            ) : (
              <li key={a.id} className={`relative flex flex-col overflow-hidden rounded-[6px] bg-surface p-5 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ${a.isDefault ? "ring-2 ring-primary" : "ring-1 ring-subtle"}`}>
                {a.isDefault && <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_10px,var(--text-primary)_10px_20px)]" />}
                <div className="flex items-start gap-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${a.isDefault ? "bg-primary text-brand" : "bg-page text-primary"}`}>
                    <MapPin className="size-[18px]" strokeWidth={1.8} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-[16px] font-medium">{a.address}</p>
                    <p className="mt-1 text-[14px] text-secondary">
                      {a.zipCode} {a.city}
                    </p>
                    <p className="mt-2 text-[13px] text-secondary">
                      {a.fullName}
                      <Razdvajac />
                      {a.phone}
                    </p>
                  </div>
                  {a.isDefault && <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-brand">Glavna</span>}
                </div>

                {brise === a.id ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[4px] bg-[#fdecea] px-3 py-2.5 text-[14px]">
                    <span className="mr-auto font-medium text-error">Obrisati ovu adresu?</span>
                    <button type="button" onClick={() => setBrise(null)} className="h-9 rounded-full px-4 font-medium text-secondary hover:text-primary">
                      Ne
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBrise(null);
                        start(() => obrisiAdresu(a.id));
                      }}
                      className="h-9 rounded-full bg-error px-4 font-medium text-white"
                    >
                      Da, obriši
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-1 border-t border-subtle pt-3">
                    <Akcija Icon={Pencil} onClick={() => setUredi(a.id)}>
                      Izmeni
                    </Akcija>
                    {!a.isDefault && (
                      <Akcija Icon={Star} onClick={() => start(() => postaviPodrazumevanu(a.id))}>
                        Postavi kao glavnu
                      </Akcija>
                    )}
                    <Akcija Icon={Trash2} onClick={() => setBrise(a.id)} className="ml-auto hover:text-error">
                      Obriši
                    </Akcija>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {uredi === "nova" ? (
        <div className={adrese.length > 0 ? "mt-5" : ""}>
          <Forma adresa={null} predlog={predlog} onGotovo={() => setUredi(null)} mozeOdustati={adrese.length > 0} />
        </div>
      ) : adrese.length < MAX ? (
        <button type="button" onClick={() => setUredi("nova")} className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-white transition hover:bg-[#3a3d42]">
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          Nova adresa
        </button>
      ) : (
        <p className="mt-5 text-[14px] text-secondary">Sačuvane su tri adrese, koliko je najviše moguće. Obrišite jednu da biste dodali novu.</p>
      )}
    </div>
  );
}

function Akcija({ Icon, onClick, className = "", children }: { Icon: typeof Pencil; onClick: () => void; className?: string; children: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-secondary transition hover:bg-page hover:text-primary ${className}`}>
      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      {children}
    </button>
  );
}

function Forma({ adresa, predlog, onGotovo, mozeOdustati = true }: { adresa: Adresa | null; predlog?: { ime: string; telefon: string }; onGotovo: () => void; mozeOdustati?: boolean }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(sacuvajAdresu, undefined);
  const g = oznacena(stanje);
  useEffect(() => {
    if (stanje?.ok) onGotovo();
  }, [stanje, onGotovo]);

  return (
    <form onSubmit={onSubmit} noValidate className="overflow-hidden rounded-[6px] bg-surface shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ring-1 ring-subtle">
      <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_10px,var(--text-primary)_10px_20px)]" />
      <div className="p-5 md:p-7">
        {adresa && <input type="hidden" name="id" value={adresa.id} />}
        <p className="text-[18px] font-semibold">{adresa ? "Izmena adrese" : "Nova adresa"}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Polje label="Ime i prezime ili naziv firme" name="fullName" autoComplete="name" defaultValue={adresa?.fullName ?? predlog?.ime} required greska={g.has("fullName")} pokusaj={pokusaj} />
          <Polje label="Telefon za kurira" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={adresa?.phone ?? predlog?.telefon} required greska={g.has("phone")} pokusaj={pokusaj} />
          <Polje label="Ulica i broj" name="address" autoComplete="street-address" defaultValue={adresa?.address} required greska={g.has("address")} className="sm:col-span-2" pokusaj={pokusaj} />
          <Polje label="Poštanski broj" name="zipCode" inputMode="numeric" maxLength={5} autoComplete="postal-code" placeholder="35210" defaultValue={adresa?.zipCode} required greska={g.has("zipCode")} poruka="Pet cifara." pokusaj={pokusaj} />
          <Polje label="Mesto" name="city" autoComplete="address-level2" defaultValue={adresa?.city} required greska={g.has("city")} pokusaj={pokusaj} />
        </div>
        {!adresa?.isDefault && (
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px]">
            <input type="checkbox" name="isDefault" value="1" className="size-[18px] accent-[var(--text-primary)]" />
            Glavna adresa (na naplati je već izabrana)
          </label>
        )}
        <div className="mt-5">
          <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Dugme salje={salje} radi="Čuvamo…" className="sm:w-auto">
            {adresa ? "Sačuvajte izmene" : "Sačuvajte adresu"}
          </Dugme>
          {mozeOdustati && (
            <button type="button" onClick={onGotovo} className="h-13 rounded-full px-6 text-[15px] font-medium text-secondary transition hover:bg-page hover:text-primary">
              Odustanite
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
