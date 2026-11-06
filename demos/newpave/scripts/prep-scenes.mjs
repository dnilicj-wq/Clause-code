// Builds the photo assets for the hero and the driveway designer from stock/.
// For each scene in public/js/scenes.js:
//   photo -> 2048x2048 WebP (power of two, so the GPU can mipmap it with no work in the browser)
//   mask  -> PNG, R = drive outline (minus anything standing on it, e.g. a parked car), G = blurred (contact shade),
//            B = lighting map (scenes with `lit`): the original drive's brightness, blurred past its block pattern,
//            divided by its median. The new surface is multiplied by it, so it picks up the photo's real light and shade.
import sharp from 'sharp'; import { execFileSync } from 'node:child_process'; import fs from 'node:fs';
import { SCENES, MASK } from '../public/js/scenes.js';
const S = new URL('../stock/', import.meta.url).pathname, O = new URL('../public/img/', import.meta.url).pathname, T = '/tmp/np-scenes/';
fs.mkdirSync(T, { recursive: true });
const cutoutBin = () => { if (!fs.existsSync(T + 'cutout')) execFileSync('swiftc', ['-O', new URL('../tools/cutout.swift', import.meta.url).pathname, '-o', T + 'cutout']); return T + 'cutout'; };
const svgPoly = (W, H, polys, k, pad) => Buffer.from(`<svg width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/>${polys.map(pl => `<polygon points="${pl.map(([x, y]) => `${(pad + x * k).toFixed(1)},${(pad + y * k).toFixed(1)}`).join(' ')}" fill="#fff"/>`).join('')}</svg>`);
const grey = async (input, blur) => { let s = sharp(input); if (blur) s = s.blur(blur); const { data, info } = await s.greyscale().raw().toBuffer({ resolveWithObject: true }); const out = new Float32Array(info.width * info.height); for (let i = 0; i < out.length; i++) out[i] = data[i * info.channels] / 255; return out; };
// separable box blur x3 (close to a gaussian), Float32
function blurF(src, W, H, r) {
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) { let acc = 0; const o = y * W; for (let x = -r; x <= r; x++) acc += a[o + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) { b[o + x] = acc / (2 * r + 1); acc += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += b[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) { a[y * W + x] = acc / (2 * r + 1); acc += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
  }
  return a;
}

for (const [name, sc] of Object.entries(SCENES)) {
  await sharp(S + sc.stock).resize(...(sc.pot || [2048, 2048]), { fit: 'fill' }).webp({ quality: sc.pot ? 84 : 80 }).toFile(O + sc.src.split('/').pop());
  const mw = sc.mw || MASK.w, pad = MASK.pad, [pw, ph] = sc.size, k = mw / pw, h = Math.round(ph * k), W = mw + pad * 2, H = h + pad * 2, N = W * H;
  const poly = svgPoly(W, H, [sc.poly], k, pad);
  let R = await grey(poly, .8);
  // anything standing on the drive (the car) comes out of the mask
  let car = new Float32Array(N);
  if (sc.cut) {
    const c = sc.cut;
    await sharp(S + sc.stock).extract({ left: c.x, top: c.y, width: c.w, height: c.h }).resize(c.w * c.k).png().toFile(T + name + '-crop.png');
    execFileSync(cutoutBin(), [T + name + '-crop.png', T + name + '-fg.png']);
    const a = await sharp(T + name + '-fg.png').extractChannel(3).resize(Math.round(c.w * k), Math.round(c.h * k)).raw().toBuffer();
    const cw = Math.round(c.w * k), ox = Math.round(pad + c.x * k), oy = Math.round(pad + c.y * k);
    for (let y = 0; y < Math.round(c.h * k); y++) for (let x = 0; x < cw; x++) car[(oy + y) * W + ox + x] = a[y * cw + x] / 255;
    for (let i = 0; i < N; i++) R[i] *= 1 - car[i];
  }
  const Rb = Buffer.alloc(N); for (let i = 0; i < N; i++) Rb[i] = Math.round(R[i] * 255);
  const G = await grey(await sharp(Rb, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer(), 7);
  // lighting map
  let B = null;
  if (sc.lit) {
    const L = new Float32Array(N);
    const { data } = await sharp(S + sc.stock).resize(mw, h).raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < h; y++) for (let x = 0; x < mw; x++) { const i = (y * mw + x) * 3; const lin = v => Math.pow(v / 255, 2.2); L[(y + pad) * W + x + pad] = .2126 * lin(data[i]) + .7152 * lin(data[i + 1]) + .0722 * lin(data[i + 2]); }
    // where to trust the photo: the drive, less the car (grown a little so its dark paint never bleeds in) and the dark edge courses
    const strips = await grey(svgPoly(W, H, sc.lit.strips, k, pad));
    const carG = blurF(car, W, H, 2);
    const hard = await grey(svgPoly(W, H, [sc.poly], k, pad));
    const M = new Float32Array(N); for (let i = 0; i < N; i++) M[i] = hard[i] > .5 && carG[i] < .02 && strips[i] < .5 ? 1 : 0;
    const LM = L.map((v, i) => v * M[i]);
    // wide blur everywhere (overcast light changes slowly; this also hides the old blocks' red/grey mix),
    // a tight one only next to the car so its contact shadow stays crisp; very wide where little drive is in view
    const nb = r => { const a = blurF(LM, W, H, r), m = blurF(M, W, H, r); return [a.map((v, i) => m[i] > .005 ? v / m[i] : 0), m]; };
    const [Ls] = nb(Math.round(5 * k)), [Lb, mb] = nb(Math.round(40 * k)), [Lh] = nb(Math.round(110 * k));
    const near = blurF(car, W, H, Math.round(14 * k));
    const lum = new Float32Array(N);
    for (let i = 0; i < N; i++) { const big = mb[i] > .3 ? Lb[i] : Lh[i] + (Lb[i] - Lh[i]) * Math.max(0, mb[i] / .3); const w = Math.min(1, near[i] * 6); lum[i] = big + (Ls[i] - big) * w * (Ls[i] > 0 ? 1 : 0); }
    const vals = []; for (let i = 0; i < N; i++) if (M[i]) vals.push(lum[i]); vals.sort((a, b) => a - b); const med = vals[vals.length >> 1];
    B = new Float32Array(N); for (let i = 0; i < N; i++) B[i] = Math.min(1, Math.max(0, (R[i] > .002 ? lum[i] / med : 1) / 2));
    console.log(name, 'lighting map: median', med.toFixed(3), 'range', (vals[vals.length * .02 | 0] / med).toFixed(2), '-', (vals[vals.length * .98 | 0] / med).toFixed(2));
  }
  const out = Buffer.alloc(N * 3); for (let i = 0; i < N; i++) { out[i * 3] = Rb[i]; out[i * 3 + 1] = Math.round(G[i] * 255); out[i * 3 + 2] = B ? Math.round(B[i] * 255) : 128; }
  await sharp(out, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 9 }).toFile(O + sc.mask.split('/').pop());
}

console.log('scenes done');
