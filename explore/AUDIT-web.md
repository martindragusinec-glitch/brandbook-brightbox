# QA audit webu Manuál značky Brightbox (index, socialni-site, smery), 11. 10. 2026
Playwright, Chromium: 1440×900, 1024×768, 390×844 (isMobile, hasTouch) + šířky 320-1920; animované i `?static`, reduced-motion zvlášť. Nic neopraveno. Závažnost: V = vysoká, S = střední, N = nízká.

## 5 nejzávažnějších problémů
1. **Kotva `index.html#ke-stazeni` míří vedle:** tlačítko Ke stažení v nav a odkaz v patičce na socialni-site a smery přistanou o 4951 px nad cílem (ostatní kotvy #skupina až #aplikace o 2279 px). Důvod: kotva se spočítá dřív než pin-spacery GSAP.
2. **Sekce Aplikace (připnutá jízda):** popisky karet jsou po celou jízdu mimo okno (y 884-939 při výšce 900), karta Web je 880×900 místo 880×550 (HTML atribut height přebíjí aspect-ratio, cover ořízne), na mobilu 940 px vysoký prázdný sloupec. CLS 1,9.
3. **Obsah zmizí:** konstrukce loga ukáže na mobilu, tabletu ≤900 px i při reduced-motion jen krok „Krychle“ (Kruh, Světlo uvnitř, Barva mají opacity 0). Při reduced-motion na desktopu jsou 4 z 6 aplikací mimo dosah (overflow hidden bez scrollu).
4. **Háčky Č a Š jsou useknuté** v animovaných nadpisech (`.ln{overflow:hidden}`): „Čtyři vlastnosti“, „Čím osobnější obsah“, „Šablony pro každý den.“, „Šablony do práce.“ V manuálu typografie.
5. **Mrtvé a nepravdivé stahování:** „Šablony ve Figmě“ má `href="#"`; „Profilová fotka, 1080×1080 na Mlze“ vede na `bb-mark-color.png` 553×600; na mobilu mají Obsah a Ke stažení v nav prázdný přístupný název.

## Tabulka (od nejzávažnějších)
| stránka | sekce/selektor | problém | naměřeno | návrh opravy |
|---|---|---|---|---|
| index | `#aplikace .hpan`, `.browser img` | V: popisky pod okrajem, karta Web zkreslená | popisky 884-939 (1024×768: 746-826 z 768), sekce 1505 px, img 880×900, CLS 1,916 | pin max 100svh, menší `.ch--open` padding, `height:auto` u `.browser img`, rozměry u `vizitky-nahled.png` |
| index | `#aplikace` (mobil) | V: obří prázdná karta Web | 320×900 vs ostatní ~400 px | stejná oprava, výška dle aspect-ratio |
| index | nav CTA, `.foot__links`, `#skupina`-`#aplikace` | V: kotvy po pinu přistanou mimo cíl | `#ke-stazeni` top 4951 px, ostatní 2279 px (scrollY 31573) | po `ST.refresh()` znovu `scrollTo` na hash, nebo kotvy mimo pin |
| index | `.construct .cstep` | V: 3 ze 4 kroků neviditelné | ≤900 px a reduced-motion: opacity 0, is-on jen první | pod 901 px všechny kroky pod sebou |
| index | `.hpan` při reduced-motion | V: aplikace 3-6 nedostupné | app--cards left 960, app--social right 4056 při vw 1440 | `.hpan{overflow-x:auto}` jako ≤900 |
| index, social | `[data-lines] .ln` | V: útržek háčku na Č, Š | rozdíl 417 px v pásu 6-13 px nad boxem; 4 nadpisy | `.ln{padding-top:.25em;margin-top:-.25em}` |
| social | `#ke-stazeni`, `[data-figma]` | V: odkaz `#`, hlavní karta bez cíle | 1 z 5 karet | doplnit URL Figmy nebo karta pryč |
| index (mobil) | `.nav__index`, `.nav__dl` | V: ikony bez názvu (span display:none ≤760) | prázdné názvy ×2 na všech 3 stránkách | `aria-label` |
| všechny | `.nav.is-hidden` | S: skrytá nav zůstane fokusovatelná | 4 tab stopy NAV-HIDDEN na stránku | na focusin sundat is-hidden |
| index, social | `#index` overlay | S: bez focus trapu, bez role dialog | z 16 Tabů 5 mimo overlay, focus scrollne stránku | `inert` na main a footer, `role="dialog" aria-modal` |
| index | `--ink50` #8C86A0 text 12-14 px | S: nízký kontrast | 3,09:1 na Mlze, 3,48:1 na bílé; hero__meta dt, tone__ctx, orbit__core p, spec__ctl label, browser__bar span, el__code, tc em, li__s, sz th | `--ink70` #5A5370 (6,5:1) |
| index | `.band--zare` | S: bílý text s alfou na Záři | `.band__r` 3,55:1, `dt` 2,27:1, tlačítka 4,46:1 | alfa 1, dt 14 px, popis na Záři nad 24 px |
| všechny | `.foot__meta a` | S: e-mail na magentové záři | 2,83:1 (14 px, alfa .7) | alfa 1, záři dál |
| index | `:focus-visible` na `.band--zare`, Soumrak | S: prstenec splývá s plochou | 1:1 (Záře), 2,8:1 (Soumrak); `.spec__sample` bez outline | bílý ring na tmavých a barevných plochách |
| index | `#logo` hřiště, volba Fotografie | S: logo přes obličej | wordmark x 235-625 přes tvář a bradu (stage 1328 px), mobil též | logo vlevo nahoře mimo hlavu |
| index | `.hero__mark` vs titulek | S: text přes značku | 360×640 titulek+lead 209×124 přes kostku; 768×1024 „ál“ přes kostku | menší mark ≤900 nebo text pod něj |
| index | `.ratio__bar span` | S: popisky useknuté | ≤1024 „Soumrak“ dx 7; 390: 5 ze 6 („Sou“, „Zář“), Noc bez popisku | legenda pod pruh |
| index | `.orbit .opill` | S: piluly přes kartu skupiny | Sparkee 36×28 @1024, 62×38 @960, 86×38 @901; Growtix 128×12 @901 | skládat pod sebe do 1100 px |
| social | hero `.phone` (mobil) | S: dolní řada ořezaná rohem | „odpovědnost.“ → „dpovědnost.“, přetečení `.ig` 6 px | kratší bio / výška auto |
| index, social, smery | titulky mobil a šablony | S: osiřelá slova | 390: „Nikdy.“ 31 %, „kolem.“ 41 %, „report.“ 40 %, „firem.“ 54 %, „vydělává.“ 36 %; smery „Čtyři / směry šablon.“ 35 %, desktop „Evoluce: světlo / zespodu“ 58 %; šablony „Potom“, „dnes,“, „Jedna“, „report.“ ×2 | ruční zlomy, nbsp v posledních dvou slovech |
| index | `.spec__ctl` tester | S: slider Velikost bez efektu, Řez bez názvu | strop `11vw`: 158 px @1440, 112 @1024 (pod výchozími 120), 43 @390; `<label>` míří na `<output>`, input bez názvu | odstranit strop, `aria-label`, zobrazit hodnotu |
| smery | celá stránka | S: pracovní text v hlase asistenta | tykání „tvé světlo“, „ti líbily“, „Rozhodnutí je na tobě“, „Moje doporučení“, persony „Stratég“, „QA art director“, „podle kritiků“; social „Pracovní verze“ | před předáním přepsat vykáním nebo vyřadit |
| index | `.photos .jg` | S: jméno u neověřené osoby | `alt="Michal Vávra"`; Baků a Vávra pod štítkem „Lidé“ (CONTENT §2, §9) | alt bez jména, role potvrdit |
| index, social | `#typografie .hs-cap`, `#prvky .bignum__c` | S: čísla bez zdroje dle CONTENT §9 | +81 %, +118 % bez „14 dní před a po, mobil, GA4“, bez „Blog Seznamu 6. 10. 2025“ | doplnit jako u `feed-cislo` |
| social | `.amount__mk` (Lehký rám) | S: bílá značka na světlé fotce | kontrast 1,2:1 (min 1,17), 23×25 px | tmavá varianta nebo scrim |
| index | `.nav__title` | S: svislý oddělovač = dekorativní čára | `box-shadow:inset 1.5px`; dále `.band` 1 px, `.browser__bar` 1 px, keyliny 1 px na 7 swatchích | odstranit |
| social | `#ke-stazeni` Profilová fotka | S: popis neodpovídá souboru | PNG 553×600 průhledné, ZIP má `profil-avatar.jpg` | dodat 1080×1080 na Mlze |
| index | `#ke-stazeni` Logo | N: „12 verzí“ | ZIP: 14 SVG + 14 PNG (28 souborů) | „14 verzí“ |
| index | `.app--mail .sig`, `vizitky-nahled.png` | N: místo role „Brightbox Group“; osobní údaje J. Kuby | popisek slibuje roli; tel. a e-mail v obrázku (CONTENT §9: jen se souhlasem); PNG 1,1 MB bez rozměrů | role „CEO a zakladatel“, ověřit souhlas |
| index | Barevné verze vs Logo na pozadí | N: protiřečení | „světlých fotografiích“ barevné vs „na fotografii bílé“ | sjednotit na bílé |
| index, social | „Part of Brightbox Group“, bio „Váš marketing, náš tým.“ | N: mimo CONTENT | věta „V patičce webu, na rubu vizitky…“, čárka místo „Váš marketing. Náš tým.“, LinkedIn „Marketing a reklama, Praha“, CMYK a Pantone | ověřit zdroj |
| index | `.space__text .lead` | N: žádná mezera pod h2 | 0 px (jinde 32) | `margin-top:var(--s4)` |
| index | `.ver__t` | N: popisky verzí nezarovnané | top 8101 vs 8015 (86 px) | stejná výška stage |
| index | `.band` | N: hairline mezi pásy | `box-shadow:0 -1px` | odstranit |
| index | celé | N: uniformní karty | 64 prvků r28 px (35 bílých), social 18 | variovat plochu a radius |
| index | typografie webu | N: nesystémová škála | 39 velikostí, 19 řádkování, 11 hodnot mezi 12 a 17,5 px | škála ze 7 stupňů |
| index, social | mezery sekcí | N: prázdná místa | desktop 304-447 px, mobil 224-548 px | menší `.ch--open` a pin padding |
| index, social | texty pod 14 px (mobil) | N: malé písmo | index 35, social 18, smery 3; min 12 (11 v phone mocku); copy buttons 26 px vysoké | štítky 14 px, tap cíl 44 px |
| social | `#sablony` | N: kotva -61 px | nadpis pod navigací | `scroll-margin-top` |
| social, smery | konzole | N: GSAP varování | 10 za načtení: `.essence__light`, `.essence`, `.mo--text` nenalezeny | guardy v `brand.js` |
| index | inline `{{mark}}` ×2 | N: duplicitní id | `paint0-8_linear_11_334` ×2 | prefix id v `mark_groups()` |
| všechny | ARIA a scroll | N: aria-label na div bez role | `.phone`, `.car`, `.orbit`, `.ratio`; `.sz` (720>350) a `.car` bez tabindex; skrytá věta `.t-ne` se čte | role, `tabindex="0"`, `aria-hidden` |
| index | `.opill--sp`, `--p4` | N: nejsou odkazy | print4you.cz je v CONTENT §1 | odkaz u Print4You |
| social | `.fbc` mobil, `story-clanek` | N: prázdné pásy, placeholder | 97 px nad a pod výřezem; čárkovaná nálepka viditelná | `margin` dle režimu, skrýt v exportu |
| index (320 px) | `.tints__list` | N: přetečení | scrollWidth 327 > 320 | `minmax(0,1fr)` |
| social | texty | N: „scrim“, „Emoji nejvýš jedno“, „Vybíráme ze čtyř směrů, porovnat…“ | anglicismus, BRIEF „žádný emoji“, rozbitá věta | přepsat |

## Co funguje (změřeno)
- Přepínač tónu (aria-pressed, 2 stavy), logo na pozadí 18/18 kombinací (barevné jen Mlha a Bílá, jinde bílé, správný soubor, popisek, href), 20 tlačítek barev kopíruje přesnou hodnotu a toast mizí po 1,6 s.
- Obsah: aria-expanded, Escape zavře a vrátí fokus na Obsah, položky skáčou na kapitolu (top 84 px); nav aria-current i na smery.
- Filtr šablon (19 karet: 7/1/5/6), zóny (13 vrstev), Instagram 4:5/3:4 (clip 3,125 %), Facebook (12,96 %), konstrukce loga 4 kroky na desktopu, jízda aplikací -2672 px.
- Dlouhá a střední pomlčka i middle dot: 0× v DOM, alt, title i zdrojích; „BrightBox“ nikde; jednopísmenné předložky na konci řádku 0× při 320-1920 px (kromě výčtu „v, s, k, a, i“ v pravidle Předložky).
- Žádné vodorovné přetečení 360-1920 px, jeden h1, bez přeskoků úrovní, `lang="cs"`, alt u všech obrázků, skip link, odkazy 200 (kromě povoleného PDF).
- Hexy, čísla 20+/200+/4/2, Stehno, e-mail, zóny story 250/340, reel 440/140 a pás 34 px sedí s CONTENT a BRIEF; hodnoty kontrastu v tabulce Čitelnost vyšly výpočtem.
- Sora i Geist se latin-ext načtou, reduced-motion vypne GSAP, JS chyby a 404 žádné.
