import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { photoSrc, process, whyResin, faq } from '@/config/content';
import { useRef } from 'react';
import { Head, Rise, Stars } from './ui';
import { WaIcon } from './Hero';
import { useQuote, waLink } from './quote';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// Big proof band: the Google rating and Checkatrade membership, then his review quotes rolling past.
export function Proof() {
  const { site } = useSite();
  return (
    <section aria-label="Google and Checkatrade reviews" className="relative overflow-hidden border-y py-10 md:py-16" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
      <div className="wrap px-5 md:px-16">
        <a href={site.socials.google} target="_blank" rel="noreferrer" className="group flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="font-display text-[68px] font-semibold leading-none tracking-[-.04em] md:text-[132px]" style={{ background: 'linear-gradient(180deg, #FFFFFF, #D8DEE8 45%, #7F8BA3 90%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {site.proof.rating.toFixed(1)}
            </span>
            <div>
              <Stars size={22} />
              <p className="mt-2 font-display text-[22px] font-semibold leading-tight md:text-[30px]">from {site.proof.reviewCount} Google reviews</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors group-hover:bg-white/5" style={{ borderColor: 'var(--line)' }}>
            <GoogleG /> Read them on Google ↗
          </span>
        </a>
        <a href={site.socials.checkatrade} target="_blank" rel="noreferrer" className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 md:mt-8 md:pt-6" style={{ borderColor: 'var(--line)' }}>
          <span className="text-[17px] leading-snug md:text-[20px]"><b className="font-semibold">Checkatrade member</b><br /><span className="text-[15px] md:text-[16px]" style={{ color: 'var(--muted)' }}>Read his reviews on Checkatrade</span></span>
          <span className="ml-auto hidden text-[14px] md:inline" style={{ color: 'var(--muted)' }}>See his profile ↗</span>
        </a>
      </div>
      <ReviewStrip />
    </section>
  );
}
// Review strip: drifts on its own, and you can swipe or drag it (it pauses while you do, then carries on).
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
    <div ref={el} className="mt-7 flex cursor-grab gap-3.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] active:cursor-grabbing md:px-16 [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }} aria-label="Customer reviews, swipe for more">
      {items.map((r, i) => (
        <figure key={i} aria-hidden={i >= site.reviews.length} className="m-0 w-[300px] shrink-0 select-none rounded-2xl border p-4 md:w-[380px]" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <Stars size={12} />
          <blockquote className="mt-2 line-clamp-6 text-[14px] leading-relaxed">“{r.text}”</blockquote>
          <figcaption className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>{[r.name, `${r.source} review`, r.job].filter(Boolean).join(' · ')}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function GoogleG() {
  return <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 0 0 6.3 14.7z" /><path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.5l6.2 5.3C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>;
}

// Why resin: general facts, each with a small looping diagram (keeps the page alive when idle).
export function WhyResin() {
  return (
    <section id="why" aria-labelledby="whyH" className="section">
      <div className="wrap">
        <Head id="whyH" eyebrow="Why resin" title="Smooth, porous," accent="and no weeds." lede="General facts about resin-bound driveways, so you know what you are choosing." />
        <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:mt-14 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {whyResin.map((w, i) => (
            <Rise key={w.key} d={i * 0.08} className="w-[78vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
              <div className="h-full rounded-[var(--radius)] border p-5 md:p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
                <div className="h-[120px] overflow-hidden rounded-2xl md:h-[150px]" style={{ background: '#0B1530' }}><Diagram k={w.key} /></div>
                <h3 className="mt-4 font-display text-[22px] font-semibold">{w.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{w.text}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
function Diagram({ k }: { k: string }) {
  const stones = Array.from({ length: 34 }).map((_, i) => ({ x: 8 + (i % 17) * 18 + (Math.floor(i / 17) % 2) * 9, y: 76 + Math.floor(i / 17) * 12, r: 6 + ((i * 7) % 3) }));
  if (k === 'drain') return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden>
      <defs><linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E3C88F" /><stop offset="1" stopColor="#8E6D35" /></linearGradient></defs>
      {stones.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.75} fill="url(#st)" opacity=".9" />)}
      <rect x="0" y="100" width="320" height="50" fill="#2a2724" />
      <text x="10" y="138" fontSize="10" fill="#8f877b" fontFamily="var(--font-body)">sub-base</text>
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={20 + i * 34} cy={0} r="2.6" fill="#8CC8FF" className="pe-drop" style={{ animationDelay: `${(i * 0.37) % 2}s` }} />
      ))}
    </svg>
  );
  if (k === 'weeds') return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden>
      <rect x="0" y="70" width="150" height="80" fill="#3a3a3a" /><path d="M60 70 L66 95 L58 120 L64 150" stroke="#111" strokeWidth="3" fill="none" />
      <g className="pe-weed"><path d="M62 72 C 56 55, 48 50, 40 48 M62 72 C 66 52, 74 46, 84 46 M62 72 C 60 58, 62 44, 64 36" stroke="#6B8F3A" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
      <text x="10" y="64" fontSize="11" fill="#8f877b" fontFamily="var(--font-body)">cracked tarmac</text>
      <rect x="170" y="70" width="150" height="80" fill="#6d5636" />
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={176 + (i % 10) * 15} cy={78 + Math.floor(i / 10) * 18} r="6" fill={['#C49A62', '#E9D3A6', '#8C6A3F'][i % 3]} />)}
      <text x="180" y="64" fontSize="11" fill="#8f877b" fontFamily="var(--font-body)">resin-bound: no joins</text>
      <rect className="pe-shine" x="170" y="70" width="40" height="80" fill="url(#shine)" />
      <defs><linearGradient id="shine" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
  return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden>
      {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={8 + (i % 20) * 16} cy={104 + Math.floor(i / 20) * 15} r="6.5" fill={['#A3A5A7', '#E2E2DF', '#6B6D70'][i % 3]} />)}
      <g className="pe-broom">
        <rect x="150" y="10" width="5" height="78" rx="2" fill="#B08E4F" transform="rotate(18 152 88)" />
        <path d="M128 86 h46 l6 14 h-58z" fill="#C9D1DE" transform="rotate(18 152 88)" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={110 + i * 22} cy="98" r="1.6" fill="#b9ab90" className="pe-dust" style={{ animationDelay: `${i * 0.18}s` }} />)}
    </svg>
  );
}

