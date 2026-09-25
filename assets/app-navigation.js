/* App-style single-document navigation.
   Sections are grouped into views and swapped without a page reload.
   Hashes remain valid as a no-JS fallback and for deep links. */
(()=>{"use strict";
  const root=document.documentElement;
  const main=document.getElementById("main");
  const sections=[...document.querySelectorAll("main > section[data-app-view]")];
  if(!main||!sections.length)return;

  root.classList.remove("app-boot");
  root.classList.add("app-shell");

  const viewForId=new Map();
  sections.forEach(section=>{
    const view=section.dataset.appView;
    if(view)viewForId.set(section.id,view);
  });

  const dockLinks=[...document.querySelectorAll(".mobile-tabs a[data-app-tab]")];
  const railLinks=[...document.querySelectorAll(".portfolio-rail__nav a[href^='#']")];
  const topLinks=[...document.querySelectorAll("#primary-nav a[href^='#']")];
  const allNav=[...dockLinks,...railLinks,...topLinks];
  const announcer=document.getElementById("app-view-announcer");
  let currentView="";
  let viewToken=0;

  const canonicalTarget={
    home:"top",
    work:"projects",
    contact:"contact",
    skills:"skills",
    about:"about"
  };

  function resolveView(targetId){
    return viewForId.get(targetId)||({
      top:"home",challenge:"home",
      showcase:"work",projects:"work",
      skills:"skills",approach:"skills",
      about:"about",results:"about",experience:"about",
      contact:"contact"
    })[targetId]||"home";
  }

  function syncNavigation(view){
    dockLinks.forEach(link=>{
      const active=link.dataset.appTab===view;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    railLinks.forEach(link=>{
      const active=resolveView(link.hash.slice(1))===view;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    topLinks.forEach(link=>{
      const active=resolveView(link.hash.slice(1))===view;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
  }

  function revealView(view){
    sections.forEach(section=>{
      const visible=section.dataset.appView===view;
      section.hidden=!visible;
      section.setAttribute("aria-hidden",String(!visible));
      if(visible){
        section.classList.remove("app-view-enter");
        void section.offsetWidth;
        section.classList.add("app-view-enter");
      }
    });
  }

  function focusTarget(targetId,behavior){
    const target=document.getElementById(targetId)||document.getElementById(canonicalTarget[currentView]||"top");
    if(!target)return;
    const focusable=target.querySelector("h1,h2,h3,[tabindex]");
    requestAnimationFrame(()=>{
      target.scrollIntoView({block:"start",behavior});
      if(focusable instanceof HTMLElement){
        const had=focusable.hasAttribute("tabindex");
        if(!had)focusable.setAttribute("tabindex","-1");
        focusable.focus({preventScroll:true});
        if(!had)focusable.addEventListener("blur",()=>focusable.removeAttribute("tabindex"),{once:true});
      }
    });
  }

  function setView(view,targetId,{historyMode="push",focus=true}={}){
    if(!["home","work","contact","skills","about"].includes(view))view="home";
    const changed=currentView!==view;
    currentView=view;
    root.dataset.appView=view;
    revealView(view);
    syncNavigation(view);
    const resolvedTarget=targetId&&resolveView(targetId)===view?targetId:canonicalTarget[view];
    if(historyMode!=="none"){
      const hash="#"+resolvedTarget;
      if(historyMode==="replace")history.replaceState({view,target:resolvedTarget},"",hash);
      else history.pushState({view,target:resolvedTarget},"",hash);
    }
    if(announcer)announcer.textContent=(view.charAt(0).toUpperCase()+view.slice(1))+" view";
    if(focus)focusTarget(resolvedTarget,changed?"auto":"smooth");
    viewToken++;
    window.dispatchEvent(new CustomEvent("portfolioappviewchange",{detail:{view,target:resolvedTarget,token:viewToken}}));
  }

  function navigateHash(hash,opts={}){
    const id=(hash||"#top").slice(1);
    const view=resolveView(id);
    setView(view,id,opts);
  }

  document.addEventListener("click",event=>{
    const link=event.target.closest("a[href^='#']");
    if(!link||link.hasAttribute("download"))return;
    const hash=link.getAttribute("href");
    if(!hash||hash==="#"||!document.getElementById(hash.slice(1)))return;
    event.preventDefault();
    navigateHash(hash,{historyMode:"push",focus:true});
  });

  window.addEventListener("popstate",()=>{
    navigateHash(location.hash||"#top",{historyMode:"none",focus:true});
  });

  const mobileTheme=document.getElementById("theme-toggle-mobile");
  function syncMobileTheme(){
    if(!mobileTheme)return;
    const light=root.dataset.theme==="light";
    mobileTheme.setAttribute("aria-pressed",String(light));
    mobileTheme.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");
    mobileTheme.title=light?"Switch to dark theme":"Switch to light theme";
  }
  mobileTheme?.addEventListener("click",()=>{
    const next=root.dataset.theme==="light"?"dark":"light";
    root.dataset.theme=next;
    try{localStorage.setItem("mj-theme",next)}catch(_){}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",next==="light"?"#f4f8f8":"#09121a");
    const desktop=document.getElementById("theme-toggle");
    desktop?.setAttribute("aria-pressed",String(next==="light"));
    desktop?.setAttribute("aria-label",next==="light"?"Switch to dark theme":"Switch to light theme");
    syncMobileTheme();
  });
  document.getElementById("theme-toggle")?.addEventListener("click",()=>requestAnimationFrame(syncMobileTheme));
  syncMobileTheme();

  const initialId=(location.hash||"#top").slice(1);
  const initialView=resolveView(initialId);
  setView(initialView,initialId,{historyMode:"replace",focus:false});
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
})();