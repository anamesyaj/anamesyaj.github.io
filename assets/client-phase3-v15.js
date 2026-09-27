/* One-minute PERSONAL INTRODUCTION. Never pretend the missing owner's clip
   exists, never auto-mute it. Audible autoplay can be blocked by browsers.
   Upload assets/introduction-mark-jay-60s.mp4 to activate. */
(()=>{
"use strict";
const panel=document.getElementById("personal-introduction"),video=document.getElementById("phase3-introduction-video");if(!panel||!video)return;
const play=document.getElementById("phase3-intro-play"),replay=document.getElementById("phase3-intro-replay"),status=document.getElementById("phase3-intro-status"),copy=document.getElementById("phase3-intro-copy"),label=document.getElementById("phase3-intro-label"),sound=document.getElementById("phase3-intro-sound");
let available=false,attempted=false;
const source="assets/introduction-mark-jay-60s.mp4";
const unmute=()=>{video.defaultMuted=false;video.muted=false;video.volume=1};
const visible=()=>{const r=panel.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight&&!document.hidden};
const display=(state,message)=>{panel.dataset.introState=state;status.textContent=message};
async function start(){
 if(!available)return;
 unmute();
 try{
  const p=video.play();if(p&&typeof p.then==="function")await p;
  display("playing","Playing Mark Jay's one-minute personal introduction with sound.");
  play.hidden=true;sound.hidden=false;replay.hidden=true;
 }catch(error){
  video.pause();sound.hidden=true;
  if(error?.name==="NotAllowedError"){
   display("blocked","This browser blocked automatic sound. Tap Play introduction WITH SOUND to hear the recording.");
   copy.textContent="Your browser requires one tap before playing sound.";
   play.textContent="▶ Play introduction WITH SOUND";
  }else{
   display("error","The recording could not be played. The rest of my portfolio remains available.");
   copy.textContent="The recording could not play in this browser.";
   play.textContent="↻ Try with sound";
  }
  label.textContent="PERSONAL INTRODUCTION · 01:00";play.hidden=false;
 }
}
const attempt=()=>{if(!available||attempted||!visible())return;attempted=true;void start()};
const observer=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))attempt()},{threshold:[0,.3,.6]}):null;
observer?.observe(panel);
document.addEventListener("visibilitychange",()=>{if(document.hidden&&!video.paused)video.pause();else if(!document.hidden)attempt()});
video.addEventListener("ended",()=>{display("ended","Introduction complete. Replay with sound or explore the portfolio.");sound.hidden=true;replay.hidden=false;copy.textContent="Replay my one-minute personal introduction.";play.textContent="↺ Replay with sound";play.hidden=false});
video.addEventListener("error",()=>{if(!available)return;display("error","The recording could not be loaded.");sound.hidden=true;copy.textContent="This recording is unavailable right now.";play.textContent="↻ Retry";play.hidden=false});
video.addEventListener("volumechange",()=>{sound.hidden=video.muted||video.volume===0||video.paused});
play.addEventListener("click",()=>{if(!available)return;if(video.ended)video.currentTime=0;attempted=true;unmute();void start()});
replay.addEventListener("click",()=>{if(!available)return;video.currentTime=0;unmute();void start()});
(async()=>{
 try{
  // Checking HEAD prevents a broken video control and downloading fake video.
  const response=await fetch(source,{method:"HEAD",cache:"no-store"});
  const type=response.headers.get("content-type")||"";
  if(!response.ok||(!type.startsWith("video/")&&!type.includes("octet-stream")))return;
  available=true;video.src=source;video.controls=true;video.preload="metadata";unmute();
  display("ready","One-minute personal introduction. Sound is enabled; browsers may require one tap.");
  label.textContent="MY PERSONAL INTRODUCTION · 01:00";copy.textContent="A one-minute introduction recorded by me.";
  attempt();
  if(!observer)window.addEventListener("scroll",attempt,{passive:true,once:true});
 }catch(_){/* Local previews and missing recordings keep the honest placeholder. */}
})();
})();
