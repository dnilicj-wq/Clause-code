import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { Stars } from '../lite';
import { reducedMotion } from './progress';

// Short extracts, word for word, from reviews in config/site.ts (full text on Google / Checkatrade).
const FEATURED = [
  { q: 'My driveway looks better than I imagined, and the workmanship is excellent.', who: 'Rachel M.', src: 'Google' },
  { q: 'The boys worked really hard & it was all done in 4 days.', who: 'Gail L.', src: 'Google' },
  { q: '…straightforward, efficient and professional from start to finish.', who: 'Block paving customer', src: 'Checkatrade' },
];
const RAIL = [
  'Excellent new driveway and paving completed for me today.',
  'Gerald was great at keeping in touch.',
  'Throughout the process I was kept fully informed.',
  'Very pleased with the result.',
  'Good work with the patio & new fencing.',
  'Work was fantastic.',
  'The finished result looks fantastic.',
  'We’re super pleased with the end product.',
];

export function Proof() {
  const { site } = useSite();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setI((n) => (n + 1) % FEATURED.length), 5200);
    return () => clearInterval(t);
  }, []);
  const f = FEATURED[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:items-end md:gap-16 md:px-12">
        <div>
          <h2 id="revH" className="sr-only">Reviews</h2>
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="group block">
            <span className="block font-display text-[clamp(120px,19vw,240px)] font-semibold leading-[.8] tracking-[-.04em]" style={{ color: 'var(--y)' }}>{site.proof.rating.toFixed(1)}</span>
            <span className="mt-5 flex items-center gap-3"><Stars size={20} /><span className="text-[17px] font-medium">from {site.proof.reviewCount} Google reviews</span></span>
            <span className="mt-2 inline-block text-[14px] underline decoration-white/25 underline-offset-4 transition-colors group-hover:decoration-[var(--y)]" style={{ color: 'var(--muted)' }}>Read them on Google</span>
          </a>
          <a href={site.socials.checkatrade} target="_blank" rel="noreferrer" className="mt-8 flex items-center gap-3 border-t pt-6 text-[15px]" style={{ borderColor: 'var(--line)' }}>
            <span className="grid h-9 w-9 place-items-center rounded-full text-[15px] font-bold" style={{ background: 'var(--y)', color: '#121315' }} aria-hidden>✓</span>
            <span><b className="font-semibold">Checkatrade member.</b> <span style={{ color: 'var(--muted)' }}>See his profile and reviews.</span></span>
          </a>
        </div>
        <figure className="m-0" aria-live="polite">
          <blockquote key={i} className="v3-fade font-display text-[clamp(28px,3.4vw,46px)] font-medium leading-[1.12] tracking-[-.02em]" style={{ textWrap: 'balance' }}>“{f.q}”</blockquote>
          <figcaption className="mt-5 flex items-center gap-4 text-[15px]">
            <span><b className="font-semibold">{f.who}</b> <span style={{ color: 'var(--muted)' }}>· {f.src} review</span></span>
            <span className="ml-auto flex gap-1.5">
              {FEATURED.map((_, n) => (
                <button key={n} onClick={() => setI(n)} aria-label={`Show review ${n + 1}`} className="grid h-8 w-8 place-items-center">
                  <i className="block h-1.5 rounded-full transition-[width,background-color] duration-300" style={{ width: n === i ? 22 : 8, background: n === i ? 'var(--y)' : 'rgba(236,236,232,.25)' }} />
                </button>
              ))}
            </span>
          </figcaption>
        </figure>
      </div>
      <div className="mt-16 overflow-hidden md:mt-24" aria-hidden style={{ maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
        <div className="v3-marquee gap-3">
          {[...RAIL, ...RAIL].map((t, n) => (
            <span key={n} className="flex shrink-0 items-center gap-2.5 rounded-full px-5 py-3 text-[15px]" style={{ background: 'var(--surface)' }}>
              <Stars size={12} /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
