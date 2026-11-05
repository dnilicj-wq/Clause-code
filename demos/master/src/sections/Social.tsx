import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { useSite } from '@/src/lib/ctx';
import { CircularGallery, type GalleryItem } from '@/components/library/circular-gallery/CircularGallery';
import { AnimatedTestimonials } from '@/components/library/animated-testimonials/AnimatedTestimonials';
import { BorderBeam } from '@/components/library/border-beam/BorderBeam';
import { LampContainer } from '@/components/library/lamp/Lamp';
import { MetalCTA } from '@/components/library/liquid-metal-button/MetalCTA';
import { Mark } from './Chrome';

export function Gallery() {
  const { trade } = useSite();
  const [r, setR] = useState(600);
  useEffect(() => { const f = () => setR(innerWidth < 700 ? 400 : innerWidth < 1100 ? 480 : 620); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  const items: GalleryItem[] = [
    ...trade.finishes.map((f) => ({ common: f.name, binomial: f.note, photo: { url: `/demo/look-${f.key}-v1.webp`, text: `${f.name} resin finish, example render`, by: 'Example render' } })),
    { common: 'Gloss workshop floor', binomial: 'Commercial unit', photo: { url: '/demo/unit-gloss-800-v1.webp', text: 'Gloss resin floor in a commercial unit (example image)', by: 'Example image · Pexels' } },
    { common: 'Hangar floor', binomial: 'Light grey gloss', photo: { url: '/demo/hangar-gloss-800-v1.webp', text: 'Gloss floor in an aircraft hangar (example image)', by: 'Example image · Pexels' } },
    { common: 'Warehouse floor', binomial: 'Mirror finish', photo: { url: '/demo/warehouse-gloss-800-v1.webp', text: 'Gloss warehouse floor (example image)', by: 'Example image · Pexels' } },
    { common: 'Studio floor', binomial: 'Reflective grey', photo: { url: '/demo/studio-gloss-800-v1.webp', text: 'Reflective grey studio floor (example image)', by: 'Example image · Pexels' } },
  ];
  return (
    <section id="gallery" aria-label="Finishes" className="relative overflow-hidden" style={{ background: 'var(--bg2)' }}>
      <div className="section wrap pb-0">
        <p className="eyebrow">Finishes</p>
        <h2 className="h2 mt-4 max-w-[13ch]">Pick a look. <span className="serif" style={{ color: 'var(--accent2)' }}>Every pour is one-off.</span></h2>
      </div>
      <div className="h-[440px] origin-center scale-[.72] md:h-[640px] md:scale-100"><CircularGallery items={items} radius={r} autoRotateSpeed={0.04} /></div>
      <div className="wrap px-5 pb-[clamp(72px,10vw,140px)] md:px-16"><BeforeAfter /></div>
    </section>
  );
}

// Pour-wipe before/after: drag to wipe resin over bare concrete (illustration, not a customer job).
function BeforeAfter() {
  const [x, setX] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { once: true, margin: '-20%' });
  useEffect(() => {
    if (!inView) return;
    let t0 = 0; let raf = 0;
    const f = (t: number) => { if (!t0) t0 = t; const k = Math.min(1, (t - t0) / 1600); setX(15 + 70 * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [inView]);
  const move = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); setX(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); };
  return (
    <div ref={box} onPointerMove={(e) => (e.buttons || e.pointerType === 'mouse') && move(e)} onPointerDown={move}
      className="relative mt-4 aspect-[16/9] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[var(--radius)] border md:aspect-[21/9]" style={{ borderColor: 'var(--line)' }}>
      <img src="/demo/ba-before-v1.webp" alt="Bare cracked concrete before coating (illustration)" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${x}%)` }}>
        <img src="/demo/ba-after-v1.webp" alt="Same floor with a copper metallic resin finish (illustration)" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="absolute inset-y-0 w-[3px]" style={{ left: `${x}%`, background: 'var(--accent)', boxShadow: '0 0 20px var(--accent)' }}>
        <div className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[14px] font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>⇆</div>
      </div>
      <span className="ex-tag left-3 top-3">Before</span><span className="ex-tag right-3 top-3">After</span>
      <span className="ex-tag bottom-3 left-3">Illustration</span>
    </div>
  );
}

export function Reviews() {
  const { site } = useSite();
  const real = site.reviews.filter((r) => r.source !== 'Example');
  const list = real.length ? real : site.reviews;
  const imgs = ['/demo/look-graphite-flake-v1.webp', '/demo/look-copper-metallic-v1.webp', '/demo/look-storm-solid-v1.webp', '/demo/look-pearl-metallic-v1.webp'];
  const t = list.map((r, i) => ({
    quote: r.text,
    name: r.source === 'Example' ? `${r.name} (example)` : r.name,
    designation: [r.job, r.town, r.source === 'Example' ? 'Example review' : `${r.source} review`].filter(Boolean).join(' · '),
    src: imgs[i % imgs.length],
  }));
  return (
    <section id="reviews" aria-label="Reviews" className="section">
      <div className="wrap">
        <p className="eyebrow">Reviews {site.demo && '(example)'}</p>
        <h2 className="h2 mt-4 max-w-[14ch]">What customers <span className="serif" style={{ color: 'var(--accent2)' }}>say after.</span></h2>
        {site.demo && <p className="lede mt-4 text-[14px]">These are layout examples. Real reviews are added word for word, each linked to where it was posted.</p>}
      </div>
      <div className="max-md:[&_.h-80]:!h-56 max-md:[&_.gap-20]:!gap-8 [&_h3]:!text-[var(--ink)] [&_p]:!text-[var(--muted)] [&_.text-lg]:!text-[var(--ink)] [&_button]:!bg-white/10 [&_svg]:!text-[var(--ink)]">
        <AnimatedTestimonials testimonials={t} autoplay />
      </div>
    </section>
  );
}

export function Owner() {
  const { site } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25%' });
  const initials = site.owner.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <section aria-label="Owner" className="section" style={{ background: 'var(--bg2)' }}>
      <div ref={ref} className="wrap grid items-center gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
        <div className="relative mx-auto aspect-square w-full max-w-[280px] md:aspect-[4/5] md:max-w-[420px] overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)', background: 'radial-gradient(120% 90% at 30% 20%, var(--surface), var(--bg))' }}>
          {site.owner.photo ? <img src={site.owner.photo} alt={`${site.owner.name}, owner of ${site.company}`} className="h-full w-full object-cover" /> : (
            <div className="grid h-full place-items-center">
              <div className="text-center">
                <div className="mx-auto grid h-36 w-36 place-items-center rounded-full font-display text-[64px] font-semibold" style={{ background: 'linear-gradient(145deg, var(--metal2), var(--metal1) 50%, var(--metal0))', color: 'var(--bg)' }}>{initials}</div>
                <p className="mt-5 text-[13px] uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>Your photo here</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <p className="eyebrow">Who turns up</p>
          <h2 className="h2 mt-4 max-w-[14ch]">You deal with {site.owner.first}, <span className="serif" style={{ color: 'var(--accent2)' }}>start to finish.</span></h2>
          <p className="lede mt-5">Example owner note. Replace with the business's own words: who they are, how long they have done this, and what they promise on every job.</p>
          <Signature name={site.owner.signature} play={inView} />
        </div>
      </div>
    </section>
  );
}

function Signature({ name, play }: { name: string; play: boolean }) {
  // self-drawing signature: the name is drawn in a handwriting face with an animated stroke
  return (
    <svg viewBox="0 0 360 110" className="mt-6 h-[90px] w-[300px]" aria-label={`Signed, ${name}`}>
      <motion.text x="6" y="74" fontFamily="Caveat, cursive" fontSize="72" fill="none" stroke="var(--accent2)" strokeWidth="1.4"
        initial={{ strokeDasharray: 900, strokeDashoffset: 900, fillOpacity: 0 }}
        animate={play ? { strokeDashoffset: 0, fillOpacity: 1 } : {}}
        transition={{ strokeDashoffset: { duration: 2.4, ease: 'easeInOut' }, fillOpacity: { delay: 2, duration: 0.8 } }}
        style={{ fill: 'var(--accent2)' }}>{name}</motion.text>
      <motion.path d="M10 92 C 90 84, 200 100, 300 86" fill="none" stroke="var(--accent2)" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={play ? { pathLength: 1 } : {}} transition={{ delay: 1.6, duration: 0.9 }} />
    </svg>
  );
}

export function Guarantee() {
  const { site } = useSite();
  return (
    <section aria-label="Guarantee" className="section">
      <div className="wrap">
        <div className="relative mx-auto max-w-[860px] overflow-hidden rounded-[var(--radius)] border p-8 text-center md:p-14" style={{ borderColor: 'var(--line)', background: 'linear-gradient(160deg, var(--surface), var(--bg2))' }}>
          <Mark size={44} />
          <h2 className="mt-5 font-display text-[clamp(30px,4.4vw,52px)] font-semibold leading-tight">{site.guarantee.title}</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-relaxed" style={{ color: 'var(--muted)' }}>{site.guarantee.text}</p>
          <BorderBeam size={260} duration={9} colorFrom="var(--accent)" colorTo="var(--accent2)" />
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { trade } = useSite();
  const [open, setOpen] = useState(0);
  return (
    <section aria-label="Questions" className="section pt-0">
      <div className="wrap grid gap-10 md:grid-cols-[.8fr_1.2fr]">
        <div><p className="eyebrow">Questions</p><h2 className="h2 mt-4">Straight <span className="serif" style={{ color: 'var(--accent2)' }}>answers.</span></h2></div>
        <div className="divide-y border-y" style={{ borderColor: 'var(--line)' }}>
          {trade.faq.map((f, i) => (
            <div key={f.q} style={{ borderColor: 'var(--line)' }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-medium md:text-[19px]" aria-expanded={open === i}>
                {f.q}<motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-[24px] leading-none" style={{ color: 'var(--accent)' }}>+</motion.span>
              </button>
              <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} className="overflow-hidden">
                <p className="pb-5 pr-8 text-[15px] leading-relaxed md:text-[16px]" style={{ color: 'var(--muted)' }}>{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Finale() {
  const { site } = useSite();
  return (
    <section aria-label="Book a survey" className="relative">
      <LampContainer className="min-h-[720px] md:min-h-[780px] [&>div:last-child]:-translate-y-56 md:[&>div:last-child]:-translate-y-72">
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: 'easeInOut' }}
          className="mt-8 max-w-[16ch] text-center font-display text-[clamp(38px,6vw,76px)] font-semibold leading-[1] tracking-tight">
          Let's see your floor.
        </motion.h2>
        <p className="mt-5 max-w-[42ch] text-center text-[16px]" style={{ color: 'var(--muted)' }}>A free survey: we measure, test the slab and give you a fixed written price.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <MetalCTA label="Book a free survey" href="#price" width={230} height={56} />
          <a href={`https://wa.me/${site.whatsapp}`} className="glass inline-flex h-14 items-center rounded-full px-6 font-medium" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </LampContainer>
    </section>
  );
}

export function Footer() {
  const { site } = useSite();
  return (
    <footer className="relative overflow-hidden px-5 pt-16 md:px-16" style={{ background: 'var(--bg2)' }}>
      <div className="wrap grid gap-8 pb-10 text-[14px] md:grid-cols-4" style={{ color: 'var(--muted)' }}>
        <div><div className="flex items-center gap-2 font-display text-[18px] font-semibold text-[var(--ink)]"><Mark /> {site.company}</div><p className="mt-3">Resin and epoxy floors, {site.town}.</p></div>
        <div><p className="font-medium text-[var(--ink)]">Contact</p><p className="mt-2"><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></p><p>{site.hours}</p></div>
        <div><p className="font-medium text-[var(--ink)]">Areas</p><p className="mt-2">{site.areas.join(', ')}</p></div>
        <div><p className="font-medium text-[var(--ink)]">Demo</p><p className="mt-2">Demo site by Clientgateway. Images labelled "Example" are placeholders.</p></div>
      </div>
      <div className="select-none text-center font-display font-semibold leading-[.8] tracking-[-.05em]" aria-hidden
        style={{ fontSize: 'clamp(64px, 17vw, 260px)', backgroundImage: 'linear-gradient(180deg, color-mix(in srgb, var(--ink) 22%, transparent), transparent 85%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: '-0.12em' }}>
        {site.shortName}
      </div>
    </footer>
  );
}
