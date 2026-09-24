# Mark Jay Lisay | Portfolio

A minimal, mobile-first, single-page portfolio that applies the StoryBrand framework to **AI workflow, automation, QA and product operations**, based on the provided two-page résumé. The hiring manager is the reader; Mark Jay is the guide who helps make complex operations reliable.

## Sections

Sticky navigation, reader-first hero, the operational problem, story-driven About Me, documented results, categorized skills, three featured project case studies, a practical methodology, an illustrative first-90-days plan, role-relevant KPI framework, experience timeline, and contact with a PDF download.

The three project case studies and all quoted operational metrics come from the résumé. The 90-day plan and KPI framework are forward-looking examples, not prior achievements. No unverifiable Customer Success, churn, ARR or testimonial claims are included.

## Run locally

Open `index.html`, or run `python3 -m http.server 8000` from this directory. `assets/site.css` is already built and requires no online CDN. The site uses vanilla JavaScript and static HTML.

For Tailwind CSS changes, run `npm install && npm run build`. The project uses Tailwind CSS v4 compiled at build time in `scripts/build-css.mjs`. GitHub Pages serves the precompiled CSS; no Node runtime is needed in production.

## Contact form

This is a static site. The form validates input and opens a prefilled message in the visitor's email app. It does not claim to submit, store or send mail. The copy-email button is a fallback. To support server-backed submissions, connect an explicitly verified form endpoint.

## Résumé privacy

`assets/Mark_Jay_Lisay_Public_Resume.pdf` is a two-page public-safe copy of the supplied résumé, with only the phone number removed from the contact line. The supplied original remains unchanged outside this website distribution. Do not publish the original PDF unintentionally.

## Branding and proof

The site uses the GitHub avatar for `anamesyaj` with a local initials fallback. Three project logos reference already published project artwork in the same GitHub Pages repository; if moving hosts, copy those assets locally or update the paths. Project tests are dated résumé checkpoints, not ongoing live certification. Gold Ops OS is private alpha, Aspirva is pre-release, and PuddleLoom Growth OS activation is gated.