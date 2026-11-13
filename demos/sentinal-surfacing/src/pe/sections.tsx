import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { photoSrc, process, whyResin, faq, floors, timeline } from '@/config/content';
import { Head, Rise, Stars } from './ui';
import { GoogleG } from './Hero';
import { useQuote, tel } from './quote';
import { LampCta } from '@/components/library/lamp-cta/LampCta';

// Proof band: their Google reviews (Trustindex widget on their site), then the quotes rolling past.
export function Proof() {
  const { site } = useSite();
  return (
    <section aria-label="Google reviews" className="ss-seam relative overflow-hidden py-12 md:py-16" style={{ background: 'var(--bg2)' }}>
      <div className="wrap px-5 md:px-16">
        <a href={site.socials.google} target="_blank" rel="noreferrer" className="group flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="ss-grad-text font-display text-[72px] font-semibold leading-none tracking-[-.04em] md:text-[120px]">{site.proof.ratingWord}</span>
            <p className="font-display text-[20px] font-semibold leading-tight md:text-[28px]">{site.proof.reviewCount} reviews<br /><span style={{ color: 'var(--muted)' }}>on Google</span></p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors group-hover:bg-white/5" style={{ borderColor: 'var(--line)' }}>
            <GoogleG size={16} /> See them on Google ↗
          </span>
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
    <div ref={el} className="mt-9 flex cursor-grab gap-3.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] active:cursor-grabbing md:px-16 [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }} aria-label="Customer reviews, swipe for more">
      {items.map((r, i) => (
        <figure key={i} aria-hidden={i >= site.reviews.length} className="ss-glass m-0 flex w-[300px] shrink-0 select-none flex-col rounded-2xl p-4 md:w-[380px]">
          <Stars size={12} />
          <blockquote className="mt-2 line-clamp-5 whitespace-pre-line text-[14px] leading-relaxed">“{r.text}”</blockquote>
          <figcaption className="mt-auto pt-3 text-[12px]" style={{ color: 'var(--muted)' }}><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.name}</b> · Google review</figcaption>
        </figure>
      ))}
    </div>
  );
}

// What they do: their three services, in their words, each on one of their own photos.
export function Services() {
  const q = useQuote();
  const items = [
    { t: 'Resin bound stone', d: 'A bespoke resin-bound surface adds real kerb appeal, in a colour specific to your home.', img: 'darras-hall', job: 'drive' as const },
    { t: 'Microcement', d: 'Floors, walls and ceilings, indoor or outdoor. Venetian plaster too.', img: 'portland-lounge', job: 'micro' as const },
    { t: 'Commercial flooring', d: 'From high-traffic industrial units to sensitive hospital environments.', img: 'hanover', job: 'floor' as const },
  ];
  return (
    <section id="services" aria-labelledby="svcH" className="section">
      <div className="wrap">
        <Head id="svcH" eyebrow="What we do" title="Outside, inside," accent="all seamless." />
      </div>
      <div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-auto md:mt-12 md:grid md:max-w-[1240px] md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        {items.map((s, i) => (
          <Rise key={s.t} d={i * 0.06} className="w-[78vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none">
            <a href="#design" onClick={() => q.setJob(s.job)} className="ss-edge group relative block overflow-hidden rounded-[var(--radius)]">
              <img src={photoSrc(s.img, 640)} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(9,13,24,0) 35%, rgba(9,13,24,.92))' }} />
              <span className="ex-tag left-3 top-3">Their job</span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-[24px] font-semibold leading-tight">{s.t}</h3>
                <p className="mt-1 text-[14px] leading-snug" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{s.d}</p>
                <span className="mt-3 inline-block text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>Ask for a quote →</span>
              </div>
            </a>
          </Rise>
        ))}
      </div>
    </section>
  );
}

