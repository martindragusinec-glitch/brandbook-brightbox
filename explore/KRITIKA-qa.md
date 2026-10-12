# Kritika QA: šablony sociálních sítí Brightbox (11. 10. 2026)

Změřeno na http://localhost:4373/sablony.html, 26 šablon v nativních px (Playwright: Range po znacích, pixelový rozdíl se zapnutým a vypnutým textem, kontrast z reálných pixelů pod písmem). Všechny px = nativní rozměr šablony. Opravy kontrastu jsem ověřil zkušebním renderem (posun záře, barvy, alfa), zlomy změřením šířek textu v prohlížeči, ostatní jsou výpočet z naměřených px. Po zavedení škály přeměřit.

## 5 nejdůležitějších systémových zjištění
1. **Typografická škála se rozpadla.** 23 velikostí písma (18 až 330), 12 řádkování (0,84 až 1,4), 11 prostrkání, 12 různých velikostí titulků (54, 56, 64, 76, 84, 92, 100, 104, 112, 124, 136, 148). 44 textových bloků je ≤ 28 px, na telefonu (feed ≈ 0,36×) to je 9 až 10 px. Návrh: 330 / 148 / 112 / 84 / 56 / 40 / 30 (7 hodnot), řádkování 0,96 / 1,02 / 1,35, prostrkání -0,05 / -0,045 / 0 em, štítky jen +0,14 em (dnes 0,14 / 0,16 / 0,18).
2. **Titulky mají osamělá a osiřelá slova v 5 šablonách** (feed-myslenka, feed-citat, feed-manifest, story-clanek, reel-obalka). Příčina je pokaždé stejná: 124 a 100 px nepustí dvě fráze na šířku 936 px, a lámání se nechává na automatu.
3. **Bezpečné zóny porušují 3 prvky:** url ve stories sedí 75 px v dolní zóně 340, nadpis reelu zasahuje 60 px do pravé zóny 140, li-odkaz má descendery 67 px od hrany. Okraj 72 a pás 34 px feedu jinak drží.
4. **Kontrast na záři a šedé drobné texty.** Značka (58 px) v růžové záři má medián 2,6 až 2,9:1 (nejhorších 10 % pixelů 1,2; na Mlze 4,8) v 5 šablonách. Čísla stránek #8C86A0 mají 3,1:1 (nejhorší 2,6), na záři v car-5 jen 1,9:1. Zdroj `.tp__src` na tmavé má nejhorší pixely 3,5:1.
5. **Kotvy nejsou jedny.** Spodní hrana těla: poslední řádek base 1148 až 1187 (rozptyl 39 px), feed-lide o 34 px níž. Štítek je v horní řadě (cap 95) jen u 5 z 7 feedů, jinde v těle. Titulek car-5 je o 100 px výš než car-2 až 4. Logo 300 vs 330 px, tři umístění těla ve stories, covery mají štítek jednou nad, jednou pod claimem.

## Co je v pořádku (změřeno)
- Okraj 72: minimum inku 72 (feed, carousel, stories), pás 34 px feedu 0 textů. Přetečení z kontejneru 0, nejpravější text 1008.
- Zakázané znaky (dlouhá a střední pomlčka, middle dot): 0. Jednopísmenné předložky a spojky na konci řádku: 0 (i dvoupísmenné do/na/ve/se: 0). Sora i Geist načtené, diakritika se vykresluje.
- Značka 58×63 vždy T73 (stories T251), R1008. profil-avatar má střed 540/540, ikony highlightů 300 px na 540/960.
- Fotky: feed-lide 1000×1250 = přesně 4:5, bez ořezu, hlava volná (vrchol y≈130, text začíná pod bradou y 958), upscale ×1,08. Avatar 132 px: hlava celá, vlasy 11 px od okraje kruhu.
- Kontrast ostatních textů 4,5:1 a víc (typicky 6,5 až 15,8). Hluboký přechod 118° odpovídá brandu.

