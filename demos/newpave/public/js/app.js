import { SITE, RATES, EXTRAS, SIZES, BLENDS, BLOCK_COLOURS, PATTERNS, PORCELAIN, SURFACES, AREA_PREFIXES, TESTIMONIALS, wa } from './config.js';
import * as T from './tex.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer:coarse)').matches;
const gbp = n => '£' + (Math.round(n / 10) * 10).toLocaleString('en-GB');
const track = (ev, p = {}) => { (window.dataLayer = window.dataLayer || []).push({ event: ev, ...p }); if (window.fbq && ev === 'survey_booked') fbq('track', 'Lead'); };
const store = { get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { } } };
const hasGL = (() => { try { if (/gl=off/.test(location.search)) return false; const c = document.createElement('canvas'); const g = c.getContext('webgl'); if (!g) return false; const d = g.getExtension('WEBGL_debug_renderer_info'); const r = d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : ''; return !/swiftshader|llvmpipe|software/i.test(r) || /gl=force/.test(location.search); } catch { return false; } })();
const idle = fn => (window.requestIdleCallback || (f => setTimeout(f, 200)))(fn, { timeout: 1500 });
$('#yr').textContent = new Date().getFullYear();
document.addEventListener('click', e => { const a = e.target.closest('[data-track]'); if (a) track(a.dataset.track, { location: a.dataset.loc }); });

// ---------- smooth scroll ----------
let lenis = null;
function smooth() {
  if (reduce || coarse || !window.Lenis) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
addEventListener('load', smooth);
function go(hash) { const el = $(hash); if (!el) return; if (lenis) lenis.scrollTo(el, { offset: hash === '#book' ? -40 : 0, duration: 1.4 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const h = a.getAttribute('href'); if (h.length < 2) return; e.preventDefault(); go(h); history.replaceState(null, '', h); });

// ---------- header, dock, glow ----------
const hd = $('#hd'), dock = $('#dock');
function onScroll() {
  const y = scrollY, vh = innerHeight;
  hd.classList.toggle('glass', y > 40);
  const bk = $('#book').getBoundingClientRect();
  const bookOn = bk.top < vh * .85 && bk.bottom > vh * .2;
  const dz = $('#design').getBoundingClientRect(); const designOn = innerWidth <= 1100 && dz.top < vh * .5 && dz.bottom > vh * .5;
  dock.classList.toggle('show', y > vh * .8 && !bookOn && !designOn);
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();
if (!coarse && !reduce) {
  const g = $('.glow'); let x = -600, y = -600, tx = x, ty = y, run = false;
  const step = () => { x = lerp(x, tx, .14); y = lerp(y, ty, .14); g.style.transform = `translate(${x}px,${y}px)`; if (Math.abs(tx - x) + Math.abs(ty - y) > .5) requestAnimationFrame(step); else run = false; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; g.classList.toggle('on', !e.target.closest('.on-light,.on-concrete,.hero')); if (!run) { run = true; requestAnimationFrame(step); } }, { passive: true });
}

// ---------- reveals ----------
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach((el, i) => { el.style.transitionDelay = ((i % 3) * .07) + 's'; io.observe(el); });
$$('.t-tarmac,.t-patio,.t-land,#sig').forEach(el => io.observe(el));

// ---------- 1 hero ----------
let hero = null;
let blendIdx = 0;
(function heroInit() {
  const dockEl = $('#heroDock'), wrapB = $('#heroBlends');
  BLENDS.forEach((b, i) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-pressed', i === 0); btn.setAttribute('aria-label', b.name);
    btn.style.setProperty('--sw', `radial-gradient(circle at 35% 30%, ${b.c[2]}, ${b.c[0]} 55%, ${b.c[1]})`);
    btn.addEventListener('click', () => { blendIdx = i; $$('button', wrapB).forEach((x, k) => x.setAttribute('aria-pressed', k === i)); hero && hero.setBlend(b.c); cfgSet({ blend: b.id }, false); track('hero_colour', { blend: b.id }); });
    wrapB.append(btn);
  });
  if (!hasGL || /poster/.test(location.search) && !/posterRender/.test(location.search)) return;
  const posterMode = /posterRender/.test(location.search);
  const start = () => import('./hero.js').then(async ({ initHero, prepareHero }) => {
    if (!(await prepareHero())) return;
    let shownFinish = false;
    hero = initHero({
      blend: BLENDS[0].c, poster: posterMode, posterDpr: 2,
      onFirst() { $('#hintTxt').textContent = coarse ? 'Keep swiping' : 'Keep going'; track('hero_interact'); },
      onCoverage(c) { $('#heroPct').textContent = Math.round(c * 100) + '%'; if (c > .12 && !shownFinish) { shownFinish = true; $('#heroFinish').classList.add('show'); } },
      onDone() { $('#doneNote').classList.add('show'); $('#heroFinish').classList.remove('show'); $('#hintTxt').textContent = 'Done. Pick a colour'; track('hero_done'); setTimeout(() => $('#doneNote').classList.remove('show'), 4200); }
    });
    if (!hero) return;
    if (posterMode) { hero.posterFrame(); setTimeout(() => (window.__posterReady = true), 600); return; }
    dockEl.hidden = false;
    $('#hintTxt').textContent = coarse ? 'Swipe across the drive' : 'Move across the drive';
    $('#heroFinish').addEventListener('click', () => { hero.finish(); track('hero_finish'); });
    if (!reduce) setTimeout(() => hero.demo(coarse ? 2000 : 1700), 450);
  }).catch(e => console.warn(e));
  // let the poster paint first (LCP), then swap in the live scene
  if (document.readyState === 'complete') idle(start); else addEventListener('load', () => idle(start));
})();

// ---------- 2 trust ticker ----------
(() => { const b = $('.tick'); if (!b || reduce) return; new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); const t0 = performance.now(); (function f(t) { const k = clamp((t - t0) / 1400, 0, 1); b.textContent = Math.round(40 * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(f); })(t0); }).observe(b); })();

