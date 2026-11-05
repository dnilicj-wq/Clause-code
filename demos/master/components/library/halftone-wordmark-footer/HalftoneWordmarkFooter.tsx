// Rebuilt; original source not reachable (21st.dev @kedhareswer halftone-wordmark-footer is not in the catalogue).
// Same idea: the business name as a giant halftone dot wordmark. Dots are sampled from the rendered text;
// a slow light sweep keeps it alive and the cursor/finger swells dots in the accent colour.
// Canvas runs only while on screen; reduced motion draws one still frame.
import { useEffect, useRef } from 'react';
import type { FooterData } from '../large-name-footer/footer-data';

function css(el: Element, v: string) { return getComputedStyle(el).getPropertyValue(v).trim() || '#888'; }

export function HalftoneWordmark({ text, className, aspect = 4.4 }: { text: string; className?: string; aspect?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, step = 8, pts: { x: number; y: number; a: number }[] = [];
    let raf = 0, on = false, t0 = performance.now();
    const mouse = { x: -1e4, y: -1e4 };
    let ink = '#fff', accent = '#f80';
    const build = () => {
      const r = c.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      c.width = W * dpr; c.height = H * dpr;
      ink = css(c, '--ink'); accent = css(c, '--accent');
      const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d')!;
      const fam = css(c, '--font-display');
      let size = H * 0.95; g.font = `700 ${size}px ${fam}`;
      const w = g.measureText(text).width; if (w > W * 0.98) size *= (W * 0.98) / w;
      // Dot pitch follows the letter height (not the canvas width), so phones get readable, chunky dots.
      step = Math.max(4, Math.min(8, size / 15));
      g.font = `700 ${size}px ${fam}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000';
      g.fillText(text, W / 2, H * 0.54);
      const d = g.getImageData(0, 0, W, H).data; pts = [];
      for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
        const a = d[((y | 0) * W + (x | 0)) * 4 + 3] / 255; if (a > 0.05) pts.push({ x, y, a });
      }
    };
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const sweep = ((t * 0.18) % 1.6 - 0.3) * W;
      for (const p of pts) {
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const near = Math.max(0, 1 - dm / 110);
        const lit = reduce ? 0 : Math.max(0, 1 - Math.abs(p.x - sweep) / (W * 0.18));
        const r = step * 0.5 * p.a * (0.72 + 0.28 * lit + 0.4 * near);
        ctx.globalAlpha = Math.min(1, 0.55 + 0.45 * lit + 0.6 * near);
        ctx.fillStyle = near > 0.15 || lit > 0.6 ? accent : ink;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.min(r, step * 0.62), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (on && !reduce) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!on) { on = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } };
    const stop = () => { on = false; cancelAnimationFrame(raf); };
    const move = (x: number, y: number) => { const r = c.getBoundingClientRect(); mouse.x = x - r.left; mouse.y = y - r.top; if (reduce) draw(performance.now()); };
    const pm = (e: PointerEvent) => move(e.clientX, e.clientY);
    const pl = () => { mouse.x = mouse.y = -1e4; };
    c.addEventListener('pointermove', pm); c.addEventListener('pointerleave', pl);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(c);
    const ro = new ResizeObserver(() => { build(); draw(performance.now()); }); ro.observe(c);
    document.fonts?.ready.then(() => { build(); draw(performance.now()); });
    return () => { stop(); io.disconnect(); ro.disconnect(); c.removeEventListener('pointermove', pm); c.removeEventListener('pointerleave', pl); };
  }, [text]);
  return <canvas ref={ref} aria-label={text} role="img" className={className} style={{ width: '100%', aspectRatio: String(aspect), display: 'block', touchAction: 'pan-y' }} />;
}

export function HalftoneWordmarkFooter({ data, wordmark }: { data: FooterData; wordmark?: string }) {
  return (
    <footer className="relative overflow-hidden px-5 pt-14 md:px-12" style={{ background: 'var(--bg2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{data.town} · {data.region}</p>
          <p className="mt-3 max-w-md text-[26px] leading-tight md:text-[34px]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-.02em' }}>
            Floors poured, levelled and sealed. <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent2)' }}>Price first.</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm" style={{ color: 'var(--muted)' }}>
          <a href={data.tel} className="hover:text-[var(--ink)]">{data.phone}</a>
          <a href={data.whatsapp} className="hover:text-[var(--ink)]">WhatsApp</a>
          <a href="#price" className="hover:text-[var(--ink)]">Prices</a>
          <a href="#faq" className="hover:text-[var(--ink)]">FAQ</a>
          <span className="col-span-2">{data.hours}</span>
        </div>
      </div>
      <HalftoneWordmark text={wordmark ?? data.shortName} className="mx-auto mt-8 max-w-7xl"aspect={Math.max(3.2, (wordmark ?? data.shortName).length * 0.5)} />
      <div className="mx-auto flex max-w-7xl flex-col gap-1 border-t py-5 text-xs md:flex-row md:justify-between" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
        <span>© {data.year} {data.company}</span>
        <span>{data.demoNote ?? data.areas.join(' · ')}</span>
      </div>
    </footer>
  );
}
