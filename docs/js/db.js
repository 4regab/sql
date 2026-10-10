/* db.js: the practice database.
   Runs a real SQL engine (SQLite, compiled to WebAssembly) in the browser and teaches it the SQL Server style
   used in the handout: + joins text, [alias], alias = expr, LEN/LEFT/DATEADD/CAST/CONVERT, 'mm-dd-yyyy' dates, SQL Server error text.
   Read-only: only SELECT is accepted. */
import * as T from './tsql.js';

export class SqlError extends Error {}
const fail = m => { throw new SqlError(m); };

let db = null;
export const schema = {};   // lower-case table name -> { name, cols: [{ name, type }] }
const colKind = {};         // lower-case column name -> text | num | money | date
const kindOfType = t => (/char|text/i.test(t) ? 'text' : /date/i.test(t) ? 'date' : /money/i.test(t) ? 'money' : 'num');

export async function init() {
  if (db) return;
  await new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = 'js/vendor/sql-wasm.js'; s.onload = ok; s.onerror = () => no(new Error('Could not load the SQL engine.'));
    document.head.append(s);
  });
  const SQL = await window.initSqlJs({ locateFile: f => 'js/vendor/' + f });
  attach(SQL, await (await fetch('data/northwind.sql')).text());
}
export function attach(SQL, seed) {
  db = new SQL.Database();
  T.register(db);
  // SQL Server compares text without caring about upper/lower case. NOCASE gives the same behaviour.
  db.run(seed.replace(/\b(nvarchar|nchar)\((\d+)\)/g, '$1($2) COLLATE NOCASE'));
  const names = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map(r => r[0]);
  for (const name of names) {
    const cols = db.exec(`PRAGMA table_info(${name})`)[0].values.map(r => ({ name: r[1], type: r[2].replace(/ COLLATE NOCASE/i, '') }));
    schema[name.toLowerCase()] = { name, cols };
    cols.forEach(c => { colKind[c.name.toLowerCase()] = kindOfType(c.type); });
  }
}

/* ---------- reading the query ---------- */
export function tokenize(src) {
  const s = src.replace(/[‘’]/g, "'").replace(/[“”]/g, '"'), out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    let j = i + 1;
    if (/\s/.test(c)) { while (j < s.length && /\s/.test(s[j])) j++; out.push({ t: 'ws', v: s.slice(i, j) }); }
    else if (c === '-' && s[i + 1] === '-') { j = s.indexOf('\n', i); if (j < 0) j = s.length; out.push({ t: 'ws', v: ' ' }); }
    else if (c === '/' && s[i + 1] === '*') { j = s.indexOf('*/', i + 2); j = j < 0 ? s.length : j + 2; out.push({ t: 'ws', v: ' ' }); }
    else if (c === "'") {
      while (j < s.length && !(s[j] === "'" && s[j + 1] !== "'")) j += s[j] === "'" ? 2 : 1;
      if (j >= s.length) fail(`Unclosed quotation mark after the character string '${s.slice(i + 1, i + 20)}'.`);
      j++; out.push({ t: 'str', v: s.slice(i, j) });
    } else if (c === '"' || c === '[') {
      const end = c === '"' ? '"' : ']';
      j = s.indexOf(end, i + 1);
      if (j < 0) fail(`Unclosed quotation mark after the character string '${s.slice(i + 1, i + 20)}'.`);
      j++; out.push({ t: 'qid', v: s.slice(i + 1, j - 1) });
    } else if (/[A-Za-z_@#]/.test(c)) { while (j < s.length && /[\w@#$]/.test(s[j])) j++; out.push({ t: 'id', v: s.slice(i, j) }); }
    else if (/\d/.test(c) || (c === '.' && /\d/.test(s[i + 1] || ''))) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i)); j = i + m[0].length; out.push({ t: 'num', v: m[0] });
    } else {
      const two = s.slice(i, i + 2);
      if (['<>', '<=', '>=', '!=', '||'].includes(two)) j = i + 2;
      out.push({ t: 'op', v: s.slice(i, j) });
    }
    i = j;
  }
  return out;
}
/* Nest the tokens by parentheses: a group is { g: [...] }. */
function tree(tokens) {
  const st = [[]];
  for (const t of tokens) {
    if (t.t === 'op' && t.v === '(') st.push([]);
    else if (t.t === 'op' && t.v === ')') {
      if (st.length < 2) fail("Incorrect syntax near ')'.");
      const g = st.pop(); st[st.length - 1].push({ g });
    } else st[st.length - 1].push(t);
  }
  if (st.length > 1) fail('Incorrect syntax near the end of the statement. A closing parenthesis is missing.');
  return st[0];
}
const up = x => (x && x.t === 'id' ? x.v.toUpperCase() : '');
const flat = items => items.map(x => (x.g ? '(' + flat(x.g) + ')' : x.v)).join('');
const trim = items => { let a = 0, b = items.length; while (a < b && items[a].t === 'ws') a++; while (b > a && items[b - 1].t === 'ws') b--; return items.slice(a, b); };
const splitComma = items => {
  const out = [[]];
  for (const x of items) { if (x.t === 'op' && x.v === ',') out.push([]); else out[out.length - 1].push(x); }
  return out.map(trim);
};
const idsIn = items => items.flatMap(x => (x.g ? idsIn(x.g) : x.t === 'id' || x.t === 'qid' ? [x.v] : []));

