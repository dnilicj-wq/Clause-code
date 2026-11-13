// Glass Testimonial Swiper — port of 21st.dev/@easemize/components/glass-testimonial-swiper (catalogue copy).
// Unchanged: deck maths (scale/translate/opacity per depth), mouse+touch drag with 50px commit, window listeners, dots.
// Re-skinned to preset tokens; the demo stylesheet (not in the copy) rebuilt as STACK_CSS; optional autoplay (pauses on hover/drag).
// Real reviews only. `stats` must be true for that review (no invented "Verified" badges).
import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';

// --- Component Interfaces ---
export interface Testimonial {
  id: string | number;
  initials: string;
  name: string;
  role: string;
  quote: string;
  tags: { text: string; type: 'featured' | 'default' }[];
  stats: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; text: string; }[];
  avatarGradient: string;
}

export interface TestimonialStackProps {
  testimonials: Testimonial[];
  /** How many cards to show behind the main card */
  visibleBehind?: number;
}


// The catalogue file references global classes from its demo stylesheet (not in the copy). Rebuilt to match the
// preview: all cards share one grid cell, eased transforms, frosted glass, dot pagination with an active pill.
const STACK_CSS = `
.testimonials-stack { display: grid; }
.testimonials-stack .testimonial-card { grid-area: 1 / 1; cursor: grab; user-select: none; border-radius: var(--radius);
  transform-origin: top center; transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .45s ease; }
.testimonials-stack .testimonial-card.is-dragging { transition: none; cursor: grabbing; }
.testimonials-stack .glass-effect { background: color-mix(in srgb, var(--surface) 58%, transparent);
  border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); box-shadow: 0 24px 60px -20px rgba(0,0,0,.45), inset 0 1px 0 color-mix(in srgb, white 10%, transparent); }
.testimonials-stack .pagination-dot { width: 8px; height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 25%, transparent); transition: all .3s; }
.testimonials-stack .pagination-dot.active { width: 22px; background: var(--accent); }
@media (prefers-reduced-motion: reduce) { .testimonials-stack .testimonial-card { transition: opacity .2s; } }
`;
// --- The Component ---
export const TestimonialStack = ({ testimonials, visibleBehind = 2, autoplay = 0 }: TestimonialStackProps & { autoplay?: number }) => {
  const [hover, setHover] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartRef = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const totalCards = testimonials.length;

  const navigate = useCallback((newIndex: number) => {
    setActiveIndex((newIndex + totalCards) % totalCards);
  }, [totalCards]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (index !== activeIndex) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartRef.current = clientX;
    cardRefs.current[activeIndex]?.classList.add('is-dragging');
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - dragStartRef.current);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    cardRefs.current[activeIndex]?.classList.remove('is-dragging');
    if (Math.abs(dragOffset) > 50) {
      navigate(activeIndex + (dragOffset < 0 ? 1 : -1));
    }
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, activeIndex, navigate]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);
  
  useEffect(() => {
    if (!autoplay || hover || isDragging || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % totalCards), autoplay);
    return () => clearInterval(id);
  }, [autoplay, hover, isDragging, totalCards]);

  if (!testimonials?.length) return null;

  return (
    <section className="testimonials-stack relative pb-10" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <style>{STACK_CSS}</style>
      {testimonials.map((testimonial, index) => {
        const isActive = index === activeIndex;
        // Calculate the card's position in the display order
        const displayOrder = (index - activeIndex + totalCards) % totalCards;

        // --- DYNAMIC STYLE CALCULATION ---
        const style: CSSProperties = {};
        if (displayOrder === 0) { // The active card
          style.transform = `translateX(${dragOffset}px)`;
          style.opacity = 1;
          style.zIndex = totalCards;
        } else if (displayOrder <= visibleBehind) { // Cards stacked behind
          const scale = 1 - 0.05 * displayOrder;
          const translateY = -2 * displayOrder; // in rem
          style.transform = `scale(${scale}) translateY(${translateY}rem)`;
          style.opacity = 1 - 0.2 * displayOrder;
          style.zIndex = totalCards - displayOrder;
        } else { // Cards that are out of view
          style.transform = 'scale(0)';
          style.opacity = 0;
          style.zIndex = 0;
        }

        const tagClasses = (type: 'featured' | 'default') => type === 'featured'
          ? 'bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)]'
          : 'bg-[var(--bg2)] text-[var(--ink)]';
          
        return (
          <div
            ref={(el) => { cardRefs.current[index] = el; }}
            key={testimonial.id}
            className="testimonial-card glass-effect backdrop-blur-xl"
            style={style} // Apply dynamic styles here
            onMouseDown={(e) => handleDragStart(e, index)}
            onTouchStart={(e) => handleDragStart(e, index)}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-[var(--accent-ink)] font-semibold text-base" style={{ background: testimonial.avatarGradient }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <h3 className="text-[var(--ink)] font-medium text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">{testimonial.role}</p>
                  </div>
                </div>
              </div>
              
              <blockquote className="text-[color-mix(in_srgb,var(--ink)_90%,transparent)] leading-relaxed text-lg mb-6">"{testimonial.quote}"</blockquote>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-[var(--line)] pt-4 gap-4">
                <div className="flex flex-wrap gap-2">
                  {testimonial.tags.map((tag, i) => (
                    <span key={i} className={['text-xs', 'px-2', 'py-1', 'rounded-md', tagClasses(tag.type)].join(' ')}>
                      {tag.text}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                  {testimonial.stats.map((stat, i) => {
                    const IconComponent = stat.icon;
                    return (
                      <span key={i} className="flex items-center">
                        <IconComponent className="mr-1.5 h-3.5 w-3.5" />
                        {stat.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="pagination flex gap-2 justify-center absolute bottom-0 left-0 right-0">
        {testimonials.map((_, index) => (
          <button key={index} aria-label={`Go to testimonial ${index + 1}`} onClick={() => navigate(index)} className={`pagination-dot ${activeIndex === index ? 'active' : ''}`} />
        ))}
      </div>
    </section>
  );
};
export default TestimonialStack;
