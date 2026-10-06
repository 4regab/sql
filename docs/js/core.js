/* core.js — state, navigation (rail + drawer), chrome, helpers.
   Reads #navData JSON. Storage key: <body data-key="...">. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NAV = JSON.parse($('#navData').textContent);
const FLAT = NAV.flatMap(c => c.lessons.map(([id, t], i) => ({ id, t, ch: c, first: i === 0 })));
const KEY = document.body.dataset.key || 'html-explainer-v1';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches;

const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  reset: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.6.8 1.4.8 2.4h6c0-1 .2-1.8.8-2.4A6 6 0 0 0 12 3z"/></svg>',
  laurel: '<svg viewBox="0 0 24 24"><path d="M12 21V9"/><path d="M12 9c-3-1-5-4-5-7 3 1 5 4 5 7zM12 9c3-1 5-4 5-7-3 1-5 4-5 7z"/><path d="M12 15c-3 0-6-2-7-5 3 0 6 2 7 5zM12 15c3 0 6-2 7-5-3 0-6 2-7 5z"/></svg>'
};

const App = window.App = {
  $, $$, NAV, FLAT, ICON, motionOK,
  get state(){ return state; },
  set state(v){ state = v; },
  save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} },
  total(){ return Object.values(window.QUIZ).reduce((n, a) => n + a.length, 0); },
  doneCount(id){ return window.QUIZ[id].filter((_, i) => state[id + '-' + i]).length; },
  sectionDone(id){ return App.doneCount(id) === window.QUIZ[id].length; },
  xp(){ return Object.values(state).reduce((n, r) => n + r.xp, 0); },
  listeners: [],
  onChange(fn){ App.listeners.push(fn); },
  changed(){ App.listeners.forEach(f => f()); }
};

/* ---------- rail (collapsed sidebar) ---------- */
$('#rail').innerHTML = FLAT.map((l, i) => `<a href="#${l.id}" data-id="${l.id}" data-ch="${l.ch.id}" class="${l.first && i ? 'sep' : ''}" data-tip="${String(i + 1).padStart(2, '0')} · ${l.t}" style="--c:${l.ch.accent}" aria-label="Section ${i + 1}: ${l.t}">
  <svg viewBox="0 0 40 40" aria-hidden="true"><circle class="bg" cx="20" cy="20" r="18"/><circle class="fg" cx="20" cy="20" r="18"/></svg>${String(i + 1).padStart(2, '0')}</a>`).join('');

/* ---------- drawer (expanded sidebar) ---------- */
$('#drNav').innerHTML = NAV.map(c => `
  <a class="dr-ch" href="#ch-${c.id}" data-ch="${c.id}" style="--c:${c.accent}">
    <span class="dr-n">${c.num}</span><span class="dr-t">${c.full}</span><span class="dr-m"><span class="dr-c"></span><b><i></i></b></span></a>
  ${c.lessons.length > 1 ? `<ul class="dr-ls" style="--c:${c.accent}">${c.lessons.map(([id, t]) => `<li><a href="#${id}" data-id="${id}"><i></i>${t}</a></li>`).join('')}</ul>` : ''}`).join('');

const drawer = $('#drawer'), menuBtn = $('#menuBtn'), main = $('#main');
function setDrawer(open){
  document.body.classList.toggle('nav-open', open);
  drawer.inert = !open; drawer.setAttribute('aria-hidden', String(!open));
  main.inert = open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close contents' : 'Open contents');
  if (open){
    $('#drClose').focus({ preventScroll: true });
    if (motionOK && window.gsap) gsap.fromTo($$('.dr-ch, .dr-ls li', drawer), { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .7, ease: 'expo.out', stagger: .035, delay: .15 });
  } else menuBtn.focus({ preventScroll: true });
}
App.setDrawer = setDrawer;
menuBtn.addEventListener('click', () => setDrawer(!document.body.classList.contains('nav-open')));
$('#drClose').addEventListener('click', () => setDrawer(false));
$('#scrim').addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setDrawer(false); });