/* ---------- turning SQL Server style into SQLite ---------- */
const TEXTFN = new Set(['LOWER', 'UPPER', 'LEFT', 'RIGHT', 'LTRIM', 'RTRIM', 'REPLACE', 'REPLICATE', 'SUBSTRING', 'DATENAME']);
const NUMFN = new Set(['LEN', 'CHARINDEX', 'DATEDIFF', 'DATEPART', 'YEAR', 'MONTH', 'DAY']);
const SAMEFN = new Set(['ABS', 'ROUND', 'CEILING', 'FLOOR', 'POWER']);
const DATEFN = new Set(['DATEADD', 'DATEDIFF', 'DATEPART', 'DATENAME']);
const BOUNDARY_KW = new Set(['AND', 'OR', 'NOT', 'LIKE', 'IN', 'BETWEEN', 'IS']);
const BOUNDARY_OP = new Set(['=', '<', '>', '<=', '>=', '<>', '!=', ',']);

const dateLit = v => v.replace(/^'(\d{1,2})[-/](\d{1,2})[-/](\d{4})'$/, (_, m, d, y) => `'${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}'`);

/* In SQL Server, + joins text only when both sides are text. A number or date next to text is an error. */
function fixPlus(segs) {
  let start = 0;
  const chain = (a, b) => {
    const part = segs.slice(a, b), plus = [];
    part.forEach((g, i) => { if (g.k === 'op' && g.s === '+') plus.push(a + i); });
    if (!plus.length) return;
    const operands = [[]];
    part.forEach(g => { if (g.k === 'op' && g.s === '+') operands.push([]); else operands[operands.length - 1].push(g); });
    const kinds = operands.map(o => (o.some(g => g.k === 'text') ? 'text' : (o.find(g => ['money', 'num', 'date'].includes(g.k)) || {}).k || 'unk'));
    if (!kinds.includes('text')) return;
    const bad = kinds.find(k => ['money', 'num', 'date'].includes(k));
    if (bad === 'money') fail('Cannot convert a char value to money. The char value has incorrect syntax.');
    if (bad === 'date') fail('Conversion failed when converting date and/or time from character string.');
    if (bad) fail(`Conversion failed when converting the varchar value '${((part.find(g => g.k === 'text') || {}).s || '').replace(/^'|'$/g, '')}' to data type int.`);
    plus.forEach(i => { segs[i] = { s: '||', k: 'op' }; });
  };
  segs.forEach((g, i) => {
    const b = (g.k === 'op' && BOUNDARY_OP.has(g.s)) || (g.k === 'kw' && BOUNDARY_KW.has(g.s.toUpperCase()));
    if (b) { chain(start, i); start = i + 1; }
  });
  chain(start, segs.length);
}
function emit(items) {
  const segs = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.g) { const e = emit(it.g); segs.push({ s: '(' + e.s + ')', k: e.k === 'text' ? 'text' : e.k }); continue; }
    if (it.t === 'ws') segs.push({ s: it.v, k: 'ws' });
    else if (it.t === 'str') segs.push({ s: dateLit(it.v), k: 'text' });
    else if (it.t === 'num') segs.push({ s: it.v, k: 'num' });
    else if (it.t === 'qid') segs.push({ s: '[' + it.v + ']', k: colKind[it.v.toLowerCase()] || 'unk' });
    else if (it.t === 'id') {
      let j = i + 1; while (items[j] && items[j].t === 'ws') j++;
      if (items[j] && items[j].g) { segs.push(call(it.v.toUpperCase(), it.v, items[j].g)); i = j; }
      else segs.push({ s: it.v, k: colKind[it.v.toLowerCase()] || 'kw' });
    } else {
      if (it.v === '/') {
        let j = i + 1; while (items[j] && items[j].t === 'ws') j++;
        if (items[j] && items[j].t === 'num' && Number(items[j].v) === 0) fail('Divide by zero error encountered.');
      }
      segs.push({ s: it.v, k: 'op' });
    }
  }
  fixPlus(segs);
  const found = segs.find(g => g.k === 'text') || segs.find(g => ['money', 'date', 'num'].includes(g.k));
  return { s: segs.map(g => g.s).join(''), k: found ? found.k : 'unk' };
}
function call(NAME, raw, g) {
  const parts = splitComma(g);
  const cast = (exprItems, typeItems, styleItems) => {
    const type = flat(typeItems).trim().toLowerCase().replace(/\s+/g, '');
    const e = emit(exprItems);
    if (/^(n?var)?char|^nchar|^text/.test(type)) {
      const len = (/\((\d+)\)/.exec(type) || [0, 0])[1], money = e.k === 'money' ? 1 : 0;
      return styleItems
        ? { s: `CONV_S(${e.s}, ${emit(styleItems).s}, ${len}, ${money})`, k: 'text' }
        : { s: `CAST_S(${e.s}, ${len}, ${money})`, k: 'text' };
    }
    return { s: `CAST_N(${e.s}, '${type}')`, k: /date/.test(type) ? 'date' : 'num' };
  };
  if (NAME === 'CAST') {
    let ai = -1; g.forEach((x, i) => { if (up(x) === 'AS') ai = i; });
    if (ai < 0) fail("Incorrect syntax near ')'. CAST needs AS and a data type.");
    return cast(trim(g.slice(0, ai)), trim(g.slice(ai + 1)), null);
  }
  if (NAME === 'CONVERT') {
    if (parts.length < 2 || parts.length > 3) fail('The convert function requires 2 to 3 arguments.');
    return cast(parts[1], parts[0], parts[2]);
  }
  const args = parts.map((p, i) => {
    if (i === 0 && DATEFN.has(NAME) && p.length === 1 && p[0].t === 'id') return { s: `'${p[0].v}'`, k: 'text' };
    return emit(p);
  });
  const s = `${raw}(${args.map(a => a.s).join(', ')})`;
  const first = args[0] ? args[0].k : 'unk';
  if (TEXTFN.has(NAME)) return { s, k: 'text' };
  if (NUMFN.has(NAME)) return { s, k: 'num' };
  if (SAMEFN.has(NAME)) return { s, k: first === 'money' ? 'money' : 'num' };
  if (NAME === 'DATEADD' || NAME === 'GETDATE') return { s, k: 'date' };
  return { s, k: 'unk' };
}

