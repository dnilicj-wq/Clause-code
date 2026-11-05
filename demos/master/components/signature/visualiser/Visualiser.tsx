import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '@/src/lib/ctx';

// "See it in your garage": upload → pick finish → Gemini edit → "Send me this + my price".
// Contact details are asked AFTER the render. Labelled "AI visualisation".
export function Visualiser({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { site, trade } = useSite();
  const [finish, setFinish] = useState(trade.finishes[1].key);
  const [src, setSrc] = useState<string | null>(null);
  const [out, setOut] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'busy' | 'sent'>('idle');

  async function pick(file: File) {
    if (file.size > 25 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
    const s = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    setSrc(c.toDataURL('image/jpeg', 0.86)); setOut(null); setState('idle');
  }
  async function render() {
    if (!src) return;
    setState('working');
    try {
      const r = await fetch('/api/visualise', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: src.split(',')[1], mime: 'image/jpeg', finish }) });
      const j = await r.json();
      if (r.ok && j.image) { setOut(j.image); setState('done'); } else setState('busy');
    } catch { setState('busy'); }
  }
  const fin = trade.finishes.find((f) => f.key === finish)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-lenis-prevent>
          <motion.div role="dialog" aria-modal aria-label="Visualise your garage" onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative max-h-[92dvh] w-full max-w-[920px] overflow-y-auto rounded-t-[26px] border p-5 md:rounded-[26px] md:p-8" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
            <button onClick={onClose} className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/10 text-[18px]" aria-label="Close">×</button>
            <p className="eyebrow">AI visualisation</p>
            <h3 className="mt-2 font-display text-[30px] font-semibold leading-tight md:text-[38px]">See it in your garage</h3>

            <div className="mt-5 grid gap-5 md:grid-cols-[1.3fr_1fr]">
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}>
                {out ? <img src={out} alt={`Your space with ${fin.name} (AI visualisation)`} className="h-full w-full object-cover" />
                  : src ? <img src={src} alt="Your photo" className="h-full w-full object-cover" style={{ filter: state === 'working' ? 'blur(2px) brightness(.7)' : undefined }} />
                  : state === 'busy' ? null : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 p-6 text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-full text-[24px]" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>＋</span>
                      <span className="font-medium">Upload a photo of your floor</span>
                      <span className="text-[13px]" style={{ color: 'var(--muted)' }}>Garage, kitchen or workshop. Phone photos are fine.</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
                    </label>
                  )}
                {state === 'busy' && (
                  <div className="absolute inset-0">
                    <img src="/demo/unit-gloss-800-v1.webp" alt="Example gloss floor" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/70 p-3 text-[14px]">Visualiser busy, here's an example. Book a survey and we'll show you samples on your actual floor.</div>
                  </div>
                )}
                {state === 'working' && <div className="absolute inset-0 grid place-items-center"><span className="glass rounded-full px-4 py-2 text-[14px]">Pouring your floor… about 15 seconds</span></div>}
                {(out || state === 'busy') && <span className="ex-tag left-3 top-3">{out ? 'AI visualisation' : 'Example image'}</span>}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 text-[12px] font-medium uppercase tracking-[.12em]" style={{ color: 'var(--muted)' }}>Finish · {fin.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {trade.finishes.map((f) => (
                      <button key={f.key} onClick={() => setFinish(f.key)} aria-label={f.name} title={f.name} className="h-11 w-11 rounded-full bg-cover"
                        style={{ backgroundImage: `url(/demo/look-${f.key}-v2.webp)`, outline: finish === f.key ? '2px solid var(--accent)' : '1px solid var(--line)', outlineOffset: 2 }} />
                    ))}
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Your photo is processed by Google's Gemini AI to create the preview and isn't stored by us.
                </p>
                {src && state !== 'done' && state !== 'busy' && (
                  <button disabled={state === 'working'} onClick={render} className="rounded-full py-3.5 font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                    {state === 'working' ? 'Working…' : 'Show me my floor'}
                  </button>
                )}
                {state === 'done' && (
                  <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); setState('sent'); (window as any).dataLayer?.push({ event: 'visualiser_lead', finish }); }}>
                    <p className="font-medium">Send me this + my price</p>
                    <input required name="contact" placeholder="Email or mobile" className="rounded-xl border bg-black/20 px-4 py-3 text-[16px]" style={{ borderColor: 'var(--line)' }} />
                    <button className="rounded-full py-3.5 font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Send it</button>
                  </form>
                )}
                {state === 'sent' && <p className="font-medium">Sent. {site.owner.first} will be in touch {site.responseTime}.</p>}
                {src && <button onClick={() => { setSrc(null); setOut(null); setState('idle'); }} className="text-[13px] underline" style={{ color: 'var(--muted)' }}>Use a different photo</button>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
