# Brief: sociální sítě Brightbox (průzkum směrů a kritika), 11. 10. 2026

Píšeš česky. Pracuješ pro Martina Dragušince (designer). Jde o šablony sociálních sítí (LinkedIn, Instagram, Facebook) pro **Brightbox Group**, strategickou marketingovou agenturu v čele skupiny 4 agentur (Growtix, Sparkee, Weblantis, Print4You). Laťka: Awwwards / top světové agentury. Martin odmítá cokoli, co vypadá jako AI šablona.

## Co existuje (prohlédni si jako první)
- Brandbook web: http://localhost:4373/index.html (manuál značky) a http://localhost:4373/socialni-site.html (sociální sítě). Statický server běží, složka `/Users/martindragusinec/projekty/brightbox-web-2026/brand/`.
- Současné šablony v nativní velikosti: http://localhost:4373/sablony.html (zdroj `brand/src/partials/templates.html`, styly `brand/assets/css/tpl.css`). 26 formátů: feed 4:5, carousel 5 slidů, stories/reel 9:16, profilovka, highlighty, LinkedIn covery, odkaz 1,91:1, Facebook cover.
- Web značky v5 (vzor vizuálního jazyka): http://localhost:4372/v5/index.html
- Ověřená fakta a texty: `brand/CONTENT.md` (POUZE odtud: čísla, jména, role, citace, články). Nic nevymýšlej.
- Render šablon do PNG: Playwright je v `/Users/martindragusinec/projekty/audiora-web/node_modules` (import přes `createRequire('/Users/martindragusinec/projekty/audiora-web/package.json')`). Vzor skriptu: `/private/tmp/claude-501/-Users-martindragusinec-projekty/facc75f6-30d9-4afa-836c-24348c8f9bc3/scratchpad/tplshot.mjs`.

## Značka (pevné, neměnit)
- Logo: krychle se světelnou koulí uvnitř („světlo uvnitř krabice", odtud jméno Brightbox). Soubory `brand/assets/logos/kit/*.svg` (bb-logo-color, bb-logo-white, bb-mark-color, bb-mark-white, bb-group-*). Barvy dílů loga se NIKDY nemění. Logo se nedeformuje, neotáčí, nedává se na něj stín ani záře.
- Barvy: Mlha #F4F1FA (hlavní pozadí), Inkoust #1B1432 (text), Záře #E50E81 (akcent, čísla), Soumrak #362770, Noc #0F0B1E, bílá. Světla kapitol: Šeřík #ECE6FA, Červánky #FCEAF3, Úsvit #F7EEFB, Svit #FFF3F9. Hluboký přechod 118° #140E33, #2A1F5C, #5B1F7A, #B3127F, #E50E81. Záře = měkké pastelové světlo #FF5FB2 / #C84BD8 / #8E7BF0 na Mlze. Značka je SVĚTLÁ („jsme BRIGHT box"), tmavé plochy jen jako akcent.
- Písma: Sora SemiBold (titulky, čísla, prostrkání -4 až -5 %), Geist (text). Fonty: `brand/assets/css/fonts.css` (lokální woff2). Ikony Phosphor Regular (SVG v `brand/assets/icons/`).
- Tón: institucionální, klidný, sebevědomý hlas etablované skupiny. Vykání (nábor tyká). Krátké věty, čísla místo přívlastků, vždy se zdrojem.
- Fotky (jen skutečné): `brand/assets/img/people/` (jakub-stehno 1000×1250 = CEO a zakladatel Brightbox Group; tomas-sykora = CEO Growtix; akce-konference; tomas-baku a michal-vavra bez potvrzené role, nepodepisovat jménem), `brand/assets/img/place/` (praha, brno kanceláře), `brand/assets/img/work/` (kreativy klientů). AI portréty v `v5/img/team/` jsou ZAKÁZANÉ.

## Formáty sítí (ověřeno)
Feed a carousel 1080×1350 (IG mřížka ořízne na 3:4, asi 34 px z každé strany). Story 1080×1920, nahoře 250 a dole 340 px bez textu; reel dole 440, vpravo 140; obálka reelu v mřížce jen pás y 240-1680. LinkedIn cover firmy 1512×256 (logo stránky vlevo dole), osobní 1584×396 (vlevo dole 570×265 profilovka), odkaz 1200×627. Facebook cover 1920×1080, na mobilu jen pás 2,4:1 uprostřed.

## Martinova TVRDÁ pravidla (porušení = zamítnutí)
- Pomlčky jen krátké „-", nikdy „—" ani „–". Žádné „·" (middle dot) v textu.
- Jednopísmenné předložky a spojky (v, s, k, z, o, u, a, i) nesmí viset na konci řádku (použij &nbsp;).
- Žádné dekorativní čáry (hairliny, linky u čísel kapitol, oddělovače). Hierarchie velikostí, řezem a mezerou.
- Žádné plovoucí tečky/bullety vedle víceřádkového textu. Žádný obrysový (outline) text. Žádné „obarvené poslední slovo" v titulku.
- Vodoznak loga (ghost) střídmě. Tlačítka bez lesku a vnitřních stínů.
- Spacing ze systému (okraj 72 px na 1080), nic od oka. Stejné kotvy napříč sadou. Žádné osiřelé slovo na řádku titulku.
- Žádné fotobanky, žádní AI lidé, výřez nesmí useknout hlavu ani text.
- Fakta, čísla, jména a role přesně z CONTENT.md. Žádné vymyšlené citace, počty followerů, data akcí.
- Anti-AI-slop: žádné fialové „aurora orby" bez důvodu, žádné uniformní karty se stejným radiusem, žádný emoji, žádné benefit-speak fráze (komplexní řešení, posuneme vás, na míru...).
