// layer-build: a surface that builds itself as you scroll (from Newpave's "Block paving" card,
// where the bricks fly in and lay themselves). One small SVG per service card; every piece carries
// --t (when it arrives, 0..1 of the card's scroll progress) and CSS turns the shared --p into motion.
// Pure function, no DOM: used by the React wrapper and by the static trade-demos generator.
//
// render({ variant, colours?, pattern?, label?, stages? })
//   variant: 'block' | 'resin' | 'tarmac' | 'sandstone' | 'polished-concrete' | 'microcement' | 'epoxy'
//   colours: material colours sampled from the client's own photos (variant-specific, see DEFAULTS)
//   pattern: block only, 'herringbone' | 'basketweave' | 'stretcher'
//   label:   accessible description, e.g. "Grey herringbone block paving being laid"
//   stages:  override the stage captions under the drawing

const W = 320, H = 140;
const r2 = (n) => Math.round(n * 100) / 100;
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const DEFAULTS = {
  block: { colours: ['#8d8a86', '#77736f', '#a19d97'], joint: '#c9c4bb', border: '#3d3b39', pattern: 'herringbone' },
  resin: { colours: ['#b49a74', '#8e7756', '#d8c6a5', '#6d5a40'], base: '#5c5853' },
  tarmac: { colours: ['#2b2b2d'], sub: '#9b9183', binder: '#4a4a4c', soil: '#6b5440' },
  sandstone: { colours: ['#c9b38f', '#b89d77', '#d6c3a1', '#a88d69'], joint: '#7d7368' },
  'polished-concrete': { colours: ['#a9a6a1'], raw: '#8b8781', agg: ['#d8d4cd', '#6f6b66', '#bdb6aa'] },
  microcement: { colours: ['#cfc8bd'], board: '#e3ddd3', coat1: '#b9b1a5' },
  gravel: { colours: ['#c7c3bd', '#a9a59f', '#8f8b86', '#dcd8d2'], grid: '#3b3d40', membrane: '#1f2123' },
  turf: { colours: ['#5f8f3a', '#4f7d2f', '#6ea046'], soil: '#5a4433' },
  epoxy: { colours: ['#6f7378'], flakes: ['#e8e4dc', '#2f3236', '#9aa0a6'], substrate: '#8e8a84', primer: '#c9a86a' },
};
export const STAGES = {
  block: ['Edging laid', 'Blocks laid', 'Joints filled'],
  resin: ['Base ready', 'Resin poured', 'Trowelled level'],
  tarmac: ['Sub-base', 'Binder course', 'Surface course'],
  sandstone: ['Mortar bed', 'Slabs laid', 'Joints pointed'],
  'polished-concrete': ['Raw slab', 'Ground in passes', 'Sealed to a sheen'],
  microcement: ['Primed board', 'First coat', 'Second coat, sealed'],
  gravel: ['Membrane', 'Grid laid', 'Stones settled'],
  turf: ['Soil levelled', 'Turf rolled out', 'Edges trimmed'],
  epoxy: ['Primer', 'Body coat', 'Flake', 'Topcoat'],
};

const piece = (t, extra = '') => `style="--t:${r2(t)}${extra ? ';' + extra : ''}"`;

