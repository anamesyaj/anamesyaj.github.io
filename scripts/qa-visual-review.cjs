/* Read-only site audit: stable screenshots + visible overlay geometry.
   All eight desktop chapters, all five mobile tabs, both color schemes. */
const {chromium}=require("playwright"),fs=require("node:fs/promises"),path=require("node:path"),{pathToFileURL}=require("node:url");
const site=pathToFileURL(path.resolve("index.html")).href,dir="qa-visual-audit";
const devices=[{name:"desktop",w:1440,h:900,m:false,shots:true},{name:"compact",w:900,h:740,m:false,shots:false},{name:"android",w:390,h:844,m:true,shots:true},{name:"small",w:320,h:568,m:true,shots:true}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir(dir,{recursive:true});let report=[];
 try{
 for(const d of devices)for(const theme of ["light","dark"]){
  const ctx=await browser.newContext({viewport:{width:d.w,height:d.h},isMobile:d.m,hasTouch:d.m,deviceScaleFactor:1,reducedMotion:"reduce"});
  await ctx.addInitScript(t=>localStorage.setItem("mj-theme",t),theme);
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(site+"#top",{waitUntil:"load"});
   await page.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"),{timeout:10000});
   if(d.m)await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.documentElement.classList.contains("mobile-app-boot"),{timeout:10000});
   const routes=d.m?["home","work","contact","skills","about"]:["top","services","showcase","skills","about","results","experience","contact"];
   for(const id of routes){
    const key=d.name+"-"+theme+"-"+id;
    try{
     if(id!==routes[0]){
      const selector=d.m?'.mobile-tabs a[data-app-tab="'+id+'"]':'.portfolio-rail__nav a[href="#'+id+'"]';
      await page.locator(selector).click();
      await page.waitForFunction(({id,m})=>m?document.documentElement.dataset.appView===id:document.documentElement.dataset.appSection===id,{id,m:d.m},{timeout:8500});
      if(!d.m){
       const title=page.locator("#"+id+" .section-heading").first();
       if(await title.count())await title.scrollIntoViewIfNeeded();
      }
     }
     await page.waitForTimeout(380);
     const state=await page.evaluate(({id,m})=>{
      const node=document.getElementById(id==="home"?"top":id==="work"?"showcase":id);
      const heading=node?.querySelector("h1,h2,h3");
      const active=m?document.querySelector('.mobile-app__page[data-mobile-view="'+id+'"]'):node;
      const orb=document.querySelector(".mobile-tabs>.mobile-theme-float>.mobile-theme-float__button");
      const box=el=>{if(!el)return null;const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),visibility:s.visibility}};
      const o=orb?.getBoundingClientRect(),hits=[],clipped=[];
      if(m&&o&&active){
       for(const el of active.querySelectorAll("a,button,summary")){
        const r=el.getBoundingClientRect(),s=getComputedStyle(el);
        if(s.display==="none"||s.visibility==="hidden"||r.width<20||r.bottom<0||r.top>innerHeight)continue;
        const l=Math.max(r.left,o.left),right=Math.min(r.right,o.right),top=Math.max(r.top,o.top),bottom=Math.min(r.bottom,o.bottom);
        const area=Math.max(0,right-l)*Math.max(0,bottom-top);
        if(area>50){
         const cover=document.elementFromPoint((l+right)/2,(top+bottom)/2);
         hits.push({label:(el.getAttribute("aria-label")||el.textContent||"").trim().slice(0,70),area:Math.round(area),cover:cover===orb||orb.contains(cover)});
        }
       }
      }
      for(const el of (active||document).querySelectorAll("h1,h2,h3,button,summary")){
       if(clipped.length>=9)break;const s=getComputedStyle(el),r=el.getBoundingClientRect();
       if(r.width>20&&s.display!=="none"&&el.scrollWidth-el.clientWidth>8&&s.overflowX!=="visible")
        clipped.push({text:el.textContent.trim().slice(0,65),pixels:el.scrollWidth-el.clientWidth});
      }
      return {hash:location.hash,view:document.documentElement.dataset.appView,chapter:document.documentElement.dataset.appSection,heading:box(heading),active:box(active),orbit:box(orb),overlaps:hits,clipped,pageOverflow:document.documentElement.scrollWidth-innerWidth};
     },{id,m:d.m});
     report.push({device:d.name,theme,target:id,...state,errors:[...errors]});
     console.log("VISUAL AUDIT "+JSON.stringify({device:d.name,theme,id,heading:state.heading,overlaps:state.overlaps,clipped:state.clipped,overflow:state.pageOverflow}));
     if(d.shots&&(d.name!=="small"||["home","contact","about"].includes(id)))await page.screenshot({path:dir+"/"+key+".png",animations:"disabled"});
     if(d.m&&d.name==="android"){
      if(id==="work"){await page.locator("#case-studies").scrollIntoViewIfNeeded();await page.screenshot({path:dir+"/"+d.name+"-"+theme+"-cases.png"});await page.locator("#phase2-walkthrough").scrollIntoViewIfNeeded();await page.screenshot({path:dir+"/"+d.name+"-"+theme+"-walkthrough.png"})}
      if(id==="contact"){
       const details=page.locator("#contact .fit-contact-more");if(!(await details.evaluate(el=>el.open)))await details.locator("summary").click();
       await page.locator("#contact-form").scrollIntoViewIfNeeded();await page.screenshot({path:dir+"/"+d.name+"-"+theme+"-contact-form.png"});
       await page.locator('.mobile-app__page[data-mobile-view="contact"]').evaluate(el=>el.scrollTop=el.scrollHeight);
       await page.screenshot({path:dir+"/"+d.name+"-"+theme+"-contact-bottom.png"});
      }
      if(id==="about"){
       const details=page.locator('.mobile-app__more[data-subsection="experience"]');if(!(await details.evaluate(el=>el.open)))await details.locator("summary").click();
       await page.locator(".certificate-proof--mobile").scrollIntoViewIfNeeded();await page.screenshot({path:dir+"/"+d.name+"-"+theme+"-certificate.png"});
      }
     }
    }catch(e){errors.push(id+" "+String(e));console.error("VISUAL PAGE ERROR "+key+" "+String(e))}
   }
  }catch(e){errors.push("initialization "+String(e));console.error("VISUAL CONTEXT ERROR "+d.name+" "+theme+" "+String(e))}
  finally{await ctx.close()}
 }
 await fs.writeFile(dir+"/report.json",JSON.stringify(report,null,2));
 const overlaps=report.flatMap(x=>x.overlaps.map(v=>({...v,device:x.device,theme:x.theme,target:x.target})));
 console.log("VISUAL AUDIT SUMMARY "+JSON.stringify({states:report.length,overlaps:overlaps.slice(0,40),missingHeadings:report.filter(x=>!x.heading||!x.heading.w||!x.heading.h).map(x=>x.device+"-"+x.theme+"-"+x.target),errors:report.filter(x=>x.errors.length).map(x=>({device:x.device,theme:x.theme,errors:x.errors.slice(-3)}))}));
 }finally{await browser.close()}
})();