export function Services() {
  const items = [
    { t: 'Block paving', d: 'Patterns, inlays, borders and colours to suit the house.', img: 'block-herringbone', k: 'block' },
    { t: 'Resin driveways', d: 'Resin bound or bonded stone, finished with a block border.', img: 'resin-door', k: 'resin' },
    { t: 'Patios & paving', d: 'Indian sandstone and porcelain, laid round how you use the garden.', img: 'patio-garden', k: '' },
    { t: 'Driveway & patio design', d: 'Ideas, colour palettes and layouts talked through before a block goes down.', img: 'block-diamond', k: '' },
  ];
  const q = useQuote();
  return (
    <section id="services" aria-labelledby="svcH" className="section !pt-6 md:!pt-10">
      <div className="wrap">
        <Head id="svcH" eyebrow="What we do" title="Driveways and patios," accent="start to finish." />
      </div>
      <div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-auto md:mt-12 md:grid md:max-w-[1280px] md:grid-cols-4 md:gap-4 md:overflow-visible md:px-12">
        {items.map((s, i) => (
          <Rise key={s.t} d={i * 0.06} className="w-[72vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none">
            <a href="#design" onClick={() => s.k && q.setSurface(s.k)} className="group relative block overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
              <img src={photoSrc(s.img, 640)} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.88))' }} />
              <span className="ex-tag left-3 top-3">His job</span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-[22px] font-semibold leading-tight">{s.t}</h3>
                <p className="mt-1 text-[13.5px] leading-snug" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{s.d}</p>
              </div>
            </a>
          </Rise>
        ))}
      </div>
      <p className="wrap mt-4 px-5 text-[14px] md:px-12" style={{ color: 'var(--muted)' }}>Also: concrete and polished concrete, gravel and shingle drives, permeable paving, driveway repairs, cleaning and sealing.</p>
    </section>
  );
}

