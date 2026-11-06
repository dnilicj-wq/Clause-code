// Turn the published images from public/img/source into AVIF + WebP at 640 / 1280 (and 1920 when the original allows),
// gently upscaling soft 800px phone shots (lanczos + light sharpen; Real-ESRGAN is not installed on this Mac).
// Writes public/img/jobs.json (slug, w, h, sizes, caption, service) and IMAGES.md.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CATALOG } from './catalog.mjs';

const SRC = 'public/img/source', OUT = 'public/img', V = 'a'; // bump V when an image changes (immutable cache)
const manifest = JSON.parse(await fs.readFile(path.join(SRC, 'manifest.json'), 'utf8'));
const bySrc = Object.fromEntries(manifest.images.map(i => [i.file, i]));
const jobs = [];
for (const row of CATALOG.filter(r => r.slug)) {
  const file = path.join(SRC, row.f);
  const meta = await sharp(file).metadata();
  const ratio = meta.height / meta.width;
  const soft = meta.width < 1100;
  const widths = [640, 1280, ...(meta.width >= 1700 ? [1920] : [])];
  for (const w of widths) {
    let img = sharp(file).rotate().resize({ width: w, kernel: 'lanczos3', withoutEnlargement: false });
    if (soft && w > meta.width) img = img.sharpen({ sigma: 0.8, m1: 0.6, m2: 1.4 });
    await img.clone().avif({ quality: w > 1000 ? 50 : 55, effort: 5 }).toFile(path.join(OUT, `${row.slug}-${w}${V}.avif`));
    await img.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${row.slug}-${w}${V}.webp`));
  }
  jobs.push({ slug: row.slug, v: V, cat: row.cat, w: meta.width, h: meta.height, ratio: +ratio.toFixed(4), widths, cap: row.cap || '', svc: row.svc || '', upscaled: soft });
  console.log(row.slug, meta.width + 'x' + meta.height, widths.join('/'), soft ? '(upscaled)' : '');
}
await fs.writeFile(path.join(OUT, 'jobs.json'), JSON.stringify(jobs, null, 1));

// IMAGES.md
const kb = n => (n / 1024).toFixed(0) + ' KB';
let md = `# Images from newpaveltd.co.uk\n\nDownloaded by \`scripts/fetch-newpave-images.mjs\` on ${new Date().toISOString().slice(0, 10)} (largest available version; WordPress size suffixes stripped, Smush WebP mapped back to the original upload). Originals are in \`public/img/source/\` (not deployed).\n\n`;
md += `**Categories:** real job = looks like Newpave's own work (phone photos, appear in his gallery or service pages). stock = Adobe Stock (filename). staged = looks like a product or supplier shot and is unconfirmed, so not used as Newpave work. graphic = logo/icon. dup = duplicate of another photo.\n\n`;
md += `Only **real job** photos are used in the gallery and "our work" areas. Before go-live, Dan should confirm with Charles that every real-job photo is his own work.\n\n`;
md += `| File | Category | Used as | Size | Shows | Source URL |\n|---|---|---|---|---|---|\n`;
for (const r of CATALOG) {
  const m = bySrc[r.f]; const dim = await sharp(path.join(SRC, r.f)).metadata().then(x => `${x.width}x${x.height}`).catch(() => '?');
  md += `| \`${r.f}\` | ${r.cat === 'real' ? 'real job' : r.cat} | ${r.slug ? '`' + r.slug + '`' : 'not used'} | ${dim}, ${m ? kb(m.bytes) : '?'} | ${r.shows} | ${m ? m.source : ''} |\n`;
}
const missing = manifest.images.filter(i => !CATALOG.find(r => r.f === i.file));
if (missing.length) md += `\nUncatalogued: ${missing.map(m => m.file).join(', ')}\n`;
await fs.writeFile('IMAGES.md', md);
console.log('jobs', jobs.length, 'uncatalogued', missing.length);
