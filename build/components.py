"""html-explainer component library + page assembler.
content.py does `from components import *`, defines META and CH, then calls build(META, CH).
Every helper returns an HTML string. Pass handout prose VERBATIM; inline <strong>/<em> are fine.
Images are referenced by key: site/img/<key>.webp with captions in site/credits.json (made by fetch_images.py)."""
import json, re, pathlib, html as H
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent          # <project>/build
SITE = ROOT.parent / "docs"
CRED = json.loads((SITE / "credits.json").read_text(encoding="utf-8")) if (SITE / "credits.json").exists() else {}

# ---------------------------------------------------------------- primitives
def img_tag(key, cls="", eager=False, extra=""):
    w, h = Image.open(SITE / "img" / f"{key}.webp").size
    alt = H.escape(CRED[key]["caption"].split(" · ")[0])
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'<img class="{cls}" src="img/{key}.webp" width="{w}" height="{h}" alt="{alt}" decoding="async" {load} {extra}>'

def cap(key): return H.escape(CRED[key]["caption"])

def lede(html):      return f'<div class="wrap narrow intro"><p class="lede" data-words>{html}</p></div>'
def para(*htmls):    return '<div class="wrap narrow">' + "".join(f'<p class="body-lg" data-rv>{h}</p>' for h in htmls) + '</div>'
def closing(html):   return f'<div class="wrap narrow"><p class="encourage" data-rv>{html}</p></div>'
def note(html):      return f'<div class="wrap narrow"><p class="src-note" data-rv>{html}</p></div>'
def block(*parts):   return '<section class="block">' + "".join(parts) + '</section>'

def bhead(k, title, src=""):
    """Numbered sub-heading. k='01'.. ; src = citation line shown under the title."""
    s = f'<p class="bhead-src">{src}</p>' if src else ""
    return f'<header class="bhead wrap"><span class="bhead-k">{k}</span><div><h3 class="bhead-t" data-split>{title}</h3>{s}</div></header>'

def prompt(text, label="Pause and think"):
    """Reflection question from the source (italic callout)."""
    return f'<aside class="prompt wrap narrow" data-rv><span class="prompt-k">{label}</span><p><em>{text}</em></p></aside>'

def plate(key, extra=""):
    """Full-width parallax photograph with caption. extra='wide' for edge-to-edge."""
    return f'<figure class="plate wrap {extra}"><div class="plate-frame">{img_tag(key, "plate-img")}</div><figcaption><span class="cap-k">Photograph</span>{cap(key)}</figcaption></figure>'

def passage(key, quote, cite_html=None):
    """Big quotation over a dimmed, parallax photograph."""
    c = cite_html if cite_html is not None else f'<span class="cap-k">Photograph</span>{cap(key)}'
    return (f'<section class="passages"><figure class="passage"><div class="ps-bg">{img_tag(key, "ps-img")}</div>'
            f'<blockquote class="ps-q wrap"><p class="ps-text" data-quote>{quote}</p><footer class="ps-cite" data-rv>{c}</footer></blockquote></figure></section>')

# ---------------------------------------------------------------- components
def story(steps, keys, line=True):
    """Sticky gallery: photo frame pinned left, steps scroll right; frame wipes to the step's photo.
    steps=[(title, html)], keys=[image key per step]. Mobile: inline figure per step."""
    frames = "".join(f'<figure class="frame{" is-on" if i == 0 else ""}" data-i="{i}">{img_tag(k, "frame-img")}</figure>' for i, k in enumerate(keys))
    caps = json.dumps([CRED[k]["caption"] for k in keys], ensure_ascii=False)
    body = ""
    for i, (title, html_) in enumerate(steps):
        k = keys[i]
        body += (f'<div class="step" data-i="{i}"><figure class="step-fig">{img_tag(k)}<figcaption>{cap(k)}</figcaption></figure>'
                 f'<div class="step-head"><span class="step-n">{i+1:02d}</span><h4 class="step-t">{title}</h4></div>{html_}</div>')
    lc, le = (" has-line", '<span class="story-line"><i></i></span>') if line else ("", "")
    return (f'<div class="story wrap{lc}"><div class="story-media" aria-hidden="true"><div class="frames">{frames}</div>'
            f'<p class="frame-cap" data-caps="{H.escape(caps)}"><span class="cap-k">Photograph</span><span class="cap-t">{cap(keys[0])}</span></p></div>'
            f'<div class="story-steps">{le}{body}</div></div>')

