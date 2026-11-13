// Image Testimonial Grid — port of 21st.dev/@ravikatiyar162/components/image-testimonial-grid (catalogue copy).
// The catalogue file is the MasonryGrid (CSS columns + per-item whileInView rise), kept as is. The card is rebuilt from
// the demo preview: full-bleed photo, top gradient, avatar + name, one-line caption. Here: a job photo + its review.
// Needs real job photos AND real reviews; the lab demo uses labelled example renders only.
import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/cn';

interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns to display.
   * @default 3
   */
  columns?: number;
  /**
   * The gap between items in the grid, corresponding to Tailwind's spacing scale.
   * @default 4
   */
  gap?: number;
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 4, children, ...props }, ref) => {
    // Dynamically create the style object for column layout
    const style = {
      columnCount: columns,
      columnGap: `${gap * 0.25}rem`, // Converts gap unit to rem
    };

    // Animation variants for child elements
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut" as const,
        },
      },
    };

    return (
      <div ref={ref} style={style} className={cn('w-full', className)} {...props}>
        {React.Children.map(children, (child) => (
          <motion.div
            className="mb-4 break-inside-avoid" // Prevents items from breaking across columns
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Animate when 20% of the item is visible
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }
);

MasonryGrid.displayName = 'MasonryGrid';

export { MasonryGrid };

export type ImageTestimonial = { img: string; name: string; caption: string; quote?: string; tag?: string; tall?: boolean };
export function ImageTestimonialCard({ t }: { t: ImageTestimonial }) {
  const initials = t.name.replace(/\(.*?\)/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <figure className="group relative overflow-hidden rounded-[calc(var(--radius)*.8)]" style={{ aspectRatio: t.tall ? '3 / 4' : '4 / 3.6' }}>
      <img src={t.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.78), rgba(0,0,0,.35) 42%, rgba(0,0,0,.05) 62%, rgba(0,0,0,.35))' }} />
      <figcaption className="relative p-4 text-white [text-shadow:0_1px_10px_rgba(0,0,0,.85)]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white/80 text-[11px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{initials}</span>
          <span className="text-[15px] font-semibold">{t.name}</span>
        </div>
        <p className="mt-2.5 text-[14.5px] font-medium leading-snug">{t.caption}</p>
        {t.quote && <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-snug text-white/80">"{t.quote}"</p>}
      </figcaption>
      {t.tag && <span className="ex-tag bottom-3 right-3">{t.tag}</span>}
    </figure>
  );
}
export default MasonryGrid;
