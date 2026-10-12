/* quiz.js: quiz with instant feedback and a saved best score.
   A question with options (o) is multiple choice. A question without options asks the learner to type a query:
   it is checked like an exercise, and it scores only if solved before the model answer is shown. */
import { esc, hl } from './ui.js';
import { mountEditor } from './editor.js';

/* Plain text with two small marks: **bold** and `code`. Everything else is escaped. */
export const rich = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
export const PASS = 0.75;
let uid = 0;

export function mountQuiz(host, qs, saved, onDone) {
  let i = 0, score = 0;
  const shuffle = a => { const b = a.slice(); for (let j = b.length - 1; j > 0; j--) { const k = Math.floor(Math.random() * (j + 1)); [b[j], b[k]] = [b[k], b[j]]; } return b; };
  const typed = qs.filter(q => !q.o).length;

  function next(fb) {
    fb.insertAdjacentHTML('beforeend', `<button type="button" class="btn pri">${i + 1 < qs.length ? 'Next question' : 'See my score'}</button>`);
    const b = fb.querySelector('button'); b.focus();
    b.onclick = () => { i++; draw(); };
  }
  function head(q) {
    return `<p class="qn"><span>Question ${i + 1} of ${qs.length}</span><span class="qbar" aria-hidden="true"><i style="width:${(i / qs.length) * 100}%"></i></span></p>
      <p class="qq" id="qq">${q.o ? '' : '<span class="tag try">Write the query</span> '}${rich(q.q)}</p>${q.code ? `<pre class="sql"><code>${hl(q.code)}</code></pre>` : ''}`;
  }

  function drawTyped(q) {
    host.innerHTML = `<div class="quiz">${head(q)}<div class="host"></div><div class="fb" aria-live="polite"></div></div>`;
    const fb = host.querySelector('.fb');
    let seen = false, over = false;
    const end = right => {
      if (over) return; over = true;
      if (right && !seen) score++;
      fb.className = 'fb ' + (right && !seen ? 'ok' : 'no');
      fb.innerHTML = `<p>${right && !seen ? '<b>Point scored.</b>' : '<b>No point for this one</b>, because you opened the model answer. Read it, then try a similar question later.'}</p>`;
      next(fb);
    };
    mountEditor(host.querySelector('.host'), { sql: q.start || '', id: 'qz' + uid++, task: q, bare: true }, {
      task: () => end(true),
      sol: () => { seen = true; end(false); }
    });
  }

  function draw() {
    if (i >= qs.length) return finish();
    const q = qs[i];
    if (!q.o) return drawTyped(q);
    const tf = q.o.length === 2 && /^(True|False)$/.test(q.o[0]);
    const order = tf ? q.o.map((_, n) => n) : shuffle(q.o.map((_, n) => n));
    host.innerHTML = `<div class="quiz">${head(q)}
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
      fb.innerHTML = `<p><b>${right ? 'Correct.' : 'Not quite.'}</b> ${rich(q.why || '')}</p>`;
      next(fb);
    });
  }
  function finish() {
    const pct = score / qs.length, pass = pct >= PASS;
    const prev = saved && saved.total ? saved.best / saved.total : 0;
    onDone(score, qs.length);
    host.innerHTML = `<div class="quiz done ${pass ? 'pass' : ''}"><p class="big">${score} / ${qs.length}</p>
      <p>${pass ? 'Well done. This part is complete.' : `You need ${Math.ceil(PASS * qs.length)} correct to pass. Read the section again, watch the pictures, then try once more.`}</p>
      ${prev > pct ? `<p class="mini">Your best so far: ${saved.best} / ${saved.total}</p>` : ''}
      <button type="button" class="btn pri" data-r>Try again</button></div>`;
    host.querySelector('[data-r]').onclick = () => { i = 0; score = 0; draw(); };
  }
  const about = `${qs.length} questions${typed ? `. In ${typed === qs.length ? 'every one' : typed === 1 ? 'one of them' : `${typed} of them`} you type a real query and run it` : ''}. You get the answer straight after each one.`;
  if (saved && saved.total) {
    host.innerHTML = `<div class="quiz start"><p>${saved.best >= Math.ceil(PASS * saved.total) ? 'Completed' : 'Attempted'}. Best score: <b>${saved.best} / ${saved.total}</b></p><p class="mini">${about}</p><button type="button" class="btn pri" data-s>Take the quiz again</button></div>`;
  } else {
    host.innerHTML = `<div class="quiz start"><p>${about}</p><button type="button" class="btn pri" data-s>Start the quiz</button></div>`;
  }
  host.querySelector('[data-s]').onclick = draw;
}
