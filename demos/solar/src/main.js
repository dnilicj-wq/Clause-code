import {
  SITE, reduceMotion, finePointer, personalise, track, wireCallTracking, wireForm, validateField,
  submitLead, reveals, countTo, faq, chrome, smoothScroll, scrollProgress, daysUntil,
} from './core.js';

personalise();
wireCallTracking();
chrome();
reveals();
faq(document.querySelector('.faq-list'));
smoothScroll();

const gbp = (n) => '£' + (Math.round(n / 10) * 10).toLocaleString('en-GB');

/* ---------- Deadline ---------- */
document.querySelectorAll('[data-days]').forEach((el) => {
  const d = daysUntil(SITE.deadline?.date || '2027-03-31');
  el.textContent = d;
  el.closest('.deadline-count') && new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { el.dataset.current = Math.max(0, d - 60); countTo(el, d, { duration: 1100 }); o.disconnect(); }
  }).observe(el);
});

/* ---------- Warranty bars ---------- */
const wy = SITE.warrantyYears || {};
document.querySelectorAll('.tl-row').forEach((row) => {
  const y = wy[row.dataset.years] || 10;
  row.style.setProperty('--w', Math.min(1, y / 25));
});

/* ---------- Estimator ---------- */
const est = document.getElementById('estimator');
if (est) {
  const P = SITE.estimator;
  const q = new URLSearchParams(location.search).get('capture');
  const mode = q === 'before' || q === 'after' ? q : SITE.estimatorCapture || 'after';
  est.dataset.capture = mode;
  const form = est.querySelector('.est-form');
  const steps = [...form.querySelectorAll('.est-step')];
  const contact = est.querySelector('.est-contact');
  const result = est.querySelector('.est-result');
  const bar = est.querySelector('.est-bar');
  const num = est.querySelector('[data-est-num]');
  const count = est.querySelector('.est-count');
  let current = 0, started = false, figures = null, lead = null;

  const startOnce = () => { if (!started) { started = true; track('estimator_start', { mode }); } };
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
    if (e.target.name === 'battery') setTimeout(finishQuestions, 220);
  });

  function calc() {
    const monthly = Number(bill.value);
    const roof = form.roof.value || 'unsure';
    const battery = form.battery.value || 'maybe';
    const usage = (monthly * 12) / P.unitRate; // kWh/yr
    const yieldK = P.yieldPerKwp[roof];
    const kw = P.panelWatts / 1000;
    let panels = Math.round((usage * 0.85) / yieldK / kw);
    panels = Math.max(P.minPanels, Math.min(P.maxPanels, panels));
    const kwp = panels * kw;
    const gen = kwp * yieldK;
    const self = Math.min(P.selfUse[battery] * gen, usage);
    const savings = (self * P.unitRate + (gen - self) * P.exportRate) * P.cautionFactor;
    const withBatt = battery === 'yes';
    const low = kwp * P.costPerKwp.low + (withBatt ? P.batteryCost.low : 0);
    const high = kwp * P.costPerKwp.high + (withBatt ? P.batteryCost.high : 0);
    return { monthly, roof, battery, usage, panels, kwp, gen, self, savings, low, high, yieldK };
  }

  function finishQuestions() {
    figures = calc();
    bar.style.transform = `scaleX(${steps.length / (steps.length + 1)})`;
    if (mode === 'before') {
      count.hidden = true;
      contact.dataset.phase = 'before';
      est.querySelector('[data-contact-title]').textContent = 'Where should we send your estimate?';
      est.querySelector('[data-contact-help]').textContent = "We'll show it on screen straight away. No call unless you ask for one.";
      est.querySelector('[data-contact-btn]').firstChild.textContent = 'Show my estimate ';
      show(contact);
    } else {
      showResult();
    }
  }

  function showResult() {
    const f = figures;
    count.hidden = true;
    bar.style.transform = 'scaleX(1)';
    show(result);
    const [lo, hi, sv] = ['[data-low]', '[data-high]', '[data-savings]'].map((s) => result.querySelector(s));
    [lo, hi, sv].forEach((el) => (el.dataset.current = 0));
    countTo(lo, f.low, { format: gbp }); countTo(hi, f.high, { format: gbp, duration: 1100 }); countTo(sv, f.savings, { format: gbp, duration: 1200 });
    result.querySelector('[data-panels]').textContent = f.panels;
    result.querySelector('[data-kwp]').textContent = f.kwp.toFixed(2);
    const roofName = { south: 'south-facing', eastwest: 'east/west', unsure: 'unknown (we assumed below average)' }[f.roof];
    result.querySelector('[data-workings]').innerHTML = [
      `Your bill of £${f.monthly}/month at ${Math.round(P.unitRate * 100)}p/kWh is about ${Math.round(f.usage).toLocaleString()} kWh a year.`,
      `${f.panels} × ${P.panelWatts}W panels on a ${roofName} roof make roughly ${Math.round(f.gen).toLocaleString()} kWh a year (${f.yieldK} kWh per kWp, a cautious figure for the north of England).`,
      `We assume you use ${Math.round(P.selfUse[f.battery] * 100)}% of it at home${f.battery === 'yes' ? ' with a battery' : ''} and export the rest at ${Math.round(P.exportRate * 100)}p.`,
      `Then we knock off another ${Math.round((1 - P.cautionFactor) * 100)}% so the figure errs low.`,
    ].map((t) => `<li>${t}</li>`).join('');
    result.querySelector('[data-placeholder-note]').hidden = !SITE.pricingIsPlaceholder;
    track('estimator_complete', { mode, low: Math.round(f.low), high: Math.round(f.high), savings: Math.round(f.savings), panels: f.panels, battery: f.battery, roof: f.roof });
  }

  result.querySelector('[data-book]').addEventListener('click', () => {
    track('estimator_book_click', { mode });
    if (mode === 'before') {
      // Details already captured: confirm the survey request.
      contact.classList.add('is-sent');
      show(contact);
      submitLead({ form: 'survey-request', ...lead, estimateLow: Math.round(figures.low), estimateHigh: Math.round(figures.high) });
      track('form_submit', { form: 'survey-request' });
      return;
    }
    contact.dataset.phase = 'after';
    est.querySelector('[data-contact-title]').textContent = 'Book my free survey';
    est.querySelector('[data-contact-help]').textContent = "Pick up where you left off. We'll call to find a time that suits you. No sales pitch.";
    est.querySelector('[data-contact-btn]').firstChild.textContent = 'Book my free survey ';
    show(contact);
  });
  result.querySelector('[data-restart]').addEventListener('click', () => { form.reset(); setBill(); go(0); });
  contact.querySelector('[data-back-contact]').addEventListener('click', () => (contact.dataset.phase === 'after' ? show(result) : go(3)));

  wireForm(contact, {
    name: 'estimator',
    extra: () => ({ ...Object.fromEntries(new FormData(form)), mode, phase: contact.dataset.phase, estimateLow: Math.round(figures?.low || 0), estimateHigh: Math.round(figures?.high || 0), estimateSavings: Math.round(figures?.savings || 0) }),
    onSuccess: (data) => {
      lead = data;
      track('estimator_lead', { mode, phase: contact.dataset.phase });
      if (contact.dataset.phase === 'before') { contact.classList.remove('is-sent'); showResult(); }
    },
  });
}

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

