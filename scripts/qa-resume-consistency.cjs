/* Public résumé coverage and responsive interaction regression, Oct 2026.
   The Git blob SHA below matches the owner's AR PDF with the graduation date corrected from the diploma and TOR.
   Update the expected SHA intentionally when the public résumé is revised. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const path=require("node:path");
const fs=require("node:fs");
const {createHash}=require("node:crypto");
const {pathToFileURL}=require("node:url");
const pdf=fs.readFileSync(path.resolve("assets/Mark_Jay_Lisay_AR_Resume.pdf"));
const blobSha=createHash("sha1").update(Buffer.from("blob "+pdf.length+"\0")).update(pdf).digest("hex");
assert.equal(blobSha,"b15de708ff0da64d25234611f113979692b64058","downloadable résumé must be the audited two-page public PDF");
const origin=pathToFileURL(path.resolve("index.html")).href;
const screens=[
 {name:"wide desktop",width:1440,height:900,mobile:false},
 {name:"compact desktop",width:900,height:740,mobile:false},
 {name:"desktop-site breakpoint",width:761,height:760,mobile:false},
 {name:"small Android",width:320,height:568,mobile:true},
 {name:"short Android",width:390,height:640,mobile:true},
 {name:"Android",width:390,height:844,mobile:true},
 {name:"large Android",width:430,height:932,mobile:true},
 {name:"mobile breakpoint",width:760,height:900,mobile:true}
];
const ready=()=>document.documentElement.classList.contains("continuous-deck");
const included=(text,terms,label)=>terms.forEach(term=>assert.ok(text.includes(term),label+" missing "+term));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const d of screens){
   const ctx=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:d.mobile?2:1,isMobile:d.mobile,hasTouch:d.mobile,reducedMotion:"reduce"});
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(origin+"#top",{waitUntil:"load",timeout:30000});
    await page.waitForFunction(ready,{timeout:7000});
    const root=page.locator("html");
    assert.equal(await page.locator(".orbit-card").count(),3,d.name+" keep three HD project previews");
    assert.ok(await page.locator('a[href^="assets/Mark_Jay_Lisay_AR_Resume.pdf"]').count()>=1,"public résumé download exists");
    const route=async(view)=>{
      const selector=d.mobile?'.mobile-tabs a[data-app-tab="'+view+'"]':'.portfolio-rail__nav a[href="#'+({work:"showcase",skills:"skills",about:"about",contact:"contact",experience:"experience"})[view]+'"]';
      await page.locator(selector).click();
      await page.waitForFunction(v=>document.documentElement.dataset.appView===(v==="experience"?"about":v),view,{timeout:5000});
    };
    if(d.mobile){
     assert.equal(await page.locator(".mobile-tabs>a[data-app-tab]").count(),5,"phone has exactly five navigation destinations");
     assert.ok(await page.locator(".mobile-tabs>.mobile-theme-float").count()===1,"theme control remains in single dock");
    }else assert.equal(await page.locator(".portfolio-rail").evaluate(el=>getComputedStyle(el).position),"fixed","desktop sidebar fixed");
    await route("work");
    const projects=await page.locator("#showcase .orbit-track").textContent();
    included(projects,["Gold Ops OS","Aspirva","PuddleLoom Studio"],d.name+" project carousel");
    assert.equal(await page.locator("#growth-os-evidence-title").count(),1,"Growth OS documented in project evidence");
    await route("skills");
    await page.locator("#skills .resume-skills-more summary").click();
    const skills=await page.locator("#skills .resume-skills-more").innerText();
    included(skills,["Codex","OpenCode","Firebase Test Lab","Docker knowledge covers the basics","FastAPI","Next.js","Node.js","FFmpeg","XLOOKUP/VLOOKUP"],d.name+" full skill list");
    if(d.mobile){
      await route("about");
      const extra=page.locator('.mobile-app__more[data-subsection="experience"]');
      await extra.locator("summary").click();
    }else await route("experience");
    const exp=await page.locator("#experience").innerText();
    included(exp,["Health Operations New Associate","30–100","3,000","Peddlr","money owed to or by the business","Jul 2022"],d.name+" experience");
    const proofImages=page.locator("#experience .education-proof__card img");
    assert.equal(await proofImages.count(),4,d.name+" diploma, recognition and both redacted TOR pages");
    for(const image of await proofImages.all()){
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(el=>new Promise((resolve,reject)=>{if(el.complete)return el.naturalWidth>0?resolve():reject(new Error("image failed"));el.addEventListener("load",resolve,{once:true});el.addEventListener("error",()=>reject(new Error("image failed")),{once:true})}));
    }
    const certificate=page.locator(".certificate-proof--"+(d.mobile?"mobile":"desktop"));
    if(d.mobile){const aboutExtra=page.locator('.mobile-app__more[data-subsection="experience"]');await aboutExtra.locator("summary").click();assert.equal(await aboutExtra.evaluate(el=>el.open),false,"About disclosure reclosed before independent certificate check");}
    await certificate.scrollIntoViewIfNeeded();
    assert.ok(await certificate.isVisible(),d.name+" credential card visible");
    const certificateImage=certificate.locator("img");
    await certificateImage.scrollIntoViewIfNeeded();
    const asset=await certificateImage.evaluate(el=>({complete:el.complete,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,fit:getComputedStyle(el).objectFit,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
    assert.ok(asset.complete&&asset.naturalWidth===340&&asset.naturalHeight===427,d.name+" actual certificate raster loaded: "+JSON.stringify(asset));
    assert.equal(asset.fit,"contain",d.name+" certificate never crops");
    assert.ok(Math.abs(asset.h/asset.w-427/340)<.02,d.name+" certificate full-page aspect maintained");
    assert.equal(await certificate.locator(".certificate-proof__exact-link").getAttribute("href"),"https://my-certificates.com/certificates/6a51c63281683ab6396a9e45",d.name+" full exact credential link");
    assert.ok((await certificate.innerText()).includes("Martin Dellwing"),d.name+" certificate issuer details readable");
    if(d.mobile){
      assert.equal(await page.evaluate(()=>window.scrollY),0,d.name+" body remains locked");
      await route("contact");
      const form=page.locator("#contact .fit-contact-more");
      if(!await form.evaluate(el=>el.open))await form.locator("summary").click();
      const last=page.locator("#copy-message");
      await last.scrollIntoViewIfNeeded();
      assert.ok(await last.isVisible(),d.name+" last contact CTA visible");
      const hit=await last.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;const top=document.elementFromPoint(x,y);return top===el||el.contains(top)});
      assert.ok(hit,d.name+" last CTA unobstructed by dock");
      const initial=await root.getAttribute("data-theme");
      await page.locator("#theme-toggle-mobile").click();
      assert.notEqual(await root.getAttribute("data-theme"),initial,d.name+" theme orb independently clickable");
      assert.equal(await root.getAttribute("data-app-view"),"contact",d.name+" theme does not change tab");
    }
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,docY:scrollY}));
    assert.ok(geometry.overflow<=7,d.name+" no horizontal overflow "+JSON.stringify(geometry));
    assert.equal(errors.length,0,d.name+" uncaught JS exceptions: "+errors.join(" | "));
    console.log("RESUME CONTENT + RESPONSIVE PASS "+JSON.stringify({screen:d.name,overflow:geometry.overflow,projects:3,growthOS:true,skills:true,certificateImage:true,contactTested:d.mobile}));
   }catch(e){console.error("RESUME AUDIT FAIL "+d.name,e.stack||e);throw e}
   finally{await ctx.close()}
  }
  console.log("ALL EIGHT RÉSUMÉ COVERAGE + RESPONSIVE CHECKS PASSED; PDF SHA "+blobSha);
 }catch(e){process.exitCode=1}
 finally{await browser.close()}
})();
