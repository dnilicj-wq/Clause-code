import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { registry, categories, type Entry } from '@/components/library/registry';
import { useSite } from '@/src/lib/ctx';
import { presets, presetKeys } from '@/config/presets';
import { Marquee } from '@/components/library/marquee/Marquee';
import { BorderBeam } from '@/components/library/border-beam/BorderBeam';
import { NumberTicker } from '@/components/library/number-ticker/NumberTicker';
import { MorphingText } from '@/components/library/morphing-text/MorphingText';
import { WordRotate } from '@/components/library/word-rotate/WordRotate';
import { BlurFade } from '@/components/library/blur-fade/BlurFade';
import { ShinyButton } from '@/components/library/shiny-button/ShinyButton';
import { InteractiveHoverButton } from '@/components/library/interactive-hover-button/InteractiveHoverButton';
import { GlassButton } from '@/components/library/glass-button/GlassButton';
import { LiquidButton } from '@/components/library/liquid-glass-button/LiquidGlassButton';
import { MetalCTA } from '@/components/library/liquid-metal-button/MetalCTA';
import { MagicCard } from '@/components/library/magic-card/MagicCard';
import { DottedMap } from '@/components/library/dotted-map/DottedMap';
import VerticalCutReveal from '@/components/library/vertical-cut-reveal/VerticalCutReveal';
import { AnimatedTestimonials } from '@/components/library/animated-testimonials/AnimatedTestimonials';
import { InfiniteMovingCards } from '@/components/library/infinite-moving-cards/InfiniteMovingCards';
import { CircularGallery } from '@/components/library/circular-gallery/CircularGallery';
import { LampContainer } from '@/components/library/lamp/Lamp';
import { BeamsBackground } from '@/components/library/beams-background/BeamsBackground';
import { Timeline } from '@/components/library/timeline/Timeline';
import { TextReveal } from '@/components/library/text-reveal/TextReveal';
import { LimelightNav } from '@/components/library/limelight-nav/LimelightNav';
import { Home as HomeIcon, Phone, Calculator, Images } from 'lucide-react';

const TiltedGridHero = lazy(() => import('@/components/library/tilted-grid-hero/TiltedGridHero'));
const Radar = lazy(() => import('./lab/RadarDemo'));
// Wave 2+: any src/pages/lab/demos/<registry-id>.tsx (default export) becomes that card's demo automatically.
const demoFiles = import.meta.glob('./lab/demos/*.tsx') as Record<string, () => Promise<{ default: () => ReactNode }>>;
const fileDemos: Record<string, ReturnType<typeof lazy>> = Object.fromEntries(
  Object.entries(demoFiles).map(([path, load]) => [path.split('/').pop()!.replace('.tsx', ''), lazy(load as any)]),
);
export { fileDemos };

const looks = ['graphite-flake', 'copper-metallic', 'pearl-metallic', 'midnight-metallic', 'storm-solid', 'quartz-sand'];
const look = (k: string) => `/demo/look-${k}-v2.webp`;
const exReviews = [
  { quote: 'Example review text. Real reviews from the business replace this.', name: 'Customer name (example)', designation: 'Double garage, Leeds', src: look('graphite-flake') },
  { quote: 'Example review text about the finish and the tidy job.', name: 'Customer name (example)', designation: 'Kitchen, Harrogate', src: look('copper-metallic') },
  { quote: 'Example review text about speed and communication.', name: 'Customer name (example)', designation: 'Showroom, Wakefield', src: look('pearl-metallic') },
];

