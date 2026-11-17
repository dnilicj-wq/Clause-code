import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { IconDroplet, IconHomeHeart, IconPalette, IconShieldCheck, IconSparkles } from '@tabler/icons-react';
import Pour from './Pour';
import { faqs, reviews, site, wa, WA_HI, type Spec } from './data';

const Design = lazy(() => import('./Design'));
const Marble = lazy(() => import('./Marble'));
const Planner = lazy(() => import('./Planner'));

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll<HTMLElement>('[data-r]:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Lazy({ children, h, id }: { children: React.ReactNode; h: number; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '800px 0px' });
    io.observe(ref.current!); return () => io.disconnect();
  }, []);
  return <div ref={ref} id={id} style={on ? undefined : { minHeight: h }}>{on && <Suspense fallback={<div style={{ minHeight: h }} />}>{children}</Suspense>}</div>;
}

// His wordmark from the Instagram flyer, redrawn as vectors: wide geometric caps (Montserrat 520 outlines,
// no font download), RES in brushed silver and INOVA in gold, PREMIUM SURFACES between gold hairlines.
const WM_RES = 'M6.5 44V0H23.8Q32.4 0 37.3 4.1Q42.3 8.2 42.3 15.4Q42.3 20.2 40 23.6Q37.8 27.1 33.7 28.9Q29.6 30.7 23.8 30.7H10.1L13.1 27.7V44ZM35.8 44 24.6 28H31.7L43 44ZM13.1 28.3 10.1 25.1H23.6Q29.5 25.1 32.5 22.5Q35.6 20 35.6 15.4Q35.6 10.8 32.5 8.3Q29.5 5.8 23.6 5.8H10.1L13.1 2.5ZM57.9 44V0H89.2V5.8H64.5V38.2H90V44ZM64 24.5V18.8H86.4V24.5ZM118.6 44.5Q113.6 44.5 109 43Q104.3 41.5 101.7 39.1L104.1 33.8Q106.6 36 110.5 37.4Q114.4 38.9 118.6 38.9Q122.4 38.9 124.7 38Q127.1 37.2 128.2 35.7Q129.3 34.2 129.3 32.3Q129.3 30.1 127.8 28.8Q126.4 27.4 124 26.6Q121.7 25.8 118.8 25.1Q116 24.5 113.2 23.7Q110.3 22.8 108 21.5Q105.6 20.1 104.2 17.9Q102.7 15.7 102.7 12.2Q102.7 8.7 104.5 5.8Q106.4 3 110.2 1.2Q113.9 -0.5 119.8 -0.5Q123.6 -0.5 127.4 0.5Q131.2 1.5 134 3.4L131.8 8.7Q129 6.8 125.8 6Q122.7 5.1 119.7 5.1Q116.1 5.1 113.8 6Q111.4 7 110.4 8.5Q109.3 10 109.3 11.9Q109.3 14.1 110.7 15.5Q112.2 16.8 114.5 17.6Q116.9 18.4 119.7 19.1Q122.6 19.7 125.4 20.6Q128.2 21.4 130.6 22.7Q132.9 24 134.4 26.2Q135.8 28.4 135.8 31.9Q135.8 35.3 134 38.2Q132.1 41.1 128.3 42.8Q124.5 44.5 118.6 44.5Z';
const WM_INOVA = 'M150.5 44V0H157.1V44ZM175.7 44V0H181.2L209.9 35.6H207.1V0H213.7V44H208.3L179.5 8.4H182.3V44ZM252.3 44.5Q247.2 44.5 242.9 42.8Q238.6 41.1 235.5 38.1Q232.3 35.1 230.6 31Q228.8 26.9 228.8 22Q228.8 17.1 230.6 13Q232.3 8.9 235.5 5.9Q238.7 2.8 242.9 1.2Q247.2 -0.5 252.3 -0.5Q257.4 -0.5 261.6 1.1Q265.9 2.8 269 5.9Q272.2 8.9 274 13Q275.7 17.1 275.7 22Q275.7 26.9 274 31Q272.2 35.1 269 38.1Q265.9 41.2 261.6 42.9Q257.4 44.5 252.3 44.5ZM252.3 38.6Q255.9 38.6 258.9 37.4Q262 36.1 264.3 33.9Q266.5 31.6 267.8 28.6Q269 25.6 269 22Q269 18.4 267.8 15.4Q266.5 12.4 264.3 10.1Q262 7.9 259 6.6Q255.9 5.4 252.3 5.4Q248.7 5.4 245.6 6.6Q242.6 7.9 240.3 10.1Q238 12.4 236.8 15.4Q235.5 18.4 235.5 22Q235.5 25.6 236.8 28.6Q238 31.6 240.3 33.9Q242.5 36.1 245.6 37.4Q248.7 38.6 252.3 38.6ZM303.6 44 284.3 0H291.5L309.1 40.4H305L322.8 0H329.5L310.2 44ZM334.8 44 354.8 0H361.3L381.3 44H374.3L356.7 3.7H359.4L341.7 44ZM343.5 33.2 345.3 27.8H369.8L371.7 33.2Z';
export function Wordmark({ w = 150 }: { w?: number }) {
  return (
    <svg className="wm" width={w} height={w * 0.2} viewBox="0 0 370 74" role="img" aria-label="RESINOVA, Premium Surfaces">
      <defs>
        <linearGradient id="wms" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".55" stopColor="#D9DDE3" /><stop offset="1" stopColor="#A9B0B9" /></linearGradient>
        <linearGradient id="wmg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#F6E3AE" /><stop offset=".5" stopColor="#D6B472" /><stop offset="1" stopColor="#B08A4A" /></linearGradient>
      </defs>
      <g transform="translate(-6.5 0)"><path d={WM_RES} fill="url(#wms)" /><path d={WM_INOVA} fill="url(#wmg)" /></g>
      <path d="M14 66.5h60M296 66.5h60" stroke="#C9A86A" strokeWidth="1.6" />
      <text x="187.8" y="71" textAnchor="middle" fill="#D6B472" style={{ font: '600 13px var(--body)', letterSpacing: '5.6px' }}>PREMIUM SURFACES</text>
    </svg>
  );
}

