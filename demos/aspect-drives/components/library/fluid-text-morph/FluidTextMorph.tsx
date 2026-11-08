// Port of Fluid Text Morph (21st.dev @dhileepkumargm). Faithful letter springs + layoutId morph.
// Re-skinned: colours come from preset tokens. Added: `auto` (ms) toggles the pair on a timer so phones
// (no hover) still see it; tap cycles pairs as in the original. Reduced motion: plain swap, no springs.
// Fix: letters are keyed by character+position (not position only), so same-length swaps really morph
// letter by letter instead of just recolouring; popLayout keeps the outgoing word from widening the line.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/cn';

interface FluidTextMorphProps {
  wordPairs: [string, string][];
  className?: string;
  auto?: number;
  animationProps?: { initialColor?: string; animateColor?: string; exitColor?: string };
}

export function FluidTextMorph({ wordPairs, className, auto, animationProps = {} }: FluidTextMorphProps) {
  const [index, setIndex] = useState(0);
  const [word, setWord] = useState(wordPairs[index][0]);
  const reduce = useReducedMotion();
  const { initialColor = 'var(--accent)', animateColor = 'var(--ink)', exitColor = 'var(--accent2)' } = animationProps;

  useEffect(() => { if (wordPairs && wordPairs.length > 0) setWord(wordPairs[index][0]); }, [index, wordPairs]);
  useEffect(() => {
    if (!auto || reduce) return;
    let alt = false;
    const t = setInterval(() => {
      alt = !alt;
      if (alt) setWord(wordPairs[index][1]);
      else setIndex((p) => (p + 1) % wordPairs.length);
    }, auto);
    return () => clearInterval(t);
  }, [auto, reduce, index, wordPairs]);

  const letters = word.split('');
  return (
    <div
      className={cn('relative flex cursor-pointer items-center justify-center text-6xl font-bold sm:text-8xl', className)}
      style={{ fontFamily: 'var(--font-display)' }}
      onMouseEnter={() => setWord(wordPairs[index][1])}
      onMouseLeave={() => setWord(wordPairs[index][0])}
      onClick={() => setIndex((prev) => (prev + 1) % wordPairs.length)}
      aria-live="polite"
    >
      {reduce ? <span style={{ color: animateColor }}>{word}</span> : (
        <AnimatePresence mode="popLayout" initial={false}>
          {letters.map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.8, color: initialColor }}
              animate={{ opacity: 1, y: 0, scale: 1, color: animateColor, transition: { type: 'spring', damping: 15, stiffness: 200, delay: i * 0.05 } }}
              exit={{ opacity: 0, y: -30, scale: 0.8, color: exitColor, transition: { type: 'spring', damping: 15, stiffness: 200, delay: (letters.length - 1 - i) * 0.05 } }}
              className="relative"
            >
              {letter}
            </motion.span>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
