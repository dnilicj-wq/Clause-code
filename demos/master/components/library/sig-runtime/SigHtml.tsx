import { useEffect, useRef } from 'react';
import { initSig } from './sig-runtime.js';
import './sig-tokens.css';
import './illos.css';

// Shared React host for the signature sections: each section's markup comes from its pure render()
// (the same function the static trade-demos generator calls), and sig-runtime drives the motion.
export function SigHtml({ html, as: Tag = 'div', className }: { html: string; as?: 'div' | 'section'; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? initSig(ref.current) : undefined), [html]);
  return <Tag ref={ref as never} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
