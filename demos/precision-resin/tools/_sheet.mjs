// node tools/_sheet.mjs out.png id1 id2 ... (pexels ids, or u:<unsplash-url>)  -> labelled contact sheet
import sharp from 'sharp';
const [out, ...ids] = process.argv.slice(2);
const W = 360, H = 240, cols = 4;
const tiles = [];
for (const id of ids) {
  const url = id.startsWith('http') ? id : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&w=720`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = Buffer.from(await r.arrayBuffer());
    const img = await sharp(buf).resize(W, H, { fit: 'cover' }).toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="22"><rect width="${W}" height="22" fill="black" opacity=".7"/><text x="6" y="16" font-size="14" fill="white" font-family="Helvetica">${(id.startsWith('http') ? id.split('/')[3]?.slice(0,30) : id)}</text></svg>`);
    tiles.push(await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer());
  } catch (e) { console.log('fail', id); }
}
const rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#fff' } })
  .composite(tiles.map((t, j) => ({ input: t, left: (j % cols) * W, top: Math.floor(j / cols) * H }))).jpeg({ quality: 80 }).toFile(out);
