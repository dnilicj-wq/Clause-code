import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { estimate, gbp, finishBg, type Finish } from '@/config/trades/epoxy';
import { ContainerScroll } from '@/components/library/container-scroll/ContainerScroll';
import { NumberTicker } from '@/components/library/number-ticker/NumberTicker';

// Price range BEFORE contact details. Pricing logic ported from demos/coating/src/derive.js (£ and m²).
export function Quote() {
  const [wide, setWide] = useState(false);
  useEffect(() => { const f = () => setWide(innerWidth >= 900); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const title = (
    <div className="px-5 pb-6">
      <p className="eyebrow">Your price, before your phone number</p>
      <h2 className="h2 mx-auto mt-4 max-w-[15ch]">See a real range <span className="serif" style={{ color: 'var(--accent2)' }}>in ten seconds.</span></h2>
    </div>
  );
  return (
    <section id="price" aria-label="Price" className="relative" style={{ background: 'var(--bg)' }}>
      {wide ? (
        <div className="-mt-24">
          <ContainerScroll titleComponent={title}>
            <Configurator />
          </ContainerScroll>
        </div>
      ) : (
        <div className="section pb-16 text-center">
          {title}
          <div className="overflow-hidden rounded-[26px] border-[3px] p-1.5 text-left" style={{ borderColor: '#4a4a4a', background: '#1c1c1c' }}>
            <div className="rounded-[20px]" style={{ background: 'var(--surface)' }}><Configurator /></div>
          </div>
        </div>
      )}
    </section>
  );
}

function Configurator() {
  const { site, trade } = useSite();
  const P = trade.pricing;
  const [space, setSpace] = useState(P.defaultSpace);
  const [m2, setM2] = useState(P.spaces[P.defaultSpace].m2);
  const [finish, setFinish] = useState<Finish>(trade.finishes[0]);
  const q = trade.copy.quote;
  const [condition, setCondition] = useState(q.conditions[0][0]);
  const [stage, setStage] = useState<'price' | 'form' | 'done'>('price');
  const est = useMemo(() => estimate(P, { space, m2, finish: finish.type, condition }), [P, space, m2, finish, condition]);

  return (
    <div className="grid h-full grid-cols-1 text-[var(--ink)] md:grid-cols-[1.05fr_1fr]" style={{ background: 'var(--surface)' }}>
      <div className="flex flex-col gap-5 p-5 md:p-8">
        <Field label="Space">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(P.spaces).map(([k, s]) => (
              <Chip key={k} on={space === k} onClick={() => { setSpace(k); setM2(s.m2); }}>{s.label}</Chip>
            ))}
          </div>
        </Field>
        <Field label={`Floor size · ${m2} m²`}>
          <input type="range" min={10} max={200} value={m2} onChange={(e) => setM2(+e.target.value)} className="w-full accent-[var(--accent)]" aria-label="Floor size in square metres" />
        </Field>
        <Field label={`Finish · ${finish.name}`}>
          <div className="flex flex-wrap gap-2">
            {trade.finishes.map((f) => (
              <button key={f.key} onClick={() => setFinish(f)} title={f.name} aria-label={f.name}
                className="h-11 w-11 rounded-full bg-cover bg-center transition-transform hover:scale-105"
                style={{ backgroundImage: finishBg(f), outline: finish.key === f.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }} />
            ))}
          </div>
        </Field>
        <Field label={q.conditionLabel}>
          <div className="grid grid-cols-3 gap-2">
            {q.conditions.map(([k, l]) => <Chip key={k} on={condition === k} onClick={() => setCondition(k)}>{l}</Chip>)}
          </div>
        </Field>
      </div>

      <div className="relative flex flex-col justify-between gap-5 overflow-hidden border-t p-5 md:border-l md:border-t-0 md:p-8" style={{ borderColor: 'var(--line)' }}>
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: finishBg(finish), backgroundSize: 'cover', maskImage: 'linear-gradient(180deg, transparent, #000 70%)' }} />
        <AnimatePresence mode="wait">
          {stage === 'price' && (
            <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative">
              <div className="flex items-center gap-2"><span className="label-chip rounded-full px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,.08)' }}>{P.label}</span></div>
              <div className="mt-4 font-display text-[44px] font-semibold leading-none tracking-tight md:text-[56px]">
                £<NumberTicker value={est.low} startValue={Math.round(est.low * 0.8)} className="!text-[var(--ink)] tracking-tight" />
                <span style={{ color: 'var(--muted)' }}> – </span>
                £<NumberTicker value={est.high} startValue={Math.round(est.high * 0.8)} className="!text-[var(--ink)] tracking-tight" />
              </div>
              <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>{est.m2} m² · {finish.name} · about {est.days} days on site</p>
              <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>Projects start from {gbp(P.minimumJob)}. Exact price after a free survey.</p>
            </motion.div>
          )}
          {stage === 'form' && <LeadForm key="f" summary={`${est.m2} m² ${finish.name}, ${gbp(est.low)}–${gbp(est.high)}`} onDone={() => setStage('done')} />}
          {stage === 'done' && (
            <motion.div key="d" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <h3 className="font-display text-[30px] font-semibold">Thanks. {site.owner.first ? `${site.owner.first} will` : "We'll"} call you {site.responseTime}.</h3>
              <a className="mt-4 inline-flex rounded-full px-5 py-3 font-semibold" style={{ background: '#25D366', color: '#062b14' }}
                href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi, I priced a ${est.m2} m² ${finish.name} ${trade.copy.surface} on your site (${gbp(est.low)}–${gbp(est.high)}).`)}`} target="_blank" rel="noreferrer">Or message on WhatsApp now</a>
            </motion.div>
          )}
        </AnimatePresence>
        {stage === 'price' && <ProgressButton label="Get my exact price" onDone={() => setStage('form')} />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>{label}</div>{children}</div>;
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-xl border px-3 py-2.5 text-[14px] font-medium transition-colors"
      style={on ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'var(--accent)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.03)' }}>{children}</button>
  );
}

