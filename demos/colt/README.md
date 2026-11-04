# COLT Building Contractors demo

This is a one-page roofing site for COLT Building Contractors (High Wycombe, family-run, three generations). It's a pitch demo, live on the Vercel project `clientgateway-colt` at https://clientgateway-colt.vercel.app.

## Files
- `index.html`: the whole page, with CSS, JS, the icon sprite and the roof cross-section inline. It's built from a script outside the repo, so edit this file directly.
- `thank-you.html`: shows the lead summary and a "Send this to us on WhatsApp too" button, prefilled from sessionStorage.
- `privacy.html`: a draft, marked with a placeholder for the client to confirm.
- `img/`: their own photos, from the gallery and service pages of coltbuildingcontractors.co.uk, all given the same colour grade.
  - **Hero:** a tight crop of a finished clay-tile ridge from their roof-repairs page, upscaled 4× with Real-ESRGAN (`hero-*`, `hero-m-*`). It's the best finished, sunny shot they publish, but it's still a close-up (flagged to the user).
  - **Finished roofs:** `f-*`. Further 4× upscales: `f-hip`, `f-ridge`, `f-chimney`, `reroof`. `f-flat` is used at its original size.
  - **"How we build it":** `rafters` and `scaffold-team`.
  - **Video poster:** `video-960`, the thumbnail of their YouTube video (sF5i-rCdAB0). The video only loads on tap, from youtube-nocookie.
  - **Share image:** `share.jpg`.
- `brand/`: `logo.png` is their logo, unchanged. `logo-320.png` is a 64-colour copy for the header and footer. Also here: the favicon set (the horse mark) and the web manifest icons.
- `fonts/`: Newsreader for headings and Inter Tight for body text, subset to the characters the pages use.
- `audit/`: screenshots of their current site and `findings.md`.
- `pitch/`: side-by-side images to send the owner. `audit/` and `pitch/` aren't deployed (see `.vercelignore`).

## Conversion system
- One primary call to action everywhere, "Get my free roof quote", with call and WhatsApp as secondary options. A trust line sits under every call to action.
- **5-step quote form:** job tiles, urgency, postcode with an area check, photos, then name and UK mobile.
  - Progress saves to localStorage, so a returning visitor resumes where they left off.
  - Choosing "Leak or repair" or "Emergency" shows the tap-to-call screen, with an option to carry on with the quote.
  - Service links preselect the job.
- **Lead delivery:** the `LEAD DELIVERY HOOK` comment in the main script is where to POST to email or CRM. Until that's wired, the thank-you page hands the lead to WhatsApp.
- **Tracking** goes to `dataLayer`:
  - `quote_step` (with the step number), `quote_emergency` and `quote_submit`;
  - `call_click` and `whatsapp_click` (with location);
  - `thank_you_view`.
- **Meta Pixel:** a commented placeholder in `<head>`. Once the pixel is live, `fbq` Lead/Contact events fire automatically.
- **Mobile:** a sticky Call / WhatsApp / Quote bar that hides over the hero and while the form is on screen, plus a "Leak right now?" band at the top.

## Facts used (only these)
- **The family and group:**
  - three generations, 25+ years, family-run;
  - Colt Group: Colt Scaffolding (Level 2 and advanced scaffolders) and COLT Recycling;
  - the Colt Promise (scaffold and waste removed within 24 hours of completion);
  - no subcontractors.
- **Terms:** free scaffolding, no deposit, pay the balance once you're happy, free no-obligation quotes, a 14-day cooling-off period, credit cards accepted, all work fully guaranteed, £5m public liability insurance.
- **From Checkatrade** (supplied in the brief): 9.84/10 from 24 reviews in the last 12 months, 24-hour call-outs, free estimates, and domestic, commercial and insurance work.
- **Lists:** the services, materials and areas in the brief.
- **Contact:** phone numbers, email, and 18 High Street, High Wycombe HP11 2BE.

## Still to do before go-live
1. **Reviews.** Checkatrade blocks automated access (Cloudflare), so no review text was copied. The reviews section has three visible yellow "Placeholder: real review to be added" cards. Replace each one with a real 10/10 review, word for word, with its job type, date and postcode area, linked to the review.
2. **Facebook ad.** No ad screenshot was supplied. Match the hero headline and image to the ad (see the `AD MATCH` comment). Facebook needs a login, so no photos came from it.
3. **Lead delivery.** Wire up the lead endpoint (email or CRM) and the Meta Pixel ID.
4. **Privacy.** The client should confirm the privacy text.
5. **Photos.** Ask the client for a wide, finished, sunny photo of a whole roof for the hero. Their published photos are mostly mid-job.
