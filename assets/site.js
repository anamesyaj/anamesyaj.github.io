/* Phase 1 contact: real native POST with reCAPTCHA at FormSubmit.
   Never simulate email delivery. Keep no-JS native form and email fallback. */
(()=>{
 const form=document.getElementById("contact-form");
 const status=document.getElementById("form-status");
 const dest="markjay.lisay@gmail.com";
 if(!form||!status)return;
 const service=document.getElementById("contact-service");
 const setService=value=>{const match=[...(service?.options||[])].find(o=>o.value===value);if(match)service.value=match.value};
 document.querySelectorAll("[data-service],[data-inquiry-intent]").forEach(link=>link.addEventListener("click",()=>{
  if(link.dataset.service)setService(link.dataset.service);
  else if(link.dataset.inquiryIntent==="call")setService("15-minute introductory call");
  else if(link.dataset.inquiryIntent==="project"&&!service.value)setService("Not sure yet");
  // A service CTA should reveal the project brief on phones instead of
  // requiring the visitor to discover an extra hidden accordion.
  if(window.matchMedia("(max-width:760px)").matches){
   const detail=document.querySelector("#contact .fit-contact-more");
   if(detail)detail.open=true;
  }
 }));
 const v=id=>document.getElementById(id)?.value.trim()||"";
 form.addEventListener("submit",event=>{
  if(!form.reportValidity()){event.preventDefault();return}
  if(v("contact-honey")){event.preventDefault();status.textContent="Please use the direct email link instead.";return}
  if(v("contact-message").length<25){event.preventDefault();status.textContent="Please describe the requested project in a few sentences.";return}
  status.textContent="Opening the form service. Please finish any security prompts. Your message is not submitted until the provider confirms it.";
 });
 const prepare=()=>["Name: "+v("contact-name"),"Email: "+v("contact-email"),"Topic: "+(service?.value||"Not selected"),"Timeframe: "+(v("contact-timeline")||"Not decided"),"Business/project: "+(v("contact-company")||"Not provided"),"",v("contact-message")].join("\n").trim();
 const copy=async text=>{
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}}catch(_){}
  const field=document.createElement("textarea");field.value=text;field.readOnly=true;field.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";document.body.append(field);field.select();let okay=false;try{okay=document.execCommand("copy")}catch(_){}field.remove();return okay;
 };
 document.getElementById("copy-email")?.addEventListener("click",async event=>{
  const okay=await copy(dest);status.textContent=okay?"Email address copied.":"Select and copy the email address above.";if(okay)event.currentTarget.textContent="Email copied ✓";
 });
 document.getElementById("copy-message")?.addEventListener("click",async event=>{
  if(!v("contact-message")){status.textContent="Write a brief first, then copy it.";document.getElementById("contact-message")?.focus();return}
  const okay=await copy(prepare());status.textContent=okay?"Brief copied. Paste it in an email to "+dest+".":"Copy your brief and email it to "+dest+".";if(okay)event.currentTarget.textContent="Brief copied ✓";
 });
 const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();
})();