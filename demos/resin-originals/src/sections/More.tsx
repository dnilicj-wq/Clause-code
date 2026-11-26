// New sections from Dean's 24 Nov change list: floor designer, prep & screeding, commercial, gallery.
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { IconBrandWhatsapp, IconPlayerPlayFilled, IconX } from '@tabler/icons-react';
import { useSite } from '@/src/lib/ctx';
import { waLink } from './wa';
import { PALETTES } from './pour';
import { GALLERY } from './jobs';
import type { Kind, Pal4 } from './config';

const ease = [0.22, 1, 0.36, 1] as const;
function useRise() {
  const reduce = useReducedMotion();
  return (d = 0) => (reduce ? {} : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-10%' }, transition: { duration: 0.7, delay: d, ease } });
}

/* ---------- Design your floor: example rooms (Sentech scenes), only the floor re-surfaced live in WebGL2 ---------- */
const ROOMS = [{ k: 'kitchen', l: 'Kitchen' }, { k: 'living', l: 'Living room' }, { k: 'garage', l: 'Garage' }, { k: 'commercial', l: 'Commercial' }];
type Col = { n: string; p: Pal4 };
const KINDS: { k: Kind; l: string; cols: Col[] }[] = [
  { k: 0, l: 'Metallic', cols: PALETTES.map((x) => ({ n: x.key === 'bluequartz' ? 'Blue' : x.name, p: x.pal as Pal4 })) },
  { k: 1, l: 'Flake', cols: [
    { n: 'Grey mix', p: ['#2b2d30', '#7d8085', '#d8d9db', '#111214'] },
    { n: 'Beige mix', p: ['#5a4632', '#a8927a', '#e6dccd', '#2a2018'] },
    { n: 'Blue mix', p: ['#1d3557', '#6b7f99', '#dfe5ec', '#0e1520'] }] },
  { k: 2, l: 'Quartz', cols: [
    { n: 'Grey', p: ['#3a3b3d', '#8d8f92', '#c9cacc', '#f0f0ef'] },
    { n: 'Blue', p: ['#2a3f5e', '#5f7fa8', '#a9bdd6', '#e8eef7'] },
    { n: 'Sand', p: ['#6b5a43', '#b39f80', '#dccdb3', '#f4ede0'] }] },
  { k: 3, l: 'High build industrial resin', cols: [
    { n: 'Mid grey', p: ['#8b8e90', '#8b8e90', '#8b8e90', '#8b8e90'] },
    { n: 'Dark grey', p: ['#55585b', '#55585b', '#55585b', '#55585b'] },
    { n: 'Light grey', p: ['#b9bbbc', '#b9bbbc', '#b9bbbc', '#b9bbbc'] }] },
];
const chipBg = (p: Pal4) => `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 45%, ${p[2]} 75%, ${p[3]} 100%)`;
type Scene = { setRoom: (a: string) => Promise<void>; setFinish: (k: Kind, p: Pal4) => void; preload: (a: string[]) => void };

export function DesignFloor() {
  const { site } = useSite();
  const rise = useRise();
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Scene | null>(null);
  const [room, setRoom] = useState('kitchen');
  const [kind, setKind] = useState(0);
  const [col, setCol] = useState(0);
  const [live, setLive] = useState(false);
  const K = KINDS[kind], C = K.cols[Math.min(col, K.cols.length - 1)];

  useEffect(() => { // engine loads only when the section is near the screen
    const el = host.current; if (!el) return;
    let dead = false;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      try {
        const { createScene } = await import('./config');
        if (dead) return;
        eng.current = createScene(el, '/client/rooms/');
        setLive(true);
      } catch { /* no WebGL2: the example room photo stays */ }
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => { dead = true; io.disconnect(); };
  }, []);
  useEffect(() => { const s = eng.current; if (!s) return; s.setRoom(room).then(() => s.preload(ROOMS.map((r) => r.k))); }, [room, live]);
  useEffect(() => { eng.current?.setFinish(K.k, C.p); }, [K, C, live]);

  const text = `Hi Dean, I tried the floor designer on your website. I like ${K.l.toLowerCase()} in ${C.n.toLowerCase()}, for a ${ROOMS.find((r) => r.k === room)!.l.toLowerCase()}. Can we talk about it?`;
  return (
    <section id="design" aria-label="Design your floor" className="section">
      <div className="wrap">
        <motion.h2 {...rise()} className="h2">Design your floor.</motion.h2>
        <motion.p {...rise(0.05)} className="lede mt-4">Pick a room, a finish and a colour. Then send it to Dean and he'll work out the real thing with you.</motion.p>
        <div className="des">
          <div ref={host} className={`des__stage ${live ? 'is-live' : ''}`}>
            <img src={`/client/rooms/${room}.webp`} alt={`Example ${ROOMS.find((r) => r.k === room)!.l.toLowerCase()}`} loading="lazy" decoding="async" />
            <span className="ex-tag" style={{ left: 10, top: 10 }}>Visualisation</span>
          </div>
          <div className="des__ui">
            <p className="des__lbl">Room</p>
            <div className="des__row" role="group" aria-label="Room">
              {ROOMS.map((r) => <button key={r.k} type="button" aria-pressed={room === r.k} className={`chip ${room === r.k ? 'is-on' : ''}`} onClick={() => setRoom(r.k)}>{r.l}</button>)}
            </div>
            <p className="des__lbl">Finish</p>
            <div className="des__row" role="group" aria-label="Finish">
              {KINDS.map((k, i) => <button key={k.l} type="button" aria-pressed={kind === i} className={`chip ${kind === i ? 'is-on' : ''}`} onClick={() => { setKind(i); setCol(0); }}>{k.l}</button>)}
            </div>
            <p className="des__lbl">Colour: <span>{C.n}</span></p>
            <div className="des__cols" role="group" aria-label="Colour">
              {K.cols.map((c, i) => <button key={c.n} type="button" aria-pressed={col === i} aria-label={c.n} title={c.n} className={`swatch ${col === i ? 'is-on' : ''}`} style={{ background: chipBg(c.p) }} onClick={() => setCol(i)} />)}
            </div>
            <a className="btn btn--gold btn--wide mt-6" href={waLink(site.whatsapp, text)} target="_blank" rel="noopener">
              <IconBrandWhatsapp size={19} stroke={1.6} aria-hidden /> Send this design to Dean
            </a>
            <p className="fine">Example rooms, not our jobs. Colours on screen are a guide; every floor is mixed with you.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Prep & screeding: illustrated steps (no prep photos from Dean). General wording only, no machines/brands/depths. ---------- */
const LAYERS = ['Resin', 'Screed', 'Primer', 'Sub base'];
const STEPS = [
  { t: 'Check the sub base', d: 'Concrete, timber, or a mix of both in joining rooms. We look at what is there first.', on: 3 },
  { t: 'Prepare the surface', d: 'Ground or cleaned back, so the resin has something sound to bond to.', on: 3 },
  { t: 'Repair', d: 'Cracks and holes are filled before anything goes on top.', on: 3 },
  { t: 'Prime', d: 'A primer coat goes down first.', on: 2 },
  { t: 'Screed and level', d: 'Where the floor is uneven, it is screeded and levelled.', on: 1 },
  { t: 'Then the resin', d: 'Your finish goes down on a sound, level base.', on: 0 },
];
/* Prep video slot. Dean sends his prep video by Friday: drop the files in public/client/dean/prep/ (see README), then set PREP_VID = 'prep'. */
const PREP_VID: string = '';
function PrepVideo() {
  const v = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const base = '/client/dean/prep/';
  return (
    <figure className={`pvid ${PREP_VID ? '' : 'pvid--still'}`}>
      {PREP_VID ? (<>
        <video ref={v} className="pvid__v" poster={`${base}${PREP_VID}-poster.webp`} preload="none" playsInline controls={on} onEnded={() => setOn(false)}>
          <source src={`${base}${PREP_VID}-720.mp4`} type="video/mp4" media="(max-width: 767px)" />
          <source src={`${base}${PREP_VID}-1080.mp4`} type="video/mp4" />
        </video>
        {!on && <button type="button" className="pvid__play" onClick={() => { setOn(true); v.current?.play(); }} aria-label="Play the prep video"><IconPlayerPlayFilled size={28} /></button>}
      </>) : (<>
        <img className="pvid__v" src={`${base}prep-still.webp`} alt="Floor grinder preparing a bare concrete slab, a still from one of Dean's videos" width={960} height={540} loading="lazy" decoding="async" />
        <span className="ex-tag" style={{ left: 12, top: 12 }}>Video coming soon</span>
      </>)}
    </figure>
  );
}

export function Prep() {
  const { site } = useSite();
  const rise = useRise();
  return (
    <section id="prep" aria-label="Prep and screeding" className="section section--alt">
      <div className="wrap">
        <motion.p {...rise()} className="eyebrow" style={{ color: 'var(--accent2)' }}>Before the resin</motion.p>
        <motion.h2 {...rise(0.03)} className="h2 mt-3">Prep and screeding.</motion.h2>
        <motion.p {...rise(0.06)} className="lede mt-4">The part you never see once the floor is down. Surface prep, repairs, priming, and screeding or levelling where it's needed.</motion.p>
        <motion.div {...rise(0.08)}><PrepVideo /></motion.div>
        <ol className="prep">
          {STEPS.map((s, i) => (
            <motion.li {...rise(0.04 * i)} key={s.t} className="prep__step">
              <div className="stack" aria-hidden>
                {LAYERS.map((l, n) => <span key={l} className={`stack__l stack__l--${n} ${n === s.on ? 'is-on' : n < s.on ? 'is-off' : ''}`}>{n === s.on ? l : ''}</span>)}
              </div>
              <p className="prep__n">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="prep__t">{s.t}</h3>
              <p className="prep__d">{s.d}</p>
            </motion.li>
          ))}
        </ol>
        <a className="btn btn--ghost mt-8" href={waLink(site.whatsapp, 'Hi Dean, I have a question about prep or screeding before a resin floor.')} target="_blank" rel="noopener">
          <IconBrandWhatsapp size={19} stroke={1.6} aria-hidden /> Ask about prep or screeding
        </a>
        {/* TODO(Dan): swap in Dean's own prep photos if he sends any. No depths, machines, brands or guarantees until he states them. */}
      </div>
    </section>
  );
}

/* ---------- Commercial: Higgsfield example images, always tagged "Example finish", never presented as his jobs ---------- */
const EX = [
  { k: 'warehouse', c: 'Warehouse aisle, gloss grey with safety lines' },
  { k: 'factory', c: 'Factory floor' },
  { k: 'workshop', c: 'Workshop' },
  { k: 'unit', c: 'Industrial unit, high build industrial resin' },
];
export function Commercial() {
  const { site } = useSite();
  const rise = useRise();
  return (
    <section id="commercial" aria-label="Commercial floors" className="section">
      <div className="wrap">
        <motion.p {...rise()} className="eyebrow" style={{ color: 'var(--accent2)' }}>Commercial</motion.p>
        <motion.h2 {...rise(0.03)} className="h2 mt-3">Factories, warehouses and workshops.</motion.h2>
        <motion.p {...rise(0.06)} className="lede mt-4">Mainly across the Midlands and the North, and UK-wide for bigger jobs.</motion.p>
        <div className="com">
          {EX.map((x, i) => (
            <motion.figure {...rise(0.05 * i)} key={x.k} className="com__fig">
              <div className="com__img">
                <img src={`/client/dean/ex-${x.k}-1280.webp`} srcSet={`/client/dean/ex-${x.k}-640.webp 640w, /client/dean/ex-${x.k}-1280.webp 1280w`}
                  sizes="(min-width: 900px) 50vw, 100vw" alt={`Example finish: ${x.c.toLowerCase()} (generated image, not one of our jobs)`} loading="lazy" decoding="async" />
                <span className="ex-tag" style={{ right: 10, top: 10 }}>Example finish</span>
              </div>
              <figcaption>{x.c}</figcaption>
            </motion.figure>
          ))}
        </div>
        <a className="btn btn--gold mt-8" href={waLink(site.whatsapp, "Hi Dean, I'd like to discuss a commercial floor.\nType of site: \nRough size: \nLocation: ")} target="_blank" rel="noopener">
          <IconBrandWhatsapp size={19} stroke={1.6} aria-hidden /> Discuss a commercial project
        </a>
      </div>
    </section>
  );
}

/* ---------- Gallery: the rest of Dean's photos, tap for full size ---------- */
export function Gallery() {
  const rise = useRise();
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const show = (i: number) => { setOpen(i); dlg.current?.showModal(); };
  const g = open === null ? null : GALLERY[open];
  return (
    <section id="gallery" aria-label="Gallery" className="section">
      <div className="wrap">
        <motion.h2 {...rise()} className="h2">More of our floors.</motion.h2>
        <motion.p {...rise(0.05)} className="lede mt-4">Straight from Dean's phone. Tap any photo to see it bigger.</motion.p>
        <div className="gal">
          {GALLERY.map((x, i) => (
            <button key={x.slug} type="button" className="gal__b" onClick={() => show(i)} aria-label={`Open photo: ${x.alt}`}>
              <img src={`/client/dean/${x.slug}-640.webp`} alt={x.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      </div>
      <dialog ref={dlg} className="lb" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }}>
        {g && <img src={`/client/dean/${g.slug}-1280.webp`} srcSet={`/client/dean/${g.slug}-1280.webp 1280w, /client/dean/${g.slug}-1600.webp 1600w`} sizes="100vw" alt={g.alt} />}
        <button type="button" className="lb__x" onClick={() => dlg.current?.close()} aria-label="Close"><IconX size={22} /></button>
      </dialog>
    </section>
  );
}
