import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { photos, photoSrc, process, whyResin, faq } from '@/config/content';
import { Marquee } from '@/components/library/marquee/Marquee';
import { Head, Rise, Stars, Mark } from './ui';
import { WaIcon } from './Hero';
import { useQuote, waLink } from './quote';

const tel = (p: string) => `tel:${p.replace(/\s/g, '')}`;

// Big proof band: the Google rating, then their review quotes rolling past.
export function Proof() {
  const { site } = useSite();
  return (
    <section aria-label="Google reviews" className="relative overflow-hidden border-y py-12 md:py-16" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
      <div className="wrap px-5 md:px-16">
        <a href={site.socials.google} target="_blank" rel="noreferrer" className="group flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="font-display text-[84px] font-semibold leading-none tracking-[-.04em] md:text-[132px]" style={{ background: 'linear-gradient(180deg, #FFF1C8, #C9A961 60%, #8E6D35)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
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
      </div>
      <div className="mt-9 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Marquee pauseOnHover className="[--duration:46s] [--gap:14px]">
          {site.reviews.map((r, i) => (
            <figure key={i} className="m-0 w-[300px] rounded-2xl border p-4 md:w-[380px]" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
              <Stars size={12} />
              <blockquote className="mt-2 text-[14px] leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>Google review · {r.date}</figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
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
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-5">
          {whyResin.map((w, i) => (
            <Rise key={w.key} d={i * 0.08}>
              <div className="h-full rounded-[var(--radius)] border p-5 md:p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
                <div className="h-[120px] overflow-hidden rounded-2xl md:h-[150px]" style={{ background: '#0f0f0f' }}><Diagram k={w.key} /></div>
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
        <path d="M128 86 h46 l6 14 h-58z" fill="#C9A961" transform="rotate(18 152 88)" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={110 + i * 22} cy="98" r="1.6" fill="#b9ab90" className="pe-dust" style={{ animationDelay: `${i * 0.18}s` }} />)}
    </svg>
  );
}

export function Services() {
  const { site } = useSite();
  const block = photos.find((p) => p.key === 'drive-block')!, patio = photos.find((p) => p.key === 'patio-sleepers')!;
  const items = [
    { t: 'Resin driveways', d: 'Resin-bound stone laid over a properly prepared base, in the blend you pick.', img: '/blends/golden-view-640-v1.webp', tag: 'Illustration' },
    { t: 'Driveways', d: 'New driveways, from groundwork and sub-base to the finished surface.', img: photoSrc(block, 640), tag: `${site.company} job` },
    { t: 'Patios', d: 'Patios designed and laid to suit how you use your garden.', img: photoSrc(patio, 640), tag: `${site.company} job` },
  ];
  return (
    <section id="services" aria-labelledby="svcH" className="section !pt-6 md:!pt-10">
      <div className="wrap">
        <Head id="svcH" eyebrow="What they do" title="Three things," accent="done properly." />
        <div className="mt-10 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-5">
          {items.map((s, i) => (
            <Rise key={s.t} d={i * 0.08}>
              <a href="#design" className="group relative block overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)' }}>
                <img src={s.img} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] md:aspect-[4/5]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.85))' }} />
                <span className="ex-tag left-3 top-3">{s.tag}</span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-[26px] font-semibold">{s.t}</h3>
                  <p className="mt-1 text-[14px] leading-snug" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{s.d}</p>
                </div>
              </a>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section id="how" aria-labelledby="howH" className="section" style={{ background: 'var(--bg2)' }}>
      <div className="wrap grid gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <Head id="howH" eyebrow="How a resin drive goes in" title="Five steps," accent="no shortcuts." lede="The process from Proficient Essex's own resin driveway page." />
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
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % site.reviews.length), 6500); return () => clearInterval(t); }, [site.reviews.length]);
  const r = site.reviews[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="section">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Head id="revH" eyebrow="What customers say" title="Reliable, polite," accent="superb work." />
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[14px]" style={{ borderColor: 'var(--line)' }}>
            <Stars size={13} /> {site.proof.rating.toFixed(1)} · {site.proof.reviewCount} reviews on Google ↗
          </a>
        </div>
        <div className="relative mt-10 min-h-[260px] rounded-[var(--radius)] border p-6 md:mt-14 md:min-h-[300px] md:p-12" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <span className="pointer-events-none absolute right-6 top-2 font-serif text-[140px] leading-none md:right-12 md:text-[220px]" style={{ color: 'rgba(201,169,97,.14)', fontFamily: 'var(--font-serif)' }} aria-hidden>”</span>
          <AnimatePresence mode="wait">
            <motion.figure key={i} className="relative m-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .45 }}>
              <div className="flex items-center gap-3"><Stars size={15} /><span className="text-[13px] font-medium" style={{ color: 'var(--accent2)' }}>{r.title}</span></div>
              <blockquote className="mt-4 max-w-[34ch] font-display text-[clamp(22px,3.2vw,38px)] font-medium leading-[1.2] tracking-[-.01em]">“{r.text}”</blockquote>
              <figcaption className="mt-5 text-[13px]" style={{ color: 'var(--muted)' }}>Google review{r.job ? ` · ${r.job}` : ''} · {r.date}</figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="mt-6 flex gap-2">
            {site.reviews.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className="grid h-8 min-w-8 place-items-center"><span className="block h-1.5 rounded-full transition-all" style={{ width: k === i ? 26 : 10, background: k === i ? 'var(--accent)' : 'rgba(255,255,255,.18)' }} /></button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GuaranteeAreas() {
  const { site, preset } = useSite();
  return (
    <section id="areas" aria-labelledby="areaH" className="section !pt-4 md:!pt-6">
      <div className="wrap grid gap-3 md:grid-cols-[1fr_1.2fr] md:gap-5">
        <Rise>
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[var(--radius)] border p-6 md:p-9" style={{ borderColor: 'rgba(201,169,97,.35)', background: 'radial-gradient(120% 90% at 0% 0%, rgba(201,169,97,.16), transparent 60%), var(--surface)' }}>
            <img src="/brand/logo-ring-v1.webp" alt="" aria-hidden width={320} height={320} loading="lazy" className="pointer-events-none absolute -right-16 -top-16 w-[220px] opacity-40 md:w-[280px]" />
            <p className="eyebrow">Guarantee</p>
            <div className="relative mt-16 md:mt-24">
              <h2 className="font-display text-[clamp(40px,6vw,72px)] font-semibold leading-[.95] tracking-[-.03em]">All work is <span className="serif" style={{ color: 'var(--accent2)' }}>guaranteed.</span></h2>
              <p className="mt-4 text-[15px]" style={{ color: 'var(--muted)' }}>In their words. Ask {site.owner.first} for the details on your survey.</p>
            </div>
          </div>
        </Rise>
        <Rise d={0.08}>
          <div className="relative h-full overflow-hidden rounded-[var(--radius)] border p-6 md:p-9" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
            <p className="eyebrow">Where they work</p>
            <h2 id="areaH" className="mt-3 font-display text-[clamp(30px,4vw,48px)] font-semibold leading-[1] tracking-[-.02em]">Based in {site.town}. <span className="serif" style={{ color: 'var(--accent2)' }}>Working across Essex</span> and the surrounding areas.</h2>
            <div className="relative mt-4 grid h-[220px] place-items-center overflow-hidden rounded-2xl md:h-[260px]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(201,169,97,.10), transparent 65%), #151515' }} aria-hidden>
              <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.1" fill="rgba(240,225,190,.16)" /></pattern></defs>
                <rect width="400" height="260" fill="url(#dots)" />
                {[40, 80, 120, 160].map((r) => <circle key={r} cx="200" cy="130" r={r} fill="none" stroke="rgba(201,169,97,.22)" strokeDasharray="2 5" />)}
                <circle cx="200" cy="130" r="40" fill="none" stroke={preset.accent} strokeWidth="1.5" className="pe-ping" />
                <circle cx="200" cy="130" r="40" fill="none" stroke={preset.accent} strokeWidth="1.5" className="pe-ping" style={{ animationDelay: '1.3s' }} />
                <circle cx="200" cy="130" r="6" fill={preset.accent} />
              </svg>
              <span className="absolute left-1/2 top-1/2 mt-4 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: 'rgba(0,0,0,.6)', color: 'var(--accent2)' }}>{site.town}</span>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>Essex and the surrounding areas</span>
            </div>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>Not sure if you're covered? Ask {site.owner.first}: {site.phone}.</p>
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
            <p className="eyebrow">Free survey</p>
            <h2 className="h2 mt-4 max-w-[13ch]">Ready for a drive <span className="serif" style={{ color: 'var(--accent2)' }}>you're proud of?</span></h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a href={tel(site.phone)} className="flex h-[52px] items-center rounded-full px-6 text-[16px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Call {site.phone}</a>
            <a href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-[52px] items-center gap-2 rounded-full px-6 text-[16px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon /> WhatsApp</a>
          </div>
        </div>
        <img src="/brand/wordmark-v2.webp" alt={site.company} width={332} height={80} loading="lazy" className="mt-14 w-full max-w-[1100px] opacity-90" />
        <div className="mt-10 grid gap-6 text-[14px] md:grid-cols-4" style={{ color: 'var(--muted)' }}>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Call or WhatsApp</div><a href={tel(site.phone)}>{site.phone}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Email</div><a href={`mailto:${site.email}`} className="break-all">{site.email}</a></div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Hours</div>{site.hours}</div>
          <div><div className="mb-1.5 font-medium" style={{ color: 'var(--ink)' }}>Based in</div>{site.town}, {site.region}</div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-[12px] md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          <span>{site.legalName} · Company no. {site.companyNo} · Resin driveways, driveways and patios</span>
          <span>Demo by Clientgateway · prices are examples · hero and blends are illustrations</span>
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
          style={{ background: 'rgba(20,20,20,.92)', border: '1px solid var(--line)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 12px 30px rgba(0,0,0,.4)' }}>
          <a href={tel(site.phone)} className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: 'rgba(255,255,255,.07)' }}>📞 Call</a>
          <a href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon size={16} /> WhatsApp</a>
          <a href="#design" className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>£ Quote</a>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
