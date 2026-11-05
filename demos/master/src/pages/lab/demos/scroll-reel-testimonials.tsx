import { ScrollReelTestimonials } from '@/components/library/scroll-reel-testimonials/ScrollReelTestimonials';
import { reviewItems } from '../review-demo-data';
// Example reviews; portrait tiles are rendered example finishes (never stock faces).
export default function ScrollReelDemo() {
  const t = reviewItems.map((r) => ({ quote: r.quote, author: `${r.name} · ${r.role}`, image: r.img }));
  return <div className="flex justify-center"><ScrollReelTestimonials testimonials={t} autoplay={5200} className="md:min-h-[360px]" /></div>;
}
