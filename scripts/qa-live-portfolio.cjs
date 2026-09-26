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
  /* Pages and source QA start in parallel. Poll until the new C2 wording has
     reached the public CDN; a success here verifies the actual deployment. */
  for(let attempt=0;attempt<18;attempt++){
   try{
    const result=await page.goto(base+"?audit="+Date.now()+"-"+attempt+"#top",{waitUntil:"domcontentloaded",timeout:16000});
    const state=await page.evaluate(()=>({
      growth:Boolean(document.querySelector(".resume-project-evidence__secondary")),
      c2:document.documentElement.outerHTML.includes("C2 production acceptance on 2026-09-03"),
      cert:document.documentElement.outerHTML.includes("GoHighLevel Basic Training")
    }));
    if(result&&result.status()===200&&state.growth&&state.c2&&state.cert){deployed=true;break}
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
  await page.screenshot({path:"qa-screens/live-desktop-1440-dark.png"});
  await page.locator('.portfolio-rail__nav a[href="#showcase"]').click();
  await page.locator("#showcase .resume-project-evidence summary").click();
  assert.ok(await page.locator("#growth-os-evidence-title").isVisible(),"production Growth OS detail accessible");
  await page.locator("#growth-os-evidence-title").scrollIntoViewIfNeeded();
  await page.screenshot({path:"qa-screens/live-desktop-project-evidence.png"});
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
  await phone.screenshot({path:"qa-screens/live-mobile-390-dark.png"});
  await phone.locator('.mobile-tabs a[data-app-tab="work"]').tap();
  await phone.waitForFunction(()=>document.documentElement.dataset.appView==="work",{timeout:6000});
  await phone.locator("#showcase .resume-project-evidence summary").tap();
  assert.ok(await phone.locator("#growth-os-evidence-title").isVisible(),"production mobile fourth project reachable");
  await phone.locator('.mobile-tabs a[data-app-tab="about"]').tap();
  await phone.waitForFunction(()=>document.documentElement.dataset.appView==="about",{timeout:6000});
  await phone.locator('.mobile-app__more[data-subsection="experience"] summary').tap();
  const cert=phone.locator(".education-cert");
  await cert.scrollIntoViewIfNeeded();
  assert.ok(await cert.isVisible(),"production mobile training certificate reachable");
  await phone.locator("#theme-toggle-mobile").tap();
  assert.equal(await phone.locator("html").getAttribute("data-theme"),"light","production mobile appearance works");
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
