/* v19 contact-form visual regression based on the Android screenshot. */
const {chromium}=require("playwright"),assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url"),fs=require("node:fs/promises");
const site=pathToFileURL(path.resolve("index.html")).href;
(async()=>{const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});await fs.mkdir("qa-screens",{recursive:true});
try{for(const width of [320,390,430])for(const theme of ["light","dark"]){
 const height=width===320?568:844;const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:"reduce"});await ctx.addInitScript(t=>localStorage.setItem("mj-theme",t),theme);const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
 try{await p.goto(site+"#contact",{waitUntil:"load"});await p.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.documentElement.classList.contains("mobile-app-boot"),{timeout:10000});await p.locator('.mobile-tabs a[data-app-tab="contact"]').click();await p.waitForFunction(()=>document.documentElement.dataset.appView==="contact");
 const more=p.locator("#contact .fit-contact-more");if(await more.count()&&!(await more.evaluate(el=>el.open)))await more.locator("summary").click();
 const form=p.locator("#contact-form");await form.scrollIntoViewIfNeeded();
 const submit=p.locator(".client-inquiry-submit"),privacy=p.locator(".client-privacy-block"),utility=p.locator(".contact-utility-panel");
 assert.ok(await submit.isVisible());assert.ok(await privacy.isVisible());assert.ok(await utility.isVisible());
 const gap=await p.evaluate(()=>{const a=document.querySelector(".client-inquiry-submit").getBoundingClientRect(),b=document.querySelector(".client-privacy-block").getBoundingClientRect();return b.top-a.bottom});
 assert.ok(gap>=8&&gap<=28,"submit-to-privacy gap must stay compact, got "+gap);
 assert.equal(await p.locator("#form-status").isVisible(),false,"empty status line must not reserve whitespace");
 assert.equal(await p.locator(".client-privacy-block .ui-action").count(),1);
 assert.equal(await p.locator(".contact-utility-panel__top .ui-action").count(),1);
 assert.equal(await p.locator(".contact-copy-actions .contact-copy-button").count(),2);
 for(const el of await p.locator(".contact-utility-panel a,.contact-utility-panel button").all())await el.click({trial:true});
 const dockTop=await p.locator(".mobile-tabs").evaluate(el=>el.getBoundingClientRect().top);
 const bottom=await utility.evaluate(el=>el.getBoundingClientRect().bottom);
 assert.ok(bottom<=dockTop+2||await p.evaluate(()=>document.querySelector('.mobile-app__page[data-mobile-view="contact"]').scrollHeight>document.querySelector('.mobile-app__page[data-mobile-view="contact"]').clientHeight),"utility panel stays scrollable above dock");
 assert.equal(errors.length,0,errors.join(" | "));
 if(width===390&&theme==="light"){await utility.scrollIntoViewIfNeeded();await p.screenshot({path:"qa-screens/contact-v19-390-light.png",animations:"disabled"})}
 console.log("CONTACT V19 PASS "+width+" "+theme+" gap="+gap);
 }catch(e){console.error("CONTACT V19 FAIL "+width+" "+theme,e.stack||e);throw e}finally{await ctx.close()}}
 console.log("CONTACT V19 ALL SIX MOBILE CHECKS PASSED")}catch(e){process.exitCode=1}finally{await browser.close()}})();
