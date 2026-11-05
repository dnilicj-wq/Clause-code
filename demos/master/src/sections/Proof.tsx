import { Comparison03 } from '@/components/library/comparison-03/Comparison03';
import { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
const SpillTest = lazy(() => import('@/components/signature/spill-test/SpillTest'));
import { useSite } from '@/src/lib/ctx';
import { MagicCard } from '@/components/library/magic-card/MagicCard';

// "Not all floor coatings are the same thing": the comparison and the live proof tiles in ONE section
// (was two: Bento + Compare). All tiles are illustrations of how the work is done, never data.
export function Bento() {
  const { site, trade } = useSite();
  const days = trade.pricing.days[trade.pricing.defaultSpace] || 2;
  const c = trade.copy.bento;
  const cmp = trade.compare;
  const k = trade.copy.compare;
  return (
    <section aria-label="How we do it" className="section" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <p className="eyebrow">{k.eyebrow}</p>
        <h2 className="h2 mt-4 max-w-[16ch]">{k.h1} <span className="serif" style={{ color: 'var(--accent2)' }}>{k.h2}</span></h2>
        <Comparison03 bare className="mt-2" heading={null} cols={cmp.cols} short={k.short} rows={cmp.rows} note={cmp.note} />
        <div className="mt-8 grid grid-cols-1 md:mt-12 md:auto-rows-[minmax(200px,auto)] gap-3 md:grid-cols-6 md:gap-4">
          {c.spill && (
            <Tile className="max-md:[&_canvas]:!aspect-square md:col-span-4 md:row-span-2" title={c.spill.title} text={c.spill.text} tag="">
              <Suspense fallback={<div className="aspect-[4/5] sm:aspect-[16/10]" />}><SpillTest /></Suspense>
            </Tile>
          )}
          <Tile className={c.spill ? 'md:col-span-2' : 'md:col-span-3'} title={c.gauge.title} text={c.gauge.text} tag="Illustration">
            <Gauge />
          </Tile>
          {c.tyre && (
            <Tile className="max-md:hidden md:col-span-2" title={c.tyre.title} text={c.tyre.text} tag="Illustration">
              <Tyre />
            </Tile>
          )}
          <Tile className={c.spill ? 'max-md:hidden md:col-span-6' : 'md:col-span-3'} title={c.timelineTitle(days)} text={`Typical timeline. Your survey confirms it.${site.hours ? ` We work ${site.hours.toLowerCase()}.` : ''}`} tag="Typical">
            <Timeline steps={c.steps} />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ title, text, tag, className = '', children }: { title: string; text: string; tag: string; className?: string; children: React.ReactNode }) {
  return (
    <MagicCard className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] ${className}`} gradientColor="color-mix(in srgb, var(--accent) 22%, transparent)" gradientFrom="var(--accent)" gradientTo="var(--accent2)">
      <div className="flex h-full flex-col gap-4 p-5 md:gap-5 md:p-7">
        <div className="relative min-h-[80px] flex-1 md:min-h-[120px]">{children}</div>
        <div>
          <h3 className="font-display text-[22px] font-semibold">{title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{text}</p>
        </div>
      </div>
      {tag && <span className="ex-tag right-3 top-3">{tag}</span>}
    </MagicCard>
  );
}

function Gauge() {
  return (
    <svg viewBox="0 0 200 120" className="h-full max-h-[110px] md:max-h-[150px] w-full">
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#3FB37F" /><stop offset=".6" stopColor="#E9B949" /><stop offset="1" stopColor="#D9534F" /></linearGradient></defs>
      <path d="M20 105 A80 80 0 0 1 180 105" fill="none" stroke="var(--line)" strokeWidth="14" strokeLinecap="round" />
      <path d="M20 105 A80 80 0 0 1 180 105" fill="none" stroke="url(#gg)" strokeWidth="14" strokeLinecap="round" strokeDasharray="252" strokeDashoffset="0" opacity=".9" />
      <motion.line x1="100" y1="105" x2="100" y2="40" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"
        style={{ originX: 0.5, originY: 1 }} initial={{ rotate: -70 }}
        animate={{ rotate: [-70, -20, -48, -30, -70] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
      <circle cx="100" cy="105" r="7" fill="var(--ink)" />
      <text x="20" y="120" fontSize="10" fill="var(--muted)">Dry</text><text x="160" y="120" fontSize="10" fill="var(--muted)">Damp</text>
    </svg>
  );
}

function Tyre() {
  return (
    <div className="grid h-[118px] md:h-[150px] grid-cols-2 gap-3 text-[11px] uppercase tracking-[.1em]">
      {[{ label: 'Floor paint', lift: true }, { label: 'Resin system', lift: false }].map((s) => (
        <div key={s.label} className="relative overflow-hidden rounded-xl border" style={{ borderColor: 'var(--line)', backgroundImage: `url(${s.lift ? '/demo/tex-base-v1.webp' : '/demo/tex-flake-v1.webp'})`, backgroundSize: 'cover' }}>
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-white">{s.label}</span>
          <motion.div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 rounded-full"
            style={{ background: 'repeating-conic-gradient(#1a1a1a 0 12deg, #2b2b2b 12deg 24deg)', boxShadow: 'inset 0 0 0 9px #111, 0 10px 20px rgba(0,0,0,.6)' }}
            animate={{ y: ['-160%', '-50%', '-50%', '-160%'] }} transition={{ duration: 4.5, repeat: Infinity, times: [0, .25, .7, 1] }} />
          {s.lift && (
            <motion.div className="absolute left-1/2 top-1/2 h-10 w-12 -translate-x-1/2 rounded-md" style={{ background: 'rgba(110,110,110,.95)', clipPath: 'polygon(10% 20%, 90% 0, 100% 70%, 40% 100%, 0 60%)' }}
              animate={{ opacity: [0, 0, 1, 0], y: ['-40%', '-40%', '-120%', '-160%'] }} transition={{ duration: 4.5, repeat: Infinity, times: [0, .6, .72, 1] }} />
          )}
        </div>
      ))}
    </div>
  );
}


function Timeline({ steps }: { steps: [string, string][] }) {
  return (
    <div className="flex h-[120px] flex-col justify-center gap-4">
      <div className="relative h-1.5 rounded-full bg-white/10">
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
          animate={{ width: ['0%', '100%', '100%'] }} transition={{ duration: 6, repeat: Infinity, times: [0, .8, 1] }} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map(([d, s], i) => (
          <div key={i}>
            <div className="text-[11px] uppercase tracking-[.1em]" style={{ color: 'var(--accent)' }}>{d}</div>
            <div className="mt-1 text-[13px] leading-tight md:text-[15px]">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
