import { TextureButton } from '@/components/library/texture-button/TextureButton';
import { ArrowRight, Phone } from 'lucide-react';
export default function TextureDemo() {
  return (
    <div className="grid min-h-[200px] place-items-center rounded-[calc(var(--radius)*.7)] p-6" style={{ background: 'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--accent) 10%, var(--surface)), var(--bg))' }}>
      <div className="grid w-full max-w-[320px] gap-3">
        <TextureButton variant="accent" size="lg">Get my price <ArrowRight className="h-4 w-4" /></TextureButton>
        <TextureButton variant="primary" size="lg">Book a free survey</TextureButton>
        <div className="grid grid-cols-2 gap-3">
          <TextureButton variant="secondary"><Phone className="mr-1.5 h-3.5 w-3.5" />Call</TextureButton>
          <TextureButton variant="minimal">WhatsApp</TextureButton>
        </div>
      </div>
    </div>
  );
}
