/* stepper.js: "watch the query run". Shows a query one clause at a time, in the order SQL really handles it:
   FROM -> WHERE -> SELECT -> DISTINCT -> ORDER BY -> result. Every number on screen comes from a real run of the query. */
import * as D from './db.js';
import { esc, hl, clauses, fmt, affected, reduceMotion, ic } from './ui.js';

const LABEL = { from: 'FROM', where: 'WHERE', select: 'SELECT', distinct: 'DISTINCT', order: 'ORDER BY', result: 'Result' };
const MAXROWS = 12;

/* ponytail: big tables are drawn as a small sample (spread evenly, with any pinned rows). The counts in the captions still use every row.
   Ceiling: ORDER BY on a sample sorts only the sample. Upgrade path: page the stage. The lessons only sort the 9-row Employees table. */
function sample(tr, pins) {
  const rows = tr.rows;
  if (rows.length <= MAXROWS) return { rows, sampled: false };
  const spread = (a, n) => (a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor(i * a.length / n)]));
  const pass = rows.filter(r => tr.pass.has(r.id)), fail = rows.filter(r => !tr.pass.has(r.id));
  const pick = tr.c.where ? [...spread(pass, 6), ...spread(fail, 4)] : rows.slice(0, 8);
  pins.forEach(id => { const r = rows.find(x => x.id === id); if (r && !pick.includes(r)) pick.push(r); });
  return { rows: pick.sort((a, b) => a.id - b.id), sampled: true };
}

