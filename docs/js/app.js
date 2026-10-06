/* app.js: page motion for the course layout (replaces the newspaper motion.js).
   Reveals, chrome hide/show, progress bar, "now" label + rail, and the live hero query demo. */
(() => {
  const { $, $$, motionOK } = App;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* ---------- hero: a query that runs itself ---------- */
  (function hero() {
    const grid = $('#heroGrid'), q = $('#heroQ');
    if (!grid || !q || !window.SQLViz) return;
    const E = [['Davolio', 'Sales Representative', 'Seattle'], ['Fuller', 'Vice President, Sales', 'Tacoma'], ['Leverling', 'Sales Representative', 'Kirkland'],
      ['Peacock', 'Sales Representative', 'Redmond'], ['Buchanan', 'Sales Manager', 'London'], ['Suyama', 'Sales Representative', 'London'],
      ['King', 'Sales Representative', 'London'], ['Callahan', 'Inside Sales Coordinator', 'Seattle'], ['Dodsworth', 'Sales Representative', 'London']];
    const rows = E.map((e, i) => ({ id: 'h' + i, LastName: e[0], Title: e[1], City: e[2] }));
    const lon = rows.filter(r => r.City === 'London').map(r => r.id), not = rows.filter(r => r.City !== 'London').map(r => r.id);
    const mark = Object.fromEntries(rows.map(r => [r.id, r.City === 'London' ? 'ok' : 'no']));
    const cfg = { cols: [{ k: 'LastName', label: 'LastName', w: 1.2 }, { k: 'Title', label: 'Title', w: 2.1 }, { k: 'City', label: 'City', w: 1.1 }], rows };
    const eng = SQLViz.ENG.table(grid, cfg);
    const S = [
      ['SELECT LastName, Title, City\nFROM Employees', { cols: ['LastName', 'Title', 'City'] }],
      ["SELECT LastName, Title, City\nFROM Employees\nWHERE City = 'London'", { cols: ['LastName', 'Title', 'City'], hlc: ['City'], mark, scan: true }],
      ["SELECT LastName, Title, City\nFROM Employees\nWHERE City = 'London'", { cols: ['LastName', 'Title', 'City'], hlc: ['City'], hide: not }],
      ["SELECT LastName, Title\nFROM Employees\nWHERE City = 'London'", { cols: ['LastName', 'Title'], hide: not }],
      ["SELECT LastName, Title\nFROM Employees\nWHERE City = 'London'\nORDER BY LastName", { cols: ['LastName', 'Title'], hide: not, hlc: ['LastName'], order: ['h4', 'h8', 'h6', 'h5', ...not] }]
    ];
    const hl = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
      .replace(/'[^']*'/g, m => `<span class="t-s">${m}</span>`).replace(/\b(SELECT|FROM|WHERE|ORDER BY)\b/g, '<span class="t-k">$1</span>');
    let i = 0;
    const show = (k, an) => { q.innerHTML = hl(S[k][0]); eng.go(S[k][1], an); };
    if (!motionOK || !hasGSAP) { show(S.length - 1, false); return; }
    show(0, false);
    let paused = false;
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });
    setInterval(() => { if (paused || scrollY > innerHeight) return; i = (i + 1) % S.length; show(i, true); }, 2600);
    addEventListener('resize', () => show(i, false));
  })();

  if (!hasGSAP || !motionOK) { trackChrome(); return; }

  /* ---------- reveals ---------- */
  gsap.set('[data-rv]', { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch('[data-rv]', { start: 'top 92%', once: true, onEnter: b => {
    const past = [], vis = [];
    b.forEach(e => (e.getBoundingClientRect().bottom < 0 ? past : vis).push(e));
    if (past.length) gsap.set(past, { autoAlpha: 1, y: 0, overwrite: true });
    if (vis.length) gsap.to(vis, { autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', stagger: Math.min(.06, .5 / vis.length), overwrite: true });
  } });
  $$('.quiz').forEach(q => gsap.from(q, { y: 30, autoAlpha: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: q, start: 'top 94%', once: true } }));
  $$('.vz').forEach(v => gsap.from($('.vz-stage', v), { y: 30, autoAlpha: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: v, start: 'top 90%', once: true } }));
  $$('.op2-in').forEach(o => {
    gsap.from($('.op2-num', o), { yPercent: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: o, start: 'top 80%', once: true } });
    gsap.from($$('.op2-eb, .op2-t, .op2-l li', o), { y: 22, autoAlpha: 0, duration: .9, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: o, start: 'top 80%', once: true } });
  });
  gsap.from('.hero-copy > *', { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: .08 });
  gsap.from('.hero-demo', { y: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: .2 });
  gsap.from('.tc', { y: 24, autoAlpha: 0, duration: .8, ease: 'expo.out', stagger: .03, scrollTrigger: { trigger: '.toc-grid', start: 'top 85%', once: true } });
  $$('.code-i').forEach(el => gsap.from(el, { y: 20, autoAlpha: 0, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  trackChrome();
  requestAnimationFrame(() => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

  function trackChrome() {
    let lastY = scrollY, acc = 0;
    addEventListener('scroll', () => {
      const y = scrollY, d = y - lastY; lastY = y;
      acc = (Math.sign(d) === Math.sign(acc)) ? acc + d : d;
      const b = document.body;
      if (y < 140 || b.classList.contains('nav-open') || acc < -24) b.classList.remove('chrome-up');
      else if (acc > 48) b.classList.add('chrome-up');
    }, { passive: true });
    document.addEventListener('focusin', e => { if (e.target.closest && e.target.closest('#chrome')) document.body.classList.remove('chrome-up'); });
    if (!hasGSAP) return;
    gsap.to('#progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
    const rail = $('#rail');
    ScrollTrigger.create({ trigger: '.chapter', start: 'top 70%', endTrigger: '#results', end: 'top 70%', onToggle: s => rail.classList.toggle('is-hidden', !s.isActive) });
    rail.classList.add('is-hidden');
    let ch = 'intro', lesson = null;
    $$('section[data-ch]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) { ch = sec.dataset.ch; App.setNow(ch, lesson); } } }));
    $$('[data-lesson]').forEach(l => ScrollTrigger.create({ trigger: l, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) { lesson = l.id; App.setNow(ch, lesson); } } }));
  }
})();
