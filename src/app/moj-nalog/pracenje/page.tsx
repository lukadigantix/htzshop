import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Truck } from "lucide-react";
import FormaPracenja from "@/components/nalog/FormaPracenja";
import { KARTICA, MALI, Prazno, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { KurirZnacka, PosiljkaPilula } from "@/components/nalog/Status";
import StanjePosiljke from "@/components/posiljka/StanjePosiljke";
import Razdvajac from "@/components/Razdvajac";
import { ChevronRight } from "@/components/Icons";
import { getMojePorudzbine, getMojePosiljke, pratiPosiljku, zahtevajKorisnika } from "@/lib/nalog";
import { datum, normalizujBroj } from "@/lib/nalog-deo";

export const metadata: Metadata = { title: "Praćenje pošiljke - HTZ Shop", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };


/**
 * Praćenje pošiljke: broj iz mejla o slanju (?broj=…) i spisak pošiljki kupca ispod. Backend prepoznaje službu po broju
 * i osveži status kod kurira ako je stariji od 10 minuta.
 */
export default async function PracenjePage({ searchParams }: Props) {
  const sp = await searchParams;
  const broj = normalizujBroj((Array.isArray(sp.broj) ? sp.broj[0] : sp.broj) ?? "");
  await zahtevajKorisnika(broj ? `/moj-nalog/pracenje/?broj=${broj}` : "/moj-nalog/pracenje/");
  const [rezultat, posiljke, porudzbine] = await Promise.all([broj ? pratiPosiljku(broj) : null, getMojePosiljke(), getMojePorudzbine()]);
  const idPorudzbine = new Map((porudzbine ?? []).map((p) => [p.orderNumber, p.id]));

  return (
    <StranaNaloga naslov="Praćenje pošiljke" uvod="Upišite broj pošiljke iz mejla o slanju ili izaberite pošiljku sa spiska. Vidite gde je i kada stiže.">
      <FormaPracenja key={broj} broj={broj} />

      {rezultat &&
        (rezultat.ok ? (
          <StanjePosiljke s={rezultat.posiljka} porudzbinaId={rezultat.posiljka.orderNumber ? idPorudzbine.get(rezultat.posiljka.orderNumber) : undefined} />
        ) : (
          <div role="alert" className={`${KARTICA} mt-4 flex items-start gap-4`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page">
              <SearchX className="size-5" strokeWidth={1.7} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold">Pošiljka nije pronađena</p>
              <p className="mt-1 text-[14px] leading-[21px] text-secondary">{rezultat.poruka}</p>
            </div>
          </div>
        ))}

      <section aria-labelledby="vase-posiljke" className="mt-10">
        <h2 id="vase-posiljke" className={`${MALI} mb-3`}>
          Vaše pošiljke{posiljke?.length ? ` (${posiljke.length})` : ""}
        </h2>
        {posiljke === null ? (
          <p className={`${KARTICA} text-[14px] text-secondary`}>Spisak pošiljki trenutno nije dostupan. Pokušajte ponovo za koji trenutak; broj iz mejla možete upisati gore.</p>
        ) : posiljke.length === 0 ? (
          <Prazno Icon={Truck} naslov="Još nema pošiljki" opis="Kad pošaljemo porudžbinu, ovde vidite broj pošiljke i gde je. Lično preuzete porudžbine nemaju pošiljku." />
        ) : (
          <ul className="space-y-3">
            {posiljke.map((s) => {
              const sadrzaj = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <KurirZnacka courier={s.courier} label={s.courierLabel} />
                      <span className="text-[16px] font-semibold tabular-nums">{s.number ?? "Broj stiže uskoro"}</span>
                      <PosiljkaPilula status={s.status} label={s.statusLabel} />
                    </span>
                    <span className="mt-1.5 block text-[13px] text-secondary">
                      {s.orderNumber ? `Porudžbina #${s.orderNumber}` : "Porudžbina"}
                      {(s.sentAt || s.statusAt) && (
                        <>
                          <Razdvajac />
                          {datum((s.sentAt ?? s.statusAt)!)}
                        </>
                      )}
                    </span>
                  </span>
                  {s.number && <ChevronRight width={14} height={14} strokeWidth={2} className="shrink-0 text-secondary transition-transform group-hover:translate-x-0.5" />}
                </>
              );
              const klase = "group flex items-center gap-4 rounded-[6px] bg-surface p-4 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] md:p-5";
              return (
                <li key={s.id}>
                  {s.number ? (
                    <Link href={`/moj-nalog/pracenje/?broj=${encodeURIComponent(s.number)}`} aria-current={normalizujBroj(s.number) === broj ? "true" : undefined} className={`${klase} ring-1 ring-transparent transition hover:ring-brand aria-[current]:ring-2 aria-[current]:ring-primary`}>
                      {sadrzaj}
                    </Link>
                  ) : (
                    <div className={klase}>{sadrzaj}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </StranaNaloga>
  );
}
