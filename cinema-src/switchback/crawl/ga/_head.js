var DUR=__DUR__;
__WORLD__
var EP=(function(){
/* ===== Under the Pond, Floor Three: Weight Limit (the earlier floors' scenes plus the bridge, the Turnbats and Gate A) ===== */
var SB=window.SwitchbackWorld({c:c,W:W,H:H,GY:GY,INK:INK,GOLD:GOLD,CH:CH,NAMES:NAMES,clamp:clamp,lerp:lerp,ease:ease,rnd:rnd,rr:rr,circ:circ,ell:ell,txt:txt,burst:burst,
  gridMap:gridMap,drawPlane:drawPlane,slopeTri:slopeTri,glowDot:glowDot,tag:tag,panel:panel});
NAMES.voice=['THE VOICE','#9BDCFF']; NAMES.pigeon=['DOUG','#C8C8C8'];
var EG=gridMap(86,52,620,440,[0,12],[-4,12]);   // the Rails: posts across, height up
function at(p){ return [EG.x(p[0]),EG.y(p[1])]; }
var SG=gridMap(86,110,620,400,[0,8],[-4,1]);   // the stairs
function fxQ(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=F.p-(f.at||0); }); return r; }
function fxOf(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=f; }); return r; }
function on(q){ return q!=null&&q>=0; }
function grown(F,key){ return F.pv[key]&&JSON.stringify(F.pv[key])===JSON.stringify(F.st[key])&&!F.b.scene?1:F.p/0.35; }
function liftAt(F){ var f=fxOf(F,'lift'), q=fxQ(F,'lift'); if(!f) return F.st.lift; if(q<0) return f.from; var u=clamp(q/(f.dur||1.4)); return lerp(f.from,f.to,f.ok===false?u*u:ease(u)); }
function glove(x,y,rot){ c.save(); c.translate(x,y); c.rotate(rot||0); c.strokeStyle=INK; c.lineWidth=3; c.lineJoin='round'; c.fillStyle='#3A2A22'; rr(-26,18,52,60,6); c.fillStyle='#5A4030'; rr(-22,-22,44,46,12); rr(-36,-6,18,28,8);
  c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=2; for(var i=-1;i<=1;i++){ c.beginPath(); c.moveTo(i*11,-18); c.lineTo(i*11,2); c.stroke(); } c.restore(); }
