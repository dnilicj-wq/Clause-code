// Everything below the hero, in its own chunk so the hero paints before this JS is parsed.
// Resinize: garage floors only. Finish choice is shared by the picker and the quote form.
import { useState } from 'react';
import { Services, Expand } from './Story';
import { Reviews, Faq, Finale } from './Social';
import { Why, FinishPicker, Process, Areas, QuoteForm } from './Garage';
import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { LargeNameFooter } from '@/components/library/large-name-footer/LargeNameFooter';
import { Dock, CursorGlow } from './Chrome';

export default function Below() {
  const { site, trade } = useSite();
  const [finish, setFinish] = useState(trade.finishes[0]);
  return (
    <>
      <Services />
      <Why />
      {trade.copy.expand && <Expand />}
      <FinishPicker finish={finish} setFinish={setFinish} />
      <Process />
      <Reviews />
      <Areas />
      <QuoteForm finish={finish} setFinish={setFinish} />
      <Faq />
      <Finale />
      <div className="[&_footer]:!bg-[var(--bg2)] max-md:[&_footer]:!py-8 max-md:[&_.grid>div:nth-child(n+3)]:hidden max-md:[&_ul]:!space-y-1.5 max-md:[&_.mb-8]:!mb-6">
        <LargeNameFooter data={footerData(site, trade)} ctaHref="#quote" ctaLabel="Get a free quote" />
      </div>
      <Dock />
      <CursorGlow />
    </>
  );
}
