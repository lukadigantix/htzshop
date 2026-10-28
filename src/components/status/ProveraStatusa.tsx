"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Search } from "lucide-react";
import { proveriStatus, type StanjeProvere } from "@/app/status-porudzbine/actions";
import DetaljPorudzbine, { type Radnja } from "../nalog/DetaljPorudzbine";
import { Dugme, Greska, oznacena, Polje, useForma } from "../nalog/Polja";
import { KARTICA } from "../nalog/stil";
import { rsd } from "@/lib/filteri";
import { datum, datumVreme } from "@/lib/nalog-deo";

/**
 * Provera statusa bez naloga: broj porudžbine i e-mail iz porudžbine → prikaz kao u nalogu (DetaljPorudzbine, `gost`).
 * Broj može da stigne iz linka u e-mailu (?broj=2026-0012). „Druga porudžbina" vraća praznu formu (novi ključ).
 */
export default function ProveraStatusa({ radnja, broj }: { radnja: Radnja; broj?: string }) {
  const [kljuc, setKljuc] = useState(0);
  return <Forma key={kljuc} radnja={radnja} broj={broj} ispocetka={() => setKljuc((k) => k + 1)} />;
}

function Forma({ radnja, broj, ispocetka }: { radnja: Radnja; broj?: string; ispocetka: () => void }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<StanjeProvere>(proveriStatus, undefined);
  const g = oznacena(stanje);

  if (stanje?.ok) {
    const { porudzbina: p, ime, posiljke, ips, rokUplate } = stanje.data;
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 lg:mb-5">
          <div>
            <p className="kicker">{ime ? `${ime}, ovo je vaša porudžbina` : "Vaša porudžbina"}</p>
            <h2 className="mt-2 text-[30px] font-medium leading-tight tracking-[-0.02em] md:text-[36px]">Porudžbina #{p.orderNumber}</h2>
            <p className="mt-1 text-[14px] text-secondary">Poručeno {datum(p.createdAt)}</p>
          </div>
          <button type="button" onClick={ispocetka} className="btn-secondary" style={{ height: 44, padding: "0 20px" }}>
            <Search className="size-4" strokeWidth={1.8} /> Druga porudžbina
          </button>
        </div>

        {ips && (
          <section aria-label="Uplata" className="mb-4 grid gap-5 rounded-[6px] bg-primary p-5 text-white md:grid-cols-[180px_1fr] md:items-center md:p-7 lg:mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR kod kao data URL sa backenda */}
            <img src={ips.dataUrl} alt="IPS QR kod za uplatu" className="size-[180px] rounded-[4px] bg-white p-2" />
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
                <QrCode className="size-4" strokeWidth={1.8} /> Čeka se uplata
              </p>
              <p className="mt-2 text-[30px] font-semibold leading-tight tabular-nums">{rsd(ips.amount)}</p>
              <p className="mt-2 text-[14px] leading-[22px] text-white/65">
                Skenirajte kod u aplikaciji banke ili platite na račun <b className="text-white">{ips.account}</b>, poziv na broj <b className="text-white">{ips.reference}</b>
                {rokUplate ? `, najkasnije do ${datumVreme(rokUplate)}` : ""}. Šaljemo čim uplata stigne.
              </p>
            </div>
          </section>
        )}

        <DetaljPorudzbine p={p} posiljke={posiljke} radnja={radnja} gost />

        <p className="mt-5 text-[14px] text-secondary">
          Sledeći put poručite uz{" "}
          <Link href="/registracija/" className="font-medium text-primary underline underline-offset-2">
            nalog
          </Link>{" "}
          i sve porudžbine pratite na jednom mestu, bez upisivanja broja.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`${KARTICA} space-y-5`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Polje
          label="Broj porudžbine"
          name="broj"
          required
          defaultValue={broj}
          placeholder="npr. 2026-0012"
          inputMode="numeric"
          autoComplete="off"
          greska={g.has("broj")}
          pomoc="Nalazi se u e-mailu potvrde porudžbine."
          pokusaj={pokusaj}
        />
        <Polje
          label="E-mail iz porudžbine"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus={Boolean(broj)}
          greska={g.has("email")}
          pomoc="Adresa koju ste upisali pri poručivanju."
          pokusaj={pokusaj}
        />
      </div>
      <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
      <Dugme salje={salje} radi="Proveravamo…" className="sm:w-auto">
        Proverite status
      </Dugme>
    </form>
  );
}