def term_def(term, rest, example=None):
    """Definition paragraph for story steps: highlighted term + verbatim rest (+ optional 'Ex.' box)."""
    ex = f'<div class="example"><p><em>{example}</em></p></div>' if example else ""
    return f'<p class="def"><span class="term">{term}</span> {rest}</p>{ex}'

def duel(left_label, left_lines, right_label, right_intro, right_lines):
    """Contrast panel: left = sticky card of short lines (e.g. fiction openers), right = intro + 'wire' cards that type out."""
    l = "".join(f'<p class="fic-l">{x}</p>' for x in left_lines)
    r = "".join(f'<p class="wire-l" data-type>{x}</p>' for x in right_lines)
    i = f'<p class="wire-intro" data-rv>{right_intro}</p>' if right_intro else ""
    return (f'<div class="duel wrap"><div class="fic"><span class="duel-k">{left_label}</span>{l}</div>'
            f'<div class="wire"><span class="duel-k">{right_label}</span>{i}{r}</div></div>')

def keyrow(items):
    """Big typographic row of key terms, e.g. [('W','What'),...,('H','How')]; last item gets the accent."""
    out = "".join(f'<span class="w5{" h1" if n == len(items)-1 else ""}"><i>{a}</i>{b}</span>' for n, (a, b) in enumerate(items))
    return f'<div class="ws wrap" aria-hidden="true" style="grid-template-columns:repeat({len(items)},minmax(0,1fr))">{out}</div>'

def diagram(svg, steps, note_html="", caption="Diagram"):
    """Sticky SVG diagram whose parts light up as each step is read. svg must contain <g class="tier" data-t="0..n">
    (rect/polygon + text). steps=[(title, subtitle, html, t)] where t = tier index to light. See references/components.md."""
    st = "".join(f'<div class="step" data-t="{t}"><div class="step-head"><span class="step-n">{i+1:02d}</span><h4 class="step-t">{title}'
                 f'{f" <span class=step-sub>{sub}</span>" if sub else ""}</h4></div>{html_}</div>' for i, (title, sub, html_, t) in enumerate(steps))
    nt = f'<div class="pyr-note"><p class="body-lg" data-rv>{note_html}</p></div>' if note_html else '<div class="pyr-note"></div>'
    return f'<div class="pyr wrap"><div class="pyr-media">{svg}<p class="pyr-cap"><span class="cap-k">Diagram</span>{caption}</p></div><div class="pyr-steps">{nt}{st}</div></div>'

def rules(groups):
    """Style-guide layout: giant number + title stick left, items right. groups=[(title, [item_html,...])].
    Inside items use <p>..</p> and <p class="ex">Ex. ..</p> for examples."""
    out = ""
    for n, (title, items) in enumerate(groups, 1):
        lis = "".join(f'<li>{it}</li>' for it in items)
        out += f'<article class="rule"><header class="rule-h"><span class="rule-n">{n}</span><h3 class="rule-t">{title}</h3></header><ul class="rule-l">{lis}</ul></article>'
    return f'<div class="rules wrap">{out}</div>'

def split(left_word, left_html, right_word, right_html):
    """Two-column contrast with giant words (e.g. Hard | Soft). Text verbatim; a paragraph may be split across sides."""
    return (f'<div class="wrap"><div class="hs"><div class="hs-c hard" data-rv><span class="hs-k" aria-hidden="true">{left_word}</span><p>{left_html}</p></div>'
            f'<div class="hs-c soft" data-rv><span class="hs-k" aria-hidden="true">{right_word}</span><p>{right_html}</p></div></div></div>')

def scale(left_label, right_label, *htmls):
    """Sticky spectrum bar; the dot slides from right to ~30% while the paragraphs below are read."""
    ps = "".join(f'<p class="body-lg" data-rv>{h}</p>' for h in htmls)
    return (f'<section class="block scale-block"><div class="scale wrap" aria-hidden="true"><span class="sc-end">{left_label}</span>'
            f'<span class="sc-track"><i class="sc-fill"></i><i class="sc-dot"></i></span><span class="sc-end">{right_label}</span></div>'
            f'<div class="wrap narrow sc-text">{ps}</div></section>')

