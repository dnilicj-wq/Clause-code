// Rendered "stage" scenes for benefit-illustrations (wide, 320×200) and proof-tiles (tall, 200×230).
// Each scene sits on a dark stage in the site's own dark tone, lit from above, with real material
// colours (stone, resin, porcelain, concrete) and the site accent used for light and highlights only.
// Reference level: Proficient Essex "Rain drains through" (dark stage, gold stones, blue rain) and the
// master template "…what it looks like, live." tiles.
//
// Colours come from CSS custom properties on the stage (.sig-stage): --st-bg, --st-bg2, --st-glow,
// --st-ink, plus --s-accent. Material colours are props, so each client gets their own stone/resin/shade.
// Motion is CSS (scenes.css): loops only while the card is on screen (.is-playing), base styles are the
// finished frame, reduced motion shows that frame.
// Proof scenes keep everything that matters inside the safe band y 45–185, so they can crop to a wide
// tile on desktop (preserveAspectRatio slice) and stand tall (≥200px) in the 2-column phone grid.
//
// scene(key, props) → SVG string. Unknown key throws (a typo fails the build).

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let N = 0;
const R = (i, s = 1) => { const x = Math.sin((i + 1) * 12.9898 * s) * 43758.5453; return x - Math.floor(x); };
const f1 = (v) => (+v).toFixed(1);
const del = (s) => `style="animation-delay:${f1(s)}s"`;

// ---------- shared building blocks ----------
const W = { w: 320, h: 200 }, T = { w: 200, h: 230 };
function frame(kind, id, body, label) {
  const { w, h } = kind === 'tile' ? T : W;
  return `<svg class="scn scn--${kind}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || '')}" focusable="false"><defs>`
    + `<radialGradient id="${id}L" cx="50%" cy="-10%" r="95%"><stop offset="0" style="stop-color:var(--st-glow);stop-opacity:.34"/><stop offset=".55" style="stop-color:var(--st-glow);stop-opacity:.06"/><stop offset="1" style="stop-color:var(--st-glow);stop-opacity:0"/></radialGradient>`
    + `<linearGradient id="${id}B" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--st-bg2)"/><stop offset="1" style="stop-color:var(--st-bg)"/></linearGradient>`
    + `<linearGradient id="${id}S" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="${id}R" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff" stop-opacity="0"/><stop offset="1" stop-color="#bfe3ff" stop-opacity=".95"/></linearGradient>`
    + `</defs><rect width="${w}" height="${h}" fill="url(#${id}B)"/><rect width="${w}" height="${h}" fill="url(#${id}L)"/>${body}</svg>`;
}
// a stone: base colour + a lit top-left highlight + soft shadow under it
const stone = (x, y, r, c, ry = 0.72) => `<ellipse cx="${f1(x)}" cy="${f1(y + r * 0.35)}" rx="${f1(r)}" ry="${f1(r * ry * 0.6)}" fill="#000" opacity=".28"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * ry)}" fill="${esc(c)}"/><ellipse cx="${f1(x - r * 0.3)}" cy="${f1(y - r * ry * 0.35)}" rx="${f1(r * 0.42)}" ry="${f1(r * ry * 0.3)}" fill="#fff" opacity=".32"/>`;
function stoneBed(x0, y0, w, h, cols, colours, seed = 1, r0 = 3.4) {
  let o = ''; const rows = Math.max(1, Math.round(h / (r0 * 1.5)));
  for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
    const i = rr * cols + c, x = x0 + ((c + (rr % 2) * 0.5) * w) / cols + (R(i, seed) - 0.5) * 3, y = y0 + rr * (h / rows) + (R(i, seed + 3) - 0.5) * 2;
    if (x > x0 + w - 1) continue;
    o += stone(x, y, r0 * (0.75 + R(i, seed + 7) * 0.5), colours[Math.floor(R(i, seed + 11) * colours.length)]);
  }
  return o;
}
// rain streaks (falling) and splashes
const rain = (id, n, x0, x1, y0, y1, seed = 2) => Array.from({ length: n }, (_, i) => { const x = x0 + ((x1 - x0) * (i + R(i, seed) * 0.8)) / n; return `<path class="scn-rain" d="M${f1(x)} ${y0} l-2 ${y1 - y0 > 30 ? 14 : 9}" stroke="url(#${id}R)" stroke-width="1.6" stroke-linecap="round" style="--fall:${y1 - y0}px;animation-delay:${f1(R(i, seed + 5) * 1.4)}s"/>`; }).join('');
const label = (x, y, t, anchor = 'start', cls = '') => `<text class="scn-t${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${esc(t)}</text>`;
const tickBadge = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="11" class="scn-acc" style="filter:drop-shadow(0 0 6px var(--s-accent))"/><path d="M-4.6 .2 l3.1 3.1 l6.3 -6.6" fill="none" stroke="var(--sig-accent-ink,#fff)" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="scn-draw" pathLength="1"/></g>`;
// polished surface: base colour + soft reflection band + moving sheen (clipped)
const sheen = (id, clipId, x, y, w, h, dur = '') => `<g clip-path="url(#${clipId})"><rect class="scn-sheen${dur}" x="${x - 60}" y="${y}" width="50" height="${h}" fill="url(#${id}S)" transform="skewX(-18)"/></g>`;
const shade = (hex, t) => { const h = hex.replace('#', ''); const n = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); const m = n.map((v) => Math.round(t < 0 ? v * (1 + t) : v + (255 - v) * t)); return '#' + m.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); };
const blockC = ['#9a4a3c', '#7d3a30', '#a85c48', '#6e3b33'];

// ---------- scenes ----------
export const SCENES = {
  // ============ wide benefit scenes (320×200) ============
  drain: ({ label: l = 'Rain soaking down through the surface into the ground', colours = ['#c9ab7f', '#b8955f', '#e0c9a0', '#8f7450'], night = false }) => {
    const id = 'sc' + ++N;
    const surf = stoneBed(18, 104, 284, 16, 40, colours, 3, 3.6);
    const base = stoneBed(18, 128, 284, 22, 30, ['#5d5a55', '#77736c', '#4a4844', '#8a857c'], 9, 4.6);
    const seep = Array.from({ length: 8 }, (_, i) => `<circle class="scn-seep" ${del(i * 0.31)} cx="${36 + i * 35}" cy="112" r="2.1" fill="#9fd4ff"/>`).join('');
    return frame('wide', id, `${night ? `<circle cx="262" cy="34" r="12" fill="var(--st-glow)" opacity=".18"/>` : ''}
