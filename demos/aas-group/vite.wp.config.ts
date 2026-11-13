// WordPress build: the same page script and stylesheet as the demo, bundled for the AAS Landing plugin.
// Output goes to wordpress/.build/js and is post-processed by wordpress/tools/build.mjs.
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: 'wordpress/.build/js',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: { aas: 'src/main.ts' },
      // the entry gets a content hash in its name (no ?ver= query: a second, query-less import of the
      // same file from a lazy chunk would run the page script twice)
      output: { entryFileNames: 'aas-[hash].js', chunkFileNames: 'aas-[name]-[hash].js', assetFileNames: 'aas[extname]' },
    },
  },
});
