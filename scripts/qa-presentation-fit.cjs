const {chromium}=require("playwright");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const assert=require("node:assert/strict");
const url=pathToFileURL(path.resolve("index.html")).href;
const devices=[
 {name:"wide-desktop",w:1680,h:1000},{name:"desktop",w:1440,h:900},
 {name:"compact-desktop",w:1024,h:768},{name:"tablet",w:768,h:1024},
 {name:"mobile",w:390,h:844},{name:"small-mobile",w:320,h:568}
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const d of devices){
   const context=await browser.newContext({viewport:{width:d.w,height:d.h},isMobile:d.w<=760,hasTouch:d.w<=760,reducedMotion:"reduce"});
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(url+"#projects",{waitUntil:"load",timeout:30000});
    await page.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"),{timeout:6000});
    await page.waitForTimeout(250);
    const before=await page.evaluate(()=>{
      const section=document.querySelector("#projects"),cards=[...section.querySelectorAll(".project-card")];
      const rendered=cards.filter(card=>getComputedStyle(card).display!=="none");
      const art=rendered[0].querySelector(".project-art").getBoundingClientRect();
      const title=rendered[0].querySelector("h3").getBoundingClientRect();
      const visible=section.querySelector(".mx-auto").getBoundingClientRect();
      const height=section.getBoundingClientRect().height;
      return {tabs:section.querySelectorAll('[role="tab"]').length,shown:rendered.length,active:rendered[0].querySelector("h3").textContent,
      artBottom:art.bottom,titleTop:title.top,sectionHeight:height,viewport:innerHeight,
      scrollWidth:document.documentElement.scrollWidth,innerWidth,sectionPanel:visible.height,
      maxSectionWidth:section.scrollWidth,renderedCardWidth:rendered[0].getBoundingClientRect().width,
      extra:document.querySelectorAll(".fit-details").length};
    });
    assert.equal(before.tabs,3,d.name+" project tabs");
    assert.equal(before.shown,1,d.name+" one featured project at a time");
    assert.ok(before.titleTop>=before.artBottom+4,d.name+" visual must not overlay title");
    assert.ok(before.scrollWidth<=before.innerWidth+6,d.name+" no horizontal clipping");
    assert.ok(before.extra>=4,d.name+" long evidence stays accessible");
    await page.locator('[role="tab"]',{hasText:"Aspirva"}).click();
    assert.ok(await page.locator('.project-card[data-fit-active="true"] h3').getByText("Aspirva").isVisible(),d.name+" Aspirva selectable");
    await page.locator('[role="tab"]',{hasText:"PuddleLoom"}).click();
    assert.ok(await page.locator('.project-card[data-fit-active="true"] h3').getByText("PuddleLoom Studio").isVisible(),d.name+" PuddleLoom selectable");
    assert.ok(await page.locator('.fit-skills-more summary').isVisible(),d.name+" skills accessible");
    await page.locator('.fit-skills-more summary').click();
    assert.equal(await page.locator('.fit-skills-more .skill-card').count(),4,d.name+" all remaining skills");
    const all=await page.locator('main>section[data-app-view]').count();
    assert.equal(all,10,d.name+" all sections available");
    if(d.w<=760){
      await page.locator('.fit-project-more summary').last().click();
      assert.ok(await page.locator('.project-card[data-fit-active="true"] .fit-project-more .project-stack').isVisible(),d.name+" full technical evidence visible");
      await page.locator('.mobile-tabs a[data-app-tab="contact"]').click();
      assert.ok(await page.locator('.fit-contact-more summary').isVisible(),d.name+" phone contact CTA");
      await page.locator('.fit-contact-more summary').click();
      assert.ok(await page.locator('#contact-form').isVisible(),d.name+" phone contact form accessible");
      if(d.w<=430&&d.h<=660){
       await page.locator('.mobile-tabs a[data-app-tab="home"]').click();
       assert.ok(await page.locator('.fit-home-more summary').isVisible(),d.name+" home quick links accessible");
       await page.locator('.fit-home-more summary').click();
       assert.equal(await page.locator('.fit-home-more .bento-tile').count(),3,d.name+" no hidden home link lost");
      }
    } else {
      await page.locator('.portfolio-rail__nav a[href="#contact"]').click();
      assert.ok(await page.locator('#contact-form').isVisible(),d.name+" desktop form visible");
    }
    assert.equal(errors.length,0,d.name+" no uncaught errors "+errors.join(" | "));
    console.log("PRESENTATION PASS "+JSON.stringify({device:d.name,viewport:d.w+"x"+d.h,sectionHeight:Math.round(before.sectionHeight),singleProject:true,allContentAccessible:true}));
   }finally{await context.close();}
  }
  console.log("PRESENTATION FIT QA PASSED");
 }catch(e){console.error("PRESENTATION FIT QA FAILED",e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();