import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { photoSrc, process, faq } from '@/config/content';
import { Head, Rise, Stars } from './ui';
import { useQuote } from './quote';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// Proof band near the top: Checkatrade 10/10, Google 5.0, his own badges, then the Checkatrade reviews drifting past.
export function Proof() {
  const { site } = useSite();
  return (
    <section aria-label="Reviews and accreditations" className="relative overflow-hidden border-y py-12 md:py-16" style={{ borderColor: 'var(--line)', background: 'radial-gradient(60% 120% at 10% 0%, rgba(240,178,78,.10), transparent 60%), var(--bg2)' }}>
      <div className="wrap grid gap-8 px-5 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-14 md:px-16">
        <a href={site.socials.checkatrade} target="_blank" rel="noreferrer" className="group flex items-center gap-5">
          <span className="font-display text-[88px] font-bold leading-none tracking-[-.05em] md:text-[140px]" style={{ background: 'linear-gradient(180deg, #FFF3DA 0%, #F0B24E 55%, #C9782B 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {`${site.proof.checkatradeScore}/10`}
          </span>
          <span>
            <span className="block font-display text-[20px] font-bold leading-tight md:text-[26px]">on Checkatrade</span>
            <span className="mt-1 block text-[14px]" style={{ color: 'var(--muted)' }}>{`from ${site.proof.checkatradeCount} reviews · read them ↗`}</span>
          </span>
        </a>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="rounded-2xl border p-4" style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,.02)' }}>
            <div className="flex items-center gap-2"><span className="font-display text-[26px] font-bold">{site.proof.rating.toFixed(1)}</span><Stars size={13} /></div>
            <div className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>{`${site.proof.reviewCount} Google reviews ↗`}</div>
          </a>
          {site.creds.map((c) => (
            <div key={c} className="flex items-center gap-3 rounded-2xl border p-4" style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,.02)' }}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold" style={{ background: 'rgba(169,195,227,.14)', color: 'var(--accent2)' }}>✓</span>
              <span className="text-[14.5px] font-medium leading-snug">{c}</span>
            </div>
          ))}
        </div>
      </div>
      <ReviewStrip />
    </section>
  );
}
// Review strip: drifts on its own; swipe or drag it (pauses while you do, then carries on).
function ReviewStrip() {
  const { site } = useSite();
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const s = el.current!; let raf = 0, last = performance.now(), hold = 0, vis = false, acc = 0;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }); io.observe(s);
    const pause = () => { hold = performance.now() + 2500; };
    let down = false, sx = 0, sl = 0;
    const pd = (e: PointerEvent) => { pause(); if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = s.scrollLeft; s.setPointerCapture(e.pointerId); };
    const pm = (e: PointerEvent) => { if (down) { s.scrollLeft = sl - (e.clientX - sx); pause(); } };
    const pu = () => { down = false; };
    s.addEventListener('pointerdown', pd); s.addEventListener('pointermove', pm); s.addEventListener('pointerup', pu); s.addEventListener('pointercancel', pu);
    s.addEventListener('touchstart', pause, { passive: true }); s.addEventListener('touchmove', pause, { passive: true }); s.addEventListener('wheel', pause, { passive: true });
    const f = (t: number) => {
      const dt = Math.min(50, t - last); last = t;
      const half = s.scrollWidth / 2;
      if (!reduce && vis && t > hold) { acc += dt * 0.035; const n = Math.floor(acc); if (n) { s.scrollLeft += n; acc -= n; } }
      if (s.scrollLeft >= half) s.scrollLeft -= half; else if (s.scrollLeft <= 0 && t > hold) s.scrollLeft += half;
      raf = requestAnimationFrame(f);
    };
    s.scrollLeft = 1; raf = requestAnimationFrame(f);
    return () => { cancelAnimationFrame(raf); io.disconnect(); s.removeEventListener('pointerdown', pd); s.removeEventListener('pointermove', pm); s.removeEventListener('pointerup', pu); s.removeEventListener('pointercancel', pu); };
  }, []);
  const items = [...site.reviews, ...site.reviews];
  return (
    <div ref={el} className="mt-10 flex cursor-grab gap-3.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] active:cursor-grabbing md:px-16 [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-x pan-y' }} aria-label="Checkatrade reviews, swipe for more">
      {items.map((r, i) => (
        <figure key={i} aria-hidden={i >= site.reviews.length} className="m-0 w-[300px] shrink-0 select-none rounded-2xl border p-4 md:w-[380px]" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <div className="flex items-center justify-between"><span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(240,178,78,.16)', color: 'var(--accent)' }}>10/10</span><span className="text-[11px]" style={{ color: 'var(--muted)' }}>{r.job}</span></div>
          <blockquote className="mt-2.5 line-clamp-5 text-[14px] leading-relaxed">“{r.text}”</blockquote>
          <figcaption className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>{`${r.name ? `${r.name} · ` : ''}Checkatrade review`}</figcaption>
        </figure>
      ))}
    </div>
  );
}

