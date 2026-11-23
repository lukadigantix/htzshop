import Link from "next/link";
import { categoryHref } from "@/data/site";
import { getOdeljci } from "@/lib/grupe";
import Putanja from "../Putanja";

/*
  Zaglavlje kataloga: putanja (siva traka, components/Putanja), nadnaslov, naslov i tekst, pa pilule svih grupa (izabrana tamna) za brz prelaz između grupa.
  Na telefonu se pilule prevlače vodoravno. Grupe su iz admina (lib/grupe.ts).
*/
export default async function Zaglavlje({ naslov, tekst, putanja, aktivna }: { naslov: string; tekst: string; putanja: { label: string; href?: string }[]; aktivna?: string }) {
  const categories = await getOdeljci();
  return (
    <>
    <Putanja stavke={putanja} />
    <section className="border-b border-subtle bg-surface">
      <div className="container-site pb-8 pt-8 md:pb-10 md:pt-10">
        <div>
          <p className="kicker">Prodavnica</p>
          <h1 className="h-section mt-3">{naslov}</h1>
          <p className="p-muted mt-3 max-w-[640px] text-[15px] md:text-[16px] md:leading-[26px]">{tekst}</p>
        </div>

        <ul className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <li className="shrink-0">
            <Link href="/prodavnica/" aria-current={!aktivna ? "page" : undefined} className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium transition ${!aktivna ? "bg-primary text-white" : "border border-subtle bg-surface hover:border-primary"}`}>
              Sve
            </Link>
          </li>
          {categories.map((c) => {
            const on = c.slug === aktivna;
            return (
              <li key={c.slug} className="shrink-0">
                <Link href={categoryHref(c.slug)} aria-current={on ? "page" : undefined} className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium transition ${on ? "bg-primary text-white" : "border border-subtle bg-surface hover:border-primary"}`}>
                  {c.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
    </>
  );
}