## Kotvy napříč sadou (nativní px)
| formát | štítek / horní řada | adresa dole | spodní hrana těla (base posledního řádku) | levý ink |
|---|---|---|---|---|
| feed 7× | cap 95 u 5; lide: cap 963 v těle; manifest: logo T72 | base 1268 u všech 7 | 1153 myslenka, skupina; 1157 cislo; 1148 manifest; 1187 lide; chips 1166 nabor; avatar 1182 citat | text 73-75, titulky 76-83 |
| carousel 5× | cap 95 u všech, značka chybí u car-5 | base 1268 (car-1 Listujte, car-5 jen strana) | car-1 1153; car-2 až 4 titulek shora cap 346, car-5 cap 246 | 72-74, titulky 72-82 |
| stories 5× | cap 273 u 4, reel ve středu těla | base 1650 u 2 (v zóně) | tělo dole 1540 u 3, shora 420 u clanek, střed 810-1110 u reel | 74-85 |
| covery 3× | clabel nad claimem (li-firma), pod claimem (fb) | bez | claim L 640 / 640 / 720, velikost 64 / 56 / 136 | 641-732 |

## Tabulka problémů (podle závažnosti)
| id šablony | problém | naměřeno | oprava v px |
|---|---|---|---|
| **A. porušení tvrdých pravidel a zón** | | | |
| story-myslenka, story-cislo | url v dolní zóně stories | ink 1630-1655, zóna od 1580, zasahuje 75 px | smazat `.tp__bot` (jako story-clanek a nabor), nebo `.tp--story .tp__bot{bottom:260→380}` a tělo `bottom:380→500` (url ink 1535, mezera k tělu 79) |
| reel-obalka | nadpis v pravé zóně 140; osiřelé „report." | ink R 1000 > 940 (o 60), řádky 924 / 396 | `.tp-reel .tp__body{right:72→140}`, h 124→112, `<br>` po „Jak číst": 401 / 791 ≤ 868 |
| story-clanek | osiřelé „report." + osamělé „marketingový" | řádky 745 / 650 / 319 px (34 %) | h--m 100→84: 2 řádky 632 / 836 ≤ 936 |
| feed-myslenka | osamělé „Potom"; poslední řádek jedno slovo | řádky 767 / 392 / 570, „Potom kampaně." = 983 > 936 | h 124→112 + `<br>` po „směr.": 692 / 888 |
| feed-citat | osamělé „dnes," | řádky 768 / 264 / 747; `max-width:900` láme „uživí dnes," | smazat `max-width`, `<br>` jako „Výkon vás / uživí dnes, / ale brand zítra.": 529 / 503 / 747 |
| feed-manifest | osamělé „Jedna" mezi dvěma řádky | řádky 643 / 365 (39 %) / 821, „Jedna odpovědnost." = 1207 @124 | h 124→84: 2 řádky 436 / 818 (nebo ponechat stack vědomě, rozhodnout) |
| li-odkaz | text 67 px od spodní hrany | ink B 560 z 627 (descendery „g", „p", „ý") | `.tp-link .tp__body{bottom:72→80}` (ink 75) |
| **B. čitelnost a systém** | | | |
| car-1 až car-4 | `.tp__page` šedá #8C86A0 | 3,1:1 med, 2,6 min (28 px, tedy i pod 3:1) | barva #5A5370 = 6,5:1 |
| car-5 | `.tp__page` na růžové záři | 1,9:1 med, 1,75 min | #5A5370 + `.g1{bottom:-460→-640}` = 4,6 až 4,8:1 |
| feed-myslenka, feed-nabor, car-1, story-myslenka, story-nabor | značka na hotové záři (g1 pod ní) | med 2,8 / 2,6 / 2,75 / 2,9 / 2,8, nejhorší pixely 1,2 | `.g1{top}` o +400 px níž (např. -420→-20): med 4,2 až 4,4 |
| story-clanek | štítek „Nový článek" na záři g1 | 3,8 až 3,95:1 | `.g1{top:-200→200}`: 5,8 až 6,0:1 |
| feed-cislo, story-cislo | `.tp__src` 24 px, alfa .62 | min 3,5, med 5,4 až 5,7 | 24→30 px, alfa .62→.80: min 4,8 (řádek 814 ≤ 820) |
| car-4 | url vpravo na magenta | min 3,9, med 4,4:1 | `.gd{right:-560→-760; bottom:-560→-760}`: min 4,6, med 5,4 |
| li-firma | `.tp__clabel` 18 px (na LinkedIn mobilu ≈ 5 px) | 4,2 až 4,6:1 | 18→26 px, barva #1B1432 (>10:1) |
| car-5 | titulek o 100 px výš než car-2 až 4 | cap 246 vs 346 | `.tp-car--cta .tp__body{top:236→336}` |
| feed-lide | tělo o 34 px níž, štítek v těle | base 1187 vs 1153, mezera k url 55 vs 89; label cap 963 vs 95 | `.tp-people .tp__body{bottom:150→184}`, štítek do `.tp__top` místo prázdného `<span>` |
| feed-citat | řádek autora o 16 px níž než kotva | avatar bottom 1182 vs 1166 | `.tp__who{bottom:168→184}`, `.tp__body{bottom:372→388}` |
| car-5 | logo 330 px a bottom 150 | bottom hrana 1200 vs 1166, feed-manifest má 300 | `.tp__logo{width:330→300; bottom:150→184}` |
| story-clanek vs ostatní | tři kotvy těla ve stories | clanek shora 420 (cap 431), ostatní dole 1540 | buď zapsat jako výjimku, nebo tělo `bottom:500` a nálepku nad něj (`bottom:520→1000`) |
| li-firma vs fb-cover vs li-osobni | clabel nad (li-firma) / pod claimem (fb); claim 64 / 136 / 56 | cap 78 vs 724 pod claimem | clabel vždy nad claimem, li-firma claim 64→56 |
| celá sada | rozptyl velikostí a mezer | mezery 24, 28, 30, 32, 36, 40, 44, 48, 56, 64 | škála 7 velikostí (viz výše), mezery 24 / 40 / 56; po změně přeměřit zlomy |
| celá sada | `.tp__endorse` 22 px, .18em; src 24; clabel 18 | nejmenší texty 18-24 px | všechny meta texty min 30 px, uppercase štítek 30 px / .14em |
| **C. drobnosti** | | | |
| všechny s nadpisem ≥ 100 px | optický levý okraj titulku | ink L 76-85 vs 74 u malého textu (+11 u „Méně", +9 u „Nejdřív") | `margin-left:-0.06em` u `.tp__h` ≥ 100 px (-7 px na 124) |
| feed, carousel | horní řada vs spodní nesymetrická | střed horní řady 104 od hrany, spodní 92 (12 px) | `.tp__bot{height:40→64}` |
| všechny stories | značka 1 px od horní zóny | mark T251, zóna 250, štítek cap 273 | `.tp--story{--top:250→274}` |
| feed-cislo, story-cislo | datum „6. 10. 2025" jen s běžnou mezerou po „6." | dnes jeden řádek 651 px, po změně textu se rozbije | `6.&nbsp;10.&nbsp;2025.` |
| story-clanek | zástupná nálepka s přerušovaným obrysem (3 px dashed) a textem 3,1:1 | je vidět defaultně (není pod `.tp__safe`), dostala by se do exportu | skrýt jako `.tp__safe` (`display:none`, jen v náhledu) |
| car-2, car-3, car-4 | akcentní číslice #E50E81 na Mlze | 3,99:1 (44 px a 36 px), prochází jen jako velký text | barvu značky neměnit, držet číslice ≥ 40 px |
| celá sada | tmavých ploch 11 z 26 (42 %), highlights 4 ze 4 | brand: „tmavé jen akcent" | aspoň 2 highlighty na Šeřík #ECE6FA s inkoustovou ikonou |

## Fakta proti CONTENT.md
- feed-myslenka: „Plán aktivit jen o tom, co dělat budete." není doslova zdroj („Plán aktivit uvádí jen to, co dělat budete.", ř. 83). Titulek „Nejdřív směr. Potom kampaně." vs zdroj „Nejdřív směr, potom kampaně." (ř. 131).
- feed-citat: role „CEO Growtix, Brightbox Group" vs zdroj „v době studie Head of Digital v Brightboxu, dnes CEO Growtix" (ř. 25, 62).
- feed-skupina: „Part of Brightbox Group" je anglicky a v CONTENT.md není. Čísla +118 % (Anjolie) a +81 % (Pinoys), jména a role Stehno, zdroj Seznam 6. 10. 2025 sedí 1:1.
