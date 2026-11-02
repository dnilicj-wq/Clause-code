// Scroll-driven exploded layer stack (CSS 3D, transforms only).
// Phases over the section's scroll length:
//   0.00-0.12 assembled floor · 0.12-0.30 layers separate · 0.30-0.82 each layer
//   lights up with its label and benefit, bottom to top · 0.82-1.00 locks back together.
// The rAF loop only runs while the section is on screen.
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);

export default function init(section) {
  const slabs = [...section.querySelectorAll('.slab')];
  const items = [...section.querySelectorAll('[data-li]')];
  const stack = section.querySelector('[data-stack]');
  const n = slabs.length;
  let raf = 0, live = false, lastActive = -2;

  function frame() {
    const r = section.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    const mobile = innerWidth < 860;
    const G = mobile ? 24 : 44;
    let spread;
    if (p < 0.12) spread = 0;
    else if (p < 0.3) spread = ease((p - 0.12) / 0.18);
    else if (p < 0.82) spread = 1;
    else spread = 1 - ease(clamp((p - 0.82) / 0.14, 0, 1));
    const gap = spread * G;
    for (let i = 0; i < n; i++) slabs[i].style.transform = `translateZ(${i * 6 + gap * i}px)`;
    stack.style.transform = `rotateX(${58 - spread * 6}deg) rotateZ(${-38 + p * 10}deg) translateZ(${-spread * G * 2.2}px)`;

    let active = -1;
    if (p >= 0.3 && p < 0.82) active = Math.min(n - 1, Math.floor(((p - 0.3) / 0.52) * n));
    else if (p >= 0.82) active = n; // finished floor: everything lit
    if (active !== lastActive) {
      lastActive = active;
      slabs.forEach((s, i) => s.classList.toggle('on', i === active));
      items.forEach((li) => {
        const i = +li.dataset.li;
        li.classList.toggle('on', active === n ? i === n - 1 : i === active);
      });
    }
    if (live) raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    live = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (live) raf = requestAnimationFrame(frame);
  }).observe(section);
  slabs.forEach((s) => { s.style.transition = 'none'; });
  frame();
}
