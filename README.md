# Mark Jay Lisay | Portfolio

A minimal, mobile-first, single-page portfolio that applies the StoryBrand framework to **AI workflow, automation, QA and product operations**, based on the provided two-page résumé. The hiring manager is the reader; Mark Jay is the guide who helps make complex operations reliable.

## Current structure (September 2026)

Desktop (761px and up) uses a persistent fixed profile rail and seven résumé-first, naturally scrollable chapters with proximity snapping: Home, Work, Skills, About, Results, Experience, Contact. Phones (760px and below) use five isolated, no-reload app tabs: Home, Work, Contact, Skills, About. Results and Experience are expandable sections within mobile About; the blue/gold theme orbit sits above Contact inside the single mobile dock.

The Work carousel has exactly three full-resolution 2720×1510 WebP showcase assets (Gold Ops OS, Aspirva, Studio), with accessible image zoom, swipe/keyboard controls and reduced-motion support. The adjacent evidence disclosure documents those same three showcased products without adding a duplicate gallery. Growth OS is intentionally omitted from website content at the owner's request. The Skills details and Experience chapter retain further résumé information behind accessible disclosures as needed.

The supplied two-page public résumé remains the factual source for employment and dated test checkpoints. The owner's uploaded German GoHighLevel Grundausbildung certificate (July 2026, training director Martin Dellwing) is rendered as a full, uncropped, 340×427 WebP page preview under desktop Experience/Education and directly within mobile About. The external credential URL is shown verbatim; its third-party availability is not independently verified. The active-development Studio web PWA preview is separate from the résumé-described FFmpeg/TypeScript local workflow; the PWA preview was recreated from a supplied screenshot, not captured from a private authenticated dashboard.

## Run locally

Open `index.html`, or run `python3 -m http.server 8000` from this directory. `assets/site.css` is already built and requires no online CDN. The site uses vanilla JavaScript and static HTML.

For Tailwind CSS changes, run `npm install && npm run build`. The project uses Tailwind CSS v4 compiled at build time in `scripts/build-css.mjs`. GitHub Pages serves the precompiled CSS; no Node runtime is needed in production.

## Contact form

This is a static site. The form validates input and opens a prefilled message in the visitor's email app. It does not claim to submit, store or send mail. The copy-email button is a fallback. To support server-backed submissions, connect an explicitly verified form endpoint.

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
