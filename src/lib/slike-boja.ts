import { bojaPozadina } from "./boje";

/*
  Slika za izabranu boju: backend za svaku sliku galerije javlja boju predmeta (imageColors), a boje varijanti
  imaju svoj hex (lib/boje.ts). Slika i boja se povezuju samo kad su jedna drugoj najbliže (obostrano) i dovoljno
  slične - tako „crna" ne dobije plavu sliku kad crne slike nema. Povezana slika ide na prvo mesto u galeriji.
*/

const PRAG = 45;

function lab(hex: string): [number, number, number] {
  const lin = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [lin(0), lin(1), lin(2)];
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

// svetlina manje važi (senke i osvetljenje na fotografiji), nijansa više
function razlika(a: string, b: string): number {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot((l1 - l2) / 2, a1 - a2, b1 - b2);
}

const jeHex = (s: string | null | undefined): s is string => Boolean(s && /^#[0-9a-f]{6}$/i.test(s));

/** Slike sa slikom izabrane boje na prvom mestu (ako je nađena), inače nepromenjene */
export function slikeZaBoju(images: string[], boje: (string | null)[] | null | undefined, sveBoje: string[], izabrana: string | null): string[] {
  if (!izabrana || !boje || boje.length !== images.length || images.length < 2) return images;
  const varijante = [...new Set(sveBoje)].map((c) => ({ c, hex: bojaPozadina(c) })).filter((v) => jeHex(v.hex));
  const ja = varijante.find((v) => v.c === izabrana);
  if (!ja) return images;

  let najbliza = -1;
  let min = Infinity;
  boje.forEach((h, i) => {
    if (!jeHex(h)) return;
    const d = razlika(h, ja.hex);
    if (d < min) [min, najbliza] = [d, i];
  });
  if (najbliza < 0 || min > PRAG) return images;
  // i slici mora izabrana boja biti najbliža od svih boja ovog modela
  const h = boje[najbliza]!;
  if (varijante.some((v) => v.c !== izabrana && razlika(h, v.hex) < min)) return images;
  return [images[najbliza], ...images.filter((_, i) => i !== najbliza)];
}
