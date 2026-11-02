// Проверка качества картинок: измеряет, не растянута ли каждая картинка относительно реального размера
// на экранах 1440 px @2× и 390 px @3× (учитывая object-fit: cover). node tools/qa-images.cjs [url]
const { chromium } = require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
const url=process.argv[2]||'http://localhost:8890/';
for(const [w,dpr] of [[1440,2],[390,3]]){
const ctx=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:dpr});const p=await ctx.newPage();
await p.goto(url,{waitUntil:'networkidle'});
await p.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p.waitForTimeout(1500);
const rows=await p.evaluate(async(dpr)=>{const seen={};const list=[...document.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth&&i.getBoundingClientRect().width>20);const real=await Promise.all(list.map(i=>new Promise(r=>{const m=new Image();m.onload=()=>r([m.naturalWidth,m.naturalHeight]);m.onerror=()=>r([i.naturalWidth,i.naturalHeight]);m.src=i.currentSrc||i.src})));return list.map((i,k)=>{i.__nw=real[k][0];i.__nh=real[k][1];return i}).map(i=>{const r=i.getBoundingClientRect();const cs=getComputedStyle(i);const fit=cs.objectFit==='cover';
 // сколько пикселей источника приходится на пиксель экрана с учётом object-fit:cover
 const sx=r.width*dpr/i.__nw, sy=r.height*dpr/i.__nh; const need=fit?Math.max(sx,sy):sx;
 return {f:(i.currentSrc||i.src).split('/').pop(),nat:i.__nw+'x'+i.__nh,box:Math.round(r.width)+'x'+Math.round(r.height),up:+need.toFixed(2)}}).filter(o=>{const k=o.f;if(seen[k])return false;seen[k]=1;return true}).sort((a,b)=>b.up-a.up)},dpr);
console.log('== width',w,'dpr',dpr,'(up>1 = растянуто)');rows.filter(r=>r.up>1.05).forEach(r=>console.log(JSON.stringify(r)));
await ctx.close();}
await b.close();})();
