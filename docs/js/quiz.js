/* quiz.js: multiple-choice quiz with instant feedback and a saved best score. */
import { esc, hl } from './ui.js';

/* Plain text with two small marks: **bold** and `code`. Everything else is escaped. */
export const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
export const PASS = 0.75;

export function mountQuiz(host, qs, saved, onDone) {
  let i = 0, score = 0;
  const shuffle = a => { const b = a.slice(); for (let j = b.length - 1; j > 0; j--) { const k = Math.floor(Math.random() * (j + 1)); [b[j], b[k]] = [b[k], b[j]]; } return b; };

  function draw() {
    if (i >= qs.length) return finish();
    const q = qs[i], tf = q.o.length === 2 && /^(True|False)$/.test(q.o[0]);
    const order = tf ? q.o.map((_, n) => n) : shuffle(q.o.map((_, n) => n));
    host.innerHTML = `<div class="quiz"><p class="qn"><span>Question ${i + 1} of ${qs.length}</span><span class="qbar" aria-hidden="true"><i style="width:${(i / qs.length) * 100}%"></i></span></p>
      <p class="qq" id="qq">${rich(q.q)}</p>${q.code ? `<pre class="sql"><code>${hl(q.code)}</code></pre>` : ''}
      <div class="opts" role="group" aria-labelledby="qq">${order.map(n => `<button type="button" class="opt" data-n="${n}">${rich(q.o[n])}</button>`).join('')}</div>
      <div class="fb" aria-live="polite"></div></div>`;
    host.querySelector('.opts').addEventListener('click', e => {
      const b = e.target.closest('.opt'); if (!b || b.disabled) return;
      const pick = +b.dataset.n, right = pick === q.a;
      if (right) score++;
      host.querySelectorAll('.opt').forEach(o => {
        o.disabled = true;
        if (+o.dataset.n === q.a) o.classList.add('good');
        else if (o === b) o.classList.add('bad');
      });
      const fb = host.querySelector('.fb');
      fb.className = 'fb ' + (right ? 'ok' : 'no');
      fb.innerHTML = `<p><b>${right ? 'Correct.' : 'Not quite.'}</b> ${rich(q.why || '')}</p><button type="button" class="btn pri">${i + 1 < qs.length ? 'Next question' : 'See my score'}</button>`;
      const next = fb.querySelector('button'); next.focus();
      next.onclick = () => { i++; draw(); };
    });
  }
  function finish() {
    const pct = score / qs.length, pass = pct >= PASS;
    const prev = saved && saved.total ? saved.best / saved.total : 0;
    onDone(score, qs.length);
    host.innerHTML = `<div class="quiz done ${pass ? 'pass' : ''}"><p class="big">${score} / ${qs.length}</p>
      <p>${pass ? 'Well done. This section is complete.' : `You need ${Math.ceil(PASS * qs.length)} correct to pass. Read the section again, watch the pictures, then try once more.`}</p>
      ${prev > pct ? `<p class="mini">Your best so far: ${saved.best} / ${saved.total}</p>` : ''}
      <button type="button" class="btn pri" data-r>Try again</button></div>`;
    host.querySelector('[data-r]').onclick = () => { i = 0; score = 0; draw(); };
  }
  i = 0; score = 0;
  if (saved && saved.total) {
    host.innerHTML = `<div class="quiz start"><p>${saved.best >= Math.ceil(PASS * saved.total) ? 'Completed' : 'Attempted'}. Best score: <b>${saved.best} / ${saved.total}</b></p><button type="button" class="btn pri" data-s>Take the quiz again</button></div>`;
    host.querySelector('[data-s]').onclick = draw;
  } else {
    host.innerHTML = `<div class="quiz start"><p>${qs.length} questions. You get the answer straight after each one.</p><button type="button" class="btn pri" data-s>Start the quiz</button></div>`;
    host.querySelector('[data-s]').onclick = draw;
  }
}