// "Save with Progress"-style button (custom until the 21st.dev original is available; see registry)
function ProgressButton({ label, onDone }: { label: string; onDone: () => void }) {
  const [p, setP] = useState(-1);
  useEffect(() => {
    if (p < 0 || p >= 100) { if (p >= 100) { const t = setTimeout(onDone, 220); return () => clearTimeout(t); } return; }
    const t = setTimeout(() => setP((v) => Math.min(100, v + 9 + Math.random() * 14)), 60);
    return () => clearTimeout(t);
  }, [p, onDone]);
  return (
    <button onClick={() => p < 0 && setP(0)} className="relative h-14 overflow-hidden rounded-full text-[16px] font-semibold"
      style={{ background: 'color-mix(in srgb, var(--accent) 25%, transparent)', color: 'var(--ink)' }}>
      <span className="absolute inset-y-0 left-0 transition-[width] duration-100" style={{ width: `${p < 0 ? 100 : p}%`, background: 'var(--accent)' }} />
      <span className="relative" style={{ color: 'var(--accent-ink)' }}>{p < 0 ? label + ' →' : p >= 100 ? 'Ready' : 'Saving your spec…'}</span>
    </button>
  );
}

function LeadForm({ summary, onDone }: { summary: string; onDone: () => void }) {
  const { site } = useSite();
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    (window as any).dataLayer?.push({ event: 'estimator_lead', summary });
    if (site.formEndpoint) { try { await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, summary }) }); } catch { /* fall through to thank-you */ } }
    setBusy(false); onDone();
  }
  const inp = 'w-full rounded-xl border bg-black/20 px-4 py-3 text-[16px] outline-none focus:border-[var(--accent)]';
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={submit} className="relative grid gap-2.5">
      <p className="text-[14px]" style={{ color: 'var(--muted)' }}>{summary}</p>
      <input required name="name" placeholder="Your name" autoComplete="name" className={inp} style={{ borderColor: 'var(--line)' }} />
      <input required name="phone" placeholder="Phone" type="tel" autoComplete="tel" className={inp} style={{ borderColor: 'var(--line)' }} />
      <div className="grid grid-cols-2 gap-2.5">
        <input required name="postcode" placeholder="Postcode" autoComplete="postal-code" className={inp} style={{ borderColor: 'var(--line)' }} />
        <select name="time" className={inp} style={{ borderColor: 'var(--line)' }} defaultValue="Any time"><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select>
      </div>
      <button disabled={busy} className="mt-1 h-13 rounded-full py-3.5 font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{busy ? 'Sending…' : 'Book my free survey'}</button>
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>We reply {site.responseTime}. No spam, no sharing your number.</p>
    </motion.form>
  );
}
