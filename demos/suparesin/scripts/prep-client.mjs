// Suparesin's own photos, as published on suparesin.co.uk (saved in research/raw/) -> public/client/*.webp,
// plus his logo for the nav/loader. Changed image = new suffix.
import sharp from 'sharp';
import fs from 'node:fs';
const R = 'research/raw/', O = 'public/client/', V = 'v1';
fs.mkdirSync(O, { recursive: true }); fs.mkdirSync('public/brand', { recursive: true });
export const pics = {
  'drive-gold': 'light-coloured-resin-bound-driveway-installation-ar32-900px.jpg',
  'drive-path': 'light-coloured-resin-bound-driveway-and-garden-path-ar32-900px.jpg',
  'drive-wall': 'resin-bound-driveway-desktop-hero-ar62-900px.jpg',
  'drive-garage': 'resin-bound-driveway-with-block-paving-border-ar32-900px.jpg',
  'drive-grey': 'resin-bound-driveways-in-wirral-cheshire-and-north-wales-ar32-1200px.jpg',
  'drive-house': 'coloured-resin-bound-driveway-installation-ar32-900px.jpg',
  'drive-red': 'we-provide-resin-bound-driveway-installation-ar169-900px.jpg',
  'path-side': 'resin-bound-garden-path-installation-ar43-800px.jpg',
  'path-garden': 'we-provide-decorative-resin-bound-garden-path-installation-ar11-800px.jpg',
  'metallic-grey': 'beautiful-metallica-epoxy-floor-installation-in-a-bathroom-ar43-900px.jpg',
  'metallic-copper': 'metallica-epoxy-floor-installation-in-progress-ar34-900px.jpg',
  'metallic-room': 'metallica-epoxy-floor-installation-in-progress-ar169-900px.jpg',
  'metallic-kitchen': 'metallic-epoxy-flooring-installed-in-a-kitchen-ar32-900px.jpg',
  'metallic-dark': 'metallica-epoxy-pattern-flooring-installation-ar43-900px.jpg',
  'highbuild-pour': 'we-provide-high-build-epoxy-flooring-ar169-1920px.jpg',
  'highbuild-grey': 'we-provide-high-build-epoxy-flooring-ar43-1800px.jpg',
  'highbuild-white': 'high-build-epoxy-flooring-in-an-industrial-installation-ar32-900px.jpg',
  'highbuild-yellow': 'commercial-use-high-build-epoxy-flooring-ar34-800px-1.jpg',
  'flake-garage': 'we-provide-resin-flake-flooring-ar11-500px.jpg',
  'flake-blue': 'resin-flake-flooring-pattern-detail-ar32-900px.jpg',
  'flake-gold': 'resin-flake-flooring-texture-detail-ar32-900px.jpg',
  'worktop-wood': 'metallic-epoxy-countertop-installation-in-a-kitchen-ar32-900px.jpg',
  'worktop-slate': 'metallic-epoxy-resin-kitchen-worktop-installation-ar34-800px.jpg',
  'rubber-play': 'rubber-crumb-surfacing-with-colours-and-shapes-in-a-play-area-ar32-900px.jpg',
};
for (const [k, f] of Object.entries(pics)) {
  const src = R + f, m = await sharp(src).metadata();
  await sharp(src).rotate().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`${O}${k}-640-${V}.webp`);
  await sharp(src).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`${O}${k}-1280-${V}.webp`);
  console.log(k, m.width, m.height);
}
// Logo: his black + gold SUPA / SR / RESIN wordmark (suparesin.co.uk header) and his favicon mark.
await sharp(R + 'suparesin-logo.png').resize({ width: 480 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/logo-480-v1.webp');
await sharp(R + 'suparesin-favicon.png').resize(64).png().toFile('public/favicon.png');
await sharp(R + 'suparesin-favicon.png').resize(180).flatten({ background: '#0C0B0A' }).png().toFile('public/brand/icon-180-v1.png');
console.log('logo done');
// The same logo for dark backgrounds: his black lettering turned warm white, the gold kept exactly.
{
  const { data, info } = await sharp(R + 'suparesin-logo.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gold = r > 150 && g > 100 && b < 120 && r - b > 80;
    if (!gold && data[i + 3] > 0) { const k = 1 - Math.max(r, g, b) / 255; data[i] = 244; data[i + 1] = 239; data[i + 2] = 230; data[i + 3] = Math.round(data[i + 3] * Math.min(1, k * 1.15)); }
  }
  await sharp(data, { raw: info }).resize({ width: 480 }).webp({ quality: 90, alphaQuality: 100 }).toFile('public/brand/logo-light-480-v1.webp');
  console.log('light logo done');
}
