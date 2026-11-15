import { ContainerScroll, CardsContainer, CardTransformed } from '@/components/library/animated-cards-stack/AnimatedCardsStack';
import { ScrollBox } from '../text-demo-helpers';
import { AutoScroll } from '../auto-scroll';
import { site } from '@/config/site';

// Example reviews only (layout). Real reviews go in word for word with their source.
export default function Demo() {
  const reviews = site.reviews;
  return (
    <ScrollBox h={340}>
      {(ref) => (
        <>
        <AutoScroll target={ref as any} speed={1.2} />
        <ContainerScroll container={ref as any} className="!min-h-[900px] px-4 pt-6">
          <div className="sticky top-6 mx-auto h-[250px] w-full max-w-[340px]">
            <CardsContainer className="h-[220px] w-full">
              {reviews.map((r, i) => (
                <CardTransformed key={i} arrayLength={reviews.length} index={i + 2} variant="light"
                  className="!items-start !justify-between !gap-3 !border-[var(--line)] !bg-[linear-gradient(160deg,color-mix(in_srgb,var(--surface)_88%,var(--accent)_12%),var(--surface)_55%)] text-left !shadow-[0_18px_40px_-18px_rgba(0,0,0,.55)]">
                  <span aria-hidden className="-mb-2 font-serif text-[44px] leading-none" style={{ color: 'var(--accent)', fontFamily: 'var(--font-serif)' }}>“</span>
                  <p className="text-[15px] leading-snug" style={{ color: 'var(--ink)' }}>{r.text}</p>
                  <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>{r.name} (example)</span> · {r.job} · {r.town}
                  </div>
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </ContainerScroll>
        </>
      )}
    </ScrollBox>
  );
}
