"""Česká typografie pro brandbook - převzato 1:1 z v5/build.py (nbsp po předložkách, čísla s jednotkou, konce nadpisů)."""
import re
# česká typografie: krátké předložky a spojky (1-3 písmena) nesmí zůstat na konci řádku
SHORT = ("v s z k o u a i "
         "do na po za od ke ku ve ze se si že či až ať ne "
         "bez nad pod pro při ani jen než "
         "před přes").split()
SHORT_ALT = "|".join(sorted({w for x in SHORT for w in (x, x.capitalize())}, key=len, reverse=True))
NBSP_RE = re.compile(r"(?<=[\s>(;])(" + SHORT_ALT + r") (?=\S)")
TAIL_RE = re.compile(r"(?<=[\s>(;])(" + SHORT_ALT + r") $")


def bind_sentence_starts(text):
    """Začátek nové věty nesmí zůstat na konci řádku: první dvě slova věty se váží k sobě a ke třetímu
    (jen pokud je spojení krátké, aby nepřeteklo úzký sloupec)."""
    parts = text.split(" ")
    vis = lambda t: len(re.sub(r"&[a-z#0-9]+;|<[^>]+>", "x", t))
    bind = set()   # indexy slov, za kterými má být nezlomitelná mezera
    for i in range(1, len(parts) - 1):
        if not re.search(r"[.!?:][„“\"”)]?$", parts[i - 1]) or not parts[i]:
            continue
        # i = první slovo věty
        if vis(parts[i]) <= 3 and vis(parts[i]) + vis(parts[i + 1]) <= 16:
            bind.add(i)
    return "".join(t + (("&nbsp;" if i in bind else " ") if i < len(parts) - 1 else "") for i, t in enumerate(parts))
# číslo a to, k čemu patří (20+ specialistů, 10 000 Kč, 4 agentury)
NUM_RE = re.compile(r"(?<=\d)([+%]?) (?=[^\s\d&<-])")


def bind_heading_tail(html):
    """Nadpis nesmí končit jedním slovem na řádku: poslední dvě slova (když jsou krátká) se spojí."""
    def fix(m):
        inner = m.group(2)
        mm = re.search(r"(\S+) ((?:<[^>]+>)*[^\s<>]+(?:<[^>]+>)*)\s*$", inner)
        if not mm:
            return m.group(0)
        prev = re.sub(r"<[^>]+>|&[a-z#0-9]+;", "x", mm.group(1)); last = re.sub(r"<[^>]+>|&[a-z#0-9]+;", "x", mm.group(2))
        if len(prev) + len(last) > 12 or "<" in mm.group(1)[-1:]:
            return m.group(0)
        return m.group(1) + inner[:mm.start()] + mm.group(1) + "&nbsp;" + mm.group(2) + inner[mm.end():] + m.group(3)
    return re.sub(r"(<h[1-3]\b[^>]*>)([\s\S]*?)(</h[1-3]>)", fix, html)

UNIT_RE = re.compile(r"^(%|‰|Kč|Kč\b|ks|let|dní|dnů|min|mil|tis|m²|×)")
CHAIN_RE = re.compile(r"(?:(?!&#32;)[^\s<>])+(?:&nbsp;(?:(?!&#32;)[^\s<>])+)+")


def cap_chains(p, cap=18):
    """vázané řetězce (předložky, začátky vět, čísla s jednotkou) delší než cap znaků rozdělí,
    jinak přetečou z úzkého sloupce nebo z velkého nadpisu na mobilu.
    Láme jen mezi dvěma delšími slovy, nikdy za předložkou ani mezi číslem a jednotkou."""
    vis = lambda t: len(re.sub(r"&[a-z#0-9]+;", "x", t))
    def fix(m):
        toks = m.group(0).split("&nbsp;")
        ok = [len(re.sub(r"&[a-z#0-9]+;", "", a)) > 3 and not re.search(r"\d\W*$", a) and not UNIT_RE.match(b)
              for a, b in zip(toks, toks[1:])]
        cut = set()
        def segs():
            out, start = [], 0
            for i in range(len(toks) - 1):
                if i in cut:
                    out.append((start, i)); start = i + 1
            out.append((start, len(toks) - 1))
            return out
        changed = True
        while changed:
            changed = False
            for a, b in segs():
                length = sum(vis(t) for t in toks[a:b + 1]) + (b - a)
                cand = [i for i in range(a, b) if ok[i] and i not in cut]
                if length > cap and cand:
                    # nejradši doprostřed segmentu, první vazbu (začátek věty) až nakonec
                    mid = length / 2
                    pos = lambda i: sum(vis(t) for t in toks[a:i + 1]) + (i - a)
                    pref = [i for i in cand if i != a] or cand
                    cut.add(min(pref, key=lambda i: abs(pos(i) - mid)))
                    changed = True
                    break
        return "".join(t + ((" " if i in cut else "&nbsp;") if i < len(toks) - 1 else "") for i, t in enumerate(toks))
    return CHAIN_RE.sub(fix, p)


def nbsp(html):
    parts = re.split(r"(<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>)", html)
    out = []
    for i, p in enumerate(parts):
        if not p or p.startswith("<"):
            out.append(p)
            continue
        p = NBSP_RE.sub(r"\1&nbsp;", " " + p)[1:]
        p = bind_sentence_starts(p)
        p = NUM_RE.sub(r"\1&nbsp;", p)
        p = cap_chains(p)
        if not (i and parts[i - 1] == '<span class="nw">'):
            p = re.sub(r"\b([eE]-(?:mail|shop)\w*|[Ff]ull-service)", r'<span class="nw">\1</span>', p)   # e-mail, e-shop se nezlomí na spojovníku
        # předložka na konci textu těsně před tagem (např. "s <a>")
        if i + 1 < len(parts) and parts[i + 1].startswith("<") and not parts[i + 1].startswith("</"):
            p = TAIL_RE.sub(r"\1&nbsp;", " " + p)[1:] if p.endswith(" ") else p
        out.append(p)
    return "".join(out)

