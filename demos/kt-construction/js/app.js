import { initHero } from './hero.js';

// ---------- data (example colours; rates from KT's microcement cost guide) ----------
// Example colours only (plain names, no product codes). KT tints to a wide range or any RAL code.
const MC = [["mc1","Warm white","#F1ECE3"],["mc2","Soft white","#E8E4DB"],["mc3","Ivory","#E6DECB"],["mc4","Sand","#D9CAA8"],["mc5","Putty","#C8BAA0"],["mc6","Taupe","#B5A48E"],["mc7","Greige","#B0A89A"],["mc8","Stone","#9C9285"],["mc9","Concrete","#8E8C87"],["mc10","Storm grey","#666664"],["mc11","Graphite","#4C4C4A"],["mc12","Cocoa","#4A3A30"],["mc13","Charcoal","#28282A"],["mc14","Near black","#141416"]];
const LS = [["ls1","Warm stone","#DDCCB0"],["ls2","Pale stone","#D7CFBC"],["ls3","Sand stone","#C8AE85"],["ls4","Light stone","#ECE6DA"],["ls5","Mid grey","#9B968D"],["ls6","Dark grey","#5C5957"],["ls7","Grey stone","#6D6A65"],["ls8","Slate","#454A4E"]];
const NL = [["nl1","Chalk white","#F0EBDE"],["nl2","Cream","#EDE6D2"],["nl3","Buttermilk","#EDDFB8"],["nl4","Wheat","#D9C292"],["nl5","Clay","#D0B498"],["nl6","Dusty pink","#C99B89"],["nl7","Sage","#B7C2A8"],["nl8","Olive","#6E7245"],["nl9","Earth","#7C4A37"],["nl10","Soot","#2E2A28"]];
const FIN = { mc: { name: 'Microcement', list: MC }, ls: { name: 'Liquid Stone', list: LS }, nl: { name: 'Natural Limewash', list: NL } };
const byCode = c => { for (const k in FIN) { const f = FIN[k].list.find(x => x[0] === c); if (f) return { kind: k, code: f[0], name: f[1], hex: f[2] }; } };
// Rates from kt-construction.co.uk/guides/microcement-cost-per-m2
const COST_URL = 'https://kt-construction.co.uk/guides/microcement-cost-per-m2';
const RATE = { wall: [100, 150], floorOpen: [110, 160], floorSmall: [150, 220], wetRoom: [3500, 6500], worktopLm: [350, 550] };
// areas: [floor m², walls m², feature linear metres]
const SPACES = {
  bath: { name: 'Wet room', feature: 'Vanity', areas: [0, 0, 0], s: { floor: 'mc7', walls: 'mc3', feature: 'mc4' } },
  kitchen: { name: 'Kitchen', feature: 'Worktops', areas: [20, 24, 4], s: { floor: 'mc9', walls: 'nl2', feature: 'mc13' } },
  living: { name: 'Living', feature: 'Bench', areas: [24, 30, 0], s: { floor: 'mc5', walls: 'nl5', feature: 'ls1' } }
};
const WORK = [
  ['pool', 'Indoor pool and spa', 'Seamless walls', 1920, 1280],
  ['travertino', 'Travertino statement wall', 'Restaurant', 1920, 1280],
  ['bath-tub', 'Seamless bathroom floor', 'Microcement', 1600, 1200],
  ['liquidstone', 'Liquid Stone feature', 'Restaurant', 1920, 1280],
  ['shower', 'Shower room', 'Microcement walls', 1216, 1824],
  ['living', 'Living room', 'Microcement floor', 1920, 1440],
  ['bar', 'Bar and lounge', 'Feature walls', 1920, 1280],
  ['stair', 'Microcement staircase', 'Treads and risers', 1080, 1440],
  ['lounge-dark', 'Evening lounge', 'Decorative walls', 1920, 1280],
  ['retail', 'Retail showroom floor', 'Commercial', 1920, 1440],
  ['vanity', 'Vanity wall', 'Microcement', 1440, 1920],
  ['openplan', 'Open-plan flooring', 'Microcement floor', 1440, 1920],
  ['column', 'Feature column', 'Decorative plaster', 1280, 1920],
  ['pool-detail', 'Pool hall detail', 'Seamless walls', 1920, 1280]
];
const FORM_ENDPOINT = ''; // set to a Web3Forms/Formspree URL that forwards to enquiries@kt-construction.co.uk

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer:coarse)').matches;
const track = (ev, p = {}) => { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...p }); window.fbq && /quote_submit/.test(ev) && fbq('track', 'Lead'); };
const gbp = n => '£' + Math.round(n).toLocaleString('en-GB');
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } } };
const hasGL = (() => { try { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); if (!g) return false; const dbg = g.getExtension('WEBGL_debug_renderer_info'); const r = dbg ? g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''; return !/swiftshader|llvmpipe|software/i.test(r) || /gl=force/.test(location.search); } catch { return false; } })();
$('#yr').textContent = new Date().getFullYear();
$$('[data-track]').forEach(a => a.addEventListener('click', () => track(a.dataset.track, { location: a.dataset.loc })));

// ---------- smooth scroll ----------
let lenis = null;
function smooth() {
  if (reduce || coarse || !window.Lenis) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
function go(hash) { const el = $(hash); if (!el) return; if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const h = a.getAttribute('href'); if (h.length < 2) return; e.preventDefault(); go(h === '#top' ? '#hero' : h); });

// ---------- start (no loader: content shows immediately) ----------
document.body.classList.add('ready');
setTimeout(() => hero && hero.demo(), 900);

