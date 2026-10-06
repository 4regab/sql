/* sqllab.js: small interactive SQL labs (DISTINCT toggle, LIKE pattern tester, ROUND/CEILING/FLOOR).
   Each lab renders into [data-lab] and is skipped if absent. Data comes from the handout's Employees examples. */
(function () {
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TITLES = ['Sales Representative', 'Vice President, Sales', 'Sales Representative', 'Sales Representative', 'Sales Manager',
    'Sales Representative', 'Sales Representative', 'Inside Sales Coordinator', 'Sales Representative'];
  const NAMES = ['Davolio', 'Fuller', 'Leverling', 'Peacock', 'Buchanan', 'Suyama', 'King', 'Callahan', 'Dodsworth'];

  function distinct(b) {
    b.innerHTML = '<pre class="lab-q"></pre><div class="lab-row"><button type="button" class="lab-btn" aria-pressed="false">DISTINCT</button>' +
      '<span class="lab-lbl">Toggle the keyword</span></div><ul class="lab-list"></ul><p class="lab-out" aria-live="polite"></p>';
    const q = b.querySelector('.lab-q'), btn = b.querySelector('button'), ul = b.querySelector('ul'), out = b.querySelector('.lab-out');
    function draw() {
      const on = btn.getAttribute('aria-pressed') === 'true';
      q.textContent = 'SELECT ' + (on ? 'DISTINCT ' : '') + 'Title\nFROM   Employees';
      const rows = on ? Array.from(new Set(TITLES)).sort() : TITLES;
      ul.innerHTML = rows.map(t => '<li' + (on ? ' class="hit"' : '') + '>' + esc(t) + '</li>').join('');
      out.textContent = '(' + rows.length + ' row(s) affected)';
    }
    btn.addEventListener('click', () => { btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); draw(); });
    draw();
  }

  function like(b) {
    const presets = ['D%', '%g', '%ha%', '_E%'];
    b.innerHTML = '<pre class="lab-q"></pre><div class="lab-row"><label class="lab-lbl" for="likeIn">Pattern</label>' +
      '<input id="likeIn" class="lab-in" type="text" value="D%" autocomplete="off" spellcheck="false">' +
      presets.map(p => '<button type="button" class="lab-btn" data-p="' + esc(p) + '" aria-pressed="false">\'' + esc(p) + '\'</button>').join('') +
      '</div><ul class="lab-list"></ul><p class="lab-out" aria-live="polite"></p>';
    const q = b.querySelector('.lab-q'), inp = b.querySelector('input'), ul = b.querySelector('ul'), out = b.querySelector('.lab-out');
    function rx(p) {
      let s = '';
      for (const c of p) s += c === '%' ? '.*' : c === '_' ? '.' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('^' + s + '$', 'i');
    }
    function draw() {
      const p = inp.value;
      q.textContent = "SELECT LastName\nFROM   Employees\nWHERE  LastName LIKE '" + p + "'";
      const r = rx(p); let n = 0;
      ul.innerHTML = NAMES.map(x => { const h = r.test(x); if (h) n++; return '<li class="' + (h ? 'hit' : 'gone') + '">' + esc(x) + '</li>'; }).join('');
      out.textContent = n + ' of 9 last names match';
      $$('[data-p]', b).forEach(x => x.setAttribute('aria-pressed', x.dataset.p === p ? 'true' : 'false'));
    }
    inp.addEventListener('input', draw);
    $$('[data-p]', b).forEach(x => x.addEventListener('click', () => { inp.value = x.dataset.p; draw(); }));
    draw();
  }

  function round(b) {
    b.innerHTML = '<div class="lab-row"><label class="lab-lbl" for="rnIn">Number</label><input id="rnIn" class="lab-in" type="number" step="any" value="748.58">' +
      '<label class="lab-lbl" for="rnLen">Length</label><select id="rnLen" class="lab-in" style="width:auto">' +
      [-3, -2, -1, 0, 1, 2, 3].map(v => '<option' + (v === -1 ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div>' +
      '<div class="lab-grid"><div class="lab-cell"><b class="o-r"></b><span class="v-r"></span></div>' +
      '<div class="lab-cell"><b class="o-c"></b><span class="v-c"></span></div><div class="lab-cell"><b class="o-f"></b><span class="v-f"></span></div></div>';
    const inp = b.querySelector('#rnIn'), len = b.querySelector('#rnLen');
    const fix = v => Math.round(v * 1e9) / 1e9;
    function draw() {
      const x = parseFloat(inp.value), L = parseInt(len.value, 10);
      const ok = !isNaN(x), f = Math.pow(10, L);
      const r = ok ? fix(Math.sign(x) * Math.round(fix(Math.abs(x) * f)) / f) : '';
      b.querySelector('.o-r').textContent = 'ROUND(' + (ok ? x : '?') + ', ' + L + ')';
      b.querySelector('.o-c').textContent = 'CEILING(' + (ok ? x : '?') + ')';
      b.querySelector('.o-f').textContent = 'FLOOR(' + (ok ? x : '?') + ')';
      b.querySelector('.v-r').textContent = ok ? r : 'NULL';
      b.querySelector('.v-c').textContent = ok ? Math.ceil(x) : 'NULL';
      b.querySelector('.v-f').textContent = ok ? Math.floor(x) : 'NULL';
    }
    inp.addEventListener('input', draw); len.addEventListener('change', draw);
    draw();
  }

  const KIND = { distinct, like, round };
  $$('[data-lab]').forEach(el => { const f = KIND[el.dataset.lab], b = el.querySelector('.lab-b'); if (f && b) f(b); });
})();
