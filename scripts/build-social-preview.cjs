/* Render a 1200×630 branded preview using the portfolio owner's
   public GitHub portrait, not generated or substituted likeness. */
const {chromium}=require("playwright");
const fs=require("node:fs/promises");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  const html=[
   '<!doctype html><html><head><meta charset="utf-8"><style>',
   '*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}',
   'body{font-family:Arial,Helvetica,sans-serif;color:#f7fafc;background:radial-gradient(ellipse at 82% 23%,#2b5367 0,#112d3a 38%,#081620 74%)}',
   '.grid{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 100px,#d6aa6413 101px 102px,transparent 103px 202px)}',
   '.frame{position:absolute;inset:46px 50px;border:1px solid #efc98265;border-radius:24px;box-shadow:inset 0 0 80px #00000019}',
   '.accent{position:absolute;left:79px;top:78px;width:95px;height:5px;border-radius:3px;background:#e9c680}',
   '.eyebrow{position:absolute;left:80px;top:110px;color:#efca90;font-size:17px;font-weight:800;letter-spacing:3px}',
   'h1{position:absolute;left:76px;top:171px;margin:0;font-size:78px;line-height:1.03;letter-spacing:-3.4px}',
   'h1 span{color:#edc988}.role{position:absolute;top:355px;left:82px;font-size:29px;line-height:1.3;font-weight:750}',
   '.proof{position:absolute;left:82px;top:455px;color:#d0e1eb;font-size:18px;line-height:1.5}',
   '.photo{position:absolute;right:105px;top:142px;width:260px;height:315px;overflow:hidden;background:#122633;border:3px solid #e4bb76;border-radius:25px;box-shadow:0 25px 56px #00000099}',
   '.photo img{width:100%;height:100%;object-fit:cover;object-position:center}',
   '.domain{position:absolute;left:82px;bottom:76px;color:#efca90;font-size:22px;font-weight:750;letter-spacing:.35px}',
   '.ring{position:absolute;right:111px;bottom:82px;border:1px solid #efca90bb;width:19px;height:19px;border-radius:50%}',
   '</style></head><body><div class="grid"></div><div class="frame"></div><div class="accent"></div>',
   '<div class="eyebrow">PORTFOLIO · AUTOMATION · QA</div>',
   '<h1>MARK JAY<br><span>LISAY</span></h1>',
   '<div class="role">AI Workflow &amp;<br>Product Operations</div>',
   '<div class="proof">Documented operations results · Human-reviewed automation<br>Independent product case studies</div>',
   '<div class="photo"><img id="portrait" src="https://avatars.githubusercontent.com/u/305338593?v=4&amp;size=600" alt="Mark Jay Lisay public profile photograph"></div>',
   '<div class="domain">anamesyaj.github.io</div><div class="ring"></div></body></html>'
  ].join("");
  await page.setContent(html,{waitUntil:"load",timeout:35000});
  await page.waitForFunction(()=>{
   const im=document.getElementById("portrait");return im&&im.complete&&im.naturalWidth>=300;
  },{timeout:25000});
  await fs.mkdir("qa-visual-audit",{recursive:true});
  const output="qa-visual-audit/portfolio-social-preview.jpg";
  const bytes=await page.screenshot({path:output,type:"jpeg",quality:77});
  if(process.env.EXPORT_OG_BASE64==="1"){
   const b64=bytes.toString("base64");
   for(let i=0,n=0;i<b64.length;i+=12000,n++){
    console.log("OG_CARD_BASE64_CHUNK:"+String(n).padStart(4,"0")+":"+b64.slice(i,i+12000));
   }
  }
  console.log("SOCIAL CARD OK 1200x630 bytes="+bytes.length);
 }finally{await browser.close()}
})().catch(err=>{console.error("SOCIAL CARD ERROR",err);process.exitCode=1});
