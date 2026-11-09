// Hero photos: his finished jobs, one per surface. Desktop = full frame, mobile = portrait crop on the focal point.
// Changed image = new suffix.
import sharp from 'sharp';
const R = 'research/raw/', O = 'public/client/', V = 'v1';
const hero = { // key: [raw file, focal x 0..1 for the portrait crop]
  'hero-resin': ['01', 0.5], 'hero-block': ['19', 0.55], 'hero-patio': ['31', 0.62], 'hero-concrete': ['44', 0.32],
};
for (const [k, [f, fx]] of Object.entries(hero)) {
  const src = sharp(R + f + '.jpg').rotate();
  const buf = await src.toBuffer(); const m = await sharp(buf).metadata();
  await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 64, effort: 6 }).toFile(`${O}${k}-1600-${V}.webp`);
  const cw = Math.round(m.height * (760 / 1100)); const left = Math.max(0, Math.min(m.width - cw, Math.round(m.width * fx - cw / 2)));
  await sharp(buf).extract({ left, top: 0, width: cw, height: m.height }).resize(760, 1100).webp({ quality: 62, effort: 6 }).toFile(`${O}${k}-m-${V}.webp`);
  console.log(k, m.width, m.height);
}
// patio: his landscape patio is mostly sky in a phone crop, so phones get his portrait porcelain patio (raw 12) instead
await sharp(R + '12.jpg').rotate().resize(760, 1100, { fit: 'cover', position: 'bottom' }).webp({ quality: 62, effort: 6 }).toFile(`${O}hero-patio-m-v2.webp`);
// surface chips in the hero card: a close crop of the surface itself from the same job photo
const chip = { resin: ['01', 640, 760], block: ['19', 620, 560], patio: ['31', 760, 980], concrete: ['44', 380, 640] };
for (const [k, [f, x, y]] of Object.entries(chip)) {
  const buf = await sharp(R + f + '.jpg').rotate().toBuffer();
  await sharp(buf).extract({ left: x, top: y, width: 360, height: 180 }).resize(200, 100).webp({ quality: 70 }).toFile(`${O}chip-${k}-${V}.webp`);
}
