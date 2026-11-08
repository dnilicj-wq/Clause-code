import { useEffect, useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { Stars } from '../lite';
import { reducedMotion } from './progress';

// On-page proof his own site doesn't have: his live Google rating, three reviews word for word, and his own
// credentials in his own words (suparesin.co.uk home page). Nothing here is paraphrased into a new claim.
const CREDS = [
  { t: 'City & Guilds approved', d: 'The City & Guilds approved logo is shown on his website.', img: true },
  { t: 'Approved installers', d: '“We are approved installers for a range of resin product suppliers.”' },
  { t: 'Fully insured', d: '“…should anything go wrong, we are fully insured and backed by our suppliers.”' },
  { t: 'No pressure, no sales', d: '“No pressure, no sales, just clear, honest, help and advice.”' },
];

export function Proof() {
  const { site } = useSite();
  const [i, setI] = useState(0);
  const R = site.reviews;
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => setI((n) => (n + 1) % R.length), 7000);
    return () => clearInterval(t);
  }, [R.length]);
  const r = R[i];
  return (
    <section id="reviews" aria-labelledby="revH" className="relative overflow-hidden py-20 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 40% at 15% 20%, rgba(243,179,30,.10), transparent 70%)' }} />
      <div className="relative mx-auto grid max-w-[1320px] gap-12 px-5 md:grid-cols-[1fr_1.25fr] md:items-end md:gap-16 md:px-12">
        <div>
          <h2 id="revH" className="sr-only">Reviews and credentials</h2>
          <a href={site.socials.google} target="_blank" rel="noreferrer" className="group block">
            <span className="block font-display text-[clamp(120px,19vw,240px)] font-[360] italic leading-[.8] tracking-[-.04em] gold-text">{site.proof.rating.toFixed(1)}</span>
            <span className="mt-5 flex items-center gap-3"><Stars size={20} /><span className="text-[17px] font-medium">from {site.proof.reviewCount} Google reviews</span></span>
            <span className="mt-2 inline-block text-[14px] underline decoration-white/25 underline-offset-4 transition-colors group-hover:decoration-[var(--y)]" style={{ color: 'var(--muted)' }}>Read them on Google</span>
          </a>
        </div>
        <figure className="m-0" aria-live="polite">
          <blockquote key={i} className="v3-fade font-display text-[clamp(24px,2.8vw,40px)] font-[380] leading-[1.18] tracking-[-.015em]" style={{ textWrap: 'pretty' }}>“{r.text}”</blockquote>
          <figcaption className="mt-5 flex items-center gap-4 text-[15px]">
            <span><b className="font-semibold">{r.name}</b> <span style={{ color: 'var(--muted)' }}>· {r.job} · Google, {r.date}</span></span>
            <span className="ml-auto flex gap-1.5">
              {R.map((_, n) => (
                <button key={n} onClick={() => setI(n)} aria-label={`Show review ${n + 1}`} className="grid h-8 w-8 place-items-center">
                  <i className="block h-1.5 rounded-full transition-[width,background-color] duration-300" style={{ width: n === i ? 22 : 8, background: n === i ? 'var(--y)' : 'rgba(244,239,230,.25)' }} />
                </button>
              ))}
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="relative mx-auto mt-16 max-w-[1320px] px-5 md:mt-24 md:px-12">
        <ul className="grid gap-px overflow-hidden rounded-[18px] sm:grid-cols-2 md:grid-cols-4" style={{ background: 'var(--line)' }}>
          {CREDS.map((c) => (
            <li key={c.t} className="flex flex-col gap-3 p-6 md:min-h-[200px] md:p-7" style={{ background: 'var(--bg)' }}>
              {c.img
                ? <img src="/client/city-guilds-96-v1.webp" alt="City & Guilds approved" width={96} height={96} loading="lazy" className="h-12 w-12 rounded-md bg-white p-1" />
                : <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: 'rgba(243,179,30,.12)', color: 'var(--y)' }} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>}
              <p className="font-display text-[22px] font-[440] leading-tight">{c.t}</p>
              <p className="text-[14.5px] leading-snug" style={{ color: 'var(--muted)' }}>{c.d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px]" style={{ color: 'var(--muted)' }}>Quotes from the {site.company} website. Proud sponsors of Llay under 16s and Brymbo Lodge YFC under 11s.</p>
      </div>
    </section>
  );
}
