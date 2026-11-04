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
4. **Your surface**: 3D configurator. Wet room / Kitchen / Living, floor / walls / feature, Microcement, Liquid Stone and Natural Limewash with plain-named example colours (no product codes), daylight / golden hour / evening. Guide price from KT's cost guide (linked). "Send this spec" prefills the brief; "Save" downloads a moodboard PNG.
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
| "Match any RAL code on request" | /services/microcement |
| Configurator rates | /guides/microcement-cost-per-m2 |
| Limewash not waterproof | /inspiration/venetian-plaster-vs-microcement-vs-limewash |
| UV, slip resistant | / and /services |
| Wet-room build: primer, two base coats with mesh, two finishing coats, tanking membrane, two PU sealer coats | /colours/microcement-* pages |
| "100% waterproof when sealed" | /services/microcement. Page says "Waterproof once sealed, over a tanking membrane in showers and wet rooms" |
| 10+ years, in-house never subcontracted, premium materials | /about |
| Fully insured, workmanship guarantee, designers & architects | / and /about |
| Batch consistency in writing | /services/tech/colour-matching |
| Call back within a few hours on working days | /quote |
| Towns and regions | /areas |
| "2 to 6 coats" (home page) was dropped: it conflicts with "2–3 fine coats" on /services/microcement and "3–4 thin coats" on the colour pages. |

## Rates used in the configurator
From https://kt-construction.co.uk/guides/microcement-cost-per-m2: walls £100-150/m² · floors, open areas £110-160/m² · small floors under 15 m² £150-220/m² · wet room fully tanked £3,500-6,500 for a typical family bathroom · worktops £350-550 per linear metre · stairs £120-180 per tread (not in the configurator).
- Wet room = the family-bathroom range, plus an optional microcement vanity top per linear metre (default 0, so the default sits at £3,500-6,500).
- Kitchen default: 20 m² floor + 4 linear m worktops = £3,600-5,400. Living default: 24 m² floor = £2,650-3,850.
- Limewash, Liquid Stone and the living-room bench aren't on that page, so they show "priced on survey".
- The earlier /inspiration/microcement-cost-uk rates are no longer used. Colour codes and names, "28 shades", and the fire/eco cards were removed at the client's request.

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
