/* Mobile App v10. A five-view tab application at <=760px.
   Desktop stays on the original continuous, wheel-scroll website.
   Other tabs never appear by scrolling; long material scrolls only INSIDE the
   selected tab, preserving all details and sensible font sizes. */
(()=>{"use strict";
  const phone=window.matchMedia("(max-width:760px)");
  // Crossing between phone and desktop is a layout-mode change, not a tab
  // navigation. Reinitialize the correct engine, keeping the current hash.
  phone.addEventListener?.("change",()=>window.location.reload());
  if(!phone.matches)return;

  const root=document.documentElement;
  const main=document.getElementById("main");
  const dock=document.querySelector(".mobile-tabs");
  const floater=document.querySelector(".mobile-theme-float");
  const sections=[...(main?.querySelectorAll(":scope > section[data-app-view]")||[])];
  const tabs=["home","work","contact","skills","about"];
  if(!main||!dock||!floater||!sections.length){
    root.classList.remove("mobile-app-boot");
    return;
  }
  const title={home:"Home",work:"Selected work",contact:"Contact",skills:"Skills and tools",about:"About Mark"};
  const pages=new Map();
  const anchors=[...dock.querySelectorAll("a[data-app-tab]")];
  let activeView="",navCounter=0;

  // Two supporting About chapters are kept as native, accessible expandable
  // panels. They are never dropped or shrunk to fit a small phone screen.
  const extra={
    results:"Measured results",
    experience:"Professional experience & education"
  };
  function addAboutDetail(page,section){
    const details=document.createElement("details");
    details.className="mobile-app__more";
    details.dataset.subsection=section.id;
    const summary=document.createElement("summary");
    const label=document.createElement("span");
    label.textContent=extra[section.id]||"Read more";
    summary.append(label);
    details.append(summary,section);
    page.append(details);
    return details;
  }

  for(const view of tabs){
    const page=document.createElement("div");
    page.className="mobile-app__page";
    page.dataset.mobileView=view;
    page.setAttribute("role","region");
    page.setAttribute("aria-label",title[view]);
    page.tabIndex=-1;
    page.hidden=true;
    const children=sections.filter(section=>section.dataset.appView===view);
    if(!children.length)continue;
    children.forEach(section=>{
      if(view==="about"&&extra[section.id])addAboutDetail(page,section);
      else page.append(section);
    });
    main.append(page);
    pages.set(view,page);
  }

  // The arc becomes part of the dock so its geometry is defined relative to
  // the centre Contact tile rather than guessing a fixed viewport position.
  dock.append(floater);

  // Browser history navigates app views without restoring the former desktop
  // page scroll. Page scroll positions are local to each tab.
  try{history.scrollRestoration="manual"}catch(_){}

  function findTarget(id){
    const element=document.getElementById(id);
    const section=element?.closest("section[data-app-view]");
    if(!section)return {view:"home",section:document.getElementById("top"),element:document.getElementById("top")};
    const view=tabs.includes(section.dataset.appView)?section.dataset.appView:"home";
    return {view,section,element};
  }

  function syncTab(view){
    anchors.forEach(link=>{
      const selected=link.dataset.appTab===view;
      link.classList.toggle("is-current",selected);
      if(selected)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
  }

  function activate(view,id,{initial=false}={}){
    const chosen=pages.has(view)?view:"home";
    const page=pages.get(chosen);
    if(!page)return;
    const previously=activeView;
    const moving=previously!==chosen;
    // Hide the other full-height pages immediately; they never become an
    // intermediate scroll destination or part of the document height.
    pages.forEach((candidate,key)=>{
      const shown=key===chosen;
      candidate.hidden=!shown;
      candidate.setAttribute("aria-hidden",String(!shown));
      candidate.inert=!shown;
    });
    // The existing hash router also owns aria-hidden on the original sections.
    // Keep nested chapters consistent while preserving desktop behaviour.
    sections.forEach(section=>{
      const shown=section.dataset.appView===chosen;
      section.hidden=!shown;
      section.setAttribute("aria-hidden",String(!shown));
    });
    activeView=chosen;
    root.dataset.appView=chosen;
    syncTab(chosen);

    const target=findTarget(id||({home:"top",work:"showcase",contact:"contact",skills:"skills",about:"about"})[chosen]);
    const targeted=target.view===chosen?target.element:null;
    if(targeted&&chosen==="about"){
      const disclosure=targeted.closest(".mobile-app__more");
      if(disclosure)disclosure.open=true;
    }

    const current=++navCounter;
    const resetToTop=moving||initial||!targeted||targeted.id===({home:"top",work:"showcase",contact:"contact",skills:"skills",about:"about"})[chosen];
    requestAnimationFrame(()=>{
      if(current!==navCounter)return;
      // For canonical tab taps, open the page from the top. An explicit
      // deep link like #results expands and scrolls to its own subsection.
      if(resetToTop)page.scrollTop=0;
      else if(targeted){
        targeted.scrollIntoView({block:"start",inline:"nearest",behavior:"auto"});
      }
      // Never scroll the document: the selected tab alone is scrollable.
      if(window.scrollY!==0)window.scrollTo(0,0);
    });
    // Lightweight app-page event for QA and future accessibility features.
    window.dispatchEvent(new CustomEvent("mobileappview",{detail:{view:chosen,target:targeted?.id||"",initial}}));
  }

  // The general-purpose router runs before this script. It updates URL,
  // browser history, and link states, then informs this app router.
  window.addEventListener("portfolioappviewchange",event=>{
    activate(event.detail?.view||"home",event.detail?.target);
  });

  // Direct edits to the hash (as opposed to pushState) still find their tab.
  window.addEventListener("hashchange",()=>{
    const id=(window.location.hash||"#top").slice(1);
    const target=findTarget(id);
    activate(target.view,id);
  });

  // Hiding modal previews is managed by the existing carousel; its buttons
  // and project links remain untouched by app view navigation.
  root.classList.add("screen-deck","continuous-deck","mobile-app");
  root.classList.remove("mobile-app-boot");
  const id=(window.location.hash||"#top").slice(1);
  const target=findTarget(id);
  activate(target.view,id,{initial:true});
})();
