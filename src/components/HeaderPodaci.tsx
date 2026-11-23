import Header from "./Header";
import { brands as rezervniBrendovi } from "@/data/site";
import { getBrendovi } from "@/lib/brendovi";
import { getMeni, getOdeljci } from "@/lib/grupe";

// Zaglavlje sa podacima iz admina: meni i grupe (lib/grupe.ts), brendovi za predloge pretrage (samo oni koji imaju
// proizvode u prodavnici). Kad backend ne odgovara, brendovi su spisak iz data/site.ts.
export default async function HeaderPodaci() {
  const [meniji, kategorije, brendovi] = await Promise.all([getMeni(), getOdeljci(), getBrendovi()]);
  return (
    <Header
      meniji={meniji}
      kategorije={kategorije}
      brendovi={brendovi ? brendovi.filter((b) => b.count > 0).map((b) => ({ name: b.name, slug: b.slug, logo: b.logo })) : rezervniBrendovi}
    />
  );
}
