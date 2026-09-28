/* Final responsive polish: first-fold actions and actual touch targets
   must remain clear of the now self-contained mobile navigation dock. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const path=require("node:path"),fs=require("node:fs/promises");
const site=pathToFileURL(path.resolve("index.html")).href;
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir("qa-screens",{recursive:true});
 try{
  for(const width of [320,390,430])for(const theme of ["light","dark"]){
   const height=width===320?568:width===390?844:932;
   const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:"reduce"});
   await ctx.addInitScript(t=>localStorage.setItem("mj-theme",t),theme);
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(site+"#top",{waitUntil:"load"});
    await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.documentElement.classList.contains("mobile-app-boot"),{timeout:10000});
    const first=await page.evaluate(()=>{
     const box=q=>document.querySelector(q)?.getBoundingClientRect();
     const heading=box("#top .hero-heading"),dock=box(".mobile-tabs");
     const contact=box("#top a.button-primary"),service=box('#top a[href="#services"].button');
     const footer=document.querySelector('#personal-introduction .phase3-intro__footer');
     return {dockTop:dock?.top,headingBottom:heading?.bottom,contactBottom:contact?.bottom,serviceBottom:service?.bottom,
      footerStatusVisible:!!footer&&(footer.getBoundingClientRect().width>20),mainBottom:box("#main")?.bottom};
    });
    assert.ok(first.dockTop-first.mainBottom>=40&&first.dockTop-first.mainBottom<=53,"content must stop just above the raised appearance ring "+JSON.stringify(first));
    assert.equal(first.footerStatusVisible,false,"placeholder repeats its message; visually hide duplicate only on phones");
    if(width>=390){
     assert.ok(first.contactBottom<=first.dockTop-5,"first-fold project CTA fully visible "+JSON.stringify(first));
     assert.ok(first.serviceBottom<=first.dockTop-5,"first-fold service CTA fully visible "+JSON.stringify(first));
    }else assert.ok(first.headingBottom<=first.dockTop+5,"320px heading not behind the dock "+JSON.stringify(first));
    const targets=[
      ["home",'#top a[href="#services"].button'],
      ["work","#showcase .resume-project-evidence summary"],
      ["about",".certificate-proof--mobile .certificate-proof__preview"]
    ];
    for(const [view,selector] of targets){
     if(view!=="home"){
      await page.locator('.mobile-tabs a[data-app-tab="'+view+'"]').click();
      await page.waitForFunction(v=>document.documentElement.dataset.appView===v,view);
      if(view==="about"){
       const extra=page.locator('.mobile-app__more[data-subsection="experience"]');
       if(!(await extra.evaluate(el=>el.open)))await extra.locator("summary").click();
      }
     }
     const target=page.locator(selector);
     await target.scrollIntoViewIfNeeded();
     const hit=await target.evaluate(el=>{
      const r=el.getBoundingClientRect(),dock=document.querySelector(".mobile-tabs").getBoundingClientRect();
      const x=r.x+r.width/2,y=r.y+r.height/2,front=document.elementFromPoint(x,y);
      return {top:r.top,bottom:r.bottom,dockTop:dock.top,hit:front===el||el.contains(front),front:front?.outerHTML?.slice(0,240),stack:document.elementsFromPoint(x,y).slice(0,5).map(n=>n.tagName+"."+n.className)};
     });
     assert.ok(hit.bottom<=hit.dockTop+2,"mobile "+view+" target stays above the dock "+JSON.stringify(hit));
     // Trial click is Playwright’s browser-level actionability test: it checks
     // the actual pointer hit target and auto-scrolls without navigation.
     await target.click({trial:true,timeout:4000});
    }
    assert.equal(errors.length,0,"no page JS errors "+errors.join(";"));
    if(width===320||width===390)await page.screenshot({path:"qa-screens/polish-"+width+"-"+theme+"-about.png"});
    console.log("POLISH FIRST-FOLD PASS "+width+" "+theme+" "+JSON.stringify(first));
   }catch(e){console.error("POLISH FIRST-FOLD FAIL "+width+" "+theme,e.stack||e);await page.screenshot({path:"qa-screens/polish-fail-"+width+"-"+theme+".png"}).catch(()=>{});throw e}
   finally{await ctx.close()}
  }
  console.log("POLISH SIX MOBILE FIRST-FOLD + LINK-HIT CHECKS PASS");
 }catch(e){process.exitCode=1}finally{await browser.close()}
})();
