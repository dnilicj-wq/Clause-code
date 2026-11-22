// Resinize garage-only sections: why epoxy, finish picker, process, areas, quote form.
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import type { Finish } from '@/config/trades/epoxy';
import { BeforeAfter } from './Social';

const ease = [0.22, 1, 0.36, 1] as const;
const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-12%' } };

function Icon({ d }: { d: string }) {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'linear-gradient(145deg, color-mix(in srgb, var(--accent) 28%, transparent), transparent)', border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
    </span>
  );
}

const WHY: { t: string; p: string; d: string }[] = [
  { t: 'Oil and road salt sit on top', p: 'Bare concrete soaks up drips and winter salt. A sealed epoxy floor keeps them on the surface, ready to wipe away.', d: 'M12 3c3.5 4.5 6 7.8 6 10.8A6 6 0 0 1 6 13.8C6 10.8 8.5 7.5 12 3z M9.5 15a2.5 2.5 0 0 0 2.5 2.5' },
  { t: 'Made for hot tyres', p: 'Cheap garage paint softens under a hot tyre and peels. A ground, properly built epoxy system is designed to stay put.', d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 3v5 M12 16v5 M3 12h5 M16 12h5' },
  { t: 'Sweep it, mop it, done', p: 'No more concrete dust on everything. One seamless surface with no joints for dirt to hide in.', d: 'M4 20l7-7 M14 4l6 6-7.5 7.5a3 3 0 0 1-4.2 0l-1.8-1.8a3 3 0 0 1 0-4.2L14 4z' },
  { t: 'Brighter, bigger feeling', p: 'A light, glossy floor bounces the light around. The garage starts to feel like part of the house.', d: 'M12 4V2 M12 22v-2 M4 12H2 M22 12h-2 M5.6 5.6 4.2 4.2 M19.8 19.8l-1.4-1.4 M5.6 18.4l-1.4 1.4 M19.8 4.2l-1.4 1.4 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];

export function Why() {
  return (
    <section id="why" aria-label="Why epoxy for garages" className="section relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 22%, transparent), transparent)' }} />
      <div className="wrap relative">
        <p className="eyebrow">Why epoxy in a garage</p>
        <h2 className="h2 mt-4 max-w-[15ch]">Built for cars, <span className="serif" style={{ color: 'var(--accent2)' }}>not just for looks.</span></h2>
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-4">
          {WHY.map((w, i) => (
            <motion.article key={w.t} {...rise} transition={{ duration: 0.8, delay: i * 0.08, ease }}
              className="relative overflow-hidden rounded-[var(--radius)] border p-6 md:p-8"
              style={{ borderColor: 'var(--line)', background: 'linear-gradient(160deg, color-mix(in srgb, var(--surface) 92%, var(--accent) 8%), var(--bg2))' }}>
              <div className="flex items-start gap-4">
                <Icon d={w.d} />
                <div className="min-w-0">
                  <h3 className="font-display text-[21px] font-semibold leading-tight md:text-[26px]">{w.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed md:text-[16px]" style={{ color: 'var(--muted)' }}>{w.p}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinishPicker({ finish, setFinish }: { finish: Finish; setFinish: (f: Finish) => void }) {
  const { trade } = useSite();
  const ba = trade.copy.gallery.beforeAfter;
  return (
    <section id="finishes" aria-label="Finishes" className="section relative" style={{ background: 'var(--bg2)' }}>
      <div className="wrap">
        <p className="eyebrow">Pick your finish</p>
        <h2 className="h2 mt-4 max-w-[14ch]">Four finishes. <span className="serif" style={{ color: 'var(--accent2)' }}>Tap to see each.</span></h2>
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-[1.25fr_1fr] md:gap-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] border md:aspect-auto md:min-h-[460px]" style={{ borderColor: 'var(--line)' }}>
            <AnimatePresence mode="popLayout">
              <motion.img key={finish.key} src={finish.img} alt={`${finish.name} garage floor finish`}
                initial={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease }} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.65))' }} />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6">
              <p className="font-display text-[26px] font-semibold text-white md:text-[34px]">{finish.name}</p>
              <p className="mt-1 max-w-[40ch] text-[14px] text-white/80 md:text-[15px]">{finish.note}</p>
            </div>
            <span className="ex-tag right-3 top-3">{finish.photo ? 'Example image' : 'Example render'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-1 md:gap-3" role="radiogroup" aria-label="Finish">
            {trade.finishes.map((f) => {
              const on = f.key === finish.key;
              return (
                <button key={f.key} role="radio" aria-checked={on} onClick={() => setFinish(f)}
                  className="flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors md:p-3.5"
                  style={{ borderColor: on ? 'var(--accent)' : 'var(--line)', background: on ? 'color-mix(in srgb, var(--accent) 12%, var(--surface))' : 'color-mix(in srgb, var(--surface) 60%, transparent)' }}>
                  <span className="h-11 w-11 shrink-0 rounded-xl bg-cover bg-center md:h-14 md:w-14" style={{ backgroundImage: `url(${f.img})`, boxShadow: on ? '0 0 0 2px var(--accent)' : 'inset 0 0 0 1px rgba(255,255,255,.12)' }} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight md:text-[17px]">{f.name}</span>
                    <span className="hidden text-[13px] md:block" style={{ color: 'var(--muted)' }}>{f.note}</span>
                  </span>
                </button>
              );
            })}
            <a href="#quote" className="col-span-2 mt-1 inline-flex h-[52px] items-center justify-center rounded-full px-6 text-[15px] font-semibold md:col-span-1"
              style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: 'var(--accent-ink)', boxShadow: '0 12px 34px -12px var(--accent)' }}>
              Quote me for {finish.name} →
            </a>
          </div>
        </div>
        {ba && (
          <div className="mt-14 md:mt-20">
            <p className="eyebrow">Before and after</p>
            <h3 className="mt-3 font-display text-[clamp(26px,3.6vw,40px)] font-semibold leading-tight">Drag across <span className="serif font-normal" style={{ color: 'var(--accent2)' }}>to see the difference.</span></h3>
            <BeforeAfter ba={ba} />
          </div>
        )}
      </div>
    </section>
  );
}

const STEPS: [string, string][] = [
  ['Survey', 'We come and look at the garage, check the slab and talk you through finishes and samples. Then you get a clear written quote.'],
  ['Prep and grind', 'Old paint and loose concrete come off. The slab is diamond ground and cracks are filled, so the coating bonds to sound concrete.'],
  ['Coating', 'The epoxy system goes down in coats, with your flake, colour or metallic finish, then a clear top coat.'],
  ['Ready to use', 'Once it has cured we hand it back. You will know beforehand when you can walk on it and when the car goes back in.'],
];

export function Process() {
  return (
    <section id="process" aria-label="How it works" className="section relative" style={{ background: 'var(--bg)' }}>
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 className="h2 mt-4 max-w-[14ch]">Four steps <span className="serif" style={{ color: 'var(--accent2)' }}>to a new floor.</span></h2>
        <ol className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          {STEPS.map(([t, p], i) => (
            <motion.li key={t} {...rise} transition={{ duration: 0.8, delay: i * 0.1, ease }}
              className="relative overflow-hidden rounded-[var(--radius)] border p-6"
              style={{ borderColor: 'var(--line)', background: 'linear-gradient(180deg, var(--surface), var(--bg2))' }}>
              <span className="font-display text-[44px] font-semibold leading-none md:text-[56px]" style={{ backgroundImage: 'linear-gradient(160deg, var(--metal2), var(--metal1) 55%, var(--metal0))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>0{i + 1}</span>
              <h3 className="mt-4 font-display text-[22px] font-semibold md:text-[24px]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{p}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Areas() {
  const { site } = useSite();
  return (
    <section id="areas" aria-label="Areas covered" className="section relative overflow-hidden" style={{ background: 'var(--bg2)' }}>
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent2) 18%, transparent), transparent)' }} />
      <div className="wrap relative grid gap-8 md:grid-cols-[.8fr_1.2fr] md:gap-14">
        <div>
          <p className="eyebrow">Areas covered</p>
          <h2 className="h2 mt-4 max-w-[12ch]">Garages <span className="serif" style={{ color: 'var(--accent2)' }}>across Essex.</span></h2>
          <p className="lede mt-5">Somewhere else in Essex? Send a message and ask.</p>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {site.areas.map((a, i) => (
            <motion.li key={a} initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03, duration: 0.4 }}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />{a}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const SIZES = ['Single garage', 'Double garage', 'Larger than a double'];
const FLOORS = ['Bare concrete', 'Painted', 'Tiled', 'Not sure'];

export function QuoteForm({ finish, setFinish }: { finish: Finish; setFinish: (f: Finish) => void }) {
  const { site, trade } = useSite();
  const [size, setSize] = useState('');
  const [floor, setFloor] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!size || !floor) { setErr(!size ? 'Pick your garage size.' : 'Pick your current floor.'); return; }
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const postcode = String(fd.get('postcode') || '').trim().toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d?[A-Z]{0,2}$/i.test(postcode)) { setErr('Please check the postcode.'); return; }
    if (phone.replace(/\D/g, '').length < 10) { setErr('Please check the phone number.'); return; }
    setErr(''); setBusy(true);
    const msg = `Hi, I'd like a free quote for a garage floor.\nGarage: ${size}\nCurrent floor: ${floor}\nFinish: ${finish.name}\nPostcode: ${postcode}\nName: ${name}\nPhone: ${phone}`;
    (window as any).dataLayer?.push({ event: 'quote_lead', size, floor, finish: finish.name });
    if (site.formEndpoint) { try { await fetch(site.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, postcode, size, floor, finish: finish.name }) }); } catch { /* WhatsApp hand-off below still delivers it */ } }
    setBusy(false); setSent(msg);
  }

  const inp = 'w-full rounded-xl border bg-black/25 px-4 py-3.5 text-[16px] outline-none transition-colors focus:border-[var(--accent)]';
  const chip = (on: boolean) => ({ borderColor: on ? 'var(--accent)' : 'var(--line)', background: on ? 'var(--accent)' : 'rgba(255,255,255,.03)', color: on ? 'var(--accent-ink)' : 'var(--ink)' });
  const wa = sent ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(sent)}` : '';

  return (
    <section id="quote" aria-label="Free quote" className="section relative scroll-mt-20 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 20%, transparent), transparent)' }} />
      <div className="wrap relative grid gap-8 md:grid-cols-[.85fr_1.15fr] md:gap-14">
        <div>
          <p className="eyebrow">Free quote</p>
          <h2 className="h2 mt-4 max-w-[12ch]">Tell us about <span className="serif" style={{ color: 'var(--accent2)' }}>your garage.</span></h2>
          <p className="lede mt-5">Six quick answers. We will come back to you to arrange a look at the floor and a written quote.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="glass inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium">Call {site.phone}</a>
            <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi, I'd like a quote for my garage floor.")}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}>WhatsApp</a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[calc(var(--radius)+4px)] border p-5 md:p-8" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, var(--line))', background: 'linear-gradient(165deg, color-mix(in srgb, var(--surface) 90%, var(--accent) 10%), var(--bg2))', boxShadow: '0 40px 80px -40px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06)' }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form key="f" exit={{ opacity: 0, y: -10 }} onSubmit={submit} noValidate className="grid gap-5">
                <fieldset>
                  <legend className="mb-2 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>1 · Garage size</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((s) => <button type="button" key={s} aria-pressed={size === s} onClick={() => setSize(s)} className="min-h-12 rounded-xl border px-2 py-2.5 text-[14px] font-medium leading-tight transition-colors" style={chip(size === s)}>{s.replace(' than a double', '')}</button>)}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>2 · Current floor</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {FLOORS.map((s) => <button type="button" key={s} aria-pressed={floor === s} onClick={() => setFloor(s)} className="min-h-12 rounded-xl border px-2 py-2.5 text-[14px] font-medium transition-colors" style={chip(floor === s)}>{s}</button>)}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>3 · Finish · {finish.name}</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {trade.finishes.map((f) => (
                      <button type="button" key={f.key} onClick={() => setFinish(f)} aria-label={f.name} aria-pressed={finish.key === f.key} title={f.name}
                        className="h-12 w-12 rounded-full bg-cover bg-center transition-transform hover:scale-105"
                        style={{ backgroundImage: `url(${f.img})`, outline: finish.key === f.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }} />
                    ))}
                  </div>
                </fieldset>
                <div className="grid gap-2.5">
                  <label className="sr-only" htmlFor="q-postcode">Postcode</label>
                  <input id="q-postcode" required name="postcode" placeholder="4 · Postcode" autoComplete="postal-code" className={inp} style={{ borderColor: 'var(--line)' }} />
                  <label className="sr-only" htmlFor="q-name">Your name</label>
                  <input id="q-name" required name="name" placeholder="5 · Your name" autoComplete="name" className={inp} style={{ borderColor: 'var(--line)' }} />
                  <label className="sr-only" htmlFor="q-phone">Phone</label>
                  <input id="q-phone" required name="phone" placeholder="6 · Phone" type="tel" autoComplete="tel" className={inp} style={{ borderColor: 'var(--line)' }} />
                </div>
                {err && <p role="alert" className="text-[14px] font-medium" style={{ color: '#FF9C7A' }}>{err}</p>}
                <button disabled={busy} className="h-14 rounded-full text-[16px] font-semibold transition-transform active:scale-[.98]" style={{ background: 'linear-gradient(135deg, var(--accent2), var(--accent))', color: 'var(--accent-ink)', boxShadow: '0 14px 36px -14px var(--accent)' }}>
                  {busy ? 'Sending…' : 'Get my free quote →'}
                </button>
              </motion.form>
            ) : (
              <motion.div key="d" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="py-4" role="status">
                <p className="eyebrow">Nearly done</p>
                <h3 className="mt-3 font-display text-[30px] font-semibold leading-tight md:text-[38px]">Thanks. Tap below to send it to Resinize.</h3>
                <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>Your answers are ready in a WhatsApp message, so they land straight with the team.</p>
                <pre className="mt-5 whitespace-pre-wrap rounded-xl border p-4 text-[13px] leading-relaxed" style={{ borderColor: 'var(--line)', background: 'rgba(0,0,0,.25)', fontFamily: 'inherit', color: 'color-mix(in srgb, var(--ink) 85%, transparent)' }}>{sent}</pre>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center rounded-full px-6 text-[16px] font-semibold" style={{ background: '#25D366', color: '#062b14' }}>Send on WhatsApp</a>
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="glass inline-flex h-14 items-center rounded-full px-6 text-[15px] font-medium">Or call {site.phone}</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
