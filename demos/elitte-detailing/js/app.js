/* Elitte Detailing demo: interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DESK = matchMedia('(min-width: 900px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // remove loader node once its CSS animation is done
  const loader = $('#loader');
  if (loader) setTimeout(() => loader.remove(), 1100);

  /* ---------- smooth scroll (desktop only) ---------- */
  let lenis = null;
  if (DESK && !RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.3 });
    else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
  };

  /* ---------- nav / dock ---------- */
  const nav = $('#nav'), dock = $('#dock'), hero = $('.hero');
  const onScrollUI = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    dock.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  };
  addEventListener('scroll', onScrollUI, { passive: true }); onScrollUI();

  /* ---------- builder ---------- */
  const fCar = $('#fCar'), fSvc = $('#fServices'), fCond = $('#fCond'), fContact = $('#fContact');
  const preview = $('#msgPreview'), sendWa = $('#sendWa'), sendMail = $('#sendMail');
  const picked = () => $$('.pick[aria-pressed="true"]', fSvc).map(b => b.textContent.trim());
  const radio = (g) => { const b = $('[aria-checked="true"]', g); return b ? b.dataset.v : ''; };
  const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function buildMsg() {
    const car = fCar.value.trim(), svc = picked(), cond = radio(fCond), how = radio(fContact);
    const lines = ['Hi Elitte Detailing, I\'d like to book an inspection.', ''];
    lines.push('Car: ' + (car || '…'));
    lines.push('Interested in: ' + (svc.length ? svc.join(', ') : '…'));
    lines.push('Paint condition: ' + (cond || '…'));
    lines.push('Best way to reach me: ' + (how || 'WhatsApp'));
    const text = lines.join('\n');
    preview.innerHTML = esc(text).replace(/…/g, '<span class="ph">…</span>');
    sendWa.href = 'https://wa.me/447903849770?text=' + encodeURIComponent(text.replace(/…/g, '-'));
    sendMail.href = 'mailto:info@elittedetailing.co.uk?subject=' + encodeURIComponent('Inspection enquiry' + (car ? ' – ' + car : '')) + '&body=' + encodeURIComponent(text.replace(/…/g, '-'));
  }
  fSvc.addEventListener('click', e => {
    const b = e.target.closest('.pick'); if (!b) return;
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); buildMsg();
  });
  [fCond, fContact].forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', g).forEach(x => x.setAttribute('aria-checked', String(x === b))); buildMsg();
  }));
  fCar.addEventListener('input', buildMsg);
  buildMsg();

  /* ---------- anchor links (+ preselect service) ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    if (a.dataset.pick) {
      const b = $$('.pick', fSvc).find(x => x.textContent.trim() === a.dataset.pick.replace('&amp;', '&'));
      if (b) { b.setAttribute('aria-pressed', 'true'); buildMsg(); }
    }
    scrollToEl(el);
  });

  /* ---------- reveals ---------- */
  const rvTargets = $$('.sec-head, .point, .studio__grid figure, .builder > *, .faq details, .final__inner, .foot__grid > div, .process__media');
  rvTargets.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  rvTargets.forEach(el => io.observe(el));

  /* ---------- hex light cursor glow (desktop) ---------- */
  if (FINE && DESK && !RM) {
    $$('[data-glow]').forEach(el => {
      let tx = 50, ty = 50, x = 50, y = 50, raf = 0, on = false;
      const tick = () => {
        x += (tx - x) * 0.14; y += (ty - y) * 0.14;
        el.style.setProperty('--gx', x + '%'); el.style.setProperty('--gy', y + '%');
        raf = (on || Math.abs(tx - x) + Math.abs(ty - y) > 0.1) ? requestAnimationFrame(tick) : 0;
      };
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
        if (!on) { on = true; x = tx; y = ty; el.classList.add('is-glowing'); }
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener('pointerleave', () => { on = false; el.classList.remove('is-glowing'); });
    });
  }

  /* ---------- stacking cards + process line (scroll-linked) ---------- */
  const cards = $$('.card');
  cards.forEach((c, i) => c.style.setProperty('--i', i));
  const steps = $$('.step'), stepsEl = $('#steps'), fill = $('#stepsFill');
  const procImg = $('#procImg'), procTag = $('#procTag');
  let curImg = 'handover';
  const realImgs = { 'real-studio-sign': 1 };
  function swapImg(name) {
    if (name === curImg || !DESK) return; curImg = name;
    procImg.classList.add('is-swap');
    setTimeout(() => {
      const sm = name === 'panel-clean' || name === 'wheel' ? `img/${name}.webp` : `img/${name}-sm.webp`;
      procImg.srcset = ''; procImg.src = sm;
      procImg.onload = () => procImg.classList.remove('is-swap');
      procTag.textContent = realImgs[name] ? 'Our studio' : 'Example image';
      procTag.className = 'chip ' + (realImgs[name] ? 'chip--real' : 'chip--tag');
    }, 220);
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    // cards: shrink the one being covered
    if (!RM) for (let i = 0; i < cards.length - 1; i++) {
      const next = cards[i + 1].getBoundingClientRect();
      const top = parseFloat(getComputedStyle(cards[i]).top);
      const p = clamp(1 - (next.top - top) / (vh * 0.8), 0, 1);
      cards[i].style.transform = p > 0 ? `scale(${1 - p * 0.06})` : '';
      cards[i].style.filter = p > 0 ? `brightness(${1 - p * 0.45})` : '';
    }
    // process line
    const r = stepsEl.getBoundingClientRect();
    const p = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
    fill.style.setProperty('--p', p);
    let active = -1;
    steps.forEach((s, i) => { const on = s.getBoundingClientRect().top < vh * 0.6; s.classList.toggle('is-on', on); if (on) active = i; });
    if (active >= 0) swapImg(steps[active].dataset.img);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  /* ---------- swipe to correct ---------- */
  const pad = $('#pad'), canvas = $('#padCanvas'), tool = $('#padTool');
  const meterVal = $('#meterVal'), meterFill = $('#meterFill');
  let ctx, W, H, DPR, R, cell, grid, cols, rows, total, cleared = 0, done = false, inited = false;
  let last = null, spin = 0, lastInput = 0, ghost = null, ghostRuns = 0, inView = false;
  const TOUCH = !FINE;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function initPad() {
    const rect = pad.getBoundingClientRect();
    W = rect.width; H = rect.height; DPR = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    R = clamp(Math.min(W, H) * 0.095, 34, 62);
    pad.style.setProperty('--pad-d', (R * 2) + 'px');
    cell = Math.max(18, R * 0.55); cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    grid = new Uint8Array(cols * rows); total = cols * rows; cleared = 0;
    drawDamage(); updateMeter(); inited = true;
  }
  function drawDamage() {
    const cx = W / 2, cy = H / 2, maxR = Math.hypot(W, H) * 0.55;
    ctx.clearRect(0, 0, W, H);
    // dull haze across the panel
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    g.addColorStop(0, 'rgba(225,230,238,0.30)'); g.addColorStop(0.25, 'rgba(190,196,206,0.16)'); g.addColorStop(1, 'rgba(150,156,166,0.10)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // milky bloom around the light
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.32);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.35, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // swirl marks: concentric arcs around the light point
    ctx.lineCap = 'round';
    const n = Math.round(W * H / 380);
    for (let i = 0; i < n; i++) {
      const r = Math.pow(Math.random(), 0.8) * maxR;
      const a0 = Math.random() * Math.PI * 2, len = rnd(0.08, 0.5) * (1 - r / maxR * 0.5);
      const near = 1 - r / maxR;
      ctx.strokeStyle = `rgba(255,255,255,${(0.05 + near * near * 0.42).toFixed(3)})`;
      ctx.lineWidth = rnd(0.4, 1.1);
      ctx.beginPath(); ctx.arc(cx + rnd(-3, 3), cy + rnd(-3, 3), r, a0, a0 + len); ctx.stroke();
    }
    // straight scratches
    for (let i = 0; i < 9; i++) {
      const x = rnd(0, W), y = rnd(0, H), ang = rnd(-0.6, 0.6) + (Math.random() < .5 ? 0 : Math.PI / 2), l = rnd(W * 0.15, W * 0.5);
      const x2 = x + Math.cos(ang) * l, y2 = y + Math.sin(ang) * l;
      const sg = ctx.createLinearGradient(x, y, x2, y2);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.5)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = sg; ctx.lineWidth = rnd(0.6, 1.4);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + rnd(-20, 20), (y + y2) / 2 + rnd(-20, 20), x2, y2); ctx.stroke();
    }
    // speckle
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < W * H / 900; i++) ctx.fillRect(rnd(0, W), rnd(0, H), rnd(.5, 1.4), rnd(.5, 1.4));
  }
  function stamp(x, y) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.65, 'rgba(0,0,0,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // coverage
    const rr = R * 0.78, c0 = Math.max(0, Math.floor((x - rr) / cell)), c1 = Math.min(cols - 1, Math.floor((x + rr) / cell));
    const r0 = Math.max(0, Math.floor((y - rr) / cell)), r1 = Math.min(rows - 1, Math.floor((y + rr) / cell));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const k = r * cols + c; if (grid[k]) continue;
      const ccx = (c + .5) * cell, ccy = (r + .5) * cell;
      if ((ccx - x) ** 2 + (ccy - y) ** 2 <= rr * rr) { grid[k] = 1; cleared++; }
    }
  }
  function polishTo(x, y) {
    if (last) {
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(d / (R * 0.22)));
      for (let i = 1; i <= steps; i++) stamp(last.x + dx * i / steps, last.y + dy * i / steps);
      if (!RM) spin += d * 1.6;
    } else stamp(x, y);
    last = { x, y };
    tool.style.transform = `translate3d(${x}px,${y}px,0)`;
    tool.style.setProperty('--spin', spin + 'deg');
    updateMeter();
  }
  let shown = 0;
  function updateMeter() {
    const pct = clamp(Math.floor(cleared / total / 0.95 * 100), 0, 100);
    if (pct !== shown) { shown = pct; meterVal.textContent = pct; meterFill.style.width = pct + '%'; }
    if (pct >= 100 && !done) finish();
  }
  function finish() {
    done = true; stopGhost(); pad.classList.add('is-done'); pad.classList.remove('is-active');
  }
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let down = false;
  canvas.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !done) { stopGhost(); pad.classList.add('is-active'); last = null; } });
  canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { pad.classList.remove('is-active'); last = null; } down = false; });
  canvas.addEventListener('pointerdown', e => {
    if (!inited || done) return; down = true; stopGhost(); pad.classList.add('is-active', 'has-touched'); last = null;
    lastInput = performance.now(); canvas.setPointerCapture?.(e.pointerId); const p = pos(e); polishTo(p.x, p.y);
  });
  canvas.addEventListener('pointermove', e => {
    if (!inited || done) return;
    const p = pos(e); lastInput = performance.now();
    if (e.pointerType === 'mouse') { stopGhost(); pad.classList.add('is-active', 'has-touched'); polishTo(p.x, p.y); }
    else if (down) polishTo(p.x, p.y);
  });
  const up = () => { down = false; last = null; if (TOUCH) pad.classList.remove('is-active'); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  // ghost demo: a pad polishing a figure-of-eight
  function startGhost() {
    if (ghost || done || RM || ghostRuns >= 2) return;
    ghostRuns++; last = null; pad.classList.add('is-active');
    const t0 = performance.now(), dur = 4200;
    const run = (now) => {
      if (!ghost) return;
      const t = (now - t0) / dur; if (t >= 1) { stopGhost(); return; }
      const a = t * Math.PI * 2 - Math.PI / 2;
      const x = W / 2 + Math.cos(a) * W * 0.3, y = H / 2 + Math.sin(a * 2) * H * 0.24;
      polishTo(x, y); ghost = requestAnimationFrame(run);
    };
    ghost = requestAnimationFrame(run);
  }
  function stopGhost() { if (ghost) { cancelAnimationFrame(ghost); ghost = null; last = null; if (!down && !(FINE && pad.matches(':hover'))) pad.classList.remove('is-active'); } }
  setInterval(() => {
    if (!inited || !inView || done || ghost || down) return;
    if (performance.now() - lastInput > (TOUCH ? 1500 : 2600)) startGhost();
  }, 400);

  const pio = new IntersectionObserver(es => es.forEach(e => {
    inView = e.isIntersecting;
    if (inView && !inited) { initPad(); lastInput = performance.now(); }
  }), { threshold: 0.45 });
  pio.observe(pad);
  let rw = innerWidth;
  addEventListener('resize', () => { if (inited && !done && Math.abs(innerWidth - rw) > 40) { rw = innerWidth; initPad(); } });
})();
