// Send Button — port of 21st.dev/@m.umairwaheedansari/components/send-button (catalogue copy, Uiverse-style).
// Same motion: on hover the paper plane rotates 45°, flies right and bobs; the label slides out.
// styled-components (not installed) replaced by an equivalent scoped <style>; blue-600 → preset accent.
// `sent` shows a done state for demo-mode forms (no real submission happens here).
import { useId, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export function SendButton({ label = 'Send', sentLabel = 'Sent', sent = false, type = 'button', onClick, className, children }: {
  label?: string; sentLabel?: string; sent?: boolean; type?: 'button' | 'submit'; onClick?: () => void; className?: string; children?: ReactNode;
}) {
  const k = 'sb' + useId().replace(/:/g, '');
  return (
    <span className={k}>
      <style>{`
        .${k} button:hover .svg-wrapper { animation: ${k}-fly 0.6s ease-in-out infinite alternate; }
        .${k} button:hover svg { transform: translateX(1.2em) rotate(45deg) scale(1.1); }
        .${k} button:hover .lbl { transform: translateX(5em); }
        .${k} button[data-sent='true'] svg { transform: translateX(1.2em) rotate(45deg) scale(1.1); }
        .${k} button[data-sent='true'] .lbl { transform: translateX(5em); }
        @keyframes ${k}-fly { from { transform: translateY(0.1em); } to { transform: translateY(-0.1em); } }
        @media (prefers-reduced-motion: reduce) { .${k} button:hover .svg-wrapper { animation: none; } }
      `}</style>
      <button type={type} onClick={onClick} data-sent={sent}
        className={cn('relative flex items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)] text-lg font-medium px-5 py-2 pl-[0.9em] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95', className)}>
        <div className="svg-wrapper-1 flex items-center">
          <div className="svg-wrapper flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} className="transition-transform duration-300 origin-center">
              <path fill="none" d="M0 0h24v24H0z" />
              <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
            </svg>
          </div>
        </div>
        <span className="lbl ml-1 transition-transform duration-300">{children ?? label}</span>
        {sent && <span className="absolute inset-y-0 left-[0.9em] flex items-center pl-0 text-[0.9em]">{sentLabel} ✓</span>}
      </button>
    </span>
  );
}
export default SendButton;
