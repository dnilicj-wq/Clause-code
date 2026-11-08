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
    <section id="practical" aria-labelledby="pracH" className="relative overflow-hidden py-20 md:py-28">
      <hr className="seam absolute inset-x-0 top-0" />
      <div aria-hidden className="aura"><i className="glow-aq drift" style={{ width: '60vw', height: '60vw', left: '-20vw', top: '0' }} /><i className="glow-cu drift" style={{ width: '50vw', height: '50vw', right: '-16vw', top: '30%', animationDelay: '-5s' }} /><i className="glow-y" style={{ width: '40vw', height: '40vw', left: '20vw', bottom: '-10vw' }} /></div>
      <div className="relative mx-auto max-w-[1320px] px-5 md:px-12">
        <h2 id="pracH" className="d-l max-w-[16ch]">Everything you’d <i className="gold-text">ask first.</i></h2>

        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:grid-rows-[minmax(240px,auto)_minmax(240px,auto)] md:gap-4">
          {/* areas: chips + a little map */}
          <div className="tile relative overflow-hidden p-6 md:col-span-2 md:row-span-2 md:p-8">
            <p className="font-display text-[clamp(32px,3.2vw,46px)] font-[800] uppercase leading-[.95]">Based in North Wales.<br /><span className="gold-text">Working across the border.</span></p>
            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Areas covered">
              {site.areas.map((a) => (
                <button key={a} onClick={() => setArea(a)} aria-pressed={area === a} className="chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>{a}
                </button>
              ))}
            </div>
            <svg viewBox="0 0 400 260" className="mt-6 w-full" aria-hidden>
              <defs><pattern id="pdots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="rgba(47,211,217,.16)" /></pattern></defs>
              <rect width="400" height="260" fill="url(#pdots)" />
              {Object.entries(TOWNS).map(([n, c]) => { const [x, y] = xy(c); const h = n === 'Wrexham'; const on = n === area; return (
                <g key={n}>
                  {!h && <line x1={home[0]} y1={home[1]} x2={x} y2={y} stroke={on ? '#2FD3D9' : 'rgba(47,211,217,.35)'} strokeWidth={on ? 2 : 1.2} strokeDasharray="3 4" className={on ? 'pe-dash' : ''} />}
                  {(h || on) && <circle cx={x} cy={y} r="9" fill="none" stroke={h ? '#F3B31E' : '#2FD3D9'} strokeWidth="1.5" className="pe-ping" />}
                  <circle cx={x} cy={y} r={h || on ? 5.5 : 3.5} fill={h ? '#F3B31E' : on ? '#2FD3D9' : 'rgba(244,239,230,.7)'} />
                  <text x={x + 10} y={y + 4} fontSize="12" fill={h || on ? '#F4EFE6' : 'rgba(244,239,230,.6)'} fontFamily="var(--font-body)">{n}</text>
                </g>); })}
            </svg>
            <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>{area === 'Wrexham' ? 'Home turf.' : `Yes, ${site.company} covers ${area}.`} Not sure about your postcode? Ask {site.owner.first}.</p>
          </div>

          {/* free survey */}
          <div className="molten-bg relative flex flex-col justify-between overflow-hidden rounded-[var(--r)] p-6 md:p-7" style={{ boxShadow: '0 40px 70px -34px rgba(240,122,62,.6), inset 0 1px 0 rgba(255,255,255,.5)' }}>
            <span aria-hidden className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(47,211,217,.5), transparent)' }} />
            <p className="relative font-display text-[76px] font-[900] uppercase leading-none slant">Free</p>
            <div className="relative">
              <p className="font-display text-[27px] font-[700] uppercase leading-none">no-obligation quote</p>
              <p className="mut mt-1.5 text-[14px] leading-snug">From his website: a free, no-obligation site survey and a tailored quotation.</p>
            </div>
          </div>

          {/* permeable */}
          <div className="tile relative flex flex-col justify-end overflow-hidden p-6 md:p-7">
            <img src={photoSrc('drive-wall', 640)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,10,13,.1), rgba(6,16,20,.94) 75%)' }} />
            <div className="relative">
              <p className="font-display text-[27px] font-[700] uppercase leading-none">Rain drains through</p>
              <p className="mt-1.5 text-[14px] leading-snug" style={{ color: 'var(--muted)' }}>His FAQ: resin bound is fully permeable and SuDS compliant, usually no planning permission needed.</p>
            </div>
          </div>

          {/* services */}
          <div className="tile p-6 md:col-span-2 md:p-7">
            <p className="font-display text-[27px] font-[700] uppercase leading-none">What {site.company} lays</p>
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
              {services.map((s) => <li key={s} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13.5px]" style={{ background: 'rgba(214,240,245,.05)', boxShadow: 'inset 0 0 0 1px rgba(214,240,245,.10)' }}><i className="dot-aq !h-1.5 !w-1.5" />{s}</li>)}
            </ul>
          </div>
        </div>

        {/* how it works */}
        <div className="mt-16 md:mt-24">
          <h3 className="d-m">From first message to first drive on it.</h3>
          <ol className="mt-8 grid gap-3 md:grid-cols-4 md:gap-4">
            {process.map((st, i) => (
              <li key={st.title} className="tile flex flex-col gap-3 p-6 md:min-h-[220px] md:p-7">
                <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[18px] font-[800]" style={i === 0 ? { background: 'var(--molten)', color: '#1A0C02', boxShadow: '0 8px 20px -8px rgba(240,122,62,.9)' } : { color: 'var(--aq)', boxShadow: 'inset 0 0 0 1px rgba(47,211,217,.45)', background: 'rgba(47,211,217,.08)' }}>{i + 1}</span>
                <p className="font-display text-[26px] font-[700] uppercase leading-none">{st.title}</p>
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
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-[22px] font-[700] md:text-[26px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[18px] transition-transform duration-300" style={{ background: open === i ? 'var(--molten)' : 'rgba(47,211,217,.10)', color: open === i ? '#1A0C02' : 'var(--aq)', transform: open === i ? 'rotate(45deg)' : 'none' }} aria-hidden>+</span>
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
