"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";
import { ispravanBroj, podeliAdresu, sredjenBroj, type Mesto, type Ulica } from "@/lib/adresar";

/*
  Adresa za dostavu iz šifarnika D Express-a: prvo naseljeno mesto (bira se sa spiska; isto ime u više opština nosi i
  opštinu, a poštanski broj stiže uz mesto), pa ulica (nude se ulice izabranog mesta iz šifarnika, a može i da se
  upiše ulica koje nema), pa kućni broj kao jedna reč. Formi idu skrivena polja shippingAddress, shippingZipCode,
  shippingCity i shippingTownId. Kad adresar ne radi, mesto i poštanski broj se kucaju slobodno (pošiljka tada traži
  mesto po nazivu).
*/

const POLJE =
  "h-12 w-full rounded-[4px] border bg-page px-4 text-[15px] text-primary outline-none transition placeholder:text-[#9a9ea5] hover:border-input focus:border-primary focus:bg-surface focus:shadow-[0_0_0_4px_rgba(245,197,24,0.25)]";
const LABELA = "mb-1.5 block text-[13px] font-medium";
const ZAKLJUCANO = "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-subtle";
const LISTA = "absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-[4px] border border-subtle bg-surface py-1 shadow-[0_14px_34px_-18px_rgba(32,33,36,0.45)]";
const STAVKA = "block w-full px-4 py-2.5 text-left text-[14px] hover:bg-brand-soft focus:bg-brand-soft focus:outline-none";

type Odgovor<T> = { data?: T; greska?: string };

async function adresar<T>(upit: Record<string, string>): Promise<T> {
  const res = await fetch(`/api/adresar?${new URLSearchParams(upit)}`);
  const body = (await res.json().catch(() => ({}))) as Odgovor<T>;
  if (!res.ok || body.data === undefined) throw new Error(body.greska ?? "Adresar trenutno ne radi.");
  return body.data;
}

const okvir = (greska: boolean) => (greska ? "border-sale bg-[#fdecea]" : "border-subtle");

type Props = {
  // sačuvana adresa iz naloga (upisana nazivima); mesto se za nju traži u šifarniku
  pocetna?: { address: string; city: string; zipCode: string } | null;
  greske: Set<string>;
};