def cards(items):
    """2-col grid of principle cards with camera-viewfinder corners that close in. items=[(title, text)]."""
    out = "".join(f'<article class="prin" data-rv><span class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
                  f'<span class="prin-n">{n:02d}</span><h3 class="prin-t">{t}</h3><p>{x}</p></article>' for n, (t, x) in enumerate(items, 1))
    return f'<div class="prins wrap">{out}</div>'

def pledges(heading, items, footnote=""):
    """Dark numbered list (code of ethics, laws, oaths); each item lights up as it is reached."""
    lis = "".join(f'<li class="code-i"><span class="code-n">{i:02d}</span><p>{t}</p></li>' for i, t in enumerate(items, 1))
    fn = f'<p class="code-note" data-rv>{footnote}</p>' if footnote else ""
    hd = f'<h3 class="code-h" data-rv>{heading}</h3>' if heading else ""
    return f'<section class="code"><div class="wrap narrow">{hd}<ol class="code-l">{lis}</ol>{fn}</div></section>'

def numbered(items, start=1):
    """Numbered rows: big numeral + '<strong>Title.</strong> text'. items=[(title, text)]."""
    out = "".join(f'<article class="skill" data-rv><span class="skill-n">{n}</span><p><strong class="skill-t">{t}.</strong> {x}</p></article>'
                  for n, (t, x) in enumerate(items, start))
    return f'<div class="skills wrap narrow">{out}</div>'

DESK_FILTERS = ("crop", "burn", "gray", "tone", "blur", "sat")   # visual effects implemented in widgets.js + components.css
def desk(key, tools, left_html, title="Try the photo desk"):
    """Interactive image desk: toggles apply visual edits, verdict box says acceptable / not acceptable.
    tools=[(effect, label, ok_bool, verdict_name)] with effect in DESK_FILTERS. left_html = verbatim text column."""
    btns = "".join(f'<button type="button" class="tool {"ok" if ok else "no"}" data-tool="{k}" data-name="{H.escape(nm)}" aria-pressed="false"><i></i>{lab}</button>'
                   for k, lab, ok, nm in tools)
    return (f'<div class="desk wrap"><div class="desk-text">{left_html}</div><div class="desk-tool" data-rv><p class="desk-k">{title}</p>'
            f'<div class="desk-stage" id="deskStage"><div class="desk-frame" style="aspect-ratio:{CRED[key]["w"]}/{CRED[key]["h"]}">{img_tag(key, "desk-img")}{img_tag(key, "desk-blur", extra=chr(32)+"aria-hidden=true")}<span class="desk-vig" aria-hidden="true"></span></div></div>'
            f'<p class="desk-cap">{cap(key)}</p><div class="desk-tools" role="group" aria-label="Adjustments">{btns}</div>'
            f'<p class="desk-verdict" id="deskVerdict" aria-live="polite"><b>Original</b><span>Toggle an adjustment to see the verdict.</span></p>'
            f'<button type="button" class="desk-reset" id="deskReset">Reset</button></div></div>')

