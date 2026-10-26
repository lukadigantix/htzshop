# HTZ Shop — redizajn početne (desktop v1, 26.10.2026)

Pokretanje: `npm run dev` → http://localhost:3000. Samo desktop (≥1280 px); responsive se radi posle potvrde.
Snimak: `docs/reference/redesign-desktop-1440.png`. Sav tekst i podaci su u `src/data/site.ts`.

## Dizajn

- **Boje:** ink `#0E1013` (tamna osnova), paper `#F5F4F0` (svetle sekcije), signal `#F2A900` (zadržan amber klijenta, ali samo kao akcenat), slate za sporedni tekst.
- **Fontovi:** Barlow (naslovi, dugmad, brojevi) + Inter (tekst). Oba sa latin-ext zbog š, č, ć, đ, ž.
- **Potpis:** tanka crno-žuta traka upozorenja ispod hero-a i iznad footera. Ne koristiti je više od toga.
- **Redosled sekcija:** top bar → header sa pretragom → tamna navigacija sa mega-menijem („Sve kategorije" na hover) → hero → 4 razloga → 11 kategorija + pločica „cela prodavnica" → istaknuti proizvodi (4 taba) → brendiranje odeće → 18 brendova → prodavnica + panel za firme → footer.

## Šta je stvarno, a šta treba potvrditi sa klijentom

| Tvrdnja na stranici | Izvor | Status |
|---|---|---|
| 11 kategorija i broj artikala po kategoriji | htzshop.rs, 26.10. | tačno tog dana |
| 359 artikala online | brojač u prodavnici | tačno |
| „1.000+ artikala u ponudi", „8.000+ kupaca" | stranica O nama (1000 artikala, 8000 MP kupaca, 670 VP kupaca) | klijentove brojke, potvrditi |
| 18 brendova | lista logoa na sajtu | tačno |
| Besplatna isporuka iznad 8.000 RSD | top bar sajta | **sukob**: FAQ na Kontakt strani kaže 400 RSD poštarina ispod 12.000, besplatno iznad 12.000 |
| Dva telefona (035/88-15-322 i 035/277-32-49) | footer i O nama / Brendiranje | oba sa sajta, pitati koji je glavni |
| Radni prsluk sa štampom 450 RSD sa PDV | slajd 1 originala | tačno, ali proveriti da li važi |
| Sito / flex / DTF štampa | stranica Brendiranje odeće | tačno |
| „Ponuda u roku od 24h", „pripremamo isti dan", „Probajte pre kupovine" | moja formulacija | obećanja, klijent da potvrdi ili menjamo |
| „Najprodavanije: Antares S1" | moja pretpostavka (bio je na hero slajderu) | potvrditi |
| Cene i slike proizvoda | htzshop.rs, 26.10. | tačno tog dana |

## Slike

- Proizvodi, kategorije, logoi: sa htzshop.rs (`public/images/products`, `cats`, `brands`).
- Fotografije hero, brendiranje, „za firme": Pexels (`public/images/photo/IZVORI.txt`). Na fotografiji brendiranja vidi se tuđi logo na uniformama; za finalnu verziju zameniti klijentovom fotografijom.
- Logo: privremeni (šlem u amber kvadratu + „HTZ SHOP"). Original je PNG 154×80 u `public/images/banners/`.

## Namerno izostavljeno

- Mešanje ćirilice i latinice sa originala — sve je latinica.
- Store notice o „novonastaloj situaciji", lista želja/uporedi u svakoj kartici, nasumična sekcija rukavica.
- Linkovi (kategorije, proizvodi, stranice) su pretpostavljeni URL-ovi; backend/WooCommerce nije dirano.

## v4 — Pitbike obrazac (26.10.2026, uveče)

Luka: „ovo je inače isto moj vebsajt i hoću tako da bude ta početna" → početna je prepravljena po pitbike.vercel.app (snimci: `docs/reference/pitbike-full-1440.png`, `pitbike-megameni.png`).
- Font **Instrument Sans** 400/500/600 (isti kao Pitbike). Wrapper max 1600 px, padding 36 px. Kartice radius 4 px na beloj površini, stranica #F7F8FA (paleta).
- Tipografija: h2 40/48 500, h3 20/30 500, pasus 14/22 sekundarna, nadnaslov 14; pilula 41 px, 14 px 500, padding 0 32; link sa strelicom „Pogledaj ›".
- Header 80 px: meni levo (3 mega + Brendiranje + Kontakt), logo centriran, desno žuta pilula „Zatraži ponudu" + ikone. Mega-meni (klik ili hover): 4 stavke sa velikom slikom, naziv 24 px, podnaslov, „Kupi" + „Pogledaj ›", dole „Sva …"; stranica iza zatamnjena.
- Redosled sekcija = Pitbike: hero 702 px (tekst dole levo, slajder zadržan, imena slajdova dole desno) → istaknut proizvod (Antares S1, kartica 586) → „Radna odeća i obuća" 3 kartice → velika fotografija + „Brendiranje odeće" → karusel „Zaštita za svaki posao" (8 kartica, strelice) → „Od 2017. u Svilajncu." + foto → „Brendovi" tekst + mreža logoa → „Za firme i timove." + koraci → tamni footer (4 kolone, newsletter, donja traka, centriran logo, „design & developed by Zeroblynk").
- Još moje pretpostavke za potvrdu: koraci „Kako naručujete", newsletter (ne postoji na originalu), tekstovi slajdova i kartica.

## Responsive (26.10.2026, kasno uveče) - po pitbike.vercel.app

Izmereno na Pitbike-u (390 / 820 / 1024): top bar 30 px sa jednom porukom na telefonu; header 80 px, ispod lg burger levo + logo centar + ikone desno; mobilni meni = panel ispod headera (visina 100dvh-80), stavke 56 px sa linijom, harmonika otvara iste stavke kao mega-meni (naslov 24 px, slika, Kupi + Pogledaj); hero 658 px sa tekstom dole (h1 34 px, pasus 14); sekcije padding 16 px i 1 kolona; h2 34 px; footer naslagan.

Kod nas:
- Pun desktop meni tek od **1280 px (xl)** jer je naša navigacija šira (3 stavke sa strelicama + 2 linka); na 1280-1536 meni je 15 px i gap 20, od 1536 16 px / 28. Ispod 1280 burger + centriran logo + ikone; „Zatraži ponudu" u headeru od 1024, ispod toga u mobilnom meniju kao puno dugme.
- Hero: 620 / 680 / 702 px; tekst dole levo (34 → 48 px); imena slajdova samo od 1280, ispod toga brojač „03 / 05" + strelice dole desno, tekst podignut iznad njih.
- Kategorije: telefon = foto puna širina (300 px) + pločice 2×2 (250 px); od 768 = Fristads mreža 3 kolone (pločice 300, od 1280 340).
- Proizvodi: 2 kolone na telefonu i tabletu, 4 od 1280; tabovi se skroluju horizontalno.
- Brendiranje i O nama: 1 kolona do 1024 (foto min 380/420 px), 2 kolone od 1024. Brojke 2×2 na telefonu.
- Brendovi: logoi 3 / 4 / 6 kolona. Footer: 1 / 2 / 4 kolone, donja traka naslagana.
- Provereno na 12 širina (360-1920): nema horizontalnog overflow-a, header bez preklapanja logoa.
- Zamka: `.btn-primary` je nelejerovana klasa sa `display`, pa Tailwindov `hidden` na istom elementu ne radi - sakrivati omotačem.

### Animacija mobilnog menija (izmereno na pitbike.vercel.app, 26.10.2026)
- Burger: tri linije 20×1,5 px na 4 / 9,25 / 14,5 px; otvoreno gornja translateY(5,25px) rotate(45°), donja suprotno, srednja scale-x-0 + opacity 0; 300 ms, cubic-bezier(0.16, 1, 0.3, 1).
- Panel: uvek u DOM-u (pointer-events-none kad je zatvoren); unutrašnji omotač ide iz opacity 0 + translateY(-16px) u 1 / 0 za 500 ms istom krivom; zatvaranje obrnuto. Bez staggera po stavkama.
- Harmonika: sadržaj se montira sa animacijom opacity 0 → 1 i translateY(14px) → 0, 450 ms ease-out; strelica rotira 180° za 200 ms. Nema animacije visine.
- Pitbike ne zaključava skrol tela; mi zaključavamo (overflow hidden) dok je panel otvoren.
- 404 u konzoli na početnoj su prefetch zahtevi za stranice koje još ne postoje (prodavnica, kategorije, proizvodi, brendovi...). Nestaju kad se te strane naprave.