export function Process() {
  return (
    <section id="how" aria-labelledby="howH" className="section" style={{ background: 'var(--bg2)' }}>
      <div className="wrap grid gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <Head id="howH" eyebrow="How it works" title="Free quote," accent="no pressure." lede="A visit, ideas and a free estimate before anything is agreed." />
        </div>
        <ol className="relative m-0 list-none p-0">
          <span className="absolute bottom-4 left-[19px] top-4 w-px" style={{ background: 'linear-gradient(180deg, var(--accent), transparent)' }} aria-hidden />
          {process.map((s, i) => (
            <li key={s.title} className="relative pb-7 last:pb-0"><Rise d={i * 0.05} className="flex gap-5">
                <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-[15px] font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--accent2)' }}>{i + 1}</span>
                <div className="pt-1.5">
                  <h3 className="font-display text-[20px] font-semibold">{s.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{s.text}</p>
                </div>
              </Rise></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Reviews() {
  const { site } = useSite();
  const [i, setI] = useState(1);
  const [full, setFull] = useState(false);
  useEffect(() => { if (full) return; const t = setInterval(() => setI((v) => (v + 1) % site.reviews.length), 6500); return () => clearInterval(t); }, [site.reviews.length, full]);
  useEffect(() => setFull(false), [i]);
  const r = site.reviews[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="section">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="revH" eyebrow="What customers say" title="Better than" accent="I imagined." />
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[14px]" style={{ borderColor: 'var(--line)' }}>
            <Stars size={13} /> {site.proof.rating.toFixed(1)} · {site.proof.reviewCount} reviews on Google ↗
          </a>
        </div>
        <div className="relative mt-10 min-h-[260px] rounded-[var(--radius)] border p-6 md:mt-14 md:min-h-[300px] md:p-12" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <span className="pointer-events-none absolute right-6 top-2 font-serif text-[140px] leading-none md:right-12 md:text-[220px]" style={{ color: 'rgba(216,222,232,.16)', fontFamily: 'var(--font-serif)' }} aria-hidden>”</span>
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="relative m-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .45 }}>
              <div className="flex items-center gap-3"><Stars size={15} />{r.job && <span className="text-[13px] font-medium" style={{ color: 'var(--accent2)' }}>{r.job}</span>}</div>
              <blockquote className={`mt-4 font-display font-medium tracking-[-.01em] ${r.text.length > 320 ? 'max-w-[62ch] text-[clamp(16px,1.7vw,21px)] leading-[1.45]' : 'max-w-[34ch] text-[clamp(22px,3.2vw,38px)] leading-[1.2]'} ${r.text.length > 320 && !full ? 'line-clamp-6 md:line-clamp-none' : ''}`}>“{r.text}”</blockquote>
              {r.text.length > 320 && !full && <button onClick={() => setFull(true)} className="mt-2 text-[13px] font-medium underline md:hidden" style={{ color: 'var(--accent2)' }}>Read the full review</button>}
              <figcaption className="mt-5 text-[13px]" style={{ color: 'var(--muted)' }}><a href={r.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{[r.name, `${r.source} review`, r.date].filter(Boolean).join(' · ')}</a></figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-0.5">
            {site.reviews.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className="grid h-8 min-w-7 place-items-center"><span className="block h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 8, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.18)' }} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

const TOWNS: Record<string, [number, number]> = {
  Grays: [0.325, 51.478], Basildon: [0.475, 51.576], 'Stanford-le-Hope': [0.434, 51.515], Thurrock: [0.36, 51.505],
};
const xy = ([lon, lat]: [number, number]) => [80 + ((lon - 0.30) / 0.2) * 240, 225 - ((lat - 51.47) / 0.12) * 190];

export function GuaranteeAreas() {
  const { site, preset } = useSite();
  const q = useQuote();
  const [town, setTown] = useState(site.areas[0]);
  const home = xy(TOWNS.Grays);
  const trust = [
    ['Guaranteed for many years', 'In his own words: “All our work is guaranteed for many years.” Ask Gerald for the terms.'],
    ['Checkatrade member', 'His profile and reviews are on Checkatrade.'],
    ['Free estimates', 'Domestic and commercial. Ideas and colours talked through on the visit.'],
  ];
  return (
    <section id="areas" aria-labelledby="areaH" className="section !pt-4 md:!pt-6">
      <div className="wrap grid gap-3 md:grid-cols-[1fr_1.25fr] md:gap-5">
        <Rise>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] border p-6 md:p-9" style={{ borderColor: 'rgba(216,222,232,.35)', background: 'radial-gradient(120% 90% at 0% 0%, rgba(216,222,232,.16), transparent 60%), var(--surface)' }}>
            <img src="/brand/badge-360-v1.webp" alt="" aria-hidden width={360} height={360} loading="lazy" className="pointer-events-none absolute -right-10 -top-10 w-[170px] opacity-[.14] md:w-[220px]" />
            <p className="eyebrow">Peace of mind</p>
            <ul className="relative mt-6 grid gap-5 md:mt-10">
              {trust.map(([t, d]) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>✓</span>
                  <div><h3 className="font-display text-[22px] font-semibold leading-tight md:text-[26px]">{t}</h3><p className="mt-1 text-[14px] leading-snug" style={{ color: 'var(--muted)' }}>{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </Rise>
        <Rise d={0.08}>
          <div className="relative h-full overflow-hidden rounded-[var(--radius)] border p-6 md:p-9" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
            <p className="eyebrow">Where we work</p>
            <h2 id="areaH" className="mt-3 font-display text-[clamp(30px,4vw,46px)] font-semibold leading-[1] tracking-[-.02em]">Grays, Thurrock <span className="serif" style={{ color: 'var(--accent2)' }}>and south Essex.</span></h2>
            <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Pick your town">
              {site.areas.map((a) => (
                <button key={a} role="radio" aria-checked={town === a} onClick={() => setTown(a)} className="h-10 rounded-full border px-4 text-[14px] font-medium transition-colors"
                  style={town === a ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-ink)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.03)' }}>{a}</button>
              ))}
            </div>
            <div className="relative mt-4 h-[210px] overflow-hidden rounded-2xl md:h-[240px]" style={{ background: 'radial-gradient(circle at 40% 55%, rgba(216,222,232,.10), transparent 65%), #141415' }} aria-hidden>
              <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
                <defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.1" fill="rgba(255,255,255,.10)" /></pattern></defs>
                <rect width="400" height="260" fill="url(#dots)" />
                {Object.entries(TOWNS).map(([n, c]) => { const [x, y] = xy(c); const on = n === town; return (
                  <g key={n}>
                    <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke={on ? preset.accent : 'rgba(255,255,255,.12)'} strokeWidth={on ? 1.6 : 1} strokeDasharray="3 4" className={on ? 'pe-dash' : ''} />
                    {on && <circle cx={x} cy={y} r="8" fill="none" stroke={preset.accent} strokeWidth="1.5" className="pe-ping" />}
                    <circle cx={x} cy={y} r={on ? 6 : 4} fill={on ? preset.accent : 'rgba(255,255,255,.55)'} />
                    <text x={x} y={y - 11} textAnchor="middle" fontSize="11" fill={on ? '#fff' : 'rgba(255,255,255,.55)'} fontFamily="var(--font-body)">{n}</text>
                  </g>); })}
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px]"><b>{`Yes, we cover ${town}.`}</b> <span style={{ color: 'var(--muted)' }}>Free estimates.</span></p>
              <a href={waLink(q, { postcode: town })} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon size={16} /> Quote in {town}</a>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faqH" className="section !pt-6" >
      <div className="wrap grid gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-16">
        <Head id="faqH" eyebrow="Questions" title="Good to" accent="know." />
        <div className="divide-y border-y" style={{ borderColor: 'var(--line)' }}>
          {faq.map((f, i) => (
            <div key={i} style={{ borderColor: 'var(--line)' }}>
              <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[18px] font-semibold md:text-[20px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
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
  const q = useQuote();
  return (
    <footer className="relative overflow-hidden border-t px-5 pb-28 pt-16 md:px-16 md:pb-12 md:pt-24" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
      <div className="wrap">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Free quote</p>
            <h2 className="h2 mt-4 max-w-[13ch]">Ready for a drive <span className="serif" style={{ color: 'var(--accent2)' }}>you're proud of?</span></h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a href={tel(site.phone)} className="flex h-[52px] items-center rounded-full px-6 text-[16px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Call {site.phone}</a>
            <a href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-[52px] items-center gap-2 rounded-full px-6 text-[16px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon /> WhatsApp</a>
          </div>
        </div>
        <div className="mt-14 flex items-center gap-5 md:gap-8">
          <img src="/brand/badge-360-v1.webp" alt="" width={360} height={360} loading="lazy" className="h-[88px] w-[88px] md:h-[150px] md:w-[150px]" />
          <div className="leading-none">
            <div className="font-display text-[clamp(44px,9vw,128px)] font-semibold tracking-[.12em]" style={{ background: 'linear-gradient(180deg,#fff,#C9D1DE 55%,#6F7B93)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>ASPECT</div>
            <div className="mt-2 text-[12px] uppercase tracking-[.3em] md:text-[15px]" style={{ color: 'var(--muted)' }}>Drives &amp; patios · <span className="serif normal-case tracking-normal text-[1.25em]" style={{ color: 'var(--accent2)' }}>by design</span></div>
          </div>
        </div>
        <div className="mt-10 grid gap-6 text-[14px] md:grid-cols-4" style={{ color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call</div><a href={tel(site.phone)}>{site.phone}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>WhatsApp</div><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">{site.mobile}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Working across</div>{site.region}</div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-[12px] md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <span>{site.legalName} · Company no. {site.companyNo}</span>
          <span>Demo by Clientgateway · prices are examples · hero, blends and concrete are illustrations</span>
        </div>
      </div>
    </footer>
  );
}

// Sticky mobile bar: Call / WhatsApp / Quote. Hidden on the hero, in the designer (it has its own bar) and at the footer.
export function StickyBar() {
  const { site } = useSite();
  const q = useQuote();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const mid = innerHeight * 0.5;
      const d = document.getElementById('design')?.getBoundingClientRect();
      const inDesign = d ? d.top < mid && d.bottom > mid : false;
      const foot = document.querySelector('footer')?.getBoundingClientRect();
      const atFoot = foot ? foot.top < innerHeight - 60 : false;
      setShow(scrollY > innerHeight * 0.85 && !inDesign && !atFoot);
    };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.nav aria-label="Quick contact" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 grid grid-cols-3 gap-1.5 rounded-full p-1.5 md:hidden"
          style={{ background: 'rgba(12,21,44,.94)', border: '1px solid var(--line)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 12px 30px rgba(0,0,0,.4)' }}>
          <a href={tel(site.phone)} className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: 'rgba(255,255,255,.07)' }}>📞 Call</a>
          <a href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon size={16} /> WhatsApp</a>
          <a href="#design" className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>£ Quote</a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