# ---------------------------------------------------------------- assembler
def build(META, CH):
    chapters, rooms, n = "", "", 0
    for ch in CH:
        lessons = ""
        for sid, title, src, body, rk in ch["lessons"]:
            n += 1
            s = f'<p class="lhead-src">{src}</p>' if src else ""
            lh = (f'<header class="lhead wrap"><p class="lhead-eb"><span>Section {n:02d}</span> {ch["sub"].split(" · ")[-1]} · {ch["title"]}</p>'
                  f'<h2 class="lhead-t" data-split>{title}</h2>{s}</header>')
            lessons += f'<article class="lesson" id="{sid}" data-lesson>{lh}{body}<div class="wrap narrow"><div class="quiz" data-quiz="{sid}"></div></div></article>'
            rooms += (f'<a class="room" href="#{sid}" style="--accent:{ch["accent"]}"><figure class="room-fig">{img_tag(rk, "room-img")}</figure>'
                      f'<div class="room-meta"><span class="room-n">{n:02d}</span><h3 class="room-t">{title}</h3><p class="room-s">Part {ch["num"]} · {ch["nav"]}</p>'
                      f'<span class="room-go">Read section <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></a>')
        pos = ch.get("pos", "50% 50%")
        hero = img_tag(ch["hero"], "op-img", extra=f'style="object-position:{pos};transform-origin:{pos}"')
        chapters += f'''
<section class="chapter" id="ch-{ch["id"]}" data-ch="{ch["id"]}" style="--accent:{ch["accent"]}">
  <div class="opener" data-s0="{ch.get("s0", 1.45)}" data-s1="{ch.get("s1", 1.0)}">
    <div class="op-media">{hero}<span class="op-dots" aria-hidden="true"></span></div>
    <div class="op-shade"></div>
    <div class="op-text wrap"><p class="op-eb"><span>Part {ch["num"]}</span></p><h2 class="op-title">{ch["title"]}</h2><p class="op-sub">{ch["sub"]}</p></div>
    <p class="op-cap wrap"><span class="cap-k">Photograph</span><span>{cap(ch["hero"])}</span></p>
  </div>
  <div class="paper">{lessons}</div>
</section>'''
    credits = "".join(f'<li><span class="cr-k">{i:02d}</span><span class="cr-c">{cap(k)}</span><span class="cr-l">{H.escape(v["license"])} · '
                      f'<a href="{H.escape(v["source"])}" target="_blank" rel="noopener">Wikimedia Commons</a></span></li>' for i, (k, v) in enumerate(CRED.items(), 1))
    nav = json.dumps([{"id": c["id"], "num": c["num"], "title": c["nav"], "full": c["title"], "accent": c["accent"],
                       "lessons": [[sid, t] for sid, t, *_ in c["lessons"]]} for c in CH], ensure_ascii=False)
    head = "".join(f'<span class="ln"><span class="w">{l}</span></span>' for l in META["headline"])
    strip = "".join(f'<span>{s}</span>' for s in META["strip"])
    rep = {"TITLE": META["title"], "DESC": META["desc"], "HEROKEY": META["hero"], "KEY": META["key"], "COURSE": META["course"],
           "LOADER": META.get("loader", "Going to press"), "EDITION": META["edition"], "SOURCES": META["sources"], "MAST": META["mast"],
           "STRIP": strip, "KICK": META["kick"], "DECK": META["deck"], "ROOMSTITLE": META["rooms_title"],
           "FONTS": META.get("fonts", "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=UnifrakturMaguntia&display=swap"),
           "HEADLINE": f'<h2 class="fp-head" aria-label="{H.escape(H.unescape(re.sub("<[^>]+>", "", " ".join(META["headline"]))))}">{head}</h2>',
           "HEROIMG": img_tag(META["hero"], "fp-img", eager=True), "HEROCAP": cap(META["hero"]),
           "ROOMS": rooms, "CHAPTERS": chapters, "CREDITS": credits, "NAV": nav}
    page = (ROOT / "shell.html").read_text(encoding="utf-8")
    for k, v in rep.items(): page = page.replace(f"%%{k}%%", v)
    assert "%%" not in page, "unfilled placeholder"
    bad = sorted({c for c in page if 0x1F000 <= ord(c) <= 0x1FFFF or 0x2600 <= ord(c) <= 0x27BF})
    assert not bad, f"emoji found: {bad}"
    (SITE / "index.html").write_text(page, encoding="utf-8")
    print("index.html", len(page), "bytes ·", n, "sections")

# ---------------------------------------------------------------- SQL project components (project-local)
_KW = r"SELECT|FROM|WHERE|AND|OR|NOT|AS|DISTINCT|ORDER|BY|ASC|DESC|IN|BETWEEN|LIKE|IS|NULL|VARCHAR|varchar"
_FN = r"UPPER|LOWER|LEN|LEFT|RIGHT|LTRIM|RTRIM|REPLACE|REPLICATE|SUBSTRING|CHARINDEX|ABS|POWER|CEILING|FLOOR|ROUND|GETDATE|DATEADD|DATEDIFF|DATENAME|DATEPART|CAST|CONVERT"
_TOK = re.compile(r"(?P<s>'[^'\n]*'|‘[^’\n]*’|’[^’\n]*’)|(?P<f>\b(?:" + _FN + r")\b)|(?P<k>\b(?:" + _KW + r")\b)|(?P<n>\b\d+(?:\.\d+)?\b)|(?P<p><[^<>\n]+>)", re.I)

