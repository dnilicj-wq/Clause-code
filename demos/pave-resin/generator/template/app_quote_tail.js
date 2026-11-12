  // inline 5-step quote form
  const forms = $$('.qf');
  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>';
  const ctl = forms.map((f) => {
    const steps = $$('fieldset', f), bar = $('.qbar i', f), lbl = $('.qstep', f), bk = $('.qbk', f), chip = $('.chip', f);
    const ans = {}, N = steps.length;
    let cur = 0;
    const show = (i, dir = 1) => {
      cur = Math.max(0, Math.min(N - 1, i));
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
      try {
        const r = await fetch('/api/quote', { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const j = await r.json();
        if (!r.ok || !j.ok) throw 0;
        bar.style.width = '100%'; lbl.textContent = 'Done'; bk.classList.remove('on'); chip.hidden = true;
        $('.qview', f).innerHTML = `<div class="qdone" role="status"><svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg><h3>Thanks ${first}, ${own} will call you today</h3><p>Want to send photos of the job in the meantime?</p>${f.dataset.wa ? `<a class="btn wide" href="https://wa.me/${f.dataset.wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${WA_SVG}WhatsApp ${own}</a>` : ''}</div>`;
      } catch { err('send', true); btn.disabled = false; btn.firstChild.textContent = 'Get my free quote '; }
    });
    show(0);
    return {
      f,
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
  const goQuote = () => { const t = main && main.f.closest('.qcard'); if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); };
  $$('[data-quote]').forEach((a) => a.addEventListener('click', (e) => { if (!main) return; e.preventDefault(); main.pick(a.dataset.quote); goQuote(); }));
  window.cgQuote = (service, design) => { if (!main) return; main.preset(service, design); goQuote(); };

  // configurator: load only when scrolled near
  const cfg = $('.cfg');
  if (cfg) {
    let done = false;
    const load = () => { if (done) return; done = true; const sc = document.createElement('script'); sc.src = cfg.dataset.src || '/cfg.js'; document.body.appendChild(sc); };
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '900px 0px' }); io.observe(cfg); }
    else load();
  }
})();
