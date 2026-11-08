// Capture a poster still for every /lab tile. node tools/lab-posters.mjs <base-url> [id ...]
// Uses ?gl=force so WebGL demos render (SwiftShader in headless Chromium). Writes public/lab-posters/<id>-v<n>.webp + index.json.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'fs';
const [base, ...only] = process.argv.slice(2);
const reg = readFileSync('components/library/registry.ts', 'utf8');
const ids = only.length ? only : [...reg.matchAll(/\bid: '([^']+)'/g)].map((m) => m[1]);
const idxPath = 'public/lab-posters/index.json';
const idx = existsSync(idxPath) ? JSON.parse(readFileSync(idxPath, 'utf8')) : {};
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
for (const id of ids) {
  try {
    await p.goto(`${base}/lab?only=${id}&gl=force`, { waitUntil: 'networkidle', timeout: 30000 });
    const el = p.locator(`article[id="${id}"] > div`).first();
    await el.waitFor({ timeout: 8000 });
    await p.mouse.move(640, 300);
    await p.waitForTimeout(3200);
    const gl = await p.evaluate(() => [...document.querySelectorAll('article canvas')].some((c) => { try { return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }));
    const buf = await el.screenshot();
    const v = (idx[id]?.v || 0) + 1; // changed image = new filename
    await sharp(buf).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/lab-posters/${id}-v${v}.webp`);
    idx[id] = { v, gl };
    console.log(id, gl ? 'gl' : '');
  } catch (e) { console.log(id, 'FAILED', String(e).slice(0, 120)); }
}
writeFileSync(idxPath, JSON.stringify(idx, null, 1));
await b.close();
