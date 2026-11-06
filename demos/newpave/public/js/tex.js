// Procedural, tileable surface textures drawn on 2D canvases.
// Used by the services bento, the layer stack and the 3D driveway designer.
const rand = (s => () => (s = (s * 16807) % 2147483647) / 2147483647);
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb = (c, k = 1) => `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * k)))).join(',')})`;
const mk = s => { const c = document.createElement('canvas'); c.width = c.height = s; return [c, c.getContext('2d')]; };
// draw fn at x,y and wrapped copies so the tile repeats seamlessly
function wrap(S, x, y, r, fn) { for (const dx of [0, -S, S]) for (const dy of [0, -S, S]) { const X = x + dx, Y = y + dy; if (X > -r && X < S + r && Y > -r && Y < S + r) fn(X, Y); } }
function noise(ctx, S, amt, seed = 7, size = 1) {
  const r = rand(seed); const id = ctx.getImageData(0, 0, S, S), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * amt; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(id, 0, 0);
}

// resin-bound aggregate: packed rounded stones in a blend of colours, resin-gloss highlight
export function aggregate(colours, S = 512, stone = 7, seed = 3) {
  const [c, x] = mk(S); const r = rand(seed); const cs = colours.map(hex);
  const avg = cs[0].map((v, i) => (cs[0][i] * .45 + cs[1][i] * .35 + cs[2][i] * .2));
  x.fillStyle = rgb(avg, .32); x.fillRect(0, 0, S, S);
  const n = Math.round(S * S / (stone * stone) * 1.25);
  for (let i = 0; i < n; i++) {
    const px = r() * S, py = r() * S, rad = stone * (.42 + r() * .42), rot = r() * Math.PI;
    const p = r(); const col = p < .45 ? cs[0] : p < .8 ? cs[1] : cs[2]; const k = .7 + r() * .5;
    wrap(S, px, py, rad + 2, (X, Y) => {
      const g = x.createRadialGradient(X - rad * .35, Y - rad * .4, rad * .1, X, Y, rad);
      g.addColorStop(0, rgb(col, k * 1.25)); g.addColorStop(.7, rgb(col, k)); g.addColorStop(1, rgb(col, k * .62));
      x.fillStyle = g; x.beginPath(); x.ellipse(X, Y, rad, rad * (.7 + r() * .25), rot, 0, Math.PI * 2); x.fill();
    });
    if (r() < .08) wrap(S, px, py, 2, (X, Y) => { x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.arc(X - rad * .3, Y - rad * .35, Math.max(.6, rad * .16), 0, 7); x.fill(); });
  }
  return c;
}

// block paving: 200x100 blocks; S px = 1.2 m so a block is S/6 x S/12
export function blocks(pattern, colours, S = 512, seed = 5) {
  const [c, x] = mk(S); const r = rand(seed); const cs = colours.map(hex);
  x.fillStyle = '#b9ab90'; x.fillRect(0, 0, S, S); // kiln-dried sand joints
  const L = S / 6, W = S / 12, j = Math.max(1, S / 300);
  const blk = (bx, by, bw, bh) => {
    const col = cs[Math.floor(r() * cs.length)], k = .82 + r() * .3;
    wrap(S, bx + bw / 2, by + bh / 2, Math.max(bw, bh), (X, Y) => {
      const x0 = X - bw / 2 + j, y0 = Y - bh / 2 + j, w = bw - 2 * j, h = bh - 2 * j;
      x.fillStyle = rgb(col, k); x.fillRect(x0, y0, w, h);
      x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(x0, y0, w, j * 1.6); x.fillRect(x0, y0, j * 1.6, h);
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(x0, y0 + h - j * 1.6, w, j * 1.6); x.fillRect(x0 + w - j * 1.6, y0, j * 1.6, h);
    });
  };
  if (pattern === 'stretcher') {
    for (let row = 0; row < S / W; row++) for (let i = -1; i < S / L + 1; i++) blk(i * L + (row % 2 ? L / 2 : 0), row * W, L, W);
  } else if (pattern === 'basketweave') {
    for (let gy = 0; gy < S / L; gy++) for (let gx = 0; gx < S / L; gx++) {
      if ((gx + gy) % 2) { blk(gx * L, gy * L, L, W); blk(gx * L, gy * L + W, L, W); }
      else { blk(gx * L, gy * L, W, L); blk(gx * L + W, gy * L, W, L); }
    }
  } else { // herringbone 90°
    for (let k = 0; k < 12; k++) for (let i = 0; i < 3; i++) {
      const ox = k * W + i * 2 * W, oy = k * W - i * 2 * W;
      const X = ((ox % S) + S) % S, Y = ((oy % S) + S) % S;
      blk(X, Y, L, W); blk(X, Y + W, W, L);
    }
  }
  noise(x, S, 18, seed);
  return c;
}

export function tarmac(red = false, S = 512, seed = 9) {
  const [c, x] = mk(S); const r = rand(seed);
  x.fillStyle = red ? '#5a2722' : '#1f1f21'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < S * S / 10; i++) {
    const px = r() * S, py = r() * S, s = .6 + r() * 1.8, v = r();
    x.fillStyle = red ? `rgba(${150 + v * 60},${70 + v * 40},${60 + v * 30},${.25 + r() * .4})` : `rgba(${90 + v * 90},${90 + v * 90},${92 + v * 90},${.18 + r() * .35})`;
    x.fillRect(px, py, s, s);
  }
  noise(x, S, 14, seed);
  return c;
}

