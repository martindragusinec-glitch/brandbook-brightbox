# Směr C - Jasno v číslech

**Myšlenka:** Brightbox mluví jako vedení, které rozhoduje podle čísel: jedno obří číslo nebo výrok na klidné Mlze a světlo značky dopadá jen na to, co má čtenář vidět první.

## Co dělá jinak než současná sada
- Současná sada stojí na atmosféře (tři pastelové záře na šablonu, tmavé přechody, titulek kolem 124 px). C stojí na hierarchii: jedna věc obří, zbytek malý a tichý. Kontrast měřítek až 400 : 30.
- Pozadí je vždy čistá Mlha, text Inkoust. Tmavé přechody zmizely, značka zůstává světlá. Záře se jako barva textu nepoužívá.
- Světlo není dekorace v rohu, ale reflektor: jedna elipsa přesně za klíčovým číslem nebo slovem, text zůstává inkoustový.
- Číslo má vždy popisek a zdroj na stejném místě. Data jsou tabulka bez linek, drží ji jen zarovnání do polí.
- Logo jen jednou, v patičce, místo značky vpravo nahoře.

## Proč bude fungovat líp na telefonu
- Písmo 400 px má na telefonu (šířka 390 pt) asi 144 pt, v dlaždici mřížky profilu asi 51 pt. Současný titulek 124 px má v mřížce asi 16 pt.
- Nejmenší text 30 px (asi 11 pt). Současné štítky a zdroje 24-26 px jsou pod 10 pt.
- Hrdina visí vždy ze stejné linky, takže profil v mřížce čte jako jedna série a ne jako mix stylů.
- Vše podstatné leží uvnitř okraje 72 px, výřez 3:4 (34 px z boku) nic neusekne.

## Pravidla systému
- **Mřížka 1080:** okraj 72, 6 sloupců 136 + mezera 24 (krok 160). Tři pole po dvou sloupcích (296) na x 72 / 392 / 712. Svisle stejný krok 160 od y 72, půlkrok 80, všechny polohy v násobcích 8.
- **Kotvy feedu 1080 × 1350:** A 72 hlavička (pole: typ, téma, kontext), B 232 hrdina, 632 popisek hrdiny, C 872 data, jméno nebo podpůrná věta, D 1278 patička (logo, zdroj, URL). Text je oříznutý na verzálku a účaří, takže hrany sedí přesně na linkách. Účaří slova Brightbox v logu = účaří patičky.
- **Story 1080 × 1920:** stejná mřížka od y 250 (hrdina 410, popisek 810, tabulka 1010 po řádcích 128, patička končí na 1580), spodních 340 px prázdných.
- **LinkedIn 1584 × 396:** číslo a popisek od x 712 (sloupec 5), logo vlevo nahoře nad zónou profilovky 570 × 265.
- **Škála (krok asi 1,45):** Sora SemiBold 400 / 256 / 184 / 128 / 88 / 64, prostrkání -4 až -5,5 %. Geist 44 (popisky) a 30 (meta, zdroje). Jednotka u obřího čísla o tři stupně menší (128), na účaří.
- **Barvy:** Mlha pozadí, Inkoust text, #5A5370 sekundární text. Žádná další barva v typografii.
- **Kdy světlo:** nejvýš jedno na šablonu a jen na prvek, který nese pointu (číslo, rozhodující slovo jako „Čísla" nebo „nebo"), nikdy na poslední slovo titulku, fotku, logo, seznam ani vnitřní slide. Elipsa má střed v optickém středu prvku, šířku prvek + 2 × 240 a výšku verzálka + 2 × 220, pastely #FF5FB2 > #C84BD8 > #8E7BF0 do Mlhy.
- **Fotky:** portrét je modul mřížky (sloupce 3-6, spadávka nahoru a doprava, konec na y 848), nikdy celá plocha a nikdy pod textem.

Soubory: `index.html` (`?grid` ukáže mřížku, `?safe` zóny), `style.css`, `render.mjs` (`--bake` přepočítá světlo, vždy vyrobí `sheet.png`).
