// From Subhan-code/Monocharts (MIT): cached canvas size, off-screen + hidden-tab pause, reduced motion read once.
import { useEffect, useRef, useState, type RefObject } from 'react';
type CanvasRect = { width: number; height: number };
export function useCanvasSetup(): { canvasRef: RefObject<HTMLCanvasElement>; rect: RefObject<CanvasRect>; isVisible: RefObject<boolean>; reducedMotion: boolean } {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const rect = useRef<CanvasRect>({ width: 0, height: 0 });
  const isVisible = useRef(true);
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver((es) => { for (const e of es) {
      const { width, height } = e.contentRect; rect.current = { width, height };
      const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    } });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { isVisible.current = e.isIntersecting; }, { rootMargin: '100px' }); io.observe(canvas);
    const vis = () => { isVisible.current = document.visibilityState === 'visible'; };
    document.addEventListener('visibilitychange', vis);
    return () => { ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, []);
  return { canvasRef, rect, isVisible, reducedMotion };
}
