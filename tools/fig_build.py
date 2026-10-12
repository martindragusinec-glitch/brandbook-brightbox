#!/usr/bin/env python3
"""spec.json (z fig_extract.mjs) → JS pro use_figma + oříznuté fotky pro upload_assets.

python3 tools/fig_build.py <spec.json> <outDir> <pageId> <comp.json> [--groups groups.json] [--max 44000]
  comp.json   = {"assets/logos/kit/bb-mark-color.svg": "12:34", ...} (komponenty vytvořené z nahraných SVG)
  groups.json = [{"name": "Feed 4:5", "ids": ["feed-myslenka", ...]}, ...] → sekce na plátně
Výstup: outDir/build-<n>.js (každý < max znaků), outDir/img/*.jpg + outDir/images.json (pořadí pro upload)
"""
import json, sys, re, pathlib, math
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
args = sys.argv[1:]
spec = json.load(open(args[0])); out = pathlib.Path(args[1]); page_id = args[2]
comp = json.load(open(args[3]))
groups = None; maxc = 44000; y0 = 0
if '--groups' in args: groups = json.load(open(args[args.index('--groups') + 1]))
if '--max' in args: maxc = int(args[args.index('--max') + 1])
if '--y' in args: y0 = int(args[args.index('--y') + 1])
GRID = int(args[args.index('--grid') + 1]) if '--grid' in args else 0
NOSEC = '--nosection' in args
SKIP = set(args[args.index('--skip') + 1].split(',')) if '--skip' in args else set()
(out / 'img').mkdir(parents=True, exist_ok=True)
byid = {s['id']: s for s in spec}
if not groups: groups = [{'name': 'Šablony', 'ids': [s['id'] for s in spec]}]

R = lambda v: round(v, 1)

def hexc(c):
    m = re.findall(r'[\d.]+', c); r, g, b = (int(float(x)) for x in m[:3]); a = float(m[3]) if len(m) > 3 else 1
    return f'#{r:02x}{g:02x}{b:02x}' + (f'{round(a*255):02x}' if a < 1 else '')

def crop_photo(n, key):
    src = pathlib.Path(n['src']) if n['src'].startswith('/') else ROOT / n['src']
    im = Image.open(src)
    alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if alpha else 'RGB')
    nw, nh = im.size; w, h = n['w'], n['h']
    px, py = 50.0, 50.0
    m = re.findall(r'([\d.]+)%', n.get('pos') or '')
    if len(m) >= 2: px, py = float(m[0]), float(m[1])
    if n.get('fit') == 'cover':
        k = max(w / nw, h / nh); vw, vh = w / k, h / k
        x = (nw - vw) * px / 100; y = (nh - vh) * py / 100
        im = im.crop((round(x), round(y), round(x + vw), round(y + vh)))
    elif n.get('fit') == 'contain':
        k = min(w / nw, h / nh); cw, ch = nw * k, nh * k
        canvas = Image.new('RGBA', (round(w), round(h)), (0, 0, 0, 0)); alpha = True
        canvas.paste(im.convert('RGBA').resize((max(1, round(cw)), max(1, round(ch))), Image.LANCZOS), (round((w - cw) / 2), round((h - ch) / 2)))
        im = canvas
    scale = min(2.0, 2000 / max(w, h))
    im = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    p = out / 'img' / (f'{key}.png' if alpha else f'{key}.jpg')
    im.save(p, **({} if alpha else {'quality': 90}))
    return str(p)

