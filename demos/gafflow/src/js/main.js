// Gafflow demo: all page behaviour. Vanilla, no framework.
import { estimate } from './money.js';

const C = window.__GAF__ || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gbp = (n) => '£' + Math.round(n).toLocaleString('en-GB');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* blocked */ } } };
document.documentElement.classList.add('js');

/* ---------- tracking (dataLayer, gtag, fbq) ---------- */
export function track(event, props = {}) {
  (window.dataLayer = window.dataLayer || []).push({ event, ...props });
  if (window.gtag) window.gtag('event', event, props);
  if (window.fbq && event === 'generate_lead') window.fbq('track', 'Lead');
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-track]');
  if (a) track(a.dataset.track, { location: a.dataset.loc || '' });
});

/* ---------- mobile menu ---------- */
const menuBtn = $('[data-menu]'), menu = $('#menu');
if (menuBtn && menu) {
  const set = (open) => { menuBtn.setAttribute('aria-expanded', open); menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open); };
  menuBtn.addEventListener('click', () => set(menuBtn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* ---------- quote form prefill (shared by estimator and pour) ---------- */
function prefill({ space, finish, m2, estimate: est, design }) {
  const f = $('[data-quote]'); if (!f) return;
  if (space) { const t = $$('input[name="space"]', f).find((i) => i.value === space); if (t) t.checked = true; }
  if (finish) { const sel = $('#qf-finish', f); const opt = [...sel.options].find((o) => o.value === finish); if (opt) sel.value = opt.value; }
  if (m2) $('#qf-m2', f).value = m2;
  if (est) f.querySelector('input[name="estimate"]').value = est;
  if (design) { f.querySelector('input[name="design"]').value = design; const d = $('[data-design-note]', f); if (d) { d.hidden = false; $('span', d).textContent = design; } }
}

/* ---------- estimator ---------- */
const est = $('[data-estimator]');
if (est) {
  const R = C.rates;
  const m2 = $('#est-m2', est);
  const out = { low: $('[data-low]'), high: $('[data-high]'), sum: $('[data-sum]'), m2: $('[data-m2]') };
  let touched = false, last = null;
  const val = (n) => est.querySelector(`input[name="${n}"]:checked`)?.value;
  function syncSpace() {
    const s = R.spaces[val('space')];
    m2.min = s.min; m2.max = s.max; m2.value = s.m2;
    $$('input[name="finish"]', est).forEach((i) => { const ok = s.finishes.includes(i.value); i.closest('.chip').hidden = !ok; i.disabled = !ok; });
    if (!s.finishes.includes(val('finish'))) $(`input[name="finish"][value="${s.finishes[0]}"]`, est).checked = true;
  }
  function render() {
    const space = val('space'), finish = val('finish');
    const e = estimate(R, { space, finish, m2: +m2.value });
    last = e;
    out.low.textContent = gbp(e.low); out.high.textContent = gbp(e.high); out.m2.textContent = e.m2;
    out.sum.textContent = `${R.spaces[space].label}, ${e.m2} m², ${R.finishes[finish].label}`;
  }
  est.addEventListener('change', (e) => {
    if (e.target.name === 'space') syncSpace();
    if (!touched) { touched = true; store.set('gaf_est', '1'); track('estimator_start'); }
    render(); track('estimator_update', { space: val('space'), finish: val('finish') });
  });
  m2.addEventListener('input', render);
  syncSpace(); render();
  $('[data-lock]')?.addEventListener('click', () => {
    if (!last) return;
    prefill({ space: R.spaces[last.space].label, finish: R.finishes[last.finish].label, m2: last.m2, estimate: `${gbp(last.low)} to ${gbp(last.high)} (example range)` });
    store.set('gaf_est', '1');
  });
}

/* ---------- design-your-floor pour ---------- */
const pour = $('[data-pour]');
if (pour) {
  const stage = $('.pour-stage', pour);
  let api = null, base = $('input[name="base"]:checked', pour), metal = $('input[name="metal"]:checked', pour);
  const label = $('[data-pour-label]', pour), buy = $('[data-pour-buy]', pour), buyBase = $('[data-pour-buy-base]', pour);
  function apply(reseed) {
    base = $('input[name="base"]:checked', pour); metal = $('input[name="metal"]:checked', pour);
    stage.style.setProperty('--b', base.dataset.hex); stage.style.setProperty('--m', metal.dataset.hex);
    label.textContent = `${metal.dataset.name} metallic over ${base.dataset.name}`;
    buy.href = `/product/metallic-epoxy-powder-pigment-${metal.value}/`; $('span', buy).textContent = `${metal.dataset.name}, from £9`;
    buyBase.href = `/product/${base.value}/`; $('span', buyBase).textContent = `${base.dataset.name}, from £25`;
    api?.set(base.dataset.hex, metal.dataset.hex, reseed);
  }
  pour.addEventListener('change', () => { apply(false); track('pour_colour', { base: base.value, metal: metal.value }); });
  $('[data-pour-shuffle]', pour)?.addEventListener('click', () => {
    const ms = $$('input[name="metal"]', pour); ms[Math.floor(Math.random() * ms.length)].checked = true;
    apply(true); track('pour_shuffle');
  });
  $('[data-pour-quote]', pour)?.addEventListener('click', () => prefill({ finish: 'Metallic epoxy', design: `${metal.dataset.name} metallic over ${base.dataset.name} base` }));
  apply(false);
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    import('./pour.js').then((m) => { api = m.default(stage); if (api) { api.set(base.dataset.hex, metal.dataset.hex); api.ready(); } });
  }, { rootMargin: '400px 0px' }).observe(pour);
}

