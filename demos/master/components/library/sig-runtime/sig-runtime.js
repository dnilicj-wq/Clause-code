// Shared runtime for the signature sections (layer-build, step-rail, benefit-illustrations,
// proof-tiles, guarantee-stack, owner-signature). Plain JS, no dependencies, ~1.5KB.
//
//  [data-sig-scroll]          scroll-linked: sets --p (0..1) on the element while it is on screen.
//                             data-sig-mode="enter" (default): 0 when its top is at data-a × viewport
//                             height (default .95), 1 when its top reaches data-b (default .3).
//                             data-sig-mode="rail": 0 when its top crosses 65% of the viewport,
//                             1 when its bottom does (for tall timelines).
//    [data-at] (inside)       gets .on once --p >= data-at (step circles, stage labels).
//  [data-sig-play]            gets .is-playing while on screen (CSS loops run only then) and .is-in once.
//  [data-sig-in]              gets .is-in the first time it is on screen (one-shot draws).
//
// prefers-reduced-motion: everything is set to its finished state, nothing moves.
// Off-screen: no scroll work at all (IntersectionObserver gates the rAF loop).
/** @param {ParentNode} [root] @returns {() => void} */
export function initSig(root = document) {
  const q = (s) => [...root.querySelectorAll(s)];
  const scrollEls = q('[data-sig-scroll]');
  const RM = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (RM || !('IntersectionObserver' in window)) {
    scrollEls.forEach((el) => { el.style.setProperty('--p', 1); el.querySelectorAll('[data-at]').forEach((s) => s.classList.add('on')); });
    q('[data-sig-play],[data-sig-in]').forEach((el) => el.classList.add('is-in'));
    return () => {};
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.target.hasAttribute('data-sig-play')) e.target.classList.toggle('is-playing', e.isIntersecting);
    if (e.isIntersecting) e.target.classList.add('is-in');
  }), { threshold: 0.3 });
  q('[data-sig-play],[data-sig-in]').forEach((el) => io.observe(el));

  const vis = new Set();
  const steps = new Map(scrollEls.map((el) => [el, [...el.querySelectorAll('[data-at]')]]));
  let raf = 0;
  const calc = (el) => {
    const r = el.getBoundingClientRect(), vh = innerHeight;
    let p;
    if (el.dataset.sigMode === 'rail') p = (vh * 0.65 - r.top) / Math.max(1, r.height);
    else { const a = +(el.dataset.a || 0.95), b = +(el.dataset.b || 0.3); p = (vh * a - r.top) / (vh * (a - b)); }
    p = Math.max(0, Math.min(1, p));
    if (el._p !== p) {
      el._p = p; el.style.setProperty('--p', p.toFixed(4));
      steps.get(el).forEach((s) => s.classList.toggle('on', p >= +s.dataset.at));
    }
  };
  const frame = () => { raf = 0; vis.forEach(calc); };
  const req = () => { if (!raf && vis.size) raf = requestAnimationFrame(frame); };
  const io2 = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) vis.add(e.target); else { vis.delete(e.target); calc(e.target); } }); req(); }, { rootMargin: '15% 0px' });
  scrollEls.forEach((el) => { el.style.setProperty('--p', 0); io2.observe(el); });
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  return () => { io.disconnect(); io2.disconnect(); removeEventListener('scroll', req); removeEventListener('resize', req); };
}
