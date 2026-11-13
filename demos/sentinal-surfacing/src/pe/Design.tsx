import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { blends, sizes, jobs } from '@/config/driveway';
import { useQuote, mailLink, tel } from './quote';
import { Head } from './ui';
import { photoSrc } from '@/config/content';

// Quote form: pick the job, a rough size and (for resin) a colour idea; it opens an email to them with it typed out.
// Preview: their own photo of that kind of job, or an illustration of the example blend.
export function Design() {
  const { site } = useSite();
  const q = useQuote();
  const [who, setWho] = useState({ name: '', phone: '', postcode: '', note: '' });
  const ok = who.name.trim().length > 1 && /\d{6,}/.test(who.phone.replace(/\s/g, '')) && who.postcode.trim().length >= 3;
  const [sent, setSent] = useState(false);
  const resin = q.job.key === 'drive' || q.job.key === 'patio';
  const [showBlend, setShowBlend] = useState(false);

  return (
    <section id="design" aria-labelledby="designH" className="section ss-glow-a">
      <div className="wrap">
        <Head id="designH" eyebrow="Get a quote" title="Tell Neil" accent="what you need."
          lede="Pick the job and a rough size. It goes to Neil by email with everything filled in, and he comes back with a transparent quote." />

        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-[1.15fr_1fr] md:gap-8">
          {/* preview */}
          <div className="ss-edge relative overflow-hidden rounded-[var(--radius)] md:sticky md:top-24 md:self-start" style={{ aspectRatio: '4 / 3', background: '#0b0f1b' }}>
            {jobs.map((j) => (
              <img key={j.key} src={photoSrc(j.photo, 1280)} alt={j.key === q.job.key ? `${j.label} by ${site.company}` : ''} loading="lazy" decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: j.key === q.job.key && !(resin && showBlend) ? 1 : 0 }} />
            ))}
            {blends.map((b) => (
              <img key={b.key} src={`/blends/${b.key}-view-640-v1.webp`} srcSet={`/blends/${b.key}-view-640-v1.webp 640w, /blends/${b.key}-view-1200-v1.webp 1200w`} sizes="(min-width: 900px) 640px, 100vw"
                alt={resin && showBlend && b.key === q.blend.key ? `Illustration of resin-bound stone in the ${b.name} example blend` : ''} loading="lazy" decoding="async" width={1200} height={900}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: resin && showBlend && b.key === q.blend.key ? 1 : 0, filter: 'brightness(1.12)' }} />
            ))}
            <div className="absolute inset-x-3 bottom-3 z-[2]">
              <div className="glass w-fit rounded-2xl px-3.5 py-2.5">
                <div className="font-display text-[17px] font-semibold leading-tight">{resin && showBlend ? q.blend.name : q.job.label}</div>
                <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>{resin && showBlend ? q.blend.note : q.job.note}</div>
              </div>
            </div>
            <span className="ex-tag left-3 top-3 z-[2]">{resin && showBlend ? 'Example blend · illustration' : `${site.company} job`}</span>
          </div>

          {/* steps */}
          <div className="ss-glass rounded-[var(--radius)] p-4 md:p-7">
            <Step n={1} label="The job">
              <div className="grid grid-cols-2 gap-2" data-q1>
                {jobs.map((j) => <Chip key={j.key} on={q.job.key === j.key} onClick={() => { q.setJob(j.key); setShowBlend(false); }}>{j.label}</Chip>)}
              </div>
            </Step>
            <Step n={2} label={`Rough size of the ${q.job.area}`}>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s) => (
                  <Chip key={s.key} on={q.size?.key === s.key} onClick={() => q.setSize(s.key)}>
                    <span className="block leading-tight">{s.label}</span><span className="block text-[11px] font-normal opacity-75">{s.hint}</span>
                  </Chip>
                ))}
              </div>
            </Step>
            {resin && (
              <Step n={3} label={`Colour idea · ${q.blend.name}`}>
                <div className="grid grid-cols-6 gap-2">
                  {blends.map((b) => (
                    <button key={b.key} type="button" onClick={() => { q.setBlend(b.key); setShowBlend(true); }} aria-label={`${b.name} (example blend)`} aria-pressed={q.blend.key === b.key}
                      className="aspect-square rounded-xl bg-cover transition-transform hover:scale-[1.04] active:scale-95"
                      style={{ backgroundImage: `url(/blends/${b.key}-160-v1.webp)`, outline: q.blend.key === b.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }} />
                  ))}
                </div>
                <p className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>Six example blends to start the conversation. Their standard range has over 40.</p>
              </Step>
            )}

            <Step n={resin ? 4 : 3} label="Where to send the quote">
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form key="f" exit={{ opacity: 0 }} className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (!ok) return; location.href = mailLink(q, who); setSent(true); }}>
                    <input className="pe-in" placeholder="Your name" autoComplete="name" value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} aria-label="Your name" />
                    <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                      <input className="pe-in" placeholder="Phone" type="tel" inputMode="tel" autoComplete="tel" value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} aria-label="Phone" />
                      <input className="pe-in" placeholder="Postcode" autoComplete="postal-code" value={who.postcode} onChange={(e) => setWho({ ...who, postcode: e.target.value })} aria-label="Postcode" />
                    </div>
                    <input className="pe-in" placeholder="Anything else? (optional)" value={who.note} onChange={(e) => setWho({ ...who, note: e.target.value })} aria-label="Anything else" />
                    <button disabled={!ok} className="ss-btn mt-1 flex h-[52px] items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition-opacity disabled:opacity-50">
                      Email it to {site.owner.first} →
                    </button>
                    <p className="text-[12px]" style={{ color: 'var(--muted)' }}>Opens your email app with the details typed out to {site.email}. Nothing is stored on this website. Rather talk? Call <a className="underline" href={tel(site.phone)}>{site.phone}</a>.</p>
                  </motion.form>
                ) : (
                  <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="font-display text-[22px] font-semibold">Check your email app.</p>
                    <p className="mt-1 text-[14px]" style={{ color: 'var(--muted)' }}>Press send and Neil has your details. Rather talk? Call <a className="underline" href={tel(site.phone)}>{site.phone}</a>.</p>
                    <button className="mt-3 text-[13px] underline" style={{ color: 'var(--muted)' }} onClick={() => setSent(false)}>Edit details</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Step>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-5 first:mt-0">
      <legend className="mb-2.5 flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>
        <i className="grid h-6 w-6 place-items-center rounded-full font-display text-[12px] not-italic" style={{ background: 'var(--grad)', color: 'var(--accent-ink)' }}>{n}</i>{label}
      </legend>
      {children}
    </fieldset>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="min-h-11 rounded-xl border px-3 py-1.5 text-[14px] font-medium transition-colors"
      style={on ? { background: 'var(--grad)', color: 'var(--accent-ink)', borderColor: 'transparent', boxShadow: '0 8px 22px -10px rgba(252,184,97,.7)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.03)' }}>{children}</button>
  );
}
