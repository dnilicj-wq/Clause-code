// Port of Hover Footer (21st.dev @mdafsarx). TextHoverEffect + FooterBackgroundGradient are faithful to the
// catalogue copy (stroke draw-on, radial mask that follows the cursor, gradient stroke under the mask).
// The catalogue file holds only those two pieces; the footer layout is rebuilt from the component's demo
// (rounded panel, 4 columns, divider, bottom bar, giant hover wordmark). Re-skinned: gradient stops are the
// preset metal ramp + accents, unique SVG ids (useId), display font. Touch: the mask follows taps/drags,
// and the draw-on stroke still runs, so phones see it too. Reduced motion: no draw-on.
import { useRef, useEffect, useState, useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import type { FooterData } from '../large-name-footer/footer-data';

export const TextHoverEffect = ({ text, duration, className }: { text: string; duration?: number; automatic?: boolean; className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' });
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const g = `tg${uid}`, rm = `rm${uid}`, tm = `tm${uid}`;
  // Long names would overflow the 300-wide viewBox: shrink the glyphs to fit (original sized for ~5 letters).
  const fs = Math.min(72, Math.round(400 / Math.max(1, text.length)));

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const r = svgRef.current.getBoundingClientRect();
      setMaskPosition({ cx: `${((cursor.x - r.left) / r.width) * 100}%`, cy: `${((cursor.y - r.top) / r.height) * 100}%` });
    }
  }, [cursor]);

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      onTouchStart={(e) => { setHovered(true); setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY }); }}
      onTouchMove={(e) => setCursor({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={() => setHovered(false)}
      className={cn('cursor-pointer select-none uppercase', className)}>
      <defs>
        <linearGradient id={g} gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (<>
            <stop offset="0%" stopColor="var(--metal2)" />
            <stop offset="25%" stopColor="var(--accent2)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="75%" stopColor="var(--metal1)" />
            <stop offset="100%" stopColor="var(--metal2)" />
          </>)}
        </linearGradient>
        <motion.radialGradient id={rm} gradientUnits="userSpaceOnUse" r="20%" initial={{ cx: '50%', cy: '50%' }} animate={maskPosition} transition={{ duration: duration ?? 0, ease: 'easeOut' }}>
          <stop offset="0%" stopColor="white" /><stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={tm}><rect x="0" y="0" width="100%" height="100%" fill={`url(#${rm})`} /></mask>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent font-bold"
        style={{ fontSize: fs, opacity: hovered ? 0.7 : 0, stroke: 'color-mix(in srgb, var(--ink) 18%, transparent)', fontFamily: 'var(--font-display)' }}>{text}</text>
      <motion.text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent font-bold"
        style={{ fontSize: fs, stroke: 'color-mix(in srgb, var(--accent) 70%, transparent)', fontFamily: 'var(--font-display)' }}
        initial={reduce ? false : { strokeDashoffset: 1000, strokeDasharray: 1000 }} animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: 'easeInOut' }}>{text}</motion.text>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" stroke={`url(#${g})`} strokeWidth="0.3" mask={`url(#${tm})`}
        className="fill-transparent font-bold" style={{ fontSize: fs, fontFamily: 'var(--font-display)' }}>{text}</text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => (
  <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(125% 125% at 50% 10%, color-mix(in srgb, var(--bg2) 40%, transparent) 50%, color-mix(in srgb, var(--accent) 20%, transparent) 100%)' }} />
);

export function HoverFooter({ data, wordmark, className }: { data: FooterData; wordmark?: string; className?: string }) {
  const contact = [
    { icon: Phone, label: data.phone, href: data.tel },
    { icon: MessageCircle, label: 'WhatsApp us', href: data.whatsapp },
    { icon: Clock, label: data.hours },
    { icon: MapPin, label: `${data.town}, ${data.region}` },
  ];
  return (
    <footer className={cn('relative m-3 h-fit overflow-hidden rounded-3xl md:m-8', className)} style={{ background: 'color-mix(in srgb, var(--bg2) 70%, transparent)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="@container relative z-40 mx-auto max-w-7xl p-8 md:p-14">
        <div className="grid grid-cols-1 gap-10 pb-10 @md:grid-cols-2 @md:gap-8 @4xl:grid-cols-4 @4xl:gap-16">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2"><span className="text-[22px]" style={{ color: 'var(--accent)' }}>◆</span><span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{data.company}</span></div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{data.tagline} across {data.town} and {data.region}. Price shown before you give us your details.</p>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-semibold">Services</h4>
            <ul className="space-y-3 text-sm">{data.services.slice(0, 5).map((s) => <li key={s}><a href="#services" className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">{s}</a></li>)}</ul>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-semibold">Helpful links</h4>
            <ul className="space-y-3 text-sm">
              {[['Prices', '#price'], ['Finishes', '#gallery'], ['How it works', '#layers'], ['FAQ', '#faq']].map(([l, h]) => <li key={l}><a href={h} className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">{l}</a></li>)}
              <li><span className="relative inline-block"><a href={data.whatsapp} className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">Quick reply</a><span className="absolute top-0 right-[-10px] h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none" style={{ background: 'var(--accent)' }} /></span></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-semibold">Contact</h4>
            <ul className="space-y-4 text-sm">
              {contact.map((c, i) => (
                <li key={i} className="flex items-center space-x-3"><c.icon size={18} style={{ color: 'var(--accent)' }} />
                  {c.href ? <a href={c.href} className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]">{c.label}</a> : <span style={{ color: 'var(--muted)' }}>{c.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="my-8" style={{ borderColor: 'var(--line)' }} />
        <div className="flex flex-col items-center justify-between gap-3 text-sm @3xl:flex-row" style={{ color: 'var(--muted)' }}>
          <div className="flex gap-5">{data.socials.map((s) => <a key={s.label} href={s.href} className="hover:text-[var(--accent)]">{s.label}</a>)}{!data.socials.length && <span>{data.areas.slice(0, 4).join(' · ')}</span>}</div>
          <p className="text-center @3xl:text-left">© {data.year} {data.company}. All rights reserved.{data.demoNote ? ` ${data.demoNote}` : ''}</p>
        </div>
      </div>
      <div className="-mt-6 -mb-6 flex h-[8rem] md:-mt-12 md:-mb-10 md:h-[14rem] lg:-mt-16 lg:-mb-14 lg:h-[20rem]">
        <TextHoverEffect text={wordmark ?? data.shortName} className="z-50" />
      </div>
      <FooterBackgroundGradient />
    </footer>
  );
}
