// Směr C - render. Spuštění (statický server brand/ na :4373):
//   node render.mjs            -> sheet.png (kontaktní arch 7 šablon + mřížka Instagramu 3×3)
//   node render.mjs --bake     -> nejdřív přepočítá polohu světla (.tp__bg i) podle klíčového prvku (.key) a zapíše ji do index.html
//   node render.mjs --png DIR  -> navíc PNG každé šablony v nativní velikosti
// Pravidlo světla: elipsa se středem v optickém středu klíčového prvku, šířka = prvek + 2 × 240 px, výška = verzálka + 2 × 220 px.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire('/Users/martindragusinec/projekty/audiora-web/package.json');
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'http://localhost:4373/explore/c-cisla/index.html';
const args = process.argv.slice(2);
const bake = args.includes('--bake');
const pngDir = args.includes('--png') ? args[args.indexOf('--png') + 1] : null;

const SPOT = `window.__spot = (tp) => {
  const i = tp.querySelector('.tp__bg i'), k = tp.querySelector('.key'); if (!i || !k) return null;
  const R = tp.getBoundingClientRect(), r = k.getBoundingClientRect(), cap = parseFloat(getComputedStyle(k).fontSize) * .73;
  const cx = r.left - R.left + r.width / 2, cy = r.top - R.top + r.height * .52, w = Math.round(r.width + 480), h = Math.round(cap + 440);
  const css = 'left:' + Math.round(cx - w / 2) + 'px;top:' + Math.round(cy - h / 2) + 'px;width:' + w + 'px;height:' + h + 'px';
  i.setAttribute('style', css); return css; };`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2600, height: 1600 } });
