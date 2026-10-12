# Směr A - Evoluce: světlo zespodu

**Myšlenka:** koule světla z loga leží těsně pod spodní hranou každého formátu a její svit stoupá k obsahu. Každý post je krabice, do které zespodu svítí světlo.

## Co dělá jinak než současná sada a proč funguje líp na telefonu
- Jedno světlo s jasným zdrojem místo tří mlhavých koulí přes celou plochu. Zářící spodek dlaždice je podpis, který se pozná i na 120px náhledu v mřížce.
- Kompozice podle obsahu, ne vše vlevo dole: titulek nahoře (Myšlenka), číslo na ose (Číslo), titulek dole ve světle (Lidé, obálka), dva výroky proti sobě (vnitřní slide).
- Carousel spojuje šev: světlo obálky vychází z pravé hrany a pokračuje na dalším slidu, takže k listování vybízí samo.
- Silnější kontrast měřítek (číslo 320 px proti popisku 36 px, titulek 128 px proti štítku 22 px). Titulek ve dvou řezech, Sora SemiBold + Regular: název a vysvětlení, nikdy barvení slov.
- Fotka přes celou plochu, světlo se do ní prolíná zespodu a nese bílý titulek. Obličej zůstává čistý, bez tmavého závoje.
- Na telefonu: méně prvků, titulky 27-58 pt, nejjasnější místo dlaždice je vždy u textu a žádný text v 34px pásu, který mřížka ořízne.

## Pravidla systému
- **Okraje:** 72 px na šířce 1080 ve všech formátech. Story: rám začíná na y 250, dole 340 px bez textu. LinkedIn osobní: obsah od x 640, vlevo dole 570 × 265 px volno pro profilovku.
- **Rám:** štítek vlevo nahoře (Geist 22 px, verzálky, prostrkání 16 %), značka vpravo nahoře (50 px), patička na spodní kotvě (Geist 24 px). Stejné kotvy v celé sadě.
- **Kotvy textu (1080 × 1350):** nahoře y 232; dole končí blok na y 1166; osa = optický střed (blok čísla a popisku kolem y 630). Story: titulek y 430, výzva y 1250.
- **Typografická škála (px na 1080):** číslo 320 / titulek XL 128 (story 160) / L 100 / M 76 / S 56-64 Sora SemiBold, druhý řez Sora Regular stejnou velikostí; perex 36 Geist, zdroj 24, štítek 22. Nevejde-li se nejdelší řádek, o stupeň dolů (128 > 116, 100 > 92). Nikdy řádky po jednom slově.

## Světlo zespodu (podpis sady)
- **Geometrie:** elipsa ukotvená středem na spodní hraně. Vodorovný poloměr 0,74 × šířka (poměr koule a krychle v logu; 800 px na 1080, 1172 px na LinkedIn).
- **Výška ve třech úrovních:** 0,45 H u fotky (končí pod bradou), 0,67 H u obálek, slidů a stories, 0,8 H u Myšlenky, Čísla a LinkedIn coveru.
- **Zdroj na kotvě:** 25, 50 nebo 75 % šířky; carousel na švu (obálka 100 %, další slide 0 %). Fialový bok vždy o půl poloměru vedle jádra, na stranu od okraje.
- **Na Mlze pastelově:** úzké jádro #E50E81 46 %, svit #FF5FB2 66 % přes #C84BD8 do nuly, bok #8E7BF0 52 %. Text ve světle Inkoust.
- **Na přechodu a fotce sytě:** jádro #E50E81 96 % do #5B1F7A 94 % a #362770 62 %, prolíná se do plochy. Text ve světle bílý.
- **Nikdy:** shora, ze strany, jako plovoucí koule uprostřed, pod značkou, prstenec ani obrys. Do Figmy jde jako jedna rastrová vrstva `.tp__bg`.

## Kdy co
- **Mlha + pastelové světlo** = výchozí: myšlenky, magazín, nábor, covery.
- **Fotka** = lidé, jen skutečné fotky z `assets/img/people`, světlo končí pod bradou, jméno a role ve dvou řezech.
- **Hluboký přechod** = jen důkaz (číslo, výsledek), v mřížce nejvýš 1 z 9. V každém řádku mřížky nejvýš jedna sytá dlaždice (fotka nebo přechod), mřížka tak zůstává světlá.