function bricks(o, R) {
  const { colours, joint, border, pattern } = o;
  const U = 9; // brick = 2U × U
  const out = [];
  const add = (x, y, w, h, order) => out.push({ x, y, w, h, order });
  if (pattern === 'stretcher') {
    for (let row = 0, y = 0; y < H; row++, y += U) for (let x = -(row % 2) * U; x < W; x += 2 * U) add(x, y, 2 * U, U, x + y * .4);
  } else if (pattern === 'basketweave') {
    for (let cy = 0; cy < H; cy += 2 * U) for (let cx = 0; cx < W; cx += 2 * U) {
      const flip = ((cx + cy) / (2 * U)) % 2;
      if (flip) { add(cx, cy, U, 2 * U, cx + cy * .4); add(cx + U, cy, U, 2 * U, cx + U + cy * .4); }
      else { add(cx, cy, 2 * U, U, cx + cy * .4); add(cx, cy + U, 2 * U, U, cx + (cy + U) * .4); }
    }
  } else {
    // 90° herringbone staircases, laid at 45° to the edging like most block drives
    const c = Math.SQRT1_2, cx0 = W / 2, cy0 = H / 2;
    for (let s = -12; s <= 12; s++) for (let k = -26; k <= 26; k++) {
      for (const [x, y, w, h] of [[k + 2 * s, k - 2 * s, 2, 1], [k + 2 + 2 * s, k - 1 - 2 * s, 1, 2]]) {
        const mx = (x + w / 2) * U, my = (y + h / 2) * U;
        const X = cx0 + (mx - my) * c, Y = cy0 + (mx + my) * c; // rotated centre
        if (X < -14 || X > W + 14 || Y < -14 || Y > H + 14) continue;
        out.push({ x: x * U, y: y * U, w: w * U, h: h * U, order: X + Y * .35, rot: true });
      }
    }
  }
  const min = Math.min(...out.map((b) => b.order)), max = Math.max(...out.map((b) => b.order));
  const g = out.map((b) => {
    const t = 0.1 + 0.62 * (b.order - min) / (max - min || 1) + R() * 0.03;
    const f = colours[Math.floor(R() * colours.length)];
    return `<rect class="lb-brick" x="${b.x + .6}" y="${b.y + .6}" width="${b.w - 1.2}" height="${b.h - 1.2}" rx="1" fill="${f}" ${piece(t, `--dr:${Math.round((R() - .5) * 30)}deg`)}/>`;
  }).join('');
  const rot = pattern === 'herringbone' || !pattern;
  const kerb = Array.from({ length: Math.ceil(W / 9) }, (_, i) => `<rect class="lb-kerb" x="${i * 9 + .5}" y="${H - 12}" width="8" height="12" rx="1" fill="${border}" ${piece(0.02 + i * 0.0018)}/>`).join('');
  return `<rect width="${W}" height="${H}" fill="${joint}"/><g clip-path="url(#CLIP)"><g${rot ? ` transform="translate(${W / 2} ${H / 2}) rotate(45)"` : ''}>${g}</g></g>${kerb}<rect class="lb-sand" width="${W}" height="${H - 12}" ${piece(0.84, '--sp:6')}/>`;
}

function resin(o, R) {
  // procedural aggregate: ~1050 individual stones (2-6px), 4 tones, drop shadows + lit highlights, no repeating tile
  const tones = [...o.colours, ...DEFAULTS.resin.colours].slice(0, 4);
  const f = (n) => Math.round(n * 10) / 10;
  const groups = tones.map(() => []), hi = [];
  const ell = (x, y, rx, ry) => `M${f(x - rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0`;
  for (let i = 0; i < (o.aggImg ? 0 : 1050); i++) {
    const x = R() * (W + 6) - 3, y = R() * (H - 8) - 2, r = 1 + R() * R() * 2.1, t = (R() * 4) | 0;
    groups[t].push(ell(x, y, r, r * (0.62 + R() * 0.3)));
    if (R() < 0.28) hi.push(ell(x - r * 0.3, y - r * 0.32, r * 0.36, r * 0.24));
  }
  const edge = 'M0 0 C 9 18 -7 36 4 54 S -6 92 3 110 S -4 132 0 140 L 360 140 L 360 0 Z';
  // opts.aggImg: a pre-rendered aggregate texture (same renderer as a site's hero) instead of the SVG stones
  if (o.aggImg) return `<image href="${esc(o.aggImg)}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
<g class="lb-front" ${piece(0.08, '--sp:1.45')}><path d="${edge}" fill="${o.base}"/><path d="${edge}" fill="none" stroke="${tones[2]}" stroke-width="3" opacity=".55"/>
<g transform="translate(-6 0)" class="lb-trowel"><rect x="-6" y="56" width="12" height="30" rx="2" fill="#e8e6e2" stroke="#2b2b2b" stroke-width=".8"/><rect x="-1.5" y="66" width="3" height="10" fill="#2b2b2b"/></g></g>
<rect class="lb-sheen" width="90" height="${H}" fill="url(#SHEEN)" ${piece(0.82, '--sp:5')}/>`;
  return `<defs>${groups.map((g, i) => `<path id="RSN${i}" d="${g.join('')}"/>`).join('')}</defs>
<rect width="${W}" height="${H}" fill="${tones[1]}"/>
<g opacity=".38" transform="translate(.45 .6)">${tones.map((_, i) => `<use href="#RSN${i}" fill="#000"/>`).join('')}</g>
${tones.map((c, i) => `<use href="#RSN${i}" fill="${c}"/>`).join('')}
<path d="${hi.join('')}" fill="#fff" opacity=".24"/>
<g class="lb-front" ${piece(0.08, '--sp:1.45')}><path d="${edge}" fill="${o.base}"/><path d="${edge}" fill="none" stroke="${tones[2]}" stroke-width="3" opacity=".55"/>
<g transform="translate(-6 0)" class="lb-trowel"><rect x="-6" y="56" width="12" height="30" rx="2" fill="#e8e6e2" stroke="#2b2b2b" stroke-width=".8"/><rect x="-1.5" y="66" width="3" height="10" fill="#2b2b2b"/></g></g>
<rect class="lb-sheen" width="90" height="${H}" fill="url(#SHEEN)" ${piece(0.82, '--sp:5')}/>`;
}

