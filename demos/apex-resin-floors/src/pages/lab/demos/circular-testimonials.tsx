import { CircularTestimonials } from '@/components/library/circular-testimonials/CircularTestimonials';
import { reviewItems } from '../review-demo-data';
// Example reviews only. Photos are rendered example finishes, never customer or owner photos.
export default function CircularDemo() {
  const t = reviewItems.map((r) => ({ quote: r.quote, name: r.name, designation: `${r.role} · ${r.source}`, src: r.img }));
  return (
    <div className="flex justify-center [&_.image-container]:max-md:!h-64 [&_.testimonial-grid]:max-md:!gap-10">
      <CircularTestimonials testimonials={t} autoplay />
    </div>
  );
}
