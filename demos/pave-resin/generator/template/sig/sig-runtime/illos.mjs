// Small live illustrations shared by benefit-illustrations (large) and proof-tiles (small).
// Flat shapes and fine lines in the accent plus two neutrals (ink, muted/line). No clip-art, no emoji.
// Motion is CSS keyframes in illos.css. They run only while the card is on screen (.is-playing from
// sig-runtime), and with reduced motion each drawing rests on its finished frame.
// illo(key, props) → SVG string (viewBox 200×120). Unknown key throws, so a typo fails the build.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (body, label) => `<svg class="sgi" viewBox="12 4 176 110" role="img" aria-label="${esc(label || '')}" focusable="false">${body}</svg>`;
const d = (s) => `style="animation-delay:${s}s"`;
const grid = (x0, y0, cols, rows, w, h, gap, cls = 'i-n') => { let o = ''; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) o += `<rect class="${cls}" x="${x0 + c * (w + gap)}" y="${y0 + r * (h + gap)}" width="${w}" height="${h}" rx="1.5"/>`; return o; };
const drops = (n, x0, span, cls = 'i-a sgi-fall') => Array.from({ length: n }, (_, i) => `<path class="${cls}" ${d((i * 0.37) % 1.8)} d="M${x0 + (i * span) / n + ((i * 7) % 11)} 6 q3 5 0 8 q-3 -3 0 -8z"/>`).join('');
const tick = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle class="i-a" r="10"/><path class="i-tk sgi-draw" pathLength="1" d="M-4.5 0 l3 3 l6 -6.5"/></g>`;

export const ILLOS = {
  // ---- material benefits ----
  drain: ({ label = 'Rain soaking through the surface into the ground' }) => svg(`${drops(9, 30, 140)}
<rect class="i-n" x="20" y="54" width="160" height="16" rx="2"/>${Array.from({ length: 40 }, (_, i) => `<circle class="i-m" cx="${24 + (i % 20) * 8 + (i > 19 ? 4 : 0)}" cy="${i > 19 ? 65 : 59}" r="1.6"/>`).join('')}
<path class="i-ls" d="M20 78 H180 M20 90 H180 M20 102 H180"/>${Array.from({ length: 6 }, (_, i) => `<path class="i-a sgi-seep" ${d(i * .3)} d="M${40 + i * 24} 74 q2 4 0 6 q-2 -2 0 -6z"/>`).join('')}`, label),
  weeds: ({ label = 'Weeds grow in block joints but have nowhere to root in resin' }) => svg(`<rect class="i-n" x="14" y="62" width="80" height="22" rx="2"/><path class="i-bg" d="M40 62v22M67 62v22"/>
<g class="sgi-sprout" style="transform-origin:40px 62px"><path class="i-ms" d="M40 62 q-1 -12 2 -18"/><path class="i-m" d="M41 50 q-9 -2 -10 -9 q8 0 10 9z M42 47 q8 -4 11 -1 q-5 5 -11 1z"/></g>
<rect class="i-n" x="106" y="62" width="80" height="22" rx="2"/>${Array.from({ length: 18 }, (_, i) => `<circle class="i-m" cx="${110 + (i % 9) * 9}" cy="${i > 8 ? 78 : 68}" r="1.5"/>`).join('')}
${tick(146, 40)}<text class="i-t" x="54" y="100" text-anchor="middle">Joints</text><text class="i-t" x="146" y="100" text-anchor="middle">No joints</text>`, label),
  uv: ({ label = 'Colour that holds in the sun' }) => svg(`<g class="sgi-spin" style="transform-origin:46px 38px"><circle class="i-as" cx="46" cy="38" r="12"/>${Array.from({ length: 8 }, (_, i) => `<path class="i-as" transform="rotate(${i * 45} 46 38)" d="M46 18 v-6"/>`).join('')}</g>
