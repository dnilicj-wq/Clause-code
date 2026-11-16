// Generated (Higgsfield) PNGs in research/gen → web-sized WebP in public/. Re-run safely; skips missing files.
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
const G = 'research/gen', V = 'public/viz', P = 'public/posters';
mkdirSync(V, { recursive: true }); mkdirSync(P, { recursive: true });
const has = (f) => existsSync(`${G}/${f}.png`);
for (const n of ['start', 'end']) {
  if (has(`hero-${n}-d`)) await sharp(`${G}/hero-${n}-d.png`).resize(1600).webp({ quality: 72 }).toFile(`${P}/hero-${n}-d-v1.webp`);
  if (has(`hero-${n}-m`)) await sharp(`${G}/hero-${n}-m.png`).resize(752).webp({ quality: 68 }).toFile(`${P}/hero-${n}-m-v1.webp`);
}
let k = 0;
for (const f of readdirSync(G).filter((x) => x.endsWith('.png'))) {
  const n = f.slice(0, -4);
  if (/^(metallic|solid|flake|micro|venetian|bound)-/.test(n)) { await sharp(`${G}/${f}`).resize(900).webp({ quality: 72 }).toFile(`${V}/${n}-v1.webp`); k++; }
  if (n.startsWith('space-')) {
    await sharp(`${G}/${f}`).resize(900).webp({ quality: 72 }).toFile(`${V}/${n}-v1.webp`);
    await sharp(`${G}/${f}`).resize(400).webp({ quality: 70 }).toFile(`${V}/${n}-sm-v1.webp`); k++;
  }
}
console.log('images', k);
