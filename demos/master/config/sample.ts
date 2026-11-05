// Sample content for the fictional master demo ONLY (site.sample = true).
// Northfield Surfaces is not a real business, so the demo shows convincing sample reviews, owner note and guarantee
// instead of "Example…" placeholders, with one "Demo site, sample content" line in the footer.
// Prospect sites built with /new-lead set sample: false and keep the honesty labels from config/site.ts.
import type { Site, Review } from './site';

const reviews: Review[] = [
  { name: 'Sarah K.', town: 'Horsforth', job: 'Double garage, graphite flake', source: 'Sample',
    text: 'Tom came out the same week, checked the slab for damp and talked us through flake versus solid colour. Two days later the garage looked like a showroom. Oil from the car just wipes off.' },
  { name: 'Mark T.', town: 'Harrogate', job: 'Kitchen, copper metallic', source: 'Sample',
    text: 'We were nervous about a metallic floor in the kitchen but it is the first thing everyone comments on. They covered every cupboard and left the place cleaner than they found it.' },
  { name: 'Priya D.', town: 'Wakefield', job: 'Car showroom, pearl metallic', source: 'Sample',
    text: 'Done over a weekend so we did not lose a trading day. The price matched the quote to the pound, and the floor still looks wet under the lights six months on.' },
];

export function withSample(s: Site): Site {
  if (!s.sample) return s;
  return {
    ...s,
    demo: false,
    reviews,
    ownerNote: "I've been laying resin floors around Leeds for over a decade. I still survey every job myself, mix every batch on site and won't start until the slab is right. If something isn't right, you ring me, not a call centre.",
    // hands-and-trowel stand-in (not a face); set once generated: { ...s.owner, photo: '/demo/owner-hands-v1.webp', photoIsStandIn: true }
    owner: s.owner,
    guarantee: {
      title: 'Written guarantee on every floor',
      text: 'If your floor lifts, peels or bubbles because of how we laid it, we come back and put it right free of charge. It is in writing before we start.',
    },
  };
}
