import sharp from 'sharp'; import fs from 'node:fs'; import path from 'node:path';
const dir = 'public/img/source', out = process.argv[2];
const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const W = 300, H = 220, cols = 6; const tiles = []; const meta = [];
for (const [i, f] of files.entries()) {
  const m = await sharp(path.join(dir, f)).metadata(); meta.push([i, f, m.width + 'x' + m.height]);
  const img = await sharp(path.join(dir, f)).flatten({ background: '#888' }).resize(W, H - 24, { fit: 'contain', background: '#222' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="24"><rect width="100%" height="100%" fill="#000"/><text x="4" y="17" font-size="14" fill="#fff" font-family="Arial">${i} ${m.width}x${m.height}</text></svg>`);
  tiles.push({ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H }, { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H + H - 24 });
}
const rows = Math.ceil(files.length / cols);
await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#111' } }).composite(tiles).jpeg({ quality: 70 }).toFile(out);
console.log(meta.map(m => m.join('  ')).join('\n'));
