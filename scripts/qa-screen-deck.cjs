/* Real viewport/snap regression suite for the Gold Ops-style portfolio deck.
   Covers 1440 desktop, 900 compact desktop, and 390/320 Android-size phones. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs/promises');
const base=pathToFileURL(path.join(process.cwd(),'index.html')).href;
const sizeCases=[
 {width:1440,height:900,label:'desktop',mobile:false},
 {width:900,height:740,label:'compact-desktop',mobile:false},
 {width:390,height:844,label:'android',mobile:true},
 {width:320,height:568,label:'small-android',mobile:true}
];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function check(browser,device){
 const context=await browser.newContext({
   viewport:{width:device.width,height:device.height},
   deviceScaleFactor:device.mobile?2.5:1,
   isMobile:device.mobile,hasTouch:device.mobile,
   reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error') errors.push('console: '+message.text().slice(0,160))});
 try{
  await page.goto(base+'#top',{waitUntil:'load',timeout:35000});
  await page.waitForFunction(()=>document.documentElement.classList.contains('screen-deck'),{timeout:7000});
  await page.waitForTimeout(250);
  const initial=await page.evaluate(()=>{
   const main=document.getElementById('main');
   const visible=[...main.querySelectorAll(':scope > section[data-app-view]')].filter(e=>!e.hidden);
   return{
     viewport:innerHeight,root:document.documentElement.className,
     mainHeight:main.clientHeight,snap:getComputedStyle(main).scrollSnapType,
     innerScroller:getComputedStyle(visible[0].querySelector(':scope>.mx-auto')).overflowY,
     sections:visible.map(s=>({id:s.id,h:s.getBoundingClientRect().height,contents:s.textContent.trim().length})),
     firstHash:location.hash,footer:getComputedStyle(document.querySelector('.site-footer')).display,
     windowY:scrollY
   };
  });
  assert.ok(Math.abs(initial.viewport-initial.mainHeight)<=4,device.label+' main must equal viewport');
  assert.ok(initial.snap.includes('mandatory'),device.label+' snap must be mandatory');
  assert.equal(initial.footer,'none',device.label+' no extra footer page');
  assert.deepEqual(initial.sections.map(s=>s.id),['top','challenge'],device.label+' home chapters');
  assert.ok(initial.sections.every(s=>Math.abs(s.h-device.height)<5&&s.contents>100),device.label+' content and exact viewport height');
  assert.equal(initial.innerScroller,'auto',device.label+' long details stay readable');
  const switcher=page.locator('.screen-switcher');
  assert.ok(await switcher.isVisible(),device.label+' snap pager must be visible');
  assert.equal((await switcher.locator('output').textContent()).trim(),'1 / 2');
  await page.locator('[data-screen-next]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='challenge',{timeout:4500});
  await page.waitForTimeout(160);
  assert.equal(await page.evaluate(()=>location.hash),'#challenge',device.label+' snapping deep link');
  assert.equal((await switcher.locator('output').textContent()).trim(),'2 / 2');
  const offset=await page.evaluate(()=>{
    const main=document.getElementById('main');
    return Math.round(document.getElementById('challenge').getBoundingClientRect().top-main.getBoundingClientRect().top)
  });
  assert.ok(Math.abs(offset)<6,device.label+' chapter aligns exactly with viewport');
  const clickNav=async(tab,rail)=>{
    if(device.mobile) await page.locator('.mobile-tabs a[data-app-tab="'+tab+'"]').click();
    else await page.locator('.portfolio-rail__nav a[href="#'+rail+'"]').click();
  };
  await clickNav('work','showcase');
  await page.waitForFunction(()=>document.documentElement.dataset.appView==='work'&&document.documentElement.dataset.appSection==='showcase',{timeout:5000});
  assert.equal(await page.locator('#orbit-stage').isVisible(),true,device.label+' HD carousel on first Work screen');
  await page.locator('[data-screen-next]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='projects',{timeout:4500});
  assert.equal((await page.locator('.screen-switcher output').textContent()).trim(),'2 / 2');
  await clickNav('skills','skills');
  await page.waitForFunction(()=>document.documentElement.dataset.appView==='skills'&&document.documentElement.dataset.appSection==='skills',{timeout:5000});
  await page.locator('[data-screen-next]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='approach',{timeout:4500});
  assert.equal(await page.locator('#approach .screen-deck-expander').count(),2,device.label+' dense supporting method content must be disclosed, not removed');
  await page.locator('#approach .screen-deck-expander summary').first().click();
  assert.ok(await page.locator('#approach .screen-deck-expander').first().evaluate(e=>e.open),device.label+' disclosure accessible');
  await clickNav('about','about');
  await page.waitForFunction(()=>document.documentElement.dataset.appView==='about'&&document.documentElement.dataset.appSection==='about',{timeout:5000});
  const aboutCount=(await switcher.locator('output').textContent()).trim();
  assert.equal(aboutCount,'1 / 3',device.label+' About holds three snap chapters');
  await page.locator('[data-screen-next]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='results',{timeout:4500});
  await page.locator('[data-screen-next]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='experience',{timeout:4500});
  await clickNav('contact','contact');
  await page.waitForFunction(()=>document.documentElement.dataset.appView==='contact'&&document.documentElement.dataset.appSection==='contact',{timeout:5000});
  assert.ok(!await switcher.isVisible(),device.label+' no pager on single-screen Contact');
  assert.ok(await page.locator('#contact-form').isVisible(),device.label+' contact form remains present');
  const final=await page.evaluate(()=>{
    const root=document.documentElement,main=document.getElementById('main');
    const section=document.getElementById('contact');
    const panel=section.querySelector(':scope>.mx-auto');
    return{
      appView:root.dataset.appView,
      snap:getComputedStyle(main).scrollSnapType,
      rootScrollY:window.scrollY,
      sectionHeight:Math.round(section.getBoundingClientRect().height),
      panelScrollHeight:panel.scrollHeight,
      panelClientHeight:panel.clientHeight,
      panelOverflow:getComputedStyle(panel).overflowY,
      theme:document.getElementById('theme-toggle-mobile')!==null
    };
  });
  assert.ok(Math.abs(final.rootScrollY)<=2,device.label+' browser page must never scroll');
  assert.equal(final.sectionHeight,device.height,device.label+' Contact one screen');
  assert.ok(final.panelScrollHeight>=final.panelClientHeight,device.label+' content height is measurable');
  assert.equal(final.panelOverflow,'auto',device.label+' long form can scroll within its screen');
  assert.ok(final.theme,'floating mobile theme retained');
  assert.equal(errors.length,0,device.label+' no JS runtime errors: '+errors.join(' | '));
  console.log(device.label.toUpperCase()+' PASS '+JSON.stringify({initial:initial.sections.map(x=>x.id),snap:initial.snap,about:aboutCount,contact:final}));
  if(process.env.QA_SCREENSHOTS==='1'){
    await fs.mkdir('qa-screens',{recursive:true});
    await page.screenshot({path:'qa-screens/'+device.label+'-contact.png'});
  }
 }catch(e){
   console.error(device.label+' FAIL '+(e.stack||e));
   await fs.mkdir('qa-screens',{recursive:true});
   try{await page.screenshot({path:'qa-screens/'+device.label+'-failed.png'})}catch(_){}
   throw e;
 }finally{await context.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
   for(const device of sizeCases)await check(browser,device);
   console.log('SCREEN DECK QA PASSED on '+sizeCases.map(x=>x.label).join(', '));
 }catch(e){process.exitCode=1}
 finally{await browser.close()}
})();