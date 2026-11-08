import { useEffect, useRef, useState } from 'react';
import type { LayersApi } from '@/components/signature/layers/layers';
import { useSectionProgress, reducedMotion } from './progress';

// Act two: the drive builds itself, layer by layer, as you scroll. General construction steps, written as such.
const STEPS = [
  { t: 'Dig out', d: 'The old surface comes up and the ground is dug down to a firm, level base.' },
  { t: 'Sub-base', d: 'Crushed stone goes in and is compacted. This is the layer that carries the car.' },
  { t: 'Laying course', d: 'Sharp sand, screeded flat, so every block sits level.' },
  { t: 'Blocks', d: 'Laid by hand, in the pattern and colours you chose.' },
  { t: 'Border', d: 'An edge course, set firm, holds the whole drive in place.' },
  { t: 'Finished', d: 'Jointing sand brushed in, the surface compacted. Ready to drive on.' },
];

export function Layers() {
  const sec = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const api = useRef<LayersApi | null>(null);
  const [step, setStep] = useState(0);
  const [still, setStill] = useState(false);
  const last = useRef(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const rm = reducedMotion(); setStill(rm); if (rm) setDone(true);
    let gone = false;
    import('@/components/signature/layers/layers').then(({ initLayers }) => {
      if (gone || !canvas.current || !stage.current) return;
      api.current = initLayers(canvas.current, stage.current);
      api.current?.setProgress(rm ? 1 : last.current);
    });
    return () => { gone = true; api.current?.destroy(); api.current = null; };
  }, []);

  useSectionProgress(sec, (p) => {
    last.current = p;
    api.current?.setProgress(p);
    if (bar.current) bar.current.style.transform = `scaleY(${p})`;
    setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
    setDone(p > 0.9);
  });

  return (
    <section ref={sec} id="layers" aria-labelledby="layH" className="relative" style={{ height: still ? 'auto' : 'max(420vh, 2800px)' }}>
      <div ref={stage} className={still ? 'relative h-[80svh]' : 'sticky top-0 h-[100svh] overflow-hidden'}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 62% 58%, #1E2228 0%, #101215 70%)' }} aria-hidden />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-label="Cutaway of a block-paved driveway building up layer by layer" role="img" />

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1320px] flex-col justify-between px-5 pb-[92px] pt-24 md:px-12 md:pb-14 md:pt-32">
          <div className="max-w-[440px]">
            <h2 id="layH" className="d-l">What goes under <span className="y">a good drive.</span></h2>
            <p className="lede3 mt-4 hidden md:block">How a block-paved drive goes together. Scroll to build it.</p>
          </div>

          {/* desktop: the six steps as a list, the current one lit, its line below */}
          <div className="hidden max-w-[380px] md:block">
            <ol className="relative">
              <span className="absolute -left-5 top-0 h-full w-px bg-white/10" aria-hidden><span ref={bar} className="block h-full w-full origin-top bg-[var(--y)]" style={{ transform: 'scaleY(0)' }} /></span>
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex h-[42px] items-baseline gap-3 transition-opacity duration-300" aria-current={i === step ? 'step' : undefined} style={{ opacity: i === step ? 1 : i < step ? 0.45 : 0.28 }}>
                  <span className="w-5 font-display text-[13px] tabular-nums" style={{ color: i <= step ? 'var(--y)' : 'var(--muted)' }}>{i + 1}</span>
                  <span className="font-display text-[21px] font-semibold tracking-[-.01em]">{s.t}</span>
                </li>
              ))}
            </ol>
            <p key={step} className="v3-fade mt-5 min-h-[3em] text-[16px] leading-snug" style={{ color: 'color-mix(in srgb, var(--ink) 78%, transparent)' }}>{STEPS[step].d}</p>
            <a href="#price" className="btn btn-y pointer-events-auto mt-4 transition-[opacity,transform] duration-500" tabIndex={done ? 0 : -1} aria-hidden={!done}
              style={{ opacity: done ? 1 : 0, transform: done ? 'none' : 'translateY(10px)', pointerEvents: done ? 'auto' : 'none' }}>Price a drive like this</a>
          </div>

          {/* phones: one step card at the bottom */}
          <div className="md:hidden" aria-live="polite">
            <div className="rounded-[14px] p-4" style={{ background: 'rgba(16,18,21,.86)', boxShadow: 'inset 0 0 0 1px rgba(236,236,232,.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-[20px] font-semibold"><span className="y mr-2 text-[14px] tabular-nums">{step + 1}/6</span>{STEPS[step].t}</span>
                <span className="flex gap-1">{STEPS.map((_, i) => <i key={i} className="block h-1 w-4 rounded-full" style={{ background: i <= step ? 'var(--y)' : 'rgba(236,236,232,.16)' }} />)}</span>
              </div>
              <p className="mt-1.5 text-[14.5px] leading-snug" style={{ color: 'var(--muted)' }}>{STEPS[step].d}</p>
              {done && <a href="#price" className="btn btn-y pointer-events-auto v3-fade mt-3 !h-11 w-full !text-[15px]">Price a drive like this</a>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