// ---------- 3 services ----------
const JOBS = {};
fetch('/img/jobs.json').then(r => r.json()).then(j => j.forEach(x => JOBS[x.slug] = x)).catch(() => { });
const PANELS = {
  resin: { t: 'Resin drives', img: 'resin-silver', p: 'Resin bound and resin bonded surfacing in a wide choice of colours and natural aggregate blends.', l: ['Resin bound: stone and resin mixed before laying, for a smooth finish with no loose stones', 'Permeable, so water drains through instead of running off', 'Contrasting block borders, edging and inlays', 'Resin bonded also available'], href: '/services/resin-drives/', s: 'resin' },
  block: { t: 'Block paving', img: 'block-red-herringbone', p: 'New concrete block or reclaimed brick for drives, patios and paths.', l: ['Herringbone, basketweave and stretcher bond', 'Decorative borders and edging', 'Low maintenance and easy to repair', 'Steps and features in matching blocks'], href: '/services/block-paving/', s: 'block' },
  tarmac: { t: 'Tarmac driveways', img: 'tarmac-red-edge', p: 'A practical, cost-effective drive for homes and commercial sites.', l: ['Black or red tarmac', 'Block edging to finish the borders', 'New drives and resurfacing', 'Car parks and shared drives'], href: '/services/tarmac-driveways/', s: 'tarmac' },
  patio: { t: 'Patios and paths', img: 'patio-raised', p: 'Patios and garden paths laid level, with the drainage thought through.', l: ['Porcelain, sandstone and slate', 'Decorative borders and edging', 'Paths that join the house, patio and garden', 'Raised beds and walling to match'], href: '/services/patios/', s: 'porcelain' },
  land: { t: 'Landscaping', img: 'resin-path-curve', p: 'Hard and soft landscaping to finish the outside of your home.', l: ['Fencing, decking, retaining walls and steps', 'Turf, raised beds and planters', 'Ponds and water features', 'Rotavating and ground preparation'], href: '/services/hard-landscaping/', s: null },
};
(() => {
  const dlg = $('#panel');
  $$('.tile').forEach(t => t.addEventListener('click', () => {
    const P = PANELS[t.dataset.panel]; $('#panelH').textContent = P.t; $('#panelP').textContent = P.p;
    $('#panelL').innerHTML = P.l.map(x => `<li>${x}</li>`).join('');
    const im = $('#panelImg'); im.src = `/img/${P.img}-1280a.webp`; im.alt = P.t + ': a Newpave job';
    $('#panelLink').href = P.href; $('#panelLink').textContent = 'More about ' + P.t.toLowerCase();
    $('#panelDesign').style.display = P.s ? '' : 'none'; $('#panelDesign').onclick = () => { if (P.s) cfgSet({ surface: P.s }); };
    dlg.showModal(); lenis && lenis.stop(); track('service_open', { service: t.dataset.panel });
  }));
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  dlg.addEventListener('close', () => lenis && lenis.start());

  // resin tile: magnifier lens over a live aggregate texture
  const rt = $('.t-resin'), lens = $('.lens', rt);
  let lensReady = false;
  const lensTex = () => { if (lensReady) return; lensReady = true; lens.style.backgroundImage = `url(${T.url(T.aggregate(BLENDS[1].c, 300, 9, 21))})`; };
  const moveLens = (x, y, r) => { lens.style.transform = `translate(${x - 75}px,${y - 75}px)`; lens.style.backgroundPosition = `${-x * .6}px ${-y * .6}px`; };
  rt.addEventListener('pointerenter', () => { lensTex(); rt.classList.add('lensing'); });
  rt.addEventListener('pointerleave', () => rt.classList.remove('lensing'));
  rt.addEventListener('pointermove', e => { const r = rt.getBoundingClientRect(); moveLens(e.clientX - r.left, e.clientY - r.top); });
  if (coarse && !reduce) new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { rt.classList.remove('lensing'); return; }
    lensTex(); rt.classList.add('lensing'); const t0 = performance.now(); const r = rt.getBoundingClientRect();
    (function f(t) { if (!rt.classList.contains('lensing')) return; const k = (t - t0) / 3000; moveLens(r.width * (.5 + .32 * Math.cos(k * 2)), r.height * (.4 + .18 * Math.sin(k * 3)), r); requestAnimationFrame(f); })(t0);
  }, { threshold: .5 }).observe(rt);

  // block tile: herringbone laid block by block as you scroll
  const cv = $('#herring'), tile = $('.t-block'); const ctx = cv.getContext('2d');
  let blocks = [], W = 0, H = 0, dpr = 1, drawn = -1;
  const COLS = [[138, 75, 51], [120, 64, 44], [158, 92, 64], [107, 58, 42]];
  function layout() {
    const r = tile.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; const w = Math.max(18, W / 22), L = w * 2; blocks = [];
    let seed = 7; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    for (let k = -30; k < 60; k++) for (let i = -30; i < 30; i++) {
      const ox = k * w + i * 2 * w, oy = k * w - i * 2 * w;
      for (const [x, y, bw, bh] of [[ox, oy, L, w], [ox, oy + w, w, L]]) {
        if (x > W + 4 || y > H + 4 || x + bw < -4 || y + bh < -4) continue;
        const cx = (x + bw / 2) / W, cy = (y + bh / 2) / H;
        blocks.push({ x, y, w: bw, h: bh, c: COLS[Math.floor(rnd() * 4)], k: .85 + rnd() * .3, o: clamp(cx * .55 + (1 - cy) * .35 + rnd() * .1, 0, 1) });
      }
    }
    blocks.sort((a, b) => a.o - b.o); drawn = -1;
  }
  function draw(p) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#b5a07a'; ctx.fillRect(0, 0, W, H);
    // sand bed with screed lines
    ctx.fillStyle = 'rgba(0,0,0,.05)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 1);
    const n = blocks.length;
    blocks.forEach((b, i) => {
      const t = clamp(p * 1.25 * n - i * 1, 0, 14) / 14; // each block settles over a short window
      if (t <= 0) return;
      const e = 1 - Math.pow(1 - t, 4); const lift = (1 - e) * 26; const s = 1 + (1 - e) * .08;
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2 - lift;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      if (t < 1) { ctx.fillStyle = `rgba(0,0,0,${.25 * (1 - e)})`; ctx.fillRect(-b.w / 2 + 4, -b.h / 2 + 8 + lift * .4, b.w, b.h); }
      ctx.globalAlpha = Math.min(1, t * 3);
      ctx.fillStyle = `rgb(${b.c.map(v => v * b.k | 0)})`; ctx.fillRect(-b.w / 2 + 1, -b.h / 2 + 1, b.w - 2, b.h - 2);
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-b.w / 2 + 1, -b.h / 2 + 1, b.w - 2, 2);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-b.w / 2 + 1, b.h / 2 - 3, b.w - 2, 2);
      ctx.restore();
    });
  }
  layout(); addEventListener('resize', () => { layout(); drawn = -1; tick(); });
  let on = false;
  function tick() {
    const r = tile.getBoundingClientRect(); const vh = innerHeight;
    const p = reduce ? 1 : clamp((vh - r.top) / (vh * .85 + r.height * .3), 0, 1);
    const q = Math.round(p * 400); if (q !== drawn) { drawn = q; draw(p); }
    if (on) requestAnimationFrame(tick);
  }
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) tick(); }, { rootMargin: '100px' }).observe(tile);
  draw(0);
})();

