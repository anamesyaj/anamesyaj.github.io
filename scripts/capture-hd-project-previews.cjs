/* Capture genuinely detailed, public project interfaces for the portfolio.
 * Renders full-HD+ browser screenshots in transparent, rounded product windows.
 * No private APIs, logins, tokens or fake UI content. */
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const projects = [
  { name: 'gold-ops-os', url: 'https://gold-ops-os.vercel.app/', accent: '#d3aa5b', mode: 'dark' },
  { name: 'aspirva', url: 'https://aspirva.online/', accent: '#4dc7ce', mode: 'light' },
  { name: 'puddleloom-studio', url: 'https://puddle.loomstudio.workers.dev/', localPreview: 'scripts/puddleloom-preview.html', accent: '#6de0c1', mode: 'dark' },
];
const outDir = path.join(process.cwd(), 'assets', 'projects');
const W = 2720, H = 1510, x = 70, top = 175, contentW = 2580, contentH = 1205;
const escapeXml = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');

async function capture(page, project) {
  // The live PuddleLoom deployment is behind Cloudflare Access. Never capture
  // the login screen as a project screenshot: render the user's supplied
  // Studio Dashboard reference faithfully as crisp HTML instead.
  const source = project.localPreview
    ? pathToFileURL(path.resolve(project.localPreview)).href
    : project.url;
  const response = await page.goto(source, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || response.status() >= 400) {
    throw new Error('Preview unavailable: HTTP ' + (response?.status() ?? 'no response'));
  }
  await page.waitForTimeout(project.localPreview ? 180 : 4800);
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({top: 0, behavior: 'instant'});
    await document.fonts?.ready;
  });
  return page.screenshot({ type: 'png', fullPage: false, animations: 'disabled', timeout: 25000 });
}

async function compose(screenshot, project, filename) {
  const chrome = project.mode === 'light' ? '#f6faff' : '#152029';
  const edge = project.mode === 'light' ? '#8eb7c0' : '#566879';
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="shadow" x="-30%" y="-40%" width="160%" height="200%">
        <feGaussianBlur stdDeviation="38"/>
      </filter>
    </defs>
    <rect x="105" y="104" width="2520" height="1330" rx="39" fill="#000" fill-opacity=".28" filter="url(#shadow)"/>
    <rect x="69" y="70" width="2582" height="1312" rx="34" fill="${chrome}" stroke="${edge}" stroke-width="2"/>
    <rect x="71" y="71" width="2578" height="100" rx="34" fill="${chrome}"/>
    <rect x="71" y="138" width="2578" height="33" fill="${chrome}"/>
    <circle cx="131" cy="122" r="11" fill="#fb7775"/><circle cx="168" cy="122" r="11" fill="#f9bf58"/><circle cx="205" cy="122" r="11" fill="#58cc81"/>
    <rect x="850" y="98" width="1050" height="47" rx="21" fill="#8497a5" fill-opacity=".12" stroke="${edge}" stroke-opacity=".25"/>
    <circle cx="884" cy="121" r="5" fill="${escapeXml(project.accent)}"/>
    <path d="M81 171 H2639" stroke="${edge}" stroke-width="2"/>
  </svg>`);
  const screen = await sharp(screenshot)
    .resize(contentW, contentH, { fit: 'cover', position: 'north' })
    .ensureAlpha()
    .composite([{ input: Buffer.from(`<svg width="${contentW}" height="${contentH}" xmlns="http://www.w3.org/2000/svg"><rect width="${contentW}" height="${contentH}" rx="7" fill="white"/></svg>`), blend: 'dest-in' }])
    .png().toBuffer();
  const output = path.join(outDir, filename);
  // Transparent outside the browser window. 2,720px-wide full-resolution asset.
  await sharp({ create: { width: W, height: H, channels: 4, background: '#00000000' } })
    .composite([{input: svg, left: 0, top: 0}, {input: screen, left: x, top}])
    .webp({quality: 91, alphaQuality: 100, effort: 5}).toFile(output);
  const metadata = await sharp(output).metadata();
  const stats = await fs.stat(output);
  console.log(project.name + ': ' + metadata.width + 'x' + metadata.height + ' ' + metadata.format + ' ' + (stats.size/1024).toFixed(0) + 'KiB');
}

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({headless:true, args:['--no-sandbox','--disable-dev-shm-usage']});
  const failures=[];
  try{
    for(const project of projects){
      const page = await browser.newPage({viewport:{width:1920,height:895},deviceScaleFactor:1.5,colorScheme:project.mode});
      try{
        const screenshot = await capture(page,project);
        await compose(screenshot,project,project.name+'-showcase-hd.webp');
      }catch(err){
        failures.push(project.name + ': ' + err.message);
        console.error('Capture failed:',project.name,err.message);
      }finally{await page.close();}
    }
  }finally{await browser.close();}
  if(failures.length)console.log('Some captures failed; existing previews remain intact: '+failures.join(' | '));
  const succeeded=projects.length-failures.length;
  if(succeeded===0)process.exitCode=1;
})();