// Live demo per registry id. Scroll-driven pieces link to the page section where they really run.
const demos: Record<string, () => ReactNode> = {
  'pour-hero': () => <Shot src="/posters/pour-d-v1.webp" to="/#top" label="Runs live as the home hero" />,
  'layer-explode': () => <Shot src="/demo/tex-flake-v1.webp" to="/#layers" label="Scroll-driven: open on the page" />,
  visualiser: () => <Shot src="/demo/unit-gloss-800-v1.webp" to="/" label="Open from 'Visualise your garage' on the page" />,
  'quote-configurator': () => <Shot src={look('copper-metallic')} to="/#price" label="Open on the page" />,
  'bento-diagrams': () => <Shot src={look('storm-solid')} to="/" label="Bento section on the page" />,
  'pour-wipe-compare': () => <Shot src="/demo/ba-after-v1.webp" to="/#gallery" label="Gallery section on the page" />,
  'scroll-expansion-hero': () => <Shot src="/demo/unit-gloss-800-v1.webp" to="/" label="Scroll-driven: section 3 on the page" />,
  'container-scroll': () => <Shot src={look('pearl-metallic')} to="/#price" label="Scroll-driven, desktop: price section" />,
  'stacking-cards': () => <Shot src="/demo/tex-top-v1.webp" to="/#layers" label="Scroll-driven: layers section" />,
  lamp: () => (
    <div className="relative h-[340px] overflow-hidden rounded-2xl">
      <div style={{ width: '250%', marginLeft: '-75%', transform: 'scale(.4)', transformOrigin: 'top center', height: 850 }}>
        <LampContainer className="!min-h-[850px]"><h3 className="mt-[20rem] font-display text-7xl font-semibold">Book a free survey</h3></LampContainer>
      </div>
    </div>
  ),
  'beams-background': () => <div className="relative h-[300px] overflow-hidden rounded-2xl"><BeamsBackground intensity="medium" className="!min-h-[300px] absolute inset-0" /></div>,
  'tilted-grid-hero': () => (
    <div className="relative h-[320px] overflow-hidden rounded-2xl">
      <Suspense fallback={null}><TiltedGridHero className="h-full w-full" tileHeight={34} images={[...looks, ...looks].map((k) => ({ src: look(k), alt: 'Example finish' }))} /></Suspense>
    </div>
  ),
  timeline: () => (
    <div className="max-h-[420px] overflow-hidden rounded-2xl">
      <Timeline data={[['Survey', 'Moisture test, measure, honest advice.'], ['Day 1', 'Grind, repair, prime.'], ['Day 2', 'Broadcast or metallic, then topcoat.'], ['After', 'Cure, then drive on.']].map(([t, c]) => ({ title: t, content: <p className="text-[15px]" style={{ color: 'var(--muted)' }}>{c}</p> }))} />
    </div>
  ),
  'text-reveal': () => <div className="max-h-[360px] overflow-y-auto rounded-2xl border" style={{ borderColor: 'var(--line)' }}><TextReveal>Every floor starts with the slab. We test it, fix it, then pour.</TextReveal></div>,
  'sticky-scroll-cards': () => <Note>Ships as a fixed demo section. Wiring props in Wave 2.</Note>,
  'svg-follow-scroll': () => <Note>Scroll-driven full-page line. Shown in Wave 2 variant pages.</Note>,
  'magic-card': () => (
    <MagicCard className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]" gradientColor="color-mix(in srgb, var(--accent) 22%, transparent)" gradientFrom="var(--accent)" gradientTo="var(--accent2)">
      <div className="p-8"><h3 className="font-display text-2xl font-semibold">Move your cursor</h3><p className="mt-2" style={{ color: 'var(--muted)' }}>The glow follows you.</p></div>
    </MagicCard>
  ),
  'border-beam': () => (
    <div className="relative overflow-hidden rounded-2xl border p-8" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
      <h3 className="font-display text-2xl font-semibold">Example guarantee</h3><p className="mt-2" style={{ color: 'var(--muted)' }}>The business writes its own terms here.</p>
      <BorderBeam size={120} duration={8} colorFrom="var(--accent)" colorTo="var(--accent2)" />
    </div>
  ),
  'dotted-map': () => <div className="rounded-2xl p-4" style={{ background: 'var(--surface)' }}><DottedMap markers={[{ lat: 53.8, lng: -1.55, size: 0.6, pulse: true }]} dotColor="var(--muted)" markerColor="var(--accent)" className="w-full" /></div>,
  'radar-chart': () => <Suspense fallback={null}><Radar /></Suspense>,
  'number-ticker': () => <div className="font-display text-5xl font-semibold">£<NumberTicker value={2400} startValue={1900} className="!text-[var(--ink)]" /> – £<NumberTicker value={3700} startValue={2900} className="!text-[var(--ink)]" /><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Example range</p></div>,
  'circular-gallery': () => (
    <div className="relative h-[380px] overflow-hidden rounded-2xl" style={{ background: 'var(--bg2)' }}>
      <CircularGallery radius={360} items={looks.map((k) => ({ common: k.replace('-', ' '), binomial: 'Example image', photo: { url: look(k), text: 'Example finish', by: '' } }))} />
    </div>
  ),
  'glassy-coverflow': () => <Note>Waiting for the original code (21st.dev copy limit).</Note>,
  'animated-testimonials': () => <AnimatedTestimonials testimonials={exReviews} autoplay />,
  'animated-cards-stack': () => <Note>Scroll-driven review stack. Shown in Wave 2 variant pages.</Note>,
  'infinite-moving-cards': () => <div className="overflow-hidden"><InfiniteMovingCards items={exReviews.map((r) => ({ quote: r.quote, name: r.name, title: r.designation }))} speed="slow" /></div>,
  'liquid-metal-button': () => <MetalCTA label="Get my price" href="#" />,
  'shiny-button': () => <ShinyButton>Book a survey</ShinyButton>,
  'interactive-hover-button': () => <InteractiveHoverButton>Get my price</InteractiveHoverButton>,
  'glass-button': () => <GlassButton>Call Tom</GlassButton>,
  'liquid-glass-button': () => <LiquidButton>See finishes</LiquidButton>,
  'vertical-cut-reveal': () => <Replay>{(k) => <h3 key={k} className="font-display text-4xl font-semibold"><VerticalCutReveal splitBy="characters" staggerDuration={0.025}>Floors poured like liquid.</VerticalCutReveal></h3>}</Replay>,
  'morphing-text': () => <MorphingText texts={['Garages', 'Kitchens', 'Showrooms', 'Workshops']} className="!text-[var(--ink)]" />,
  'word-rotate': () => <div className="font-display text-4xl font-semibold">Resin for <WordRotate words={['garages', 'kitchens', 'showrooms']} className="inline-block text-[var(--accent)]" /></div>,
  'blur-fade': () => <Replay>{(k) => <div key={k} className="grid grid-cols-3 gap-2">{looks.slice(0, 3).map((l, i) => <BlurFade key={l} delay={0.1 + i * 0.12}><img src={look(l)} alt="Example finish" className="aspect-square w-full rounded-xl object-cover" /></BlurFade>)}</div>}</Replay>,
  marquee: () => <Marquee pauseOnHover className="[--duration:30s]">{['Garage floors', 'Metallic epoxy', 'Flake systems', 'Showrooms', 'Kitchens'].map((s) => <span key={s} className="glass rounded-full px-4 py-2 text-sm">{s}</span>)}</Marquee>,
  'message-dock': () => <Note>Mobile bottom bar. Open the page on a phone and scroll past the hero.</Note>,
  'limelight-nav': () => <LimelightNav items={[{ id: 1, icon: <HomeIcon />, label: 'Home' }, { id: 2, icon: <Images />, label: 'Work' }, { id: 3, icon: <Calculator />, label: 'Price' }, { id: 4, icon: <Phone />, label: 'Call' }]} />,
  'large-name-footer': () => <Note>Wordmark footer runs on the page. Original port in Wave 2.</Note>,
};

