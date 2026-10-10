/* app.js: pages, menu, progress. Hash routes: #/ (home), #/s/<section>, #/r/<lesson review>. */
import * as D from './db.js';
import { LESSONS } from './content.js';
import { mountStepper } from './stepper.js';
import { labs } from './labs.js';
import { mountEditor, tablesHtml } from './editor.js';
import { mountQuiz, rich, PASS } from './quiz.js';
import { esc, hl, ic } from './ui.js';

const $ = s => document.querySelector(s);
const app = $('#app'), navEl = $('#nav');

/* ---------- units (each page of the course) and saved progress ---------- */
const UNITS = [];
LESSONS.forEach(L => {
  L.sections.forEach((s, i) => UNITS.push({ id: s.id, kind: 's', L, s, i, href: `#/s/${s.id}`, title: s.title, qs: s.quiz }));
  UNITS.push({ id: 'r-' + L.id, kind: 'r', L, href: `#/r/${L.id}`, title: 'Lesson review', qs: L.review.quiz });
});
const KEY = 'sqlsite.v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const P = Object.assign({ visited: {}, quiz: {}, tasks: {} }, read());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* private mode: progress lasts for this visit only */ } };
const passed = u => { const q = P.quiz[u.id]; return !!q && q.best / q.total >= PASS; };
const store = {
  quiz(id, score, total) {
    const old = P.quiz[id];
    P.quiz[id] = { best: old && old.total === total ? Math.max(old.best, score) : score, total };
    save(); drawNav();
  },
  task(id) { if (!P.tasks[id]) { P.tasks[id] = 1; save(); drawNav(); } }
};

/* ---------- menu ---------- */
function drawNav() {
  const cur = location.hash || '#/';
  const done = UNITS.filter(passed).length;
  $('#prog').textContent = `${done}/${UNITS.length} done`;
  $('#prog').setAttribute('aria-label', `${done} of ${UNITS.length} parts complete`);
  navEl.innerHTML = `<a class="nav-home" href="#/"${cur === '#/' ? ' aria-current="page"' : ''}>Home</a>` + LESSONS.map(L => {
    const us = UNITS.filter(u => u.L === L);
    return `<div class="nav-l"><h2>Lesson ${L.n}<small>${esc(L.title)}</small></h2><ol>${us.map(u => {
      const st = passed(u) ? [ic('ok'), 'done', 'complete'] : P.visited[u.id] ? [ic('dot'), 'seen', 'started'] : [ic('ring'), '', 'not started'];
      return `<li><a href="${u.href}" ${cur === u.href ? 'aria-current="page"' : ''}><span class="st ${st[1]}" role="img" aria-label="${st[2]}">${st[0]}</span><span>${u.kind === 's' ? `${u.i + 1}. ` : ''}${esc(u.title)}</span></a></li>`;
    }).join('')}</ol></div>`;
  }).join('');
}
const setNav = open => { document.body.classList.toggle('nav-open', open); $('#menu').setAttribute('aria-expanded', String(open)); };
$('#menu').onclick = () => setNav(!document.body.classList.contains('nav-open'));
$('#scrim').onclick = () => setNav(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
navEl.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });

