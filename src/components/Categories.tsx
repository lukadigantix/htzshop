import Image from "next/image";
import Link from "next/link";
import { categoryGroups, type CategoryGroup, type GroupTile } from "@/data/site";

/*
  Mreža po uzoru na fristads.com „Featured products": puna širina, razmak 1 px (bela linija),
  pločica #EBEAE6 sa paddingom, slika zauzima gornji deo, tekst dole. Svaka grupa ima naslov,
  tekst i žuto dugme iznad mreže. Telefon: foto puna širina + pločice 2×2; od 768 px: 3 kolone,
  foto preko dva reda (naizmenično levo/desno).
  Tekst je ujednačen na svim pločicama: naslov ima rezervisanu visinu za dva reda, podnaslov jedan red.
*/

function Tile({ t }: { t: GroupTile }) {
  return (
    <Link href={t.href} className="group flex h-[250px] flex-col bg-[#ebeae6] p-4 transition-colors hover:bg-[#e3e1db] md:h-[300px] md:p-6 xl:h-[340px]">
      <span className="relative block min-h-0 w-full flex-1">
        <Image src={t.image} alt={t.name} fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 50vw" className="object-contain mix-blend-multiply transition duration-300 group-hover:scale-[1.04]" />
      </span>
      <span className="mt-3 flex min-h-[50px] shrink-0 flex-col justify-end md:mt-4 md:min-h-[54px]">
        <span className="line-clamp-2 block text-[12px] font-semibold uppercase leading-[16px] tracking-[1.5px] text-primary md:text-[14px] md:leading-[18px] md:tracking-[2.5px]">
          {t.name}
        </span>
        <span className="block truncate text-[12px] leading-[18px] text-[#999999]">{t.sub}</span>
      </span>
    </Link>
  );
}

function Group({ g }: { g: CategoryGroup }) {
  return (
    <div>
      <div className="container-site">
        <h2 className="section-title">{g.title}</h2>
        <p className="mx-auto mt-4 max-w-[720px] text-center text-[15px] leading-[23px] text-secondary md:text-[16px] md:leading-[24px]">{g.text}</p>
        <div className="mt-7 flex justify-center">
          <Link href={g.allHref} className="btn-primary">
            {g.allLabel}
          </Link>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-px bg-white md:mt-[44px] md:grid-cols-3">
        <div className={`relative col-span-2 h-[300px] bg-[#ebeae6] md:col-span-1 md:row-span-2 md:h-auto ${g.photoSide === "right" ? "md:col-start-3 md:row-start-1" : ""}`}>
          <Image src={g.photo} alt={g.photoAlt} fill sizes="(min-width: 768px) 34vw, 100vw" className="object-cover" style={{ objectPosition: g.photoPosition ?? "center" }} />
        </div>
        {g.tiles.map((t) => (
          <Tile key={t.href} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function Categories() {
  return (
    <section id="kategorije" className="space-y-16 bg-white py-14 md:space-y-[96px] md:py-[72px]">
      {categoryGroups.map((g) => (
        <Group key={g.key} g={g} />
      ))}
    </section>
  );
}
