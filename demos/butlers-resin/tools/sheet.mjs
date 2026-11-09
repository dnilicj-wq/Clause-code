import sharp from 'sharp'; import { readdirSync } from 'node:fs';
const [dir, prefix, out, cols, tw] = [process.argv[2], process.argv[3], process.argv[4], +process.argv[5], +process.argv[6]];
const files = readdirSync(dir).filter(f => f.startsWith(prefix + '-')).sort();
const metas = await Promise.all(files.map(f => sharp(`${dir}/${f}`).resize({ width: tw }).toBuffer({ resolveWithObject: true })));
const th = metas[0].info.height, rows = Math.ceil(files.length / cols);
await sharp({ create: { width: cols * (tw + 8), height: rows * (th + 8), channels: 3, background: '#444' } })
  .composite(metas.map((m, i) => ({ input: m.data, left: (i % cols) * (tw + 8), top: Math.floor(i / cols) * (th + 8) }))).jpeg({ quality: 70 }).toFile(out);
