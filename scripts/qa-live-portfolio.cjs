/* Post-deployment browser smoke: checks the actual HTTPS GitHub Pages site
   on desktop and Android-sized Chromium, not just file:// checkout HTML. */
const {chromium}=require("playwright");
const fs=require("node:fs/promises");
const assert=require("node:assert/strict");
const base="https://anamesyaj.github.io/";
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir("qa-screens",{recursive:true});
 try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:"reduce"});
  const page=await desktop.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push("desktop: "+e.message));
  let deployed=false,lastError="";
  /* Poll until the certificate release reaches the public GitHub Pages CDN. */
  for(let attempt=0;attempt<18;attempt++){
   try{
    const result=await page.goto(base+"?audit="+Date.now()+"-"+attempt+"#top",{waitUntil:"domcontentloaded",timeout:16000});
    const state=await page.evaluate(()=>({
      noGrowth:!document.documentElement.outerHTML.includes("PuddleLoom Growth OS"),
      image:Boolean(document.querySelector(".certificate-proof--desktop img[src='assets/ghl-certificate-preview.webp']")),
      cert:document.documentElement.outerHTML.includes("my-certificates.com/certificates/6a51c63281683ab6396a9e45")
    }));
    if(result&&result.status()===200&&state.noGrowth&&state.image&&state.cert){deployed=true;break}
    lastError="Public HTML is not at the audited version yet: "+JSON.stringify(state)+"; status="+result?.status();
   }catch(e){lastError=String(e)}
   await page.waitForTimeout(4500);
  }
  assert.ok(deployed,"Latest production Pages content not seen: "+lastError);
  await page.waitForFunction(()=>document.documentElement.classList.contains("continuous-deck"),{timeout:7000});
  const desktopState=await page.evaluate(()=>({
    rail:getComputedStyle(document.querySelector(".portfolio-rail")).position,
    overflow:document.documentElement.scrollWidth-innerWidth,
    sections:document.querySelectorAll("#main > section[data-app-view]").length
  }));
  assert.equal(desktopState.rail,"fixed","production desktop rail remains fixed");
  assert.equal(desktopState.sections,7,"production desktop keeps 7 resume chapters");
  assert.ok(desktopState.overflow<=7,"production desktop has no horizontal overflow");
  const switcher=page.locator(".screen-switcher");
  const switcherRect=await switcher.boundingBox();
  const lastCardRect=await page.locator("#top .home-bento .bento-tile").last().boundingBox();
  const cardsOverlap=switcherRect&&lastCardRect&&switcherRect.x<lastCardRect.x+lastCardRect.width&&switcherRect.x+switcherRect.width>lastCardRect.x&&switcherRect.y<lastCardRect.y+lastCardRect.height&&switcherRect.y+switcherRect.height>lastCardRect.y;
  assert.ok(!cardsOverlap,"live desktop fixed pager may not cover the final Home highlight card");
  await page.screenshot({path:"qa-screens/live-desktop-1440-dark.png"});
  await page.locator('.portfolio-rail__nav a[href="#showcase"]').click();
  await page.locator("#showcase .resume-project-evidence summary").click();
  assert.ok(await page.locator("#showcase .resume-project-evidence__grid article").count()===3,"production evidence shows only three selected projects");
  const evidenceRect=await page.locator("#showcase .resume-project-evidence").boundingBox();
  if(switcherRect&&evidenceRect)assert.ok(evidenceRect.x+evidenceRect.width<=switcherRect.x-4,"desktop pager may not overlay Work evidence");
  await page.locator("#showcase .resume-project-evidence__grid article").last().scrollIntoViewIfNeeded();
  await page.screenshot({path:"qa-screens/live-desktop-project-evidence.png"});
  await page.locator('.portfolio-rail__nav a[href="#experience"]').click();
  const desktopCert=page.locator(".certificate-proof--desktop");
  await desktopCert.scrollIntoViewIfNeeded();
  const dc=await desktopCert.locator("img").evaluate(img=>({loaded:img.complete&&img.naturalWidth===340&&img.naturalHeight===427,w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height}));
  assert.ok(dc.loaded&&Math.abs(dc.h/dc.w-427/340)<.02,"production desktop certificate is loaded and uncropped");
  await page.screenshot({path:"qa-screens/live-desktop-certificate.png",fullPage:false});
  const imageRequest=await desktop.request.get(base+"assets/ghl-certificate-preview.webp",{timeout:20000});
  assert.ok(imageRequest.ok(),"production certificate image response "+imageRequest.status());
  const imageBytes=await imageRequest.body();
  assert.equal(imageBytes.length,9534,"published certificate binary must match inspected source");
  assert.equal(imageBytes.toString("ascii",0,4),"RIFF","published asset has WebP RIFF signature");
  const resume=await desktop.request.get(base+"assets/Mark_Jay_Lisay_Public_Resume.pdf",{timeout:20000});
  assert.ok(resume.ok(),"production resume download HTTP status "+resume.status());
  const pdf=await resume.body();
  assert.equal(pdf.length,84933,"live PDF is the uploaded public resume (byte length)");
  assert.equal(errors.length,0,"desktop page JS errors "+errors.join(" | "));
  console.log("LIVE DESKTOP HTTPS PASS "+JSON.stringify({...desktopState,pdfBytes:pdf.length}));

  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2.5,isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const phone=await mobile.newPage(),mobileErrors=[];
  phone.on("pageerror",e=>mobileErrors.push(e.message));
  const m=await phone.goto(base+"?audit="+Date.now()+"#top",{waitUntil:"load",timeout:40000});
  assert.equal(m?.status(),200,"live mobile HTTP status");
  await phone.waitForFunction(()=>document.documentElement.classList.contains("mobile-app"),{timeout:7000});
  assert.equal(await phone.locator(".mobile-tabs>a[data-app-tab]").count(),5,"production five tabs");
  assert.equal(await phone.locator(".mobile-tabs>.mobile-theme-float").count(),1,"production theme orbit attached");
  const mobileMetrics=await phone.locator("#top .hero-proof strong").evaluateAll(items=>items.map(el=>{
    const suffix=el.querySelector(".stat-suffix"),s=suffix&&getComputedStyle(suffix),r=suffix&&suffix.getBoundingClientRect(),parent=el.getBoundingClientRect();
    return {html:el.innerHTML,suffix:suffix?.textContent||"",display:s?.display||"",visibility:s?.visibility||"",opacity:s?.opacity||"",color:s?.color||"",rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null,parentRight:parent.right};
  }));
  console.log("LIVE MOBILE HERO METRICS "+JSON.stringify(mobileMetrics));
  assert.equal(mobileMetrics.length,3,"three mobile proof metrics");
  assert.ok(mobileMetrics.every(m=>m.rect&&m.rect.w>=5&&m.rect.h>=8&&m.visibility==="visible"&&m.display!=="none"),"mobile metric units must remain visibly rendered");
  await phone.screenshot({path:"qa-screens/live-mobile-390-dark.png"});
  await phone.locator('.mobile-tabs a[data-app-tab="work"]').tap();
  await phone.waitForFunction(()=>document.documentElement.dataset.appView==="work",{timeout:6000});
  await phone.locator("#showcase .resume-project-evidence summary").tap();
  assert.equal(await phone.locator("#showcase .resume-project-evidence__grid article").count(),3,"production mobile three selected evidence cards");
  await phone.locator('.mobile-tabs a[data-app-tab="about"]').tap();
  await phone.waitForFunction(()=>document.documentElement.dataset.appView==="about",{timeout:6000});
  const cert=phone.locator(".certificate-proof--mobile");
  await cert.scrollIntoViewIfNeeded();
  const image=cert.locator("img");
  const mobileCert=await image.evaluate(img=>({complete:img.complete,nw:img.naturalWidth,nh:img.naturalHeight,w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height}));
  assert.ok(mobileCert.complete&&mobileCert.nw===340&&mobileCert.nh===427,"production mobile certificate image loaded");
  assert.ok(Math.abs(mobileCert.h/mobileCert.w-427/340)<.02,"production mobile full document not cropped");
  assert.equal(await cert.locator(".certificate-proof__exact-link").getAttribute("href"),"https://my-certificates.com/certificates/6a51c63281683ab6396a9e45");
  const mobileLink=cert.locator(".certificate-proof__exact-link");
  await mobileLink.scrollIntoViewIfNeeded();
  const visible=await mobileLink.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,top=document.elementFromPoint(x,y);return top===el||el.contains(top)});
  assert.ok(visible,"mobile exact certificate link tappable above dock");
  await phone.screenshot({path:"qa-screens/live-mobile-390-certificate-dark.png"});
  await phone.locator("#theme-toggle-mobile").tap();
  assert.equal(await phone.locator("html").getAttribute("data-theme"),"light","production mobile appearance works");
  await cert.scrollIntoViewIfNeeded();
  const light=await cert.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
  assert.notEqual(light.background,light.color,"certificate text is not same as card background in light mode");
  await phone.screenshot({path:"qa-screens/live-mobile-390-certificate-light.png"});
  await phone.locator('.mobile-tabs a[data-app-tab="contact"]').tap();
  await phone.waitForFunction(()=>document.documentElement.dataset.appView==="contact",{timeout:6000});
  const form=phone.locator("#contact .fit-contact-more");
  if(!await form.evaluate(el=>el.open))await form.locator("summary").tap();
  const last=phone.locator("#copy-message");
  await last.scrollIntoViewIfNeeded();
  const hit=await last.evaluate(el=>{const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const h=document.elementFromPoint(x,y);return h===el||el.contains(h)});
  assert.ok(hit,"production mobile dock must not cover Contact's last CTA");
  const phoneState=await phone.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,rootY:scrollY,view:document.documentElement.dataset.appView,theme:document.documentElement.dataset.theme}));
  assert.ok(phoneState.overflow<=7,"production phone no horizontal overflow");
  assert.equal(phoneState.rootY,0,"production phone scroll stays within active tab");
  assert.equal(mobileErrors.length,0,"mobile JS errors "+mobileErrors.join(" | "));
  await phone.screenshot({path:"qa-screens/live-mobile-390-light-contact.png"});
  console.log("LIVE MOBILE HTTPS PASS "+JSON.stringify(phoneState));
  console.log("PRODUCTION BROWSER + PDF DOWNLOAD VERIFIED "+base);
  await mobile.close();await desktop.close();
 }catch(e){console.error("LIVE DEPLOYMENT QA FAILED",e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
