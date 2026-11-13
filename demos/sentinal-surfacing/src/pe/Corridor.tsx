import { useEffect, useRef, useState } from 'react';
import { photos, photoSrc } from '@/config/content';
import { useSite } from '@/src/lib/ctx';

// Gallery corridor: scroll walks you down a corridor hung with their own job photos.
// CSS 3D only (no WebGL). Reduced motion gets a plain grid.
export function Corridor() {
  const { site } = useSite();
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [vw, setVw] = useState(1200);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(matchMedia('(prefers-reduced-motion: reduce)').matches);
    const f = () => {
      setVw(innerWidth);
      const el = wrap.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);

  const phone = vw < 700;
  const gap = phone ? 520 : 760;                    // depth between photos
  const depth = gap * (photos.length - 1) + 400;
  const cam = p * depth;
  const active = Math.min(photos.length - 1, Math.max(0, Math.round((cam - 300) / gap)));

  if (reduce) {
    return (
      <section id="work" className="section" aria-labelledby="workH">
        <div className="wrap"><Title company={site.company} />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((ph) => <img key={ph.key} src={photoSrc(ph, 640)} alt={ph.alt} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" aria-labelledby="workH" className="relative" style={{ background: 'var(--bg2)' }}>
      <div ref={wrap} style={{ height: phone ? '230vh' : '300vh' }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pb-10 pt-20 md:px-16 md:pt-24" style={{ background: "linear-gradient(180deg, var(--bg2) 55%, transparent)" }}><Title company={site.company} /></div>
          {/* corridor */}
          <div className="absolute inset-0 z-0 isolate" style={{ perspective: phone ? '520px' : '900px', perspectiveOrigin: phone ? '50% 44%' : '50% 55%' }}>
            <div className="absolute left-1/2 top-[47%] md:top-[60%]" style={{ transformStyle: 'preserve-3d', transform: `translateZ(${cam}px)` }}>
              {/* floor line glow */}
              <div className="absolute -translate-x-1/2" style={{ width: phone ? 220 : 520, height: depth + 800, top: phone ? 150 : 230, transform: `rotateX(90deg) translateZ(0px)`, transformOrigin: 'top', background: 'linear-gradient(180deg, rgba(252,184,97,.18), rgba(111,140,255,0) 60%)', filter: 'blur(1px)' }} />
              {photos.map((ph, i) => {
                const side = i % 2 ? 1 : -1;
                const z = -i * gap - 300;
                const w = phone ? 240 : 560, h = Math.round(w * 0.75);
                const x = side * (phone ? 92 : 300);
                const rel = cam + z;                       // how close to the camera (0 = at the lens)
                const o = rel > 120 ? Math.max(0, 1 - (rel - 120) / 260) : Math.min(1, 1 + rel / (gap * 3.2));
                return (
                  <figure key={ph.key} className="absolute m-0" style={{
                    width: w, height: h, left: -w / 2, top: -h / 2, opacity: o,
                    transform: `translate3d(${x}px, 0, ${z}px) rotateY(${-side * (phone ? 38 : 48)}deg)`,
                    transformOrigin: side < 0 ? 'right center' : 'left center',
                  }}>
                    <img src={photoSrc(ph, phone ? 640 : 1280)} alt={ph.alt} decoding="async" className="h-full w-full rounded-[14px] object-cover"
                      style={{ boxShadow: '0 40px 80px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.12)' }} />
                  </figure>
                );
              })}
            </div>
          </div>
          {/* caption + progress */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 px-5 pb-[96px] md:px-16 md:pb-12">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-[.14em]" style={{ color: 'var(--accent2)' }}>Their job · {photos[active].place}</div>
              <div className="font-display text-[18px] font-semibold md:text-[22px]">{photos[active].title}</div>
            </div>
            <div className="flex items-center gap-1.5 pb-2" aria-hidden>
              {photos.map((_, i) => <span key={i} className="h-1 rounded-full transition-all duration-300" style={{ width: i === active ? 18 : 6, background: i === active ? 'var(--accent)' : 'rgba(255,255,255,.2)' }} />)}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 55%, transparent 40%, var(--bg2) 100%)' }} />
        </div>
      </div>
    </section>
  );
}

function Title({ company }: { company: string }) {
  return (
    <div className="max-w-[640px]">
      <p className="eyebrow">Our work</p>
      <h2 id="workH" className="h2 mt-3 !text-[clamp(34px,5.4vw,72px)]">Walk through <span className="serif" style={{ color: 'var(--accent2)' }}>real jobs.</span></h2>
    </div>
  );
}
