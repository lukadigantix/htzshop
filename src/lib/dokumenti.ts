/**
 * Obrasci za preuzimanje (PDF u public/files/). Izvor je HTML u docs/obrasci/, a PDF se pravi skriptom
 * `sh docs/obrasci/napravi.sh`; datum u imenu fajla je datum izdanja, pa se pri izmeni teksta menja i ovde.
 */
export type Dokument = { id: string; naziv: string; fajl: string; opis: string };

const F = "/files/";

export const IZDATO = "27. 10. 2026.";

/**
 * Uslovi korišćenja: datum donošenja i početka primene. Pri izmeni teksta menjaju se datumi i PDF
 * (`node docs/obrasci/uslovi-pdf.mjs` dok sajt radi na :3001 - PDF je štampa same strane, pa je tekst uvek isti).
 */
export const USLOVI_DONETO = "27. 10. 2026.";
export const USLOVI_NA_SNAZI = "27. 10. 2026.";
export const USLOVI_PDF = `${F}HTZ-Shop-uslovi-koriscenja-27-10-2026.pdf`;

/** Politika privatnosti: isto kao uslovi (PDF iz iste skripte). */
export const PRIVATNOST_DONETO = "27. 10. 2026.";
export const PRIVATNOST_NA_SNAZI = "27. 10. 2026.";
export const PRIVATNOST_PDF = `${F}HTZ-Shop-politika-privatnosti-27-10-2026.pdf`;

export const OBRASCI = {
  izjava: {
    id: "izjava",
    naziv: "Izjava o odustanku od ugovora",
    fajl: `${F}HTZ-Shop-izjava-o-odustanku-27-10-2026.pdf`,
    opis: "Zakonski obrazac kojim odustajete od kupovine u roku od 14 dana od prijema robe, bez navođenja razloga.",
  },
  dodatak: {
    id: "dodatak",
    naziv: "Dodatak uz izjavu o odustanku",
    fajl: `${F}HTZ-Shop-dodatak-uz-izjavu-o-odustanku-27-10-2026.pdf`,
    opis: "Podaci o porudžbini, proizvodu (veličina, boja, količina) i tekućem računu za povraćaj novca. Šalje se uz izjavu.",
  },
} satisfies Record<string, Dokument>;
