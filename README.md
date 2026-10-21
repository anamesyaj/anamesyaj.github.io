# Mark Jay Lisay | Portfolio

A mobile-first, single-page portfolio grounded in Mark Jay Lisay's **Accounts Receivable, premium reconciliation, QuickBooks Online and Excel/VBA experience**. His AI-assisted products remain as additional work. The two-page downloadable AR résumé includes a July 2022 education-date correction supported by the diploma and transcript.

## Current structure (September 2026)

Desktop (761px and up) uses a persistent fixed profile rail and eight naturally scrollable chapters (Overview, Services, Work, Skills, About, Results, Experience, Contact) with proximity snapping: Home, Work, Skills, About, Results, Experience, Contact. Phones (760px and below) keep five isolated, no-reload app tabs: Home (including Services), Work, Contact, Skills, About. Results and Experience are expandable sections within mobile About; the blue/gold theme orbit sits above Contact inside the single mobile dock.

The Work carousel has exactly three full-resolution 2720×1510 WebP showcase assets (Gold Ops OS, Aspirva, Studio), with accessible image zoom, swipe/keyboard controls and reduced-motion support. The adjacent evidence disclosure documents those same three showcased products without adding a duplicate gallery. Growth OS is intentionally omitted from website content at the owner's request. The Skills details and Experience chapter retain further résumé information behind accessible disclosures as needed.

The supplied two-page public résumé remains the factual source for employment and dated test checkpoints. The owner's uploaded German GoHighLevel Grundausbildung certificate (July 2026, training director Martin Dellwing) is rendered as a full, uncropped, 340×427 WebP page preview under desktop Experience/Education and directly within mobile About. The external credential URL is shown verbatim; its third-party availability is not independently verified. The active-development Studio web PWA preview is separate from the résumé-described FFmpeg/TypeScript local workflow; the PWA preview was recreated from a supplied screenshot, not captured from a private authenticated dashboard.

## Run locally

Open `index.html`, or run `python3 -m http.server 8000` from this directory. `assets/site.css` is already built and requires no online CDN. The site uses vanilla JavaScript and static HTML.

For Tailwind CSS changes, run `npm install && npm run build`. Tailwind CSS v4 is compiled in `scripts/build-css.mjs`, then `scripts/bundle-css.mjs` combines the ordered stylesheets into `assets/portfolio.css`. For changes to existing component styles, run `npm run bundle`. GitHub Pages serves the committed bundle through one stylesheet link; no Node runtime is needed in production.

## Contact form