// ---------- 4 layers ----------
(() => {
  const sec = $('#layers'), stack = $('#stack'), lays = $$('.lay', stack), steps = $$('.lstep'), bars = $$('.lbar i'), tags = $$('.ltag');
  let surface = 'resin';
  const texFor = () => [T.soil(256), T.geotextile(256), T.mot(256), surface === 'resin' ? T.basecourse(256) : T.sand(256), surface === 'resin' ? T.aggregate(BLENDS[blendIdx].c, 320, 8, 4) : T.blocks('herringbone', BLOCK_COLOURS[0].c, 320)].map(T.url);
  let textured = false;
  const paint = () => { const u = texFor(); lays.forEach((l, i) => l.style.backgroundImage = `url(${u[i]})`); textured = true; };
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { paint(); o.disconnect(); } }, { rootMargin: '600px' }).observe(sec);
  $$('.ltoggle button').forEach(b => b.addEventListener('click', () => {
    surface = b.dataset.ls; $$('.ltoggle button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('.lstep [data-alt]').forEach(el => { const cur = el.textContent; el.textContent = el.dataset.alt; el.dataset.alt = cur; });
    tags[3].textContent = surface === 'resin' ? 'Base course' : 'Sharp sand'; paint(); track('layers_toggle', { surface });
  }));
  const ARR = [-1, .1, .26, .42, .58];
  const mobile = () => innerWidth < 860;
  let lastP = -1;
  function frame() {
    const r = sec.getBoundingClientRect(); const total = r.height - innerHeight; const p = clamp(-r.top / total, 0, 1);
    if (Math.abs(p - lastP) < .0005) return; lastP = p;
    const explode = p < .8 ? Math.min(1, p / .1) : lerp(1, .12, clamp((p - .8) / .15, 0, 1));
    const gap = mobile() ? 26 : 58;
    lays.forEach((l, i) => {
      const a = ARR[i]; const k = a < 0 ? 1 : clamp((p - a) / .08, 0, 1); const e = 1 - Math.pow(1 - k, 3);
      const z = i * 14 + i * gap * explode + (1 - e) * (mobile() ? 120 : 300);
      l.style.transform = `translateZ(${z}px)`; l.style.opacity = a < 0 ? 1 : e;
      const show = (a < 0 || e > .6) && explode > .5 && !mobile();
      tags[i].classList.toggle('on', show);
      if (show) { const lr = l.getBoundingClientRect(), ir = $('.iso').getBoundingClientRect(); tags[i].style.transform = `translate(${lr.right - ir.left + 6}px,${lr.top - ir.top + lr.height * .4}px)`; }
    });
    stack.style.transform = `rotateX(${58 - p * 6}deg) rotateZ(${-34 + p * 12}deg)`;
    const s = p < .1 ? 0 : p < .26 ? 1 : p < .42 ? 2 : p < .58 ? 3 : 4;
    steps.forEach((x, i) => x.classList.toggle('on', i === s));
    bars.forEach((x, i) => x.style.setProperty('--p', i < s ? 1 : i === s ? 1 : 0));
  }
  let on = false;
  new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) loop(); }).observe(sec);
  function loop() { if (!on) return; frame(); requestAnimationFrame(loop); }
  frame();
})();

