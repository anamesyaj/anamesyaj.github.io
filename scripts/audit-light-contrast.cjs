/* Snapshot diagnostic of computed light-theme contrast, before the fix.
   Evaluates real CSS from the browser at desktop, compact and phone sizes.
   Text on image/gradient backgrounds is flagged for manual visual inspection. */
const {chromium}=require("playwright");
const fs=require("node:fs/promises");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const site=pathToFileURL(path.resolve("index.html")).href;
const screens=[{name:"desktop-1440",w:1440,h:900},{name:"desktop-900",w:900,h:740},{name:"phone-390",w:390,h:844},{name:"phone-320",w:320,h:568}];
const views=[["home","top"],["services","services"],["work","showcase"],["skills","skills"],["about","about"],["results","results"],["experience","experience"],["contact","contact"]];
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 await fs.mkdir("qa-screens",{recursive:true});
 const failures=[];
 try{
 for(const d of screens){
  const mobile=d.w<=760;
  const ctx=await browser.newContext({viewport:{width:d.w,height:d.h},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:"reduce"});
  await ctx.addInitScript(()=>localStorage.setItem("mj-theme","light"));
  const page=await ctx.newPage();
  try{
   await page.goto(site+"#top",{waitUntil:"load"});
   await page.waitForFunction(()=>document.documentElement.classList.contains("continuous-deck")&&document.documentElement.dataset.theme==="light");
   const routes=mobile?views.filter(x=>["home","work","skills","about","contact"].includes(x[0])):views;
   for(const [view,id] of routes){
    if(view!=="home"){
      if(mobile)await page.locator('.mobile-tabs a[data-app-tab="'+view+'"]').click();
      else await page.locator('.portfolio-rail__nav a[href="#'+id+'"]').click();
    }
    if(mobile&&view==="about"){
      const exp=page.locator('.mobile-app__more[data-subsection="experience"]');
      if(!await exp.evaluate(el=>el.open))await exp.locator("summary").click();
      const res=page.locator('.mobile-app__more[data-subsection="results"]');
      if(!await res.evaluate(el=>el.open))await res.locator("summary").click();
    }
    if(view==="work"){
      await page.locator(".orbit-card.is-front .orbit-card__visual img").evaluate(async image=>{
        if(image.decode)await image.decode();
        if(!image.complete||image.naturalWidth<2000)throw Error("front full-HD image not loaded before light-mode visual audit");
      });
      if(d.name==="desktop-1440"){
        const geometry=await page.evaluate(()=>{
          const c=document.querySelector(".orbit-card.is-front"),g=sel=>{
            const el=c?.querySelector(sel);if(!el)return null;
            const r=el.getBoundingClientRect(),s=getComputedStyle(el);
            const x=r.x+r.width/2,y=r.y+r.height/2,top=document.elementFromPoint(x,y);
            return {selector:sel,x:r.x,y:r.y,w:r.width,h:r.height,visible:s.visibility,display:s.display,opacity:s.opacity,overflow:s.overflow,hit:top?.tagName+"."+(typeof top?.className==="string"?top.className:"")};
          };
          return [".orbit-card__top",".orbit-card__visual",".orbit-card__visual img",".orbit-card__info",".orbit-card__info>div:first-child",".orbit-card__title",".orbit-card__description",".orbit-card__footer"].map(g);
        });
        console.log("LIGHT FRONT DESKTOP GEOMETRY "+JSON.stringify(geometry));
        const image=geometry.find(x=>x.selector===".orbit-card__visual img");
        const title=geometry.find(x=>x.selector===".orbit-card__title");
        const desc=geometry.find(x=>x.selector===".orbit-card__description");
        assert.ok(image&&title&&desc&&image.y+image.h<=title.y+2,
          "light desktop full-HD preview must not cover project title: "+JSON.stringify({image,title,desc}));
        assert.ok(!title.hit?.startsWith("IMG.")&&!desc.hit?.startsWith("IMG."),
          "desktop project copy must be hit-visible, not obscured by image");
      }
      if(d.name==="phone-390"){
        const mobileImg=page.locator(".orbit-card.is-front .orbit-card__visual img");
        const snapshots=async()=>mobileImg.evaluate(img=>{
          const chain=[img,img.parentElement,img.closest(".orbit-card"),img.closest(".orbit-stage")];
          return chain.map(el=>{
            const s=getComputedStyle(el),b=el.getBoundingClientRect();
            return{element:el.tagName+"."+(typeof el.className==="string"?el.className:""),display:s.display,opacity:s.opacity,visibility:s.visibility,transform:s.transform,filter:s.filter,pointerEvents:s.pointerEvents,width:b.width,height:b.height,x:b.x,y:b.y,natural:el===img?[img.complete,img.naturalWidth,img.naturalHeight,img.currentSrc]:null};
          });
        });
        console.log("LIGHT PHONE IMAGE IMMEDIATE "+JSON.stringify(await snapshots()));
        await page.waitForTimeout(800);
        console.log("LIGHT PHONE IMAGE SETTLED "+JSON.stringify(await snapshots()));
        await page.screenshot({path:"qa-screens/light-phone-390-work-settled.png"});
      }
      const evidence=page.locator("#showcase .resume-project-evidence");
      if(!await evidence.evaluate(el=>el.open))await evidence.locator("summary").click();
    }
    if(view==="skills"){
      const all=page.locator("#skills .resume-skills-more");
      if(!await all.evaluate(el=>el.open))await all.locator("summary").click();
    }
    if(view==="contact"&&mobile){
      const form=page.locator("#contact .fit-contact-more");
      if(!await form.evaluate(el=>el.open))await form.locator("summary").click();
    }
    const scope=mobile?'.mobile-app__page[data-mobile-view="'+view+'"]':("#"+id);
    const result=await page.evaluate((sel)=>{
      const root=document.querySelector(sel);if(!root)return{error:"no scope"};
      const color=v=>{if(!v)return null;const s=v.match(/rgba?\(([^)]+)\)/i);if(!s)return null;const a=s[1].split(/[\s,/]+/).filter(Boolean).map(Number);return a.length>=3?[a[0],a[1],a[2],a.length>3?a[3]:1]:null};
      const mix=(top,base)=>[0,1,2].map(i=>top[i]*top[3]+base[i]*(1-top[3]));
      const bg=el=>{
       const layers=[];let cur=el;
       while(cur&&cur.nodeType===1){
        const s=getComputedStyle(cur),rgba=color(s.backgroundColor);
        if(s.backgroundImage!=="none"&&s.backgroundImage)layers.push({image:s.backgroundImage.slice(0,80),tag:cur.tagName,cls:typeof cur.className==="string"?cur.className.slice(0,40):""});
        if(rgba&&rgba[3]>0)layers.push({rgba});
        cur=cur.parentElement;
       }
       let c=[255,255,255];
       for(let i=layers.length-1;i>=0;i--)if(layers[i].rgba)c=mix(layers[i].rgba,c);
       return {rgb:c,gradient:layers.some(x=>x.image)};
      };
      const lum=rgb=>rgb.slice(0,3).map(n=>{let c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);
      const ratio=(a,b)=>{let x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
      const selector=el=>{let s=el.tagName.toLowerCase();if(el.id)s+="#"+el.id;else if(typeof el.className==="string"&&el.className)s+="."+el.className.trim().split(/\s+/).slice(0,2).join(".");return s};
      const elements=[...root.querySelectorAll("*")].filter(el=>{
        if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>=2))return false;
        const s=getComputedStyle(el),rect=el.getBoundingClientRect();
        if(s.display==="none"||s.visibility==="hidden"||+s.opacity===0||rect.width<8||rect.height<6)return false;
        for(let p=el.parentElement;p;p=p.parentElement)if(getComputedStyle(p).display==="none"||getComputedStyle(p).visibility==="hidden")return false;
        return true;
      });
      const audit=elements.map(el=>{
        const s=getComputedStyle(el),fg=color(s.color),b=bg(el),size=parseFloat(s.fontSize)||16,weight=parseFloat(s.fontWeight)||400,large=size>=24||(size>=18.66&&weight>=700),text=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(" ").replace(/\s+/g," ").trim();
        const isGradient=s.backgroundClip==="text"||s.webkitTextFillColor==="rgba(0, 0, 0, 0)";
        if(!fg||isGradient)return null;
        const r=ratio(fg,b.rgb),threshold=large?3:4.5;
        return{selector:selector(el),text:text.slice(0,55),ratio:+r.toFixed(2),threshold,fg:s.color,bg:b.rgb.map(Math.round).join(","),gradient:b.gradient,large};
      }).filter(Boolean);
      const low=audit.filter(x=>x.ratio<x.threshold&&!(x.gradient&&x.ratio>2.6)).sort((a,b)=>a.ratio-b.ratio);
      return{count:audit.length,lowCount:low.length,low:low.slice(0,27),gradient: audit.filter(x=>x.gradient&&x.ratio<4.5).slice(0,9)};
    },scope);
    console.log("LIGHT DIAGNOSTIC "+d.name+" "+view+" "+JSON.stringify(result));
    if(result.error||result.lowCount>0)failures.push({screen:d.name,view,low:result.low}); 
    if(view==="work"){
     const observed=await page.locator(".orbit-card.is-front .orbit-card__action").evaluate(el=>({
      fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor
     }));
     const parse=s=>(s.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
     const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
     const x=luminance(parse(observed.fg)),y=luminance(parse(observed.bg)),contrast=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
     assert.ok(contrast>=4.5,d.name+" light project Visit site CTA contrast "+contrast.toFixed(2));
    }
    if(view==="contact"){
     const observed=await page.locator("#contact-name").evaluate(el=>({fg:getComputedStyle(el,"::placeholder").color,bg:getComputedStyle(el).backgroundColor}));
     const parse=s=>(s.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
     const L=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
     const x=L(parse(observed.fg)),y=L(parse(observed.bg)),c=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
     assert.ok(c>=4.5,d.name+" form placeholder contrast "+c.toFixed(2));
     console.log("LIGHT PLACEHOLDER PASS "+d.name+" ratio="+c.toFixed(2));
    }
    if((view==="home"||view==="work"||view==="about"||view==="contact"||view==="experience")&&["desktop-1440","phone-390"].includes(d.name)){
      await page.screenshot({path:"qa-screens/light-"+d.name+"-"+view+".png"});
    }
   }
   const dark=await page.evaluate(()=>{document.documentElement.dataset.theme="dark";const s=getComputedStyle(document.documentElement);return{bg:s.getPropertyValue("--bg").trim(),ink:s.getPropertyValue("--text").trim(),gold:s.getPropertyValue("--hy-gold").trim()};});
   assert.deepEqual(dark,{bg:"#09121a",ink:"#f4f7f7",gold:"#e5bc6d"},d.name+" dark-theme tokens unchanged");
   console.log("DARK THEME TOKEN REGRESSION PASS "+d.name);
  }finally{await ctx.close()}
 }
 console.log("LIGHT CONTRAST DIAGNOSTICS COMPLETE failures="+failures.length);
 if(failures.length)throw Error("LIGHT CONTRAST REGRESSION "+JSON.stringify(failures));
 }catch(e){console.error("LIGHT DIAGNOSTIC SCRIPT ERROR",e.stack||e);process.exitCode=1}
 finally{await browser.close()}
})();
