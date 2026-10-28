import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Galerija from "@/components/proizvod/Galerija";
import Kupovina from "@/components/proizvod/Kupovina";
import Varijante from "@/components/proizvod/Varijante";
import { ArrowRight, ChevronRight, Phone, Printer, Store, Truck } from "@/components/Icons";
import { categoryHref, contact, formatPrice } from "@/data/site";
import { getProizvod, lokalniSlugovi } from "@/lib/proizvod";
import { getSajt } from "@/lib/sajt";
import Razdvajac from "@/components/Razdvajac";

/*
  Stranica proizvoda, u stilu naslovne (Pitbike): galerija levo na beloj površini, desno lepljiv panel
  sa cenom, izborom varijante i kupovinom; ispod opis + tehnički podaci, prednosti, video i slični proizvodi.
*/

export function generateStaticParams() {
  return lokalniSlugovi().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/proizvod/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProizvod(slug);
  if (!p) return { title: "Proizvod nije pronađen - HTZ Shop" };
  return {
    title: `${p.name} - HTZ Shop`,
    // rečenica za rezultat pretrage: šta je, čiji je, cena, gde se kupuje
    description: [
      `${p.name}${p.brand ? `, ${p.brand.name}` : ""}${p.group ? ` (${p.group.name.toLowerCase()})` : ""}.`,
      p.price != null ? `Cena ${formatPrice(p.price)}.` : null,
      "Kupite u HTZ Shop-u uz stručan savet i isporuku širom Srbije.",
    ]
      .filter(Boolean)
      .join(" "),
    openGraph: p.images[0] ? { images: [p.images[0]] } : undefined,
  };
}

// Odeću brendiramo u radionici, pa je za nju red sa brendiranjem u panelu
const brendira = (slug?: string) => !!slug && /odec|majic|bluz|duks|pantalon|jakn|prsluk/.test(slug);

function Zvezdice({ ocena }: { ocena: number }) {
  return (
    <span className="flex gap-0.5 text-brand" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={ocena >= i - 0.25 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
          <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />
        </svg>
      ))}
    </span>
  );
}

// params se čitaju unutar Suspense-a: prelazak na stranu je trenutan (kostur), proizvod stiže odmah za njim
export default function ProizvodPage({ params }: PageProps<"/proizvod/[slug]">) {
  return (
    <Suspense fallback={<KosturProizvoda />}>
      <Proizvod params={params} />
    </Suspense>
  );
}

function KosturProizvoda() {
  const siva = "animate-pulse rounded-[4px] bg-black/[0.06]";
  return (
    <main className="container-site grid grid-cols-1 gap-8 pb-16 pt-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_480px] xl:gap-16" aria-busy="true" aria-label="Učitavanje">
      <div className="aspect-square rounded-[4px] bg-surface lg:aspect-[5/4]" />
      <div className="space-y-4">
        <div className={`h-4 w-40 ${siva}`} />
        <div className={`h-10 w-3/4 ${siva}`} />
        <div className={`h-9 w-36 ${siva}`} />
        <div className={`mt-8 h-[52px] w-full ${siva}`} />
        <div className="h-64 rounded-[4px] bg-surface" />
      </div>
    </main>
  );
}

