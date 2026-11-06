// Photo scenes for the hero and the driveway designer. Photos: Pexels (free licence), example images only.
// Coordinates are pixels in the original photo (size). H maps photo pixels to ground-plane metres,
// solved from four points of a known rectangle on the ground (see scripts/prep-scenes.mjs).
export function homography(src, dst) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
  return [...b.map((v, i) => v / A[i][i]), 1];
}
export const applyH = (H, x, y) => { const w = H[6] * x + H[7] * y + H[8]; return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]; };
// column-major for uniformMatrix3fv
// baked outline masks (scripts/prep-scenes.mjs): 1200 px wide with a 60 px pad so the blur never hits an edge
export const MASK = { w: 1200, pad: 60 };
export function maskDM(sc) { const [pw, ph] = sc.size, h = Math.round(ph * MASK.w / pw), W = MASK.w + MASK.pad * 2, H = h + MASK.pad * 2; return [MASK.pad / W, MASK.pad / H, MASK.w / W, h / H]; }
export const glMat = H => new Float32Array([H[0], H[3], H[6], H[1], H[4], H[7], H[2], H[5], H[8]]);

// garden: frontal camera, horizon at y=816, f*h = 2560 px.m, f = 1600 px
const gpt = (X, Z) => [1200 + 1600 * X / Z, 816 + 2560 / Z];
const GX0 = -4.6, GX1 = 4.6, GZ0 = 4.4, GZ1 = 9.5;

export const SCENES = {
  front: {
    label: 'Front drive', src: '/img/scene-front-b.webp', mask: '/img/scene-front-mask-b.png', size: [2400, 1602],
    // the inlaid square on the right of the drive is 1.6 m a side (8 blocks)
    H: homography([[1563, 1213], [1767, 1093], [2142, 1148], [2100, 1350]], [[0, 0], [1.6, 0], [1.6, 1.6], [0, 1.6]]),
    poly: [[-80, 1038], [90, 1027], [330, 987], [622, 963], [1040, 933], [1064, 915], [1298, 915], [1312, 927], [1546, 953], [1592, 963], [2000, 1011], [2480, 1074], [2480, 1700], [-80, 1700]],
    vb: 935, // where the drive meets the house (photo y), for reflections
    edges: [[0, 'kerb'], [1, 'kerb'], [2, 'kerb'], [3, 'house'], [4, 'house'], [5, 'house'], [6, 'house'], [7, 'house'], [8, 'kerb'], [9, 'kerb'], [10, 'kerb']],
    // car cut-out: placed by its left edge, tyre line and width (photo px); foot = ground footprint corners as fractions of the cut-out
    car: { src: '/img/car-eclass-a.webp', x: 1400, bottom: 1172, w: 730, foot: [[.05, .9], [.42, .985], [.95, .79], [.74, .72]] },
    focus: [.6, .62], sun: [-.35, .8, .5]
  },
  garden: {
    label: 'Back garden', src: '/img/scene-garden-b.webp', mask: '/img/scene-garden-mask-b.png', size: [2400, 1631],
    H: homography([gpt(GX0, GZ0), gpt(GX1, GZ0), gpt(GX1, GZ1), gpt(GX0, GZ1)], [[GX0, GZ0], [GX1, GZ0], [GX1, GZ1], [GX0, GZ1]]),
    poly: [gpt(GX0, GZ0), gpt(GX1, GZ0), gpt(GX1, GZ1), gpt(GX0, GZ1)],
    edges: [[0, 'kerb'], [1, 'kerb'], [2, 'house'], [3, 'kerb']],
    vb: 1086, focus: [.5, .62], sun: [-.4, .8, .6]
  }
};
