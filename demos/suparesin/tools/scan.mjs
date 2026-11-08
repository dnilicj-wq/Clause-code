import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2] + '/?gl=off'); await p.waitForTimeout(1500);
for (let y = 0; y < 30000; y += 700) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(60); }
await p.waitForTimeout(800);
const t = await p.evaluate(() => document.body.innerText);
const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
const re = /£|\d|%|guarantee|warrant|waterproof|fire|eco|UV|years|certified|rated|stars|review|insured|approved|#[0-9a-f]{3,6}/i;
console.log(lines.filter((l) => re.test(l)).join('\n'));
console.log('---sample?', /Demo site, sample content|Sarah K|Northfield/.test(t));
await b.close();
