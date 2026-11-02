// Rhino Coating demo: all page behaviour. Vanilla, no framework.
import { estimate, monthlyPlan } from './money.js';

const C = window.__RHINO__ || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gbp = (n) => '£' + Math.round(n).toLocaleString('en-GB');
const gbp2 = (n) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- tracking (dataLayer, gtag, fbq) ---------- */
export function track(event, props = {}) {
  const payload = { event, ...props };
  (window.dataLayer = window.dataLayer || []).push(payload);
  if (window.gtag) window.gtag('event', event, props);
  if (window.fbq && event === 'generate_lead') window.fbq('track', 'Lead');
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-track]');
  if (a) track(a.dataset.track, { location: a.dataset.loc || '' });
});

/* ---------- estimator ---------- */
const est = $('[data-estimator]');
let lastEstimate = null;
if (est) {
  const R = C.rates;
  const m2 = $('#est-m2', est);
  const out = { low: $('[data-low]'), high: $('[data-high]'), sum: $('[data-sum]'), monthly: $('[data-monthly]'), m2: $('[data-m2]') };
  let touched = false;
  const val = (n) => est.querySelector(`input[name="${n}"]:checked`).value;
  function syncRange() {
    const s = R.spaces[val('space')];
    m2.min = s.min; m2.max = s.max; m2.value = s.m2;
  }
  function render() {
    const space = val('space'), system = val('system');
    const e = estimate(R, { space, system, m2: +m2.value });
    lastEstimate = e;
    out.low.textContent = gbp(e.low); out.high.textContent = gbp(e.high); out.m2.textContent = e.m2;
    out.sum.textContent = `${R.spaces[space].label}, ${e.m2} m², ${R.systems[system].label}`;
    out.monthly.textContent = gbp2(monthlyPlan(e.low, 0, R.finance.interestFreeMonths, R.finance).monthly);
  }
  est.addEventListener('change', (e) => {
    if (e.target.name === 'space') syncRange();
    if (!touched) { touched = true; track('estimator_start'); }
    render(); track('estimator_update', { space: val('space'), system: val('system') });
  });
  m2.addEventListener('input', render);
  syncRange(); render();
  // "Lock in a fixed quote": prefill the quote form with the visitor's choices.
  $('[data-lock]')?.addEventListener('click', () => {
    const f = $('[data-quote]'); if (!f || !lastEstimate) return;
    const label = R.spaces[lastEstimate.space].label;
    const tile = $$('input[name="space"]', f).find((i) => i.value === label); if (tile) tile.checked = true;
    const sel = $('#qf-system', f); const opt = [...sel.options].find((o) => o.text.startsWith(R.systems[lastEstimate.system].label)); if (opt) sel.value = opt.value;
    $('#qf-m2', f).value = lastEstimate.m2;
    f.querySelector('input[name="estimate"]').value = `${gbp(lastEstimate.low)} to ${gbp(lastEstimate.high)} (indicative)`;
    sessionStorage.setItem('rhino_est', '1');
  });
}

/* ---------- finance calculator ---------- */
const fin = $('[data-finance]');
if (fin) {
  const o = (k) => $(`[data-f-${k}]`, fin);
  function calc() {
    const cost = Math.max(0, +fin.cost.value || 0), dep = Math.min(cost, Math.max(0, +fin.deposit.value || 0)), term = +fin.term.value;
    $('[data-term-out]', fin).textContent = `${term} months`;
    const r = monthlyPlan(cost, dep, term, C.rates.finance);
    o('monthly').textContent = gbp2(r.monthly); o('financed').textContent = gbp2(r.financed);
    o('interest').textContent = gbp2(r.interest); o('total').textContent = gbp2(r.total);
    o('explain').textContent = term <= 12
      ? `Paid within the 12 interest-free months: ${term} payments of ${gbp2(r.monthly)}, no interest. Illustration only; your lender confirms the final figures.`
      : `${term} equal payments of ${gbp2(r.monthly)}: no interest for the first 12 months, then 9% APR on the remaining balance. ${term} × ${gbp2(r.monthly)} = ${gbp2(r.total)}. Illustration only; your lender confirms the final figures.`;
  }
  fin.addEventListener('input', calc); calc();
}

/* ---------- gallery filter ---------- */
$$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
  const k = b.dataset.filter;
  $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  $$('[data-gallery] li').forEach((li) => { li.hidden = k !== 'all' && li.dataset.space !== k; });
  track('gallery_filter', { filter: k });
}));

/* ---------- YouTube: thumbnail until clicked (no third-party JS on load) ---------- */
$$('[data-yt]').forEach((b) => b.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
  f.title = b.getAttribute('aria-label'); f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
  b.replaceChildren(f); track('video_play');
}, { once: true }));