async function Proizvod({ params }: { params: PageProps<"/proizvod/[slug]">["params"] }) {
  const { slug } = await params;
  const [p, sajt] = await Promise.all([getProizvod(slug), getSajt()]);
  if (!p) notFound();

  const popust = p.basePrice && p.price ? Math.round((1 - p.price / p.basePrice) * 100) : 0;
  const imaOpis = Boolean(p.description?.trim());
  const imaSpecifikacije = p.specs.length > 0;

  return (
    <>
      <main className="pb-16 md:pb-24">
        {/* putanja */}
        <nav aria-label="Putanja" className="container-site">
          <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-4 text-[13px] text-secondary md:py-6">
            <li><Link href="/" className="hover:text-primary">Početna</Link></li>
            {p.group && (
              <>
                <li aria-hidden><ChevronRight width={12} height={12} strokeWidth={1.8} /></li>
                <li><Link href={categoryHref(p.group.slug)} className="hover:text-primary">{p.group.name}</Link></li>
              </>
            )}
            <li aria-hidden><ChevronRight width={12} height={12} strokeWidth={1.8} /></li>
            <li aria-current="page" className="truncate text-primary">{p.name}</li>
          </ol>
        </nav>

        {/* galerija + panel za kupovinu */}
        <section className="container-site grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_480px] xl:gap-16">
          <Galerija images={p.images.length ? p.images : ["/images/logo/htz-logo.svg"]} alt={p.name} badges={p.badges} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">
              {p.brand && (
                <>
                  <Link href={`/brend/${p.brand.slug}/`} className="font-medium text-primary hover:underline">{p.brand.name}</Link>
                  {p.group && <Razdvajac />}
                </>
              )}
              {p.group?.name}
            </p>
            <h1 className="mt-2 text-[28px] font-medium leading-[34px] tracking-[-0.01em] md:text-[36px] md:leading-[44px]">{p.name}</h1>

            {(p.rating || p.code) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-secondary">
                {p.rating && (
                  <a href="#ocene" className="flex items-center gap-2 hover:text-primary">
                    <Zvezdice ocena={p.rating.average} />
                    <span>{p.rating.average.toFixed(1).replace(".", ",")} ({p.rating.count})</span>
                  </a>
                )}
                {p.code && <span>Šifra: {p.code}</span>}
              </div>
            )}

            {/* cena */}
            <div className="mt-6 border-t border-subtle pt-6">
              {p.price != null ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className={`text-[30px] font-medium leading-none md:text-[34px] ${popust > 0 ? "text-sale" : ""}`}>{formatPrice(p.price)}</p>
                    {popust > 0 && (
                      <>
                        <p className="text-[16px] text-secondary line-through">{formatPrice(p.basePrice!)}</p>
                        <span className="rounded-full bg-sale px-2.5 py-0.5 text-[12px] font-medium text-white">-{popust}%</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-secondary">Cena {p.priceLabel}</p>
                </>
              ) : (
                <p className="text-[18px] font-medium">Cena na upit</p>
              )}
            </div>

            {p.variants.length > 0 && (
              <div className="mt-6">
                <Varijante varijante={p.variants} size={p.size} color={p.color} />
              </div>
            )}

            {/* stanje i isporuka */}
            <p className="mt-6 flex items-center gap-2 text-[14px]">
              <span className={`size-2 rounded-full ${p.inStock ? "bg-success" : "bg-error"}`} />
              <span className={p.inStock ? "text-success" : "text-error"}>{p.inStock ? "Na stanju" : "Trenutno nema na stanju"}</span>
              {p.deliveryTime && (
                <span className="text-secondary">
                  <Razdvajac className="ml-0" />
                  Isporuka {p.deliveryTime}
                </span>
              )}
            </p>

            <div className="mt-4">
              <Kupovina slug={p.slug} inStock={p.inStock} />
            </div>
            <Link href="/kontakt/#ponuda" className="link-arrow mt-4">
              Kupujete za firmu? Zatražite ponudu <ArrowRight width={14} height={14} strokeWidth={1.8} />
            </Link>

            <ul className="mt-8 divide-y divide-subtle rounded-[4px] bg-surface text-[14px]">
              <li className="flex gap-4 p-4 md:px-5">
                <Truck width={20} height={20} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{p.shippingLabel ?? "Dostava širom Srbije"}</p>
                  <p className="text-secondary">Besplatna isporuka za porudžbine iznad {contact.freeShippingFrom}.</p>
                </div>
              </li>
              <li className="flex gap-4 p-4 md:px-5">
                <Store width={20} height={20} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Preuzimanje u radnji</p>
                  <p className="text-secondary">{sajt.street}, {sajt.city}. Probajte pre kupovine.</p>
                </div>
              </li>
              {brendira(p.group?.slug) && (
                <li className="flex gap-4 p-4 md:px-5">
                  <Printer width={20} height={20} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Brendiranje vašim logom</p>
                    <p className="text-secondary">
                      Sito, flex ili DTF štampa u našoj radionici. <Link href="/brendiranje-odece/" className="text-primary underline underline-offset-2">Saznajte više</Link>
                    </p>
                  </div>
                </li>
              )}
              <li className="flex gap-4 p-4 md:px-5">
                <Phone width={20} height={20} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Pomoć pri izboru</p>
                  <p className="text-secondary">
                    Pozovite <a href={sajt.phoneHref} className="text-primary">{sajt.phone}</a>{sajt.hours[0]?.isOpen ? `, ${sajt.hours[0].days.toLowerCase()} ${sajt.hours[0].hours}` : ""}.
                  </p>
                </div>
              </li>
            </ul>

            {p.catalogPdfUrl && (
              <a href={p.catalogPdfUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-4 w-full">
                Preuzmi katalog (PDF)
              </a>
            )}
          </div>
        </section>

        {/* opis i tehnički podaci */}
        {(imaOpis || imaSpecifikacije) && (
          <section className="container-site mt-16 md:mt-24">
            <div className={`grid grid-cols-1 gap-4 lg:gap-8 ${imaOpis && imaSpecifikacije ? "lg:grid-cols-2" : ""}`}>
              {imaOpis && (
                <div className="rounded-[4px] bg-surface p-6 md:p-10">
                  <p className="kicker">O proizvodu</p>
                  <h2 className="h-card mt-3">Opis</h2>
                  <div className="prose-htz mt-6" dangerouslySetInnerHTML={{ __html: p.description! }} />
                </div>
              )}
              {imaSpecifikacije && (
                <div className="rounded-[4px] bg-surface p-6 md:p-10">
                  <p className="kicker">Specifikacija</p>
                  <h2 className="h-card mt-3">Tehnički podaci</h2>
                  <dl className="mt-6 border-t border-subtle text-[14px]">
                    {p.specs.map((s) => (
                      <div key={s.key} className="grid grid-cols-[minmax(120px,40%)_1fr] gap-4 border-b border-subtle py-3.5">
                        <dt className="text-secondary">{s.key}</dt>
                        <dd className="font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>
        )}

        {/* prednosti */}
        {p.advantages && (
          <section className="container-site mt-4 lg:mt-8">
            <div className={`grid grid-cols-1 gap-4 lg:gap-8 ${p.advantagesImage ? "lg:grid-cols-[1fr_1.15fr]" : ""}`}>
              {p.advantagesImage && (
                <div className="relative min-h-[320px] overflow-hidden rounded-[4px] bg-surface md:min-h-[420px]">
                  <Image src={p.advantagesImage} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" unoptimized className="object-cover" />
                </div>
              )}
              <div className="rounded-[4px] bg-surface p-6 md:p-10 xl:p-14">
                <p className="kicker">Zašto baš ovaj</p>
                <h2 className="h-section mt-4">Prednosti</h2>
                <div className="prose-htz mt-6" dangerouslySetInnerHTML={{ __html: p.advantages }} />
              </div>
            </div>
          </section>
        )}

        {/* video */}
        {p.videoEmbedUrl && (
          <section className="container-site mt-4 lg:mt-8">
            <div className="relative aspect-video overflow-hidden rounded-[4px] bg-primary">
              <iframe src={p.videoEmbedUrl} title={`${p.name} - video`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
            </div>
          </section>
        )}

        {/* slični proizvodi */}
        {p.similar.length > 0 && (
          <section className="container-site mt-16 md:mt-24">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Iz iste grupe</p>
                <h2 className="h-section mt-3">Slični proizvodi</h2>
              </div>
              {p.group && (
                <Link href={categoryHref(p.group.slug)} className="link-arrow">
                  Sve iz grupe {p.group.name} <ArrowRight width={14} height={14} strokeWidth={1.8} />
                </Link>
              )}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-6 xl:grid-cols-4 xl:gap-8">
              {p.similar.map((s) => (
                <ProductCard key={s.slug} p={s} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
