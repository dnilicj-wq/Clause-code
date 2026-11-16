import { useEffect, useState } from 'react';
import Steam from './Steam';

// 404: "This page sprang a leak." Wipe the steam to find the way home.
export default function NotFound() {
  const [k, setK] = useState(0);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => { document.title = 'This page sprang a leak · Microcement & Venetian Surfaces'; }, []);
  const shown = reduce || k > 0.22;
  return (
    <main className="nf">
      <div className="nf-glass">
        <Steam src="/posters/hero-m-v1.webp" mode="game" onCover={setK} className="hero-gl" dim={0.2} label="A steamed-up mirror you can wipe" />
        <a className={`btn btn-water nf-home ${shown ? 'in' : ''}`} href="/" tabIndex={0}>Back home</a>
      </div>
      <div className="nf-copy">
        <p className="kicker">404</p>
        <h1 className="h1">This page sprang a leak.</h1>
        <p className="lede">Wipe the steam off the glass to find your way back home.</p>
        <a className="link" href="/">Or just go home →</a>
      </div>
    </main>
  );
}