def slim(n):
    d = {k: n[k] for k in ('t', 'x', 'y', 'w', 'h') if k in n}
    for k in ('x', 'y', 'w', 'h'): d[k] = R(d[k])
    if n.get('op', 1) != 1: d['op'] = n['op']
    t = n['t']
    if t == 'glow': d['g'] = n['grad']
    elif t == 'rect':
        d.update(r=R(n['radius']), f=hexc(n['fill']) if n['fill'] and not n['grad'] else None, g=n['grad'], s=hexc(n['stroke']) if n['stroke'] else None, sw=n['sw'], da=n['dashed'], n=n['name'])
        d = {k: v for k, v in d.items() if v not in (None, False, 0) or k in ('x', 'y', 'r')}
    elif t == 'svg': d['c'] = comp[n['src']]
    elif t == 'img': d['r'] = n['radius'] if n['radius'] == 'circle' else R(n['radius'])
    elif t == 'text':
        st = n['st']
        lh = R(st['lh'] or st['size'] * 1.2)
        multi = not (n['nowrap'] or (len(n['lines']) == 1 and n['tw'] < n['w'] - 1))
        d.update(s=n['text'], st=[st['family'], st['weight'], st['size'], lh, R(st['ls']), hexc(st['color']), 1 if st['upper'] else 0, st['align'][0]], m=1 if multi else 0)
        if multi and len(n['lines']) > 1: d['L'] = n['lines']
        if n['name'] == 'text': d['x'] = R(n['tx']); d['y'] = R(n['ty'] + (n['th'] - lh) / 2)
        elif not multi and st['align'] in ('center', 'right', 'end'): d['x'] = R(n['tx'])
        for k in ('w', 'h'):
            if not multi: d.pop(k, None)
        base = (st['family'], st['weight'], st['size'], st['color'])
        runs = [[r['start'], r['end'], r['family'], r['weight'], r['size'], hexc(r['color'])] for r in n['runs'] if (r['family'], r['weight'], r['size'], r['color']) != base]
        if runs: d['ru'] = runs
    elif t == 'safe': d['l'] = n['label']
    elif t == 'guide': d.update(r=R(n['radius']), s=n['stroke'], sw=n['sw'], l=n['label'])
    return d

