import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { prefersReduced } from '../_shared/canvas';
import { Tag } from '../_shared/ui';

// UV sun slider (illustration): the same pale floor under a window, years of sunlight on the slider.
// A standard epoxy topcoat ambers where the sun falls; a UV-stable topcoat stays clear.
// Only show this when the trade pack says the business offers UV-stable topcoats (registry need: uvStable).
const FLOOR = '#E7E3DC';
const AMBER = '#D49A3A';

function Pane({ amber, label, sub, drift }: { amber: number; label: string; sub: string; drift: boolean }) {
  return (
    <div>
    <div className="relative overflow-hidden rounded-[calc(var(--radius)*.7)]" style={{ background: FLOOR, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
      <div className="relative aspect-[4/5] sm:aspect-[5/4]">
        {/* back wall with the window the sun comes through, so the pane reads as a room, not a swatch */}
        <div className="absolute inset-x-0 top-0 h-[24%]" style={{ background: 'linear-gradient(#CFC9C0, #DDD8D0)' }}>
          <div className="absolute left-[30%] top-[15%] grid h-[70%] w-[34%] grid-cols-2 grid-rows-2 gap-[3px] rounded-[2px] p-[3px]" style={{ background: '#8E877D' }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ background: 'linear-gradient(160deg, #FFFDF6, #F4EAD2)' }} />)}
          </div>
        </div>
        <div className="absolute inset-x-0 top-[24%] h-[3px]" style={{ background: 'rgba(0,0,0,.18)' }} />
        {/* floor: real pale resin finish (fine quartz), lightened, with a soft gloss */}
        <div className="absolute inset-x-0 bottom-0 top-[24%]" style={{ backgroundImage: 'url(/demo/look-quartz-sand-v2.webp)', backgroundSize: '160%', backgroundPosition: 'center', filter: 'saturate(.35) brightness(1.18) contrast(.85)' }} />
        <div className="absolute inset-x-0 bottom-0 top-[24%]" style={{ background: `linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 45%, rgba(0,0,0,.10))` }} />
        {/* ambering: strongest where the sun lands, a milder cast everywhere */}
        <div className="absolute inset-x-0 bottom-0 top-[24%] transition-opacity duration-300" style={{ background: AMBER, mixBlendMode: 'multiply', opacity: amber * 0.32 }} />
        {/* window light: four panes cast across the floor */}
        <motion.div className="absolute left-[14%] top-[34%] h-[52%] w-[62%]"
          style={{ skewX: -28, scaleY: 0.86, originY: 0 }}
          animate={drift ? { x: ['-5%', '7%', '-5%'] } : undefined} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[5%] blur-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 30% 20%, rgba(255,252,240,.9), rgba(255,248,230,.5))' }} />
                <div className="absolute inset-0 transition-opacity duration-300" style={{ background: AMBER, mixBlendMode: 'multiply', opacity: amber * 0.62 }} />
              </div>
            ))}
          </div>
        </motion.div>
        <div className="absolute inset-x-0 top-[24%] h-6" style={{ background: 'linear-gradient(rgba(0,0,0,.12), transparent)' }} />
      </div>
    </div>
    <div className="px-1 pt-2">
      <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>{label}</p>
      <p className="text-[12px] leading-tight" style={{ color: 'var(--muted)' }}>{sub}</p>
    </div>
    </div>
  );
}

export function UvSlider({ className = '' }: { className?: string }) {
  const [years, setYears] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduced = useMemo(prefersReduced, []);
  const wrap = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  // auto: drift the years 0 → 5 → 0 while on screen and untouched
  useEffect(() => {
    if (!auto || reduced) { if (reduced && auto) setYears(3); return; }
    let raf = 0, t0 = performance.now(), on = true;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; seen.current ||= on; });
    wrap.current && io.observe(wrap.current);
    const tick = (now: number) => {
      if (on) { const p = ((now - t0) / 1000 / 12) % 1; setYears(Math.round((0.5 - 0.5 * Math.cos(p * Math.PI * 2)) * 50) / 10); }
      else t0 = now - 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [auto, reduced]);

  // how far a standard topcoat has ambered: rises fast at first, then levels (shape only, no data)
  const amber = 1 - Math.exp(-years * 0.7);
  const yLabel = years < 0.15 ? 'Day one' : `${years.toFixed(1)} year${years >= 0.95 && years < 1.05 ? '' : 's'} of sun`;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <div className="relative rounded-[var(--radius)] border p-3" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
        <div className="mb-3 flex items-center gap-2"><Tag>Illustration</Tag><Tag>UV and sunlight</Tag></div>
        <div className="grid grid-cols-2 gap-3">
          <Pane amber={amber} label="Standard topcoat" sub="Ambers in direct sun" drift={!reduced} />
          <Pane amber={0} label="UV-stable topcoat" sub="Stays clear" drift={!reduced} />
        </div>
        <div className="mt-4 px-1">
          <div className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>{yLabel}</span>
            <span style={{ color: 'var(--muted)' }}>{auto && !reduced ? 'Playing · drag to take over' : 'Drag the slider'}</span>
          </div>
          <input type="range" min={0} max={5} step={0.1} value={years} aria-label="Years of sunlight"
            onChange={(e) => { setAuto(false); setYears(+e.target.value); }} onPointerDown={() => setAuto(false)}
            className="w-full" style={{ accentColor: 'var(--accent)' }} />
          <div className="mt-1 flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
            {[0, 1, 2, 3, 4, 5].map((y) => <span key={y}>{y === 0 ? 'Now' : `${y}y`}</span>)}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>Standard epoxy can yellow in strong sunlight, which shows most on pale colours. A UV-stable topcoat is the usual answer for sunny garages and conservatories.</p>
    </div>
  );
}
export default UvSlider;
