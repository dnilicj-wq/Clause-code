import sharp from 'sharp';
const list = {
  'home-garage-car': 37703762, 'garage-gloss-car': 9139594, 'living-gloss': 38975397, 'garage-gym': 7174396,
  'driveway': 8134845, 'garage-bare': 34764058, 'hands-trowel': 38561968,
};
for (const [name, id] of Object.entries(list)) {
  const r = await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&w=2400`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buf = Buffer.from(await r.arrayBuffer());
  const m = await sharp(buf).metadata();
  for (const w of [1600, 800]) {
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/demo/${name}-${w}-v1.webp`);
  }
  console.log(name, id, `${m.width}x${m.height}`);
}
