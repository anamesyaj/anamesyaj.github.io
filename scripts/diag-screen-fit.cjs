const {chromium}=require("playwright");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const url=pathToFileURL(path.join(process.cwd(),"index.html")).href;
(async()=>{
 const b=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
   for(const [w,h] of [[1680,1000],[1440,900],[1280,720],[900,740],[768,1024]]){
     const p=await b.newPage({viewport:{width:w,height:h},reducedMotion:"reduce"});
     await p.goto(url+"#top");
     await p.waitForFunction(()=>document.documentElement.classList.contains("continuous-deck"));
     await p.waitForTimeout(230);
     const data=await p.evaluate(()=>{
       return [...document.querySelectorAll("#main>section[data-app-view]")].map(section=>{
         const e=section.querySelector(":scope>.mx-auto");
         const r=section.getBoundingClientRect();
         const st=getComputedStyle(section);
         return {id:section.id,height:Math.round(r.height),panel:Math.round(e.getBoundingClientRect().height),
           available:innerHeight-parseFloat(st.paddingTop)-parseFloat(st.paddingBottom),
           children:[...e.children].map(c=>({tag:c.tagName,cls:String(c.className).slice(0,30),height:Math.round(c.getBoundingClientRect().height),count:c.children.length})),
           overflow:e.scrollHeight>e.clientHeight+4};
       });
     });
     console.log("BASELINE "+w+"x"+h+" "+JSON.stringify(data));
     await p.close();
   }
 }finally{await b.close()}
})();