// porcelain: large 900x600 slabs with 3-4 mm joints and soft veining
export function porcelain(colours, S = 512, seed = 11) {
  const [c, x] = mk(S); const r = rand(seed); const cs = colours.map(hex);
  x.fillStyle = '#6d6a64'; x.fillRect(0, 0, S, S);
  const L = S / 2, W = S / 3, j = Math.max(1.2, S / 260);
  for (let row = 0; row < 3; row++) for (let i = -1; i < 3; i++) {
    const bx = i * L + (row % 2 ? L / 2 : 0), by = row * W, col = cs[Math.floor(r() * cs.length)], k = .92 + r() * .12;
    wrap(S, bx + L / 2, by + W / 2, L, (X, Y) => {
      const g = x.createLinearGradient(X - L / 2, Y - W / 2, X + L / 2, Y + W / 2);
      g.addColorStop(0, rgb(col, k * 1.04)); g.addColorStop(1, rgb(col, k * .94));
      x.fillStyle = g; x.fillRect(X - L / 2 + j, Y - W / 2 + j, L - 2 * j, W - 2 * j);
    });
  }
  for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(255,255,255,${.03 + r() * .05})`; x.lineWidth = .5 + r() * 2; x.beginPath(); const sx = r() * S, sy = r() * S; x.moveTo(sx, sy); x.bezierCurveTo(sx + r() * 80, sy + r() * 40, sx + r() * 120, sy - r() * 40, sx + r() * 200, sy + r() * 30); x.stroke(); }
  noise(x, S, 8, seed);
  return c;
}

// layer stack materials
export function soil(S = 256, seed = 2) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#5a4130'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) { const v = r(); x.fillStyle = `rgba(${70 + v * 70},${48 + v * 45},${30 + v * 30},.55)`; const s = 2 + r() * 10; x.beginPath(); x.arc(r() * S, r() * S, s, 0, 7); x.fill(); }
  for (let i = 0; i < 140; i++) { const v = r(); x.fillStyle = `rgba(${140 + v * 60},${130 + v * 50},${110 + v * 40},.8)`; x.beginPath(); x.ellipse(r() * S, r() * S, 1.5 + r() * 4, 1 + r() * 3, r() * 3, 0, 7); x.fill(); }
  noise(x, S, 26, seed); return c;
}
export function geotextile(S = 256, seed = 4) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#d9d6cf'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 1600; i++) { x.strokeStyle = `rgba(${150 + r() * 80},${150 + r() * 80},${150 + r() * 80},.35)`; x.lineWidth = .6; const sx = r() * S, sy = r() * S, a = r() * Math.PI, l = 6 + r() * 26; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); x.stroke(); }
  noise(x, S, 12, seed); return c;
}
export function mot(S = 256, seed = 6) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#6f6d69'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 1500; i++) {
    const px = r() * S, py = r() * S, s = 2 + r() * 9, v = .55 + r() * .55, n = 4 + Math.floor(r() * 3);
    wrap(S, px, py, s, (X, Y) => { x.fillStyle = rgb([150, 148, 142], v); x.beginPath(); for (let k = 0; k < n; k++) { const a = k / n * 6.283 + r() * .6, rr = s * (.6 + r() * .5); k ? x.lineTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr) : x.moveTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr); } x.closePath(); x.fill(); });
  }
  noise(x, S, 22, seed); return c;
}
export function basecourse(S = 256, seed = 8) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#26262a'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 1100; i++) { const v = r(); x.fillStyle = `rgba(${80 + v * 70},${80 + v * 70},${84 + v * 70},.6)`; x.beginPath(); x.arc(r() * S, r() * S, 1 + r() * 4.5, 0, 7); x.fill(); }
  noise(x, S, 16, seed); return c;
}
export function sand(S = 256, seed = 10) {
  const [c, x] = mk(S); x.fillStyle = '#c7b48d'; x.fillRect(0, 0, S, S); noise(x, S, 40, seed); return c;
}
export function lawn(S = 256, seed = 12) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#4b6b2c'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 4000; i++) { const v = r(); x.strokeStyle = `rgba(${50 + v * 60},${90 + v * 70},${30 + v * 30},.6)`; x.lineWidth = 1; const sx = r() * S, sy = r() * S; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (r() - .5) * 3, sy - 3 - r() * 5); x.stroke(); }
  return c;
}
export function brick(S = 512, seed = 13) {
  const [c, x] = mk(S); const r = rand(seed); x.fillStyle = '#b8b0a2'; x.fillRect(0, 0, S, S);
  const bw = S / 4, bh = S / 14;
  for (let row = 0; row < 14; row++) for (let i = -1; i < 5; i++) { const v = .78 + r() * .35; const bx = i * bw + (row % 2 ? bw / 2 : 0); x.fillStyle = rgb([150, 72, 48], v); x.fillRect(bx + 2, row * bh + 2, bw - 4, bh - 4); }
  noise(x, S, 22, seed); return c;
}
export const url = c => c.toDataURL('image/jpeg', .86);
