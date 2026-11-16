import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:4321/');
const r = await p.evaluate(() => new Promise((res) => { const t0 = performance.now(); let s = 0;
  const iv = setInterval(() => { const v = document.querySelector('.pour-vid'); if (!v) return; if (!s && !v.paused) s = performance.now(); if (document.querySelector('.pour.set')) { clearInterval(iv); res({ startedAt: Math.round(s - t0), setAt: Math.round(performance.now() - t0), playMs: Math.round(performance.now() - s), rate: v.playbackRate }); } }, 50);
  setTimeout(() => res('timeout'), 15000); }));
console.log(r); await b.close();