// ---------- 5 configurator ----------
const cfgState = Object.assign({ surface: 'resin', blend: 'silver', pattern: 'herringbone', bcol: 'brindle', tcol: 'black', tedge: true, pcol: 'grey', m2: 32, size: 'two', extras: {} }, store.get('np-cfg') || {});
let cfg3d = null; let cfgTouched = false;
const surfName = id => SURFACES.find(s => s.id === id).name;
function lookName(s = cfgState) {
  if (s.surface === 'resin') return BLENDS.find(b => b.id === s.blend).name;
  if (s.surface === 'block') return `${PATTERNS.find(p => p.id === s.pattern).name}, ${BLOCK_COLOURS.find(b => b.id === s.bcol).name.toLowerCase()}`;
  if (s.surface === 'tarmac') return (s.tcol === 'red' ? 'Red' : 'Black') + (s.tedge ? ', block edging' : '');
  return PORCELAIN.find(p => p.id === s.pcol).name;
}
function priceRange(s = cfgState) {
  const r = RATES[s.surface]; let lo = r[0] * s.m2, hi = r[1] * s.m2;
  if (s.surface === 'tarmac' && s.tedge && !s.extras.edging) { const q = EXTRAS.edging.qty(s.m2); lo += q * EXTRAS.edging.range[0]; hi += q * EXTRAS.edging.range[1]; }
  for (const [k, on] of Object.entries(s.extras)) { if (!on) continue; const x = EXTRAS[k]; const q = x.per === 'm' ? x.qty(s.m2) : x.per === 'm²' ? s.m2 : 1; lo += q * x.range[0]; hi += q * x.range[1]; }
  return [lo, hi];
}
function swatchCss(id, kind) {
  const list = kind === 'resin' ? BLENDS : kind === 'block' ? BLOCK_COLOURS : PORCELAIN; const c = list.find(x => x.id === id).c;
  return kind === 'resin' ? `radial-gradient(circle at 30% 30%, ${c[2]} 0 12%, transparent 13%), radial-gradient(circle at 70% 60%, ${c[1]} 0 16%, transparent 17%), radial-gradient(circle at 40% 75%, ${c[2]} 0 10%, transparent 11%), ${c[0]}` : `linear-gradient(135deg, ${c[2]}, ${c[0]} 50%, ${c[1]})`;
}
function designSummary() { return `${surfName(cfgState.surface)}, ${lookName()}, about ${cfgState.m2} m²`; }
function renderCfg() {
  const s = cfgState;
  $('#cfgSurf').innerHTML = SURFACES.map(x => `<button type="button" data-v="${x.id}" aria-pressed="${s.surface === x.id}"><i style="background:${x.id === 'resin' ? swatchCss(s.blend, 'resin') : x.id === 'block' ? swatchCss(s.bcol, 'block') : x.id === 'tarmac' ? (s.tcol === 'red' ? '#5a2722' : '#202022') : swatchCss(s.pcol, 'porcelain')}"></i>${x.short}</button>`).join('');
  let look = '';
  if (s.surface === 'resin') look = `<div class="swatches" role="group" aria-label="Resin blend">${BLENDS.map(b => `<button type="button" data-k="blend" data-v="${b.id}" aria-pressed="${s.blend === b.id}" aria-label="${b.name}" style="background:${swatchCss(b.id, 'resin')}"></button>`).join('')}</div>`;
  if (s.surface === 'block') look = `<div class="opt2" role="group" aria-label="Pattern" style="margin-bottom:10px">${PATTERNS.map(p => `<button type="button" data-k="pattern" data-v="${p.id}" aria-pressed="${s.pattern === p.id}">${p.name}</button>`).join('')}</div><div class="swatches" role="group" aria-label="Block colour">${BLOCK_COLOURS.map(b => `<button type="button" data-k="bcol" data-v="${b.id}" aria-pressed="${s.bcol === b.id}" aria-label="${b.name}" style="background:${swatchCss(b.id, 'block')}"></button>`).join('')}</div>`;
  if (s.surface === 'tarmac') look = `<div class="opt2" role="group" aria-label="Tarmac colour">${['black', 'red'].map(c => `<button type="button" data-k="tcol" data-v="${c}" aria-pressed="${s.tcol === c}">${c === 'red' ? 'Red' : 'Black'} tarmac</button>`).join('')}</div><div class="opt2" role="group" aria-label="Edging" style="margin-top:6px"><button type="button" data-k="tedge" data-v="1" aria-pressed="${s.tedge}">With block edging</button><button type="button" data-k="tedge" data-v="0" aria-pressed="${!s.tedge}">No edging</button></div>`;
  if (s.surface === 'porcelain') look = `<div class="swatches" role="group" aria-label="Porcelain colour">${PORCELAIN.map(b => `<button type="button" data-k="pcol" data-v="${b.id}" aria-pressed="${s.pcol === b.id}" aria-label="${b.name}" style="background:${swatchCss(b.id, 'porcelain')}"></button>`).join('')}</div>`;
  $('#cfgLook').innerHTML = look + `<p class="look-name">Selected: <b>${lookName()}</b></p>`;
  $('#cfgSize').innerHTML = SIZES.map(z => `<button type="button" data-v="${z.id}" aria-pressed="${s.size === z.id}">${z.label}</button>`).join('');
  $('#cfgM2').value = s.m2;
  $('#cfgExtras').innerHTML = Object.entries(EXTRAS).map(([k, x]) => `<label><input type="checkbox" data-x="${k}" ${s.extras[k] ? 'checked' : ''}>${x.label}</label>`).join('');
  $('#cfgBadge').textContent = `${surfName(s.surface)}, ${lookName()}`;
  updatePrice();
}
let shown = [0, 0];
function updatePrice() {
  const [lo, hi] = priceRange(); const from = shown.slice(); const t0 = performance.now();
  const el = $('#cfgPrice'), elm = $('#cfgPriceM');
  const fmt = (a, b) => `${gbp(a)} to ${gbp(b)}`;
  if (reduce) { el.textContent = fmt(lo, hi); elm.textContent = gbp(lo) + '+'; shown = [lo, hi]; return; }
  (function f(t) { const k = clamp((t - t0) / 650, 0, 1), e = 1 - Math.pow(1 - k, 4); const a = lerp(from[0], lo, e), b = lerp(from[1], hi, e); el.textContent = fmt(a, b); elm.textContent = gbp(a) + '+'; if (k < 1) requestAnimationFrame(f); else shown = [lo, hi]; })(t0);
}
function cfgSet(patch, scroll = false) {
  Object.assign(cfgState, patch); store.set('np-cfg', cfgState); cfgTouched = true;
  renderCfg(); cfg3d && cfg3d.set(cfgState); syncDesignCard();
  if (patch.blend && hero) { const i = BLENDS.findIndex(b => b.id === patch.blend); if (i !== blendIdx) { blendIdx = i; hero.setBlend(BLENDS[i].c); $$('#heroBlends button').forEach((x, k) => x.setAttribute('aria-pressed', k === i)); } }
}
(() => {
  renderCfg();
  $('#cfgSurf').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cfgSet({ surface: b.dataset.v }); track('cfg_surface', { surface: b.dataset.v }); } });
  $('#cfgLook').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k; let v = b.dataset.v; if (k === 'tedge') v = v === '1'; cfgSet({ [k]: v }); });
  $('#cfgSize').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const z = SIZES.find(x => x.id === b.dataset.v); cfgSet({ size: z.id, m2: z.m2 }); });
  $('#cfgM2').addEventListener('input', e => { const v = clamp(parseInt(e.target.value) || 0, 5, 2000); Object.assign(cfgState, { m2: v, size: (SIZES.find(z => z.m2 === v) || {}).id || '' }); $$('#cfgSize button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === cfgState.size)); store.set('np-cfg', cfgState); updatePrice(); cfg3d && cfg3d.set(cfgState); syncDesignCard(); });
  $('#cfgExtras').addEventListener('change', e => { const x = e.target.dataset.x; if (x) { cfgState.extras = { ...cfgState.extras, [x]: e.target.checked }; cfgSet({}); } });
  $('#cfgBook').addEventListener('click', () => { cfgTouched = true; bk.fromDesign = true; syncDesignCard(); track('design_to_booking', { design: designSummary() }); });
  // 3D: load three.js only when the designer is near
  const view = $('#cfgView');
  if (!hasGL) return;
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    import('./config3d.js').then(m => { cfg3d = m.createScene(view, { tex: T, BLENDS, BLOCK_COLOURS, PORCELAIN, onReady() { view.classList.add('live'); } }); cfg3d && cfg3d.set(cfgState); }).catch(err => console.warn('3d', err));
  }, { rootMargin: '500px' }).observe(view);
})();

