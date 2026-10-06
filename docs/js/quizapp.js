/* quizapp.js — DataCamp-style exercises + results */
(() => {
const { $, $$, FLAT, ICON } = App;
const Q = window.QUIZ, MAX = 50, HINT = 15, WRONG = 10, MIN = 10;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const anim = () => App.motionOK && window.gsap;

function nextHref(id){
  const i = FLAT.findIndex(l => l.id === id), n = FLAT[i + 1];
  if (!n) return ['#results', 'See your results'];
  return n.first ? ['#ch-' + n.ch.id, 'Next: ' + n.ch.title] : ['#' + n.id, 'Next section'];
}

function refreshLayout(box, before){
  if (window.ScrollTrigger && Math.abs(box.offsetHeight - before) > 2) ScrollTrigger.refresh();
}

function render(box){
  const before = box.offsetHeight;
  const id = box.dataset.quiz, qs = Q[id], st = App.state;
  const idx = qs.findIndex((_, i) => !st[id + '-' + i]);
  const earned = qs.reduce((n, _, i) => n + (st[id + '-' + i]?.xp || 0), 0);
  const dots = qs.map((_, i) => `<i class="${st[id + '-' + i] ? 'ok' : i === idx ? 'cur' : ''}"></i>`).join('');
  const head = right => `<div class="q-head"><span class="q-badge">Exercise</span><span class="q-title">Check your understanding</span><span class="q-xp">${right}</span></div><div class="q-dots" aria-hidden="true">${dots}</div>`;

  if (idx === -1){
    const first = qs.filter((_, i) => st[id + '-' + i].first).length, [href, label] = nextHref(id);
    box.innerHTML = head(`${earned} <small>/ ${qs.length * MAX} XP</small>`) + `<div class="q-done">
      <div class="seal">${ICON.laurel}</div><h4>Section complete</h4>
      <p>${first} of ${qs.length} correct on the first try · ${earned} XP earned</p>
      <div class="row"><button class="btn ghost" type="button" data-act="retry">${ICON.reset}Retry</button><a class="btn go" href="${href}">${label}${ICON.arrow}</a></div></div>`;
    $('[data-act="retry"]', box).onclick = () => { qs.forEach((_, i) => delete st[id + '-' + i]); App.save(); render(box); App.changed(); };
    refreshLayout(box, before);
    return;
  }

  const q = qs[idx], opts = shuffle([q.a, ...q.d]);
  let xp = MAX, usedHint = false, wrongs = 0, sel = null, locked = false;
  box.innerHTML = head(`<span class="cx">${MAX}</span> <small>XP</small>`) + `<div class="q-body">
    <p class="q-num">Question ${idx + 1} of ${qs.length}</p><p class="q-text">${q.q}</p>
    <div class="q-opts" role="radiogroup" aria-label="Answer choices">${opts.map((o, i) => `<button class="opt" type="button" role="radio" aria-checked="false" data-i="${i}"><span class="k">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div>
    <div class="feedback" aria-live="polite"></div>
    <div class="q-actions"><button class="btn ghost" type="button" data-act="hint">${ICON.bulb}Hint <span class="cost">−${HINT} XP</span></button><span class="sp"></span>
      <span class="kbd"><kbd>A</kbd>–<kbd>D</kbd> choose · <kbd>Enter</kbd> check</span>
      <button class="btn primary" type="button" data-act="submit" disabled>Check answer</button></div></div>`;

  const fb = $('.feedback', box), sub = $('[data-act="submit"]', box), hint = $('[data-act="hint"]', box), els = $$('.opt', box);
  const setXP = () => $('.cx', box).textContent = xp;
  const say = (cls, title, text) => {
    fb.className = 'feedback show ' + cls; fb.innerHTML = `<div><b>${title}</b><p>${text}</p></div>`;
    if (anim()) gsap.fromTo(fb, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, ease: 'expo.out' });
  };

  els.forEach(el => el.addEventListener('click', () => {
    if (locked || el.disabled) return;
    els.forEach(o => { o.classList.remove('sel'); o.setAttribute('aria-checked', 'false'); });
    el.classList.add('sel'); el.setAttribute('aria-checked', 'true'); sel = +el.dataset.i; sub.disabled = false;
  }));
  hint.addEventListener('click', () => {
    if (usedHint || locked) return;
    usedHint = true; xp = Math.max(MIN, xp - HINT); setXP(); hint.disabled = true; say('hint', 'Hint', q.h);
  });
  sub.addEventListener('click', () => {
    if (locked || sel === null) return;
    const el = els[sel];
    if (opts[sel] === q.a){
      locked = true; el.classList.remove('sel'); el.classList.add('right'); $('.k', el).innerHTML = ICON.check;
      els.forEach(o => o.disabled = true); hint.disabled = true;
      st[id + '-' + idx] = { xp, first: wrongs === 0 && !usedHint }; App.save(); App.changed();
      say('good', `Correct · +${xp} XP`, q.e);
      if (anim()) gsap.fromTo($('.k', el), { scale: .4 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.45)' });
      sub.className = 'btn go'; sub.innerHTML = (idx === qs.length - 1 ? 'Finish section' : 'Continue') + ICON.arrow; sub.focus({ preventScroll: true });
      sub.onclick = () => {
        const finishing = idx === qs.length - 1;
        render(box);
        if (finishing){ App.toast('Section complete'); if (anim()) gsap.fromTo($('.seal', box), { scale: .3, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'elastic.out(1,.5)' }); }
      };
    } else {
      wrongs++; xp = Math.max(MIN, xp - WRONG); setXP();
      el.classList.remove('sel'); el.classList.add('wrong', 'shake'); $('.k', el).innerHTML = ICON.x; el.disabled = true; sel = null; sub.disabled = true;
      say('bad', `Not quite · −${WRONG} XP`, usedHint ? 'Try again, or re-read the section above.' : 'Try again, or take a hint.');
    }
  });
  if (anim() && box.dataset.ready) gsap.from($$('.q-text, .opt', box), { y: 16, autoAlpha: 0, duration: .7, ease: 'expo.out', stagger: .05 });
  box.dataset.ready = '1';
  refreshLayout(box, before);
}

App.renderAllQuizzes = () => $$('[data-quiz]').forEach(render);

/* keyboard: A–D choose, Enter checks — applies to the exercise nearest the middle of the screen */
document.addEventListener('keydown', e => {
  if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey || document.body.classList.contains('nav-open')) return;
  const mid = innerHeight / 2;
  const box = $$('[data-quiz]').find(b => { const r = b.getBoundingClientRect(); return r.top < mid + 260 && r.bottom > mid - 260; });
  if (!box) return;
  const n = 'abcd'.indexOf(e.key.toLowerCase());
  if (n >= 0){ const o = $$('.opt', box)[n]; if (o && !o.disabled){ o.click(); o.focus({ preventScroll: true }); e.preventDefault(); } }
  if (e.key === 'Enter' && !e.target.closest('button, a')){ const s = $('[data-act="submit"]', box); if (s && !s.disabled){ s.click(); e.preventDefault(); } }
});

/* results */
function results(){
  const st = App.state, T = App.total();
  const first = Object.values(st).filter(r => r.first).length, answered = Object.keys(st).length;
  $('#ring').style.strokeDashoffset = 465 * (1 - first / T);
  $('#ringVal').innerHTML = `${Math.round(first / T * 100)}%<small>first-try accuracy</small>`;
  $('#resText').innerHTML = answered < T
    ? `You have answered <strong>${answered}</strong> of <strong>${T}</strong> questions and earned <strong>${App.xp()} XP</strong>.`
    : `Module complete: <strong>${first}</strong> of <strong>${T}</strong> correct on the first try, <strong>${App.xp()} / ${T * MAX} XP</strong>.`;
  $('#rows').innerHTML = FLAT.map(l => {
    const qs = Q[l.id], f = qs.filter((_, i) => st[l.id + '-' + i]?.first).length, d = App.doneCount(l.id);
    return `<div class="rrow"><a href="#${l.id}">${String(FLAT.indexOf(l) + 1).padStart(2, '0')} · ${l.t}</a><div class="bar"><i style="width:${d / qs.length * 100}%;background:${l.ch.accent}"></i></div><span>${f}/${qs.length}</span></div>`;
  }).join('');
}
App.onChange(results);
if ($('#roomsStat')) $('#roomsStat').textContent = App.total();
App.renderAllQuizzes();
App.changed();
})();
