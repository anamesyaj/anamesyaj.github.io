/* v18 action-button and social-icon regression checks. */
const {chromium}=require("playwright"),assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url"),fs=require("node:fs/promises");
const site=pathToFileURL(path.resolve("index.html")).href;
(async()=>{const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});await fs.mkdir("qa-screens",{recursive:true});
try{for(const d of [{n:"desktop",w:1440,h:900,m:false},{n:"android",w:390,h:844,m:true},{n:"small",w:320,h:568,m:true}])for(const theme of ["light","dark"]){
 const ctx=await browser.newContext({viewport:{width:d.w,height:d.h},isMobile:d.m,hasTouch:d.m,deviceScaleFactor:d.m?2:1,reducedMotion:"reduce"});await ctx.addInitScript(t=>localStorage.setItem("mj-theme",t),theme);const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
 try{await p.goto(site+"#top",{waitUntil:"load"});await p.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"),{timeout:10000});if(d.m)await p.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.documentElement.classList.contains("mobile-app-boot"),{timeout:10000});
 assert.equal(await p.locator(".portfolio-rail__nav .ui-action").count(),0);assert.equal(await p.locator(".mobile-tabs .ui-action").count(),0);
 assert.equal(await p.locator(".portfolio-rail__socials .ui-social-button").count(),3);assert.equal(await p.locator(".portfolio-rail__socials .ui-social-button svg").count(),3);
 for(const el of await p.locator(".portfolio-rail__socials .ui-social-button").all())assert.ok(await el.getAttribute("aria-label"));
 for(const selector of [".portfolio-rail__inquiry.ui-action",".portfolio-rail__resume.ui-action",".hero-resume-link.ui-action",".client-service-card__link.ui-action",".phase2-work-link.ui-action",".orbit-card__action.ui-action",".phase2-case__cta.ui-action",".certificate-proof__exact-link.ui-action",".resume-icon-link.ui-action",".site-footer .ui-action"])assert.ok(await p.locator(selector).count()>=1,"missing "+selector);
 assert.equal(await p.locator(".ui-contact-socials .ui-social-button").count(),3);assert.equal(await p.locator(".ui-contact-socials .ui-social-button svg").count(),3);
 assert.equal((await p.locator(".resume-icon-link").innerText()).trim(),"Download PDF");
 assert.ok((await p.locator(".certificate-proof__exact-link").first().textContent()).includes("my-certificates.com/certificates/6a51c63281683ab6396a9e45"));
 for(const el of await p.locator('a[target="_blank"]').all()){const rel=(await el.getAttribute("rel"))||"";assert.ok(rel.includes("noopener")&&rel.includes("noreferrer"))}
 const video=p.locator("#phase3-introduction-video");assert.equal(await video.getAttribute("autoplay"),"");assert.equal(await video.evaluate(el=>el.muted),false);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=7);
 if(d.m){await p.locator('.mobile-tabs a[data-app-tab="contact"]').click();await p.waitForFunction(()=>document.documentElement.dataset.appView==="contact");const socials=p.locator(".ui-contact-socials");await socials.scrollIntoViewIfNeeded();for(const el of await socials.locator("a").all())await el.click({trial:true});const dockTop=await p.locator(".mobile-tabs").evaluate(el=>el.getBoundingClientRect().top);const bottom=await socials.evaluate(el=>el.getBoundingClientRect().bottom);assert.ok(bottom<=dockTop+2)}
 assert.equal(errors.length,0,errors.join(" | "));if((d.n==="desktop"||d.n==="android")&&theme==="light")await p.screenshot({path:"qa-screens/actions-"+d.n+"-"+theme+".png",animations:"disabled"});console.log("ACTION BUTTONS V18 PASS "+d.n+" "+theme);
 }catch(e){console.error("ACTION BUTTONS V18 FAIL "+d.n+" "+theme,e.stack||e);throw e}finally{await ctx.close()}}
 console.log("ACTION BUTTONS V18 ALL SIX DEVICE/THEME CHECKS PASSED")}catch(e){process.exitCode=1}finally{await browser.close()}})();