// Before / after: two of his own jobs, his own before and after shots. Drag the line; it sweeps gently until touched.
const PAIRS = [
  { key: 'ba-drive', label: 'Tarmac & grass → resin', cap: 'Old tarmac strip and lawn out, resin driveway with a charcoal border in.' },
  { key: 'ba-steps', label: 'Broken steps → resin steps', cap: 'Crumbling steps and a slope rebuilt: brick walls, resin steps and a level resin frontage.' },
] as const;
export function BeforeAfter() {
  const [k, setK] = useState(0);
  const [x, setX] = useState(50);
  const [held, setHeld] = useState(false);
  const touched = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, vis = false; const t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    if (box.current) io.observe(box.current);
    const f = (t: number) => { if (!touched.current && vis) setX(50 + Math.sin((t - t0) / 1500) * 30); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);
  const move = (cx: number) => { const b = box.current!.getBoundingClientRect(); setX(Math.max(2, Math.min(98, ((cx - b.left) / b.width) * 100))); };
  const p = PAIRS[k];
  return (
    <section id="before-after" aria-labelledby="baH" className="section">
      <div className="wrap grid gap-8 md:grid-cols-[.85fr_1.15fr] md:items-center md:gap-14">
        <div>
          <Head id="baH" eyebrow="Before & after" title="Same house." accent="Different welcome." lede="His own before and after shots. Drag the line across." />
          <div className="mt-7 flex flex-wrap gap-2" role="tablist">
            {PAIRS.map((q, i) => (
              <button key={q.key} role="tab" aria-selected={k === i} onClick={() => { setK(i); touched.current = false; }}
                className="h-11 rounded-full border px-4 text-[14px] font-medium transition-colors"
                style={k === i ? { background: 'var(--ink)', color: 'var(--bg)', borderColor: 'transparent' } : { borderColor: 'var(--line)' }}>{q.label}</button>
            ))}
          </div>
          <p className="mt-4 max-w-[42ch] text-[15px]" style={{ color: 'var(--muted)' }}>{p.cap}</p>
        </div>
        <div ref={box} className="relative aspect-[1080/667] touch-none select-none overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)', cursor: 'ew-resize', boxShadow: '0 50px 90px -40px rgba(0,0,0,.85)' }}
          onPointerDown={(e) => { touched.current = true; setHeld(true); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); move(e.clientX); }}
          onPointerMove={(e) => { if (held) move(e.clientX); }}
          onPointerUp={() => setHeld(false)} onPointerCancel={() => setHeld(false)}
          role="slider" aria-label="Before and after" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(x)} tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { touched.current = true; setX((v) => Math.max(2, Math.min(98, v + (e.key === 'ArrowLeft' ? -5 : 5)))); } }}>
          <img src={`/client/${p.key}-after-v1.webp`} alt="After: finished by Butler's" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <img src={`/client/${p.key}-before-v1.webp`} alt="Before" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }} />
          <div className="absolute inset-y-0 w-[2px]" style={{ left: `${x}%`, background: 'linear-gradient(180deg,#FFE3A8,#F0B24E)', boxShadow: '0 0 22px rgba(240,178,78,.7)' }}>
            <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[16px] font-bold btn-gold">↔</span>
          </div>
          <span className="ex-tag left-3 top-3">Before</span>
          <span className="ex-tag right-3 top-3">After · his job</span>
        </div>
      </div>
    </section>
  );
}

