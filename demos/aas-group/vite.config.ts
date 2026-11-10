import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';

// <x-img name="talbot-after" alt="..." sizes="..." class="..." eager> -> responsive <picture> (AVIF + WebP, 800/1600w)
function pictures(): Plugin {
  return {
    name: 'aas-pictures',
    transformIndexHtml(html) {
      const meta: Record<string, [number, number]> = JSON.parse(fs.readFileSync('public/work/meta.json', 'utf8'));
      return html.replace(/<x-img\s+([^>]*?)\/?>(<\/x-img>)?/g, (_m, attrs: string) => {
        const a: Record<string, string> = {};
        attrs.replace(/([\w-]+)(?:="([^"]*)")?/g, (_x, k, v) => ((a[k] = v ?? ''), ''));
        const n = a.name, [w, h] = meta[n] || [1600, 1200];
        const sizes = a.sizes || '(max-width: 800px) 100vw, 50vw';
        const eager = 'eager' in a;
        const set = (ext: string) => `/work/${n}-800.${ext} 800w, /work/${n}-1600.${ext} 1600w`;
        const extra = Object.entries(a).filter(([k]) => !['name', 'alt', 'sizes', 'eager', 'class', 'style'].includes(k)).map(([k, v]) => ` ${k}="${v}"`).join('');
        return `<picture${a.class ? ` class="${a.class}"` : ''}${a.style ? ` style="${a.style}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><img src="/work/${n}-800.webp" srcset="${set('webp')}" sizes="${sizes}" width="${w}" height="${h}" alt="${a.alt ?? ''}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${extra}></picture>`;
      });
    },
  };
}

export default defineConfig({
  plugins: [pictures()],
  build: { target: 'es2020', modulePreload: { polyfill: false }, assetsInlineLimit: 0 },
});
