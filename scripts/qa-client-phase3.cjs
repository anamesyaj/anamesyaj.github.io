/* Phase 3: first-visit INTRODUCTION placeholder, audible-autoplay fallback,
   retired page redirects and Android/desktop responsiveness. */
const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs"),fsp=require("node:fs/promises"),path=require("node:path"),{pathToFileURL}=require("node:url");
const site=pathToFileURL(path.resolve("index.html")).href;
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fsp.mkdir("qa-screens",{recursive:true});
 try{
  for(const file of ["canvas-v4.html","canvas-v5.html","canvas-v6.html","canvas-v7.html","canvas-v8.html","canvas-v9.html","canvas-v10.html","deck-v2.html","deck-v3.html"]){
   const s=fs.readFileSync(file,"utf8");
   assert.match(s,/content="noindex, follow"/,file+" noindex");
   assert.match(s,/http-equiv="refresh" content="0;url=https:\/\/anamesyaj.github.io\/"/,file+" canonical redirect");
   assert.match(s,/<link rel="canonical" href="https:\/\/anamesyaj.github.io\/">/,file+" canonical");
  }
  assert.match(fs.readFileSync("robots.txt","utf8"),/Sitemap: https:\/\/anamesyaj.github.io\/sitemap.xml/);
  assert.match(fs.readFileSync("sitemap.xml","utf8"),/<loc>https:\/\/anamesyaj.github.io\/<\/loc>/);
  const mp4Exists=fs.existsSync("assets/introduction-mark-jay-60s.mp4");
  assert.equal(mp4Exists,false,"this QA checkpoint expects the owner's actual MP4 to be pending");
  const devices=[["desktop",1440,900,false],["compact",900,740,false],["android",390,844,true],["small",320,568,true]];
  for(const [name,w,h,mobile] of devices)for(const theme of ["light","dark"]){
   const ctx=await browser.newContext({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:"reduce"});
   await ctx.addInitScript(t=>localStorage.setItem("mj-theme",t),theme);
   const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
   try{
    await p.goto(site+"#top",{waitUntil:"load",timeout:35000});
    await p.waitForFunction(()=>document.documentElement.classList.contains("presentation-fit"));
    if(mobile)await p.waitForFunction(()=>document.documentElement.classList.contains("mobile-app"));
    const panel=p.locator("#personal-introduction"),video=p.locator("#phase3-introduction-video");
    assert.equal(await panel.count(),1,"one owner introduction in Overview");
    assert.ok(await panel.isVisible(),"placeholder visible");
    const box=await panel.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,window:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth}});
    assert.ok(box.top<box.window-50&&box.bottom>50,"intro visible in first viewport "+JSON.stringify(box));
    assert.ok(box.overflow<=7,"page no horizontal overflow "+JSON.stringify(box));
    assert.equal(await video.getAttribute("autoplay"),"");
    assert.equal(await video.getAttribute("playsinline"),"");
    assert.equal(await video.hasAttribute("muted"),false,"not forced silent by markup");
    assert.equal(await video.evaluate(el=>el.muted),false,"not auto-muted by script");
    assert.equal(await video.getAttribute("src"),null,"no broken video source before owner supplies MP4");
    assert.equal(await panel.getAttribute("data-intro-state"),"placeholder");
    assert.equal(await p.locator("#phase3-intro-play").isVisible(),false,"no deceptive play button without MP4");
    assert.equal(await p.locator('meta[name="twitter:card"]').getAttribute("content"),"summary");
    assert.equal(errors.length,0,"JS errors "+errors.join(" | "));
    if((name==="desktop"||name==="android")&&theme==="light")await p.screenshot({path:"qa-screens/phase3-"+name+"-overview.png"});
    console.log("PHASE3 RESPONSIVE INTRO PASS "+name+" "+theme+" "+JSON.stringify(box));
   }catch(e){console.error("PHASE3 RESPONSIVE INTRO FAIL "+name+" "+theme,e.stack||e);await p.screenshot({path:"qa-screens/phase3-fail-"+name+"-"+theme+".png"}).catch(()=>{});throw e}
   finally{await ctx.close()}
  }
  // In a separate virtual browser, pretend the owner-supplied MP4 exists
  // and emulate the actual audible-autoplay browser policy transition.
  for(const [name,w,h,mobile] of [["desktop",1440,900,false],["android",390,844,true]]){
   const ctx=await browser.newContext({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile,reducedMotion:"reduce"});
   await ctx.addInitScript(()=>{
    window.__attempts=[];
    const fetchOriginal=window.fetch.bind(window);
    window.fetch=(resource,opts)=>String(resource).includes("introduction-mark-jay-60s.mp4")&&opts?.method==="HEAD"
     ?Promise.resolve(new Response(null,{status:200,headers:{"content-type":"video/mp4"}})):fetchOriginal(resource,opts);
    Object.defineProperty(HTMLMediaElement.prototype,"src",{configurable:true,get(){return this.__mockSrc||""},set(v){this.__mockSrc=v}});
    HTMLMediaElement.prototype.play=function(){window.__attempts.push({muted:this.muted,volume:this.volume,autoplay:this.autoplay});return window.__attempts.length===1?Promise.reject(new DOMException("User gesture required","NotAllowedError")):Promise.resolve()};
    HTMLMediaElement.prototype.pause=function(){};
   });
   const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
   try{
    await p.goto(site+"#top",{waitUntil:"load",timeout:35000});
    await p.waitForFunction(()=>document.querySelector("#personal-introduction")?.dataset.introState==="blocked",{timeout:10000});
    assert.ok(await p.locator("#phase3-intro-play").isVisible(),"sound button offered on rejection");
    await p.locator("#phase3-intro-play").click();
    await p.waitForFunction(()=>document.querySelector("#personal-introduction")?.dataset.introState==="playing",{timeout:5000});
    const a=await p.evaluate(()=>window.__attempts);
    assert.equal(a.length,2,"one audible autoplay attempt + one click");
    assert.ok(a.every(x=>x.muted===false&&x.volume===1&&x.autoplay===true),"never substitute silent autoplay");
    assert.equal(errors.length,0,"JS errors "+errors.join(" | "));
    console.log("PHASE3 SOUND-ON PATH PASS "+name+" "+JSON.stringify(a));
   }catch(e){console.error("PHASE3 SOUND-ON PATH FAIL "+name,e.stack||e);throw e}
   finally{await ctx.close()}
  }
  console.log("PHASE3 ALL EIGHT RESPONSES + TWO SOUND MOCKS + NINE LEGACY REDIRECTS PASS");
 }catch(e){process.exitCode=1}finally{await browser.close()}
})();
