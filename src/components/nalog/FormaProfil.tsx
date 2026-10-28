"use client";

import { izmeniProfil, promeniLozinku, type Stanje } from "@/app/moj-nalog/actions";
import type { Korisnik } from "@/lib/nalog-deo";
import { Dugme, Greska, oznacena, Polje, Uspeh, useForma } from "./Polja";

/** Ime, prezime i telefon (PUT /users/profile); e-mail je prijava i samo se prikazuje. */
export function FormaProfil({ k }: { k: Pick<Korisnik, "firstName" | "lastName" | "email" | "phone"> }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(izmeniProfil, undefined);
  const g = oznacena(stanje);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Polje label="Ime" name="firstName" autoComplete="given-name" defaultValue={k.firstName} required greska={g.has("firstName")} pokusaj={pokusaj} />
        <Polje label="Prezime" name="lastName" autoComplete="family-name" defaultValue={k.lastName} required greska={g.has("lastName")} pokusaj={pokusaj} />
      </div>
      <Polje label="E-mail" name="email" type="email" value={k.email} readOnly disabled pomoc="E-mail je vaša prijava i ne menja se. Ako mora, pozovite nas." />
      <Polje label="Telefon" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={k.phone ?? ""} required greska={g.has("phone")} poruka="Upišite broj sa najmanje 8 cifara." pomoc="Zovemo samo kad treba proveriti porudžbinu." pokusaj={pokusaj} />
      <Uspeh>{stanje?.ok ? stanje.poruka : undefined}</Uspeh>
      <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
      <Dugme salje={salje} radi="Čuvamo…" className="sm:w-auto">
        Sačuvajte podatke
      </Dugme>
    </form>
  );
}

/** Trenutna, nova i potvrda (PUT /users/change-password); posle uspeha forma se isprazni (key). */
export function FormaLozinka() {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(promeniLozinku, undefined);
  const g = oznacena(stanje);
  return (
    <form key={stanje?.ok ? pokusaj : "forma"} onSubmit={onSubmit} noValidate className="space-y-4">
      <Polje label="Trenutna lozinka" name="currentPassword" type="password" autoComplete="current-password" required greska={g.has("currentPassword")} pokusaj={pokusaj} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Polje label="Nova lozinka" name="newPassword" type="password" autoComplete="new-password" required minLength={8} greska={g.has("newPassword")} pomoc="Najmanje 8 znakova." pokusaj={pokusaj} />
        <Polje label="Ponovite novu lozinku" name="confirmPassword" type="password" autoComplete="new-password" required greska={g.has("confirmPassword")} pokusaj={pokusaj} />
      </div>
      <Uspeh>{stanje?.ok ? stanje.poruka : undefined}</Uspeh>
      <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
      <Dugme salje={salje} radi="Menjamo…" className="sm:w-auto">
        Promenite lozinku
      </Dugme>
    </form>
  );
}
