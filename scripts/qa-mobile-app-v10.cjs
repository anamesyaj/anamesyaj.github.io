/* Phone-specific Android-style tab navigation integration, without touching
   the finished desktop continuous-scroll experience. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const fs=require("node:fs/promises");
const site=pathToFileURL(path.join(process.cwd(),"index.html")).href;
const devices=[
  {name:"android-390",width:390,height:844},
  {name:"small-android-320",width:320,height:568},
  {name:"short-android-390",width:390,height:640},
  {name:"tablet-mobile-760",width:760,height:900}
];
const tabs=["home","work","contact","skills","about"];
async function run(browser,device){
 const ctx=await browser.newContext({
  viewport:{width:device.width,height:device.height},
  deviceScaleFactor:device.width<400?3:2,isMobile:true,hasTouch:true,
  reducedMotion:"reduce"
 });
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto(site+"#top",{waitUntil:"load",timeout:30000});
  await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app"),{timeout:9000});
  await page.waitForTimeout(150);
  const state=await page.evaluate(()=>{
    const main=document.getElementById("main");
    const pages=[...main.querySelectorAll(":scope>.mobile-app__page")];
    const nav=document.querySelector(".mobile-tabs");
    return{
      pageNames:pages.map(el=>el.dataset.mobileView),
      visiblePages:pages.filter(el=>!el.hidden).map(el=>el.dataset.mobileView),
      rootOverflow:getComputedStyle(document.documentElement).overflowY,
      mainOverflow:getComputedStyle(main).overflowY,
      mainHeight:main.getBoundingClientRect().height,
      docHeight:document.scrollingElement.scrollHeight,
      dockLinks:nav.querySelectorAll("a[data-app-tab]").length,
      rootY:window.scrollY,
      desktopRail:getComputedStyle(document.querySelector(".portfolio-rail")).display,
      themeIsInsideDock:nav.contains(document.querySelector(".mobile-theme-float"))
    };
  });
  assert.equal(state.dockLinks,5,device.name+": five navigation buttons");
  assert.deepEqual(state.pageNames,tabs,device.name+": five mounted pages");
  assert.deepEqual(state.visiblePages,["home"],device.name+": only Home visible initially");
  assert.equal(state.rootOverflow,"hidden",device.name+": root document must not scroll");
  assert.equal(state.mainOverflow,"hidden",device.name+": main must not scroll between tabs");
  assert.ok(state.mainHeight<device.height-75,device.name+": main leaves room for the bottom dock");
  assert.ok(state.themeIsInsideDock,device.name+": separate orbit stays centered using dock coordinates");
  assert.equal(state.desktopRail,"none",device.name+": desktop sidebar hidden on phone");
  const session=await page.evaluate(()=>{window.__mobileInstance="existing-document";return window.__mobileInstance});
  async function select(view){
    await page.locator('.mobile-tabs a[data-app-tab="'+view+'"]').click();
    await page.waitForFunction(v=>{
      const root=document.documentElement;
      const visible=[...document.querySelectorAll(".mobile-app__page")].filter(p=>!p.hidden);
      return root.dataset.appView===v&&visible.length===1&&visible[0].dataset.mobileView===v;
    },view,{timeout:5000});
    assert.equal(await page.evaluate(()=>window.__mobileInstance),session,device.name+": tab switch must not reload document");
    assert.equal(await page.evaluate(()=>window.scrollY),0,device.name+": tab switch cannot move document scrollbar");
    assert.equal(await page.locator('.mobile-tabs a[aria-current="page"]').count(),1,device.name+": one active tab");
    assert.equal(await page.locator('.mobile-tabs a[aria-current="page"]').getAttribute("data-app-tab"),view);
    const pages=await page.locator(".mobile-app__page").evaluateAll(elements=>elements.map(el=>({
      page:el.dataset.mobileView,hidden:el.hidden,inert:el.inert,ariaHidden:el.getAttribute("aria-hidden")
    })));
    assert.ok(pages.every(p=>p.page===view?!p.hidden&&!p.inert&&p.ariaHidden==="false":p.hidden&&p.inert&&p.ariaHidden==="true"),device.name+": every inactive page is hidden and inert");
  }
  await select("work");
  assert.ok(await page.locator("#orbit-stage").isVisible(),device.name+": HD showcase in Work tab");
  assert.ok(await page.locator("#orbit-next").isVisible(),device.name+": carousel arrow visible");
  await page.locator("#orbit-next").click();
  assert.equal(await page.locator(".orbit-card.is-front").getAttribute("data-title"),"Aspirva",device.name+": carousel still works");
  await select("about");
  assert.ok(await page.locator("#about .about-portrait img").isVisible(),device.name+": About photo intact");
  const extra=await page.locator(".mobile-app__page[data-mobile-view='about'] .mobile-app__more").evaluateAll(els=>els.map(e=>e.dataset.subsection));
  assert.deepEqual(extra,["results","experience"],device.name+": About supporting content retained as disclosures");
  // History must go back to Work, not navigate away or reload the site.
  await page.goBack({waitUntil:"domcontentloaded",timeout:7000});
  await page.waitForFunction(()=>document.documentElement.dataset.appView==="work",{timeout:5000});
  assert.equal(await page.evaluate(()=>window.__mobileInstance),session,device.name+": browser Back preserves app instance");
  await select("skills");
  const skillsPage=page.locator('.mobile-app__page[data-mobile-view="skills"]');
  assert.equal(await page.locator("#skills .skill-card").count(),6,device.name+": full six-card skills inventory");
  await skillsPage.evaluate(el=>{el.scrollTop=el.scrollHeight});
  await page.waitForTimeout(75);
  const insideScroll=await skillsPage.evaluate(el=>({scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
  assert.ok(insideScroll.scrollHeight>insideScroll.clientHeight+50,device.name+": long skills are accessible within the tab");
  assert.ok(insideScroll.scrollTop>30,device.name+": skills page can scroll its own contents");
  assert.equal(await page.evaluate(()=>window.scrollY),0,device.name+": internally scrolling Skills must not scroll to About");
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.appView),"skills",device.name+": inner scroll must not change pages");
  await select("home");
  // The Home shortcut to documented Results must open About and expand
  // Results rather than scroll the visitor down a hidden desktop document.
  const homeExtras=page.locator('#top .fit-home-more');
  if(await homeExtras.count()){
    const resultLink=page.locator('#top a[href="#results"]');
    if(!await resultLink.isVisible()) await homeExtras.locator('summary').click();
  }
  await page.locator('#top a[href="#results"]').click();
  await page.waitForFunction(()=>{
   const d=document.querySelector('.mobile-app__more[data-subsection="results"]');
   return document.documentElement.dataset.appView==="about"&&Boolean(d?.open);
  },{timeout:5000});
  assert.equal(await page.locator('.mobile-app__page:not([hidden])').getAttribute("data-mobile-view"),"about");
  assert.equal(await page.evaluate(()=>window.__mobileInstance),session,device.name+": Home deep link stays in the same document");
  await select("contact");
  const formDisclosure=page.locator("#contact .fit-contact-more>summary");
  assert.ok(await formDisclosure.isVisible(),device.name+": contact form disclosure accessible");
  await formDisclosure.click();
  assert.ok(await page.locator("#contact-form").isVisible(),device.name+": message form can be expanded");
  const geometry=await page.evaluate(()=>{
    const contact=document.querySelector(".mobile-tabs__contact").getBoundingClientRect();
    const arcEl=document.querySelector(".mobile-tabs>.mobile-theme-float");
    const arc=arcEl.getBoundingClientRect();
    const button=document.getElementById("theme-toggle-mobile").getBoundingClientRect();
    const outer=getComputedStyle(arcEl);
    const ring=getComputedStyle(arcEl,"::before");
    return{
      contact:{x:contact.x,y:contact.y,w:contact.width,h:contact.height},
      arc:{x:arc.x,y:arc.y,w:arc.width,h:arc.height},
      button:{w:button.width,h:button.height},
      gap:contact.y-(arc.y+arc.height),
      bottomRadius:outer.borderBottomLeftRadius,
      gradient:ring.backgroundImage,animation:ring.animationName
    };
  });
  const contactCentre=geometry.contact.x+geometry.contact.w/2;
  const arcCentre=geometry.arc.x+geometry.arc.w/2;
  assert.ok(Math.abs(contactCentre-arcCentre)<=3,device.name+": detached theme orbit centered over Contact: "+JSON.stringify(geometry));
  assert.ok(geometry.gap>=10&&geometry.gap<=29,device.name+": orbit and Contact must have a visible gap: "+JSON.stringify(geometry));
  assert.ok(geometry.arc.w>=47&&geometry.arc.w<=52&&geometry.arc.h>=47&&geometry.arc.h<=52,device.name+": 50px full-circle orbit, not an attached semicircle");
  assert.ok(geometry.button.w>=44&&geometry.button.h>=44,device.name+": >=44px accessible theme target");
  assert.notEqual(geometry.bottomRadius,"0px",device.name+": orbit has a curved bottom");
  assert.ok(geometry.gradient.includes("conic-gradient"),device.name+": blue/gold orbital gradient exists");
  assert.ok(geometry.gradient.includes("rgb(40, 158, 234)")&&geometry.gradient.includes("rgb(243, 189, 69)"),device.name+": both blue and yellow arcs exist");
  assert.equal(geometry.animation,"none",device.name+": reduced-motion preference respected");
  assert.equal(await page.locator('.orbit-card[data-title="PuddleLoom Studio"] .orbit-card__action[href="https://puddleloom-studio.loomstudio.workers.dev/"]').count(),1,device.name+": correct public PuddleLoom Studio URL");
  await page.evaluate(()=>{document.documentElement.dataset.theme="dark"});
  const prior=await page.evaluate(()=>document.documentElement.dataset.theme);
  await page.locator("#theme-toggle-mobile").click();
  const next=await page.evaluate(()=>document.documentElement.dataset.theme);
  assert.notEqual(next,prior,device.name+": separate orbit toggles light/dark");
  await page.waitForTimeout(330);
  const contrast=await page.evaluate(()=>{
    const lum=value=>{
      const channel=(value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
      const linear=channel.map(c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)});
      return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
    };
    const ratio=element=>{
      const s=getComputedStyle(element),a=lum(s.color),b=lum(s.backgroundColor);
      return{ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),color:s.color,background:s.backgroundColor};
    };
    const theme=document.getElementById("theme-toggle-mobile");
    return{
      contact:ratio(document.querySelector(".mobile-tabs__contact")),
      theme:ratio(theme),
      instruction:theme.getAttribute("aria-label"),
      moon:getComputedStyle(theme.querySelector(".theme-moon")).display,
      sun:getComputedStyle(theme.querySelector(".theme-sun")).display
    };
  });
  assert.ok(contrast.contact.ratio>=4.5,device.name+": light-mode Contact text must meet 4.5:1: "+JSON.stringify(contrast));
  assert.ok(contrast.theme.ratio>=4.5,device.name+": light-mode theme control must meet 4.5:1: "+JSON.stringify(contrast));
  assert.equal(contrast.instruction,"Switch to dark theme",device.name+": theme accessible name");
  assert.equal(contrast.moon,"block",device.name+": dark moon visible against white button");
  assert.equal(contrast.sun,"none",device.name+": hidden sun in light theme");
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.appView),"contact",device.name+": theme does not navigate");
  await page.locator("#theme-toggle-mobile").click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),prior,device.name+": theme toggles back");
  // Contact tile remains independently tappable below the separate orbit.
  await select("work");
  await select("contact");
  assert.equal(await page.evaluate(()=>window.__mobileInstance),session);
  assert.deepEqual(errors,[],device.name+": no JavaScript errors");
  console.log("MOBILE APP PASS "+JSON.stringify({device:device.name,screen:device.width+"x"+device.height,
    rootY:state.rootY,mainHeight:state.mainHeight,insideScroll,geometry,theme:prior+" -> "+next,history:"pass"}));
  if(process.env.QA_SCREENSHOTS==="1"){
    await fs.mkdir("qa-screens",{recursive:true});
    await select("home");
    await page.screenshot({path:"qa-screens/mobile-"+device.name+"-home.png"});
    await select("contact");
    await page.screenshot({path:"qa-screens/mobile-"+device.name+"-contact.png"});
  }
 }catch(error){
  console.error("MOBILE APP FAILED "+device.name+": "+(error.stack||error));
  await fs.mkdir("qa-screens",{recursive:true});
  try{await page.screenshot({path:"qa-screens/mobile-"+device.name+"-failed.png"})}catch(_){}
  throw error;
 }finally{await ctx.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const device of devices)await run(browser,device);
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:"no-preference"});
  const page=await ctx.newPage();
  try{
    await page.goto(site+"#contact",{waitUntil:"load",timeout:30000});
    await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app"),{timeout:7000});
    const animated=await page.locator(".mobile-tabs>.mobile-theme-float").evaluate(el=>{
      const a=getComputedStyle(el,"::before"),b=getComputedStyle(el,"::after");
      return{forward:a.animationName,reverse:b.animationName,background:a.backgroundImage};
    });
    assert.equal(animated.forward,"portfolio-blue-gold-orbit","blue-and-gold ring must rotate when motion is allowed");
    assert.equal(animated.reverse,"portfolio-blue-gold-counterorbit","inner arc must counterrotate");
    assert.ok(animated.background.includes("conic-gradient"),"animated ring must retain its colored gradient");
    console.log("BLUE/YELLOW ORBIT ROTATION PASS "+JSON.stringify(animated));
  }finally{await ctx.close()}
  console.log("ALL ANDROID-STYLE PHONE TESTS PASSED");
 }
 catch(_){process.exitCode=1}
 finally{await browser.close()}
})();
