(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // menu
  const mb = $('.menu-btn'), dr = $('#drawer');
  if (mb) mb.addEventListener('click', () => { const o = dr.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });

  // before / after: auto-sweeps once when it scrolls into view, then drag / keys / tabs
  const ba = $('.ba');
  if (ba) {
    const range = $('input', ba), pairs = JSON.parse(ba.dataset.pairs || '[]'), af = $('.af', ba), bf = $('.bf', ba), cap = $('.ba-cap');
    let raf = 0, touched = false;
    const set = (p) => { p = Math.max(0, Math.min(100, p)); ba.style.setProperty('--p', p + '%'); range.value = p; };
    const stop = () => { touched = true; cancelAnimationFrame(raf); };
    const sweep = () => {
      if (RM || touched) return;
      const keys = [[0, 50], [900, 88], [2000, 12], [3000, 50]], t0 = performance.now();
      const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      const tick = (now) => {
        if (touched) return;
        const t = now - t0; let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++;
        const [ta, pa] = keys[i - 1], [tb, pb] = keys[i];
        set(pa + (pb - pa) * ease(Math.min(1, Math.max(0, (t - ta) / (tb - ta)))));
        if (t < keys[keys.length - 1][0]) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const fromX = (x) => { const r = ba.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
    let drag = false, sx = 0, sy = 0, decided = false;
    ba.addEventListener('pointerdown', (e) => { stop(); drag = true; decided = e.pointerType === 'mouse'; sx = e.clientX; sy = e.clientY; if (decided) { fromX(e.clientX); ba.setPointerCapture(e.pointerId); } });
    ba.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (!decided) { const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy); if (dx < 6 && dy < 6) return; if (dy > dx) { drag = false; return; } decided = true; ba.setPointerCapture(e.pointerId); }
      fromX(e.clientX);
    });
    const end = (e) => { if (drag && !decided && e.type === 'pointerup') fromX(e.clientX); drag = false; };
    ba.addEventListener('pointerup', end); ba.addEventListener('pointercancel', end);
    ba.addEventListener('touchmove', (e) => { if (decided && drag) e.preventDefault(); }, { passive: false });
    range.addEventListener('input', () => { stop(); set(+range.value); });
    ba.tabIndex = 0;
    ba.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { stop(); set(+range.value + (e.key === 'ArrowLeft' ? -4 : 4)); e.preventDefault(); } });
    $$('.ba-tabs button').forEach((b) => b.addEventListener('click', () => {
      $$('.ba-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b));
      const p = pairs[+b.dataset.i];
      af.srcset = p.a; bf.srcset = p.b; af.src = p.a.split(' ')[0]; bf.src = p.b.split(' ')[0];
      if (cap) cap.textContent = p.cap || '';
      touched = false; set(50); sweep();
    }));
    set(50);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); setTimeout(sweep, 250); } }, { threshold: .55 });
      io.observe(ba);
    }
  }

  // reviews: read more + rail arrows
  $$('.rv').forEach((r) => { const t = $('.tx', r), b = $('.rm', r); if (t && b && t.scrollHeight > t.clientHeight + 4) { b.hidden = false; b.addEventListener('click', () => { const o = r.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read more'; }); } });
  $$('[data-rail]').forEach((b) => b.addEventListener('click', () => { const rail = b.closest('section').querySelector('.rail'); rail.scrollBy({ left: +b.dataset.rail * rail.clientWidth * 0.9, behavior: 'smooth' }); }));

  // 5-tap quote pop-up
  const dlg = $('#qm');
  if (!dlg) return;
  const f = $('form', dlg), steps = $$('fieldset', f), bars = $$('.steps i', dlg), bk = $('.bk', dlg);
  const ans = {};
  let cur = 0;
  const show = (i) => { cur = i; steps.forEach((s, j) => s.classList.toggle('cur', j === i)); bars.forEach((b, j) => b.classList.toggle('on', j <= i)); bk.classList.toggle('on', i > 0 && i < steps.length); const fb = $('button,input', steps[i]); if (fb && matchMedia('(hover:hover)').matches) fb.focus({ preventScroll: true }); if (i === 4) $('.sum', f).textContent = [ans.service, ans.size, ans.when, ans.town].filter(Boolean).join(' · '); };
  const open = (pre) => {
    if (pre) { ans.service = pre; $$('[data-k=service] button', f).forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === pre)); }
    show(pre ? 1 : 0);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => { dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  dlg.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
  $$('[data-quote]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(a.dataset.quote || ''); }));
  if (location.hash === '#quote') setTimeout(() => open(), 300);
  $('.x', dlg).addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  bk.addEventListener('click', () => show(Math.max(0, cur - 1)));
  $$('fieldset[data-k] .opts button', f).forEach((b) => b.addEventListener('click', () => {
    const fs = b.closest('fieldset'), k = fs.dataset.k;
    $$('button', fs).forEach((x) => x.setAttribute('aria-pressed', x === b));
    ans[k] = b.dataset.v;
    setTimeout(() => show(steps.indexOf(fs) + 1), 160);
  }));
  const err = (n, on) => { const e = $(`.err[data-for=${n}]`, f); if (e) e.classList.toggle('on', on); const i = f.elements[n]; if (i) i.setAttribute('aria-invalid', on); };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    for (const n of ['name', 'phone']) { const v = f.elements[n].value.trim(); const bad = !v || (n === 'phone' && v.replace(/\D/g, '').length < 10); err(n, bad); if (bad && ok) { f.elements[n].focus(); ok = false; } }
    if (!ok) return;
    const btn = $('.send', f); btn.disabled = true; btn.textContent = 'Booking…'; err('send', false);
    const fd = new FormData(f);
    Object.entries(ans).forEach(([k, v]) => fd.set(k, v));
    fd.set('page', location.pathname);
    const name = f.elements.name.value.trim().split(' ')[0].replace(/[<>&"]/g, '');
    const msg = `Hi, I'm ${f.elements.name.value.trim()}. I'd like a free quote: ${[ans.service, ans.size, ans.when, ans.town].filter(Boolean).join(', ')}.`;
    try {
      const r = await fetch('/api/quote', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await r.json();
      if (!r.ok || !j.ok) throw 0;
      const wa = dlg.dataset.wa;
      f.innerHTML = `<div class="done" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><h3>Thanks ${name}, you're booked in</h3><p>We'll call you back to arrange your free quote.</p>${wa ? `<a class="btn line" href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Send photos on WhatsApp</a>` : ''}</div>`;
      bars.forEach((b) => b.classList.add('on')); bk.classList.remove('on');
    } catch { err('send', true); btn.disabled = false; btn.textContent = 'Book my free quote'; }
  });
})();
