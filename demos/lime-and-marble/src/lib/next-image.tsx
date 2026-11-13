// Shim for components written for Next.js: <Image> becomes a plain lazy <img>.
import type { ImgHTMLAttributes } from 'react';
type P = ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; quality?: number; placeholder?: string; blurDataURL?: string; unoptimized?: boolean; sizes?: string };
export default function Image({ fill, priority, quality, placeholder, blurDataURL, unoptimized, style, ...rest }: P) {
  void quality; void placeholder; void blurDataURL; void unoptimized;
  return <img {...rest} loading={priority ? 'eager' : rest.loading || 'lazy'} decoding="async"
    style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style } : style} />;
}