// ---------- header, rail, chip, mobile bar ----------
const hd = $('#hd'), chip = $('#chip'), mbar = $('#mbar');
let lastY = 0, dirAnchor = 0;
const chapters = $$('main .ch');
const railLinks = $$('.rail a');
function onScroll() {
  const y = scrollY, vh = innerHeight;
  hd.classList.toggle('scrolled', y > 40);
  $('#progTop').style.setProperty('--sp', y / Math.max(1, document.documentElement.scrollHeight - vh));
  // hide on scroll down / show on scroll up, with hysteresis so momentum and toolbar resizes don't flicker it (phones keep it fixed)
  if (innerWidth > 760) {
    if (y < vh * 0.8) { hd.classList.remove('hide'); dirAnchor = y; }
    else if (y > dirAnchor + 80) { hd.classList.add('hide'); dirAnchor = y; }
    else if (y < dirAnchor - 60) { hd.classList.remove('hide'); dirAnchor = y; }
    if (hd.classList.contains('hide') ? y > dirAnchor : y < dirAnchor) dirAnchor = y;
  } else hd.classList.remove('hide');
  lastY = y;
  let on = 0; chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < vh * 0.5) on = i; });
  railLinks.forEach((a, i) => a.classList.toggle('on', i === on));
  if (on !== 0) $('.cur').classList.remove('trowel');
  const brief = $('#brief').getBoundingClientRect();
  const briefOn = brief.top < vh * 0.9 && brief.bottom > vh * 0.1;
  chip.classList.toggle('show', y > vh * 0.9 && !briefOn && specTouched);
  mbar.classList.toggle('show', y > vh * 0.7 && !briefOn);
}
addEventListener('scroll', onScroll, { passive: true });

// ---------- cursor + magnet ----------
if (!coarse && !reduce) {
  const cur = $('.cur'); let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); const h = e.target.closest('#hero'); cur.classList.toggle('trowel', !!h && !e.target.closest('a,button,.dock')); cur.classList.toggle('big', !!e.target.closest('.frame')); }, { passive: true });
  (function f() { cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22); cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(f); })();
  $$('.magnet').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}

// ---------- reveals ----------
$$('.split').forEach(el => {
  const walk = n => { [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) { frag.append(w); return; } const o = document.createElement('span'); o.className = 'w'; const i = document.createElement('span'); i.textContent = w; o.append(i); frag.append(o); }); c.replaceWith(frag); } else if (c.nodeType === 1) walk(c); }); };
  walk(el); $$('.w>span', el).forEach((s, i) => s.style.transitionDelay = (i * 0.05) + 's');
});
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
$$('.rv,.split').forEach((el, i) => { if (el.classList.contains('rv')) el.style.transitionDelay = ((i % 4) * 0.08) + 's'; io.observe(el); });

// Magic UI "MagicCard" port: cursor spotlight + border glow
$$('.mcard').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));

// ---------- 01 hero ----------
let specTouched = false;
const HERO_SW = ['mc1', 'mc3', 'mc6', 'mc9', 'mc10', 'mc13'];
let hero = null;
const dock = $('.dock');
HERO_SW.forEach(code => { const c = byCode(code); const b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--c', c.hex); b.setAttribute('aria-label', c.name); b.setAttribute('aria-pressed', code === 'mc3'); b.dataset.code = code; dock.append(b); });
dock.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const c = byCode(b.dataset.code);
  $$('button', dock).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#dockL').textContent = `Example colour · ${c.name}`;
  hero && hero.setColour(c.hex);
  setChip(c.hex, 'Wall colour', `${c.name} microcement`); specTouched = true;
  track('hero_colour', { colour: c.name });
});
const groutEl = $('#groutLeft'), finishBtn = $('#finishBtn'), hint = $('#hintT');
let firstMove = false;
if (hasGL && !reduce) {
  try {
    hero = initHero({
      colour: '#E6DECB',
      onFirst() { firstMove = true; hint.textContent = 'Keep going, or pick a colour'; track('hero_trowel'); },
      onCoverage(cov, left) { if (hero && hero.cured) return; groutEl.textContent = Math.max(0, Math.round(left)); if (cov > 0.14) finishBtn.classList.add('show'); if (cov > 0.3 && firstMove) hint.textContent = 'Nearly there'; },
      onCured() { $('#cured').classList.add('show'); finishBtn.classList.remove('show'); hint.textContent = 'Scroll to see how it works'; groutEl.textContent = '0'; track('hero_cured'); }
    });
  } catch (e) { console.warn(e); }
}
if (!hero) { $('#hint').style.display = 'none'; finishBtn.remove(); groutEl.closest('.gc').style.display = 'none'; dock.style.display = 'none'; $('#dockL').style.display = 'none'; }
if (coarse) hint.textContent = 'Swipe sideways to trowel';
finishBtn.addEventListener('click', () => { hero && hero.finish(); track('hero_finish'); });

