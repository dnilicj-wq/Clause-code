import { motion } from 'motion/react';
import type { ReactNode } from 'react';
export { Stars } from './lite';

export function Head({ eyebrow, title, accent, lede, center = false, id }: { eyebrow: string; title: string; accent?: string; lede?: ReactNode; center?: boolean; id?: string }) {
  return (
    <div className={center ? 'mx-auto max-w-[760px] text-center' : 'max-w-[760px]'}>
      <Rise><p className="eyebrow">{eyebrow}</p></Rise>
      <Rise d={0.06}><h2 id={id} className="h2 mt-4">{title}{accent && <> <span className="serif" style={{ color: 'var(--accent2)' }}>{accent}</span></>}</h2></Rise>
      {lede && <Rise d={0.12}><p className={`lede mt-5 ${center ? 'mx-auto' : ''}`}>{lede}</p></Rise>}
    </div>
  );
}

export function Rise({ children, d = 0, className }: { children: ReactNode; d?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export { Mark, MARK_PATHS } from './lite';
