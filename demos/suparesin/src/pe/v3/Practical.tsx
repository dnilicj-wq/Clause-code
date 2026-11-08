import { useState } from 'react';
import { useSite } from '@/src/lib/ctx';
import { faq, photoSrc, process, services } from '@/config/content';

// Rough positions for the area map (lon, lat); Wrexham is home.
const TOWNS: Record<string, [number, number]> = {
  Wrexham: [-2.993, 53.046], Chester: [-2.891, 53.193], Wirral: [-3.07, 53.37], Cheshire: [-2.55, 53.15], Shropshire: [-2.75, 52.71], 'North Wales': [-3.55, 53.15],
};
const xy = ([lon, lat]: [number, number]) => [40 + ((lon + 3.75) / 1.35) * 320, 236 - ((lat - 52.62) / 0.82) * 210];

// The practical answers: where he works, how a job runs (his FAQ's own times), what he does, and his FAQ.
export function Practical() {
  const { site } = useSite();
  const [open, setOpen] = useState<number | null>(0);
  const [area, setArea] = useState('Wrexham');
  const home = xy(TOWNS.Wrexham);
  return (
    <section id="practical" aria-labelledby="pracH" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-5 md:px-12">
        <h2 id="pracH" className="d-l max-w-[16ch]">Everything you’d <i className="gold-text">ask first.</i></h2>

        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:grid-rows-[minmax(240px,auto)_minmax(240px,auto)] md:gap-4">
          {/* areas: chips + a little map */}
          <div className="tile relative overflow-hidden p-6 md:col-span-2 md:row-span-2 md:p-8">
            <p className="font-display text-[clamp(26px,2.6vw,36px)] font-[420] leading-[1.08]">Based in North Wales.<br /><span className="y">Working across the border.</span></p>
            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Areas covered">
              {site.areas.map((a) => (
                <button key={a} onClick={() => setArea(a)} aria-pressed={area === a} className="chip transition-colors"
                  style={area === a ? { background: 'var(--y)', color: '#140E02', boxShadow: 'none' } : undefined}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>{a}
                </button>
              ))}
            </div>
            <svg viewBox="0 0 400 260" className="mt-6 w-full" aria-hidden>
              <defs><pattern id="pdots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="rgba(244,239,230,.09)" /></pattern></defs>
              <rect width="400" height="260" fill="url(#pdots)" />
              {Object.entries(TOWNS).map(([n, c]) => { const [x, y] = xy(c); const h = n === 'Wrexham'; const on = n === area; return (
                <g key={n}>
                  {!h && <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke={on ? '#F3B31E' : 'rgba(243,179,30,.35)'} strokeWidth={on ? 2 : 1.2} strokeDasharray="3 4" className={on ? 'pe-dash' : ''} />}
                  {(h || on) && <circle cx={x} cy={y} r="9" fill="none" stroke="#F3B31E" strokeWidth="1.5" className="pe-ping" />}
                  <circle cx={x} cy={y} r={h || on ? 5.5 : 3.5} fill={h || on ? '#F3B31E' : 'rgba(244,239,230,.7)'} />
                  <text x={x + 10} y={y + 4} fontSize="12" fill={h || on ? '#F4EFE6' : 'rgba(244,239,230,.6)'} fontFamily="var(--font-body)">{n}</text>
                </g>); })}
            </svg>
            <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>{area === 'Wrexham' ? 'Home turf.' : `Yes, ${site.company} covers ${area}.`} Not sure about your postcode? Ask {site.owner.first}.</p>
          </div>

          {/* free survey */}
          <div className="tile flex flex-col justify-between p-6 md:p-7" style={{ background: 'var(--y)', color: '#140E02' }}>
            <p className="font-display text-[54px] font-[420] italic leading-none tracking-[-.03em]">Free</p>
            <div>
              <p className="font-display text-[22px] font-[460] leading-tight">no-obligation quote</p>
              <p className="mt-1.5 text-[14px] leading-snug" style={{ color: 'rgba(20,14,2,.75)' }}>From his website: a free, no-obligation site survey and a tailored quotation.</p>
            </div>
          </div>

          {/* permeable */}
          <div className="tile relative flex flex-col justify-end overflow-hidden p-6 md:p-7">
            <img src={photoSrc('drive-wall', 640)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(26,24,21,.2), rgba(26,24,21,.92) 75%)' }} />
            <div className="relative">
              <p className="font-display text-[22px] font-[460] leading-tight">Rain drains through</p>
              <p className="mt-1.5 text-[14px] leading-snug" style={{ color: 'var(--muted)' }}>His FAQ: resin bound is fully permeable and SuDS compliant, usually no planning permission needed.</p>
            </div>
          </div>

          {/* services */}
          <div className="tile p-6 md:col-span-2 md:p-7">
            <p className="font-display text-[22px] font-[460] leading-tight">What {site.company} lays</p>
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
              {services.map((s) => <li key={s} className="rounded-full px-3 py-1.5 text-[13.5px]" style={{ background: 'rgba(244,239,230,.06)' }}>{s}</li>)}
            </ul>
          </div>
        </div>

        {/* how it works */}
        <div className="mt-16 md:mt-24">
          <h3 className="d-m">From first message to first drive on it.</h3>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-[18px] md:grid-cols-4" style={{ background: 'var(--line)' }}>
            {process.map((st, i) => (
              <li key={st.title} className="flex flex-col gap-3 p-6 md:min-h-[220px] md:p-7" style={{ background: 'var(--bg)' }}>
                <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[16px] font-[500]" style={{ background: i === 0 ? 'var(--y)' : 'rgba(244,239,230,.08)', color: i === 0 ? '#140E02' : 'var(--ink)' }}>{i + 1}</span>
                <p className="font-display text-[21px] font-[460] leading-tight">{st.title}</p>
                <p className="text-[14.5px] leading-snug" style={{ color: 'var(--muted)' }}>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* FAQ */}
        <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-[.8fr_1.2fr] md:gap-16">
          <div>
            <h3 className="d-m">Questions people ask.</h3>
            <p className="mt-3 text-[14px]" style={{ color: 'var(--muted)' }}>Answers from the {site.company} FAQ.</p>
          </div>
          <div className="border-t" style={{ borderColor: 'var(--line)' }}>
            {faq.map((f, i) => (
              <div key={i} className="border-b" style={{ borderColor: 'var(--line)' }}>
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[19px] font-[460] md:text-[21px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[18px] transition-transform duration-300" style={{ background: open === i ? 'var(--y)' : 'rgba(244,239,230,.08)', color: open === i ? '#140E02' : 'var(--ink)', transform: open === i ? 'rotate(45deg)' : 'none' }} aria-hidden>+</span>
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
