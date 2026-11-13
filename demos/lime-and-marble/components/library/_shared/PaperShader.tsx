import { useEffect, useRef } from 'react';
import { ShaderMount, ShaderFitOptions, getShaderColorFromString, getShaderNoiseTexture, type ShaderMountUniforms } from '@paper-design/shaders';
import { cssVar, DPR_CAP, prefersReduced } from './loop';

// Mounts a @paper-design/shaders fragment shader into a div with sizing defaults, preset colours,
// DPR cap, offscreen pause (speed 0) and a still frame for reduced motion.
// `uniforms` may reference preset tokens as strings like 'var(--accent)'; they become vec4 colours.
type U = Record<string, unknown>;
export function PaperShader({ shader, uniforms, speed = 1, fit = 'cover', noise = false, frame = 0, className = '' }: {
  shader: string; uniforms: U; speed?: number; fit?: 'none' | 'contain' | 'cover'; noise?: boolean; frame?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const resolve = (v: unknown): unknown => {
      if (typeof v === 'string' && v.startsWith('var(')) return getShaderColorFromString(cssVar(el, v.slice(4, -1)));
      if (Array.isArray(v) && typeof v[0] === 'string') return v.map(resolve);
      return v;
    };
    const u: U = {
      u_fit: ShaderFitOptions[fit], u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    };
    for (const [k, v] of Object.entries(uniforms)) u[k] = resolve(v);
    let mount: ShaderMount | null = null;
    let cancelled = false;
    const start = (tex?: HTMLImageElement) => {
      if (cancelled) return;
      if (tex) u.u_noiseTexture = tex;
      const w = el.clientWidth || 600, h = el.clientHeight || 400;
      try {
        mount = new ShaderMount(el, shader, u as ShaderMountUniforms, undefined, prefersReduced() ? 0 : speed, frame, 1, Math.round(w * h * DPR_CAP * DPR_CAP));
      } catch (e) { console.warn('[PaperShader]', e); }
    };
    if (noise) { const img = getShaderNoiseTexture(); if (img && !img.complete) img.onload = () => start(img); else start(img ?? undefined); } else start();
    const io = new IntersectionObserver(([e]) => mount?.setSpeed(e.isIntersecting && !prefersReduced() ? speed : 0), { rootMargin: '100px' });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); mount?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shader, speed, fit, noise, frame, JSON.stringify(uniforms)]);
  return <div ref={ref} className={`absolute inset-0 [&>canvas]:!absolute [&>canvas]:!inset-0 [&>canvas]:!h-full [&>canvas]:!w-full ${className}`} />;
}