<rect class="i-a" x="96" y="44" width="84" height="44" rx="4" opacity=".85"/><path class="i-ls" d="M70 50 l22 8 M66 66 l26 2"/>`, label),
  interlock: ({ label = 'Interlocked blocks spread a car’s weight' }) => svg(`${Array.from({ length: 8 }, (_, i) => `<rect class="i-n sgi-dip" ${d(i % 2 ? .05 : 0)} x="${14 + i * 22}" y="78" width="20" height="14" rx="1.5"/>`).join('')}<path class="i-ls" d="M10 94 H190"/>
<g class="sgi-roll"><circle class="i-is" cx="100" cy="62" r="15" style="stroke-width:5"/><circle class="i-i" cx="100" cy="62" r="4"/></g>
${[-3, -2, -1, 0, 1, 2, 3].map((k, i) => `<path class="i-as sgi-spread" ${d(.6 + Math.abs(k) * .12)} d="M${100 + k * 22} 98 v8" />`).join('')}`, label),
  lift: ({ label = 'One block lifts out and goes back for a repair' }) => svg(`${grid(30, 26, 6, 3, 22, 20, 3)}<rect class="i-l" x="105" y="49" width="22" height="20" rx="1.5"/>
<g class="sgi-lift"><rect class="i-n i-as" x="105" y="49" width="22" height="20" rx="1.5" style="stroke-width:1.6"/></g>`, label),
  edge: ({ label = 'A kerb holds the blocks in place' }) => svg(`<rect class="i-i" x="22" y="30" width="10" height="64" rx="2"/><rect class="i-i" x="168" y="30" width="10" height="64" rx="2"/>${grid(36, 30, 6, 3, 20, 20, 2)}
<path class="i-as sgi-push" d="M70 62 h-26 m6 -5 l-6 5 6 5"/><path class="i-as sgi-push" d="M130 62 h26 m-6 -5 l6 5 -6 5"/>`, label),
  seamless: ({ label = 'No grout lines, one continuous surface' }) => svg(`<rect class="i-n" x="20" y="24" width="160" height="72" rx="4"/>
<path class="i-bg sgi-fadeout" d="M52 24v72M84 24v72M116 24v72M148 24v72M20 48h160M20 72h160"/><rect class="sgi-sheen" x="20" y="24" width="40" height="72"/>`, label),
  wipe: ({ label = 'A spill wipes straight off' }) => svg(`<rect class="i-n" x="16" y="70" width="168" height="22" rx="3"/>
<path class="i-a sgi-drip" d="M96 14 q6 9 0 14 q-6 -5 0 -14z"/><ellipse class="i-a sgi-pool" cx="96" cy="70" rx="22" ry="4"/>
<g class="sgi-cloth"><rect class="i-is" x="40" y="54" width="34" height="14" rx="4" style="stroke-width:1.6"/><path class="i-ls" d="M44 61h26"/></g>`, label),
  heat: ({ label = 'Underfloor heating warmth passes straight through' }) => svg(`<rect class="i-n" x="16" y="58" width="168" height="14" rx="2"/><rect class="i-l" x="16" y="72" width="168" height="16"/>
${Array.from({ length: 7 }, (_, i) => `<circle class="i-as" cx="${30 + i * 23}" cy="80" r="4.5"/>`).join('')}
${Array.from({ length: 5 }, (_, i) => `<path class="i-as sgi-rise" ${d(i * .45)} d="M${42 + i * 29} 52 q-5 -6 0 -12 q5 -6 0 -12"/>`).join('')}`, label),
  floorwall: ({ label = 'One coat runs from floor up the wall, no joins' }) => svg(`<path class="i-ls" d="M40 14 V96 H186" style="stroke-width:1"/>
<path class="i-as sgi-coat" pathLength="1" d="M186 92 H44 V14" style="stroke-width:7;stroke-linecap:round;stroke-linejoin:round"/>`, label),
  tyre: ({ label = 'A hot tyre parks and leaves no mark' }) => svg(`<rect class="i-n" x="14" y="80" width="172" height="14" rx="2"/><g class="sgi-park"><circle class="i-is" cx="100" cy="64" r="15" style="stroke-width:5"/><circle class="i-i" cx="100" cy="64" r="4"/>${[0, 1, 2].map((i) => `<path class="i-as" d="M${92 + i * 8} 40 q-3 -5 0 -9"/>`).join('')}</g>${tick(160, 46, .8)}`, label),
  bead: ({ label = 'Spills bead on the surface instead of soaking in' }) => svg(`<rect class="i-n" x="14" y="76" width="172" height="16" rx="2"/>
