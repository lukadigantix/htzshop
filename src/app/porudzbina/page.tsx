import type { Metadata } from "next";
import { Suspense } from "react";
import Naplata from "@/components/korpa/Naplata";
import { contact } from "@/data/site";
import { getKorpa, getKupon, obracunajKorpu, PORUKA_MREZA } from "@/lib/korpa";
import { getAdrese, getKorisnik } from "@/lib/nalog";
import { getSajt } from "@/lib/sajt";

/*
  Naplata (2. korak): podaci kupca, isporuka i plaćanje, pa porudžbina (components/korpa/Naplata.tsx).
  Prazna korpa se NE preusmerava: posle uspešne porudžbine kolačić korpe je obrisan, a ista forma drži potvrdu.
  Prvi obračun je za dostavu na adresu i pouzeće - tako je forma i otvorena. Prijavljenom kupcu idu i podaci i sačuvane adrese.
*/

export const metadata: Metadata = { title: "Porudžbina - HTZ Shop", robots: { index: false } };

export default function PorudzbinaPage() {
  return (
    <main className="flex-1">
      <div className="container-site pb-16 pt-8 md:pb-24 md:pt-10">
        <Suspense fallback={<div aria-hidden className="mt-16 h-[560px] animate-pulse rounded-[6px] bg-surface" />}>
          <Porudzbina />
        </Suspense>
      </div>
    </main>
  );
}

async function Porudzbina() {
  const [stavke, kupon, sajt, korisnik] = await Promise.all([getKorpa(), getKupon(), getSajt(), getKorisnik()]);
  const adrese = korisnik ? ((await getAdrese()) ?? []) : [];
  const ob = await obracunajKorpu(stavke, { deliveryType: "adresa", paymentMethod: "pouzece", couponCode: kupon || undefined });
  if (!ob) {
    return (
      <div className="mt-8 rounded-[6px] bg-surface p-8 text-center">
        <p className="text-[16px]">{PORUKA_MREZA}</p>
        <a href={contact.phoneHref} className="btn-primary mt-6" style={{ height: 48, padding: "0 26px" }}>
          Pozovite {contact.phone}
        </a>
      </div>
    );
  }
  return <Naplata pocetni={ob} kupon={ob.coupon ? kupon : ""} sajt={sajt} korisnik={korisnik} adrese={adrese} />;
}
