# Paleta i pravila (od Luke, 26.10.2026)

Tokeni su u `src/app/globals.css` (`:root`), a Tailwind klase preko `@theme inline`:
`bg-brand`, `bg-brand-hover`, `bg-brand-soft`, `text-on-brand`, `bg-page`, `bg-surface`, `text-primary`, `text-secondary`,
`border-subtle`, `border-input`, `text-success`, `text-error`, `text-sale`, `text-warning`, `text-info`, `bg-disabled`.
Gotove klase dugmadi: `.btn-primary` (žuta, tamni tekst), `.btn-secondary` (bela, siva ivica, hover blago žuta).

Pravila primene:
1. Primarna dugmad („Dodaj u korpu", „Nastavi na plaćanje"): pozadina brand, tekst/ikone on-brand, hover/active varijante. Bez belog teksta na žutom.
2. Sekundarna dugmad: bela pozadina, grafitni tekst, vidljiva siva ivica; hover brand-soft.
3. Pozadine: stranica = background; kartice, navigacija, forme, dijalozi = surface; promotivne trake i blaga isticanja = brand-soft. Žuto umereno, za glavne akcije i važne detalje.
4. Tekst i cene: naslovi, nazivi i redovne cene = text-primary; opisi = text-secondary; snižene cene i popusti = sale; prethodna cena = text-secondary precrtana.
5. Statusi: „Na stanju" i uspeh = success; greške = error; „Ograničene zalihe" = warning; informacije i linkovi = info. Svaki status ima tekst ili ikonu uz boju.
6. Forme i pristupačnost: polja bela sa border-input ivicom; dekorativne linije border-subtle; fokus `outline: 2px solid focus-ring; outline-offset: 3px`; odabrani filteri blago žuta pozadina + tamni tekst + indikator; onemogućeno = disabled boje.
