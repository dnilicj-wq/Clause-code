// Port of Magic Text (HextaUI / 21st.dev @preetsuthar17). Faithful: each word lights from 20% as you scroll.
// Added: optional `container` ref so it can run inside a scrolling box (lab card); className/word class props;
// reduced motion shows the text fully lit.
import * as React from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { cn } from '@/src/lib/cn';

export interface MagicTextProps { text: string; container?: React.RefObject<HTMLElement | null>; className?: string; wordClassName?: string }

function Word({ children, progress, range, className }: { children: string; progress: MotionValue<number>; range: number[]; className?: string }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className={cn('relative mt-[12px] mr-1 text-3xl font-semibold', className)}>
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

export const MagicText: React.FC<MagicTextProps> = ({ text, container, className, wordClassName }) => {
  const target = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, container: container as any, offset: ['start 0.9', 'start 0.25'] });
  const words = text.split(' ');
  if (reduce) return <p className={cn('p-4 text-3xl font-semibold', className)} style={{ fontFamily: 'var(--font-display)' }}>{text}</p>;
  return (
    <p ref={target} className={cn('flex flex-wrap leading-[0.5] p-4', className)} style={{ fontFamily: 'var(--font-display)' }}>
      {words.map((word, i) => {
        const start = i / words.length;
        return <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} className={wordClassName}>{word}</Word>;
      })}
    </p>
  );
};
