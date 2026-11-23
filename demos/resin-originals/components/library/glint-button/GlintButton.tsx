import type { MouseEvent, ReactNode } from 'react';
import './glint-button.css';

// Dark glass pill with a light glint running round its border (CSS only, see glint-button.css).
// Hash links scroll smoothly; if the target holds a [data-q1] element (the quote form's first
// question) it scrolls to that instead, so "Book a free survey" lands on the first question.
export function scrollToHash(href: string) {
  const t = document.querySelector(href);
  if (!t) return false;
  const q = t.querySelector<HTMLElement>('[data-q1]') || (t as HTMLElement);
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  q.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: q === t ? 'start' : 'center' });
  return true;
}

export function GlintButton({ children, href, onClick, className = '', arrow = true, ...rest }: {
  children: ReactNode; href?: string; onClick?: () => void; className?: string; arrow?: boolean; 'aria-label'?: string;
}) {
  const go = (e: MouseEvent) => {
    onClick?.();
    if (href?.startsWith('#') && scrollToHash(href)) e.preventDefault();
  };
  const body = <>{children}{arrow && <span aria-hidden>→</span>}</>;
  return href
    ? <a href={href} onClick={go} className={`glint-btn ${className}`} {...rest}>{body}</a>
    : <button type="button" onClick={go} className={`glint-btn ${className}`} {...rest}>{body}</button>;
}
