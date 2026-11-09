// Vector mark traced from his own Instagram badge (figure with spade + stone ground). Wordmark is set in type.
import sharp from 'sharp';
import potrace from '/Users/daniilsgoloveckis/dev/br-scrape/node_modules/potrace/lib/index.js';
import fs from 'fs';
const S = '/Users/daniilsgoloveckis/dev/br-scrape/';
const W = 1340, H = 770;
const white = (l, t, w, h) => ({ input: { create: { width: w, height: h, channels: 3, background: '#fff' } }, left: l, top: t });
const thr = await sharp(S + 'ig-pfp.jpg').extract({ left: 12, top: 18, width: 134, height: 77 }).resize(W, H, { kernel: 'lanczos3' }).blur(2.2).greyscale().threshold(110).toColourspace('srgb').png().toBuffer();
const buf = await sharp(thr).composite([white(0, 0, 200, 200), white(1100, 0, 240, 330), white(0, 722, W, 48)]).png().toBuffer();
fs.writeFileSync(S + 'mark-clean.png', buf);
potrace.trace(buf, { threshold: 128, turdSize: 80, optTolerance: 0.4, color: '#000' }, (e, svg) => {
  if (e) throw e;
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  fs.writeFileSync('research/mark-path.txt', d);
  console.log('path chars', d.length);
});
