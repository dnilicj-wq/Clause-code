import {
  SITE, reduceMotion, finePointer, personalise, track, wireCallTracking, wireForm,
  reveals, countTo, faq, chrome, smoothScroll, viewProgress, refreshDerived, whenReadyFor3D,
} from './core.js';
import derive, { estimate, monthly, usd } from './derive.js';

personalise();
wireCallTracking();
chrome();
reveals();
const faqList = document.querySelector('.faq-list');
if (faqList) faq(faqList);
smoothScroll();

const usd10 = (n) => usd(Math.round(n / 10) * 10);

/* ---------- Cross-section: layers separate as the section scrolls through ---------- */
const xsec = document.querySelector('[data-xsec]');
if (xsec) {
  if (reduceMotion) xsec.style.setProperty('--x', 1);
  else viewProgress(xsec, (p) => {
    const x = Math.min(1, Math.max(0, (p - 0.12) / 0.4));
    xsec.style.setProperty('--x', (1 - Math.pow(1 - x, 3)).toFixed(4));
  });
}

/* ---------- How it works: progress line ---------- */
const how = document.querySelector('[data-how]');
if (how) {
  const items = [...how.querySelectorAll('.how-track li')];
  const set = (p) => {
    const x = Math.min(1, Math.max(0, (p - 0.2) / 0.4));
    how.style.setProperty('--line', x.toFixed(4));
    items.forEach((li, i) => li.classList.toggle('is-lit', x >= i / (items.length - 1) - 0.02));
  };
  reduceMotion ? set(1) : viewProgress(how, set);
}

/* ---------- Before / after sliders ---------- */
document.querySelectorAll('.ba').forEach((ba) => {
  const r = ba.querySelector('.ba-range');
  let tracked = false;
  r.addEventListener('input', () => {
    ba.style.setProperty('--pos', r.value + '%');
    if (!tracked) { tracked = true; track('before_after_drag'); }
  });
});

/* ---------- Live date-based values (booking month etc.) ---------- */
refreshDerived(derive(SITE, new Date()));

/* ---------- Instant price: range first, booking only if they want it ---------- */
const est = document.getElementById('estimator');
if (est) {
  const P = SITE.estimator;
  const form = est.querySelector('.est-controls');
  const sqft = form.sqft;
  const sqftOut = est.querySelector('[data-sqft]');
  const contact = est.querySelector('[data-contact]');
  const live = est.querySelector('[data-live]');
  const low = est.querySelector('[data-low]'), high = est.querySelector('[data-high]');
  const monthlyEl = est.querySelector('[data-monthly]');
  let started = false, figures = null, completeTimer = 0, completed = false;

  const setSqftFill = () => {
    sqftOut.textContent = Number(sqft.value).toLocaleString('en-US');
    sqft.style.setProperty('--fill', (sqft.value - sqft.min) / (sqft.max - sqft.min));
  };

  function update(source, silent) {
    if (!silent && !started) { started = true; track('estimator_start'); }
    if (source === 'space') sqft.value = P.spaces[form.space.value].sqft;
    setSqftFill();
    figures = estimate(P, { space: form.space.value, sqft: sqft.value, finish: form.finish.value, condition: form.condition.value });
    est.querySelector('[data-q-space]').textContent = P.spaces[figures.space].label;
    est.querySelector('[data-q-sqft]').textContent = figures.sqft.toLocaleString('en-US');
    est.querySelector('[data-q-finish]').textContent = { flake: 'Flake', metallic: 'Metallic', solid: 'Solid color' }[figures.finish];
    monthlyEl.textContent = usd(Math.ceil(monthly(figures.low, SITE.finance.apr, SITE.finance.months)));
    if (silent) { low.textContent = usd(figures.low); high.textContent = usd(figures.high); low.dataset.current = figures.low; high.dataset.current = figures.high; return; }
    countTo(low, figures.low, { format: usd10, duration: 500 });
    countTo(high, figures.high, { format: usd10, duration: 600 });
    clearTimeout(completeTimer);
    completeTimer = setTimeout(() => {
      track(completed ? 'estimator_update' : 'estimator_complete', { space: figures.space, sqft: figures.sqft, finish: figures.finish, condition: figures.condition, low: figures.low, high: figures.high });
      completed = true;
    }, 900);
  }

  form.addEventListener('input', (e) => update(e.target.name));
  update('space', true);

  est.querySelector('[data-book]').addEventListener('click', () => {
    track('estimator_book_click');
    contact.hidden = false;
    live.querySelector('.q-next').hidden = true;
    contact.querySelector('input').focus({ preventScroll: true });
    contact.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });

  wireForm(contact, {
    name: 'visit-booking',
    extra: () => (figures ? { space: figures.space, sqft: figures.sqft, finish: figures.finish, condition: figures.condition, estimateLow: figures.low, estimateHigh: figures.high } : {}),
    onSuccess: (data) => track('estimator_lead', { timeline: data.timeline }),
  });
}

