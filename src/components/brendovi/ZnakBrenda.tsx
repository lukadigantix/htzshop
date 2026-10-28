import Image from "next/image";
import type { Brend } from "@/lib/brendovi";

const MERE = {
  mali: { w: 96, h: 54, logo: "max-h-9 max-w-[96px]", tekst: ["text-[17px]", "text-[13px]"], crta: "mt-1.5 w-6" },
  srednji: { w: 160, h: 72, logo: "max-h-14 max-w-[160px]", tekst: ["text-[28px]", "text-[22px]"], crta: "mt-2.5 w-10" },
  veliki: { w: 220, h: 110, logo: "max-h-24 max-w-[220px]", tekst: ["text-[40px]", "text-[30px]"], crta: "mt-2.5 w-10" },
};

/**
 * Logo brenda, a dok ga admin ne učita: ime brenda složeno kao znak (krupna slova, žuta crta ispod), da pločica ne bude
 * prazna i da izgleda namerno. Veličina slova prati dužinu imena.
 */
export default function ZnakBrenda({ b, velicina = "srednji" }: { b: Pick<Brend, "name" | "logo">; velicina?: keyof typeof MERE }) {
  const m = MERE[velicina];
  if (b.logo) return <Image src={b.logo} alt={b.name} width={m.w} height={m.h} className={`w-auto object-contain ${m.logo}`} />;
  const klasa = m.tekst[b.name.length > 9 ? 1 : 0];
  return (
    <span className="flex flex-col items-center text-center" role="img" aria-label={b.name}>
      <span aria-hidden className={`font-semibold uppercase leading-none tracking-[-0.03em] text-primary ${klasa}`}>
        {b.name}
      </span>
      <span aria-hidden className={`h-1 rounded-full ${m.crta} bg-[repeating-linear-gradient(-45deg,var(--brand-primary)_0_5px,var(--text-primary)_5px_10px)]`} />
    </span>
  );
}
