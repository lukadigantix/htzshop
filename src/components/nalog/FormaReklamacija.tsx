"use client";

import { podnesiReklamaciju, type Stanje } from "@/app/moj-nalog/actions";
import Razdvajac from "../Razdvajac";
import { Dugme, Greska, LABELA, oznacena, Polje, POLJE, POLJE_GRESKA, useForma } from "./Polja";

export type PorudzbinaZaIzbor = { id: string; orderNumber: string; datum: string; iznos: string };

/** Naslov i opis; porudžbina je već izabrana (dugme sa strane porudžbine) ili se bira iz onih u roku. */
export default function FormaReklamacija({ porudzbine, izabrana }: { porudzbine: PorudzbinaZaIzbor[]; izabrana?: string }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(podnesiReklamaciju, undefined);
  const g = oznacena(stanje);
  const fiksna = porudzbine.find((p) => p.id === izabrana);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="orderId" className={`${LABELA} ${g.has("orderId") ? "text-error" : ""}`}>
          Porudžbina
        </label>
        {fiksna ? (
          <>
            <input type="hidden" name="orderId" value={fiksna.id} />
            <p className="flex h-12 items-center rounded-[4px] bg-page px-4 text-[15px]">
              <b className="font-semibold">#{fiksna.orderNumber}</b>
              <span className="ml-2 text-secondary">
                {fiksna.datum}
                <Razdvajac />
                {fiksna.iznos}
              </span>
            </p>
          </>
        ) : (
          <select id="orderId" name="orderId" required defaultValue="" aria-invalid={g.has("orderId") || undefined} className={`${POLJE} appearance-none ${g.has("orderId") ? POLJE_GRESKA : ""}`}>
            <option value="" disabled>
              Izaberite porudžbinu
            </option>
            {porudzbine.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.orderNumber}, {p.datum}, {p.iznos}
              </option>
            ))}
          </select>
        )}
        <p className="mt-1.5 text-[12.5px] text-secondary">Reklamacija je moguća do 14 dana od porudžbine, jedna po porudžbini.</p>
      </div>

      <Polje label="Naslov" name="subject" required minLength={5} maxLength={120} placeholder="Npr. stigla pogrešna veličina" greska={g.has("subject")} poruka="Najmanje 5 znakova." pomoc="Najmanje 5 znakova." pokusaj={pokusaj} />

      <div>
        <label htmlFor="description" className={`${LABELA} ${g.has("description") ? "text-error" : ""}`}>
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          aria-invalid={g.has("description") || undefined}
          placeholder="Šta je stiglo, šta nije u redu, kada je isporučeno…"
          className={`${POLJE} h-auto resize-y py-3 leading-[22px] ${g.has("description") ? POLJE_GRESKA : ""}`}
        />
        <p className={`mt-1.5 text-[12.5px] ${g.has("description") ? "font-medium text-error" : "text-secondary"}`}>Najmanje 20 znakova. Fotografije pošaljite na e-mail, uz broj porudžbine.</p>
      </div>

      <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
      <Dugme salje={salje} radi="Šaljemo…" className="sm:w-auto">
        Pošaljite reklamaciju
      </Dugme>
    </form>
  );
}
