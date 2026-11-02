# Gafflow: design brief

## Who it is for
- Homeowners and venues who want a floor that stops people: metallic, marble or resin bound.
- People learning the trade: courses from £795.
- Installers and crafters buying the products.

The site gives each audience a "door" right under the hero, then one funnel per audience.

## Direction: gloss black and Gafflow pink
- **Palette.** Taken from their brand and their best floor (the cerise metallic bar).
  - Near-black with a plum tint: `#0d0a0f`.
  - Gafflow pink `#e46fc6` for the CTA, with dark text at 7:1 contrast.
  - Gold `#e9c46a` only for the award.
- **Type.** Bricolage Grotesque: one variable file, subset and fixed at opsz 36, 36 KB. Its chunky, slightly quirky display weight suits a team that writes "we've worn several t-shirts", and avoids generic sans-serif. Display headings are tight (-0.035em), body copy is relaxed.
- **Signature moment.** "Design your floor" is a WebGL2 domain-warped flow with:
  - metallic flake shimmer that depends on the light angle;
  - lacing along cell edges;
  - pearl sparkle;
  - clear-coat reflections of ceiling lights, like their bar photo.

  It is lazy-loaded, renders at a reduced resolution, pauses off screen and holds one still frame for reduced motion. The CSS gradient fallback uses the chosen colours, so it never looks broken.
- **Proof.** It is all real:
  - their photos;
  - their award;
  - their testimonials, quoted;
  - their product prices and stock;
  - their course dates.

## Motion
- Transforms and opacity only.
- Below-the-fold reveals never hide content without JavaScript.
- The layer stack is CSS 3D, driven by a requestAnimationFrame loop that only runs on screen. On phones the stack is sized to fit the viewport.
- Everything respects `prefers-reduced-motion`.

## Performance budget
- Inline CSS.
- One font preload.
- Hero image preloaded per breakpoint: 22 KB on mobile.
- 12 KB of JS, plus lazy chunks for the pour and the layer stack.
- No third-party scripts on load.
