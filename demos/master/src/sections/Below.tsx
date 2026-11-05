// Everything below the hero, in its own chunk so the hero paints before this JS is parsed.
import { useState } from 'react';
import { Visualiser } from '@/components/signature/visualiser/Visualiser';
import { Services, Expand, Layers, PhotoBreak } from './Story';
import { Bento } from './Proof';
import { Quote } from './Quote';
import { Reply } from './Reply';
import { Gallery, Reviews, Owner, Guarantee, Faq, Finale } from './Social';
import { useSite } from '@/src/lib/ctx';
import { footerData } from '@/components/library/large-name-footer/footer-data';
import { LargeNameFooter } from '@/components/library/large-name-footer/LargeNameFooter';
import { Dock, CursorGlow } from './Chrome';

export default function Below() {
  const [vis, setVis] = useState(false);
  const { site, trade } = useSite();
  return (
    <>
      <Services />
      {trade.copy.expand && <Expand onVisualise={site.visualiser ? () => setVis(true) : undefined} />}
      <Layers />
      <Bento />
      <Quote />
      <Reply />
      <Gallery />
      <PhotoBreak />
      <Reviews />
      <Owner />
      <Guarantee />
      <Faq />
      <Finale />
      <div className="[&_footer]:!bg-[var(--bg2)] max-md:[&_footer]:!py-8 max-md:[&_.grid>div:nth-child(n+3)]:hidden max-md:[&_ul]:!space-y-1.5 max-md:[&_.mb-8]:!mb-6">
        <LargeNameFooter data={footerData(site, trade)} ctaHref="#price" ctaLabel="Get your price" />
      </div>
      <Dock />
      <CursorGlow />
      {site.visualiser && <Visualiser open={vis} onClose={() => setVis(false)} />}
    </>
  );
}
