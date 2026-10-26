import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Branding from "@/components/Branding";
import About from "@/components/About";
import Brands from "@/components/Brands";
import ForCompanies from "@/components/ForCompanies";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Branding />
        <About />
        <Brands />
        <ForCompanies />
      </main>
      <Footer />
    </>
  );
}
