#!/usr/bin/env python3
"""Diagram ochranné zóny: logo + volné místo x = šířka písmene B (přesná cesta B z nápisu loga).
python3 tools/zone.py → assets/logos/diagram-zone.svg, diagram-zone-mark.svg"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
logo = (ROOT / "assets/logos/kit/bb-logo-color.svg").read_text()
mark = (ROOT / "assets/logos/kit/bb-mark-color.svg").read_text()
inner = lambda s: re.search(r"<svg[^>]*>(.*)</svg>", s, re.S).group(1)
B = re.findall(r'<path d="([^"]+)" fill="#0F0B1E"/>', logo)[0]   # první cesta nápisu = B
BX0, BY0, BW, BH = 41.32, 9.79, 14.13, 18.42                       # obrys B v jednotkách loga
X = BW
ZONE, INNER, BCOL = "#E3DBF7", "#F4F1FA", "#362770"

def bglyph(cx, cy, k=1, rot=0):
    # B vycentrované na (cx, cy) v měřítku k (šířka B = k · x), u horní a spodní hrany otočené o 90°
    return (f'<g transform="translate({cx:.3f} {cy:.3f}) rotate({rot}) scale({k}) translate({-BX0 - BW/2:.3f} {-BY0 - BH/2:.3f})">'
            f'<path d="{B}" fill="{BCOL}" fill-opacity=".42"/></g>')

def diagram(body, w, h, x, ruler=True):
    # zóna = světle fialová plocha, obrys loga = Mlha (stejná jako stránka).
    # Míra x: čtverce x × x v rozích zóny (ukazují x vodorovně i svisle) a jedno B vlevo, ze kterého x pochází.
    W, H = w + 2 * x, h + 2 * x
    sq = lambda X, Y: f'<rect x="{X:.3f}" y="{Y:.3f}" width="{x:.3f}" height="{x:.3f}" fill="{BCOL}" fill-opacity=".14"/>'
    g = [f'<rect width="{W:.3f}" height="{H:.3f}" rx="{x * .2:.3f}" fill="{ZONE}"/>',
         f'<rect x="{x:.3f}" y="{x:.3f}" width="{w}" height="{h}" fill="{INNER}"/>',
         sq(0, 0), sq(W - x, 0), sq(0, H - x), sq(W - x, H - x)]
    if ruler:
        g.append(bglyph(x / 2, H / 2, x / BW))
    g.append(f'<g transform="translate({x:.3f} {x:.3f})">{body}</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.3f} {H:.3f}" width="{W:.3f}" height="{H:.3f}">{"".join(g)}</svg>\n'

(ROOT / "assets/logos/diagram-zone.svg").write_text(diagram(inner(logo), 165, 38, X, ruler=False))
(ROOT / "assets/logos/diagram-zone-mark.svg").write_text(diagram(inner(mark), 35, 38, X / 2, ruler=False))
print("x =", X)