// ---------- 6 work corridor ----------
const WORK = [
  ['resin-amber', 'Amber resin drive', 'Resin bound'], ['block-red-herringbone', 'Red herringbone drive', 'Block paving'], ['tarmac-double', 'Tarmac to a double garage', 'Tarmac'],
  ['resin-diamond', 'Resin with a diamond inlay', 'Resin bound'], ['block-grey-step', 'Grey herringbone and step', 'Block paving'], ['patio-raised', 'Patio with raised bed', 'Patio'],
  ['resin-silver', 'Silver resin, black border', 'Resin bound'], ['tarmac-red-edge', 'Tarmac with red edging', 'Tarmac'], ['block-step', 'Curved front step', 'Block paving'],
  ['resin-bungalow', 'Resin drive to a bungalow', 'Resin bound'], ['block-charcoal', 'Charcoal block drive', 'Block paving'], ['patio-brick-edge', 'Buff patio, brick edge', 'Patio'],
  ['tarmac-lane', 'Shared drive in tarmac', 'Tarmac'], ['resin-red', 'Red-toned resin drive', 'Resin bound'],
];
(() => {
  const sec = $('#work'), corr = $('#corr'); const n = WORK.length; $('#workT').textContent = String(n).padStart(2, '0');
  const dims = { 'resin-silver': [828, 1088], 'tarmac-lane': [768, 1024], 'patio-raised': [1600, 900], 'block-grey-step': [1561, 1008], 'block-charcoal': [2560, 1920], 'block-step': [2800, 2100] };
  const frames = WORK.map(([k, t, s], i) => {
    const [w, h] = dims[k] || [800, 600]; const portrait = h > w;
    const f = document.createElement('div'); f.className = 'frame'; f.style.setProperty('--w', portrait ? '22vw' : '34vw');
    f.innerHTML = `<picture><source type="image/avif" data-srcset="/img/${k}-640a.avif 640w, /img/${k}-1280a.avif 1280w" sizes="(max-width:760px) 80vw, 34vw"><img data-src="/img/${k}-1280a.webp" data-srcset="/img/${k}-640a.webp 640w, /img/${k}-1280a.webp 1280w" sizes="(max-width:760px) 80vw, 34vw" alt="${t}, a Newpave ${s.toLowerCase()} job" width="${w}" height="${h}" decoding="async" loading="lazy"></picture><div class="fc"><b>${t}</b><span>${s}</span></div>`;
    f.dataset.k = k; f.dataset.cap = `${t}. ${s}.`; f.tabIndex = 0; f.setAttribute('role', 'button'); f.setAttribute('aria-label', `Open photo: ${t}`); corr.append(f); return f;
  });
  const D = 1150; const loaded = new Set();
  const swipe = () => innerWidth <= 760;
  function setMode() { sec.classList.toggle('swipe', swipe()); }
  setMode(); addEventListener('resize', setMode);
  function load(i) { if (loaded.has(i) || i >= n) return; loaded.add(i); const f = frames[i]; $$('[data-srcset]', f).forEach(s => s.srcset = s.dataset.srcset); const im = $('img', f); im.src = im.dataset.src; }
  corr.addEventListener('scroll', () => { if (!swipe()) return; const i = Math.round(corr.scrollLeft / (frames[0].offsetWidth + 10)); for (let k = i; k < i + 3; k++) load(k); $('#workN').textContent = String(Math.min(n, i + 1)).padStart(2, '0'); }, { passive: true });
  function frame() {
    const r = sec.getBoundingClientRect(); const total = r.height - innerHeight; const p = clamp(-r.top / total, 0, 1);
    const camZ = p * (n - 1) * D - 250; let nearest = 0, nd = 1e9;
    frames.forEach((f, i) => {
      const side = i % 2 ? 1 : -1; const x = side * 18 + Math.sin(i * 1.7) * 3; const y = Math.cos(i * 1.3) * 6;
      const z = -i * D + camZ;
      if (z < -5 * D || z > 900) { f.style.visibility = 'hidden'; return; }
      if (z > -4 * D) load(i);
      f.style.visibility = 'visible';
      f.style.opacity = z < -3.6 * D ? 0 : z < -2.6 * D ? (z + 3.6 * D) / D : z > 160 ? clamp(1 - (z - 160) / 300, 0, 1) : 1;
      f.style.transform = `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), ${z}px) rotateY(${-side * 14}deg)`;
      if (Math.abs(z) < nd) { nd = Math.abs(z); nearest = i; }
    });
    $('#workN').textContent = String(nearest + 1).padStart(2, '0');
    $('.work-title').style.opacity = clamp(1 - p * 9, 0, 1);
  }
  let on = false;
  new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on) { load(0); load(1); load(2); loop(); } }, { rootMargin: '400px' }).observe(sec);
  function loop() { if (!on) return; if (!swipe()) frame(); requestAnimationFrame(loop); }
  const lb = $('#lb'), lbImg = $('img', lb), lbCap = $('p', lb);
  const open = f => { lbImg.src = `/img/${f.dataset.k}-1280a.webp`; lbImg.alt = f.dataset.cap; lbCap.textContent = f.dataset.cap; lb.classList.add('open'); lenis && lenis.stop(); $('button', lb).focus(); track('gallery_open', { photo: f.dataset.k }); };
  corr.addEventListener('click', e => { const f = e.target.closest('.frame'); if (f) open(f); });
  corr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const f = e.target.closest('.frame'); if (f) { e.preventDefault(); open(f); } } });
  const close = () => { lb.classList.remove('open'); lenis && lenis.start(); };
  $('button', lb).addEventListener('click', close); lb.addEventListener('click', e => { if (e.target === lb) close(); }); addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ---------- 8 timeline ----------
