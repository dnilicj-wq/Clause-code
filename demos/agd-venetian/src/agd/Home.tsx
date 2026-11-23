import { useEffect, useRef, useState } from 'react';
import { site, wa, reviews, pulls, shots, img, type Cat, type Shot } from './data';
import { Planner } from './Planner';
import { venetianPlaster } from '../../config/trades/venetian-plaster';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const hello = 'Hi, I found AGD Venetian Plastering online. Could you give me a quote?';

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    if (reduce()) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

const Stars = () => <span className="stars" aria-hidden="true">{'★★★★★'}</span>;
const Wa = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.5-.3Z" /></svg>;
const Phone = () => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>;

// Signature 1: "Polish the wall". A procedural plaster wall (no photo) starts matte; dragging trowels it to gloss.
const TONES = [
  { n: 'Marble white', a: '#F5F6F6', b: '#C5CBD1', v: '#8B9096' },   // cool white, soft grey veins
  { n: 'Warm greige', a: '#E3D6C4', b: '#C2AE96', v: '#7E6652' },    // sand/greige, taupe veins
  { n: 'Burgundy vein', a: '#F5EFE3', b: '#CFBEA6', v: '#721036' },  // ivory, AGD berry veins
];
type Api = { clean: () => void; setTone: (t: { a: string; b: string; v: string }) => void; destroy: () => void };
function Hero() {
  const host = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const [tone, setTone] = useState(2);   // open on Burgundy vein: AGD's brand colour, the most colour on load
  const [gl, setGl] = useState(false);
  const [hint, setHint] = useState<'off' | 'on' | 'gone'>('off');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const h = host.current, c = cv.current; if (!h || !c) return;
    let cancelled = false, cleanT = 0;
    const go = () => import('./polish').then(({ initPolish }) => {
      if (cancelled) return;
      const coarse = matchMedia('(pointer: coarse)').matches, rm = reduce();
      const wallRect = () => {
        const hr = h.getBoundingClientRect(), cr = card.current?.getBoundingClientRect();
        if (!cr) return hr;
        return cr.width > hr.width * .7
          ? new DOMRect(hr.left, hr.top + 70, hr.width, Math.max(0, cr.top - hr.top - 80)) // phone: wall above the card, below the nav
          : new DOMRect(cr.right, hr.top + 80, Math.max(0, hr.right - cr.right), hr.height - 100);
      };
      api.current = initPolish({ canvas: c, host: h, wallRect, tone: TONES[2], reduced: rm, coarse,
        onDone: () => { setDone(true); setHint('gone'); }, onFirstTouch: () => setHint('gone') });
      if (api.current) setGl(true);
      // no loader: the hazy wall shows for a moment, then the layered clean starts
      cleanT = window.setTimeout(() => api.current?.clean(), 1200);
    });
    // after first paint, so the static wall and headline paint first
    const id = requestAnimationFrame(() => setTimeout(go, 60));
    return () => { cancelled = true; clearTimeout(cleanT); cancelAnimationFrame(id); api.current?.destroy(); api.current = null; };
  }, []);
  const pick = (i: number) => {
    const t = TONES[i], h = host.current; setTone(i); api.current?.setTone(t);
    if (h) { h.style.setProperty('--mA', t.a); h.style.setProperty('--mB', t.b); h.style.setProperty('--mV', t.v); } // CSS fallback wall
  };
  return (
    <section id="top" ref={host} className={`hero${gl ? ' gl' : ''}${done ? ' done' : ''}`} aria-labelledby="h1">
      <canvas ref={cv} className="wall" aria-hidden="true" />
      <p className={`hint ${hint}`} aria-hidden="true">Drag to polish <span>↔</span></p>
      <div className="hero-card" ref={card}>
        <h1 id="h1" className="h1">Walls that hold the light.</h1>
        <p className="lede">Venetian polished plaster across Essex and London.</p>
        <div className="cta">
          <a className="btn btn-berry" href="#quote">Get a quote</a>
          <a className="btn btn-ghost" href={wa(hello)} target="_blank" rel="noopener"><Wa />WhatsApp</a>
        </div>
        <div className="tones" role="group" aria-label="Example tones">
          <span className="tones-l">Example tones</span>
          {TONES.map((t, i) => (
            <button key={t.n} type="button" className="tone" aria-pressed={tone === i} aria-label={t.n} title={t.n} onClick={() => pick(i)}
              style={{ background: `linear-gradient(135deg, ${t.a} 0 42%, ${t.v} 50%, ${t.b} 58%)` }} />
          ))}
          <span className="tone-n">{TONES[tone].n}</span>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const [all, setAll] = useState(false);
  return (
    <section className="sec reviews" id="reviews" aria-labelledby="rv-h">
      <div className="wrap">
        <a className="score rv" href={site.google} target="_blank" rel="noopener">
          <b>{site.rating}</b><span><Stars /><span>on Google · {site.reviewCount} reviews</span></span>
        </a>
        <h2 id="rv-h" className="sr">What clients say</h2>
        <div className="pulls">
          {pulls.map((p, i) => (
            <figure key={p.who} className="pull rv" style={{ ['--i' as string]: i }}>
              <blockquote>“{p.q}”</blockquote>
              <figcaption>{p.who}, Google review</figcaption>
            </figure>
          ))}
        </div>
        <button className="btn btn-ghost more" aria-expanded={all} aria-controls="all-reviews" onClick={() => setAll(!all)}>{all ? 'Hide reviews' : 'Read the reviews in full'}</button>
        <div id="all-reviews" className={`full ${all ? 'open' : ''}`} hidden={!all}>
          {reviews.map((r) => (
            <article key={r.name} className="card">
              <header><Stars /><span className="muted small">{r.when}</span></header>
              {r.text.split('\n\n').map((t, i) => <p key={i}>{t}</p>)}
              <footer><b>{r.name}</b><span className="muted small">Google</span></footer>
            </article>
          ))}
          <p className="fine">Copied word for word from Google. Google shows {site.reviewCount} reviews; {reviews.length} are shown here.</p>
        </div>
      </div>
    </section>
  );
}

