# Kritika šablon a stránky Sociální sítě (stratég B2B), 11. 10. 2026

Posouzeno: 26 šablon z aktuálního `src/partials/templates.html` vyrenderovaných 1:1 a stránka `socialni-site.html` (desktop 1440 px, mobil 390 px). Telefon simulovaný v Playwrightu: feed na šířce 375 px, story 390×844, mřížka IG 3×3 ve výřezu 3:4 na 375 px.

## Verdikt
1. Sada je vizuálně čistá, světlá a rozpoznatelná, ale slouží značce víc než publiku: ukázkové texty jsou slogany, nejsilnější háčky z webu nepoužívá a obchodní nabídku nenese žádná šablona.
2. Scroll spolehlivě zastaví jen „Číslo" a „Lidé", ostatní typografické posty mají stejnou kostru (štítek, značka, titulek dole, adresa), takže v mřížce splývají a drobné texty pod titulkem mají na telefonu jen 7,6 až 10,4 px.
3. Pro majitele a ředitele je hlavní kanál LinkedIn, sada ale obsluhuje hlavně firemní stránku a Instagram, chybí vrstva pro profily vedení, případovka jako dokument a interakce, a Facebook je navržený pro stránku, která podle CONTENT.md neexistuje.

## Efektivní velikost na telefonu
Měřítko: feed 375/1080 = 0,347, story 390/1080 = 0,361, dlaždice mřížky 123,7 px z viditelných 1012 px = 0,122. Hranice čitelnosti je 11 pt, nejmenší výchozí styl v Apple HIG (Caption 2).

| Prvek | šablona | feed 375 | story 390 | mřížka |
|---|---|---|---|---|
| „Part of Brightbox Group" `.tp__endorse` | 22 | 7,6 | - | 2,7 |
| zdroj čísla `.tp__src` | 24 | 8,3 | 8,7 | 2,9 |
| štítek `.tp__label` | 26 | 9,0 | 9,4 | 3,2 |
| adresa, číslo strany, čip | 28 | 9,7 | 10,1 | 3,4 |
| role v citátu, tlačítko ve story | 30 | 10,4 | 10,8 | 3,7 |
| podtitulek `.tp__sub` | 38 | 13,2 | 13,7 | 4,6 |
| titulek `--s` / základní | 84 / 124 | 29 / 43 | - / 45 | 10 / 15 |

Covery na mobilu: `li-firma` štítek 18 → 4,5 px a claim 64 → 15,9 px (375/1512), `li-osobni` claim 56 → 13,3 px, `fb-cover` štítek 26 → 5,1 px (375/1920), `li-odkaz` štítek 26 → 8,1 px. V mřížce je čitelný jen titulek a fotka, celé sdělení proto musí nést titulek.

## 12 změn podle dopadu

**P1-01 `feed-cislo`, `story-cislo`: zdroj a metrika.** Zdrojový řádek doplnit o „14 dní před a po spuštění, mobil, GA4". CONTENT.md v oddílu 9 to vyžaduje, šablona to nemá. Řádek zvětšit z 24 na 32 px a průhlednost z .62 na .8 (na telefonu z 8,3 na 11,1 px). Jako hlavní číslo pro vedení brát obchodní metriku místo návštěvnosti: „+50 %" s popiskem „konverzí u JK šperků po nasazení formátu Interscroller". Proč: ředitel se u „+118 % nových uživatelů" hned zeptá na konverze (u Anjolie +5,26 %). Nejlepší číslo vytržené z kontextu podkopává princip „Čísla, kterým rozumí vedení".

**P1-02 `tpl.css`: spodní hranice písma 32 px.** `.tp__label` 26 → 32, `.tp__url` a `.tp__page` 28 → 32, `.tp__src` 24 → 32, `.tp__chip` 28 → 34, `.tp__role` 30 → 34, `.tp__endorse` 22 → 30, `.tp__cta` 30 → 34. Na feedu 375 px pak nic neklesne pod 11,1 px. Proč: zdroj čísla je princip č. 4 stránky, a přitom se na telefonu nedá přečíst.

