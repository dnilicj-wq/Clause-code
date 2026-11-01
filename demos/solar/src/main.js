import {
  SITE, reduceMotion, finePointer, personalise, track, wireCallTracking, wireForm, validateField,
  reveals, countTo, faq, chrome, smoothScroll, scrollProgress, refreshDerived, whenReadyFor3D,
} from './core.js';
import derive, { estimate, gbp as gbpExact } from './derive.js';

personalise();
wireCallTracking();
chrome();
reveals();
const faqList = document.querySelector('.faq-list');
if (faqList) faq(faqList);
smoothScroll();

const gbp = (n) => gbpExact(Math.round(n / 10) * 10);

/* ---------- Live date-based values (days left etc.) ---------- */
refreshDerived(derive(SITE, new Date()));
document.querySelectorAll('.deadline-count [data-days]').forEach((el) => {
  const d = Number(el.textContent) || 0;
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { el.dataset.current = Math.max(0, d - 60); countTo(el, d, { duration: 1100 }); o.disconnect(); }
  }).observe(el);
});

/* ---------- Warranty bars ---------- */
const wy = SITE.warrantyYears || {};
document.querySelectorAll('.tl-row').forEach((row) => {
  const y = wy[row.dataset.years] || 10;
  row.style.setProperty('--w', Math.min(1, y / 25));
});

/* ---------- Estimator: questions → price range → (optional) booking ---------- */
const est = document.getElementById('estimator');
if (est) {
  const P = SITE.estimator;
  const form = est.querySelector('.est-form');
  const steps = [...form.querySelectorAll('.est-step')];
  const contact = est.querySelector('.est-contact');
  const result = est.querySelector('.est-result');
  const bar = est.querySelector('.est-bar');
  const num = est.querySelector('[data-est-num]');
  const count = est.querySelector('.est-count');
  let current = 0, started = false, figures = null;

  const startOnce = () => { if (!started) { started = true; track('estimator_start'); } };
  est.addEventListener('focusin', startOnce, { once: true });
  est.addEventListener('pointerdown', startOnce, { once: true });

  function show(el) {
    [...steps, contact, result].forEach((s) => s.classList.toggle('is-active', s === el));
    const focusable = el.querySelector('input:not([type=radio]):not(.hp), .choice input, [data-book]');
    if (focusable && document.activeElement && est.contains(document.activeElement)) setTimeout(() => focusable.focus({ preventScroll: true }), 60);
  }
  function go(i) {
    current = i;
    show(steps[i]);
    num.textContent = i + 1;
    count.hidden = false;
    bar.style.transform = `scaleX(${(i + 1) / (steps.length + 1)})`;
    track('estimator_step', { step: i + 1 });
  }

  const bill = form.bill;
  const billOut = est.querySelector('[data-bill]');
  const setBill = () => {
    billOut.textContent = bill.value === bill.max ? bill.value + '+' : bill.value;
    bill.style.setProperty('--fill', (bill.value - bill.min) / (bill.max - bill.min));
  };
  bill.addEventListener('input', setBill); setBill();

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) {
      const input = steps[current].querySelector('input[required]');
      if (input && !validateField(input)) return input.focus();
      go(current + 1);
    }
    if (e.target.closest('[data-back]')) go(Math.max(0, current - 1));
  });
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input:not([type=radio])')) { e.preventDefault(); steps[current].querySelector('[data-next]')?.click(); }
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'roof') setTimeout(() => go(3), 220);
    if (e.target.name === 'battery') setTimeout(showResult, 220);
  });

  function showResult() {
    const f = (figures = estimate(P, { bill: Number(bill.value), roof: form.roof.value || 'unsure', battery: form.battery.value || 'maybe' }));
    count.hidden = true;
    bar.style.transform = 'scaleX(1)';
    show(result);
    const $ = (s) => result.querySelector(s);
    [$('[data-low]'), $('[data-high]'), $('[data-save-low]'), $('[data-save-high]')].forEach((el) => (el.dataset.current = 0));
    countTo($('[data-low]'), f.low, { format: gbp });
    countTo($('[data-high]'), f.high, { format: gbp, duration: 1100 });
    countTo($('[data-save-low]'), f.saveLow, { format: gbp, duration: 1000 });
    countTo($('[data-save-high]'), f.saveHigh, { format: gbp, duration: 1200 });
    $('[data-pay]').textContent = `${f.payLow}–${f.payHigh}`;
    $('[data-panels]').textContent = f.panels;
    $('[data-kwp]').textContent = f.kwp.toFixed(2);
    $('[data-batt-note]').hidden = f.withBatt;
    const roofName = { south: 'south-facing', eastwest: 'east/west', unsure: 'unknown (so we assumed below average)' }[f.roof];
    $('[data-workings]').innerHTML = [
      `Your bill of £${f.bill}/month at ${Math.round(P.unitRate * 100)}p/kWh is about ${Math.round(f.usage).toLocaleString('en-GB')} kWh a year.`,
      `${f.panels} × ${P.panelWatts}W panels on a ${roofName} roof make roughly ${Math.round(f.gen).toLocaleString('en-GB')} kWh a year (${f.yieldK} kWh per kWp, a cautious figure).`,
      `We assume you use ${Math.round(P.selfUse[f.withBatt ? 'battery' : 'panels'] * 100)}% of it at home${f.withBatt ? ' with a battery' : ''} and export the rest at ${Math.round(P.exportRate * 100)}p.`,
      `Price: ${gbp(P.costPerKwp.low)} to ${gbp(P.costPerKwp.high)} per kWp fitted, including scaffolding and 0% VAT${f.withBatt ? `, plus ${gbp(P.batteryCost.low)} to ${gbp(P.batteryCost.high)} for the battery` : ''}.`,
      `Payback is the price divided by the yearly saving, ignoring future price rises, so it errs long.`,
    ].map((t) => `<li>${t}</li>`).join('');
    track('estimator_complete', { low: f.low, high: f.high, saveLow: f.saveLow, saveHigh: f.saveHigh, payback: `${f.payLow}-${f.payHigh}`, panels: f.panels, battery: f.battery, roof: f.roof });
  }

  result.querySelector('[data-book]').addEventListener('click', () => {
    track('estimator_book_click');
    if (!contact.postcode.value) contact.postcode.value = form.postcode.value.trim().toUpperCase();
    show(contact);
    contact.querySelector('input').focus({ preventScroll: true });
  });
  result.querySelector('[data-restart]').addEventListener('click', () => { form.reset(); setBill(); go(0); });
  contact.querySelector('[data-back-contact]').addEventListener('click', () => show(result));

  wireForm(contact, {
    name: 'survey-booking',
    extra: () => ({ bill: bill.value, roof: form.roof.value, battery: form.battery.value, estimateLow: figures?.low, estimateHigh: figures?.high, savingsLow: figures?.saveLow, savingsHigh: figures?.saveHigh }),
    onSuccess: () => track('estimator_lead'),
  });
}