// Signature 2: the torch test. A light moves across his textured wall so you can see the relief.
function Torch() {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const set = (x: number, y: number) => { el.style.setProperty('--x', `${x * 100}%`); el.style.setProperty('--y', `${y * 100}%`); };
    if (reduce()) { el.classList.add('still'); return; }
    let raf = 0, t0 = 0, user = false, vis = false;
    const loop = (t: number) => {
      if (!t0) t0 = t; const k = (t - t0) / 1000;
      if (!user) set(0.5 + 0.38 * Math.sin(k * 0.7), 0.45 + 0.28 * Math.sin(k * 1.13 + 1));
      if (vis && !user) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf && !user) raf = requestAnimationFrame(loop); });
    io.observe(el);
    let idle = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(); user = true; set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      clearTimeout(idle); idle = window.setTimeout(() => { user = false; t0 = 0; if (vis && !raf) raf = requestAnimationFrame(loop); }, 2500);
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerdown', move);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(idle); el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', move); };
  }, []);
  return (
    <section className="sec torch-sec" aria-labelledby="t-h">
      <div className="wrap torch-grid">
        <div className="rv">
          <h2 id="t-h" className="h2">Shine a torch on it.</h2>
          <p className="lede">Plasterers check a wall with a light held flat against it. Every ridge and ripple shows. Move the light across this wall to see the texture.</p>
          <p className="muted small">An aged, rustic feature wall by AGD Venetian Plastering, built up with layers of material and colour washes. From their Instagram.</p>
        </div>
        <div className="torch rv" ref={box} role="img" aria-label="Close-up of an aged, rustic plaster feature wall, lit by a moving torch">
          <img src="/client/ig-CTMsFWPI3XD-v1.webp" width="900" height="900" alt="" loading="lazy" decoding="async" />
          <div className="torch-dark" /><div className="torch-glow" />
        </div>
      </div>
    </section>
  );
}