function tarmac(o, R) {
  const surf = o.colours[0];
  let stones = '', grit = '', fine = '';
  for (let i = 0; i < 60; i++) stones += `<circle cx="${r2(R() * W)}" cy="${r2(86 + R() * 26)}" r="${r2(1.5 + R() * 2.6)}" fill="${['#b7ad9f', '#857b6e', '#a39888'][i % 3]}"/>`;
  for (let i = 0; i < 70; i++) grit += `<circle cx="${r2(R() * W)}" cy="${r2(64 + R() * 20)}" r="${r2(.8 + R() * 1.4)}" fill="#6a6a6c"/>`;
  for (let i = 0; i < 90; i++) fine += `<circle cx="${r2(R() * W)}" cy="${r2(50 + R() * 12)}" r="${r2(.4 + R() * .7)}" fill="#ffffff" opacity=".18"/>`;
  return `<rect width="${W}" height="48" fill="#ece9e4"/><path d="M0 47.5H${W}" stroke="#d6d1c9"/>
<rect y="112" width="${W}" height="28" fill="${o.soil}"/>
<g class="lb-slide" ${piece(0.06, '--sp:3.2')}><rect y="84" width="${W}" height="28" fill="${o.sub}"/>${stones}</g>
<g class="lb-slide" ${piece(0.38, '--sp:3.2')}><rect y="62" width="${W}" height="22" fill="${o.binder}"/>${grit}</g>
<g class="lb-slide" ${piece(0.66, '--sp:3.6')}><rect y="48" width="${W}" height="14" fill="${surf}"/>${fine}
<g class="lb-roller"><circle cx="${W + 20}" cy="30" r="17" fill="#d9d6d0" stroke="#3a3a3a" stroke-width="1.2"/><circle cx="${W + 20}" cy="30" r="4" fill="#3a3a3a"/><path d="M${W + 20} 30 L ${W + 56} 4" stroke="#3a3a3a" stroke-width="3" stroke-linecap="round"/></g></g>`;
}

function sandstone(o, R) {
  const rows = [];
  let y = 2, out = '';
  const all = [];
  while (y < H - 2) { const h = R() < .5 ? 30 : 45; rows.push([y, Math.min(h, H - 2 - y)]); y += h + 2; }
  rows.forEach(([y0, h], ri) => {
    let x = ri % 2 ? -20 : 0;
    while (x < W) { const w = [30, 45, 60, 45][Math.floor(R() * 4)]; all.push({ x, y: y0, w, h }); x += w + 2; }
  });
  out = all.map((s, i) => {
    const f = o.colours[Math.floor(R() * o.colours.length)];
    const t = 0.1 + 0.6 * ((s.x + s.y * 1.2) / (W + H * 1.2)) + R() * .04;
    const riven = `<path d="M${s.x + 3} ${s.y + s.h * (.3 + R() * .4)} q ${s.w * .3} ${(R() - .5) * 8} ${s.w * .6} ${(R() - .5) * 6}" stroke="#000" stroke-opacity=".12" fill="none"/><path d="M${s.x + s.w * .2} ${s.y + s.h * .8} q ${s.w * .25} ${(R() - .5) * 6} ${s.w * .55} 0" stroke="#fff" stroke-opacity=".22" fill="none"/>`;
    return `<g class="lb-slab" ${piece(t, `--dr:${Math.round((R() - .5) * 10)}deg`)}><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1.5" fill="${f}"/>${riven}</g>`;
  }).join('');
  return `<rect width="${W}" height="${H}" fill="#cfc9be"/><g class="lb-joints" ${piece(.86, '--sp:6')}><rect width="${W}" height="${H}" fill="${o.joint}"/></g>${out}`;
}

