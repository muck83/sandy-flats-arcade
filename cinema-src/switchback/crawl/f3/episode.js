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
// the numbers that go with the Rails: the old cart on its siding, the door, the lever on the far wall
function railsExtras(F,pts){ var st=F.st, T=F.T;
  if(st.rusted||fxOf(F,'rebuild')){ var r=at([6,8]); c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=3; c.beginPath(); c.moveTo(r[0]-46,r[1]-34); c.lineTo(r[0]+46,r[1]-34); c.stroke(); c.restore(); SB.cart(r[0],r[1]-30,T,0,0.8,{rust:true});
    c.save(); c.translate(r[0]+4,r[1]-64); c.scale(0.34,0.34); c.strokeStyle=INK; c.lineWidth=6; c.fillStyle='#A8372C'; c.beginPath(); c.arc(0,0,49,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.restore();
    c.save(); c.strokeStyle=INK; c.lineWidth=2.5; c.fillStyle='#1E1A2A'; rr(r[0]-74,r[1]-128,148,34,6); txt('INCIDENTS: 3 OF 3',r[0],r[1]-110,'600 14px "IBM Plex Mono",monospace','#FF7A6B'); c.restore(); }
  var last=pts[pts.length-1]; if(last&&last[2]==='DOOR'){ var d=at(last); c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#FFE58A'; c.shadowColor='#FFE58A'; c.shadowBlur=16; rr(d[0]+10,d[1]-40,30,42,4); c.restore(); } }
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
/* ---------- Floor Two: the station, its unmapped tunnel, and the Burrower ---------- */
var G2=gridMap(86,52,620,440,[0,10],[0,24]);   // posts 0 to 10, height 0 to 24
function at2(p){ return [G2.x(p[0]),G2.y(p[1])]; }
// the Burrower: a mole-worm the size of a lorry that lives in the unmapped stretch before the first row
function burrower(x,y,s,T,open,al){ c.save(); c.globalAlpha=al==null?1:al; c.translate(x,y); c.scale(s,s); c.strokeStyle=INK; c.lineWidth=4;
  for(var k=5;k>=1;k--){ c.fillStyle=k%2?'#4A3A44':'#5A4652'; ell(-k*70,10+Math.sin(T*3+k)*8,74,70); }
  c.fillStyle='#6B5560'; ell(0,0,96,88); c.fillStyle='#2A1418'; var m=open==null?0.5:open; ell(28,8,58*m+10,50*m+8);
  c.fillStyle='#F2EEE6'; for(var t=0;t<14;t++){ var a=t/14*Math.PI*2, rx=(58*m+10), ry=(50*m+8); c.save(); c.translate(28+Math.cos(a)*rx,8+Math.sin(a)*ry); c.rotate(a+Math.PI/2); c.beginPath(); c.moveTo(-7,0); c.lineTo(0,16); c.lineTo(7,0); c.closePath(); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle='#FF2A1A'; c.shadowColor='#FF2A1A'; c.shadowBlur=14; circ(-30,-52,7,true,false); circ(-4,-62,6,true,false); c.shadowBlur=0;
  c.fillStyle='#C9B8A0'; for(var w=0;w<3;w++){ c.beginPath(); c.moveTo(-50,40+w*16); c.lineTo(-96,52+w*22); c.lineTo(-56,50+w*16); c.closePath(); c.fill(); c.stroke(); }
  c.restore(); }
function E_dot(x,y){ c.save(); c.fillStyle='#FFD23F'; c.shadowColor='#FFD23F'; c.shadowBlur=10; circ(x,y,7,true,false); c.restore(); }
function stationScene(F){ var st=F.st, T=F.T;
  SB.profile({pts:st.pts,span:st.span,tris:st.tris,car:st.car,panel:st.panel,panelSc:st.panelSc},T,{cave:true,G:G2,yname:'HEIGHT',cart:true,noCar:!!(fxOf(F,'launch2')||fxOf(F,'depart')),grow:function(id){ var q=fxQ(F,'grow_'+id); return q==null?1:clamp(q/0.9); }});
  var tx0=G2.x(0)-30, tx1=G2.x(3)-12, ty0=G2.y(24)-10, ty1=G2.y(0)+10;
  if(st.tunnel){ var lit=st.lit||0; c.save(); c.fillStyle='rgba(22,14,16,'+(0.95-0.55*lit)+')'; rr(tx0,ty0,tx1-tx0,ty1-ty0,10,true,false); c.strokeStyle='rgba(140,100,90,.7)'; c.lineWidth=3; rr(tx0,ty0,tx1-tx0,ty1-ty0,10,false,true); c.restore();
    if(!lit) txt('UNMAPPED',(tx0+tx1)/2,G2.y(13),'600 16px "IBM Plex Mono",monospace','#9A7A70'); }
  var nb=fxOf(F,'walkback'), nq=fxQ(F,'walkback'), n=nb?(on(nq)?Math.min(3,Math.floor(nq/(nb.step||0.8))+1):0):(st.back||0);
  if(n>0){ c.save(); c.strokeStyle='#FFD23F'; c.lineWidth=3; c.setLineDash([8,6]); var a=at2([3,10]), e=at2([3-n,10-2*n]); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(e[0],e[1]); c.stroke(); c.setLineDash([]); c.restore();
    for(var i=1;i<=n;i++){ var p=at2([3-i,10-2*i]); E_dot(p[0],p[1]); txt(String(10-2*i),p[0]-20,p[1]-16,'600 20px "IBM Plex Mono",monospace','#FFFFFF'); }
    var last=at2([3-n+0.5,10-2*n+1]); txt('-1 post, -2',last[0]+40,last[1]+30,'600 14px "IBM Plex Mono",monospace','#FFD23F'); }
  if(st.zero){ var z=at2([0,4]); c.save(); c.fillStyle='#7CF2A2'; c.shadowColor='#7CF2A2'; c.shadowBlur=20; rr(z[0]-6,z[1]+6,64,10,3,true,false); c.restore(); tag('STATION ZERO: HEIGHT 4',z[0]+130,z[1]+40,'#7CF2A2'); }
  if(st.fake){ var f=at2([3,10]); c.save(); c.fillStyle='#FFE58A'; rr(f[0]-30,f[1]+4,60,10,3,true,false); c.restore(); flipper(f[0]-30,f[1]+4,1,T,false,false); flipper(f[0]+30,f[1]+4,-1,T,false,false);
    c.save(); c.translate(f[0],f[1]-96); c.rotate(Math.sin(T*3)*0.06); c.fillStyle='#FFFDF6'; c.strokeStyle=INK; c.lineWidth=3; rr(-74,-20,148,36,6); txt('STATION ZERO',0,0,'18px "Luckiest Guy",sans-serif','#22324A'); c.restore(); }
  if(st.bur){ var B=st.bur, P=F.pv.bur, bx=P&&!F.b.scene?tw(F,B[0],P[0]):B[0], ba=P&&!F.b.scene?tw(F,B[3],P[3]):B[3]; c.save(); c.beginPath(); c.rect(tx0,ty0,tx1-tx0,ty1-ty0); c.clip(); burrower(bx,B[1],B[2],T,0.4+0.5*Math.abs(Math.sin(F.t*2.2)),ba); c.restore(); }
  if(st.rule){ c.save(); c.translate(790,st.ruleY||250); c.fillStyle='rgba(14,16,30,.92)'; c.strokeStyle='#7CF2A2'; c.lineWidth=3; rr(-160,-30,320,60,10);
    var r=st.rule, gone=st.ruleGone; txt(gone?r.replace(' + 4',''):r,gone?-30:0,2,'600 24px "IBM Plex Mono",monospace','#F2EEE6'); c.restore(); }
}
/* ---------- Floor Three: the bridge, its goats, the Turnbats ---------- */
function bridgeY(x){ var u=clamp((x-280)/400); return GY-24+Math.sin(u*Math.PI)*36; }
var ONB=[300,488,536,584,632,664], OFFB=[805,835,865,895,925,955];
// a Turnbat: hangs upside down under the bridge; turns signs over
function turnbat(x,y,T,s,fly,i){ c.save(); c.translate(x,y); c.scale(s,fly?s:-s); var fl=fly?Math.sin(T*22+i)*0.9:0.15; c.strokeStyle=INK; c.lineWidth=2.2; c.fillStyle='#3A2E4A';
  [-1,1].forEach(function(sd){ c.save(); c.scale(sd,1); c.rotate(-fl*0.6); c.beginPath(); c.moveTo(6,-4); c.quadraticCurveTo(30,-26,46,-6); c.lineTo(38,0); c.lineTo(30,-6); c.lineTo(24,2); c.lineTo(16,-4); c.lineTo(8,4); c.closePath(); c.fill(); c.stroke(); c.restore(); });
  ell(0,0,11,13); c.beginPath(); c.moveTo(-8,-9); c.lineTo(-11,-22); c.lineTo(-2,-12); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(8,-9); c.lineTo(11,-22); c.lineTo(2,-12); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFD23F'; circ(-4,-3,2.6,true,false); circ(4,-3,2.6,true,false); c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(-3,5); c.lineTo(-1,9); c.lineTo(1,5); c.closePath(); c.fill(); c.restore(); }
function bridgeScene(F){ var st=F.st, T=F.T, cr=st.crack||0, cq=fxQ(F,'crack'); c.save(); if(on(cq)&&cq<0.6) shake(F,10);
  SB.cave(T,true); c.fillStyle='#05060C'; c.fillRect(260,GY-120,440,H);
  c.fillStyle='#12172A'; c.fillRect(0,GY-14,280,H); c.fillRect(680,GY-14,W,H);
  // Turnbats roost under the planks
  var bq=fxQ(F,'batflip'); for(var b=0;b<7;b++){ var bx=320+b*55, by=bridgeY(bx)+30+(b%2)*12; if(on(bq)&&bq<1.8&&b<3){ var u=clamp(bq/1.2); turnbat(lerp(bx,760+b*30,ease(u)),lerp(by,150+b*20,ease(u)),T,0.9,true,b); } else turnbat(bx,by,T,0.8,false,b); }
  var sag=Math.sin(F.t*2)*3*(1+cr); c.strokeStyle='#8A5A34'; c.lineWidth=4; c.beginPath(); c.moveTo(270,GY-64); c.quadraticCurveTo(480,GY+4+sag,690,GY-64); c.stroke();
  for(var i=0;i<18;i++){ var x=lerp(286,674,i/17), y=bridgeY(x)+sag*Math.sin(clamp((x-280)/400)*Math.PI); if(cr>=2&&(i===8||i===11)) continue; c.fillStyle='#8A5A34'; c.strokeStyle=INK; c.lineWidth=2; rr(x-11,y-6,22,12,2);
    if(cr>=1&&i%3===1){ c.strokeStyle='#1B0F08'; c.lineWidth=1.5; c.beginPath(); c.moveTo(x-6,y-5); c.lineTo(x+1,y+1); c.lineTo(x-3,y+6); c.stroke(); } }
  var pq=fxQ(F,'plank'); if(on(pq)&&pq<1.4){ var pu=pq/1.4; c.save(); c.translate(lerp(470,450,pu),bridgeY(470)+pu*pu*300); c.rotate(pu*5); c.fillStyle='#8A5A34'; c.strokeStyle=INK; c.lineWidth=2; rr(-11,-6,22,12,2); c.restore(); }
  // the load sign
  var tq=fxQ(F,'turn'), k=fxOf(F,'turn')?ease(clamp((tq||0)/0.8)):(st.turned?1:0); c.save(); c.translate(150,GY-190); c.scale(Math.abs(Math.cos(k*Math.PI))+0.02,1); c.fillStyle='#FFFDF6'; c.strokeStyle=INK; c.lineWidth=3; rr(-80,-40,160,80,8);
  txt('LOAD LIMIT',0,-14,'16px "Luckiest Guy",sans-serif','#22324A'); txt(k<0.5?'UNDER 300':'OVER 300',0,16,'22px "Luckiest Guy",sans-serif','#C0392B'); c.restore();
  if(fxOf(F,'turn')&&on(tq)&&tq<1.2) glove(150,GY-260,0.3);
  if(st.floorTag) txt('FLOOR 3',480,150,'40px "Luckiest Guy",sans-serif','#9BDCFF');
  // the second helmet, on a nail on the far side
  if(st.helmet2){ c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=3; c.beginPath(); c.moveTo(880,GY-182); c.lineTo(880,GY-170); c.stroke(); c.translate(880,GY-130); c.scale(0.6,0.6); c.strokeStyle=INK; c.lineWidth=4; c.fillStyle='#A8372C'; c.beginPath(); c.arc(0,0,49,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#F2EEE6'; c.lineWidth=2; for(var h=0;h<5;h++){ c.beginPath(); c.moveTo(-36+h*4,-8-h*7); c.lineTo(34-h*4,-8-h*7); c.stroke(); } c.restore(); }
  c.restore(); }
function bridgeFront(F){ var st=F.st, T=F.T, n=st.bgoats==null?-1:st.bgoats, pn=F.pv.bgoats==null||F.b.scene?n:F.pv.bgoats, u=ease(prog(F));
  if(n>=0) for(var g=0;g<6;g++){ var onNow=g<n, onPrev=g<pn, ax=onPrev?ONB[g]:OFFB[g], bx=onNow?ONB[g]:OFFB[g], x=lerp(ax,bx,u), moving=ax!==bx&&u<1, y=x<690&&x>270?bridgeY(x):GY-10, hop=moving?-Math.abs(Math.sin(u*Math.PI*3))*30:0;
    madGoat(x,y+hop,onNow?-1:1,T,0.55,g,moving); }
  var cq=fxQ(F,'crack'); once(F,'crack',cq,'thud',1); if(on(cq)&&cq<1.0) burst(480,GY-120,'CRAAACK!',0.7,'#FF8C80');
  var bq=fxQ(F,'baa'); if(on(bq)&&bq<0.9) burst(760,GY-140,'BAA!',0.5,'#FFFFFF');
  // the load board: lines, with the sign in the last line turned by the bats
  if(st.load){ var L=st.load, sy=st.sym||'<', tf=fxQ(F,'batflip'), k=on(tf)?ease(clamp((tf-1.0)/0.8)):0; c.save(); c.translate(780,150); c.fillStyle='rgba(14,16,30,.92)'; c.strokeStyle='#9BDCFF'; c.lineWidth=3; rr(-170,-26,340,40+L.length*38,10);
    L.forEach(function(l,i){ var y=6+i*38, last=i===L.length-1;
      if(last&&l.indexOf('{s}')>=0){ var parts=l.split('{s}'); c.font='600 24px "IBM Plex Mono",monospace'; var w1=c.measureText(parts[0]).width, w2=c.measureText(parts[1]).width, tot=w1+30+w2, x0=-tot/2;
        txt(parts[0],x0+w1/2,y,'600 24px "IBM Plex Mono",monospace','#F2EEE6'); c.save(); c.translate(x0+w1+15,y); c.rotate(k*Math.PI); txt(sy,0,0,'700 30px "IBM Plex Mono",monospace',st.symHot?'#7CF2A2':'#FFD23F'); c.restore(); txt(parts[1],x0+w1+30+w2/2,y,'600 24px "IBM Plex Mono",monospace','#F2EEE6'); }
      else txt(l,0,y,'600 24px "IBM Plex Mono",monospace',l.charAt(0)==='✗'?'#FF8C80':(l.charAt(0)==='✓'?'#7CF2A2':'#F2EEE6')); });
    c.restore(); }
  // a number line for the answer: open circle, shading to one side
  if(st.nl){ var N=st.nl, x0=300, dx=40, y=300; c.save(); c.fillStyle='rgba(14,16,30,.88)'; c.strokeStyle='#FFD23F'; c.lineWidth=2; rr(x0-30,y-40,dx*9+60,76,10);
    c.strokeStyle='#F2EEE6'; c.lineWidth=3; c.beginPath(); c.moveTo(x0-10,y); c.lineTo(x0+dx*8+16,y); c.stroke();
    for(var v=0;v<=8;v++){ var xx=x0+v*dx; c.beginPath(); c.moveTo(xx,y-7); c.lineTo(xx,y+7); c.stroke(); txt(String(v),xx,y+22,'600 16px "IBM Plex Mono",monospace','#F2EEE6'); }
    var ax2=x0+N[0]*dx; c.strokeStyle=N[1]>0?'#7CF2A2':'#FF8C80'; c.lineWidth=7; c.beginPath(); c.moveTo(ax2,y); c.lineTo(N[1]>0?x0+dx*8+14:x0-8,y); c.stroke();
    c.fillStyle='#14121C'; c.lineWidth=3; circ(ax2,y,9,true,true); c.restore(); }
  if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet')); }
// Gate A, far below: a cart, and someone in a helmet covered in writing
function gateScene(F){ var st=F.st, T=F.T; SB.cave(T); c.fillStyle='rgba(0,0,0,.45)'; c.fillRect(0,0,W,H);
  c.strokeStyle='#5A5F70'; c.lineWidth=4; c.beginPath(); c.moveTo(0,GY-40); c.lineTo(W,GY-120); c.stroke();
  var gq=fxQ(F,'roll'), gx=on(gq)?lerp(560,1100,ease(clamp(gq/2.4))):560, gy=GY-40-(gx/W)*80; c.save(); c.translate(gx,gy); c.rotate(-0.08);
  c.fillStyle='#05040A'; c.beginPath(); c.arc(0,-96,22,0,Math.PI*2); c.fill(); rr(-20,-78,40,48,8,true,false);
  c.fillStyle='#A8372C'; c.beginPath(); c.arc(0,-104,26,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.strokeStyle='#F2EEE6'; c.lineWidth=1.5; for(var h=0;h<4;h++){ c.beginPath(); c.moveTo(-20+h*3,-108-h*4); c.lineTo(20-h*3,-108-h*4); c.stroke(); }
  c.restore(); SB.cart(gx,gy,T,-0.08,1.0);
  txt('GATE A',480,130,'46px "Luckiest Guy",sans-serif','#FF8C80'); txt('THE LAST CART DOWN',480,170,'22px "Luckiest Guy",sans-serif','#F2EEE6'); }
var EP={
 meta:{id:'weightlimit',title:'Weight Limit',kicker:'Under the Pond · Floor Three',accent:'#9BDCFF'},
 extras:SB.extras,
 SCENES:{
  control:{bg:function(F){ var st=F.st, T=F.T, cq=fxQ(F,'chalk'), cf=fxOf(F,'chalk'), pq=fxQ(F,'pull');
      SB.cave(T,true); c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(0,0,W,H);
      c.save(); c.fillStyle='#1E3A2C'; c.strokeStyle='#8A5A34'; c.lineWidth=10; rr(220,110,420,250,6);
      var k=cf?(on(cq)?clamp(cq/(cf.dur||1.6)):0):(st.chalk?1:0); c.save(); c.beginPath(); c.rect(230,120,400*k,120); c.clip(); txt(st.floorText||'FLOOR 1',430,185,'74px "Luckiest Guy",sans-serif','#F2EEE6'); c.restore();
      var wk=st.wipe?clamp(1-F.p/0.9):1; c.globalAlpha=wk; c.strokeStyle='#F2EEE6'; c.lineWidth=5; for(var i=0;i<8;i++){ c.beginPath(); c.moveTo(270+i*22,280); c.lineTo(266+i*22,330); c.stroke(); } c.globalAlpha=1; c.restore();
      var lk=on(pq)?ease(clamp(pq/0.5)):0; lever(760,210,lk);
      if(cf&&on(cq)&&cq<(cf.dur||1.6)) glove(240+400*k,230+Math.sin(cq*18)*10,-0.3); else if(st.wipe&&F.p<0.9) glove(300+F.p*180,330,0.2); else if(on(pq)) glove(760,lerp(150,260,lk),0); else if(st.wipe) glove(lerp(470,760,ease(clamp((F.p-0.9)/0.5))),lerp(330,150,ease(clamp((F.p-0.9)/0.5))),0);
      if(on(pq)&&pq>0.4&&pq<1.3) burst(760,90,'CLUNK',0.5,'#FFFFFF'); }},
  lift:{bg:function(F){ var st=F.st, cf=fxOf(F,'count'), cq=fxQ(F,'count'), hot=null;
      if(cf&&on(cq)){ var n=Math.min(Math.abs(cf.to-cf.from),Math.floor(cq/(cf.step||0.5))+1); hot=cf.from+(cf.to<cf.from?-n:n); }
      SB.shaft(st,F.T,liftAt(F),{cave:true,labels:st.labels||{},hot:hot}); },
    front:function(F){ var st=F.st, f=fxOf(F,'lift'), q=fxQ(F,'lift'); if(f&&f.ok===false&&q>(f.dur||1.4)*0.75&&q<(f.dur||1.4)+1.2) burst(SB.SHX+10,60,'TWANG!',0.62,'#FF7A6B');
      if(f&&f.ok!==false&&q>(f.dur||1.4)&&q<(f.dur||1.4)+0.8) burst(SB.SHX+120,SB.shaftY(f.to)-30,'DING!',0.42,'#7CF2A2');
      // a number line strip for sums that leave the shaft: hops from f.from, f.n steps down
      var nf=fxOf(F,'nline'), nq=fxQ(F,'nline'); if(st.nline||nf){ var lo=-7, x0=500, dx=52, y=236; c.save(); c.fillStyle='rgba(14,16,30,.85)'; c.strokeStyle=GOLD; c.lineWidth=2; rr(x0-30,y-44,dx*8+60,84,10);
        c.strokeStyle='#F2EEE6'; c.lineWidth=3; c.beginPath(); c.moveTo(x0-10,y); c.lineTo(x0+dx*8+10,y); c.stroke();
        var from=nf?nf.from:st.nline[0], steps=nf?nf.steps:st.nline[1], done=nf?(on(nq)?Math.min(steps,Math.floor(nq/(nf.step||0.5))+1):0):steps;
        for(var v=lo;v<=1;v++){ var x=x0+(v-lo)*dx, cur=v===from-done&&done>0; c.beginPath(); c.moveTo(x,y-7); c.lineTo(x,y+7); c.stroke(); txt(SB.neg(v),x,y+24,'600 '+(cur?22:16)+'px "IBM Plex Mono",monospace',cur||v===from?GOLD:'#F2EEE6'); }
        c.strokeStyle=GOLD; c.lineWidth=3; for(var h=0;h<done;h++){ var xa=x0+(from-h-lo)*dx; c.beginPath(); c.arc(xa-dx/2,y-6,dx/2,Math.PI,Math.PI*2); c.stroke(); } c.restore(); }
      if(st.report) SB.report(st.report,grown(F,'report'),0);
      if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet')); }},
  rails:{bg:function(F){ var st=F.st, T=F.T, pts=(st.pts||[]).map(function(p){ return p.slice(); }), sf=fxOf(F,'switch'), sq=fxQ(F,'switch'), hf=fxOf(F,'hook'), hq=fxQ(F,'hook');
      if(sf){ var u=on(sq)?ease(clamp(sq/1.0)):0; pts[pts.length-1][1]=lerp(sf.from,sf.to,u); }
      var rf=fxOf(F,'rebuild'), rq=fxQ(F,'rebuild'), ru=rf?(on(rq)?ease(clamp(rq/(rf.dur||2.4))):0):0; if(rf){ pts.forEach(function(p,i){ p[1]=lerp(rf.from[i],p[1],ru); }); c.save(); c.translate((rnd(Math.floor(F.t*30))-.5)*8*(ru<1?1:0),(rnd(Math.floor(F.t*30)+7)-.5)*6*(ru<1?1:0)); }
      var dy=hf?(on(hq)?-ease(clamp((hq-0.8)/1.8))*620:0):0;
      if(st.mapGone&&!hf){ SB.cave(T); SB.cart(250,GY-2,T,0,1.5);
        if(st.rustedBg){ c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=4; c.beginPath(); c.moveTo(60,190); c.lineTo(420,190); c.stroke(); c.restore(); SB.cart(240,190,T,0,1.1,{rust:true}); tag('INCIDENTS: 3 OF 3',240,100,'#FF7A6B'); }
        if(st.tally) tag(st.tally,760,60,'#FF7A6B'); if(st.panel) panel(790,30,st.panel,{sc:0.66}); return; }
      var s2={pts:pts,span:st.span,tris:st.tris,car:st.car,board:st.board,panel:st.panel,panelSc:st.panelSc};
      SB.profile(s2,T,{cave:true,G:EG,yname:'HEIGHT',dy:dy,cart:true,noCar:!!fxOf(F,'ride'),grow:function(id){ var q=fxQ(F,'grow_'+id); return q==null?1:clamp(q/0.9); }});
      c.save(); c.translate(rf?ru*760:0,dy); railsExtras(F,rf?rf.old:pts); c.restore(); if(rf){ c.restore(); if(on(rq)&&rq<2.2) burst(330,90,'GRRRIND',0.6,'#FFFFFF'); }
      if(hf&&on(hq)){ var hy=lerp(-60,40,ease(clamp(hq/0.8)))+dy; c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=4; c.beginPath(); c.moveTo(340,-10); c.lineTo(340,hy); c.stroke(); c.lineWidth=6; c.beginPath(); c.arc(340,hy+12,12,-0.4,Math.PI); c.stroke(); c.restore(); if(hq>0.8&&hq<1.8) burst(340,120,'YOINK',0.55,'#FFFFFF'); }
      var lk=sf?(on(sq)?ease(clamp(sq/0.5)):0):(st.pulled?1:0); lever(905,150,lk); if(st.hand) glove(905,lerp(92,196,lk),0);
      if(sf&&on(sq)&&sq>0.3&&sq<1.3) burst(820,90,'CLUNK',0.5,'#FFFFFF'); },
    front:function(F){ var st=F.st; if(st.book){ c.save(); c.translate(st.book[0],st.book[1]); c.rotate(-0.1); c.strokeStyle=INK; c.lineWidth=2.5; c.fillStyle='#2E6DA4'; rr(-17,-22,34,44,3); c.fillStyle='#FFFDF6'; rr(-11,-14,22,12,2); c.restore(); }
      if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet')); }},
  log:{bg:function(F){ var st=F.st, T=F.T;
      if(!st.cover&&!st.page){ SB.log(st,T,{title:st.logTitle||'EXERCISE BOOK',heads:['POST','HEIGHT'],dyName:'height'}); return; }
      SB.cave(T); c.save(); c.translate(350,250); c.rotate(-0.03); c.strokeStyle=INK; c.lineWidth=3;
      if(st.cover){ c.fillStyle='#2E6DA4'; rr(-230,-200,460,400,8); c.fillStyle='#1F4F7A'; rr(-230,-200,40,400,6); c.fillStyle='#FFFDF6'; rr(-150,-110,330,170,6);
        txt('SANDY FLATS SCHOOL',15,-80,'18px "Luckiest Guy",sans-serif','#22324A'); c.strokeStyle='#C9C3B0'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-130,-30); c.lineTo(160,-30); c.moveTo(-130,24); c.lineTo(160,24); c.stroke();
        txt('Name:',-130,-44,'600 14px "IBM Plex Mono",monospace','#6B6B76','left'); c.save(); c.globalAlpha=0.22; txt('~~~~~ ~~~~~~~',40,-46,'600 30px "Patrick Hand",sans-serif','#1F3C88'); c.restore();
        txt('Class of:',-130,10,'600 14px "IBM Plex Mono",monospace','#6B6B76','left'); txt('MR. DUNMORE',60,6,'600 30px "Patrick Hand",sans-serif','#1F3C88'); }
      else { c.fillStyle='#FFFDF6'; c.beginPath(); c.moveTo(-230,-200); c.lineTo(230,-200); c.lineTo(230,40); c.lineTo(196,62); c.lineTo(214,96); c.lineTo(170,120); c.lineTo(180,160); c.lineTo(120,170); c.lineTo(96,200); c.lineTo(-230,200); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle='#C9D4E6'; c.lineWidth=1.5; for(var ly=-150;ly<190;ly+=44){ c.beginPath(); c.moveTo(-210,ly+16); c.lineTo(ly>20?90:210,ly+16); c.stroke(); }
        (st.pageLines||[['If you are reading this,'],['do not trust'],['the']]).forEach(function(l,i){ txt(l[0],-200,-150+i*(st.pageLines?62:88),l[1]?'600 40px "Caveat","Patrick Hand",cursive':'600 '+(st.pageLines?38:44)+'px "Patrick Hand",sans-serif',l[1]||'#1F3C88','left'); }); }
      c.restore(); },
    front:function(F){ var q=fxQ(F,'ding'); if(on(q)&&q<1.2){ SB.cart(lerp(660,960,ease(clamp(q/1.2))),GY-200,F.T,-0.3,1); burst(700,150,'DING!',0.5,'#7CF2A2'); } }},
  // the stairs to floor two: two marked steps, and old chalk on the wall
  stairs:{bg:function(F){ var st=F.st, T=F.T; SB.profile({pts:st.pts,panel:st.panel},T,{cave:true,G:SG,yname:'HEIGHT'});
      var a=[SG.x(2),SG.y(-1)], b=[SG.x(6),SG.y(-3)]; c.save(); c.strokeStyle='rgba(200,207,221,.55)'; c.lineWidth=3; c.beginPath(); c.moveTo(a[0],a[1]); for(var i=0;i<4;i++){ var x1=lerp(a[0],b[0],(i+1)/4), y1=lerp(a[1],b[1],(i+1)/4); c.lineTo(x1,lerp(a[1],b[1],i/4)); c.lineTo(x1,y1); } c.stroke(); c.restore();
      if(st.chalk){ var hi=st.chalkHi?(0.6+0.4*Math.sin(T*6)):0; c.save(); c.translate(800,210); c.rotate(-0.04); if(hi){ c.shadowColor='#FFE14D'; c.shadowBlur=30*hi; } txt('+ 1/2',0,0,'600 54px "Patrick Hand",sans-serif','#F2EEE6'); c.strokeStyle='#F2EEE6'; c.lineWidth=5; c.beginPath(); c.moveTo(-80,14); c.lineTo(80,-14); c.stroke(); txt('3 OF 3',0,52,'600 34px "Patrick Hand",sans-serif','#FF7A6B'); c.restore(); }
      var gk=st.open?ease(clamp((F.pv.open&&!F.b.scene)?1:F.p/0.8)):0; c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=5; for(var gx=0;gx<5;gx++){ c.beginPath(); c.moveTo(906+gx*13,GY-190-gk*170); c.lineTo(906+gx*13,GY-14-gk*170); c.stroke(); } c.lineWidth=7; c.beginPath(); c.moveTo(900,GY-190-gk*170); c.lineTo(964,GY-190-gk*170); c.stroke(); c.restore(); },
    front:function(F){ if(F.st.helmet) SB.helmet(F.st.helmet,grown(F,'helmet')); }},
  classroom:{bg:function(F){ var st=F.st; c.fillStyle='#4A3F5A'; c.fillRect(0,0,W,H); c.fillStyle='#352C42'; c.fillRect(0,GY-14,W,H); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
      c.fillStyle='#1E3A2C'; c.strokeStyle='#8A5A34'; c.lineWidth=10; rr(40,50,300,170,6); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#F0A66B'; rr(760,60,150,120,4); c.fillStyle='#5B4A7A'; c.fillRect(764,64,142,60);
      c.fillStyle='#8A5A34'; rr(520,GY-110,300,16,4); c.fillStyle='#6B4426'; rr(540,GY-94,14,80,2); rr(786,GY-94,14,80,2);
      if(st.photo){ var k=ease(clamp(F.pv.photo&&!F.b.scene?1:F.p/0.4)); c.save(); c.translate(480,190); c.rotate(-0.04); c.scale(k,k); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#FFFDF6'; rr(-180,-120,360,240,4); c.fillStyle='#C9B48A'; c.fillRect(-166,-106,332,190);
        for(var r=0;r<2;r++) for(var i=0;i<6;i++){ var x=-125+i*50, y=-56+r*76, cut=(r===0&&i===2)||(r===1&&i===3); if(cut){ c.fillStyle='#14121C'; circ(x,y,20); c.fillStyle='#14121C'; rr(x-18,y+16,36,26,4); } else { c.fillStyle=['#F1C27D','#C68642','#8D5524','#FFDBAC','#E0AC69','#D9A066'][(i+r*2)%6]; circ(x,y,17); c.fillStyle=['#2F7FD1','#8E5BD6','#E8862C','#2F5D50','#E23B2E','#4A4F5E'][(i*5+r)%6]; rr(x-16,y+16,32,24,4); } }
        txt('CLASS OF MR. DUNMORE',0,102,'600 16px "IBM Plex Mono",monospace','#22324A'); c.restore(); } }},
  pen:{bg:function(F){ SB.pen(F.T,{cave:true}); },
    front:function(F){ SB.penFront(F.T,{keith:F.st.keith}); var q=fxQ(F,'goats'); if(on(q)&&q<1.0){ burst(430,250,'BAA!',0.7,'#FFFFFF'); for(var i=0;i<8;i++){ c.fillStyle='rgba(240,235,220,'+(0.7-q*0.7)+')'; circ(430+(rnd(i)-.5)*260*(0.4+q),GY-20-rnd(i+4)*90*q,14+rnd(i+8)*16,true,false); } }
      var eq=fxQ(F,'eat'); if(on(eq)&&eq<1.2&&F.st.keith) burst(F.st.keith[0]-70,GY-150,'CHOMP',0.5,'#FFFFFF');
      if(F.st.report) SB.report(F.st.report,grown(F,'report'),0); }},
  news:{bg:function(F){ newsSet(F); }, front:function(F){ newsFront(F); }},
  station:{bg:stationScene, front:function(F){ if(F.st.helmet) SB.helmet(F.st.helmet,grown(F,'helmet')); }},
  bridge:{bg:bridgeScene, front:bridgeFront},
  gate:{bg:gateScene}
 },
 FX:{
  // the cart rides a span; a wrong slope throws it
  ride:{draw:function(f,q,F){ var dur=f.dur||1.6, u=ease(clamp(q/dur)), a=at(f.from), b=at(f.to), x=lerp(a[0],b[0],u), y=lerp(a[1],b[1],u);
      SB.cart(x,y,F.T,Math.atan2(b[1]-a[1],b[0]-a[0])*0.6,0.8); if(q>dur&&q<dur+0.9) burst(b[0]+10,b[1]-80,f.yes||'DING!',0.42,'#7CF2A2'); }},
  // the cart sets off from the wrong height and leaves the track
  launch2:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.6, u=clamp(q/dur), b=f.b, x=lerp(0,5.5,u), y=2*x+b, p=at2([x,y]), s0=at2([0,b]);
      c.save(); c.strokeStyle='#FF7A6B'; c.lineWidth=3; c.setLineDash([6,6]); c.beginPath(); c.moveTo(s0[0],s0[1]); c.lineTo(p[0],p[1]); c.stroke(); c.restore();
      if(u<1) SB.cart(p[0],p[1],F.T,-0.5,0.8); else { var v=clamp((q-dur)/0.8); c.save(); c.translate(p[0]+v*200,p[1]-v*240); c.rotate(v*6); SB.cart(0,0,F.T,0,0.8); c.restore(); }
      if(q>dur&&q<dur+1.0) burst(p[0],p[1]-40,'CLANG!',0.6,'#FF7A6B'); once(F,'launch2',q-dur,'thud',1); }},
  // the right start: the cart rides from station zero along the whole track
  depart:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||2.2, u=ease(clamp(q/dur)), x=lerp(0,9,u), p=at2([x,2*x+4]); SB.cart(p[0],p[1],F.T,-0.45,0.8); if(q>dur&&q<dur+1) burst(p[0],p[1]-60,'DING!',0.5,'#7CF2A2'); }},
  launch:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.3, u=clamp(q/dur); if(u<1){ c.save(); c.translate(lerp(520,-80,u),lerp(430,-120,u*u)); c.rotate(-u*7); SB.cart(0,0,F.T,0,1.3); c.restore(); } if(q>0.2&&q<1.5) burst(360,150,'WHOOPS!',0.7,'#FF7A6B'); }}
 },
 BEATS:__BEATS__
};
EP.BEATS.forEach(function(b,i){ b.d=DUR[i]; });
Object.keys(EP.SCENES).forEach(function(k){ var f=EP.SCENES[k].front; EP.SCENES[k].front=function(F){ if(f) f(F); overlay(F); }; });   // the clock and the monsters go over every scene
return EP;
})();
