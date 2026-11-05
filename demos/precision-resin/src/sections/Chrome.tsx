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
  const links: [string, string][] = [['Our work', '#gallery'], ['Grind first', '#layers'], ['Prices', '#price'], ['FAQ', '#faq']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3" data-nopour>
      {/* scrolled: near-solid bar, so nothing scrolling underneath shows through the logo */}
      <nav className="flex w-full max-w-[1240px] items-center justify-between rounded-full border py-2 pl-5 pr-2 transition-[background-color,border-color,box-shadow] duration-500"
        style={scrolled ? { background: 'color-mix(in srgb, var(--bg) 94%, transparent)', borderColor: 'var(--line)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', boxShadow: '0 12px 32px -14px rgba(0,0,0,.65)' } : { borderColor: 'transparent' }}>
        <a href="#top" className="flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-tight">
          <Mark /> <span className="max-sm:hidden">{site.company}</span><span className="sm:hidden">{site.shortName}</span>
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
  // Precision Resin Floors mark: the two arcs from their logo (cyan over red)
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M5 21 C 10 11, 22 9, 29 20" fill="none" stroke="var(--accent2)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M3 25 C 8 17, 17 15, 24 19" fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

// Mobile action bar (Message Dock): appears after the hero. Call / WhatsApp / Quote.
export function Dock() {
  const { site, preset } = useSite();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => {
      const mid = innerHeight * 0.5;
      const q = document.getElementById('price')?.getBoundingClientRect();
      const inForm = q ? q.top < mid && q.bottom > mid : false;
      // Hide once the footer (which has its own call/price buttons) comes into view.
      const foot = document.querySelector('footer')?.getBoundingClientRect();
      const atFoot = foot ? foot.top < innerHeight - 40 : false;
      setShow(scrollY > innerHeight * 0.8 && !inForm && !atFoot);
    };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);
  // The original renders characters.slice(1, -1): first/last slots belong to the sparkle/menu buttons (hidden here).
  const grad = `${preset.surface}, ${preset.bg2}`;
  const slot: Character = { emoji: '', name: '_', online: false };
  const chars: Character[] = [
    slot,
    { emoji: '📞', name: 'Call', online: true, backgroundColor: 'bg-[var(--accent2)]', gradientColors: grad },
    { emoji: '💬', name: 'WhatsApp', online: true, backgroundColor: 'bg-[#4ADE80]', gradientColors: grad },
    { emoji: '£', name: 'Quote', online: false, backgroundColor: 'bg-[var(--accent)] text-[var(--accent-ink)] font-display font-semibold', gradientColors: grad },
    slot,
  ];
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(12px,env(safe-area-inset-bottom))] md:hidden" data-nopour>
          <MessageDock
            className="pointer-events-auto !static !translate-x-0 [&>div]:!px-2.5 [&>div]:!py-1.5 [&>div]:backdrop-blur-xl [&>div]:!shadow-[0_10px_30px_rgba(0,0,0,.28)]"
            characters={chars}
            showSparkleButton={false}
            showMenuButton={false}
            theme={preset.dark ? 'dark' : 'light'}
            surface={preset.dark ? preset.surface : '#FFFFFF'}
            border={preset.line}
            expandedWidth={Math.min(340, (typeof innerWidth !== 'undefined' ? innerWidth : 390) - 32)}
            placeholder={(n) => (n === 'WhatsApp' ? `Message ${site.shortName} on WhatsApp…` : n === 'Quote' ? 'Size of your unit? (e.g. 300 m²)' : 'Type your number, we call back…')}
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
