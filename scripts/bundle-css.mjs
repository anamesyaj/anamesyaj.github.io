import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Keep source stylesheets separate for editing; publish one ordered CSS file.
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const styles=[
  "assets/site.css",
  "assets/theme-audit.css",
  "assets/typography.css",
  "assets/hybrid-ui.css",
  "assets/portfolio-app-v2.css",
  "assets/portfolio-motion.css",
  "assets/app-navigation.css",
  "assets/nav-polish-v2.css",
  "assets/nav-compact-desktop-v3.css",
  "assets/carousel-product-v3.css",
  "assets/carousel-hd-v4.css",
  "assets/screen-deck-v5.css",
  "assets/contact-contrast-v6.css",
  "assets/continuous-deck-v6.css",
  "assets/work-card-fit-v7.css",
  "assets/presentation-fit-v8.css",
  "assets/resume-focus-v9.css",
  "assets/mobile-app-v10.css",
  "assets/mobile-dock-v11.css",
  "assets/mobile-dock-overlay-v12.css",
  "assets/client-phase1-v13.css",
  "assets/client-phase2-v14.css",
  "assets/client-phase3-v15.css",
  "assets/client-polish-v16.css",
  "assets/mobile-dock-compact-v17.css",
  "assets/action-buttons-v18.css",
  "assets/contact-polish-v19.css",
  "assets/readability-v20.css",
  "assets/ar-positioning-v21.css",
  "assets/education-proof-v22.css",
  "assets/portfolio-refinement-v23.css"
];
const bundled=styles.map(file=>`/* ${file} */\n${fs.readFileSync(path.join(project,file),'utf8')}`).join('\n');
fs.writeFileSync(path.join(project,'assets/portfolio.css'),bundled);
console.log(`Bundled ${styles.length} stylesheets (${Buffer.byteLength(bundled)} bytes).`);
