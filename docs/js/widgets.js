/* widgets.js — pyramid, principles viewfinder, code of ethics, photo desk. Works with or without GSAP. */
(() => {
const { $, $$, motionOK } = App;
const io = (els, fn, opts) => { const o = new IntersectionObserver(es => es.forEach(e => fn(e, o)), opts); els.forEach(el => o.observe(el)); };

/* exercise count in the masthead strip */
$$('#fpCount').forEach(el => el.textContent = App.total());

/* ---------- inverted pyramid: highlight the tier being read ---------- */
$$('.pyr').forEach(pyr => {
  const tiers = $$('.tier', pyr), steps = $$('.step', pyr);
  const set = t => tiers.forEach(g => { const v = +g.dataset.t; g.classList.toggle('on', v === t); g.classList.toggle('past', t !== null && v < t); });
  set(null);
  io(steps, e => { if (e.isIntersecting) set(+e.target.dataset.t); }, { rootMargin: '-42% 0px -52% 0px' });
  io([$('.pyr-note', pyr)], e => { if (e.isIntersecting) set(null); }, { rootMargin: '-42% 0px -52% 0px' });
});

/* ---------- principles: viewfinder corners close in ---------- */
io($$('.prin'), (e, o) => { if (e.isIntersecting){ e.target.classList.add('in'); o.unobserve(e.target); } }, { rootMargin: '0px 0px -18% 0px' });

/* ---------- code of ethics: each standard lights up as it is reached ---------- */
const codeItems = $$('.code-i');
if (!motionOK) codeItems.forEach(i => i.classList.add('is-read'));
else io(codeItems, (e, o) => { if (e.isIntersecting){ e.target.classList.add('is-read'); o.unobserve(e.target); } }, { rootMargin: '0px 0px -14% 0px' });

/* ---------- hard/soft scale fallback ---------- */
if (!motionOK || !window.gsap) $$('.sc-dot').forEach(d => d.style.setProperty('--p', '30%'));

/* ---------- photo desk (verdict names come from data-name on each .tool) ---------- */
const stage = $('#deskStage');
if (stage){
  const imgs = $$('.desk-img, .desk-blur', stage), verdict = $('#deskVerdict'), tools = $$('.tool');
  const FILTER = { gray: 'grayscale(1)', tone: 'contrast(1.07) brightness(1.03)', sat: 'saturate(2.9) contrast(1.25)' };
  const NAME = { crop: 'Cropping', burn: 'Dodging and burning', gray: 'Conversion into grayscale', tone: 'Normal toning', blur: 'A digitally blurred background', sat: 'A substantial change in saturation' };
  const nm = k => (tools.find(t => t.dataset.tool === k) || {}).dataset?.name || NAME[k];
  const paint = () => {
    const on = tools.filter(t => t.getAttribute('aria-pressed') === 'true').map(t => t.dataset.tool);
    ['crop', 'burn', 'blur'].forEach(k => stage.classList.toggle(k, on.includes(k)));
    const f = on.filter(k => FILTER[k]).map(k => FILTER[k]).join(' ');
    imgs.forEach((im, i) => im.style.filter = (f + (i ? ' blur(9px)' : '')).trim() || (i ? 'blur(9px)' : ''));
    const bad = on.filter(k => k === 'blur' || k === 'sat');
    if (!on.length){ verdict.className = 'desk-verdict'; verdict.innerHTML = '<b>Original</b><span>Toggle an adjustment to see the verdict.</span>'; }
    else if (bad.length){ verdict.className = 'desk-verdict bad'; verdict.innerHTML = `<b>Not acceptable</b><span>${bad.map(nm).join(' and ')}: not acceptable under the standard above.</span>`; }
    else { verdict.className = 'desk-verdict good'; verdict.innerHTML = `<b>Acceptable</b><span>${on.map(nm).join(', ')}: acceptable under the standard above.</span>`; }
    if (motionOK && window.gsap) gsap.fromTo(verdict, { y: 6, autoAlpha: .4 }, { y: 0, autoAlpha: 1, duration: .45, ease: 'expo.out' });
  };
  tools.forEach(t => t.addEventListener('click', () => { t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true')); paint(); }));
  $('#deskReset').addEventListener('click', () => { tools.forEach(t => t.setAttribute('aria-pressed', 'false')); paint(); });
}
})();