const SERVICES = [
  { id: 'floors', t: 'Floors', d: 'Metallic, flake and solid colour epoxy, polished concrete and microcement.', img: 'space-living', alt: 'a living room with a pearl and grey metallic resin floor' },
  { id: 'worktops', t: 'Worktops & tables', d: 'Resin countertops and epoxy table coatings, poured as one surface.', img: 'space-svc-worktop', alt: 'a kitchen island with a pearl, charcoal and gold metallic marble epoxy worktop' },
  { id: 'venetian', t: 'Venetian plaster', d: 'Marble-effect walls and ceilings, polished by hand, with gold leaf.', img: 'space-svc-venetian', alt: 'a lounge with polished Venetian marble walls and ceiling veined with gold leaf' },
  { id: 'walls', t: 'Walls', d: 'Resin and microcement wall finishes.', img: 'space-wall', alt: 'a charcoal Venetian plaster feature wall' },
  { id: 'bathrooms', t: 'Bathrooms', d: 'Microcement bathrooms, walls and floors.', img: 'space-bathroom', alt: 'a bathroom finished in stone-grey microcement' },
  { id: 'driveways', t: 'Driveways', d: 'Resin bound and resin bonded driveways.', img: 'space-driveway', alt: 'a house with a golden resin bound driveway' },
  { id: 'commercial', t: 'Commercial', d: 'Polyurethane commercial floors.', img: 'space-commercial', alt: 'a commercial space with a seamless grey resin floor' },
];

const WHY = [
  { I: IconDroplet, t: 'Waterproof & seamless', d: 'One continuous surface. No grout lines, no joins.' },
  { I: IconShieldCheck, t: 'Durable & long-lasting', d: 'Made for kitchens, garages and busy floors.' },
  { I: IconSparkles, t: 'Stunning finishes', d: 'Metallic, marble, flake, plaster or stone.' },
  { I: IconHomeHeart, t: 'Increases property value', d: 'A finish people notice the moment they walk in.' },
  { I: IconPalette, t: 'Bespoke designs', d: 'Your colours, your pattern. Never off the shelf.' },
];

const STEPS = [
  { t: 'Free quote', d: 'Send a photo on WhatsApp. We look at the space and talk through what you want.' },
  { t: 'Your design', d: 'Finish, colour and pattern, designed around your space and style.' },
  { t: 'Preparation', d: 'The surface is cleaned, repaired and primed so the resin bonds properly.' },
  { t: 'The pour', d: 'Laid by hand, layer by layer, and worked into its final pattern.' },
  { t: 'Cure & reveal', d: 'It sets, it’s sealed, and the space is handed back to you.' },
];