/* ---------- Enquiry form ---------- */
const enquiry = document.getElementById('enquiry');
if (enquiry) wireForm(enquiry, { name: 'enquiry' });

/* ---------- 3D: hero pour + finish configurator ---------- */
const heroCanvas = document.getElementById('hero-canvas');
const configCanvas = document.getElementById('config-canvas');

whenReadyFor3D().then(async (ok) => {
    if (!ok) { document.documentElement.classList.add('no-webgl'); return; }
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    const { createFloorScene, FINISHES } = await import('./scene.js');
    const company = SITE.tokens?.Company;

    if (heroCanvas) {
      const hero = createFloorScene(heroCanvas, { mode: 'hero', company, reduceMotion });
      const stage = document.querySelector('.hero-stage');
      if (reduceMotion) { hero.showStatic('flake', 'graphite', true); hero.renderOnce(); }
      else {
        hero.showStatic('concrete', '', false);
        hero.renderOnce();
        stage.classList.add('is-live');
        setTimeout(() => hero.playHero('flake', 'graphite'), 450);
      }
      stage.classList.add('is-live');
      if (finePointer && !reduceMotion) addEventListener('pointermove', (e) => hero.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
      if (!reduceMotion) viewProgress(document.querySelector('.hero'), (p) => hero.setScroll(Math.max(0, (p - 0.5) * 2)));
    }

    if (configCanvas) {
      const cfg = createFloorScene(configCanvas, { mode: 'config', company, reduceMotion });
      cfg.showStatic('flake', 'graphite', true);
      cfg.renderOnce();
      document.querySelector('.config-stage').classList.add('is-live');
      const tabs = [...document.querySelectorAll('.seg [role=tab]')];
      const panels = [...document.querySelectorAll('.fin')];
      const sw = document.querySelector('.swatches');
      let type = 'flake', key = 'graphite', lastPoint = null;

      const swatchBg = (t, c) => t === 'flake'
        ? `radial-gradient(circle at 30% 30%, ${c[3]} 0 2px, transparent 2.5px), radial-gradient(circle at 70% 60%, ${c[2]} 0 2.5px, transparent 3px), radial-gradient(circle at 45% 75%, ${c[1]} 0 3px, transparent 3.5px), ${c[0]}`
        : t === 'metallic' ? `linear-gradient(135deg, ${c[0]}, ${c[1]} 55%, ${c[2]})` : c[0];

      function renderSwatches() {
        sw.innerHTML = Object.entries(FINISHES[type]).map(([k, f]) =>
          `<button type="button" role="radio" aria-checked="${k === key}" data-key="${k}"><span style="background:${swatchBg(type, f.colors)}"></span>${f.name}</button>`).join('');
      }
      function apply(origin) {
        cfg.pourFinish(type, key, origin || lastPoint);
        track('finish_preview', { type, color: key });
      }
      tabs.forEach((t) => t.addEventListener('click', () => {
        type = t.dataset.type; key = Object.keys(FINISHES[type])[0];
        tabs.forEach((x) => x.setAttribute('aria-selected', x === t));
        panels.forEach((p) => (p.hidden = p.dataset.fin !== type));
        renderSwatches(); apply();
      }));
      sw.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        key = b.dataset.key; renderSwatches(); apply();
      });
      configCanvas.addEventListener('pointerdown', (e) => {
        const pt = cfg.floorPointFromClient(e.clientX, e.clientY);
        if (!pt) return;
        lastPoint = pt;
        // cycle colour within the current type on each tap
        const keys = Object.keys(FINISHES[type]);
        key = keys[(keys.indexOf(key) + 1) % keys.length];
        renderSwatches(); apply(pt);
        document.querySelector('.config-hint')?.classList.add('is-used');
      });
      renderSwatches();
    }
});
