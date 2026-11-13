# AAS outdoor landing page: install on the WordPress site

Two files, both in this folder:
- `aas-landing-assets.zip`: a small plugin. It holds the page's styles, fonts, 3D and film. It only loads on this one page.
- `aas-outdoor-landing.json`: the Elementor page template.

Do this on the new Krystal site, and do it once. Each import downloads the 7 job photos into the Media Library again.

1. **Check Elementor.**
   - Go to **Elementor → Settings → Features** and make sure **Flexbox Container** is **Active**.
   - Elementor 3.16 or newer is needed. The page was tested on Elementor 4.4 (free), with Elementor's "Optimized Markup" both on and off.

2. **Install the plugin.**
   - Go to **Plugins → Add New → Upload Plugin**, choose `aas-landing-assets.zip`, then **Install Now → Activate**.
   - The zip is about 18 MB. If WordPress says it's too big, ask Krystal support to raise the upload limit to 64 MB.

3. **Set the numbers.**
   - Go to **Settings → AAS Landing** and check the **WhatsApp number** (447777792227) and the **phone number**.
   - To get a copy of every booking by email as well as WhatsApp, tick **Also email leads to** and enter the address.
   - The **Status** box on that page should show every line green.

4. **Import the template.**
   - Go to **Elementor → Templates → Saved Templates → Import Templates**, choose `aas-outdoor-landing.json`, then **Import Now**.
   - Two warnings pop up. Click **Continue**, then **Import Without Enabling**.

5. **Create the page.**
   - Go to **Pages → Add New**, title it **Outdoor**, and click **Edit with Elementor**.
   - Click the folder icon (**Add Template**), open the **Templates** tab (called **My Templates** in older Elementor), and click **Insert** next to **AAS Outdoor Landing**.

6. **Set the layout and publish.**
   - In Elementor, click the cog (**Page Settings**) and set **Page Layout** to **Elementor Canvas**.
   - Click **Publish**.
   - In **Pages**, use **Quick Edit** to set the slug to `outdoor`. The page is then at **aasgroup.co.uk/outdoor/**.
   - The page title ("Landscaping, Patios & Driveways in Northampton | AAS Group") and meta description are set automatically. Change them in Settings → AAS Landing. If Yoast or Rank Math has its own description for this page, theirs is used.

7. **WP Rocket.** Edit the Outdoor page. In the **WP Rocket Options** box on the right, untick these, then click **Update**:
   - **LazyLoad for images**
   - **Minify/combine JavaScript**
   - **Delay JavaScript execution**
   - **Remove Unused CSS**

   If those boxes aren't there, add these lines under **WP Rocket → File Optimization**:
   - **Excluded JavaScript Files** (both the Minify/Combine list and the Delay JS list):
     ```
     /wp-content/plugins/aas-landing-assets/(.*)
     AAS_CFG
     ldN
     ```
   - **Remove Unused CSS → CSS safelist**:
     ```
     /wp-content/plugins/aas-landing-assets/(.*)
     ```

   Then go to **WP Rocket → Dashboard** and click **Clear and preload cache**.

8. **Test it on your phone.**
   - Open aasgroup.co.uk/outdoor/ in a private window.
   - Check that the hero film plays as you scroll, the garden designer turns, and the patio layers split apart.
   - Fill in the form and check that WhatsApp opens with the brief and Ardian's number.

## What can be edited in Elementor

**Editable with normal widgets:**
- headlines and text
- buttons and their links
- top-bar links and phone
- the 5 service cards (photo, title, text, materials, real-job caption)
- the Rootlok photo and caption
- the 6 Google reviews
- the 5 How-it-works steps
- the FAQ (Accordion)
- the final call to action and its photo
- the footer columns and company line
- the phone quick-contact bar

Colours and fonts are set under **Site Settings → Global Colors / Global Fonts**, with names starting **AAS** (for example AAS Moss, AAS Ink and AAS Display). Changing one there updates it across the page.

**Locked (named "⚠ … – don't edit" in the Navigator):**
- Loader
- Hero film
- Configurator
- Patio layers animation
- Before/after slider
- Review arrows
- Spec card
- Booking form

These are code. Move them if you need to, but don't edit their contents. The WhatsApp and phone numbers they use come from **Settings → AAS Landing**.

**Rules to keep:**
- Photos in the service cards must be real AAS jobs.
- Anything AI-made keeps its "Visualisation" label.
- Reviews must be real Google reviews.
- Don't add prices or stats unless they're true.
