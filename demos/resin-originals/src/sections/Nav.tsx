import { useEffect, useState } from 'react';
import { IconPhone } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';

export function Nav() {
  const { site } = useSite();
  const [solid, setSolid] = useState(false);
  const [brand, setBrand] = useState(false); // header logo only once the big hero logo has scrolled away, so there's one logo on screen
  useEffect(() => {
    const hero = document.getElementById('top');
    const mark = document.querySelector('.hero__mark');
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(e.intersectionRatio < 0.92), { threshold: [0.92] });
    io.observe(hero);
    const io2 = mark ? new IntersectionObserver(([e]) => setBrand(!e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }) : null;
    if (mark) io2!.observe(mark); else setBrand(true);
    return () => { io.disconnect(); io2?.disconnect(); };
  }, []);
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <nav className="nav__in" aria-label="Main">
        <a href="#top" className={`nav__brand ${brand ? 'is-on' : ''}`} aria-hidden={!brand} tabIndex={brand ? undefined : -1}>
          <img src="/client/logo-mark-v2.webp" alt="" width={68} height={44} />
          <span>The Resin Originals</span>
        </a>
        <div className="nav__links">
          <a href="#work">Floors</a>
          <a href="#finishes">Finishes</a>
          <a href="#design">Design</a>
          <a href="#commercial">Commercial</a>
          <a href="#plan">Plan your floor</a>
        </div>
        <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="nav__call">
          <span className="nav__ring" aria-hidden><IconPhone size={17} stroke={2} /></span><span className="max-sm:hidden">{site.phone}</span><span className="sm:hidden">Call</span>
        </a>
      </nav>
    </header>
  );
}