function polished(o, R) {
  let mott = '', agg = '';
  for (let i = 0; i < 26; i++) mott += `<ellipse cx="${r2(R() * W)}" cy="${r2(R() * H)}" rx="${r2(10 + R() * 30)}" ry="${r2(6 + R() * 18)}" fill="${R() < .5 ? '#000' : '#fff'}" opacity="${r2(.03 + R() * .04)}"/>`;
  for (let i = 0; i < 40; i++) agg += `<circle cx="${r2(R() * 60)}" cy="${r2(R() * 60)}" r="${r2(.4 + R() * .9)}" fill="${o.agg[i % 3]}" opacity=".55"/>`;
  const band = (i) => {
    const y = i * (H / 3), h = H / 3 + .5, t = 0.08 + i * 0.22;
    return `<g><rect class="lb-ground" y="${y}" width="${W}" height="${h}" fill="url(#PAGG)" ${piece(t, '--sp:4.4')}/><g class="lb-disc" ${piece(t, '--sp:4.4')}><circle cx="0" cy="${y + h / 2}" r="${h / 2 - 2}" fill="#4b4d50" stroke="#d6d3cd" stroke-width="1.2"/><circle cx="0" cy="${y + h / 2}" r="${h / 5}" fill="#2c2d2f"/></g></g>`;
  };
  return `<defs><pattern id="PAGG" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${o.colours[0]}"/>${agg}</pattern></defs>
<rect width="${W}" height="${H}" fill="${o.raw}"/>${mott}${band(0)}${band(1)}${band(2)}
<rect class="lb-sheen" width="110" height="${H}" fill="url(#SHEEN)" ${piece(0.8, '--sp:5')}/>`;
}

function microcement(o, R) {
  const arcs = (n, y0, col, t0, sw) => Array.from({ length: n }, (_, i) => {
    const y = y0 + i * (H / n), x = (i % 2) * 40 - 20;
    return `<path class="lb-arc" pathLength="1" d="M${x} ${r2(y + 10)} C ${x + 60} ${r2(y - 20 + R() * 10)} ${x + 120} ${r2(y + 40)} ${x + 190} ${r2(y + 8)} S ${x + 300} ${r2(y - 12)} ${x + 380} ${r2(y + 14)}" stroke="${col}" stroke-width="${sw}" fill="none" stroke-linecap="round" ${piece(t0 + i * .045, '--sp:7')}/>`;
  }).join('');
  let screws = '';
  for (let x = 20; x < W; x += 50) for (let y = 16; y < H; y += 36) screws += `<circle cx="${x}" cy="${y}" r="1.3" fill="#8f8a82"/>`;
  return `<rect width="${W}" height="${H}" fill="${o.board}"/><path d="M106 0V${H}M213 0V${H}" stroke="#b9b2a7" stroke-width="1.2"/>${screws}
<g opacity=".92">${arcs(6, 0, o.coat1, .08, 34)}</g><g>${arcs(6, 8, o.colours[0], .44, 36)}</g>
<rect class="lb-seal" width="${W}" height="${H}" fill="${o.colours[0]}" ${piece(0.8, '--sp:6')}/>
<rect class="lb-sheen" width="90" height="${H}" fill="url(#SHEEN)" ${piece(0.86, '--sp:7')}/>`;
}

function epoxy(o, R) {
  let sub = '', flakes = '';
  for (let i = 0; i < 50; i++) sub += `<circle cx="${r2(R() * W)}" cy="${r2(96 + R() * 42)}" r="${r2(.6 + R() * 1.8)}" fill="${R() < .5 ? '#6f6b66' : '#b3ada5'}"/>`;
  for (let i = 0; i < 90; i++) { const x = R() * W; flakes += `<rect class="lb-flake" x="${r2(x)}" y="${r2(66 + R() * 10)}" width="${r2(2 + R() * 3)}" height="${r2(1 + R() * 2)}" fill="${o.flakes[i % 3]}" ${piece(0.5 + (x / W) * .18 + R() * .04, `--sp:8;--dr:${Math.round((R() - .5) * 120)}deg`)}/>`; }
  return `<rect y="94" width="${W}" height="46" fill="${o.substrate}"/>${sub}
<g class="lb-slide" ${piece(0.06, '--sp:3.6')}><rect y="88" width="${W}" height="6" fill="${o.primer}" opacity=".9"/></g>
<g class="lb-slide" ${piece(0.28, '--sp:3.6')}><rect y="66" width="${W}" height="22" fill="${o.colours[0]}"/></g>
${flakes}
<g class="lb-slide" ${piece(0.76, '--sp:4.4')}><rect y="56" width="${W}" height="11" fill="#ffffff" opacity=".22"/><rect y="56" width="${W}" height="1.6" fill="#ffffff" opacity=".85"/></g>`;
}


