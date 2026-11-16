import React from 'react';
import { cn } from '@/lib/utils';

// Port of 21st.dev Ruixen Bento Cards (@ruixen.ui). Same dashed plus-corner cards, 6-col bento and
// overlapping right-aligned footer heading. Changes: content via props, the vendor link removed, preset tokens.
export type BentoCard = { title: string; description: string; img?: string };

const PlusCard: React.FC<BentoCard & { className?: string }> = ({ className = '', title, description, img }) => (
  <div className={cn('relative flex min-h-[200px] flex-col justify-between rounded-lg border border-dashed border-line bg-surface p-6', className)}>
    <CornerPlusIcons />
    {img && <div className="relative mb-5 min-h-[170px] flex-1 overflow-hidden rounded-md"><img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" /><span className="ex-tag left-2 top-2">Example image</span></div>}
    <div className="relative z-10 space-y-2">
      <h3 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  </div>
);

const CornerPlusIcons = () => (
  <>
    <PlusIcon className="absolute -left-3 -top-3" />
    <PlusIcon className="absolute -right-3 -top-3" />
    <PlusIcon className="absolute -bottom-3 -left-3" />
    <PlusIcon className="absolute -bottom-3 -right-3" />
  </>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={24} height={24} strokeWidth="1" stroke="currentColor" className={`size-6 text-ink ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
);

export default function RuixenBentoCards({ cards, heading, text, className }: { cards: [BentoCard, BentoCard, BentoCard, BentoCard, BentoCard]; heading: React.ReactNode; text: string; className?: string }) {
  return (
    <section className={cn('border border-line', className)}>
      <div className="mx-auto border border-t-0 border-line px-4 py-12">
        <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <PlusCard {...cards[0]} className="lg:col-span-3 lg:row-span-2" />
          <PlusCard {...cards[1]} className="lg:col-span-2 lg:row-span-2" />
          <PlusCard {...cards[2]} className="lg:col-span-4 lg:row-span-1" />
          <PlusCard {...cards[3]} className="lg:col-span-2 lg:row-span-1" />
          <PlusCard {...cards[4]} className="lg:col-span-2 lg:row-span-1" />
        </div>
        <div className="ml-auto mt-6 max-w-2xl px-4 text-right lg:-mt-20">
          <h2 className="mb-4 text-4xl font-bold text-ink md:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>{heading}</h2>
          <p className="text-lg text-muted">{text}</p>
        </div>
      </div>
    </section>
  );
}
