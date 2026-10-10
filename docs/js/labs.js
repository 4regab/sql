/* labs.js: small hands-on pictures. Each one lets the reader change an input and see the SQL idea move.
   Results always come from the real engine; the pictures only explain them. */
import * as D from './db.js';
import { esc, hl, fmt, reduceMotion, ic } from './ui.js';
import * as T from './tsql.js';

const sq = s => "'" + String(s).replace(/'/g, "''") + "'";
const val = sql => { const r = D.run(sql); return r.error ? { error: r.error } : { v: r.rows[0] ? r.rows[0][0] : null }; };
const code = sql => `<pre class="sql lab-q"><code>${hl(sql)}</code></pre>`;
const seg = (name, list, cur) => `<div class="seg" role="group" aria-label="${name}">${list.map(([k, t]) => `<button type="button" data-v="${esc(k)}" aria-pressed="${k === cur}">${t}</button>`).join('')}</div>`;
const press = (el, sel, v) => el.querySelectorAll(sel + ' button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));

/* ---------- Selection, projection, join ---------- */
function parts(el) {
  let mode = 'sel', cond = 'all', cols = new Set(['LastName', 'Title', 'City', 'Country']);
  const emp = D.run('SELECT LastName, Title, City, Country FROM Employees').rows;
  const H = ['LastName', 'Title', 'City', 'Country'];
  const CONDS = { all: ['All rows', null], london: ["City = 'London'", r => r[2] === 'London'], usa: ["Country = 'USA'", r => r[3] === 'USA'], rep: ["Title = 'Sales Representative'", r => r[1] === 'Sales Representative'] };
  const cats = D.run('SELECT CategoryID, CategoryName FROM Categories').rows;
  const prods = D.run('SELECT ProductName, CategoryID FROM Products WHERE ProductID IN (1,2,3,4,11,12,16,17,22,7,13)').rows;
  let pick = 2;
  function draw() {
    let body = '', sql = '', say = '';
    if (mode === 'sel') {
      const f = CONDS[cond][1];
      sql = `SELECT *\nFROM   Employees` + (f ? `\nWHERE  ${CONDS[cond][0]}` : '');
      say = '<b>Selection</b> chooses <b>rows</b>. Rows that do not meet the condition fade out.';
      body = `<div class="chips" role="group" aria-label="Condition">${Object.entries(CONDS).map(([k, [t]]) => `<button type="button" class="chip" data-c="${k}" aria-pressed="${k === cond}">${esc(t)}</button>`).join('')}</div>` +
        `<div class="scroll"><table class="rs"><thead><tr>${H.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${emp.map(r => `<tr class="${f && !f(r) ? 'dim' : f ? 'hit' : ''}">${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    } else if (mode === 'proj') {
      const keep = H.filter(h => cols.has(h));
      sql = keep.length ? `SELECT ${keep.join(', ')}\nFROM   Employees` : 'SELECT ???\nFROM   Employees';
      say = '<b>Projection</b> chooses <b>columns</b>. Tap a column heading to add or remove it.';
      body = `<div class="scroll"><table class="rs"><thead><tr>${H.map(h => `<th><button type="button" class="thbtn" data-h="${h}" aria-pressed="${cols.has(h)}">${h}</button></th>`).join('')}</tr></thead><tbody>${emp.map(r => `<tr>${r.map((v, i) => `<td class="${cols.has(H[i]) ? 'hit' : 'dim'}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    } else {
      const id = cats[pick - 1][0];
      sql = `-- A join links two tables through a column they share.\n-- Lesson 7 or later covers the JOIN keyword.`;
      say = '<b>Join</b> links tables through a shared column. Tap a category to see the products that carry the same <code>CategoryID</code>.';
      body = `<div class="two"><div class="scroll"><table class="rs"><caption>Categories</caption><thead><tr><th>CategoryID</th><th>CategoryName</th></tr></thead><tbody>${cats.map((r, i) => `<tr class="${i + 1 === pick ? 'hit' : 'dim'}"><td><button type="button" class="thbtn" data-p="${i + 1}" aria-pressed="${i + 1 === pick}">${r[0]}</button></td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>` +
        `<div class="scroll"><table class="rs"><caption>Products</caption><thead><tr><th>ProductName</th><th>CategoryID</th></tr></thead><tbody>${prods.map(r => `<tr class="${r[1] === id ? 'hit' : 'dim'}"><td>${esc(r[0])}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    el.innerHTML = `${seg('Capability', [['sel', 'Selection'], ['proj', 'Projection'], ['join', 'Join']], mode)}<p class="say">${say}</p>${body}${code(sql)}`;
  }
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.closest('.seg')) mode = b.dataset.v;
    else if (b.dataset.c) cond = b.dataset.c;
    else if (b.dataset.h) { cols.has(b.dataset.h) ? cols.delete(b.dataset.h) : cols.add(b.dataset.h); }
    else if (b.dataset.p) pick = +b.dataset.p;
    draw();
  };
  draw();
}

/* ---------- LIKE ---------- */
function align(pat, s) {
  const P = [...pat.toLowerCase()], S = [...s.toLowerCase()], memo = new Map();
  const go = (i, j) => {
    const key = i * 1000 + j; if (memo.has(key)) return memo.get(key);
    let r = null;
    if (i === P.length) r = j === S.length ? [] : null;
    else if (P[i] === '%') { for (let n = 0; n <= S.length - j && !r; n++) { const t = go(i + 1, j + n); if (t) r = [...Array(n).fill('w'), ...t]; } }
    else if (j < S.length && (P[i] === '_' || P[i] === S[j])) { const t = go(i + 1, j + 1); if (t) r = [P[i] === '_' ? 'u' : 'l', ...t]; }
    memo.set(key, r); return r;
  };
  return go(0, 0);
}
function like(el, o = {}) {
  let pat = o.pat || 'D%';
  const names = D.run('SELECT LastName FROM Employees').rows.map(r => r[0]);
  const presets = ['D%', '%g', '%ha%', '_E%', '%an'];
  el.innerHTML = `<div class="lab-bar"><label for="likeIn${o.n || ''}">Pattern</label><input id="likeIn${o.n || ''}" class="in mono" type="text" value="${esc(pat)}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="14">` +
    `<div class="chips" role="group" aria-label="Examples">${presets.map(p => `<button type="button" class="chip" data-p="${esc(p)}">${esc(p)}</button>`).join('')}</div></div>` +
    `<p class="legend"><span class="t l">a</span> exact letter <span class="t u">a</span> one character (<code>_</code>) <span class="t w">a</span> any number of characters (<code>%</code>)</p><div class="names"></div><div class="out"></div>`;
  const inp = el.querySelector('input'), names$ = el.querySelector('.names'), out = el.querySelector('.out');
  function draw() {
    const r = D.run(`SELECT LastName FROM Employees WHERE LastName LIKE ${sq(pat)}`);
    const hit = new Set(r.rows.map(x => x[0]));
    names$.innerHTML = names.map(n => {
      const a = hit.has(n) ? align(pat, n) : null;
      return `<div class="nm ${hit.has(n) ? 'hit' : 'dim'}"><span class="tiles" aria-label="${esc(n)}">${[...n].map((ch, i) => `<span class="t ${a ? a[i] : ''}">${esc(ch)}</span>`).join('')}</span><span class="mark" aria-label="${hit.has(n) ? 'match' : 'no match'}">${ic(hit.has(n) ? 'ok' : 'no')}</span></div>`;
    }).join('');
    out.innerHTML = code(`SELECT LastName\nFROM   Employees\nWHERE  LastName LIKE ${sq(pat)}`) + `<p class="foot">${r.error ? esc(r.error) : `${hit.size} of ${names.length} last names match.`}</p>`;
  }
  inp.oninput = () => { pat = inp.value; draw(); };
  el.querySelector('.chips').onclick = e => { const b = e.target.closest('button'); if (b) { pat = b.dataset.p; inp.value = pat; draw(); } };
  draw();
}

/* ---------- AND / OR / NOT and precedence ---------- */
function logic(el) {
  const PRE = [
    ['and', 'A AND C', "Title = 'Sales Representative' AND City = 'London'", (a, b, c) => a && c, 'Both tests must be TRUE.'],
    ['or', 'A OR C', "Title = 'Sales Representative' OR City = 'London'", (a, b, c) => a || c, 'One TRUE test is enough, so more rows pass.'],
    ['not', 'NOT A', "NOT Title = 'Sales Representative'", (a, b, c) => !a, 'NOT flips the test. TRUE becomes FALSE.'],
    ['prec', 'A OR B AND C', "Title = 'Sales Representative'\n   OR Title = 'Sales Manager' AND City = 'London'", (a, b, c) => a || (b && c), 'AND is done before OR. SQL reads this as A OR (B AND C), so every Sales Representative passes, wherever they live.'],
    ['par', '(A OR B) AND C', "(Title = 'Sales Representative'\n   OR Title = 'Sales Manager') AND City = 'London'", (a, b, c) => (a || b) && c, 'Parentheses go first. Now the job test (A or B) must be TRUE and the city must be London.']
  ];
  let cur = 'and';
  const rows = D.run('SELECT LastName, Title, City FROM Employees').rows;
  el.innerHTML = `<p class="legend"><b>A</b> Title = 'Sales Representative' &nbsp; <b>B</b> Title = 'Sales Manager' &nbsp; <b>C</b> City = 'London'</p>` +
    seg('Condition', PRE.map(p => [p[0], p[1]]), cur) + '<div class="body"></div>';
  const body = el.querySelector('.body');
  function draw() {
    const p = PRE.find(x => x[0] === cur);
    const hit = new Set(D.run(`SELECT LastName FROM Employees WHERE ${p[2]}`).rows.map(r => r[0]));
    const dot = on => `<td class="dot ${on ? 'on' : ''}" aria-label="${on ? 'TRUE' : 'FALSE'}">${ic(on ? 'dot' : 'ring')}</td>`;
    body.innerHTML = `<div class="scroll"><table class="rs"><thead><tr><th>LastName</th><th>Title</th><th>City</th><th>A</th><th>B</th><th>C</th><th>Pass?</th></tr></thead><tbody>` +
      rows.map(r => {
        const a = r[1] === 'Sales Representative', b = r[1] === 'Sales Manager', c = r[2] === 'London';
        return `<tr class="${hit.has(r[0]) ? 'hit' : 'dim'}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td>${dot(a)}${dot(b)}${dot(c)}<td class="mark">${ic(hit.has(r[0]) ? 'ok' : 'no')}</td></tr>`;
      }).join('') + `</tbody></table></div>` +
      code(`SELECT LastName, Title, City\nFROM   Employees\nWHERE  ${p[2]}`) + `<p class="say">${p[4]} <b>${hit.size}</b> of ${rows.length} rows pass.</p>`;
  }
  el.querySelector('.seg').onclick = e => { const b = e.target.closest('button'); if (b) { cur = b.dataset.v; press(el, '.seg', cur); draw(); } };
  draw();
}

/* ---------- BETWEEN ---------- */
function between(el) {
  let lo = 50, hi = 100, not = false;
  const prices = D.run('SELECT ProductName, UnitPrice FROM Products WHERE UnitPrice IS NOT NULL').rows;
  const MAX = 270;
  el.innerHTML = `<div class="rng"><label>Low <output id="bLo"></output><input type="range" min="0" max="${MAX}" step="1" aria-label="Low value"></label><label>High <output id="bHi"></output><input type="range" min="0" max="${MAX}" step="1" aria-label="High value"></label></div>` +
    `<label class="chk"><input type="checkbox"> Use NOT BETWEEN</label><div class="line" aria-hidden="true"><i class="band"></i></div><div class="out"></div>`;
  const [rl, rh] = el.querySelectorAll('input[type=range]'), cb = el.querySelector('input[type=checkbox]'), line = el.querySelector('.line'), out = el.querySelector('.out');
  prices.forEach(([n, p], i) => { const d = document.createElement('i'); d.className = 'pt'; d.style.left = (p / MAX * 100) + '%'; d.style.setProperty('--row', i % 4); d.title = `${n} ${p}`; line.append(d); });
  const dots = [...line.querySelectorAll('.pt')];
  function draw() {
    if (lo > hi) [lo, hi] = [hi, lo];
    rl.value = lo; rh.value = hi; el.querySelector('#bLo').textContent = lo; el.querySelector('#bHi').textContent = hi;
    const band = line.querySelector('.band'); band.style.left = lo / MAX * 100 + '%'; band.style.width = (hi - lo) / MAX * 100 + '%'; band.classList.toggle('not', not);
    const sql = `SELECT ProductName, UnitPrice\nFROM   Products\nWHERE  UnitPrice ${not ? 'NOT ' : ''}BETWEEN ${lo} AND ${hi}`;
    const r = D.run(sql);
    const ok = new Set(r.rows.map(x => x[0]));
    dots.forEach((d, i) => d.classList.toggle('in', ok.has(prices[i][0])));
    out.innerHTML = code(sql) + `<p class="foot"><b>${r.rows.length}</b> of ${prices.length} products with a price. The ends (${lo} and ${hi}) are included in BETWEEN.</p>` +
      (r.rows.length ? `<p class="mini">${r.rows.slice(0, 6).map(x => `${esc(x[0])} <b>${fmt(x[1], true)}</b>`).join(' · ')}${r.rows.length > 6 ? ' …' : ''}</p>` : '');
  }
  rl.oninput = () => { lo = +rl.value; draw(); }; rh.oninput = () => { hi = +rh.value; draw(); }; cb.onchange = () => { not = cb.checked; draw(); };
  draw();
}

/* ---------- IN ---------- */
function inlist(el) {
  const CITIES = ['Seattle', 'Tacoma', 'Kirkland', 'Redmond', 'London'];
  const pickd = new Set(['Tacoma', 'Kirkland', 'Redmond']);
  el.innerHTML = `<p class="say">Tick the cities that go in the list.</p><div class="chips" role="group" aria-label="Cities">${CITIES.map(c => `<button type="button" class="chip" data-c="${c}" aria-pressed="${pickd.has(c)}">${c}</button>`).join('')}</div><div class="body"></div>`;
  const body = el.querySelector('.body');
  function draw() {
    const list = CITIES.filter(c => pickd.has(c));
    const sql = `SELECT LastName, FirstName, City\nFROM   Employees\nWHERE  City IN (${list.map(sq).join(', ')})`;
    const r = list.length ? D.run(sql) : { rows: [], headers: ['LastName', 'FirstName', 'City'] };
    body.innerHTML = code(list.length ? sql : 'SELECT LastName, FirstName, City\nFROM   Employees\nWHERE  City IN ( )  -- an empty list is not allowed') +
      `<div class="scroll"><table class="rs"><thead><tr><th>LastName</th><th>FirstName</th><th>City</th></tr></thead><tbody>${r.rows.map(x => `<tr class="hit">${x.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="foot">IN is a short way to write City = 'Seattle' OR City = 'Tacoma' OR ... &nbsp;<b>${r.rows.length}</b> row(s).</p>`;
  }
  el.querySelector('.chips').onclick = e => { const b = e.target.closest('button'); if (!b) return; pickd.has(b.dataset.c) ? pickd.delete(b.dataset.c) : pickd.add(b.dataset.c); b.setAttribute('aria-pressed', String(pickd.has(b.dataset.c))); draw(); };
  draw();
}

/* ---------- String functions ---------- */
const SF = {
  LEN: { p: ['s'], def: { s: 'Sales Representative' }, sql: v => `LEN(${sq(v.s)})`, note: 'Counts the characters. Spaces at the end are not counted.' },
  LEFT: { p: ['s', 'n'], def: { s: 'Vice President, Sales', n: 4 }, sql: v => `LEFT(${sq(v.s)}, ${v.n})`, note: 'Takes characters from the left end.' },
  RIGHT: { p: ['s', 'n'], def: { s: 'Vice President, Sales', n: 4 }, sql: v => `RIGHT(${sq(v.s)}, ${v.n})`, note: 'Takes characters from the right end.' },
  SUBSTRING: { p: ['s', 'start', 'len'], def: { s: 'Margaret', start: 2, len: 5 }, sql: v => `SUBSTRING(${sq(v.s)}, ${v.start}, ${v.len})`, note: 'Starts at position start (the first character is 1) and takes len characters.' },
  CHARINDEX: { p: ['find', 's'], def: { find: 'ale', s: 'Vice President, Sales' }, sql: v => `CHARINDEX(${sq(v.find)}, ${sq(v.s)})`, note: 'Gives the position where the text is first found. It gives 0 when the text is not found.' },
  REPLACE: { p: ['s', 'find', 'with'], def: { s: 'abcdefghicde', find: 'cde', with: 'xxx' }, sql: v => `REPLACE(${sq(v.s)}, ${sq(v.find)}, ${sq(v.with)})`, note: 'Replaces every match of the second text with the third text.' },
  REPLICATE: { p: ['s', 'n'], def: { s: 'Nancy', n: 2 }, sql: v => `REPLICATE(${sq(v.s)}, ${v.n})`, note: 'Repeats the text n times.' },
  LTRIM: { p: ['s'], def: { s: '     abcde' }, sql: v => `LTRIM(${sq(v.s)})`, note: 'Removes spaces at the start. A dot marks a space.' },
  RTRIM: { p: ['s'], def: { s: 'abcde   ' }, sql: v => `RTRIM(${sq(v.s)})`, note: 'Removes spaces at the end. A dot marks a space.' },
  UPPER: { p: ['s'], def: { s: 'Fuller' }, sql: v => `UPPER(${sq(v.s)})`, note: 'Changes every letter to capitals.' },
  LOWER: { p: ['s'], def: { s: 'Andrew' }, sql: v => `LOWER(${sq(v.s)})`, note: 'Changes every letter to small letters.' }
};
const LABELS = { s: 'Text', n: 'How many', start: 'Start', len: 'Length', find: 'Find', with: 'Replace with' };
function span(fn, v) {
  const s = String(v.s || ''), L = s.length, n = Math.max(0, +v.n || 0), mark = new Set();
  const add = (a, b) => { for (let i = Math.max(0, a); i < Math.min(L, b); i++) mark.add(i); };
  if (fn === 'LEN') add(0, s.replace(/ +$/, '').length);
  else if (fn === 'LEFT') add(0, n);
  else if (fn === 'RIGHT') add(L - n, L);
  else if (fn === 'SUBSTRING') { const st = +v.start || 1, ln = Math.max(0, +v.len || 0); add(st - 1, st - 1 + ln); }
  else if (fn === 'CHARINDEX') { const f = String(v.find || ''), i = f ? s.toLowerCase().indexOf(f.toLowerCase()) : -1; if (i >= 0) add(i, i + f.length); }
  else if (fn === 'REPLACE') { const f = String(v.find || '').toLowerCase(); if (f) { let i = 0; const low = s.toLowerCase(); while ((i = low.indexOf(f, i)) >= 0) { add(i, i + f.length); i += f.length; } } }
  else if (fn === 'LTRIM') add(0, L - s.replace(/^ +/, '').length);
  else if (fn === 'RTRIM') add(s.replace(/ +$/, '').length, L);
  else add(0, L);
  return mark;
}
const tiles = (s, mark, cls) => `<span class="tiles">${[...s].map((ch, i) => `<span class="t ${mark && mark.has(i) ? cls : ''} ${ch === ' ' ? 'sp' : ''}"><b>${ch === ' ' ? '·' : esc(ch)}</b><sub>${i + 1}</sub></span>`).join('') || '<span class="t sp"><b>empty</b></span>'}</span>`;
function string(el, o = {}) {
  let fn = o.fn || 'LEFT';
  const v = { ...SF[fn].def };
  const list = o.fns || Object.keys(SF);
  function draw(full) {
    const F = SF[fn];
    if (full) {
      el.innerHTML = seg('Function', list.map(k => [k, k]), fn) + `<div class="fields">${F.p.map(k => `<label>${LABELS[k]}<input class="in mono" data-k="${k}" type="${['n', 'start', 'len'].includes(k) ? 'number' : 'text'}" ${['n', 'start', 'len'].includes(k) ? 'inputmode="numeric" min="0" max="40"' : 'maxlength="30"'} value="${esc(v[k])}" autocomplete="off" autocapitalize="off" spellcheck="false"></label>`).join('')}</div><div class="viz"></div>`;
    }
    const call = F.sql(v), r = val(`SELECT ${call}`), viz = el.querySelector('.viz');
    const mark = span(fn, v);
    const res = r.error ? '' : r.v === null ? null : String(r.v);
    const resMark = fn === 'CHARINDEX' || fn === 'LEN' ? null : new Set([...Array((res || '').length).keys()]);
    viz.innerHTML = `<p class="say">${F.note}</p><div class="io"><div><span class="cap">Input</span>${tiles(String(v.s || v.find || ''), mark, 'on')}</div>` +
      `<div class="arrow" aria-hidden="true">${ic('down')} <code>${esc(fn)}</code></div><div><span class="cap">Result</span>${r.error ? `<p class="msg err">${esc(r.error)}</p>` : fn === 'CHARINDEX' || fn === 'LEN' ? `<span class="big">${fmt(r.v)}</span>` : tiles(res === null ? '' : res, resMark, 'res')}</div></div>` +
      code(`SELECT ${call}`);
  }
  el.onclick = e => { const b = e.target.closest('.seg button'); if (b) { fn = b.dataset.v; Object.keys(v).forEach(k => delete v[k]); Object.assign(v, SF[fn].def); draw(true); } };
  el.oninput = e => { const k = e.target.dataset.k; if (k) { v[k] = e.target.type === 'number' ? (e.target.value === '' ? '' : +e.target.value) : e.target.value; draw(false); } };
  draw(true);
}

/* ---------- Number functions on a number line ---------- */
const NF = {
  ABS: { p: ['x'], def: { x: -4.5 } }, POWER: { p: ['x', 'y'], def: { x: 3, y: 4 } }, CEILING: { p: ['x'], def: { x: 123.45 } },
  FLOOR: { p: ['x'], def: { x: 123.45 } }, ROUND: { p: ['x', 'len'], def: { x: 748.58, len: -1 } }
};
const NL = { x: 'Number', y: 'Power', len: 'Length' };
const nice = n => String(+Number(n).toFixed(6));
function numberLine(lo, hi, ticks, marks) {
  const X = v => 30 + (v - lo) / (hi - lo) * 540;
  return `<svg class="nl" viewBox="0 0 600 120" role="img" aria-label="Number line"><line x1="20" y1="70" x2="580" y2="70"/>` +
    ticks.map(t => `<g><line class="tk" x1="${X(t)}" y1="62" x2="${X(t)}" y2="78"/><text x="${X(t)}" y="100" text-anchor="middle">${nice(t)}</text></g>`).join('') +
    marks.map(m => `<g class="mk ${m.cls}"><circle cx="${X(m.v)}" cy="70" r="9"/><text x="${X(m.v)}" y="${m.up || 40}" text-anchor="middle">${m.t}</text></g>`).join('') + '</svg>';
}
function number(el, o = {}) {
  let fn = o.fn || 'ROUND';
  const v = { ...NF[fn].def };
  const list = o.fns || Object.keys(NF);
  function draw(full) {
    const F = NF[fn], x = +v.x;
    if (full) el.innerHTML = seg('Function', list.map(k => [k, k]), fn) + `<div class="fields">${F.p.map(k => `<label>${NL[k]}<input class="in mono" data-k="${k}" type="number" inputmode="decimal" step="any" value="${v[k]}"></label>`).join('')}</div><div class="viz"></div>`;
    const call = fn === 'ABS' ? `ABS(${v.x})` : fn === 'POWER' ? `POWER(${v.x}, ${v.y})` : fn === 'ROUND' ? `ROUND(${v.x}, ${v.len})` : `${fn}(${v.x})`;
    const r = val(`SELECT ${call}`), viz = el.querySelector('.viz');
    let pic = '', say = '';
    if (r.error || !Number.isFinite(x)) { viz.innerHTML = `<p class="msg err">${esc(r.error || 'Type a number.')}</p>`; return; }
    if (fn === 'CEILING') { const a = Math.floor(x); pic = numberLine(a - 1, a + 2, [a - 1, a, a + 1, a + 2], [{ v: x, t: nice(x), cls: 'in' }, { v: r.v, t: nice(r.v), cls: 'out', up: 24 }]); say = 'CEILING moves up (to the right) to the next whole number. A whole number stays put.'; }
    else if (fn === 'FLOOR') { const a = Math.floor(x); pic = numberLine(a - 1, a + 2, [a - 1, a, a + 1, a + 2], [{ v: x, t: nice(x), cls: 'in' }, { v: r.v, t: nice(r.v), cls: 'out', up: 24 }]); say = 'FLOOR moves down (to the left) to the whole number below. A whole number stays put.'; }
    else if (fn === 'ABS') { const m = Math.max(Math.abs(x), 1) + 1; pic = numberLine(-m, m, [-m, -Math.abs(x), 0, Math.abs(x), m].filter((t, i, a) => a.indexOf(t) === i), [{ v: x, t: nice(x), cls: 'in' }, { v: Math.abs(x), t: nice(Math.abs(x)), cls: 'out', up: 24 }]); say = 'ABS is the distance from zero. It drops the minus sign.'; }
    else if (fn === 'ROUND') {
      const len = Math.trunc(+v.len) || 0, step = Math.pow(10, -len), lo = Math.floor(Math.round(x / step * 1e9) / 1e9) * step, hi = lo + step;
      pic = numberLine(lo - step * 0.25, hi + step * 0.25, [lo, (lo + hi) / 2, hi], [{ v: x, t: nice(x), cls: 'in' }, { v: r.v, t: nice(r.v), cls: 'out', up: 24 }]);
      say = `Length <b>${len}</b> means the answer is a multiple of <b>${nice(step)}</b>. ${x} sits between ${nice(lo)} and ${nice(hi)}. SQL picks the closer one; exactly halfway goes up (away from zero). A negative length rounds to the left of the decimal point.`;
    } else if (fn === 'POWER') {
      const y = Math.trunc(+v.y);
      pic = Number.isInteger(+v.y) && y >= 1 && y <= 8 && Math.abs(x) < 1000 ? `<div class="chain">${Array(y).fill(`<span class="t on">${nice(x)}</span>`).join('<span class="op">×</span>')}<span class="op">=</span><span class="t res">${nice(r.v)}</span></div>` : '';
      say = 'POWER(x, y) multiplies x by itself y times.';
    }
    viz.innerHTML = `<p class="say">${say}</p>${pic}<p class="resline">Result: <span class="big">${fmt(r.v)}</span></p>${code(`SELECT ${call}`)}`;
  }
  el.onclick = e => { const b = e.target.closest('.seg button'); if (b) { fn = b.dataset.v; Object.keys(v).forEach(k => delete v[k]); Object.assign(v, NF[fn].def); draw(true); } };
  el.oninput = e => { const k = e.target.dataset.k; if (k) { v[k] = e.target.value === '' ? '' : +e.target.value; draw(false); } };
  draw(true);
}

/* ---------- Date functions ---------- */
const DP = [['yy', 'Year (yy)'], ['qq', 'Quarter (qq)'], ['mm', 'Month (mm)'], ['wk', 'Week (wk)'], ['dd', 'Day (dd)']];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const parts3 = d => { const x = T.toDate(d); return [x.getUTCFullYear(), String(x.getUTCMonth() + 1).padStart(2, '0'), String(x.getUTCDate()).padStart(2, '0')]; };
function date(el, o = {}) {
  let fn = o.fn || 'DATEADD', part = 'mm', d1 = '1992-05-01', d2 = today(), n = 2;
  const list = o.fns || ['DATEADD', 'DATEDIFF', 'DATEPART', 'DATENAME'];
  const NAMES = { yy: 'year', qq: 'quarter', mm: 'month', wk: 'week', dd: 'day' };
  function boundaries(a, b, u) {
    const A = T.toDate(a), B = T.toDate(b), out = [], sign = B >= A ? 1 : -1, cnt = Math.abs(T.dateDiff(u, a, b));
    const lo = Math.min(A, B), hi = Math.max(A, B);
    const first = new Date(lo);
    for (let i = 1; i <= cnt && i <= 90; i++) {
      let t;
      if (u === 'yy') t = Date.UTC(first.getUTCFullYear() + i, 0, 1);
      else if (u === 'qq') t = Date.UTC(first.getUTCFullYear(), (Math.floor(first.getUTCMonth() / 3) + i) * 3, 1);
      else if (u === 'mm') t = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1);
      else if (u === 'wk') t = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() - first.getUTCDay() + 7 * i);
      else t = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate() + i);
      out.push((t - lo) / ((hi - lo) || 1));
    }
    return { out, cnt, sign };
  }
  function draw(full) {
    if (full) {
      const needN = fn === 'DATEADD', two = fn === 'DATEDIFF';
      el.innerHTML = seg('Function', list.map(k => [k, k]), fn) +
        `<div class="fields"><label>Datepart<select class="in" data-k="part">${DP.map(([k, t]) => `<option value="${k}" ${k === part ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` +
        (needN ? `<label>Number<input class="in mono" data-k="n" type="number" inputmode="numeric" value="${n}"></label>` : '') +
        `<label>${two ? 'Start date' : 'Date'}<input class="in" data-k="d1" type="date" value="${d1}"></label>` + (two ? `<label>End date<input class="in" data-k="d2" type="date" value="${d2}"></label>` : '') + `</div><div class="viz"></div>`;
    }
    const viz = el.querySelector('.viz');
    if (!d1 || (fn === 'DATEDIFF' && !d2)) { viz.innerHTML = '<p class="say">Pick a date.</p>'; return; }
    let call, pic = '', say = '';
    if (fn === 'DATEADD') {
      call = `DATEADD(${part}, ${n}, ${sq(d1)})`;
      const r = val(`SELECT ${call}`), a = parts3(d1), b = r.error ? a : parts3(r.v);
      const box = (p, q, ch) => `<span class="dbox ${ch ? 'on' : ''}"><small>${q}</small><b>${p}</b></span>`;
      pic = `<div class="dates"><div class="dset"><span class="cap">Start</span>${box(a[0], 'year')}${box(a[1], 'month')}${box(a[2], 'day')}</div><span class="arrow" aria-hidden="true">${n >= 0 ? '+' : ''}${n} ${NAMES[part]} ${ic('right')}</span><div class="dset"><span class="cap">Result</span>${box(b[0], 'year', a[0] !== b[0])}${box(b[1], 'month', a[1] !== b[1])}${box(b[2], 'day', a[2] !== b[2])}</div></div>`;
      say = 'DATEADD adds a number of dateparts to a date. The parts that change are lit. A negative number goes back in time.';
      viz.innerHTML = `<p class="say">${say}</p>${pic}<p class="resline">Result: <span class="big">${r.error ? esc(r.error) : esc(r.v)}</span></p>${code('SELECT ' + call)}`;
    } else if (fn === 'DATEDIFF') {
      call = `DATEDIFF(${part}, ${sq(d1)}, ${sq(d2)})`;
      const r = val(`SELECT ${call}`), bd = boundaries(d1, d2, part);
      const ticks = bd.out.map(p => `<i style="left:${(p * 100).toFixed(2)}%"></i>`).join('');
      pic = `<div class="tl ${bd.sign < 0 ? 'rev' : ''}" aria-hidden="true"><span class="e s">${esc(d1)}</span><span class="bar">${ticks}</span><span class="e t">${esc(d2)}</span></div>`;
      say = `DATEDIFF does not count full ${NAMES[part]}s. It counts how many ${NAMES[part]} <b>boundaries</b> lie between the two dates${part === 'wk' ? ' (a new week starts on Sunday)' : ''}. Each tick below is one boundary.` + (bd.cnt > 90 ? ' (Only the first 90 are drawn.)' : '');
      viz.innerHTML = `<p class="say">${say}</p>${pic}<p class="resline">Result: <span class="big">${r.error ? esc(r.error) : r.v}</span> ${NAMES[part]}(s)</p>${code('SELECT ' + call)}`;
    } else {
      call = `${fn}(${part}, ${sq(d1)})`;
      const r = val(`SELECT ${call}`);
      const all = [['yy', 'Year'], ['qq', 'Quarter'], ['mm', 'Month'], ['wk', 'Week'], ['dd', 'Day'], ['dw', 'Weekday']];
      pic = `<div class="dates parts">${all.map(([k, t]) => `<span class="dbox ${k === part ? 'on' : ''}"><small>${t}</small><b>${esc(fn === 'DATENAME' ? T.dateName(k, d1) : T.datePart(k, d1))}</b></span>`).join('')}</div>`;
      say = fn === 'DATEPART' ? 'DATEPART gives the chosen part as a <b>number</b>.' : 'DATENAME gives the chosen part as <b>text</b>. For month and weekday that is the name.';
      viz.innerHTML = `<p class="say">${say}</p>${pic}<p class="resline">Result: <span class="big">${r.error ? esc(r.error) : esc(r.v)}</span></p>${code('SELECT ' + call)}`;
    }
  }
  el.onclick = e => { const b = e.target.closest('.seg button'); if (b) { fn = b.dataset.v; draw(true); } };
  el.oninput = e => {
    const k = e.target.dataset.k; if (!k) return;
    if (k === 'n') n = e.target.value === '' ? 0 : +e.target.value; else if (k === 'part') part = e.target.value; else if (k === 'd1') d1 = e.target.value; else d2 = e.target.value;
    draw(false);
  };
  draw(true);
}

/* ---------- CONVERT styles ---------- */
function convert(el) {
  let d = '1948-12-08', style = 1;
  const STY = [1, 3, 6, 9, 101, 103, 106, 107, 108, 110, 112, 120];
  el.innerHTML = `<div class="fields"><label>Date<input class="in" type="date" value="${d}"></label></div><div class="chips" role="group" aria-label="Style number">${STY.map(s => `<button type="button" class="chip" data-s="${s}" aria-pressed="${s === style}">${s}</button>`).join('')}</div><div class="viz"></div>`;
  const viz = el.querySelector('.viz');
  function draw() {
    if (!d) { viz.innerHTML = '<p class="say">Pick a date.</p>'; return; }
    const call = `CONVERT(varchar(20), ${sq(d)}, ${style})`, r = val(`SELECT ${call}`);
    viz.innerHTML = `<p class="say">The style number is the third argument. It decides how the date is written as text.</p><p class="resline">Result: <span class="big mono">${r.error ? esc(r.error) : esc(r.v)}</span></p>${code('SELECT ' + call)}` +
      `<div class="scroll"><table class="rs"><thead><tr><th>Style</th><th>Output</th></tr></thead><tbody>${STY.map(s => { const x = val(`SELECT CONVERT(varchar(30), ${sq(d)}, ${s})`); return `<tr class="${s === style ? 'hit' : ''}"><td>${s}</td><td class="mono">${esc(x.v)}</td></tr>`; }).join('')}</tbody></table></div>`;
  }
  el.oninput = e => { if (e.target.type === 'date') { d = e.target.value; draw(); } };
  el.querySelector('.chips').onclick = e => { const b = e.target.closest('button'); if (b) { style = +b.dataset.s; el.querySelectorAll('.chips button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.s === b.dataset.s))); draw(); } };
  draw();
}

export const labs = { parts, like, logic, between, inlist, string, number, date, convert };
export const motionOK = () => !reduceMotion();