def _hl(code):
    out, i = "", 0
    for m in _TOK.finditer(code):
        out += H.escape(code[i:m.start()])
        cls = {"s": "t-s", "f": "t-f", "k": "t-k", "n": "t-n", "p": "t-p"}[m.lastgroup]
        out += f'<span class="{cls}">{H.escape(m.group(0))}</span>' if cls else H.escape(m.group(0))
        i = m.end()
    return out + H.escape(code[i:])

def sql(code, label="Query"):
    """Highlighted SQL listing. code is verbatim; label is a small tab (Syntax / Query)."""
    return (f'<figure class="sql wrap narrow" data-rv><figcaption class="sql-k"><span class="sql-dot" aria-hidden="true"><i></i><i></i><i></i></span>{label}</figcaption>'
            f'<pre><code>{_hl(code.strip(chr(10)))}</code></pre></figure>')

def result(headers, rows, foot="", label="Result"):
    """Output grid. headers=[..], rows=[[..]], foot e.g. '(9 row(s) affected)'. Use '…' as a row for elision."""
    th = "".join(f"<th>{h}</th>" for h in headers)
    tr = ""
    for r in rows:
        if r == "…": tr += f'<tr class="el"><td colspan="{len(headers)}">…</td></tr>'
        else: tr += "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
    ft = f'<p class="rs-foot">{foot}</p>' if foot else ""
    return (f'<figure class="rs wrap narrow" data-rv><figcaption class="sql-k">{label}</figcaption>'
            f'<div class="rs-scroll"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>{ft}</figure>')

def optable(headers, rows, mono_first=True):
    """Reference table (operators, functions, dateparts)."""
    th = "".join(f"<th>{h}</th>" for h in headers)
    tr = "".join("<tr>" + "".join(f'<td{" class=mono" if (j == 0 and mono_first) else ""}>{c}</td>' for j, c in enumerate(r)) + "</tr>" for r in rows)
    return f'<div class="opt wrap narrow" data-rv><div class="rs-scroll"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div></div>'

def syn(items, intro="In the syntax:"):
    """'In the syntax:' glossary. items=[(token, meaning)]."""
    dl = "".join(f'<div class="syn-r"><dt><code>{H.escape(t)}</code></dt><dd>{d}</dd></div>' for t, d in items)
    k = f'<p class="syn-k">{intro}</p>' if intro else ""
    return f'<div class="syn wrap narrow" data-rv>{k}<dl>{dl}</dl></div>'

def bullets(items, intro=""):
    i = f'<p class="body-lg">{intro}</p>' if intro else ""
    return f'<div class="wrap narrow" data-rv>{i}<ul class="blist">' + "".join(f"<li>{x}</li>" for x in items) + "</ul></div>"

def h4(t):
    return f'<div class="wrap narrow"><h4 class="sub-h" data-rv>{t}</h4></div>'

def lab(kind, title):
    """Interactive lab placeholder, filled by js/sqllab.js. kind in distinct|like|round."""
    return (f'<div class="lab wrap narrow" data-lab="{kind}" data-rv><p class="lab-k"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/></svg>Try it · {title}</p><div class="lab-b"></div></div>')

# ---------------------------------------------------------------- visualisation + image-free layout (project-local)
def viz(kind, states, steps, caption="", **cfg):
    """Sticky animated stage + scroll steps. steps=[(title, sql_or_None, html)], states[i] drives step i (see js/viz.js)."""
    cfg["states"] = states
    data = json.dumps(cfg, ensure_ascii=False).replace("</", "<\\/")
    st = ""
    for i, (t, q, h) in enumerate(steps):
        tq = f'<template class="vz-sql">{_hl(q)}</template>' if q else ""
        body = f'<p class="vz-p">{h}</p>' if h else ""
        st += (f'<div class="vz-step" data-i="{i}" tabindex="0" role="button" aria-label="Show step {i+1}: {H.escape(re.sub("<[^>]+>", "", t))}">'
               f'<div class="vz-sh"><span class="vz-sn">{i+1:02d}</span><h4 class="vz-st">{t}</h4></div>{tq}{body}</div>')
    cap = f'<p class="vz-cap">{caption}</p>' if caption else ""
    return (f'<div class="vz wrap" data-viz="{kind}"><script type="application/json">{data}</script>'
            f'<div class="vz-stage"><div class="vz-bar"><span class="vz-k"><i></i>Visualisation</span><span class="vz-n">01 / {len(steps):02d}</span>'
            f'<span class="vz-ctl"><button type="button" class="vz-pv" aria-label="Previous step"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>'
            f'<button type="button" class="vz-re" aria-label="Replay step"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/></svg></button>'
            f'<button type="button" class="vz-nx" aria-label="Next step"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></span></div>'
            f'<pre class="vz-q"><code></code></pre><div class="vz-canvas" aria-hidden="true"></div>{cap}</div>'
            f'<div class="vz-steps">{st}</div></div>')

