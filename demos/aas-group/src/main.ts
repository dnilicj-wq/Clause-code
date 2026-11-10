import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { GardenApi, Patio, Lawn, Boundary } from './garden';
import { initForm, setSpecForForm } from './form';

gsap.registerPlugin(ScrollTrigger);
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer:coarse)').matches || innerWidth < 760;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const html = document.documentElement;

// ---------- loader (first visit only, < 1s, never blocks content underneath)
const loader = $('#loader');
if (loader && !html.classList.contains('seen')) setTimeout(() => loader.classList.add('is-done'), 950);

// ---------- smooth scroll
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), touchMultiplier: 1.2 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToEl = (el: Element | null, offset = -70) => { if (!el) return; lenis ? lenis.scrollTo(el as HTMLElement, { offset, duration: 1.3 }) : el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href')!; if (id.length < 2) return;
  const t = $(id); if (!t) return; e.preventDefault(); scrollToEl(id === '#top' ? document.body : t);
}));

// ---------- nav: transparent over the hero, glass after; hides on scroll down
const nav = $('#nav'), dock = $('#dock'), heroEl = $('#hero');
let lastY = 0;
const onScroll = () => {
  const y = scrollY, hh = heroEl.offsetHeight - innerHeight;
  nav.classList.toggle('is-solid', y > hh - 40);
  nav.classList.toggle('is-hidden', y > lastY + 4 && y > hh + 200);
  if (y < lastY - 4) nav.classList.remove('is-hidden');
  dock.classList.toggle('is-on', y > innerHeight * 0.9 && y < document.body.scrollHeight - innerHeight * 1.6);
  lastY = y;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------- HERO: live 3D garden, scrubbed by scroll
const heroCanvas = $<HTMLCanvasElement>('#heroCanvas'), heroStage = $('.hero__stage'), heroCopy = $('#heroCopy');
const planSteps = $$('#planSteps li'), planBar = $('#planBar'), planLvl = $('#planLvl');
let hero: GardenApi | null = null;
const LV = ['+0.00', '+1.05 → 0.00', '−0.20 dig', '+0.90 wall', '−0.20 → −0.07', '±0.00 fall 1:60', '+0.90 lawn', '+0.00'];
const heroProgress = () => clamp(-heroEl.getBoundingClientRect().top / (heroEl.offsetHeight - innerHeight));
function heroUpdate() {
  const q = heroProgress();
  hero?.setBuild(q);
  // copy: visible at the top, fades for the build, returns as the bookend
  const a = 1 - clamp(q / 0.07), b = clamp((q - 0.93) / 0.05);
  heroCopy.style.opacity = String(Math.max(a, b));
  heroCopy.style.transform = `translateY(${(1 - Math.max(a, b)) * 24}px)`;
  heroCopy.style.pointerEvents = Math.max(a, b) > 0.5 ? 'auto' : 'none';
  let on = 0; planSteps.forEach((li, i) => { if (q >= parseFloat(li.dataset.at!)) on = i; });
  if (q > 0.93) on = 0;
  planSteps.forEach((li, i) => li.classList.toggle('is-on', i === on));
  planLvl.textContent = LV[on];
  planBar.style.transform = `scaleX(${clamp((q - 0.06) / 0.88)})`;
}
addEventListener('scroll', heroUpdate, { passive: true }); heroUpdate();
const startHero = async () => {
  if (hero || reduced) return;
  const { initGarden } = await import('./garden');
  hero = initGarden(heroCanvas, heroStage, { mode: 'hero', onReady: () => heroCanvas.classList.add('is-live') });
  heroUpdate();
};
// desktop: as soon as the page has loaded; phones: on first touch or scroll (keeps first paint and Lighthouse lean)
if (coarse) { const go = () => { startHero(); removeEventListener('touchstart', go); removeEventListener('scroll', go); }; addEventListener('touchstart', go, { passive: true, once: true }); addEventListener('scroll', go, { passive: true, once: true }); }
else { const idle = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(startHero, { timeout: 1200 }) : setTimeout(startHero, 300)); document.readyState === 'complete' ? idle() : addEventListener('load', idle); }
if (!coarse) heroStage.addEventListener('pointermove', (e) => { const r = heroStage.getBoundingClientRect(); hero?.setPointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); });

