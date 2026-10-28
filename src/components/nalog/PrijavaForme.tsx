"use client";

import Link from "next/link";
import { prijava, registracija, resetLozinke, type ResetStanje, type Stanje } from "@/app/moj-nalog/actions";
import OtpPolje from "./OtpPolje";
import { Dugme, Greska, oznacena, Polje, Uspeh, useForma } from "./Polja";

/* Forme prijave, registracije i nove lozinke (strane /prijava, /registracija, /zaboravljena-lozinka). */

const LINK = "font-medium text-primary underline underline-offset-2 hover:text-brand-active";

export function FormaPrijava({ nazad, poruka }: { nazad?: string; poruka?: string }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(prijava, undefined);
  const g = oznacena(stanje);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {nazad && <input type="hidden" name="nazad" value={nazad} />}
      <Uspeh>{poruka}</Uspeh>
      <Polje label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" placeholder="ime@firma.rs" required greska={g.has("email")} pokusaj={pokusaj} />
      <Polje
        label="Lozinka"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        greska={g.has("password")}
        pokusaj={pokusaj}
        uzNatpis={
          <Link href="/zaboravljena-lozinka/" className="text-[13px] font-medium text-secondary underline-offset-2 hover:text-primary hover:underline">
            Zaboravljena lozinka?
          </Link>
        }
      />
      <Greska>{stanje && !stanje.ok ? stanje.greska : undefined}</Greska>
      <Dugme salje={salje} radi="Prijavljujemo…">
        Prijavite se
      </Dugme>
    </form>
  );
}

export function FormaRegistracija({ nazad }: { nazad?: string }) {
  const { stanje, onSubmit, salje, pokusaj } = useForma<Stanje>(registracija, undefined);
  const g = oznacena(stanje);
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {nazad && <input type="hidden" name="nazad" value={nazad} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Polje label="Ime" name="firstName" autoComplete="given-name" required greska={g.has("firstName")} pokusaj={pokusaj} />
        <Polje label="Prezime" name="lastName" autoComplete="family-name" required greska={g.has("lastName")} pokusaj={pokusaj} />
      </div>
      <Polje label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" placeholder="ime@firma.rs" required greska={g.has("email")} poruka="Upišite ispravnu e-mail adresu." pokusaj={pokusaj} />
      <Polje label="Telefon" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="06x xxx xxxx" required greska={g.has("phone")} poruka="Upišite broj sa najmanje 8 cifara." pomoc="Zovemo samo kad treba proveriti porudžbinu." pokusaj={pokusaj} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Polje label="Lozinka" name="password" type="password" autoComplete="new-password" required minLength={8} greska={g.has("password")} poruka="Najmanje 8 znakova." pomoc="Najmanje 8 znakova." pokusaj={pokusaj} />
        <Polje label="Ponovite lozinku" name="confirmPassword" type="password" autoComplete="new-password" required greska={g.has("confirmPassword")} poruka="Lozinke se ne poklapaju." pokusaj={pokusaj} />
      </div>
      <label className={`flex cursor-pointer items-start gap-3 rounded-[4px] p-1 text-[13.5px] leading-[20px] text-secondary ${g.has("termsAccepted") ? "bg-[#fdecea] ring-1 ring-sale" : ""}`}>
        <input type="checkbox" name="termsAccepted" value="1" aria-invalid={g.has("termsAccepted") || undefined} className="mt-0.5 size-[18px] shrink-0 accent-[var(--text-primary)]" />
        <span>
          Prihvatam{" "}
          <Link href="/uslovi-koriscenja/" target="_blank" className={LINK}>
            uslove korišćenja
          </Link>{" "}
          i{" "}
          <Link href="/politika-privatnosti/" target="_blank" className={LINK}>
            politiku privatnosti
          </Link>
          .
        </span>
      </label>
      <Greska>
        {stanje && !stanje.ok ? (
          /već postoji/.test(stanje.greska) ? (
            <>
              {stanje.greska}{" "}
              <Link href="/prijava/" className="font-semibold underline underline-offset-2">
                Prijava
              </Link>
            </>
          ) : (
            stanje.greska
          )
        ) : undefined}
      </Greska>
      <Dugme salje={salje} radi="Otvaramo nalog…">
        Otvorite nalog
      </Dugme>
    </form>
  );
}

const KORACI = ["E-mail", "Kod iz mejla", "Nova lozinka"];

/** Jedna forma, tri koraka; korak, e-mail i kod nosi stanje akcije, forma crta polja tog koraka. */
export function FormaReset() {
  const { stanje: st, onSubmit, salje } = useForma<ResetStanje>(resetLozinke, { korak: 1, email: "" });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <ol aria-label="Koraci" className="grid grid-cols-3 gap-1.5">
        {KORACI.map((k, i) => {
          const n = i + 1;
          return (
            <li key={k} aria-current={n === st.korak ? "step" : undefined} className="min-w-0">
              <span className={`block h-1 rounded-full ${n <= st.korak ? "bg-brand" : "bg-subtle"}`} aria-hidden />
              <span className={`mt-1.5 block truncate text-[12px] font-medium ${n === st.korak ? "text-primary" : "text-secondary"}`}>
                {n}. {k}
              </span>
            </li>
          );
        })}
      </ol>

      {st.korak === 1 && <Polje key="email" label="E-mail" name="email" type="email" autoComplete="email" inputMode="email" placeholder="ime@firma.rs" defaultValue={st.email} required greska={!!st.greska} pomoc="Šaljemo šestocifreni kod. Važi 15 minuta." />}
      {st.korak === 2 && (
        <>
          <p className="text-[14px] leading-[22px] text-secondary">
            Ako nalog za <b className="font-semibold text-primary">{st.email}</b> postoji, kod je stigao na tu adresu. Proverite i neželjenu poštu.
          </p>
          <OtpPolje label="Kod iz mejla" name="otp" greska={!!st.greska} />
        </>
      )}
      {st.korak === 3 && (
        <div className="space-y-4">
          <Polje label="Nova lozinka" name="newPassword" type="password" autoComplete="new-password" required minLength={8} pomoc="Najmanje 8 znakova." />
          <Polje label="Ponovite novu lozinku" name="confirmPassword" type="password" autoComplete="new-password" required />
        </div>
      )}

      <Greska>{st.greska}</Greska>
      <Dugme salje={salje}>{st.korak === 1 ? "Pošaljite kod" : st.korak === 2 ? "Proverite kod" : "Sačuvajte novu lozinku"}</Dugme>
      <p className="text-center text-[14px] text-secondary">
        Setili ste se?{" "}
        <Link href="/prijava/" className={LINK}>
          Nazad na prijavu
        </Link>
      </p>
    </form>
  );
}
