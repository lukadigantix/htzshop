import Link from "next/link";
import { KeyRound, MapPin, MessageSquareWarning, Package, Pencil, Plus, Truck } from "lucide-react";
import { KARTICA, MALI, StranaNaloga } from "@/components/nalog/NalogOkvir";
import { StatusPilula, TrakaStatusa } from "@/components/nalog/Status";
import Razdvajac from "@/components/Razdvajac";
import { STIT } from "@/components/logoPutanje";
import { ArrowRight, ChevronRight, Mail, Phone } from "@/components/Icons";
import { rsd } from "@/lib/filteri";
import { getAdrese, getMojePorudzbine, getMojePosiljke, getMojeReklamacije, zahtevajKorisnika } from "@/lib/nalog";
import { datum, ISPORUKA_OPIS, placanjeOpis, SLEDI, ZAVRSENE, type PorudzbinaNaloga } from "@/lib/nalog-deo";

const MESECI = ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
const kupacOd = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? `${MESECI[d.getMonth()]} ${d.getFullYear()}.` : null;
};

/**
 * Pregled naloga (po uzoru na klikdogume app/nalog/page.tsx): porudžbina u toku sa tokom isporuke na tamnoj kartici,
 * podaci i adresa desno, ispod pločice odeljaka sa brojevima. Sve sa backenda, u jednom krugu poziva.
 */
