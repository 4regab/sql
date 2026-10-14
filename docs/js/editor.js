/* editor.js: "Try it Yourself" box. Runs a query, shows the result, can play the query step by step,
   and can check an exercise by running the model answer and comparing the two results. */
import * as D from './db.js';
import { esc, hl, resultTable, affected, ic } from './ui.js';
import { mountStepper } from './stepper.js';
import { rich } from './quiz.js';

export function tablesHtml() {
  return Object.values(D.schema).map(t => {
    const sample = D.tableRows(t.name);
    return `<details class="tbl"><summary><b>${esc(t.name)}</b> <span class="mini">${sample.rows.length} rows · ${t.cols.length} columns</span></summary>
      <div class="scroll" tabindex="0"><table class="rs"><thead><tr><th>Column</th><th>Type</th></tr></thead><tbody>${t.cols.map(c => `<tr><td class="mono">${esc(c.name)}</td><td class="mono">${esc(c.type)}</td></tr>`).join('')}</tbody></table></div>
      <p class="mini">First rows:</p>${resultTable(sample.names, sample.rows.slice(0, 3), t.cols.map(c => /money/.test(c.type)))}</details>`;
  }).join('');
}

const norm = v => (typeof v === 'number' ? +v.toFixed(6) : typeof v === 'string' ? v : v);
const key = r => JSON.stringify(r.map(norm));

/* Compare the learner's result with the model answer. Returns '' when it matches, or a hint that does not give the answer away. */
function compare(mine, want, task, sql) {
  if (mine.error) return mine.error;
  if (want.error) return 'The model answer failed to run. Please report this.';
  if (mine.headers.length !== want.headers.length) return `Your result has ${mine.headers.length} column(s). The question asks for ${want.headers.length}.`;
  if (task.headers) {
    const bad = want.headers.findIndex((h, i) => h.toLowerCase() !== String(mine.headers[i]).toLowerCase());
    if (bad >= 0) return `Check the heading of column ${bad + 1}. It should be named exactly as the question says.`;
  }
  if (mine.rows.length !== want.rows.length) return `Your result has ${mine.rows.length} row(s). It should have ${want.rows.length}.`;
  const a = mine.rows.map(key), b = want.rows.map(key);
  if (task.ordered) { if (a.some((x, i) => x !== b[i])) return 'You have the right rows, but not in the right order. Check ORDER BY.'; }
  else if (a.slice().sort().join() !== b.slice().sort().join()) return 'The number of rows and columns is right, but some values are different. Check the columns you picked and your condition.';
  const miss = (task.need || []).find(w => !uses(sql, w));
  if (miss) return `Your result is right, but this question asks you to use ${miss}. Write it that way, as you would in the exam.`;
  return '';
}

/* Does the query use this keyword or phrase? Text in quotes and comments does not count. */
export function uses(sql, w) {
  const bare = sql.replace(/'(?:[^']|'')*'?|--[^\n]*/g, ' ');
  const e = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`${/^\w/.test(w) ? '\\b' : ''}${e}${/\w$/.test(w) ? '\\b' : ''}`, 'i').test(bare);
}

export function mountEditor(host, o, store) {
  const task = o.task, id = o.id;
  let fails = 0;
  // o.bare: used inside a quiz. The quiz shows the question itself, and there is no Watch button, like in an exam.
  // The tables the model answer reads, with their columns, so the learner knows the exact names to type.
  const used = task ? [...new Set([...task.a.matchAll(/\b(?:FROM|JOIN)\s+\[?(\w+)/gi)].map(m => m[1].toLowerCase()))].map(n => D.schema[n]).filter(Boolean) : [];
  host.innerHTML = `<div class="try">
    ${task && !o.bare ? `<p class="task"><b>Exercise.</b> ${rich(task.q)}</p>` : ''}
    ${used.map(t => `<p class="ctx"><b>Use the ${esc(t.name)} table.</b> Its columns: ${t.cols.map(c => `<code title="${esc(c.type)}">${esc(c.name)}</code>`).join(' ')}</p>`).join('')}
    <label class="sr" for="ed-${id}">SQL query</label>
    <textarea id="ed-${id}" class="ed mono" rows="${Math.min(10, Math.max(3, (o.sql || '').split('\n').length + 1))}" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="${task ? 'Write your query here' : ''}">${esc(o.sql || '')}</textarea>
    <div class="bar"><button type="button" class="btn pri" data-a="run">${ic('play')} Run</button>
      ${task ? `<button type="button" class="btn" data-a="check">${ic('ok')} Check answer</button>` : ''}
      ${o.bare ? '' : '<button type="button" class="btn" data-a="watch">Watch it run</button>'}
      <button type="button" class="btn ghost" data-a="reset">Reset</button>
      <button type="button" class="btn ghost" data-a="tables" aria-expanded="false">Tables</button></div>
    <div class="fbk" aria-live="polite"></div>
    <div class="res"></div><div class="watch"></div><div class="tbls" hidden></div></div>`;
  const ta = host.querySelector('textarea'), res = host.querySelector('.res'), fbk = host.querySelector('.fbk'), watch = host.querySelector('.watch'), tbls = host.querySelector('.tbls');
  const initial = o.sql || '';

  function run() {
    watch.innerHTML = '';
    const r = D.run(ta.value);
    if (r.error) { res.innerHTML = `<p class="msg err" role="alert"><b>Error.</b> ${esc(r.error)}</p>`; return r; }
    res.innerHTML = resultTable(r.headers, r.rows, r.money) + `<p class="foot">${affected(r.rows.length)}${r.capped ? ' (first 500 shown)' : ''}</p>`;
    return r;
  }
  host.addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'run') { fbk.innerHTML = ''; run(); }
    if (a === 'reset') { ta.value = initial; res.innerHTML = ''; fbk.innerHTML = ''; watch.innerHTML = ''; }
    if (a === 'watch') { res.innerHTML = ''; fbk.innerHTML = ''; mountStepper(watch, ta.value); watch.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    if (a === 'tables') {
      const open = tbls.hidden; tbls.hidden = !open; b.setAttribute('aria-expanded', String(open));
      if (open && !tbls.innerHTML) tbls.innerHTML = tablesHtml();
    }
    if (a === 'check') {
      const mine = run(), want = D.run(task.a), why = compare(mine, want, task, ta.value);
      if (!why) {
        fbk.className = 'fbk ok'; fbk.innerHTML = `<p><b>Correct.</b> ${task.why ? rich(task.why) : 'Your result matches.'}</p>`;
        store.task(id);
      } else {
        fails++; fbk.className = 'fbk no';
        fbk.innerHTML = `<p><b>Not yet.</b> ${esc(why)}</p>` + (fails >= 2 ? '<button type="button" class="btn ghost" data-a="sol">Show a model answer</button>' : '');
      }
    }
    if (a === 'sol') { if (store.sol) store.sol(id); fbk.innerHTML = `<p><b>One model answer:</b></p><pre class="sql"><code>${hl(task.a)}</code></pre>${task.why ? `<p>${rich(task.why)}</p>` : ''}`; fbk.className = 'fbk'; }
  });
  ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); fbk.innerHTML = ''; run(); } });
}