/* ---------- page parts ---------- */
function blocks(root, list, id) {
  let n = 0;
  for (const [t, a, o = {}] of list) {
    const el = document.createElement(['demo', 'lab', 'try', 'tables'].includes(t) ? 'section' : 'div');
    el.className = 'blk b-' + t;
    if (t === 'h') el.innerHTML = `<h3>${rich(a)}</h3>`;
    else if (t === 'p') el.innerHTML = `<p>${rich(a)}</p>`;
    else if (t === 'list') el.innerHTML = `<ul>${a.map(x => `<li>${rich(x)}</li>`).join('')}</ul>`;
    else if (t === 'note') el.innerHTML = `<aside class="note"><b>${o.label || 'Note'}</b><p>${rich(a)}</p></aside>`;
    else if (t === 'code') el.innerHTML = `<figure><pre class="sql" tabindex="0"><code>${hl(a)}</code></pre>${o.cap ? `<figcaption>${rich(o.cap)}</figcaption>` : ''}</figure>`;
    else if (t === 'table') el.innerHTML = `<div class="scroll" tabindex="0"><table class="rs plain"><thead><tr>${a.map(h => `<th>${rich(h)}</th>`).join('')}</tr></thead><tbody>${o.rows.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    else if (t === 'html') el.innerHTML = a;
    else if (t === 'demo') { el.innerHTML = `<h4><span class="tag">Watch it run</span>${o.title ? rich(o.title) : ''}</h4><div class="host"></div>${o.after ? `<p class="after">${rich(o.after)}</p>` : ''}`; mountStepper(el.querySelector('.host'), a, o); }
    else if (t === 'lab') { el.innerHTML = `<h4><span class="tag lab">Play with it</span>${o.title ? rich(o.title) : ''}</h4><div class="host"></div>`; labs[a](el.querySelector('.host'), { n: n++, ...o }); }
    else if (t === 'try') { el.innerHTML = `<h4><span class="tag try">Try it yourself</span>${o.title ? rich(o.title) : ''}</h4><div class="host"></div>`; mountEditor(el.querySelector('.host'), { sql: a, id: `${id}-e${n++}`, task: o.q ? o : null }, store); }
    else if (t === 'tables') { el.innerHTML = `<h4><span class="tag">The practice tables</span></h4><p class="mini">Tap a table to see its columns and first rows. Every example in this course reads these tables.</p><div class="tlist">${tablesHtml()}</div>`; }
    root.append(el);
  }
}
function pager(i) {
  const prev = UNITS[i - 1], next = UNITS[i + 1];
  return `<nav class="pager" aria-label="Previous and next">${prev ? `<a class="btn" href="${prev.href}" rel="prev"><small>Previous</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}${next ? `<a class="btn pri" href="${next.href}" rel="next"><small>Next</small><span>${esc(next.kind === 'r' ? `Lesson ${next.L.n} review` : next.title)}</span></a>` : '<a class="btn pri" href="#/"><small>Finished</small><span>Back to the start</span></a>'}</nav>`;
}
function quizBlock(root, u) {
  const sec = document.createElement('section');
  sec.className = 'quizsec'; sec.id = 'quiz';
  sec.innerHTML = `<h2>${u.kind === 's' ? 'Section quiz' : 'Lesson quiz'}</h2><div class="host"></div>`;
  root.append(sec);
  mountQuiz(sec.querySelector('.host'), u.qs, P.quiz[u.id], (s, t) => store.quiz(u.id, s, t));
}

/* ---------- pages ---------- */
function home() {
  document.title = 'Learn SQL by watching it run';
  const total = UNITS.length, done = UNITS.filter(passed).length;
  const first = UNITS.find(u => !passed(u)) || UNITS[0];
  app.innerHTML = `<article class="page home">
    <header class="hero"><p class="eyebrow">Database Administration · Lessons 4 to 6</p><h1>Learn SQL by watching it run</h1>
      <p class="lede">Three short lessons on the SQL SELECT statement. Every example runs on a real database in your browser, one step at a time, so you can see what each part of a query does. Then you practise and take a quiz.</p>
      <p><a class="btn pri big" href="${first.href}">${done ? 'Continue learning' : 'Start Lesson 4'}</a></p>
      <p class="mini">${done} of ${total} parts complete. Your progress is saved on this device.</p></header>
    <ul class="how"><li><b>Watch</b><span>Step through a query clause by clause.</span></li><li><b>Play</b><span>Change an input and see the result move.</span></li><li><b>Try</b><span>Write real queries and get them checked.</span></li><li><b>Quiz</b><span>Answer a short quiz for every section and lesson.</span></li></ul>
    <div class="cards">${LESSONS.map(L => {
      const us = UNITS.filter(u => u.L === L), n = us.filter(passed).length;
      return `<a class="card" href="${us[0].href}"><small>Lesson ${L.n}</small><h2>${esc(L.title)}</h2><p>${esc(L.blurb)}</p><p class="mini">${L.sections.length} sections · ${n}/${us.length} complete</p><span class="bar" aria-hidden="true"><i style="width:${n / us.length * 100}%"></i></span></a>`;
    }).join('')}</div></article>`;
}
function section(id) {
  const i = UNITS.findIndex(u => u.id === id && u.kind === 's');
  if (i < 0) return home();
  const u = UNITS[i], { L, s } = u;
  document.title = `${s.title} · Lesson ${L.n}`;
  P.visited[u.id] = 1; save(); drawNav();
  app.innerHTML = `<article class="page"><p class="crumb">Lesson ${L.n} · Section ${u.i + 1} of ${L.sections.length}</p><h1>${rich(s.title)}</h1>${s.sub ? `<p class="lede">${rich(s.sub)}</p>` : ''}${u.i === 0 && L.outcomes ? `<aside class="goals"><b>After this lesson you can:</b><ol>${L.outcomes.map(x => `<li>${rich(x)}</li>`).join('')}</ol></aside>` : ''}<div class="body"></div></article>`;
  const art = app.querySelector('.page');
  blocks(art.querySelector('.body'), s.blocks, s.id);
  quizBlock(art, u);
  art.insertAdjacentHTML('beforeend', pager(i));
}
function review(lid) {
  const i = UNITS.findIndex(u => u.id === 'r-' + lid);
  if (i < 0) return home();
  const u = UNITS[i], { L } = u, R = L.review;
  document.title = `Lesson ${L.n} review`;
  P.visited[u.id] = 1; save(); drawNav();
  const solved = R.tasks.filter((_, k) => P.tasks[`${L.id}-t${k}`]).length;
  app.innerHTML = `<article class="page"><p class="crumb">Lesson ${L.n} · Review</p><h1>Lesson ${L.n} review</h1><p class="lede">${rich(R.intro)}</p><div class="body"></div></article>`;
  const art = app.querySelector('.page'), body = art.querySelector('.body');
  const ex = document.createElement('section');
  ex.innerHTML = `<h2>Exercises <span class="mini" id="solved">${solved} of ${R.tasks.length} solved</span></h2>${R.note ? `<p>${rich(R.note)}</p>` : ''}`;
  body.append(ex);
  R.tasks.forEach((t, k) => {
    const d = document.createElement('div');
    d.className = 'blk b-try';
    d.innerHTML = `<h4><span class="tag try">Exercise ${k + 1}</span></h4><div class="host"></div>`;
    ex.append(d);
    mountEditor(d.querySelector('.host'), { sql: t.start || '', id: `${L.id}-t${k}`, task: t }, {
      task: id => { store.task(id); const n = R.tasks.filter((_, j) => P.tasks[`${L.id}-t${j}`]).length; const el = document.getElementById('solved'); if (el) el.textContent = `${n} of ${R.tasks.length} solved`; }
    });
  });
  quizBlock(art, u);
  art.insertAdjacentHTML('beforeend', pager(i));
}

function route() {
  const [, kind, id] = (location.hash || '#/').split('/');
  if (kind === 's') section(id); else if (kind === 'r') review(id); else home();
  drawNav(); setNav(false);
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

(async function boot() {
  drawNav();
  try { await D.init(); } catch (e) {
    app.innerHTML = `<article class="page"><h1>The practice database did not start</h1><p class="msg err">${esc(e.message)}</p><p>This site needs to be opened through a web address (for example the GitHub Pages link), not as a file on your computer.</p></article>`;
    return;
  }
  addEventListener('hashchange', route);
  route();
})();
