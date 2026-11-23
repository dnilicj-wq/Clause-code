// Port of Motion Footer / "CinematicFooter" (21st.dev @easemize; the brief's @jahed copy is not in the catalogue,
// this is the catalogue's motion-footer). Faithful: curtain reveal (clip-path wrapper + fixed footer underneath),
// GSAP ScrollTrigger parallax on the giant wordmark, staggered heading/links, tilted glass marquee, breathing
// aurora, grid, magnetic glass pills, back-to-top. Re-skinned: shadcn tokens → preset tokens, Plus Jakarta →
// preset fonts, app-store pills → Call / WhatsApp / price, heart badge → demo credit.
// `contained`: runs inside a box (lab card) — a transform on the wrapper makes it the fixed footer's frame, and
// the scroll animations show their end state. Reduced motion / touch: no magnetic, marquee or breathing.
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/src/lib/cn';
import type { FooterData } from '../large-name-footer/footer-data';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const STYLES = `
.cinematic-footer-wrapper{font-family:var(--font-body);-webkit-font-smoothing:antialiased;container-type:inline-size;
--pill-bg-1:color-mix(in oklch,var(--ink) 3%,transparent);--pill-bg-2:color-mix(in oklch,var(--ink) 1%,transparent);
--pill-shadow:color-mix(in oklch,var(--bg) 50%,transparent);--pill-highlight:color-mix(in oklch,var(--ink) 10%,transparent);
--pill-inset-shadow:color-mix(in oklch,var(--bg) 80%,transparent);--pill-border:color-mix(in oklch,var(--ink) 8%,transparent);
--pill-bg-1-hover:color-mix(in oklch,var(--ink) 8%,transparent);--pill-bg-2-hover:color-mix(in oklch,var(--ink) 2%,transparent);
--pill-border-hover:color-mix(in oklch,var(--ink) 20%,transparent);--pill-shadow-hover:color-mix(in oklch,var(--bg) 70%,transparent);
--pill-highlight-hover:color-mix(in oklch,var(--ink) 20%,transparent)}
@keyframes footer-breathe{0%{transform:translate(-50%,-50%) scale(1);opacity:.6}100%{transform:translate(-50%,-50%) scale(1.1);opacity:1}}
@keyframes footer-scroll-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes footer-heartbeat{0%,100%{transform:scale(1)}15%,45%{transform:scale(1.2)}30%{transform:scale(1)}}
.animate-footer-breathe{animation:footer-breathe 8s ease-in-out infinite alternate}
.animate-footer-scroll-marquee{animation:footer-scroll-marquee 40s linear infinite}
.animate-footer-heartbeat{animation:footer-heartbeat 2s cubic-bezier(.25,1,.5,1) infinite;display:inline-block}
@media (prefers-reduced-motion:reduce){.animate-footer-breathe,.animate-footer-scroll-marquee,.animate-footer-heartbeat{animation:none}}
.footer-bg-grid{background-size:60px 60px;background-image:linear-gradient(to right,color-mix(in oklch,var(--ink) 3%,transparent) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in oklch,var(--ink) 3%,transparent) 1px,transparent 1px);mask-image:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent);-webkit-mask-image:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)}
.footer-aurora{background:radial-gradient(circle at 50% 50%,color-mix(in oklch,var(--accent) 15%,transparent) 0%,color-mix(in oklch,var(--accent2) 15%,transparent) 40%,transparent 70%)}
.footer-glass-pill{background:linear-gradient(145deg,var(--pill-bg-1) 0%,var(--pill-bg-2) 100%);box-shadow:0 10px 30px -10px var(--pill-shadow),inset 0 1px 1px var(--pill-highlight),inset 0 -1px 2px var(--pill-inset-shadow);border:1px solid var(--pill-border);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:all .4s cubic-bezier(.16,1,.3,1)}
.footer-glass-pill:hover{background:linear-gradient(145deg,var(--pill-bg-1-hover) 0%,var(--pill-bg-2-hover) 100%);border-color:var(--pill-border-hover);box-shadow:0 20px 40px -10px var(--pill-shadow-hover),inset 0 1px 1px var(--pill-highlight-hover);color:var(--ink)}
.footer-giant-bg-text{font-family:var(--font-display);font-size:26cqw;line-height:.75;font-weight:600;letter-spacing:-.05em;color:transparent;-webkit-text-stroke:1px color-mix(in oklch,var(--ink) 5%,transparent);background:linear-gradient(180deg,color-mix(in oklch,var(--ink) 10%,transparent) 0%,transparent 60%);-webkit-background-clip:text;background-clip:text}
.footer-text-glow{font-family:var(--font-display);background:linear-gradient(180deg,var(--ink) 0%,color-mix(in oklch,var(--ink) 40%,transparent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 20px color-mix(in oklch,var(--ink) 15%,transparent))}
`;

type MagneticProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: React.ElementType };
const MagneticButton = React.forwardRef<HTMLElement, MagneticProps>(({ className, children, as: Component = 'button', ...props }, fwd) => {
  const local = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = local.current; if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
    const ctx = gsap.context(() => {
      const mm = (e: MouseEvent) => {
        const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2; const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * 0.4, y: y * 0.4, rotationX: -y * 0.15, rotationY: x * 0.15, scale: 1.05, ease: 'power2.out', duration: 0.4 });
      };
      const ml = () => gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: 'elastic.out(1, 0.3)', duration: 1.2 });
      el.addEventListener('mousemove', mm); el.addEventListener('mouseleave', ml);
      return () => { el.removeEventListener('mousemove', mm); el.removeEventListener('mouseleave', ml); };
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <Component ref={(n: HTMLElement) => { (local as any).current = n; if (typeof fwd === 'function') fwd(n); else if (fwd) (fwd as any).current = n; }} className={cn('cursor-pointer', className)} {...props}>
      {children}
    </Component>
  );
});
MagneticButton.displayName = 'MagneticButton';

const MarqueeItem = ({ items }: { items: string[] }) => (
  <div className="flex items-center space-x-12 px-6">
    {items.map((s, i) => <React.Fragment key={i}><span>{s}</span><span style={{ color: i % 2 ? 'color-mix(in srgb, var(--accent2) 60%, transparent)' : 'color-mix(in srgb, var(--accent) 60%, transparent)' }}>✦</span></React.Fragment>)}
  </div>
);

export function MotionFooter({ data, wordmark, heading = 'Ready for a floor like this?', contained = false, className }: {
  data: FooterData; wordmark?: string; heading?: string; contained?: boolean; className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || contained || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(giantTextRef.current, { y: '10vh', scale: 0.8, opacity: 0 }, { y: '0vh', scale: 1, opacity: 1, ease: 'power1.out', scrollTrigger: { trigger: wrapperRef.current, start: 'top 80%', end: 'bottom bottom', scrub: 1 } });
      gsap.fromTo([headingRef.current, linksRef.current], { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: wrapperRef.current, start: 'top 40%', end: 'bottom bottom', scrub: 1 } });
    }, wrapperRef);
    return () => ctx.revert();
  }, [contained]);

  const toTop = () => { if (contained) wrapperRef.current?.closest('[data-scroll-box]')?.scrollTo({ top: 0, behavior: 'smooth' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const H = contained ? '100%' : '100vh';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={wrapperRef} className={cn('relative w-full', className)} style={{ height: H, clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)', transform: contained ? 'translateZ(0)' : undefined }}>
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex w-full flex-col justify-between overflow-hidden" style={{ height: H, background: 'var(--bg)', color: 'var(--ink)' }}>
          <div className="footer-aurora animate-footer-breathe pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />
          <div ref={giantTextRef} aria-hidden className="footer-giant-bg-text pointer-events-none absolute -bottom-[3%] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap uppercase">
            {wordmark ?? data.shortName}
          </div>

          <div className="absolute left-0 top-12 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y py-4 shadow-2xl backdrop-blur-md" style={{ borderColor: 'color-mix(in srgb, var(--line) 100%, transparent)', background: 'color-mix(in srgb, var(--bg) 60%, transparent)' }}>
            <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold uppercase tracking-[0.3em] md:text-sm" style={{ color: 'var(--muted)' }}>
              <MarqueeItem items={data.services} /><MarqueeItem items={data.services} />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2 ref={headingRef} className="footer-text-glow mb-10 text-center text-[clamp(36px,8cqw,96px)] font-semibold leading-[1.02] tracking-tighter">{heading}</h2>
            <div ref={linksRef} className="flex w-full flex-col items-center gap-5">
              <div className="flex w-full flex-wrap justify-center gap-3">
                <MagneticButton as="a" href={data.tel} className="footer-glass-pill flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold md:px-10 md:py-5 md:text-base">Call {data.phone}</MagneticButton>
                <MagneticButton as="a" href={data.whatsapp} className="footer-glass-pill flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold md:px-10 md:py-5 md:text-base">WhatsApp us</MagneticButton>
              </div>
              <div className="mt-1 flex w-full flex-wrap justify-center gap-2 md:gap-4">
                {[['See prices', '#price'], ['Finishes', '#gallery'], ['FAQ', '#faq']].map(([l, h]) => (
                  <MagneticButton key={l} as="a" href={h} className="footer-glass-pill rounded-full px-5 py-2.5 text-xs font-medium md:text-sm" style={{ color: 'var(--muted)' }}>{l}</MagneticButton>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-4 px-6 pb-6 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest md:order-1 md:text-xs" style={{ color: 'var(--muted)' }}>© {data.year} {data.company}</div>
            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full px-5 py-2.5 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest md:text-xs" style={{ color: 'var(--muted)' }}>{data.demoNote ? 'Demo by' : 'Floors in'}</span>
              <span className="animate-footer-heartbeat text-sm" style={{ color: 'var(--accent)' }}>◆</span>
              <span className="text-xs font-black md:text-sm">{data.demoNote ? 'Clientgateway' : data.town}</span>
            </div>
            <MagneticButton as="button" onClick={toTop} aria-label="Back to top" className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ color: 'var(--muted)' }}>
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