BUILDER = r'''
const page = await figma.getNodeByIdAsync(PAGE); await figma.setCurrentPageAsync(page);
const FW = {Sora:{300:'Light',400:'Regular',500:'Regular',600:'SemiBold',700:'Bold',800:'ExtraBold'},Geist:{300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold'}};
const fn = (f,w) => ({family:f, style:(FW[f]||FW.Geist)[w]||'Regular'});
const need = new Map();
for (const g of D.groups) for (const fr of g.frames) for (const n of fr.nodes) if (n.t==='text') { const a=fn(n.st[0],n.st[1]); need.set(a.family+a.style,a); (n.ru||[]).forEach(r=>{const b=fn(r[2],r[3]); need.set(b.family+b.style,b);}); }
await Promise.all([...need.values()].map(f=>figma.loadFontAsync(f)));
const col = s => { if (s[0]==='#') { const h=s.slice(1); const v=i=>parseInt(h.slice(i,i+2),16)/255; return {r:v(0),g:v(2),b:v(4),a:h.length>6?v(6):1}; } const m = s.match(/rgba?\(([^)]+)\)/); const p = m[1].split(',').map(x=>parseFloat(x)); return {r:p[0]/255,g:p[1]/255,b:p[2]/255,a:p.length>3?p[3]:1}; };
const stops = css => { const out=[]; const re=/(rgba?\([^)]+\))\s*([\d.]+%)?/g; let m; const arr=[]; while((m=re.exec(css))) arr.push([m[1], m[2]?parseFloat(m[2])/100:null]); arr.forEach((s,i)=>{ const pos = s[1]!==null?s[1]:(arr.length===1?0:i/(arr.length-1)); out.push({position:pos,color:col(s[0])}); }); return out; };
const lin = (css,W,H) => { const a = (css.match(/linear-gradient\(\s*([-\d.]+)deg/)||[0,180])[1]*Math.PI/180; const dx=Math.sin(a), dy=-Math.cos(a); const L=Math.abs(W*dx)+Math.abs(H*dy); const cx=W/2, cy=H/2; const p0x=cx-dx*L/2, p0y=cy-dy*L/2; const nx=-dy, ny=dx;
  return {type:'GRADIENT_LINEAR', gradientStops:stops(css), gradientTransform:[[W*dx/L, H*dy/L, -(p0x*dx+p0y*dy)/L],[W*nx/L, H*ny/L, 0.5-(cx*nx+cy*ny)/L]]}; };
const rad = css => ({type:'GRADIENT_RADIAL', gradientStops:stops(css), gradientTransform:[[1,0,0],[0,1,0]]});
const solid = s => { const c=col(s); return {type:'SOLID', color:{r:c.r,g:c.g,b:c.b}, opacity:c.a}; };
const made=[], imgs=[];
for (const g of D.groups) {
  let sec = null;
  if (D.nosection) { sec = page; }
  else {
  sec = page.children.find(n => n.type==='SECTION' && n.name===g.name);
  if (!sec) { sec = figma.createSection(); sec.name = g.name; page.appendChild(sec); sec.x = g.x; sec.y = g.y; sec.resizeWithoutConstraints(g.w, g.h); }
  }
  for (const fr of g.frames) {
    const F = figma.createFrame(); F.name = fr.name; F.resize(fr.w, fr.h); F.x = fr.x; F.y = fr.y; F.clipsContent = true;
    F.fills = fr.bi && fr.bi.startsWith('linear') ? [lin(fr.bi, fr.w, fr.h)] : [solid(fr.bg)];
    sec.appendChild(F); made.push(F.id);
    for (const n of fr.nodes) {
      let N;
      if (n.t==='glow') { if (n.g.startsWith('linear')) { N = figma.createRectangle(); N.resize(n.w,n.h); N.fills=[lin(n.g,n.w,n.h)]; } else { N = figma.createEllipse(); N.resize(n.w,n.h); N.fills=[rad(n.g)]; } N.name='Světlo'; }
      else if (n.t==='rect') { N = figma.createRectangle(); N.resize(n.w,n.h); N.cornerRadius=n.r; N.fills = n.g && n.g.startsWith('linear') ? [lin(n.g,n.w,n.h)] : (n.f && !/^#[0-9a-f]{6}00$/.test(n.f) ? [solid(n.f)] : []);
        if (n.s && n.sw) { N.strokes=[solid(n.s)]; N.strokeWeight=n.sw; if (n.da) N.dashPattern=[10,8]; } N.name = n.n==='tp__scrim' ? 'Ztmavení' : n.n==='tp__chip' ? 'Štítek' : n.n==='tp__cta' ? 'Tlačítko' : n.n==='tp__card' ? 'Karta' : 'Plocha'; }
      else if (n.t==='svg') { const C = await figma.getNodeByIdAsync(n.c); N = C.createInstance(); N.rescale(n.w / C.width); }
      else if (n.t==='img') { N = n.r==='circle' ? figma.createEllipse() : figma.createRectangle(); N.resize(n.w,n.h); if (n.r!=='circle' && n.r) N.cornerRadius=n.r; N.fills=[{type:'SOLID',color:{r:.85,g:.83,b:.88}}]; N.name='Foto'; imgs.push({id:N.id, key:n.key}); }
      else if (n.t==='safe') { N = figma.createRectangle(); N.resize(n.w,n.h); N.fills=[{type:'SOLID',color:{r:.9,g:.055,b:.5},opacity:.18}]; N.name='Bezpečná zóna - '+n.l; N.visible=false; N.locked=true; }
      else if (n.t==='guide') { N = figma.createRectangle(); N.resize(n.w,n.h); N.cornerRadius=n.r; N.fills=[]; N.strokes=[solid(n.s)]; N.strokeWeight=n.sw; N.dashPattern=[12,10]; N.name='Vodítko - '+n.l; N.visible=false; }
      else if (n.t==='text') {
        const [fam,w,size,lh,ls,c,up,al] = n.st; N = figma.createText(); N.fontName = fn(fam,w);
        N.fontSize=size; N.lineHeight={unit:'PIXELS',value:lh}; N.letterSpacing={unit:'PIXELS',value:ls}; const cc=col(c); N.fills=[{type:'SOLID',color:{r:cc.r,g:cc.g,b:cc.b},opacity:cc.a}];
        if (up) N.textCase='UPPER';
        const multi = !!n.m;
        const brk = multi && n.L ? n.L.join('\n') : n.s;
        N.characters = brk.length === n.s.length ? brk : n.s;
        (n.ru||[]).forEach(r=>{ N.setRangeFontName(r[0],r[1],fn(r[2],r[3])); N.setRangeFontSize(r[0],r[1],r[4]); const rc=col(r[5]); N.setRangeFills(r[0],r[1],[{type:'SOLID',color:{r:rc.r,g:rc.g,b:rc.b},opacity:rc.a}]); });
        if (brk.length !== n.s.length && !(n.ru||[]).length) N.characters = brk;
        // zlomy jsou z prohlížeče, takže bez automatického zalamování (Figma kreslí Soru o chlup širší)
        N.textAutoResize='WIDTH_AND_HEIGHT';
        if (multi && al==='c') { N.textAlignHorizontal='CENTER'; n.x = n.x + (n.w - N.width)/2; }
        if (multi && (al==='r'||al==='e')) { N.textAlignHorizontal='RIGHT'; n.x = n.x + n.w - N.width; }
        N.name = n.s.length > 40 ? n.s.slice(0,40)+'…' : n.s;
      }
      if (!N) continue;
      F.appendChild(N); N.x = n.x; N.y = n.y; if (n.op!==undefined) N.opacity = n.op;
    }
  }
}
return { frames: made, images: imgs };
'''

