import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { Check, CheckCheck, Phone, Video } from 'lucide-react';

// "How fast we reply" chat. Custom, after the WhatsApp-style animated chat pattern.
// Plays when in view, then loops so the section keeps moving. The customer is always "You".
export type ChatMsg = { from: 'you' | 'them'; text: string; img?: string; imgLabel?: string };

export function ReplyChat({ name, status, msgs, avatar, loop = true }: {
  name: string; status: string; msgs: ChatMsg[]; avatar: string; loop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-15%' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? msgs.length : 0);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || !inView) return;
    let t: ReturnType<typeof setTimeout>;
    const step = (i: number) => {
      if (i >= msgs.length) {
        if (loop) t = setTimeout(() => { setShown(0); step(0); }, 4200);
        return;
      }
      const m = msgs[i];
      const wait = i === 0 ? 500 : m.from === 'them' ? 700 : 1100;
      t = setTimeout(() => {
        if (m.from === 'them') {
          setTyping(true);
          t = setTimeout(() => { setTyping(false); setShown(i + 1); step(i + 1); }, 900 + Math.min(1400, m.text.length * 18));
        } else { setShown(i + 1); step(i + 1); }
      }, wait);
    };
    step(shown >= msgs.length ? msgs.length : shown);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [shown, typing, reduce]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-[34px] border p-2 shadow-2xl"
      style={{ borderColor: 'var(--line)', background: 'linear-gradient(160deg, color-mix(in oklab, var(--surface) 80%, white 6%), var(--bg2))' }}>
      <div className="overflow-hidden rounded-[27px]" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{avatar}</span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-semibold">{name}</p>
            <p className="text-[11.5px] leading-snug" style={{ color: typing ? 'var(--accent)' : 'var(--muted)' }}>{typing ? 'typing…' : status}</p>
          </div>
          <span className="ml-auto flex gap-3 opacity-60"><Video size={17} /><Phone size={16} /></span>
        </div>
        <div ref={scroller} className="flex h-[330px] flex-col gap-2 overflow-hidden px-3 py-4 md:h-[400px]"
          style={{ backgroundImage: 'radial-gradient(color-mix(in oklab, var(--ink) 7%, transparent) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
          <p className="mx-auto mb-1 rounded-full px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Today</p>
          <AnimatePresence initial={false}>
            {msgs.slice(0, shown).map((m, i) => <Bubble key={i} m={m} last={i === shown - 1} />)}
            {typing && (
              <motion.div key="typing" layout initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex w-fit gap-1 rounded-2xl rounded-bl-md px-3.5 py-3" style={{ background: 'var(--surface)' }}>
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }}
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 border-t px-3 py-2.5" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
          <span className="flex-1 rounded-full px-4 py-2 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>Message</span>
          <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z" /></svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ m, last }: { m: ChatMsg; last: boolean }) {
  const you = m.from === 'you';
  return (
    <motion.div layout initial={{ opacity: 0, y: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`flex max-w-[82%] flex-col ${you ? 'items-end self-end' : 'items-start self-start'}`} style={{ transformOrigin: you ? 'bottom right' : 'bottom left' }}>
      {you && <span className="mb-0.5 mr-1 text-[10.5px] font-semibold" style={{ color: 'var(--muted)' }}>You</span>}
      <div className={`overflow-hidden rounded-2xl text-[13.5px] leading-snug ${you ? 'rounded-br-md' : 'rounded-bl-md'}`}
        style={you ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : { background: 'var(--surface)', color: 'var(--ink)' }}>
        {m.img && (
          <div className="relative">
            <img src={m.img} alt={m.imgLabel || ''} className="h-28 w-56 object-cover" loading="lazy" />
            {m.imgLabel && <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9.5px] text-white">{m.imgLabel}</span>}
          </div>
        )}
        <p className="px-3.5 py-2.5">{m.text}
          {you && <span className="ml-1.5 inline-block translate-y-[2px] opacity-70">{last ? <CheckCheck size={13} /> : <Check size={13} />}</span>}
        </p>
      </div>
    </motion.div>
  );
}
