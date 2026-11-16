import { useEffect, useState } from 'react';
import { TextRoll } from '@/components/library/text-roll/TextRoll';
// Loops every 3.2s so the card keeps moving.
export default function Demo() {
  const words = ['Poured.', 'Levelled.', 'Sealed.'];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => x + 1), 3200); return () => clearInterval(t); }, []);
  return (
    <div className="grid min-h-[200px] place-items-center text-center">
      <div>
        <TextRoll key={i} className="font-display text-[clamp(44px,8vw,76px)] font-semibold leading-none tracking-[-.03em]">{words[i % 3]}</TextRoll>
        <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>Letter-by-letter 3D roll. Good for nav links and CTA labels.</p>
      </div>
    </div>
  );
}