/* ---------- Quote check ---------- */
const qc = document.getElementById('quote-check');
if (qc) wireForm(qc, { name: 'quote-check' });

/* ---------- Enquiry form ---------- */
const enquiry = document.getElementById('enquiry');
if (enquiry) wireForm(enquiry, { name: 'enquiry' });

/* ---------- Promise card tilt ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => (card.style.transform = `perspective(1400px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`));
    });
    card.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); card.style.transform = ''; });
  });
}

/* ---------- 3D scenes (started by whenReadyFor3D) ---------- */
const heroCanvas = document.getElementById('hero-canvas');
const storyCanvas = document.getElementById('story-canvas');
const howSteps = [...document.querySelectorAll('.how-steps li')];
const howLabel = document.querySelector('[data-how-label]');
const labels = ['Your home today', 'Survey: measuring the roof', 'Your quote, panel by panel', 'Installed by our own team', 'Evening: battery still powering the house'];
let story = null;

whenReadyFor3D().then(async (ok) => {
  if (!ok) { document.documentElement.classList.add('no-webgl'); return; }
  const { createSolarScene } = await import('./scene.js');
  if (heroCanvas) {
    const hero = createSolarScene(heroCanvas, { mode: 'hero', animateIntro: !reduceMotion });
    if (reduceMotion) hero.renderOnce();
    requestAnimationFrame(() => document.querySelector('.hero-stage').classList.add('is-live'));
    if (finePointer && !reduceMotion) {
      addEventListener('pointermove', (e) => hero.setPointer(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
    }
  }
  if (storyCanvas) {
    story = createSolarScene(storyCanvas, { mode: 'story' });
    document.querySelector('.how-stage').classList.add('is-live');
    story.setStory(lastP); story.renderOnce();
  }
});

let lastStep = -1, lastP = 0;
const howStage = document.querySelector('.how-stage');
if (howStage) scrollProgress(document.getElementById('how'), (p) => {
  lastP = p;
  if (story) { story.setStory(p); if (reduceMotion) story.renderOnce(); }
  howStage.style.setProperty('--dusk', Math.max(0, Math.min(1, (p - 0.86) / 0.14)).toFixed(3));
  const s = Math.min(4, Math.floor(p * 5));
  if (s !== lastStep) {
    lastStep = s;
    howSteps.forEach((li, i) => li.classList.toggle('is-active', i === s));
    howLabel.textContent = labels[s];
  }
});