**P1-03 Titulky s jediným slovem na řádku (tvrdé pravidlo).** `feed-citat`: „dnes," zůstává na řádku samo, protože ruční `<br>` a 104 px se nevejdou do 900 px. Řešení: 92 px a `max-width:936px`, pak se vejde „Výkon vás uživí dnes, / ale brand zítra." (928 px). `feed-myslenka`: samotné „Potom". Při 116 px místo 124 se vejde „Potom kampaně." (920 px). `feed-manifest`: samotné „Jedna", řešení 94 px a zlom za „tým.". `car-4`: „Strategie" i „rozhoduje" stojí každé na vlastním řádku. Řešení 100 px a zlomy „Strategie rozhoduje / o tom, co / nebudete dělat.". `story-clanek`: „marketingový" i „report." stojí každé samo, při 90 px vyjde „Jak číst měsíční / marketingový report." (887 px). Proč: dvouřádkový titulek se přečte za 2 s, třířádkový schod ne.

**P1-04 Ukázkové texty: háček místo sloganu.** V `feed-myslenka` nahradit „Nejdřív směr. Potom kampaně." větou „Platíte pět dodavatelů. Kdo z nich odpovídá za výsledek?" (H2 webu, 9 slov) s podtitulkem „Za celek odpovídáme my.". V `story-myslenka` nahradit „Méně aktivit, víc výsledku." větou „Dobrý marketingový tým ještě není dobrý marketing.". Titulek přesunout z dolní třetiny (dnes začíná na y 664) na y 236 jako u `car-2`. Při scrollování se post vysouvá zespodu obrazovky, takže horní hrana je vidět jako první, a dnes je tam jen záře. Proč: text z ukázky se stane výchozím textem, který tým kopíruje. Slogan nic nového neřekne, otázka pojmenuje problém majitele (zkušenost).

**P1-05 Carousel `car-1` až `car-5`: příběh bez výplaty.** Obálka slibuje „Jak poznat rozdíl", jenže skutečná hodnota (kontrolní seznam 7 otázek z článku) zůstává za `brightbox.cz/blog` v 92 px. Na tuto adresu se nedá kliknout ani na Instagramu, ani v PDF dokumentu na LinkedInu. Změny: v `car-1` podtitulek „Sedm otázek, podle kterých to poznáte." místo „Ve čtyřech slidech"; v `car-3` pod každou z 5 součástí jeden řádek vysvětlení z článku, Geist 34 px; přidat 2 slidy se 7 otázkami, doslova z kapitoly „Kontrolní seznam"; v `car-5` místo URL text „Uložte si to k příštímu plánu rozpočtu." a pod ním „Celý článek: odkaz v komentáři". `car-2` a `car-3` mají dolních 45 % prázdných (obsah končí na y 735 a 905). Zvětšit `--s` z 84 na 96 px a seznam z 54 na 60 px. Proč: carousel žije z uložení a sdílení. Instagram ho podle Mosseriho znovu ukazuje lidem, kteří ho přeskočili (Storyboard18, 7/2025), takže i `car-2` musí obstát sám.

**P1-06 LinkedIn: vrstva pro profily vedení.** Stránka slibuje, že „Jakub Stehno a šéfové agentur píšou vlastním hlasem", ale pro ně existuje jen `li-osobni`, kde má obecný claim skupiny na mobilu 13,3 px. Přidat variantu `feed-citat` s fotkou přes 60 % výšky (dnešní avatar 132 px má na telefonu 46 px) a jménem v 44 px, obálku dokumentu s tváří a jménem autora a v `li-osobni` zvětšit claim z 56 na 72 px. Proč: Edelman a LinkedIn (2025) ukazují, že o dodavateli spolurozhodují i „skrytí rozhodovatelé" mimo nákupní tým. Že se k nim obsah dostane spíš přes osobní profily vedení než přes firemní stránku, je zkušenost.

