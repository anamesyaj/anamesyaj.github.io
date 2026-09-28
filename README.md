# Mark Jay Lisay | Portfolio

A minimal, mobile-first, single-page portfolio that applies the StoryBrand framework to **AI workflow, automation, QA and product operations**, based on the provided two-page résumé. The hiring manager is the reader; Mark Jay is the guide who helps make complex operations reliable.

## Current structure (September 2026)

Desktop (761px and up) uses a persistent fixed profile rail and eight naturally scrollable chapters (Overview, Services, Work, Skills, About, Results, Experience, Contact) with proximity snapping: Home, Work, Skills, About, Results, Experience, Contact. Phones (760px and below) keep five isolated, no-reload app tabs: Home (including Services), Work, Contact, Skills, About. Results and Experience are expandable sections within mobile About; the blue/gold theme orbit sits above Contact inside the single mobile dock.

The Work carousel has exactly three full-resolution 2720×1510 WebP showcase assets (Gold Ops OS, Aspirva, Studio), with accessible image zoom, swipe/keyboard controls and reduced-motion support. The adjacent evidence disclosure documents those same three showcased products without adding a duplicate gallery. Growth OS is intentionally omitted from website content at the owner's request. The Skills details and Experience chapter retain further résumé information behind accessible disclosures as needed.

The supplied two-page public résumé remains the factual source for employment and dated test checkpoints. The owner's uploaded German GoHighLevel Grundausbildung certificate (July 2026, training director Martin Dellwing) is rendered as a full, uncropped, 340×427 WebP page preview under desktop Experience/Education and directly within mobile About. The external credential URL is shown verbatim; its third-party availability is not independently verified. The active-development Studio web PWA preview is separate from the résumé-described FFmpeg/TypeScript local workflow; the PWA preview was recreated from a supplied screenshot, not captured from a private authenticated dashboard.

## Run locally

Open `index.html`, or run `python3 -m http.server 8000` from this directory. `assets/site.css` is already built and requires no online CDN. The site uses vanilla JavaScript and static HTML.

For Tailwind CSS changes, run `npm install && npm run build`. The project uses Tailwind CSS v4 compiled at build time in `scripts/build-css.mjs`. GitHub Pages serves the precompiled CSS; no Node runtime is needed in production.

## Contact form

The static site now sends native HTTPS POST form submissions through FormSubmit (https://formsubmit.co/) to the public portfolio email. FormSubmit's reCAPTCHA remains enabled and a hidden honeypot is included. IMPORTANT: The recipient must make one test submission from the live website and confirm the one-time activation email before delivery is operational. Browser tests mock outbound POST and cannot prove external delivery. Direct email, copy address and copy brief remain fallbacks. Submitted visitor data is handled by FormSubmit; the public form asks visitors not to include sensitive data. The 15-minute call option is a REQUEST rather than a live booking link; add a real calendar URL supplied by the owner later.

## Résumé privacy

`assets/Mark_Jay_Lisay_Public_Resume.pdf` is a two-page public-safe copy of the supplied résumé, with only the phone number removed from the contact line. The supplied original remains unchanged outside this website distribution. Do not publish the original PDF unintentionally.

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

The Services section provides three possible scoped offerings drawn ONLY from the verified résumé: Excel/VBA/Power Query workflow improvement (one Accenture macro saved 5+ hours in one complex case), AI-assisted human-reviewed workflow scoping and QA/release-readiness support (own product work and dated tests). It does not claim paid client contracts, guaranteed outcomes or fully deployed third-party systems. Desktop has eight scrollable chapters; mobile keeps five tabs with Services underneath Home. Every inquiry is an actual native third-party form POST, subject to FormSubmit reCAPTCHA/honeypot and the owner's one-time confirmation; email/copy fallback is independent. Requesting a 15-minute introductory call does not book anything without an actual calendar link.

## Phase 2: résumé-grounded client proof

Home now identifies Mark by name/photo on phones and links a five-plus-hour outcome explicitly limited to one complex internal reconciliation case. Work retains the three existing full-HD showcases and includes two client-readable case narratives below: the actual Accenture VBA macro and Aspirva pre-release product/QA work. These are internal workplace/self-directed projects, NOT invented paid client results. A no-login three-project guided walkthrough uses the existing showcase images and labels their limits; it does not simulate working products. The welcome video slot is dormant pending an actual owner-uploaded MP4 and caption transcript. Calendar booking is deferred as requested.

Phase 2 Playwright checks run at desktop 1440×900 and 900×740 and Android 390×844 and 320×568 in light and dark modes. The suite checks two evidence statements, 3×3 project/step interactive states, owner name/photo, in-tab routing, HD image loads and site overflow. The live suite independently checks published HTML/assets and case-study interactions.

## Phase 3: sound-first one-minute personal introduction

The Overview now presents a prominent, accurately labelled **personal introduction video** placeholder, not a welcome video. The actual owner recording is **not provided yet**. Upload it to `assets/introduction-mark-jay-60s.mp4`; the site checks for the file before showing a video player. When available, it attempts autoplay with original sound enabled (`autoplay playsinline`, `muted=false`, volume 1). If audible autoplay is blocked by Chrome, Safari or another browser on a fresh visit, visitors receive a prominent **Play introduction WITH SOUND** button; the site intentionally never substitutes silent autoplay. Provide an exact transcript for a future proper captions track; do not invent spoken words. The fallback poster is factual and its text identifies it as a placeholder. Phase 3 also adds search/social metadata, noindex redirects for obsolete prototype URLs, sitemap/robots and dedicated QA without tracking visitors by default.

### Phase 3 site hygiene and dedicated QA

The nine old prototype routes (canvas-v4–v10 and deck-v2–v3) now carry noindex, canonical and an immediate accessible homepage redirect. Only the current homepage is included in `sitemap.xml`; `robots.txt` advertises it. Phase 3 browser QA verifies desktop/Android first-view video-placeholder visibility across eight device/theme combinations and a *mocked* future-clip case with autoplay rejected then user-started, always unmuted. The actual recording's audible end-to-end quality cannot be certified until the owner supplies its MP4. No visitor analytics are enabled without the owner's account configuration and privacy decision.

## September 2026 visual and copy polish

The blue-gold appearance orb stays centered over Contact, but both controls now sit inside a 112px dock instead of overlaying scrollable content. The five mobile tabs remain unchanged. The small-phone Overview is tightened without modifying introduction autoplay, audio, video JavaScript, captions or playback. Intro overlay title is a labelled paragraph, leaving the primary hero H1 as the first semantic heading. Service, case-study, About and Contact language is simplified without expanding claims beyond the public résumé.

The actual 1200×630 branded social-sharing JPEG uses Mark Jay's current public GitHub portrait (no generated likeness). It lives at `assets/portfolio-social-preview.jpg`, with Open Graph and Twitter tags pointing to the same published raster. The reproducible Playwright builder and deployed-asset QA guard against broken previews.

### Final small-screen polish

While the owner recording is still absent, the redundant introduction-status sentence is visually hidden *only* on phones; its live region remains accessible and becomes visible again with a real clip. This conserves precious first-fold space. On phones the primary project and service links share a readable two-column row, with résumé below. The full visual audit now clips intersection checks to the visible mobile tab bounds, avoiding false reports about links physically outside the scrollable page; actual visible collisions now fail CI. A targeted first-fold QA verifies 320/390/430px Android layouts and hit-tested Home, Work and About links in both themes. Audible autoplay and the existing playback script remain untouched.
