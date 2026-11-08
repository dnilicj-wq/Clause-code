// Gerald's own job photos (his Checkatrade album + review photos, saved in research/raw/) -> public/client/*.webp,
// plus his badge logo cropped for the nav/loader. Changed image = new suffix.
import sharp from 'sharp';
import fs from 'node:fs';
const R = 'research/raw/', O = 'public/client/', V = 'v1';
fs.mkdirSync(O, { recursive: true }); fs.mkdirSync('public/brand', { recursive: true });
export const pics = {
  'block-border': 'r3.jpg',        // grey block, charcoal border (Checkatrade review photo)
  'resin-border': 'r4.jpg',        // grey resin with charcoal block border (Checkatrade review photo)
  'resin-door': 'r5.jpg',
  'block-herringbone': 'p08.jpg',  // red brindle herringbone
  'block-wide': 'p18.jpg',
  'block-diamond': 'p19.jpg',
  'block-silver': 'p32.jpg',
  'block-semi': 'p21.jpg',
  'patio-curve': 'p30.jpg',
  'patio-porcelain': 'p14.jpg',
  'patio-sandstone': 'p52.jpg',
  'patio-garden': 'p44.jpg',
  'patio-path': 'p31.jpg',
};
for (const [k, f] of Object.entries(pics)) {
  const src = R + f, m = await sharp(src).metadata();
  await sharp(src).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${O}${k}-640-${V}.webp`);
  await sharp(src).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${O}${k}-1280-${V}.webp`);
  console.log(k, m.width, m.height);
}
// Badge: his round navy + chrome logo (Checkatrade profile image). Circle-masked so it sits on any background.
const L = R + 'p01.jpg', { width: W } = await sharp(L).metadata();
const mask = Buffer.from(`<svg width="${W}" height="${W}"><circle cx="${W / 2}" cy="${W / 2}" r="${W / 2 - 4}" fill="#fff"/></svg>`);
const badge = sharp(L).resize(W, W).composite([{ input: mask, blend: 'dest-in' }]).png();
const buf = await badge.toBuffer();
for (const s of [96, 192, 360]) await sharp(buf).resize(s).webp({ quality: 88, alphaQuality: 100 }).toFile(`public/brand/badge-${s}-v1.webp`);
await sharp(buf).resize(180).flatten({ background: '#0B1428' }).png().toFile('public/brand/icon-180-v1.png');
await sharp(buf).resize(64).png().toFile('public/favicon.png');
console.log('badge', W);
