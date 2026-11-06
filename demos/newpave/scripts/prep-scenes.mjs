// Builds the photo assets for the hero and the driveway designer from stock/ (Pexels, free licence).
// 1. house photos -> public/img/scene-*.webp  2. E-Class: blank the foreign number plate,
// cut the car out with Apple Vision (tools/cutout.swift, macOS 14+), save as an alpha WebP.
import sharp from 'sharp'; import { execFileSync } from 'node:child_process'; import fs from 'node:fs';
const S = new URL('../stock/', import.meta.url).pathname, O = new URL('../public/img/', import.meta.url).pathname, T = '/tmp/np-scenes/';
fs.mkdirSync(T, { recursive: true });
for (const [src, out] of [['pexels-8134845-front.jpg', 'scene-front-a'], ['pexels-7546775-garden.jpg', 'scene-garden-a']]) {
  await sharp(S + src).resize(2048).webp({ quality: 80 }).toFile(O + out + '.webp');
}
// plate: plain UK-style white plate, no characters
const plate = Buffer.from(`<svg width="2400" height="1600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f3ee"/><stop offset="1" stop-color="#d9d8d2"/></linearGradient></defs>
<polygon points="257,1011 373,1042 367,1125 252,1094" fill="#1b1b1d"/><polygon points="262,1017 368,1046 362,1119 257,1089" fill="url(#g)"/></svg>`);
await sharp(S + 'pexels-15535501-eclass.jpg').composite([{ input: plate }]).jpeg({ quality: 95 }).toFile(T + 'car-src.jpg');
if (!fs.existsSync(T + 'cutout')) execFileSync('swiftc', ['-O', new URL('../tools/cutout.swift', import.meta.url).pathname, '-o', T + 'cutout']);
execFileSync(T + 'cutout', [T + 'car-src.jpg', T + 'car.png']);
const t = await sharp(T + 'car.png').trim().toBuffer();
await sharp(t).modulate({ brightness: 1.03, saturation: 1.05 }).resize(1100).webp({ quality: 82, alphaQuality: 90 }).toFile(O + 'car-eclass-a.webp');
console.log('scenes done', (await sharp(O + 'car-eclass-a.webp').metadata()).width, (await sharp(O + 'car-eclass-a.webp').metadata()).height);
