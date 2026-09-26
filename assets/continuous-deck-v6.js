/* Continuous Deck v6 — normal wheel scrolling from Home through Contact.
   Native browser scrolling stays in charge. Hero-size chapters use proximity
   snapping and grow naturally when their content needs more than a viewport. */
(()=>{"use strict";
 const root=document.documentElement;
 const main=document.getElementById("main");
 if(!main||!root.classList.contains("app-shell"))return;
 // Desktop owns ordinary page scrolling. On phones, the separate mobile
 // application owns five fixed views and their local content scrollers.
 if(window.matchMedia("(max-width:760px)").matches)return;

 const order=["top","showcase","skills","about","results","experience","contact"];
 const sections=order.map(id=>document.getElementById(id)).filter(Boolean);
 if(sections.length!==order.length)return;
 // Arrange the real HTML sections into the visitor's reading order. The
 // navigation links retain their existing IDs and hash-history behavior.
 sections.forEach(section=>main.appendChild(section));
 sections.forEach(section=>{
   section.hidden=false;
   section.setAttribute("aria-hidden","false");
   section.style.removeProperty("height");
   const panel=section.querySelector(":scope > .mx-auto");
   if(panel)panel.style.removeProperty("zoom");
 });

 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const rail=[...document.querySelectorAll(".portfolio-rail__nav a[href^='#']")];
 const dock=[...document.querySelectorAll(".mobile-tabs a[data-app-tab]")];
 const fallbackRail={};
 const switcher=document.createElement("nav");
 switcher.className="screen-switcher";
 switcher.setAttribute("aria-label","Portfolio section navigation");
 switcher.innerHTML='<button type="button" data-screen-prev aria-label="Previous section">↑</button><output aria-live="off" aria-label="Section number">1 / 7</output><span class="screen-switcher__name"></span><button type="button" data-screen-next aria-label="Next section">↓</button>';
 main.insertAdjacentElement("afterend",switcher);
 const prev=switcher.querySelector("[data-screen-prev]");
 const next=switcher.querySelector("[data-screen-next]");
 const counter=switcher.querySelector("output");
 const name=switcher.querySelector(".screen-switcher__name");
 let current=sections[0],scrollFrame=0,programmaticUntil=0;
 function titleFor(section){
   const heading=section.querySelector(".hero-heading,.section-heading");
   const t=heading?.textContent?.replace(/\s+/g," ").trim();
   return t||section.id.charAt(0).toUpperCase()+section.id.slice(1);
 }
 function updateNav(section){
   const railTarget=fallbackRail[section.id]||section.id;
   rail.forEach(link=>{
     const active=link.hash==="#"+railTarget;
     link.classList.toggle("is-current",active);
     if(active)link.setAttribute("aria-current","page");
     else link.removeAttribute("aria-current");
   });
   dock.forEach(link=>{
     const active=link.dataset.appTab===section.dataset.appView;
     link.classList.toggle("is-current",active);
     if(active)link.setAttribute("aria-current","page");
     else link.removeAttribute("aria-current");
   });
 }
 function mark(section,{updateHash=false}={}){
   if(!section)return;
   const index=sections.indexOf(section);
   if(index<0)return;
   const changed=current!==section;
   current=section;
   root.dataset.appView=section.dataset.appView;
   root.dataset.appSection=section.id;
   counter.textContent=(index+1)+" / "+sections.length;
   name.textContent=titleFor(section);
   prev.disabled=index===0;
   next.disabled=index===sections.length-1;
   prev.setAttribute("aria-label",index===0?"Beginning of portfolio":"Previous: "+titleFor(sections[index-1]));
   next.setAttribute("aria-label",index===sections.length-1?"End of portfolio":"Next: "+titleFor(sections[index+1]));
   if(changed||!document.querySelector(".portfolio-rail__nav [aria-current='page']"))updateNav(section);
   if(updateHash&&location.hash!=="#"+section.id){
     history.replaceState({view:section.dataset.appView,target:section.id},"","#"+section.id);
   }
 }
 function atViewport(){
   const probe=innerHeight*.43;
   const inside=sections.find(section=>{
     const box=section.getBoundingClientRect();
     return box.top<=probe && box.bottom>probe;
   });
   if(inside)return inside;
   return sections.reduce((best,section)=>{
     const distance=Math.abs(section.getBoundingClientRect().top-probe);
     return distance<best.distance?{section,distance}:best;
   },{section:sections[0],distance:Infinity}).section;
 }
 function onScroll(){
   if(scrollFrame)return;
   scrollFrame=requestAnimationFrame(()=>{
     scrollFrame=0;
     const section=atViewport();
     mark(section,{updateHash:performance.now()>programmaticUntil});
   });
 }
 function navigate(destination,{smooth=true,historyMode="push"}={}){
   const target=typeof destination==="string"?document.getElementById(destination):destination;
   if(!target)return;
   const section=target.closest("section[data-app-view]")||target;
   if(!sections.includes(section))return;
   mark(section);
   const hash="#"+target.id;
   if(historyMode==="push"&&location.hash!==hash){
     history.pushState({view:section.dataset.appView,target:target.id},"",hash);
   }else if(historyMode==="replace"&&location.hash!==hash){
     history.replaceState({view:section.dataset.appView,target:target.id},"",hash);
   }
   // Pause automatic hash replacement while the browser animates to the
   // destination. Native proximity snap supplies the final section alignment.
   programmaticUntil=performance.now()+(smooth&&!reduce.matches?850:150);
   target.scrollIntoView({block:"start",inline:"nearest",behavior:smooth&&!reduce.matches?"smooth":"auto"});
 }
 prev.addEventListener("click",()=>navigate(sections[Math.max(0,sections.indexOf(current)-1)]));
 next.addEventListener("click",()=>navigate(sections[Math.min(sections.length-1,sections.indexOf(current)+1)]));
 window.addEventListener("scroll",onScroll,{passive:true});
 window.addEventListener("resize",onScroll,{passive:true});
 window.addEventListener("portfolioappviewchange",event=>{
   const target=document.getElementById(event.detail?.target||"top")||sections[0];
   const section=target.closest("section[data-app-view]")||target;
   mark(section);
   programmaticUntil=performance.now()+900;
   requestAnimationFrame(()=>target.scrollIntoView({
     block:"start",inline:"nearest",
     behavior:reduce.matches?"auto":"smooth"
   }));
 });
 window.addEventListener("popstate",()=>{
   const target=document.getElementById((location.hash||"#top").slice(1))||sections[0];
   navigate(target,{smooth:false,historyMode:"none"});
 });
 document.addEventListener("keydown",event=>{
   if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.altKey)return;
   if(document.querySelector("#orbit-preview-dialog[open]"))return;
   const element=event.target;
   if(element instanceof Element&&element.closest("input,textarea,select,button,a,[contenteditable],summary,[role='tablist']"))return;
   // Leave wheel, arrow keys, space, PageDown and touch scrolling native.
   // Home/End are only enhanced when no interactive control has focus.
   if(event.key==="Home"){event.preventDefault();navigate(sections[0])}
   else if(event.key==="End"){event.preventDefault();navigate(sections[sections.length-1])}
 });
 root.classList.add("screen-deck","continuous-deck");
 const initial=document.getElementById((location.hash||"#top").slice(1))||sections[0];
 mark(initial.closest("section[data-app-view]")||sections[0]);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   programmaticUntil=performance.now()+300;
   initial.scrollIntoView({block:"start",inline:"nearest",behavior:"auto"});
 }));
})();