import { useEffect, useRef, useState } from 'react';
import type { StudioApi } from '@/components/signature/resin-studio/studio';
import { whenReadyForGL, isCoarse, glMode, softwareRenderer } from '@/src/lib/gl';
import { useSite } from '@/src/lib/ctx';
import { CutReveal } from './lite';
import { modeFinishes, type Mode } from '@/config/finishes';
import { swatch } from '@/config/swatches';
import { useQuote } from './quote';

// Signature moment: a live resin studio. Driveways pours resin-bound stone over an old cracked drive;
// Floors floods flake, metallic or high-build epoxy under workshop lights. Every tap pours again.
// The poster (a real frame of this scene) paints first; the live scene fades in once the page is idle.
export function Hero() {
  const { site, preset } = useSite();
  const q = useQuote();
  const host = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<StudioApi | null>(null);
  const want = useRef(q.finish);
  const [live, setLive] = useState(false);
  const [pouring, setPouring] = useState(false);
  want.current = q.finish;

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    if (glMode() === 'off' || softwareRenderer()) (window as any).__heroNoGL = true;
    let gone = false;
    const afterLoad = (f: () => void) => {
      const idle = () => ((window as any).requestIdleCallback ? (window as any).requestIdleCallback(f, { timeout: 700 }) : setTimeout(f, 200));
      if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
    };
    const stop = whenReadyForGL(() => afterLoad(start), { eagerTouch: true });
    async function start() {
      if (gone) return;
      const a = (await import('@/components/signature/resin-studio/studio')).initStudio(host.current!, canvas.current!, {
        fog: preset.bg, tex: '/tex/', onReady: () => setLive(true), onLost: () => setLive(false), onPoured: () => setPouring(false),
      });
      if (!a) return;
      if (gone) { a.destroy(); return; }
      api.current = a;
      const go = () => {
        if (a.loaded) (window as any).__heroReady = true;
        if (!(a.loaded && (window as any).__ld !== false)) return setTimeout(go, 60);
        const f = want.current;
        a.bare(f.mode); a.pour(f, f.mode); setPouring(true);
      };
      go();
    }
    return () => { gone = true; stop(); api.current?.destroy(); api.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // every change of finish pours again
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const a = api.current; if (!a || !a.loaded) return;
    a.pour(q.finish, q.finish.mode); setPouring(true);
  }, [q.finish]);

  const floor = q.mode === 'floor';
  return (
    <section ref={host} id="top" className="relative isolate overflow-hidden" style={{ height: '100svh', minHeight: 660 }} aria-label="Hero: pour a resin driveway or an epoxy floor">
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 699px)" srcSet={site.posters.m} />
        <img src={site.posters.d} alt="" className="h-full w-full object-cover" fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvas} className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-700" style={{ opacity: live ? 1 : 0 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(180deg, rgba(6,10,13,.55) 0%, rgba(6,10,13,0) 20%, rgba(6,10,13,0) 50%, rgba(6,10,13,.45) 72%, rgba(6,10,13,.86) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] md:hidden" style={{ background: 'linear-gradient(180deg, rgba(6,10,13,.5) 0%, rgba(6,10,13,0) 11%, rgba(6,10,13,0) 30%, rgba(6,10,13,.74) 42%, rgba(6,10,13,.92) 56%, rgba(6,10,13,.97) 100%)' }} />
      <div className="pointer-events-none absolute inset-0 -z-[5] hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(6,10,13,.66) 0%, rgba(6,10,13,.26) 38%, rgba(6,10,13,0) 54%)' }} />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-[max(36px,env(safe-area-inset-bottom))] pt-24 md:flex-row md:items-end md:justify-between md:gap-10 md:px-12 md:pb-20">
        <div className="md:max-w-[660px]">
          <h1 className="font-display text-[clamp(46px,8vw,98px)] font-[380] leading-[.94] tracking-[-.035em]">
            <span className="block"><CutReveal text="Seamless resin," delay={0.12} /></span>
            <span className="sr-rise block pb-[.08em] pr-[.1em] gold-text italic">poured for you.</span>
          </h1>
          <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed md:mt-5 md:text-[19px]" style={{ color: 'color-mix(in srgb, var(--ink) 82%, transparent)' }}>
            Resin-bound driveways and epoxy floors across Wrexham, Chester, the Wirral, Cheshire, Shropshire and North Wales.
          </p>
          <div className="pointer-events-auto mt-5 hidden gap-2.5 md:mt-8 md:flex">
            <a href="#price" className="btn btn-y sr-sheen">Price my job</a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ background: 'rgba(6,10,13,.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}><WaIcon />{`WhatsApp ${site.owner.first}`}</a>
          </div>
        </div>
        <StudioCard pouring={pouring && live} />
      </div>
      <span className="ex-tag right-4 top-[76px] md:right-6">{floor ? 'Live illustration · example finish' : 'Live illustration · example blend'}</span>
    </section>
  );
}

