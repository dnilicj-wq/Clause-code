import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { useSite } from '@/src/lib/ctx';
import { MessageDock, type Character } from '@/components/library/message-dock/MessageDock';

// Lenis smooth scroll (desktop only; phones keep native momentum)
export function useLenis() {
  useEffect(() => {
    if (matchMedia('(pointer:coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    let raf = 0;
    const f = (t: number) => { l.raf(t); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    (window as any).__lenis = l;
    return () => { cancelAnimationFrame(raf); l.destroy(); };
  }, []);
}

export function CursorGlow() {
  useEffect(() => {
    if (matchMedia('(pointer:coarse)').matches) return;
    const el = document.getElementById('cursor-glow');
    if (!el) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const mv = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    addEventListener('pointermove', mv, { passive: true });
    const f = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`; raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(raf); };
  }, []);
  return <div id="cursor-glow" aria-hidden className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-[600px] w-[600px] rounded-full md:block"
    style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 9%, transparent), transparent)', mixBlendMode: 'screen' }} />;
}

export function Nav() {
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const links: [string, string][] = [['Finishes', '#gallery'], ['How it works', '#layers'], ['Prices', '#price'], ['Reviews', '#reviews']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3" data-nopour>
      <nav className={`flex w-full max-w-[1240px] items-center justify-between rounded-full py-2 pl-5 pr-2 transition-all duration-500 ${scrolled ? 'glass' : 'border border-transparent'}`}>
        <a href="#top" className="flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-tight">
          <Mark /> {site.company}
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => <a key={h} href={h} className="rounded-full px-3.5 py-2 text-[14px] transition-colors hover:bg-white/10" style={{ color: 'color-mix(in srgb, var(--ink) 80%, transparent)' }}>{l}</a>)}
        </div>
        <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="rounded-full px-4 py-2.5 text-[14px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
          <span className="hidden sm:inline">Call </span>{site.phone}
        </a>
      </nav>
    </header>
  );
}

export function Mark({ size = 26 }: { size?: number }) {
  // generic monogram mark: a pour drop in a ring (replaced by the prospect's logo in /new-lead)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs><linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--metal2)" /><stop offset=".55" stopColor="var(--metal1)" /><stop offset="1" stopColor="var(--metal0)" /></linearGradient></defs>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#mk)" strokeWidth="1.6" />
      <path d="M16 7c3.6 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.4-6.4 6-11z" fill="url(#mk)" />
    </svg>
  );
}

// Mobile action bar (Message Dock): appears after the hero. Call / WhatsApp / Quote.
export function Dock() {
  const { site } = useSite();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const q = document.getElementById('price')?.getBoundingClientRect();
      const inForm = q ? q.top < innerHeight * 0.5 && q.bottom > innerHeight * 0.5 : false;
      setShow(scrollY > innerHeight * 0.8 && !inForm);
    };
    f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f);
  }, []);
  const chars: Character[] = [
    { emoji: '📞', name: 'Call', online: true, backgroundColor: 'bg-emerald-300', gradientColors: '#6ee7b7, #d1fae5' },
    { emoji: '💬', name: 'WhatsApp', online: true, backgroundColor: 'bg-green-300', gradientColors: '#86efac, #dcfce7' },
    { emoji: '£', name: 'Quote', online: true, backgroundColor: 'bg-amber-200', gradientColors: '#fde68a, #fffbeb' },
  ];
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(10px,env(safe-area-inset-bottom))] md:hidden" data-nopour>
          <MessageDock
            characters={chars}
            showSparkleButton={false}
            showMenuButton={false}
            theme="dark"
            expandedWidth={340}
            placeholder={(n) => (n === 'WhatsApp' ? `Message ${site.shortName} on WhatsApp…` : n === 'Quote' ? 'Size of your floor? (e.g. double garage)' : 'Type your number, we call back…')}
            onCharacterSelect={(c) => {
              if (c.name === 'Call') location.href = `tel:${site.phone.replace(/\s/g, '')}`;
            }}
            onMessageSend={(msg, c) => {
              if (c.name === 'WhatsApp') window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
              else if (c.name === 'Quote') { document.getElementById('price')?.scrollIntoView({ behavior: 'smooth' }); }
              else location.href = `tel:${site.phone.replace(/\s/g, '')}`;
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