**P1-07 Mřížka a ukázkový telefon na stránce.** Ukázka v úvodu má 8 grafik z 9 a jedinou fotku. Řady 2 a 3 nemají fotku, což porušuje vlastní pravidlo „fotka, typografie, přechod" i větu „Méně grafiky, víc skutečných záběrů". Nové pořadí: řada 1 Lidé (Stehno), Myšlenka, Číslo; řada 2 `akce-konference` v lehkém rámu, `car-1`, reel; řada 3 kreativa klienta z `img/work`, Citát, Nábor. `reel-obalka` postavit na snímku z videa (např. `reel6` Pinoys) místo tmavého typografického pozadí a smazat štítek „Video", ikonu ukáže Instagram. Z feedových exportů pro Instagram vypustit `.tp__url`: účet se jmenuje brightbox.cz a jméno stojí 1 cm nad obrázkem. `.tp__mark` nechat jen na postech, které se sdílí mimo profil (Číslo, carousel). Proč: o sledování rozhoduje návštěva profilu a ta dnes působí jako katalog šablon.

**P1-08 Stránka, sekce „Kolik značky": rozbitá ukázka.** Pravidlo `.amount__list p{font-size:16.5px;color:var(--ink70)}` v `assets/css/social.css` (ř. 43) přebíjí odstavce vložené šablony. V kartě „Plný rám" je proto „+118 %" drobné a popisek šedý na tmavém pozadí, na desktopu i na mobilu. Oprava: selektor `.amount__list > li > p`. Proč: první ukázka celého systému rámů vypadá jako chyba.

**P2-09 `story-nabor`, `feed-nabor`.** Tmavá pilulka „brightbox.cz/kariera →" vypadá jako tlačítko, ale text ve story kliknout nejde. Nahradit ji zónou pro nálepku s odkazem jako u `story-clanek`. Čip „Výkonnostní grafika" opakuje podtitulek, nahradit ho čipem „Zkušební zadání placené" (CONTENT.md, kariéra) a čipy zvětšit z 28 na 34 px. Proč: placené zadání nejvíc odlišuje inzerát a falešné tlačítko frustruje.

**P2-10 `feed-skupina`.** „Part of Brightbox Group" je anglicky a na telefonu má 7,6 px: nahradit „Součást Brightbox Group" v 30 px. Bílá karta s logem (330 px výšky) a titulek tvoří dvě ohniska: kartu zmenšit na 220 px, nebo logo v 360 px položit rovnou na Mlhu. Třířádkový výčet partnerství zkrátit a dát dopředu fakt „Na každou poptávku odpoví do 24 hodin.". Doplnit variantu skupiny se 4 logy 2×2 a titulkem „Jedna skupina. Čtyři specialisté.". Proč: jeden post má nést jednu myšlenku.

**P2-11 Facebook a drobné texty na coverech.** Podle CONTENT.md není Facebook na webu ani v `sameAs`. Kapitolu zúžit na „Facebook zrcadlí Instagram a slouží náboru" a `fb-cover` dělat až po potvrzení, že stránka existuje. Na coverech zrušit drobné štítky (`li-firma` 18 px = 4,5 px na mobilu, `fb-cover` 26 px = 5,1 px) a claim v `li-firma` zvětšit z 64 na 80 px. Proč: kapacita týmu patří LinkedInu a text pod 6 px je jen šum.

**P2-12 Stránka, „Psaní příspěvků".** U háčku doplnit „na LinkedInu na mobilu asi 140 znaků, na počítači asi 210". Jde o pozorované hodnoty, LinkedIn je oficiálně neuvádí. Vzor výzvy „v článku na brightbox.cz/blog" změnit na konkrétní článek, pro Instagram „odkaz v profilu". K typům výzev přidat „uložte si" a „pošlete kolegovi". U ukázkového LinkedIn postu s náhledem odkazu zvážit odkaz v prvním komentáři nebo dokument. Externí odkaz podle van der Bloma snižuje dosah, sekundární zdroje uvádějí 19 až 60 %. Doplnit obsahový mix (názory vedení a články, výsledky a práce, lidé a zákulisí, nábor a skupina) a co měřit: uložení, komentáře rozhodovatelů, návštěvy profilu, poptávky. Proč: stránka dnes popisuje, jak příspěvky vypadají, ale ne co publikovat a proč.

