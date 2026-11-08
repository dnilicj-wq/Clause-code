// Infinite Slider — port of motion-primitives' InfiniteSlider (21st.dev/@ibelick/components/infinite-slider, MIT).
// Logic unchanged (duplicated children, linear loop, eased speed change on hover).
// react-use-measure (not a direct dependency) replaced by an equivalent ResizeObserver hook.
import { useMotionValue, animate, motion, useReducedMotion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/src/lib/cn';

function useMeasure(): [(el: HTMLDivElement | null) => void, { width: number; height: number }] {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ro = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    ro.current = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.current.observe(el);
  }, []);
  return [ref, size];
}

type InfiniteSliderProps = {
  children: React.ReactNode; gap?: number; duration?: number; durationOnHover?: number;
  direction?: 'horizontal' | 'vertical'; reverse?: boolean; className?: string;
};

export function InfiniteSlider({ children, gap = 16, duration = 25, durationOnHover, direction = 'horizontal', reverse = false, className }: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let controls;
    const size = direction === 'horizontal' ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;
    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration: currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => { setIsTransitioning(false); setKey((k) => k + 1); },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear', duration: currentDuration, repeat: Infinity, repeatType: 'loop', repeatDelay: 0,
        onRepeat: () => { translation.set(from); },
      });
    }
    return controls?.stop;
  }, [key, translation, currentDuration, width, height, gap, isTransitioning, direction, reverse, reduce]);

  const hoverProps = durationOnHover
    ? { onHoverStart: () => { setIsTransitioning(true); setCurrentDuration(durationOnHover); }, onHoverEnd: () => { setIsTransitioning(true); setCurrentDuration(duration); } }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div className="flex w-max"
        style={{ ...(direction === 'horizontal' ? { x: translation } : { y: translation }), gap: `${gap}px`, flexDirection: direction === 'horizontal' ? 'row' : 'column' }}
        ref={ref} {...hoverProps}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}
export default InfiniteSlider;