export default async function NalogPage() {
  const k = await zahtevajKorisnika("/moj-nalog/");
  const [porudzbine, adrese, reklamacije, posiljke] = await Promise.all([getMojePorudzbine(), getAdrese(), getMojeReklamacije(), getMojePosiljke()]);
  const lista = porudzbine ?? [];
  const uToku = lista.filter((p) => !ZAVRSENE.has(p.status));
  const glavna = adrese?.find((a) => a.isDefault) ?? adrese?.[0];
  const otvorene = (reklamacije ?? []).filter((r) => r.status === "pending").length;
  const naPutu = (posiljke ?? []).filter((s) => s.status !== "isporucena" && s.status !== "vracena").length;
  const od = kupacOd(k.createdAt);

  const plocice = [
    { Icon: Package, label: "Porudžbine", broj: porudzbine ? String(lista.length) : "–", opis: !porudzbine ? "Trenutno nedostupno" : uToku.length ? `${uToku.length} u toku` : lista.length ? "Sve su završene" : "Još nema", href: "/moj-nalog/porudzbine/" },
    { Icon: Truck, label: "Pošiljke", broj: posiljke ? String(posiljke.length) : "–", opis: naPutu ? `${naPutu} na putu` : "Praćenje kod kurira", href: "/moj-nalog/pracenje/" },
    { Icon: MapPin, label: "Adrese", broj: adrese ? `${adrese.length}/3` : "–", opis: glavna ? glavna.city : "Dodajte adresu", href: "/moj-nalog/adrese/" },
    { Icon: MessageSquareWarning, label: "Reklamacije", broj: reklamacije ? String(reklamacije.length) : "–", opis: otvorene ? `${otvorene} u obradi` : "Nema otvorenih", href: "/moj-nalog/reklamacije/" },
  ];

  return (
    <StranaNaloga kicker="Moj nalog" naslov={`Zdravo, ${k.firstName}`} nazad={null}>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <section aria-label="Porudžbina" className="lg:col-span-2 lg:row-span-2">
          <KarticaPorudzbine p={uToku[0] ?? lista[0]} uToku={uToku.length} ukupno={lista.length} greska={!porudzbine} />
        </section>

        <section aria-labelledby="podaci" className={`${KARTICA} flex flex-col lg:col-start-3 lg:row-start-1`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="podaci" className={MALI}>
              Moji podaci
            </h2>
            <Link href="/moj-nalog/podaci/" className="inline-flex items-center gap-1.5 text-[14px] font-medium underline-offset-2 hover:underline">
              <Pencil className="size-3.5" strokeWidth={2} aria-hidden />
              Izmeni
            </Link>
          </div>
          <p className="mt-4 text-[19px] font-semibold leading-tight">
            {k.firstName} {k.lastName}
          </p>
          <ul className="mt-3 space-y-2 text-[14px] text-secondary">
            <li className="flex items-center gap-2.5">
              <Mail width={15} height={15} strokeWidth={1.8} className="shrink-0" />
              <span className="sr-only">E-mail:</span>
              <span className="truncate">{k.email}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone width={15} height={15} strokeWidth={1.8} className="shrink-0" />
              <span className="sr-only">Telefon:</span>
              {k.phone || <span className="text-secondary/70">Telefon nije upisan</span>}
            </li>
          </ul>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-5">
            {od && <p className="text-[13px] text-secondary">Kupac od {od}</p>}
            <Link href="/moj-nalog/podaci/#lozinka" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-primary">
              <KeyRound className="size-3.5" strokeWidth={2} aria-hidden />
              Promena lozinke
            </Link>
          </div>
        </section>

        <section aria-labelledby="adresa" className={`${KARTICA} flex flex-col lg:col-start-3 lg:row-start-2`}>
          <h2 id="adresa" className={MALI}>
            Adresa za dostavu
          </h2>
          {glavna ? (
            <>
              <div className="mt-4 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-brand">
                  <MapPin className="size-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-[16px] font-medium">{glavna.address}</p>
                  <p className="mt-1 text-[14px] text-secondary">
                    {glavna.zipCode} {glavna.city}
                  </p>
                  <p className="mt-2 text-[13px] text-secondary">
                    {glavna.fullName}
                    <Razdvajac />
                    {glavna.phone}
                  </p>
                </div>
              </div>
              <Link href="/moj-nalog/adrese/" className="link-arrow mt-auto self-start pt-5">
                Sve adrese ({adrese?.length} od 3) <ChevronRight width={14} height={14} strokeWidth={1.8} />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-[14px] leading-[22px] text-secondary">Sačuvajte adresu i na naplati je samo izaberete, bez kucanja.</p>
              <Link href="/moj-nalog/adrese/" className="mt-5 inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-5 text-[14px] font-medium text-white transition hover:bg-[#3a3d42]">
                <Plus className="size-4" strokeWidth={2} aria-hidden />
                Dodajte adresu
              </Link>
            </>
          )}
        </section>

        <ul aria-label="Odeljci naloga" className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4 lg:gap-5">
          {plocice.map(({ Icon, label, broj, opis, href }) => (
            <li key={label}>
              <Link href={href} className="group flex h-full flex-col rounded-[6px] bg-surface p-4 shadow-[0_14px_34px_-26px_rgba(32,33,36,0.35)] ring-1 ring-transparent transition hover:-translate-y-0.5 hover:ring-brand md:p-5">
                <span className="flex items-start justify-between gap-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-page transition group-hover:bg-brand">
                    <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{broj}</span>
                </span>
                <span className="mt-4 flex items-center gap-1 text-[15px] font-medium">
                  {label}
                  <ChevronRight width={13} height={13} strokeWidth={2} className="text-secondary transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-0.5 truncate text-[13px] text-secondary">{opis}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </StranaNaloga>
  );
}

/** Tamna kartica: porudžbina u toku (ili poslednja) sa tokom isporuke; bez porudžbina poziv u prodavnicu. */
function KarticaPorudzbine({ p, uToku, ukupno, greska }: { p?: PorudzbinaNaloga; uToku: number; ukupno: number; greska: boolean }) {
  const okvir = "relative flex h-full flex-col overflow-hidden rounded-[6px] bg-primary text-white";
  const traka = <div aria-hidden className="h-2 bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_14px,#2c2d30_14px_28px)]" />;
  const sjaj = <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[380px] rounded-full bg-brand/12 blur-[100px]" />;

  if (greska || !p) {
    return (
      <div className={okvir}>
        {traka}
        {sjaj}
        <svg aria-hidden viewBox="0 0 296 354" className="pointer-events-none absolute -bottom-16 -right-10 hidden h-[340px] w-auto text-white/[0.05] md:block">
          <path fill="currentColor" fillRule="evenodd" d={STIT} />
        </svg>
        <div className="relative flex flex-1 flex-col p-6 md:p-8">
          <p className="text-[12px] uppercase tracking-[0.18em] text-brand">Porudžbine</p>
          <p className="mt-3 text-[30px] font-medium leading-[1.08] tracking-[-0.02em] md:text-[38px]">{greska ? "Porudžbine se trenutno ne učitavaju" : "Još nema porudžbina"}</p>
          <p className="mt-3 max-w-[460px] text-[15px] leading-[24px] text-white/65">
            {greska ? "Server ne odgovara. Porudžbine nisu izgubljene, pokušajte ponovo za koji trenutak." : "Kad poručite, ovde pratite status, isporuku i iznos svake porudžbine."}
          </p>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href={greska ? "/moj-nalog/" : "/prodavnica/"} className="btn-primary" style={{ height: 48, padding: "0 26px" }}>
              {greska ? "Pokušajte ponovo" : "Idite u prodavnicu"} <ArrowRight width={15} height={15} strokeWidth={1.8} />
            </Link>
            {!greska && (
              <Link href="/kontakt/#ponuda" className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-[15px] font-medium transition hover:border-white/50">
                Ponuda za firmu
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const kom = p.items.reduce((a, s) => a + s.quantity, 0);
  const slike = p.items.filter((s) => s.product?.image).slice(0, 4);
  const cekaUplatu = !p.isPaid && p.status !== "odustao" && p.paymentMethod !== "pouzece";
  const gde = p.deliveryType === "adresa" && p.shippingAddress ? `${p.shippingAddress}, ${p.shippingCity ?? ""}`.replace(/, $/, "") : null;

  return (
    <div className={okvir}>
      {traka}
      {sjaj}
      <div className="relative flex flex-1 flex-col p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="text-[12px] uppercase tracking-[0.18em] text-brand">{ZAVRSENE.has(p.status) ? "Poslednja porudžbina" : "Porudžbina u toku"}</p>
          <p className="text-[13px] text-white/50">{datum(p.createdAt)}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-[34px] font-medium leading-none tracking-[-0.03em] tabular-nums md:text-[44px]">#{p.orderNumber}</h2>
          <StatusPilula status={p.status} naTamnom />
        </div>
        <TrakaStatusa status={p.status} naTamnom className="mt-6" />
        <p className="mt-4 text-[15px] leading-[23px] text-white/75">
          {SLEDI[p.status]}
          {p.status === "poslato" && p.trackingNumber && (
            <>
              {" "}
              Broj pošiljke:{" "}
              <Link href={`/moj-nalog/pracenje/?broj=${encodeURIComponent(p.trackingNumber)}`} className="font-medium text-white underline underline-offset-2 hover:text-brand">
                {p.trackingNumber}
              </Link>
              .
            </>
          )}
          {p.status === "odustao" && p.cancelReason ? ` ${p.cancelReason}` : ""}
        </p>

        <div className="mt-6 flex items-center gap-4">
          {slike.length > 0 && (
            <ul className="flex shrink-0 -space-x-2">
              {slike.map((s) => (
                <li key={s.id} className="grid size-14 place-items-center overflow-hidden rounded-[4px] bg-white ring-2 ring-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element -- slika sa backenda */}
                  <img src={s.product!.image!} alt="" className="size-full object-contain p-1" />
                </li>
              ))}
            </ul>
          )}
          <ul className="min-w-0 space-y-1 text-[14px]">
            {p.items.slice(0, 2).map((s) => (
              <li key={s.id} className="flex gap-2 text-white/80">
                <span className="shrink-0 font-semibold text-white">{s.quantity} ×</span>
                <span className="truncate">{s.productName}</span>
              </li>
            ))}
            {p.items.length > 2 && <li className="text-white/50">i još {p.items.length - 2}</li>}
          </ul>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[13px] text-white/55">
          <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span>
            {ISPORUKA_OPIS[p.deliveryType]}
            {gde ? `: ${gde}` : ""}
          </span>
        </p>
        {cekaUplatu && (
          <p className="mt-4 rounded-[4px] bg-white/[0.07] px-4 py-3 text-[14px] leading-[21px] text-white/85">
            Čeka uplatu. Poziv na broj <b className="font-semibold text-white">{p.orderNumber}</b>, šaljemo čim uplata stigne.
          </p>
        )}

        {/* razmak koji raste: iznos i dugme su uvek na dnu kartice, a bar 24 px ispod sadržaja */}
        <div aria-hidden className="min-h-6 grow" />
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
          <p className="leading-tight">
            <span className="block text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{rsd(p.totalAmount)}</span>
            <span className="mt-1 block text-[13px] text-white/55">
              {kom} kom
              <Razdvajac />
              {placanjeOpis(p)}
            </span>
          </p>
          <Link href={`/moj-nalog/porudzbine/${p.id}/`} className="btn-primary" style={{ height: 48, padding: "0 24px" }}>
            Detalji porudžbine <ArrowRight width={15} height={15} strokeWidth={1.8} />
          </Link>
        </div>
        {ukupno > 1 && (
          <Link href="/moj-nalog/porudzbine/" className="mt-4 inline-flex items-center gap-1 self-start text-[14px] text-white/65 transition hover:text-white">
            {uToku > 1 ? `Još ${uToku - 1} u toku, ` : ""}sve porudžbine ({ukupno}) <ChevronRight width={13} height={13} strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}
