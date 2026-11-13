// Lab-only: turns config/site.ts reviews into the shapes the review components take.
// In the master these are the labelled EXAMPLE reviews; a lead build swaps in real ones (word for word, with source).
import { site } from '@/config/site';

const looks = ['graphite-flake', 'copper-metallic', 'pearl-metallic', 'storm-solid', 'midnight-metallic', 'quartz-sand'];
export const reviewItems = site.reviews.map((r, i) => ({
  quote: r.text,
  name: r.source === 'Example' ? `${r.name} (example)` : r.name,
  role: [r.job, r.town].filter(Boolean).join(' · '),
  source: r.source === 'Example' ? 'Example review' : `${r.source} review`,
  img: `/demo/look-${looks[i % looks.length]}-v2.webp`,
}));
// Some layouts need more cards than there are reviews: repeat them (keys stay unique).
export const repeatTo = <T,>(list: T[], n: number) => Array.from({ length: n }, (_, i) => list[i % list.length]);
