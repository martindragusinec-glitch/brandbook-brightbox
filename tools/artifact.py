#!/usr/bin/env python3
"""Připraví složku _artifact/ pro zveřejnění manuálu jako Artifact (soukromý odkaz na claude.ai).

- hlavní stránka index.html bez <!doctype>/<html>/<head>/<body> (obal doplní publikace), <title> a styly nahoře,
- ostatní stránky jako plné dokumenty,
- assety, stažení a průzkum směrů zkopírované vedle.
python3 tools/artifact.py → vypíše seznam souborů a velikost
"""
import re, shutil, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_artifact"
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

PAGES = ["socialni-site.html", "smery.html", "sablony.html"]
DIRS = ["assets", "downloads"]
EXPLORE = ["explore/a-evoluce", "explore/b-foto", "explore/c-cisla"]
SKIP = {".DS_Store"}

for d in DIRS:
    shutil.copytree(ROOT / d, OUT / d, ignore=shutil.ignore_patterns("*.DS_Store", "smer-*.png", "vizitky-nahled.png", "michal-vavra.webp", "tomas-baku.webp", "akce-konference.webp", "aspena-stanek.webp", "betterbarber-salon.webp", "digilive-tym.webp", "jk-sperky-prsten.webp", "korejska-kosmetika.webp", "magicplanet.webp", "nase-cesko-tisk.webp", "ona-dnes.webp", "pinoys-*.webp", "og-blog-*.jpg"))
for d in EXPLORE:
    src = ROOT / d
    if not src.exists():
        continue
    (OUT / d).mkdir(parents=True, exist_ok=True)
    for f in src.iterdir():
        if f.suffix in (".html", ".css"):
            shutil.copy(f, OUT / d / f.name)
for p in PAGES:
    shutil.copy(ROOT / p, OUT / p)

# hlavní stránka bez kostry dokumentu
html = (ROOT / "index.html").read_text()
head = re.search(r"<head>([\s\S]*?)</head>", html).group(1)
body_tag = re.search(r"<body([^>]*)>", html)
body = html[body_tag.end():html.rindex("</body>")]
page = re.search(r'data-page="([^"]+)"', body_tag.group(1))
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', "", head)
title = re.search(r"<title>[\s\S]*?</title>", head).group(0)
head = head.replace(title, "")
meta = f'<meta name="bb-page" content="{page.group(1) if page else ""}">\n'
(OUT / "index.html").write_text(title + "\n" + meta + head.strip() + "\n" + body.strip() + "\n")

# zip archivy publikace neobslouží: logo vede na složku souborů, náhledy šablon na arch v plné velikosti
for z in (OUT / "downloads").glob("*.zip"):
    z.unlink()
for name, a, b in [("index.html", 'href="downloads/brightbox-logo.zip" download', 'href="downloads/logo/bb-logo-color.svg"'),
                   ("index.html", 'v&nbsp;SVG a&nbsp;PNG.</span><em>ZIP</em>', 'v&nbsp;SVG a&nbsp;PNG.</span><em>SVG</em>'),
                   ("socialni-site.html", 'href="downloads/brightbox-socialni-site.zip" download', 'href="sablony.html"'),
                   ("socialni-site.html", '(JPG) jako vzor pro&nbsp;kontrolu.</span><em>ZIP</em>', 'jako vzor pro&nbsp;kontrolu.</span><em>Web</em>')]:
    f = OUT / name; t = f.read_text(); assert a in t, (name, a); f.write_text(t.replace(a, b))

# stahování v prohlížeči artifactu jde jen přes schopnost downloads: odkazy s download a logo balík (zip skládaný v prohlížeči)
logo_files = sorted(f.name for f in (ROOT / "downloads/logo").glob("*") if f.suffix in (".svg", ".png"))
(OUT / "assets/js/artifact-dl.js").write_text("""// jen ve zveřejněné verzi: soubory nabízí viewer přes claude.use("downloads")
(() => {
  const LOGO = %s;
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  // zip bez komprese (STORE)
  const zip = entries => {
    const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
    for (const { name, data } of entries) {
      const n = enc.encode(name), c = crc(data), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
      h.setUint32(14, c, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, n.length, true);
      parts.push(h, n, data);
      const d = new DataView(new ArrayBuffer(46));
      d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true); d.setUint16(8, 0x0800, true);
      d.setUint32(16, c, true); d.setUint32(20, data.length, true); d.setUint32(24, data.length, true); d.setUint16(28, n.length, true); d.setUint32(42, off, true);
      cd.push(d, n); off += 30 + n.length + data.length;
    }
    const size = cd.reduce((a, x) => a + x.byteLength, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
    return new Blob([...parts, ...cd, e]);
  };
  const toast = msg => { let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); } t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); };
  window.claude?.use?.('downloads').then(dl => {
    if (!dl) return;
    const bytes = async u => new Uint8Array(await (await fetch(u)).arrayBuffer());
    document.addEventListener('click', async e => {
      const a = e.target.closest('a[download], a.dlc--logo'); if (!a) return;
      e.preventDefault();
      try {
        const href = a.getAttribute('href');
        const file = a.classList.contains('dlc--logo')
          ? { filename: 'brightbox-logo.zip', data: zip(await Promise.all(LOGO.map(async f => ({ name: 'logo/' + f, data: await bytes('downloads/logo/' + f) })))) }
          : { filename: href.split('/').pop(), data: await (await fetch(href)).blob() };
        await dl.save(file);
      } catch (err) {
        if (err && err.code === 'declined') return;
        toast('Soubor se teď nepodařilo nabídnout.');
      }
    });
    const card = document.querySelector('.dlc--logo em'); if (card) card.textContent = 'ZIP';
  });
})();
""" % json.dumps(logo_files))
for name in ("index.html", "socialni-site.html"):
    f = OUT / name; t = f.read_text()
    tag = '<script src="assets/js/artifact-dl.js" defer></script>'
    t = t.replace("</body>", tag + "\n</body>") if "</body>" in t else t + "\n" + tag + "\n"
    f.write_text(t)

files = [str(f.relative_to(OUT)) for f in OUT.rglob("*") if f.is_file() and f.name not in SKIP]
size = sum((OUT / f).stat().st_size for f in files)
json.dump(sorted(f for f in files if f != "index.html"), open(OUT.parent / "_artifact_files.json", "w"), indent=0)
print(len(files), "souborů,", round(size / 1e6, 1), "MB")
big = sorted(((OUT / f).stat().st_size, f) for f in files)[-5:]
print("největší:", [(f, round(s / 1e6, 1)) for s, f in big])