${rain(id, 22, 10, 310, 6, 96)}
<rect x="0" y="152" width="320" height="48" fill="#1b1612" opacity=".75"/><rect x="0" y="122" width="320" height="32" fill="#2a2724"/>${base}
<rect x="0" y="98" width="320" height="26" fill="${esc(shade(colours[1], -0.55))}"/>${surf}
<rect x="0" y="97" width="320" height="2" fill="#fff" opacity=".18"/>${seep}
${Array.from({ length: 6 }, (_, i) => `<path class="scn-soak" ${del(0.5 + i * 0.27)} d="M${52 + i * 44} 156 q-4 10 0 18 q4 -8 0 -18z" fill="#7cc4ff" opacity=".7"/>`).join('')}
${label(14, 92, 'Resin bound surface')}${label(14, 186, 'Water drains to the ground', 'start', ' scn-t--dim')}`, l);
  },

  weeds: ({ label: l = 'Weeds root in block joints but have nowhere to grow in resin', colours = ['#c9ab7f', '#b8955f', '#e0c9a0', '#8f7450'] }) => {
    const id = 'sc' + ++N;
    const blocks = Array.from({ length: 6 }, (_, i) => `<rect x="${12 + i * 24}" y="106" width="22" height="30" rx="2" fill="${blockC[i % 4]}"/><rect x="${12 + i * 24}" y="106" width="22" height="3" fill="#fff" opacity=".16"/>`).join('');
    return frame('wide', id, `<rect x="0" y="136" width="320" height="64" fill="#2a2420"/>
${blocks}<rect x="0" y="134" width="156" height="4" fill="#1a1512"/>
<g class="scn-sprout" style="transform-origin:58px 106px"><path d="M58 106 q-2 -16 3 -28" stroke="#7fae4a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M60 88 q-14 -4 -16 -15 q12 0 16 15z" fill="#8cbf55"/><path d="M61 82 q12 -7 17 -3 q-7 8 -17 3z" fill="#6f9e3f"/></g>
<g class="scn-sprout" style="transform-origin:106px 106px;animation-delay:.6s"><path d="M106 106 q2 -10 -2 -18" stroke="#7fae4a" stroke-width="2" fill="none"/><path d="M104 92 q-10 -2 -12 -10 q9 0 12 10z" fill="#8cbf55"/></g>
<rect x="164" y="104" width="146" height="32" rx="3" fill="${esc(shade(colours[1], -0.5))}"/>${stoneBed(168, 110, 138, 22, 22, colours, 5, 3.5)}
<rect x="164" y="104" width="146" height="2" fill="#fff" opacity=".22"/>
<clipPath id="${id}c"><rect x="164" y="104" width="146" height="32"/></clipPath>${sheen(id, id + 'c', 164, 104, 146, 32)}
${tickBadge(237, 76)}
${label(84, 160, 'Gaps between blocks', 'middle')}${label(237, 160, 'One surface, no gaps', 'middle')}`, l);
  },

  interlock: ({ label: l = 'Interlocked blocks spread a car’s weight across the drive', colours = blockC }) => {
    const id = 'sc' + ++N;
    const row = Array.from({ length: 13 }, (_, i) => `<g class="scn-dip" style="animation-delay:${f1(Math.abs(i - 6) * 0.07)}s;--d:${f1(Math.max(0, 2.2 - Math.abs(i - 6) * 0.35))}px"><rect x="${4 + i * 24.4}" y="120" width="23" height="26" rx="2" fill="${colours[i % colours.length]}"/><rect x="${4 + i * 24.4}" y="120" width="23" height="3" fill="#fff" opacity=".18"/></g>`).join('');
    const waves = [0, 1, 2].map((k) => `<ellipse class="scn-wave" ${del(1 + k * 0.28)} cx="160" cy="146" rx="${40 + k * 40}" ry="${9 + k * 4}" fill="none" stroke="var(--s-accent)" stroke-width="1.6"/>`).join('');
    return frame('wide', id, `<rect x="0" y="146" width="320" height="18" fill="#57524b"/>${stoneBed(6, 151, 310, 10, 40, ['#6a655d', '#7b766d', '#5a564f'], 4, 2.6)}<rect x="0" y="164" width="320" height="36" fill="#231e1a"/>
${waves}${row}
<g class="scn-car"><path d="M104 104 V88 q0 -8 8 -9 l16 -2 q12 -16 30 -16 h20 q16 0 28 16 l14 3 q8 2 8 10 V104Z" fill="#2f3339"/><path d="M134 77 q10 -12 24 -12 h8 v12z M172 65 h4 q12 0 20 12 h-24z" fill="#9fb7c9" opacity=".55"/><rect x="104" y="96" width="124" height="3" fill="#fff" opacity=".08"/><circle cx="134" cy="106" r="13" fill="#121315"/><circle cx="134" cy="106" r="5.5" fill="#9a9ea4"/><circle cx="200" cy="106" r="13" fill="#121315"/><circle cx="200" cy="106" r="5.5" fill="#9a9ea4"/></g>
${label(14, 30, 'Load spreads through the blocks')}`, l);
  },

  lift: ({ label: l = 'One block lifts out and goes back for a repair', colours = blockC }) => {
    const id = 'sc' + ++N;
    let g = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) { const x = 40 + c * 27 - (r % 2) * 13, y = 40 + r * 27; if (r === 2 && c === 4) continue; g += `<rect x="${x}" y="${y}" width="25" height="25" rx="2" fill="${colours[(r * 3 + c) % colours.length]}"/><rect x="${x}" y="${y}" width="25" height="2.5" fill="#fff" opacity=".14"/>`; }
    return frame('wide', id, `<clipPath id="${id}c"><rect x="30" y="34" width="260" height="146" rx="6"/></clipPath>
