import { SvgFollowScroll } from '@/components/library/svg-follow-scroll/SvgFollowScroll';
import { ScrollBox } from '../text-demo-helpers';
import { useSite } from '@/src/lib/ctx';

export default function Demo() {
  const { site } = useSite();
  return (
    <ScrollBox h={420}>
      {(ref) => (
        <div className="[&_h2]:!text-[clamp(36px,7vw,64px)]">
          <SvgFollowScroll container={ref} height={1300} heading={<>One pour,<br />start to <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent2)' }}>finish.</span></>} sub="The line follows you down the page, like resin finding its level.">
            <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius)] p-6 md:flex-row md:items-center md:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <p className="text-[clamp(22px,3.4vw,34px)] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>Ready when you are.</p>
              <a href="/#price" className="rounded-full px-5 py-3 text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>See your price · {site.town}</a>
            </div>
          </SvgFollowScroll>
        </div>
      )}
    </ScrollBox>
  );
}