// ---------- 02 grout calculator ----------
(() => {
  const cv = $('#groutC'), ctx = cv.getContext('2d'), viz = $('#groutViz'), handle = $('#groutH');
  const W = $('#gW'), H = $('#gH'); let tsize = [150, 150], split = 0.5;
  const noise = document.createElement('canvas'); noise.width = noise.height = 256;
  { const n = noise.getContext('2d'); const id = n.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = 200 + Math.random() * 55; id.data[i] = v; id.data[i + 1] = v * 0.97; id.data[i + 2] = v * 0.92; id.data[i + 3] = 18; } n.putImageData(id, 0, 0); }
  function calc() {
    const w = +W.value, h = +H.value, tw = tsize[0] / 1000, th = tsize[1] / 1000;
    const cols = w / tw, rows = h / th;
    const metres = (Math.ceil(cols) - 1) * h + (Math.ceil(rows) - 1) * w;
    $('#gWo').textContent = w.toFixed(1) + ' m'; $('#gHo').textContent = h.toFixed(1) + ' m';
    [W, H].forEach(i => i.style.setProperty('--f', ((i.value - i.min) / (i.max - i.min) * 100) + '%'));
    $('#gM').textContent = Math.round(metres); $('#gN').textContent = Math.ceil(cols) * Math.ceil(rows);
    draw();
  }
  function draw() {
    const r = viz.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const w = +W.value, h = +H.value; const pad = 28; const sc = Math.min((r.width - pad * 2) / w, (r.height - pad * 2 - 30) / h);
    const ox = (r.width - w * sc) / 2, oy = (r.height - h * sc) / 2 + 14;
    ctx.fillStyle = '#e9e2d6'; ctx.fillRect(0, 0, r.width, r.height);
    const sx = r.width * split;
    // tiles (left of split)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sx, r.height); ctx.clip();
    ctx.fillStyle = '#f3efe8'; ctx.fillRect(ox, oy, w * sc, h * sc);
    const tw = tsize[0] / 1000 * sc, th = tsize[1] / 1000 * sc;
    for (let y = oy; y < oy + h * sc; y += th) for (let x = ox; x < ox + w * sc; x += tw) { ctx.fillStyle = `hsl(38,${18 + Math.sin(x * 7.1 + y * 3.3) * 4}%,${88 + Math.sin(x * 1.7 + y * 9.1) * 2}%)`; ctx.fillRect(x, y, Math.min(tw, ox + w * sc - x), Math.min(th, oy + h * sc - y)); }
    ctx.strokeStyle = 'rgba(110,98,82,.75)'; ctx.lineWidth = Math.max(1, sc * 0.003);
    ctx.beginPath(); for (let x = ox + tw; x < ox + w * sc - 0.5; x += tw) { ctx.moveTo(x, oy); ctx.lineTo(x, oy + h * sc); } for (let y = oy + th; y < oy + h * sc - 0.5; y += th) { ctx.moveTo(ox, y); ctx.lineTo(ox + w * sc, y); } ctx.stroke();
    ctx.restore();
    // microcement (right of split)
    ctx.save(); ctx.beginPath(); ctx.rect(sx, 0, r.width - sx, r.height); ctx.clip();
    const g = ctx.createLinearGradient(ox, oy, ox + w * sc, oy + h * sc); g.addColorStop(0, '#e2d9c6'); g.addColorStop(0.5, '#d9cfbb'); g.addColorStop(1, '#e6decb');
    ctx.fillStyle = g; ctx.fillRect(ox, oy, w * sc, h * sc);
    for (let i = 0; i < 9; i++) { const rg = ctx.createRadialGradient(ox + (i * 0.37 % 1) * w * sc, oy + (i * 0.61 % 1) * h * sc, 0, ox + (i * 0.37 % 1) * w * sc, oy + (i * 0.61 % 1) * h * sc, sc * 0.9); rg.addColorStop(0, 'rgba(255,255,255,.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(ox, oy, w * sc, h * sc); }
    ctx.fillStyle = ctx.createPattern(noise, 'repeat'); ctx.fillRect(ox, oy, w * sc, h * sc);
    ctx.restore();
    ctx.strokeStyle = 'rgba(17,16,14,.25)'; ctx.lineWidth = 1; ctx.strokeRect(ox + .5, oy + .5, w * sc - 1, h * sc - 1);
    ctx.fillStyle = '#6a6358'; ctx.font = '11px Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(`${w.toFixed(1)} m × ${h.toFixed(1)} m`, r.width / 2, r.height - 12);
    handle.style.setProperty('--x', split * 100 + '%'); handle.setAttribute('aria-valuenow', Math.round(split * 100));
  }
  [W, H].forEach(i => i.addEventListener('input', calc));
  $('#gT').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#gT button').forEach(x => x.setAttribute('aria-pressed', x === b)); tsize = b.dataset.t.split('x').map(Number); calc(); });
  let drag = false;
  const mv = e => { if (!drag) return; const r = viz.getBoundingClientRect(); split = clamp((e.clientX - r.left) / r.width, 0.04, 0.96); draw(); };
  handle.addEventListener('pointerdown', e => { drag = true; handle.setPointerCapture(e.pointerId); });
  handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', () => drag = false);
  viz.addEventListener('click', e => { if (e.target === handle) return; const r = viz.getBoundingClientRect(); split = clamp((e.clientX - r.left) / r.width, 0.04, 0.96); draw(); });
  handle.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') split = clamp(split - 0.05, 0.04, 0.96); if (e.key === 'ArrowRight') split = clamp(split + 0.05, 0.04, 0.96); draw(); });
  new ResizeObserver(draw).observe(viz);
  // gentle auto-sweep the first time it's seen
  new IntersectionObserver(([en], ob) => { if (!en.isIntersecting || reduce) return; ob.disconnect(); const t0 = performance.now(); (function f(t) { const k = (t - t0) / 2200; if (k > 1 || drag) return; split = 0.5 + Math.sin(k * Math.PI * 2) * 0.3 * (1 - k); draw(); requestAnimationFrame(f); })(t0); }, { threshold: 0.6 }).observe(viz);
  calc();
})();

// ---------- 03 anatomy (scroll-driven CSS 3D stack) ----------
(() => {
  const sec = $('#anatomy'), stack = $('#stack'), layers = $$('.layer', stack), steps = $$('.step'), prog = $$('#prog i'), mmv = $('#mmv');
  const labs = layers.map(l => { const d = document.createElement('div'); d.className = 'lab'; d.textContent = l.dataset.l; $('#iso').append(d); return d; });
  const ARR = layers.map((_, i) => i === 0 ? -1 : 0.06 + i * 0.085);
  const mobile = () => innerWidth < 860;
  let lastP = -1;
  function frame() {
    const r = sec.getBoundingClientRect(); const total = r.height - innerHeight;
    const p = clamp(-r.top / total, 0, 1);
    if (Math.abs(p - lastP) < 0.0005) return; lastP = p;
    const explode = p < 0.78 ? Math.min(1, p / 0.12) : lerp(1, 0.1, clamp((p - 0.78) / 0.14, 0, 1));
    const gapPx = mobile() ? 16 : 46;
    let mm = 0;
    layers.forEach((l, i) => {
      const a = ARR[i]; const k = a < 0 ? 1 : clamp((p - a) / 0.07, 0, 1); const e = 1 - Math.pow(1 - k, 3);
      const base = i === 0 ? 0 : 18 + i * 2.2; const z = base + i * gapPx * explode + (1 - e) * (mobile() ? 60 : 280);
      l.style.transform = `translateZ(${z}px)`; l.style.opacity = a < 0 ? 1 : e;
      if (i > 0) mm += e * (3 / (layers.length - 1));
      const show = (a < 0 || e > 0.6) && explode > 0.5;
      labs[i].classList.toggle('on', show);
      if (show) { const lr = l.getBoundingClientRect(), ir = $('#iso').getBoundingClientRect(); labs[i].style.transform = `translate(${lr.right - ir.left - (mobile() ? 30 : 10)}px,${lr.top - ir.top + lr.height * 0.42}px)`; }
    });
    mmv.textContent = mm.toFixed(1);
    stack.style.transform = `rotateX(${58 - p * 6}deg) rotateZ(${-38 + p * 14}deg)`;
    const s = p < 0.2 ? 0 : p < 0.45 ? 1 : p < 0.66 ? 2 : 3;
    steps.forEach((x, i) => x.classList.toggle('on', i === s));
    prog.forEach((x, i) => x.style.setProperty('--p', clamp((p - [0, 0.2, 0.45, 0.66][i]) / ([0.2, 0.25, 0.21, 0.3][i]), 0, 1)));
  }
  let on = false;
  new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) loop(); }).observe(sec);
  function loop() { if (!on) return; frame(); requestAnimationFrame(loop); }
  frame();
})();

