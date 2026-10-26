import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

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
    <html lang="sr" className={`${instrument.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
