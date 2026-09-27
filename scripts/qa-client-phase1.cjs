/* Verify truthful three-service scope, native provider POST, short project
   brief and accurate call-request wording without sending real emails. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const path=require("node:path");
const fs=require("node:fs/promises");
const {pathToFileURL}=require("node:url");
const url=pathToFileURL(path.resolve("index.html")).href;
const screens=[{name:"desktop-1440",w:1440,h:900,mobile:false},{name:"compact-900",w:900,h:740,mobile:false},{name:"android-390",w:390,h:844,mobile:true},{name:"small-320",w:320,h:568,mobile:true}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir("qa-screens",{recursive:true});
 try{
  for(const s of screens){
   for(const theme of ["light","dark"]){
    const ctx=await browser.newContext({viewport:{width:s.w,height:s.h},isMobile:s.mobile,hasTouch:s.mobile,deviceScaleFactor:s.mobile?2:1,reducedMotion:"reduce"});
    await ctx.addInitScript(v=>localStorage.setItem("mj-theme",v),theme);
    const p=await ctx.newPage(),errors=[];p.on("pageerror",e=>errors.push(e.message));
    try{
     await p.goto(url+"#top",{waitUntil:"load"});
     await p.waitForFunction(()=>document.documentElement.classList.contains("continuous-deck"));
     assert.equal(await p.locator("#services .client-service-card").count(),3,"exactly three services");
     if(s.mobile)await p.waitForFunction(()=>document.documentElement.classList.contains("mobile-app")&&!document.querySelector('.mobile-app__page[data-mobile-view="home"]')?.hidden);
     const content=await p.locator("#services").textContent();
     for(const evidence of ["Excel","VBA","Power Query","five hours","human","acceptance criteria","functional","regression"]){
      assert.ok(content.toLowerCase().includes(evidence.toLowerCase()),"Résumé-based copy missing "+evidence);
     }
     assert.ok(!content.includes("Growth OS"),"Growth OS intentionally omitted");
     assert.ok(!/guaranteed revenue|100 clients|certified third-party|delivered to hundreds/i.test(content),"no fabricated client proof");
     await p.locator('#top a[data-inquiry-intent="project"]').waitFor({state:"visible",timeout:7000});
     assert.ok(await p.locator('#top a[data-inquiry-intent="project"]').isVisible(),"primary hero inquiry visible");
     if(s.mobile){
      await p.locator('#top a[href="#services"]').click();
      assert.equal(await p.evaluate(()=>location.hash),"#services","mobile Services deep link");
      assert.equal(await p.locator('.mobile-app__page:not([hidden])').getAttribute("data-mobile-view"),"home","Service stays in mobile Home");
     }else{
      await p.locator('.portfolio-rail__nav a[href="#services"]').click();
      await p.waitForFunction(()=>document.documentElement.dataset.appSection==="services");
     }
     await p.locator('#services .client-service-card__link').first().click();
     if(s.mobile){
      assert.equal(await p.locator('.mobile-app__page:not([hidden])').getAttribute("data-mobile-view"),"contact");
      const d=p.locator('#contact .fit-contact-more');if(!(await d.evaluate(el=>el.open)))await d.locator("summary").click();
     }
     const form=p.locator("#contact-form");
     assert.equal(await p.locator("#contact-service").inputValue(),"Excel & process automation","service link prefills brief");
     assert.equal(await form.getAttribute("method"),"POST","native POST, not mailto");
     assert.equal(await form.getAttribute("action"),"https://formsubmit.co/markjay.lisay@gmail.com","real endpoint");
     assert.equal(await form.locator('[name="_captcha"]').inputValue(),"true","provider reCAPTCHA ON");
     assert.equal(await form.locator('[name="_honey"]').count(),1,"server-recognized honeypot");
     assert.equal(await p.locator('a[href*="calendar.google.com/calendar/appointments"]').count(),0,"no invented booking URL");
     assert.ok((await p.locator("#contact").innerText()).includes("not a confirmed appointment"),"realistic call wording");
     let posted=null;
     await p.route("https://formsubmit.co/**",async route=>{
      const req=route.request();posted={method:req.method(),data:req.postData()||""};
      await route.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>QA MOCK FORM ACCEPTED</title>"});
     });
     await p.locator("#contact-name").fill("Test Visitor");
     await p.locator("#contact-email").fill("test@example.org");
     await p.locator("#contact-message").fill("Please review a sample spreadsheet workflow and help improve matching rules.");
     await form.locator('button[type="submit"]').click();
     await p.waitForFunction(()=>document.title==="QA MOCK FORM ACCEPTED",{timeout:10000});
     assert.equal(posted?.method,"POST","native POST reaches mocked real-form endpoint");
     for(const field of ["name=Test+Visitor","email=test%40example.org","project_type=Excel+%26+process+automation","_captcha=true","_honey="])assert.ok(posted.data.includes(field),"missing submitted field "+field);
     assert.equal(errors.length,0,"no page errors "+errors.join(" | "));
     console.log("CLIENT PHASE1 PASS "+s.name+" "+theme+" POST mock passed");
    }catch(e){console.error("CLIENT PHASE1 FAIL "+s.name+" "+theme,e.stack||e);await p.screenshot({path:"qa-screens/phase1-fail-"+s.name+"-"+theme+".png"}).catch(()=>{});throw e}
    finally{await ctx.close()}
   }
  }
  console.log("CLIENT PHASE1 ALL EIGHT SCREENS/THEMES PASSED; real backend activation is a separate user action");
 }catch(e){process.exitCode=1}finally{await browser.close()}
})();