export default function Lab() {
  const { category } = useParams();
  const { preset, setPreset } = useSite();
  const list = registry.filter((e) => !category || e.category === category);
  const counts = { total: registry.length, ported: registry.filter((e) => e.status === 'ported').length, wip: registry.filter((e) => e.status === 'in-progress').length, rejected: registry.filter((e) => e.status === 'rejected').length };
  useEffect(() => { document.title = 'Component lab · Clientgateway master'; }, []);
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3">
          <Link to="/lab" className="font-display text-lg font-semibold">Component lab</Link>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{counts.total} entries · {counts.ported} ported · {counts.wip} in progress · {counts.rejected} rejected</span>
          <div className="ml-auto flex items-center gap-2">
            <select value={preset.key} onChange={(e) => setPreset(e.target.value)} className="rounded-full border bg-transparent px-3 py-1.5 text-sm" style={{ borderColor: 'var(--line)' }} aria-label="Preset">
              {presetKeys.map((k) => <option key={k} value={k} style={{ background: '#111' }}>{presets[k].name}</option>)}
            </select>
            <Link to="/presets" className="rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: 'var(--line)' }}>Presets</Link>
            <Link to="/" className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Demo page</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 pb-3 text-sm">
          <Tab to="/lab" on={!category}>All</Tab>
          {categories.map((c) => <Tab key={c.key} to={`/lab/${c.key}`} on={category === c.key}>{c.name} <span style={{ color: 'var(--muted)' }}>{registry.filter((e) => e.category === c.key).length}</span></Tab>)}
        </nav>
      </header>
      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:grid-cols-2">
        {list.map((e) => <Card key={e.id} e={e} />)}
      </main>
    </div>
  );
}

