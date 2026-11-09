import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { services, sizes } from '@/config/driveway';
import { photoSrc } from '@/config/content';
import { useQuote } from './quote';
import { Head } from './ui';

// "Book your free survey": service -> rough size -> postcode -> optional photos -> name/phone -> send.
// No prices anywhere. Concrete has no photo: he has no finished concrete driveway photo, so it gets a plain panel.
// No prices anywhere. Demo: sending opens an email to his inbox with everything typed out (formEndpoint can replace it).
const PREVIEW: Record<string, string> = {
  'resin-drive': 'resin-dusk', 'resin-patio': 'resin-circle-patio', block: 'block-herringbone', concrete: '',
  patio: 'patio-porcelain', kerb: 'kerb-1', other: 'resin-circles',
};
const STEPS = ['What', 'Size', 'Where', 'Photos', 'You'] as const;

export function Survey() {
  const { site } = useSite();
  const q = useQuote();
  const [step, setStep] = useState(0);
  const [size, setSize] = useState('');
  const [postcode, setPostcode] = useState('');
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [who, setWho] = useState({ name: '', phone: '' });
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const svc = services.find((s) => s.key === q.service)!;
  const pcOk = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*(\d[A-Za-z]{2})?$/.test(postcode.trim());
  const youOk = who.name.trim().length > 1 && /\d{9,}/.test(who.phone.replace(/\D/g, ''));
  const can = [true, !!size, pcOk, true, youOk][step];

  const mail = useMemo(() => {
    const lines = [
      `Hi Butler's, I'd like a free survey please.`, '',
      `Job: ${svc.label}`,
      ...(q.service.startsWith('resin') ? [`Resin blend I like: ${q.blend.name}`] : []),
      `Rough size: ${sizes.find((s) => s.key === size)?.label ?? '-'}`,
      `Postcode: ${postcode.trim().toUpperCase()}`,
      `Name: ${who.name.trim()}`,
      `Phone: ${who.phone.trim()}`,
      files.length ? `Photos: I'll attach ${files.length} to this email (${files.map((f) => f.name).join(', ')})` : 'Photos: none yet',
    ];
    return `mailto:${site.email}?subject=${encodeURIComponent(`Free survey request: ${svc.label}, ${postcode.trim().toUpperCase()}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }, [svc, size, postcode, who, files, site.email, q.service, q.blend.name]);

  const next = () => { if (!can) return; if (step < 4) setStep(step + 1); else { setSent(true); location.href = mail; } }; // Enter key on the last field

  return (
    <section id="survey" aria-labelledby="svH" className="section" style={{ background: 'radial-gradient(90% 60% at 85% 0%, rgba(240,178,78,.10), transparent 60%), radial-gradient(70% 50% at 0% 100%, rgba(169,195,227,.08), transparent 60%), var(--bg)' }}>
      <div className="wrap">
        <Head id="svH" title="Five quick taps," accent="then we come and look."
          lede="No prices to guess at. Tell us what you want done and where, add a photo if you have one, and we’ll get back to you to book a visit." />

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-[1.05fr_1fr] md:gap-6">
          {/* his job for the chosen service */}
          <div className="relative hidden overflow-hidden rounded-[var(--radius)] border md:block" style={{ borderColor: 'var(--line)', minHeight: 520 }}>
            <AnimatePresence mode="popLayout">
              {PREVIEW[q.service] !== '' ? (
                <motion.img key={q.service} src={photoSrc(PREVIEW[q.service] ?? 'resin-dusk', 1280)} alt="" loading="lazy"
                  initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <motion.div key={q.service} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5 }}
                  className="absolute inset-0 flex items-start p-8"
                  style={{ background: 'radial-gradient(80% 60% at 20% 15%, rgba(169,195,227,.16), transparent 60%), radial-gradient(70% 60% at 90% 80%, rgba(240,178,78,.14), transparent 60%), linear-gradient(160deg, #1A222D, #10161E)' }}>
                  <div className="max-w-[24ch]">
                    <p className="font-display text-[44px] font-bold leading-[1.04] tracking-[-.03em]">Concrete <span style={{ color: 'var(--accent)', fontWeight: 500 }}>driveways.</span></p>
                    <p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>We’ll talk you through the finish options when we come out to survey.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,15,21,0) 45%, rgba(11,15,21,.92))' }} />
            {PREVIEW[q.service] !== '' && <span className="ex-tag left-4 top-4">His job</span>}
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="eyebrow" style={{ color: 'var(--accent2)' }}>{svc.label}</p>
              <ul className="mt-3 space-y-1.5 text-[14px]" style={{ color: 'color-mix(in srgb, var(--ink) 82%, transparent)' }}>
                <li>{`· ${svc.label}${size ? `, ${sizes.find((s) => s.key === size)!.label.toLowerCase()}` : ''}`}</li>
                {postcode && <li>{`· ${postcode.toUpperCase()}`}</li>}
                {files.length > 0 && <li>{`· ${files.length} photo${files.length > 1 ? 's' : ''} ready`}</li>}
              </ul>
            </div>
          </div>

          {/* the form */}
          <div className="relative overflow-hidden rounded-[var(--radius)] border p-5 md:p-8" style={{ borderColor: 'rgba(240,178,78,.28)', background: 'linear-gradient(170deg, rgba(240,178,78,.07), transparent 40%), var(--surface)', boxShadow: '0 40px 80px -40px rgba(0,0,0,.7)' }}>
            {/* progress */}
            <div className="flex items-center gap-1.5" aria-hidden>
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className="h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: i < step ? '100%' : i === step ? '50%' : '0%', background: 'linear-gradient(90deg, var(--accent), #FF8A5B)' }} />
                  </div>
                  <div className="mt-1.5 text-[10.5px] uppercase tracking-[.12em]" style={{ color: i <= step ? 'var(--ink)' : 'var(--muted)' }}>{s}</div>
                </div>
              ))}
            </div>

            {sent ? (
              <div className="py-10 text-center" role="status">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full text-[24px]" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>✓</div>
                <h3 className="mt-5 font-display text-[26px] font-semibold">Your email is ready to send</h3>
                <p className="mx-auto mt-2 max-w-[36ch] text-[15px]" style={{ color: 'var(--muted)' }}>{files.length ? 'Attach your photos to it, press send, and it goes straight to ' : 'Press send and it goes straight to '}{site.email}.</p>
                <a href={mail} className="mt-5 inline-flex h-11 items-center rounded-full border px-5 text-[14px] font-medium" style={{ borderColor: 'var(--line)' }}>Open the email again</a>
              </div>
            ) : (
              <div className="mt-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .28 }}>
                    {step === 0 && (
                      <Field n={1} t="What do you want done?">
                        <div className="grid grid-cols-2 gap-2">
                          {services.map((s, i) => (
                            <Chip key={s.key} on={q.service === s.key} onClick={() => q.setService(s.key)} wide={i === services.length - 1}>{s.label}</Chip>
                          ))}
                        </div>
                      </Field>
                    )}
                    {step === 1 && (
                      <Field n={2} t="Roughly how big?" hint="A guess is fine. We measure properly on the survey.">
                        <div className="grid grid-cols-2 gap-2">
                          {sizes.map((s, i) => <Chip key={s.key} on={size === s.key} onClick={() => setSize(s.key)} wide={i === sizes.length - 1}>{s.label}</Chip>)}
                        </div>
                      </Field>
                    )}
                    {step === 2 && (
                      <Field n={3} t="What’s the postcode?" hint={`We’re based in ${site.town} and work across ${site.areaLine}.`}>
                        <input autoFocus value={postcode} onChange={(e) => setPostcode(e.target.value.slice(0, 8))} onKeyDown={(e) => e.key === 'Enter' && next()}
                          placeholder="e.g. PE16 6AA" autoComplete="postal-code" aria-label="Postcode"
                          className="h-14 w-full rounded-2xl border bg-transparent px-4 text-[18px] uppercase tracking-[.06em] outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)' }} />
                      </Field>
                    )}
                    {step === 3 && (
                      <Field n={4} t="Got a photo of it now?" hint="Optional, but it helps us plan the visit. You’ll attach them to the email at the end.">
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" aria-label="Add photos"
                          onChange={(e) => { const fs = [...(e.target.files || [])].slice(0, 6); setFiles(fs.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))); }} />
                        <button onClick={() => fileRef.current?.click()} className="flex h-[120px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed text-[15px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(240,178,78,.45)' }}>
                          <span className="text-[24px]" aria-hidden>＋</span>{files.length ? 'Change photos' : 'Add photos of the area'}
                        </button>
                        {files.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto">
                            {files.map((f) => <img key={f.url} src={f.url} alt={f.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />)}
                          </div>
                        )}
                      </Field>
                    )}
                    {step === 4 && (
                      <Field n={5} t="Who should we call?">
                        <div className="grid gap-2">
                          <input autoFocus value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value.slice(0, 60) })} placeholder="Your name" autoComplete="name" aria-label="Your name"
                            className="h-13 h-[52px] w-full rounded-2xl border bg-transparent px-4 text-[16px] outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)' }} />
                          <input value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value.slice(0, 20) })} onKeyDown={(e) => e.key === 'Enter' && next()} placeholder="Phone number" type="tel" autoComplete="tel" aria-label="Phone number"
                            className="h-[52px] w-full rounded-2xl border bg-transparent px-4 text-[16px] outline-none focus:border-[var(--accent)]" style={{ borderColor: 'var(--line)' }} />
                        </div>
                      </Field>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {!sent && (
              <div className="mt-4 flex items-center gap-2">
                {step > 0 && <button onClick={() => setStep(step - 1)} className="h-12 rounded-full border px-5 text-[15px] font-medium" style={{ borderColor: 'var(--line)' }}>Back</button>}
                {step === 4 && can ? (
                  <a href={mail} onClick={() => setSent(true)} className="btn-gold flex h-12 flex-1 items-center justify-center rounded-full text-[15px] font-semibold">Send my survey request →</a>
                ) : (
                  <button onClick={next} disabled={!can} className="btn-gold flex h-12 flex-1 items-center justify-center rounded-full text-[15px] font-semibold disabled:opacity-40">
                    {step === 3 ? (files.length ? 'Next →' : 'Skip →') : step === 4 ? 'Send my survey request →' : 'Next →'}
                  </button>
                )}
              </div>
            )}
            <p className="mt-3 text-[12px]" style={{ color: 'var(--muted)' }}>{`Goes to ${site.email}. Nothing is stored on this website. Rather talk? `}<a href={`tel:${site.phone.replace(/\s/g, '')}`} className="underline">{site.phone}</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ n, t, hint, children }: { n: number; t: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>{`0${n}`}</span>
        <h3 className="font-display text-[24px] font-semibold leading-tight md:text-[28px]">{t}</h3>
      </div>
      {hint && <p className="mb-4 mt-1.5 text-[14px]" style={{ color: 'var(--muted)' }}>{hint}</p>}
      <div className={hint ? '' : 'mt-4'}>{children}</div>
    </div>
  );
}
function Chip({ on, onClick, children, wide }: { on: boolean; onClick: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`flex h-[52px] items-center justify-center rounded-2xl border px-3 text-center text-[14.5px] font-medium transition-colors ${wide ? 'col-span-2' : ''}`}
      style={on ? { background: 'rgba(240,178,78,.14)', borderColor: 'var(--accent)', color: 'var(--ink)' } : { borderColor: 'var(--line)', background: 'rgba(255,255,255,.02)' }}>
      {children}
    </button>
  );
}
