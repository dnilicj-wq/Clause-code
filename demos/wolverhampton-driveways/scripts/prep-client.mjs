// Their own job photos (from wolverhamptondrivewaysltd.co.uk, saved in research/raw/) -> public/client/*.webp,
// plus the reversed logo for the dark theme. Changed image = new suffix.
import sharp from 'sharp';
import fs from 'node:fs';
const R = 'research/raw/WhatsApp-Image-', O = 'public/client/', V = 'v1';
fs.mkdirSync(O, { recursive: true }); fs.mkdirSync('public/brand', { recursive: true });
export const pics = {
  'resin-garage': '2024-03-13-at-16.16.23-3.jpeg',
  'resin-semi': '2024-03-13-at-16.16.24.jpeg',
  'resin-curve': '2024-03-13-at-16.16.23-5.jpeg',
  'resin-trees': '2024-03-13-at-16.16.23-6.jpeg',
  'resin-blockedge': '2024-03-13-at-16.16.23-7.jpeg',
  'resin-house': '2024-03-13-at-16.16.23-4.jpeg',
  'tarmac-border': '2024-03-13-at-16.23.57-1.jpeg',
  'tarmac-semi': '2023-08-16-at-16.09.20-1-1024x768-1.jpeg',
  'tarmac-garage': '2024-03-13-at-16.24.13-1.jpeg',
  'block-herringbone': '2024-03-13-at-16.05.42.jpeg',
  'block-bay': '2024-03-13-at-16.05.44-1.jpeg',
  'block-brindle': '2023-08-16-at-16.09.25-2-1024x931-1.jpeg',
  'patio-sandstone': '2024-03-13-at-16.18.05.jpeg',
  'patio-lawn': '2024-03-13-at-16.18.01.jpeg',
  'clean-brush': '2024-02-12-at-15.44.25-2-1024x768-1.jpeg',
};
for (const [k, f] of Object.entries(pics)) {
  const src = R + f, m = await sharp(src).metadata();
  await sharp(src).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${O}${k}-640-${V}.webp`);
  await sharp(src).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${O}${k}-1280-${V}.webp`);
  console.log(k, m.width, m.height);
}
// Reversed logo: black ink -> off-white, red stays red.
const L = 'research/raw/Wolverhampton-Driveways-Ltd-Logo-450px.fw_.png';
const { data, info } = await sharp(L).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  if (r < 90 && g < 90 && b < 90) { data[i] = 246; data[i + 1] = 244; data[i + 2] = 240; }
}
const rev = sharp(data, { raw: info });
await rev.clone().png().toFile('public/brand/logo-rev-v1.png');
await rev.clone().webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/logo-rev-v1.webp');
// mark only (W + D) = left 25% of the logo
await sharp(await rev.clone().png().toBuffer()).extract({ left: 0, top: 0, width: 112, height: 134 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/mark-rev-v1.webp');
await sharp('research/raw/cropped-Wolverhampton-Driveways-Ltd-Favicon.fw_.png').resize(64).png().toFile('public/favicon.png');
await sharp('research/raw/cropped-Wolverhampton-Driveways-Ltd-Favicon.fw_.png').resize(180).flatten({ background: '#0E0E0F' }).png().toFile('public/brand/icon-180-v1.png');
console.log('brand', info.width, info.height);
