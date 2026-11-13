import { StaggerTestimonials } from '@/components/library/stagger-testimonials/StaggerTestimonials';
import { reviewItems, repeatTo } from '../review-demo-data';
// Example reviews only (repeated to fill the fan). Real reviews replace these word for word.
export default function StaggerDemo() {
  const items = repeatTo(reviewItems, 7).map((r) => ({ quote: r.quote, by: `${r.name}, ${r.role}` }));
  return (
    <div className="-mx-5 -mb-5">
      <StaggerTestimonials testimonials={items} height={520} autoplay={4500} />
      <p className="py-2 text-center text-[11px]" style={{ color: 'var(--muted)' }}>Example reviews: layout only</p>
    </div>
  );
}