/* ---------- in-page links: smooth, and close the drawer ---------- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const t = document.getElementById(a.getAttribute('href').slice(1));
  if (!t) return;
  e.preventDefault();
  const wasOpen = document.body.classList.contains('nav-open');
  if (wasOpen) setDrawer(false);
  const y = t.getBoundingClientRect().top + scrollY - (t.matches('.chapter, .fp, .rooms') ? 0 : 76);
  setTimeout(() => window.scrollTo({ top: y, behavior: motionOK ? 'smooth' : 'auto' }), wasOpen ? 260 : 0);
  history.replaceState(null, '', '#' + t.id);
});

/* ---------- progress UI ---------- */
function paintProgress(){
  NAV.forEach(c => {
    const tot = c.lessons.reduce((n, [id]) => n + window.QUIZ[id].length, 0);
    const got = c.lessons.reduce((n, [id]) => n + App.doneCount(id), 0);
    const d = $(`.dr-ch[data-ch="${c.id}"]`);
    if (d){ $('.dr-c', d).textContent = got === tot ? 'Complete' : `${got} / ${tot}`; $('b i', d).style.transform = `scaleX(${got / tot})`; }
    c.lessons.forEach(([id]) => { const l = $(`.dr-ls a[data-id="${id}"]`); if (l) l.classList.toggle('done', App.sectionDone(id));
      const r = $(`#rail a[data-id="${id}"] .fg`); if (r) r.style.strokeDashoffset = 113.1 * (1 - App.doneCount(id) / window.QUIZ[id].length); });
  });
}
let xpShown = 0;
function paintXP(){
  const target = App.xp(), el = $('#xpVal');
  if (motionOK && window.gsap){
    const o = { v: xpShown };
    gsap.to(o, { v: target, duration: .9, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) });
    if (target > xpShown) gsap.fromTo('#xp', { scale: 1.12 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' });
  } else el.textContent = target;
  xpShown = target;
}
App.onChange(paintProgress); App.onChange(paintXP);

/* ---------- "now" label + accent ---------- */
App.setNow = (chId, lessonId) => {
  const c = NAV.find(x => x.id === chId);
  const n = $('#nowN'), t = $('#nowT');
  const label = c ? c.title : chId === 'results' ? 'Results' : 'Front page';
  const num = c ? c.num : '';
  if (t.textContent !== label){
    const swap = () => { n.textContent = num; t.textContent = label; };
    if (motionOK && window.gsap) gsap.timeline().to('#now > *', { yPercent: -60, autoAlpha: 0, duration: .2, ease: 'power2.in', onComplete: swap }).fromTo('#now > *', { yPercent: 60 }, { yPercent: 0, autoAlpha: 1, duration: .35, ease: 'expo.out' });
    else swap();
  }
  document.documentElement.style.setProperty('--pc', c ? lighten(c.accent) : '#e3a66f');
  $$('.dr-ch').forEach(a => a.classList.toggle('is-on', a.dataset.ch === chId));
  $$('#rail a').forEach(a => a.classList.toggle('is-on', a.dataset.id === lessonId));
  $$('.dr-ls a').forEach(a => a.classList.toggle('is-on', a.dataset.id === lessonId));
};
function lighten(hex){
  const n = parseInt(hex.slice(1), 16), mix = v => Math.round(v + (255 - v) * .38);
  return `rgb(${mix(n >> 16)},${mix(n >> 8 & 255)},${mix(n & 255)})`;
}

/* ---------- toast ---------- */
App.toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2600); };

/* ---------- reset ---------- */
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all answers and XP?')) return;
  state = {}; App.save(); App.renderAllQuizzes(); App.changed();
});

/* ---------- segmented filter (Main Characters) ---------- */
$$('.seg[data-filter]').forEach(seg => {
  const list = document.getElementById(seg.dataset.filter);
  const btns = $$('button', seg);
  const ind = document.createElement('span'); ind.className = 'seg-ind'; seg.prepend(ind);
  const place = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  const pick = (b, focus) => {
    btns.forEach(x => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
    place(b); if (focus) b.focus();
    const f = b.dataset.f, rows = $$('.cast-row', list);
    rows.forEach(r => r.classList.toggle('is-out', f !== 'all' && r.dataset.g !== f));
    if (motionOK && window.gsap) gsap.fromTo(rows.filter(r => !r.classList.contains('is-out')), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, ease: 'expo.out', stagger: .03, overwrite: true });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  btns.forEach((b, i) => {
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); pick(btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length], true);
    });
  });
  const init = () => { const b = btns.find(x => x.classList.contains('on')) || btns[0]; btns.forEach(x => x.setAttribute('aria-selected', String(x === b))); place(b); };
  requestAnimationFrame(init); document.fonts && document.fonts.ready.then(init);
  new ResizeObserver(() => { const b = btns.find(x => x.getAttribute('aria-selected') === 'true'); if (b) place(b); }).observe(seg);
});
})();