function Tab({ to, on, children }: { to: string; on: boolean; children: ReactNode }) {
  return <Link to={to} className="shrink-0 rounded-full border px-3 py-1.5" style={on ? { background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' } : { borderColor: 'var(--line)' }}>{children}</Link>;
}

function Card({ e }: { e: Entry }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([x]) => x.isIntersecting && setSeen(true), { rootMargin: '300px' });
    ref.current && io.observe(ref.current); return () => io.disconnect();
  }, []);
  const FileDemo = fileDemos[e.id];
  // A demo file wins over the inline map, so cards can be upgraded without touching this file.
  const demo = FileDemo ? () => <Suspense fallback={<div className="h-[200px]" />}><FileDemo /></Suspense> : demos[e.id];
  const statusColour = e.status === 'ported' ? '#3FB37F' : e.status === 'in-progress' ? '#E9B949' : '#D9534F';
  return (
    <article ref={ref} id={e.id} className="flex flex-col overflow-hidden rounded-[var(--radius)] border" style={{ borderColor: 'var(--line)', background: 'var(--bg2)' }}>
      <div className="relative min-h-[220px] p-5" style={{ background: 'var(--bg)' }}>
        {seen && demo ? demo() : <div className="h-[200px]" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t p-5 text-sm" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold">{e.name}</h2>
          <span className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ background: statusColour + '22', color: statusColour }}>{e.status}</span>
        </div>
        <p style={{ color: 'var(--muted)' }}>{e.author}{e.licence ? ` · ${e.licence}` : ''} · {e.source.startsWith('http') ? <a href={e.source} target="_blank" rel="noreferrer" className="underline">source</a> : e.source}</p>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[e.slot, `perf ${e.perfCost}`, e.mobileSafe ? 'mobile-safe' : 'desktop only', ...e.vibe, ...e.needs.map((n) => `needs ${n}`), e.usedOnHome ? 'on demo page' : ''].filter(Boolean).map((t) => (
            <span key={t} className="rounded-full border px-2 py-0.5" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>{t}</span>
          ))}
        </div>
        {e.notes && <p className="leading-relaxed" style={{ color: 'var(--muted)' }}>{e.notes}</p>}
        <p className="mt-auto pt-1 text-[12px]" style={{ color: 'var(--muted)' }}>Score: {e.score == null ? 'not reviewed' : `${e.score}/10`}</p>
      </div>
    </article>
  );
}

function Shot({ src, to, label }: { src: string; to: string; label: string }) {
  return (
    <Link to={to} className="group relative block h-[200px] overflow-hidden rounded-2xl">
      <img src={src} alt="Example image" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">{label} →</span>
    </Link>
  );
}
function Note({ children }: { children: ReactNode }) {
  return <div className="grid h-[200px] place-items-center rounded-2xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>{children}</div>;
}
function Replay({ children }: { children: (k: number) => ReactNode }) {
  const [k, setK] = useState(0);
  return <div>{children(k)}<button onClick={() => setK(k + 1)} className="mt-4 rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--line)' }}>Replay</button></div>;
}
