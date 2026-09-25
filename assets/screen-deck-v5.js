/* Screen Deck v5 — viewport snapping, responsive fit, chapter affordance.
   No page loads: it works with the existing hash router and its five app views.
   Supporting content scrolls within its screen if compressing would harm type. */
(()=>{"use strict";
 const root=document.documentElement;
 const main=document.getElementById("main");
 if(!main||!root.classList.contains("app-shell"))return;
 const all=[...main.querySelectorAll(":scope > section[data-app-view]")];
 if(!all.length)return;
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const rail=[...document.querySelectorAll(".portfolio-rail__nav a[href^='#']")];
 const dock=[...document.querySelectorAll(".mobile-tabs a[data-app-tab]")];
 const current=()=>all.filter(section=>!section.hidden);
 const titleFor=section=>{
   const title=section.querySelector(".hero-heading,.section-heading");
   const text=title?.textContent?.replace(/\s+/g," ").trim();
   return text||section.id[0].toUpperCase()+section.id.slice(1);
 };
 let activeId="",pending=null,sectionToken=0,fitTimer=null,mainUserScroll=null;
 const switcher=document.createElement("nav");
 switcher.className="screen-switcher";
 switcher.hidden=true;
 switcher.setAttribute("aria-label","Screen navigation");
 switcher.innerHTML='<button type="button" data-screen-prev aria-label="Previous screen">↑</button><output aria-live="off" aria-label="Screen position">1 / 1</output><span class="screen-switcher__name"></span><button type="button" data-screen-next aria-label="Next screen">↓</button>';
 main.insertAdjacentElement("afterend",switcher);
 const prev=switcher.querySelector("[data-screen-prev]");
 const next=switcher.querySelector("[data-screen-next]");
 const counter=switcher.querySelector("output");
 const name=switcher.querySelector(".screen-switcher__name");

 // The method and KPI grids are extensive. Native disclosures expose them
 // immediately on demand, while keeping the four core steps as the one-screen
 // overview. Nothing gets removed, truncated, or rendered at unreadable scale.
 function wrapDetail(selector,title,subtitle){
   const element=document.querySelector(selector);
   if(!element||element.closest(".screen-deck-expander"))return;
   const wrapper=document.createElement("details");
   wrapper.className="screen-deck-expander";
   const summary=document.createElement("summary");
   const a=document.createElement("span");
   a.textContent=title;
   const b=document.createElement("span");
   b.textContent=subtitle;
   b.style.cssText="font-size:.7rem;font-weight:600;color:var(--muted);text-align:right";
   summary.append(a,b);
   wrapper.appendChild(summary);
   element.parentNode.insertBefore(wrapper,element);
   element.setAttribute("data-screen-detail","");
   wrapper.appendChild(element);
   wrapper.addEventListener("toggle",()=>scheduleFit());
 }
 wrapDetail("#approach .first90","My first 90 days","View the onboarding plan");
 wrapDetail("#approach .kpi-block","What I measure","6 delivery KPIs");

 // Do not automatically downsize typography on a phone. Desktop may trim
 // ~10% for near-fitting screens, but otherwise uses a readable local scroller.
 function fitChapter(section){
   const panel=section.querySelector(":scope > .mx-auto");
   if(!panel||section.hidden)return;
   panel.style.zoom="";
   if(window.innerWidth<=760)return;
   const available=section.clientHeight-
     parseFloat(getComputedStyle(section).paddingTop||0)-
     parseFloat(getComputedStyle(section).paddingBottom||0);
   const needed=panel.scrollHeight;
   const factor=available>0&&needed>0?available/needed:1;
   if(factor<1&&factor>=.84){
     panel.style.zoom=Math.max(.84,Math.min(.988,factor-.012)).toFixed(3);
   }
   section.dataset.fitsViewport=panel.scrollHeight<=panel.clientHeight+4?"yes":"details-scroll";
 }
 function fitAll(){for(const section of current())fitChapter(section)}
 function scheduleFit(){
   if(fitTimer!==null)cancelAnimationFrame(fitTimer);
   fitTimer=requestAnimationFrame(()=>{fitTimer=null;fitAll()});
 }
 function activeIndex(){
   const list=current();
   const found=list.findIndex(s=>s.id===activeId);
   return found>=0?found:0;
 }
 function syncRail(section){
   for(const link of rail){
     const selected=link.hash==="#"+section.id;
     link.classList.toggle("is-current",selected);
     if(selected)link.setAttribute("aria-current","page");
     else link.removeAttribute("aria-current");
   }
   const view=section.dataset.appView;
   for(const link of dock){
     const selected=link.dataset.appTab===view;
     link.classList.toggle("is-current",selected);
     if(selected)link.setAttribute("aria-current","page");
     else link.removeAttribute("aria-current");
   }
 }
 function mark(section,{replaceHash=false}={}){
   if(!section||section.hidden)return;
   const list=current();
   const pos=list.indexOf(section);
   if(pos<0)return;
   const changed=activeId!==section.id;
   activeId=section.id;
   switcher.hidden=list.length<2;
   counter.textContent=(pos+1)+" / "+list.length;
   name.textContent=titleFor(section);
   prev.disabled=pos===0;
   next.disabled=pos===list.length-1;
   prev.setAttribute("aria-label",pos>0?"Previous screen: "+titleFor(list[pos-1]):"No previous screen");
   next.setAttribute("aria-label",pos<list.length-1?"Next screen: "+titleFor(list[pos+1]):"No next screen");
   if(changed)syncRail(section);
   if(replaceHash&&location.hash!=="#"+section.id){
     history.replaceState({view:section.dataset.appView,target:section.id},"","#"+section.id);
   }
   root.dataset.appSection=section.id;
 }
 function jumpTo(section,{smooth=false,replaceHash=false}={}){
   if(!section||section.hidden)return;
   sectionToken++;
   if(pending!==null){clearTimeout(pending);pending=null}
   mark(section,{replaceHash});
   // .scrollIntoView targets only the nested main scroller because the
   // document is viewport-locked by the screen-deck stylesheet.
   section.scrollIntoView({block:"start",inline:"nearest",behavior:smooth&&!reduce.matches?"smooth":"instant"});
 }
 function move(delta){
   const list=current();
   const at=activeIndex();
   const nextSection=list[Math.min(list.length-1,Math.max(0,at+delta))];
   if(!nextSection)return;
   jumpTo(nextSection,{smooth:true,replaceHash:true});
 }
 prev.addEventListener("click",()=>move(-1));
 next.addEventListener("click",()=>move(1));
 const nestedScroller=node=>{
   if(!(node instanceof Element))return false;
   const panel=node.closest("section[data-app-view] > .mx-auto");
   return Boolean(panel&&panel.scrollHeight>panel.clientHeight+5);
 };
 function updateFromScroll(){
   const list=current();
   if(!list.length)return;
   const top=main.getBoundingClientRect().top;
   const nearest=list.map(s=>({s,d:Math.abs(s.getBoundingClientRect().top-top)}))
     .sort((a,b)=>a.d-b.d)[0];
   if(nearest)mark(nearest.s,{replaceHash:true});
 }
 main.addEventListener("scroll",()=>{
   if(mainUserScroll!==null)clearTimeout(mainUserScroll);
   mainUserScroll=setTimeout(()=>{mainUserScroll=null;updateFromScroll()},150);
 },{passive:true});
 document.addEventListener("keydown",e=>{
   if(e.altKey||e.ctrlKey||e.metaKey||e.defaultPrevented)return;
   if(document.querySelector("#orbit-preview-dialog[open]"))return;
   const el=e.target;
   if(el instanceof Element&&el.closest("input,textarea,select,button,a,[contenteditable='true'],[role='tablist'],[role='tabpanel'],summary"))return;
   if(el instanceof Element&&el.closest("#orbit-stage")&&["ArrowLeft","ArrowRight"].includes(e.key))return;
   if(["PageDown","ArrowDown"].includes(e.key)){e.preventDefault();move(1)}
   else if(["PageUp","ArrowUp"].includes(e.key)){e.preventDefault();move(-1)}
 },{passive:false});

 const onViewChange=e=>{
   // Existing router has already chosen which chapters are visible. Jump to
   // its exact hash (not always the first chapter), then resize the new panels.
   const id=e.detail?.target;
   const section=all.find(s=>s.id===id&&!s.hidden)||current()[0];
   if(!section)return;
   scheduleFit();
   requestAnimationFrame(()=>requestAnimationFrame(()=>jumpTo(section,{smooth:false,replaceHash:false})));
 };
 window.addEventListener("portfolioappviewchange",onViewChange);
 window.addEventListener("popstate",()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const id=(location.hash||"#top").slice(1);
   jumpTo(all.find(s=>s.id===id&&!s.hidden)||current()[0],{smooth:false});
 })));
 window.addEventListener("resize",scheduleFit,{passive:true});
 if(document.fonts?.ready)document.fonts.ready.then(scheduleFit).catch(()=>{});
 document.querySelectorAll("details").forEach(d=>d.addEventListener("toggle",scheduleFit));
 if("ResizeObserver" in window){
   const ro=new ResizeObserver(()=>scheduleFit());
   ro.observe(main);
 }
 for(const img of document.querySelectorAll("main img")){
   if(!img.complete)img.addEventListener("load",scheduleFit,{once:true});
 }
 // Enable only after the deck controls and listeners exist, preventing a
 // half-initialized screen lock if something above fails.
 root.classList.add("screen-deck");
 scheduleFit();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const id=(location.hash||"#top").slice(1);
   const first=all.find(s=>s.id===id&&!s.hidden)||current()[0];
   if(first)jumpTo(first);
 }));
})();