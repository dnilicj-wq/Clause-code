import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'motion/react';
import { useState } from 'react';

// Layer explode: the floor separates into its real layers, each a rendered texture (never grey boxes).
// CSS 3D transforms only (cheap on phones). Logic adapted from demos/gafflow/src/js/layers.js:
//   0-.12 assembled · .12-.3 separates · .3-.82 each layer lights up in turn · .82-1 locks back together.
export type Layer = { key: string; name: string; what: string; why: string; bg: string; edge?: string }; // bg: CSS background-image (texture url() or swatch gradient)

// Floor cross-section: a cut block of slab with each system layer on top. Assembled it reads as one finished floor;
// on scroll the layers lift apart in order, the active one rises and the rest dim. Caption names the active layer.
const THICK = [30, 5, 3, 7, 3]; // px, slab first (exaggerated slightly so thin coats still read)

export function LayerStack({ layers, progress, active }: { layers: Layer[]; progress: MotionValue<number>; active: number }) {
  const n = layers.length;
  const spread = useTransform(progress, [0, 0.1, 0.3, 0.82, 0.96], [0, 0, 1, 1, 0]);
  const rotZ = useTransform(progress, [0, 1], [-34, -24]);
  const rotX = useTransform(spread, [0, 1], [62, 57]);
  const phone = typeof matchMedia !== 'undefined' && matchMedia('(max-width: 699px)').matches;
  const gap = phone ? 19 : 32;
  const lift = useTransform(spread, [0, 1], [0, phone ? 34 : 24]); // drop the block as it opens so the top layer stays in frame
  const base: number[] = []; let acc = 0;
  layers.forEach((_, i) => { base.push(acc); acc += THICK[Math.min(i, THICK.length - 1)]; });
  const cur = active >= 0 && active < n ? layers[active] : null;
  return (
    <div className="relative mx-auto w-[min(74vw,460px)]">
      <motion.div className="relative mx-auto aspect-[5/4] w-full" style={{ perspective: 1600, y: lift }}>
        <motion.div className="absolute inset-[6%_4%]" style={{ transformStyle: 'preserve-3d', rotateX: rotX, rotateZ: rotZ }}>
          {/* contact shadow */}
          <div className="absolute inset-[-6%] rounded-[30px]" style={{ transform: 'translateZ(-2px)', background: 'radial-gradient(closest-side, rgba(0,0,0,.75), transparent)', filter: 'blur(14px)' }} />
          {layers.map((l, i) => (
            <Slab key={l.key} i={i} n={n} gap={gap} l={l} z0={base[i]} thick={THICK[Math.min(i, THICK.length - 1)]} spread={spread} on={active === i} dim={active >= 0 && active < n && active !== i} above={active >= 0 && active < n && i > active} />
          ))}
        </motion.div>
      </motion.div>
      <div className="pointer-events-none -mt-2 flex h-6 items-center justify-center gap-2 text-[12px] uppercase tracking-[.16em]" style={{ color: 'var(--muted)' }}>
        {cur ? (<><span style={{ color: 'var(--accent)' }}>0{active + 1} / 0{n}</span><span style={{ color: 'var(--ink)' }}>{cur.name}</span></>) : <span>Finished floor, cut through</span>}
      </div>
    </div>
  );
}

function Slab({ i, l, z0, thick, gap, spread, on, dim, above }: { i: number; n: number; gap: number; l: Layer; z0: number; thick: number; spread: MotionValue<number>; on: boolean; dim: boolean; above: boolean }) {
  const z = useTransform(spread, (s) => z0 + thick + s * i * gap + (on ? gap * 0.5 * s : 0));
  const edge = l.edge || '#777';
  const isSlab = i === 0;
  const side = (shade: number) => isSlab
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade + .15})), ${l.bg}`, backgroundSize: 'cover, 220% 220%' }
    : { background: `linear-gradient(180deg, color-mix(in srgb, ${edge} ${100 - shade * 100}%, white), color-mix(in srgb, ${edge} ${100 - shade * 120}%, black))` };
  return (
    <motion.div className="absolute inset-0 transition-opacity duration-500" style={{ transformStyle: 'preserve-3d', z, opacity: above ? 0.22 : 1 }}>
      <div className="absolute inset-0 overflow-hidden rounded-[3px] transition-[filter] duration-500"
        style={{ backgroundImage: l.bg, backgroundSize: 'cover', filter: dim ? 'brightness(.45) saturate(.7)' : 'none' }}>
        {/* gloss sheen + bevel highlight on coated layers */}
        {!isSlab && <div className="absolute inset-0" style={{ background: 'linear-gradient(118deg, transparent 28%, rgba(255,255,255,.16) 42%, transparent 56%)', mixBlendMode: 'screen' }} />}
        <div className="absolute inset-0" style={{ boxShadow: on ? 'inset 0 0 0 1.5px var(--accent2)' : 'inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.06)' }} />
      </div>
      {/* front and right cut faces */}
      <div className="absolute bottom-0 left-0 w-full origin-bottom transition-[filter] duration-500" style={{ height: thick, transform: 'rotateX(-90deg)', ...side(.35), filter: dim ? 'brightness(.5)' : 'none' }} />
      <div className="absolute right-0 top-0 h-full origin-right transition-[filter] duration-500" style={{ width: thick, transform: 'rotateY(90deg)', ...side(.55), filter: dim ? 'brightness(.5)' : 'none' }} />
    </motion.div>
  );
}

// Hook used by the section: scroll progress over a tall container + which layer is lit
export function useLayerScroll(n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    let a = -1;
    if (p >= 0.3 && p < 0.82) a = Math.min(n - 1, Math.floor(((p - 0.3) / 0.52) * n));
    else if (p >= 0.82) a = n;
    setActive(a);
  });
  return { ref, progress: scrollYProgress, active };
}
