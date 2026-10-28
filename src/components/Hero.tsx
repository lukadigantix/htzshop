import { getHeroSlides } from "@/lib/api";
import HeroSlider from "./HeroSlider";

// Slajdovi naslovne iz admin panela; bez slajdova se sekcija ne prikazuje
export default async function Hero() {
  const slides = await getHeroSlides();
  if (!slides.length) return null;
  return <HeroSlider slides={slides} />;
}
