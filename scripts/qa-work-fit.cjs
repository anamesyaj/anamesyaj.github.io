/* Regression coverage for cropped Work-card art and responsive, unclipped content. */
const { chromium }=require("playwright");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const assert=require("node:assert/strict");
const fs=require("node:fs/promises");
const origin=pathToFileURL(path.join(process.cwd(),"index.html")).href;
const sizes=[
  {width:1680,height:1000,name:"wide-desktop"},
  {width:1440,height:900,name:"desktop"},
  {width:1280,height:720,name:"small-desktop"},
  {width:900,height:740,name:"compact-desktop"},
  {width:768,height:1024,name:"tablet-desktop"},
  {width:760,height:760,name:"tablet-mobile"},
  {width:390,height:844,name:"android"},
  {width:320,height:568,name:"small-android"}
];
function near(a,b,t=4){return Math.abs(a-b)<=t}
async function check(browser,device){
  const context=await browser.newContext({
    viewport:{width:device.width,height:device.height},
    deviceScaleFactor:device.width<=760?2:1,
    hasTouch:device.width<=760,
    isMobile:device.width<=760,
    reducedMotion:"reduce"
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const pageTag=device.name+" ("+device.width+"×"+device.height+")";
  try{
    await page.goto(origin+"#projects",{waitUntil:"load",timeout:35000});
    await page.waitForFunction(()=>document.documentElement.classList.contains("continuous-deck"),{timeout:7000});
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.evaluate(async()=>{
      const imgs=[...document.querySelectorAll("#projects .project-art img")];
      await Promise.all(imgs.filter(i=>getComputedStyle(i).display!=="none").map(i=>i.decode().catch(()=>{})));
    });
    const result=await page.evaluate(()=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width}};
      const panel=document.querySelector("#projects > .mx-auto");
      const grid=document.getElementById("project-cases");
      const cards=[...grid.querySelectorAll(":scope > .project-card")].map(card=>{
        const art=card.querySelector(".project-art");
        const title=card.querySelector(".project-content h3");
        const corner=art.querySelector(".project-art-corner");
        const images=[...art.querySelectorAll("img")].filter(e=>getComputedStyle(e).display!=="none" && !e.hidden).map(img=>({
          ...rect(img),
          naturalWidth:img.naturalWidth,
          naturalHeight:img.naturalHeight
        }));
        return {
          name:title.textContent.trim(),
          card:rect(card),art:rect(art),title:rect(title),corner:rect(corner),images,
          scrollHeight:card.scrollHeight,clientHeight:card.clientHeight,
          maxHeight:getComputedStyle(card).maxHeight,
          artFlexShrink:getComputedStyle(art).flexShrink,
          titleText:title.innerText
        };
      });
      const shape=id=>{
        const sec=document.getElementById(id);
        const box=sec.querySelector(":scope > .mx-auto");
        const target=id==="top"?sec.querySelector(".home-bento"):id==="skills"?sec.querySelector(".grid"):id==="approach"?sec.querySelector(".method-grid"):sec.querySelector(".results-grid");
        return {id,
          section:rect(sec),box:rect(box),target:target?rect(target):null,
          sectionWidth:sec.clientWidth,sectionScrollWidth:sec.scrollWidth,
          boxWidth:box.clientWidth,boxScrollWidth:box.scrollWidth,
          targetWidth:target?.clientWidth,targetScrollWidth:target?.scrollWidth
        };
      };
      const root=document.documentElement;
      return {
        viewport:innerWidth,
        rootScrollWidth:root.scrollWidth,
        cards,grid:rect(grid),
        gridScrollWidth:grid.scrollWidth,gridClientWidth:grid.clientWidth,
        gridStyle:getComputedStyle(grid).gridTemplateColumns,
        sections:["top","skills","approach","results"].map(shape),
        panelWidth:panel.clientWidth,panelScrollWidth:panel.scrollWidth,
        project:rect(document.getElementById("projects"))
      };
    });
    assert.equal(result.cards.length,3,pageTag+" must show all three project cards");
    assert.ok(result.panelScrollWidth<=result.panelWidth+5,pageTag+" project panel must not overflow horizontally: "+JSON.stringify(result.panelWidth));
    assert.ok(result.gridScrollWidth<=result.gridClientWidth+5,pageTag+" project grid must not crop cards or scroll sideways");
    assert.ok(result.rootScrollWidth<=result.viewport+6,pageTag+" document must not scroll sideways");
    for(const card of result.cards){
      assert.ok(card.card.width>210,pageTag+" card too narrow: "+card.name);
      assert.ok(card.art.height>=130,pageTag+" art flex-shrank into heading: "+card.name+" art="+card.art.height);
      assert.equal(card.artFlexShrink,"0",pageTag+" logo art must never flex-shrink: "+card.name);
      assert.ok(card.title.top>=card.art.bottom+9,pageTag+" title overlaps image panel: "+card.name+" "+JSON.stringify({art:card.art,title:card.title}));
      assert.ok(card.title.bottom<=card.card.bottom-8,pageTag+" title clipped by card: "+card.name);
      assert.ok(card.scrollHeight<=card.clientHeight+5,pageTag+" card contents cropped vertically: "+card.name+" "+JSON.stringify({scroll:card.scrollHeight,client:card.clientHeight,max:card.maxHeight}));
      assert.ok(card.images.length>=1,pageTag+" project logo should be visible: "+card.name);
      for(const img of card.images){
        assert.ok(img.naturalWidth>0,pageTag+" logo asset failed to load: "+card.name);
        assert.ok(img.top>=card.art.top+31,pageTag+" logo covers art label: "+card.name);
        assert.ok(img.bottom<=card.art.bottom-9,pageTag+" logo extends below art into title: "+card.name);
        assert.ok(img.left>=card.art.left+5&&img.right<=card.art.right-5,pageTag+" logo cuts off horizontally: "+card.name);
      }
    }
    if(device.width<=760){
      assert.ok(result.cards[1].card.top>=result.cards[0].card.bottom+6,pageTag+" Aspirva is not stacked after Gold Ops");
      assert.ok(result.cards[2].card.top>=result.cards[1].card.bottom+6,pageTag+" PuddleLoom is not stacked after Aspirva");
    }
    for(const section of result.sections){
      assert.ok(section.boxScrollWidth<=section.boxWidth+6,pageTag+" content panel overflows horizontally: "+section.id+" "+JSON.stringify(section));
      if(section.id!=="top")assert.ok((section.targetScrollWidth||0)<=(section.targetWidth||0)+6,pageTag+" grid overflows horizontally: "+section.id+" "+JSON.stringify(section));
    }
    // Opening all cases is an actual long-content scenario: grow the section
    // into the natural page rather than introducing a hidden internal scrollbar.
    await page.locator("#projects .case-expand summary").first().scrollIntoViewIfNeeded();
    await page.locator("#projects .case-expand summary").first().click();
    const expanded=await page.locator("#projects .project-card").first().evaluate(card=>{
      const details=card.querySelector(".case-expand");
      const r=card.getBoundingClientRect(),d=details.getBoundingClientRect();
      return{
        open:details.open,sectionBottom:card.closest("section").getBoundingClientRect().bottom,
        bottom:r.bottom,detailsBottom:d.bottom,
        scrollHeight:card.scrollHeight,clientHeight:card.clientHeight,
        detailsMaxHeight:getComputedStyle(details).maxHeight,
        detailsOverflow:getComputedStyle(details).overflowY
      };
    });
    assert.ok(expanded.open,pageTag+" case details failed to expand");
    assert.ok(expanded.detailsBottom<=expanded.bottom+2,pageTag+" expanded case study clipped below card");
    assert.ok(expanded.bottom<=expanded.sectionBottom+3,pageTag+" project section cuts off expanded case study");
    assert.ok(expanded.scrollHeight<=expanded.clientHeight+5,pageTag+" expanded card content clipped");
    assert.equal(expanded.detailsOverflow,"visible",pageTag+" details should expand, not create nested vertical scroll");
    assert.equal(errors.length,0,pageTag+" uncaught errors: "+errors.join(" | "));
    console.log("WORK CARD FIT PASS "+JSON.stringify({device:pageTag,grid:result.gridStyle,
      cards:result.cards.map(c=>({name:c.name,art:c.art.height,titleGap:Math.round(c.title.top-c.art.bottom),cardWidth:Math.round(c.card.width)})),
      rootScrollWidth:result.rootScrollWidth,expanded}));
    if(process.env.QA_SCREENSHOTS==="1"){
      await fs.mkdir("qa-screens",{recursive:true});
      await page.locator("#projects").scrollIntoViewIfNeeded();
      await page.screenshot({path:"qa-screens/work-"+device.name+".png",fullPage:false});
    }
  }catch(e){
    console.error("WORK CARD FIT FAIL "+pageTag+": "+(e.stack||e));
    await fs.mkdir("qa-screens",{recursive:true});
    try{
      await page.locator("#projects").scrollIntoViewIfNeeded();
      await page.screenshot({path:"qa-screens/work-"+device.name+"-failure.png",fullPage:false});
    }catch(_){}
    throw e;
  }finally{await context.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{for(const device of sizes)await check(browser,device);console.log("WORK CARD AND AUTOFIT QA PASSED")}
 catch(_){process.exitCode=1}
 finally{await browser.close()}
})();