const open = async () => { await p.goto(URL, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.addScriptTag({ content: SPOT }); await p.waitForTimeout(300); };
await open();

if (bake) {
  const spots = await p.evaluate(() => [...document.querySelectorAll('[data-spot]')].map(i => ({ id: i.dataset.spot, css: window.__spot(i.closest('[data-tpl]')) })));
  const F = path.join(HERE, 'index.html'); let s = fs.readFileSync(F, 'utf8');
  for (const sp of spots) s = s.replace(new RegExp(`<i data-spot="${sp.id}"[^>]*></i>`), `<i data-spot="${sp.id}" style="${sp.css}"></i>`);
  fs.writeFileSync(F, s); console.log('světlo zapsáno:', spots.map(x => x.id).join(', '));
  await open();
}

if (pngDir) {
  fs.mkdirSync(pngDir, { recursive: true });
  const ids = await p.$$eval('[data-tpl]', els => els.map(e => e.dataset.tpl));
  for (const id of ids) await (await p.$(`[data-tpl="${id}"]`)).screenshot({ path: path.join(pngDir, `${id}.png`) });
  console.log('PNG:', ids.length);
}

// --- kontaktní arch + mřížka Instagramu ---------------------------------------------------------
await p.evaluate(async () => {
  const lib = document.querySelector('.lib');
  const tpl = id => document.querySelector(`.lib > [data-tpl="${id}"]`);
  // stejná šablona, jiný obsah (jen pro ukázku mřížky, fakta z CONTENT.md)
  const variant = async (id, fn) => { const c = tpl(id).cloneNode(true); c.removeAttribute('data-tpl'); lib.appendChild(c); await fn(c); await Promise.all([...c.querySelectorAll('img')].map(i => i.decode().catch(() => {}))); window.__spot(c); return c; };
  const q = (c, s) => c.querySelector(s);
  const data = (c, rows) => c.querySelectorAll('.tp__data > div').forEach((d, n) => { d.children[0].innerHTML = rows[n][0]; d.children[1].innerHTML = rows[n][1]; });

  const pinoys = await variant('feed-cislo', c => {
    q(c, '.t-400').innerHTML = '<span class="key">+81</span><span class="u">%</span>';
    q(c, '.t-44').innerHTML = 'nových uživatelů u&nbsp;značky Pinoys<br>po&nbsp;nasazení formátu Interscroller.';
    data(c, [['+13&nbsp;%', 'čas na stránce'], ['+0,8&nbsp;%', 'konverze'], ['+0,38&nbsp;%', 'hodnota konverze']]);
  });
  const jk = await variant('feed-cislo', c => {
    q(c, '.t-400').innerHTML = '<span class="key">+50</span><span class="u">%</span>';
    q(c, '.t-44').innerHTML = 'konverzí u&nbsp;značky JK šperky<br>po&nbsp;nasazení formátu Interscroller.';
    data(c, [['+75&nbsp;%', 'noví uživatelé'], ['+3,13&nbsp;%', 'čas na stránce'], ['+40,27&nbsp;%', 'hodnota konverze']]);
  });
  const mene = await variant('feed-myslenka', c => {
    q(c, '.t-128').innerHTML = '<span class="key">Méně</span> aktivit,<br>víc výsledku.';
    q(c, '.t-44').innerHTML = 'Strategie rozhoduje o&nbsp;tom, co nebudete dělat.';
    q(c, '.tp__foot p').textContent = 'brightbox.cz/blog';
  });
  const sykora = await variant('feed-lide', c => {
    q(c, '.tp__photo').src = '../../assets/img/people/tomas-sykora.webp';
    q(c, '.t-128').textContent = 'Tomáš Sýkora';
    q(c, '.t-128 + .t-44').textContent = 'CEO Growtix';
  });
  const externi = await variant('car-1', c => {
    c.querySelectorAll('.tp__meta p')[1].textContent = 'Organizace marketingu';
    q(c, '.t-128').innerHTML = 'Externí<br>marketingové<br>oddělení, <span class="key">nebo</span><br>vlastní tým?';
    q(c, '.t-44').remove();
    data(c, [['6', 'kritérií<br>pro rozhodnutí'], ['4', 'věci, které musí<br>být dohodnuty'], ['7', 'otázek pro partnera<br>před podpisem']]);
  });

  const box = (tp, s, crop) => {
    const W = +tp.dataset.w || +tp.style.width.replace('px', ''), H = +tp.style.height.replace('px', ''), cw = crop ? W - 68 : W;
    const d = document.createElement('div'); d.style.cssText = `position:relative;flex:none;overflow:hidden;width:${cw * s}px;height:${H * s}px`;
    tp.style.position = 'absolute'; tp.style.left = '0'; tp.style.top = '0'; tp.style.transformOrigin = '0 0';
    tp.style.transform = `translateX(${crop ? -34 * s : 0}px) scale(${s})`; d.appendChild(tp); return d;
  };
  const card = (tp, s, label) => { const f = document.createElement('figure'); f.appendChild(box(tp, s)); const c = document.createElement('figcaption'); c.textContent = label; f.appendChild(c); return f; };

  const st = document.createElement('style');
  st.textContent = `body{background:#D9D4E2}.lib{display:none}
  .sheet{width:2288px;padding:80px;background:#D9D4E2;font-family:Geist,sans-serif;color:#1B1432}
  .sheet h1{font:600 56px/1 Sora,sans-serif;letter-spacing:-.04em;margin:0}
  .sheet .lead{font:400 26px/1.4 Geist,sans-serif;color:#5A5370;margin:20px 0 0}
  .sheet h2{font:600 32px/1 Sora,sans-serif;letter-spacing:-.03em;margin:96px 0 32px}
  .sheet .row{display:flex;gap:32px;align-items:flex-start}
  .sheet figure{margin:0;display:flex;flex-direction:column;gap:16px}
  .sheet figcaption{font:500 22px/1.3 Geist,sans-serif;color:#5A5370}
  .sheet .ig{display:grid;grid-template-columns:repeat(3,auto);gap:4px;background:#fff;padding:4px;width:max-content}
  .sheet .note{font:400 24px/1.5 Geist,sans-serif;color:#5A5370;max-width:440px;margin:0}`;
  document.head.appendChild(st);

  const S = document.createElement('div'); S.className = 'sheet'; document.body.appendChild(S);
  S.innerHTML = '<h1>Směr C - Jasno v&nbsp;číslech</h1><p class="lead">Sedm šablon ve&nbsp;40&nbsp;% nativní velikosti a&nbsp;mřížka profilu Instagramu ve&nbsp;výřezu 3:4.</p><h2>Šablony</h2>';
  const name = id => tpl(id).dataset.name.replace(/^C /, '') + ', ' + tpl(id).dataset.w + ' × ' + tpl(id).dataset.h;
  const r1 = document.createElement('div'); r1.className = 'row'; S.appendChild(r1);
  for (const id of ['feed-myslenka', 'feed-cislo', 'feed-lide', 'car-1', 'car-3']) r1.appendChild(card(tpl(id).cloneNode(true), .4, name(id)));
  // řada 2: vlevo story, vpravo cover a pod ním mřížka Instagramu
  const r2 = document.createElement('div'); r2.className = 'row'; r2.style.marginTop = '56px'; r2.style.gap = '64px'; S.appendChild(r2);
  r2.appendChild(card(tpl('story-cisla').cloneNode(true), .4, name('story-cisla')));
  const col = document.createElement('div'); r2.appendChild(col);
  col.appendChild(card(tpl('li-osobni').cloneNode(true), 1, name('li-osobni') + ' (100 %)'));
  const h = document.createElement('h2'); h.textContent = 'Mřížka profilu Instagramu 3 × 3'; h.style.marginTop = '88px'; col.appendChild(h);
  const r3 = document.createElement('div'); r3.className = 'row'; r3.style.gap = '56px'; col.appendChild(r3);
  const ig = document.createElement('div'); ig.className = 'ig'; r3.appendChild(ig);
  const order = [tpl('feed-cislo').cloneNode(true), tpl('feed-lide').cloneNode(true), tpl('feed-myslenka').cloneNode(true),
                 tpl('car-1').cloneNode(true), pinoys, sykora, mene, externi, jk];
  for (const t of order) ig.appendChild(box(t, .34, true));
  const n = document.createElement('p'); n.className = 'note';
  n.innerHTML = 'Stejné šablony, jiný obsah: Číslo (Anjolie, Pinoys, JK&nbsp;šperky), Lidé (Jakub Stehno, Tomáš Sýkora), Myšlenka a&nbsp;obálka carouselu. Hrdina vždy visí ze stejné linky, takže mřížka drží řád i&nbsp;při&nbsp;střídání typů. Čísla z&nbsp;případové studie Interscroller, zdroj blog Seznamu 6.&nbsp;10.&nbsp;2025.';
  r3.appendChild(n);
  await Promise.all([...S.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
});
await p.waitForTimeout(400);
await (await p.$('.sheet')).screenshot({ path: path.join(HERE, 'sheet.png') });
console.log('sheet.png hotovo');
await b.close();
