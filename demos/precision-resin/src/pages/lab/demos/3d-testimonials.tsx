import { ThreeDTestimonials } from '@/components/library/3d-testimonials/ThreeDTestimonials';
import { reviewItems } from '../review-demo-data';
// Example reviews only. Hover a column to pause it.
export default function ThreeDDemo() {
  const reviews = reviewItems.map((r) => ({ name: r.name, meta: r.role, body: r.quote, source: r.source }));
  return (
    <div>
      <ThreeDTestimonials reviews={reviews} height={360} />
      <p className="mt-1 text-center text-[11px]" style={{ color: 'var(--muted)' }}>Example reviews: layout only</p>
    </div>
  );
}