${[0, 1, 2].map((i) => `<g class="sgi-beadg" ${d(i * .5)}><ellipse class="i-a" cx="${60 + i * 40}" cy="70" rx="9" ry="6.5"/><ellipse cx="${57 + i * 40}" cy="67.5" rx="2.5" ry="1.6" fill="#fff" opacity=".7"/></g>`).join('')}`, label),
  stain: ({ label = 'Porcelain is non-porous: spills sit on top' }) => svg(`<rect class="i-n" x="14" y="66" width="80" height="18" rx="2"/><ellipse class="i-m sgi-soak" cx="54" cy="70" rx="22" ry="4"/>
<rect class="i-n" x="106" y="66" width="80" height="18" rx="2"/><g class="sgi-beadg"><ellipse class="i-a" cx="146" cy="60" rx="9" ry="6.5"/><ellipse cx="143" cy="57.5" rx="2.5" ry="1.6" fill="#fff" opacity=".7"/></g>
<text class="i-t" x="54" y="100" text-anchor="middle">Porous stone</text><text class="i-t" x="146" y="100" text-anchor="middle">Porcelain</text>`, label),
  slip: ({ label = 'R11 anti-slip texture, safe when wet' }) => svg(`<rect class="i-n" x="16" y="72" width="168" height="18" rx="2"/>${Array.from({ length: 40 }, (_, i) => `<circle class="i-m" cx="${20 + (i % 20) * 8.3}" cy="${i > 19 ? 84 : 77}" r="1.2"/>`).join('')}
${drops(5, 40, 120)}<g class="sgi-step"><path class="i-is" d="M78 64 h40 q8 0 8 -6 v-6 h-50 z" style="stroke-width:1.6"/><path class="i-ls" d="M84 64v-4M92 64v-4M100 64v-4M108 64v-4"/></g>
<text class="i-t" x="168" y="24" text-anchor="end" style="font-weight:700;fill:var(--s-accent)">R11</text>`, label),
  frost: ({ label = 'Frost and sun don’t fade or crack it' }) => svg(`<g class="sgi-spin" style="transform-origin:150px 30px"><circle class="i-as" cx="150" cy="30" r="9"/>${Array.from({ length: 8 }, (_, i) => `<path class="i-as" transform="rotate(${i * 45} 150 30)" d="M150 15 v-5"/>`).join('')}</g>
${[0, 1, 2].map((i) => `<g class="sgi-flake" ${d(i * .8)}><path class="i-ms" d="M${44 + i * 22} 10 v12 M${38 + i * 22} 16 h12 M${40 + i * 22} 12 l8 8 M${48 + i * 22} 12 l-8 8"/></g>`).join('')}
<rect class="i-a" x="30" y="66" width="140" height="26" rx="3" opacity=".85"/>`, label),
  footfall: ({ label = 'Hard-wearing underfoot' }) => svg(`<path class="i-n" d="M10 96 L40 62 H190 L170 96 Z"/>${Array.from({ length: 6 }, (_, i) => `<g class="sgi-turn" ${d(i * .45)}><ellipse class="i-i" cx="${48 + i * 22}" cy="${i % 2 ? 74 : 84}" rx="6" ry="3.2" transform="rotate(-8 ${48 + i * 22} ${i % 2 ? 74 : 84})"/></g>`).join('')}`, label),
  // ---- business claims (proof tiles) ----
  years: ({ value = '20+', unit = 'years', label }) => svg(`<circle class="i-ls" cx="100" cy="58" r="40"/><circle class="i-as sgi-ring" pathLength="1" cx="100" cy="58" r="40" transform="rotate(-90 100 58)" style="stroke-width:3"/>
