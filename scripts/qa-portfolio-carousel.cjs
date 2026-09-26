/* Real Chromium regression test for public portfolio HD carousel. */
const { chromium }=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const source=pathToFileURL(path.join(process.cwd(),'index.html')).href+'#showcase';

(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const desktop=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  let mobile;
  try{
    const errors=[];
    desktop.on('pageerror',e=>errors.push(e.message));
    await desktop.goto(source,{waitUntil:'load',timeout:30000});
    await desktop.waitForFunction(()=>document.documentElement.dataset.appView==='work',{timeout:10000});
    await desktop.locator('#orbit-stage').scrollIntoViewIfNeeded();
    await desktop.evaluate(async()=>{
      const images=[...document.querySelectorAll('.orbit-card__visual img')];
      images.forEach(img=>img.loading='eager');
      await Promise.all(images.map(img=>img.decode()));
    });
    const widths=await desktop.locator('.orbit-card__visual img').evaluateAll(els=>els.map(e=>({project:e.alt,width:e.naturalWidth,height:e.naturalHeight})));
    assert.equal(widths.length,3,'all 3 carousel previews present');
    assert.ok(widths.every(x=>x.width>=2000&&x.height>=1100),'each image is genuinely HD');
    assert.ok(await desktop.locator('.portfolio-rail').isVisible(),'desktop persistent sidebar visible');
    const linkedIn=desktop.locator('.portfolio-rail__socials a[href*="linkedin"]');
    assert.ok((await linkedIn.textContent()).includes('LinkedIn'),'full LinkedIn label, not in abbreviation');
    assert.ok(await linkedIn.isVisible(),'full LinkedIn sidebar link is visible');
    const linkBox=await linkedIn.boundingBox();
    const railBox=await desktop.locator('.portfolio-rail').boundingBox();
    assert.ok(linkBox&&railBox&&linkBox.x>=railBox.x&&linkBox.x+linkBox.width<=railBox.x+railBox.width+1,'LinkedIn link fits sidebar');
    const colors=await desktop.evaluate(()=>{
      document.documentElement.dataset.theme='light';
      const computed=selector=>{
        const s=getComputedStyle(document.querySelector(selector));
        return {text:s.color,bg:s.backgroundColor};
      };
      return{
        sidebar:computed('.portfolio-rail__resume'),
        hero:computed('#top a.button-quiet'),
        contact:computed('.resume-icon-link')
      };
    });
    const lum=value=>{
      const rgb=(value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
      assert.equal(rgb.length,3,'valid computed RGB color: '+value);
      const lin=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return lin[0]*.2126+lin[1]*.7152+lin[2]*.0722;
    };
    for(const [name,c] of Object.entries(colors)){
      const a=lum(c.text),b=lum(c.bg);
      const contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      assert.ok(contrast>=4.5,name+' light resume contrast must reach WCAG AA, got '+contrast.toFixed(2));
    }
    await desktop.evaluate(()=>{document.documentElement.dataset.theme='dark'});
    console.log('LINKEDIN AND LIGHT RÉSUMÉ CONTRAST PASS',JSON.stringify(colors));

    await desktop.locator('#orbit-pause').click();
    await desktop.locator('.orbit-card.is-front [data-zoom-preview]').click();
    assert.ok(await desktop.locator('#orbit-preview-dialog').evaluate(el=>el.open),'HD preview dialog opens');
    await desktop.locator('#orbit-zoom-in').click();
    const zoomed=await desktop.locator('#orbit-preview-image').evaluate(el=>parseInt(el.style.width,10));
    assert.ok(zoomed>100,'zoom works');
    await desktop.locator('#orbit-preview-close').click();
    await desktop.locator('#orbit-next').click();
    assert.equal(await desktop.locator('.orbit-card.is-front').getAttribute('data-title'),'Aspirva','next selects Aspirva');
    await desktop.locator('.orbit-card.is-front [data-zoom-preview]').click();
    assert.ok((await desktop.locator('#orbit-preview-title').textContent()).includes('Aspirva'),'Aspirva preview title');
    await desktop.locator('#orbit-preview-close').click();
    await desktop.locator('#orbit-next').click();
    assert.equal(await desktop.locator('.orbit-card.is-front').getAttribute('data-title'),'PuddleLoom Studio','third card selects PuddleLoom');
    assert.equal(errors.length,0,'no uncaught desktop JS errors: '+errors.join(' | '));
    console.log('Desktop PASS; native image dimensions:',JSON.stringify(widths));

    const mobileCtx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
    mobile=await mobileCtx.newPage();
    const mobileErrors=[];
    mobile.on('pageerror',e=>mobileErrors.push(e.message));
    await mobile.goto(source,{waitUntil:'load',timeout:30000});
    await mobile.waitForFunction(()=>document.documentElement.dataset.appView==='work',{timeout:10000});
    assert.ok(await mobile.locator('.mobile-tabs').isVisible(),'mobile bottom navigation visible');
    assert.ok(await mobile.locator('.mobile-theme-float__button').isVisible(),'mobile floating theme visible');
    await mobile.locator('.orbit-card.is-front [data-zoom-preview]').tap();
    assert.ok(await mobile.locator('#orbit-preview-dialog').evaluate(el=>el.open),'mobile tap opens HD viewer');
    await mobile.locator('#orbit-zoom-in').tap();
    assert.ok(parseInt(await mobile.locator('#orbit-preview-image').evaluate(el=>el.style.width),10)>100,'mobile image zoom works');
    await mobile.locator('#orbit-preview-close').tap();
    await mobile.locator('.mobile-tabs a[data-app-tab="skills"]').tap();
    assert.equal(await mobile.evaluate(()=>document.documentElement.dataset.appView),'skills','mobile skills tab switches app view');
    assert.equal(mobileErrors.length,0,'no uncaught mobile JS errors: '+mobileErrors.join(' | '));
    console.log('Mobile PASS; dock, transparent carousel, HD zoom, tab navigation.');
    console.log('QA PASSED');
  }catch(err){
    console.error('QA FAILED:',err.stack||err);
    await fs.mkdir('qa-screens',{recursive:true});
    try{await desktop.screenshot({path:'qa-screens/desktop.png',fullPage:true})}catch(_){}
    try{if(mobile)await mobile.screenshot({path:'qa-screens/mobile.png',fullPage:true})}catch(_){}
    process.exitCode=1;
  }finally{await browser.close();}
})();