(() => {
  const tl = $('#tl'), steps = $$('.tstep', tl); let on = false;
  function f() { const r = tl.getBoundingClientRect(); const vh = innerHeight; const p = reduce ? 1 : clamp((vh * .78 - r.top) / (r.height + vh * .1), 0, 1); tl.style.setProperty('--tp', p); steps.forEach((s, i) => s.classList.toggle('lit', p >= i / steps.length + .02)); if (on) requestAnimationFrame(f); }
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) f(); }).observe(tl);
})();

// ---------- 10 testimonials (hidden until Charles confirms) ----------
if (SITE.showTestimonials) $('#testimonials').innerHTML = `<div style="margin-top:30px;display:grid;gap:14px">${TESTIMONIALS.map(t => `<blockquote style="margin:0;padding:18px;border-radius:14px;background:#fff"><p>${t.text}</p><footer style="margin-top:8px;font-weight:700">${t.name}, ${t.job}</footer></blockquote>`).join('')}</div>`;
if (SITE.googleReview) $('#reviewLink').href = SITE.googleReview;

// ---------- 11 dotted map ----------
(() => {
  // rough outlines (lon/lat) of Shropshire + West Midlands; dots fill them
  const SHROP = [[-3.23, 52.86], [-2.95, 53.0], [-2.7, 52.99], [-2.38, 52.99], [-2.32, 52.9], [-2.24, 52.75], [-2.3, 52.6], [-2.24, 52.45], [-2.4, 52.38], [-2.52, 52.33], [-2.75, 52.37], [-3.0, 52.34], [-3.2, 52.45], [-3.1, 52.55], [-3.15, 52.68]];
  const WMID = [[-2.22, 52.66], [-1.95, 52.68], [-1.78, 52.62], [-1.68, 52.52], [-1.5, 52.47], [-1.6, 52.38], [-1.85, 52.38], [-2.05, 52.43], [-2.2, 52.47], [-2.26, 52.55]];
  const TOWNS = [['Telford', -2.449, 52.677, 1], ['Wolverhampton', -2.128, 52.586, 1], ['Birmingham', -1.89, 52.486, 1]];
  const BASE = ['Donnington', -2.428, 52.711];
  const W = 560, H = 480, lon0 = -3.3, lon1 = -1.4, lat0 = 52.28, lat1 = 53.05;
  const px = (lo, la) => [(lo - lon0) / (lon1 - lon0) * W, (1 - (la - lat0) / (lat1 - lat0)) * H];
  const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  let dots = ''; const step = 11;
  for (let y = 4; y < H; y += step) for (let x = 4; x < W; x += step) {
    const lo = lon0 + x / W * (lon1 - lon0), la = lat0 + (1 - y / H) * (lat1 - lat0);
    const s = inside([lo, la], SHROP), w = inside([lo, la], WMID);
    if (s || w) dots += `<circle cx="${x}" cy="${y}" r="${w ? 2.6 : 2.1}" fill="${w ? 'rgba(242,106,27,.55)' : 'rgba(240,236,229,.32)'}"/>`;
    else dots += `<circle cx="${x}" cy="${y}" r="1" fill="rgba(240,236,229,.07)"/>`;
  }
  const [bx, by] = px(BASE[1], BASE[2]);
  let towns = TOWNS.map(([n, lo, la]) => { const [x, y] = px(lo, la); return `<g class="town"><line x1="${bx}" y1="${by}" x2="${x}" y2="${y}" stroke="rgba(242,106,27,.4)" stroke-dasharray="3 4"/><circle class="halo" cx="${x}" cy="${y}" r="9"/><circle class="pin" cx="${x}" cy="${y}" r="5"/><text x="${x + 12}" y="${y + 4}">${n}</text></g>`; }).join('');
  const [sx, sy] = px(-2.95, 52.55), [wx, wy] = px(-1.72, 52.42);
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="presentation">${dots}${towns}<g class="town"><circle cx="${bx}" cy="${by}" r="7" fill="#f3f3f1"/><circle cx="${bx}" cy="${by}" r="3" fill="#131211"/><text x="${bx + 12}" y="${by - 8}">Newpave, Donnington</text></g><text class="rg" x="${sx}" y="${sy}">Shropshire</text><text class="rg" x="${wx}" y="${wy}">West Midlands</text></svg>`;
  $('#map').innerHTML = svg;
})();

// ---------- postcode helpers ----------
function pcArea(v) { const m = String(v).toUpperCase().replace(/\s+/g, '').match(/^([A-Z]{1,2})\d/); if (!m) return null; const a = m[1]; return AREA_PREFIXES[a] ? { ok: true, town: AREA_PREFIXES[a] } : { ok: false }; }
$('#pcForm').addEventListener('submit', () => { const r = pcArea($('#pcIn').value); $('#pcOut').textContent = !r ? 'Enter a full postcode, like TF2 7QT.' : r.ok ? `Great, we cover ${r.town}. Book your free survey below.` : `That's outside our usual area, but ask anyway. We'll let you know if we can help.`; if (r) track('postcode_check', { ok: r.ok }); });

// ---------- map embed (click to load, keeps the page fast) ----------
$('#mapBtn').addEventListener('click', () => { $('#mapwrap').innerHTML = `<iframe title="Map: Newpave Ltd, 39 Barn Close, Donnington, Telford, Shropshire TF2 7QT" src="https://www.google.com/maps?q=39+Barn+Close,+Donnington,+Telford,+Shropshire+TF2+7QT&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`; });

// ---------- 13 booking flow ----------
const bk = { step: 0, photo: null, fromDesign: false };
function syncDesignCard() {
  const on = bk.fromDesign && cfgTouched; $('#bkDesign').classList.toggle('on', on); $('#bkSvc').style.display = on ? 'none' : '';
  if (on) { $('#bkDesignT').textContent = `${surfName(cfgState.surface)}, ${lookName()}`; const [lo, hi] = priceRange(); $('#bkDesignS').innerHTML = `About ${cfgState.m2} m², example ${gbp(lo)} to ${gbp(hi)}. <a href="#design">Change</a>`; const s = cfgState.surface; $('#bkDesignSw').style.background = s === 'resin' ? swatchCss(cfgState.blend, 'resin') : s === 'block' ? swatchCss(cfgState.bcol, 'block') : s === 'tarmac' ? (cfgState.tcol === 'red' ? '#5a2722' : '#202022') : swatchCss(cfgState.pcol, 'porcelain'); }
}
(() => {
  const form = $('#bk'), steps = $$('.bstep', form), N = steps.length;
  // next 7 days (from tomorrow)
  const days = $('#bkDays'); const fmtD = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }), fmtN = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
  for (let i = 1; i <= 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); const v = d.toISOString().slice(0, 10); days.insertAdjacentHTML('beforeend', `<label><input type="radio" name="day" value="${v}">${fmtD.format(d)}<small>${fmtN.format(d)}</small></label>`); }
  const err = $('#bkErr');
  function show(i) {
    bk.step = i; steps.forEach((s, k) => s.classList.toggle('on', k === i));
    $('#bkCount').textContent = `Step ${i + 1} of ${N}`; $('#bkProg').style.setProperty('--bp', ((i + 1) / (N + 1) * 100) + '%');
    $('#bkBack').hidden = i === 0; $('#bkSkip').hidden = i !== 2;
    $('#bkNext').innerHTML = i === N - 1 ? 'Book my free survey <svg aria-hidden="true"><use href="#i-arrow"/></svg>' : 'Continue <svg aria-hidden="true"><use href="#i-arrow"/></svg>';
    err.textContent = ''; track('booking_step', { step: i + 1 });
  }
  function valid(i) {
    const fd = new FormData(form);
    if (i === 0 && !(bk.fromDesign && cfgTouched) && !fd.get('service')) return 'Pick what you need.';
    if (i === 1 && !pcArea(fd.get('postcode'))) return 'Enter your postcode, like TF2 7QT.';
    if (i === 3 && !fd.get('day')) return 'Pick a day.';
    if (i === 3 && !fd.get('slot')) return 'Pick a time of day.';
    if (i === 4) { if (!String(fd.get('name')).trim()) return 'Add your name.'; if (String(fd.get('phone')).replace(/\D/g, '').length < 10) return 'Add a mobile number so Charles can reply.'; const em = String(fd.get('email')).trim(); if (em && !/^\S+@\S+\.\S+$/.test(em)) return 'Check your email, or leave it blank.'; }
    return '';
  }
  // service tiles advance on tap
  $('#bkSvc').addEventListener('change', () => setTimeout(() => !valid(0) && show(1), 180));
  $('.slots').addEventListener('change', () => { if (new FormData(form).get('day')) setTimeout(() => show(4), 220); });
  $('#bkPc').addEventListener('input', e => {
    const r = pcArea(e.target.value), out = $('#bkPcRes');
    out.className = 'pc-res' + (r ? (r.ok ? ' ok' : ' out') : '');
    out.innerHTML = !r ? '' : r.ok ? `<svg aria-hidden="true"><use href="#i-check"/></svg>Great, we cover ${r.town}.` : `We'll let you know if we can help.`;
  });
  // photo: downscale on the device
  $('#bkFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const bmp = await createImageBitmap(f); const s = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      bk.photo = c.toDataURL('image/jpeg', .72);
      $('#bkDropT').innerHTML = `<img src="${bk.photo}" alt="Your photo"><br><b>Photo added</b> (${Math.round(bk.photo.length * .75 / 1024)} KB). Tap to change.`;
    } catch { $('#bkDropT').textContent = 'That photo could not be read. Try another, or skip.'; }
  });
  $('#bkBack').addEventListener('click', () => show(Math.max(0, bk.step - 1)));
  $('#bkSkip').addEventListener('click', () => show(3));
  form.addEventListener('submit', async e => {
    e.preventDefault(); const m = valid(bk.step); if (m) { err.textContent = m; return; }
    if (bk.step < N - 1) { show(bk.step + 1); const f = $('.bstep.on input:not([type=radio]):not([type=file])', form); f && !coarse && f.focus(); return; }
    const fd = Object.fromEntries(new FormData(form)); delete fd.photo;
    const design = bk.fromDesign && cfgTouched ? designSummary() : '';
    const [lo, hi] = design ? priceRange() : [0, 0];
    const day = fd.day ? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(fd.day)) : '';
    const area = pcArea(fd.postcode);
    const lead = { subject: 'New survey request from the website', name: fd.name, phone: fd.phone, email: fd.email || '', service: design ? 'Design: ' + design : fd.service, example_range: design ? `${gbp(lo)} to ${gbp(hi)}` : '', postcode: String(fd.postcode).toUpperCase(), in_area: area && area.ok ? 'yes' : 'no', preferred_day: day, preferred_time: fd.slot, photo: bk.photo ? 'attached' : 'none' };
    $('#bkNext').disabled = true;
    if (SITE.formEndpoint) { try { await fetch(SITE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...lead, photo_data: bk.photo || '' }) }); } catch { } }
    const msg = `Hi Charles, I've just booked a free survey on your website.\n\n${design ? 'My design: ' + design + ` (example ${gbp(lo)} to ${gbp(hi)})` : 'I need: ' + fd.service}\nPostcode: ${lead.postcode}\nBest time: ${day}, ${String(fd.slot).toLowerCase()}\nName: ${fd.name}\nMobile: ${fd.phone}${fd.email ? '\nEmail: ' + fd.email : ''}${bk.photo ? '\n\nI can send a photo of my drive here too.' : ''}`;
    $('#bkWa').href = wa(msg); $('#bkDoneName').textContent = String(fd.name).trim().split(' ')[0];
    steps.forEach(s => s.classList.remove('on')); $('#bkNav').style.display = 'none'; err.textContent = '';
    $('.bk-top', form).style.visibility = 'hidden'; $('#bkProg').style.setProperty('--bp', '100%');
    $('#bkDone').classList.add('on'); track('survey_booked', { service: lead.service, in_area: lead.in_area });
  });
  // arriving from a service page (?service=resin)
  const q = new URLSearchParams(location.search).get('service');
  const map = { resin: 'Resin drive', block: 'Block paving', tarmac: 'Tarmac drive', patio: 'Patio or path', landscaping: 'Landscaping', emergency: 'Emergency repair' };
  if (q && map[q]) { const r = $(`#bkSvc input[value="${map[q]}"]`); if (r) r.checked = true; }
  const ds = new URLSearchParams(location.search).get('design');
  if (ds && SURFACES.some(x => x.id === ds)) { Object.assign(cfgState, { surface: ds }); renderCfg(); }
  show(0);
})();
