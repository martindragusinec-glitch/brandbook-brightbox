// HTML → popis pro Figmu. node tools/fig_extract.mjs <url> <selector> <outDir>
// Pro každý kořen (např. [data-tpl] nebo [data-slide]) uloží:
//   plate-<id>.png  = pozadí (barva/přechod kořene + .tp__bg / [data-fig=raster]) bez obsahu
//   img-<id>-<n>.png = výřez fotky přesně tak, jak je vidět (object-fit/position, bez zaoblení)
//   spec.json        = rámy, obdélníky, texty (s řádky a běhy stylů), SVG (cesta k souboru), obrázky
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire('/Users/martindragusinec/projekty/audiora-web/package.json');
const { chromium } = require('playwright');

const [url, selector, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);

const roots = await p.$$eval(selector, els => els.map(e => e.dataset.tpl || e.dataset.slide));
const spec = [];
for (const id of roots) {
  const sel = `[data-tpl="${id}"],[data-slide="${id}"]`;
  const data = await p.evaluate(sel => {
    const root = document.querySelector(sel);
    const R = root.getBoundingClientRect();
    const rel = r => ({ x: +(r.left - R.left).toFixed(2), y: +(r.top - R.top).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) });
    const out = { id: root.dataset.tpl || root.dataset.slide, name: root.dataset.name || root.dataset.tpl, w: R.width, h: R.height, bg: getComputedStyle(root).backgroundColor, bgImage: getComputedStyle(root).backgroundImage, nodes: [] };
    const isRaster = el => el.classList.contains('tp__bg') || el.dataset.fig === 'raster';
    const INLINE = new Set(['inline', 'inline-block']);
    const visible = (cs) => cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.01;
    const hasBox = cs => {
      const bgc = cs.backgroundColor; const bgi = cs.backgroundImage;
      const hasBg = (bgc && bgc !== 'rgba(0, 0, 0, 0)' && bgc !== 'transparent') || (bgi && bgi !== 'none');
      const hasBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
      return hasBg || hasBorder;
    };
    const opacityChain = el => { let o = 1; for (let e = el; e && e !== root.parentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
    // řádky textu: pro každý textový uzel rozsekat znaky podle top
    const lineSplit = (nodes) => {
      const lines = []; let cur = '', top = null;
      for (const n of nodes) {
        if (n.br) { lines.push(cur); cur = ''; top = null; continue; }
        const t = n.node.textContent;
        for (let i = 0; i < t.length; i++) {
          const rg = document.createRange(); rg.setStart(n.node, i); rg.setEnd(n.node, i + 1);
          const rs = rg.getClientRects(); if (!rs.length) { cur += t[i]; continue; }
          const tt = Math.round(rs[0].top);
          if (top !== null && tt > top + 4) { lines.push(cur.replace(/\s+$/, '')); cur = ''; top = tt; if (/\s/.test(t[i])) continue; }
          if (top === null) top = tt;
          cur += t[i];
        }
      }
      lines.push(cur.replace(/\s+$/, ''));
      return lines.map(l => l.replace(/^\s+/, ''));
    };
    const styleOf = cs => ({ family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: +cs.fontWeight, size: parseFloat(cs.fontSize),
      lh: cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight), ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
      color: cs.color, upper: cs.textTransform === 'uppercase', align: cs.textAlign, italic: cs.fontStyle === 'italic' });
    // inline obsah elementu → text + běhy stylů
    const collect = (el, acc) => {
      for (const c of el.childNodes) {
        if (c.nodeType === 3) { if (c.textContent.length) { acc.parts.push({ node: c }); const st = styleOf(getComputedStyle(c.parentElement)); acc.runs.push({ start: acc.text.length, end: acc.text.length + c.textContent.length, ...st }); acc.text += c.textContent; } }
        else if (c.nodeType === 1) {
          if (c.tagName === 'BR') { acc.parts.push({ br: true }); acc.text += '\n'; continue; }
          const cs = getComputedStyle(c);
          if (!visible(cs)) continue;
          if (INLINE.has(cs.display) && c.tagName !== 'IMG' && !hasBox(cs)) collect(c, acc);
        }
      }
      return acc;
    };
    const walk = (el, depth) => {
      for (const c of el.children) {
        const cs = getComputedStyle(c);
        if (!visible(cs) && !c.classList.contains('tp__safe')) continue;
        if (isRaster(c)) {
          for (const g of c.children) { const gr = rel(g.getBoundingClientRect()); out.nodes.push({ t: 'glow', ...gr, grad: getComputedStyle(g).backgroundImage, op: +opacityChain(g).toFixed(3) }); }
          continue;
        }
        const r = rel(c.getBoundingClientRect());
        if (r.w < 0.5 || r.h < 0.5) { if (c.children.length) walk(c, depth + 1); continue; }
        const op = +opacityChain(c).toFixed(3);
        const radius = parseFloat(cs.borderTopLeftRadius) || 0;
        if (c.classList.contains('tp__safe')) { out.nodes.push({ t: 'safe', ...r, label: c.textContent.trim() }); continue; }
        if (c.dataset.fig === 'guide') { out.nodes.push({ t: 'guide', ...r, radius, label: c.textContent.trim(), stroke: cs.borderTopColor, sw: parseFloat(cs.borderTopWidth) }); }
        if (c.tagName === 'IMG' && (cs.transform !== 'none' || cs.filter !== 'none')) {
          const k = 'r' + (window.__rk = (window.__rk || 0) + 1); c.dataset.figraster = k;
          out.nodes.push({ t: 'img', raster: k, ...r, op, radius: 0, fit: 'fill', pos: '50% 50%' });
          continue;
        }
        if (c.tagName === 'IMG') {
          const src = new URL(c.getAttribute('src'), location.href).pathname.replace(/^\//, '');
          if (/\.svg$/.test(src)) out.nodes.push({ t: 'svg', src, ...r, op });
          else out.nodes.push({ t: 'img', src, ...r, op, radius: radius >= Math.min(r.w, r.h) / 2 - 0.5 ? 'circle' : radius, fit: cs.objectFit, pos: cs.objectPosition, nw: c.naturalWidth, nh: c.naturalHeight });
          continue;
        }
        if (hasBox(cs) && c.dataset.fig !== 'guide') {
          out.nodes.push({ t: 'rect', ...r, op, radius: Math.min(radius, r.h / 2, r.w / 2), fill: cs.backgroundColor, grad: cs.backgroundImage !== 'none' ? cs.backgroundImage : null,
            stroke: parseFloat(cs.borderTopWidth) > 0 ? cs.borderTopColor : null, sw: parseFloat(cs.borderTopWidth) || 0, dashed: cs.borderTopStyle === 'dashed', name: (c.className || c.tagName).toString().split(' ')[0] });
        }
        const flexy = /flex|grid/.test(cs.display);
        const directText = [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (directText && !flexy) {
          const acc = collect(c, { text: '', runs: [], parts: [] });
          const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
          const cr = { x: r.x + pl, y: r.y + pt, w: r.w - pl - pr, h: r.h - pt - pb };
          // skutečná šířka textu (inline obsah), kvůli zarovnání a auto šířce
          const rg = document.createRange(); rg.selectNodeContents(c); const tr = rel(rg.getBoundingClientRect());
          out.nodes.push({ t: 'text', ...cr, tx: tr.x, tw: tr.w, ty: tr.y, th: tr.h, op, text: acc.text.replace(/\s+$/, ''), runs: acc.runs, lines: lineSplit(acc.parts), st: styleOf(cs), nowrap: cs.whiteSpace === 'nowrap', name: (c.className || c.tagName).toString().split(' ')[0] });
          // blokoví potomci uvnitř (vzácné) projít dál
          for (const k of c.children) { const kcs = getComputedStyle(k); if (!INLINE.has(kcs.display) || k.tagName === 'IMG' || hasBox(kcs)) walk({ children: [k] }, depth + 1); }
          continue;
        }
        if (directText && flexy) {
          for (const n of c.childNodes) {
            if (n.nodeType !== 3 || !n.textContent.trim()) continue;
            const rg = document.createRange(); rg.selectNodeContents(n); const tr = rel(rg.getBoundingClientRect());
            const st = styleOf(cs);
            out.nodes.push({ t: 'text', x: tr.x, y: tr.y, w: tr.w, h: tr.h, tx: tr.x, tw: tr.w, ty: tr.y, th: tr.h, op, text: n.textContent.trim(), runs: [], lines: [n.textContent.trim()], st, nowrap: true, name: 'text' });
          }
        }
        if (c.children.length) walk(c, depth + 1);
      }
    };
    walk(root, 0);
    return out;
  }, sel);

  // rastry otočených / deformovaných obrázků (ukázky zákazů)
  for (const n of data.nodes.filter(n => n.raster)) {
    const h = await p.$(`[data-figraster="${n.raster}"]`);
    const file = path.join(outDir, `raster-${data.id}-${n.raster}.png`);
    await h.screenshot({ path: file, omitBackground: true });
    n.src = file;
  }
  spec.push(data);
}
fs.writeFileSync(path.join(outDir, 'spec.json'), JSON.stringify(spec, null, 1));
console.log('roots', spec.length, 'nodes', spec.reduce((a, s) => a + s.nodes.length, 0));
await b.close();
