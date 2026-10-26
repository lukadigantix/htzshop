# htzshop.rs — istraživanje početne stranice

Snimljeno 26.10.2026 u headless Chromium-u (Playwright), desktop 1440 px i mobilni 390 px.
Screenshotovi originala su u `docs/reference/`.

## 1. Tehnička osnova originala

- WordPress + WooCommerce, tema **WoodMart** (child tema), stranica sklopljena u **Elementor**, hero je **Revolution Slider**.
- Container: 1222 px. Fontovi: **Poppins** (naslovi, 600) i **Lato** (tekst, 14 px). Google Fonts.
- Boje: primarna **#F2AA0F** (amber: top bar, dugmad, cene, KATEGORIJE dugme), tekst `#141414`, naslovi `#242424`, footer `#282828`, „Nema na lageru" `#B50808`.
- Dugmad: amber podloga, tamni tekst, uppercase, 13 px; `.btn` u banerima ima radius 35 px, dugmad na karticama su pravougaona.
- Footer je tamno siv sa belim tekstom; ispod copyright traka.
- Valuta RSD, cene formata `6.120 RSD`. Stranica je na latinici, ali WooCommerce stringovi su na **ćirilici** (ОДАБЕРИТЕ МОГУЋНОСТИ, ДОДАЈ У КОРПУ, Уклони) — mešano.

## 2. Header (odozgo nadole)