function orderTerms(sql) {
  const seg = clauses(sql).find(s => s.cl === 'order');
  if (!seg) return [];
  const txt = seg.text.replace(/^\s*order\s+by/i, ''), parts = [];
  let depth = 0, cur = '';
  for (const ch of txt) {
    if (ch === '(') depth++; if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  return parts.map(p => {
    const m = /^\s*([\s\S]+?)(?:\s+(ASC|DESC))?\s*$/i.exec(p);
    return { key: m[1].trim().replace(/^\[|\]$|^"|"$/g, '').toLowerCase(), dir: (m[2] || 'ASC').toLowerCase() };
  });
}

export function mountStepper(host, sql, opts = {}) {
  let tr;
  try { tr = D.trace(sql); } catch (e) { host.innerHTML = `<p class="msg err" role="alert">${esc(D.friendly(e))}</p>`; return null; }
  const { c, items } = tr, table = c.tbl && c.tbl.name;
  const { rows, sampled } = sample(tr, opts.pin || []);

  /* columns: every table column, plus one extra column for each calculated item */
  const cols = tr.cols.map((name, i) => ({ name, kind: tr.colTypes[i], src: i, item: -1 }));
  items.forEach((it, n) => {
    const j = it.plain ? cols.findIndex(x => x.src >= 0 && x.item < 0 && x.name.toLowerCase() === it.plain.toLowerCase()) : -1;
    if (j >= 0) { cols[j].item = n; it.col = j; } else { cols.push({ name: it.header, kind: it.kind, src: -1, item: n }); it.col = cols.length - 1; }
  });
  const money = col => (col.src >= 0 ? col.kind === 'money' : items[col.item].kind === 'money');
  const value = (r, col) => (col.src >= 0 ? r.vals[col.src] : (tr.cells.get(r.id) || [])[col.item]);
  const width = cols.map(col => {
    let n = Math.max(col.name.length, col.item >= 0 ? items[col.item].header.length : 0);
    rows.forEach(r => { const v = value(r, col); if (v !== undefined) n = Math.max(n, v === null ? 4 : (typeof v === 'number' && money(col) ? v.toFixed(2) : String(v)).length); });
    return Math.min(Math.max(n + 3, 7), 34);
  });

  /* the steps */
  const P = ['from'];
  if (c.where) P.push('where');
  P.push('select');
  if (c.p.distinct) P.push('distinct');
  if (c.order) P.push('order');
  P.push('result');
  const at = n => P.indexOf(n);

  const terms = orderTerms(sql);
  const sortOf = col => {
    const hit = terms.findIndex(t => (col.item >= 0 && ((items[col.item].alias || '').toLowerCase() === t.key || (items[col.item].plain || '').toLowerCase() === t.key)) || (col.src >= 0 && col.name.toLowerCase() === t.key));
    return hit < 0 ? null : { dir: terms[hit].dir, n: hit + 1 };
  };
  const shownSort = new Set(cols.filter(x => x.item >= 0).map(x => (sortOf(x) || {}).n));
  const hiddenSort = terms.filter((t, i) => !shownSort.has(i + 1));
  const whereText = (clauses(sql).find(s => s.cl === 'where') || { text: '' }).text.replace(/^\s*where/i, '').trim();

  const total = tr.rows.length, passN = tr.pass.size, finalN = tr.final.length;
  const calc = items.filter(i => !i.plain);
  const cap = {
    from: table
      ? `<b>FROM</b> runs first. SQL starts with the whole <b>${esc(table)}</b> table: ${total} rows and ${tr.cols.length} columns.`
      : '<b>FROM</b> is missing, so there is no table to read. SQL works out the expression once.',
    where: `<b>WHERE</b> checks every row against <code>${esc(whereText)}</code>. TRUE keeps a row. FALSE or NULL (unknown) drops it. <b>${passN}</b> of ${total} rows stay.`,
    select: `<b>SELECT</b> comes next. It keeps only the columns you name, in the order you wrote them.` +
      (calc.length ? ` ${calc.length === 1 ? 'The calculation makes' : 'The calculations make'} new ${calc.length === 1 ? 'column' : 'columns'}: each value is worked out row by row from the values on that row.` : '') +
      (items.some(i => i.alias) ? ' An alias renames the heading.' : '') +
      (items.some(i => i.header === '(No column name)') ? ' A calculation without an alias has no column name.' : ''),
    distinct: `<b>DISTINCT</b> looks at the selected columns only. A row that repeats an earlier row is removed: ${tr.dropped.size} removed, ${finalN} left.`,
    order: `<b>ORDER BY</b> runs last, after SELECT, so it can use an alias. Rows are sorted by ${terms.map(t => `<b>${esc(t.key)}</b> ${t.dir === 'desc' ? 'high to low' : 'low to high'}`).join(', then by ')}.` +
      (hiddenSort.length && table ? ' You can sort by a column that is not shown.' : ''),
    result: `<b>Result:</b> ${finalN} row(s)${c.order ? ', in the order you asked for' : ''}. Without ORDER BY, SQL does not promise any order.`
  };

  /* build the page */
  const segs = clauses(sql).map(s => `<span class="cl" data-cl="${s.cl}">${hl(s.text)}</span>`).join('');
  host.innerHTML = `<div class="vz">
    <pre class="vz-q" tabindex="0"><code>${segs}</code></pre>
    <ol class="vz-ph" aria-label="Steps">${P.map((p, i) => `<li><button type="button" data-k="${i}">${LABEL[p]}</button></li>`).join('')}</ol>
    <div class="vz-stage"><div class="scroll" tabindex="0" role="region" aria-label="Query picture, scrolls sideways on small screens">
      <div class="vt" role="table"><div class="vh" role="row"><div class="g" aria-hidden="true"></div></div><div class="vb"></div></div></div>
      <p class="vz-foot"></p></div>
    <p class="vz-cap" aria-live="polite"></p>
    ${sampled ? `<p class="vz-note">Showing ${rows.length} of ${total} rows to keep the picture small. The counts use all ${total} rows.</p>` : ''}
    <div class="vz-ctl"><button type="button" data-a="back">${ic('back')} Back</button><button type="button" data-a="next" class="pri">Next step ${ic('next')}</button><button type="button" data-a="play">${ic('play')} Play</button><button type="button" data-a="reset">${ic('reset')} Reset</button></div>
  </div>`;
  const $ = s => host.querySelector(s), $$ = s => Array.from(host.querySelectorAll(s));
  const head = $('.vh'), body = $('.vb');
  const hcells = cols.map((col, i) => {
    const d = document.createElement('div');
    d.className = 'c hc'; d.setAttribute('role', 'columnheader'); d.style.setProperty('--w', width[i] + 'ch'); head.append(d); return d;
  });
  const rowEls = new Map(), cellEls = new Map();
  rows.forEach((r, ri) => {
    const el = document.createElement('div');
    el.className = 'r'; el.setAttribute('role', 'row'); el.dataset.id = r.id;
    el.innerHTML = '<div class="g" aria-hidden="true"></div>';
    const cs = cols.map((col, i) => {
      const d = document.createElement('div');
      d.className = 'c'; d.setAttribute('role', 'cell'); d.style.setProperty('--w', width[i] + 'ch');
      const v = value(r, col); d.innerHTML = v === undefined ? '' : fmt(v, money(col));
      if (typeof v === 'number') d.classList.add('num');
      el.append(d); return d;
    });
    body.append(el); rowEls.set(r.id, el); cellEls.set(r.id, cs);
    el.dataset.i = ri;
  });

  let k = 0, timers = [], playing = null;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const snapshot = () => new Map(rows.map(r => [r.id, rowEls.get(r.id).getBoundingClientRect().top]));

  function paint(k, how) {
    const ph = P[k], wi = at('where'), si = at('select'), di = at('distinct'), oi = at('order');
    const stepIn = how === 'step' && !reduceMotion();
    const before = stepIn && ph === 'order' ? snapshot() : null;

    /* column state */
    const sel = k >= si;
    cols.forEach((col, i) => {
      const used = col.item >= 0;
      const vis = col.src >= 0 ? !sel || used : sel && used;
      const ord = sel ? (used ? col.item : 100 + i) : i;
      const text = sel && used ? items[col.item].header : col.name;
      const h = hcells[i];
      if (h.textContent !== text) { h.textContent = text; if (stepIn) { h.classList.remove('flash'); void h.offsetWidth; h.classList.add('flash'); } }
      h.classList.toggle('off', !vis); h.classList.toggle('nocol', text === '(No column name)'); h.style.order = ord;
      const s = k >= oi && oi >= 0 && vis ? sortOf(col) : null;
      if (s) { h.dataset.sort = s.dir; h.dataset.n = terms.length > 1 ? s.n : ''; } else { delete h.dataset.sort; delete h.dataset.n; }
      rows.forEach((r, ri) => {
        const d = cellEls.get(r.id)[i];
        d.classList.toggle('off', !vis); d.style.order = ord;
        const pop = stepIn && ph === 'select' && vis && col.src < 0;
        d.classList.toggle('pop', pop); d.style.animationDelay = pop ? ri * 70 + 'ms' : '';
        d.classList.toggle('keep', ph === 'select' && vis && col.src >= 0 && sel);
      });
    });

    /* row state */
    const now = how !== 'step' || reduceMotion();
    const rank = new Map(); tr.order.forEach((id, i) => rank.set(id, i));
    rows.forEach((r, ri) => {
      const el = rowEls.get(r.id), failing = wi >= 0 && !tr.pass.has(r.id), dup = di >= 0 && tr.dropped.has(r.id);
      const off = (failing && (k > wi || (k === wi && now))) || (dup && (k > di || (k === di && now)));
      el.classList.toggle('no', (failing && k === wi && now) || (failing && k > wi && !off));
      el.classList.toggle('ok', !failing && wi >= 0 && k === wi && now);
      el.classList.toggle('dup', dup && k >= di);
      el.classList.toggle('scan', false);
      el.classList.toggle('off', off);
      el.style.order = oi >= 0 && k >= oi && rank.has(r.id) ? rank.get(r.id) : 1000 + ri;
      el.classList.toggle('fin', ph === 'result' && !off);
    });
    if (oi < 0 || k < oi) rows.forEach((r, ri) => { rowEls.get(r.id).style.order = ri; });

    /* the WHERE / DISTINCT steps play out row by row */
    if (stepIn && ph === 'where') {
      const dt = Math.min(380, 2200 / rows.length);
      rows.forEach((r, i) => {
        const el = rowEls.get(r.id), good = tr.pass.has(r.id);
        later(() => el.classList.add('scan'), i * dt);
        later(() => { el.classList.remove('scan'); el.classList.add(good ? 'ok' : 'no'); }, i * dt + dt * 0.85);
      });
      later(() => rows.forEach(r => { if (!tr.pass.has(r.id)) rowEls.get(r.id).classList.add('off'); }), rows.length * dt + 650);
    }
    if (stepIn && ph === 'distinct') later(() => rows.forEach(r => { if (tr.dropped.has(r.id)) rowEls.get(r.id).classList.add('off'); }), 1100);

    /* sorting slides the rows to their new places */
    if (before) {
      rows.forEach(r => {
        const el = rowEls.get(r.id);
        if (el.classList.contains('off')) return;
        const dy = before.get(r.id) - el.getBoundingClientRect().top;
        if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
    }

    /* text, query highlight, buttons */
    $('.vz-cap').innerHTML = cap[ph];
    $$('.cl').forEach(s => s.classList.toggle('on', ph === s.dataset.cl || (ph === 'distinct' && s.dataset.cl === 'select')));
    $$('.vz-ph button').forEach((b, i) => { b.classList.toggle('now', i === k); b.classList.toggle('past', i < k); i === k ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    $('.vz-foot').textContent = ph === 'from' ? (table ? `${total} row(s) in the table` : '') : ph === 'where' ? `${passN} of ${total} rows pass` : ph === 'select' ? affected(passN) : affected(finalN);
    $('[data-a=back]').disabled = k === 0;
    const nx = $('[data-a=next]'), end = k === P.length - 1;
    nx.innerHTML = end ? `${ic('reset')} Replay` : `Next step ${ic('next')}`; nx.dataset.end = end ? '1' : '';
    $('.vt').dataset.phase = ph;

    /* on a narrow screen, slide sideways so the new calculated column is in view */
    const sc = $('.scroll'), firstNew = cols.findIndex(x => x.src < 0 && x.item >= 0);
    later(() => {
      if (sc.scrollWidth <= sc.clientWidth) return;
      const left = k >= si && firstNew >= 0 ? Math.max(0, hcells[firstNew].offsetLeft - 40) : 0;
      sc.scrollTo({ left, behavior: stepIn ? 'smooth' : 'auto' });
    }, stepIn ? 750 : 60);
  }

  function show(n, how = 'jump') { stop(); k = Math.max(0, Math.min(P.length - 1, n)); paint(k, how); }
  function stopPlay() { if (playing) { clearInterval(playing); playing = null; $('[data-a=play]').innerHTML = `${ic('play')} Play`; } }
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !host.contains(b)) return;
    if (b.dataset.k !== undefined) { stopPlay(); show(+b.dataset.k, +b.dataset.k === k + 1 ? 'step' : 'jump'); return; }
    const a = b.dataset.a; if (!a) return;
    if (a === 'next') { stopPlay(); if (b.dataset.end) show(0); else show(k + 1, 'step'); }
    if (a === 'back') { stopPlay(); show(k - 1); }
    if (a === 'reset') { stopPlay(); show(0); }
    if (a === 'play') {
      if (playing) { stopPlay(); return; }
      if (k === P.length - 1) show(0);
      b.innerHTML = `${ic('pause')} Pause`;
      const tick = () => { if (k >= P.length - 1) { stopPlay(); return; } show(k + 1, 'step'); if (k >= P.length - 1) stopPlay(); };
      playing = setInterval(tick, 3200); setTimeout(tick, 400);
    }
  });
  show(0);
  return { show, steps: P };
}
