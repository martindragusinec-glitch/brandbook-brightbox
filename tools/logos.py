#!/usr/bin/env python3
"""Logo kit Brightbox: z oficiálních SVG (bb-mark.svg, bb-logo-ink.svg) skládá všechny verze značky.

Barevná značka = přesné cesty a gradienty z webu. Nápis GROUP = Sora SemiBold převedená do křivek,
výška verzálek 6,6 (logo vysoké 38), účaří na spodní hraně kostky, prostrkané od „b" po „x" slova box.
Jednobarevná značka = stěny plně, koule 40 % (tónová), „jednobarevná bez tónu" = jen stěny (koule je otvor).

python3 tools/logos.py  → assets/logos/kit/*.svg
"""
import re, pathlib, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOGOS = ROOT / "assets" / "logos"
OUT = LOGOS / "kit"
OUT.mkdir(exist_ok=True)

INK = "#0F0B1E"  # Noc: oficiální barva nápisu loga
WHITE = "#FFFFFF"

mark_src = (LOGOS / "bb-mark.svg").read_text()
logo_src = (LOGOS / "bb-logo-ink.svg").read_text()
defs = re.search(r"<defs>.*</defs>", mark_src, re.S).group(0)
mark_paths = re.findall(r'<path d="([^"]+)" fill="([^"]+)"/>', mark_src)
# pořadí cest ve značce: koule-pravá, stěna-pravá, odlesk, koule-horní, stěna-horní, odlesk, koule-levá, stěna-levá, odlesk
FACES = [mark_paths[i][0] for i in (1, 4, 7)]
SPHERE = [mark_paths[i][0] for i in (0, 3, 6)]
word_paths = []
for d in re.findall(r'<path d="([^"]+)" fill="#0F0B1E"/>', logo_src):
    if d not in word_paths:
        word_paths.append(d)

# --- GROUP v Sora SemiBold ---
src_font = ROOT / "assets" / "fonts" / "sora-latin-wght.woff2"
font = instancer.instantiateVariableFont(TTFont(src_font), {"wght": 600})
gs = font.getGlyphSet()
cmap = font.getBestCmap()
CAP = font["OS/2"].sCapHeight  # 730
CAP_H = 6.6           # výška verzálek v jednotkách loga (logo 38)
BASE = 38.0           # účaří = spodní hrana kostky
X0, X1 = 119.82, 165.0  # od levé hrany „b" po pravou hranu „x"
k = CAP_H / CAP
glyphs = [cmap[ord(c)] for c in "GROUP"]

def ink(g):
    bp = BoundsPen(gs); gs[g].draw(bp); return bp.bounds

adv = [gs[g].width for g in glyphs]
first_l = ink(glyphs[0])[0]
last_r = ink(glyphs[-1])[2]
natural = sum(adv[:-1]) + last_r - first_l
track = ((X1 - X0) / k - natural) / (len(glyphs) - 1)

group_d = []
pen_x = X0 / k - first_l
for g, a in zip(glyphs, adv):
    sp = SVGPathPen(gs)
    tp = TransformPen(sp, (k, 0, 0, -k, pen_x * k, BASE))
    gs[g].draw(tp)
    group_d.append(sp.getCommands())
    pen_x += a + track
GROUP_BOTTOM = BASE + 19 * k  # přetažení O/G pod účaří

def mark_color():
    return "".join(f'<path d="{d}" fill="{f}"/>' for d, f in mark_paths)

def mark_white():
    """Bílá verze ze starého manuálu: bílé stěny, koule zůstává barevná (přechod Záře do bílé).
    Pod kouli jde bílý podklad, jinak by na spoji cest prosvítala tenká linka pozadí."""
    base = "".join(f'<path d="{d}" fill="{WHITE}"/>' for d in FACES + SPHERE)
    sphere = "".join(f'<path d="{d}" fill="{f}"/>' for i, (d, f) in enumerate(mark_paths) if i not in (1, 4, 7))
    return base + sphere

def mark_mono(color):
    """Jednobarevná (ražba, výšivka, laser): jen stěny, koule je otvor."""
    return "".join(f'<path d="{d}" fill="{color}"/>' for d in FACES)

def words(color):
    return "".join(f'<path d="{d}" fill="{color}"/>' for d in word_paths)

def group(color):
    return f'<path d="{"".join(group_d)}" fill="{color}"/>'

def svg(body, w, h, with_defs=False):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}" fill="none">'
            + (defs if with_defs else "") + body + "</svg>\n")

H_GROUP = round(GROUP_BOTTOM + .05, 2)
variants = {
    # značka
    "bb-mark-color": (mark_color(), 35, 38, True),
    "bb-mark-white": (mark_white(), 35, 38, True),
    "bb-mark-mono-ink": (mark_mono(INK), 35, 38, False),
    "bb-mark-mono-white": (mark_mono(WHITE), 35, 38, False),
    # logo Brightbox
    "bb-logo-color": (mark_color() + words(INK), 165, 38, True),
    "bb-logo-white": (mark_white() + words(WHITE), 165, 38, True),
    "bb-logo-mono-ink": (mark_mono(INK) + words(INK), 165, 38, False),
    "bb-logo-mono-white": (mark_mono(WHITE) + words(WHITE), 165, 38, False),
    # logo Brightbox Group
    "bb-group-color": (mark_color() + words(INK) + group(INK), 165, H_GROUP, True),
    "bb-group-white": (mark_white() + words(WHITE) + group(WHITE), 165, H_GROUP, True),
    "bb-group-mono-ink": (mark_mono(INK) + words(INK) + group(INK), 165, H_GROUP, False),
    "bb-group-mono-white": (mark_mono(WHITE) + words(WHITE) + group(WHITE), 165, H_GROUP, False),
}
for name, (body, w, h, d) in variants.items():
    (OUT / f"{name}.svg").write_text(svg(body, w, h, d))
print("tracking em:", round(track / 1000, 3), "| group bottom:", round(GROUP_BOTTOM, 2), "|", len(variants), "souborů →", OUT)

# --- pomocné soubory pro manuál (nápis zvlášť, ukázky zákazů) ---
WB = "41.32 9.79 123.68 24.76"
for name, col in (("bb-wordmark-ink", INK), ("bb-wordmark-white", WHITE)):
    (OUT / f"{name}.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{WB}" width="123.68" height="24.76">{words(col)}</svg>\n')
DON = OUT.parent / "donts"
DON.mkdir(exist_ok=True)
# přebarvené stěny (barvy agentur) - zákaz
rec = "".join(f'<path d="{d}" fill="{c}"/>' for d, c in zip(FACES, ("#2AE889", "#FFB627", "#36386C")))
rec += "".join(f'<path d="{d}" fill="{c}" fill-opacity=".55"/>' for d, c in zip(SPHERE, ("#2AE889", "#FFB627", "#36386C")))
(DON / "recolor.svg").write_text(svg(rec + words(INK), 165, 38))
# obrysové logo - zákaz
out = "".join(f'<path d="{d}" fill="none" stroke="{INK}" stroke-width=".45"/>' for d in FACES + SPHERE + word_paths)
(DON / "outline.svg").write_text(svg(out, 165, 38))
print("+ nápis zvlášť, ukázky zákazů →", DON)
