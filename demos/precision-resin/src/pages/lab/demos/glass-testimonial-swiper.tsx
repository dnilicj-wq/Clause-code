import { ExternalLink, MapPin } from 'lucide-react';
import { TestimonialStack } from '@/components/library/glass-testimonial-swiper/GlassTestimonialSwiper';
import { site } from '@/config/site';
// Example reviews only. Drag the front card, or tap a dot. Glass sits over a rendered example finish.
export default function GlassSwiperDemo() {
  const t = site.reviews.map((r, i) => ({
    id: i,
    initials: r.source === 'Example' ? 'EX' : r.name.split(' ').map((w) => w[0]).join('').slice(0, 2),
    name: r.source === 'Example' ? `${r.name} (example)` : r.name,
    role: [r.job, r.town].filter(Boolean).join(' · '),
    quote: r.text,
    tags: [{ text: r.job?.split(',')[0] ?? 'Floor', type: 'featured' as const }, { text: r.town ?? '', type: 'default' as const }],
    stats: [{ icon: MapPin, text: r.town ?? '' }, { icon: ExternalLink, text: r.source === 'Example' ? 'Example review' : `${r.source} review` }],
    avatarGradient: 'linear-gradient(135deg, var(--accent2), var(--accent))',
  }));
  return (
    <div className="relative -m-5 overflow-hidden p-6 pt-14 md:p-10 md:pt-16">
      <img src="/demo/look-copper-metallic-v2.webp" alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg) 92%)' }} />
      <div className="relative mx-auto max-w-[560px]"><TestimonialStack testimonials={t} autoplay={5000} /></div>
    </div>
  );
}
