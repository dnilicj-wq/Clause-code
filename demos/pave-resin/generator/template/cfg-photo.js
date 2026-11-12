  // ---------- scene: photo-real drive (client's own photo, surface re-laid in perspective) ----------
  // C.photo = { src, w, h, crop:[x,y,w,h], poly:[[x,y]...] (drive + border strip, photo px),
  //             plane:[[u,v]x4] metres, img:[[x,y]x4] photo px (homography), extent:[u0,u1,v0,v1], shadeK }
  const PH = C.photo || null;
  function solveH(src, dst) {
    // 8x8 system: dst = H * src (homogeneous)
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = dst[i];
      A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
    }
    for (let c = 0; c < 8; c++) {
      let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    return [...b.map((v, i) => v / A[i][i]), 1];
  }
  const photo = PH ? { img: null, ready: null, cache: {} } : null;
  if (PH) photo.ready = new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = () => { photo.img = im; res(); }; im.src = PH.src; });
  // plane texture: one canvas covering the drive in metres, T px per metre, front (v0) at the bottom
  const TPM = 100;
  function resinField(g, w, h, P, seed) {
    const im = g.createImageData(w, h), d = im.data, r = mulberry(seed), base = P.slice(0, 4), hi = P[4] || [240, 240, 240];
    for (let i = 0; i < w * h; i++) {
      const k = r(), c = k < 0.035 ? hi : base[(r() * base.length) | 0], f = 0.88 + r() * 0.24;
      d[i * 4] = clamp(c[0] * f); d[i * 4 + 1] = clamp(c[1] * f); d[i * 4 + 2] = clamp(c[2] * f); d[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  function planeTexture(spec) {
    const key = JSON.stringify(spec);
    if (photo.cache[key]) return photo.cache[key];
    const [u0, u1, v0, v1] = PH.extent, w = Math.round((u1 - u0) * TPM), h = Math.round((v1 - v0) * TPM);
    const c = mk(w, h), g = c.getContext('2d'), P = pal(spec.surface, spec.colour);
    if (spec.surface === 'resin') resinField(g, w, h, P, 17);
    else paintSurface(g, { x: 0, y: 0, w, h }, { ...spec, border: 'None' }, TPM, '');
    // border: soldier course along the front edge strip (v0 .. 0)
    const sh = Math.round(-v0 * TPM);
    if (spec.border && spec.border !== 'None') {
      const BP = PAL.block[spec.border] || PAL.block.Charcoal;
      g.save(); g.fillStyle = rgb(avg(BP), 0.55); g.fillRect(0, h - sh, w, sh);
      for (let x = 0; x < w; x += 0.1 * TPM) brick(g, x, h - sh, 0.1 * TPM, sh, BP, 9, 0.9);
      g.restore();
    } else if (spec.surface === 'resin') { /* resin runs to the edge */ }
    // mip chain
    const mips = []; let src = c;
    for (let L = 0; L < 5; L++) {
      const cw = src.width, ch = src.height;
      mips.push({ w: cw, h: ch, d: src.getContext('2d').getImageData(0, 0, cw, ch).data });
      if (cw < 64) break;
      const n = mk(Math.max(1, cw >> 1), Math.max(1, ch >> 1)), ng = n.getContext('2d'); ng.imageSmoothingQuality = 'high'; ng.drawImage(src, 0, 0, n.width, n.height); src = n;
    }
    return (photo.cache[key] = mips);
  }
  let PW = 0, PHh = 0, prep = null;
  function preparePhoto(W, Hh) {
    const [cx, cy, cw] = PH.crop, s = W / cw;
    const base = mk(W, Hh), bg = base.getContext('2d'); bg.imageSmoothingQuality = 'high';
    bg.drawImage(photo.img, cx, cy, cw, PH.crop[3], 0, 0, W, Hh);
    const lum = mk(W, Hh), lg = lum.getContext('2d'); if ('filter' in lg) lg.filter = `blur(${Math.max(1.5, 4 * s)}px)`; lg.drawImage(base, 0, 0);
    const mask = mk(W, Hh), mg = mask.getContext('2d'); if ('filter' in mg) mg.filter = `blur(${Math.max(0.6, 1.4 * s)}px)`;
    mg.fillStyle = '#fff'; mg.beginPath(); PH.poly.forEach(([x, y], i) => mg[i ? 'lineTo' : 'moveTo']((x - cx) * s, (y - cy) * s)); mg.closePath(); mg.fill();
    const bd = bg.getImageData(0, 0, W, Hh).data, ld = lg.getImageData(0, 0, W, Hh).data, md = mg.getImageData(0, 0, W, Hh).data;
    // inverse homography: canvas px -> plane metres
    const Hm = solveH(PH.img.map(([x, y]) => [(x - cx) * s, (y - cy) * s]), PH.plane);
    let x0 = W, x1 = 0, y0 = Hh, y1 = 0, sum = 0, n = 0;
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (md[i] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    // reference brightness of the original drive (front strip excluded)
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const i = (y * W + x) * 4; if (md[i] > 250) { const ww = Hm[6] * x + Hm[7] * y + 1, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / ww; if (v > 0.2) { sum += ld[i] * 0.3 + ld[i + 1] * 0.59 + ld[i + 2] * 0.11; n++; } } }
    return { W, Hh, bd, ld, md, Hm, box: [x0, x1, y0, y1], ref: sum / Math.max(1, n) };
  }
  function sample(m, tx, ty, out) {
    const w = m.w, h = m.h; tx = Math.min(w - 1.001, Math.max(0, tx)); ty = Math.min(h - 1.001, Math.max(0, ty));
    const x = tx | 0, y = ty | 0, fx = tx - x, fy = ty - y, d = m.d, i = (y * w + x) * 4, j = i + w * 4;
    for (let k = 0; k < 3; k++) out[k] = (d[i + k] * (1 - fx) + d[i + 4 + k] * fx) * (1 - fy) + (d[j + k] * (1 - fx) + d[j + 4 + k] * fx) * fy;
  }
  function photoScene(g, W, Hh, spec) {
    if (!prep || prep.W !== W || prep.Hh !== Hh) prep = preparePhoto(W, Hh);
    const { bd, ld, md, Hm, box: [x0, x1, y0, y1], ref } = prep, mips = planeTexture(spec);
    const [u0, , , v1] = PH.extent, K = PH.shadeK || 0.85, resin = spec.surface === 'resin';
    const out = g.createImageData(W, Hh), od = out.data; od.set(bd);
    const c = [0, 0, 0];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4, a = md[i] / 255; if (a <= 0) continue;
      const w = Hm[6] * x + Hm[7] * y + 1, u = (Hm[0] * x + Hm[1] * y + Hm[2]) / w, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / w;
      const w2 = Hm[6] * (x + 1) + Hm[7] * y + 1, du = (Hm[0] * (x + 1) + Hm[1] * y + Hm[2]) / w2 - u;
      const w3 = Hm[6] * x + Hm[7] * (y + 1) + 1, dv = (Hm[3] * x + Hm[4] * (y + 1) + Hm[5]) / w3 - v;
      const fp = Math.max(Math.abs(du), Math.abs(dv)) * TPM; let L = fp > 1 ? Math.min(mips.length - 1, Math.round(Math.log2(fp))) : 0;
      const m = mips[L], sc = 1 / (1 << L);
      sample(m, (u - u0) * TPM * sc, (v1 - v) * TPM * sc, c);
      let sh = 1;
      if (v > 0.03) { const l = ld[i] * 0.3 + ld[i + 1] * 0.59 + ld[i + 2] * 0.11; sh = Math.pow(Math.max(0.05, l / ref), K); sh = sh < 0.42 ? 0.42 : sh > 1.35 ? 1.35 : sh; }
      // gentle distance haze + resin sheen
      const haze = Math.min(0.12, Math.max(0, (v - 2) * 0.02));
      let r = c[0] * sh, gg = c[1] * sh, b = c[2] * sh;
      if (resin) { const sp = Math.max(0, 1 - Math.abs((x / W) - 0.62 + (y / Hh) * 0.35) * 5) * 14; r += sp; gg += sp; b += sp; }
      r = r * (1 - haze) + 200 * haze; gg = gg * (1 - haze) + 202 * haze; b = b * (1 - haze) + 206 * haze;
      od[i] = clamp(bd[i] * (1 - a) + r * a); od[i + 1] = clamp(bd[i + 1] * (1 - a) + gg * a); od[i + 2] = clamp(bd[i + 2] * (1 - a) + b * a);
    }
    g.putImageData(out, 0, 0);
  }
