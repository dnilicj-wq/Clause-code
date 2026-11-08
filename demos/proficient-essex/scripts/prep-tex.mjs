// Bakes the hero/configurator textures from CC0 Poly Haven scans in research/tex/ (asphalt_02, clean_pebbles, concrete_moss).
// Data maps are single-channel greyscale (packing data into RGB breaks under lossy WebP chroma subsampling).
// Changed texture = new suffix.
import sharp from 'sharp';
const T = 'research/tex/', O = 'public/tex/', N = 1024;
const g1 = (buf) => sharp(buf, { raw: { width: N, height: N, channels: 1 } });
const blur1 = async (buf, r) => sharp(await g1(buf).blur(r).raw().toBuffer(), { raw: { width: N, height: N, channels: 3 } }).extractChannel(0).raw().toBuffer();
const gray = async (f, blur) => { const b = await sharp(T + f).resize(N, N).greyscale().extractChannel(0).raw().toBuffer(); return blur ? blur1(b, blur) : b; };
const pct = (arr, p) => { const a = Float32Array.from(arr).sort(); return a[Math.floor(p * (a.length - 1))]; };

await sharp(T + 'asphalt_02_diff_2k.jpg').resize(N, N).webp({ quality: 72 }).toFile(`${O}before-v1.webp`); // asphalt_02
await sharp(T + 'concrete_moss_diff_2k.jpg').resize(512, 512).modulate({ saturation: 1.15 }).webp({ quality: 72 }).toFile(`${O}moss-v1.webp`);
// crack core (spread comes from mip sampling in the shader)
{
  const L = await gray('asphalt_02_diff_2k.jpg'), LB = await gray('asphalt_02_diff_2k.jpg', 10);
  const raw = Buffer.alloc(N * N);
  for (let i = 0; i < N * N; i++) raw[i] = Math.max(0, Math.min(255, (LB[i] - L[i] - 14) * 9));
  await g1(raw).median(5).blur(0.8).toColourspace('b-w').jpeg({ quality: 80 }).toFile(`${O}crack-v1.jpg`);
}
// pebbles: local-contrast greyscale (per-stone tone + shading); colour comes from the blend in the shader
{
  const c = await gray('clean_pebbles_diff_2k.jpg'), cB = await gray('clean_pebbles_diff_2k.jpg', 24), ao = await gray('clean_pebbles_ao_2k.jpg');
  const d = new Float32Array(N * N); for (let i = 0; i < N * N; i++) d[i] = (c[i] - cB[i]) + (ao[i] - 200) * 0.5;
  const lo = pct(d, 0.01), hi = pct(d, 0.995);
  const out = Buffer.alloc(N * N); for (let i = 0; i < N * N; i++) out[i] = Math.max(0, Math.min(255, (d[i] - lo) / (hi - lo) * 255));
  await g1(out).toColourspace('b-w').jpeg({ quality: 70, mozjpeg: true }).toFile(`${O}stone-v1.jpg`);
}
console.log('textures baked');
// per-stone selector: segment the stones (bright regions between dark gaps), give each stone one random value.
// The shader maps that value to one of the blend's colours, so whole stones change colour together.
{
  const st = await gray('clean_pebbles_ao_2k.jpg');
  const sm0 = await blur1(st, 1.5), loc = await blur1(st, 5);
  const TH = +(process.env.TH || 200); const sm = Buffer.alloc(N * N); for (let i = 0; i < N * N; i++) sm[i] = sm0[i] > Math.max(TH, loc[i] - 6) ? 255 : 0;
  const lab = new Int32Array(N * N).fill(-1); let n = 0; const vals = [];
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const q = new Int32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    if (lab[i] >= 0 || sm[i] < 150) continue;
    let h = 0, t = 0; q[t++] = i; lab[i] = n;
    while (h < t) { const k = q[h++], x = k % N, y = (k / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = (x + dx + N) % N, yy = (y + dy + N) % N, j = yy * N + xx; // wraps: texture tiles
        if (lab[j] < 0 && sm[j] >= 150) { lab[j] = n; q[t++] = j; } } }
    vals.push(rnd()); n++;
  }
  // grow labels into the gaps so every pixel has a value (gaps are dark anyway)
  for (let it = 0; it < 12; it++) { const nl = lab.slice();
    for (let k = 0; k < N * N; k++) if (lab[k] < 0) { const x = k % N, y = (k / N) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = ((y + dy + N) % N) * N + (x + dx + N) % N; if (lab[j] >= 0) { nl[k] = lab[j]; break; } } }
    lab.set(nl); }
  const out = Buffer.alloc(N * N); for (let i = 0; i < N * N; i++) out[i] = lab[i] < 0 ? 128 : Math.round(vals[lab[i]] * 255);
  await g1(out).toColourspace('b-w').png({ compressionLevel: 9, palette: false }).toFile(`${O}pick-v1.png`);
  console.log('stones', n);
}
