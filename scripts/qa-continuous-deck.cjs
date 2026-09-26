/* Continuous v6 integration: natural wheel flow, hero minimums, About portrait,
   unhidden content, dock/sidebar deep links, readable overflow. */
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs/promises');
const url=pathToFileURL(path.join(process.cwd(),'index.html')).href;
const devices=[
 {name:'desktop',width:1440,height:900,mobile:false},
 {name:'compact-desktop',width:900,height:740,mobile:false},
 {name:'android',width:390,height:844,mobile:true},
 {name:'small-android',width:320,height:568,mobile:true}
];
const order=['top','challenge','showcase','projects','skills','approach','about','results','experience','contact'];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function inspect(browser,device){
 const ctx=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:device.mobile?2:1,isMobile:device.mobile,hasTouch:device.mobile,reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url+'#top',{waitUntil:'load',timeout:35000});
  await page.waitForFunction(()=>document.documentElement.classList.contains('continuous-deck'),{timeout:7500});
  await page.waitForTimeout(250);
  const layout=await page.evaluate(()=>{
    const root=document.documentElement,main=document.getElementById('main');
    const sections=[...main.querySelectorAll(':scope>section[data-app-view]')];
    return{
      ids:sections.map(s=>s.id),
      hidden:sections.filter(s=>s.hidden||s.getAttribute('aria-hidden')==='true').map(s=>s.id),
      heights:sections.map(s=>({id:s.id,height:s.getBoundingClientRect().height,panelHeight:s.querySelector(':scope>.mx-auto')?.clientHeight,panelScroll:s.querySelector(':scope>.mx-auto')?.scrollHeight})),
      rootSnap:getComputedStyle(root).scrollSnapType,
      rootHeight:root.scrollHeight,docScroll:root.scrollHeight>innerHeight*5,
      mainOverflow:getComputedStyle(main).overflowY,
      windowY:scrollY
    };
  });
  console.log('CONTINUOUS LAYOUT',device.name,JSON.stringify({rootSnap:layout.rootSnap,rootHeight:layout.rootHeight,mainOverflow:layout.mainOverflow,docScroll:layout.docScroll,windowY:layout.windowY,sectionHeights:layout.heights.map(x=>({id:x.id,h:x.height,panel:x.panelHeight,content:x.panelScroll}))}));
  assert.deepEqual(layout.ids,order,device.name+' all ten sections in logical reading order');
  assert.deepEqual(layout.hidden,[],device.name+' no view hidden or aria-hidden');
  assert.ok(layout.rootSnap.includes('proximity'),device.name+' native proximity scroll snapping');
  assert.ok(layout.docScroll,device.name+' document scrolls through every page');
  assert.notEqual(layout.mainOverflow,'auto',device.name+' avoid second page scrollbar');
  assert.ok(layout.heights.every(s=>s.height>=device.height-3),device.name+' each chapter preserves full-screen hero minimum');
  assert.ok(layout.heights.every(s=>s.panelScroll<=s.panelHeight+5),device.name+' chapter panels never clip overflowing content');
  const switcher=page.locator('.screen-switcher');
  assert.ok(await switcher.isVisible(),device.name+' fixed previous/next affordance');
  assert.equal((await switcher.locator('output').textContent()).trim(),'1 / 10');
  await page.mouse.move(Math.min(550,device.width*.52),Math.min(340,device.height*.5));
  await page.mouse.wheel(0,device.height*.9);
  await page.waitForTimeout(350);
  let afterWheel=await page.evaluate(()=>scrollY);
  assert.ok(afterWheel>30,device.name+' mouse wheel scrolls the document, got '+afterWheel);
  const toAbout=device.mobile?'.mobile-tabs a[data-app-tab="about"]':'.portfolio-rail__nav a[href="#about"]';
  await page.locator(toAbout).click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='about',{timeout:5000});
  await page.waitForTimeout(170);
  assert.equal(await page.evaluate(()=>location.hash),'#about',device.name+' About deep link');
  const img=page.locator('#about .about-portrait img');
  assert.ok(await img.isVisible(),device.name+' About portrait is displayed');
  const photo=await img.evaluate(el=>({src:el.currentSrc||el.src,width:Math.round(el.getBoundingClientRect().width),naturalWidth:el.naturalWidth}));
  assert.ok(photo.src.includes('avatars.githubusercontent.com/u/305338593'),device.name+' reuse existing profile photograph');
  assert.ok(photo.width>=(device.mobile?92:165),device.name+' image is visibly sized; got '+photo.width);
  const about=await page.locator('#about').evaluate(el=>({sectionHeight:el.getBoundingClientRect().height,panelHeight:el.querySelector(':scope>.mx-auto').clientHeight,panelScroll:el.querySelector(':scope>.mx-auto').scrollHeight}));
  assert.ok(about.panelScroll<=about.panelHeight+5,device.name+' About text and photo visible without an internal scrollbar');
  assert.equal((await switcher.locator('output').textContent()).trim(),'7 / 10');
  // Every chapter must remain readable even after clicking a tab.
  assert.equal(await page.locator('main>section[data-app-view]:not([hidden])').count(),10);
  const toWork=device.mobile?'.mobile-tabs a[data-app-tab="work"]':'.portfolio-rail__nav a[href="#showcase"]';
  await page.locator(toWork).click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='showcase',{timeout:5000});
  assert.ok(await page.locator('#orbit-stage').isVisible(),device.name+' HD carousel preserved');
  const toContact=device.mobile?'.mobile-tabs a[data-app-tab="contact"]':'.portfolio-rail__nav a[href="#contact"]';
  await page.locator(toContact).click();
  await page.waitForFunction(()=>document.documentElement.dataset.appSection==='contact',{timeout:5000});
  assert.ok(await page.locator('#contact-form').isVisible(),device.name+' contact form available');
  assert.equal((await switcher.locator('output').textContent()).trim(),'10 / 10');
  const contactScroll=await page.evaluate(()=>scrollY);
  assert.ok(contactScroll>device.height*5,device.name+' contact is reached by scrolling down through the document');
  assert.equal(errors.length,0,device.name+' no JS errors: '+errors.join(' | '));
  console.log(device.name.toUpperCase()+' CONTINUOUS PASS '+JSON.stringify({sections:layout.ids.length,afterWheel,aboutPhoto:photo.width,aboutHeight:about.sectionHeight,contactScroll,rootSnap:layout.rootSnap}));
  if(process.env.QA_SCREENSHOTS==='1'){
    await fs.mkdir('qa-screens',{recursive:true});
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.screenshot({path:'qa-screens/'+device.name+'-about.png'});
  }
 }catch(e){
  console.error(device.name+' CONTINUOUS FAIL '+(e.stack||e));
  await fs.mkdir('qa-screens',{recursive:true});
  try{await page.screenshot({path:'qa-screens/'+device.name+'-continuous-failure.png'})}catch(_){}
  throw e;
 }finally{await ctx.close()}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{for(const device of devices)await inspect(browser,device);console.log('CONTINUOUS SCROLL QA PASSED')}
 catch(_){process.exitCode=1}
 finally{await browser.close()}
})();