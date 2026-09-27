/* Guided evidence review; static published preview assets, not simulated apps. */
(()=>{
"use strict";const root=document.getElementById("phase2-walkthrough");if(!root)return;
const data={
 aspirva:{image:"assets/projects/aspirva-showcase-hd.webp",alt:"Existing Aspirva web preview, not a released Windows app",caption:"Existing web showcase; the audited Windows product remains pre-release.",status:"ASPIRVA · PRE-RELEASE",steps:[
 ["The Career Scout to Aspirva transition","The project evolves an existing Windows career app while preserving compatibility-sensitive package identity, storage, licensing and update behavior."],
 ["Product requirements and AI-assisted delivery","My documented role is product owner and AI-assisted builder. I coordinated brand migration, system-theme support, evidence-grounding repairs and release-readiness checks, reviewing implementations and tests."],
 ["Dated test checkpoint and unfinished work","The documented Windows development build has 310 automated tests passing and a proven runtime launch. Desktop layout/accessibility fixes and final MSIX/Microsoft Store certification remain release-stage tasks. This image is an existing web preview, not Windows-app footage."]
 ]},
 gold:{image:"assets/projects/gold-ops-os-showcase-hd.webp",alt:"Existing Gold Ops OS private-alpha interface preview, not evidence of live trading",caption:"Private-alpha preview; not an autonomous live trading bot.",status:"GOLD OPS OS · PRIVATE ALPHA",steps:[
 ["Governed operations rather than autonomous trading","A private-alpha XAUUSD trading-operations project with governed AI-agent roles, traceable decisions and explicit human authorization."],
 ["Requirements and safety boundaries","I defined agent missions, acceptance criteria, review gates and human authorization, coordinating frontend, authentication, Supabase/PostgreSQL, Vercel and broker-secret custody."],
 ["Dated foundation checkpoint and safety limits","The documented OAuth-foundation checkpoint has 836/836 Vitest tests passing across 62 files, 782 database tests, TypeScript/build passing and a successful post-merge deployment. Real broker OAuth, credentials and execution remain behind safety gates."]
 ]},
 studio:{image:"assets/projects/puddleloom-studio-showcase-hd.webp",alt:"Existing Studio web PWA preview, not a recording of the separate local FFmpeg TypeScript workflow",caption:"Active-development web PWA preview; not the local workflow's exact interface.",status:"PUDDLELOOM STUDIO · ACTIVE DEVELOPMENT",steps:[
 ["Reducing repetitive media production","The résumé documents a portable local FFmpeg/TypeScript direction for rendering, workflow orchestration and creator-production automation, designed zero-cost-first."],
 ["Boundaries, diagnostics and portability","My work covers provider boundaries, diagnostics, portable execution and keeping local assets and generated outputs outside source control. A related creator web PWA is in active development."],
 ["Project stage and visual limits","The existing preview illustrates the in-development creator web workspace. It is not a screenshot of the separate local FFmpeg/TypeScript interface, a production-readiness guarantee or a paid client deployment."]
 ]}};
const image=root.querySelector("#phase2-demo-image"),cap=root.querySelector("#phase2-demo-caption"),link=root.querySelector("#phase2-demo-image-link"),status=root.querySelector("#phase2-demo-status"),heading=root.querySelector("#phase2-demo-heading"),copy=root.querySelector("#phase2-demo-copy"),next=root.querySelector("#phase2-demo-next"),projects=[...root.querySelectorAll("[data-phase2-project]")],steps=[...root.querySelectorAll("[data-phase2-step]")];let selected="aspirva",step=0;
function paint(){const item=data[selected];image.src=item.image;image.alt=item.alt;link.href=item.image;cap.textContent=item.caption;status.textContent=item.status;heading.textContent=item.steps[step][0];copy.textContent=item.steps[step][1];projects.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.phase2Project===selected)));steps.forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.phase2Step)===step)));next.textContent=step===2?"Restart walkthrough ↺":step===0?"Next: My role →":"Next: Evidence →"}
projects.forEach(b=>b.addEventListener("click",()=>{if(!data[b.dataset.phase2Project])return;selected=b.dataset.phase2Project;step=0;paint()}));steps.forEach(b=>b.addEventListener("click",()=>{step=Math.min(2,Math.max(0,Number(b.dataset.phase2Step)||0));paint()}));next.addEventListener("click",()=>{step=(step+1)%3;paint()});paint();
})();
