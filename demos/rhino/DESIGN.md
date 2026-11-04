# Rhino Coating: design brief

**Design read:** a premium consumer landing page and lead funnel for South Manchester and Cheshire homeowners (plus developers and commercial buyers), built to feel like a luxury automotive showroom. Dark, glossy and precise, with motion kept restrained. Built on native CSS and vanilla JS with no framework, because speed is part of the pitch.

**Scene sentence:** a homeowner in Hale on their phone in the evening, comparing two quotes after seeing a friend's garage. They want proof the floor won't peel, and a number before they talk to anyone.

**Dials** (taste skill): VARIANCE 7, MOTION 6, DENSITY 4.

## How the skills were reconciled (the stricter bar wins)
| Topic | Rule applied | Source |
|---|---|---|
| Purple | Brand-led, so the "lila" ban is overridden: purple is used with intent, never as a default glow. A single bright accent appears on CTAs only. | taste 4.2 override, impeccable colour |
| Gradient text | None (an impeccable absolute ban). | impeccable |
| Em dashes | Zero in our copy. Their copy is ported with em dashes swapped for commas or full stops. | taste 9.G, impeccable |
| Eyebrows | At most one per three sections. | taste 4.7 |
| Hero | Max 4 text elements. Text is visible at first paint with no load fade. Trust strip sits directly under the hero, not inside it. | taste 4.7 + brief |
| Motion | Custom ease-out `cubic-bezier(.23,1,.32,1)`. UI motion under 250ms. `:active` scale .97. Hover only under `(hover:hover)`. Transform and opacity only. Reveals enhance already-visible content. Reduced motion collapses to static. | Emil, impeccable |
| 3D | The scroll-driven exploded layer stack is CSS 3D with no WebGL. It sits behind a sticky stage, its rAF loop runs only while in view, it is lazy, and it never blocks first paint. Mobile gets compact labels pinned to the bottom of the viewport. | 3d-animation-creator patterns (sticky stage, progress mapping, mobile compact cards), adapted for performance |
| Scroll | No `window` scroll handler drives animation: an IntersectionObserver gates a rAF loop. | taste 5.D |
| Cards | 3 systems are shown as one featured card and two compact ones, plus a comparison table (no identical-card row). | taste 9.C, impeccable |
| Images | Rhino's own photos and posts only. The hero is the McLaren purple flake image from Rhino's Instagram, used as brand mood and never captioned as a job (it looks AI-generated). Rhino's seven-layer Instagram graphic appears on the process and garage pages and is the reduced-motion fallback for the 3D stack. | brief |

## Type
- One family: **Archivo** (variable `wdth` 62 to 125, `wght` 100 to 900), self-hosted and subset.
- Display uses width 112 to 125 at weight 760, tracking -0.02em, max size 5.2rem. This expanded grotesque reads like automotive branding.
- Body uses width 100 at weight 400/500, max line length 68ch.
- Numbers use `tabular-nums`.
- Contrast comes from width and weight, not a second family.

## Colour (OKLCH, dark theme locked)
| Token | Value | Use |
|---|---|---|
| `--bg` | `oklch(0.155 0.008 295)` | near-black graphite |
| `--surface` / `--surface-2` | 0.195 / 0.235 | panels |
| `--violet` | `oklch(0.3 0.11 293)` | deep violet fills (finance band, form) |
| `--brand` | `#6438B4` = `oklch(0.47 0.18 293)` | logo purple, sampled from the wordmark |
| `--accent` | `oklch(0.64 0.2 296)` | CTAs and focus only, under 10% of the surface |
| `--ink` | `oklch(0.965 0.004 295)` | text (off-white) |

## Shape
- Buttons and chips are full pill.
- Cards and media use 14px radius; inputs use 10px.

## Sections (home)
1. Hero
2. Trust strip
3. Estimator
4. Layer stack (3D)
5. Systems + comparison
6. Process
7. Projects gallery
8. YouTube feature
9. Reviews slot
10. Finance calculator
11. Warranty
12. FAQ
13. Multi-step quote form
14. Footer

The sticky mobile bar and a one-time nudge sit across the whole page.