export default function AdresaDostave({ pocetna, greske }: Props) {
  const pocetak = podeliAdresu(pocetna?.address);
  const [mesto, setMesto] = useState<Mesto | null>(null);
  const [mesta, setMesta] = useState<Mesto[]>([]);
  const [mestoUpit, setMestoUpit] = useState("");
  const [mestaOtvorena, setMestaOtvorena] = useState(false);
  const [trazi, setTrazi] = useState(false);
  const [ulica, setUlica] = useState(pocetak.ulica);
  const [broj, setBroj] = useState(pocetak.broj);
  const [ulice, setUlice] = useState<Ulica[]>([]);
  const [uliceOtvorene, setUliceOtvorene] = useState(false);
  // izabrano mesto nema ulice u šifarniku (manja mesta): ulica se samo upisuje
  const [bezUlica, setBezUlica] = useState(false);
  // adresar ne radi: slobodan unos mesta i poštanskog broja
  const [slobodno, setSlobodno] = useState(false);
  const [rucno, setRucno] = useState({ city: pocetna?.city ?? "", zipCode: pocetna?.zipCode ?? "" });
  const uliceRef = useRef<HTMLDivElement>(null);
  const mestaRef = useRef<HTMLDivElement>(null);
  const ulicaInput = useRef<HTMLInputElement>(null);

  // sačuvana adresa: mesto po nazivu, poštanskom broju i ulici
  useEffect(() => {
    if (!pocetna?.city) return;
    adresar<Mesto | null>({ vrsta: "pronadji", mesto: pocetna.city, ptt: pocetna.zipCode, ulica: pocetak.ulica })
      .then((m) => { if (m) setMesto(m); })
      .catch(() => setSlobodno(true));
    // samo pri prvom crtanju (sačuvana adresa menja key komponente)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mesta po upitu (naziv, opština ili poštanski broj)
  useEffect(() => {
    if (!mestaOtvorena || mesto || slobodno) return;
    const q = mestoUpit.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => {
      setTrazi(true);
      adresar<Mesto[]>({ vrsta: "mesta", q })
        .then(setMesta)
        .catch(() => { setMesta([]); setSlobodno(true); })
        .finally(() => setTrazi(false));
    }, 200);
    return () => clearTimeout(t);
  }, [mestoUpit, mestaOtvorena, mesto, slobodno]);

  // ulice izabranog mesta (i bez upisanog teksta); bez adresara ulice iz cele Srbije po upitu
  useEffect(() => {
    if (!uliceOtvorene) return;
    const q = ulica.trim();
    const uMestu = !slobodno && mesto;
    if (!uMestu && (!slobodno || q.length < 2)) return;
    const t = setTimeout(() => {
      adresar<Ulica[]>({ vrsta: "ulice", q, ...(uMestu ? { mesto: String(mesto.id) } : {}) })
        .then((lista) => {
          setUlice(lista);
          if (uMestu && !q) setBezUlica(lista.length === 0);
        })
        .catch(() => setUlice([]));
    }, 150);
    return () => clearTimeout(t);
  }, [ulica, uliceOtvorene, mesto, slobodno]);

  useEffect(() => {
    function klik(e: MouseEvent) {
      if (!uliceRef.current?.contains(e.target as Node)) setUliceOtvorene(false);
      if (!mestaRef.current?.contains(e.target as Node)) setMestaOtvorena(false);
    }
    document.addEventListener("mousedown", klik);
    return () => document.removeEventListener("mousedown", klik);
  }, []);

  const brojLos = broj.trim() !== "" && !ispravanBroj(broj);
  const vidljivaMesta = mestoUpit.trim().length >= 2 ? mesta : [];
  const prikaziUlice = uliceOtvorene && ulice.length > 0 && (Boolean(mesto) || ulica.trim().length >= 2);
  const greskaAdresa = greske.has("shippingAddress");
  const greskaMesto = greske.has("shippingCity") || greske.has("shippingZipCode");
  const adresa = [ulica.trim(), sredjenBroj(broj)].filter(Boolean).join(" ");
  // ulica i broj se otključavaju tek kad je mesto izabrano (bez adresara: mesto se kuca, pa su odmah otključani)
  const zakljucano = !mesto && !slobodno;

  function izaberiMesto(m: Mesto) {
    setMesto(m);
    setMestaOtvorena(false);
    setMestoUpit("");
    setUlice([]);
    setBezUlica(false);
    // sledeći korak: ulica u tom mestu
    setTimeout(() => ulicaInput.current?.focus(), 0);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
      <input type="hidden" name="shippingAddress" value={adresa} />
      {!slobodno && (
        <>
          <input type="hidden" name="shippingCity" value={mesto?.name ?? ""} />
          <input type="hidden" name="shippingZipCode" value={mesto?.zipCode ?? ""} />
          <input type="hidden" name="shippingTownId" value={mesto?.id ?? ""} />
        </>
      )}

      {/* 1. mesto */}
      {slobodno ? (
        <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className={LABELA}>Mesto</span>
            <input name="shippingCity" value={rucno.city} onChange={(e) => setRucno((r) => ({ ...r, city: e.target.value }))} autoComplete="address-level2" className={`${POLJE} ${okvir(greske.has("shippingCity"))}`} />
          </label>
          <label className="block">
            <span className={LABELA}>Poštanski broj</span>
            <input name="shippingZipCode" value={rucno.zipCode} onChange={(e) => setRucno((r) => ({ ...r, zipCode: e.target.value }))} inputMode="numeric" maxLength={5} autoComplete="postal-code" className={`${POLJE} ${okvir(greske.has("shippingZipCode"))}`} />
          </label>
        </div>
      ) : (
        <div ref={mestaRef} className="relative sm:col-span-2">
          <span className={LABELA}>Mesto</span>
          {mesto ? (
            <div className={`flex min-h-12 items-center gap-3 rounded-[4px] border bg-page px-4 py-2.5 ${okvir(false)}`}>
              <MapPin className="size-4 shrink-0 text-secondary" />
              <span className="min-w-0 flex-1 text-[15px]">
                <span className="font-medium">{mesto.label}</span>
                <span className="text-secondary"> · {mesto.zipCode}</span>
                {mesto.deliveryDays && <span className="block text-[13px] text-secondary">Kurir u ovo mesto dolazi: {mesto.deliveryDays}</span>}
              </span>
              <button type="button" onClick={() => { setMesto(null); setMestaOtvorena(true); setUlice([]); setBezUlica(false); }} className="text-[13px] font-medium underline underline-offset-2">
                Promeni
              </button>
            </div>
          ) : (
            <>
              <input
                value={mestoUpit}
                onChange={(e) => { setMestoUpit(e.target.value); setMestaOtvorena(true); }}
                onFocus={() => setMestaOtvorena(true)}
                autoComplete="off"
                placeholder="Upišite naziv mesta ili poštanski broj"
                aria-invalid={greskaMesto || undefined}
                className={`${POLJE} ${okvir(greskaMesto)}`}
              />
              {trazi && <LoaderCircle className="absolute right-4 top-[42px] size-4 animate-spin text-secondary" />}
              {mestaOtvorena && vidljivaMesta.length > 0 && (
                <div className={LISTA}>
                  {vidljivaMesta.map((m) => (
                    <button key={m.id} type="button" className={STAVKA} onClick={() => izaberiMesto(m)}>
                      <span className="font-medium">{m.label}</span>
                      <span className="text-secondary"> · {m.zipCode}</span>
                    </button>
                  ))}
                </div>
              )}
              {mestaOtvorena && !trazi && mestoUpit.trim().length >= 2 && vidljivaMesta.length === 0 && (
                <p className="mt-1.5 text-[13px] text-secondary">Nema mesta sa tim nazivom. Proverite naziv ili upišite poštanski broj.</p>
              )}
              {greskaMesto && <p className="mt-1.5 text-[13px] text-sale">Izaberite mesto sa spiska.</p>}
            </>
          )}
        </div>
      )}

      {/* 2. ulica (iz izabranog mesta) */}
      <div ref={uliceRef} className="relative">
        <label className="block">
          <span className={LABELA}>Ulica</span>
          <input
            ref={ulicaInput}
            value={ulica}
            onChange={(e) => { setUlica(e.target.value); setUliceOtvorene(true); }}
            onFocus={() => setUliceOtvorene(true)}
            disabled={zakljucano}
            autoComplete="address-line1"
            placeholder={zakljucano ? "Prvo izaberite mesto" : "Počnite da kucate naziv ulice"}
            aria-invalid={greskaAdresa || undefined}
            className={`${POLJE} ${ZAKLJUCANO} ${okvir(greskaAdresa && ulica.trim().length < 2)}`}
          />
        </label>
        {prikaziUlice && (
          <div className={LISTA}>
            {ulice.map((u) => (
              <button key={u.name} type="button" className={STAVKA} onClick={() => { setUlica(u.name); setUliceOtvorene(false); }}>
                {u.name}
              </button>
            ))}
          </div>
        )}
        {mesto && bezUlica && <p className="mt-1.5 text-[13px] text-secondary">Za ovo mesto kurir nema spisak ulica; upišite ulicu ili naziv zaseoka.</p>}
      </div>

      {/* 3. kućni broj */}
      <label className="block">
        <span className={LABELA}>Broj</span>
        <input
          value={broj}
          onChange={(e) => setBroj(e.target.value)}
          onBlur={() => setBroj((b) => sredjenBroj(b))}
          disabled={zakljucano}
          autoComplete="address-line2"
          placeholder="12a, 4/7, bb"
          maxLength={12}
          aria-invalid={(greskaAdresa && !ispravanBroj(broj)) || brojLos || undefined}
          className={`${POLJE} ${ZAKLJUCANO} ${okvir((greskaAdresa && !ispravanBroj(broj)) || brojLos)}`}
        />
      </label>
      {brojLos && (
        <p className="-mt-2 text-[13px] text-sale sm:col-span-2">Kućni broj je jedna reč, bez razmaka: npr. 12, 12a, 23a/4/38, 54/lok7 ili bb.</p>
      )}
    </div>
  );
}
