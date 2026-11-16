import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Steam from './Steam';
import { faqs, reviews, site, wa, WA_HI } from './data';

const WetRoom = lazy(() => import('./WetRoom'));
const OverAnything = lazy(() => import('./OverAnything'));
const Tone = lazy(() => import('./Tone'));
const Gallery = lazy(() => import('./Gallery'));
const Planner = lazy(() => import('./Planner'));

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll<HTMLElement>('[data-r]:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Lazy({ children, h }: { children: React.ReactNode; h: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '700px 0px' });
    io.observe(ref.current!); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={on ? undefined : { minHeight: h }}>{on && <Suspense fallback={<div style={{ minHeight: h }} />}>{children}</Suspense>}</div>;
}

// His mark, redrawn as SVG from the logo on microcement-venetian.com: a ring around a zigzag "M" wave.
export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 380 363" aria-hidden="true">
      <circle cx="190" cy="181.5" r="150" fill="none" stroke="currentColor" strokeWidth="25" />
      <path d="M103 210 L144 140 L180 202 L209 153 L240 214 L291 145" fill="none" stroke="currentColor" strokeWidth="25" strokeLinecap="round" strokeLinejoin="miter" strokeMiterlimit="3" />
    </svg>
  );
}
function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Microcement & Venetian Surfaces, back to top">
      <Mark size={34} />
      <span className="logo-w"><b>Microcement &amp;</b><b>Venetian Surfaces</b></span>
    </a>
  );
}

const PULL = ['Punctual, tidy and good value.', 'Microcement over existing tiles in a wet room.', 'Went above and beyond.'];
const PULL_WHO = ['Tom Fortune', 'Susan Butcher', 'Emma Thornton'];

