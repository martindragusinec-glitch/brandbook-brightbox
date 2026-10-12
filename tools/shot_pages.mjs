// node pages.mjs <url> <prefix> [w] [h]  -> nafotí stránku po obrazovkách (?static) a složí arch
import { createRequire } from 'module';
const require = createRequire('/Users/martindragusinec/projekty/audiora-web/package.json');
const { chromium } = require('playwright');
const [url, prefix, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, ...( +w < 600 ? { isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : {}) });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += +h) {
  await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(350);
  await p.screenshot({ path: `${prefix}-${String(i++).padStart(2, '0')}.png` });
}
console.log('height', H, 'shots', i, 'errors', JSON.stringify(errs));
await b.close();
