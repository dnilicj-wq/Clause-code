// Ported from 21st.dev/@dhileepkumargm/components/aether-flow-hero. Source: library-inbox/aether-flow-hero.tsx.
// Same particle network: drifting nodes, pointer repels within 200px, links between near nodes, links
// near the pointer turn bright. Changes: TS, sized to its container (the original used window size),
// DPR capped, purple swapped for preset accent/accent2, background = --bg, staggered fade-up overlay kept,
// pauses offscreen, link distance capped so wide screens stay light.
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { cssVar, fitCanvas, rgba, runLoop, toRGB } from '../_shared/loop';

type N = { x: number; y: number; dx: number; dy: number; s: number };

export function AetherFlowCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d')!;
    let W = 1, H = 1, nodes: N[] = [];
    let acc: [number, number, number] = [0, 0, 0], hi = acc, bg = acc;
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };
    const init = () => {
      ({ w: W, h: H } = fitCanvas(canvas, ctx));
      acc = toRGB(cssVar(canvas, '--accent')); hi = toRGB(cssVar(canvas, '--accent2')); bg = toRGB(cssVar(canvas, '--bg'));
      mouse.radius = Math.min(200, Math.max(W, H) * 0.3);
      const n = (W * H) / 9000;
      nodes = Array.from({ length: Math.max(14, Math.round(n)) }, () => {
        const s = Math.random() * 2 + 1;
        return { x: Math.random() * (W - s * 4) + s * 2, y: Math.random() * (H - s * 4) + s * 2, dx: Math.random() * 0.4 - 0.2, dy: Math.random() * 0.4 - 0.2, s };
      });
    };
    init();
    const ro = new ResizeObserver(init); ro.observe(canvas.parentElement!);
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) { mouse.x = mouse.y = null; return; }
      mouse.x = x; mouse.y = y;
    };
    const out = () => { mouse.x = mouse.y = null; };
    addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', out);
    const draw = () => {
      ctx.fillStyle = rgba(bg, 1); ctx.fillRect(0, 0, W, H);
      for (const p of nodes) {
        if (p.x > W || p.x < 0) p.dx = -p.dx;
        if (p.y > H || p.y < 0) p.dy = -p.dy;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < mouse.radius + p.s) { const f = (mouse.radius - d) / mouse.radius; p.x -= (dx / d) * f * 5; p.y -= (dy / d) * f * 5; }
        }
        p.x += p.dx; p.y += p.dy;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fillStyle = rgba(hi, 0.8); ctx.fill();
      }
      // original threshold: (W/7)*(H/7) squared px, opacity 1 - d/20000; capped so ultrawide screens don't web over
      const th = Math.min((W / 7) * (H / 7), 20000);
      ctx.lineWidth = 1;
      for (let a = 0; a < nodes.length; a++) for (let b = a; b < nodes.length; b++) {
        const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, d = dx * dx + dy * dy;
        if (d < th) {
          const o = Math.max(0, 1 - d / 20000);
          let near = false;
          if (mouse.x !== null && mouse.y !== null) { const mx = nodes[a].x - mouse.x, my = nodes[a].y - mouse.y; near = Math.sqrt(mx * mx + my * my) < mouse.radius; }
          ctx.strokeStyle = near ? `rgba(255,255,255,${o})` : rgba(acc, o * 0.8);
          ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
        }
      }
    };
    const stop = runLoop(canvas, draw);
    return () => { stop(); ro.disconnect(); removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', out); };
  }, []);
  return <div className={`absolute inset-0 ${className}`}><canvas ref={ref} className="absolute inset-0 block" /></div>;
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2 + 0.5, duration: 0.8, ease: 'easeInOut' as const } }) };

export function AetherFlowHero({ badge = 'Dynamic Rendering Engine', title = 'Aether Flow', sub, cta = 'Get my price', onCta, children, className = '' }: {
  badge?: string; title?: ReactNode; sub?: string; cta?: string; onCta?: () => void; children?: ReactNode; className?: string;
}) {
  return (
    <div className={`relative flex h-full min-h-[inherit] w-full flex-col items-center justify-center overflow-hidden ${className}`} style={{ containerType: 'inline-size' }}>
      <AetherFlowCanvas />
      <div className="relative z-10 p-6 text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 backdrop-blur-sm"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent2)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{badge}</span>
        </motion.div>
        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="mb-[clamp(10px,2cqw,24px)] bg-clip-text font-display text-[clamp(30px,6.5cqw,104px)] font-semibold leading-none tracking-tighter text-transparent"
          style={{ backgroundImage: 'linear-gradient(180deg, var(--ink), var(--muted))' }}>{title}</motion.h1>
        {sub && <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mx-auto mb-6 max-w-xl text-[15px]" style={{ color: 'var(--muted)' }}>{sub}</motion.p>}
        {cta && (
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <button onClick={onCta} className="mx-auto flex items-center gap-2 rounded-[calc(var(--radius)*.5)] px-6 py-3 text-sm font-semibold shadow-lg transition-opacity hover:opacity-90"
              style={{ background: 'var(--ink)', color: 'var(--bg)' }}>{cta}<ArrowRight className="h-4 w-4" /></button>
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
}