const CATS: ('All' | Cat)[] = ['All', 'Bathrooms', 'Feature walls', 'Kitchens', 'Stairs & halls'];
function Work() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState<Shot | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const list = shots.filter((s) => cat === 'All' || s.cat === cat);
  const shown = more ? list : list.slice(0, 12);
  useEffect(() => { if (open) dlg.current?.showModal(); }, [open]);
  return (
    <section className="sec work" id="work" aria-labelledby="w-h">
      <div className="wrap">
        <h2 id="w-h" className="h2 rv">Recent walls.</h2>
        <p className="lede rv">Real jobs from the AGD Instagram and Google page. Tap any photo to see it bigger.</p>
        <div className="chips filters" role="tablist" aria-label="Filter photos">
          {CATS.map((c) => <button key={c} role="tab" aria-selected={cat === c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => { setCat(c); setMore(false); }}>{c}</button>)}
        </div>
        <div className="masonry">
          {shown.map((s) => (
            <button key={s.id} className="tile" onClick={() => setOpen(s)} aria-label={`Open photo: ${s.alt}`}>
              <img src={img(s, true)} srcSet={`${img(s, true)} 480w, ${img(s)} 900w`} sizes="(min-width:1100px) 25vw, (min-width:700px) 33vw, 50vw" width={s.w} height={s.h} alt={s.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
        {list.length > 12 && !more && <button className="btn btn-ghost more" onClick={() => setMore(true)}>Show all {list.length} photos</button>}
        <p className="muted small src-note">Photos: <a href={site.instagram} target="_blank" rel="noopener">@agd_venetian_plastering</a> and the AGD Google listing.</p>
      </div>
      <dialog ref={dlg} className="lb" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}>
        {open && <>
          <img src={img(open)} width={open.w} height={open.h} alt={open.alt} />
          <p>{open.alt}. <span className="muted">From {open.src === 'Google' ? 'Google' : 'Instagram'}.</span></p>
          <button className="lb-x" onClick={() => dlg.current?.close()} aria-label="Close photo">×</button>
        </>}
      </dialog>
    </section>
  );
}

function What() {
  const tiles = [
    { t: 'Homes', d: 'Feature walls, media walls, bathrooms, kitchens and stairs.', s: 'CI1NiYOn3JA' },
    { t: 'Commercial spaces', d: 'Restaurants, hotels and other businesses, as well as homes. This one is a photography and event studio.', s: 'C40Ke-JoQct' },
    { t: 'Custom art pieces', d: 'One-off pieces worked into the plaster, like this bronze logo for a dentist.', s: 'C35yuC1oQz5' },
  ];
  return (
    <section className="sec what" aria-labelledby="wh-h">
      <div className="wrap">
        <h2 id="wh-h" className="h2 rv">One trade, done properly.</h2>
        <p className="lede rv">AGD is a Venetian plaster specialist. These are the jobs they take on.</p>
        <div className="bento">
          {tiles.map((x, i) => (
            <article key={x.t} className={`b b${i} rv`}>
              <img src={`/client/ig-${x.s}-s-v1.webp`} srcSet={`/client/ig-${x.s}-s-v1.webp 480w, /client/ig-${x.s}-v1.webp 900w`} sizes="(min-width:900px) 40vw, 100vw" alt="" loading="lazy" decoding="async" />
              <div><h3>{x.t}</h3><p>{x.d}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Areas() {
  return (
    <section className="sec areas" aria-labelledby="ar-h">
      <div className="wrap rv">
        <p className="kick">Where AGD works</p>
        <h2 id="ar-h" className="h2">Essex and London.</h2>
        <p className="lede">Not sure if you're covered? Put your postcode in the planner below and AGD will tell you.</p>
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="sec quote" id="quote" aria-labelledby="q-h">
      <div className="wrap quote-grid">
        <div className="rv">
          <h2 id="q-h" className="h2">Plan your wall in five taps.</h2>
          <p className="lede">Room, finish, size, postcode, name. It opens WhatsApp with everything filled in, so AGD can reply with a proper quote.</p>
          <p className="muted small">Rather talk? Call <a href={`tel:+${site.phoneIntl}`}>{site.phone}</a>.</p>
        </div>
        <Planner />
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="sec faq" aria-labelledby="f-h">
      <div className="wrap narrow">
        <h2 id="f-h" className="h2 rv">Good to know.</h2>
        {venetianPlaster.faq.map((f) => (
          <details key={f.q} className="rv"><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
        <p className="fine">General answers about Venetian plaster. Ask AGD about your own walls.</p>
      </div>
    </section>
  );
}

// Finale: a single pendant bulb lights the last call to action.
function Finale() {
  return (
    <section className="finale" aria-labelledby="fin-h">
      <div className="lamp" aria-hidden="true"><i className="cord" /><i className="bulb-f" /><i className="cone" /></div>
      <div className="fin-copy rv">
        <h2 id="fin-h" className="h2">Got a wall in mind?</h2>
        <p className="lede">Send a photo of the room and a rough idea. AGD will get back to you.</p>
        <div className="cta center">
          <a className="btn btn-berry" href="#quote">Get a quote</a>
          <a className="btn btn-glass" href={wa(hello)} target="_blank" rel="noopener"><Wa />WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useReveal();
  const [dock, setDock] = useState(false);
  useEffect(() => {
    // Not getElementById: the prerendered shell (removed after mount) also has a #top.
    const top = document.querySelector('#root > div:not(#shell) #top'); if (!top) return;
    const io = new IntersectionObserver(([e]) => setDock(!e.isIntersecting), { threshold: 0.1 });
    io.observe(top); return () => io.disconnect();
  }, []);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <a href="#top" className="logo" aria-label="AGD Venetian Plastering, home"><img src="/client/logo-v1.webp" width="481" height="235" alt="AGD Venetian Plastering" /></a>
        <nav aria-label="Main">
          <a className="nl" href="#work">Work</a>
          <a className="nl" href="#reviews">Reviews</a>
          <a className="btn btn-sm btn-glass" href={`tel:+${site.phoneIntl}`} aria-label={`Call ${site.phone}`}><Phone /><span>{site.phone}</span></a>
        </nav>
      </header>
      <main id="main">
        <Hero />
        <Reviews />
        <Work />
        <Torch />
        <What />
        <Areas />
        <Quote />
        <Faq />
        <Finale />
      </main>
      <footer className="foot">
        <img src="/client/logo-v1.webp" width="160" height="78" alt="AGD Venetian Plastering" loading="lazy" />
        <p><a href={`tel:+${site.phoneIntl}`}>{site.phone}</a> · <a href={site.instagram} target="_blank" rel="noopener">Instagram</a></p>
        <p className="fine">Demo site by Clientgateway for AGD Venetian Plastering. Photos and reviews belong to AGD and their clients.</p>
      </footer>
      <nav className={`dock ${dock ? 'on' : ''}`} aria-label="Quick contact">
        <a href={`tel:+${site.phoneIntl}`}><Phone />Call</a>
        <a href={wa(hello)} target="_blank" rel="noopener"><Wa />WhatsApp</a>
        <a href="#quote" className="q">Quote</a>
      </nav>
    </>
  );
}
