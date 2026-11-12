# Pave Resin demo (Charles, Manchester)

Live: https://clientgateway-pave-resin.dnilicj.workers.dev (Cloudflare Workers)

- `site/`: the deployed static build.
- `source/`: lead data (`site.json`, photos, fonts, logo).
- `generator/template/`: the trade-demos generator used to build it, including the 3D hero engine in `hero3d/`.
- `tests/`: Playwright checks (surfaces, touch, booking pop-up, colour calibration, posters, LCP).

## Build and deploy (from `~/dev/trade-demos`)

```bash
node template/build.mjs leads/pave-resin
./deploy.sh pave-resin 2>&1 | grep -v -i token
```

The 3D tests need real GPU Chrome. Run them as `node h3surf.mjs <url> <out> 390 844`; they use `--use-angle=metal`.

## Hero: 3D laying engine (round 5, automatic since round 6)

Round 6 (Dan's call): no interaction. On load the drive lays itself across the whole hero and finishes in about 2 s (under 3 s). A surface tap resets to the old drive and lays the new surface the same way. Block and tarmac edges (soldier course, kerb) sit off-screen so the surface covers the full background. API: `auto(k, intro)`, `prebuild(k)`; sweep times in `SPAN`. Check with `tests/auto.mjs`.


**What runs.**
- `generator/template/hero3d/engine.js` is a three.js r187 engine, ported from the Wolverhampton Driveways block engine. It is bundled to `site/hero3d.js` and lazy-imported after load and idle.
- Its pieces come from Wolverhampton: the cracked old drive, instanced pieces dropping in with shadows, "Lay the rest", and the idle-time texture build.
- These come from Proficient Essex: the pour brush, `touch-action: pan-y`, `data-nopour`, the auto-play path, and the poster first paint.

**Surfaces.**
- Block: 45° herringbone with a charcoal soldier course.
- Resin: a poured mask that levels, plus a wet sheen that cures to satin.
- Tarmac: a rolled band with a concrete kerb in perspective.
- Porcelain: half-bond slabs that drop in, with joints that fill afterwards.

**Posters.** `/posters/hero-{m,d}.webp` is the first paint and the LCP. It is rendered from the engine's own intro state, so the hand-over is seamless. `hero-{m,d}-done.webp` is the reduced-motion still. Regenerate them with `tests/poster.mjs`.

**Exposure.** `SK` in `engine.js` sets per-surface exposure (block 0.70, resin 0.69, tarmac 0.23, porcelain 0.86). It was calibrated with `tests/calib.mjs`, so the finished state matches the old 2D hero's band mean within 1–2 levels.

## Colour hand-off: Pave palette (unchanged from the previous hero)

| Surface | Values |
|---|---|
| Block, charcoal (70%) | `#3c3d40` `#47484c` `#333437` `#525357` |
| Block, silver (30%) | `#8e9093` `#7d7f83` `#a0a2a5` |
| Block joint | `#24221f` |
| Block soldier course | `#2e2f32` `#38393c` |
| Resin stone tones | `#d9dadb` `#b9bbbe` `#9a9da1` `#7d8085` |
| Resin binder | `#3a3c3f` |
| Tarmac | aggregate grey 52–92, light stones 125 (6%), binder 18, tint (v, v×1.01, v×1.05) |
| Tarmac kerb | concrete 168 (×0.985, ×0.96) |
| Porcelain | tone 196 ± 7 (tint ×1.004, ×1.012) |
| Porcelain grout | `#45474a` |
| Porcelain bed before the joints fill | `#26241f` |
| Old drive (cracked concrete) | tint `#77787b` |
| Skin | graphite `#0B0C0F`, cobalt `#2F6BE0` / `#4C86F5` |

Picker swatches are the unchanged static `sw-*.webp` crops of the surface renders.

## Checks (2026-11-12)

- **Lighthouse 13.6 mobile:** performance 96–98, accessibility 100, LCP 2.2–2.3s (the poster), CLS 0.
- **Touch:**
  - a vertical swipe scrolls the page;
  - a horizontal drag lays;
  - taps on tiles and buttons never lay.
- **Pop-up:** opens fresh every time, on step 2 with the surface filled in. The WhatsApp hand-off and the PAVE15 line both work.
- **Configurator:** shows the real photo straight away, then the live surface fades in. It never shows "Loading designer…".
- **Grep of the build:**
  - no `01452` phone number (the only match is a three.js shader constant);
  - no `paveresinltd.co.uk/wp-content`.

## Loader (round 7)

`generator/template/loader.mjs`, home page only, enabled by `"loader": {"name": "PAVE RESIN"}` in `site.json`.

- **Look:** isometric paving blocks drop in a wave over a cobalt glow, with a wordmark, a progress line and a counter. The inspiration was the isometric-cube and square-wave loaders on 21st.dev.
- **Timing:** it exits when the hero 3D is ready, after at least 1.5s and at most 3.2s, with a curtain wipe. The hero lay starts as the curtain lifts.
- **Safety:** a CSS fail-safe hides it after 5s. With reduced motion, the blocks stay still and it fades instead of wiping.
- **Speed:** Lighthouse mobile is unchanged (performance 94–98, LCP 2.0–2.2s, CLS 0).
- **Test:** `tests/plshot.mjs`.
