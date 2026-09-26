/* Résumé-first portfolio regression: no duplicate project gallery, visible
   skills/work history and functional direct navigation on desktop + Android. */
const {chromium}=require("playwright");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const assert=require("node:assert/strict");
const origin=pathToFileURL(path.resolve("index.html")).href;
const viewports=[
 {name:"wide desktop",width:1680,height:1000},
 {name:"desktop",width:1440,height:900},
 {name:"small desktop",width:1024,height:768},
 {name:"tablet",width:768,height:1024}
];
const order=["top","showcase","skills","about","results","experience","contact"];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const d of viewports){
   const ctx=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:d.width<=760?2:1,isMobile:d.width<=760,hasTouch:d.width<=760,reducedMotion:"reduce"});
   const page=await ctx.newPage();const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(origin+"#top",{waitUntil:"load",timeout:30000});
    await page.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"),{timeout:6500});
    const state=await page.evaluate(()=>{
      const main=document.getElementById("main");
      const ids=[...main.querySelectorAll(":scope>section[data-app-view]")].map(s=>s.id);
      const idsInDom=new Set([...document.querySelectorAll("[id]")].map(e=>e.id));
      return {
        ids,
        dead:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>id&&!idsInDom.has(id)),
        hidden:[...main.querySelectorAll(":scope>section[data-app-view]")].filter(s=>s.hidden).map(s=>s.id),
        duplicateProjects:Boolean(document.querySelector("#projects,#project-cases,.fit-project-tabs")),
        oversizedLogos:document.querySelectorAll("#top .home-bento img").length,
        carousel:document.querySelectorAll(".orbit-card").length,
        skills:document.querySelectorAll("#skills .skill-card").length,
        roles:document.querySelectorAll("#experience .timeline-entry").length,
        disabledResume:!document.querySelector('a[href$="Mark_Jay_Lisay_Public_Resume.pdf"]'),
        instructions:/Drag · Swipe · Arrow keys|how (?:this|the) website works|Explore by your priority|illustrative onboarding plan/i.test(main.innerText),
        width:document.documentElement.scrollWidth,viewport:innerWidth,
        bodyText:main.innerText.length
      };
    });
    assert.deepEqual(state.ids,order,d.name+" correct résumé chapter order");
    assert.deepEqual(state.dead,[],d.name+" no dead internal links");
    assert.deepEqual(state.hidden,[],d.name+" all résumé sections scrollable");
    assert.equal(state.duplicateProjects,false,d.name+" no redundant project-card gallery");
    assert.equal(state.oversizedLogos,0,d.name+" home project logos removed");
    assert.equal(state.carousel,3,d.name+" exactly three project previews");
    assert.equal(state.skills,6,d.name+" all six skill areas accessible");
    assert.ok(state.roles>=4,d.name+" every employment entry preserved");
    assert.equal(state.disabledResume,false,d.name+" résumé download retained");
    assert.equal(state.instructions,false,d.name+" no technical website instructions");
    assert.ok(state.width<=state.viewport+7,d.name+" no horizontal page overflow");
    assert.ok(await page.locator("#skills .skill-card").last().isVisible(),d.name+" last skill visible without an accordion");
    assert.ok(await page.locator("#experience .timeline-entry").last().isVisible(),d.name+" previous employment visible without an accordion");
    const dock=d.width<=760;
    const work=dock?'.mobile-tabs a[data-app-tab="work"]':'.portfolio-rail__nav a[href="#showcase"]';
    await page.locator(work).click();
    await page.waitForFunction(()=>document.documentElement.dataset.appSection==="showcase",{timeout:5000});
    assert.ok(await page.locator("#orbit-stage").isVisible(),d.name+" work tab opens project carousel");
    const about=dock?'.mobile-tabs a[data-app-tab="about"]':'.portfolio-rail__nav a[href="#about"]';
    await page.locator(about).click();
    await page.waitForFunction(()=>document.documentElement.dataset.appSection==="about",{timeout:5000});
    assert.ok(await page.locator(".about-portrait img").isVisible(),d.name+" personal photo retained");
    if(dock){
      assert.ok(await page.locator(".mobile-theme-float__button").isVisible(),d.name+" floating theme retained");
      if(d.width<=430&&d.height<=660){
        await page.locator('.mobile-tabs a[data-app-tab="home"]').click();
        await page.locator(".fit-home-more summary").click();
        assert.equal(await page.locator(".fit-home-more .bento-tile").count(),3,d.name+" résumé highlights remain accessible");
      }
    }else{
      assert.ok(await page.locator(".portfolio-rail").isVisible(),d.name+" persistent sidebar retained");
    }
    assert.equal(errors.length,0,d.name+" no JS errors: "+errors.join(" | "));
    console.log("RESUME FOCUS PASS "+JSON.stringify({viewport:d.name,sections:state.ids.length,skills:state.skills,roles:state.roles,carousel:state.carousel}));
   }finally{await ctx.close()}
  }
  console.log("RESUME FOCUS QA PASSED");
 }catch(e){console.error("RESUME FOCUS QA FAILED",e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
