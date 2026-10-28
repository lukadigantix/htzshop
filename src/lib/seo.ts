import { contact } from "@/data/site";
import type { Sajt } from "./sajt";

/**
 * SEO i AI pretraga (Google, ChatGPT, Perplexity…): adresa sajta i strukturirani podaci (schema.org, JSON-LD).
 * Podaci o firmi idu iz Admin → Podešavanja → Sajt, pa su na sajtu, u footeru i u JSON-LD-u uvek isti.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://htzshop.rs").replace(/\/$/, "");

/** opis firme jednom rečenicom - isti tekst za meta opise, JSON-LD i footer, da pretraživači i AI vide jednu činjenicu */
export const OPIS_FIRME =
  "HTZ Shop je specijalizovana prodavnica HTZ opreme: radna odeća, zaštitna obuća, radne i zaštitne rukavice i lična zaštitna oprema vodećih evropskih brendova, sa brendiranjem odeće i isporukom širom Srbije.";

const DAN = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Prodavnica kao lokalni biznis (schema.org Store): ime, adresa, koordinate, kontakt, radno vreme, PIB, mreže. */
export function podaciFirme(s: Sajt) {
  // „35210 Svilajnac" → poštanski broj i mesto
  const [, posta, mesto] = s.city.match(/^(\d{5})\s+(.+)$/) ?? [null, null, s.city];
  const tel = s.phoneHref.replace(/^tel:/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#firma`,
    name: "HTZ Shop",
    alternateName: s.name !== "HTZ Shop" ? s.name : undefined,
    legalName: contact.legalName,
    description: OPIS_FIRME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/htz-logo.svg`,
    image: `${SITE_URL}/images/photo/prodavnica.jpg`,
    telephone: tel,
    email: s.email,
    vatID: s.pib,
    foundingDate: String(contact.founded),
    currenciesAccepted: "RSD",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      postalCode: posta ?? undefined,
      addressLocality: mesto,
      addressCountry: "RS",
    },
    geo: { "@type": "GeoCoordinates", latitude: contact.coords.lat, longitude: contact.coords.lng },
    hasMap: s.mapsHref,
    areaServed: { "@type": "Country", name: "Srbija" },
    openingHoursSpecification: s.week
      .filter((d) => d.isOpen && d.open && d.close)
      .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAN[d.day]}`, opens: d.open, closes: d.close })),
    sameAs: [s.facebook, s.instagram, s.twitter, s.tiktok].filter(Boolean),
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", telephone: tel, email: s.email, availableLanguage: ["sr"] },
    knowsAbout: ["HTZ oprema", "zaštita na radu", "radna odeća", "zaštitna obuća", "radne rukavice", "lična zaštitna oprema", "brendiranje radne odeće"],
  };
}

/** JSON za <script type="application/ld+json">: bez praznih polja, `<` izbegnut da tekst iz admina ne može da zatvori skript */
export const jsonLd = (podaci: object) => JSON.stringify(podaci).replace(/</g, "\\u003c");