/* ---------- deep cast resin calculator: L × W × D × 1,100 kg/m³ ---------- */
const calc = $('[data-calc]');
if (calc) {
  const run = () => {
    const L = +calc.L.value || 0, W = +calc.W.value || 0, D = (+calc.D.value || 0) / 1000;
    const kg = Math.round(L * W * D * 1100 * 10) / 10, kits = Math.ceil(kg / 14.5);
    $('[data-kg]', calc).textContent = `${kg.toLocaleString('en-GB')} kg`;
    $('[data-kits]', calc).textContent = kg ? `${kits} × 14.5kg kit${kits > 1 ? 's' : ''}` : '';
  };
  calc.addEventListener('input', run); run();
}

/* ---------- course countdowns ---------- */
$$('[data-starts]').forEach((el) => {
  const d = Math.ceil((new Date(el.dataset.starts + 'T09:00:00') - new Date()) / 864e5);
  if (d > 1) el.textContent = `Starts in ${d} days`;
  else if (d === 1) el.textContent = 'Starts tomorrow';
  else el.hidden = true;
});

/* ---------- gallery filter ---------- */
$$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.filter;
  $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  $$('[data-gallery] li').forEach((li) => { li.hidden = k !== 'all' && li.dataset.space !== k; });
  track('gallery_filter', { filter: k });
}));

/* ---------- shop filter ---------- */
$$('[data-shop-filter]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.shopFilter;
  $$('[data-shop-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  $$('[data-shop] > li').forEach((li) => { li.hidden = k !== 'all' && li.dataset.cat !== k; });
}));

/* ---------- multi-step quote form ---------- */
const NAMES = ['Your project', 'Your postcode', 'Photos of the space', 'Your details'];
const PC = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/;
function coverage(pc) {
  const m = pc.toUpperCase().replace(/\s+/g, ' ').trim().match(PC);
  if (!m) return null;
  const out = m[1], area = out.match(/^[A-Z]+/)[0];
  if (['BN', 'TN'].includes(area)) return { text: `We cover ${out}. You are close to our Eastbourne base.` };
  if (['CR', 'SM', 'KT', 'BR', 'SE', 'SW', 'RH'].includes(area)) return { text: `We cover ${out}. You are close to our South Croydon centre.` };
  return { text: `We cover ${out}. Gafflow installs throughout the UK, and further afield.` };
}
$$('[data-quote]').forEach((form) => {
  let step = 1; const steps = $$('.qf-step', form);
  const bar = $('[data-qf-bar]', form), back = $('[data-qf-back]', form), next = $('[data-qf-next]', form), submit = $('[data-qf-submit]', form);
  const status = $('.form-status', form), cover = $('[data-cover]', form), pc = $('#qf-pc', form);
  let files = [];
  function show(n, focus) {
    step = n;
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    bar.style.width = `${n * 25}%`;
    $('[data-qf-n]', form).textContent = `Step ${n} of 4`; $('[data-qf-name]', form).textContent = NAMES[n - 1];
    back.hidden = n === 1; next.hidden = n === 4; submit.hidden = n !== 4;
    if (focus) steps[n - 1].querySelector('input:not([type=radio]):not([type=file]), select, textarea')?.focus({ preventScroll: true });
    track('quote_step', { step: n });
  }
  function err(input, msg) {
    const f = input.closest('.field'); f.classList.toggle('bad', !!msg);
    const p = $('.err', f); if (p) p.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }
  function validate(n) {
    let ok = true;
    $$('[required]', steps[n - 1]).forEach((i) => {
      const v = i.value.trim(); let m = '';
      if (!v) m = i.dataset.req;
      else if (i.dataset.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) m = 'That email does not look right.';
      else if (i.dataset.kind === 'phone' && v.replace(/\D/g, '').length < 10) m = 'Add a full phone number.';
      else if (i === pc && !coverage(v)) m = 'Please enter a full UK postcode, like BN23 6PH.';
      if (!err(i, m)) { if (ok) i.focus(); ok = false; }
    });
    return ok;
  }
  pc?.addEventListener('input', () => {
    const c = coverage(pc.value);
    cover.classList.toggle('show', !!c);
    $('[data-cover-text]', cover).textContent = c ? c.text : '';
    if (c) err(pc, '');
  });
  next.addEventListener('click', () => { if (validate(step)) show(step + 1, true); });
  form.addEventListener('input', (e) => { const f = e.target.closest('.field.bad'); if (f && e.target.value.trim()) err(e.target, ''); });
  back.addEventListener('click', () => show(step - 1, true));
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < 4) { e.preventDefault(); next.click(); } });

  const input = $('#qf-photos', form), thumbs = $('[data-thumbs]', form), drop = $('.drop', form);
  function drawThumbs() {
    thumbs.replaceChildren(...files.map((f, i) => {
      const li = document.createElement('li'); const im = document.createElement('img');
      im.src = URL.createObjectURL(f); im.alt = `Photo ${i + 1}`;
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', `Remove photo ${i + 1}`);
      x.onclick = () => { files.splice(i, 1); drawThumbs(); };
      li.append(im, x); return li;
    }));
    $('b', drop).textContent = files.length ? `${files.length} of 3 photos added` : 'Add up to 3 photos';
  }
  function addFiles(list) { files = [...files, ...[...list].filter((f) => f.type.startsWith('image/'))].slice(0, 3); drawThumbs(); }
  input?.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('drag'));
  drop?.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer.files); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(4)) return;
    if (form.company_website.value) return; // honeypot
    const fd = new FormData(form); fd.delete('photos'); fd.delete('company_website');
    files.forEach((f, i) => fd.append(`photo_${i + 1}`, f, f.name));
    fd.append('page', location.pathname); fd.append('photos_count', String(files.length));
    const summary = { space: fd.get('space'), finish: fd.get('finish'), postcode: (fd.get('postcode') || '').toUpperCase(), photos: files.length, estimate: fd.get('estimate'), design: fd.get('design') };
    submit.disabled = true; status.textContent = 'Sending…';
    const F = C.rates.form;
    try {
      if (F.web3formsAccessKey) {
        fd.append('access_key', F.web3formsAccessKey); fd.append('subject', `Quote request: ${summary.space}, ${summary.postcode}`);
        const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd }); if (!r.ok) throw new Error(r.status);
      } else if (F.formspreeEndpoint) {
        const r = await fetch(F.formspreeEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }); if (!r.ok) throw new Error(r.status);
      } // else demo mode: nothing is sent
      track('generate_lead', { space: summary.space, finish: summary.finish });
      store.set('gaf_lead', JSON.stringify(summary));
      location.href = '/thank-you/';
    } catch {
      submit.disabled = false;
      status.innerHTML = `Sorry, that did not send. Please call <a href="tel:${C.phoneIntl}">${C.phone}</a> or WhatsApp us your photos.`;
    }
  });
  show(1, false);
});