// ---------- 04 configurator ----------
const cfg = (() => {
  const saved = store.get('kt-spec3');
  const state = { space: 'bath', light: 'day', group: 'walls', sp: JSON.parse(JSON.stringify(SPACES)) };
  if (saved && saved.sp) { for (const k in saved.sp) if (state.sp[k]) { state.sp[k].s = saved.sp[k].s; state.sp[k].areas = saved.sp[k].areas; } }
  let room = null;
  const surfEl = $('#surf'), finEl = $('#fin'), swEl = $('#sw');
  const S = () => state.sp[state.space];
  const allowed = (group, kind) => {
    if (group === 'floor') return kind === 'mc' ? '' : 'Floors: microcement is the right system here.';
    if (kind === 'nl' && group === 'feature') return 'Limewash is a wall finish.';
    if (kind === 'nl' && state.space === 'bath') return 'Limewash is not waterproof. Wet rooms need microcement or Liquid Stone.';
    return '';
  };
  function renderSurf() {
    const s = S(); surfEl.innerHTML = '';
    [['floor', 'Floor'], ['walls', 'Walls'], ['feature', s.feature]].forEach(([g, label]) => {
      const c = byCode(s.s[g]); const b = document.createElement('button'); b.type = 'button'; b.dataset.g = g; b.setAttribute('aria-pressed', g === state.group);
      b.innerHTML = `<i style="--c:${c.hex}"></i><span>${label}</span><small>${FIN[c.kind].name} · ${c.name}</small>`; surfEl.append(b);
    });
  }
  function renderFin() {
    const cur = byCode(S().s[state.group]); finEl.innerHTML = ''; let note = '';
    for (const k in FIN) { const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k; b.textContent = FIN[k].name; const why = allowed(state.group, k); if (why) { b.disabled = true; b.title = why; if (k !== cur.kind && state.group !== 'floor') note = why; } b.setAttribute('aria-pressed', k === cur.kind); finEl.append(b); }
    if (state.group === 'floor') note = 'Floors: microcement is the right system here.';
    $('#finNote').textContent = note;
  }
  function renderSw() {
    const cur = byCode(S().s[state.group]); swEl.innerHTML = '';
    FIN[cur.kind].list.forEach(([code, name, hex]) => { const b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--c', hex); b.dataset.code = code; b.title = name; b.setAttribute('aria-label', `${name}, example colour`); b.setAttribute('aria-pressed', code === cur.code); swEl.append(b); });
    $('#swName').textContent = cur.name; $('#swCode').textContent = 'Example colour';
  }
  function price() {
    const s = S(); const [fa, wa, xa] = s.areas;
    const w = byCode(s.s.walls), x = byCode(s.s.feature); let lo = 0, hi = 0; const survey = [];
    const add = (q, r) => { lo += q * r[0]; hi += q * r[1]; };
    const row = (n, label, show, val) => { const el = $('#a' + n); el.closest('.row').style.display = show ? '' : 'none'; $('#estL' + n).textContent = label; el.parentElement.querySelector('.u').textContent = /linear/.test(label) ? 'm' : 'm²'; if (val !== undefined) el.value = val; };
    if (state.space === 'bath') {
      add(1, RATE.wetRoom); // typical family bathroom, fully tanked
      if (w.kind === 'ls') survey.push('Liquid Stone walls');
      if (x.kind === 'mc') add(xa, RATE.worktopLm); else survey.push('Liquid Stone vanity');
      row(1, 'Typical family bathroom, fully tanked', false); row(2, '', false); row(3, 'Vanity top (linear m, optional)', x.kind === 'mc', xa);
      $('#estFixed').style.display = '';
    } else {
      $('#estFixed').style.display = 'none';
      add(fa, fa < 15 ? RATE.floorSmall : RATE.floorOpen);
      if (w.kind === 'mc') add(wa, RATE.wall); else survey.push(`${FIN[w.kind].name} walls`);
      if (state.space === 'kitchen' && x.kind === 'mc') add(xa, RATE.worktopLm); else survey.push(`${FIN[x.kind].name} ${s.feature.toLowerCase()}`);
      row(1, `Floor${fa < 15 ? ' (small, under 15 m²)' : ''}`, true, fa); row(2, 'Walls', w.kind === 'mc', wa); row(3, 'Worktops (linear m)', state.space === 'kitchen' && x.kind === 'mc', xa);
    }
    const r50 = v => Math.round(v / 50) * 50;
    $('#estT').textContent = `${gbp(r50(lo))} to ${gbp(r50(hi))}`;
    $('#estN').innerHTML = (survey.length ? `${survey.join(' and ')} priced on survey. ` : '') + `Guide range from <a href="${COST_URL}" target="_blank" rel="noopener">KT's 2026 cost guide</a>. Exact price after a free survey.`;
    return { lo: r50(lo), hi: r50(hi), survey };
  }
  function spec() {
    const s = S(); const out = { space: s.name, light: state.light, surfaces: {}, hex: {} };
    ['floor', 'walls', 'feature'].forEach(g => { const c = byCode(s.s[g]); out.surfaces[g === 'feature' ? s.feature : g[0].toUpperCase() + g.slice(1)] = `${FIN[c.kind].name} · ${c.name}`; out.hex[g] = c.hex; });
    out.areas = s.areas; out.price = price(); return out;
  }
  function sync(push = true) {
    renderSurf(); renderFin(); renderSw(); const pr = price();
    if (room) ['floor', 'walls', 'feature'].forEach(g => { const c = byCode(S().s[g]); room.setFinish(g, c.kind, c.hex); });
    if (push) { const c = byCode(S().s[state.group]); setChip(c.hex, `${S().name} spec`, `${FIN[c.kind].name} · ${c.name}`); store.set('kt-spec3', { sp: state.sp, space: state.space }); }
    return pr;
  }
  $('#space').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.space = b.dataset.v; $$('#space button').forEach(x => x.setAttribute('aria-pressed', x === b)); room && room.setSpace(state.space); sync(); specTouched = true; track('config_space', { space: state.space }); });
  surfEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.group = b.dataset.g; room && room.focus(state.group); sync(false); });
  finEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; const list = FIN[b.dataset.k].list; const cur = byCode(S().s[state.group]); const near = list.reduce((best, x) => dist(x[2], cur.hex) < dist(best[2], cur.hex) ? x : best, list[0]); S().s[state.group] = near[0]; sync(); specTouched = true; track('config_finish', { finish: b.dataset.k }); });
  swEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S().s[state.group] = b.dataset.code; sync(); specTouched = true; track('config_colour', { colour: b.dataset.code, surface: state.group }); });
  $('#lightSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.light = b.dataset.v; $$('#lightSeg button').forEach(x => x.setAttribute('aria-pressed', x === b)); room && room.setLight(state.light); });
  ['a1', 'a2', 'a3'].forEach((id, i) => $('#' + id).addEventListener('input', e => { const v = parseFloat(e.target.value); if (v >= 0 && v < 1000) { S().areas[i] = v; price(); store.set('kt-spec3', { sp: state.sp, space: state.space }); } }));
  $('#sendSpec').addEventListener('click', () => { specTouched = true; prefill(spec()); track('config_send'); });
  $('#saveBoard').addEventListener('click', () => { moodboard(room, spec()); track('config_save'); });
  function dist(a, b) { const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); const x = p(a), y = p(b); return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2; }
  sync(false);
  // fallback poster (no WebGL): a real KT photo for each room
  const poster = $('#cfgPoster');
  const posterImg = { bath: 'bath-tub-1200', kitchen: 'openplan-1200', living: 'living-1280' };
  function fallback() { poster.innerHTML = ''; poster.style.background = `url(img/${posterImg[state.space]}.webp) center/cover`; $('.cfg-hint').style.display = 'none'; }
  if (!hasGL) fallback();
  else {
    new IntersectionObserver(([en], ob) => {
      if (!en.isIntersecting) return; ob.disconnect();
      import('./config3d.js').then(m => {
        m.createRoom($('#cfgView'), {
          onPick(g) { state.group = g; sync(false); },
          onReady(api) { room = api; room.setSpace(state.space); room.setLight(state.light); sync(false); $('#cfgView').classList.add('live'); }
        });
      }).catch(err => { console.warn(err); fallback(); });
    }, { rootMargin: '700px' }).observe($('#cfgView'));
  }
  return { spec, get touched() { return specTouched; } };
})();

