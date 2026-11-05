import { lazy, Suspense } from 'react';
import { PourHero } from '@/components/signature/pour-hero/PourHero';
import { Nav, useLenis } from '../sections/Chrome';
import { useSite } from '@/src/lib/ctx';

const Below = lazy(() => import('../sections/Below'));
const TrowelHero = lazy(() => import('@/components/signature/trowel-hero/TrowelHero').then((m) => ({ default: m.TrowelHero })));

// Default epoxy demo. Order follows the V3 brief (max 15 phone screens).
// Hero + nav ship in the first chunk; the rest streams in straight after (keeps LCP on the hero).
export default function Home() {
  useLenis();
  const { trade } = useSite();
  const h = trade.hero;
  return (
    <>
      <Nav />
      <main className="grain relative">
        {trade.copy.hero === 'trowel' ? (
          <Suspense fallback={<div style={{ height: '100vh' }} />}>
            <TrowelHero eyebrow={h.eyebrow} lines={h.lines as [string, string]} hint={h.hint} cta={{ label: 'Get my price', href: '#price' }}
              colours={trade.finishes.map((f) => ({ name: f.name, hex: f.metal }))} />
          </Suspense>
        ) : <PourHero />}
        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <Below />
        </Suspense>
      </main>
    </>
  );
}
