/* v12: the theme orb is part of the fixed Contact dock, NOT a sixth tab
   or a separate strip. Test actual tap geometry on narrow and short phones. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const fs=require("node:fs/promises");
const url=pathToFileURL(path.join(process.cwd(),"index.html")).href;
const viewports=[
 {width:320,height:568,label:"small Android"},
 {width:360,height:640,label:"short Android"},
 {width:390,height:844,label:"Android"},
 {width:430,height:932,label:"large Android"},
 {width:760,height:760,label:"mobile breakpoint"}
];
const approx=(a,b,tol=5)=>Math.abs(a-b)<=tol;
async function run(browser,device){
 const context=await browser.newContext({
  viewport:{width:device.width,height:device.height},deviceScaleFactor:2.5,
  isMobile:true,hasTouch:true,reducedMotion:"reduce"
 });
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto(url+"#top",{waitUntil:"load",timeout:40000});
  await page.waitForFunction(()=>document.documentElement.classList.contains("mobile-app"),{timeout:7000});
  const state=await page.evaluate(()=>{
   const nav=document.querySelector(".mobile-tabs");
   const contact=nav.querySelector(".mobile-tabs__contact");
   const orb=nav.querySelector(".mobile-theme-float");
   const button=document.getElementById("theme-toggle-mobile");
   const main=document.getElementById("main");
   const home=main.querySelector(".mobile-app__page:not([hidden])");
   const box=e=>{const r=e.getBoundingClientRect();return{
     left:r.left,top:r.top,right:r.right,bottom:r.bottom,
     width:r.width,height:r.height,cx:(r.left+r.right)/2
   }};
   return {
    nav:box(nav),contact:box(contact),orb:box(orb),button:box(button),
    main:box(main),home:box(home),
    navPosition:getComputedStyle(nav).position,
    orbPosition:getComputedStyle(orb).position,
    parentOK:orb.parentElement===nav,
    buttonParent:button.parentElement===orb,
    gridColumns:getComputedStyle(nav).gridTemplateColumns.trim().split(/\\s+/).length,
    pageBottom:getComputedStyle(document.documentElement).getPropertyValue("--mobile-app-page-bottom").trim(),
    rootOverflow:document.documentElement.scrollHeight-innerHeight,
    bodyOverflow:document.body.scrollHeight-innerHeight,
    docScroll:scrollY,
    hiddenThemes:document.querySelectorAll("#theme-toggle-mobile").length
   };
  });
  assert.ok(state.parentOK&&state.buttonParent,device.label+" orbit and button must be INSIDE the fixed navigation");
  assert.equal(state.navPosition,"fixed",device.label+" dock fixed overlay");
  assert.equal(state.orbPosition,"absolute",device.label+" theme cannot occupy a grid cell/page row");
  assert.equal(state.gridColumns,5,device.label+" exactly five tab columns");
  assert.ok(approx(state.orb.cx,state.contact.cx,3),device.label+" orbit must center exactly over Contact: "+JSON.stringify(state));
  assert.ok(state.orb.bottom>=state.contact.top-4&&state.orb.bottom<=state.contact.top+9,
    device.label+" orbit must touch Contact with no separate gap: "+JSON.stringify(state));
  assert.ok(state.main.bottom>=state.nav.top-10&&state.main.bottom<=state.nav.top+3,
    device.label+" no extra 40-70px reserved strip: "+JSON.stringify(state));
  assert.ok(state.orb.top<state.main.bottom-20,
    device.label+" theme control overlays the page, not a separately reserved space");
  assert.ok(state.orb.top>=0,device.label+" theme stays on-screen even on short phone");
  assert.equal(state.hiddenThemes,1,"single theme control");
  assert.equal(await page.locator(".mobile-tabs>a[data-app-tab]").count(),5,"five untouched navigation links");
  const before=await page.evaluate(()=>document.documentElement.dataset.theme);
  await page.locator("#theme-toggle-mobile").tap();
  const after=await page.evaluate(()=>document.documentElement.dataset.theme);
  assert.notEqual(before,after,device.label+" tapping appearance control changes theme");
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.appView),"home",device.label+" appearance must not trigger Contact");
  await page.locator(".mobile-tabs>a[data-app-tab=contact]").tap();
  await page.waitForFunction(()=>document.documentElement.dataset.appView==="contact",{timeout:4000});
  await page.locator("#theme-toggle-mobile").tap();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.appView),"contact",device.label+" appearance must not navigate away from Contact");
  const contactPage=page.locator(".mobile-app__page[data-mobile-view=contact]");
  const bottomSpacing=await contactPage.evaluate(el=>parseFloat(getComputedStyle(el).paddingBottom));
  assert.ok(bottomSpacing>=60,device.label+" page has internal clearance to scroll its last CTA above the dock");
  await page.locator("#copy-message").scrollIntoViewIfNeeded();
  assert.ok(await page.locator("#copy-message").isVisible(),device.label+" last Contact CTA can be reached");
  assert.equal(errors.length,0,device.label+" no uncaught page errors: "+errors.join(" | "));
  console.log("MOBILE DOCK OVERLAY PASS "+JSON.stringify({device:device.label,navTop:Math.round(state.nav.top),
    orbTop:Math.round(state.orb.top),contactTop:Math.round(state.contact.top),
    orbitToContact:Math.round(state.contact.top-state.orb.bottom),
    mainToDock:Math.round(state.nav.top-state.main.bottom),
    gridColumns:state.gridColumns,bottomSpacing,themeBefore:before,themeAfter:after}));
 }catch(err){
  console.error("MOBILE DOCK OVERLAY FAIL "+device.label+": "+(err.stack||err));
  await fs.mkdir("qa-screens",{recursive:true});
  try{await page.screenshot({path:"qa-screens/theme-overlay-"+device.width+"-failure.png",fullPage:false})}catch(_){}
  throw err;
 }finally{await context.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{for(const device of viewports)await run(browser,device);
   console.log("ALL FIVE MOBILE THEME OVERLAY CHECKS PASSED");
 }catch(_){process.exitCode=1}
 finally{await browser.close()}
})();
