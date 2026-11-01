// Shared runtime: personalisation tokens, event tracking, forms, reveals, smooth scroll.
export const SITE = window.__SITE__ || { tokens: {} };
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');

/* ---------- Personalisation from URL (?company=..&town=..) ---------- */
export function personalise() {
  const tokens = SITE.tokens || {};
  const overrides = {};
  const keys = Object.keys(tokens).concat(['Company', 'Town', 'Phone']);
  for (const [k, v] of params) {
    const key = keys.find((t) => t.toLowerCase() === k.toLowerCase());
    if (key && v) overrides[key] = v;
  }
  if (overrides.Phone && !overrides.PhoneTel) overrides.PhoneTel = overrides.Phone.replace(/[^\d+]/g, '');
  if (!Object.keys(overrides).length) return;

  document.querySelectorAll('[data-token]').forEach((el) => {
    const v = overrides[el.dataset.token];
    if (v) { el.textContent = v; el.classList.remove('ph'); }
  });
  const attrs = ['href', 'content', 'alt', 'title', 'aria-label', 'placeholder'];
  document.querySelectorAll('*').forEach((el) => {
    for (const a of attrs) {
      const val = el.getAttribute(a);
      if (val && val.includes('{')) el.setAttribute(a, val.replace(/\{([A-Za-z0-9]+)\}/g, (m, k) => overrides[k] || m));
    }
  });
  // Baked values in the title + meta tags: swap the configured value for the override.
  const swap = (str) => Object.entries(overrides).reduce((acc, [k, v]) => (tokens[k] ? acc.split(tokens[k]).join(v) : acc), str);
  document.title = swap(document.title);
  document.querySelectorAll('meta[content]').forEach((m) => m.setAttribute('content', swap(m.getAttribute('content'))));
  Object.assign(tokens, overrides);
}

/* ---------- Tracking ---------- */
export function track(event, props = {}) {
  const payload = { event, ...props, page: location.pathname };
  (window.dataLayer = window.dataLayer || []).push(payload);
  try { window.gtag && window.gtag('event', event, props); } catch {}
  try { window.fbq && window.fbq('trackCustom', event, props); } catch {}
  const ep = SITE.analytics && SITE.analytics.beaconEndpoint;
  if (ep && navigator.sendBeacon) navigator.sendBeacon(ep, JSON.stringify(payload));
  if (DEBUG) {
    console.info('[track]', payload);
    debugToast(event);
  }
}
function debugToast(text) {
  let host = document.getElementById('debug-events');
  if (!host) {
    host = document.createElement('div');
    host.id = 'debug-events';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  const t = document.createElement('div');
  t.textContent = `event: ${text}`;
  host.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

export function wireCallTracking() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="tel:"]');
    if (a) track('call_click', { location: a.dataset.loc || 'unknown' });
    const q = e.target.closest('[data-cta]');
    if (q) track('cta_click', { cta: q.dataset.cta });
  });
}

/* ---------- Forms ---------- */
const PATTERNS = {
  GB: { phone: /^(\+44\s?|0)\d[\d\s]{8,12}$/, post: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, postLabel: 'postcode' },
  US: { phone: /^(\+1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, post: /^\d{5}(-\d{4})?$/, postLabel: 'ZIP code' },
};
export const pattern = PATTERNS[SITE.country] || PATTERNS.GB;

export function validateField(input) {
  const v = input.value.trim();
  let msg = '';
  if (input.required && !v) msg = input.dataset.req || 'Please fill this in.';
  else if (v && input.type === 'tel' && !pattern.phone.test(v)) msg = 'That number looks short. Check and try again.';
  else if (v && input.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)) msg = 'That email address looks incomplete.';
  else if (v && input.dataset.kind === 'post' && !pattern.post.test(v)) msg = `Enter a full ${pattern.postLabel}.`;
  const err = input.closest('.field')?.querySelector('.err');
  if (err) err.textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

export async function submitLead(data) {
  const ep = SITE.formEndpoint;
  const body = { ...data, company: SITE.tokens?.Company, source: location.href, submittedAt: new Date().toISOString() };
  if (!ep) { await new Promise((r) => setTimeout(r, 750)); return { ok: true, simulated: true }; }
  const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Request failed');
  return { ok: true };
}

export function wireForm(form, { name = 'enquiry', extra = () => ({}), onSuccess } = {}) {
  const inputs = [...form.querySelectorAll('input, textarea, select')].filter((i) => i.name && i.name !== 'website');
  inputs.forEach((i) => i.addEventListener('blur', () => i.value && validateField(i)));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.website && form.website.value) return; // honeypot
    const ok = inputs.map(validateField).every(Boolean);
    if (!ok) { inputs.find((i) => i.getAttribute('aria-invalid') === 'true')?.focus(); return; }
    const btn = form.querySelector('[type=submit]');
    const status = form.querySelector('.form-status');
    btn.disabled = true; btn.classList.add('is-busy');
    if (status) status.textContent = '';
    try {
      const data = {};
      for (const i of inputs) {
        if ((i.type === 'radio' || i.type === 'checkbox') && !i.checked) continue;
        data[i.name] = i.type === 'file' ? [...i.files].map((f) => f.name).join(', ') : i.value.trim();
      }
      await submitLead({ form: name, ...data, ...extra() });
      track('form_submit', { form: name });
      form.classList.add('is-sent');
      onSuccess && onSuccess(data);
    } catch {
      if (status) status.textContent = 'Something went wrong sending that. Please call us instead, or try again.';
      track('form_error', { form: name });
    } finally {
      btn.disabled = false; btn.classList.remove('is-busy');
    }
  });
}

