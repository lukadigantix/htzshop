import { brands, type Product } from "@/data/site";
import Kartica from "./katalog/Kartica";

/* Artikal sa naslovne (data/site.ts) u istoj kartici kao u prodavnici, da sve kartice na sajtu budu iste. */
export default function ProductCard({ p, prva }: { p: Product; prva?: boolean }) {
  return (
    <Kartica
      prva={prva}
      p={{
        slug: p.slug,
        name: p.name,
        brand: p.brand ?? null,
        brandLogo: brands.find((b) => b.name === p.brand)?.logo ?? null,
        group: p.group,
        price: p.price,
        basePrice: null,
        priceLabel: "sa PDV-om",
        image: p.image,
        inStock: p.inStock,
        deliveryTime: null,
        shipping: null,
        badges: p.tag ? [p.tag] : [],
      }}
    />
  );
}