// What he does: resin leads (big), the rest as a small "we also do" row.
export function Services() {
  const q = useQuote();
  const lead = [
    { t: 'Resin bound driveways', d: 'Smooth, permeable stone in the blend you pick, framed with block edging.', img: 'resin-dusk', s: 'resin-drive' },
    { t: 'Resin patios & paths', d: 'Gardens, paths and steps in resin, with circles, borders or a custom pattern.', img: 'resin-circle-patio', s: 'resin-patio' },
  ];
  const also = [['Block paving', 'block'], ['Concrete driveways', 'concrete'], ['Dropped kerbs', 'kerb'], ['Porcelain patios', 'patio'], ['Landscaping', 'other'], ['Tiling', 'other']] as const;
  return (
    <section id="services" aria-labelledby="svcH" className="section !pt-4 md:!pt-8">
      <div className="wrap">
        <Head id="svcH" eyebrow="What we do" title="Resin first." accent="Ground up." />
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5">
          {lead.map((s, i) => (
            <Rise key={s.t} d={i * 0.08}>
              <a href="#survey" onClick={() => q.setService(s.s)} className="group relative block overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
                <img src={photoSrc(s.img, 1280)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04] md:aspect-[16/11]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,15,21,0) 40%, rgba(11,15,21,.92))' }} />
                <span className="ex-tag left-3 top-3">His job</span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
                  <div>
                    <h3 className="font-display text-[26px] font-bold leading-tight md:text-[34px]">{s.t}</h3>
                    <p className="mt-1.5 max-w-[40ch] text-[14.5px] leading-snug" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{s.d}</p>
                  </div>
                  <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full text-[18px] transition-transform group-hover:translate-x-1 md:grid btn-gold" aria-hidden>→</span>
                </div>
              </a>
            </Rise>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>We also do</span>
          {also.map(([t, k]) => (
            <a key={t} href="#survey" onClick={() => q.setService(k)} className="h-10 rounded-full border px-4 text-[14px] leading-[38px] transition-colors hover:bg-white/5" style={{ borderColor: 'var(--line)' }}>{t}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it goes down: four steps, two with his own on-site photos. Sticky heading on desktop.
export function Process() {
  return (
    <section id="how" aria-labelledby="howH" className="section" style={{ background: 'var(--bg2)' }}>
      <div className="wrap grid gap-10 md:grid-cols-[.85fr_1.15fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <Head id="howH" eyebrow="How it goes down" title="Base first." accent="Then the good bit." lede="The part nobody sees is what makes a drive last. Here’s how a job runs, in his own words." />
        </div>
        <ol className="relative m-0 list-none p-0">
          <span className="absolute bottom-6 left-[19px] top-6 w-px" style={{ background: 'linear-gradient(180deg, var(--accent), rgba(169,195,227,.3), transparent)' }} aria-hidden />
          {process.map((s, i) => (
            <li key={s.title} className="relative pb-9 last:pb-0"><Rise d={i * 0.05} className="flex gap-5">
              <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-[15px] font-bold" style={{ background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>{i + 1}</span>
              <div className="pt-1.5">
                <h3 className="font-display text-[22px] font-bold">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{s.text}</p>
                {s.img && <img src={photoSrc(s.img, 640)} alt="" loading="lazy" className="mt-4 aspect-[16/9] w-full max-w-[460px] rounded-2xl object-cover" style={{ boxShadow: '0 0 0 1px var(--line)' }} />}
              </div>
            </Rise></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Big rotating Checkatrade quote.
export function Reviews() {
  const { site } = useSite();
  const list = site.reviews.filter((r) => r.text.length < 420);
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % list.length), 7000); return () => clearInterval(t); }, [list.length]);
  const r = list[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="section">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="revH" eyebrow="What customers say" title="Clean, tidy," accent="and back for a third job." />
          <a href={site.socials.checkatrade} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[14px]" style={{ borderColor: 'var(--line)' }}>
            {`${site.proof.checkatradeScore}/10 · ${site.proof.checkatradeCount} reviews on Checkatrade ↗`}
          </a>
        </div>
        <div className="relative mt-10 min-h-[300px] overflow-hidden rounded-[var(--radius)] border p-6 md:mt-14 md:min-h-[320px] md:p-12" style={{ borderColor: 'var(--line)', background: 'radial-gradient(80% 100% at 100% 0%, rgba(169,195,227,.10), transparent 60%), var(--surface)' }}>
          <span className="pointer-events-none absolute right-6 top-0 leading-none md:right-12" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(140px,18vw,240px)', color: 'rgba(240,178,78,.16)' }} aria-hidden>”</span>
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="relative m-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .45 }}>
              <div className="flex items-center gap-3"><span className="rounded-full px-2.5 py-1 text-[12px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>10/10</span>{r.job && <span className="text-[13px] font-medium" style={{ color: 'var(--accent2)' }}>{r.job}</span>}</div>
              <blockquote className="mt-4 max-w-[46ch] font-display text-[clamp(20px,2.6vw,32px)] font-medium leading-[1.3] tracking-[-.01em]">“{r.text}”</blockquote>
              <figcaption className="mt-5 text-[13px]" style={{ color: 'var(--muted)' }}>{`${r.name ? `${r.name} · ` : 'Verified reviewer · '}Checkatrade`}</figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-0.5">
            {list.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className="grid h-8 min-w-7 place-items-center"><span className="block h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 8, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.18)' }} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// Where he works: the towns on his own site, on a little Fens map. Tap one.
const TOWNS: Record<string, [number, number]> = {
  Chatteris: [0.053, 52.456], March: [0.088, 52.551], Ely: [0.262, 52.399], Huntingdon: [-0.185, 52.331], Warboys: [-0.079, 52.403],
  Littleport: [0.302, 52.457], Sawtry: [-0.284, 52.438], Mepal: [0.116, 52.405], Thorney: [-0.106, 52.62],
};
const xy = ([lon, lat]: [number, number]) => [40 + ((lon + 0.31) / 0.64) * 320, 240 - ((lat - 52.31) / 0.33) * 186];
export function Areas() {
  const { site } = useSite();
  const q = useQuote();
  const [town, setTown] = useState(site.areas[0]);
  const home = xy(TOWNS.Chatteris);
  return (
    <section id="areas" aria-labelledby="areaH" className="section !pt-4 md:!pt-6">
      <div className="wrap">
        <div className="relative grid overflow-hidden rounded-[var(--radius)] border md:grid-cols-[1fr_1.1fr]" style={{ borderColor: 'var(--line)', background: 'radial-gradient(90% 90% at 0% 0%, rgba(240,178,78,.10), transparent 60%), var(--surface)' }}>
          <div className="p-6 md:p-10">
            <p className="eyebrow">Where we work</p>
            <h2 id="areaH" className="mt-3 font-display text-[clamp(30px,4vw,48px)] font-bold leading-[1] tracking-[-.02em]">{`From ${site.town},`} <span className="serif" style={{ color: 'var(--accent2)' }}>across the Fens.</span></h2>
            <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Pick your town">
              {site.areas.map((a) => (
                <button key={a} role="radio" aria-checked={town === a} onClick={() => setTown(a)} className="h-10 rounded-full border px-4 text-[14px] font-medium transition-colors"
                  style={town === a ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-ink)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.03)' }}>{a}</button>
              ))}
            </div>
            <p className="mt-5 text-[15px]"><b>{`Yes, we cover ${town}.`}</b> <span style={{ color: 'var(--muted)' }}>{`And the rest of ${site.region}.`}</span></p>
            <a href="#survey" onClick={() => q.setService('resin-drive')} className="btn-gold mt-5 inline-flex h-11 items-center rounded-full px-5 text-[14.5px] font-semibold">{`Book a survey in ${town} →`}</a>
          </div>
          <div className="relative min-h-[260px]" aria-hidden>
            <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="fen" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12 L12 0" stroke="rgba(169,195,227,.07)" strokeWidth="1" /></pattern>
                <radialGradient id="glow"><stop offset="0" stopColor="#F0B24E" stopOpacity=".35" /><stop offset="1" stopColor="#F0B24E" stopOpacity="0" /></radialGradient>
              </defs>
              <rect width="400" height="260" fill="url(#fen)" />
              {/* the Fen drains: long straight lines */}
              <path d="M10 70 L390 150 M30 220 L380 40 M120 250 L260 10" stroke="rgba(169,195,227,.10)" strokeWidth="1.2" />
              <circle cx={home[0]} cy={home[1]} r="60" fill="url(#glow)" />
              {Object.entries(TOWNS).map(([n, c]) => { const [x, y] = xy(c); const on = n === town; return (
                <g key={n}>
                  {n !== 'Chatteris' && <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke={on ? '#F0B24E' : 'rgba(255,255,255,.10)'} strokeWidth={on ? 1.6 : 1} strokeDasharray="3 4" className={on ? 'pe-dash' : ''} />}
                  {on && <circle cx={x} cy={y} r="8" fill="none" stroke="#F0B24E" strokeWidth="1.5" className="pe-ping" />}
                  <circle cx={x} cy={y} r={on || n === 'Chatteris' ? 5.5 : 3.6} fill={on ? '#F0B24E' : n === 'Chatteris' ? '#A9C3E3' : 'rgba(255,255,255,.5)'} />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fill={on ? '#fff' : 'rgba(255,255,255,.55)'} fontFamily="var(--font-body)">{n}</text>
                </g>); })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { site } = useSite();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faqH" className="section !pt-6">
      <div className="wrap grid gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-16">
        <div>
          <Head id="faqH" eyebrow="Questions" title="Good to" accent="know." />
          <p className="mt-5 text-[14px]" style={{ color: 'var(--muted)' }}>Answers from Butler’s own site. Anything else: <a className="underline" href={`mailto:${site.email}`}>{site.email}</a></p>
        </div>
        <div className="divide-y border-y" style={{ borderColor: 'var(--line)' }}>
          {faq.map((f, i) => (
            <div key={i} style={{ borderColor: 'var(--line)' }}>
              <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[17px] font-bold md:text-[19px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}<span className="text-[22px] transition-transform" style={{ color: 'var(--accent)', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="pb-5 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { site } = useSite();
  return (
    <footer className="relative overflow-hidden border-t px-5 pb-28 pt-16 md:px-16 md:pb-12 md:pt-24" style={{ borderColor: 'var(--line)', background: 'radial-gradient(70% 80% at 50% 120%, rgba(240,178,78,.16), transparent 70%), var(--bg2)' }}>
      <div className="wrap">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Free survey</p>
            <h2 className="h2 mt-4 max-w-[14ch]">A drive that <span className="serif" style={{ color: 'var(--accent2)' }}>says welcome home.</span></h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a href="#survey" className="btn-gold flex h-[52px] items-center rounded-full px-6 text-[16px] font-semibold">Book your free survey</a>
            <a href={tel(site.phone)} className="flex h-[52px] items-center rounded-full border px-6 text-[16px] font-semibold" style={{ borderColor: 'var(--line)' }}>{`Call ${site.phone}`}</a>
          </div>
        </div>
        <img src="/brand/logo-v1.svg" alt={site.company} width={520} height={150} loading="lazy" className="mt-14 w-full max-w-[560px] opacity-95" />
        <div className="mt-10 grid gap-6 text-[14px] md:grid-cols-4" style={{ color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call</div><a href={tel(site.phone)}>{site.phone}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Based in</div>{`${site.town}, ${site.region}`}</div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Follow</div><a href={site.socials.instagram} target="_blank" rel="noreferrer">Instagram</a> · <a href={site.socials.facebook} target="_blank" rel="noreferrer">Facebook</a></div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-[12px] md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <span>{site.legalName}</span>
          <span>Demo by Clientgateway · hero is a live illustration · blend colours approximate</span>
        </div>
      </div>
    </footer>
  );
}

// Sticky mobile bar: Call / Book survey. Hidden on the hero, inside the survey and at the footer.
export function StickyBar() {
  const { site } = useSite();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const mid = innerHeight * 0.5;
      const d = document.getElementById('survey')?.getBoundingClientRect();
      const inSurvey = d ? d.top < mid && d.bottom > mid : false;
      const foot = document.querySelector('footer')?.getBoundingClientRect();
      const atFoot = foot ? foot.top < innerHeight - 60 : false;
      setShow(scrollY > innerHeight * 0.7 && !inSurvey && !atFoot);
    };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.nav aria-label="Quick contact" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 grid grid-cols-[1fr_1.5fr] gap-1.5 rounded-full p-1.5 md:hidden"
          style={{ background: 'rgba(11,15,21,.92)', border: '1px solid var(--line)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 12px 30px rgba(0,0,0,.45)' }}>
          <a href={tel(site.phone)} className="flex h-12 items-center justify-center gap-1.5 rounded-full text-[15px] font-semibold" style={{ background: 'rgba(255,255,255,.08)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
            Call
          </a>
          <a href="#survey" className="btn-gold flex h-12 items-center justify-center rounded-full text-[15px] font-semibold">Book free survey</a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
