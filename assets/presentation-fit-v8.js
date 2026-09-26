/* Presentation Fit v8.
   Gold Ops OS-inspired principle: one readable summary per viewport, detailed
   evidence available through native disclosure controls. Never silently discard
   content or force unreadably tiny typography to achieve a visual "fit". */
(()=>{"use strict";
 const root=document.documentElement,main=document.getElementById("main");
 if(!root.classList.contains("continuous-deck")||!main)return;
 const prefersReduced=matchMedia("(prefers-reduced-motion: reduce)");
 // Show all skills and employment entries directly; the selected-project gallery is the carousel.
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
       // Put the message affordance directly below the contact introduction,
       // above the resume/social blocks and clear of the floating theme orb.
       const lead=contact.querySelector(".mx-auto > .reveal .body-copy");
       if(lead)lead.after(contactDetail);
       content.append(formPanel);
     }else{
       formAnchor.before(contactDetail);
       formAnchor.after(formPanel);
       contactDetail.open=false;
     }
   }
   syncContact();
   phone.addEventListener?.("change",syncContact);
 }
 // A small phone cannot display the complete dashboard, three quick links
 // and the dock at legible sizes. Preserve all links in a native disclosure.
 const smallHome=matchMedia("(max-width:430px) and (max-height:660px)");
 const homeNav=document.querySelector("#top .home-bento");
 if(homeNav){
   const marker=document.createComment("Home quick links original position");
   homeNav.before(marker);
   const d=document.createElement("details");
   d.className="fit-details fit-home-more";
   const sum=document.createElement("summary");
   sum.textContent="Résumé highlights";
   const content=document.createElement("div");
   content.className="fit-details__content";
   d.append(sum,content);
   marker.after(d);
   function syncHome(){
     if(smallHome.matches)content.append(homeNav);
     else {marker.after(homeNav);d.open=false;}
     d.hidden=!smallHome.matches;
   }
   syncHome();
   smallHome.addEventListener?.("change",syncHome);
 }
 // Lower content density on phones and short viewports while retaining a
 // readable minimum font size and the full content behind details.
 const compact=matchMedia("(max-height:760px)");
 function syncHeight(){root.classList.toggle("fit-short-screen",compact.matches)}
 syncHeight();compact.addEventListener?.("change",syncHeight);
 root.classList.add("presentation-fit");
})();