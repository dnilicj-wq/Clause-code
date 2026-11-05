import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'motion/react';
import { useState } from 'react';

// Layer explode: the floor separates into its real layers, each a rendered texture (never grey boxes).
// CSS 3D transforms only (cheap on phones). Logic adapted from demos/gafflow/src/js/layers.js:
//   0-.12 assembled · .12-.3 separates · .3-.82 each layer lights up in turn · .82-1 locks back together.
export type Layer = { key: string; name: string; what: string; why: string; tex: string };

export function LayerStack({ layers, progress, active }: { layers: Layer[]; progress: MotionValue<number>; active: number }) {
  const n = layers.length;
  const spread = useTransform(progress, [0, 0.12, 0.3, 0.82, 0.96], [0, 0, 1, 1, 0]);
  const rotZ = useTransform(progress, [0, 1], [-40, -28]);
  const rotX = useTransform(spread, [0, 1], [58, 52]);
  return (
    <div className="relative mx-auto aspect-square w-[min(72vw,440px)]" style={{ perspective: 1400 }}>
      <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', rotateX: rotX, rotateZ: rotZ }}>
        {layers.map((l, i) => (
          <Slab key={l.key} i={i} n={n} l={l} spread={spread} on={active === i || active === n} />
        ))}
      </motion.div>
    </div>
  );
}

function Slab({ i, n, l, spread, on }: { i: number; n: number; l: Layer; spread: MotionValue<number>; on: boolean }) {
  const z = useTransform(spread, (s) => i * 7 + s * i * 46 - s * (n - 1) * 23);
  const thick = i === 0 ? 26 : i === n - 1 ? 6 : 9;
  return (
    <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', z }}>
      {/* top face */}
      <div className="absolute inset-0 overflow-hidden rounded-[6px] transition-[filter,box-shadow] duration-500"
        style={{
          backgroundImage: `url(${l.tex})`, backgroundSize: 'cover',
          filter: on ? 'brightness(1.12) saturate(1.1)' : 'brightness(.62) saturate(.8)',
          boxShadow: on ? '0 0 0 1px var(--accent), 0 0 40px -6px var(--accent)' : '0 0 0 1px rgba(255,255,255,.08)',
          opacity: i === n - 1 ? 0.88 : 1,
        }} />
      {/* edges give each layer real thickness */}
      <div className="absolute bottom-0 left-0 w-full origin-bottom" style={{ height: thick, transform: 'rotateX(-90deg)', backgroundImage: `url(${l.tex})`, backgroundSize: 'cover', filter: 'brightness(.42)' }} />
      <div className="absolute right-0 top-0 h-full origin-right" style={{ width: thick, transform: 'rotateY(90deg)', backgroundImage: `url(${l.tex})`, backgroundSize: 'cover', filter: 'brightness(.32)' }} />
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