/* ---------- multi-step quote form ---------- */
const NAMES = ['Your space', 'Your postcode', 'Photos of your floor', 'Your details'];
const PC = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/;
function coverage(pc) {
  const m = pc.toUpperCase().replace(/\s+/g, ' ').trim().match(PC);
  if (!m) return null;
  const out = m[1], area = out.match(/^[A-Z]+/)[0];
  if (C.homePatch[out]) return { ok: true, text: `We cover ${C.homePatch[out]}. You are in our home patch, a short trip from our Middleton base.` };
  if (C.areas[area]) return { ok: true, text: `We cover ${C.areas[area]}. Our own team installs nationwide, with the same preparation standard everywhere.` };
  return { ok: true, text: `We cover ${out}. Rhino installs across the UK with our own team.` };
}
$$('[data-quote]').forEach((form) => {
  let step = 1; const steps = $$('.qf-step', form);
  const bar = $('[data-qf-bar]', form), back = $('[data-qf-back]', form), next = $('[data-qf-next]', form), submit = $('[data-qf-submit]', form);
  const status = $('.form-status', form), cover = $('[data-cover]', form), pc = $('#qf-pc', form);
  let files = [];
  function show(n) {
    step = n;
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    bar.style.width = `${n * 25}%`;
    $('[data-qf-n]', form).textContent = `Step ${n} of 4`; $('[data-qf-name]', form).textContent = NAMES[n - 1];
    back.hidden = n === 1; next.hidden = n === 4; submit.hidden = n !== 4;
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
      else if (i.dataset.kind === 'phone' && v.replace(/\D/g, '').length < 10) m = 'Add a full UK phone number.';
      else if (i === pc && !coverage(v)) m = 'Please enter a full UK postcode, like M20 2AB.';
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
  if (form.dataset.area && pc) pc.placeholder = `Your ${form.dataset.area} postcode`;
  next.addEventListener('click', () => { if (validate(step)) show(step + 1); });
  form.addEventListener('input', (e) => { const f = e.target.closest('.field.bad'); if (f && e.target.value.trim()) err(e.target, ''); });
  back.addEventListener('click', () => show(step - 1));
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < 4) { e.preventDefault(); next.click(); } });

  // Photos: up to 3, previews, remove.
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
    const summary = { space: fd.get('space'), system: fd.get('system'), postcode: (fd.get('postcode') || '').toUpperCase(), photos: files.length, estimate: fd.get('estimate') };
    submit.disabled = true; status.textContent = 'Sending…';
    const F = C.rates.form;
    try {
      if (F.web3formsAccessKey) {
        fd.append('access_key', F.web3formsAccessKey); fd.append('subject', `Quote request: ${summary.space}, ${summary.postcode}`);
        const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd }); if (!r.ok) throw new Error(r.status);
      } else if (F.formspreeEndpoint) {
        const r = await fetch(F.formspreeEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }); if (!r.ok) throw new Error(r.status);
      } // else demo mode: nothing is sent
      track('generate_lead', { space: summary.space, system: summary.system });
      sessionStorage.setItem('rhino_lead', JSON.stringify(summary));
      location.href = '/thank-you';
    } catch {
      submit.disabled = false;
      status.innerHTML = `Sorry, that did not send. Please call <a href="tel:+44${C.phone.replace(/\D/g, '').slice(1)}">${C.phone}</a> or WhatsApp us your photos.`;
    }
  });
  show(1);
});

/* ---------- thank-you summary ---------- */
const ty = $('[data-ty-summary]');
if (ty) {
  try {
    const s = JSON.parse(sessionStorage.getItem('rhino_lead') || 'null');
    if (s) {
      ty.textContent = `${s.space} · ${s.system} · ${s.postcode}${s.photos ? ` · ${s.photos} photo${s.photos > 1 ? 's' : ''}` : ''}${s.estimate ? ` · ${s.estimate}` : ''}`;
      ty.hidden = false;
    }
  } catch { /* storage blocked: summary stays hidden */ }
}

/* ---------- one-time nudge: scroll depth or exit intent ---------- */
const nudge = $('[data-nudge]');
if (nudge && !sessionStorage.getItem('rhino_nudge')) {
  let shown = false;
  const showNudge = () => {
    if (shown || scrollY < innerHeight * 1.5 || sessionStorage.getItem('rhino_est')) return;
    shown = true; sessionStorage.setItem('rhino_nudge', '1'); nudge.hidden = false; track('nudge_shown');
  };
  const sentinel = $('#process');
  if (sentinel) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { showNudge(); o.disconnect(); } }).observe(sentinel);
  document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8) showNudge(); });
  const hide = () => { nudge.hidden = true; };
  $('[data-nudge-x]', nudge).addEventListener('click', hide);
  $('a', nudge).addEventListener('click', hide);
  $('#estimate')?.addEventListener('change', () => sessionStorage.setItem('rhino_est', '1'), { once: true });
}

/* ---------- reveals (below the fold only; content is visible without JS) ---------- */
if (!reduce && 'IntersectionObserver' in window) {
  const els = $$('.sec .h2, .sys, .steps li, .masonry li, .bento-cell, .timings div, .feature-list li').filter((el) => el.getBoundingClientRect().top > innerHeight);
  els.forEach((el) => el.classList.add('rv'));
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
  setTimeout(() => els.forEach((el) => el.classList.add('in')), 4000); // failsafe
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