// Inside floors: their microcement and floor jobs. A light sweeps across the floor like a reflection when idle.
export function Floors() {
  const q = useQuote();
  const [tab, setTab] = useState<'Homes' | 'Commercial'>('Homes');
  const list = floors.filter((f) => f.tag === tab);
  const [i, setI] = useState(0);
  const cur = list[Math.min(i, list.length - 1)];
  const touched = useRef(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => { if (!touched.current) setI((v) => (v + 1) % list.length); }, 4200);
    return () => clearInterval(t);
  }, [list.length]);
  const copy = tab === 'Homes'
    ? { h: 'Microcement for homes', d: 'Microcement systems let them create a unique surface suited to your needs and tastes: flooring, wall finishes, indoor or outdoor. Venetian plaster too.', note: 'Sentinal Microcement since 2008, after bespoke training in Italy.' }
    : { h: 'Seamless commercial floors', d: 'From high-traffic industrial units to sensitive hospital environments, they have a seamless surface solution to any application.', note: 'Trusted by hotels, the NHS and local authorities.' };
  return (
    <section id="floors" aria-labelledby="flH" className="section ss-glow-b" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="flH" eyebrow="Inside floors" title="The same finish," accent="indoors." lede="Seamless microcement and resin floor finishes for kitchens, bathrooms, open-plan homes and commercial spaces." />
          <div className="ss-glass flex w-fit gap-1 rounded-full p-1" role="tablist" aria-label="Floor type">
            {(['Homes', 'Commercial'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setI(0); touched.current = false; }}
                className="h-10 rounded-full px-5 text-[14px] font-semibold transition-colors"
                style={tab === t ? { background: 'var(--grad)', color: 'var(--accent-ink)' } : { color: 'var(--muted)' }}>{t}</button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-[1.35fr_1fr] md:gap-6">
          <div className="ss-edge relative overflow-hidden rounded-[var(--radius)]" style={{ aspectRatio: '4 / 3', background: '#0b0f1b' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img key={cur.key} src={photoSrc(cur.key, 1280)} alt={`${cur.title}${cur.place ? `, ${cur.place}` : ''}, by Sentinal Surfacing`} loading="lazy" decoding="async"
                initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover" />
            </AnimatePresence>
            <div className="ss-sheen pointer-events-none absolute inset-0" aria-hidden />
            <span className="ex-tag left-3 top-3">Their job</span>
            <div className="glass absolute bottom-3 left-3 rounded-2xl px-3.5 py-2.5">
              <div className="text-[11px] uppercase tracking-[.14em]" style={{ color: 'var(--pop)' }}>{tab}{cur.place ? ` · ${cur.place}` : ''}</div>
              <div className="font-display text-[17px] font-semibold">{cur.title}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                <h3 className="font-display text-[28px] font-semibold leading-tight md:text-[34px]">{copy.h}</h3>
                <p className="mt-3 text-[16px] leading-relaxed" style={{ color: 'var(--muted)' }}>{copy.d}</p>
                <p className="mt-4 flex items-center gap-2 text-[14px] font-medium"><span className="h-2 w-2 rounded-full" style={{ background: 'var(--pop)', boxShadow: '0 0 12px var(--pop)' }} />{copy.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {list.map((f, k) => (
                <button key={f.key} onClick={() => { touched.current = true; setI(k); }} aria-label={f.title} aria-pressed={f.key === cur.key}
                  className="aspect-square overflow-hidden rounded-xl transition-transform active:scale-95"
                  style={{ outline: f.key === cur.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }}>
                  <img src={photoSrc(f.key, 640)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <a href="#design" onClick={() => q.setJob(tab === 'Homes' ? 'micro' : 'floor')} className="ss-btn mt-6 flex h-12 w-fit items-center rounded-full px-6 text-[15px] font-semibold md:mt-auto">
              Quote for {tab === 'Homes' ? 'a microcement floor' : 'a commercial floor'} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Their story (about-us timeline), and where their photographed jobs are.
const PLACES: Record<string, [number, number]> = {
  Consett: [-1.83, 54.85], Gosforth: [-1.62, 55.01], Durham: [-1.575, 54.776], Irthington: [-2.83, 54.95], Cockermouth: [-3.36, 54.66],
  Warkworth: [-1.61, 55.35], Hartlepool: [-1.21, 54.69], Seaham: [-1.35, 54.84], Wetherby: [-1.39, 53.93], Blyth: [-1.51, 55.13], Gretna: [-3.06, 55.0],
};
const xy = ([lon, lat]: [number, number]) => [30 + ((lon + 3.6) / 2.6) * 340, 250 - ((lat - 53.8) / 1.7) * 230];

export function Story() {
  const { site } = useSite();
  const [p, setP] = useState(0);
  const rail = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const f = () => { const el = rail.current; if (!el) return; const r = el.getBoundingClientRect(); setP(Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height))); };
    f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f);
  }, []);
  const [pin, setPin] = useState('Consett');
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const keys = Object.keys(PLACES); let k = 0;
    const t = setInterval(() => { k = (k + 1) % keys.length; setPin(keys[k]); }, 1600);
    return () => clearInterval(t);
  }, []);
  const home = xy(PLACES.Consett);
  const trust = ['Five-star hotels', 'NHS Trust projects', 'Local councils', 'English Heritage sites', 'Grand Designs (2024)'];
  return (
    <section id="about" aria-labelledby="storyH" className="section ss-glow-a">
      <div className="wrap grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <div>
          <Head id="storyH" eyebrow={`Since ${site.since}`} title="Twenty years of" accent="seamless surfaces." lede="From private homes to five-star hotels and NHS Trust projects. Founded in Newcastle by Neil Conway, now working across the North of England, Scotland and Europe." />
          <div className="mt-7 flex flex-wrap gap-2">
            {trust.map((t) => <span key={t} className="ss-glass rounded-full px-3.5 py-2 text-[13px] font-medium">{t}</span>)}
          </div>
          <div id="areas" className="ss-edge relative mt-8 overflow-hidden rounded-[var(--radius)] p-5" style={{ background: 'radial-gradient(circle at 60% 40%, rgba(111,140,255,.12), transparent 65%), var(--surface)' }}>
            <p className="eyebrow">Places they have worked</p>
            <div className="relative mt-3 h-[230px] md:h-[260px]" aria-hidden>
              <svg viewBox="0 0 400 270" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
                <defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.1" fill="rgba(196,208,255,.10)" /></pattern></defs>
                <rect width="400" height="270" fill="url(#dots)" />
                <text x="44" y="22" fontSize="11" fill="rgba(255,255,255,.4)" fontFamily="var(--font-body)">↑ Scotland</text>
                {Object.entries(PLACES).map(([n, c]) => { const [x, y] = xy(c); const on = n === pin; return (
                  <g key={n}>
                    {n !== 'Consett' && <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke={on ? '#6F8CFF' : 'rgba(196,208,255,.12)'} strokeWidth={on ? 1.6 : 1} strokeDasharray="3 4" className={on ? 'pe-dash' : ''} />}
                    {on && <circle cx={x} cy={y} r="8" fill="none" stroke="#FCB861" strokeWidth="1.5" className="pe-ping" />}
                    <circle cx={x} cy={y} r={n === 'Consett' ? 6 : on ? 5 : 3.5} fill={n === 'Consett' || on ? '#FCB861' : 'rgba(255,255,255,.55)'} />
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="10.5" fill={on || n === 'Consett' ? '#fff' : 'rgba(255,255,255,.5)'} fontFamily="var(--font-body)">{n === 'Consett' ? 'Consett (base)' : n}</text>
                  </g>); })}
              </svg>
            </div>
            <p className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>Towns taken from the photos on their own website. Base: {site.address}.</p>
          </div>
        </div>
        <ol ref={rail} className="relative m-0 list-none p-0 md:pt-4">
          <span className="absolute bottom-3 left-[19px] top-3 w-px" style={{ background: 'rgba(196,208,255,.12)' }} aria-hidden />
          <span className="absolute left-[19px] top-3 w-px origin-top" style={{ height: 'calc(100% - 24px)', transform: `scaleY(${p})`, background: 'linear-gradient(180deg, var(--pop), var(--accent), #F07A3E)', boxShadow: '0 0 12px rgba(252,184,97,.6)' }} aria-hidden />
          {timeline.map((s, i) => {
            const lit = p * timeline.length > i + 0.2;
            return (
              <li key={s.y} className="relative flex gap-5 pb-6 last:pb-0">
                <span className="relative z-[1] mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-[10px] font-semibold transition-all duration-500"
                  style={lit ? { background: 'var(--grad)', color: 'var(--accent-ink)', boxShadow: '0 0 18px rgba(252,184,97,.55)' } : { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)' }}>{s.y === 'Today' ? 'Now' : `’${s.y.slice(2)}`}</span>
                <div className="pt-1">
                  <div className="text-[12px] font-semibold tracking-[.12em]" style={{ color: lit ? 'var(--accent)' : 'var(--muted)' }}>{s.y}</div>
                  <h3 className="font-display text-[20px] font-semibold leading-tight">{s.t}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>{s.d}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Reviews() {
  const { site } = useSite();
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % site.reviews.length), 7000); return () => clearInterval(t); }, [site.reviews.length]);
  const r = site.reviews[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="section">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="revH" eyebrow="What customers say" title="Like dealing" accent="with a mate." />
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[14px]" style={{ borderColor: 'var(--line)' }}>
            <GoogleG /> {site.proof.ratingWord} · {site.proof.reviewCount} reviews on Google ↗
          </a>
        </div>
        <div className="ss-glass relative mt-10 min-h-[300px] rounded-[var(--radius)] p-6 md:mt-14 md:min-h-[320px] md:p-12">
          <span className="pointer-events-none absolute right-6 top-2 text-[140px] leading-none md:right-12 md:text-[220px]" style={{ color: 'rgba(252,184,97,.16)', fontFamily: 'var(--font-serif)' }} aria-hidden>”</span>
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="relative m-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .45 }}>
              <div className="flex items-center gap-3"><Stars size={15} />{r.job && <span className="text-[13px] font-medium" style={{ color: 'var(--pop)' }}>{r.job}</span>}</div>
              <blockquote className="mt-4 max-w-[46ch] whitespace-pre-line font-display text-[clamp(19px,2.4vw,30px)] font-medium leading-[1.25] tracking-[-.01em]">“{r.text}”</blockquote>
              <figcaption className="mt-5 text-[14px]"><b>{r.name}</b> <span style={{ color: 'var(--muted)' }}>· Google review</span></figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-6 flex flex-wrap gap-0.5">
            {site.reviews.map((x, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review by ${x.name}`} className="grid h-8 min-w-7 place-items-center"><span className="block h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 8, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.18)' }} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// Why resin: general facts, each with a small looping diagram (keeps the page alive when idle).
export function WhyResin() {
  return (
    <section id="why" aria-labelledby="whyH" className="section ss-glow-b" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <Head id="whyH" eyebrow="Why resin bound" title="Porous, smooth," accent="and no weeds." lede="General facts about resin-bound surfaces, so you know what you are choosing." />
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-5">
          {whyResin.map((w, i) => (
            <Rise key={w.key} d={i * 0.08}>
              <div className="ss-glass flex h-full items-start gap-4 rounded-[var(--radius)] p-4 md:block md:p-6">
                <div className="h-[92px] w-[112px] shrink-0 overflow-hidden rounded-2xl md:h-[150px] md:w-auto" style={{ background: '#0a0e19' }}><Diagram k={w.key} /></div>
                <div>
                  <h3 className="font-display text-[19px] font-semibold leading-tight md:mt-4 md:text-[22px]">{w.title}</h3>
                  <p className="mt-1 text-[14px] leading-snug md:mt-1.5 md:text-[15px] md:leading-relaxed" style={{ color: 'var(--muted)' }}>{w.text}</p>
                </div>
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
      <defs><linearGradient id="st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE0A8" /><stop offset="1" stopColor="#B07434" /></linearGradient></defs>
      {stones.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.r} ry={s.r * 0.75} fill="url(#st)" opacity=".9" />)}
      <rect x="0" y="100" width="320" height="50" fill="#1a2030" />
      <text x="10" y="138" fontSize="10" fill="#8a90a2" fontFamily="var(--font-body)">sub-base</text>
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={20 + i * 34} cy={0} r="2.6" fill="#8FA6FF" className="pe-drop" style={{ animationDelay: `${(i * 0.37) % 2}s` }} />
      ))}
    </svg>
  );
  if (k === 'weeds') return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden>
      <rect x="0" y="70" width="150" height="80" fill="#363a44" /><path d="M60 70 L66 95 L58 120 L64 150" stroke="#0d0f14" strokeWidth="3" fill="none" />
      <g className="pe-weed"><path d="M62 72 C 56 55, 48 50, 40 48 M62 72 C 66 52, 74 46, 84 46 M62 72 C 60 58, 62 44, 64 36" stroke="#6B8F3A" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
      <text x="10" y="64" fontSize="11" fill="#8a90a2" fontFamily="var(--font-body)">cracked concrete</text>
      <rect x="170" y="70" width="150" height="80" fill="#6d5636" />
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={176 + (i % 10) * 15} cy={78 + Math.floor(i / 10) * 18} r="6" fill={['#C49A62', '#E9D3A6', '#8C6A3F'][i % 3]} />)}
      <text x="180" y="64" fontSize="11" fill="#8a90a2" fontFamily="var(--font-body)">resin bound: no joints</text>
      <rect className="pe-shine" x="170" y="70" width="40" height="80" fill="url(#shine)" />
      <defs><linearGradient id="shine" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".25" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
  return (
    <svg viewBox="0 0 320 150" className="h-full w-full" aria-hidden>
      {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={8 + (i % 20) * 16} cy={104 + Math.floor(i / 20) * 15} r="6.5" fill={['#A3A5A7', '#E2E2DF', '#6B6D70'][i % 3]} />)}
      <g className="pe-broom">
        <rect x="150" y="10" width="5" height="78" rx="2" fill="#B08E4F" transform="rotate(18 152 88)" />
        <path d="M128 86 h46 l6 14 h-58z" fill="#FCB861" transform="rotate(18 152 88)" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={110 + i * 22} cy="98" r="1.6" fill="#b9ab90" className="pe-dust" style={{ animationDelay: `${i * 0.18}s` }} />)}
    </svg>
  );
}

export function Process() {
  return (
    <section id="how" aria-labelledby="howH" className="section">
      <div className="wrap grid gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <Head id="howH" eyebrow="How it works" title="Quote, lay," accent="done in days." lede="In their own words: a detailed solution and a transparent quote, then a surface that is usable the next day on a simple overlay." />
        </div>
        <ol className="relative m-0 list-none p-0">
          <span className="absolute bottom-4 left-[19px] top-4 w-px" style={{ background: 'linear-gradient(180deg, var(--accent), var(--pop), transparent)' }} aria-hidden />
          {process.map((s, i) => (
            <li key={s.title} className="relative pb-7 last:pb-0"><Rise d={i * 0.05} className="flex gap-5">
              <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-[15px] font-semibold" style={{ background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>{i + 1}</span>
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

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faqH" className="section !pt-6">
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

// Finale: Lamp CTA (every build). No mobile WhatsApp on their site, so the second button is Call.
export function Finale() {
  const { site } = useSite();
  return (
    <LampCta heading="Let's see your driveway." subline="Tell Neil about your drive, patio or floor. You get a detailed solution and a transparent quote."
      primaryLabel="Get a quote" primaryHref="#design" phoneHref={tel(site.phone)} />
  );
}

export function Footer() {
  const { site } = useSite();
  return (
    <footer className="ss-seam relative overflow-hidden px-5 pb-28 pt-16 md:px-16 md:pb-12 md:pt-20" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <img src="/brand/logo-v1.png" alt={site.company} width={1513} height={265} loading="lazy" className="w-full max-w-[560px]" />
        <div className="mt-10 grid gap-6 text-[14px] sm:grid-cols-2 md:grid-cols-4" style={{ color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call</div><a className="inline-block py-1.5" href={tel(site.phone)}>{site.phone}</a><br /><a className="inline-block py-1.5" href={tel(site.mobile)}>{site.mobile}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Office</div>{site.address}<br />{site.hours}</div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Follow</div>
            <a href={site.socials.facebook} target="_blank" rel="noreferrer">Facebook</a> · <a href={site.socials.instagram} target="_blank" rel="noreferrer">Instagram</a> · <a href={site.socials.youtube} target="_blank" rel="noreferrer">YouTube</a></div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-[12px] md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <span>© {site.company}</span>
          <span>Demo by Clientgateway · hero and blends are illustrations · photos from sentinalsurfacing.co.uk</span>
        </div>
      </div>
    </footer>
  );
}

// Sticky mobile bar: Call / Email / Quote. Hidden on the hero, in the quote form and at the footer.
export function StickyBar() {
  const { site } = useSite();
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
          style={{ background: 'rgba(13,18,32,.92)', border: '1px solid var(--line)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 12px 30px rgba(0,0,0,.4)' }}>
          <a href={tel(site.phone)} className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: 'rgba(255,255,255,.07)' }}>Call</a>
          <a href={`mailto:${site.email}`} className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: 'rgba(111,140,255,.16)', border: '1px solid rgba(111,140,255,.35)' }}>Email</a>
          <a href="#design" className="ss-btn flex h-11 items-center justify-center rounded-full text-[14px] font-semibold">Quote</a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
