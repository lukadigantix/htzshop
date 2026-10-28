import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareWarning, Plus } from "lucide-react";
import { Prazno, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { ReklamacijaPilula } from "@/components/nalog/Status";
import Razdvajac from "@/components/Razdvajac";
import { ChevronRight } from "@/components/Icons";
import { PORUKA_SERVER } from "@/lib/api";
import { getMojeReklamacije, zahtevajKorisnika } from "@/lib/nalog";
import { datum } from "@/lib/nalog-deo";

export const metadata: Metadata = { title: "Reklamacije - HTZ Shop", robots: { index: false } };

/** GET /complaints/my, najnovije prve; „Nova reklamacija" vodi na formu sa porudžbinama u roku. */
export default async function ReklamacijePage() {
  await zahtevajKorisnika("/moj-nalog/reklamacije/");
  const lista = await getMojeReklamacije();
  if (!lista) throw new Error(PORUKA_SERVER);

  return (
    <StranaNaloga
      naslov="Reklamacije"
      uvod="Rok je 14 dana od porudžbine, jedna reklamacija po porudžbini. Odgovor stiže ovde i na e-mail."
      akcija={
        <Link href="/moj-nalog/reklamacije/nova/" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-white transition hover:bg-[#3a3d42]">
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          Nova reklamacija
        </Link>
      }
    >
      {lista.length === 0 ? (
        <Prazno Icon={MessageSquareWarning} naslov="Nema reklamacija" opis="Ako nešto nije u redu sa porudžbinom, javite nam u roku od 14 dana. Rešavamo brzo." />
      ) : (
        <ul className="space-y-3">
          {lista.map((r) => (
            <li key={r.id}>
              <Link href={`/moj-nalog/reklamacije/${r.id}/`} className="group flex items-center gap-4 rounded-[6px] bg-surface p-4 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ring-1 ring-transparent transition hover:ring-brand md:p-5">
                <span className="hidden size-11 shrink-0 place-items-center rounded-full bg-page sm:grid">
                  <MessageSquareWarning className="size-5" strokeWidth={1.7} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="min-w-0 truncate text-[16px] font-medium">{r.subject}</span>
                    <ReklamacijaPilula status={r.status} />
                  </span>
                  <span className="mt-1.5 block text-[13px] text-secondary">
                    {datum(r.createdAt)}
                    {r.order && (
                      <>
                        <Razdvajac />
                        porudžbina #{r.order.orderNumber}
                      </>
                    )}
                    {r.adminResponse && (
                      <>
                        <Razdvajac />
                        <span className="font-medium text-primary">ima odgovor</span>
                      </>
                    )}
                  </span>
                </span>
                <ChevronRight width={14} height={14} strokeWidth={2} className="shrink-0 text-secondary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StranaNaloga>
  );
}
