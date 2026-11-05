// Rebuilt; original source (21st.dev/@johnmamanao/components/liquid-metal-shader) not reachable for free.
// That component wraps Paper Design's liquid-metal shader as a full-bleed background; this does the same
// with the installed @paper-design/shaders (MIT) "liquidMetal" fragment in full-fill mode (u_shape 0),
// tinted from the preset metal ramp (--metal0..2) over the preset background, low dispersion. Pauses offscreen, still with reduced motion.
import { liquidMetalFragmentShader } from '@paper-design/shaders';
import { PaperShader } from '../_shared/PaperShader';

export function LiquidMetalShader({ repetition = 2.2, softness = 0.6, distortion = 0.12, angle = 70, speed = 0.6, shape = 0, className = '' }: {
  repetition?: number; softness?: number; distortion?: number; angle?: number; speed?: number; shape?: 0 | 1 | 2 | 3 | 4; className?: string;
}) {
  // The full-fill mode fades to the back colour near the edges; oversize the canvas so the edge sits outside the frame.
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <div className="absolute -inset-[22%]">
    <PaperShader shader={liquidMetalFragmentShader} speed={speed} fit="none" uniforms={{
      u_colorBack: 'var(--bg)', u_colorTint: 'var(--metal2)',
      u_repetition: repetition, u_softness: softness, u_shiftRed: 0.06, u_shiftBlue: 0.06, u_distortion: distortion,
      u_contour: 0.4, u_angle: angle, u_shape: shape, u_isImage: false, u_scale: 1,
    }} />
    </div>
    {/* Brand hue comes from the preset's metal ramp (not the raw accent), blended softly so bright accents never go garish. */}
    <div className="absolute inset-0 mix-blend-color" style={{ background: 'linear-gradient(135deg, var(--metal1), var(--metal0))', opacity: 0.55 }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 80% at 50% 50%, color-mix(in srgb, var(--bg) 45%, transparent), color-mix(in srgb, var(--bg) 10%, transparent))' }} />
    </div>
  );
}