function gravel(o, R) {
  const C = 20; let cells = '', stones = '';
  for (let x = 0; x < W; x += C) for (let y = 0; y < H; y += C) cells += `<path d="M${x} ${y}h${C}v${C}h${-C}z" fill="none" stroke="${o.grid}" stroke-width="2"/>`;
  for (let i = 0; i < 420; i++) { const x = R() * W, y = R() * H, t = 0.34 + 0.5 * ((x + y * .6) / (W + H * .6)) + R() * .04;
    stones += `<ellipse class="lb-slab" cx="${r2(x)}" cy="${r2(y)}" rx="${r2(2.2 + R() * 2.4)}" ry="${r2(1.8 + R() * 1.8)}" fill="${o.colours[i % o.colours.length]}" ${piece(t, `--dr:${Math.round((R() - .5) * 40)}deg`)}/>`; }
  return `<rect width="${W}" height="${H}" fill="${o.membrane}"/><g class="lb-slide" ${piece(0.08, '--sp:3.4')}>${cells}</g>${stones}`;
}

function turf(o, R) {
  const rows = 4, h = H / rows; let out = '';
  for (let r = 0; r < rows; r++) {
    let blades = '';
    for (let i = 0; i < 90; i++) { const x = R() * W, y = r * h + R() * h; blades += `<path d="M${r2(x)} ${r2(y)} l${r2((R() - .5) * 2)} -3" stroke="${o.colours[i % 3]}" stroke-width="1" opacity=".8"/>`; }
    out += `<g class="lb-ground" ${piece(0.1 + r * 0.17, '--sp:3.6')}><rect y="${r2(r * h + .6)}" width="${W}" height="${r2(h - 1.2)}" fill="${o.colours[r % 2]}"/>${blades}</g>`;
  }
  return `<rect width="${W}" height="${H}" fill="${o.soil}"/>${out}`;
}

const BUILD = { block: bricks, gravel, turf, resin, tarmac, sandstone, 'polished-concrete': polished, microcement, epoxy };

let uid = 0;
export function render({ variant = "block", colours, pattern, label, stages, seed, id, aggImg } = {}) {
  if (!BUILD[variant]) throw new Error('layer-build: unknown variant ' + variant);
  const o = { ...DEFAULTS[variant], ...(colours ? (Array.isArray(colours) ? { colours } : colours) : {}), ...(pattern ? { pattern } : {}), ...(aggImg ? { aggImg } : {}) };
  const R = rng(seed || 7 + variant.length * 131);
  const key = id || `lb${++uid}`;
  const svg = BUILD[variant](o, R).replaceAll('url(#CLIP)', `url(#${key}c)`).replaceAll('#AGG', `#${key}a`).replaceAll('id="AGG"', `id="${key}a"`).replaceAll('#PAGG', `#${key}p`).replaceAll('id="PAGG"', `id="${key}p"`).replaceAll('url(#SHEEN)', `url(#${key}s)`).replaceAll('RSN', `${key}r`);
  const st = stages || STAGES[variant];
  const at = st.map((_, i) => (st.length === 1 ? .5 : 0.12 + i * (0.74 / (st.length - 1))));
  return `<div class="sig sig-lb sig-lb--${variant}" data-sig-scroll data-a="1" data-b=".28" role="img" aria-label="${esc(label || st.join(', '))}">`
    + `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><clipPath id="${key}c"><rect width="${W}" height="${H - 12}"/></clipPath>`
    + `<linearGradient id="${key}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>${svg}</svg>`
    + `<ol class="sig-lb__stages" aria-hidden="true">${st.map((s, i) => `<li data-at="${r2(at[i])}">${esc(s)}</li>`).join('')}</ol></div>`;
}
