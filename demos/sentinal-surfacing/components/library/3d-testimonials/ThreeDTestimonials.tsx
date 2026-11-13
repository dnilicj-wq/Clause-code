// 3D Testimonials — port of 21st.dev/@reui/components/3d-testimonails (catalogue copy, MIT; author sean0205).
// The catalogue file is the Marquee primitive (kept verbatim below as Marquee3D: repeat, vertical, reverse, pauseOnHover,
// --duration/--gap, ARIA). The 3D layout is the standard demo it ships with: four vertical marquees, alternating
// direction, inside a perspective container rotated on X/Y/Z, with edge fades. Re-skinned to preset tokens;
// cards take real reviews as props (monogram instead of stock avatars). Reduced motion: marquees stop.
import React, { ComponentPropsWithoutRef, useRef } from 'react';
import { cn } from '@/src/lib/cn';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
  /**
   * If true, automatically repeats children enough to fill the visible area
   */
  autoFill?: boolean;
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  /**
   * ARIA live region politeness
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  /**
   * ARIA role
   */
  ariaRole?: string;
}

function Marquee3D({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ariaLabel,
  ariaLive = 'off',
  ariaRole = 'marquee',
  ...props
}: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      ref={marqueeRef}
      data-slot="marquee"
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className,
      )}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaRole}
      tabIndex={0}
    >
      {React.useMemo(
        () => (
          <>
            {Array.from({ length: repeat }, (_, i) => (
              <div
                key={i}
                className={cn(
                  !vertical ? 'flex-row [gap:var(--gap)]' : 'flex-col [gap:var(--gap)]',
                  'flex shrink-0 justify-around',
                  !vertical && 'animate-marquee flex-row',
                  vertical && 'animate-marquee-vertical flex-col',
                  pauseOnHover && 'group-hover:[animation-play-state:paused]',
                  reverse && '[animation-direction:reverse]',
                )}
              >
                {children}
              </div>
            ))}
          </>
        ),
        [repeat, children, vertical, pauseOnHover, reverse],
      )}
    </div>
  );
}


export type Review3D = { name: string; meta: string; body: string; source?: string };

function ReviewCard({ r }: { r: Review3D }) {
  const initials = r.name.replace(/\(.*?\)/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <figure className="relative w-56 cursor-pointer overflow-hidden rounded-xl border p-4 transition-colors"
      style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--surface) 92%, transparent)' }}>
      <div className="flex flex-row items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{initials}</span>
        <div className="flex min-w-0 flex-col">
          <figcaption className="truncate text-sm font-medium" style={{ color: 'var(--ink)' }}>{r.name}</figcaption>
          <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>{r.meta}</p>
        </div>
      </div>
      <blockquote className="mt-2.5 text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>{r.body}</blockquote>
      {r.source && <p className="mt-2 text-[10.5px] uppercase tracking-[.1em]" style={{ color: 'var(--accent)' }}>{r.source}</p>}
    </figure>
  );
}

export function ThreeDTestimonials({ reviews, height = 384, className }: { reviews: Review3D[]; height?: number; className?: string }) {
  const cols = [0, 1, 2, 3].map((c) => reviews.map((_, i) => reviews[(i + c) % reviews.length]));
  return (
    <div className={cn('relative flex w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px] motion-reduce:[&_.animate-marquee-vertical]:![animation:none]', className)} style={{ height }}>
      <div className="flex flex-row items-center gap-4"
        style={{ transform: 'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)' }}>
        {cols.map((list, c) => (
          <Marquee3D key={c} vertical pauseOnHover reverse={c % 2 === 1} repeat={3} className="[--duration:20s]">
            {list.map((r, i) => <ReviewCard key={i} r={r} />)}
          </Marquee3D>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4" style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4" style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4" style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4" style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />
    </div>
  );
}
export default ThreeDTestimonials;