function moodboard(room, sp) {
  const c = document.createElement('canvas'); c.width = 1800; c.height = 1100; const x = c.getContext('2d');
  x.fillStyle = '#f4f0e9'; x.fillRect(0, 0, c.width, c.height);
  const done = () => {
    x.fillStyle = '#11100e'; x.font = '600 22px Hanken, sans-serif'; x.fillText('KT CONSTRUCTION · SURFACE SPEC', 1260, 110);
    x.font = '48px Bodoni, serif'; x.fillText(sp.space, 1260, 180);
    let y = 260; Object.entries(sp.surfaces).forEach(([k, v], i) => { const col = Object.values(sp.hex)[i]; x.fillStyle = col; x.beginPath(); x.arc(1290, y - 10, 28, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(0,0,0,.15)'; x.stroke(); x.fillStyle = '#7a7266'; x.font = '500 16px Mono, monospace'; x.fillText(k.toUpperCase(), 1340, y - 22); x.fillStyle = '#11100e'; x.font = '600 22px Hanken, sans-serif'; x.fillText(v, 1340, y + 8); y += 100; });
    x.fillStyle = '#11100e'; x.fillRect(1260, y + 10, 480, 150); x.fillStyle = '#a39b8f'; x.font = '500 15px Mono, monospace'; x.fillText('GUIDE PRICE', 1290, y + 50); x.fillStyle = '#e2c68f'; x.font = '44px Bodoni, serif'; x.fillText(`${gbp(sp.price.lo)} to ${gbp(sp.price.hi)}`, 1290, y + 110);
    x.fillStyle = '#5f584e'; x.font = '18px Hanken, sans-serif'; x.fillText('07385 259215 · enquiries@kt-construction.co.uk', 1260, 1040);
    const a = document.createElement('a'); a.download = 'kt-surface-spec.png'; a.href = c.toDataURL('image/png'); a.click();
  };
  if (room) { const img = new Image(); img.onload = () => { const s = Math.max(1200 / img.width, 1100 / img.height); x.drawImage(img, (1200 - img.width * s) / 2, (1100 - img.height * s) / 2, img.width * s, img.height * s); done(); }; img.src = room.snapshot(); }
  else done();
}

// ---------- chip (persistent "your spec") ----------
function setChip(hex, k, v) { $('#chipSw').style.setProperty('--sw', hex); $('#chipK').textContent = k; $('#chipV').textContent = v; onScroll(); }

// ---------- 05 work corridor ----------
(() => {
  const sec = $('#work'), corr = $('#corr'); const n = WORK.length; $('#wt').textContent = String(n).padStart(2, '0');
  const frames = WORK.map(([k, t, s, w, h], i) => {
    const f = document.createElement('figure'); f.className = 'frame'; const portrait = h > w;
    f.style.setProperty('--w', portrait ? '24vw' : '36vw');
    const big = w >= 1800 ? 1280 : (w >= 1200 ? 1200 : w);
    f.innerHTML = `<picture><source type="image/avif" data-srcset="img/${k}-640.avif 640w, img/${k}-${big}.avif ${big}w" sizes="(max-width:760px) 72vw, 36vw"><img data-src="img/${k}-${big}.webp" data-srcset="img/${k}-640.webp 640w, img/${k}-${big}.webp ${big}w" sizes="(max-width:760px) 72vw, 36vw" alt="${t}, ${s.toLowerCase()}. A KT Construction project" width="${w}" height="${h}" decoding="async" loading="lazy"></picture><figcaption><b>${t}</b><span>${s}</span></figcaption>`;
    f.dataset.k = k; f.dataset.cap = `${t} · ${s}`; f.tabIndex = 0; corr.append(f); return f;
  });
  const D = 1150; let loadedSet = new Set();
  const swipe = () => innerWidth < 760;
  function setMode() { sec.classList.toggle('swipe', swipe()); if (swipe()) frames.forEach((_, i) => load(i)); }
  setMode(); addEventListener('resize', setMode);
  corr.addEventListener('scroll', () => { if (!swipe()) return; const i = Math.round(corr.scrollLeft / (frames[0].offsetWidth + 12)); $('#wc').textContent = String(Math.min(n, i + 1)).padStart(2, '0'); }, { passive: true });
  function load(i) { if (loadedSet.has(i)) return; loadedSet.add(i); const f = frames[i]; $$('[data-srcset]', f).forEach(s => s.srcset = s.dataset.srcset); const im = $('img', f); im.src = im.dataset.src; }
  function frame() {
    const r = sec.getBoundingClientRect(); const total = r.height - innerHeight; const p = clamp(-r.top / total, 0, 1);
    const mob = innerWidth < 760; const camZ = p * (n - 1) * D - 250;
    let nearest = 0, nd = 1e9;
    frames.forEach((f, i) => {
      const side = i % 2 ? 1 : -1; const x = side * (mob ? 4 : 19) + (mob ? 0 : Math.sin(i * 1.7) * 3); const y = (mob ? (i % 2 ? 6 : -10) : Math.cos(i * 1.3) * 6);
      const z = -i * D + camZ; // relative to camera (0 = screen plane)
      if (z < -5 * D || z > 900) { f.style.visibility = 'hidden'; return; }
      if (z > -4 * D) load(i); if (z > -6 * D) load(Math.min(n - 1, i + 1));
      f.style.visibility = 'visible';
      const op = z < -3.6 * D ? 0 : z < -2.6 * D ? (z + 3.6 * D) / D : z > 160 ? clamp(1 - (z - 160) / 300, 0, 1) : 1;
      f.style.opacity = op;
      f.style.transform = `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), ${z}px) rotateY(${-side * (mob ? 6 : 14)}deg)`;
      if (Math.abs(z) < nd) { nd = Math.abs(z); nearest = i; }
    });
    $('#wc').textContent = String(nearest + 1).padStart(2, '0');
    $('.work-title').style.opacity = clamp(1 - p * 9, 0, 1);
  }
  let on = false;
  new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) { load(0); load(1); load(2); loop(); } }, { rootMargin: '400px' }).observe(sec);
  function loop() { if (!on) return; if (!swipe()) frame(); requestAnimationFrame(loop); }
  // lightbox
  const lb = $('#lb');
  const open = f => { const k = f.dataset.k; const w = WORK.find(x => x[0] === k); $('#lbImg').src = `img/${k}-${w[3] >= 1800 ? 1920 : (w[3] >= 1200 ? 1200 : w[3])}.webp`; $('#lbImg').alt = f.dataset.cap; $('#lbCap').textContent = f.dataset.cap; lb.classList.add('open'); lenis && lenis.stop(); track('gallery_open', { photo: k }); };
  corr.addEventListener('click', e => { const f = e.target.closest('.frame'); if (f) open(f); });
  corr.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = e.target.closest('.frame'); f && open(f); } });
  const close = () => { lb.classList.remove('open'); lenis && lenis.start(); };
  $('#lbX').addEventListener('click', close); lb.addEventListener('click', e => { if (e.target === lb) close(); }); addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ---------- 06 team: Magic UI TextReveal port + NumberTicker port + parallax ----------
