/* viz.js: scroll-driven SQL visualisations.
   Each [data-viz] block = sticky stage (query bar + canvas) + steps. When a step reaches the reading line its state
   plays on the stage. Engines: blocks, table, line, like, venn, prec, flow, str, time, dparts, chips.
   All guards: missing GSAP or ScrollTrigger falls back to instant state changes via IntersectionObserver. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  if (!G) return;
  if (window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, p) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; };
  const ICON = { ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
                 no: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>' };
  const dur = (an, s) => (an && !RM) ? s : 0;
  const run = (tl, d) => { if (!d) tl.progress(1); return tl; };
  function swap(span, t, d) {
    t = String(t); if (span._t === t) return; span._t = t;
    if (!d) { G.killTweensOf(span); G.set(span, { yPercent: 0, autoAlpha: 1 }); span.textContent = t; return; }
    G.timeline().to(span, { yPercent: -90, autoAlpha: 0, duration: d * .3, ease: 'power2.in' }).add(() => { span.textContent = t; })
      .fromTo(span, { yPercent: 90, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: d * .4, ease: 'power3.out' });
  }
  const ENG = {};
  const edge = (x, W) => x > W - 110 ? -100 : x < 110 ? 0 : -50;   // keep chips inside the canvas

  /* ------------------------------------------------------------ blocks: selection / projection / join */
  ENG.blocks = (cv) => {
    const K1 = ['a', 'b', 'a', 'c', 'b', 'c'], K2 = ['a', 'b', 'c'];
    const box = cv.appendChild(mk('div', 'vb'));
    const svg = sv('svg', { class: 'vb-svg' }, box);
    const t1 = [], t2 = [], cl = [], links = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) t1.push({ r, c, e: box.appendChild(mk('div', 'vb-k' + (c === 4 ? ' key k-' + K1[r] : ''))) });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) t2.push({ r, c, e: box.appendChild(mk('div', 'vb-k t2' + (c === 0 ? ' key k-' + K2[r] : ''))) });
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) cl.push({ r, c, src: K2.indexOf(K1[r]), e: box.appendChild(mk('div', 'vb-k t2 cl' + (c === 0 ? ' key k-' + K1[r] : ''))) });
    for (let r = 0; r < 6; r++) links.push(sv('path', { class: 'vb-ln k-' + K1[r] }, svg));
    const L1 = box.appendChild(mk('div', 'vb-l', 'Table 1')), L2 = box.appendChild(mk('div', 'vb-l', 'Table 2'));
    let tl;
    return { go(st, an) {
      const d = dur(an, 1); if (tl) tl.kill(); G.killTweensOf(box.querySelectorAll('*'));
      const W = cv.clientWidth, b = Math.max(14, Math.min(34, Math.floor((W - 16) / 13.6))), gap = Math.round(b * .6), y0 = 8;
      box.style.height = (y0 + 6 * b + 40) + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', y0 + 6 * b + 40);
      const RX = 5 * b + gap * 2, T2X = 9 * b + gap;
      const P1 = o => ({ x: o.c * b, y: y0 + o.r * b }), P2 = o => ({ x: T2X + o.c * b, y: y0 + o.r * b });
      const base = { width: b - 2, height: b - 2 };
      tl = G.timeline();
      t1.forEach(o => { o.e.classList.remove('on', 'dim'); G.set(o.e, { ...base, ...P1(o), autoAlpha: 1 }); });
      const showT2 = st.mode === 'join';
      t2.forEach(o => { o.e.classList.remove('on', 'dim'); G.set(o.e, { ...base, ...P2(o), autoAlpha: showT2 ? 1 : 0 }); });
      cl.forEach(o => G.set(o.e, { ...base, ...P2({ r: o.src, c: o.c }), autoAlpha: 0 }));
      links.forEach(p => G.set(p, { autoAlpha: 0 }));
      G.set(L1, { x: 0, y: y0 + 6 * b + 10, width: 5 * b }); G.set(L2, { x: T2X, y: y0 + 3 * b + 10, width: 4 * b, autoAlpha: showT2 ? 1 : 0 });
      if (st.mode === 'sel') {
        const pick = [1, 4];
        tl.add(() => t1.forEach(o => o.e.classList.toggle('on', pick.includes(o.r))), .1)
          .add(() => t1.forEach(o => o.e.classList.toggle('dim', !pick.includes(o.r))), .5);
        pick.forEach((r, k) => tl.to(t1.filter(o => o.r === r).map(o => o.e), { x: (i, el) => RX + t1.find(o => o.e === el).c * b, y: y0 + (k + 2) * b, duration: .9, ease: 'power3.inOut', stagger: .03 }, .9 + k * .25));
      } else if (st.mode === 'proj') {
        const pick = [1, 3];
        tl.add(() => t1.forEach(o => o.e.classList.toggle('on', pick.includes(o.c))), .1)
          .add(() => t1.forEach(o => o.e.classList.toggle('dim', !pick.includes(o.c))), .5);
        pick.forEach((c, k) => tl.to(t1.filter(o => o.c === c).map(o => o.e), { x: RX + (k + 1.5) * b, duration: .9, ease: 'power3.inOut', stagger: .03 }, .9 + k * .25));
      } else {
        tl.add(() => { t1.forEach(o => o.e.classList.toggle('on', o.c === 4)); t2.forEach(o => o.e.classList.toggle('on', o.c === 0)); }, .1);
        links.forEach((p, r) => {
          const x1 = 5 * b - 2, y1 = y0 + r * b + b / 2, src = K2.indexOf(K1[r]), x2 = T2X, y2 = y0 + src * b + b / 2, mx = (x1 + x2) / 2;
          p.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
          const L = p.getTotalLength ? p.getTotalLength() : 200;
          tl.fromTo(p, { autoAlpha: 1, strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .6, ease: 'power2.out' }, .4 + r * .1);
        });
        tl.to(links, { autoAlpha: 0, duration: .4 }, 1.7);
        cl.forEach(o => tl.to(o.e, { autoAlpha: 1, duration: .01 }, 1.6 + o.r * .12)
          .to(o.e, { x: 5 * b + o.c * b, y: y0 + o.r * b, duration: .8, ease: 'power3.inOut' }, 1.6 + o.r * .12));
        tl.add(() => t2.forEach(o => o.e.classList.add('dim')), 1.7);
      }
      run(tl, d);
    } };
  };

  /* ------------------------------------------------------------ table: projection, filtering, sorting, merging, computing */
  ENG.table = (cv, cfg) => {
    const cols = cfg.cols, rows = cfg.rows, colOf = k => cols.find(c => c.k === k);
    const box = cv.appendChild(mk('div', 'vt'));
    const H = {}, C = {}, BG = {}, M = {};
    const sp = t => { const s = mk('span'); s.textContent = t; s._t = String(t); return s; };
    rows.forEach(r => { BG[r.id] = box.appendChild(mk('div', 'vt-bg')); });
    cols.forEach(c => { const h = mk('div', 'vt-h'); h.appendChild(sp(c.label)); box.appendChild(h); H[c.k] = h; });
    rows.forEach(r => {
      cols.forEach(c => { const e = mk('div', 'vt-c' + (c.num ? ' num' : '')); e.appendChild(sp(r[c.k] == null ? '' : r[c.k])); box.appendChild(e); C[r.id + '|' + c.k] = e; });
      M[r.id] = box.appendChild(mk('div', 'vt-m'));
    });
    const scan = box.appendChild(mk('div', 'vt-scan'));
    return { go(st, an) {
      G.killTweensOf(Array.from(box.children));
      const d = dur(an, .9), W = cv.clientWidth, sm = W < 560, rh = sm ? 29 : 36, hh = rh + 6, mw = sm ? 30 : 40, ease = 'power3.inOut';
      box.style.height = (hh + rows.length * rh) + 'px'; box.classList.toggle('sm', sm);
      const vis = st.cols, tw = vis.reduce((a, k) => a + colOf(k).w, 0), avail = W - mw;
      const X = {}, WD = {}; let x = 0; vis.forEach(k => { WD[k] = avail * colOf(k).w / tw; X[k] = x; x += WD[k]; });
      const order = st.order || rows.map(r => r.id), hide = new Set(st.hide || []), merge = st.merge || {};
      const shown = order.filter(id => !hide.has(id) && !merge[id]); const Y = {}; shown.forEach((id, i) => { Y[id] = hh + i * rh; });
      const hl = new Set(st.hl || []), dim = new Set(st.dim || []), hlc = new Set(st.hlc || []), bad = new Set(st.bad || []);
      const mark = st.mark || {}, badge = st.badge || {}, txt = st.txt || {};
      const step = d ? Math.min(.16, 1.5 / Math.max(shown.length, 1)) : 0;
      cols.forEach(c => {
        const h = H[c.k], on = vis.includes(c.k);
        if (on && h._x == null) G.set(h, { x: X[c.k], width: WD[c.k], height: hh, autoAlpha: 0 });
        if (on) { h._x = X[c.k]; h._w = WD[c.k]; }
        G.to(h, { x: h._x || 0, width: h._w || 0, height: hh, autoAlpha: on ? 1 : 0, duration: d, ease });
        h.classList.toggle('hl', hlc.has(c.k)); swap(h.firstChild, (st.head && st.head[c.k]) || c.label, d);
      });
      rows.forEach(r => {
        const id = r.id, inR = id in Y, tgt = merge[id];
        const y = inR ? Y[id] : tgt ? (Y[tgt] != null ? Y[tgt] : hh) : (BG[id]._y != null ? BG[id]._y : hh); BG[id]._y = y;
        const dx = inR || tgt ? 0 : -28, ri = inR ? shown.indexOf(id) : 0;
        const move = (el, vars, alpha, delay = 0) => {
          if (tgt && d) { G.to(el, { ...vars, autoAlpha: 1, duration: d, ease, delay }); G.to(el, { autoAlpha: 0, duration: d * .45, delay: delay + d * .95 }); }
          else G.to(el, { ...vars, autoAlpha: tgt ? 0 : alpha, duration: d, ease, delay });
        };
        const bg = BG[id]; bg.classList.toggle('hl', hl.has(id)); bg.classList.toggle('dim', dim.has(id));
        if (!bg._init) { bg._init = 1; G.set(bg, { x: dx, y, width: avail, height: rh, autoAlpha: 0 }); }
        move(bg, { x: dx, y, width: avail, height: rh }, inR ? 1 : 0);
        cols.forEach(c => {
          const e = C[id + '|' + c.k], on = vis.includes(c.k);
          if (on && e._x == null) G.set(e, { x: X[c.k] + dx, y, width: WD[c.k], height: rh, autoAlpha: 0 });
          if (on) { e._x = X[c.k]; e._w = WD[c.k]; }
          const vars = { x: (e._x || 0) + dx, y, width: e._w || 0, height: rh };
          const sd = (st.stag === c.k && d) ? ri * step : 0;
          if (!on) G.to(e, { ...vars, autoAlpha: 0, duration: d, ease }); else move(e, vars, inR ? 1 : 0, sd);
          e.classList.toggle('hlc', hlc.has(c.k)); e.classList.toggle('bad', bad.has(id + '|' + c.k));
          const t = txt[id + '|' + c.k] != null ? txt[id + '|' + c.k] : (r[c.k] == null ? '' : r[c.k]);
          if (sd) G.delayedCall(sd + d * .3, () => swap(e.firstChild, t, d)); else swap(e.firstChild, t, d);
        });
        const m = M[id], mv = mark[id] || '', bv = badge[id] || '';
        const html = mv ? ICON[mv] : (bv ? '<b>' + esc(bv) + '</b>' : '');
        const delay = st.scan ? ri * step : 0;
        if (m._h !== html) { m._h = html; m.innerHTML = html; m.className = 'vt-m ' + mv; if (d) G.set(m, { autoAlpha: 0 }); }
        G.to(m, { x: avail + 3, y, width: mw - 6, height: rh, autoAlpha: (html && (inR || (tgt && d))) ? 1 : 0, duration: d * .45, delay: delay + d * .15 });
      });
      if (st.scan && d) G.fromTo(scan, { x: 0, y: hh, width: avail, autoAlpha: 1 }, { y: hh + shown.length * rh, duration: shown.length * step, ease: 'none', onComplete: () => G.to(scan, { autoAlpha: 0, duration: .3 }) });
      else G.set(scan, { autoAlpha: 0 });
    } };
  };

  /* ------------------------------------------------------------ line: number line for comparisons and numeric functions */
  ENG.line = (cv, cfg) => {
    const box = cv.appendChild(mk('div', 'vl'));
    const svg = sv('svg', { class: 'vl-svg' }, box);
    const axis = box.appendChild(mk('div', 'vl-axis'));
    const band = box.appendChild(mk('div', 'vl-band', '<span></span>'));
    const pts = (cfg.points || []).map(p => ({ p, e: box.appendChild(mk('div', 'vl-p', `<b></b><i></i><span>${esc(p.label)}</span>`)) }));
    let tmp = [];
    const fmt = v => (Math.abs(v) >= 1000 || Number.isInteger(v)) ? String(v) : String(+v.toFixed(2));
    function lanes(items, W) { const L = []; items.sort((a, b) => a.x - b.x).forEach(it => { const w = it.w; let k = 0; while (L[k] != null && L[k] > it.x - w / 2 - 6) k++; L[k] = it.x + w / 2; it.lane = k; }); return items; }
    return { go(st, an) {
      const d = dur(an, 1), W = cv.clientWidth, sm = W < 560, AY = sm ? 150 : 170, Hh = AY + 96;
      box.style.height = Hh + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', Hh);
      const X = v => 18 + (v - st.min) / (st.max - st.min) * (W - 36);
      tmp.forEach(e => G.to(e, { autoAlpha: 0, duration: d * .3, onComplete: () => e.remove() })); tmp = [];
      G.set(axis, { x: 18, y: AY, width: W - 36 });
      const nt = Math.round((st.max - st.min) / st.tick), every = Math.ceil((nt + 1) / (sm ? 6 : 11));
      for (let k = 0; k <= nt; k++) {
        const v = +(st.min + k * st.tick).toFixed(4), t = box.appendChild(mk('div', 'vl-t' + (k % every ? ' minor' : ''), k % every ? '' : `<span>${fmt(v)}</span>`));
        G.set(t, { x: X(v), y: AY, autoAlpha: 0 }); G.to(t, { autoAlpha: 1, duration: d * .5, delay: d * .3 }); tmp.push(t);
      }
      const on = p => st.gt != null ? p.v > st.gt : st.between ? (p.v >= st.between[0] && p.v <= st.between[1]) : false;
      const vis = st.points !== false;
      const items = lanes(pts.map(o => ({ o, x: X(o.p.v), w: o.p.label.length * (sm ? 6.2 : 7) + 16 })), W);
      items.forEach(it => {
        const ly = AY - 30 - it.lane * (sm ? 21 : 24), lit = on(it.o.p);
        it.o.e.classList.toggle('on', lit); it.o.e.classList.toggle('off', (st.gt != null || !!st.between) && !lit);
        G.to(it.o.e, { x: it.x, autoAlpha: vis ? 1 : 0, duration: d, ease: 'power3.inOut' });
        G.to(it.o.e.querySelector('span'), { y: ly, duration: d, ease: 'power3.inOut' });
        G.to(it.o.e.querySelector('i'), { y: ly + 20, height: Math.max(0, AY - ly - 20), duration: d, ease: 'power3.inOut' });
        G.set(it.o.e.querySelector('b'), { y: AY - 5 });
      });
      if (st.between || st.gt != null) {
        const a = st.between ? st.between[0] : st.gt, b2 = st.between ? st.between[1] : st.max;
        band.classList.toggle('open', st.gt != null);
        band.querySelector('span').textContent = st.band || '';
        G.to(band, { x: X(a), y: AY - 12, width: X(b2) - X(a), autoAlpha: 1, duration: d, ease: 'power3.inOut' });
      } else G.to(band, { autoAlpha: 0, duration: d * .4 });
      (st.pairs || []).forEach((pr, n) => {
        const xm = X(pr.v), m = box.appendChild(mk('div', 'vl-mk', `<span>${esc(pr.label)}</span>`));
        G.set(m, { x: xm, y: AY, autoAlpha: 0 }); G.set(m.querySelector('span'), { xPercent: edge(xm, W) }); G.to(m, { autoAlpha: 1, duration: d * .4, delay: d * .2 }); tmp.push(m);
        const tg = lanes(pr.to.map(t => ({ t, x: X(t.v), w: t.label.length * (sm ? 6.4 : 7.4) + 18 })), W);
        tg.forEach((it, k) => {
          const e = box.appendChild(mk('div', 'vl-tg', `<b></b><span>${esc(it.t.label)}</span>`)); tmp.push(e);
          G.set(e, { x: it.x, y: AY, autoAlpha: 0 }); G.set(e.querySelector('span'), { y: 22 + it.lane * 26, xPercent: edge(it.x, W) });
          const p = sv('path', { class: 'vl-arc', d: `M${xm},${AY - 6} Q${(xm + it.x) / 2},${AY - 70 - k * 14} ${it.x},${AY - 6}` }, svg); tmp.push(p);
          const L = p.getTotalLength ? p.getTotalLength() : 200, t0 = d * (.5 + k * .45);
          G.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d * .7, ease: 'power2.inOut', delay: t0 });
          G.to(e, { autoAlpha: 1, duration: d * .4, delay: t0 + d * .5 });
        });
      });
    } };
  };

  /* ------------------------------------------------------------ like: wildcard pattern matcher */
  ENG.like = (cv, cfg) => {
    const box = cv.appendChild(mk('div', 'vk'));
    const pat = box.appendChild(mk('div', 'vk-pat'));
    const list = box.appendChild(mk('div', 'vk-list'));
    const rows = cfg.names.map(n => { const r = list.appendChild(mk('div', 'vk-row')); const t = [...n].map((ch, i) => { const e = mk('span', 'vk-t', esc(ch)); e.style.setProperty('--i', i); r.appendChild(e); return e; }); const m = r.appendChild(mk('span', 'vk-m')); return { n, r, t, m }; });
    return { go(st, an) {
      box.classList.toggle('still', !an || RM);
      const p = st.p, toks = p.match(/%|_|[^%_]+/g) || [];
      pat.innerHTML = '<span class="vk-pl">LIKE</span>' + toks.map(t => t === '%' ? '<span class="vk-pt any">%<small>zero or many</small></span>' : t === '_' ? '<span class="vk-pt one">_<small>one</small></span>' : [...t].map(ch => `<span class="vk-pt lit">${esc(ch)}</span>`).join('')).join('');
      const re = new RegExp('^' + toks.map(t => t === '%' ? '(.*?)' : t === '_' ? '(.)' : '(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')').join('') + '$', 'i');
      rows.forEach((o, ri) => {
        const m = re.exec(o.n); o.t.forEach(e => e.className = 'vk-t');
        if (m) { let pos = 0; toks.forEach((t, k) => { const g = m[k + 1]; for (let j = 0; j < g.length; j++) o.t[pos + j].classList.add(t === '%' ? 'any' : t === '_' ? 'one' : 'lit'); pos += g.length; }); }
        o.r.classList.toggle('hit', !!m); o.r.classList.toggle('miss', !m); o.r.style.setProperty('--r', ri);
        o.m.innerHTML = m ? ICON.ok : ICON.no;
      });
    } };
  };

  /* ------------------------------------------------------------ venn: AND / OR / NOT */
  ENG.venn = (cv, cfg) => {
    const box = cv.appendChild(mk('div', 'vv')), id = 'vv' + Math.random().toString(36).slice(2, 8);
    const svg = sv('svg', { class: 'vv-svg' }, box), defs = sv('defs', {}, svg);
    const mA = sv('mask', { id: id + 'nA' }, defs), mB = sv('mask', { id: id + 'nB' }, defs), cA = sv('clipPath', { id: id + 'cA' }, defs);
    const mAr = sv('rect', { fill: '#fff' }, mA), mAc = sv('circle', { fill: '#000' }, mA), mBr = sv('rect', { fill: '#fff' }, mB), mBc = sv('circle', { fill: '#000' }, mB), cAc = sv('circle', {}, cA);
    const rOut = sv('rect', { class: 'vv-r out', mask: `url(#${id}nA)` }, svg), rA = sv('circle', { class: 'vv-r a', mask: `url(#${id}nB)` }, svg);
    const rB = sv('circle', { class: 'vv-r b', mask: `url(#${id}nA)` }, svg), rAB = sv('circle', { class: 'vv-r ab', 'clip-path': `url(#${id}cA)` }, svg);
    const oA = sv('circle', { class: 'vv-o' }, svg), oB = sv('circle', { class: 'vv-o' }, svg);
    const la = box.appendChild(mk('div', 'vv-l', esc(cfg.la))), lb = box.appendChild(mk('div', 'vv-l', esc(cfg.lb)));
    const chips = cfg.people.map(p => ({ p, e: box.appendChild(mk('div', 'vv-c', esc(p.n))) }));
    return { go(st, an) {
      const d = dur(an, .8), W = cv.clientWidth, sm = W < 560, r = Math.min(W * .24, 118), cy = r + 40, H = 2 * r + 96, ax = W / 2 - r * .62, bx = W / 2 + r * .62;
      box.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H);
      [mAr, mBr, rOut].forEach(e => { e.setAttribute('width', W); e.setAttribute('height', H); });
      [[mAc, ax], [mBc, bx], [cAc, ax], [rA, ax], [rB, bx], [rAB, bx], [oA, ax], [oB, bx]].forEach(([e, x]) => { e.setAttribute('cx', x); e.setAttribute('cy', cy); e.setAttribute('r', r); });
      G.set(la, { x: ax - r, y: 4, width: r * 1.3 }); G.set(lb, { x: bx - r * .3, y: 4, width: r * 1.3 });
      const sel = st.sel, inSel = p => sel === 'and' ? p.a && p.b : sel === 'or' ? p.a || p.b : sel === 'not' ? !p.a : false;
      const regions = { and: ['ab'], or: ['a', 'ab', 'b'], not: ['out'] }[sel] || [];
      [[rOut, 'out'], [rA, 'a'], [rB, 'b'], [rAB, 'ab']].forEach(([e, k]) => e.classList.toggle('on', regions.includes(k) || (k === 'b' && regions.includes('out'))));
      const groups = { a: [], ab: [], b: [], n: [] };
      chips.forEach(o => groups[o.p.a && o.p.b ? 'ab' : o.p.a ? 'a' : o.p.b ? 'b' : 'n'].push(o));
      const gx = { a: ax - r * .5, ab: W / 2, b: bx + r * .5 }, cw = sm ? 74 : 92;
      Object.entries(groups).forEach(([g, arr]) => arr.forEach((o, k) => {
        let x, y;
        if (g === 'n') { x = k === 0 ? Math.max(cw / 2 + 2, ax - r * .9) : Math.min(W - cw / 2 - 2, bx + r * .9); y = cy + r + 28; }
        else { x = gx[g]; y = cy + (k - (arr.length - 1) / 2) * (sm ? 26 : 30); }
        const lit = inSel(o.p);
        o.e.classList.toggle('on', lit); o.e.classList.toggle('off', !!sel && !lit);
        G.to(o.e, { x: x - cw / 2, y: y - 12, width: cw, duration: d, ease: 'power3.inOut', delay: lit && d ? .15 + k * .08 : 0 });
      }));
    } };
  };

  /* ------------------------------------------------------------ prec: rules of precedence with brackets */
  ENG.prec = (cv, cfg) => {
    const box = cv.appendChild(mk('div', 'vp'));
    const line = box.appendChild(mk('div', 'vp-line'));
    const toks = cfg.tokens.map(t => line.appendChild(mk('span', 'vp-t ' + t.k, esc(t.t))));
    const gl = box.appendChild(mk('div', 'vp-groups'));
    const res = box.appendChild(mk('div', 'vp-res'));
    const chips = cfg.people.map(n => res.appendChild(mk('span', 'vp-c', esc(n))));
    return { go(st, an) {
      const d = dur(an, .7);
      toks.forEach((e, i) => e.classList.toggle('gone', cfg.tokens[i].k === 'p' && !st.paren));
      gl.innerHTML = '';
      requestAnimationFrame(() => {
        const R = box.getBoundingClientRect(), gs = st.groups || [];
        gs.forEach(([a, b, lbl], gi) => {
          const ra = toks[a].getBoundingClientRect(), rb = toks[b].getBoundingClientRect();
          const depth = gs.filter(([a2, b2], j) => j !== gi && a2 <= a && b2 >= b && (b2 - a2) > (b - a)).length;
          const outer = gs.filter(([a2, b2], j) => j !== gi && a2 >= a && b2 <= b && (b2 - a2) < (b - a)).length;
          const pad = 6 + outer * 9;
          const top = Math.min(ra.top, rb.top) - R.top - pad, bot = Math.max(ra.bottom, rb.bottom) - R.top + pad;
          const lft = Math.min(ra.left, rb.left) - R.left - pad, rgt = Math.max(ra.right, rb.right) - R.left + pad;
          const g = gl.appendChild(mk('div', 'vp-g', `<b>${esc(lbl)}</b>`));
          G.set(g, { x: lft, y: top, width: rgt - lft, height: bot - top, autoAlpha: 0, scale: .96 });
          G.to(g, { autoAlpha: 1, scale: 1, duration: d * .8, delay: d * (.2 + gi * .7), ease: 'power3.out' });
        });
      });
      const pass = new Set(st.pass || []);
      chips.forEach((c, i) => { c.classList.toggle('on', pass.has(cfg.people[i])); c.classList.toggle('off', !!st.pass && !pass.has(cfg.people[i])); c.style.transitionDelay = (d ? .9 + i * .05 : 0) + 's'; });
    } };
  };

  /* ------------------------------------------------------------ flow: single-row vs multiple-row functions */
  ENG.flow = (cv, cfg) => {
    const box = cv.appendChild(mk('div', 'vf'));
    const ins = cfg.ins.map(t => box.appendChild(mk('div', 'vf-c in', esc(t))));
    const fn = box.appendChild(mk('div', 'vf-fn', '<span></span>'));
    let tmp = [], tl;
    return { go(st, an) {
      const d = dur(an, 1); if (tl) tl.kill(); tmp.forEach(e => e.remove()); tmp = [];
      const W = cv.clientWidth, n = ins.length, rh = 46, H = n * rh + 10, cw = W * .27, fw = W * .26, fx = W * .37, fy = H / 2 - 40;
      box.style.height = H + 'px';
      ins.forEach((e, k) => G.set(e, { x: 0, y: 5 + k * rh, width: cw, autoAlpha: 1 }));
      G.set(fn, { x: fx, y: fy, width: fw, height: 80 }); fn.firstChild.textContent = st.fn;
      tl = G.timeline();
      const outX = W - cw;
      if (st.mode === 'single') {
        ins.forEach((e, k) => {
          const tr = box.appendChild(mk('div', 'vf-c tr', e.innerHTML)), out = box.appendChild(mk('div', 'vf-c out', esc(cfg.outs[k]))); tmp.push(tr, out);
          G.set(tr, { x: 0, y: 5 + k * rh, width: cw, autoAlpha: 0 }); G.set(out, { x: fx + fw / 2 - cw / 2, y: fy + 20, width: cw, autoAlpha: 0, scale: .8 });
          const t0 = .2 + k * .55;
          tl.set(tr, { autoAlpha: 1 }, t0).to(tr, { x: fx + fw / 2 - cw / 2, y: fy + 20, scale: .7, duration: .45, ease: 'power2.in' }, t0)
            .set(tr, { autoAlpha: 0 }, t0 + .45).add(() => fn.classList.add('pulse'), t0 + .4).add(() => fn.classList.remove('pulse'), t0 + .7)
            .set(out, { autoAlpha: 1 }, t0 + .45).to(out, { x: outX, y: 5 + k * rh, scale: 1, duration: .5, ease: 'power3.out' }, t0 + .45);
        });
      } else {
        const out = box.appendChild(mk('div', 'vf-c out one', esc(st.out))); tmp.push(out);
        G.set(out, { x: fx + fw / 2 - cw / 2, y: fy + 20, width: cw, autoAlpha: 0, scale: .8 });
        ins.forEach((e, k) => { const tr = box.appendChild(mk('div', 'vf-c tr', e.innerHTML)); tmp.push(tr); G.set(tr, { x: 0, y: 5 + k * rh, width: cw, autoAlpha: 0 });
          tl.set(tr, { autoAlpha: 1 }, .2).to(tr, { x: fx + fw / 2 - cw / 2, y: fy + 20, scale: .7, duration: .6, ease: 'power2.in' }, .2 + k * .06).set(tr, { autoAlpha: 0 }, .85 + k * .06); });
        tl.add(() => fn.classList.add('pulse'), .8).add(() => fn.classList.remove('pulse'), 1.2)
          .set(out, { autoAlpha: 1 }, 1.1).to(out, { x: outX, y: H / 2 - 18, scale: 1, duration: .6, ease: 'power3.out' }, 1.1);
      }
      run(tl, d);
    } };
  };

  /* ------------------------------------------------------------ str: letter tiles for string functions */
  ENG.str = (cv) => {
    const box = cv.appendChild(mk('div', 'vs'));
    let tl;
    const tiles = (row, s, cls = '') => [...s].map((ch, i) => { const e = mk('span', 'vs-t ' + cls + (ch === ' ' ? ' blank' : ''), ch === ' ' ? '' : esc(ch)); e.dataset.i = i + 1; row.appendChild(e); return e; });
    return { go(st, an) {
      const d = dur(an, 1); if (tl) tl.kill(); box.innerHTML = '';
      const W = cv.clientWidth, len = Math.max(st.s.length, (st.out || '').length, st.mode === 'rep' ? st.s.length * 2 : 0);
      const s = Math.max(11, Math.min(34, Math.floor((W - 8) / len) - 3)); box.style.setProperty('--s', s + 'px');
      const lbl = box.appendChild(mk('div', 'vs-l', esc(st.fn)));
      const inRow = box.appendChild(mk('div', 'vs-row in')), T = tiles(inRow, st.s);
      const idx = box.appendChild(mk('div', 'vs-row idx')); T.forEach((t, i) => idx.appendChild(mk('span', 'vs-n', String(i + 1))));
      const arrow = box.appendChild(mk('div', 'vs-arrow', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15M6 13l6 6 6-6"/></svg>'));
      const outRow = box.appendChild(mk('div', 'vs-row out'));
      tl = G.timeline();
      tl.from(T, { y: -16, autoAlpha: 0, duration: .35, stagger: .025, ease: 'power2.out' }, 0);
      const showOut = (at, cls = '') => { const O = tiles(outRow, st.out, cls); tl.from(O, { y: -24, autoAlpha: 0, duration: .4, stagger: .04, ease: 'power3.out' }, at); return O; };
      const N = idx.children;
      G.set(N, { autoAlpha: 0 }); G.set(arrow, { autoAlpha: 0 });
      tl.to(arrow, { autoAlpha: 1, duration: .3 }, .5);
      if (st.mode === 'case') {
        T.forEach((t, i) => tl.to(t, { rotationX: 90, duration: .12 }, .6 + i * .07).add(() => { t.textContent = st.out[i]; t.classList.add('on'); }).to(t, { rotationX: 0, duration: .12 }));
        showOut(.9 + T.length * .07);
      } else if (st.mode === 'len') {
        Array.from(N).forEach((n, i) => tl.to(n, { autoAlpha: 1, duration: .1 }, .6 + i * .08).add(() => T[i].classList.add('on'), '<'));
        const o = outRow.appendChild(mk('span', 'vs-big', esc(st.out))); tl.from(o, { scale: .5, autoAlpha: 0, duration: .5, ease: 'back.out(2)' }, .8 + T.length * .08);
      } else if (st.mode === 'pick') {
        const [a, n] = st.pick; tl.to(N, { autoAlpha: 1, duration: .3 }, .4);
        T.forEach((t, i) => { const inside = i >= a && i < a + n; tl.add(() => t.classList.add(inside ? 'on' : 'dim'), .7 + (inside ? (i - a) * .08 : 0)); });
        showOut(1.2 + n * .08, 'on');
      } else if (st.mode === 'trim') {
        T.forEach((t, i) => { if (st.drop.includes(i)) tl.add(() => t.classList.add('cut'), .6).to(t, { y: 30, autoAlpha: 0, rotation: 12, duration: .5, ease: 'power2.in' }, .7 + i * .04); else tl.add(() => t.classList.add('on'), .6); });
        showOut(1.5);
      } else if (st.mode === 'replace') {
        const hits = []; let k = st.s.indexOf(st.find); while (k >= 0) { hits.push(k); k = st.s.indexOf(st.find, k + st.find.length); }
        hits.forEach((h, j) => { for (let q = 0; q < st.find.length; q++) { const t = T[h + q]; tl.add(() => t.classList.add('hit'), .6 + j * .5 + q * .06).to(t, { rotationX: 90, duration: .12 }, 1 + j * .5 + q * .06).add(() => { t.textContent = st.rep[q]; t.classList.remove('hit'); t.classList.add('on'); }).to(t, { rotationX: 0, duration: .12 }); } });
        showOut(1.4 + hits.length * .5);
      } else if (st.mode === 'rep') {
        T.forEach(t => t.classList.add('on'));
        const O = showOut(.7, 'on'); O.forEach((t, i) => { if (i >= st.s.length) t.classList.add('copy'); });
      } else if (st.mode === 'find') {
        tl.to(N, { autoAlpha: 1, duration: .3 }, .4);
        const ptr = inRow.appendChild(mk('span', 'vs-ptr')); const pos = st.s.toLowerCase().indexOf(st.find.toLowerCase());
        G.set(ptr, { width: st.find.length * (s + 3) - 3, x: 0, autoAlpha: 0 });
        tl.to(ptr, { autoAlpha: 1, duration: .2 }, .6);
        for (let i = 0; i <= pos; i++) tl.to(ptr, { x: i * (s + 3), duration: .22, ease: 'power2.inOut' }, .7 + i * .3);
        tl.add(() => { for (let q = 0; q < st.find.length; q++) T[pos + q].classList.add('on'); N[pos].classList.add('on'); }, .8 + pos * .3);
        const o = outRow.appendChild(mk('span', 'vs-big', esc(st.out))); tl.from(o, { scale: .5, autoAlpha: 0, duration: .5, ease: 'back.out(2)' }, 1 + pos * .3);
      }
      run(tl, d);
    } };
  };

  /* ------------------------------------------------------------ time: DATEADD / DATEDIFF on a timeline */
  ENG.time = (cv) => {
    const box = cv.appendChild(mk('div', 'vtm'));
    const svg = sv('svg', { class: 'vl-svg' }, box);
    let tmp = [], tl;
    const P = s => { const [y, m, dd] = s.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
    const now = new Date(), TODAY = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const iso = t => new Date(t).toISOString().slice(0, 10);
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { go(st, an) {
      const d = dur(an, 1); if (tl) tl.kill(); tmp.forEach(e => e.remove()); tmp = []; svg.innerHTML = '';
      const W = cv.clientWidth, sm = W < 560, AY = 130, H = 240; box.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H);
      const a = P(st.from), b = st.to === 'today' ? TODAY + 200 * 864e5 : P(st.to), X = t => 18 + (t - a) / (b - a) * (W - 36);
      const add = e => { box.appendChild(e); tmp.push(e); return e; };
      const ax = add(mk('div', 'vl-axis')); G.set(ax, { x: 18, y: AY, width: W - 36 });
      tl = G.timeline();
      const ticks = [];
      const D0 = new Date(a);
      if (st.unit === 'd') { for (let t = a; t <= b; t += 864e5) ticks.push([t, new Date(t).getUTCDate()]); }
      else if (st.unit === 'm') { let y = D0.getUTCFullYear(), m = D0.getUTCMonth() + 1; for (;;) { if (m > 11) { m = 0; y++; } const t = Date.UTC(y, m, 1); if (t > b) break; ticks.push([t, MON[m] + (m === 0 || ticks.length === 0 ? ' ' + y : '')]); m++; } }
      else { for (let y = D0.getUTCFullYear() + 1; Date.UTC(y, 0, 1) <= b; y++) ticks.push([Date.UTC(y, 0, 1), String(y)]); }
      const every = Math.ceil(ticks.length / (sm ? 6 : 12));
      ticks.forEach(([t, l], k) => { const e = add(mk('div', 'vl-t' + (k % every ? ' minor' : ''), k % every ? '' : `<span>${l}</span>`)); G.set(e, { x: X(t), y: AY }); tl.from(e, { autoAlpha: 0, duration: .3 }, k * .01); });
      const base = P(st.base), bm = add(mk('div', 'vl-mk', `<span>${st.base}</span>`)); G.set(bm, { x: X(base), y: AY }); G.set(bm.querySelector('span'), { xPercent: edge(X(base), W) }); tl.from(bm, { autoAlpha: 0, duration: .4 }, .2);
      if (st.add) {
        const to = P(st.add.to), x1 = X(base), x2 = X(to);
        const p = sv('path', { class: 'vl-arc', d: `M${x1},${AY - 6} Q${(x1 + x2) / 2},${AY - 80} ${x2},${AY - 6}` }, svg);
        const L = p.getTotalLength ? p.getTotalLength() : 200;
        tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' }, .5);
        const lab = add(mk('div', 'vtm-lab', esc(st.add.label))); G.set(lab, { x: (x1 + x2) / 2, y: AY - 74, xPercent: edge((x1 + x2) / 2, W) }); tl.from(lab, { autoAlpha: 0, y: '+=10', duration: .4 }, .8);
        const tg = add(mk('div', 'vl-tg', `<b></b><span>${st.add.to}</span>`)); G.set(tg, { x: x2, y: AY }); G.set(tg.querySelector('span'), { y: 24, xPercent: edge(x2, W) }); tl.from(tg, { autoAlpha: 0, duration: .4 }, 1.2);
      }
      if (st.diff) {
        const x1 = X(base), x2 = X(TODAY), bar = add(mk('div', 'vtm-bar')); G.set(bar, { x: x1, y: AY - 4, width: 0 });
        const gm = add(mk('div', 'vl-tg', `<b></b><span>GETDATE() ${iso(TODAY)}</span>`)); G.set(gm, { x: x2, y: AY }); G.set(gm.querySelector('span'), { y: 24, xPercent: edge(x2, W) });
        tl.to(bar, { width: x2 - x1, duration: 1.6, ease: 'none' }, .4).from(gm, { autoAlpha: 0, duration: .3 }, 1.9);
        const crossed = ticks.filter(([t]) => t > base && t <= TODAY), tickEls = tmp.filter(e => e.classList.contains('vl-t'));
        const cnt = add(mk('div', 'vtm-cnt', '<span>DiffYear</span><b>0</b>')); G.set(cnt, { x: 18, y: 6 });
        crossed.forEach(([t], k) => { const at = .4 + 1.6 * (X(t) - x1) / Math.max(1, x2 - x1); const te = tickEls[ticks.findIndex(q => q[0] === t)]; tl.add(() => { if (te) te.classList.add('on'); cnt.querySelector('b').textContent = k + 1; }, at); });
        const n1 = new Date(base), nd = Math.round((TODAY - base) / 864e5), nm = (now.getFullYear() - n1.getUTCFullYear()) * 12 + (now.getMonth() - n1.getUTCMonth());
        const sub = add(mk('div', 'vtm-sub', `<span>DiffDays <b>${nd}</b></span><span>DiffMonth <b>${nm}</b></span>`)); G.set(sub, { x: 18, y: 52 }); tl.from(sub, { autoAlpha: 0, duration: .4 }, 2.1);
      }
      run(tl, d);
    } };
  };

  /* ------------------------------------------------------------ dparts: GETDATE / DATENAME / DATEPART */
  ENG.dparts = (cv) => {
    const box = cv.appendChild(mk('div', 'vdp'));
    let tl;
    return { go(st, an) {
      const d = dur(an, 1); if (tl) tl.kill(); box.innerHTML = '';
      const n = new Date(), p2 = v => String(v).padStart(2, '0');
      const segs = [['y', String(n.getFullYear())], ['s', '-'], ['m', p2(n.getMonth() + 1)], ['s', '-'], ['d', p2(n.getDate())], ['s', ' '], ['t', `${p2(n.getHours())}:${p2(n.getMinutes())}:${p2(n.getSeconds())}.${String(n.getMilliseconds()).padStart(3, '0')}`]];
      box.appendChild(mk('div', 'vs-l', 'GETDATE()'));
      const row = box.appendChild(mk('div', 'vdp-row'));
      const S = {}; segs.forEach(([k, t]) => { const e = row.appendChild(mk('span', 'vdp-s ' + k, esc(t))); if (k !== 's') S[k] = e; });
      const outs = box.appendChild(mk('div', 'vdp-outs'));
      tl = G.timeline(); tl.from(row.children, { y: -14, autoAlpha: 0, duration: .35, stagger: .06 }, 0);
      const out = (k, label, val, at) => { const o = outs.appendChild(mk('div', 'vdp-o', `<small>${esc(label)}</small><b>${esc(val)}</b>`)); tl.add(() => S[k].classList.add('on'), at).from(o, { y: -20, autoAlpha: 0, duration: .5, ease: 'power3.out' }, at + .2); };
      if (st.mode === 'name') out('m', 'DATENAME(MM, GETDATE())', n.toLocaleString('en-US', { month: 'long' }), .7);
      if (st.mode === 'part') { out('m', 'Month', n.getMonth() + 1, .7); out('d', 'Day', n.getDate(), 1.1); out('y', 'Year', n.getFullYear(), 1.5); }
      run(tl, d);
    } };
  };

  /* ------------------------------------------------------------ chips: concatenation and CAST */
  ENG.chips = (cv) => {
    const box = cv.appendChild(mk('div', 'vc'));
    let sig = null, rowsEl = [], head, err;
    function build(st) {
      box.innerHTML = ''; rowsEl = [];
      head = box.appendChild(mk('div', 'vc-head', '<span></span>')); head.firstChild._t = '';
      st.rows.forEach(r => { const row = box.appendChild(mk('div', 'vc-row')); const chips = [];
        r.forEach((c, i) => { if (i) row.appendChild(mk('span', 'vc-op', '+'));
          const e = row.appendChild(mk('span', 'vc-c' + (c.lit ? ' lit' : ''), `<span class="vc-q">'</span><span class="vc-v"></span><span class="vc-q">'</span><small></small>`));
          e.querySelector('.vc-v').textContent = c.t; e.querySelector('small').textContent = c.ty || ''; chips.push(e); });
        rowsEl.push({ row, chips }); });
      err = box.appendChild(mk('div', 'vc-err'));
    }
    return { go(st, an) {
      const d = dur(an, .8), s = JSON.stringify(st.rows.map(r => r.map(c => c.t)));
      if (s !== sig) { sig = s; build(st); if (d) G.from(box.querySelectorAll('.vc-row'), { y: 14, autoAlpha: 0, duration: .5, stagger: .1 }); }
      swap(head.firstChild, st.head || '(No column name)', d);
      rowsEl.forEach(({ row, chips }) => {
        chips.forEach((e, i) => { const m = st.morph && st.morph.i === i; e.classList.toggle('lit', !!(st.rows[0][i].lit || m)); const sm = e.querySelector('small'); sm.textContent = m ? st.morph.ty : (st.rows[0][i].ty || ''); e.classList.toggle('morph', !!m); e.classList.toggle('err', !!(st.err && st.err.i === i)); });
        G.to(row.querySelectorAll('.vc-op'), { autoAlpha: st.merge ? 0 : 1, width: st.merge ? 0 : 22, duration: d, ease: 'power3.inOut' });
        row.classList.toggle('fused', !!st.merge);
        if (st.err && d) G.fromTo(chips[st.err.i], { x: 0 }, { keyframes: { x: [0, -7, 7, -5, 5, -2, 0] }, duration: .6, delay: .3 });
      });
      err.textContent = st.err ? st.err.msg : ''; err.classList.toggle('on', !!st.err);
    } };
  };

  window.SQLViz = { ENG, dur };
  /* ------------------------------------------------------------ wiring */
  const mobile = () => innerWidth < 1024;
  $$('[data-viz]').forEach(el => {
    const cfgEl = $('script[type="application/json"]', el); if (!cfgEl) return;
    const cfg = JSON.parse(cfgEl.textContent), cv = $('.vz-canvas', el), q = $('.vz-q code', el), n = $('.vz-n', el), steps = $$('.vz-step', el);
    const make = ENG[el.dataset.viz]; if (!make || !cv) return;
    const eng = make(cv, cfg); let cur = -1;
    function go(i, force) {
      if (i < 0 || i >= steps.length || (i === cur && !force)) return;
      const first = cur < 0; cur = i;
      steps.forEach((s, j) => s.classList.toggle('on', j === i));
      if (n) n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
      const t = $('template.vz-sql', steps[i]);
      if (q) { const h = t ? t.innerHTML : ''; if (q._h !== h) { q._h = h; q.innerHTML = h; if (!first && !RM) G.fromTo(q, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .4 }); } }
      try { eng.go(cfg.states[i], !first); } catch (e) { console.warn('viz', e); }
    }
    steps.forEach((s, i) => { s.addEventListener('click', () => go(i, true)); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i, true); } }); });
    const re = $('.vz-re', el); if (re) re.addEventListener('click', () => go(cur < 0 ? 0 : cur, true));
    const nx = $('.vz-nx', el), pv = $('.vz-pv', el);
    if (nx) nx.addEventListener('click', () => go(Math.min(steps.length - 1, cur + 1), true));
    if (pv) pv.addEventListener('click', () => go(Math.max(0, cur - 1), true));
    go(0);
    if (window.ScrollTrigger) {
      const line = mobile() ? '82%' : '58%';
      steps.forEach((s, i) => { const nx = steps[i + 1]; ScrollTrigger.create({ trigger: s, start: i ? 'top ' + line : 'top bottom', endTrigger: nx || s, end: nx ? 'top ' + line : 'bottom top', onToggle: x => { if (x.isActive) go(i); } }); });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) go(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(s => io.observe(s));
    }
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { try { eng.go(cfg.states[cur], false); } catch (e) {} }, 200); });
  });
})();