frames_out = []; images = []
gx = 0
for gi, g in enumerate(groups):
    x = 80; frs = []
    gh = 0
    for fid in g['ids']:
        s = byid[fid]
        nodes = []
        for i, n in enumerate(s['nodes']):
            d = slim(n)
            if n['t'] == 'img':
                key = f"{fid}-{i}"; d['key'] = key
                images.append({'key': key, 'file': crop_photo(n, key)})
            nodes.append(d)
        k = len(frs)
        if GRID:
            fx = 80 + (k % GRID) * (s['w'] + 120); fy = 160 + (k // GRID) * (s['h'] + 200)
        else:
            fx, fy = x, 160
        frs.append({'name': s['name'], 'w': R(s['w']), 'h': R(s['h']), 'x': fx, 'y': fy, 'bg': s['bg'], 'bi': s['bgImage'] if s['bgImage'] != 'none' else None, 'nodes': nodes})
        x = max(x, fx + s['w'] + 80); gh = max(gh, fy - 160 + s['h'])
    frames_out.append({'name': g['name'], 'x': 0, 'y': 0, 'w': x, 'h': gh + 240, 'frames': frs})
# rozložení sekcí pod sebou
y = y0
for g in frames_out:
    g['y'] = y; y += g['h'] + 200

# rozdělit do volání podle velikosti
chunks, cur, cur_len = [], [], 0
for g in frames_out:
    for f in g['frames']:
        if f['name'].split(' ')[0] in SKIP: continue
        piece = json.dumps(f, ensure_ascii=False, separators=(',', ':'))
        if cur and cur_len + len(piece) > maxc - len(BUILDER) - 400:
            chunks.append(cur); cur, cur_len = [], 0
        cur.append((g, f)); cur_len += len(piece)
if cur: chunks.append(cur)
for ci, ch in enumerate(chunks):
    gs = []
    for g, f in ch:
        if not gs or gs[-1]['name'] != g['name']:
            gs.append({'name': g['name'], 'x': g['x'], 'y': g['y'], 'w': g['w'], 'h': g['h'], 'frames': []})
        gs[-1]['frames'].append(f)
    # jeden uzel na řádek, ať jde soubor číst po částech
    def gjs(g):
        head = json.dumps({k: g[k] for k in g if k != 'frames'}, ensure_ascii=False, separators=(',', ':'))[:-1]
        frs = []
        for f in g['frames']:
            fh = json.dumps({k: f[k] for k in f if k != 'nodes'}, ensure_ascii=False, separators=(',', ':'))[:-1]
            nodes = ',\n'.join(json.dumps(n, ensure_ascii=False, separators=(',', ':')) for n in f['nodes'])
            frs.append(fh + ',"nodes":[\n' + nodes + ']}')
        return head + ',"frames":[\n' + ',\n'.join(frs) + ']}'
    D = '{"nosection":' + ('true' if NOSEC else 'false') + ',"groups":[\n' + ',\n'.join(gjs(g) for g in gs) + ']}'
    js = f"const PAGE='{page_id}';\nconst D={D};\n" + BUILDER
    (out / f'build-{ci}.js').write_text(js)
    print(f'build-{ci}.js', len(js), 'znaků,', sum(len(g["frames"]) for g in gs), 'rámů, sekce:', [g['name'] for g in gs])
json.dump(images, open(out / 'images.json', 'w'), ensure_ascii=False, indent=1)
json.dump([{k: g[k] for k in ('name', 'x', 'y', 'w', 'h')} for g in frames_out], open(out / 'sections.json', 'w'), ensure_ascii=False, indent=1)
print('fotek', len(images))
