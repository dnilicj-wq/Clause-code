# Royal Resin demo

This is a one-page site for Royal Resin Ltd (Derby, works UK-wide). The live demo is on Vercel project `clientgateway-royal-resin`.

- `index.html` is the whole page, with its CSS and JS inline. The icons and the UK map are inline SVG.
- `images/` holds the photos, compressed to WebP. They are Harry's own, taken from royalresin.uk and the masterpiece-of-the-week page. His AdobeStock images were left out.
- `images/texture-gold.webp` is a generated dark marble texture with gold veins. It fills the places where no photo of his exists yet: the flake and industrial cards, the events section, and the sample-board panel.
- `fonts/` holds Cormorant Garamond (headings) and Outfit (body), both self-hosted.

## Before going live
1. **Quote form.** Set `FORM_ENDPOINT` at the top of the script in `index.html`. It needs a form service that accepts multipart uploads (Formspree, Basin or similar). Until it is set, submitting the form opens WhatsApp with the answers already filled in, so no lead is lost.
2. **Google reviews link.** It currently opens a Google search for the business. Swap it for the Google Business Profile reviews URL.
3. **Gallery tabs.** Flake, Industrial and Events have no photos yet. Each tab shows a note asking visitors to request photos instead. Add images as `<figure data-cat="flake">` and so on.
4. **Pinned scroll section.** The "How your floor is made" section can later become a scroll-driven video using the 3d-animation-creator skill. See the comment above `.pin` in the CSS.

## Facts used (do not add more)
- Phone 01283 295234
- Mobile and WhatsApp 07947 620266
- Email harry@royalresin.uk
- Hours Mon-Fri 09:00-17:00
- 5.0 from 63 Google reviews, with three named snippets
- The four services, the three-step process, the 20-year expected life
- Events work: dance floors, mandap stages, logo floors

The site states no certifications, years in business, warranties or prices.
