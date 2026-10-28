import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Branding from "@/components/Branding";
import About from "@/components/About";
import Brands from "@/components/Brands";
import ForCompanies from "@/components/ForCompanies";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Branding />
        <About />
        <Brands />
        <ForCompanies />
      </main>
    </>
  );
}