/* ---------- reading a whole SELECT ---------- */
export function parse(sql) {
  const all = tree(tokenize(sql));
  const stmts = [[]];
  for (const x of all) { if (x.t === 'op' && x.v === ';') stmts.push([]); else stmts[stmts.length - 1].push(x); }
  const real = stmts.map(trim).filter(s => s.length);
  if (!real.length) fail('Type a query first.');
  if (real.length > 1) fail('Please run one statement at a time.');
  const items = real[0];
  if (up(items[0]) !== 'SELECT') {
    const w = up(items[0]);
    fail(['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'MERGE', 'EXEC', 'PRAGMA', 'ATTACH'].includes(w)
      ? 'This practice database is read-only. Only SELECT statements can be run here.' : `Incorrect syntax near '${items[0].v || items[0].g ? (items[0].v || '(') : ''}'.`);
  }
  const clause = { select: [], from: [], where: [], group: [], having: [], order: [] };
  let cur = 'select', compound = false;
  for (let i = 1; i < items.length; i++) {
    const w = up(items[i]);
    if (w === 'FROM' || w === 'WHERE' || w === 'HAVING') { cur = w.toLowerCase(); continue; }
    if (w === 'GROUP' || w === 'ORDER') {
      let j = i + 1; while (items[j] && items[j].t === 'ws') j++;
      if (up(items[j]) !== 'BY') fail(`Incorrect syntax near the keyword '${items[i].v}'.`);
      cur = w.toLowerCase(); i = j; continue;
    }
    if (['UNION', 'INTERSECT', 'EXCEPT'].includes(w)) compound = true;
    clause[cur].push(items[i]);
  }
  let sel = trim(clause.select), distinct = false, top = null;
  if (up(sel[0]) === 'DISTINCT') { distinct = true; sel = trim(sel.slice(1)); }
  else if (up(sel[0]) === 'ALL') sel = trim(sel.slice(1));
  if (up(sel[0]) === 'TOP') {
    const n = trim(sel.slice(1))[0];
    top = n && n.g ? flat(n.g) : n && n.v;
    if (!/^\d+$/.test(top || '')) fail("Incorrect syntax near 'TOP'.");
    sel = trim(trim(sel.slice(1)).slice(1));
  }
  if (!sel.length) fail("Incorrect syntax near the keyword 'FROM'. The SELECT list is empty.");
  const list = splitComma(sel).map(it => {
    if (!it.length) fail("Incorrect syntax near ','.");
    const noWs = it.filter(x => x.t !== 'ws');
    let alias = null, expr = it;
    const n = noWs.length, last = noWs[n - 1], prev = noWs[n - 2];
    const aliasText = x => (x.t === 'str' ? x.v.slice(1, -1).replace(/''/g, "'") : x.v);
    if (n >= 3 && up(prev) === 'AS') { alias = aliasText(last); expr = it.slice(0, it.lastIndexOf(prev)); }
    else if (n >= 3 && ['id', 'qid', 'str'].includes(noWs[0].t) && noWs[1].t === 'op' && noWs[1].v === '=') {
      alias = aliasText(noWs[0]); expr = it.slice(it.indexOf(noWs[1]) + 1);
    } else if (n >= 2 && ['id', 'qid', 'str'].includes(last.t) && !(prev.t === 'op') && !(last.t === 'id' && ['END', 'NULL'].includes(up(last)))) {
      alias = aliasText(last); expr = it.slice(0, it.lastIndexOf(last));
    }
    return { expr: trim(expr), alias };
  });
  return { distinct, top, list, from: trim(clause.from), where: trim(clause.where), group: trim(clause.group), having: trim(clause.having), order: trim(clause.order), compound, items };
}
const tableOf = from => {
  const f = from.filter(x => x.t !== 'ws');
  if (!f.length) return { name: null };
  if (f.length > 3 || f.some(x => x.g || !['id', 'qid'].includes(x.t))) return null;
  if (f.length === 2 && up(f[1]) === 'AS') return null;
  if (f.length === 3 && up(f[1]) !== 'AS') return null;
  const t = schema[f[0].v.toLowerCase()];
  return t ? { name: t.name, alias: f.length > 1 ? f[f.length - 1].v : null } : null;
};

export function compile(sql) {
  const p = parse(sql);
  if (p.compound) {
    return { sql: emit(p.items).s, headers: null, p, step: false, why: 'Step-by-step view works for one SELECT on one table.' };
  }
  const tbl = tableOf(p.from);
  const fromIds = p.from.filter(x => x.t !== 'ws');
  if (!tbl && fromIds.length === 1 && ['id', 'qid'].includes(fromIds[0].t)) fail(`Invalid object name '${fromIds[0].v}'.`);
  if (!tbl) return { sql: emit(p.items).s, headers: null, p, step: false, why: 'Step-by-step view works for one SELECT on one table.' };
  const cols = tbl && tbl.name ? schema[tbl.name.toLowerCase()].cols : [];
  const items = [];
  for (const it of p.list) {
    if (it.expr.length === 1 && it.expr[0].t === 'op' && it.expr[0].v === '*') {
      if (!tbl || !tbl.name) fail("Incorrect syntax near '*'.");
      cols.forEach(c => items.push({ sql: `[${c.name}]`, header: c.name, plain: c.name, kind: kindOfType(c.type), alias: null }));
      continue;
    }
    const e = emit(it.expr);
    const one = it.expr.length === 1 && ['id', 'qid'].includes(it.expr[0].t) ? cols.find(c => c.name.toLowerCase() === it.expr[0].v.toLowerCase()) : null;
    items.push({ sql: e.s, header: it.alias || (one ? one.name : '(No column name)'), plain: one ? one.name : null, kind: e.k, alias: it.alias });
  }
  // SQL Server does not let WHERE see aliases from the SELECT list.
  const aliases = new Set(items.filter(i => i.alias).map(i => i.alias.toLowerCase()));
  for (const id of idsIn(p.where)) {
    if (aliases.has(id.toLowerCase()) && !cols.some(c => c.name.toLowerCase() === id.toLowerCase())) fail(`Invalid column name '${id}'.`);
  }
  const from = p.from.length ? emit(p.from).s : '', where = p.where.length ? emit(p.where).s : '';
  const order = p.order.length ? emit(p.order).s : '', group = p.group.length ? emit(p.group).s : '', having = p.having.length ? emit(p.having).s : '';
  const colList = items.map((it, i) => `${it.sql} AS "${(it.alias || `__c${i}`).replace(/"/g, '""')}"`).join(', ');
  const tail = (from ? ` FROM ${from}` : '') + (where ? ` WHERE ${where}` : '') + (group ? ` GROUP BY ${group}` : '') + (having ? ` HAVING ${having}` : '') + (order ? ` ORDER BY ${order}` : '');
  const out = {
    sql: `SELECT ${p.distinct ? 'DISTINCT ' : ''}${colList}${tail}${p.top ? ` LIMIT ${p.top}` : ''}`,
    headers: items.map(i => i.header), items, p, tbl, cols, from, where, order, colList, tail,
    step: !!tbl && !p.top && !group && !having,
    why: 'Step-by-step view works for one SELECT on one table (no GROUP BY or TOP).'
  };
  return out;
}

/* ---------- running ---------- */
export function friendly(e) {
  const m = String(e && e.message || e);
  let r;
  if ((r = /no such column: (?:\w+\.)?(.+)/.exec(m))) return `Invalid column name '${r[1]}'.`;
  if ((r = /no such table: (.+)/.exec(m))) return `Invalid object name '${r[1]}'.`;
  if ((r = /no such function: (.+)/.exec(m))) return `'${r[1]}' is not a recognized built-in function name.`;
  if ((r = /wrong number of arguments to function (\w+)\(\)/.exec(m))) return `The ${r[1]} function has the wrong number of arguments.`;
  if ((r = /ambiguous column name: (.+)/.exec(m))) return `Ambiguous column name '${r[1]}'.`;
  if ((r = /near "(.+?)": syntax error/.exec(m))) return `Incorrect syntax near '${r[1]}'.`;
  if (/incomplete input/.test(m)) return 'Incorrect syntax near the end of the statement.';
  return m.replace(/^Error: /, '');
}
function exec(sql, cap) {
  const st = db.prepare(sql), rows = [];
  let capped = false;
  try {
    const names = st.getColumnNames();
    while (st.step()) { if (rows.length >= cap) { capped = true; break; } rows.push(st.get()); }
    return { names, rows, capped };
  } finally { st.free(); }
}
/* Returns { headers, rows, money, capped } or { error }. */
export function run(sql, cap = 500) {
  try {
    const c = compile(sql);
    const r = exec(c.sql, cap);
    return { headers: c.headers || r.names, rows: r.rows, money: c.items ? c.items.map(i => i.kind === 'money') : [], capped: r.capped, sql: c.sql };
  } catch (e) { return { error: friendly(e) }; }
}
export const scalar = sql => { const r = run(sql); if (r.error) throw new SqlError(r.error); return r.rows[0] ? r.rows[0][0] : null; };

/* Everything the step-by-step view needs, taken from real runs of the query. */
export function trace(sql) {
  const c = compile(sql);
  if (!c.step) throw new SqlError(c.why);
  const hasTable = !!(c.tbl && c.tbl.name);
  const cols = hasTable ? c.cols.map(x => x.name) : [];
  const src = hasTable ? exec(`SELECT rowid AS __r, * FROM ${c.from}`, 100000).rows : [[1]];
  const where = c.where ? ` WHERE ${c.where}` : '';
  const passed = hasTable ? exec(`SELECT rowid FROM ${c.from}${where}`, 100000).rows.map(r => r[0]) : [1];
  const pass = new Set(passed);
  const cellsSql = hasTable
    ? `SELECT rowid AS __r, ${c.colList} FROM ${c.from}${where}${c.order ? ` ORDER BY ${c.order}` : ''}`
    : `SELECT 1 AS __r, ${c.colList}`;
  const cellRows = exec(cellsSql, 100000).rows;           // already in final sort order, before DISTINCT
  const cells = new Map(cellRows.map(r => [r[0], r.slice(1)]));
  const order = cellRows.map(r => r[0]);
  const seen = new Set(), dropped = new Set(), final = [];
  for (const id of order) {
    if (c.p.distinct) {
      const key = JSON.stringify(cells.get(id).map(v => (typeof v === 'string' ? v.toLowerCase() : v)));
      if (seen.has(key)) { dropped.add(id); continue; }
      seen.add(key);
    }
    final.push(id);
  }
  const rows = src.map(r => ({ id: r[0], vals: r.slice(1) }));
  return { c, hasTable, cols, colTypes: hasTable ? c.cols.map(x => kindOfType(x.type)) : [], rows, pass, order, cells, dropped, final, items: c.items };
}
export const tableRows = name => exec(`SELECT * FROM ${name}`, 100000);
