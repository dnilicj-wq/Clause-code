import { EclipseButton } from '@/components/library/eclipse-button/EclipseButton';
import { ArrowRight, Phone } from 'lucide-react';
// Move the cursor over a button: it leans towards you and an inverted "eclipse" follows the pointer.
export default function EclipseDemo() {
  return (
    <div className="grid min-h-[200px] place-items-center rounded-[calc(var(--radius)*.7)] p-6" style={{ background: 'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--accent) 12%, var(--surface)), var(--bg))' }}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <EclipseButton text="Book a survey" rightIcon={<ArrowRight className="h-4 w-4" />} />
        <EclipseButton text="Call" variant="outline" leftIcon={<Phone className="h-4 w-4" />} />
      </div>
    </div>
  );
}