(() => {
  const el = $('#rtext');
  const walk = n => { [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) { frag.append(w); return; } const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s); }); c.replaceWith(frag); } else walk(c); }); };
  walk(el); const words = $$('.w', el);
  const img = $('.team-img img');
  function f() {
    const r = el.getBoundingClientRect(); const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
    const k = Math.floor(p * words.length * 1.05); words.forEach((w, i) => w.classList.toggle('on', i < k));
    const ir = img.parentElement.getBoundingClientRect(); img.style.setProperty('--py', `${-((ir.top + ir.height / 2 - innerHeight / 2) / innerHeight) * 8 - 8}%`);
  }
  let on = false; new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) loop(); }).observe($('#team'));
  function loop() { if (!on) return; f(); requestAnimationFrame(loop); }
  const tio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; tio.unobserve(e.target); const to = +e.target.dataset.count; const t0 = performance.now(); const dur = 1800;
    (function s(t) { const k = clamp((t - t0) / dur, 0, 1); const v = to * (1 - Math.pow(2, -10 * k)); e.target.textContent = Math.round(k >= 1 ? to : v).toLocaleString('en-GB'); if (k < 1) requestAnimationFrame(s); })(t0);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(x => tio.observe(x));
})();

// ---------- 07 where: radar from Hurstpierpoint ----------
(() => {
  const C = [50.9335, -0.1797];
  const T = [['Crawley', 51.1091, -0.1872], ['Brighton', 50.8225, -0.1372], ['Horsham', 51.0629, -0.3259], ['Worthing', 50.8179, -0.3729], ['Haywards Heath', 50.9977, -0.1043], ['East Grinstead', 51.1238, -0.0108], ['Reigate', 51.2373, -0.2058], ['Eastbourne', 50.7684, 0.2905], ['Chichester', 50.8365, -0.7792], ['Hastings', 50.8543, 0.5735], ['London', 51.5072, -0.1276]];
  const S = 640, c = S / 2, kmToPx = 270 / 66;
  const pts = T.map(([n, la, lo]) => { const dx = (lo - C[1]) * Math.cos(C[0] * Math.PI / 180) * 111.32, dy = (la - C[0]) * 110.57; return { n, x: c + dx * kmToPx, y: c - dy * kmToPx, a: (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360, d: Math.hypot(dx, dy) }; });
  const rings = [10, 20, 30, 40].map(mi => mi * 1.609 * kmToPx);
  let svg = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Towns KT works in regularly, by distance from the Hurstpierpoint workshop"><defs><radialGradient id="rg"><stop offset="0" stop-color="#c2a06a" stop-opacity=".18"/><stop offset="1" stop-color="#c2a06a" stop-opacity="0"/></radialGradient><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2c68f" stop-opacity="0"/><stop offset="1" stop-color="#e2c68f" stop-opacity=".45"/></linearGradient></defs><circle cx="${c}" cy="${c}" r="300" fill="url(#rg)"/>`;
  rings.forEach((r, i) => svg += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(236,230,220,.12)" stroke-dasharray="${i % 2 ? '2 5' : '0'}"/><text x="${c + r * 0.72 + 4}" y="${c + r * 0.72 + 12}" font-family="Mono,monospace" font-size="9.5" fill="rgba(236,230,220,.4)" letter-spacing="1">${[10, 20, 30, 40][i]} MI</text>`);
  svg += `<g class="sweep"><path d="M${c} ${c} L${c} ${c - 300} A300 300 0 0 1 ${c + 300 * Math.sin(Math.PI / 6)} ${c - 300 * Math.cos(Math.PI / 6)} Z" fill="url(#sw)" opacity=".6"/><line x1="${c}" y1="${c}" x2="${c + 300 * Math.sin(Math.PI / 6)}" y2="${c - 300 * Math.cos(Math.PI / 6)}" stroke="#e2c68f" stroke-opacity=".7"/></g>`;
  const LEFT = ['Crawley', 'Horsham', 'Chichester', 'Worthing'];
  pts.forEach((p, i) => { const right = !LEFT.includes(p.n); svg += `<g class="town" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="4"/><circle cx="${p.x}" cy="${p.y}" r="10" fill="none" stroke="rgba(226,198,143,.35)"/><text x="${p.x + (right ? 14 : -14)}" y="${p.y + 4}" text-anchor="${right ? 'start' : 'end'}">${p.n}</text></g>`; });
  svg += `<circle cx="${c}" cy="${c}" r="7" fill="#c2a06a"/><circle cx="${c}" cy="${c}" r="16" fill="none" stroke="#c2a06a" stroke-opacity=".5"><animate attributeName="r" values="8;30" dur="2.4s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".7;0" dur="2.4s" repeatCount="indefinite"/></circle><text x="${c}" y="${c + 30}" text-anchor="middle" font-family="Mono,monospace" font-size="10" fill="#e2c68f" letter-spacing="1.2">KT WORKSHOP</text></svg>`;
  $('#radar').innerHTML = svg;
  const towns = $$('#radar .town'); const t0 = performance.now();
  (function f(t) { const ang = (((t - t0) / 6000) * 360 + 30) % 360; towns.forEach((g, i) => { let d = (ang - pts[i].a + 360) % 360; g.classList.toggle('hit', d < 50); }); requestAnimationFrame(f); })(t0);
  const AREAS = { BN: 'Sussex', RH: 'Sussex and Surrey', TN: 'Kent and East Sussex', GU: 'Surrey and Hampshire', PO: 'Hampshire and West Sussex', SO: 'Hampshire', KT: 'Surrey', CR: 'London and Surrey', SM: 'London and Surrey', TW: 'London and Surrey', ME: 'Kent', CT: 'Kent', DA: 'Kent', BR: 'London and Kent', RG: 'Berkshire', SL: 'Berkshire', OX: 'Oxfordshire', GL: 'The Cotswolds', SP: 'Hampshire', BH: 'Hampshire', E: 'London', EC: 'London', N: 'London', NW: 'London', SE: 'London', SW: 'London', W: 'London', WC: 'London', EN: 'London', HA: 'London', IG: 'London', RM: 'London', UB: 'London' };
  $('#pcForm').addEventListener('submit', e => {
    e.preventDefault(); const v = $('#pcIn').value.toUpperCase().replace(/\s+/g, ''); const m = v.match(/^([A-Z]{1,2})\d/); const out = $('#pcOut');
    if (!m) { out.textContent = 'Enter the first part of your postcode, like RH10 or BN1.'; return; }
    const reg = AREAS[m[1]] || AREAS[m[1][0]];
    out.textContent = reg ? `Yes, ${m[1]} is in our area (${reg}). Next step: a free survey.` : `That's outside our usual patch. Send us the details anyway and we'll tell you honestly whether we can help.`;
    $('#bPc').value = $('#pcIn').value.toUpperCase(); track('postcode_check', { area: m[1], covered: !!reg });
  });
})();

// ---------- 08 brief ----------
const brief = $('#brief'); let step = 0; const NSTEP = 5;
const bsteps = $$('.bstep', brief), dots = $$('.dots i', brief);
function showStep(i) { step = i; bsteps.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k <= i)); $('#bCount').textContent = `Step ${i + 1} of ${NSTEP}`; $('#bBack').hidden = i === 0; $('#bNext').innerHTML = i === NSTEP - 1 ? 'Send my brief <svg><use href="#i-arrow"/></svg>' : 'Next <svg><use href="#i-arrow"/></svg>'; $('#bErr').textContent = ''; track('quote_step', { step: i + 1 }); store.set('kt-brief', { step: i, data: Object.fromEntries(new FormData(brief)) }); }
function valid(i) {
  const fd = new FormData(brief);
  if (i === 0 && !fd.get('space')) return 'Pick the space you have in mind.';
  if (i === 1 && !fd.get('finish')) return 'Pick a finish, or "Not sure yet".';
  if (i === 2 && (!fd.get('size') || !fd.get('when'))) return 'Pick a rough size and timing.';
  if (i === 3 && !/^[A-Z]{1,2}\d[A-Z\d]?\s*(\d[A-Z]{2})?$/i.test((fd.get('postcode') || '').trim())) return 'Add your postcode (the first half is fine).';
  if (i === 4) { if ((fd.get('name') || '').trim().length < 2) return 'Add your name.'; if ((fd.get('phone') || '').replace(/\D/g, '').length < 10) return 'Add a phone number we can call.'; }
  return '';
}
$$('.opts input', brief).forEach(inp => inp.addEventListener('change', () => { const s = +inp.closest('.bstep').dataset.b; if ((s === 0 || s === 1) && !valid(s)) setTimeout(() => showStep(s + 1), 260); if (s === 2 && !valid(2)) setTimeout(() => showStep(3), 260); }));
$('#bBack').addEventListener('click', () => showStep(Math.max(0, step - 1)));
$('#bNext').addEventListener('click', async () => {
  const err = valid(step); if (err) { $('#bErr').textContent = err; return; }
  if (step < NSTEP - 1) { showStep(step + 1); return; }
  const fd = new FormData(brief); if (fd.get('company_site')) return;
  const data = Object.fromEntries(fd); delete data.company_site;
  const sp = specTouched ? cfg.spec() : null; if (sp) data.spec = `${sp.space}: ` + Object.entries(sp.surfaces).map(([k, v]) => `${k} ${v}`).join('; ') + ` | guide ${gbp(sp.price.lo)} to ${gbp(sp.price.hi)}`;
  // LEAD DELIVERY HOOK: POST to the form endpoint once it's set up
  if (FORM_ENDPOINT) { try { await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ subject: 'New KT website brief', ...data }) }); } catch { } }
  track('quote_submit', { space: data.space, finish: data.finish });
  const msg = `Hi KT, I've just sent a brief from your website.\n\nSpace: ${data.space}\nFinish: ${data.finish}\nSize: ${data.size}\nWhen: ${data.when}\nPostcode: ${data.postcode}${data.spec ? `\n3D spec: ${data.spec}` : ''}${data.message ? `\nNotes: ${data.message}` : ''}\n\n${data.name}, ${data.phone}`;
  $('#waDone').href = 'https://wa.me/447385259215?text=' + encodeURIComponent(msg);
  bsteps.forEach(s => s.classList.remove('on')); $('#bNav').style.display = 'none'; $('.brief-top').style.display = 'none'; $('#doneCard').classList.add('on');
  store.set('kt-brief', null);
});
function prefill(sp) {
  $('#specPre').classList.add('on'); $('#specPre i').style.setProperty('--sw', sp.hex.walls || '#e6decb');
  $('#specPreT').textContent = `${sp.space}: ${Object.entries(sp.surfaces).map(([k, v]) => `${k.toLowerCase()} ${v.split(' · ')[1].toLowerCase()} ${v.split(' · ')[0].toLowerCase()}`).join(', ')}`;
  const map = { 'Wet room': 'Bathroom / wet room', Kitchen: 'Kitchen / worktops', Living: 'Living / bedroom walls' };
  const r = $(`input[name=space][value="${map[sp.space]}"]`, brief); if (r) r.checked = true;
  const fins = Object.values(sp.surfaces).map(v => v.split(' ')[0]); const f = fins.includes('Microcement') ? 'Microcement' : fins.includes('Liquid') ? 'Liquid Stone' : 'Natural Limewash';
  const fr = $(`input[name=finish][value="${f}"]`, brief); if (fr) fr.checked = true;
  if (step < 2) showStep(2);
}
(() => { const s = store.get('kt-brief'); if (s && s.data) { for (const [k, v] of Object.entries(s.data)) { const el = brief.elements[k]; if (!el) continue; if (el instanceof RadioNodeList) { const r = [...el].find(x => x.value === v); if (r) r.checked = true; } else el.value = v; } } })();

smooth(); onScroll();
