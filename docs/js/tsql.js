/* tsql.js: SQL Server functions (LEN, LEFT, DATEADD, CAST, ...) added to the in-browser SQLite engine.
   The lessons are written for SQL Server, so these follow SQL Server rules where the handout shows them. */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const p2 = n => String(n).padStart(2, '0');
const DAY_MS = 86400000;

/* Dates are stored as text: 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'. We read them as UTC so no time zone can shift a day. */
export function toDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(v));
  if (!m) throw new Error('Conversion failed when converting date and/or time from character string.');
  return new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
}
const hasTime = v => /\d[ T]\d{2}:\d{2}/.test(String(v));
const fmtDate = (d, time) => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}` +
  (time ? ` ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}` : '');
export const isDateText = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/.test(v);

const UNITS = {
  yy: 'y', yyyy: 'y', year: 'y', qq: 'q', q: 'q', quarter: 'q', mm: 'm', m: 'm', month: 'm',
  dy: 'dy', y: 'dy', dayofyear: 'dy', dd: 'd', d: 'd', day: 'd', wk: 'wk', ww: 'wk', week: 'wk',
  dw: 'dw', w: 'dw', weekday: 'dw', hh: 'h', hour: 'h', mi: 'n', n: 'n', minute: 'n', ss: 's', s: 's', second: 's'
};
export function unit(p) {
  const u = UNITS[String(p).toLowerCase()];
  if (!u) throw new Error(`'${p}' is not a recognized datepart option.`);
  return u;
}
const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
function addMonths(d, k) {
  const t = d.getUTCFullYear() * 12 + d.getUTCMonth() + k, y = Math.floor(t / 12), m = ((t % 12) + 12) % 12;
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), dim(y, m)), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
}
export function dateAdd(part, n, v) {
  const u = unit(part), d = toDate(v), k = Math.trunc(n);
  let r;
  if (u === 'y') r = addMonths(d, 12 * k);
  else if (u === 'q') r = addMonths(d, 3 * k);
  else if (u === 'm') r = addMonths(d, k);
  else {
    const ms = { d: DAY_MS, dy: DAY_MS, dw: DAY_MS, wk: 7 * DAY_MS, h: 3600000, n: 60000, s: 1000 }[u];
    r = new Date(d.getTime() + k * ms);
  }
  return fmtDate(r, hasTime(v) || 'hns'.includes(u));
}
const dayNo = d => Math.floor(d.getTime() / DAY_MS);
export function dateDiff(part, a, b) {
  const u = unit(part), x = toDate(a), y = toDate(b);
  const yy = d => d.getUTCFullYear(), mo = d => yy(d) * 12 + d.getUTCMonth();
  switch (u) {
    case 'y': return yy(y) - yy(x);
    case 'q': return Math.floor(mo(y) / 3) - Math.floor(mo(x) / 3);
    case 'm': return mo(y) - mo(x);
    case 'd': case 'dy': case 'dw': return dayNo(y) - dayNo(x);
    case 'wk': return Math.floor((dayNo(y) + 4) / 7) - Math.floor((dayNo(x) + 4) / 7); // weeks start on Sunday
    case 'h': return Math.floor(y / 3600000) - Math.floor(x / 3600000);
    case 'n': return Math.floor(y / 60000) - Math.floor(x / 60000);
    default: return Math.floor(y / 1000) - Math.floor(x / 1000);
  }
}
export function datePart(part, v) {
  const u = unit(part), d = toDate(v);
  const jan1 = Date.UTC(d.getUTCFullYear(), 0, 1), doy = Math.floor((d - jan1) / DAY_MS) + 1;
  switch (u) {
    case 'y': return d.getUTCFullYear();
    case 'q': return Math.floor(d.getUTCMonth() / 3) + 1;
    case 'm': return d.getUTCMonth() + 1;
    case 'dy': return doy;
    case 'd': return d.getUTCDate();
    case 'wk': return Math.floor((doy - 1 + new Date(jan1).getUTCDay()) / 7) + 1;
    case 'dw': return d.getUTCDay() + 1;
    case 'h': return d.getUTCHours();
    case 'n': return d.getUTCMinutes();
    default: return d.getUTCSeconds();
  }
}
export function dateName(part, v) {
  const u = unit(part), d = toDate(v);
  if (u === 'm') return MONTH[d.getUTCMonth()];
  if (u === 'dw') return DAYS[d.getUTCDay()];
  return String(datePart(part, v));
}

const h12 = d => { const h = d.getUTCHours() % 12 || 12; return String(h).padStart(2, ' '); };
const ampm = d => (d.getUTCHours() < 12 ? 'AM' : 'PM');
/* Date to text, using the same style numbers as SQL Server's CONVERT. */
export function styleDate(v, style) {
  const d = toDate(v), Y = d.getUTCFullYear(), M = d.getUTCMonth(), D = d.getUTCDate();
  const yy = p2(Y % 100), mm = p2(M + 1), dd = p2(D), t = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
  const mon = MON[M], day = String(D).padStart(2, ' ');
  const ms = '000';
  switch (Number(style)) {
    case 0: case 100: return `${mon} ${day} ${Y} ${h12(d)}:${p2(d.getUTCMinutes())}${ampm(d)}`;
    case 1: return `${mm}/${dd}/${yy}`; case 101: return `${mm}/${dd}/${Y}`;
    case 2: return `${yy}.${mm}.${dd}`; case 102: return `${Y}.${mm}.${dd}`;
    case 3: return `${dd}/${mm}/${yy}`; case 103: return `${dd}/${mm}/${Y}`;
    case 4: return `${dd}.${mm}.${yy}`; case 104: return `${dd}.${mm}.${Y}`;
    case 5: return `${dd}-${mm}-${yy}`; case 105: return `${dd}-${mm}-${Y}`;
    case 6: return `${dd} ${mon} ${yy}`; case 106: return `${dd} ${mon} ${Y}`;
    case 7: return `${mon} ${dd}, ${yy}`; case 107: return `${mon} ${dd}, ${Y}`;
    case 8: case 108: return t;
    case 9: case 109: return `${mon} ${day} ${Y} ${h12(d)}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}:${ms}${ampm(d)}`;
    case 10: return `${mm}-${dd}-${yy}`; case 110: return `${mm}-${dd}-${Y}`;
    case 11: return `${yy}/${mm}/${dd}`; case 111: return `${Y}/${mm}/${dd}`;
    case 12: return `${yy}${mm}${dd}`; case 112: return `${Y}${mm}${dd}`;
    case 20: case 120: return `${Y}-${mm}-${dd} ${t}`;
    case 21: case 121: return `${Y}-${mm}-${dd} ${t}.${ms}`;
    default: throw new Error(`'${style}' is not a valid style number when converting from datetime to a character string.`);
  }
}

/* CAST/CONVERT to text. Money values keep two decimals, like SQL Server. */
function toText(v, len, money, style) {
  if (v === null || v === undefined) return null;
  let s;
  if (typeof v === 'number') s = money ? v.toFixed(2) : String(v);
  else s = isDateText(v) ? styleDate(v, style || 0) : String(v);
  return len > 0 ? s.slice(0, len) : s;
}
function castNumber(v, type) {
  if (v === null || v === undefined) return null;
  const t = String(type).toLowerCase().replace(/\s+/g, ''), base = t.replace(/\(.*$/, '');
  const num = () => {
    const n = Number(v);
    if (typeof v === 'string' && (v.trim() === '' || Number.isNaN(n))) {
      throw new Error(`Conversion failed when converting the varchar value '${v}' to data type ${base}.`);
    }
    return n;
  };
  if (['int', 'integer', 'smallint', 'bigint', 'tinyint'].includes(base)) return Math.trunc(num());
  if (['decimal', 'numeric'].includes(base)) {
    const sc = /\(\d+,(\d+)\)/.exec(t); return sc ? Number(num().toFixed(+sc[1])) : Math.round(num());
  }
  if (['float', 'real', 'money', 'smallmoney'].includes(base)) return num();
  if (base === 'bit') return num() ? 1 : 0;
  if (['date', 'datetime', 'smalldatetime', 'datetime2'].includes(base)) {
    const d = toDate(v); return fmtDate(d, base !== 'date');
  }
  throw new Error(`Column, parameter, or variable: Cannot find data type ${base}.`);
}

const round = (x, len) => {
  const s = x < 0 ? -1 : 1, a = Math.abs(x);
  return s * Number(Math.round(Number(`${a}e${len}`)) + `e${-len}`);
};
const norm0 = n => (n === 0 ? 0 : n); // no "-0"
const ci = s => String(s).toLowerCase();

export function register(db) {
  /* sql.js reads the argument count from fn.length, so each function is given an exact count. */
  const reg = (name, n, fn) => {
    const f = (...a) => (a.some(x => x === null || x === undefined) ? null : fn(...a));
    Object.defineProperty(f, 'length', { value: n });
    db.create_function(name, f);
  };
  const now = () => {
    const d = new Date();
    return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
  };
  const g = () => now();
  Object.defineProperty(g, 'length', { value: 0 });
  db.create_function('GETDATE', g);

  reg('LEN', 1, s => String(s).replace(/ +$/, '').length);
  reg('LEFT', 2, (s, n) => { if (n < 0) throw new Error('Invalid length parameter passed to the LEFT function.'); return String(s).slice(0, n); });
  reg('RIGHT', 2, (s, n) => { if (n < 0) throw new Error('Invalid length parameter passed to the RIGHT function.'); return n === 0 ? '' : String(s).slice(-n); });
  reg('REPLICATE', 2, (s, n) => (n < 0 ? null : String(s).repeat(n)));
  reg('SUBSTRING', 3, (s, start, len) => {
    if (len < 0) throw new Error('Invalid length parameter passed to the substring function.');
    if (start < 1) { len += start - 1; start = 1; }
    return String(s).substr(start - 1, Math.max(len, 0));
  });
  reg('CHARINDEX', 2, (f, s) => ci(s).indexOf(ci(f)) + 1);
  reg('CHARINDEX', 3, (f, s, st) => (ci(s).indexOf(ci(f), Math.max(st, 1) - 1) + 1));
  reg('REPLACE', 3, (s, a, b) => (a === '' ? String(s) : String(s).replace(new RegExp(String(a).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), () => b)));
  reg('POWER', 2, (x, y) => Math.pow(x, y));
  reg('CEILING', 1, x => norm0(Math.ceil(x)));
  reg('FLOOR', 1, x => norm0(Math.floor(x)));
  reg('ROUND', 2, (x, n) => norm0(round(x, n)));
  reg('ROUND', 3, (x, n, f) => norm0(f ? (x < 0 ? -1 : 1) * Number(Math.trunc(Number(`${Math.abs(x)}e${n}`)) + `e${-n}`) : round(x, n)));
  reg('DATEADD', 3, dateAdd);
  reg('DATEDIFF', 3, dateDiff);
  reg('DATEPART', 2, datePart);
  reg('DATENAME', 2, dateName);
  reg('YEAR', 1, v => datePart('yy', v));
  reg('MONTH', 1, v => datePart('mm', v));
  reg('DAY', 1, v => datePart('dd', v));
  /* The query translator turns CAST/CONVERT into these. _S gives text, _N gives other types. */
  reg('CAST_S', 3, (v, len, money) => toText(v, len, money, 0));
  reg('CONV_S', 4, (v, style, len, money) => toText(v, len, money, style));
  reg('CAST_N', 2, castNumber);
}