<g clip-path="url(#${id}c)"><rect x="30" y="34" width="260" height="146" fill="#b49a86"/>${g}<rect x="122" y="94" width="25" height="25" fill="#2c2420"/>${stoneBed(124, 98, 22, 18, 4, ['#6a655d', '#837d73'], 2, 2.6)}</g>
<g class="scn-lift"><rect x="122" y="94" width="25" height="25" rx="2" fill="#000" opacity=".35" class="scn-lift__sh"/><g class="scn-lift__b"><rect x="122" y="94" width="25" height="25" rx="2" fill="${colours[2]}"/><rect x="122" y="94" width="25" height="25" rx="2" fill="none" stroke="var(--s-accent)" stroke-width="2"/><rect x="122" y="94" width="25" height="3" fill="#fff" opacity=".25"/></g></g>
${label(160, 196, 'Lift one out, relay it', 'middle')}`, l);
  },

  stain: ({ label: l = 'Porcelain is non-porous, so a spill wipes off', tile = '#b9b6b0', spill = '#7b1e2b' }) => {
    const id = 'sc' + ++N;
    return frame('wide', id, `<clipPath id="${id}c"><path d="M20 110 L300 110 L320 190 L0 190 Z"/></clipPath>
<path d="M20 110 L300 110 L320 190 L0 190 Z" fill="${esc(tile)}"/><path d="M20 110 L300 110 L320 190 L0 190 Z" fill="url(#${id}B)" opacity=".35"/>
<path d="M160 110 L160 190 M10 150 H310" stroke="#000" stroke-opacity=".22" stroke-width="1.4"/>
<path d="M40 128 q40 -6 80 4 t90 -2 t80 6" stroke="#fff" stroke-opacity=".12" fill="none" stroke-width="3"/>
<g class="scn-glass"><path d="M196 28 h22 l-2 26 q-9 8 -18 0z" fill="#d9eef7" opacity=".28" stroke="#e8f6ff" stroke-opacity=".6"/><path d="M200 42 h14 l-.8 12 q-6 5 -12.4 0z" fill="${esc(spill)}"/></g>
<path class="scn-drip" d="M206 58 q4 6 0 10 q-4 -4 0 -10z" fill="${esc(spill)}"/>
<g clip-path="url(#${id}c)"><ellipse class="scn-pool" cx="206" cy="146" rx="32" ry="8" fill="${esc(spill)}"/><ellipse class="scn-pool" cx="198" cy="144" rx="12" ry="2" fill="#fff" opacity=".35"/>
<g class="scn-cloth"><path d="M240 128 q22 -8 44 0 l4 26 q-26 8 -50 0z" fill="var(--s-accent)"/><path d="M244 134 q20 -6 40 0" stroke="#fff" stroke-opacity=".25" fill="none"/></g>
${sheen(id, id + 'c', 0, 110, 320, 80)}</g>
${label(14, 30, 'Sits on top, wipes away')}`, l);
  },

  slip: ({ label: l = 'R11 anti-slip texture keeps its grip in the rain', tile = '#a9a6a0' }) => {
    const id = 'sc' + ++N;
    let grain = ''; for (let i = 0; i < 260; i++) grain += `<circle cx="${f1(4 + R(i, 3) * 312)}" cy="${f1(116 + R(i, 7) * 80)}" r="${f1(0.5 + R(i, 9) * 1.1)}" fill="${R(i, 4) > 0.5 ? '#fff' : '#000'}" opacity="${f1(0.12 + R(i, 5) * 0.2)}"/>`;
    const splash = Array.from({ length: 7 }, (_, i) => `<g class="scn-splash" ${del(R(i, 8) * 1.4)} transform="translate(${30 + i * 44} ${130 + (i % 3) * 18})"><ellipse rx="7" ry="1.6" fill="none" stroke="#bfe3ff" stroke-width="1"/></g>`).join('');
    return frame('wide', id, `${rain(id, 26, 6, 316, 4, 112, 6)}
<path d="M0 112 H320 V200 H0Z" fill="${esc(tile)}"/><path d="M0 112 H320 V200 H0Z" fill="#0a1424" opacity=".38"/>${grain}${splash}
<path d="M0 112 H320" stroke="#fff" stroke-opacity=".25"/>
<g class="scn-step"><path d="M112 92 V66 q2 -12 16 -12 l30 2 q12 2 22 12 l26 8 q16 4 16 16Z" fill="#2c3036"/><path d="M128 56 l26 2 q10 2 18 10 l-40 -2z" fill="#fff" opacity=".1"/><path d="M106 92 H226 q4 0 4 4 v3 H106Z" fill="#141518"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${109 + i * 10}" y="99" width="6" height="4" rx="1" fill="#0b0b0c"/>`).join('')}</g>
<g transform="translate(268 48)"><rect x="-26" y="-14" width="52" height="28" rx="14" class="scn-acc"/><text x="0" y="5" text-anchor="middle" class="scn-badge">R11</text></g>
${label(14, 30, 'Grip, even when wet')}`, l);
  },

  seamless: ({ label: l = 'Grout lines disappear into one continuous surface', colour = '#cdc8c0' }) => {
    const id = 'sc' + ++N;
    let grout = '';
    for (let i = -6; i <= 6; i++) grout += `<path d="M${160 + i * 18} 96 L${160 + i * 62} 200" />`;
    for (let k = 0; k < 5; k++) { const y = 96 + [0, 14, 32, 56, 88][k]; grout += `<path d="M0 ${y} H320"/>`; }
    return frame('wide', id, `<clipPath id="${id}c"><path d="M0 96 H320 V200 H0Z"/></clipPath>
