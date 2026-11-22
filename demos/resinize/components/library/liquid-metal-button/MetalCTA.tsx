import { useEffect, useRef, useState } from 'react';
import { LiquidMetalButton } from './LiquidMetalButton';

// Wrapper used on pages: link behaviour + only mounts the (tiny) shader while on screen,
// so buttons further down the page don't hold WebGL contexts.
export function MetalCTA({ label, href, onClick, width = 190, height = 52 }: { label: string; href?: string; onClick?: () => void; width?: number; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '200px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const go = () => {
    onClick?.();
    if (href?.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    else if (href) location.href = href;
  };
  return (
    <div ref={ref} style={{ width, height }} className="relative">
      {on ? (
        <LiquidMetalButton width={width} height={height} onClick={go}>
          <span style={{ fontSize: 15, color: '#F4F4F5', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,.8)', whiteSpace: 'nowrap', letterSpacing: '-.005em' }}>{label} →</span>
        </LiquidMetalButton>
      ) : (
        <button onClick={go} style={{ width, height }} className="rounded-full border border-white/20 bg-gradient-to-b from-zinc-800 to-zinc-950 text-[15px] font-semibold text-zinc-100">{label} →</button>
      )}
    </div>
  );
}
