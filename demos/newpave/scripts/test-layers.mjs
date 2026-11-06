// Checks the 3D layer stack never covers the layers text on phones.
// node scripts/test-layers.mjs [url]   (default http://localhost:4610)
import { webkit, chromium } from 'playwright';
const URL = process.argv[2] || 'http://localhost:4610';
const sizes = [[390, 664], [390, 844], [375, 667], [375, 553], [430, 932], [360, 640], [414, 736]];
let fail = 0;
for (const engine of [webkit, chromium]) {
  let b; try { b = await engine.launch(); } catch { continue; }
  for (const [w, h] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: engine !== webkit ? true : undefined, hasTouch: true });
    await p.goto(URL + '/#layers', { waitUntil: 'load' });
    await p.waitForTimeout(500);
    let worst = -1e9;
    for (const f of [0, .15, .35, .55, .75, .95]) {
      const o = await p.evaluate(async f => {
        const s = document.querySelector('#layers'), r = s.getBoundingClientRect();
        scrollTo(0, scrollY + r.top + (s.offsetHeight - innerHeight) * f);
        await new Promise(res => setTimeout(res, 250));
        const copy = document.querySelector('.layers-copy').getBoundingClientRect();
        let top = 1e9; document.querySelectorAll('#stack .lay').forEach(l => { const q = l.getBoundingClientRect(); if (getComputedStyle(l).visibility !== 'hidden') top = Math.min(top, q.top); });
        return copy.bottom - top; // > 0 means overlap
      }, f);
      worst = Math.max(worst, o);
    }
    const bad = worst > 0; fail += bad;
    console.log(`${engine.name()} ${w}x${h} ${bad ? 'OVERLAP' : 'ok'} gap ${(-worst).toFixed(0)}px`);
    if (w === 390 && h === 664) await p.screenshot({ path: `/private/tmp/claude-501/-Users-daniilsgoloveckis-Desktop-Claude-code/b23b82b9-fd7b-4b99-8928-f6f1b70abe4b/scratchpad/lay-${engine.name()}.png` });
    await p.close();
  }
  await b.close();
}
console.log(fail ? `FAIL ${fail}` : 'PASS');
process.exit(fail ? 1 : 0);