// ---------- CONFIGURATOR
type State = { patio: Patio; tone: number; lawn: Lawn; boundary: Boundary; extras: Record<string, boolean>; size: string };
const st: State = { patio: 'porcelain', tone: 0, lawn: 'turf', boundary: 'featheredge', extras: { lighting: false, steps: true, beds: false }, size: 'Small' };
const NAMES: Record<string, string> = { porcelain: 'Porcelain', stone: 'Natural stone', block: 'Block paving', resin: 'Resin bound', turf: 'Real turf', artificial: 'Artificial grass', featheredge: 'Featheredge fence', composite: 'Composite fence', living: 'Living wall', lighting: 'Lighting', steps: 'Steps', beds: 'Raised beds' };
let TONES: Record<Patio, { name: string; c: string }[]> | null = null;
let studio: GardenApi | null = null;
const tonesEl = $('#tones');
const toneList = () => TONES?.[st.patio] ?? FALLBACK_TONES[st.patio];
const FALLBACK_TONES: Record<Patio, { name: string; c: string }[]> = {
  porcelain: [{ name: 'Light grey', c: '#e9e7e2' }, { name: 'Warm sand', c: '#eadcc2' }, { name: 'Charcoal', c: '#6b6e70' }],
  stone: [{ name: 'Buff sandstone', c: '#e6cfa6' }, { name: 'Autumn brown', c: '#c99a76' }, { name: 'Raj green', c: '#b6b49e' }],
  block: [{ name: 'Charcoal', c: '#5a5b5d' }, { name: 'Brindle', c: '#b07c63' }, { name: 'Silver grey', c: '#c3c2bd' }],
  resin: [{ name: 'Golden quartz', c: '#d9c49a' }, { name: 'Silver grey', c: '#c9c7c1' }, { name: 'Bronze', c: '#a68566' }],
};
function renderTones() {
  tonesEl.innerHTML = '<span>Tone</span>' + toneList().map((t, i) => `<button class="tone${i === st.tone ? ' is-on' : ''}" data-i="${i}" style="background:${t.c}" aria-label="${t.name}" aria-pressed="${i === st.tone}" title="${t.name}"></button>`).join('') + `<span class="tone-name" style="margin-left:6px;color:#45463f">${toneList()[st.tone].name}</span>`;
}
function specRows(s: State): [string, string][] {
  const ex = Object.entries(s.extras).filter(([, v]) => v).map(([k]) => NAMES[k]);
  return [['Patio', `${NAMES[s.patio]}, ${toneList()[s.tone].name.toLowerCase()}`], ['Lawn', NAMES[s.lawn]], ['Boundary', NAMES[s.boundary]], ['Extras', ex.length ? ex.join(', ') : 'None'], ['Rough size', s.size], ['Groundwork', 'Dig-out, levels, sub-base & drainage']];
}
let prevSpec: string[] = [];
function renderSpec() {
  const rows = specRows(st);
  $('#specList').innerHTML = rows.map(([k, v], i) => `<dt>${k}</dt><dd class="${prevSpec[i] && prevSpec[i] !== v ? 'flash' : ''}">${v}</dd>`).join('');
  prevSpec = rows.map((r) => r[1]);
  $('#dimW').textContent = st.size === 'Small' ? '≈ 5 m' : st.size === 'Medium' ? '≈ 9 m' : '≈ 14 m';
  setSpecForForm(rows, st.size);
}
renderTones(); renderSpec();
const zoneBtns = $$<HTMLButtonElement>('.zones button');
zoneBtns.forEach((b) => b.addEventListener('click', () => {
  zoneBtns.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  $$('.pane').forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.zone));
}));
$$('.opts').forEach((grp) => grp.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.opt') as HTMLButtonElement | null; if (!b) return;
  const g = grp.dataset.group!, v = b.dataset.v!;
  if (g === 'extras') {
    st.extras[v] = !st.extras[v]; b.classList.toggle('is-on', st.extras[v]); b.setAttribute('aria-pressed', String(st.extras[v]));
    studio?.setExtra(v as 'lighting', st.extras[v]);
  } else {
    $$('.opt', grp).forEach((x) => x.classList.toggle('is-on', x === b));
    if (g === 'patio') { st.patio = v as Patio; st.tone = 0; renderTones(); studio?.setPatio(st.patio, 0); }
    if (g === 'lawn') { st.lawn = v as Lawn; studio?.setLawn(st.lawn); }
    if (g === 'boundary') { st.boundary = v as Boundary; studio?.setBoundary(st.boundary); }
  }
  renderSpec();
}));
tonesEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.tone') as HTMLButtonElement | null; if (!b) return;
  st.tone = +b.dataset.i!; renderTones(); renderSpec(); studio?.setPatio(st.patio, st.tone);
});
$$('.seg button').forEach((b) => b.addEventListener('click', () => { $$('.seg button').forEach((x) => x.classList.toggle('is-on', x === b)); st.size = b.dataset.v!; renderSpec(); }));
$('#specGo').addEventListener('click', (e) => { e.preventDefault(); (window as any).__aasFromDesign = true; document.dispatchEvent(new CustomEvent('aas:design')); scrollToEl($('#visit')); });

