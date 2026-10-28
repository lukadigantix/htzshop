import type { Metadata } from "next";
import { FormaLozinka, FormaProfil } from "@/components/nalog/FormaProfil";
import { KARTICA, MALI, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { zahtevajKorisnika } from "@/lib/nalog";

export const metadata: Metadata = { title: "Moji podaci - HTZ Shop", robots: { index: false } };

/** Izmena profila i promena lozinke; #lozinka vodi pravo na drugu karticu (link sa pregleda). */
export default async function PodaciPage() {
  const k = await zahtevajKorisnika("/moj-nalog/podaci/");
  return (
    <StranaNaloga naslov="Moji podaci" uvod="Ime i telefon idu na svaku porudžbinu i fakturu. Podatke firme (PIB, MB) upisujete na naplati.">
      <div className="grid items-start gap-4 xl:grid-cols-2 xl:gap-5">
        <section aria-labelledby="profil" className={KARTICA}>
          <h2 id="profil" className={MALI}>
            Podaci naloga
          </h2>
          <div className="mt-5">
            <FormaProfil k={k} />
          </div>
        </section>
        {/* scroll-mt: lepljivo zaglavlje ne prekriva naslov kad se dođe preko „Promena lozinke" */}
        <section id="lozinka" aria-labelledby="lozinka-naslov" className={`${KARTICA} scroll-mt-28`}>
          <h2 id="lozinka-naslov" className={MALI}>
            Lozinka
          </h2>
          <div className="mt-5">
            <FormaLozinka />
          </div>
        </section>
      </div>
    </StranaNaloga>
  );
}
