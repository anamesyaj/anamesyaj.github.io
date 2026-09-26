/* Presentation Fit v8.
   Gold Ops OS-inspired principle: one readable summary per viewport, detailed
   evidence available through native disclosure controls. Never silently discard
   content or force unreadably tiny typography to achieve a visual "fit". */
(()=>{"use strict";
 const root=document.documentElement,main=document.getElementById("main");
 if(!root.classList.contains("continuous-deck")||!main)return;
 const prefersReduced=matchMedia("(prefers-reduced-motion: reduce)");
 const projects=document.getElementById("projects");
 const projectCards=[...document.querySelectorAll("#project-cases>.project-card")];
 const grid=document.getElementById("project-cases");
 const names=["Gold Ops OS","Aspirva","PuddleLoom"];
 let selectedProject=0;
 function projectTabSelect(index,{focus=false}={}){
   if(index<0||index>=projectCards.length)return;
   selectedProject=index;
   projectCards.forEach((card,i)=>{
     const selected=i===index;
     card.dataset.fitActive=String(selected);
     card.hidden=!selected;
     card.setAttribute("aria-hidden",String(!selected));
   });
   tabs.forEach((tab,i)=>{
     const selected=i===index;
     tab.setAttribute("aria-selected",String(selected));
     tab.tabIndex=selected?0:-1;
   });
   if(focus)tabs[index].focus({preventScroll:true});
 }
 const tabs=[];
 if(projects&&grid&&projectCards.length===3){
   const menu=document.createElement("div");
   menu.className="fit-project-tabs";
   menu.setAttribute("role","tablist");
   menu.setAttribute("aria-label","Select a featured project");
   projectCards.forEach((card,i)=>{
     card.id=card.id||"fit-project-"+(i+1);
     card.setAttribute("role","tabpanel");
     const tab=document.createElement("button");
     tab.type="button";tab.id="fit-project-tab-"+(i+1);
     tab.setAttribute("role","tab");
     tab.setAttribute("aria-controls",card.id);
     tab.textContent=names[i];
     tab.addEventListener("click",()=>projectTabSelect(i));
     tab.addEventListener("keydown",event=>{
       const delta=event.key==="ArrowRight"?1:event.key==="ArrowLeft"?-1:0;
       if(!delta)return;
       event.preventDefault();
       projectTabSelect((selectedProject+delta+projectCards.length)%projectCards.length,{focus:true});
     });
     card.setAttribute("aria-labelledby",tab.id);
     menu.append(tab);
     tabs.push(tab);
   });
   grid.parentNode.insertBefore(menu,grid);
   const initialHash=(location.hash||"").slice(1);
   const initialIndex=projectCards.findIndex(card=>card.id===initialHash||card.contains(document.getElementById(initialHash)));
   projects.classList.add("fit-projects-ready");
   projectTabSelect(initialIndex>=0?initialIndex:0);
   const toggle=document.getElementById("toggle-all-cases");
   if(toggle){toggle.setAttribute("aria-hidden","true");toggle.tabIndex=-1;}
   function selectHashProject(){
     const target=document.getElementById((location.hash||"").slice(1));
     if(!target)return;
     const index=projectCards.findIndex(card=>card===target||card.contains(target));
     if(index>=0)projectTabSelect(index);
   }
   addEventListener("hashchange",selectHashProject);
   addEventListener("popstate",selectHashProject);
   document.addEventListener("click",event=>{
     const link=event.target.closest("a[href^='#']");
     if(link){const target=document.getElementById(link.hash.slice(1));const idx=projectCards.findIndex(card=>card===target||card.contains(target));if(idx>=0)projectTabSelect(idx);}
   },{capture:true});
 }
 const wrap=(selector,title,subtitle="View details")=>{
   const element=document.querySelector(selector);
   if(!element||element.closest(".fit-details"))return null;
   const wrapper=document.createElement("details");
   wrapper.className="fit-details";
   const summary=document.createElement("summary");
   const label=document.createElement("span");
   label.textContent=title;
   const hint=document.createElement("span");
   hint.className="fit-detail-count";hint.textContent=subtitle;
   summary.append(label,hint);
   const inner=document.createElement("div");
   inner.className="fit-details__content";
   element.parentNode.insertBefore(wrapper,element);
   wrapper.append(summary,inner);
   inner.append(element);
   return wrapper;
 };
 // Visually dense supporting blocks become explicit, readable expansions.
 wrap("#challenge .visitor-explorer","Explore how I can help","Interactive focus areas");
 wrap("#results .impact-story","See the process improvement story","Documented impact");
 wrap("#approach .first90","My first 90 days","Illustrative onboarding plan");
 wrap("#approach .kpi-block","What I measure","6 practical indicators");
 // Keep the principal two skills in view; other skills remain one tap away.
 const skills=document.querySelector("#skills .grid");
 if(skills){
   const skillCards=[...skills.querySelectorAll(":scope>.skill-card")];
   if(skillCards.length>2){
     const detail=document.createElement("details");
     detail.className="fit-details fit-skills-more";
     const summary=document.createElement("summary");
     summary.innerHTML="<span>Explore my other skills</span><span class='fit-detail-count'>4 more areas</span>";
     const inner=document.createElement("div");
     inner.className="fit-details__content fit-skills-extra";
     inner.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px";
     skillCards.slice(2).forEach(card=>inner.append(card));
     detail.append(summary,inner);
     skills.after(detail);
   }
 }
 // Keep current role visible on the first Experience screen. Prior roles
 // remain in chronological order inside a single expand/collapse section.
 const experience=document.querySelector("#experience .experience-timeline");
 if(experience){
   const items=[...experience.querySelectorAll(":scope>.timeline-entry")];
   if(items.length>1){
     const detail=document.createElement("details");
     detail.className="fit-details fit-experience-more";
     const summary=document.createElement("summary");
     summary.innerHTML="<span>Explore previous roles</span><span class='fit-detail-count'>"+(items.length-1)+" additional roles</span>";
     const inner=document.createElement("div");
     inner.className="fit-details__content";
     const list=document.createElement("ol");
     list.className="experience-timeline";
     list.style.marginTop="5px";
     items.slice(1).forEach(item=>list.append(item));
     inner.append(list);
     detail.append(summary,inner);
     experience.after(detail);
   }
 }
 // Compact contact view only on phones, preserving the full form in a native
 // disclosure; desktop retains its familiar two-column visible form.
 const contact=document.getElementById("contact");
 const formPanel=contact?.querySelector(".contact-form-panel");
 const phone=matchMedia("(max-width:760px)");
 let contactDetail=null,formAnchor=null,formHome=null;
 if(formPanel){
   formAnchor=document.createComment("Contact form default position");
   formPanel.before(formAnchor);
   formHome=formAnchor.parentNode;
   contactDetail=document.createElement("details");
   contactDetail.className="fit-details fit-contact-more";
   const summary=document.createElement("summary");
   summary.innerHTML="<span>Write a message</span><span class='fit-detail-count'>Open the email form</span>";
   const content=document.createElement("div");
   content.className="fit-details__content";
   contactDetail.append(summary,content);
   formPanel.after(contactDetail);
   function syncContact(){
     if(phone.matches){
       content.append(formPanel);
     }else{
       formAnchor.after(formPanel);
       contactDetail.open=false;
     }
   }
   syncContact();
   phone.addEventListener?.("change",syncContact);
 }
 // Lower content density on phones and short viewports while retaining a
 // readable minimum font size and the full content behind details.
 const compact=matchMedia("(max-height:760px)");
 function syncHeight(){root.classList.toggle("fit-short-screen",compact.matches)}
 syncHeight();compact.addEventListener?.("change",syncHeight);
 root.classList.add("presentation-fit");
})();