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
  const announcer=document.getElementById("app-view-announcer");
  let currentView="";
  let viewToken=0;

  const canonicalTarget={
    home:"top",
    work:"showcase",
    contact:"contact",
    skills:"skills",
    about:"about"
  };

  function resolveView(targetId){
    const section=document.getElementById(targetId)?.closest("section[data-app-view]");
    return viewForId.get(targetId)||section?.dataset.appView||({
      top:"home",
      showcase:"work",
      skills:"skills",
      about:"about",results:"about",experience:"about",
      contact:"contact"
    })[targetId]||"home";
  }

  function syncNavigation(view,targetId){
    // A view can contain multiple chapters. Highlight the actual desktop
    // destination, not both About and Experience simply because they share a view.
    const activeRailId=railLinks.some(link=>link.hash==="#"+targetId)
      ? targetId : canonicalTarget[view];
    const activeTopId=topLinks.some(link=>link.hash==="#"+targetId)
      ? targetId : canonicalTarget[view];
    dockLinks.forEach(link=>{
      const active=link.dataset.appTab===view;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    railLinks.forEach(link=>{
      const active=link.hash==="#"+activeRailId;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    topLinks.forEach(link=>{
      const active=link.hash==="#"+activeTopId;
      link.classList.toggle("is-current",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
  }

  function revealView(view){
    // Continuous navigation: never hide other chapters when a tab is pressed.
    // The visitor can naturally wheel from the first screen through the last.
    sections.forEach(section=>{
      section.hidden=false;
      section.setAttribute("aria-hidden","false");
      section.classList.remove("app-view-enter");
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
    const resolvedTarget=targetId&&resolveView(targetId)===view?targetId:canonicalTarget[view];
    syncNavigation(view,resolvedTarget);
    if(historyMode!=="none"){
      const hash="#"+resolvedTarget;
      if(historyMode==="replace")history.replaceState({view,target:resolvedTarget},"",hash);
      else history.pushState({view,target:resolvedTarget},"",hash);
    }
    if(announcer)announcer.textContent=(view.charAt(0).toUpperCase()+view.slice(1))+" view";
    if(focus&&!root.classList.contains("continuous-deck"))focusTarget(resolvedTarget,changed?"auto":"smooth");
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
  const railTheme=document.getElementById("theme-toggle-desktop");
  const headerTheme=document.getElementById("theme-toggle");
  const themeControls=[mobileTheme,railTheme].filter(Boolean);
  function syncThemeControls(){
    const light=root.dataset.theme==="light";
    const instruction=light?"Switch to dark theme":"Switch to light theme";
    themeControls.forEach(button=>{
      button.setAttribute("aria-pressed",String(light));
      button.setAttribute("aria-label",instruction);
      button.title=instruction;
    });
    headerTheme?.setAttribute("aria-pressed",String(light));
    headerTheme?.setAttribute("aria-label",instruction);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content",light?"#f4f8f8":"#09121a");
  }
  function toggleAppearance(button){
    const next=root.dataset.theme==="light"?"dark":"light";
    root.dataset.theme=next;
    try{localStorage.setItem("mj-theme",next)}catch(_){}
    if(button?.classList.contains("mobile-theme-float__button")){
      button.classList.remove("theme-changed");
      void button.offsetWidth;
      button.classList.add("theme-changed");
      button.addEventListener("animationend",()=>button.classList.remove("theme-changed"),{once:true});
    }
    syncThemeControls();
  }
  themeControls.forEach(button=>button.addEventListener("click",()=>toggleAppearance(button)));
  headerTheme?.addEventListener("click",()=>requestAnimationFrame(syncThemeControls));
  new MutationObserver(syncThemeControls).observe(root,{
    attributes:true,attributeFilter:["data-theme"]
  });
  syncThemeControls();

  const initialId=(location.hash||"#top").slice(1);
  const initialView=resolveView(initialId);
  setView(initialView,initialId,{historyMode:"replace",focus:false});
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
})();