import { useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import LiquidChrome from './LiquidChrome';
import { cssVar, DPR_CAP } from '../_shared/loop';

// Liquid Chrome tinted with the preset's metal highlight; light presets use the original's light mode.
export function PresetLiquidChrome(props: Partial<ComponentProps<typeof LiquidChrome>>) {
  const ref = useRef<HTMLDivElement>(null);
  const [tint, setTint] = useState<{ c: string; light: boolean } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current!;
    const bg = cssVar(el, '--bg', '#000');
    const lum = (h: string) => { const n = parseInt(h.replace('#', '').slice(0, 6), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255; };
    setTint({ c: cssVar(el, '--metal2', '') || cssVar(el, '--accent2', '#ffffff'), light: bg.startsWith('#') && lum(bg) > 0.6 });
  }, []);
  return (
    <div ref={ref} className="absolute inset-0">
      {tint && <LiquidChrome color={tint.c} lightMode={tint.light} maxDevicePixelRatio={DPR_CAP} {...props} />}
    </div>
  );
}
