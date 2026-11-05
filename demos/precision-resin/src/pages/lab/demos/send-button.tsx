import { useState } from 'react';
import { SendButton } from '@/components/library/send-button/SendButton';
// Hover the button: the plane takes off. Tap to see the demo-mode "sent" state (nothing is submitted).
export default function SendDemo() {
  const [sent, setSent] = useState(false);
  return (
    <div className="grid min-h-[200px] place-items-center rounded-[calc(var(--radius)*.7)] p-6" style={{ background: 'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--accent) 10%, var(--surface)), var(--bg))' }}>
      <div className="flex w-full max-w-[360px] items-center gap-2 rounded-2xl border p-2" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <span className="flex-1 px-2 text-[14px]" style={{ color: 'var(--muted)' }}>{sent ? 'Thanks, we will reply soon (demo)' : 'Your phone or email'}</span>
        <SendButton sent={sent} onClick={() => { setSent(true); setTimeout(() => setSent(false), 2600); }} />
      </div>
    </div>
  );
}
