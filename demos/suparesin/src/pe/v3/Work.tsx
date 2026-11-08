import { useEffect, useRef, useState } from 'react';
import { photos, photoSrc, type Photo } from '@/config/content';
import { useQuote } from '../quote';
import { useSite } from '@/src/lib/ctx';
import { useSectionProgress, reducedMotion } from './progress';

// Recent projects: his own photos from suparesin.co.uk, panned sideways as you scroll (desktop), swipe rail on phones.
// The filter follows the hero (Driveways / Floors) until you pick one yourself.
export function Work() {
  const { site } = useSite();
  const q = useQuote();
  const [pick, setPick] = useState<Photo['kind'] | 'All'>('All');
  const shown = pick === 'All' ? photos : photos.filter((p) => p.kind === pick);
  const sec = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState(false);
  const [h, setH] = useState<number | null>(null);
  const dist = useRef(0);

  useEffect(() => {
    const mq = matchMedia('(min-width: 900px)');
    const f = () => setPan(mq.matches && !reducedMotion());
    f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f);
  }, []);

  useEffect(() => {
    if (!pan || !track.current) { setH(null); return; }
    const t = track.current;
    const measure = () => { dist.current = Math.max(0, t.scrollWidth - innerWidth); setH(dist.current + innerHeight); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(t);
    return () => ro.disconnect();
  }, [pan]);

  // follow the hero's mode until the visitor filters by hand
  const own = useRef(false);
  useEffect(() => { if (!own.current && q.touched) setPick(q.mode === 'drive' ? 'Driveways' : 'Floors'); }, [q.mode, q.touched]);
  useSectionProgress(sec, (p) => {
    if (track.current && pan) track.current.style.transform = `translate3d(${-p * dist.current}px,0,0)`;
  }, [pan, h, pick]);

  const cards = shown.map((p, i) => (
    <figure key={p.key} className="m-0 shrink-0 snap-start" style={{ width: pan ? `min(calc(${Math.min(1.6, p.w / p.h).toFixed(3)} * min(62vh, 620px)), 900px)` : `min(${p.w > p.h ? 86 : 70}vw, ${p.w > p.h ? 520 : 360}px)` }}>
      <div className="overflow-hidden rounded-[18px]" style={{ aspectRatio: pan ? `${Math.min(1.6, p.w / p.h)}` : `${Math.min(1.6, p.w / p.h)}`, background: '#1A1815' }}>
        <img src={photoSrc(p, 1280)} srcSet={`${photoSrc(p, 640)} 640w, ${photoSrc(p, 1280)} 1280w`} sizes="(min-width: 900px) 900px, 80vw"
          alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-[14px]">
        <span className="font-medium">{p.title}</span>
        <span className="tabular-nums" style={{ color: 'var(--muted)' }}>{p.kind === 'Worktops & more' ? 'More' : p.kind} · {String(i + 1).padStart(2, '0')}</span>
      </figcaption>
    </figure>
  ));

  const intro = (
    <div className="flex shrink-0 flex-col justify-end pr-4 md:w-[min(34vw,440px)] md:pr-10">
      <p className="text-[12px] font-semibold uppercase tracking-[.16em] y">Recent projects</p>
      <h2 id="workH" className="d-l mt-3">Poured by <span className="gold-text italic">{site.owner.first}’s team.</span></h2>
      <p className="lede3 mt-5">Resin drives, metallic and flake floors, worktops and play areas. Photos from the {site.company} website.</p>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {(['All', 'Driveways', 'Floors', 'Worktops & more'] as const).map((k) => (
          <button key={k} onClick={() => { own.current = true; setPick(k); }} aria-pressed={pick === k} className="chip !h-9 !text-[13.5px] transition-colors"
            style={pick === k ? { background: 'var(--y)', color: '#140E02', boxShadow: 'none' } : undefined}>{k}</button>
        ))}
      </div>
    </div>
  );

  if (!pan) {
    return (
      <section id="work" aria-labelledby="workH" className="py-20 md:py-28">
        <div className="px-5">{intro}</div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ scrollPaddingLeft: 20 }} aria-label="Photos of his work, swipe for more">
          {cards}
          <End />
        </div>
      </section>
    );
  }
  return (
    <section ref={sec} id="work" aria-labelledby="workH" className="relative" style={{ height: h ?? '300vh' }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div ref={track} className="flex items-end gap-8 pl-12 pr-[8vw] will-change-transform">
          {intro}
          {cards}
          <End />
        </div>
      </div>
    </section>
  );
}

function End() {
  return (
    <div className="flex w-[min(80vw,360px)] shrink-0 flex-col justify-end self-stretch rounded-[18px] p-6 md:p-8" style={{ background: 'var(--y)', color: '#140E02' }}>
      <p className="font-display text-[32px] font-[420] italic leading-[1.02] tracking-[-.02em] md:text-[40px]">Yours could be next.</p>
      <p className="mt-3 text-[15px]" style={{ color: 'rgba(20,14,2,.75)' }}>Design it and see an example price in under a minute.</p>
      <a href="#price" className="btn btn-ink mt-6 self-start">Design &amp; price</a>
    </div>
  );
}
