/* Check homework data files.  node hw-check.js hw/u3-04.js [...]   (add --browser to render every task in Chromium)  */
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), browser = args.includes('--browser'), files = args.filter(a => !a.startsWith('--'));
const KINDS = ['solve', 'choice', 'number', 'pair', 'fill', 'sort', 'match', 'plane', 'pick', 'nl', 'build'];
let bad = 0;
function err(f, where, msg) { bad++; console.log('FIX ' + path.basename(f) + ' ' + where + ': ' + msg); }
for (const f of files) {
  let def = null; const SFA_HW = d => { def = d; };
  try { new Function('SFA_HW', fs.readFileSync(f, 'utf8'))(SFA_HW); } catch (e) { err(f, 'file', 'does not run: ' + e.message); continue; }
  if (!def) { err(f, 'file', 'SFA_HW not called'); continue; }
  const m = path.basename(f).match(/^u([34])-(\d\d)\.js$/);
  if (!m) err(f, 'file', 'name must be u3-NN.js or u4-NN.js');
  else { const want = 'g' + (m[1] === '3' ? 30 + +m[2] : 60 + +m[2]); if (def.id !== want) err(f, 'id', 'should be ' + want); if (def.unit !== +m[1] || def.lesson !== +m[2]) err(f, 'unit/lesson', 'do not match the file name'); }
  ['title', 'topic', 'goal', 'bigIdea'].forEach(k => { if (!def[k]) err(f, k, 'missing'); });
  if (!def.intro) err(f, 'intro', 'missing');
  if (!Array.isArray(def.levels) || def.levels.length < 4 || def.levels.length > 6) err(f, 'levels', 'need 4 to 6 levels');
  (def.levels || []).forEach((L, li) => {
    const W = 'L' + (li + 1);
    if (!L.name) err(f, W, 'no name'); if (!L.tasks || L.tasks.length < 3 || L.tasks.length > 6) err(f, W, 'needs 3 to 6 tasks');
    if (li === def.levels.length - 1 && !L.boss) err(f, W, 'last level should be boss: true');
    (L.tasks || []).forEach((T, ti) => {
      const w = W + ' task ' + (ti + 1);
      if (!KINDS.includes(T.k)) return err(f, w, 'unknown kind ' + T.k);
      if (T.k !== 'solve' && !T.q) err(f, w, 'no q');
      if (T.k === 'solve') { if (!T.start) err(f, w, 'no start'); (T.moves || []).forEach((mv, i) => { if (!mv.opts || mv.ans == null || mv.ans >= mv.opts.length) err(f, w, 'move ' + (i + 1) + ' ans out of range'); if (!mv.res || mv.rans == null || mv.rans >= mv.res.length) err(f, w, 'move ' + (i + 1) + ' rans out of range'); if (mv.steps) err(f, w, 'use moves, not steps'); }); if (!T.moves || !T.moves.length) err(f, w, 'no moves'); }
      if (T.k === 'choice' && (!T.opts || T.ans == null || T.ans >= T.opts.length)) err(f, w, 'ans out of range');
      if (T.k === 'number' && typeof T.ans !== 'number') err(f, w, 'ans must be a number');
      if (T.k === 'pair' && !(Array.isArray(T.ans) && T.ans.length === 2)) err(f, w, 'ans must be [x, y]');
      if (T.k === 'fill') { if (!T.head || !T.rows) err(f, w, 'needs head and rows'); else if (!T.rows.some(r => r.some(c => c && typeof c === 'object'))) err(f, w, 'no { a: n } blanks'); }
      if (T.k === 'sort') { if (!T.bins || !T.cards) err(f, w, 'needs bins and cards'); else T.cards.forEach((c, i) => { if (c.b == null || c.b >= T.bins.length) err(f, w, 'card ' + (i + 1) + ' bin out of range'); }); }
      if (T.k === 'match' && (!T.pairs || T.pairs.length < 2)) err(f, w, 'needs pairs');
      if (T.k === 'plane' && (T.m == null && T.vx == null)) err(f, w, 'needs m and b (or vx)');
      if (T.fig && T.fig.lines) T.fig.lines.forEach(l => { if (l.m == null || l.b == null) err(f, w, 'fig line needs m and b'); });
    });
  });
  if (!browser) console.log('    ' + path.basename(f) + ': ' + (def.levels || []).length + ' levels, ' + (def.levels || []).reduce((a, L) => a + (L.tasks || []).length, 0) + ' tasks');
}
if (!browser) process.exit(bad ? 1 : 0);
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 900 } });
  for (const f of files) {
    const errs = []; p.removeAllListeners('pageerror'); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, 'hw.html') + '?g=' + path.basename(f, '.js')); await p.waitForTimeout(700);
    const n = await p.evaluate(() => { const out = []; document.querySelectorAll('.hwlv').forEach((b, i) => out.push(i)); return out.length; });
    const def = await p.evaluate(() => null);
    let total = 0;
    const levels = await p.evaluate(() => [...document.querySelectorAll('.hwlv .n')].map(e => +e.textContent.match(/(\d+) questions/)[1]));
    for (let li = 0; li < levels.length; li++) for (let ti = 0; ti < levels[li]; ti++) {
      await p.evaluate(([a, c]) => window.SFA_HW_JUMP(a, c), [li, ti]); await p.waitForTimeout(40); total++;
      const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (wide) { bad++; console.log('FIX ' + path.basename(f) + ' L' + (li + 1) + ' task ' + (ti + 1) + ': wider than a phone (scrolls sideways)'); }
    }
    if (errs.length) { bad++; console.log('FIX ' + path.basename(f) + ': page errors: ' + errs.slice(0, 3).join(' | ')); }
    console.log((errs.length ? 'FIX ' : 'OK  ') + path.basename(f) + ': rendered ' + total + ' tasks at phone width');
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
