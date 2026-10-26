# fristads.com/en — izmerene CSS vrednosti (26.10.2026, headless Chromium)

Uzor za redizajn. Mereno na 1440, 1920 i 2000 px širine.

## Wrapper
- `.container { max-width: 1570px; padding: 0 10px }` — na 1440 ide od ivice do ivice (10 px), na 1920 je 1570 centriran.
- Većina sekcija je **puna širina** (`.container-fluid`, 100%, bez paddinga): hero, mreža kategorija, featured products.
- Slider proizvoda: max-width 1200 px, centriran. Footer: padding 48 px, kolone max 1440.

## Tipografija
- Tekst: Roboto 16 px / 24 px, crna. Paragrafi 15 px.
- Naslovi i verzal: **Noto Sans**. Naslov sekcije („FEATURED PRODUCTS"): 900, 48 px, line-height 65 px, uppercase, centriran, bez letter-spacinga. Naslov bloka („DURABLE WORKWEAR."): 700, 40 px / 44 px, letter-spacing 2,5 px, uppercase.
- Naziv proizvoda u pločici: Noto Sans 900, 14 px / 17,5 px, letter-spacing 2,5 px, uppercase, crna. Šifra ispod: Roboto 12 px / 18 px, #999.
- Navigacija: Noto Sans 14 px, 400, uppercase, bela.

## Boje
- Header i top bar: #000. Pločice: **#EBEAE6**. Siva pozadina sekcija: #F6F6F6. Zelena brenda: #2C622C (samo akcenat).

## Header
- Top bar 40 px (#000, 14 px, ikonice + tekst levo, jezik desno). Glavni red 74 px (#000): logo levo, meni, desno ikonice sa natpisom ispod (SEARCH, FIND STORE, LOGIN, FAVOURITES).

## Dugmad
- Pilula: radius 30 px, visina 48 px, padding 0 32 px, Noto Sans 16 px 400, letter-spacing 0,5 px, uppercase, tekst „SEE MORE >". Crna sa belim tekstom ili bela sa crnim.

## Hero
- Puna širina, 650 px visine, slika cover, tekst centriran u levoj trećini (naslov Noto 900 ~40 px uppercase + pasus + pilula).

## Featured products mreža (uzor za naše kategorije)
- Puna širina, `grid-template-columns: repeat(4, 1fr)`, razmak **1 px** (bela linija), bez radiusa i senki.
- Fotografija: prva kolona, `row-span 2`, object-fit cover.
- Pločica: pozadina #EBEAE6, padding 24 px, visina 340 px na 1440 (416 na 2000). Flex kolona: slika u kvadratu 240×240 centrirana u gornjem delu, tekst dole.
- Naslov 14 px 900 ls 2,5 px uppercase; šifra 12 px #999. Nema hover efekta.
- Naslov sekcije 55 px iznad mreže.

## Ostale sekcije na početnoj (redom)
hero slider → 3 kategorije (3×480 px, tamne fotografije sa tekstom) + „100 years" → tabovi proizvoda (slider 1200) → calculator blok (siva) → vodič za jakne (bela, slika levo) → „Get yourself inspired" 3 kartice → Featured products → „Never go out of style" (siva, slika desno) → „Durable workwear" (istorija) → footer (#F6F6F6 → crn).