export default function Home() {
  useReveal();
  const [dock, setDock] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [swirled, setSwirled] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.12 });
    if (hero.current) io.observe(hero.current);
    // the "how it works" line fills as each step reaches the middle of the screen
    const so = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('lit', e.isIntersecting || e.boundingClientRect.top < 0)), { rootMargin: '0px 0px -45% 0px' });
    steps.current?.querySelectorAll('li').forEach((li) => so.observe(li));
    return () => { io.disconnect(); so.disconnect(); };
  }, []);

  const toQuote = (s: Spec) => { setSpec({ ...s }); document.getElementById('quote')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="nav-bar">
          <a className="logo" href="#top" aria-label="RESINOVA Premium Surfaces, back to top"><Wordmark w={150} /></a>
          <nav aria-label="Main">
            <a href="#services">Surfaces</a><a href="#design">Design yours</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
          </nav>
          <a className="btn btn-gold sm nav-q" href="#quote">Free quote</a>
        </div>
      </header>

      <main id="main">
        {/* HERO: the pour */}
        <section id="top" ref={hero} className="hero">
          <Pour />
          <span className="chip-viz hero-chip">Visualisation</span>
          <div className="hero-copy">
            <p className="kicker">Premium resin surfaces · UK</p>
            <h1 className="h1">Floors, walls and worktops, <em>poured to be one of a kind.</em></h1>
            <p className="lede">Premium resin, microcement and Venetian plaster for homes, garages, kitchens and commercial spaces. UK-based, every design bespoke.</p>
            <div className="cta-row">
              <a className="btn btn-gold" href="#design">Design your surface</a>
              <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp us</a>
            </div>
          </div>
        </section>

        {/* SERVICES: gallery wall */}
        <section id="services" className="sec">
          <div className="sec-head" data-r>
            <h2 className="h2">Every surface, <em>one material.</em></h2>
            <p className="sub">Floors, walls, worktops, bathrooms and driveways, for homes and commercial spaces.</p>
          </div>
          <div className="wall">
            {SERVICES.map((s, i) => (
              <article className={`card card-${s.id}`} key={s.id} data-r style={{ ['--i' as string]: i % 3 }}>
                <div className="card-img">
                  <img src={`/viz/${s.img}-v1.webp`} srcSet={`/viz/${s.img}-sm-v1.webp 400w, /viz/${s.img}-v1.webp 900w`} sizes="(min-width: 900px) 40vw, 78vw" alt={`Example image: ${s.alt}`} width={900} height={1125} loading="lazy" decoding="async" />
                  <span className="ex">Example image</span>
                </div>
                <div className="card-txt"><h3 className="h3">{s.t}</h3><p>{s.d}</p></div>
              </article>
            ))}
          </div>
          <p className="swipe-note" aria-hidden="true">Swipe for all seven →</p>
        </section>

        {/* DESIGN YOUR SURFACE */}
        <section id="design" className="sec sec-deep">
          <div className="sec-head" data-r>
            <p className="kicker">Design your surface</p>
            <h2 className="h2">Pick a space. <em>Pour a finish.</em></h2>
            <p className="sub">Three taps and the surface re-pours in front of you. Then send the design to us for a quote.</p>
          </div>
          <Lazy h={900}><Design onQuote={toQuote} /></Lazy>
        </section>

        {/* WHY RESIN */}
        <section id="why" className="sec why">
          <div className="why-grid">
            <h2 className="h2" data-r>Why resin.</h2>
            <ul className="why-list">
              {WHY.map(({ I, t, d }, i) => (
                <li key={t} data-r style={{ ['--i' as string]: i }}>
                  <span className="why-ic" aria-hidden="true"><I size={26} stroke={1.4} /></span>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* EVERY POUR IS DIFFERENT */}
        <section id="every-pour" className={`marble ${swirled ? 'swirled' : ''}`}>
          <Lazy h={560}><Marble className="marble-gl" onTouched={() => setSwirled(true)} /></Lazy>
          <div className="marble-copy">
            <h2 className="h2">Every pour <em>is different.</em></h2>
            <p>No two RESINOVA floors are ever the same.</p>
            <p className="marble-hint" aria-hidden="true"><span className="hint-m">Move across it to swirl the pigment</span><span className="hint-t">Drag your finger to swirl the pigment</span></p>
          </div>
        </section>

        {/* WORK IN PROGRESS */}
        <section id="work" className="sec wip">
          <div className="wip-grid">
            <figure className="wip-vid" data-r>
              <video src="/client/reel-mid-pour-v1.mp4" poster="/client/reel-mid-pour-v1.webp" muted loop playsInline autoPlay preload="none" aria-label="RESINOVA’s latest project mid-pour: marble-effect walls and floor in white, grey and gold" />
              <figcaption>Latest project, mid-pour<small>Filmed on the job · from {site.handle}</small></figcaption>
            </figure>
            <div data-r style={{ ['--i' as string]: 1 }}>
              <p className="kicker">Meet RESINOVA</p>
              <h2 className="h2">Real pours, <em>filmed on the job.</em></h2>
              <p className="sub">RESINOVA is a new UK company doing one thing: premium resin surfaces, designed for each space. This is a live job, filmed mid-pour: marble-effect walls and floor in white, grey and gold. Finished projects go up here as they’re handed over.</p>
              <ul className="facts">
                <li><b>Based</b>UK-based</li>
                <li><b>For</b>Homes and commercial spaces</li>
                <li><b>Designs</b>Bespoke, every time</li>
                <li><b>Quotes</b>From a photo on WhatsApp</li>
              </ul>
              <a className="link" href={site.instagram} target="_blank" rel="noopener">Follow the work on Instagram →</a>
            </div>
          </div>
        </section>

        {reviews.length > 0 && (
          <section id="reviews" className="sec" aria-label="Reviews">
            <div className="pulls">
              {reviews.map((r) => <figure className="pull" key={r.who}><blockquote>“{r.text}”</blockquote><figcaption>{r.who} · {r.source}</figcaption></figure>)}
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section id="how" className="sec sec-deep">
          <div className="sec-head" data-r>
            <h2 className="h2">From first photo <em>to final reveal.</em></h2>
          </div>
          <ol className="steps" ref={steps}>
            {STEPS.map((s, i) => (
              <li key={s.t}><span className="st-n">{i + 1}</span><div><h3 className="h3">{s.t}</h3><p>{s.d}</p></div></li>
            ))}
          </ol>
        </section>

        {/* QUOTE */}
        <section id="quote" className="sec">
          <div className="quote-grid">
            <div data-r>
              <p className="kicker">Free quote · no prices online</p>
              <h2 className="h2">Tell us about <em>your space.</em></h2>
              <p className="sub">Four quick steps. It lands on our WhatsApp with everything filled in.</p>
              <ul className="contact">
                <li><a href={wa(WA_HI)} target="_blank" rel="noopener">Message us on WhatsApp</a></li>
                <li><a href={site.instagram} target="_blank" rel="noopener">Instagram {site.handle}</a></li>
                <li>UK-based</li>
              </ul>
            </div>
            <Lazy h={460}><Planner spec={spec} /></Lazy>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sec faq">
          <div className="sec-head" data-r>
            <h2 className="h2">Good <em>questions.</em></h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div className={`qa ${faq === i ? 'open' : ''}`} key={f.q}>
                <button aria-expanded={faq === i} onClick={() => setFaq(faq === i ? null : i)}>{f.q}<span aria-hidden="true">+</span></button>
                <div className="qa-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* FINALE */}
        <section className="finale">
          <div className="fin-bg" aria-hidden="true"><img src="/posters/hero-end-d-v1.webp" alt="" width={1344} height={752} loading="lazy" decoding="async" /></div>
          <h2 className="h-fin" data-r>Poured once.<br /><em>Admired for years.</em></h2>
          <div className="cta-row center" data-r>
            <a className="btn btn-gold" href="#design">Design your surface</a>
            <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand"><Wordmark w={200} /><p>UK-based · bespoke designs</p></div>
          <div><b>Talk to us</b><p><a href={wa(WA_HI)} target="_blank" rel="noopener">Message us on WhatsApp</a><br /><a href={site.instagram} target="_blank" rel="noopener">Instagram {site.handle}</a></p></div>
          <div><b>Surfaces</b><p>Floors · Walls · Worktops<br />Bathrooms · Driveways · Commercial</p></div>
        </div>
        <p className="foot-fine">Demo by Clientgateway. Images marked “Example image” or “Visualisation” are illustrations, not RESINOVA jobs. Not live, not indexed.</p>
      </footer>

      <nav className={`dock ${dock ? 'show' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}>Call</a>
        <a href={wa(WA_HI)} target="_blank" rel="noopener" className="dock-wa">WhatsApp</a>
        <a href="#quote">Quote</a>
      </nav>
    </>
  );
}
