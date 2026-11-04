# Royal Resin demo, v3

This is a one-page site for Royal Resin Ltd (Derby, works UK-wide). The live demo is on Vercel project `clientgateway-royal-resin`.

## The idea
v3 is "fewer, better, bigger":
- **Backgrounds** alternate ivory (#F6F2EB), espresso ink (#14110E) and warm stone (#E9E3DA), with full-bleed floor photos between them. No two neighbouring sections share a background.
- **Gold** is one flat colour (#B8893B) for the crest and wordmark.
- **Placards** give location · m² · colourway, taken only from the masterpiece page.

## Files
- `index.html`: the whole page, with CSS and JS inline.
- `brand/`: the crest is one flat gold, an outer ring plus a three-point crown, with no gradients.
  - `crest.svg`, `lockup.svg` and `lockup-stacked.svg` (the wordmark is Cormorant 600 converted to paths).
  - `favicon.svg` (also copied to `/favicon.svg`) and `apple-touch-icon.png`.
  - On the page the crest appears only twice, in the header and the footer.
- `images/hero/`: Harry's pearl marble kitchen floor, cropped tight on the swirls and the door reflections, with no tape and no kitchen units. It was upscaled 4x with Real-ESRGAN (Harry's own photo, not generated), then lightly graded. Sizes: `hero-d-2880` and `hero-d-1600` for desktop, `hero-m-1170` and `hero-m-780` for phones. The hero drifts slowly for 20 seconds, scaling from 1.0 to 1.06.
- `images/gallery/`:
  - The six collection floors, which are stills from his Vimeo videos. They are shown at thumbnail size only, never full width.
  - `garage-*`: the number plates are painted out.
  - `macro.webp`: the marble band.
  - `cream-gold-room.webp`: the backdrop behind Harry's line.
- `video/southampton.mp4`: the Masterpiece of the week clip, one of Harry's Vimeo videos.
- `fonts/`: Cormorant Garamond and Outfit, both self-hosted.

## Before going live
1. **Quote form.** Set `FORM_ENDPOINT` at the top of the first script. It must forward to harry@royalresin.uk and accept photo uploads. Until then the form opens WhatsApp with the answers filled in.
2. **Google reviews link.** Swap the link for his Business Profile reviews URL.
3. **Photo of Harry.** If he has a sharp one, it could go back in "Meet Harry". Facebook needs a login, so nothing was taken from it.

## Design your floor
- **Render:** a WebGL2 shader of poured resin.
- **Default controls:** the presets and the base colour. Finish, vein colour and movement sit behind "More options".
- **Presets:** these are real floors. Wirksworth, Solihull and Southampton show their photo next to the render. Portsmouth, Peterborough and Derby show only the name and place, because their photos are not sharp or clean enough.

## Facts used (checked against the royalresin.uk text; do not add more)
- **Contact:** phone 01283 295234; mobile and WhatsApp 07947 620266; harry@royalresin.uk; Mon-Fri 09:00-17:00.
- **Reviews:** 5.0 from 63 Google reviews, with three named snippets.
- **Consultation:** a free design consultation, with sample boards made (the site doesn't say the boards are free).
- **From the masterpiece page:**
  - over 10 years' experience;
  - about 5 days;
  - resin over tiles with no cracking or movement;
  - "Prepared, designed & installed by Harry & Kris";
  - the 19 mapped jobs;
  - his own lines, including "We walked in with a mess, we came out with a masterpiece" (from the 65m² Leeds post);
  - the Southampton thank-you to Mark & Berlinda;
  - the four commercial venues.
- **Not used:** the 20-year life and re-polishing, which are on his site but were cut from v3 for length.
- The site states no certifications, warranties or prices.