/* ---------- 3D scenes (loaded after first paint) ---------- */
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
const heroCanvas = document.getElementById('hero-canvas');
const storyCanvas = document.getElementById('story-canvas');
const howSteps = [...document.querySelectorAll('.how-steps li')];
const howLabel = document.querySelector('[data-how-label]');
const labels = ['Your home today', 'Survey: measuring the roof', 'Your quote, panel by panel', 'Installed by our own team', 'Evening: battery still powering the house'];

const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
if (webglOK()) {
  idle(async () => {
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
      const story = createSolarScene(storyCanvas, { mode: 'story' });
      const stage = document.querySelector('.how-stage');
      stage.classList.add('is-live');
      let lastStep = -1;
      scrollProgress(document.getElementById('how'), (p) => {
        story.setStory(p);
        stage.style.setProperty('--dusk', Math.max(0, Math.min(1, (p - 0.86) / 0.14)).toFixed(3));
        if (reduceMotion) story.renderOnce();
        const s = Math.min(4, Math.floor(p * 5));
        if (s !== lastStep) {
          lastStep = s;
          howSteps.forEach((li, i) => li.classList.toggle('is-active', i === s));
          howLabel.textContent = labels[s];
        }
      });
    }
  });
} else {
  document.documentElement.classList.add('no-webgl');
}
