/* Phase 2 QA: existing owner preview images and accurate résumé-derived
   case study copy, mobile navigation and accessible JS walkthrough controls. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const fs=require("node:fs/promises");
const url=pathToFileURL(path.resolve("index.html")).href;
const devices=[
 {name:"desktop",w:1440,h:900,mobile:false},
 {name:"compact",w:900,h:740,mobile:false},
 {name:"android",w:390,h:844,mobile:true},
 {name:"small-android",w:320,h:568,mobile:true}
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir("qa-screens",{recursive:true});
 try{
 for(const d of devices)for(const theme of ["light","dark"]){
  const ctx=await browser.newContext({viewport:{width:d.w,height:d.h},deviceScaleFactor:d.mobile?2:1,isMobile:d.mobile,hasTouch:d.mobile,reducedMotion:"reduce"});
  await ctx.addInitScript(value=>localStorage.setItem("mj-theme",value),theme);
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  try{
   await page.goto(url+"#top",{waitUntil:"load",timeout:35000});
   await page.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"),{timeout:9000});
   if(d.mobile)await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.querySelector('.mobile-app__page[data-mobile-view="home"]')?.hidden,{timeout:9000});
   const identity=page.locator(".phase2-mobile-id");
   if(d.mobile){
    await identity.waitFor({state:"visible",timeout:8000});
    assert.equal((await identity.locator("strong").textContent()).trim(),"Mark Jay Lisay");
   }else assert.equal(await identity.isVisible(),false,"mobile header stays mobile-only");
   const result=page.locator("#top .phase2-home-result");
   assert.ok(await result.isVisible(),"true one-case result near Home");
   assert.match(await result.innerText(),/one complex reconciliation case/i);
   const cases=page.locator("#case-studies");
   assert.equal(await cases.locator(".phase2-case").count(),2);
   const copy=await cases.textContent();
   for(const fact of ["5+ hours","Internal workplace case","one complex case","310 tests","Self-directed","remaining","No client data"]){
    assert.ok(copy.toLowerCase().includes(fact.toLowerCase()),"résumé evidence absent: "+fact);
   }
   assert.ok(!/completed paid client contracts|guaranteed savings|certified Windows release/i.test(copy),"no invented outcome");
   assert.ok(!copy.includes("PuddleLoom Growth OS"),"excluded product absent");
   assert.equal(await page.locator("#phase2-welcome-template").count(),0,"obsolete welcome slot removed");
   assert.equal(await page.locator("#phase3-introduction-video").count(),1,"personal introduction on Overview");
   assert.equal(await page.locator("#phase3-introduction-video").getAttribute("autoplay"),"","video configured for autoplay");
   assert.equal(await page.locator("#phase3-introduction-video").evaluate(el=>el.muted),false,"never muted by default");
   await result.click();
   await page.waitForFunction(()=>document.documentElement.dataset.appView==="work",{timeout:7000});
   if(d.mobile){
    assert.equal(await page.locator('.mobile-app__page:not([hidden])').getAttribute("data-mobile-view"),"work");
    assert.equal(await page.locator(".mobile-tabs>a[data-app-tab]").count(),5);
   }else assert.equal(await page.locator(".screen-switcher output").textContent(),"3 / 8","Work remains the third existing chapter");
   const demo=page.locator("#phase2-walkthrough");
   await demo.scrollIntoViewIfNeeded();
   assert.ok(await demo.isVisible(),"walkthrough reachable without login");
   assert.equal(await demo.locator("[data-phase2-project]").count(),3);
   assert.equal(await demo.locator("[data-phase2-step]").count(),3);
   const image=demo.locator("#phase2-demo-image");
   assert.match(await image.getAttribute("src"),/aspirva/);
   await demo.locator('[data-phase2-step="1"]').click();
   assert.match(await demo.locator("#phase2-demo-copy").textContent(),/brand migration/);
   await demo.locator('[data-phase2-step="2"]').click();
   assert.match(await demo.locator("#phase2-demo-copy").textContent(),/310 automated tests/);
   await demo.locator('[data-phase2-project="gold"]').click();
   assert.match(await image.getAttribute("src"),/gold-ops/);
   assert.equal(await demo.locator('[data-phase2-step="0"]').getAttribute("aria-pressed"),"true");
   await demo.locator('[data-phase2-step="2"]').click();
   assert.match(await demo.locator("#phase2-demo-copy").textContent(),/836\/836/);
   await demo.locator('[data-phase2-project="studio"]').click();
   assert.match(await image.getAttribute("src"),/puddleloom-studio/);
   assert.match(await demo.locator("#phase2-demo-copy").textContent(),/FFmpeg\/TypeScript/);
   await demo.locator('[data-phase2-project="aspirva"]').click();
   assert.match(await demo.locator("#phase2-demo-image-link").getAttribute("href"),/aspirva-showcase-hd\.webp$/);
   await image.evaluate(async el=>{if(el.decode)await el.decode()});
   assert.ok(await image.evaluate(el=>el.naturalWidth>2000),"real full-HD preview loads");
   assert.equal(errors.length,0,"no JS errors: "+errors.join("; "));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=7,"no horizontal page overflow");
   if((d.name==="desktop"||d.name==="android")&&theme==="light"){
    await cases.scrollIntoViewIfNeeded();
    await page.screenshot({path:"qa-screens/phase2-"+d.name+"-cases.png"});
    await demo.scrollIntoViewIfNeeded();
    await page.screenshot({path:"qa-screens/phase2-"+d.name+"-walkthrough.png"});
   }
   console.log("CLIENT PHASE2 PASS "+d.name+" "+theme+" cases=2 projects=3");
  }catch(e){
   console.error("CLIENT PHASE2 FAIL "+d.name+" "+theme,e.stack||e);
   await page.screenshot({path:"qa-screens/phase2-fail-"+d.name+"-"+theme+".png"}).catch(()=>{});
   throw e;
  }finally{await ctx.close()}
 }
 console.log("CLIENT PHASE2 ALL EIGHT VIEWPORT/THEME CHECKS PASSED");
 }catch(e){process.exitCode=1}finally{await browser.close()}
})();