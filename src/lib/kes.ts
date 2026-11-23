/*
  Keš podataka sa backenda (katalog, artikli, grupe, brendovi, podešavanja): dugo traje, jer ga backend briše čim se nešto
  promeni (POST /api/osvezi posle obračuna cena, uvoza ili izmene u adminu, oznaka KATALOG) i odmah zagreje
  najposećenije strane. Sat vremena je samo rezerva ako poruka o promeni ne stigne.
*/
export const KATALOG = "katalog";
export const KES_KATALOGA = { stale: 300, revalidate: 3600, expire: 86400 };