<path d="M0 0 H320 V96 H0Z" fill="#000" opacity=".12"/><path d="M60 10 h200 v74 h-200z" fill="var(--st-glow)" opacity=".06"/>
<path d="M0 96 H320 V200 H0Z" fill="${esc(colour)}"/><path d="M0 96 H320 V200 H0Z" fill="url(#${id}B)" opacity=".28"/>
<ellipse cx="160" cy="118" rx="120" ry="12" fill="#fff" opacity=".22"/>
<g clip-path="url(#${id}c)"><g class="scn-grout" stroke="#6d6860" stroke-width="1.6" fill="none">${grout}</g>${sheen(id, id + 'c', 0, 96, 320, 104)}</g>
${label(14, 30, 'Tiles: grout lines')}<g class="scn-after">${label(14, 46, 'Polished concrete: none', 'start', ' scn-t--acc')}</g>`, l);
  },

  wipe: ({ label: l = 'Sealed: a spill beads on the surface and wipes off', colour = '#c4beb5', spill = '#5a3a24' }) => {
    const id = 'sc' + ++N;
    return frame('wide', id, `<clipPath id="${id}c"><path d="M0 104 H320 V200 H0Z"/></clipPath>
<path d="M0 104 H320 V200 H0Z" fill="${esc(colour)}"/><path d="M0 104 H320 V200 H0Z" fill="url(#${id}B)" opacity=".3"/>
<g class="scn-cup"><path d="M128 40 h34 l-4 30 q-13 6 -26 0z" fill="#eae6df"/><path d="M162 46 q10 0 10 9 t-12 9" fill="none" stroke="#eae6df" stroke-width="3"/><ellipse cx="145" cy="41" rx="17" ry="3" fill="${esc(spill)}"/></g>
<path class="scn-drip" d="M150 76 q5 8 0 12 q-5 -4 0 -12z" fill="${esc(spill)}"/>
<g clip-path="url(#${id}c)">
${[[150, 140, 9], [176, 148, 6], [128, 150, 5], [196, 138, 4], [112, 140, 3.6]].map(([x, y, r], i) => `<g class="scn-bead" style="animation-delay:${f1(i * 0.05)}s"><ellipse cx="${x}" cy="${y + r * 0.5}" rx="${r}" ry="${r * 0.35}" fill="#000" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="${esc(spill)}"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.2}" rx="${r * 0.35}" ry="${r * 0.18}" fill="#fff" opacity=".6"/></g>`).join('')}
<g class="scn-cloth scn-cloth--wide"><path d="M228 124 q26 -9 52 0 l5 30 q-30 9 -58 0z" fill="var(--s-accent)"/><path d="M232 131 q24 -7 46 0" stroke="#fff" stroke-opacity=".25" fill="none"/></g>
${sheen(id, id + 'c', 0, 104, 320, 96)}</g>
${label(14, 30, 'Spills sit on top')}`, l);
  },

  heat: ({ label: l = 'Underfloor heating warmth passes straight through the floor', colour = '#c4beb5' }) => {
    const id = 'sc' + ++N;
    const pipes = Array.from({ length: 9 }, (_, i) => `<circle cx="${22 + i * 35}" cy="156" r="7" fill="#3a2c26" stroke="#ff9a4d" stroke-width="2.4" class="scn-pipe" ${del(i * 0.12)}/>`).join('');
    const waves = Array.from({ length: 7 }, (_, i) => `<path class="scn-heat" ${del(i * 0.34)} d="M${36 + i * 42} 96 q-6 -10 0 -20 q6 -10 0 -20" fill="none" stroke="#ffb070" stroke-width="2.2" stroke-linecap="round"/>`).join('');
    return frame('wide', id, `<defs><linearGradient id="${id}h" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></linearGradient></defs>
<rect class="scn-warm" x="0" y="40" width="320" height="70" fill="url(#${id}h)"/>${waves}
<rect x="0" y="108" width="320" height="22" fill="${esc(colour)}"/><rect x="0" y="108" width="320" height="2" fill="#fff" opacity=".45"/>
<rect x="0" y="130" width="320" height="44" fill="#4a4540"/>${pipes}<rect x="0" y="174" width="320" height="26" fill="#25211e"/>
<rect x="0" y="130" width="320" height="44" fill="#ff7a2d" opacity=".14"/>
${label(14, 124, 'Polished concrete', 'start', ' scn-t--onlight')}${label(14, 190, 'Heating pipes in the screed', 'start', ' scn-t--dim')}`, l);
  },

  floorwall: ({ label: l = 'One coat runs from the floor up the wall with no joins', colour = '#b3a596' }) => {
    const id = 'sc' + ++N;
    return frame('wide', id, `<path d="M70 20 L250 20 L250 132 L70 132Z" fill="#e4e0da" opacity=".16"/><path d="M0 132 L70 132 L250 132 L320 200 L0 200Z" fill="#e4e0da" opacity=".12"/>