<text x="100" y="64" text-anchor="middle" class="i-num">${esc(value)}</text><text class="i-t" x="100" y="80" text-anchor="middle">${esc(unit)}</text>`, label || `${value} ${unit}`),
  stars: ({ value = '5.0', label }) => svg(`${Array.from({ length: 5 }, (_, i) => `<path class="i-a sgi-pop" ${d(i * .14)} transform="translate(${44 + i * 28} 34)" d="M0 -11 L3.2 -3.6 L11 -3.4 L4.8 1.6 L7 9.2 L0 4.8 L-7 9.2 L-4.8 1.6 L-11 -3.4 L-3.2 -3.6Z"/>`).join('')}<text x="100" y="86" text-anchor="middle" class="i-num">${esc(value)}</text>`, label || `${value} stars`),
  prep: ({ label = 'Ground dug out and built up in layers' }) => svg(`<path class="i-ls" d="M10 40 H40 L50 92 H150 L160 40 H190"/>
${[[50, 80, 100, 12, 0], [49, 66, 102, 14, .4], [47, 54, 106, 12, .8]].map(([x, y, w, h, t], i) => `<rect class="${['i-m', 'i-n', 'i-a'][i]} sgi-drop" ${d(t)} x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5"/>`).join('')}
<text class="i-t" x="168" y="62">Surface</text><text class="i-t" x="168" y="74">Base</text><text class="i-t" x="168" y="88">Sub-base</text>`, label),
  swatches: ({ colours = ['#8d8a86', '#b2583f', '#2b2b2d'], names = [], label }) => svg(`${colours.map((c, i) => { const n = colours.length, w = Math.min(44, 150 / n - 8), x = 100 - (n * (w + 8) - 8) / 2 + i * (w + 8); return `<rect x="${x}" y="30" width="${w}" height="${w}" rx="6" fill="${esc(c)}"/><rect class="i-as sgi-sel" ${d(i * (2.4 / n))} x="${x - 4}" y="26" width="${w + 8}" height="${w + 8}" rx="8" style="stroke-width:2;--n:${n}"/>${names[i] ? `<text class="i-t" x="${x + w / 2}" y="${42 + w}" text-anchor="middle">${esc(names[i])}</text>` : ''}`; }).join('')}`, label || names.join(', ')),
  pattern: ({ label = 'Traditional and modern patterns' }) => svg(`<defs><clipPath id="sgiPc"><rect x="44" y="14" width="112" height="92" rx="4"/></clipPath></defs><g class="sgi-cyc" ${d(0)}><g clip-path="url(#sgiPc)"><g transform="translate(100 60) rotate(45)">${(() => { let o = ''; const U = 8; for (let s2 = -5; s2 <= 5; s2++) for (let k = -10; k <= 10; k++) { const a = [k + 2 * s2, k - 2 * s2], b = [k + 2 + 2 * s2, k - 1 - 2 * s2]; if (Math.hypot(a[0] * U, a[1] * U) < 90) o += `<rect class="i-n" x="${a[0] * U + .6}" y="${a[1] * U + .6}" width="${2 * U - 1.2}" height="${U - 1.2}" rx="1"/>`; if (Math.hypot(b[0] * U, b[1] * U) < 90) o += `<rect class="i-m" x="${b[0] * U + .6}" y="${b[1] * U + .6}" width="${U - 1.2}" height="${2 * U - 1.2}" rx="1"/>`; } return o; })()}</g></g></g>
