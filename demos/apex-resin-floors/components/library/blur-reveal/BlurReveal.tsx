// Port of Blur Reveal (21st.dev @badtzx0; the @tom_ui variant named in the brief is not in the catalogue).
// Faithful: blur(10px) + 20% rise, once in view. Reduced motion shows the text straight away.
import * as React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';

interface BlurRevealProps { className?: string; children: React.ReactNode; delay?: number; duration?: number }

export function BlurReveal({ className, children, delay = 0, duration = 1 }: BlurRevealProps) {
  const spanRef = React.useRef<HTMLSpanElement | null>(null);
  const isInView: boolean = useInView(spanRef, { once: true });
  const reduce = useReducedMotion();
  if (reduce) return <span className={cn('inline-block', className)}>{children}</span>;
  return (
    <motion.span
      ref={spanRef}
      initial={{ opacity: 0, filter: 'blur(10px)', y: '20%' }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)', y: '0%' } : {}}
      transition={{ duration, delay }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.span>
  );
}
