# Směr B - Fotografie první

**Myšlenka:** skutečná fotka lidí, míst a práce přes celou plochu, do které ze spodní hrany stoupá světlo v barvách značky. Každý post tak působí jako obálka, kterou nasvítil Brightbox.

## Co dělá jinak než současná sada a proč je lepší na telefonu
- Současných 26 šablon stojí skoro celé na titulku nad pastelovými koulemi. V mřížce splývají a na telefonu se z nich čte jen text. Tady pozornost nese fotka (obličej, budova, práce), značku nese světlo a text je kratší.
- Dlaždice v mřížce má na telefonu asi 130 px. Z té dálky se přečte obličej, obří číslo a barevná pata světla, titulek ne. Proto má titulek max. 3 řádky a nejmenší text má 26 px (asi 9,5 pt). Kontrast bílého titulku nad světlem je změřený strojově: i v nejsvětlejších 10 % pixelů je aspoň 4,6 : 1.
- Mřížka je šachovnice fotky a sazby. Půlka plochy zůstává mlha a fotky do světla přecházejí, nekončí v černé. Značka tak zůstává světlá i s tmavšími fotkami.

## Okraje a kotvy
- Okraj 72 px na šířce 1080. Horní kotva 72: logo vlevo (výška 40 px), rubrika vpravo. Dolní kotva 72: spodní hrana titulku. Popisek místa nebo autora stojí 28 px nad titulkem.
- Story: horní kotva 250, dolní 340 (zóny UI). LinkedIn: text od x 640 (profilovka zabírá 570 × 265), kotvy 64.

## Typografická škála (px na 1080)
- Rubrika Geist 600 22 (verzálky, prostrkání 0,16 em). Zdroj 26. Popisek 28 (story 32). Perex 32. Položka seznamu Sora 400 52, číslo položky Sora 600 32 Záře.
- Titulek: 72 (dlouhý titulek, hlavička sazby), 84 (feed), 96 (story, manifest), 60 (LinkedIn). Číslo Sora 600 330 v Záři.
- Titulek je vždy ve dvou řezech stejné velikosti a barvy: Sora SemiBold nese tvrzení, Sora Regular dovětek. Řádkování 1,0, prostrkání -4,5 %. Lámání se dělá ručně po celcích bez osiřelých slov, jednopísmenné předložky a spojky váže nezlomitelná mezera.

## Světlo zespodu (`.tp__bg`, jedna vrstva nad fotkou, normální krytí, žádné režimy prolnutí)
- Výška zóny `--h`: feed 560-700 px (41-52 % plátna), story 1250 (65 %), LinkedIn 360 (91 %).
- `.l-rise`: fialová #2A1F5C > #5B1F7A, výška 0,72 h, u hrany 94 % krytí, nahoru s náběhem ease-out k 0.
- `.l-src`: magenta #E50E81, elipsa 72 × 100 % se středem pod spodní hranou na 74 % šířky, výška h, krytí 72 % > 0. Fialová vlevo a magenta vpravo opakují hluboký přechod značky 118°.
- `.l-lift`: růžová #FF5FB2, výška 1,18 h, krytí 20 % > 0. Jen tahle vrstva sahá do fotky a prolne do ní světlo.
- Světlo nikdy nejde přes obličej. Brada je aspoň 120 px nad místem, kde krytí světla přesáhne 10 % (asi 0,75 h nad spodní hranou). Když to výřez nedovolí, zkrátí se titulek (Lidé: 2 řádky a logo Brightbox Group nese zbytek role).
- Sazba bez fotky (čísla, citáty, seznamy, manifest) má stejný tvar v pastelu na mlze: #C84BD8 22 %, #FF5FB2 50 %, #8E7BF0 20 %. Text je inkoustem.

## Fotka a výřez
- Výřez se zadává v px přímo na `<img>`, nikdy přes object-fit. Zvětšení u lidí max. 1,35×, u architektury max. 1,6×.
- Temeno je aspoň 40 px pod horní hranou a nikdy pod logem. Obličeje jsou ověřené detekcí (OpenCV). Text ve fotce (cedule) je buď celý mimo výřez, nebo celý pod plným světlem.
- Logo podle horního pásu fotky: tmavý pás = bb-logo-white (barevná krychle, bílý nápis), světlá obloha (jas > 50 %) = bb-logo-color. Posty o lidech skupiny = bb-group-white.
- Fotek je málo, proto má každá tři výřezy (celek, polocelek, detail). V jedné mřížce se stejná fotka neopakuje, mezi kanály se mění výřez (Praha: oblouk ve feedu, celek na LinkedIn; Anjolie: 9:16 story, 4:5 feed).