<g class="sgi-cyc" ${d(-2)}>${Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect class="${(r + c) % 2 ? 'i-n' : 'i-m'}" x="${40 + c * 20 - (r % 2) * 10}" y="${16 + r * 18}" width="19" height="17" rx="1"/>`).join('')).join('')}</g>
<g class="sgi-cyc" ${d(-4)}>${Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => (r + c) % 2 ? `<rect class="i-n" x="${50 + c * 25}" y="${20 + r * 26}" width="24" height="12" rx="1"/><rect class="i-n" x="${50 + c * 25}" y="${33 + r * 26}" width="24" height="12" rx="1"/>` : `<rect class="i-m" x="${50 + c * 25}" y="${20 + r * 26}" width="12" height="25" rx="1"/><rect class="i-m" x="${63 + c * 25}" y="${20 + r * 26}" width="11" height="25" rx="1"/>`).join('')).join('')}</g>`, label),
  plans: ({ label = 'Plans and visuals before work starts' }) => svg(`<rect class="i-ls" x="30" y="14" width="140" height="92" rx="3"/><path class="i-ls" d="M30 36h140M30 58h140M30 80h140M58 14v92M86 14v92M114 14v92M142 14v92" style="opacity:.5"/>
<path class="i-as sgi-plan" pathLength="1" d="M48 92 V40 H118 V62 H156 V92 Z M48 70 H118 M90 40 V92" style="stroke-width:2.2;stroke-linejoin:round"/>`, label),
  visit: ({ label = 'We come to your property' }) => svg(`<path class="i-is" d="M60 96 V62 L100 34 L140 62 V96 Z" style="stroke-width:1.8;stroke-linejoin:round"/><rect class="i-ls" x="90" y="72" width="20" height="24"/><path class="i-ls" d="M30 96 H170"/>
<g class="sgi-pin"><path class="i-a" d="M100 8 c-9 0 -15 6 -15 14 c0 10 15 22 15 22 s15 -12 15 -22 c0 -8 -6 -14 -15 -14z"/><circle cx="100" cy="21" r="5" fill="#fff"/></g>`, label),
  shield: ({ label = 'Fully insured' }) => svg(`<path class="i-as sgi-plan" pathLength="1" d="M100 12 L136 24 V56 C136 80 120 96 100 106 C80 96 64 80 64 56 V24 Z" style="stroke-width:2.4;stroke-linejoin:round"/><path class="i-tk2 sgi-draw" pathLength="1" d="M86 58 l10 10 l20 -22"/>`, label),
  council: ({ label = 'Council-approved' }) => svg(`<rect class="i-ls" x="54" y="12" width="76" height="96" rx="3" style="stroke-width:1.6"/><path class="i-ls" d="M66 32h52M66 44h52M66 56h40M66 68h46"/>${tick(126, 88, 1.3)}`, label),
  stamp: ({ text = 'GUARANTEED', label }) => svg(`<g class="sgi-stamp" style="transform-origin:100px 60px"><circle class="i-as" cx="100" cy="60" r="40" style="stroke-width:2.4"/><circle class="i-as" cx="100" cy="60" r="33"/><text x="100" y="64" text-anchor="middle" class="i-t" style="font-weight:700;fill:var(--s-accent);letter-spacing:.08em">${esc(text)}</text></g>`, label || text),
  mix: ({ colours = ['#b49a74', '#8e7756', '#d8c6a5'], label = 'Resin and stone mixed before laying' }) => svg(`<circle class="i-ls" cx="100" cy="60" r="42" style="stroke-width:2"/><g class="sgi-spin2" style="transform-origin:100px 60px">${Array.from({ length: 34 }, (_, i) => { const a = i * 2.4, r = 8 + (i % 6) * 5.5; return `<circle cx="${(100 + Math.cos(a) * r).toFixed(1)}" cy="${(60 + Math.sin(a) * r).toFixed(1)}" r="${2 + (i % 3)}" fill="${esc(colours[i % colours.length])}"/>`; }).join('')}<path class="i-as" d="M100 60 m-30 0 a30 30 0 0 1 30 -30" style="stroke-width:2.4"/></g>`, label),
  membrane: ({ label = 'Gravel laid on a weed membrane' }) => svg(`${Array.from({ length: 44 }, (_, i) => `<circle class="${i % 3 ? 'i-n' : 'i-m'}" cx="${22 + (i % 22) * 7.6}" cy="${i > 21 ? 64 : 56}" r="3.6"/>`).join('')}<path class="i-as" d="M16 72 H184" style="stroke-width:2.4"/>
<g class="sgi-blocked"><path class="i-ms" d="M100 96 q-1 -8 1 -16"/><path class="i-m" d="M101 86 q-7 -2 -8 -7 q6 0 8 7z"/></g><text class="i-t" x="184" y="86" text-anchor="end">Membrane</text>`, label),
  range: ({ items = ['Walling', 'Crazy paving', 'Slabbing'], label }) => svg(`${items.slice(0, 3).map((t, i) => `<g class="sgi-turn" ${d(i * 1)} transform="translate(${36 + i * 64} 20)">${[
    `<path class="i-ls" d="M0 40 h48"/>${Array.from({ length: 4 }, (_, r) => Array.from({ length: 3 }, (_, c) => `<rect class="i-n" x="${c * 16 - (r % 2) * 8 + 4}" y="${r * 10}" width="15" height="9" rx="1"/>`).join('')).join('')}`,
    `<path class="i-n" d="M2 2 L22 0 L26 14 L8 18Z M26 0 L46 4 L42 20 L28 16Z M4 22 L24 20 L22 38 L2 36Z M26 20 L44 24 L46 38 L26 38Z"/>`,
    `${grid(0, 0, 2, 2, 22, 18, 3)}`][i % 3]}<text class="i-t" x="24" y="60" text-anchor="middle">${esc(t)}</text></g>`).join('')}`, label || items.join(', ')),
  overlay: ({ label = 'Laid over your existing floor' }) => svg(`<g>${grid(18, 66, 6, 1, 26, 18, 2, 'i-m')}</g><path class="i-ls" d="M14 88 H186"/>
<rect class="i-a sgi-overlay" x="16" y="58" width="168" height="8" rx="2"/><text class="i-t" x="186" y="52" text-anchor="end">Overlay</text><text class="i-t" x="186" y="104" text-anchor="end">Existing floor</text>`, label),
  match: ({ colour = '#a9a6a1', label = 'Colour matched to your sample' }) => svg(`<rect x="34" y="34" width="56" height="56" rx="8" fill="${esc(colour)}"/><text class="i-t" x="62" y="106" text-anchor="middle">Your sample</text>
<g class="sgi-slide"><rect x="110" y="34" width="56" height="56" rx="8" fill="${esc(colour)}"/></g><text class="i-t" x="138" y="106" text-anchor="middle">Our mix</text>${tick(100, 24, .8)}`, label),
  worktop: ({ label = 'Floors and worktops' }) => svg(`<rect class="i-a" x="40" y="34" width="120" height="10" rx="2"/><path class="i-ls" d="M48 44 V92 M152 44 V92 M60 44 V92 H140 V44" style="stroke-width:1.4"/><rect class="i-n" x="14" y="92" width="172" height="10" rx="2"/>
<rect class="sgi-sheen" x="40" y="34" width="30" height="10"/>`, label),
  waterproof: ({ label = 'Sealed walls shrug off the shower' }) => svg(`<rect class="i-n" x="40" y="10" width="120" height="96" rx="3"/>${Array.from({ length: 6 }, (_, i) => `<path class="i-a sgi-run" ${d(i * .32)} d="M${56 + i * 18} 18 q3 5 0 8 q-3 -3 0 -8z"/>`).join('')}
<path class="i-as" d="M150 6 v10 h-8" style="stroke-width:2"/>`, label),
  access: ({ label = 'Drainage and car access planned in' }) => svg(`<rect class="i-n" x="14" y="70" width="172" height="20" rx="2"/><rect class="i-i" x="14" y="90" width="172" height="6"/><path class="i-ls" d="M20 93h160" style="stroke-dasharray:3 3"/>
<g class="sgi-drive"><rect class="i-is" x="64" y="44" width="72" height="20" rx="8" style="stroke-width:1.8"/><path class="i-ls" d="M80 44 l8 -12 h26 l8 12"/><circle class="i-i" cx="82" cy="66" r="6"/><circle class="i-i" cx="120" cy="66" r="6"/></g>${drops(5, 30, 140)}`, label),
};

export function illo(key, props = {}) {
  const f = ILLOS[key];
  if (!f) throw new Error('illos: unknown illustration ' + key);
  return f(props);
}
