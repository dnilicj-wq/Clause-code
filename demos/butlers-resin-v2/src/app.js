(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // menu
  const mb = $('.menu-btn'), dr = $('#drawer');
  if (mb) mb.addEventListener('click', () => { const o = dr.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  $$('#drawer a').forEach((a) => a.addEventListener('click', () => { dr.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }));

  // hero video: poster paints first, video only after load, skipped on Save-Data / reduced motion
  const v = $('.hero-media video');
  if (v) {
    const c = navigator.connection || {};
    const skip = c.saveData || /2g/.test(c.effectiveType || '') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const go = () => { v.src = v.dataset.src; v.play().catch(() => {}); };
    v.addEventListener('playing', () => v.classList.add('on'), { once: true });
    if (!skip) addEventListener('load', () => setTimeout(go, 1200), { once: true });
  }

  // before / after
  const ba = $('.ba');
  if (ba) {
    const range = $('input', ba), pairs = JSON.parse(ba.dataset.pairs), af = $('.af', ba), bf = $('.bf', ba);
    const set = (p) => { p = Math.max(0, Math.min(100, p)); ba.style.setProperty('--p', p + '%'); range.value = p; };
    const fromX = (x) => { const r = ba.getBoundingClientRect(); set(((x - r.left) / r.width) * 100); };
    let drag = false, sx = 0, sy = 0, decided = false;
    ba.addEventListener('pointerdown', (e) => { drag = true; decided = e.pointerType === 'mouse'; sx = e.clientX; sy = e.clientY; if (decided) { fromX(e.clientX); ba.setPointerCapture(e.pointerId); } });
    ba.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (!decided) { const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy); if (dx < 6 && dy < 6) return; if (dy > dx) { drag = false; return; } decided = true; ba.setPointerCapture(e.pointerId); }
      fromX(e.clientX);
    });
    const end = (e) => { if (drag && !decided && e.type === 'pointerup') fromX(e.clientX); drag = false; };
    ba.addEventListener('pointerup', end); ba.addEventListener('pointercancel', end);
    // touch: stop the page scrolling sideways once a horizontal drag is decided
    ba.addEventListener('touchmove', (e) => { if (decided && drag) e.preventDefault(); }, { passive: false });
    range.addEventListener('input', () => set(+range.value));
    ba.tabIndex = 0;
    ba.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { set(+range.value - 4); e.preventDefault(); } if (e.key === 'ArrowRight') { set(+range.value + 4); e.preventDefault(); } });
    $$('.ba-tabs button').forEach((b) => b.addEventListener('click', () => {
      $$('.ba-tabs button').forEach((x) => x.setAttribute('aria-selected', x === b));
      const p = pairs[+b.dataset.i];
      af.srcset = p.a; bf.srcset = p.b; af.src = p.a.split(' ')[0]; bf.src = p.b.split(' ')[0];
      set(50);
    }));
    set(50);
  }

  // driveway designer
  const dz = $('#design');
  let design = '';
  if (dz) {
    const fill = $('#pv-fill'), border = $('#pv-border rect'), cmp = $('#pv-cmp'), bg = $('#pv-border');
    const upd = () => {
      const b = $('input[name=dz-blend]:checked', dz), e = $('input[name=dz-border]:checked', dz), c = $('#dz-cmp').checked;
      fill.setAttribute('fill', `url(#r-${b.value})`);
      bg.style.display = e.value === 'none' ? 'none' : '';
      if (e.value !== 'none') border.setAttribute('stroke', `url(#${e.value})`);
      cmp.style.display = c ? '' : 'none';
      $('#pv-b').textContent = b.dataset.name; $('#pv-e').textContent = e.dataset.name; $('#pv-c').textContent = c ? 'Yes' : 'No';
      design = `Blend: ${b.dataset.name} · Border: ${e.dataset.name} · Compass inlay: ${c ? 'yes' : 'no'}`;
    };
    dz.addEventListener('change', upd); upd();
    $('#dz-send').addEventListener('click', () => {
      const f = $('#quote form'); if (!f) return;
      f.design.value = design;
      const ch = $('.chip', f); ch.classList.add('on'); $('span', ch).textContent = 'Your design: ' + design;
      const r = $('input[name=type][value=Driveway]', f); if (r) r.checked = true;
    });
  }

  // reviews: read more + rail arrows
  $$('.rv').forEach((r) => { const t = $('.tx', r), b = $('.rm', r); if (t.scrollHeight > t.clientHeight + 4) { b.hidden = false; b.addEventListener('click', () => { const o = r.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read more'; }); } });
  $$('[data-rail]').forEach((b) => b.addEventListener('click', () => { const rail = b.closest('.wrap').querySelector('.rail'); rail.scrollBy({ left: +b.dataset.rail * rail.clientWidth * 0.9, behavior: 'smooth' }); }));

  // quote form
  $$('.qform').forEach((f) => {
    f.page.value = location.pathname;
    const steps = $$('fieldset', f), bars = $$('.steps i', f);
    let cur = 0, files = [];
    const show = (i) => { steps.forEach((s, j) => s.classList.toggle('cur', j === i)); bars.forEach((b, j) => b.classList.toggle('on', j <= i)); cur = i; const lg = $('legend', steps[i]); if (f.getBoundingClientRect().top < 0) f.scrollIntoView({ block: 'start' }); };
    const err = (n, on) => { const e = $(`.err[data-for=${n}]`, f); if (e) e.classList.toggle('on', on); const i = f.elements[n]; if (i && i.setAttribute && i.tagName) i.setAttribute('aria-invalid', on); };
    const valid = (i) => {
      if (i === 0) { const ok = !!$('input[name=type]:checked', f); err('type', !ok); return ok; }
      if (i === 2) { let ok = true; for (const n of ['name', 'phone', 'postcode']) { const v = f.elements[n].value.trim(); const bad = !v || (n === 'phone' && v.replace(/\D/g, '').length < 10) || (n === 'postcode' && v.replace(/\s/g, '').length < 5); err(n, bad); if (bad && ok) { f.elements[n].focus(); ok = false; } } return ok; }
      return true;
    };
    $$('.next', f).forEach((b) => b.addEventListener('click', () => { if (valid(cur)) show(cur + 1); }));
    $$('.back', f).forEach((b) => b.addEventListener('click', () => show(cur - 1)));
    $$('input[name=type]', f).forEach((r) => r.addEventListener('change', () => err('type', false)));
    // photos: shrink on the phone before upload
    const fi = $('input[type=file]', f), th = $('.thumbs', f);
    fi.addEventListener('change', async () => {
      const list = [...fi.files].filter((x) => x.type.startsWith('image/')).slice(0, 6);
      files = []; th.innerHTML = '';
      for (const x of list) {
        try {
          const bmp = await createImageBitmap(x, { imageOrientation: 'from-image' });
          const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
          const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
          c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
          const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
          files.push(new File([blob], x.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
        } catch { files.push(x); }
        const im = new Image(); im.alt = ''; im.src = URL.createObjectURL(files[files.length - 1]); th.appendChild(im);
      }
      $('.drop span', f).textContent = files.length ? `${files.length} photo${files.length > 1 ? 's' : ''} added. Tap to change` : 'Tap to add photos';
    });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!valid(0)) return show(0);
      if (!valid(2)) return;
      const btn = $('.send', f); btn.disabled = true; btn.textContent = 'Sending…'; err('send', false);
      const fd = new FormData(f); fd.delete('photos'); files.forEach((x) => fd.append('photos', x));
      try {
        const r = await fetch(f.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.error || 'failed');
        const name = f.elements.name.value.trim().split(' ')[0];
        f.innerHTML = `<div class="done" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><h3>Thanks ${name.replace(/[<>&]/g, '')}, it's with us</h3><p>We'll be in touch to arrange a look at the job and your free quote.</p><p class="alt-call">Need us sooner? Call <a href="tel:+443333399898">0333 339 9898</a></p></div>`;
        f.scrollIntoView({ block: 'center' });
      } catch { err('send', true); btn.disabled = false; btn.textContent = 'Get my free quote'; }
    });
  });
})();
