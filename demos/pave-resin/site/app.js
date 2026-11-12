(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // below-the-fold SVG textures (resin card): fetch when near, so the hero poster gets the bandwidth first
  { const lz = $$('image[data-lzh]'); const go = (i) => i.setAttribute('href', i.dataset.lzh);
    if (lz.length && 'IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); $$('image[data-lzh]', e.target).forEach(go); } }), { rootMargin: '900px 0px' }); lz.forEach((i) => io.observe(i.closest('svg'))); } else lz.forEach(go); }

  // menu
  const mb = $('.menu-btn'), dr = $('#drawer');
  if (dr && $(".dx", dr)) document.body.append(dr);
  const setMenu = (o) => { dr.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); if ($('.dx', dr)) document.documentElement.classList.toggle('menu-lock', o); if (o && $('.dx', dr)) $('.dx', dr).focus(); };
  if (mb) { mb.addEventListener('click', () => setMenu(!dr.classList.contains('open'))); dr.addEventListener('click', (e) => { if (e.target.closest('a,.dx')) setMenu(false); }); addEventListener('keydown', (e) => { if (e.key === 'Escape' && dr.classList.contains('open')) { setMenu(false); mb.focus(); } }); }

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

  // inline 5-step quote form
  const forms = $$('.qf');
  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>';
  const ctl = forms.map((f) => {
    const steps = $$('fieldset', f), bar = $('.qbar i', f), lbl = $('.qstep', f), bk = $('.qbk', f), chip = $('.chip', f);
    const ans = {}, N = steps.length;
    let cur = 0;
    const qv = $('.qview', f), kids = [...qv.children], sendB = $('.send', f), sendT = sendB ? sendB.firstChild.textContent : '';
    const done = (html) => { kids.forEach((k) => { k.style.display = 'none'; }); const d = document.createElement('div'); d.className = 'qdone-w'; d.innerHTML = html; qv.append(d); };
    const show = (i, dir = 1) => {
      cur = Math.max(0, Math.min(N - 1, i)); f.classList.add('moved');
      steps.forEach((s, j) => { s.classList.toggle('cur', j === cur); s.classList.toggle('back', j === cur && dir < 0); });
      bar.style.width = ((cur + 1) / N) * 100 + '%';
      lbl.textContent = `Step ${cur + 1} of ${N}`;
      bk.classList.toggle('on', cur > 0);
      const k = steps[cur].dataset.k;
      $$('button[data-v]', steps[cur]).forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === ans[k]));
      if (k === 'contact') $('.sum', f).textContent = [ans.service, ans.size, ans.surface, ans.postcode].filter(Boolean).join(' · ');
      if (k === 'postcode' && matchMedia('(hover:hover)').matches) f.elements.postcode.focus({ preventScroll: true });
    };
    const err = (n, on) => { const e = $(`.err[data-for=${n}]`, f); if (e) e.classList.toggle('on', on); const i = f.elements[n]; if (i) i.setAttribute('aria-invalid', on); };
    bk.addEventListener('click', () => show(cur - 1, -1));
    $$('fieldset[data-k] button[data-v]', f).forEach((b) => b.addEventListener('click', () => {
      const fs = b.closest('fieldset');
      ans[fs.dataset.k] = b.dataset.v;
      $$('button[data-v]', fs).forEach((x) => x.setAttribute('aria-pressed', x === b));
      setTimeout(() => show(steps.indexOf(fs) + 1), 140);
    }));
    const pcOk = () => { const v = f.elements.postcode.value.trim().toUpperCase().replace(/\s+/g, ' '); const ok = /^[A-Z]{1,2}\d[A-Z\d]?( ?\d[A-Z]{2})?$/.test(v); err('postcode', !ok); if (ok) ans.postcode = v; return ok; };
    $('.qnext', f).addEventListener('click', () => { if (pcOk()) show(cur + 1); });
    f.elements.postcode.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (pcOk()) show(cur + 1); } });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cur !== N - 1) return;
      let ok = true;
      for (const n of ['name', 'phone']) { const v = f.elements[n].value.trim(); const bad = !v || (n === 'phone' && v.replace(/\D/g, '').length < 10); err(n, bad); if (bad && ok) { f.elements[n].focus(); ok = false; } }
      if (!ok) return;
      const btn = $('.send', f); btn.disabled = true; btn.firstChild.textContent = 'Sending… '; err('send', false);
      const fd = new FormData(f);
      Object.entries(ans).forEach(([k, v]) => fd.set(k, v));
      fd.set('page', location.pathname);
      const full = f.elements.name.value.trim(), first = full.split(' ')[0].replace(/[<>&"]/g, ''), own = f.dataset.owner;
      const msg = `Hi ${own}, it's ${full}. I've just asked for a free quote: ${[ans.service, ans.size, ans.surface, ans.postcode].filter(Boolean).join(', ')}${ans.design ? '. Design: ' + ans.design : ''}.`;
      if (f.dataset.direct) {
        const dm = `Hi ${own}, it's ${full}. I'd like to book a ${f.dataset.word}: ${[ans.service, ans.size, ans.surface, ans.postcode].filter(Boolean).join(', ')}${ans.design ? '. Design: ' + ans.design : ''}. My number is ${f.elements.phone.value.trim()}.`;
        const wu = `https://wa.me/${f.dataset.wa}?text=${encodeURIComponent(dm)}`;
        window.open(wu, '_blank', 'noopener');
        fetch('/api/quote', { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(() => {});
        bar.style.width = '100%'; lbl.textContent = 'Done'; bk.classList.remove('on'); chip.hidden = true;
        done(`<div class="qdone" role="status"><svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><h3>Thanks ${first}. ${f.dataset.done || ''}</h3><p>WhatsApp should have opened with your details. If it didn't, tap below.</p><a class="btn wide" href="${wu}" target="_blank" rel="noopener">${WA_SVG}Send on WhatsApp</a></div>`);
        return;
      }
      try {
        const r = await fetch('/api/quote', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const j = await r.json();
        if (!r.ok || !j.ok) throw 0;
        bar.style.width = '100%'; lbl.textContent = 'Done'; bk.classList.remove('on'); chip.hidden = true;
        done(`<div class="qdone" role="status"><svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><h3>Thanks ${first}, ${own} will call you today</h3><p>Want to send photos of the job in the meantime?</p>${f.dataset.wa ? `<a class="btn wide" href="https://wa.me/${f.dataset.wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${WA_SVG}WhatsApp ${own}</a>` : ''}</div>`);
      } catch { err('send', true); btn.disabled = false; btn.firstChild.textContent = 'Get my free quote '; }
    });
    show(0);
    return {
      f,
      reset() { // a fresh form every time the pop-up opens again
        $$('.qdone-w', qv).forEach((d) => d.remove()); kids.forEach((k) => { k.style.display = ''; });
        f.reset(); Object.keys(ans).forEach((k) => delete ans[k]); if (f.elements.design) f.elements.design.value = '';
        chip.hidden = true; if (sendB) { sendB.disabled = false; sendB.firstChild.textContent = sendT; }
        $$('.err.on', f).forEach((e) => e.classList.remove('on')); $$('[aria-invalid=true]', f).forEach((e) => e.setAttribute('aria-invalid', 'false'));
        $$('button[aria-pressed=true]', f).forEach((b) => b.setAttribute('aria-pressed', 'false'));
        f.classList.remove('moved'); show(0);
      },
      preset(service, design) {
        if (service) ans.service = service;
        ans.design = design || '';
        f.elements.design.value = ans.design;
        if (design) { chip.hidden = false; $('span', chip).textContent = 'Your design: ' + design; }
        show(service && cur === 0 ? 1 : cur);
      },
      pick(service) { if (cur === 0 && service) { ans.service = service; show(1); } },
    };
  });
  const main = ctl[0];
  const goQuote = () => { if (window.cgBook) return window.cgBook(); const t = main && main.f.closest('.qcard'); if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); };
  $$('[data-quote]').forEach((a) => a.addEventListener('click', (e) => { if (!main) return; e.preventDefault(); main.pick(a.dataset.quote); goQuote(); }));
  window.cgQuote = (service, design) => { if (!main) return; main.preset(service, design); goQuote(); };

  // ---------- booking modal: every quote button opens the 5-step form in a <dialog> ----------
  const bkDlg = $('dialog.bk');
  if (bkDlg) {
    const bkForm = ctl.find((c) => bkDlg.contains(c.f));
    const close = () => { bkDlg.classList.add('closing'); setTimeout(() => { bkDlg.classList.remove('closing'); bkDlg.close(); }, RM ? 0 : 200); };
    bkDlg.addEventListener('close', () => { if (bkForm) bkForm.reset(); });
    $('.bkx', bkDlg).addEventListener('click', close);
    bkDlg.addEventListener('click', (e) => { if (e.target === bkDlg) close(); });
    bkDlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    window.cgBook = () => { if (!bkDlg.open) { bkDlg.showModal(); const t = $('.qf fieldset.cur button, .qf fieldset.cur input', bkDlg); if (t && matchMedia('(hover:hover)').matches) t.focus({ preventScroll: true }); } };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#quote"], a[href="/#quote"], [data-book]');
      if (!a || a.classList.contains('hp-go')) return;
      e.preventDefault();
      if (dr && dr.classList.contains('open')) setMenu(false);
      if (a.dataset.quote && main) main.pick(a.dataset.quote);
      window.cgBook();
    });
  }

  // ---------- hero surface picker: live procedural surface in perspective ----------
  // ---------- hero: lay the surface in 3D (three.js engine, lazy) over an instant poster ----------
  const hg = $('.hpk');
  if (hg && $('.hp-gl', hg)) {
    const tiles = $$('.hp-tiles button', hg), val = $('.hp-v', hg), cv = $('.hp-gl', hg);
    const coarse = matchMedia('(pointer:coarse)').matches, V = (($('script[src^="/app.js"]') || {}).src || '').split('v=')[1] || '';
    let sel = tiles[0].dataset.s, api = null;
    const choose = (b) => {
      tiles.forEach((t) => { t.setAttribute('aria-checked', t === b); t.tabIndex = t === b ? 0 : -1; });
      if (sel === b.dataset.s && api) return;
      sel = b.dataset.s; val.textContent = b.dataset.label; hg.dataset.s = sel;
      if (api) api.auto(sel); // the new surface lays itself over the whole hero
    };
    tiles.forEach((b) => b.addEventListener('click', () => choose(b)));
    $('.hp-tiles', hg).addEventListener('keydown', (e) => {
      const i = tiles.findIndex((t) => t.getAttribute('aria-checked') === 'true'), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return; e.preventDefault(); const n = tiles[(i + d + tiles.length) % tiles.length]; choose(n); n.focus();
    });
    tiles.forEach((t, i) => t.tabIndex = i ? -1 : 0);
    const cur = () => tiles.find((t) => t.dataset.s === sel);
    $('.hp-go', hg).addEventListener('click', () => { const b = cur(); if (main) main.preset(b.dataset.tile, b.dataset.label); if (window.cgBook) window.cgBook(); });
    $('.hp-see', hg).addEventListener('click', () => { const c = cur().dataset.cfg; if (c) { window.__cfgPre = c; if (window.cgCfgSet) window.cgCfgSet(c); } });
    const start = async () => {
      if (RM) return; // reduced motion: the poster is the finished still
      try { const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) return; } catch { return; }
      try {
        const m = await import('/hero3d.js?v=' + V);
        api = m.initHero(hg, cv, { bg: '#0B0C0F', tex: '/tex/', worker: '/hero3d-tex.js?v=' + V, light: window.__hpLight,
          onLost: () => hg.classList.remove('gl') });
        if (!api) return;
        window.__hp = api;
        const go = () => { if (!api.loaded) return setTimeout(go, 50); api.auto(sel, true); api.prebuild(sel); requestAnimationFrame(() => requestAnimationFrame(() => { hg.classList.add('gl'); window.__heroReady = true; })); };
        go();
      } catch (e) { /* the poster stays */ }
    };
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 600 }) : setTimeout(start, 120));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }
  const hp = $('.hpk');
  if (hp && !$('.hp-gl', hp)) {
    const tiles = $$('.hp-tiles button', hp), val = $('.hp-v', hp), cvs = [$('.hp-a', hp), $('.hp-b', hp)], sweep = $('.hp-sweep', hp);
    const small = innerWidth < 760, TW = small ? 1536 : 2048, TH = Math.round(TW * 1.5);
    // each material framed at a scale where it reads as itself: metres across the plane
    const M = { resin: 2.6, tarmac: 4, block: 7.5, porcelain: 10 };
    const cache = {}, wait = {}; let front = 0, sel = tiles[0].dataset.s, worker = null, seq = 0;
    const swatchFrom = (bmp, b) => { let q; const c = document.createElement('canvas'); c.width = 120; c.height = 64; c.getContext('2d').drawImage(bmp, bmp.width * 0.4, bmp.height * 0.7, bmp.width * (q = { resin: 0.07, tarmac: 0.1, block: 0.22 }[b.dataset.s] || 0.4), bmp.width * q * 64 / 120, 0, 0, 120, 64); const i = $('.hp-sw', b); i.style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.8)})`; i.classList.add('on'); };
    const gen = (kind) => cache[kind] ? Promise.resolve(cache[kind]) : (wait[kind] ||= new Promise((res) => {
      const id = ++seq;
      const done = async (w, h, d, blob) => { const bmp = blob ? await createImageBitmap(blob) : await createImageBitmap(new ImageData(new Uint8ClampedArray(d.buffer), w, h)); swatchFrom(bmp, tiles.find((t) => t.dataset.s === kind)); if (blob) { cache[kind] = blob; bmp.close && bmp.close(); } else cache[kind] = bmp; res(cache[kind]); };
      worker.addEventListener('message', function on(e) { if (e.data.id !== id) return; worker.removeEventListener('message', on); done(e.data.w, e.data.h, e.data.d, e.data.blob); });
      worker.postMessage({ id, kind, w: TW, h: TH, m: M[kind] || 4, seed: 7 });
    }));
    const paint = async (kind, first) => {
      const src = await gen(kind); if (kind !== sel) return; const bmp = src instanceof Blob ? await createImageBitmap(src) : src; if (kind !== sel) return;
      const back = cvs[1 - front]; back.width = bmp.width; back.height = bmp.height; back.getContext('2d').drawImage(bmp, 0, 0); if (src instanceof Blob && bmp.close) bmp.close();
      back.classList.add('on'); cvs[front].classList.remove('on'); front = 1 - front;
      if (!first && !RM) { sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go'); }
      hp.classList.add('live');
    };
    const choose = (b) => {
      tiles.forEach((t) => t.setAttribute('aria-checked', t === b));
      sel = b.dataset.s; val.textContent = b.dataset.label; hp.dataset.s = sel;
      if (worker) paint(sel);
    };
    tiles.forEach((b) => b.addEventListener('click', () => choose(b)));
    $('.radiogroup, .hp-tiles', hp).addEventListener('keydown', (e) => {
      const i = tiles.findIndex((t) => t.getAttribute('aria-checked') === 'true'), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return; e.preventDefault(); const n = tiles[(i + d + tiles.length) % tiles.length]; choose(n); n.focus();
    });
    tiles.forEach((t, i) => t.tabIndex = i ? -1 : 0);
    const cur = () => tiles.find((t) => t.dataset.s === sel);
    $('.hp-go', hp).addEventListener('click', () => { const b = cur(); if (main) main.preset(b.dataset.tile, b.dataset.label); if (window.cgBook) window.cgBook(); });
    $('.hp-see', hp).addEventListener('click', () => { const c = cur().dataset.cfg; if (c) { window.__cfgPre = c; if (window.cgCfgSet) window.cgCfgSet(c); } });
    // start once the page has loaded so the renderer never competes with first paint
    const start = () => {
      try { worker = new Worker('/surface-worker.js'); } catch { return; }
      paint(sel, true).then(() => {
        const rest = tiles.map((t) => t.dataset.s).filter((k) => k !== sel);
        const next = () => { const k = rest.shift(); if (k) gen(k).then(() => setTimeout(next, 120)); };
        next();
      });
    };
    if (document.readyState === 'complete') setTimeout(start, 60); else addEventListener('load', () => setTimeout(start, 60), { once: true });
    // desktop: slow drift + slight pointer parallax
    if (!RM && matchMedia('(pointer:fine) and (min-width:900px)').matches) {
      const pl = $('.hp-plane', hp);
      hp.addEventListener('pointermove', (e) => { const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5; pl.style.setProperty('--px', (dx * -14).toFixed(1) + 'px'); pl.style.setProperty('--py', (dy * -8).toFixed(1) + 'px'); });
    }
  }

  // Lamp CTA finale: the light switches on and spreads when it scrolls into view (replays), see lamp.css
  $$('[data-lamp]').forEach((el) => {
    if (RM || !('IntersectionObserver' in window)) { el.classList.add('is-on'); return; }
    new IntersectionObserver(([e]) => el.classList.toggle('is-on', e.isIntersecting), { threshold: 0.2 }).observe(el);
  });

  // configurator: load only when scrolled near
  const cfg = $('.cfg');
  if (cfg) {
    let done = false;
    const load = () => { if (done) return; done = true; const sc = document.createElement('script'); sc.src = cfg.dataset.src || '/cfg.js'; document.body.appendChild(sc); };
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '900px 0px' }); io.observe(cfg); }
    else load();
  }

  // gallery: filter chips + lightbox
  $$('.gchips').forEach((g) => {
    const grid = g.nextElementSibling;
    g.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', g).forEach((x) => x.setAttribute('aria-pressed', x === b)); $$('.gi', grid).forEach((fg) => { fg.hidden = !!b.dataset.f && fg.dataset.cat !== b.dataset.f; }); });
  });
  const lb = $('.lbox');
  if (lb) {
    $$('.gzoom').forEach((b) => b.addEventListener('click', () => { const im = $('img', lb); im.src = b.dataset.full; im.alt = $('img', b).alt; $('p', lb).textContent = b.parentElement.querySelector('figcaption')?.textContent || ''; lb.showModal(); }));
    $('.lbx', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  }

  // services swipe carousel (mobile): snap, dots, the visible card's build animation plays on arrival
  const sw = $('.cards--swipe');
  if (sw && matchMedia('(max-width:759px)').matches) {
    const cards = $$('.card', sw), lbs = cards.map((c) => $('[data-sig-scroll]', c));
    lbs.forEach((l) => { if (l) { l.removeAttribute('data-sig-scroll'); l.style.setProperty('--p', RM ? 1 : 0); if (RM) $$('[data-at]', l).forEach((s) => s.classList.add('on')); } });
    const dots = document.createElement('div'); dots.className = 'swdots'; dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = cards.map(() => '<i></i>').join(''); sw.after(dots);
    let cur = 0, seen = false;
    const play = (l) => {
      if (!l || RM) return; const st = $$('[data-at]', l), t0 = performance.now(); cancelAnimationFrame(l._r);
      const tick = (n) => { const p = Math.min(1, (n - t0) / 1700); l.style.setProperty('--p', p.toFixed(4)); st.forEach((s) => s.classList.toggle('on', p >= +s.dataset.at)); if (p < 1) l._r = requestAnimationFrame(tick); };
      l._r = requestAnimationFrame(tick);
    };
    const mark = () => [...dots.children].forEach((d, k) => d.classList.toggle('on', k === cur));
    mark();
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !seen) { seen = true; play(lbs[cur]); } }), { threshold: 0.35 }).observe(sw);
    const io = new IntersectionObserver((es) => es.forEach((e) => { const i = cards.indexOf(e.target); if (e.intersectionRatio > 0.6 && i !== cur) { cur = i; mark(); if (seen) play(lbs[i]); } }), { root: sw, threshold: [0.6] });
    cards.forEach((c) => io.observe(c));
  }

  // motion layer (data-motion): staggered reveals, magnetic buttons, Lenis smooth scroll on desktop
  if (document.body.dataset.motion && !RM) {
    const els = $$('main .sec .head, main .card, main .rv-feat, main .about > *, main .achips li');
    els.forEach((el) => el.classList.add('rvl'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; const sib = [...e.target.parentElement.children].filter((x) => x.classList.contains('rvl')); e.target.style.transitionDelay = Math.min(sib.indexOf(e.target), 3) * 40 + 'ms'; e.target.classList.add('in'); io.unobserve(e.target); }), { rootMargin: '0px 0px -10% 0px' });
      els.forEach((el) => io.observe(el));
    } else els.forEach((el) => el.classList.add('in'));
    if (matchMedia('(pointer:fine) and (min-width:900px)').matches) {
      $$('.btn:not(.wide), .glint-btn').forEach((b) => {
        b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; });
        b.addEventListener('pointerleave', () => { b.style.transform = ''; });
      });
      const sc = document.createElement('script'); sc.src = '/lenis.min.js'; sc.onload = () => { const l = new window.Lenis({ lerp: .11 }); const raf = (t) => { l.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }; document.body.appendChild(sc);
    }
  }
})();

;(() => {
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
function initSig(root = document) {
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

initSig();
})();
