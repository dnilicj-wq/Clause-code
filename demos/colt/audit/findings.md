# Audit: coltbuildingcontractors.co.uk (current site)

Screenshots: `current-390.png`, `current-1440.png` (first screen) and `-full.png` (whole page), taken 4 Nov 2026.

## What a homeowner from a Facebook ad sees first (390px)
The top 330px is the logo and a small WhatsApp badge. Then comes a blue bar with three icons, a cropped van photo, and the words "Welcome to COLT Building Contractors". The headline doesn't arrive until the second screen, and there's no quote button anywhere on the first screen.

## Conversion weaknesses

### Known going in
1. **Headline:** it's a question ("Reliable High Wycombe Roofers?") in mixed serif and script fonts. It states no benefit and gives no reason to act.
2. **Form:** there's only a "Get a call back" form, which asks for name, phone, email, postcode and message. There's no quote form, no job type or urgency, and no photos.
3. **Checkatrade:** their 9.84/10 score from 24 reviews appears nowhere on the site. Their strongest proof is invisible.
4. **Gallery:** 47 photos with no captions, no job types and no larger view. Most are mid-job, shown in a flat grid.
5. **Header:** three landline numbers, a mobile and an email crowd the desktop header. No single number is the obvious one to call.
6. **Differentiator:** doing their own scaffolding (Colt Scaffolding) and skips (COLT Recycling), plus the Colt Promise (both gone within 24 hours), is buried mid-paragraph.
7. **Menu:** capitalisation is inconsistent ("Roofing", "CHIMNEYS", "MOSS REMOVAL", "PAINTING"), and the menu has 14 items.
8. **Address:** the contact block shows 71-75 Shelton Street, Covent Garden, a London virtual-office address. That confuses a High Wycombe family business.

### Found during the audit
9. **Risk reversal is scattered:** no deposit, pay when happy, 14-day cooling-off, free scaffolding, £5m insurance and fully guaranteed are spread across three paragraphs and a bullet list. There's never one strong reassurance moment.
10. **Mobile:** there's no sticky call or WhatsApp bar. Once you scroll past the header, the only way to act is to scroll back up.
11. **No emergency route:** they do 24-hour call-outs, but there's no "leak right now" path anywhere.
12. **Copy:** long, dense paragraphs (around 120 words each), set in Times-style fallback type, justified, on mobile. The text is hard to scan.
13. **Fonts:** three or four unrelated typefaces (condensed sans, Times, script, Arial) and yellow-on-white text with poor contrast ("RELIABLE HIGH WYCOMBE").
14. **reCAPTCHA badge:** it floats over the content at bottom right on mobile and covers the text.
15. **Stock photos:** the slider and service tabs mix in stock imagery (a London skyline, a stock moss roof, stock roofers on a blue sky) that isn't their work.
16. **Materials:** the brand logo slider carries no meaning for a homeowner.
17. **Tracking:** no visible event tracking for calls, WhatsApp or form steps, so they can't see which Facebook ads produce leads.
18. **SEO:** the title tag says "Gerard's Cross" (misspelt) and is stuffed with towns. There's no structured data for reviews or the business, and no Open Graph image, so a WhatsApp share shows a blank card.

## Design read of the current site
Variance 2, motion 1, density 8. It's a template-era builder site: dense, centred and shouty, with no hierarchy between the four phone numbers, the form and the content.

## How the new site fixes each point

| # | Fix |
|---|---|
| 1 | Benefit headline: "Three generations. One standard of roof." |
| 2 | 5-step quote form: job tiles, urgency, postcode area check, photos, then name and mobile. Saves progress, adds a WhatsApp handoff, and sends emergencies to a call screen. |
| 3 | 9.84/10 in the hero trust strip, beside every call to action, in the reviews section and in the JSON-LD. |
| 4 | 12 curated, colour-graded photos with job-type captions and a lightbox, plus one honest before/after of the same flat roof. |
| 5 | One primary number (07473 989092, call and WhatsApp) in the header. The three local lines sit in the footer. |
| 6 | Its own section, "One family. One team. Start to finish.", with the three Colt companies and the Colt Promise in large type. |
| 7 | Six short anchor links in sentence case. |
| 8 | The footer shows 18 High Street, High Wycombe HP11 2BE as the business address. |
| 9 | One "Zero-risk roofing" block with all seven guarantees. |
| 10 | A sticky Call / WhatsApp / Quote bar on mobile that hides while the form is on screen. |
| 11 | A "Leak right now?" band on mobile, and the emergency and leak answers in the form go straight to tap-to-call. |
| 12 | Short sections, left-aligned text, and lines no longer than 65 characters. |
| 13 | Two typefaces: Newsreader for headings and Inter Tight for body text. Everything passes WCAG AA. |
| 14 | No reCAPTCHA badge. Spam protection goes in at the form-endpoint stage. |
| 15 | Their own photos only. |
| 16 | Materials appear as a quiet text strip in the footer. |
| 17 | `dataLayer` events for every form step, submission, call click and WhatsApp click, plus a Meta Pixel placeholder. |
| 18 | A clean title, LocalBusiness/RoofingContractor and FAQPage JSON-LD, and a designed share image. |