<clipPath id="${id}w"><path d="M70 20 L250 20 L250 132 L70 132Z"/></clipPath><clipPath id="${id}f"><path d="M0 200 L70 132 L250 132 L320 200Z"/></clipPath>
<g clip-path="url(#${id}f)"><rect class="scn-coat-f" x="0" y="132" width="320" height="68" fill="${esc(colour)}"/></g>
<g clip-path="url(#${id}w)"><rect class="scn-coat-w" x="70" y="20" width="180" height="112" fill="${esc(shade(colour, 0.08))}"/><rect x="70" y="20" width="180" height="112" fill="url(#${id}B)" opacity=".18"/>${sheen(id, id + 'w', 70, 20, 180, 112, ' scn-sheen--late')}</g>
<path d="M70 132 H250" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>
<g class="scn-shower"><path d="M214 28 v14 M200 44 h28" stroke="#c9c6c2" stroke-width="3" stroke-linecap="round"/>${Array.from({ length: 5 }, (_, i) => `<path class="scn-rain" d="M${204 + i * 5} 50 l0 10" stroke="url(#${id}R)" stroke-width="1.4" style="--fall:70px;animation-delay:${f1(i * 0.25)}s"/>`).join('')}</g>
${label(160, 192, 'Floor to wall, no joins', 'middle', ' scn-t--onlight')}`, l);
  },

  // ============ tall proof scenes (200×230, safe band y 45–185) ============
  prep: ({ label: l = 'Ground dug out and built up in layers', top = '#9a4a3c' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<rect x="0" y="0" width="200" height="72" fill="#000" opacity=".1"/>
<path d="M0 72 H24 L36 178 H164 L176 72 H200 V230 H0Z" fill="#3a2c22"/>${stoneBed(4, 190, 192, 26, 18, ['#4a3a2c', '#5a4634'], 5, 3)}
<g class="scn-layer" style="animation-delay:0s"><path d="M33 150 H167 L164 178 H36Z" fill="#6c6760"/>${stoneBed(38, 156, 124, 18, 18, ['#8a857c', '#6a655d', '#a19c92'], 3, 3.2)}</g>
<g class="scn-layer" style="animation-delay:.5s"><path d="M30 126 H170 L167 150 H33Z" fill="#8a857c"/>${stoneBed(34, 132, 132, 14, 22, ['#b4afa5', '#9a958b'], 6, 2.2)}</g>
<g class="scn-layer" style="animation-delay:1s"><path d="M28 112 H172 L170 126 H30Z" fill="#c9bfa8"/></g>
<g class="scn-layer" style="animation-delay:1.5s">${Array.from({ length: 6 }, (_, i) => `<rect x="${28 + i * 24}" y="96" width="23" height="16" rx="1.5" fill="${[top, shade(top, -0.18), shade(top, 0.1)][i % 3]}"/>`).join('')}<rect x="28" y="96" width="144" height="2" fill="#fff" opacity=".2"/></g>
<g class="scn-plate"><rect x="78" y="60" width="44" height="12" rx="2" fill="var(--s-accent)"/><rect x="92" y="40" width="16" height="20" rx="2" fill="#3a3d42"/><path d="M100 40 l26 -22" stroke="#3a3d42" stroke-width="4" stroke-linecap="round"/></g>`, l);
  },

  swatches: ({ colours = ['#8d8a86', '#b2583f', '#2b2b2d'], names = [], label: l }) => {
    const id = 'sc' + ++N; const n = colours.length, cols = n > 3 ? 2 : n, rows = Math.ceil(n / cols), s = n > 3 ? 54 : n === 2 ? 62 : 46, gap = 12;
    const x0 = 100 - (cols * (s + gap) - gap) / 2, y0 = 112 - (rows * (s + gap + (names.length ? 14 : 0)) - gap) / 2;
    return frame('tile', id, colours.map((c, i) => { const cx = x0 + (i % cols) * (s + gap), cy = y0 + Math.floor(i / cols) * (s + gap + (names.length ? 14 : 0)); let tex = ''; for (let k = 0; k < 26; k++) tex += `<circle cx="${f1(cx + 3 + R(k + i * 31, 2) * (s - 6))}" cy="${f1(cy + 3 + R(k + i * 31, 5) * (s - 6))}" r="${f1(0.6 + R(k, 7) * 1.4)}" fill="${R(k + i, 3) > 0.5 ? '#fff' : '#000'}" opacity=".16"/>`; return `<g class="scn-chip" ${del(i * 0.12)}><rect x="${cx}" y="${cy + 4}" width="${s}" height="${s}" rx="7" fill="#000" opacity=".35"/><rect x="${cx}" y="${cy}" width="${s}" height="${s}" rx="7" fill="${esc(c)}"/>${tex}<rect x="${cx}" y="${cy}" width="${s}" height="${s * 0.45}" rx="7" fill="#fff" opacity=".12"/></g><rect class="scn-sel${i ? '' : ' scn-first'}" style="--n:${n};animation-delay:${f1(-((n - i) % n) * 1.2)}s" x="${cx - 4}" y="${cy - 4}" width="${s + 8}" height="${s + 8}" rx="10" fill="none" stroke="var(--s-accent)" stroke-width="2.4"/>${names[i] ? label(cx + s / 2, cy + s + 16, names[i], 'middle') : ''}`; }).join(''), l || names.join(', ') || 'Colour choices');
  },

  pattern: ({ label: l = 'Traditional and modern patterns', colours = blockC }) => {
    const id = 'sc' + ++N; let hb = '', bw = ''; const U = 9;
    for (let s2 = -7; s2 <= 7; s2++) for (let k = -12; k <= 12; k++) { const a = [k + 2 * s2, k - 2 * s2], b = [k + 2 + 2 * s2, k - 1 - 2 * s2]; if (Math.hypot(a[0] * U, a[1] * U) < 130) hb += `<rect x="${a[0] * U + 0.6}" y="${a[1] * U + 0.6}" width="${2 * U - 1.2}" height="${U - 1.2}" rx="1" fill="${colours[(k + s2 + 20) % colours.length]}"/>`; if (Math.hypot(b[0] * U, b[1] * U) < 130) hb += `<rect x="${b[0] * U + 0.6}" y="${b[1] * U + 0.6}" width="${U - 1.2}" height="${2 * U - 1.2}" rx="1" fill="${colours[(k * 3 + s2 + 21) % colours.length]}"/>`; }
    for (let r = 0; r < 12; r++) for (let c = 0; c < 10; c++) { const x = c * 20, y = r * 20, v = (r + c) % 2; bw += v ? `<rect x="${x + .6}" y="${y + .6}" width="18.8" height="8.8" rx="1" fill="${colours[(r + c) % 4]}"/><rect x="${x + .6}" y="${y + 10.6}" width="18.8" height="8.8" rx="1" fill="${colours[(r + c + 1) % 4]}"/>` : `<rect x="${x + .6}" y="${y + .6}" width="8.8" height="18.8" rx="1" fill="${colours[(r + c + 2) % 4]}"/><rect x="${x + 10.6}" y="${y + .6}" width="8.8" height="18.8" rx="1" fill="${colours[(r + c + 3) % 4]}"/>`; }
    return frame('tile', id, `<clipPath id="${id}c"><rect x="0" y="0" width="200" height="230"/></clipPath><g clip-path="url(#${id}c)"><rect width="200" height="230" fill="#b49a86"/>
<g class="scn-cyc2 scn-first"><g transform="translate(100 115) rotate(45)">${hb}</g></g><g class="scn-cyc2" style="animation-delay:-4s">${bw}</g></g>
<rect width="200" height="230" fill="url(#${id}L)"/><rect width="200" height="230" fill="url(#${id}B)" opacity=".3"/>`, l);
  },

  range: ({ items = ['Walling', 'Crazy paving', 'Slabbing'], label: l }) => {
    const id = 'sc' + ++N;
    const art = [
      `${Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect x="${42 + c * 24 - (r % 2) * 12}" y="${66 + r * 17}" width="22" height="15" rx="1.5" fill="${['#c9b08b', '#b39a76', '#d7c3a3', '#9f8a6a'][(r + c) % 4]}"/>`).join('')).join('')}`,
      `${[[44, 66, 66, 60, 50, 102, 40, 90], [70, 64, 120, 62, 112, 100, 72, 104], [124, 60, 158, 70, 150, 106, 116, 102], [42, 96, 72, 108, 76, 160, 40, 150], [78, 108, 112, 104, 120, 156, 82, 164], [116, 106, 152, 110, 158, 160, 124, 162]].map((p, i) => `<path d="M${p[0]} ${p[1]} L${p[2]} ${p[3]} L${p[4]} ${p[5]} L${p[6]} ${p[7]}Z" fill="${['#c9b08b', '#b39a76', '#d7c3a3', '#a99377', '#c0a681', '#d0bb98'][i]}"/>`).join('')}`,
      `${Array.from({ length: 4 }, (_, r) => Array.from({ length: 3 }, (_, c) => `<rect x="${42 + c * 39}" y="${64 + r * 25}" width="37" height="23" rx="1.5" fill="${['#c9b08b', '#b39a76', '#d7c3a3', '#a99377'][(r * 2 + c) % 4]}"/>`).join('')).join('')}`,
    ];
    return frame('tile', id, `<clipPath id="${id}c"><rect x="38" y="58" width="124" height="110" rx="6"/></clipPath>${items.slice(0, 3).map((t, i) => `<g class="scn-cyc${i ? '' : ' scn-first'}" style="animation-delay:${-((3 - i) % 3) * 3}s"><rect x="38" y="58" width="124" height="110" rx="6" fill="#7d7266"/><g clip-path="url(#${id}c)">${art[i]}<rect x="38" y="58" width="124" height="40" fill="#fff" opacity=".08"/></g>${label(100, 188, t, 'middle')}</g>`).join('')}`, l || items.join(', '));
  },

  mix: ({ colours = ['#c9ab7f', '#b8955f', '#e0c9a0'], label: l = 'Resin and stone mixed before laying' }) => {
    const id = 'sc' + ++N;
    const st = Array.from({ length: 46 }, (_, i) => { const a = i * 2.39, r = 6 + (i % 9) * 4.6; return stone(100 + Math.cos(a) * r, 118 + Math.sin(a) * r * 0.5, 3 + (i % 3), colours[i % colours.length]); }).join('');
    return frame('tile', id, `<ellipse cx="100" cy="164" rx="66" ry="12" fill="#000" opacity=".35"/>
