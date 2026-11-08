import { useEffect, useRef, useState } from 'react';
import { photos, photoSrc } from '@/config/content';
import { useSite } from '@/src/lib/ctx';
import { useSectionProgress, reducedMotion } from './progress';

// Act three: his own jobs, panned sideways as you scroll down (desktop). Phones get a native swipe rail.
export function Work() {
  const { site } = useSite();
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

  useSectionProgress(sec, (p) => {
    if (track.current && pan) track.current.style.transform = `translate3d(${-p * dist.current}px,0,0)`;
  }, [pan, h]);

  const cards = photos.map((p, i) => (
    <figure key={p.key} className="m-0 shrink-0 snap-start" style={{ width: pan ? `calc(${(p.w / p.h).toFixed(3)} * min(62vh, 620px))` : `min(${p.w > p.h ? 86 : 70}vw, ${p.w > p.h ? 520 : 360}px)` }}>
      <div className="overflow-hidden rounded-[14px]" style={{ aspectRatio: `${p.w} / ${p.h}`, background: '#1B1F24' }}>
        <img src={photoSrc(p, 1280)} srcSet={`${photoSrc(p, 640)} 640w, ${photoSrc(p, 1280)} 1280w`} sizes="(min-width: 900px) 520px, 80vw"
          alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-[14px]">
        <span className="font-medium">{p.title}</span>
        <span className="tabular-nums" style={{ color: 'var(--muted)' }}>{String(i + 1).padStart(2, '0')}</span>
      </figcaption>
    </figure>
  ));

  const intro = (
    <div className="flex shrink-0 flex-col justify-end pr-4 md:w-[min(34vw,440px)] md:pr-10">
      <h2 id="workH" className="d-l">Laid by <span className="y">{site.owner.first}’s team.</span></h2>
      <p className="lede3 mt-5">Real jobs from around {site.areaLine}: block paving, resin and patios. Every photo here is his work.</p>
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
    <div className="flex w-[min(80vw,360px)] shrink-0 flex-col justify-end self-stretch rounded-[14px] p-6 md:p-8" style={{ background: 'var(--y)', color: '#121315' }}>
      <p className="font-display text-[30px] font-semibold leading-[1.02] tracking-[-.02em] md:text-[38px]">Yours could be next.</p>
      <p className="mt-3 text-[15px]" style={{ color: 'rgba(18,19,21,.75)' }}>Price it in under a minute.</p>
      <a href="#price" className="btn btn-ink mt-6 self-start">Price my drive</a>
    </div>
  );
}