export default function Home() {
  useReveal();
  const [wiped, setWiped] = useState(false);
  const [touched, setTouched] = useState(false);
  const [dock, setDock] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const [heroStart, setHeroStart] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const marquee = useRef<HTMLDivElement>(null);
  const [src] = useState(() => (matchMedia('(min-width: 700px)').matches ? '/posters/hero-d-v1.webp' : '/posters/hero-m-v1.webp'));

  useEffect(() => {
    const t = setTimeout(() => setHeroStart(true), document.getElementById('boot') ? 700 : 100);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) setWiped(true);
    const onW = () => setWiped(true);
    addEventListener('wiped', onW);
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.12 });
    if (hero.current) io.observe(hero.current);
    // the review marquee only runs while it's on screen
    const mo = new IntersectionObserver(([e]) => marquee.current?.classList.toggle('run', e.isIntersecting));
    if (marquee.current) mo.observe(marquee.current);
    return () => { clearTimeout(t); removeEventListener('wiped', onW); io.disconnect(); mo.disconnect(); };
  }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="nav-bar">
          <Logo />
          <nav aria-label="Main">
            <a href="#wet-rooms">Wet rooms</a><a href="#over">Surfaces</a><a href="#work">Work</a><a href="#reviews">Reviews</a>
          </nav>
          <a className="btn btn-water sm nav-q" href="#quote">Get a free quote</a>
        </div>
      </header>

      <main id="main">
        {/* HERO: wipe the steam */}
        <section id="top" ref={hero} className={`hero ${wiped ? 'wiped' : ''} ${touched ? 'touched' : ''}`} onPointerDown={() => setTouched(true)}>
          <div className="hero-glass">
            <picture>
              <source media="(min-width: 700px)" srcSet="/posters/hero-d-v1.webp" />
              <img className="hero-poster" src="/posters/hero-m-v1.webp" alt="" width={780} height={1040} fetchPriority="high" />
            </picture>
            <Steam src={src} start={heroStart} className="hero-gl" label="James’s bathroom behind a steamed-up mirror. Wipe the glass to clear it." />
          </div>
          <p className="wipe-hint" aria-hidden="true"><span className="hint-m">Wipe the steam off the glass</span><span className="hint-t">Swipe the steam off the glass</span></p>
          <div className="hero-copy">
            <p className="eyebrow"><Mark size={16} />Microcement &amp; Venetian plaster · Newbury</p>
            <h1 className="h1">Seamless wet rooms.<span>Not a drop gets through.</span></h1>
            <p className="lede">Microcement and Venetian plaster for bathrooms, kitchens and walls, laid by James in Newbury, often straight over your old tiles.</p>
            <div className="cta-row">
              <a className="btn btn-water" href="#quote">Get a free quote</a>
              <a className="btn btn-glass" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to James.">WhatsApp James</a>
            </div>
            <a className="rating" href="#reviews"><span className="stars" aria-hidden="true">★</span> 5.0 on Google · 8 reviews</a>
          </div>
        </section>

        {/* REVIEWS STRIP */}
        <section id="reviews" className="sec revs" aria-label="Google reviews">
          <div className="pulls">
            {PULL.map((p, i) => (
              <figure key={p} className="pull" data-r style={{ ['--i' as string]: i }}>
                <blockquote>“{p}”</blockquote><figcaption>{PULL_WHO[i]}</figcaption>
              </figure>
            ))}
          </div>
          <div className="marquee" ref={marquee} tabIndex={0} aria-label="All eight Google reviews, word for word">
            <div className="mq-track">
              {[0, 1].map((n) => (
                <div className="mq-set" key={n} aria-hidden={n === 1}>
                  {reviews.map((r) => (
                    <figure className="rcard" key={r.who}>
                      <span className="stars" aria-label="5 stars">★★★★★</span>
                      <blockquote>“{r.text}”</blockquote>
                      <figcaption><b>{r.who}</b><span>Google review</span></figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="revs-foot"><b>5.0 on Google · 8 reviews</b> <a className="link" href={site.google} target="_blank" rel="noopener">See them on Google →</a></p>
        </section>

        {/* WET ROOMS */}
        <section id="wet-rooms" className="sec sec-dark">
          <div className="sec-head" data-r>
            <p className="kicker">Wet rooms · how it’s done</p>
            <h2 className="h2">From ordinary bathroom <em>to one seamless room.</em></h2>
          </div>
          <Lazy h={1600}><WetRoom /></Lazy>
        </section>

        {/* OVER ALMOST ANYTHING */}
        <section id="over" className="sec">
          <div className="sec-head" data-r>
            <p className="kicker">Tiles, wood, steel, outside</p>
            <h2 className="h2">Over almost <em>anything.</em></h2>
            <p className="sub">Pick a surface. Watch the coat go on. Then see the real job James did on it.</p>
          </div>
          <Lazy h={760}><OverAnything /></Lazy>
        </section>

        {/* TWO FINISHES */}
        <section id="finishes" className="sec sec-stone">
          <div className="sec-head" data-r>
            <p className="kicker">Two finishes</p>
            <h2 className="h2">Microcement <em>or</em> Venetian plaster.</h2>
          </div>
          <div className="duo">
            <article className="fin" data-r>
              <img src="/client/drainer-sm-v1.webp" alt="Microcement worktop with drainer grooves, one of James’s jobs" width={760} height={1013} loading="lazy" />
              <div className="fin-txt">
                <h3 className="h3">Microcement</h3>
                <p>“Sleek, modern seamless microcement floors and walls.” <small>James, on Google</small></p>
                <ul className="ticks"><li>Waterproof, suited to wet areas</li><li>Seamless, no grout lines</li><li>Easy to look after</li><li>Custom colours and textures</li></ul>
                <p className="prod">On his jobs: <b>Luna</b> (outside, Goring) · <b>Rock Plaster</b> (Emma’s bathrooms)</p>
              </div>
            </article>
            <article className="fin" data-r style={{ ['--i' as string]: 1 }}>
              <img src="/client/column-macro-sm-v1.webp" alt="Close-up of green Florenzia Venetian plaster on a column, one of James’s jobs" width={760} height={950} loading="lazy" />
              <div className="fin-txt">
                <h3 className="h3">Venetian plaster</h3>
                <p>“Luxurious, handcrafted Venetian plaster finishes.” <small>James, on Google</small></p>
                <ul className="ticks"><li>Traditional finish, laid by hand</li><li>Statement feature walls</li><li>For homes and commercial spaces</li><li>Custom colours and textures</li></ul>
                <p className="prod">On his jobs: <b>Florenzia</b> (steel columns)</p>
              </div>
            </article>
          </div>
          <div className="sec-head tone-head" data-r>
            <p className="kicker">Pick your tone</p>
            <h2 className="h2">Your colour, <em>not a catalogue’s.</em></h2>
          </div>
          <Lazy h={640}><Tone /></Lazy>
        </section>

        {/* PROJECTS */}
        <section id="work" className="sec">
          <div className="sec-head" data-r>
            <p className="kicker">Four jobs, in his words</p>
            <h2 className="h2">The work <em>does the talking.</em></h2>
          </div>
          <div className="stories">
            {[
              { img: 'goring-house', w: 1600, h: 1164, k: 'Outdoor · Goring, near Reading', t: '150 m², outside', d: '150 m² of Luna microcement applied externally in Goring, near Reading.' },
              { img: 'worktop-after', w: 1440, h: 1920, k: 'Microcement overlay', t: 'Old wood and tiles, coated over', d: 'Microcement applied over the existing wooden worktops and tiles, plus custom-fitted 30mm MDF worktops with drainer grooves for the utility area.' },
              { img: 'bath-finished', w: 1440, h: 1920, k: 'Microcement walls & floor', t: 'Tinted to Hammock No. 38', d: 'Microcement tinted to Farrow & Ball Hammock No. 38, with a refined, subtly smooth texture on the walls and the floor.' },
              { img: 'columns-floor', w: 1440, h: 1800, k: 'Venetian plaster', t: 'Steel columns, polished green', d: 'Florenzia Venetian plaster applied to steel columns.' },
            ].map((s, i) => (
              <article className={`story ${i % 2 ? 'flip' : ''}`} key={s.img} data-r>
                <div className="story-img"><img src={`/client/${s.img}-v1.webp`} alt={`${s.t}: one of James’s jobs`} width={s.w} height={s.h} loading="lazy" decoding="async" /></div>
                <div className="story-txt"><span className="snum">0{i + 1}</span><p className="kicker">{s.k}</p><h3 className="h3">{s.t}</h3><p>{s.d}</p></div>
              </article>
            ))}
          </div>
          <p className="swipe-note">Swipe for all four jobs →</p>
          <Lazy h={700}><Gallery /></Lazy>
        </section>

        {/* ABOUT */}
        <section id="james" className="sec sec-dark about">
          <div className="about-grid">
            <div className="mono" data-r aria-hidden="true"><i className="ring" /><span>J</span></div>
            <div data-r>
              <p className="kicker">Who’ll be in your house</p>
              <h2 className="h2">James. <em>Jimmy, to some.</em></h2>
              <p className="sub">His customers keep using the same words. Punctual. Tidy. Respectful and kind. Good value. A man who “works extremely hard, taking great care to create a great finish”, and who “went above and beyond to make sure everything was perfect”.</p>
              {/* TODO(Dan): confirm this note with James, or delete it. */}
              <blockquote className="note">“I’d rather spend an extra hour on the edges than have you notice them later.”<cite>Draft note, for James to approve</cite></blockquote>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section id="quote" className="sec sec-stone">
          <div className="quote-grid">
            <div data-r>
              <p className="kicker">Free quote · no prices online</p>
              <h2 className="h2">Tell James about the room. <em>Five quick taps.</em></h2>
              <p className="sub">It lands on his WhatsApp with everything filled in. He’ll get back to you himself.</p>
              <ul className="contact">
                <li><a href={`tel:+${site.phoneIntl}`}>{site.phone}</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                <li>{site.hours}</li>
              </ul>
            </div>
            <Lazy h={460}><Planner /></Lazy>
          </div>
        </section>

        {/* FAQ */}
        <section className="sec faq">
          <div className="sec-head" data-r>
            <p className="kicker">Straight answers</p>
            <h2 className="h2">What people <em>ask James.</em></h2>
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
          <div className="fin-surface" aria-hidden="true"><i className="drop" /></div>
          <h2 className="h-fin" data-r>Not a drop gets through.<br /><em>Not a corner gets missed.</em></h2>
          <div className="cta-row center" data-r>
            <a className="btn btn-water" href={wa(WA_HI)} target="_blank" rel="noopener" data-tip="Goes straight to James.">WhatsApp James</a>
            <a className="btn btn-glass" href="#quote">Get a free quote</a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand"><Mark size={48} /><p><b>Microcement &amp; Venetian Surfaces</b><br />Newbury, West Berkshire</p></div>
          <div><b>Talk to James</b><p><a href={`tel:+${site.phoneIntl}`}>{site.phone}</a><br /><a href={`mailto:${site.email}`}>{site.email}</a><br />{site.hours}</p></div>
          <div><b>See more</b><p><a href={site.instagram} target="_blank" rel="noopener">Instagram @microcement_venetian</a><br /><a href={site.google} target="_blank" rel="noopener">Google reviews (5.0 · 8)</a></p></div>
        </div>
        <p className="foot-fine">Demo site by Clientgateway. Photos from microcement-venetian.com, reviews from Google, word for word; illustrations are labelled. Not live, not indexed.</p>
      </footer>

      <nav className={`dock ${dock ? 'show' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}>Call</a>
        <a href={wa(WA_HI)} target="_blank" rel="noopener" className="dock-wa">WhatsApp</a>
        <a href="#quote">Quote</a>
      </nav>
    </>
  );
}