1. **Store notice** (WooCommerce traka iznad svega, može da se ukloni „Уклони"):
   „Usled novonastale situacije, moguće je neslaganje cena ili zaliha na sajtu sa realnim. Po izvršenoj porudžbini bićete kontaktirani u slučaju da proizvod nije dostupan ili je došlo do eventualne promene cene."
2. **Top bar** (amber, 42 px): levo „BESPLATNA ISPORUKA ZA PORUDŽBINE IZNAD 8,000 RSD"; desno ikonice Facebook, e-mail, Instagram.
   - Facebook: https://www.facebook.com/profile.php?id=100064679481924
   - Instagram: https://instagram.com/htz_oprema_Shop
   - Na mobilnom top bar ima i WhatsApp i Viber (share linkovi).
3. **Glavni red** (105 px): logo levo (`HTZ-Logo-copy-e1666887100962.png`, 154×80, crno-amber „HTZ SHOP"), velika zaobljena pretraga „Tražite proizvode" (bez izbora kategorije), desno ikone: nalog (Logovanje / Registracija), lista želja (0), uporedi (0), korpa (0 · 0 RSD).
4. **Donji red** (52 px): amber dugme **☰ KATEGORIJE** (širina 270 px, na početnoj je uvek otvoreno kao vertikalni meni ispod sebe), zatim glavni meni:
   - POČETNA · PRODAVNICA (mega meni) · BRENDIRANJE ODEĆE · O NAMA · KONTAKT
   - desno sekundarni: STATUS PORUDŽBINE · PRAĆENJE POŠILJKE (vodi na posta.rs)
5. **Mobilni header**: ☰ MENI levo, logo u sredini, korpa desno; top bar samo sa ikonama.

Linkovi stranica: Prodavnica `?page_id=8`, Brendiranje odeće `?page_id=16441`, O nama `?page_id=4400`, Kontakt `?page_id=4439`, Status porudžbine `?page_id=14947`, Lista želja `?page_id=60`, Uporedi `?page_id=45`, Korpa `?page_id=9`, Moj nalog `?page_id=11`.

## 3. Kategorije

### 3a. Vertikalni meni KATEGORIJE (11 stavki, ovim redom)

| # | Kategorija | Link |
|---|---|---|
| 1 | Zaštitna i radna odeća | /?product_cat=zastitna-i-radna-odeca |
| 2 | Zaštitna i radna obuća | /?product_cat=zastitna-i-radna-obuca |
| 3 | Zaštitne i radne rukavice | /?product_cat=zastitne-i-radne-rukavice |
| 4 | Zaštita glave | /?product_cat=zastita-glave |
| 5 | Zaštita očiju i lica | /?product_cat=zastita-ociju-i-lica |
| 6 | Zaštita disajnih organa | /?product_cat=zastita-disajnih-organa |
| 7 | Zaštita sluha | /?product_cat=zastita-sluha |
| 8 | Zaštita od pada | /?product_cat=zastita-od-pada |
| 9 | Zaštita za zavarivanje | /?product_cat=zastita-za-zavarivanje |
| 10 | Oprema i bezbednost | /?product_cat=oprema-i-bezbednost |
| 11 | Jednokratna zaštitna oprema | /?product_cat=jednokratna-zastitna-oprema |

Samo prva stavka ima mega meni na hover (slike podkategorija: Bluze, Pantalone, Polukombinezon, Sorts, Majice, Polo majice, Duksevi + logoi Stenberg, Stanmore, Emerton, Desman). Ostalih 10 nemaju podmeni.

### 3b. Mega meni PRODAVNICA (6 kolona, sa ikonicama)

**ODEĆA** (/kategorija-proizvoda/zastitna-i-radna-odeca/)
- Bluze · Pantalone · Polukombinezoni · Sorts · Majice · Polo majice · Duksevi

**OBUĆA** (/kategorija-proizvoda/zastitna-i-radna-obuca/)
- Čizme · Kaljače · Klompe/Papuče · Plitke cipele · Duboke cipele · Sandale

**RUKAVICE** (/kategorija-proizvoda/zastitne-i-radne-rukavice/)
- Radne · Zaštitne · Rukavice za zavarivanje

**ZAŠTITA GLAVE** (/kategorija-proizvoda/zastita-glave/)
- Šlemovi i zaštitne kape · Viziri i nosači vizira · Maske za zavarivanje · Zaštitne naočare za zavarivače
  (poslednje dve su zapravo iz kategorije „Zaštita očiju i lica")

**OPREMA I BEZBEDNOST**
- Protivpadna oprema (→ zastita-od-pada) · Prva pomoć i nosila · Bezbedonosna i saobraćajna signalizacija

**HIGIJENA** (nema link)
- Sredstva za čišćenje · Sredstva za rad · Zaštita i čišćenje ruku — svi linkovi prazni / `#`

Slugovi podkategorija (za URL-ove):
`bluze`, `pantalone-zastitna-i-radna-odeca`, `polukombinezoni`, `sorts`, `majice`, `polo-majice`, `duksevi`,
`cizme-zastitna-i-radna-obuca`, `kaljace-zastitna-i-radna-obuca`, `klompe-papuce-zastitna-i-radna-obuca`, `plitke-cipele`, `duboke-cipele`, `sandale-zastitna-i-radna-obuca`,
`radne`, `zastitne`, `rukavice-za-zavarivanje`,
`slemovi-i-zastitne-kape-zastita-glave`, `viziri-i-nosaci-vizira-zastita-glave`, `maske-za-zavarivanje-zastita-ociju-i-lica`, `zastitne-naocare-za-zavarivace-zastita-ociju-i-lica`,
`prva-pomoc-i-nosila`, `bezbedonosna-i-saobracajna-signalizacija`.

Ikonice podkategorija (150×150) su u mega meniju: Emerton-jacket.jpg, Emerton-pants, dayboro-polukombinezon-crni-10, Desman-sorts, 1-800x800.png (majica), 5-1 (duks), welly-farmer-black_1, kaljace-crne, klompe-pu100, pharm-white-s2, castor-o1, gamma_61119_s1, nigra-1, eon-sharp-559, pugnax-red, 3m-zg-001-plava, vizir-acetatni, climax_420, 3m-2805, pr-bz-001, dx018-nosila, navigator-dvodelni-cunjevi (sve pod `/wp-content/uploads/2022/10/`, `2022/11/`, `2023/01/`, `2023/02/`).

## 4. Hero slajder (Revolution Slider, 872×455 px pored kategorija, 3 slajda, bullets)

1. **Slajd 1** — samo slika, bez teksta i linka: „RADNI PRSLUK SA ŠTAMPOM — 450din sa PDV" (fotografija prsluka u 6 boja, muškarac i žena).
   `https://htzshop.rs/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-01-at-09.19.03.jpeg`
2. **Slajd 2** — tamna pozadina `2022/10/bgslider.png` + PNG jakne `2022/10/imgbin_workwear-blaklader-4862-winter-jacket...png`
   - nadnaslov: „HTZ Shop" · naslov: „NUDIMO MOGUĆNOST ŠTAMPE NA RADNIM ODELIMA" · tekst: „U slučaju da personalizujete vaša radna odela, nudimo mogućnost štampe vašeg logotipa." · dugme „KONTAKTRIJATE NAS" (typo u originalu) → /kontakt/
3. **Slajd 3** — pozadina `2022/11/bg-cipele-1.jpg` + PNG cipele `2022/11/cipele-cata.png`
   - nadnaslov „HTZ SHOP" · naslov „ANTARES S1" · „MOĆ BRENDA U ULOZI ZAŠTITE VAŠE NOGE" · tekst „zaštitne cipele sa čeličnom kapom" · crveno dugme „POGLEDAJ PONUDU" → /kategorija-proizvoda/zastitna-i-radna-obuca/

## 5. Sekcije početne, redom (ispod hero-a)

### 5.1 Dva banera (50/50), svetlo siva podloga, slika desno
- „HTZ Shop" / **Zaštitna i radna odeća** / „Radna odela od najpopularnijih zaštitnih brendova po pristupačnim cenama." / POGLEDAJ PONUDU — slika `2022/10/banner-2.jpg` (radnik sa žutim šlemom)
- „HTZ Shop" / **Zaštitna i radna obuća** / „Kupite radne cipele od najpopularnijih zaštitnih brendova po pristupačnim cenama." / POGLEDAJ PONUDU — slika `2022/10/banner-3-2.jpg` (žute čizme + cipela)
- Linkovi dugmadi su prazni u DOM-u (banner nema href).

### 5.2 Tri kolone: NOVO U PONUDI · POSEBNA PONUDA · velika slika
- **NOVO U PONUDI** (lista 4 proizvoda, mala sličica + naziv + cena):
  - Rukavica sa nitrilnim premazom — 240 RSD — `2025/03/6CORDA.jpeg` — /?product=rukavica-sa-nitrilnim-premazom
  - Radne čizme SAFEWAY NEMESI O4 — 2.550 RSD — `2024/10/ST102V004-01.jpg` — /?product=radne-cizme-safeway-nemesi-o4
  - Radne pantalone klasične ETNA kobalt blue — 9.210 RSD — `2024/03/MNETTKB.jpeg` — /?product=radne-pantalone-klasicne-etna-kobalt-blue
  - Radna bluza ETNA kobalt blue — 10.000 RSD — `2024/03/MNETBK.jpeg` — /?product=radna-bluza-etna-kobalt-blue
  - (3 od 4 sličice su polomljene na originalu — prikazuje se alt tekst)
- **POSEBNA PONUDA** (karusel sa amber okvirom, 3 proizvoda, polukombinezoni):
  - Allyn polukombinezon — ALLYN — 6.120 RSD — **Nema na lageru** — boje Crna/Zelena/Plava — `2022/10/Allyn-polukombinezon-zastitna-odeca-polukombinezon-lzo.jpg` (slika polomljena na originalu)
  - DAYBORO POLUKOMBINOZON – RADNI, ZA OPŠTU UPOTREBU — CERVA — 8.430 RSD — Na lageru — Crna/Tirkizno plava — `2022/11/dayboro-polukombinezon-petrol-1.jpg`
  - Desman polukombinezon — DESMAN — 3.565 RSD — Na lageru — `2022/10/Desman-polukombinezon-zastitno-odelo-polukombinezon-1.jpg`
- **Slika** (desna polovina): radnik sa kružnom testerom, žute rukavice — `/wp-content/uploads/...` (Elementor image; nema teksta ni linka)

### 5.3 ZAŠTITNA I RADNA ODEĆA — tabovi proizvoda (4 kolone × 2 reda = 8)
Tabovi: BLUZE (aktivan) · PANTALONE · POLUKOMBINEZONI · SORTS · MAJICE · DUKSEVI, strelice ‹ › desno. Tabovi se učitavaju AJAX-om.
Kartica proizvoda: logo brenda u uglu slike, hover ikone (Uporedi, Quick view, Lista želja), naziv, brend sivo, ✓ Na lageru, cena amber, kružići boja, dugme ОДАБЕРИТЕ МОГУЋНОСТИ.

| Proizvod | Brend | Cena | Lager | Boje | Slika | Link |
|---|---|---|---|---|---|---|
| Desman bluza | DESMAN | 2.970 RSD | Na lageru | – | 2022/10/Desman-bluza-radna-odeca-bluza-lzo.jpg | /?product=desman-bluza |
| Emerton bluza | EMERTON | 4.160 RSD | Na lageru | – | 2022/10/Emerton-jacket-800x800.jpg | /?product=emerton-bluza |
| Emerton summer bluza 2 u 1 | EMERTON | 5.725 RSD | Na lageru | – | (ista serija) | /?product=emerton-summer-bluza-2-u-1 |
| Allyn bluza | ALLYN | 5.940 RSD | Na lageru | Crna/Zelena/Plava | 2022/10/Allyn-bluza-safety-clothes-work-blouse.jpg | /?product=allyn-bluza |
| Stanmore bluza | STANMORE | 6.425–7.200 RSD | Na lageru | Zelena/Braon/Plava | 2022/10/03010037_STANMORE_JACKET_blue_CERVA-2017-02_201713.jpg | /?product=stanmore-bluza |
| Coen bluza -za zavarivače, vatrootporna i antistatik | CRV | 7.840 RSD | Na lageru | – | – | /?product=coen-bluza-za-zavarivace-vatrootporna-i-antistatik |
| CREMORNE – RADNA BLUZA ZA OPŠTU UPOTREBU | CERVA | 4.330 RSD | Na lageru | Tirkizno plava | 2022/11/cremorne-bluza-petrol-2-800x800.jpg | /?product=cremorne-radna-bluza-za-opstu-upotrebu |
| DAYBORO BLUZA – RADNA, ZA OPŠTU UPOTREBU | CERVA | 7.370 RSD | Na lageru | Crna/Tirkizno plava | 2022/11/dayboro-bluza-petrol-800x800.jpg | /?product=dayboro-bluza-radna-za-opstu-upotrebu |

### 5.4 Četiri baner-kategorije (mozaik: 1 velika levo, 2 mala u sredini jedan iznad drugog, 1 velika desno; 380 px visine)
- **Zaštita glave** (amber, tekst: „Šlemovi služe za zaštitu glave u radu. Postoje razni modeli šlemova u zavisnosti od potrebe posla.", POGLEDAJ PONUDU) — `2022/11/slemovi-copy.jpg`
- **Zaštita za zavarivanje** (tamno siva, naslov amber) — `2022/11/zavarivanje-banner3-copy-1.jpg`
- **Zaštita od pada** (crvena) — `2022/11/od-pada-banner3-copy.jpg`
- **Zaštita disajnih organa** (plava, POGLEDAJ PONUDU) — `2022/11/maske-banner-copy-2.jpg`
- Svi sa nadnaslovom „HTZ Shop"; linkovi prazni u DOM-u.

### 5.5 PONUDA DANA (naslov centriran sa amber linijom), 3 proizvoda u redu, dugme PRIKAŽI SVE PROIZVODE
- Duks bez kapuljače — MAJICE SHOP — 1.500 RSD — Crna/Bela/Crvena/Melanž siva/Royal plava — `2022/11/4-1-800x800.png` — /?product=duks-bez-kapuljace
- EON CARBON (rukavice) — EON — 169 RSD — `2022/10/carbon-800x800.jpg` — /?product=eon-carbon
- Muška majica — MAJICE SHOP — 620 RSD — 18 boja (Crna, Bela, Crvena, Narandžasta, Žuta, Kivi zelen, Maslinasto zelena, Trava zelena, Pink roze, Bebi roze, Bež, Krem, Led siva, Melanž siva, Teget, Royal plava, Tirkizno plava, Nebo plava) — `2022/11/1-800x800.png` — /?product=muska-majica
- Ovde je centrirana varijanta kartice (bez dugmeta, boje iznad naziva).

### 5.6 Rukavice: levi stub + tabovi
- Levo gore baner **„Veliki izbor zaštitnih i radnih rukavica"** (amber/zlatna, dugme ZA VIŠE) — `2022/10/rukavice-banner-1-2.jpg`
- Levo dole widget **SLIČNI PROIZVODI** (amber zaglavlje, lista 4):
  - Rukavica sa nitrilnim premazom — 240 RSD
  - Rukavica EUROWINTER — 1.000 RSD — `2024/03/6610-ft.jpeg` — /?product=rukavica-eurowinter
  - Rukavica Prevent - original — 740 RSD — `2024/03/38301.jpeg` — /?product=rukavica-prevent-original
  - Varilačaka rukavica ARES — 2.280 RSD — `2024/03/2559.jpeg` — /?product=varilacaka-rukavica-ares
- Desno **ZAŠTITNE I RADNE RUKAVICE**, tabovi RADNE (aktivan) · ZAŠTITNE, 3 kolone × 2 reda = 6 proizvoda.
  **Redosled je nasumičan — svako učitavanje daje drugih 6.** Viđeni u 3 učitavanja:
  - AVOCET — 155 RSD — ДОДАЈ У КОРПУ — `2022/10/avocet-1-800x800.jpg`
  - BASLER — DANKERS — 125 RSD — `2022/10/11-dankers-basler-800x800-1-1-800x800.jpg`
  - nigra — FreeHand — 1.800 RSD — Nema na lageru — ПРОЧИТАЈТЕ ЈОШ — `2022/10/nigra-1-800x800.jpg`
  - SKUA PLETENE BEŠAVNE RUKAVICE PROIZVEDENE OD MEŠAVINE PAMUKA I NAJLONA — 90 RSD — `2022/10/skua-rukavice-tekstilne-safety-gloves900x900-1-800x800.jpg`
  - CORMORAN RADNE RUKAVICE ŠIVENE OD MEŠAVINE PAMUKA I POLIESTERA SA ELASTIČNOM MANŽETNOM — 65 RSD — `2022/10/cormoran-rukavice-...-800x800.jpg`
  - PLOVER — 65 RSD — `2022/10/plover-1-800x800.jpg`
  - BOOBY — 65 RSD — `2022/10/booby_1-800x800.jpg` · OSPREY — 85 RSD — `2022/10/osprey-1-800x800.jpg` · STARLING — 130 RSD — `2022/10/starling-1-800x800.jpg`
  - MYNAH — CERVA — 725 RSD · HOBBY — CERVA — 260 RSD (nema na lageru) · CORAX — FreeHand — 1.620 RSD (nema na lageru)
  - Rukavica sa nitrilnim premazom — 240 RSD · Rukavica Prevent – original — 740 RSD
  Jednostavni proizvodi imaju dugme ДОДАЈ У КОРПУ, varijabilni ОДАБЕРИТЕ МОГУЋНОСТИ, nedostupni ПРОЧИТАЈТЕ ЈОШ.

### 5.7 POZNATI BRENDOVI — karusel logoa (6 vidljivih, sivi logoi u ćelijama sa okvirom), 17 brendova, link `/?pa_brend=<slug>`
Emerton, EON, Exena, FreeHand, Tekton Pro, 3M, Allyn, Bicap, Catamount, Catamount Sport, Cerva, Cofra, CRV, Dankers, Desman, Dunlop, Stenberg, Stanmore.
Logoi: `/wp-content/uploads/2022/11/{Stenberg-1,stanmore,emerton,Desman,CRV,dankers,dunlop,eon,exena,freehand,3M,Allyn,bicap,catamount,cerva,cofra}.png`, `2023/03/tekton-pro-workwear.png`, `2023/03/catamount-sport.png`.
(Brendovi koji se javljaju na proizvodima a nisu u karuselu: MAJICE SHOP, SAFEWAY.)

## 6. Footer (#282828, 4 kolone)

1. Logo (`2021/09/HTZ-Logo-copy-e1666887100962-1.png`) + ikonice: Karađorđeva 24, Svilajnac · Telefon: 035/88-15-322 (`tel:0358815322`) · Email: info@htzshop.rs
2. **INFORMACIJE**: Adresa: Karađorđeva 24, 35210 Svilajnac · Telefon: 035/88-15-322 · Email: Info@htzshop.rs · PIB: 110276071 · Matični broj: 64777858 · Banca Intesa: 160-492241-81 · Radno vreme: Pon – Pet: 7:00-15:00, subotom: 7:00-14:00
3. **LINKOVI**: Politika privatnosti (?page_id=3) · Pravo na odustajanje (?page_id=12) · Uputstvo za naručivanje (?page_id=38) · Plaćanje i isporuka (?page_id=2) · Izjava o odricanju od odgovornosti (?page_id=15378) · Reklamacija proizvoda (?page_id=15318) · Povraćaj novca (?page_id=15388)
4. **VAŽNI LINKOVI**: Početna · Prodavnica · O nama · Kontakt · Prijava/registracija (/moj-nalog/?action=register) · Lista želja · ~~lunaplay88~~ (spam, vidi dole) · Moj nalog
5. Copyright: „HTZ Shop 2022 created by HoodVision"
6. Cookie traka na dnu: „Koristimo kolačiće da bismo poboljšali vaše iskustvo na našoj veb stranici. Pregledavanjem ove veb stranice prihvatate našu upotrebu kolačića." — VIŠE INFORMACIJA · PRIHVATI

Mobilni meni (off-canvas): tab MENI / KATEGORIJE; POČETNA, PRODAVNICA, O NAMA, KONTAKT, LISTA ŽELJA, UPOREDI, LOGOVANJE / REGISTRACIJA.

## 7. Nalazi — šta na originalu ne valja (reći klijentu)

1. **Sajt je hakovan (SEO spam).** U sekciji PONUDA DANA stoji Elementor HTML widget sa `div style="position:fixed; top:-4568px; left:-4039px"` koji sadrži ~11.000 karaktera holandskog kazino teksta sa linkovima (vegasherocasino1.net, scoripro.net, froggybet-casino.net, nixbetcasino1.com, glorycasino-nederland.com, luckymax-nederland.com, oranjenl.com…). Nevidljiv je posetiocima, ali je u HTML-u i Google ga čita. Zbog njega je sekcija PONUDA DANA ~950 px visoka sa praznim prostorom.
2. **Footer link „lunaplay88"** → https://wirestartup.com/ — ubačen u meni VAŽNI LINKOVI, isti napad.
3. Mešana pisma: UI latinica, WooCommerce dugmad ćirilica.
4. „KONTAKTRIJATE NAS" (typo) na slajdu 2.
5. Polomljene slike: 3 sličice u NOVO U PONUDI i glavna slika Allyn polukombinezona u POSEBNA PONUDA.
6. U POSEBNA PONUDA istaknut je proizvod kog nema na lageru.
7. Store notice o „novonastaloj situaciji" (COVID) i dalje stoji.
8. HIGIJENA kolona u mega meniju i Majice/Polo/Duksevi u KATEGORIJE podmeniju vode na `#`.
9. Baneri (odeća, obuća, 4 mozaika) nemaju href na dugmadima.
10. Nazivi proizvoda nekonzistentni (neki ALL CAPS sa opisom, neki kratki).
11. Rukavice sekcija je nasumična pri svakom učitavanju.

## 8. Reference fajlovi

- `docs/reference/original-desktop-1440.png` — cela početna, 1440×5741
- `docs/reference/original-mobile-390.png` — cela početna, mobilni
- `docs/reference/original-slide-1-header.png` — header + slajd 1
- `docs/reference/original-slide-2.png`, `original-slide-3.png`
- `docs/reference/original-megamenu-prodavnica.png` — mega meni PRODAVNICA
- `docs/reference/original-megamenu-kategorije-odeca.png` — hover na „Zaštitna i radna odeća"

Sve slike proizvoda/banera su javno dostupne na `https://htzshop.rs/wp-content/uploads/...` (putanje gore su relativne na to).
