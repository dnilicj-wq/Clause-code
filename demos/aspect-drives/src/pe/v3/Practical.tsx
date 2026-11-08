import { useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { faq, photoSrc, process } from '@/config/content';

const TOWNS: Record<string, [number, number]> = {
  Grays: [0.325, 51.478], Basildon: [0.475, 51.576], 'Stanford-le-Hope': [0.434, 51.515], Thurrock: [0.36, 51.505],
};
const xy = ([lon, lat]: [number, number]) => [70 + ((lon - 0.30) / 0.2) * 260, 230 - ((lat - 51.47) / 0.12) * 190];

// Act five: the practical answers, as a bento. Guarantee and deposit are his own words (see content-inventory.md).
export function Practical() {
  const { site } = useSite();
  const [open, setOpen] = useState<number | null>(0);
  const home = xy(TOWNS.Grays);
  return (
    <section id="practical" aria-labelledby="pracH" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 md:px-12">
        <h2 id="pracH" className="d-l max-w-[14ch]">The practical <span className="y">bits.</span></h2>

        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:grid-rows-[minmax(230px,auto)_minmax(230px,auto)] md:gap-4">
          {/* guarantee: photo + his words */}
          <div className="relative min-h-[340px] overflow-hidden rounded-[14px] md:col-span-2 md:row-span-2">
            <img src={photoSrc('block-diamond', 1280)} srcSet={`${photoSrc('block-diamond', 640)} 640w, ${photoSrc('block-diamond', 1280)} 1280w`} sizes="(min-width: 900px) 640px, 100vw"
              alt="Grey block driveway with a diamond inlay, laid by Aspect" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(16,18,21,0) 25%, rgba(16,18,21,.55) 55%, rgba(16,18,21,.95) 100%)' }} />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
              <p className="font-display text-[clamp(28px,3vw,42px)] font-semibold leading-[1.04] tracking-[-.02em]">“All our work is guaranteed for many years.”</p>
              <p className="mt-3 text-[14px]" style={{ color: 'var(--muted)' }}>{site.owner.first}, in his own words. Ask him for the terms for your job.</p>
            </div>
          </div>

          {/* no deposit */}
          <div className="tile flex flex-col justify-between p-6 md:p-7" style={{ background: 'var(--y)', color: '#121315' }}>
            <p className="font-display text-[64px] font-semibold leading-none tracking-[-.04em]">£0</p>
            <div>
              <p className="font-display text-[22px] font-semibold leading-tight">up front</p>
              <p className="mt-1.5 text-[14px] leading-snug" style={{ color: 'rgba(18,19,21,.75)' }}>From his website: no deposit is required until the work is finished to your satisfaction.</p>
            </div>
          </div>

          {/* free estimates */}
          <div className="tile flex flex-col justify-between p-6 md:p-7">
            <p className="font-display text-[22px] font-semibold leading-tight">Free estimates</p>
            <p className="mt-6 text-[14px] leading-snug" style={{ color: 'var(--muted)' }}>{site.owner.first} visits, talks through ideas and colours, then prices it. Domestic and commercial.</p>
          </div>

          {/* areas map */}
          <div className="tile relative overflow-hidden p-6 md:col-span-2 md:p-7">
            <div className="relative z-[1] flex h-full min-h-[190px] max-w-[52%] flex-col justify-between gap-4">
              <p className="font-display text-[22px] font-semibold leading-tight">Working across<br /><span className="y">{site.region}.</span></p>
              <p className="text-[14px]" style={{ color: 'var(--muted)' }}>{site.areas.join(', ')} and nearby.</p>
            </div>
            <svg viewBox="0 0 400 260" className="pointer-events-none absolute -right-2 top-0 h-full w-[50%] opacity-90" aria-hidden>
              <defs><pattern id="pdots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="rgba(236,236,232,.10)" /></pattern></defs>
              <rect width="400" height="260" fill="url(#pdots)" />
              {Object.entries(TOWNS).map(([n, c]) => { const [x, y] = xy(c); const h = n === 'Grays'; return (
                <g key={n}>
                  {!h && <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke="rgba(244,194,27,.45)" strokeWidth="1.2" strokeDasharray="3 4" />}
                  {h && <circle cx={x} cy={y} r="9" fill="none" stroke="#F4C21B" strokeWidth="1.5" className="pe-ping" />}
                  <circle cx={x} cy={y} r={h ? 5.5 : 3.5} fill={h ? '#F4C21B' : 'rgba(236,236,232,.7)'} />
                  <text x={x + 10} y={y + 4} fontSize="11" fill={h ? '#ECECE8' : 'rgba(236,236,232,.6)'} fontFamily="var(--font-body)">{n}</text>
                </g>); })}
            </svg>
          </div>
        </div>

        {/* how it works: a real sequence, so it is numbered (from his Checkatrade profile and what reviewers describe) */}
        <div className="mt-16 md:mt-24">
          <h3 className="d-m">From first message to finished drive.</h3>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-[14px] md:grid-cols-4" style={{ background: 'var(--line)' }}>
            {process.map((st, i) => (
              <li key={st.title} className="flex flex-col gap-3 p-6 md:min-h-[220px] md:p-7" style={{ background: 'var(--bg)' }}>
                <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[15px] font-semibold" style={{ background: i === process.length - 1 ? 'var(--y)' : 'rgba(236,236,232,.08)', color: i === process.length - 1 ? '#121315' : 'var(--ink)' }}>{i + 1}</span>
                <p className="font-display text-[20px] font-semibold leading-tight">{st.title}</p>
                <p className="text-[14.5px] leading-snug" style={{ color: 'var(--muted)' }}>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-[.8fr_1.2fr] md:gap-16">
          <h3 className="d-m">Questions people ask.</h3>
          <div className="border-t" style={{ borderColor: 'var(--line)' }}>
            {faq.map((f, i) => (
              <div key={i} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[18px] font-semibold md:text-[20px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[18px] transition-transform duration-300" style={{ background: open === i ? 'var(--y)' : 'rgba(236,236,232,.08)', color: open === i ? '#121315' : 'var(--ink)', transform: open === i ? 'rotate(45deg)' : 'none' }} aria-hidden>+</span>
                </button>
                <div className="acc" data-open={open === i}>
                  <div><p className="max-w-[60ch] pb-5 text-[15.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>{f.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
