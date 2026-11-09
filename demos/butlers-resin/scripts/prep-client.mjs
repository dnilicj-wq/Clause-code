// Butler's own job photos (butlersrc.co.uk recent projects + home, and Checkatrade job photos), saved in research/raw/
// -> public/client/*.webp. Changed image = new suffix.
import sharp from 'sharp';
import fs from 'node:fs';
const R = 'research/raw/', O = 'public/client/', V = 'v1';
fs.mkdirSync(O, { recursive: true }); fs.mkdirSync('public/brand', { recursive: true });
export const pics = {
  'resin-dusk': '00', 'resin-dusk-2': '01', 'resin-steps': '04', 'resin-circles': '05', 'resin-fence': '08',
  'resin-porch': '11', 'patio-porcelain': '12', 'resin-long': '13', 'resin-corner': '16', 'block-herringbone': '19',
  'resin-border': '20', 'resin-circle-patio': '21', 'resin-garage': '23', 'resin-farm': '25', 'resin-palms': '27',
  'resin-grey-path': '29', 'resin-bed': '30', 'patio-porcelain-2': '31', 'resin-side': '34', 'resin-bay': '35',
  'resin-compass': '36', 'kerb-1': '40', 'kerb-2': '42', 'base-dig': '44', 'base-membrane': '43',
  'concrete-old': '37',
};
for (const [k, f] of Object.entries(pics)) {
  const src = R + f + '.jpg';
  await sharp(src).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${O}${k}-640-${V}.webp`);
  await sharp(src).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${O}${k}-1280-${V}.webp`);
}
// his stacked before/after posts: top half = before, bottom half = after (white gap between)
for (const [k, f] of [['ba-drive', '06'], ['ba-steps', '15']]) {
  const src = R + f + '.jpg'; const m = await sharp(src).metadata(); const h = Math.floor(m.height / 2) - 8;
  await sharp(src).extract({ left: 0, top: 0, width: m.width, height: h }).resize({ width: 1080 }).webp({ quality: 74 }).toFile(`${O}${k}-before-${V}.webp`);
  await sharp(src).extract({ left: 0, top: m.height - h, width: m.width, height: h }).resize({ width: 1080 }).webp({ quality: 74 }).toFile(`${O}${k}-after-${V}.webp`);
  console.log(k, m.width, m.height);
}
// his badge logo, cropped from the corner of his own before/after post
await sharp(R + '06.jpg').extract({ left: 930, top: 14, width: 140, height: 140 }).resize(560).png().toFile('research/badge-crop.png');
