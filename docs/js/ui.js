/* ui.js: small shared helpers (escaping, SQL colouring, result tables). */
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const KW = new Set(('SELECT DISTINCT FROM WHERE GROUP BY ORDER HAVING AS AND OR NOT IN BETWEEN LIKE IS NULL ASC DESC TOP ALL ON JOIN INNER OUTER ' +
  'UNION CASE WHEN THEN ELSE END').split(' '));
const NOFN = new Set(['IN', 'AND', 'OR', 'NOT', 'BETWEEN', 'LIKE', 'AS', 'SELECT', 'FROM', 'WHERE', 'ON', 'BY', 'IS', 'TOP', 'DISTINCT', 'HAVING', 'ALL']);
const RE = /('(?:[^']|'')*'?)|(--[^\n]*)|(\[[^\]\n]*\]|"[^"\n]*")|(\b\d+\.?\d*\b)|\b([A-Za-z_]\w*)\b(\s*\()?|([\s\S])/g;

/* SQL text to coloured HTML. */
export function hl(sql) {
  return String(sql).replace(RE, (m, str, com, id, num, word, paren, other) => {
    if (str) return `<i class="s">${esc(str)}</i>`;
    if (com) return `<i class="c">${esc(com)}</i>`;
    if (id) return `<i class="q">${esc(id)}</i>`;
    if (num) return `<i class="n">${num}</i>`;
    if (word) {
      const U = word.toUpperCase();
      if (paren && !NOFN.has(U)) return `<i class="f">${esc(word)}</i>${esc(paren)}`;
      return (KW.has(U) ? `<i class="k">${esc(word)}</i>` : esc(word)) + (paren ? esc(paren) : '');
    }
    return esc(other);
  });
}

/* Cut a query into its clauses (SELECT, FROM, WHERE, GROUP, HAVING, ORDER) at the top level. */
export function clauses(sql) {
  const cuts = [];
  let depth = 0, m;
  const re = /'(?:[^']|'')*'|\[[^\]]*\]|"[^"]*"|--[^\n]*|\(|\)|\b(FROM|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY)\b/gi;
  while ((m = re.exec(sql))) {
    if (m[0] === '(') depth++;
    else if (m[0] === ')') depth--;
    else if (m[1] && depth === 0) cuts.push([m.index, m[1].toLowerCase().split(/\s/)[0]]);
  }
  const segs = [], marks = [[0, 'select'], ...cuts];
  marks.forEach(([at, cl], i) => segs.push({ cl, text: sql.slice(at, i + 1 < marks.length ? marks[i + 1][0] : sql.length) }));
  return segs;
}

export function fmt(v, money) {
  if (v === null || v === undefined) return '<span class="nul">NULL</span>';
  if (typeof v === 'number') return money ? v.toFixed(2) : String(+v.toFixed(8));
  return esc(v);
}
export function resultTable(headers, rows, money = []) {
  const head = headers.map(h => `<th scope="col"${h === '(No column name)' ? ' class="nocol"' : ''}>${esc(h)}</th>`).join('');
  const body = rows.map(r => `<tr>${r.map((v, i) => `<td${typeof v === 'number' ? ' class="num"' : ''}>${fmt(v, money[i])}</td>`).join('')}</tr>`).join('');
  return `<div class="scroll" tabindex="0" role="region" aria-label="Query result"><table class="rs"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
export const ic = n => `<i class="ic ic-${n}" aria-hidden="true"></i>`;
export const affected = n => `(${n} row(s) affected)`;