/* ---------- thank-you summary ---------- */
const ty = $('[data-ty-summary]');
if (ty) {
  try {
    const s = JSON.parse(store.get('gaf_lead') || 'null');
    if (s) {
      ty.textContent = [s.space, s.finish, s.design, s.postcode, s.photos ? `${s.photos} photo${s.photos > 1 ? 's' : ''}` : '', s.estimate].filter(Boolean).join(' · ');
      ty.hidden = false;
    }
  } catch { /* summary stays hidden */ }
}

/* ---------- one-time nudge: scroll depth or exit intent ---------- */
// Shown at most once per visit, only after the gallery AND the award section are scrolled
// past, and never on top of the award section or the quote form. Gone for the visit once
// dismissed, used, or the visitor reaches the quote form or touches the estimator.
const nudge = $('[data-nudge]');
const gallerySec = $('#work'), awardSec = $('#team'), quoteSec = $('#quote');
if (nudge && gallerySec && !store.get('gaf_nudge') && !store.get('gaf_est')) {
  let state = 'waiting'; // waiting → shown → done
  const done = () => { state = 'done'; nudge.hidden = true; store.set('gaf_nudge', '1'); removeEventListener('scroll', check); };
  const below = (el) => el && el.getBoundingClientRect().bottom < 0;
  const onScreen = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  function check() {
    if (state === 'done') return;
    if (store.get('gaf_est') || onScreen(quoteSec)) { if (state === 'shown' || store.get('gaf_est')) done(); return; }
    if (state === 'waiting' && below(gallerySec) && (!awardSec || below(awardSec))) {
      state = 'shown'; store.set('gaf_nudge', '1'); nudge.hidden = false; track('nudge_shown');
    }
  }
  addEventListener('scroll', check, { passive: true });
  $('[data-nudge-x]', nudge).addEventListener('click', done);
  $('a', nudge).addEventListener('click', done);
}

/* ---------- reveals (below the fold only; content is visible without JS) ---------- */
if (!reduce && 'IntersectionObserver' in window) {
  const els = $$('.sec .h2, .fin-card, .masonry li, .course, .tcard, .pcard, .door, .feature-list li, .steps li').filter((el) => el.getBoundingClientRect().top > innerHeight);
  els.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 4000);
}

/* ---------- layer stack: loaded only when the section approaches ---------- */
const layers = $('[data-layers]');
if (layers) {
  if (reduce) layers.classList.add('static');
  else new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    import('./layers.js').then((m) => m.default(layers));
  }, { rootMargin: '600px 0px' }).observe(layers);
}
