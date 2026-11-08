import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { Ticker } from './lite';
import { blends, sizes, surfaces, types } from '@/config/driveway';
import { useQuote, waLink, EXAMPLE_LABEL, gbp, sizeLabel } from './quote';
import { Head } from './ui';
import { WaIcon } from './Hero';

// "Design your driveway": same structure as the Newpave designer (preview left, numbered steps right,
// price before contact details, mini price bar on phones). Previews are stills of the hero shader.
export function Design() {
  const { site } = useSite();
  const q = useQuote();
  const [who, setWho] = useState({ name: '', phone: '', postcode: '' });
  const ok = who.name.trim().length > 1 && /\d{6,}/.test(who.phone.replace(/\s/g, '')) && who.postcode.trim().length >= 3;
  const [sent, setSent] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState(false);
  useEffect(() => {
    const el = panel.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setBar(e.isIntersecting && innerWidth < 900), { rootMargin: '-35% 0px -35% 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section id="design" aria-labelledby="designH" className="section" style={{ background: 'var(--bg)' }}>
      <div className="wrap">
        <Head id="designH" eyebrow="Design yours" title="Pick it, price it," accent="send it to Matt."
          lede="Choose a size, what's there now and the new surface. The price updates as you go. When it looks right, it goes to Matt on WhatsApp with everything filled in." />

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-[1.15fr_1fr] md:gap-8">
          {/* preview */}
          <div className="relative overflow-hidden rounded-[var(--radius)] border md:sticky md:top-24 md:self-start" style={{ borderColor: 'var(--line)', aspectRatio: '4 / 3', background: '#0d0d0d' }}>
            {types.filter((t) => t.key !== 'resin').map((t) => (
              <img key={t.key} src={`/types/${t.key}-view-640-v2.webp`} srcSet={`/types/${t.key}-view-640-v2.webp 640w, /types/${t.key}-view-1200-v2.webp 1200w`} sizes="(min-width: 900px) 640px, 100vw"
                alt={t.key === q.type.key ? `Illustration of ${t.name}` : ''} loading="lazy" decoding="async" width={1200} height={900}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: t.key === q.type.key ? 1 : 0 }} />
            ))}
            {blends.map((b) => (
              <img key={b.key} src={`/blends/${b.key}-view-640-v1.webp`} srcSet={`/blends/${b.key}-view-640-v1.webp 640w, /blends/${b.key}-view-1200-v1.webp 1200w`} sizes="(min-width: 900px) 640px, 100vw"
                alt={q.type.key === 'resin' && b.key === q.blend.key ? `Illustration of a resin-bound surface in the ${b.name} example blend` : ''} loading="lazy" decoding="async" width={1200} height={900}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: q.type.key === 'resin' && b.key === q.blend.key ? 1 : 0, filter: 'brightness(1.12)' }} />
            ))}
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
              <div className="glass rounded-2xl px-3.5 py-2.5">
                <div className="font-display text-[17px] font-semibold leading-tight">{q.type.key === 'resin' ? q.blend.name : q.type.label}</div>
                <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>{q.type.key === 'resin' ? q.blend.note : typeNote[q.type.key]}</div>
              </div>
            </div>
            <span className="ex-tag left-3 top-3">{q.type.key === 'resin' ? 'Example blend · illustration' : 'Illustration'}</span>
          </div>

          {/* steps */}
          <div ref={panel} className="rounded-[var(--radius)] border p-4 md:p-7" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
            <Step n={1} label="Size of drive">
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s) => <Chip key={s.key} on={q.sizeKey === s.key} onClick={() => q.setSize(s.key)}>{s.label}</Chip>)}
              </div>
              <label className="mt-3 flex items-center gap-3 text-[14px]" style={{ color: 'var(--muted)' }}>
                <input type="range" min={10} max={150} step={1} value={q.m2} onChange={(e) => q.setM2(+e.target.value)} className="pe-range flex-1" aria-label="Driveway area in square metres" />
                <span className="w-16 text-right font-medium tabular-nums" style={{ color: 'var(--ink)' }}>{q.m2} m²</span>
              </label>
              <p className="mt-1.5 text-[12px]" style={{ color: 'var(--muted)' }}>One car space is about 18 m².</p>
            </Step>
            <Step n={2} label="What's there now">
              <div className="grid grid-cols-2 gap-2">
                {surfaces.map((s) => <Chip key={s.key} on={q.surface.key === s.key} onClick={() => q.setSurface(s.key)}>{s.label}</Chip>)}
              </div>
              <p className="mt-2 text-[13px] leading-snug" style={{ color: 'var(--muted)' }}>{q.surface.prep}</p>
            </Step>
            <Step n={3} label={`New surface · ${q.type.label}`}>
              <div className="grid grid-cols-4 gap-2">
                {types.map((t) => (
                  <button key={t.key} type="button" onClick={() => q.setType(t.key)} aria-pressed={q.type.key === t.key}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-[12.5px] font-medium leading-tight"
                    style={q.type.key === t.key ? { background: 'rgba(201,169,97,.14)', border: '1px solid var(--accent)' } : { border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)' }}>
                    <span className="block aspect-[4/3] w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(/types/${t.key}-160-v2.webp)` }} aria-hidden />{t.label}
                  </button>
                ))}
              </div>
            </Step>
            {q.type.key === 'resin' && <Step n={4} label={`Stone blend · ${q.blend.name}`}>
              <div className="grid grid-cols-6 gap-2">
                {blends.map((b) => (
                  <button key={b.key} onClick={() => q.setBlend(b.key)} aria-label={`${b.name} (example blend)`} aria-pressed={q.blend.key === b.key}
                    className="aspect-square rounded-xl bg-cover transition-transform hover:scale-[1.04] active:scale-95"
                    style={{ backgroundImage: `url(/blends/${b.key}-160-v1.webp)`, outline: q.blend.key === b.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }} />
                ))}
              </div>
              <p className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>Example blends to show the idea. On the visit, Matt talks you through design options to suit your taste and budget.</p>
            </Step>}

            <div className="mt-5 rounded-2xl p-4 [container-type:inline-size]" style={{ background: 'rgba(201,169,97,.07)', border: '1px solid rgba(201,169,97,.22)' }}>
              <div data-price className="whitespace-nowrap font-display text-[min(48px,11.5cqi)] font-semibold leading-none tracking-tight">
                £<Ticker value={q.low} />
                <span style={{ color: 'var(--muted)' }}> – </span>
                £<Ticker value={q.high} />
              </div>
              <p className="mt-2 text-[13px]" style={{ color: 'var(--accent2)' }}>{EXAMPLE_LABEL}</p>
              <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>{`${sizeLabel(q)} · now ${q.surface.label.toLowerCase()} · ${q.type.key === 'resin' ? q.blend.name : q.type.label.toLowerCase()}`}</p>
            </div>

            <Step n={q.type.key === 'resin' ? 5 : 4} label="Where to send it">
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form key="f" exit={{ opacity: 0 }} className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (!ok) return; window.open(waLink(q, who), '_blank'); setSent(true); }}>
                    <input className="pe-in" placeholder="Your name" autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} aria-label="Your name" />
                    <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                      <input className="pe-in" placeholder="Phone" type="tel" inputMode="tel" autoComplete="tel" value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} aria-label="Phone" />
                      <input className="pe-in" placeholder="Postcode" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} aria-label="Postcode" />
                    </div>
                    <button disabled={!ok} className="mt-1 flex h-[52px] items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-opacity disabled:opacity-50" style={{ background: '#25D366', color: '#062b14' }}>
                      <WaIcon /> Send to {site.owner.first} on WhatsApp
                    </button>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Opens WhatsApp with your design typed out. Nothing is stored on this website.</p>
                  </motion.form>
                ) : (
                  <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="font-display text-[22px] font-semibold">Sent to WhatsApp.</p>
                    <p className="mt-1 text-[14px]" style={{ color: 'var(--muted)' }}>Press send in WhatsApp and Matt has your design. Rather talk? Call <a className="underline" href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>, {site.hours}.</p>
                    <button className="mt-3 text-[13px] underline" style={{ color: 'var(--muted)' }} onClick={() => setSent(false)}>Edit details</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Step>
          </div>
        </div>
      </div>

      {/* phones: price follows you while you design */}
      <AnimatePresence>
        {bar && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 flex items-center justify-between rounded-full py-2 pl-5 pr-2 md:hidden"
            style={{ background: 'rgba(20,20,20,.92)', border: '1px solid var(--line)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Example <b className="font-display text-[16px]" style={{ color: 'var(--ink)' }}>{gbp(q.low)}–{gbp(q.high)}</b></span>
            <a href={waLink(q)} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}><WaIcon size={16} /> Send</a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const typeNote: Record<string, string> = {
  porcelain: 'Large-format slabs, crisp joints.',
  block: 'Herringbone block paving.',
  stone: 'Natural stone in a random pattern.',
  resin: '',
};

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-5 first:mt-0">
      <legend className="mb-2.5 flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>
        <i className="grid h-6 w-6 place-items-center rounded-full font-display text-[12px] not-italic" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{n}</i>{label}
      </legend>
      {children}
    </fieldset>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="h-11 rounded-xl border px-3 text-[14px] font-medium transition-colors"
      style={on ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.03)' }}>{children}</button>
  );
}
