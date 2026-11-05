import { MagicText } from '@/components/library/magic-text/MagicText';
import { ScrollBox } from '../text-demo-helpers';
export default function Demo() {
  return (
    <ScrollBox h={300}>
      {(ref) => (
        <div className="px-3" style={{ height: 700 }}>
          <div style={{ height: 120 }} className="grid place-items-center text-sm" ><span style={{ color: 'var(--muted)' }}>Each word lights up as it scrolls in.</span></div>
          <MagicText container={ref} text="Every floor starts with a diamond grind, a moisture test and a primer that bites. Then the colour goes down." />
        </div>
      )}
    </ScrollBox>
  );
}