function lever(x,y,k){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#3B4458'; rr(x-26,y-10,52,90,6); c.save(); c.translate(x,y+50); c.rotate(lerp(-0.7,0.7,k)); c.fillStyle='#C9C9C9'; rr(-5,-86,10,86,4); c.fillStyle='#C0392B'; circ(0,-90,13); c.restore(); c.restore(); }
/* ---------- draft 6: the clock, the loose goats and the monsters, drawn over any scene ---------- */
function prog(F){ return clamp(F.p/Math.max(0.01,F.b.d)); }
function tw(F,v,w){ if(F.b.scene||w==null||v==null) return v; return lerp(w,v,ease(prog(F))); }
function shake(F,amt){ var k=Math.floor(F.t*30); c.translate((rnd(k)-.5)*amt,(rnd(k+9)-.5)*amt); }
var AC=null, lastT=0, fired={}, lastSec=null;
function live(){ return typeof playing!=='undefined'&&playing&&typeof soundOn!=='undefined'&&soundOn; }
function snd(kind,hi){ if(!live()) return; try{
  if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume();
  var t0=AC.currentTime, g=AC.createGain(); g.connect(AC.destination);
  if(kind==='tick'){ var o=AC.createOscillator(); o.type='square'; o.frequency.value=hi?2200:1500; o.connect(g); g.gain.setValueAtTime(hi?0.09:0.05,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.05); o.start(t0); o.stop(t0+0.06); }
  else if(kind==='thud'){ var o2=AC.createOscillator(); o2.type='sine'; o2.frequency.setValueAtTime(hi?60:110,t0); o2.frequency.exponentialRampToValueAtTime(35,t0+0.35); o2.connect(g); g.gain.setValueAtTime(hi?0.7:0.35,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.45); o2.start(t0); o2.stop(t0+0.5); }
  else if(kind==='screech'){ var o3=AC.createOscillator(); o3.type='sawtooth'; o3.frequency.setValueAtTime(900,t0); o3.frequency.exponentialRampToValueAtTime(240,t0+0.6); o3.connect(g); g.gain.setValueAtTime(0.06,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.7); o3.start(t0); o3.stop(t0+0.75); }
} catch(e){} }
function once(F,name,q,kind,hi){ if(F.t<lastT-0.2) fired={}; var k=F.b.start+':'+name; if(on(q)&&q<0.25&&!fired[k]){ fired[k]=1; snd(kind,hi); } }
function clockVal(F){ var ck=F.st.clock; if(!ck) return null; var i=EP.BEATS.indexOf(F.b), nb=EP.BEATS[i+1], v=ck[1];
  if(!ck[2]&&nb&&nb.state&&nb.state.clock&&nb.state.clock[0]===ck[0]) v=lerp(ck[1],nb.state.clock[1],prog(F)); return v; }
function hud(F){ var st=F.st, v=clockVal(F);
  if(v!=null){ var s=Math.max(0,Math.ceil(v-0.001)), hot=s<=5, pulse=hot?0.5+0.5*Math.abs(Math.sin(F.t*Math.PI*2)):0, cx=st.clockAt?st.clockAt[0]:480, cy=st.clockAt?st.clockAt[1]:52;
    c.save(); c.translate(cx,cy); c.scale(0.82+pulse*0.05,0.82+pulse*0.05); c.fillStyle='rgba(10,8,14,.9)'; c.strokeStyle=hot?'#FF4B3E':'#FFD23F'; c.lineWidth=3; rr(-112,-46,224,92,12);
    txt(st.clock[0],0,-24,'600 15px "IBM Plex Mono",monospace',hot?'#FF8C80':'#FFE9A8');
    c.save(); if(hot){ c.shadowColor='#FF2A1A'; c.shadowBlur=18*pulse; } txt('0:'+String(s).padStart(2,'0'),0,16,'50px "Luckiest Guy",sans-serif',hot?'#FF4B3E':'#FFFFFF'); c.restore(); c.restore();
    if(s!==lastSec&&lastSec!=null&&!st.clock[2]) snd('tick',hot); lastSec=s; } else lastSec=null;
  if(st.loose){ c.save(); c.fillStyle='rgba(10,8,14,.85)'; c.strokeStyle='#FF4B3E'; c.lineWidth=3; rr(10,6,176,34,8); SB.goatFace(32,24,0.3); txt('GOATS LOOSE: '+st.loose,110,24,'17px "Luckiest Guy",sans-serif','#FF8C80'); c.restore(); }
  if(st.freeze){ var fq=F.p; c.save(); c.fillStyle='rgba(30,26,40,.38)'; c.fillRect(0,0,W,H); if(fq<0.15){ c.fillStyle='rgba(255,255,255,'+(0.7*(1-fq/0.15))+')'; c.fillRect(0,0,W,H); }
    c.strokeStyle='#FFFFFF'; c.lineWidth=6; [[30,30,1,1],[930,30,-1,1],[30,510,1,-1],[930,510,-1,-1]].forEach(function(k){ c.beginPath(); c.moveTo(k[0],k[1]+k[3]*50); c.lineTo(k[0],k[1]); c.lineTo(k[0]+k[2]*50,k[1]); c.stroke(); }); c.restore(); }
  lastT=F.t; }
// a loose goat: red eyes, a scowl, and it keeps turning up behind them
function madGoat(x,y,f,T,s,i,run){ var bob=run?-Math.abs(Math.sin(T*14+i*1.7))*14*s:0; SB.goat(x,y+bob,f,T+i,{sc:s,badge:false,col:'#E6DDC8',chew:!run});
  var ex=x+f*s*44, ey=y+bob+s*(-78); c.save(); c.fillStyle='#FF2A1A'; c.shadowColor='#FF2A1A'; c.shadowBlur=14; ell(ex,ey,6*s,4.5*s,true,false); c.restore();
  c.save(); c.strokeStyle=INK; c.lineWidth=3*s; c.beginPath(); c.moveTo(ex-8*s*f,ey-10*s); c.lineTo(ex+6*s*f,ey-5*s); c.stroke(); c.restore(); }
// a spitting llama: the toll-keeper on flat ground, with a cap and a staff badge
function llama(x,y,f,T,s,spitting){ c.save(); c.translate(x,y); c.scale(f*s,s); c.strokeStyle=INK; c.lineWidth=2.6/s*s; c.lineJoin='round'; c.lineCap='round'; var bob=Math.sin(T*2.4)*2;
  c.fillStyle='#EAD9B8'; [-34,-14,16,34].forEach(function(lx){ rr(lx-6,-46,12,46,4); }); c.fillStyle=INK; [-34,-14,16,34].forEach(function(lx){ rr(lx-7,-6,14,7,2); });
  c.fillStyle='#F3E6CC'; ell(0,-66+bob,52,30); for(var k=0;k<7;k++){ circ(-44+k*14,-90+bob+(k%2)*4,9); } c.beginPath(); c.moveTo(-50,-70+bob); c.quadraticCurveTo(-66,-80,-60,-58+bob); c.fill(); c.stroke();
  c.save(); c.translate(36,-80+bob); c.rotate(spitting?-0.25:Math.sin(T*1.6)*0.05); c.fillStyle='#F3E6CC'; rr(-12,-96,26,100,12); for(var n=0;n<5;n++) circ(-10,-80+n*18,7);
  c.translate(8,-100); c.fillStyle='#F3E6CC'; ell(8,6,26,18); c.beginPath(); c.moveTo(-6,-8); c.lineTo(-12,-34); c.lineTo(2,-12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(10,-10); c.lineTo(10,-36); c.lineTo(20,-10); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=INK; circ(10,0,3.2,true,false); c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(3,-8); c.lineTo(16,-5); c.stroke();
  c.fillStyle='#E7B7B0'; ell(30,10,6,5); if(spitting){ c.fillStyle=INK; ell(28,16,5,4,true,false); } else { c.beginPath(); c.moveTo(20,16); c.lineTo(32,15); c.stroke(); }
  c.fillStyle='#2E6DA4'; c.beginPath(); c.moveTo(-14,-14); c.quadraticCurveTo(6,-30,26,-12); c.closePath(); c.fill(); c.stroke(); rr(18,-16,18,5,2);
  c.restore();
  c.fillStyle='#FFFFFF'; c.lineWidth=2; rr(24,-74+bob,20,14,2); c.fillStyle='#2E6DA4'; c.fillRect(26,-72+bob,16,3);
  c.restore(); }
// a Flipper: a goblin the size of a cat that pries the minus signs off things and keeps them in a sack
function flipper(x,y,f,T,run,carry){ c.save(); c.translate(x,y-(run?Math.abs(Math.sin(T*16))*10:0)); c.scale(f,1); c.strokeStyle=INK; c.lineWidth=2.4; c.lineJoin='round';
  var lg=run?Math.sin(T*16)*8:0; c.fillStyle='#4E7A3A'; rr(-12+lg,-18,8,18,3); rr(4-lg,-18,8,18,3);
  c.fillStyle='#7A5A3A'; c.beginPath(); c.moveTo(-24,-44); c.quadraticCurveTo(-46,-26,-30,-10); c.lineTo(-12,-14); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#8BC34A'; ell(0,-32,16,18); c.fillStyle='#8BC34A'; circ(0,-62,18); c.beginPath(); c.moveTo(-14,-66); c.lineTo(-36,-80); c.lineTo(-12,-58); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(14,-66); c.lineTo(36,-80); c.lineTo(12,-58); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFE14D'; ell(-6,-66,5,6); ell(8,-66,5,6); c.fillStyle=INK; circ(-5,-65,2.2,true,false); circ(9,-65,2.2,true,false);
  c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.arc(2,-56,8,0.2,Math.PI-0.2); c.stroke(); c.fillStyle='#FFFFFF'; c.fillRect(-2,-50,3,4); c.fillRect(4,-50,3,4);
  if(carry){ c.save(); c.translate(16,-40); c.rotate(-0.2); c.fillStyle='#FF4B3E'; c.strokeStyle=INK; c.lineWidth=2.5; rr(-4,-8,40,14,4); c.restore(); }
  c.restore(); }
// the Swapper: shadow, claws and two lamp eyes; it never fully comes into the light
function swapper(x,y,s,T,al,o){ o=o||{}; c.save(); c.globalAlpha=al; c.translate(x,y); c.scale(s,s); c.fillStyle='#030207';
  c.beginPath(); c.moveTo(-150,120); c.quadraticCurveTo(-170,-70,-70,-130); c.lineTo(-110,-230); c.lineTo(-36,-150); c.quadraticCurveTo(0,-168,36,-150); c.lineTo(110,-230); c.lineTo(70,-130); c.quadraticCurveTo(170,-70,150,120); c.closePath(); c.fill();
  var reach=o.reach||0; c.save(); c.translate(-150-reach*120,-10); for(var k=0;k<3;k++){ c.beginPath(); c.moveTo(20,-30+k*22); c.lineTo(-50-k*6,-50+k*30); c.lineTo(14,-18+k*22); c.closePath(); c.fill(); } c.restore();
  if(!o.noEyes){ var bl=((T+0.4)%3.2)<0.12; c.fillStyle='#FFD23F'; c.shadowColor='#FFD23F'; c.shadowBlur=26; if(!bl){ c.beginPath(); c.ellipse(-42,-80,18,8,0.25,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(42,-80,18,8,-0.25,0,Math.PI*2); c.fill(); } }
  c.restore(); }
function spitFx(F){ var q=fxQ(F,'spit'), st=F.st; if(!on(q)||!st.llama) return; var L=st.llama, m=st.cast.marcus, tx=m?m[0]:700, ty=GY-160+(m&&m[2]&&m[2].dy||0);
  var sx=L[0]+L[1]*L[2]*80, sy=L[3]-L[2]*190, u=clamp(q/0.45); if(u<1){ c.save(); c.fillStyle='#CDE8A0'; c.strokeStyle=INK; c.lineWidth=2; circ(lerp(sx,tx,u),lerp(sy,ty,u)-Math.sin(u*Math.PI)*60,9); c.restore(); }
  if(q>0.4&&q<1.3){ burst(tx,ty-40,'PTOO!',0.5,'#CDE8A0'); c.save(); c.fillStyle='rgba(205,232,160,.85)'; ell(tx+6,ty+10,22,12,true,false); c.restore(); } once(F,'spit',q-0.4,'thud',0); }
function overlay(F){ var st=F.st, T=F.T;
  if(st.dark){ c.save(); c.fillStyle='rgba(2,3,8,'+st.dark+')'; c.fillRect(0,0,W,H); c.restore(); }
  if(st.swapper){ var S=st.swapper, P=F.pv.swapper, sx=P&&!F.b.scene?tw(F,S[0],P[0]):S[0], sa=P&&!F.b.scene?tw(F,S[3],P[3]):S[3]; swapper(sx,S[1],S[2],T,sa,{reach:S[4]?Math.abs(Math.sin(F.t*3)):0});
    var rq=fxQ(F,'roar'); once(F,'roar',rq,'screech'); if(on(rq)&&rq<1.0) burst(sx,S[1]-260*S[2],'SKREEE!',0.6,'#FFD23F'); }
  if(st.stalker){ var g=st.stalker, pg=F.pv.stalker, gx=pg&&!F.b.scene?tw(F,g[0],pg[0]):g[0]; madGoat(gx,g[2]||GY,g[1],T,g[3]||0.8,3,pg&&pg[0]!==g[0]&&prog(F)<1); }
  if(st.llama){ var L=st.llama; llama(L[0],L[3],L[1],T,L[2],on(fxQ(F,'spit'))&&fxQ(F,'spit')<0.5); spitFx(F); }
  if(st.flipper){ var fl=st.flipper, pf=F.pv.flipper, moving=pf&&!F.b.scene&&(pf[0]!==fl[0]||pf[1]!==fl[1])&&prog(F)<1, fx=pf&&!F.b.scene?tw(F,fl[0],pf[0]):fl[0], fy=pf&&!F.b.scene?tw(F,fl[1],pf[1]):fl[1];
    flipper(fx,fy,fl[2],T,moving,fl[3]); var gq=fxQ(F,'snatch'); if(on(gq)&&gq<0.9) burst(fx,fy-110,'YOINK',0.45,'#8BC34A'); }
  if(st.winch!=null){ c.save(); c.translate(st.winchAt?st.winchAt[0]:380,st.winchAt?st.winchAt[1]:296); c.fillStyle='#232A3D'; c.strokeStyle=INK; c.lineWidth=3; rr(-80,-36,160,72,10); txt('WINCH',0,-18,'600 13px "IBM Plex Mono",monospace','#9BDCFF');
    txt(String(st.winch),0,14,'38px "Luckiest Guy",sans-serif',/^-|^−/.test(String(st.winch))?'#FF8C80':'#FFFFFF'); c.restore(); }
  if(st.rust&&st.cast.marcus){ var m=st.cast.marcus, mx=m[0], my=GY+(m[2]&&m[2].dy||0), lv=st.rust; c.save(); c.globalAlpha=0.85; c.fillStyle='#B5562A'; for(var r=0;r<14;r++){ var side=r%2?1:-1, hy=rnd(r)*lv*60; ell(mx+side*13+(rnd(r+3)-.5)*12,my-4-hy,5+rnd(r+5)*4,4,true,false); } c.restore();
    if(st.mites){ for(var i=0;i<6;i++){ var a=(F.t*0.6+rnd(i))%1; c.fillStyle='#7A3A1A'; circ(mx-60+a*50+i*4,my-2-Math.abs(Math.sin(F.t*12+i))*3,3,true,false); } } }
  if(st.eyesDark){ var E=st.eyesDark, bl2=((T+0.7)%2.6)<0.12; if(!bl2){ c.save(); c.fillStyle='#FFD23F'; c.shadowColor='#FFD23F'; c.shadowBlur=26; c.beginPath(); c.ellipse(E[0]-34,E[1],16,7,0.25,0,Math.PI*2); c.fill(); c.beginPath(); c.ellipse(E[0]+34,E[1],16,7,-0.25,0,Math.PI*2); c.fill(); c.restore(); } }
  var gq2=fxQ(F,'growl'); once(F,'growl',gq2,'screech'); if(on(gq2)&&gq2<1.0&&st.eyesDark) burst(st.eyesDark[0],st.eyesDark[1]-90,'GRRRR',0.55,'#FFD23F');
  var dq=fxQ(F,'drop'); once(F,'drop',dq,'thud',1); if(on(dq)&&dq<1.0){ burst(170,420,'CRASH!',0.6,'#FF8C80'); }
  if(st.flash){ var fq=F.p; if(fq<0.25){ c.fillStyle='rgba(255,255,255,'+(0.6*(1-fq/0.25))+')'; c.fillRect(0,0,W,H); } }
  hud(F); }