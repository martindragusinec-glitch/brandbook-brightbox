// node tplshot.mjs <outdir> [safe] -> PNG každé šablony v nativní velikosti
import { createRequire } from 'module';
const require = createRequire('/Users/martindragusinec/projekty/audiora-web/package.json');
const { chromium } = require('playwright');
const [out, safe] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2200, height: 1400 } });
await p.goto('http://localhost:4373/sablony.html?native' + (safe ? '&safe' : ''), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
const ids = await p.$$eval('[data-tpl]', els => els.map(e => e.dataset.tpl));
for (const id of ids) await (await p.$(`[data-tpl="${id}"]`)).screenshot({ path: `${out}/${id}.png` });
console.log(ids.length);
await b.close();