<path d="M44 112 L54 160 Q100 176 146 160 L156 112Z" fill="#3e4247"/><ellipse cx="100" cy="112" rx="56" ry="24" fill="#2b2e33"/>
<g class="scn-swirl" style="transform-origin:100px 118px"><ellipse cx="100" cy="118" rx="50" ry="20" fill="${esc(shade(colours[1], -0.25))}"/>${st}<path d="M70 116 q30 -18 60 0" stroke="#fff" stroke-opacity=".3" fill="none" stroke-width="2"/></g>
<ellipse cx="100" cy="112" rx="56" ry="24" fill="none" stroke="#5b6067" stroke-width="3"/>
<g class="scn-paddle"><path d="M100 40 V112" stroke="#9a9ea4" stroke-width="4"/><rect x="88" y="104" width="24" height="10" rx="2" fill="var(--s-accent)"/><rect x="94" y="34" width="12" height="10" rx="2" fill="#3a3d42"/></g>`, l);
  },

  membrane: ({ label: l = 'Gravel laid on a weed membrane', colours = ['#c7bba6', '#a99d88', '#d8cdb8', '#8f8472'] }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<rect x="0" y="134" width="200" height="96" fill="#3a2c22"/>${stoneBed(4, 150, 192, 40, 14, ['#4a3a2c', '#5a4634'], 7, 3.4)}
<g class="scn-weed" style="transform-origin:100px 150px"><path d="M100 168 q-2 -12 0 -22" stroke="#7fae4a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M100 150 q-9 -2 -10 -9 q8 0 10 9z M100 148 q8 -4 10 -1 q-5 5 -10 1z" fill="#8cbf55"/></g>
<path class="scn-mem" d="M0 132 H200" stroke="var(--s-accent)" stroke-width="4" pathLength="1" style="filter:drop-shadow(0 0 5px var(--s-accent))"/>
${stoneBed(4, 92, 192, 36, 16, colours, 3, 5)}
${label(100, 70, 'Gravel', 'middle')}`, l);
  },

  plans: ({ label: l = 'Plans and visuals before work starts', night = false }) => {
    const id = 'sc' + ++N;
    if (night) {
      const lights = [[52, 86], [148, 86], [52, 146], [148, 146], [100, 168]];
      return frame('tile', id, `<rect x="30" y="56" width="140" height="132" rx="4" fill="#132542" stroke="#4b6a96" stroke-opacity=".6"/>
<g stroke="#6f8fbd" stroke-opacity=".25">${Array.from({ length: 6 }, (_, i) => `<path d="M30 ${78 + i * 22}H170"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M${52 + i * 22} 56V188"/>`).join('')}</g>
<path class="scn-plan" pathLength="1" d="M44 176 V106 H156 V176" fill="none" stroke="#cfdcf0" stroke-width="2"/><path class="scn-plan" pathLength="1" style="animation-delay:.3s" d="M60 106 V70 H140 V106" fill="none" stroke="#cfdcf0" stroke-width="2"/>
<rect class="scn-lawn" x="66" y="114" width="68" height="44" rx="3" fill="#3f7a3a" opacity=".85"/>
${lights.map(([x, y], i) => `<g class="scn-lamp" ${del(1.2 + i * 0.28)}><circle cx="${x}" cy="${y}" r="16" fill="var(--s-accent)" opacity=".28" style="filter:blur(3px)"/><circle cx="${x}" cy="${y}" r="3.4" fill="#ffd2a6"/></g>`).join('')}`, l);
    }
    return frame('tile', id, `<rect x="34" y="52" width="132" height="140" rx="4" fill="#efece6"/><rect x="34" y="52" width="132" height="140" rx="4" fill="url(#${id}B)" opacity=".12"/>
<g stroke="#8a857c" stroke-opacity=".28">${Array.from({ length: 6 }, (_, i) => `<path d="M34 ${74 + i * 21}H166"/>`).join('')}</g>
<path class="scn-plan" pathLength="1" d="M50 172 V80 H150 V172 Z M50 120 H104 V172" fill="none" stroke="#2f3135" stroke-width="2.2"/>
<rect class="scn-fill" x="104" y="120" width="46" height="52" fill="var(--s-accent)" opacity=".7"/>
<g class="scn-pen"><path d="M150 120 l18 -26 l6 4 l-18 26z" fill="#2f3135"/><path d="M150 120 l-2 6 l6 -2z" fill="var(--s-accent)"/></g>`, l);
  },

  access: ({ label: l = 'Drainage and car access planned in', colour = '#8f8f8d' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<path d="M20 52 H180 V188 H20Z" fill="${esc(colour)}"/>${stoneBed(24, 58, 152, 120, 18, [colour, shade(colour, -0.15), shade(colour, 0.15)], 4, 2.1)}
<rect x="20" y="152" width="160" height="10" fill="#1d1f22"/><g fill="#5a5d62">${Array.from({ length: 16 }, (_, i) => `<rect x="${22 + i * 10}" y="154" width="6" height="6" rx="1"/>`).join('')}</g>
${Array.from({ length: 5 }, (_, i) => `<path class="scn-flow" ${del(i * 0.3)} d="M${40 + i * 30} 120 q0 14 0 30" stroke="#8fd0ff" stroke-width="2.4" stroke-linecap="round" fill="none"/>`).join('')}
<g class="scn-park"><rect x="66" y="64" width="68" height="56" rx="14" fill="#2f3339"/><rect x="74" y="70" width="52" height="16" rx="6" fill="#9fb7c9" opacity=".5"/><rect x="62" y="74" width="8" height="14" rx="3" fill="#111"/><rect x="130" y="74" width="8" height="14" rx="3" fill="#111"/></g>`, l);
  },

  frost: ({ label: l = 'Frost and sun don’t fade or crack porcelain', tile = '#b9b6b0' }) => {
    const id = 'sc' + ++N;
    const flakes = Array.from({ length: 10 }, (_, i) => `<g class="scn-flake" ${del(R(i, 4) * 2.4)} transform="translate(${20 + i * 17} ${40 + (i % 3) * 8})"><path d="M0 -4V4M-3.5 -2L3.5 2M-3.5 2L3.5 -2" stroke="#e8f4ff" stroke-width="1.2" stroke-linecap="round"/></g>`).join('');
    return frame('tile', id, `<g class="scn-sun"><circle cx="160" cy="62" r="13" fill="var(--s-accent)"/><circle cx="160" cy="62" r="26" fill="var(--s-accent)" opacity=".18"/></g>${flakes}
<path d="M20 120 H180 L196 190 H4Z" fill="${esc(tile)}"/><path d="M20 120 H180 L196 190 H4Z" fill="url(#${id}B)" opacity=".3"/><path d="M100 120 V190 M12 154 H188" stroke="#000" stroke-opacity=".2"/>
<g class="scn-rime" opacity=".0">${Array.from({ length: 30 }, (_, i) => `<circle cx="${f1(20 + R(i, 2) * 160)}" cy="${f1(124 + R(i, 6) * 60)}" r="${f1(1 + R(i, 3) * 2)}" fill="#eef7ff"/>`).join('')}</g>
${tickBadge(100, 100, 0.9)}`, l);
  },

  overlay: ({ label: l = 'Laid over your existing floor', colour = '#cdc8c0' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<rect x="0" y="150" width="200" height="80" fill="#2a2522"/>
${Array.from({ length: 7 }, (_, i) => `<rect x="${4 + i * 28}" y="130" width="26" height="20" rx="1" fill="${['#8e6f5a', '#7c604e', '#9a7a62'][i % 3]}"/>`).join('')}
<rect class="scn-overlay" x="0" y="114" width="200" height="16" fill="${esc(colour)}"/><rect class="scn-overlay" x="0" y="114" width="200" height="2" fill="#fff" opacity=".5"/>
<clipPath id="${id}c"><rect x="0" y="114" width="200" height="16"/></clipPath>${sheen(id, id + 'c', 0, 114, 200, 16)}
<g class="scn-trowel"><path d="M120 108 h44 l-6 6 h-44z" fill="#c9cdd2"/><path d="M138 108 v-18 h10 v18" fill="var(--s-accent)"/></g>
${label(12, 100, 'New finish')}${label(12, 170, 'Old tiles stay', 'start', ' scn-t--dim')}`, l);
  },

  match: ({ colour = '#b3a596', label: l = 'Colour matched to your sample' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<path d="M0 140 H200 V230 H0Z" fill="#8a8580"/><path class="scn-match" d="M0 140 H200 V230 H0Z" fill="${esc(colour)}"/><path d="M0 140 H200 V230 H0Z" fill="url(#${id}B)" opacity=".25"/>
<ellipse cx="100" cy="152" rx="80" ry="6" fill="#fff" opacity=".18"/>
<g transform="rotate(-6 70 92)"><rect x="40" y="62" width="60" height="60" rx="6" fill="#000" opacity=".3" transform="translate(3 5)"/><rect x="40" y="62" width="60" height="60" rx="6" fill="${esc(colour)}"/><rect x="40" y="62" width="60" height="22" rx="6" fill="#fff" opacity=".14"/></g>
${label(70, 136, 'Your sample', 'middle')}${tickBadge(150, 94)}`, l);
  },

  worktop: ({ label: l = 'Polished concrete floors and worktops', colour = '#cdc8c0' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<g class="scn-pend"><path d="M100 0 V48" stroke="#777" stroke-width="1.4"/><path d="M86 48 h28 l6 12 h-40z" fill="#2d2f33"/><ellipse cx="100" cy="62" rx="30" ry="10" fill="var(--st-glow)" opacity=".35" style="filter:blur(4px)"/></g>
<path d="M0 176 H200 V230 H0Z" fill="${esc(colour)}"/><path d="M0 176 H200 V230 H0Z" fill="url(#${id}B)" opacity=".35"/>
<rect x="36" y="112" width="128" height="64" fill="#e8e4dd"/><path d="M52 120 V170 M84 120 V170 M116 120 V170 M148 120 V170" stroke="#000" stroke-opacity=".12"/>
<rect x="28" y="100" width="144" height="12" rx="1.5" fill="${esc(shade(colour, 0.05))}"/><rect x="28" y="100" width="144" height="2" fill="#fff" opacity=".6"/>
<clipPath id="${id}c"><rect x="28" y="100" width="144" height="12"/><path d="M0 176 H200 V230 H0Z"/></clipPath>${sheen(id, id + 'c', 0, 100, 200, 130)}`, l);
  },

  waterproof: ({ label: l = 'Sealed microcement walls shrug off the shower', colour = '#8f8279' }) => {
    const id = 'sc' + ++N;
    return frame('tile', id, `<rect x="30" y="40" width="140" height="160" fill="${esc(colour)}"/><rect x="30" y="40" width="140" height="160" fill="url(#${id}B)" opacity=".25"/><rect x="30" y="40" width="22" height="160" fill="#fff" opacity=".06"/>
<path d="M120 52 v16 M104 70 h32" stroke="#d6d3cf" stroke-width="3.4" stroke-linecap="round"/>
${Array.from({ length: 7 }, (_, i) => `<path class="scn-rain" d="M${108 + i * 4} 76 l-1 10" stroke="url(#${id}R)" stroke-width="1.4" stroke-linecap="round" style="--fall:96px;animation-delay:${f1(i * 0.22)}s"/>`).join('')}
${Array.from({ length: 6 }, (_, i) => `<ellipse class="scn-run" ${del(i * 0.4)} cx="${54 + i * 13}" cy="96" rx="2.2" ry="3" fill="#cfe9ff" opacity=".85"/>`).join('')}
<rect x="30" y="196" width="140" height="4" fill="#000" opacity=".25"/>`, l);
  },

  footfall: ({ label: l = 'Hard-wearing underfoot', colour = '#cdc8c0' }) => {
    const id = 'sc' + ++N;
    const steps = Array.from({ length: 6 }, (_, i) => { const x = 66 + (i % 2) * 34 + i * 4, y = 196 - i * 24; return `<g class="scn-foot" ${del(i * 0.42)}><ellipse cx="${x}" cy="${y}" rx="${7 - i * 0.6}" ry="${11 - i}" fill="#2a2a2c" opacity=".55"/></g>`; }).join('');
    return frame('tile', id, `<path d="M70 40 H130 L200 230 H0Z" fill="${esc(colour)}"/><path d="M70 40 H130 L200 230 H0Z" fill="url(#${id}B)" opacity=".3"/>
<path d="M88 40 L60 230 M112 40 L140 230" stroke="#fff" stroke-opacity=".12" stroke-width="10"/>${steps}
<clipPath id="${id}c"><path d="M70 40 H130 L200 230 H0Z"/></clipPath>${sheen(id, id + 'c', 0, 40, 200, 190)}`, l);
  },
};

export function scene(key, props = {}) {
  const fn = SCENES[key];
  if (!fn) throw new Error(`scenes: unknown scene "${key}"`);
  return fn(props);
}
export const hasScene = (key) => !!SCENES[key];
