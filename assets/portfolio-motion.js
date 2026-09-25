/* Accessible 3D CSS carousel + mobile/desktop shell interactions.
   Pauses when hidden, offscreen, hovered/focused, under reduced motion or on slow frames. */
(()=>{"use strict";
 const root=document.documentElement;
 const showcase=document.getElementById("showcase");
 const stage=document.getElementById("orbit-stage");
 const track=document.getElementById("orbit-track");
 if(!showcase||!stage||!track)return;
 const panels=[...track.querySelectorAll(".orbit-card")];
 const prev=document.getElementById("orbit-prev"),next=document.getElementById("orbit-next");
 const pause=document.getElementById("orbit-pause");
 const label=document.getElementById("orbit-current"),count=document.getElementById("orbit-count");
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const viewer=document.getElementById("orbit-preview-dialog");
 const viewerImage=document.getElementById("orbit-preview-image");
 const viewerTitle=document.getElementById("orbit-preview-title");
 const viewerCanvas=document.getElementById("orbit-preview-canvas");
 const viewerFull=document.getElementById("orbit-full-image");
 const zoomOut=document.getElementById("orbit-zoom-out"),zoomIn=document.getElementById("orbit-zoom-in");
 const zoomFit=document.getElementById("orbit-zoom-reset");
 let zoomLevel=1,dialogOpen=false,restoreFocus=null,swipeGuardUntil=0;
 let index=0,manualPause=reduce.matches,visible=false,hovered=false,focused=false,timer=null;
 let pointerX=null,pointerId=null,lowPerf=false;
 function activeMotion(){return visible&&!manualPause&&!lowPerf&&!document.hidden&&!hovered&&!focused&&!dialogOpen&&!reduce.matches}
 function schedule(){
  if(timer!==null){clearTimeout(timer);timer=null}
  if(activeMotion())timer=setTimeout(()=>{select((index+1)%panels.length,false);},6200);
 }
 function select(n,user){
  index=((n%panels.length)+panels.length)%panels.length;
  track.style.setProperty("--orbit-rotation",(-120*index)+"deg");
  panels.forEach((panel,i)=>{
   const current=i===index;
   panel.classList.toggle("is-front",current);
   panel.dataset.position=current?"current":i===(index+1)%panels.length?"next":"prev";
   panel.setAttribute("aria-hidden",String(!current));
   panel.querySelectorAll("a,button").forEach(link=>{link.tabIndex=current?0:-1});
   if(current){const img=panel.querySelector(".orbit-card__visual img");if(img)img.loading="eager";}
  });
  if(label)label.textContent=panels[index].dataset.title||"Featured project";
  if(count)count.textContent=(index+1)+" / "+panels.length;
  if(user)stage.dataset.lastAction="manual";
  schedule();
 }
 function syncPause(){
  if(!pause)return;
  pause.setAttribute("aria-pressed",String(manualPause));
  const txt=pause.querySelector(".orbit-pause-label");
  if(txt)txt.textContent=manualPause?"Play":"Pause";
  pause.setAttribute("aria-label",manualPause?"Play automatic carousel":"Pause automatic carousel");
 }
 prev?.addEventListener("click",()=>select(index-1,true));
 next?.addEventListener("click",()=>select(index+1,true));
 pause?.addEventListener("click",()=>{manualPause=!manualPause;syncPause();schedule()});
 stage.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"){hovered=true;schedule()}});
 stage.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"){hovered=false;schedule()}});
 panels.forEach(panel=>{
  const img=panel.querySelector(".orbit-card__visual img[data-fallback]");
  if(!img)return;
  img.addEventListener("error",()=>{
   if(img.dataset.fallbackActive==="true")return;
   img.dataset.fallbackActive="true";
   const visual=img.closest(".orbit-card__visual");
   if(visual)visual.dataset.fallbackActive="true";
   img.src=img.dataset.fallback;
  });
 });
 function setZoom(next){
  zoomLevel=Math.max(1,Math.min(5,next));
  if(viewerImage)viewerImage.style.width=Math.round(zoomLevel*100)+"%";
  if(zoomOut)zoomOut.disabled=zoomLevel<=1;
  if(zoomIn)zoomIn.disabled=zoomLevel>=5;
 }
 function openPreview(visual){
  const panel=visual.closest(".orbit-card"),img=visual.querySelector("img");
  if(!viewer||!viewerImage||!img||!panel)return;
  restoreFocus=visual;
  viewerTitle.textContent=(panel.dataset.title||"Project")+" — HD preview";
  viewerImage.alt=img.alt;
  viewerImage.src=img.currentSrc||img.src;
  const direct=panel.querySelector(".orbit-card__action");
  if(viewerFull)viewerFull.href=viewerImage.src;
  viewerImage.onerror=()=>{
    if(img.dataset.fallback && viewerImage.src!==img.dataset.fallback){
      viewerImage.src=img.dataset.fallback;
      if(viewerFull)viewerFull.href=viewerImage.src;
    }
  };
  dialogOpen=true;setZoom(1);
  if(viewerCanvas){viewerCanvas.scrollLeft=0;viewerCanvas.scrollTop=0;}
  if(typeof viewer.showModal==="function")viewer.showModal();
  else window.open(viewerImage.src,"_blank","noopener");
  schedule();
 }
 zoomOut?.addEventListener("click",()=>setZoom(zoomLevel-.65));
 zoomIn?.addEventListener("click",()=>setZoom(zoomLevel+.65));
 zoomFit?.addEventListener("click",()=>{setZoom(1);if(viewerCanvas){viewerCanvas.scrollLeft=0;viewerCanvas.scrollTop=0;}});
 document.getElementById("orbit-preview-close")?.addEventListener("click",()=>viewer?.close());
 viewer?.addEventListener("click",e=>{if(e.target===viewer)viewer.close()});
 viewer?.addEventListener("close",()=>{dialogOpen=false;schedule();restoreFocus?.focus({preventScroll:true})});

 stage.addEventListener("pointerdown",e=>{
  if(e.button!==0||e.target.closest("a"))return;
  pointerX=e.clientX;pointerId=e.pointerId;stage.classList.add("is-dragging");
 },{passive:true});
 function finishSwipe(e){
  if(pointerX===null||pointerId!==e.pointerId)return;
  const dx=e.clientX-pointerX;pointerX=null;pointerId=null;
  stage.classList.remove("is-dragging");
  if(Math.abs(dx)>=36){swipeGuardUntil=Date.now()+500;select(index+(dx<0?1:-1),true)}
 }
 stage.addEventListener("pointerup",finishSwipe);
 stage.addEventListener("click",e=>{
  if(Date.now()<swipeGuardUntil)return;
  const card=e.target.closest(".orbit-card");
  if(!card||e.target.closest("a"))return;
  const n=panels.indexOf(card);
  if(n<0)return;
  if(n!==index){select(n,true);return;}
  const visual=e.target.closest("[data-zoom-preview]");
  if(visual)openPreview(visual);
 });
 stage.addEventListener("pointercancel",()=>{pointerX=null;pointerId=null;stage.classList.remove("is-dragging")});
 showcase.addEventListener("keydown",e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
   e.preventDefault();select(index+(e.key==="ArrowRight"?1:-1),true);
  }
 });
 showcase.addEventListener("focusin",()=>{focused=true;schedule()});
 showcase.addEventListener("focusout",()=>{queueMicrotask(()=>{focused=showcase.contains(document.activeElement);schedule()})});
 document.addEventListener("visibilitychange",schedule);
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting);schedule()},{threshold:.08});
  observer.observe(showcase);
 }else visible=true;
 reduce.addEventListener?.("change",()=>{if(reduce.matches){manualPause=true;syncPause()}schedule()});
 syncPause();select(0,false);
 /* Legacy scroll-spy only applies without the app router. The app router\n    owns exact active state for the persistent sidebar and mobile dock. */
 if(!root.classList.contains("app-shell")){
 /* Real phone navigation and desktop profile rail share active section state. */
 const navigation=[...document.querySelectorAll(".mobile-tabs a[href^='#'],.portfolio-rail__nav a[href^='#']")];
 const sections=["top","challenge","about","results","skills","showcase","projects","approach","experience","contact"]
  .map(id=>document.getElementById(id)).filter(Boolean);
 const translate={challenge:"top",results:"about",showcase:"projects"};
 function syncNav(id){
  const target="#"+(translate[id]||id);
  navigation.forEach(link=>{
   const isCurrent=link.getAttribute("href")===target;
   link.classList.toggle("is-current",isCurrent);
   if(isCurrent)link.setAttribute("aria-current","location");
   else link.removeAttribute("aria-current");
  });
 }
 navigation.forEach(link=>link.addEventListener("click",()=>syncNav(link.hash.slice(1))));
 if("IntersectionObserver" in window){
  const active=new IntersectionObserver(entries=>{
   const onscreen=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
   if(onscreen.length)syncNav(onscreen[0].target.id);
  },{rootMargin:"-20% 0px -56% 0px",threshold:[0,.1,.33]});
  sections.forEach(x=>active.observe(x));
 }
 syncNav((location.hash||"#top").slice(1));
 }
 /* Scroll-in reveals never hide content: progressive enhancement only. */
 if(!reduce.matches&&"IntersectionObserver" in window){
  const show=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in-view");show.unobserve(e.target)}});
  },{threshold:.06,rootMargin:"0px 0px -5% 0px"});
  document.querySelectorAll(".reveal").forEach(x=>show.observe(x));
 }
 /* Single bounded real-frame check: gracefully stop autoplay/contour if slow. */
 if(!reduce.matches&&"requestAnimationFrame" in window){
  let ticks=[],last=0,started=0;
  const frame=t=>{
   if(document.hidden||ticks.length>75||lowPerf)return;
   if(!started)started=t;
   if(last){const dt=t-last;if(dt>0&&dt<120)ticks.push(dt)}
   last=t;
   if(t-started<1450&&ticks.length<74){requestAnimationFrame(frame);return}
   if(ticks.length>=20){
    ticks.sort((a,b)=>a-b);
    const median=ticks[Math.floor(ticks.length/2)];
    if(median>27){lowPerf=true;root.dataset.portfolioMotion="limited";schedule()}
   }
  };
  requestAnimationFrame(frame);
 }
})();