def pull(html):
    """Large pull quote for a key source sentence (no image)."""
    return f'<figure class="pull wrap narrow" data-rv><blockquote>{html}</blockquote></figure>'

def build(META, CH):
    chapters, rooms, n, nviz = "", "", 0, 0
    for ch in CH:
        lessons, lis = "", ""
        for sid, title, src, body, *_ in ch["lessons"]:
            n += 1; nviz += body.count('data-viz=')
            s = f'<p class="lhead-src">{src}</p>' if src else ""
            lh = (f'<header class="lhead wrap"><p class="lhead-eb"><span>Section {n:02d}</span> {ch["sub"]}</p>'
                  f'<h2 class="lhead-t">{title}</h2>{s}</header>')
            lessons += f'<article class="lesson" id="{sid}" data-lesson>{lh}{body}<div class="wrap narrow"><div class="quiz" data-quiz="{sid}"></div></div></article>'
            lis += f'<li><a href="#{sid}"><span>{n:02d}</span>{title}</a></li>'
            rooms += (f'<a class="tc" href="#{sid}" style="--accent:{ch["accent"]}"><span class="tc-n">{n:02d}</span>'
                      f'<span class="tc-p">{ch["sub"]}</span><h3 class="tc-t">{title}</h3>'
                      f'<span class="tc-go">Open <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>')
        chapters += f'''
<section class="chapter" id="ch-{ch["id"]}" data-ch="{ch["id"]}" style="--accent:{ch["accent"]}">
  <header class="opener2"><div class="wrap op2-in"><span class="op2-num" aria-hidden="true">{ch["num"]}</span>
    <div class="op2-txt"><p class="op2-eb">{ch["sub"]}</p><h2 class="op2-t">{ch["title"]}</h2><ol class="op2-l">{lis}</ol></div></div></header>
  <div class="paper">{lessons}</div>
</section>'''
    nav = json.dumps([{"id": c["id"], "num": c["num"], "title": c["nav"], "full": c["title"], "accent": c["accent"],
                       "lessons": [[sid, t] for sid, t, *_ in c["lessons"]]} for c in CH], ensure_ascii=False)
    q = sum(1 for _ in re.finditer(r"\{ q:", (SITE / "js" / "quiz.js").read_text(encoding="utf-8")))
    stats = "".join(f'<span><b>{v}</b>{k}</span>' for v, k in [(len(CH), "lessons"), (n, "sections"), (nviz, "visualisations"), (q, "exercises")])
    rep = {"TITLE": META["title"], "DESC": META["desc"], "KEY": META["key"], "COURSE": META["course"], "EDITION": META["edition"],
           "SOURCES": META["sources"], "DECK": META["deck"], "ROOMSTITLE": META["rooms_title"], "FONTS": META["fonts"],
           "HEADLINE": "<br>".join(META["headline"]), "STATS": stats, "ROOMS": rooms, "CHAPTERS": chapters, "NAV": nav}
    page = (ROOT / "shell.html").read_text(encoding="utf-8")
    for k, v in rep.items(): page = page.replace(f"%%{k}%%", v)
    assert "%%" not in page, "unfilled placeholder"
    assert "<img" not in page, "image found"
    bad = sorted({c for c in page if 0x1F000 <= ord(c) <= 0x1FFFF or 0x2600 <= ord(c) <= 0x27BF})
    assert not bad, f"emoji found: {bad}"
    (SITE / "index.html").write_text(page, encoding="utf-8")
    print("index.html", len(page), "bytes ·", n, "sections ·", nviz, "visualisations ·", q, "questions")