// The studio card: Driveways / Floors, then the finish. Swatches are stills of the scene's own surfaces.
function StudioCard({ pouring }: { pouring: boolean }) {
  const q = useQuote();
  const list = modeFinishes(q.mode);
  return (
    <div className="edge pointer-events-auto relative mt-4 w-full rounded-[18px] p-3 md:mt-0 md:w-[400px] md:shrink-0 md:p-5"
      style={{ background: 'linear-gradient(180deg, rgba(14,28,35,.78), rgba(6,10,13,.82))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 30px 60px -30px rgba(0,0,0,.8), 0 0 60px -30px rgba(47,211,217,.45)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)' }}>
      <div className="grid grid-cols-2 gap-1 rounded-full p-1" role="tablist" aria-label="What are you planning?" style={{ background: 'rgba(244,239,230,.07)' }}>
        {(['drive', 'floor'] as Mode[]).map((m) => {
          const on = q.mode === m;
          return (
            <button key={m} role="tab" aria-selected={on} onClick={() => q.setMode(m)}
              className="flex h-10 items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition-colors duration-200 md:h-11"
              style={on ? { background: 'var(--molten)', color: '#1A0C02', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5), 0 8px 20px -10px rgba(240,122,62,.9)' } : { color: 'var(--ink)' }}>
              {m === 'drive' ? <DriveIcon /> : <FloorIcon />}{m === 'drive' ? 'Driveways' : 'Floors'}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2 px-1 md:mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em]" style={{ color: 'var(--aq)' }}>{q.mode === 'drive' ? 'Pick a blend' : 'Pick a finish'}</p>
        <p className="text-[12.5px] font-medium" aria-live="polite">{pouring ? 'Pouring…' : q.finish.name}</p>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={q.mode === 'drive' ? 'Resin blend' : 'Floor finish'}>
        {list.map((f) => {
          const on = q.finish.key === f.key;
          return (
            <button key={f.key} role="radio" aria-checked={on} aria-label={f.name} onClick={() => q.setFinish(f.key)}
              className="flex flex-col items-center gap-1 rounded-xl p-1 text-[11.5px] font-medium leading-tight transition-[background-color,border-color] duration-200 md:pb-1.5 md:text-[12px]"
              style={on ? { background: 'linear-gradient(180deg, rgba(243,179,30,.18), rgba(240,122,62,.08))', border: '1px solid #F3B31E', boxShadow: '0 0 20px -6px rgba(240,122,62,.7)' } : { background: 'rgba(214,240,245,.04)', border: '1px solid var(--line)' }}>
              <span className="block h-7 w-full rounded-lg bg-cover bg-center md:h-10" style={{ backgroundImage: swatch[f.key] ? `url(${swatch[f.key]})` : `linear-gradient(135deg, ${f.c1}, ${f.c2} 55%, ${f.c3})` }} aria-hidden />
              {f.short}
            </button>
          );
        })}
      </div>
      <a href="#price" className="btn btn-y mt-3 w-full !h-12 md:mt-4">{`Price this ${q.mode === 'drive' ? 'drive' : 'floor'} `}<span aria-hidden>→</span></a>
    </div>
  );
}

const DriveIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 11l9-7 9 7" /><path d="M5 10v9h14v-9" /><path d="M9 19l-3 3M15 19l3 3" /></svg>;
const FloorIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17l9 4 9-4-9-4-9 4z" /><path d="M7 15l5-8 5 8" /></svg>;

export function WaIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>;
}
