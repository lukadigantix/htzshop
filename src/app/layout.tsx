import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/Preloader";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dodato from "@/components/korpa/Dodato";

// Ista familija kao na pitbike.vercel.app (Lukin sajt-uzor): Instrument Sans 400/500/600.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HTZ Shop - zaštitna i radna oprema, Svilajnac",
  description:
    "Radna odeća, zaštitna obuća, rukavice i kompletna HTZ oprema vodećih evropskih brendova. Brendiranje odeće i isporuka širom Srbije.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr" className={`${instrument.variable} h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        {/* zajednički okvir za ceo sajt: pri prelasku između strana ostaje na mestu, menja se samo sadržaj; pri štampi
            (i PDF-u uslova) ostaje samo sadržaj strane */}
        <div className="contents print:hidden">
          <Preloader />
          <TopBar />
          <Header />
        </div>
        <div className="flex flex-1 flex-col">{children}</div>
        <div className="contents print:hidden">
          <Footer />
          <Dodato />
        </div>
      </body>
    </html>
  );
}
