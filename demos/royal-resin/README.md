# Royal Resin demo, v2: "The Royal Gallery"

This is a one-page site for Royal Resin Ltd (Derby, works UK-wide). The live demo is on Vercel project `clientgateway-royal-resin`.

## The idea
Harry already calls his work "Masterpiece of the week", so every floor is shown like a hung artwork:
- **Walls:** warm ivory and stone, with near-black type and gold kept for small accents.
- **Dark sections:** only the hero and the "Design your floor" section.
- **Placards:** every floor has a museum-style label (location · m² · colourway).

## Files
- `index.html`: the whole page, with its CSS and JS inline (icons, crest and map are inline SVG).
- `brand/`: the redrawn crest, all one gold.
  - `crest.svg`: the crest on its own.
  - `lockup.svg`: crest and name side by side.
  - `lockup-stacked.svg`: crest above the name, used in the footer.
  - `favicon.svg` (also copied to `/favicon.svg`) and `apple-touch-icon.png`.
  - The page uses inline copies whose gold gradient deepens on the ivory walls. On the hero, a light sheen sweeps across the crest once on load.
- `video/`: all clips are Harry's own Vimeo videos from the masterpiece page, with the largest version Vimeo serves (576×1024, portrait).
  - `hero-walkthrough.mp4`: an 8.5s muted cut of his glossiest walkthrough. Blues are desaturated so no edge tape shows. To use a longer cut, replace this file and keep the name.
  - `southampton.mp4`: Masterpiece of the week.
  - `harry-at-work.mp4`: "Harry doing what he does best".
  - `customer-reaction.mp4`: keeps its sound, which plays when the visitor taps for it.
- `images/hero`: the hero poster and a blurred wash behind it.
- `images/gallery`: the gallery stills, grabbed from the sharpest frames of his videos, plus three full-size photos from royalresin.uk.
- `images/team`: Harry, from his own clip.
- Display sizes: video stills are never shown wider than 576px. The large slots (the full-width pearl kitchen and the garage) use the full-resolution photos.
- `fonts/`: Cormorant Garamond (headings) and Outfit (body), both self-hosted.

## Before going live
1. **Quote form.** Set `FORM_ENDPOINT` at the top of the first script. It must forward to harry@royalresin.uk and accept photo uploads (Formspree, Basin or similar). Until then the form opens WhatsApp with the answers filled in.
2. **Google reviews link.** It currently opens a Google search. Swap it for his Business Profile reviews URL.
3. **Facebook.** The page needs a login, so nothing was taken from it. If he has a sharper photo of Harry and Kris together, it can replace the clip in "Meet Harry".

## Design your floor
A WebGL2 shader inlined in the second script draws the floor in gentle perspective:
- wide, soft veins with fine lacing;
- a hazier layer under the clear coat;
- pearlescent cells for metallic;
- windows and downlights reflected in the gloss.

The colours (`BASE`, `VEIN`) live in that script. The presets (the `.presets` buttons, `data-p="finish,base,vein,movement"` plus `data-img`/`data-where`/`data-what`) are real floors: Portsmouth, Solihull, Southampton, Peterborough, Wirksworth and Derby. Each preset shows Harry's photo of that floor ("As installed in …"). If the visitor changes a setting, the label becomes "Closest real floor". Without WebGL the panel shows a CSS gradient in the chosen colours.

## Facts used (do not add more)
- **Contact:** phone 01283 295234; mobile and WhatsApp 07947 620266; harry@royalresin.uk; Mon-Fri 09:00-17:00.
- **Reviews:** 5.0 from 63 Google reviews, plus three named snippets (Deb Col, Simon (Bod), Gez Bennett).
- **What he does:** metallic, marble, flake and industrial floors; a 20-year expected life; events work (dance floors, mandap stages, logo floors).
- **From royalresin.uk/masterpiece-of-the-week:**
  - over 10 years' experience in resin flooring;
  - most floors finished in about 5 days;
  - resin can go over tiles with no cracking or movement;
  - "Prepared, designed & installed by Harry & Kris";
  - the 19 jobs on the map, with their locations, m² and colourways;
  - his own lines: "Resin Strong, Royal Standards", "We walked in with a mess, we came out with a masterpiece", "every floor is one of one", "Hello, I am Harry! And I love what I do";
  - the Southampton thank-you to Mark & Berlinda.

The site states no certifications, warranties or prices.
