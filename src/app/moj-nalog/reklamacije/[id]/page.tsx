import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KARTICA, MALI, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { Uspeh } from "@/components/nalog/Polja";
import { ReklamacijaPilula } from "@/components/nalog/Status";
import { PORUKA_SERVER } from "@/lib/api";
import { getMojaReklamacija, zahtevajKorisnika } from "@/lib/nalog";
import { datum } from "@/lib/nalog-deo";

export const metadata: Metadata = { title: "Reklamacija - HTZ Shop", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/** GET /complaints/my/{id}: status, tekst kupca i odgovor prodavnice; ?nova=1 posle slanja. Tuđa ili nepostojeća → 404. */
export default async function ReklamacijaPage({ params, searchParams }: Props) {
  const { id } = await params;
  await zahtevajKorisnika(`/moj-nalog/reklamacije/${id}/`);
  const r = await getMojaReklamacija(id);
  if (r === null) notFound();
  if (!r) throw new Error(PORUKA_SERVER);
  const nova = (await searchParams).nova === "1";

  return (
    <StranaNaloga kicker={datum(r.createdAt)} naslov={r.subject} nazad={{ label: "Reklamacije", href: "/moj-nalog/reklamacije/" }}>
      {nova && (
        <div className="mb-5">
          <Uspeh>Reklamacija je poslata. Odgovor stiže ovde i na e-mail.</Uspeh>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <ReklamacijaPilula status={r.status} />
        {r.order && (
          <p className="text-[14px] text-secondary">
            Porudžbina{" "}
            <Link href={`/moj-nalog/porudzbine/${r.order.id}/`} className="font-medium text-primary underline underline-offset-2">
              #{r.order.orderNumber}
            </Link>{" "}
            od {datum(r.order.createdAt)}
          </p>
        )}
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <section className={KARTICA}>
          <h2 className={MALI}>Vaša poruka</h2>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-[24px]">{r.description}</p>
        </section>
        {/* odgovor se ističe tamnom karticom; dok ga nema, kartica je obična */}
        {r.adminResponse ? (
          <section className="overflow-hidden rounded-[6px] bg-primary text-white">
            <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_12px,#2c2d30_12px_24px)]" />
            <div className="p-5 md:p-7">
              <h2 className="text-[12px] font-medium uppercase tracking-[0.16em] text-brand">Odgovor HTZ Shopa</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-[24px] text-white/90">{r.adminResponse}</p>
              {r.updatedAt !== r.createdAt && <p className="mt-4 text-[12px] text-white/50">{datum(r.updatedAt)}</p>}
            </div>
          </section>
        ) : (
          <section className={KARTICA}>
            <h2 className={MALI}>Odgovor</h2>
            <p className="mt-3 text-[15px] text-secondary">Još nema odgovora. Javljamo se u najkraćem roku, a odgovor stiže i na e-mail.</p>
          </section>
        )}
      </div>
    </StranaNaloga>
  );
}
