import { useEffect, useState } from 'react';
import { MasonryGrid, ImageTestimonialCard } from '@/components/library/image-testimonial-grid/ImageTestimonialGrid';
import { reviewItems, repeatTo } from '../review-demo-data';
const caps = ['Double garage, graphite flake', 'Kitchen, copper metallic', 'Workshop, pearl metallic', 'Showroom, storm grey solid', 'Utility, midnight metallic', 'Porch, quartz sand'];
const looks = ['graphite-flake', 'copper-metallic', 'pearl-metallic', 'storm-solid', 'midnight-metallic', 'quartz-sand'];
// Job photo + review per card. Example renders and example reviews only, both labelled.
export default function ImageGridDemo() {
  const [cols, setCols] = useState(2);
  useEffect(() => { const f = () => setCols(innerWidth >= 900 ? 3 : innerWidth >= 560 ? 2 : 1); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const items = repeatTo(reviewItems, 6).map((r, i) => ({ img: `/demo/look-${looks[i]}-v2.webp`, name: r.name, caption: caps[i], quote: r.quote, tag: 'Example image', tall: i % 3 === 0 }));
  return (
    <div className="max-h-[560px] overflow-y-auto pr-1">
      <MasonryGrid columns={cols} gap={4}>
        {items.map((t, i) => <ImageTestimonialCard key={i} t={t} />)}
      </MasonryGrid>
    </div>
  );
}
