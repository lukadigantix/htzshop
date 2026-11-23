/*
  Koje slike ne idu kroz Next optimizaciju slika. Slike sa našeg backenda (/uploads/…, dozvoljene u next.config
  remotePatterns) se optimizuju: kartica dobija sliku svoje veličine u WebP/AVIF-u (desetine KB umesto originala
  dobavljača od 100 KB do 3 MB), a umanjena slika se pamti posle prvog prikaza. Bez optimizacije ostaju SVG (Next ih
  ne obrađuje) i slike sa tuđih adresa.
*/
export const bezOptimizacije = (src: string | null | undefined): boolean => {
  if (!src || !/^https?:/i.test(src)) return false;
  return !/\/uploads\//.test(src) || /\.svg(\?|$)/i.test(src);
};
