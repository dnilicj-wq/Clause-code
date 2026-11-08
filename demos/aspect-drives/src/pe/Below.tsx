import { Layers } from './v3/Layers';
import { Work } from './v3/Work';
import { Proof } from './v3/Proof';
import { Price } from './v3/Price';
import { Practical } from './v3/Practical';
import { Footer, StickyBar } from './v3/Foot';

// Everything under the hero, lazy-loaded. The page runs as acts: build it, see it, trust it, price it, the practical bits.
export default function Below() {
  return (
    <>
      <Layers />
      <Work />
      <Proof />
      <Price />
      <Practical />
      <Footer />
      <StickyBar />
    </>
  );
}