/* ---------- Reveal on scroll (content is visible by default) ---------- */
export function reveals() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const els = [...document.querySelectorAll('[data-reveal]')];
  const vh = innerHeight;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((el) => {
    if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('is-pending'); io.observe(el); }
  });
}

/* ---------- Count-up numbers ---------- */
export function countTo(el, to, { duration = 900, format = (n) => Math.round(n).toLocaleString() } = {}) {
  if (reduceMotion) { el.textContent = format(to); return; }
  const from = Number(el.dataset.current || 0);
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / duration);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = format(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step); else el.dataset.current = to;
  };
  requestAnimationFrame(step);
}

/* ---------- FAQ: one open at a time, animated ---------- */
export function faq(root) {
  root.querySelectorAll('details').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        track('faq_open', { q: d.querySelector('summary').textContent.trim().slice(0, 60) });
        root.querySelectorAll('details[open]').forEach((o) => o !== d && (o.open = false));
      }
    });
  });
}

/* ---------- Sticky header state + mobile bar ---------- */
export function chrome() {
  const header = document.querySelector('.site-header');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:80px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => header?.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);

  const bar = document.querySelector('.mobile-bar');
  const hero = document.querySelector('.hero');
  if (bar && hero) {
    new IntersectionObserver(([e]) => bar.classList.toggle('is-shown', !e.isIntersecting), { threshold: 0.35 }).observe(hero);
  }
}

/* ---------- Smooth wheel scrolling on desktop only ---------- */
export async function smoothScroll() {
  if (reduceMotion || !finePointer) return null;
  const { default: Lenis } = await import('lenis');
  const lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 4) });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -72 }); }
  });
  return lenis;
}

/* ---------- Scroll progress for a tall section (no scroll listener) ---------- */
export function scrollProgress(section, cb) {
  // rAF loop that only runs while the section is on screen.
  let active = false, last = -1, raf = 0;
  const tick = () => {
    const r = section.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    if (Math.abs(p - last) > 0.0005) { last = p; cb(p); }
    if (active) raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (active) raf = requestAnimationFrame(tick);
  }).observe(section);
}

export function daysUntil(dateStr) {
  const d = new Date(dateStr + 'T23:59:59');
  return Math.max(0, Math.ceil((d - new Date()) / 86400000));
}

/* ---------- Date/config-derived values: keep baked text fresh ---------- */
export function refreshDerived(values) {
  for (const [k, v] of Object.entries(values)) {
    document.querySelectorAll(`[data-token="${k}"]`).forEach((el) => { if (el.textContent !== v) el.textContent = v; });
  }
}

/* ---------- When (and whether) to start WebGL ----------
   Desktop: once the page is idle. Touch devices: on the first scroll or tap,
   so the first paint stays fast on mobile data. Software renderers
   (no GPU) get the static posters instead. ?gl=force / ?gl=off override. */
export function whenReadyFor3D() {
  const q = params.get('gl');
  if (q === 'off') return Promise.resolve(false);
  let ok = false, soft = false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (gl) {
      ok = true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      soft = /swiftshader|llvmpipe|software|basic render/i.test(String(name));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {}
  if (!ok || (soft && q !== 'force')) return Promise.resolve(false);
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  return new Promise((resolve) => {
    const go = () => idle(() => resolve(true), { timeout: 1500 });
    if (q === 'force' || finePointer) {
      if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
      return;
    }
    const evs = ['scroll', 'touchstart', 'pointerdown', 'keydown'];
    const once = () => { evs.forEach((e) => removeEventListener(e, once)); go(); };
    evs.forEach((e) => addEventListener(e, once, { passive: true }));
  });
}