The static site now sends native HTTPS POST form submissions through FormSubmit (https://formsubmit.co/) to the public portfolio email. FormSubmit's reCAPTCHA remains enabled and a hidden honeypot is included. IMPORTANT: The recipient must make one test submission from the live website and confirm the one-time activation email before delivery is operational. Browser tests mock outbound POST and cannot prove external delivery. Direct email, copy address and copy brief remain fallbacks. Submitted visitor data is handled by FormSubmit; the public form asks visitors not to include sensitive data. The 15-minute call option is a REQUEST rather than a live booking link; add a real calendar URL supplied by the owner later.

## Résumé privacy

`assets/Mark_Jay_Lisay_AR_Resume.pdf` is the owner's attached two-page AR résumé, including the contact number he provided. Both desktop and mobile download actions use this same document. The older public résumé was removed so visitors do not receive conflicting versions.

## Branding and proof

The site uses the GitHub avatar for `anamesyaj` with a local initials fallback. Three project logos reference already published project artwork in the same GitHub Pages repository; if moving hosts, copy those assets locally or update the paths. Project tests are dated résumé checkpoints, not ongoing live certification. Gold Ops OS is private alpha, Aspirva is pre-release, and PuddleLoom Studio is an active-development web PWA, with nine creator tool routes on `feat/web-pwa-foundation`. Public-facing project links: Gold Ops OS (`https://gold-ops-os.vercel.app/`, Private Alpha), Aspirva (`https://aspirva.online/`, pre-release informational site), and PuddleLoom Studio (`https://puddleloom-studio.loomstudio.workers.dev/`, development web app). External site reachability was not independently verified at the time of publication.
## Studio source of truth

Studio content and its bundled logo come from `anamesyaj/puddleloom-studio` branch `feat/web-pwa-foundation`, notably `web/src/StudioShell.tsx`, `web/package.json`, `web/wrangler.jsonc` and `web/public/puddleloom-logo-dark.svg`. Nine routed tool workspaces are present; no claim is made that all are production-complete.

## Theme and browser QA

All production styles are linked in `index.html`, with late layers `resume-focus-v9.css`, `mobile-app-v10.css` and `mobile-dock-overlay-v12.css` enforcing the current desktop/mobile distinction. The GitHub Actions portfolio QA checks desktop scroll, HD images, five isolated mobile tabs, attached theme-orb geometry, responsive fit and résumé content on several mobile and desktop viewports. Passing headless Chromium CI is not proof of the appearance on any particular physical phone.

## Training certificate (2026-09-26)

The on-site certificate preview is `assets/ghl-certificate-preview.webp`, a reduced-size rendering of the exact one-page uploaded PDF. Keep its native 340×427 aspect ratio and `object-fit:contain` in desktop and mobile layouts. The complete original PDF supplied by the owner was not substituted for the site's separate two-page résumé. Source-issued credential URL is included verbatim: `https://my-certificates.com/certificates/6a51c63281683ab6396a9e45`; remote reachability was not verified. The public portfolio intentionally displays no Growth OS project content.

## Light-theme readability (2026-09-27)

The light-only palette was tuned for stronger normal/body/secondary text, deeper bronze over pale backgrounds, explicit white-on-bronze project CTAs, clear form placeholders/input outlines and readable mobile labels. Decorative side-carousel copy is hidden only while its card is inactive, retaining transparent 3D previews. Dark colors, the fixed desktop sidebar, five-tab phone dock, floating theme orbit, HD previews and full certificate remain unchanged. `scripts/audit-light-contrast.cjs` now enforces computed >=4.5:1 for normal text (3:1 for large text) in 4 responsive viewport sets and verifies existing dark-mode base tokens.

## Client-facing Phase 1 (September 2026)

The Services section presents AR/reconciliation support, project-based QuickBooks operations and Excel/VBA process improvement. These are based on the attached résumé; the five-hour VBA result is explicitly one complex internal case. The project carousel still presents three self-directed AI-assisted products as additional work. Desktop retains eight scrollable chapters; mobile keeps five tabs with Services under Home. Inquiries use the existing FormSubmit POST with reCAPTCHA and honeypot; the owner's one-time activation remains necessary for delivery.

## Phase 2: résumé-grounded client proof

Home now identifies Mark by name/photo on phones and links a five-plus-hour outcome explicitly limited to one complex internal reconciliation case. Work retains the three existing full-HD showcases and includes two client-readable case narratives below: the actual Accenture VBA macro and Aspirva pre-release product/QA work. These are internal workplace/self-directed projects, NOT invented paid client results. A no-login three-project guided walkthrough uses the existing showcase images and labels their limits; it does not simulate working products. The welcome video slot is dormant pending an actual owner-uploaded MP4 and caption transcript. Calendar booking is deferred as requested.

Phase 2 Playwright checks run at desktop 1440×900 and 900×740 and Android 390×844 and 320×568 in light and dark modes. The suite checks two evidence statements, 3×3 project/step interactive states, owner name/photo, in-tab routing, HD image loads and site overflow. The live suite independently checks published HTML/assets and case-study interactions.

## Phase 3: sound-first one-minute personal introduction

Historical Phase 3 implementation: an introduction-video placeholder was added, then removed in the later AR/readability update. The current Overview leads with verified AR experience and results. There is no video player or unfinished placeholder on the live homepage.

### Phase 3 site hygiene and dedicated QA

The nine old prototype routes (canvas-v4–v10 and deck-v2–v3) carry noindex, canonical and an immediate accessible homepage redirect. Only the current homepage is included in `sitemap.xml`; `robots.txt` advertises it. Current regression checks are `qa-readability-v20.cjs` and `qa-resume-consistency.cjs`. Older video-placeholder QA describes a retired design. No visitor analytics are enabled.

## September 2026 visual and copy polish

The blue-gold appearance orb stays centered over Contact, but both controls now sit inside a 112px dock instead of overlaying scrollable content. The five mobile tabs remain unchanged. The small-phone Overview is tightened without modifying introduction autoplay, audio, video JavaScript, captions or playback. Intro overlay title is a labelled paragraph, leaving the primary hero H1 as the first semantic heading. Service, case-study, About and Contact language is simplified without expanding claims beyond the public résumé.

The actual 1200×630 branded social-sharing JPEG uses Mark Jay's current public GitHub portrait (no generated likeness). It lives at `assets/portfolio-social-preview.jpg`, with Open Graph and Twitter tags pointing to the same published raster. The reproducible Playwright builder and deployed-asset QA guard against broken previews.

### Final small-screen polish

While the owner recording is still absent, the redundant introduction-status sentence is visually hidden *only* on phones; its live region remains accessible and becomes visible again with a real clip. This conserves precious first-fold space. On phones the primary project and service links share a readable two-column row, with résumé below. The full visual audit now clips intersection checks to the visible mobile tab bounds, avoiding false reports about links physically outside the scrollable page; actual visible collisions now fail CI. A targeted first-fold QA verifies 320/390/430px Android layouts and hit-tested Home, Work and About links in both themes. Audible autoplay and the existing playback script remain untouched.

## v17 restored compact bottom navigation

Replaced the screenshot-reported oversized 112px APPEARANCE banner with a compact, 72px, five-tab rounded Android-style dock. The 50px animated blue/gold appearance ring is again immediately above Contact with a 44px accessible tap target. No extra visible heading, line or sixth tab. The scrollable page ends immediately before the raised ring so it never covers important content. Mobile tests cover 320–760px layouts, geometry and tap targets. Video/audio playback is untouched.

## v18 action buttons and social icons

Action links now share a consistent button system while section navigation and the five mobile app tabs remain navigation. Full-card destinations and the certificate-image preview remain card-style controls. Service, case-study, project-site, HD-preview, certificate, résumé, email-fallback and Back-to-top actions use button styling with 40–44px minimum targets. GitHub, LinkedIn and email use inline SVG icons; icon-only controls retain accessible labels. The exact certificate URL remains visible. Introduction autoplay/audio behavior is unchanged.

## v19 contact-form visual cleanup

The lower mobile contact form now uses one compact visual hierarchy instead of several disconnected buttons. Empty `#form-status` no longer reserves vertical space, the FormSubmit privacy explanation and provider link form one compact block, direct email is grouped with two equal copy actions, and the copy labels are shortened to `Copy email` / `Copy brief`. The compact Android navigation, action-button system, social icons and sound-first introduction behavior are unchanged. Android QA verifies the submit-to-privacy gap and contact alternatives at 320/390/430px in both themes.

## Approved portrait and portfolio refinements — 20 October 2026

The owner-approved original portrait is stored at `assets/mark-jay-lisay-portrait.jpg` and is used by all profile views and Person structured data. External avatar requests are no longer needed. The carousel keeps all three projects with lower-opacity side cards; inactive phone-card text is hidden so it cannot overlap the active project. Mobile Overview includes a direct two-page résumé download. Contact has one form entry and direct-email alternatives. Test counts are labelled as 2026 development checkpoints. The sitemap date reflects this update.

## Narrated introduction video

The Home view includes a 54-second, 16:9 introduction with chapter navigation, captions, transcript, and a downloadable web MP4 in `assets/intro/`. Its spoken claims are based on the current AR resume. The illustrated presenter follows the supplied character reference; the video uses Microsoft's Andrew voice. Scene 4 displays the portfolio's Gold Ops OS, Aspirva, and PuddleLoom Studio screenshots as examples of ongoing work. The rendered web video is stored in this repository; the production source and 1080p60 master are maintained separately.
