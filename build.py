#!/usr/bin/env python3
"""Brandbook Brightbox: src/pages/*.html → *.html v kořeni složky brand/.

{{> partial}}            vloží src/partials/partial.html
{{svg path}}             vloží SVG soubor inline (id gradientů dostanou jedinečnou předponu)
{{mark}}                 barevná značka rozdělená na stěny (.mk-top/.mk-right/.mk-left) pro animaci
Česká typografie (nbsp po předložkách, čísla s jednotkou, konce nadpisů) přes tools/typo.py = stejně jako web v5.

python3 build.py
"""
import re, sys, itertools
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT / "tools"))
import typo  # noqa: E402

SRC = ROOT / "src"
PARTIALS = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}
_uid = itertools.count(1)


def inline_svg(path):
    s = (ROOT / path).read_text()
    s = re.sub(r"<\?xml[^>]*>", "", s).strip()
    n = next(_uid)
    ids = set(re.findall(r'id="([^"]+)"', s))
    for i in sorted(ids, key=len, reverse=True):
        s = s.replace(f'id="{i}"', f'id="s{n}-{i}"').replace(f"url(#{i})", f"url(#s{n}-{i})")
    return s


def mark_groups():
    """Značka z bb-mark.svg rozdělená na tři stěny; každá stěna = obrys + koule + odlesk."""
    s = (ROOT / "assets/logos/bb-mark.svg").read_text()
    n = next(_uid)
    s = re.sub(r'(id="|url\(#)(paint)', lambda m: m.group(1) + f'm{n}-' + m.group(2), s)
    defs = re.search(r"<defs>.*</defs>", s, re.S).group(0)
    paths = re.findall(r'<path d="[^"]+" fill="[^"]+"/>', s)
    groups = {"right": paths[0:3], "top": paths[3:6], "left": paths[6:9]}
    body = "".join(f'<g class="mk-{k}">{"".join(v)}</g>' for k, v in groups.items())
    return f'<svg class="mk" viewBox="0 0 35 38" fill="none" aria-hidden="true">{defs}{body}</svg>'


def include(html):
    html = re.sub(r"\{\{>\s*(\w+)\s*\}\}", lambda m: include(PARTIALS[m.group(1)]), html)
    html = re.sub(r"\{\{svg\s+([^}\s]+)\s*\}\}", lambda m: inline_svg(m.group(1)), html)
    html = re.sub(r"\{\{mark\}\}", lambda m: mark_groups(), html)
    return html


THOUSANDS = re.compile(r"(?<=\d) (?=\d{3}\b)")


def typeset(html):
    # tisíce (12 000) se nesmí rozdělit; pak nbsp z webu v5 jen v textu mimo tagy
    parts = re.split(r"(<script[\s\S]*?</script>|<style[\s\S]*?</style>|<svg[\s\S]*?</svg>|<[^>]+>)", html)
    parts = [p if p.startswith("<") else THOUSANDS.sub("&nbsp;", p) for p in parts]
    html = "".join(parts)
    # nbsp neaplikovat do SVG (cesty), proto SVG dočasně vyjmout
    keep = {}
    def stash(m):
        k = f"\x00{len(keep)}\x00"; keep[k] = m.group(0); return k
    html = re.sub(r"<svg[\s\S]*?</svg>|<script[\s\S]*?</script>|<style[\s\S]*?</style>", stash, html)
    html = typo.bind_heading_tail(typo.nbsp(html))
    for k, v in keep.items():
        html = html.replace(k, v)
    return html


def build():
    for page in sorted((SRC / "pages").glob("*.html")):
        html = typeset(include(page.read_text()))
        (ROOT / page.name).write_text(html)
        print("✓", page.name, f"{len(html)//1024} kB")


if __name__ == "__main__":
    build()