const stage = $('#studioStage'), studioCanvas = $<HTMLCanvasElement>('#studioCanvas');
const startStudio = async () => {
  if (studio) return;
  const mod = await import('./garden');
  TONES = mod.TONES;
  studio = mod.initGarden(studioCanvas, stage, { mode: 'studio', onReady: () => stage.classList.add('is-live') });
  if (!studio) return;
  studio.setPatio(st.patio, st.tone); studio.setLawn(st.lawn); studio.setBoundary(st.boundary);
  Object.entries(st.extras).forEach(([k, v]) => studio!.setExtra(k as 'lighting', v));
};
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { startStudio(); o.disconnect(); } }, { rootMargin: '600px' }).observe(stage);
// drag to look around (horizontal only; vertical drags keep scrolling the page)
{ let x0 = 0, down = false;
  studioCanvas.addEventListener('pointerdown', (e) => { down = true; x0 = e.clientX; });
  addEventListener('pointerup', () => (down = false));
  addEventListener('pointermove', (e) => { if (!down) return; studio?.orbit(e.clientX - x0); x0 = e.clientX; }); }

// ---------- services: stacking cards scale back as the next one arrives
$$('.card-svc').forEach((c, i, all) => {
  c.style.setProperty('--i', String(i));
  if (reduced || i === all.length - 1) return;
  gsap.to(c, { scale: 0.94, filter: 'brightness(.88)', ease: 'none', scrollTrigger: { trigger: all[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
});

// ---------- layers: pinned explode
const layersPin = $('#layersPin'), layersList = $$('#layersList li'), fallTag = $('.layers__fall');
let layersApi: { setProgress: (p: number) => void } | null = null, layerAt: ((p: number) => number) | null = null;
new IntersectionObserver(async (es, o) => {
  if (!es[0].isIntersecting) return; o.disconnect();
  const m = await import('./layers'); layerAt = m.layerAt;
  layersApi = m.initLayers($<HTMLCanvasElement>('#layersCanvas'), layersPin);
}, { rootMargin: '800px' }).observe(layersPin);
ScrollTrigger.create({
  trigger: layersPin, start: 'top top', end: () => '+=' + innerHeight * (reduced ? 0.01 : 2.6), pin: !reduced, pinSpacing: true, anticipatePin: 1,
  onUpdate: (s) => {
    const p = reduced ? 0.5 : s.progress; layersApi?.setProgress(p);
    const at = layerAt ? layerAt(p) : -1;
    layersList.forEach((li) => li.classList.toggle('is-on', +li.dataset.i! === at || (at === 5 && li.dataset.i === '4')));
    fallTag.classList.toggle('is-on', p > 0.66 && p < 0.86);
  },
});

// ---------- before/after drag
const rev = $('#reveal'), range = $<HTMLInputElement>('.reveal-drag__range', rev);
range.addEventListener('input', () => rev.style.setProperty('--x', range.value + '%'));
if (!reduced) gsap.fromTo(range, { value: 78 }, { value: 50, duration: 1.6, ease: 'power3.out', onUpdate: () => rev.style.setProperty('--x', range.value + '%'), scrollTrigger: { trigger: rev, start: 'top 75%' } });

// ---------- work rail: horizontal scroll pinned on desktop, native swipe on phones
const rail = $('#workRail'), workPin = $('#workPin');
if (!coarse && !reduced && innerWidth > 900) {
  gsap.to(rail, { x: () => -(rail.scrollWidth - innerWidth + 40), ease: 'none', scrollTrigger: { trigger: workPin, start: 'top top', end: () => '+=' + (rail.scrollWidth - innerWidth + 40), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
} else $('#work').classList.add('no-pin');

// ---------- reviews
const quotes = $$('.quote'); let qi = 0, qTimer = 0;
const showQ = (i: number) => { qi = (i + quotes.length) % quotes.length; quotes.forEach((q, k) => q.classList.toggle('is-on', k === qi)); $('#qCount').textContent = `${qi + 1} / ${quotes.length}`; };
const autoQ = () => { clearInterval(qTimer); if (!reduced) qTimer = window.setInterval(() => showQ(qi + 1), 7000); };
$('#qPrev').addEventListener('click', () => { showQ(qi - 1); autoQ(); }); $('#qNext').addEventListener('click', () => { showQ(qi + 1); autoQ(); });
autoQ();

// ---------- process line
const stepsLis = $$('#steps li');
ScrollTrigger.create({ trigger: '#steps', start: 'top 70%', end: 'bottom 60%', onUpdate: (s) => {
  $('#stepsFill').style.transform = `scaleY(${s.progress})`;
  stepsLis.forEach((li, i) => li.classList.toggle('is-on', s.progress >= i / (stepsLis.length - 1) - 0.02));
} });

// ---------- reveals
if (!reduced) {
  const els = $$('.design__head > *, .services__head > *, .slope__copy > *, .rootlok, .work__head > *, .reviews__head > *, .process__head > *, .visit__side > *, .faq__grid > div:first-child > *, .faq__list details, .final__copy > *');
  els.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { (el as HTMLElement).style.transitionDelay = `${(i % 4) * 60}ms`; io.observe(el); });
}

// ---------- magnetic primary buttons (desktop)
if (!coarse && !reduced) $$('.magnetic').forEach((b) => {
  b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});

initForm();
addEventListener('load', () => ScrollTrigger.refresh());
