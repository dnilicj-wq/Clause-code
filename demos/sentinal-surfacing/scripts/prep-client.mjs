// Sentinal Surfacing: their own photos and logo from sentinalsurfacing.co.uk -> public/client + public/brand (WebP, two sizes).
// Usage: node scripts/prep-client.mjs <dir with the downloaded originals>
import sharp from 'sharp';
import fs from 'node:fs';
const RAW = process.argv[2];
if (!RAW) throw new Error('pass the folder with the originals');
// key -> original file name on their site (wp-content/uploads/2026/01/ unless noted)
export const files = {
  'darras-hall': 'Darras-Hall-Tyne-and-Wear.jpg',
  'durham-court': 'Durham-4.jpg',
  'durham-barn': 'Durham-5.jpg',
  'irthington': 'Irthington-Carlisle-5.jpg',
  'irthington-air': 'Irthington-Carlisle.jpg',
  'wetherby-night': 'Wetherby-3.jpg',
  'warkworth': 'Warkworth-05.25-2.jpg',
  'houghton': 'Houghton-Le-Spring.jpg',
  'gosforth': 'Gosforth.jpg',
  'blaydon': 'Blaydon-after.jpg',
  'whickham': 'Whickham-06.25.jpg',
  'cockermouth': 'Cockermouth-2.jpg',
  'seaham': 'Seaham-Hall-Sunderland-2.jpg',
  'drone-house': 'new-portfolo-2.jpeg',
  'dalston': 'Dalston-7.jpg',
  'portland-lounge': 'Portland-House.jpg',
  'portland-hall': 'Portland-House-2.jpg',
  'hanover': 'Microcement-Hanover-Point-5-1.jpg',
  'morpeth-gloss': 'Microcement-Morpeth-2.jpg',
  'morpeth-floor': 'Microcement-Morpeth.jpg',
  'mc-kitchen': 'Microcement-Kitchen.jpg',
  'mc-nottingham': 'Microcement-Nottingham.jpg',
  'int-hall': 'WhatsApp-Image-2026-01-28-at-11.30.03-AM.jpeg',
  'int-dining': 'WhatsApp-Image-2026-01-28-at-11.30.05-AM-1.jpeg',
  'int-bath': 'WhatsApp-Image-2026-01-28-at-11.30.04-AM.jpeg',
  'int-grey': '2b25b19c-7f92-4d70-b7b6-5344bf075c14.jpg',
  'pool-day': 'f8cd1176-b719-455e-89d7-9a623353acf2.jpg',
  'pool-night': 'ec2ce9e9-c593-4d52-87ad-c71c6d8cb150.jpg',
};
fs.mkdirSync('public/client', { recursive: true }); fs.mkdirSync('public/brand', { recursive: true });
const dims = {};
for (const [k, f] of Object.entries(process.env.BRAND_ONLY ? {} : files)) {
  const src = `${RAW}/${f}`; const m = await sharp(src).rotate().metadata();
  for (const w of [640, 1280]) {
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w === 640 ? 72 : 76 }).toFile(`public/client/${k}-${w}-v1.webp`);
  }
  dims[k] = [m.width, m.height];
}
console.log(JSON.stringify(dims));
// logo: white mark + white SENTINAL + amber SURFACING (their light-on-dark logo)
const L = `${RAW}/Sentinal-Surfacing-Logo-1536-1-copy.png`;
await sharp(L).trim().png().toFile('public/brand/logo-v1.png');
await sharp(L).trim().resize({ height: 96 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/logo-96-v1.webp');
// the round S mark on its own (left square of the logo)
const tb = await sharp(L).trim().png().toBuffer(); const lm = await sharp(tb).metadata();
await sharp(tb).extract({ left: 0, top: 0, width: lm.height, height: lm.height }).resize(160).png().toFile('public/brand/mark-v1.png');
// favicon / touch icon from their navy S
const F = `${RAW}/logo-dark.png`;
await sharp(F).resize(64).png().toFile('public/favicon.png');
await sharp(F).resize(180).flatten({ background: '#0A0E1A' }).png().toFile('public/brand/icon-180-v1.png');
