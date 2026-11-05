import { MessageDock, type Character } from '@/components/library/message-dock/MessageDock';
import { useSite } from '@/src/lib/ctx';

// Static copy of the mobile bottom bar (on the page it slides in after the hero, phones only).
export default function MessageDockDemo() {
  const { site, preset } = useSite();
  const grad = `${preset.surface}, ${preset.bg2}`;
  const slot: Character = { emoji: '', name: '_', online: false };
  const chars: Character[] = [
    slot,
    { emoji: '📞', name: 'Call', online: true, backgroundColor: 'bg-[var(--accent2)]', gradientColors: grad },
    { emoji: '💬', name: 'WhatsApp', online: true, backgroundColor: 'bg-[#4ADE80]', gradientColors: grad },
    { emoji: '£', name: 'Quote', online: false, backgroundColor: 'bg-[var(--accent)] text-[var(--accent-ink)] font-display font-semibold', gradientColors: grad },
    slot,
  ];
  return (
    <div className="relative grid h-[200px] place-items-center overflow-hidden rounded-[calc(var(--radius)*.7)]" style={{ background: 'radial-gradient(120% 90% at 50% 0%, var(--surface), var(--bg))' }}>
      <p className="absolute top-4 text-center text-[12px] uppercase tracking-[.14em]" style={{ color: 'var(--muted)' }}>Tap an icon · phones only on the page</p>
      <MessageDock
        className="!static !translate-x-0 [&>div]:!px-2.5 [&>div]:!py-1.5 [&>div]:backdrop-blur-xl"
        characters={chars} showSparkleButton={false} showMenuButton={false} autoFocus={false}
        theme={preset.dark ? 'dark' : 'light'} surface={preset.dark ? preset.surface : '#FFFFFF'} border={preset.line} expandedWidth={320}
        placeholder={(n) => (n === 'WhatsApp' ? `Message ${site.shortName} on WhatsApp…` : n === 'Quote' ? 'Size of your floor?' : 'Your number, we call back…')}
      />
    </div>
  );
}
