// Testimonials with Marquee — port of 21st.dev/@serafimcloud/components/testimonials-with-marquee (catalogue copy,
// + its companion testimonial-card). Structure and motion unchanged: centred title/description, one marquee track
// (4 repeats, --duration 40s, pause on hover), gradient edge fades, cards with avatar, name, handle and text.
// Changes: shadcn Avatar → a plain round avatar (image or monogram), muted/foreground tokens → preset tokens.
// Real reviews only; `handle` should name where the review was posted.
import { cn } from '@/src/lib/cn';

export interface TestimonialAuthor { name: string; handle: string; avatar?: string }
export interface TestimonialCardProps { author: TestimonialAuthor; text: string; href?: string; className?: string }

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const Card: any = href ? 'a' : 'div';
  const initials = author.name.replace(/\(.*?\)/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <Card {...(href ? { href, target: '_blank', rel: 'noreferrer' } : {})}
      className={cn('flex flex-col rounded-lg border-t border-[var(--line)]',
        'bg-gradient-to-b from-[color-mix(in_srgb,var(--surface)_70%,transparent)] to-[color-mix(in_srgb,var(--surface)_15%,transparent)]',
        'p-4 text-start sm:p-6',
        'hover:from-[color-mix(in_srgb,var(--surface)_90%,transparent)] hover:to-[color-mix(in_srgb,var(--surface)_30%,transparent)]',
        'max-w-[320px] sm:max-w-[320px]', 'transition-colors duration-300', className)}>
      <div className="flex items-center gap-3">
        <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full">
          {author.avatar ? <img src={author.avatar} alt={author.name} className="aspect-square h-full w-full object-cover" />
            : <span className="grid h-full w-full place-items-center text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{initials}</span>}
        </span>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none text-[var(--ink)]">{author.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{author.handle}</p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-[var(--muted)]">{text}</p>
    </Card>
  );
}

interface TestimonialsSectionProps {
  title: React.ReactNode; description: React.ReactNode;
  testimonials: Array<{ author: TestimonialAuthor; text: string; href?: string }>;
  className?: string;
}

export function TestimonialsSection({ title, description, testimonials, className }: TestimonialsSectionProps) {
  return (
    <section className={cn('bg-[var(--bg)] text-[var(--ink)]', 'py-12 sm:py-24 md:py-32 px-0', className)}>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 text-center sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] font-display text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">{title}</h2>
          <p className="text-md max-w-[600px] font-medium text-[var(--muted)] sm:text-xl">{description}</p>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
              {[...Array(4)].map((_, setIndex) => testimonials.map((t, i) => <TestimonialCard key={`${setIndex}-${i}`} {...t} />))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-[var(--bg)] sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-[var(--bg)] sm:block" />
        </div>
      </div>
    </section>
  );
}
export default TestimonialsSection;
