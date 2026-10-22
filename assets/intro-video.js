(()=>{
  'use strict';
  const video=document.getElementById('intro-video');
  if(!video)return;
  const buttons=[...document.querySelectorAll('[data-intro-seek]')];
  const playButton=document.getElementById('intro-play-sound');
  const visitKey='mj-intro-played-v1';
  const seen=()=>{try{return localStorage.getItem(visitKey)==='1'}catch{return false}};
  const markSeen=()=>{try{localStorage.setItem(visitKey,'1')}catch{}};
  const showPrompt=()=>{if(playButton)playButton.hidden=false};
  const hidePrompt=()=>{if(playButton)playButton.hidden=true};
  for(const track of video.textTracks)track.mode='disabled';
  video.muted=false;
  video.loop=true;
  video.addEventListener('contextmenu',event=>event.preventDefault());
  video.addEventListener('play',()=>{markSeen();hidePrompt()});
  playButton?.addEventListener('click',()=>{video.muted=false;video.play().then(()=>{markSeen();hidePrompt()}).catch(showPrompt)});
  buttons.forEach(button=>button.addEventListener('click',()=>{video.currentTime=Number(button.dataset.introSeek);video.muted=false;video.play().then(markSeen).catch(showPrompt);video.scrollIntoView({block:'center',behavior:'smooth'})}));
  video.addEventListener('timeupdate',()=>{let active=buttons[0];for(const button of buttons)if(video.currentTime>=Number(button.dataset.introSeek))active=button;buttons.forEach(button=>button.setAttribute('aria-current',String(button===active)))});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
  if(!seen()){
    const start=()=>{video.muted=false;video.play().then(markSeen).catch(showPrompt)};
    if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
  }
})();
