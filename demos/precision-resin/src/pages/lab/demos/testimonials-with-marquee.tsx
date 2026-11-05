import { TestimonialsSection } from '@/components/library/testimonials-with-marquee/TestimonialsWithMarquee';
import { reviewItems } from '../review-demo-data';
// Example reviews only; "handle" shows where a real review was posted.
export default function MarqueeTestimonialsDemo() {
  const t = reviewItems.map((r) => ({ author: { name: r.name, handle: `${r.role} · ${r.source}` }, text: r.quote }));
  return (
    <div className="-mx-5 -my-5">
      <TestimonialsSection className="!py-10 sm:!py-12 [&_h2]:sm:!text-4xl" title="What customers say after" description="Example reviews. Real ones go here word for word, each linked to where it was posted." testimonials={t} />
    </div>
  );
}
