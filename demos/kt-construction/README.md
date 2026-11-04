# KT Construction demo

A one-page "journey" site for KT Construction (microcement, Liquid Stone and limewash specialists, Unit 10 Bridgers Farm, Hurstpierpoint BN6 9HA). Pitch demo, live on the Vercel project `clientgateway-kt-construction` at https://clientgateway-kt-construction.vercel.app (noindex).

## Files
- `index.html`: markup and all CSS, plus the icon sprite. Edit directly; there's no build step for the page.
- `js/app.js`: the journey (loader, Lenis smooth scroll, chapter rail, chip, grout calculator, layer stack, configurator UI, gallery corridor, radar, brief form).
- `js/hero.js`: the hero, a raw-WebGL tiled wall that visitors trowel microcement over (mask canvas + one fragment shader).
- `src/config3d.js`: the Three.js room for the configurator. Bundle it after any change:
  `npx esbuild src/config3d.js --bundle --format=esm --minify --outfile=js/config3d.js` (needs `three@0.170.0` installed somewhere esbuild can resolve it).
- `img/`: KT's own project photos only (camera and phone shots from their site), as AVIF + WebP. `share.jpg` is the OG image.
- `brand/`: their logo, trimmed, and a KT monogram icon set.
- `audit/` and `pitch/` are not deployed (`.vercelignore`).

## The journey (8 chapters)
1. **The wall**: drag (desktop: just move) across a dated tiled wall to trowel microcement on. Live "grout lines left" counter, 6 KT colours, "Finish the wall" cures it. Phones get an auto demo and sideways swipes.
2. **Seamless**: grout calculator (wall size + tile size = metres of grout) with a drag compare, plus the 8 properties from their site as Magic UI style spotlight cards.
3. **Three millimetres**: pinned scroll, a CSS 3D layer stack builds up over existing tiles (prep, primer, mesh, base coats, finish coats, sealer).
4. **Your surface**: 3D configurator. Wet room / Kitchen / Living, floor / walls / feature, Microcement (28), Liquid Stone (10), Natural Limewash (12) with KT's real colour codes and hex values, daylight / golden hour / evening. Guide price from KT's published 2026 rates. "Send this spec" prefills the brief; "Save" downloads a moodboard PNG.
5. **The work**: scroll-driven 3D corridor through 14 real KT photos, with a lightbox. Phones get a native swipe row instead.
6. **The team**: scroll text reveal, stats shown at their final values (no count-up), Facebook proof. Masterclasses are a footer link only.
7. **Where**: radar from the workshop with their 10 listed towns (real coordinates, miles rings) and a postcode check.
8. **Begin**: 5-step brief with the 3D spec attached, then a WhatsApp handoff.

21st.dev's component registry needs a login, so the 21st.dev components used are ported from their open-source originals (Magic UI: Marquee, MagicCard, BorderBeam, TextReveal, NumberTicker) into vanilla JS/CSS.

## Facts used (only these)
- From kt-construction.co.uk: services and finishes, "10+ years", in-house team never subcontracted, premium materials, fully insured, workmanship guarantee, trusted by designers and architects, batch-matched colour in writing for show flats, 2 to 3 mm, the 8 microcement properties, 3-step process and "2 to 6 coats", call back within a few hours on working days, the areas and towns, colour codes and hex values (`/colours`), 2026 installed rates (`/inspiration/microcement-cost-uk`), masterclass prices (`/workshops`).
- From the brief: Facebook 552 likes, 100% recommend from 40 reviews, phone/WhatsApp, email, address, socials, hours (from a directory listing).
- Their site says "from our Crawley base" but the address is Hurstpierpoint; the page says the workshop is at Hurstpierpoint.
- Photo captions use their own gallery labels where the photo matched one, otherwise only what's visible. No towns on captions. AI/manufacturer images from their site (Nova, Sahara, Velour, Lumea, etc.) are not used.

## Claim sources (checked 2026-11-04 against kt-construction.co.uk)
| Claim | Page |
|---|---|
| Colour codes, names, hex, "28 shades" | /colours (and /colours/microcement-n3-linen-mist etc.) |
| "Match any RAL code on request" | /services/microcement |
| 2026 rates, "South of England" | /inspiration/microcement-cost-uk (note: /guides/microcement-cost-per-m2 lists lower rates) |
| Limewash £55-85/m², limewash not waterproof | /inspiration/venetian-plaster-vs-microcement-vs-limewash |
| Fire resistant, eco friendly, UV, slip resistant | / and /services |
| Wet-room build: primer, two base coats with mesh, two finishing coats, tanking membrane, two PU sealer coats | /colours/microcement-* pages |
| "100% waterproof when sealed" | /services/microcement. Page says "Waterproof once sealed, over a tanking membrane in showers and wet rooms" |
| 10+ years, in-house never subcontracted, premium materials | /about |
| Fully insured, workmanship guarantee, designers & architects | / and /about |
| Batch consistency in writing | /services/tech/colour-matching |
| Call back within a few hours on working days | /quote |
| Towns and regions | /areas |
| "2 to 6 coats" (home page) was dropped: it conflicts with "2–3 fine coats" on /services/microcement and "3–4 thin coats" on the colour pages. |

## Rates used in the configurator (£/m², KT 2026 published)
Walls dry 140-180 · wet-room build 200-260 · floors residential 160-200 · worktops/feature 220-300 · limewash walls 55-85. Liquid Stone has no published rate, so it shows "priced on survey".

## Rules baked in
- Floors: microcement only. Limewash: walls only, and not in a wet room (not waterproof).
- WebGL is skipped on software renderers (Lighthouse); `?gl=force` overrides. Fallbacks: hero uses their bathroom photo; configurator uses a real photo per room.

## Still to do before go-live
1. **Lead delivery**: set `FORM_ENDPOINT` in `js/app.js` to forward to enquiries@kt-construction.co.uk. Until then the brief shows a thank-you and hands the lead to WhatsApp.
2. **Reviews**: Facebook needs a login, so no review text was copied. Add real quotes (word for word) if KT wants them on the page.
3. **Google Business link**: their site links Google Business; ask for the profile URL to add a rating.
4. **Images**: images are cached as immutable; give any changed image a new filename.

## Lighthouse (mobile, live)
New: performance 93, best practices 100, LCP 2.2s. Their current site: performance 52, LCP 46.4s, 15.6 MB page (`audit/findings.md`).