## 5 chybějících typů příspěvků
1. **Případová studie jako dokument (LinkedIn PDF, IG carousel, 7 slidů).** Jediný důkaz potvrzený třetí stranou (Seznam) je dnes rozsekaný do samostatných čísel bez metody. Slidy: obálka „Seznam zveřejnil náš test. Noví uživatelé +51 až +118 %."; metoda (14 dní před a po, GA4, mobil, 4 klienti, 3 kampaně, 2 varianty); 4 klienti s čísly; CTR podle fáze, nejvyšší v CARE; „Na co myslet: proklik až 3× dráž, jen mobil"; citát Sýkory; výzva. Magic Planet (hazard, 18+) vynechat, nebo ho uvést jen v tabulce.
2. **Nabídka s jedním krokem.** Žádná z 26 šablon nenese obchodní výzvu. Podle pravidla 95:5 (Dawes, LinkedIn B2B Institute) hledá dodavatele v danou chvíli jen malá část firem a ta potřebuje jasný další krok. Obsah: „Návrh strategie zdarma. E-mailem, bez schůzky, tři otázky." a „Za 90 dní: audit, strategie, tým a první report.". Formát: feed 4:5 a story s nálepkou odkazu, jednou za 4 až 6 týdnů.
3. **Práce klienta: kreativa nebo reel s výchozím stavem.** Výběr „Práce" ani princip „Lidé a práce" nemají šablonu, přitom kreativy jsou nejsilnější vizuál skupiny. Háčky z reelů: `reel6` Pinoys „V roce 2021 v Česku nikdo nehledal tteokbokki.", `reel4` BetterBarber „Začínali jsme bez webu, bez měření a s prázdným kalendářem.", `reel5` DigiLive „Nový účet, žádná historie. Cíl: levné B2B poptávky.". K tomu `jk-sperky`, `pinoys` a render stánku ASPENA. Lehký rám, titulky ve videu, číslo jen tam, kde ho zdroj má.
4. **Osobní post vedení (text a skutečná fotka, bez šablony).** LinkedIn čtou majitelé a jednatelé a ti reagují na lidi. Obsah: Jakub Stehno sdílí článek „Externí marketingové oddělení, nebo vlastní tým?" vlastními slovy (text napíše on, žádné citáty mu nepřisuzovat). Fotka `jakub-stehno` 1000×1250 bez rámu a k ní 6 kritérií z článku jako dokument.
5. **Otázka pro vedení (anketa na LinkedInu, nálepka ve story).** Komentáře rozhodovatelů mají větší cenu než lajky a dávají témata dalších postů (zkušenost). Story šablony dnes nemají místo pro anketu ani otázku. Obsah: „Máte marketingovou strategii, nebo kalendář kampaní?" (článek 2) a „Kdo u vás odpovídá za výsledek marketingu?" (H2 webu). Story šablona se zónou 520×300 px pro nálepku, výsledky zveřejňovat jen skutečné.

## Zdroje
- Apple HIG, Typography (nejmenší výchozí styl Caption 2 = 11 pt): https://developer.apple.com/design/human-interface-guidelines/typography
- Mřížka Instagramu 3:4 od ledna 2025: https://technology.inquirer.net/140070/instagram-grid-swaps-squares-for-rectangles-disrupting-layouts
- Opakované zobrazení carouselu (Mosseri podle Storyboard18, 7/2025, primární zdroj nedohledán): https://storyboard18.com/brand-marketing/beyond-total-likes-instagram-tests-per-frame-engagement-for-carousels-75876.htm
- Zkrácení textu na LinkedInu 140/210 znaků (pozorované, neoficiální): https://eden.so/blog/linkedin-character-limits/
- Pravidlo 95:5 (Dawes, Ehrenberg-Bass, LinkedIn B2B Institute): https://www.marketingweek.com/peter-weinberg-jon-lombardo-95-5-rule/
- Edelman a LinkedIn, 2025 B2B Thought Leadership Impact Report (skrytí rozhodovatelé): https://www.edelman.com/expertise/business-marketing/2025-b2b-thought-leadership-report
- Externí odkaz a dosah na LinkedInu (van der Blom, sekundárně, čísla se liší): https://www.agilitypr.com/pr-news/social-media-influencer-marketing/the-linkedin-link-tax-why-sharing-your-blog-is-costing-you-60-percent-of-your-audience/
- Ostatní tvrzení: zkušenost a měření v Playwrightu (render 11. 10. 2026).
