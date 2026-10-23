/* Sandy Flats cut-paper engine, extracted unchanged from the v13 film "Zero 2: Sidekick" (shared engine of films 2-9),
   with extra sprites copied from other films. */
window.SFEngine=function(cv,opts){
opts=opts||{};
var W=960,H=540,GY=470,INK='#1b1a22';
var c=cv.getContext('2d');
var dpr=opts.dpr||Math.min(2,window.devicePixelRatio||1);
cv.width=W*dpr; cv.height=H*dpr; c.setTransform(dpr,0,0,dpr,0,0);
var CH={
  priya:{skin:'#C68642',shirt:'#8E5BD6',pants:'#2D3A5A',s:1,seed:3},
  marcus:{skin:'#F1C27D',shirt:'#2F7FD1',pants:'#3B3B3B',s:1.02,seed:7},
  gus:{skin:'#FFDBAC',shirt:'#F4F4F4',pants:'#4A6B3A',s:.84,seed:11,noCoat:true},
  dunmore:{skin:'#8D5524',shirt:'#F2F2F2',pants:'#4B4B55',s:1.22,seed:17},
  anchor:{skin:'#E0AC69',shirt:'#4A5568',pants:'#2B2B33',s:1.1,seed:23}
};
var NAMES={priya:['PRIYA','#C99BFF'],marcus:['MARCUS','#FF7A6B'],gus:['GUS','#FFD84D'],zero:['ZERO','#FFA23A'],one:['ONE','#FF5A5A'],duo:['ZERO & ONE','#FFFFFF'],all:['EVERYONE','#FFFFFF'],everyone:['EVERYONE','#FFFFFF'],dunmore:['MR. DUNMORE','#7CC0FF'],machine:['THE MULTIPLEX 4000','#7CF2A2'],pigeon:['DOUG THE PIGEON','#C8C8C8'],anchor:['CHIP HARTLEY, SFN NEWS','#E3E3E3'],undefined:['THE UNDEFINED','#9A9A9A'],effie:['EFFIE','#FFD27F'],littlef:['LITTLE f','#9FE3FF'],eraser:['THE ERASER','#FF9EC7'],machf:['MACHINE f','#FF9A5C'],machg:['MACHINE g','#5CE0D0'],fg:['MACHINES f & g','#FFFFFF'],glitch:['THE GLITCH','#5CE0B8'],sam:['SQUARING SAM','#B9A8FF']};
var BEATS=[], AUD={};
/* ================= helpers ================= */
function clamp(v,a,b){ a=a==null?0:a; b=b==null?1:b; return Math.max(a,Math.min(b,v)); }
function lerp(a,b,u){ return a+(b-a)*u; }
function ease(u){ return u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2; }
function rnd(n){ var x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function rr(x,y,w,h,r,fill,stroke){ c.beginPath(); if(c.roundRect) c.roundRect(x,y,w,h,r||0); else c.rect(x,y,w,h); if(fill!==false) c.fill(); if(stroke!==false) c.stroke(); }
function circ(x,y,r,fill,stroke){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); if(fill!==false) c.fill(); if(stroke!==false) c.stroke(); }
function ell(x,y,rx,ry,fill,stroke){ c.beginPath(); c.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2); if(fill!==false) c.fill(); if(stroke!==false) c.stroke(); }
function star(x,y,r,col){ c.beginPath(); for(var i=0;i<10;i++){ var a=-Math.PI/2+i*Math.PI/5, rad=i%2?r*.45:r; c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad); } c.closePath(); c.fillStyle=col; c.fill(); c.strokeStyle=INK; c.lineWidth=2.5; c.stroke(); }
function txt(s,x,y,font,col,align){ c.font=font; c.fillStyle=col; c.textAlign=align||'center'; c.textBaseline='middle'; c.fillText(s,x,y); }
function burst(x,y,label,sc,col){ c.save(); c.translate(x,y); c.scale(sc,sc); c.beginPath(); for(var i=0;i<16;i++){ var a=i*Math.PI/8, r=i%2?38:62; c.lineTo(Math.cos(a)*r*1.4,Math.sin(a)*r); } c.closePath(); c.fillStyle=col||'#FFE14D'; c.fill(); c.strokeStyle=INK; c.lineWidth=3; c.stroke(); txt(label,0,2,'28px "Luckiest Guy",sans-serif',INK); c.restore(); }
function token(x,y,label,col,sc){ c.save(); c.translate(x,y); c.scale(sc||1,sc||1); c.font='600 22px "IBM Plex Mono",monospace'; var w=Math.max(46,c.measureText(label).width+26); c.fillStyle=col; c.strokeStyle=INK; c.lineWidth=3; rr(-w/2,-22,w,44,22); txt(label,0,1,'600 22px "IBM Plex Mono",monospace','#fff'); c.restore(); }
function readout(x,y,t,bad,sc){ if(!t) return; c.save(); c.translate(x,y); c.scale(sc||1,sc||1); c.font='600 24px "IBM Plex Mono",monospace'; var w=c.measureText(t).width+34; c.fillStyle=bad?'#FFE3DF':'#FFFDF6'; c.strokeStyle=bad?'#D12F2F':INK; c.lineWidth=bad?4:3; rr(-w/2,-24,w,48,12); c.beginPath(); c.moveTo(-8,24); c.lineTo(0,36); c.lineTo(8,24); c.closePath(); c.fill(); c.stroke(); c.fillStyle=bad?'#FFE3DF':'#FFFDF6'; c.fillRect(-9,20,18,6); txt(t,0,1,'600 24px "IBM Plex Mono",monospace',bad?'#B3261E':INK); c.restore(); }

var tex=document.createElement('canvas'); tex.width=W; tex.height=H;
(function(){ var t=tex.getContext('2d'); for(var i=0;i<5200;i++){ t.fillStyle=(rnd(i)>.5)?'rgba(0,0,0,.06)':'rgba(255,255,255,.07)'; var w=1+rnd(i+9)*3; t.fillRect(rnd(i+1)*W,rnd(i+2)*H,w,1); } })();


function hero(x,y,f,talk,mood,T,opts){
  opts=opts||{};
  c.save(); c.translate(x+(opts.jit?(rnd(Math.floor(T*24))-.5)*6:0),y); c.rotate((rnd(Math.floor(T*6)+41)-.5)*0.04+(opts.tilt||0));
  c.lineWidth=2.8; c.strokeStyle=INK; c.lineJoin='round'; c.lineCap='round';
  var fl=Math.sin(T*7)*10+(opts.capePull||0);
  c.fillStyle='#D62828'; c.beginPath(); c.moveTo(-18,-160); c.quadraticCurveTo(-64-fl,-96,-78-fl,-6); c.lineTo(-40-fl*.5,-12); c.lineTo(-14,-8); c.lineTo(18,-160); c.closePath(); c.fill(); c.stroke();
  var body=opts.glitch?['#2F5BD6','#2FD67A','#B02FD6'][Math.floor(T*6)%3]:'#2F5BD6';
  c.fillStyle=body; c.beginPath(); c.moveTo(-24,-180); c.lineTo(24,-180); c.lineTo(24,-24); c.lineTo(42,-24); c.lineTo(42,0); c.lineTo(-42,0); c.lineTo(-42,-24); c.lineTo(-24,-24); c.lineTo(-24,-152); c.lineTo(-48,-138); c.lineTo(-56,-156); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFD23F'; rr(-24,-66,48,10,2); circ(0,-94,14); txt('1',0,-93,'20px "Luckiest Guy",sans-serif','#D62828');
  c.fillStyle=body; c.strokeStyle=INK;
  c.beginPath(); c.moveTo(24,-140); c.lineTo(48,-106); c.lineTo(24,-80); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-24,-128); c.lineTo(-44,-100); c.lineTo(-24,-78); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#fff'; circ(46,-106,7); circ(-42,-100,7);
  c.fillStyle=INK; rr(-27,-170,54,18,7);
  var blink=((T+2.1)%4.6)<0.12;
  if(!blink){ c.fillStyle='#fff'; ell(-10,-161,8,5.5,true,false); ell(12,-161,8,5.5,true,false); c.fillStyle=INK; var pr=mood==='shock'?1.5:2.6; circ(-10+3*f,-161,pr,true,false); circ(12+3*f,-161,pr,true,false); }
  c.strokeStyle=INK;
  if(mood==='shock'){ c.fillStyle='#5a1a1a'; ell(4,-134,6,9); }
  else if(talk){ c.fillStyle='#5a1a1a'; ell(4,-136,9,6); c.fillStyle='#fff'; c.fillRect(-3,-140,14,3); }
  else { c.beginPath(); c.moveTo(-6,-137); c.quadraticCurveTo(4,-131,15,-139); c.stroke(); }
  c.restore();
}
function zero(x,y,rot,talk,T,z,mood){
  c.save(); c.translate(x,y-36); c.rotate(rot+(rnd(Math.floor(T*6)+99)-.5)*0.05);
  c.lineWidth=24; c.strokeStyle=INK; circ(0,0,30,false,true);
  c.lineWidth=17; c.strokeStyle='#F39C34'; circ(0,0,30,false,true);
  c.lineWidth=2.4; c.strokeStyle=INK;
  if(z&&z.mask){ c.fillStyle='#D62828'; rr(-22,-15,44,15,6,true,true); c.beginPath(); c.moveTo(22,-10); c.lineTo(34,-16+Math.sin(T*8)*3); c.lineTo(34,-4+Math.sin(T*8)*3); c.closePath(); c.fill(); c.stroke(); }
  var blink=((T+1.3)%3.7)<0.12;
  if(blink){ c.beginPath(); c.moveTo(-15,-7); c.lineTo(-3,-7); c.moveTo(3,-7); c.lineTo(15,-7); c.stroke(); }
  else { c.fillStyle='#fff'; ell(-8,-7,6,6); ell(8,-7,6,6); c.fillStyle=INK; var pr=mood==='shock'?1.6:2.6; circ(-6,-6,pr,true,false); circ(10,-6,pr,true,false); }
  if(mood==='shock'){ c.fillStyle='#5a1a1a'; ell(0,10,5,7); }
  else if(talk){ c.fillStyle='#5a1a1a'; ell(0,9,7,5); }
  else { c.beginPath(); c.moveTo(-6,8); c.quadraticCurveTo(0,13,6,8); c.stroke(); }
  c.restore();
}
function pigeon(x,y,f,T,talk,opts){
  opts=opts||{}; c.save(); c.translate(x,y); c.scale(f*(opts.sc||1),(opts.sc||1));
  c.lineWidth=2.2; c.strokeStyle=INK; c.lineJoin='round';
  var bob=Math.sin(T*9)*2 + (opts.peck?Math.max(0,Math.sin(T*18))*9:0);
  c.strokeStyle='#E07A7A'; c.lineWidth=2.5; c.beginPath(); c.moveTo(-4,-8); c.lineTo(-6,0); c.moveTo(4,-8); c.lineTo(6,0); c.stroke(); c.strokeStyle=INK; c.lineWidth=2.2;
  c.fillStyle='#9AA0A8'; ell(0,-18,19,12);
  c.fillStyle='#7F868F'; ell(-6,-18,11,7,true,false); c.beginPath(); c.moveTo(-18,-20); c.lineTo(-30,-14); c.lineTo(-17,-12); c.closePath(); c.fill(); c.stroke();
  c.save(); c.translate(14,-30+bob); c.fillStyle='#6E7580'; circ(0,0,9); c.fillStyle='#6DBE8C'; ell(-4,8,6,4,true,false); c.fillStyle='#E8A33D'; c.beginPath(); c.moveTo(8,-1); c.lineTo(talk?16:15,talk?-3:1); c.lineTo(8,3); c.closePath(); c.fill(); c.stroke(); if(talk){ c.beginPath(); c.moveTo(8,3); c.lineTo(15,6); c.lineTo(8,4); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle='#FF8C1A'; circ(3,-2,3,true,false); c.fillStyle=INK; circ(3.5,-2,1.4,true,false); c.restore();
  c.restore();
  if(opts.umb){ c.save(); c.translate(x,y-66); c.strokeStyle=INK; c.lineWidth=2.4; c.beginPath(); c.moveTo(0,0); c.lineTo(0,34); c.stroke(); c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,0,30,Math.PI,0); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#FFD23F'; c.beginPath(); c.moveTo(0,0); c.arc(0,0,30,Math.PI*1.33,Math.PI*1.66); c.closePath(); c.fill(); c.stroke(); c.restore(); }
}


function mux(m,x,T,talk,opts){
  opts=opts||{}; var top=GY-210;
  c.save(); c.translate(x+(opts.shake||0),0); c.lineWidth=3; c.strokeStyle=INK; c.lineJoin='round';
  c.fillStyle='#555'; rr(-92,GY-20,24,20,3); rr(68,GY-20,24,20,3);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-108,top-40); c.lineTo(-34,top-40); c.lineTo(-52,top+2); c.lineTo(-90,top+2); c.closePath(); c.fill(); c.stroke();
  txt('IN',-71,top-24,'16px "Luckiest Guy",sans-serif',INK);
  c.fillStyle='#8FB8C9'; rr(-115,top,230,192,16);
  c.fillStyle='#10301F'; rr(-56,top+14,112,50,10);
  var ec=(m.bad&&!opts.dark)?'#FF6B5B':'#5CFF8A';
  if(opts.dark){ ec='#153a26'; }
  c.fillStyle=ec; circ(-22,top+33,6,true,false); circ(22,top+33,6,true,false);
  if(talk) c.fillRect(-15,top+46,30,10); else c.fillRect(-15,top+50,30,3);
  for(var i=0;i<2;i++){ var px=i===0?-97:12, py=top+80; c.fillStyle='#F7F3E3'; rr(px,py,85,62,6); txt(i===0?'× 4':'− 3',px+42,py+33,'600 28px "IBM Plex Mono",monospace',INK); }
  for(var j=0;j<3;j++){ var on=!opts.dark&&Math.floor(T*3+j)%3===0; c.fillStyle=on?['#FF5B5B','#FFD23F','#5CFF8A'][j]:'#39404a'; circ(-30+j*30,top+162,7); }
  txt('MULTIPLEX 4000',0,top+182,'13px "Luckiest Guy",sans-serif','rgba(0,0,0,.55)');
  c.fillStyle='#A0A0A0'; rr(112,GY-80,50,28,4); txt('OUT',137,GY-66,'13px "Luckiest Guy",sans-serif',INK);
  c.fillStyle='rgba(30,30,30,.28)'; ell(-60,top+40,26,14,true,false); ell(70,top+120,22,12,true,false);
  c.save(); c.translate(60,top+30); c.rotate(.5); c.fillStyle='#fff'; rr(-40,-9,80,18,4); c.rotate(-1); rr(-40,-9,80,18,4); c.restore();
  c.restore();
}
function muxHop(x){ return {x:x-71,y:GY-250}; }


/* ================= kids ================= */
function kid(k,x,y,f,talk,mood,walk,T,opts){
  opts=opts||{}; var sp=CH[k], kind=sp.kind||k; c.save();
  var bob=walk?-Math.abs(Math.sin(T*9))*8:0;
  c.translate(x,y+bob); c.scale(sp.s*f*(opts.sc||1),sp.s*(opts.sc||1));
  c.rotate((rnd(Math.floor(T*6)+sp.seed)-.5)*0.045+(opts.rot||0));
  c.lineWidth=2.6/sp.s; c.strokeStyle=INK; c.lineJoin='round'; c.lineCap='round';
  if(kind==='gus'&&!sp.noCoat){ c.fillStyle=sp.shirt; ell(0,-90,40,15); }
  c.fillStyle=sp.pants; rr(-18,-26,12,26,3); rr(6,-26,12,26,3);
  c.fillStyle=INK; ell(-13,-2,12,5); ell(13,-2,12,5);
  c.fillStyle=sp.shirt; c.beginPath(); c.moveTo(-35,-20); c.lineTo(35,-20); c.lineTo(27,-86); c.lineTo(-27,-86); c.closePath(); c.fill(); c.stroke();
  if(kind==='dunmore'){ c.fillStyle='#C0392B'; c.beginPath(); c.moveTo(-6,-84); c.lineTo(6,-84); c.lineTo(9,-44); c.lineTo(0,-36); c.lineTo(-9,-44); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='anchor'){ c.fillStyle='#fff'; c.beginPath(); c.moveTo(-12,-86); c.lineTo(12,-86); c.lineTo(0,-60); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#2E6DA4'; c.beginPath(); c.moveTo(-3,-80); c.lineTo(3,-80); c.lineTo(5,-58); c.lineTo(-5,-58); c.closePath(); c.fill(); }
  if(kind==='gus'&&!sp.noCoat){ c.fillStyle=INK; circ(0,-68,2.6,true,false); circ(0,-52,2.6,true,false); circ(0,-36,2.6,true,false); }
  if(kind==='gus'&&sp.noCoat){ c.strokeStyle='#F39C34'; c.lineWidth=6/sp.s; circ(0,-56,11,false,true); c.strokeStyle=INK; c.lineWidth=2.6/sp.s; }
  if(kind==='marcus'){ c.fillStyle='#fff'; rr(-12,-66,24,12,3); }
  c.fillStyle=sp.shirt; ell(-35,-56,9,22);
  if(opts.phone){ c.save(); c.translate(35,-72); c.rotate(-2.6); ell(0,18,9,22); c.restore(); c.fillStyle=sp.skin; circ(40,-116,7); c.fillStyle='#333'; rr(34,-134,10,22,3); }
  else { ell(35,-56,9,22); c.fillStyle=sp.skin; circ(36,-34,7); }
  c.fillStyle=sp.skin; circ(-36,-34,7);
  c.fillStyle=sp.skin; circ(0,-126,45);
  if(kind==='priya'){ c.fillStyle='#1d1d1d'; circ(-46,-138,16); c.beginPath(); c.arc(0,-126,47,Math.PI*1.0,Math.PI*2.0); c.lineTo(42,-134); c.quadraticCurveTo(8,-150,-46,-124); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='marcus'){ c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,-130,49,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.fillStyle='#fff'; c.fillRect(-6,-178,12,48); c.beginPath(); c.arc(0,-130,49,Math.PI,Math.PI*2); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-44,-130); c.lineTo(-30,-96); c.moveTo(44,-130); c.lineTo(30,-96); c.stroke(); }
  if(kind==='gus'){ c.fillStyle='#6B4226'; c.beginPath(); c.moveTo(-46,-124); [[-42,-160],[-30,-150],[-20,-174],[-7,-156],[5,-176],[16,-156],[28,-170],[37,-150],[47,-124]].forEach(function(p){c.lineTo(p[0],p[1]);}); c.quadraticCurveTo(0,-146,-46,-124); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='dunmore'){ c.fillStyle='#9A9A9A'; ell(-43,-124,8,14); ell(43,-124,8,14); c.beginPath(); c.moveTo(-22,-146); c.lineTo(-4,-142); c.moveTo(24,-146); c.lineTo(6,-142); c.lineWidth=5/sp.s; c.stroke(); c.lineWidth=2.6/sp.s; }
  if(kind==='anchor'){ c.fillStyle='#2b1d0e'; c.beginPath(); c.arc(0,-126,47,Math.PI*1.05,Math.PI*1.95); c.quadraticCurveTo(10,-140,-8,-150); c.quadraticCurveTo(-30,-140,-45,-130); c.closePath(); c.fill(); c.stroke(); }
  var blink=((T+sp.seed*0.7)%4.3)<0.12 && mood!=='shock';
  c.fillStyle='#fff';
  if(blink){ c.beginPath(); c.moveTo(-22,-128); c.lineTo(0,-128); c.moveTo(2,-128); c.lineTo(24,-128); c.stroke(); }
  else { ell(-11,-128,12,14); ell(13,-128,12,14); c.fillStyle=INK; var pr=mood==='shock'?2.2:3.8; circ(-6,-127,pr,true,false); circ(18,-127,pr,true,false); }
  if(kind==='priya'){ c.strokeStyle=opts.glow?'#3BFF8A':INK; c.lineWidth=3.2; if(opts.glow){ c.fillStyle='rgba(59,255,138,.35)'; circ(-11,-128,16,true,false); circ(13,-128,16,true,false); } circ(-11,-128,16,false,true); circ(13,-128,16,false,true); c.beginPath(); c.moveTo(4,-129); c.lineTo(-2,-129); c.stroke(); c.lineWidth=2.6; c.strokeStyle=INK; }
  if(kind==='dunmore'){ c.fillStyle='#4a2f17'; ell(-2,-106,14,6); ell(14,-106,10,5); }
  if(mood==='shock'){ c.fillStyle='#5a1a1a'; ell(6,-99,8,11); }
  else if(talk){ c.fillStyle='#5a1a1a'; ell(6,-100,kind==='gus'?6:10,kind==='gus'?4:7); }
  else { c.beginPath(); c.moveTo(-3,-100); c.quadraticCurveTo(6,-96,15,-101); c.stroke(); }
  c.restore();
}


function sam(x,T,talk,opts){
  opts=opts||{}; c.save(); c.translate(x,0); c.lineWidth=3; c.strokeStyle=INK; c.lineJoin='round';
  c.fillStyle='#555'; rr(-60,GY-22,26,22,4); rr(34,GY-22,26,22,4);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-38,GY-238); c.lineTo(38,GY-238); c.lineTo(22,GY-204); c.lineTo(-22,GY-204); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#9C8ADE'; circ(0,GY-112,100);
  c.fillStyle='rgba(255,255,255,.18)'; ell(-40,GY-160,30,18,true,false);
  c.fillStyle='#10301F'; rr(-54,GY-162,108,52,14);
  c.strokeStyle='#5CFF8A'; c.lineWidth=3;
  if(opts.sad){ c.beginPath(); c.arc(-22,GY-138,7,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.beginPath(); c.arc(22,GY-138,7,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.beginPath(); c.arc(0,GY-116,10,Math.PI*1.15,Math.PI*1.85); c.stroke(); }
  else { c.beginPath(); c.arc(-22,GY-134,7,Math.PI*1.1,Math.PI*1.9); c.stroke(); c.beginPath(); c.arc(22,GY-134,7,Math.PI*1.1,Math.PI*1.9); c.stroke(); if(talk){ c.fillStyle='#5CFF8A'; ell(0,-0+GY-122,9,5,true,false); } else { c.beginPath(); c.arc(0,GY-128,10,Math.PI*0.15,Math.PI*0.85); c.stroke(); } }
  c.strokeStyle=INK; c.lineWidth=3;
  c.fillStyle='#F7F3E3'; rr(-44,GY-88,88,34,6); txt('x²',0,GY-71,'600 22px "IBM Plex Mono",monospace',INK);
  c.fillStyle='#A0A0A0'; rr(88,GY-70,44,24,4); txt('OUT',110,GY-58,'12px "Luckiest Guy",sans-serif',INK);
  if(!talk && !opts.sad){ for(var n=0;n<2;n++){ var u=((T*0.5+n*0.5)%1); c.globalAlpha=1-u; txt('♪',60+n*18+u*20,GY-230-u*60,'26px serif','#6A5ACD'); c.globalAlpha=1; } }
  c.restore();
}
function samHop(x){ return {x:x,y:GY-232}; }

function glitch(x,T,talk,fixAmt,opts){
  opts=opts||{}; var fx=clamp(fixAmt); var jit=(1-fx);
  c.save(); c.translate(x+(opts.shake?Math.sin(T*50)*4:0)+(rnd(Math.floor(T*16))-.5)*8*jit,0); c.lineWidth=3; c.strokeStyle=INK; c.lineJoin='miter';
  var hue=jit>0.5?['#5CE0B8','#E05CC4','#E0D25C'][Math.floor(T*8)%3]:'#5CE0B8';
  c.fillStyle='#444'; rr(-30,GY-26,14,26,3); rr(16,GY-26,14,26,3);
  c.fillStyle=hue; c.beginPath();
  var L=-44,R=44,Tp=GY-170,B=GY-24, n=7;
  c.moveTo(L,Tp);
  for(var i=1;i<=n;i++){ var xx=lerp(L,R,i/n); var yy=Tp+((i%2)?-14:0)*jit+(rnd(i+Math.floor(T*10))-.5)*10*jit; c.lineTo(xx,yy); }
  for(var j=1;j<=n;j++){ var yy2=lerp(Tp,B,j/n); var xx2=R+((j%2)?12:0)*jit+(rnd(j+50+Math.floor(T*10))-.5)*10*jit; c.lineTo(xx2,yy2); }
  for(var k=n-1;k>=0;k--){ var xx3=lerp(L,R,k/n); var yy3=B+((k%2)?10:0)*jit; c.lineTo(xx3,yy3); }
  for(var m=n-1;m>=1;m--){ var yy4=lerp(Tp,B,m/n); var xx4=L-((m%2)?12:0)*jit-(rnd(m+80+Math.floor(T*10))-.5)*10*jit; c.lineTo(xx4,yy4); }
  c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-26,Tp-30); c.lineTo(26,Tp-30); c.lineTo(14,Tp-4); c.lineTo(-14,Tp-4); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#10301F'; rr(-32,GY-150,64,42,8);
  c.strokeStyle='#5CFF8A'; c.lineWidth=2.5;
  if(fx<0.6){ c.beginPath(); for(var q=0;q<9;q++){ var px=-26+q*6.5, py=GY-130+(rnd(q+Math.floor(T*12))-.5)*22; if(q===0) c.moveTo(px,py); else c.lineTo(px,py); } c.stroke(); }
  else { c.fillStyle='#5CFF8A'; circ(-12,GY-136,4,true,false); circ(12,GY-136,4,true,false); if(talk){ c.fillRect(-9,GY-124,18,7); } else { c.beginPath(); c.arc(0,GY-128,9,Math.PI*0.15,Math.PI*0.85); c.stroke(); } }
  c.strokeStyle=INK; c.lineWidth=3;
  if(fx>=0.6){ c.fillStyle='#F7F3E3'; rr(-30,GY-92,60,28,5); txt('+ 5',0,GY-78,'600 18px "IBM Plex Mono",monospace',INK); }
  c.restore();
}
function glitchHop(x){ return {x:x,y:GY-196}; }

/* ================= backgrounds ================= */
function bg(st,T){
  var scene=st.scene, tod=st.tod; c.lineWidth=3; c.strokeStyle=INK;
  if(scene==='hall'){
    var night=tod==='night', dusk=tod==='dusk';
    c.fillStyle=night?'#3B4A63':(dusk?'#E8B98A':'#E9DCC2'); c.fillRect(0,-40,W,H+80);
    c.fillStyle=night?'#1A2336':(dusk?'#F7A26A':'#9ED6F0'); rr(60,60,250,150,6);
    if(night){ c.fillStyle='#F4F1DE'; circ(110,100,20,true,false); c.fillStyle='#1A2336'; circ(118,94,18,true,false); }
    else { c.fillStyle=dusk?'#FF7B3D':'#FFD34D'; circ(260,110,24); }
    c.fillStyle=night?'#2B3448':'#bbb'; c.fillRect(180,120,4,90); c.fillRect(212,120,4,90); c.fillStyle=night?'#2B3448':'#D8E3E8'; rr(166,88,64,36,14); txt('SANDY FLATS',198,106,'9px "Luckiest Guy",sans-serif',night?'#8899AA':'#2A5470');
    c.strokeStyle=INK; c.beginPath(); c.moveTo(185,60); c.lineTo(185,210); c.stroke();
    var lk=night?'#2F5C6E':(dusk?'#C9785A':'#5FA7B8');
    for(var i=0;i<6;i++){ c.fillStyle=lk; rr(350+i*62,140,56,300,4); c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(356+i*62,160,44,4); c.fillRect(356+i*62,168,44,4); c.fillStyle='#ddd'; rr(392+i*62,280,8,20,2); }
    c.fillStyle=night?'#2A2F3A':'#CDBFA3'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    c.strokeStyle='rgba(0,0,0,.12)'; for(var fx=0;fx<W;fx+=70){ c.beginPath(); c.moveTo(fx,GY-14); c.lineTo(fx-30,H); c.stroke(); } c.strokeStyle=INK;
    c.fillStyle='#FFF3C4'; rr(60,250,120,70,4); txt('NO RUNNING',120,275,'14px "Luckiest Guy",sans-serif','#C0392B'); txt('(NO GLITCHING)',120,298,'13px "Patrick Hand",cursive','#555');
  } else if(scene==='class'){
    var cn=tod==='night';
    c.fillStyle='#9CC5A1'; c.fillRect(0,-40,W,H+80); c.fillStyle='#8FB894'; c.fillRect(0,300,W,H);
    c.fillStyle='#8A5A34'; rr(52,62,436,186,6); c.fillStyle='#2F4F3F'; rr(64,74,412,162,4);
    boardText(st,T);
    c.fillStyle='#fff'; circ(575,98,30); c.beginPath(); c.moveTo(575,98); c.lineTo(575,76); c.moveTo(575,98); c.lineTo(575+Math.cos(T)*16,98+Math.sin(T)*16); c.stroke();
    c.fillStyle='#FFF3C4'; rr(840,60,110,70,4); txt('MATH',895,85,'18px "Luckiest Guy",sans-serif','#C0392B'); txt('IS POWER',895,108,'16px "Luckiest Guy",sans-serif','#2E6DA4');
    c.fillStyle='#C9A27E'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
  } else if(scene==='tv'){
    c.fillStyle='#1F4E79'; c.fillRect(0,-40,W,H+80);
    c.fillStyle='#255A8A'; for(var sx=-200;sx<W;sx+=90){ c.beginPath(); c.moveTo(sx,0); c.lineTo(sx+60,0); c.lineTo(sx+260,H); c.lineTo(sx+200,H); c.closePath(); c.fill(); }
    c.fillStyle='#C0392B'; rr(40,40,190,64,8); txt('SFN NEWS',135,74,'30px "Luckiest Guy",sans-serif','#fff');
    c.fillStyle='#0d1b2a'; rr(640,50,280,210,10);
    c.fillStyle='#333'; rr(700,70,50,130,8); c.fillStyle='#FF3B3B'; circ(725,95,16); c.fillStyle='#553300'; circ(725,135,16); c.fillStyle='#3BFF6B'; circ(725,175,16);
    c.fillStyle='#E8A33D'; rr(780,170,110,40,10); c.fillStyle='#BFE3F2'; rr(800,150,60,26,6); c.fillStyle=INK; circ(805,212,11); circ(868,212,11);
    txt('?',870,130,'40px "Luckiest Guy",sans-serif','#FFD23F'); txt('?',900,150,'28px "Luckiest Guy",sans-serif','#FFD23F');
    txt('TWO COLOURS, ONE CAR',780,246,'15px "Luckiest Guy",sans-serif','#FFD23F');
  } else if(scene==='junk'){
    c.fillStyle='#F3B77A'; c.fillRect(0,-40,W,H+80);
    c.fillStyle='#FFD34D'; circ(820,90,40);
    c.fillStyle='#E8C48C'; c.beginPath(); c.moveTo(0,330); c.quadraticCurveTo(300,270,600,330); c.quadraticCurveTo(800,290,960,320); c.lineTo(960,420); c.lineTo(0,420); c.closePath(); c.fill(); c.stroke();
    var piles=[[40,GY-14,140,110,'#8A8F99'],[520,GY-14,120,80,'#A67C52'],[880,GY-14,150,120,'#7E8B6E']];
    piles.forEach(function(p){ c.fillStyle=p[4]; c.beginPath(); c.moveTo(p[0]-p[2]/2,p[1]); c.lineTo(p[0]-p[2]/4,p[1]-p[3]*0.8); c.lineTo(p[0],p[1]-p[3]); c.lineTo(p[0]+p[2]/3,p[1]-p[3]*0.6); c.lineTo(p[0]+p[2]/2,p[1]); c.closePath(); c.fill(); c.stroke(); c.fillStyle='rgba(255,255,255,.3)'; circ(p[0]-10,p[1]-p[3]*0.5,8); rr(p[0]+10,p[1]-p[3]*0.4,20,10,2); });
    c.fillStyle='#8B5A2B'; for(var fx2=0;fx2<W;fx2+=40){ c.fillRect(fx2,300,8,70); } c.fillRect(0,318,W,6); c.fillRect(0,348,W,6);
    c.fillStyle='#D9B27A'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
  }
  if(scene==='class' && tod==='night'){ c.fillStyle='rgba(20,24,52,.62)'; c.fillRect(0,-40,W,H+80); c.fillStyle='rgba(220,230,255,.10)'; c.beginPath(); c.moveTo(620,0); c.lineTo(760,0); c.lineTo(520,H); c.lineTo(300,H); c.closePath(); c.fill(); }
}
function boardText(st,T,reveal){
  var r=reveal==null?1:reveal;
  if(st.board==='def'){
    c.save(); c.beginPath(); c.rect(64,74,412*r,162); c.clip();
    txt('A FUNCTION:',270,112,'34px "Patrick Hand",cursive','#F4F4EC');
    txt('EVERY INPUT GIVES',270,156,'32px "Patrick Hand",cursive','#F4F4EC');
    txt('EXACTLY ONE OUTPUT.',270,198,'32px "Patrick Hand",cursive','#FFE27A');
    c.restore();
  } else {
    txt('What makes a rule',270,130,'36px "Patrick Hand",cursive','#F4F4EC'); txt('a rule?',270,176,'36px "Patrick Hand",cursive','#F4F4EC');
  }
}

function title(b,p,T){
  c.fillStyle='#16141F'; c.fillRect(0,-40,W,H+80);
  for(var i=0;i<40;i++){ c.fillStyle='rgba(255,255,255,'+(0.08+0.3*rnd(i+4))+')'; circ(rnd(i)*W,rnd(i+2)*H,1+rnd(i+3)*2,true,false); }
  var wob=(rnd(Math.floor(T*6))-.5)*0.03, sc=clamp(p/0.35);
  if(b.over){ c.save(); c.globalAlpha=clamp(p/0.4); txt(b.over,W/2,150,'30px "Luckiest Guy",sans-serif','#A49FB3'); c.restore(); }
  c.save(); c.translate(W/2,b.sub?235:260); c.rotate(wob); c.scale(0.6+0.4*ease(sc),0.6+0.4*ease(sc));
  c.font='104px "Luckiest Guy",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  var gl=b.title==='THE GLITCH'&&p>0.4&&p<1.6&&Math.floor(p*14)%3===0;
  c.fillStyle=INK; c.fillText(b.title,6,8); c.fillStyle=gl?'#E05CC4':'#5CE0B8'; c.fillText(b.title,gl?6:0,0);
  c.restore();
  if(b.sub){ c.save(); c.globalAlpha=clamp((p-.3)/.4); txt(b.sub,W/2,340,'34px "Luckiest Guy",sans-serif','#F2EEE6'); c.restore(); }
}

/* ================= effects ================= */
function speakerPos(F,who){ if(who==='zero') return {x:F.zx,y:GY}; var p=F.pos[who]; return p?{x:p.x,y:GY}:{x:300,y:GY}; }
function targetPos(F,tg){ var P=F.st.props; if(tg==='mux') return {hop:muxHop(P.mux.x),ro:{x:P.mux.x+60,y:GY-300},mx:P.mux.x};
  if(tg==='vend') return {hop:vendSlot(P.vend.x),ro:{x:P.vend.x-10,y:GY-310},mx:P.vend.x};
  if(tg==='sam'){ var sx=F.pos.sam?F.pos.sam.x:770; return {hop:samHop(sx),ro:{x:sx-10,y:GY-290},mx:sx}; }
  if(tg==='glitch'){ var gx=F.pos.glitch?F.pos.glitch.x:700; return {hop:glitchHop(gx),ro:{x:gx,y:GY-262},mx:gx}; } }
function roPrev(F,tg){ var r=F.pv.ro[tg]; return r||{t:'',bad:false}; }
var FX={
  skitter:{pre:function(f,q){ var o={}; if(q>2.4&&q<4.6){ o.price=['9.99','???','1.50','9.99','???'][Math.floor((q-2.4)*5)%5]; } return o; },
    post:function(f,q,F){ if(q<0||q>2.5) return; var u=clamp(q/2.2); var sl=vendSlot(F.st.props.vend.x); var x=lerp(-40,sl.x,ease(u)), y=lerp(GY-10,sl.y,u<0.7?0:ease((u-0.7)/0.3)); c.save(); c.translate(x,y); c.globalAlpha=u>0.95?1-(u-0.95)*20:1; c.strokeStyle='#5CE0B8'; c.lineWidth=4; c.beginPath(); for(var i=0;i<7;i++){ c.lineTo(i*7-24,(i%2?-10:0)+(rnd(i+Math.floor(q*20))-.5)*8); } c.stroke(); c.restore(); }},
  vend:{pre:function(f,q){ var o={}; if(q>-0.4&&q<0.3) o.press=true; if(f.item==='pigeon' && q<1.0) o.hide={doug:true}; if(f.item==='crisps'&&q<0.4) o.noCrisps=true; return o; },
    post:function(f,q,F){ if(q<0) return; var tr=vendTray(F.st.props.vend.x);
      if(f.item==='crisps'){ if(q<0.4){ var u=q/0.4; crispsBag(tr.x,lerp(GY-150,tr.y,u*u)); } }
      else { if(q>=0.2&&q<0.5){ burst(tr.x,GY-120,'COO?',0.6,'#FFFFFF'); } if(q>=0.2&&q<1.0){ var v=clamp((q-0.2)/0.6); pigeon(lerp(tr.x,F.pos.doug?F.pos.doug.x:tr.x,v),lerp(tr.y,GY,v)-Math.sin(Math.PI*v)*50,-1,F.T,false,{}); } } }},
  umbrella:{post:function(f,q,F){ if(q<0.6&&q>=0){ burst((F.pos.gus||{x:340}).x+30,GY-230,'POCKET',0.55,'#FFF3C4'); } }},
  peck:{pre:function(f,q){ return q>0&&q<2.4?{peck:true}:{}; }},
  dougStare:{post:function(f,q,F){ var k=clamp(q/0.5); c.save(); c.fillStyle='rgba(10,8,20,'+(0.75*k)+')'; c.beginPath(); c.rect(0,-40,W,H+80); var d=F.pos.doug||{x:452}; c.arc(d.x,GY-40,lerp(600,80,k),0,Math.PI*2); c.fill('evenodd'); c.restore(); if(q>0.8){ var bl=Math.floor(q*3)%3===1; if(bl){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(d.x+10,GY-62); c.lineTo(d.x+22,GY-62); c.stroke(); c.restore(); } } }},
  drop:{pre:function(f,q){ var o={keepRo:{}}; if(q<0.9) o.keepRo[f.target]=true; if(q>0.75&&q<1.05) o.gulp=f.target; return o; },
    post:function(f,q,F){ if(q<0||q>0.8) return; var sp=speakerPos(F,f.from), tg=targetPos(F,f.target); var u=q/0.8; token(lerp(sp.x+30,tg.hop.x,u),lerp(GY-150,tg.hop.y,u)-Math.sin(Math.PI*u)*120,f.label,'#2F6FA8',1-u*0.3); }},
  probe:{pre:function(f,q){ var o={keepRo:{},hide:{}}; if(q<1.0) o.keepRo[f.target]=true; if(q>=0&&q<1.7) o.hide[f.who]=true; if(f.out2&&q>=1.0&&q<f.at2) o.roOverride={tg:f.target,t:f.out,bad:!!f.bad}; if(q>0.55&&q<1.0) o.gulp=f.target; return o; },
    post:function(f,q,F){ if(q<0||q>=1.7) return; var home=speakerPos(F,f.who), tg=targetPos(F,f.target);
      var draw=function(x,y,s,r){ c.save(); c.translate(x,y); c.scale(s,s); if(f.who==='zero') zero(0,0,r,false,F.T,F.z,'shock'); else hero(0,0,1,false,'shock',F.T,{tilt:r*0.2}); c.restore(); };
      if(q<0.6){ var u=q/0.6; draw(lerp(home.x,tg.hop.x,u),lerp(GY,tg.hop.y+20,u)-Math.sin(Math.PI*u)*110,1-u*0.6,u*6); }
      else if(q>=1.1){ var v=(q-1.1)/0.6; draw(lerp(tg.mx+100,home.x,v),lerp(GY-40,GY,v)-Math.sin(Math.PI*v)*70,0.4+v*0.6,-v*6); } }},
  chalk:{post:function(f,q,F){ var r=clamp(q/3.2); if(r<1){ c.save(); c.fillStyle='#2F4F3F'; c.fillRect(64+412*r,74,412*(1-r),162); c.restore(); c.save(); c.fillStyle='#fff'; c.translate(64+412*r,120+Math.sin(q*20)*30); c.rotate(-0.5); rr(-4,-16,8,30,2); c.restore(); } }},
  snap:{post:function(f,q,F){ if(q>=0&&q<0.7) burst(420,230,'SNAP!',0.7,'#FFFFFF'); }},
  thud:{pre:function(f,q){ return (q>=0&&q<0.45)?{shakeAll:Math.sin(q*80)*(1-q/0.45)*8}:{}; },
    post:function(f,q,F){ if(q<0||q>1.4) return; var u=clamp(q/0.7); c.save(); c.translate(600,lerp(170,GY-24,u*u)); c.rotate(u*1.2); c.fillStyle='#FFF3C4'; c.strokeStyle=INK; c.lineWidth=3; rr(-22,-16,44,32,3); c.fillStyle='#E86A2C'; circ(0,0,6,true,false); c.restore(); if(q>0.05&&q<0.5) burst(300,60,'THUD',0.7,'#FFE14D'); }},
  arrows:{post:function(f,q,F){ var k=clamp((q+0.001)/0.35); if(k<=0) return; c.save(); c.globalAlpha=k;
      if(f.mode==='mini'){ var gx=(F.st.props.vend||{x:800}).x-10; arrowPanel(gx-150,40,300,150,[['4']],[['11'],['2']],[[0,0,true],[0,1,true]],null); c.restore(); return; }
      if(f.mode==='broken'){ arrowPanel(250,30,460,190,[['4']],[['11'],['2']],[[0,0,true],[0,1,true]],'NOT A FUNCTION'); }
      else { arrowPanel(250,30,460,190,[['3'],['−3'],['2'],['−2']],[['9'],['4']],[[0,0],[1,0],[2,1],[3,1]],f.mode==='stamp'?'FUNCTION ✓':null); }
      c.restore(); }},
  bow:{pre:function(f,q){ return (q>=0&&q<1.8)?{oneTilt:Math.sin(clamp(q/1.8)*Math.PI)*0.55}:{}; }},
  glitchOut:{pre:function(f,q){ return q<1.1?{hide:{glitch:true},vshake:q<0.5?Math.sin(q*60)*6:0}:{}; },
    post:function(f,q,F){ var vx=F.st.props.vend.x; if(q>=0.4&&q<1.1){ var u=(q-0.4)/0.7; c.save(); var gx=lerp(vx-10,F.pos.glitch.x,u); c.translate(0,-Math.sin(Math.PI*u)*120); glitch(gx,F.T,false,0,{}); c.restore(); } if(q>0.35&&q<1.2){ burst(vx-10,GY-300,'CRASH!',0.8,'#FFFFFF'); for(var i=0;i<14;i++){ var a=rnd(i)*Math.PI*2, d=(q-0.35)*300; c.fillStyle='rgba(200,235,255,.9)'; c.save(); c.translate(vx-10+Math.cos(a)*d,GY-190+Math.sin(a)*d+(q-0.35)*(q-0.35)*300); c.rotate(i); c.fillRect(-5,-3,10,6); c.restore(); } } }},
  snagZap:{pre:function(f,q){ var o={}; var dx=0; if(q<0.55) dx=ease(q/0.55)*70; else if(q<0.75) dx=lerp(70,20,(q-0.55)/0.2); else dx=20; o.oneDX=dx; o.capePull=q>0.5&&q<0.9?40:0; if(q<1.2) o.noOneGlitch=true; return o; },
    post:function(f,q,F){ var g=F.pos.glitch, o=F.pos.one; if(!g||!o) return; if(q>0.55&&q<0.85) burst(o.x-40,GY-200,'SNAG',0.55,'#FFFFFF'); if(q>1.1&&q<1.6){ c.save(); c.strokeStyle='#FFE14D'; c.lineWidth=5; c.beginPath(); var sx=g.x-40, sy=GY-130, ex=o.x+40, ey=GY-110; c.moveTo(sx,sy); for(var i=1;i<8;i++){ c.lineTo(lerp(sx,ex,i/8),lerp(sy,ey,i/8)+(i%2?-18:18)); } c.lineTo(ex,ey); c.stroke(); c.restore(); burst((g.x+o.x)/2,GY-260,'ZAP!',0.7,'#FFE14D'); } }},
  smooth:{pre:function(f,q){ return {glitchFix:clamp(q/1.4)}; }},
  feed3:{pre:function(f,q){ var o={keepRo:{glitch:q<0.9},roOverride:null}; if(q>=0.9) o.roOverride={tg:'glitch',t:'4 → 9',bad:false}; return o; },
    post:function(f,q,F){ var tg=targetPos(F,'glitch'); for(var i=0;i<3;i++){ var r=q-i*1.3; if(r>=0&&r<0.8){ var u=r/0.8; var sx=F.zx; token(lerp(sx,tg.hop.x,u),lerp(GY-150,tg.hop.y,u)-Math.sin(Math.PI*u)*110,'4','#2F6FA8',1-u*0.3); } if(r>=0.9&&r<1.25) burst(tg.ro.x+110,tg.ro.y,['ONE!','TWO!','THREE!'][i],0.5,'#FFF3C4'); }
      if(q>3.7){ c.save(); c.globalAlpha=clamp((q-3.7)/0.4); arrowPanel(250,30,300,150,[['4']],[['9']],[[0,0,false,true]],'SAME EVERY TIME'); c.restore(); } }},
  dip:{post:function(f,q,F){ var a=q<0.3?q/0.3:(q<1.0?1:Math.max(0,1-(q-1.0)/0.4)); if(q>1.0&&q<1.3&&Math.floor(q*30)%2===0) a=0.6; c.fillStyle='rgba(0,0,0,'+(0.82*a)+')'; c.fillRect(0,-40,W,H+80); }},
  dougLand:{pre:function(f,q){ return q<0.8?{hide:{doug:true}}:{}; },
    post:function(f,q,F){ if(q<0||q>=0.8) return; var o=F.pos.one; var d=F.pv.cast.doug; if(!o||!d) return; var u=q/0.8; var x=lerp(d.x,o.x+4,u), y=lerp(GY,GY-176,u)-Math.sin(Math.PI*u)*80; c.save(); c.translate(x,y); var fl=Math.sin(q*50); c.fillStyle='#9AA0A8'; c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(-4,-18); c.lineTo(-24,-18-18*fl); c.lineTo(-2,-10); c.closePath(); c.fill(); c.stroke(); c.restore(); pigeon(x,y,1,F.T,false,{}); }},
  crack:{post:function(f,q,F){ var r=clamp(q/3.4); crackDraw(r,F.t); }},
  blackout:{pre:function(f,q){ return {muxDark:q>1.0||(q>0.3&&Math.floor(q*10)%2===0)}; },
    post:function(f,q,F){ if(q>1.2){ c.fillStyle='rgba(0,0,0,'+clamp((q-1.2)/1.2)+')'; c.fillRect(0,-40,W,H+80); } }}
};
function crispsBag(x,y){ c.save(); c.translate(x,y); c.fillStyle='#F5C518'; c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(-18,-14); c.lineTo(18,-14); c.lineTo(16,14); c.lineTo(-16,14); c.closePath(); c.fill(); c.stroke(); txt('CRISPS',0,1,'9px "Luckiest Guy",sans-serif','#C0392B'); c.restore(); }
function arrowPanel(x,y,w,h,ins,outs,links,stamp){
  c.save(); c.fillStyle='#FFFDF6'; c.strokeStyle=INK; c.lineWidth=3; rr(x,y,w,h,14);
  var lx=x+w*0.22, rx=x+w*0.78, cy=y+h/2+8;
  txt('INPUTS',lx,y+20,'15px "Luckiest Guy",sans-serif','#7C5CD6'); txt('OUTPUTS',rx,y+20,'15px "Luckiest Guy",sans-serif','#C4541B');
  var ih=Math.max(40,ins.length*30+16), oh=Math.max(40,outs.length*30+16);
  c.strokeStyle='#7C5CD6'; ell(lx,cy,w*0.13,ih/2,false,true); c.strokeStyle='#C4541B'; ell(rx,cy,w*0.13,oh/2,false,true);
  var iy=function(i){ return cy-(ins.length-1)*15+i*30; }, oy=function(i){ return cy-(outs.length-1)*15+i*30; };
  ins.forEach(function(v,i){ txt(v[0],lx,iy(i),'600 20px "IBM Plex Mono",monospace',INK); });
  outs.forEach(function(v,i){ txt(v[0],rx,oy(i),'600 20px "IBM Plex Mono",monospace',INK); });
  links.forEach(function(L){ var bad=L[2], gold=L[3]; c.strokeStyle=bad?'#D12F2F':(gold?'#E5A800':'#2E6DA4'); c.lineWidth=gold?5:3; var sx=lx+24, sy=iy(L[0]), ex=rx-24, ey=oy(L[1]); c.beginPath(); c.moveTo(sx,sy); c.lineTo(ex,ey); c.stroke(); var a=Math.atan2(ey-sy,ex-sx); c.beginPath(); c.moveTo(ex,ey); c.lineTo(ex-12*Math.cos(a-0.4),ey-12*Math.sin(a-0.4)); c.lineTo(ex-12*Math.cos(a+0.4),ey-12*Math.sin(a+0.4)); c.closePath(); c.fillStyle=c.strokeStyle; c.fill(); });
  if(stamp){ c.save(); c.translate(x+w/2,y+h-22); c.rotate(-0.06); var good=stamp.indexOf('NOT')<0; c.strokeStyle=good?'#2F8F4E':'#D12F2F'; c.lineWidth=3; c.font='22px "Luckiest Guy",sans-serif'; var tw=c.measureText(stamp).width+24; rr(-tw/2,-16,tw,32,6,false,true); txt(stamp,0,1,'22px "Luckiest Guy",sans-serif',good?'#2F8F4E':'#D12F2F'); c.restore(); }
  c.restore();
}

/* ================= FILM 3 engine: characters, sets, effects, render ================= */
CH.gusC={skin:'#FFDBAC',shirt:'#F4F4F4',pants:'#4A6B3A',s:.84,seed:11,kind:'gus',noCoat:true,curtain:true};
var GOLD='#FFD23F', GOLDD='#C9981A';

function kid(k,x,y,f,talk,mood,walk,T,opts){
  opts=opts||{}; var sp=CH[k], kind=sp.kind||k; c.save();
  var bob=walk?-Math.abs(Math.sin(T*9))*8:0;
  c.translate(x,y+bob); c.scale(sp.s*f*(opts.sc||1),sp.s*(opts.sc||1));
  c.rotate((rnd(Math.floor(T*6)+sp.seed)-.5)*0.045+(opts.rot||0));
  c.lineWidth=2.6/sp.s; c.strokeStyle=INK; c.lineJoin='round'; c.lineCap='round';
  if(sp.curtain){ c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(-30,-92); c.lineTo(30,-92); c.lineTo(46,-6); c.quadraticCurveTo(0,4,-46,-6); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#FFD23F'; [[-34,-30],[-20,-58],[28,-40],[36,-16],[-38,-12],[18,-70]].forEach(function(d){ ell(d[0],d[1],5,4,true,false); circ(d[0]+4,d[1]-4,2.6,true,false); }); c.strokeStyle='#9EC9E8'; c.lineWidth=1.5; for(var r=0;r<5;r++){ c.beginPath(); c.moveTo(-28+r*14,-92); c.lineTo(-40+r*20,-8); c.stroke(); } c.strokeStyle=INK; c.lineWidth=2.6/sp.s; }
  c.fillStyle=sp.pants; rr(-18,-26,12,26,3); rr(6,-26,12,26,3);
  c.fillStyle=INK; ell(-13,-2,12,5); ell(13,-2,12,5);
  c.fillStyle=sp.shirt; c.beginPath(); c.moveTo(-35,-20); c.lineTo(35,-20); c.lineTo(27,-86); c.lineTo(-27,-86); c.closePath(); c.fill(); c.stroke();
  if(kind==='dunmore'){ c.fillStyle='#C0392B'; c.beginPath(); c.moveTo(-6,-84); c.lineTo(6,-84); c.lineTo(9,-44); c.lineTo(0,-36); c.lineTo(-9,-44); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='anchor'){ c.fillStyle='#fff'; c.beginPath(); c.moveTo(-12,-86); c.lineTo(12,-86); c.lineTo(0,-60); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#2E6DA4'; c.beginPath(); c.moveTo(-3,-80); c.lineTo(3,-80); c.lineTo(5,-58); c.lineTo(-5,-58); c.closePath(); c.fill(); }
  if(kind==='gus'&&sp.noCoat){ c.strokeStyle='#F39C34'; c.lineWidth=6/sp.s; circ(0,-56,11,false,true); c.strokeStyle=INK; c.lineWidth=2.6/sp.s; }
  if(sp.curtain){ c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(-10,-90); c.lineTo(10,-90); c.lineTo(4,-80); c.lineTo(-4,-80); c.closePath(); c.fill(); c.stroke(); circ(0,-86,4); }
  if(kind==='marcus'){ c.fillStyle='#fff'; rr(-12,-66,24,12,3); }
  c.fillStyle=sp.shirt; ell(-35,-56,9,22);
  if(opts.candle){ c.save(); c.translate(35,-72); c.rotate(-2.4); ell(0,18,9,22); c.restore(); c.fillStyle=sp.skin; circ(44,-104,7); c.fillStyle='#FFF6D6'; rr(40,-132,8,26,2); c.fillStyle='#FFB02E'; c.beginPath(); c.ellipse(44,-140+Math.sin(T*20),4,8,0,0,Math.PI*2); c.fill(); }
  else if(opts.mug){ ell(35,-56,9,22); c.fillStyle=sp.skin; circ(36,-34,7); c.fillStyle='#fff'; rr(30,-50,18,20,3); }
  else { ell(35,-56,9,22); c.fillStyle=sp.skin; circ(36,-34,7); }
  c.fillStyle=sp.skin; circ(-36,-34,7);
  c.fillStyle=sp.skin; circ(0,-126,45);
  if(kind==='priya'){ c.fillStyle='#1d1d1d'; circ(-46,-138,16); c.beginPath(); c.arc(0,-126,47,Math.PI*1.0,Math.PI*2.0); c.lineTo(42,-134); c.quadraticCurveTo(8,-150,-46,-124); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='marcus'&&opts.noHelmet){ c.fillStyle='#6B4226'; c.beginPath(); c.arc(0,-128,46,Math.PI*1.05,Math.PI*1.95); c.quadraticCurveTo(20,-150,0,-146); c.quadraticCurveTo(-20,-150,-44,-136); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#6B4226'; c.beginPath(); c.moveTo(-8,-170); c.lineTo(0,-186); c.lineTo(6,-170); c.closePath(); c.fill(); c.stroke(); }
  var eyesHidden=false;
  if(kind==='marcus'&&!opts.noHelmet){ c.save(); var hb=opts.helmetBack; if(opts.helmetRot) { c.translate(0,-130); c.rotate(opts.helmetRot); c.translate(0,130); } if(hb){ c.translate(0,16); eyesHidden=true; }
    c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,-130,49,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.fillStyle='#fff'; c.fillRect(hb?-30:-6,-178,12,48); c.beginPath(); c.arc(0,-130,49,Math.PI,Math.PI*2); c.closePath(); c.stroke();
    if(!hb){ c.beginPath(); c.moveTo(-44,-130); c.lineTo(-30,-96); c.moveTo(44,-130); c.lineTo(30,-96); c.stroke(); } else { c.fillStyle='#333'; rr(10,-136,34,8,3); }
    c.restore(); }
  if(kind==='gus'){ c.fillStyle='#6B4226'; c.beginPath(); c.moveTo(-46,-124); [[-42,-160],[-30,-150],[-20,-174],[-7,-156],[5,-176],[16,-156],[28,-170],[37,-150],[47,-124]].forEach(function(p){c.lineTo(p[0],p[1]);}); c.quadraticCurveTo(0,-146,-46,-124); c.closePath(); c.fill(); c.stroke(); }
  if(kind==='dunmore'){ c.fillStyle='#9A9A9A'; ell(-43,-124,8,14); ell(43,-124,8,14); c.beginPath(); c.moveTo(-22,-146); c.lineTo(-4,-142); c.moveTo(24,-146); c.lineTo(6,-142); c.lineWidth=5/sp.s; c.stroke(); c.lineWidth=2.6/sp.s; }
  if(kind==='anchor'){ c.fillStyle='#2b1d0e'; c.beginPath(); c.arc(0,-126,47,Math.PI*1.05,Math.PI*1.95); c.quadraticCurveTo(10,-140,-8,-150); c.quadraticCurveTo(-30,-140,-45,-130); c.closePath(); c.fill(); c.stroke(); }
  var blink=((T+sp.seed*0.7)%4.3)<0.12 && mood!=='shock';
  if(!eyesHidden){
    c.fillStyle='#fff';
    if(blink){ c.beginPath(); c.moveTo(-22,-128); c.lineTo(0,-128); c.moveTo(2,-128); c.lineTo(24,-128); c.stroke(); }
    else { ell(-11,-128,12,14); ell(13,-128,12,14); c.fillStyle=INK; var pr=mood==='shock'?2.2:3.8; var lk=opts.look||0; circ(-6+lk,-127,pr,true,false); circ(18+lk,-127,pr,true,false); }
    if(kind==='priya'){ c.strokeStyle=INK; c.lineWidth=3.2; circ(-11,-128,16,false,true); circ(13,-128,16,false,true); c.beginPath(); c.moveTo(4,-129); c.lineTo(-2,-129); c.stroke(); c.lineWidth=2.6; }
  }
  if(kind==='dunmore'){ c.fillStyle='#4a2f17'; ell(-2,-106,14,6); ell(14,-106,10,5); }
  if(mood==='shock'){ c.fillStyle='#5a1a1a'; ell(6,-99,8,11); }
  else if(talk){ c.fillStyle='#5a1a1a'; ell(6,-100,kind==='gus'?6:10,kind==='gus'?4:7); }
  else { c.beginPath(); c.moveTo(-3,-100); c.quadraticCurveTo(6,-96,15,-101); c.stroke(); }
  c.restore();
}
function hero(x,y,f,talk,mood,T,opts){
  opts=opts||{};
  c.save(); c.translate(x+(opts.jit?(rnd(Math.floor(T*24))-.5)*6:0),y); c.rotate((rnd(Math.floor(T*6)+41)-.5)*0.04+(opts.tilt||0));
  c.lineWidth=2.8; c.strokeStyle=INK; c.lineJoin='round'; c.lineCap='round';
  var fl=Math.sin(T*7)*10+(opts.capePull||0), fu=opts.flare||0;
  c.fillStyle='#D62828'; c.beginPath(); c.moveTo(-18,-160); c.quadraticCurveTo(-64-fl-fu*20,-96-fu*120,-78-fl-fu*40,-6-fu*190); c.lineTo(-40-fl*.5-fu*10,-12-fu*170); c.lineTo(-14,-8-fu*60); c.lineTo(18,-160); c.closePath(); c.fill(); c.stroke();
  var body='#2F5BD6';
  c.fillStyle=body; c.beginPath(); c.moveTo(-24,-180); c.lineTo(24,-180); c.lineTo(24,-24); c.lineTo(42,-24); c.lineTo(42,0); c.lineTo(-42,0); c.lineTo(-42,-24); c.lineTo(-24,-24); c.lineTo(-24,-152); c.lineTo(-48,-138); c.lineTo(-56,-156); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFD23F'; rr(-24,-66,48,10,2); circ(0,-94,14); if(!opts.blank) txt('1',0,-93,'20px "Luckiest Guy",sans-serif','#D62828'); else { c.fillStyle='rgba(255,143,184,.8)'; circ(4,-90,5,true,false); circ(-5,-97,3,true,false); }
  c.fillStyle=body; c.strokeStyle=INK;
  c.beginPath(); c.moveTo(24,-140); c.lineTo(48,-106); c.lineTo(24,-80); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-24,-128); c.lineTo(-44,-100); c.lineTo(-24,-78); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#fff'; circ(46,-106,7); circ(-42,-100,7);
  c.fillStyle=INK; rr(-27,-170,54,18,7);
  var blink=((T+2.1)%4.6)<0.12;
  if(!blink){ c.fillStyle='#fff'; ell(-10,-161,8,5.5,true,false); ell(12,-161,8,5.5,true,false); if(!opts.blank){ c.fillStyle=INK; var pr=mood==='shock'?1.5:2.6; circ(-10+3*f,-161,pr,true,false); circ(12+3*f,-161,pr,true,false); } }
  c.strokeStyle=INK;
  if(mood==='shock'){ c.fillStyle='#5a1a1a'; ell(4,-134,6,9); }
  else if(talk){ c.fillStyle='#5a1a1a'; ell(4,-136,9,6); c.fillStyle='#fff'; c.fillRect(-3,-140,14,3); }
  else if(opts.blank){ c.beginPath(); c.moveTo(-4,-136); c.lineTo(12,-136); c.stroke(); }
  else { c.beginPath(); c.moveTo(-6,-137); c.quadraticCurveTo(4,-131,15,-139); c.stroke(); }
  if(opts.dizzy){ for(var i=0;i<3;i++){ var a=T*5+i*2.1; star(Math.cos(a)*34,-196+Math.sin(a)*8,7,'#FFE14D'); } }
  c.restore();
}
function pigeon(x,y,f,T,talk,opts){
  opts=opts||{}; var sc=(opts.sc||1)*(opts.puff?1.25:1); c.save(); c.translate(x,y); c.scale(f*sc,sc);
  c.lineWidth=2.2; c.strokeStyle=INK; c.lineJoin='round';
  var bob=Math.sin(T*9)*2 + (opts.peck?Math.max(0,Math.sin(T*18))*9:0);
  c.strokeStyle='#E07A7A'; c.lineWidth=2.5; c.beginPath(); c.moveTo(-4,-8); c.lineTo(-6,0); c.moveTo(4,-8); c.lineTo(6,0); c.stroke(); c.strokeStyle=INK; c.lineWidth=2.2;
  c.fillStyle='#9AA0A8'; ell(0,-18,19,12);
  c.fillStyle='#7F868F'; ell(-6,-18,11,7,true,false); c.beginPath(); c.moveTo(-18,-20); c.lineTo(-30,-14); c.lineTo(-17,-12); c.closePath(); c.fill(); c.stroke();
  if(opts.duck){ c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(8,-28); c.quadraticCurveTo(-6,-30,-20,-12); c.lineTo(-6,-6); c.quadraticCurveTo(4,-14,12,-20); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#FFD23F'; circ(-6,-16,2.4,true,false); circ(2,-22,2,true,false); }
  c.save(); c.translate(14,-30+bob); c.fillStyle='#6E7580'; circ(0,0,9); c.fillStyle='#6DBE8C'; ell(-4,8,6,4,true,false); c.fillStyle='#E8A33D'; c.beginPath(); c.moveTo(8,-1); c.lineTo(talk?16:15,talk?-3:1); c.lineTo(8,3); c.closePath(); c.fill(); c.stroke(); if(talk){ c.beginPath(); c.moveTo(8,3); c.lineTo(15,6); c.lineTo(8,4); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle='#FF8C1A'; circ(3,-2,3,true,false); c.fillStyle=INK; circ(3.5,-2,1.4,true,false); c.restore();
  c.restore();
}

/* ---------- new characters ---------- */
function mux3(x,T,talk,o){
  o=o||{}; var top=GY-210;
  c.save(); c.translate(x+(o.shake||0),0); c.lineWidth=3; c.strokeStyle=INK; c.lineJoin='round';
  c.fillStyle='#555'; rr(-92,GY-20,24,20,3); rr(68,GY-20,24,20,3);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-108,top-40); c.lineTo(-34,top-40); c.lineTo(-52,top+2); c.lineTo(-90,top+2); c.closePath(); c.fill(); c.stroke();
  if(o.cheese){ c.fillStyle='#FFD23F'; c.beginPath(); c.moveTo(-96,top-40); c.lineTo(-50,top-40); c.lineTo(-80,top-70); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#E5B800'; circ(-72,top-48,4,true,false); circ(-82,top-45,2.5,true,false); }
  else txt('IN',-71,top-24,'16px "Luckiest Guy",sans-serif',INK);
  c.fillStyle='#8FB8C9'; rr(-115,top,230,192,16);
  c.fillStyle='#10301F'; rr(-56,top+14,112,50,10);
  if(o.screen){ txt(o.screen,0,top+40,'600 32px "IBM Plex Mono",monospace','#5CFF8A'); }
  else if(o.sleep){ c.strokeStyle='#5CFF8A'; c.lineWidth=3; c.beginPath(); c.moveTo(-30,top+34); c.lineTo(-14,top+34); c.moveTo(14,top+34); c.lineTo(30,top+34); c.stroke(); c.fillStyle='#5CFF8A'; c.fillRect(-10,top+50,20,3); c.strokeStyle=INK; c.lineWidth=3; }
  else if(o.bad){ c.strokeStyle='#FF6B5B'; c.lineWidth=3; [-22,22].forEach(function(ex,i){ c.beginPath(); for(var k=0;k<14;k++){ var a=k*0.6+T*(i?-8:8), r=1+k*0.5; c.lineTo(ex+Math.cos(a)*r,top+33+Math.sin(a)*r); } c.stroke(); }); c.fillStyle='#FF6B5B'; if(talk) c.fillRect(-15,top+46,30,10); else c.fillRect(-15,top+50,30,3); c.strokeStyle=INK; c.lineWidth=3; }
  else { c.fillStyle='#5CFF8A'; circ(-22,top+33,6,true,false); circ(22,top+33,6,true,false); if(talk) c.fillRect(-15,top+46,30,10); else c.fillRect(-15,top+50,30,3); }
  for(var i=0;i<2;i++){ var px=i===0?-97:12, py=top+80; c.fillStyle='#F7F3E3'; rr(px,py,85,62,6); txt(i===0?'× 4':'− 3',px+42,py+33,'600 28px "IBM Plex Mono",monospace',INK); }
  for(var j=0;j<3;j++){ var on=!o.sleep&&Math.floor(T*3+j)%3===0; c.fillStyle=on?['#FF5B5B','#FFD23F','#5CFF8A'][j]:'#39404a'; circ(-30+j*30,top+162,7); }
  var pl=o.plate==null?1:o.plate;
  if(o.gold){ c.save(); c.fillStyle='rgba(255,210,63,.35)'; c.shadowColor=GOLD; c.shadowBlur=18; rr(-80,top+172,160,22,6,true,false); c.restore(); txt('m(x) = 4x − 3',0,top+183,'600 15px "IBM Plex Mono",monospace','#7A4F00'); }
  else if(o.blank){ c.fillStyle='rgba(255,143,184,.55)'; ell(-20,top+182,26,6,true,false); ell(24,top+183,20,5,true,false); }
  else { c.save(); c.beginPath(); c.rect(-80+160*(1-pl),top+170,160*pl,26); c.clip(); txt('MULTIPLEX 4000',0,top+182,'13px "Luckiest Guy",sans-serif','rgba(0,0,0,.55)'); c.restore(); if(pl<1){ c.fillStyle='rgba(255,143,184,.55)'; ell(-80+160*(1-pl)-10,top+182,22,6,true,false); } }
  c.fillStyle='#A0A0A0'; rr(112,GY-80,50,28,4); txt('OUT',137,GY-66,'13px "Luckiest Guy",sans-serif',INK);
  c.fillStyle='rgba(30,30,30,.28)'; ell(-60,top+40,26,14,true,false); ell(70,top+120,22,12,true,false);
  c.save(); c.translate(60,top+30); c.rotate(.5); c.fillStyle='#fff'; rr(-40,-9,80,18,4); c.rotate(-1); rr(-40,-9,80,18,4); c.restore();
  c.restore();
}
function muxHopper(x){ return {x:x-71,y:GY-250}; }
function effie(x,y,T,talk,o){
  o=o||{}; c.save(); c.translate(x,y-(o.hop?Math.abs(Math.sin(T*10))*16:0)); var s=o.sc||1; c.scale(s*(o.f||1),s); c.rotate((rnd(Math.floor(T*6)+71)-.5)*0.07);
  c.lineCap='round'; c.lineJoin='round';
  function fp(){ c.beginPath(); c.moveTo(0,-4); c.lineTo(0,-56); c.quadraticCurveTo(0,-82,24,-78); c.moveTo(-17,-38); c.lineTo(17,-38); }
  c.strokeStyle=INK; c.lineWidth=27; fp(); c.stroke(); c.strokeStyle='#F6E7C1'; c.lineWidth=20; fp(); c.stroke();
  c.fillStyle=INK; ell(-7,0,8,4); ell(8,0,8,4);
  c.lineWidth=2; c.strokeStyle=INK; c.fillStyle='#fff'; circ(-5,-58,5.2); circ(6,-58,5.2); c.fillStyle=INK; circ(-4,-58,1.9,true,false); circ(7,-58,1.9,true,false);
  if(talk){ c.fillStyle='#5a1a1a'; ell(1,-47,3.6,2.8); } else { c.beginPath(); c.arc(1,-49,3,0.2,Math.PI-0.2); c.stroke(); }
  c.fillStyle='rgba(255,140,140,.5)'; circ(-9,-50,2.5,true,false); circ(10,-50,2.5,true,false);
  c.save(); c.translate(19,-41); c.rotate(-0.5); c.fillStyle='#FFFFFF'; c.lineWidth=1.5; ell(0,-13,4.5,12); c.beginPath(); c.moveTo(0,2); c.lineTo(0,-26); c.stroke(); c.restore();
  if(!o.noLamp){ c.save(); c.translate(24,-84); c.fillStyle='#2E6DA4'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-7,0); c.lineTo(7,0); c.lineTo(3,-9); c.lineTo(-3,-9); c.closePath(); c.fill(); c.stroke(); c.fillStyle='rgba(255,240,170,.28)'; c.beginPath(); c.moveTo(-7,0); c.lineTo(7,0); c.lineTo(18,32); c.lineTo(-18,32); c.closePath(); c.fill(); c.restore(); }
  c.restore();
}
function eraserC(x,y,T,talk,o){
  o=o||{}; var s=(o.sc||1)*(o.small?0.5:1); c.save(); c.translate(x,y); c.scale(s*(o.f||1),s); var sq=o.squash||0; c.scale(1+sq*0.25,1-sq*0.25); c.rotate((o.rot!=null?o.rot:Math.sin(T*5)*0.08)+(o.bow?0.55:0));
  c.lineWidth=3; c.strokeStyle=INK; c.lineCap='round';
  c.beginPath(); c.moveTo(-26,-2); c.lineTo(-30,12); c.moveTo(26,-2); c.lineTo(30,12); c.stroke();
  c.fillStyle='#FF8FB8'; rr(-42,-52,84,52,12); c.fillStyle='#E86A98'; rr(-40,-20,80,18,7,true,false); rr(-42,-52,84,52,12,false,true);
  c.beginPath(); c.moveTo(-42,-28); c.lineTo(-58,-38+Math.sin(T*8)*5); c.moveTo(42,-28); c.lineTo(58,-38-Math.sin(T*8)*5); c.stroke();
  c.fillStyle='#fff'; ell(-15,-34,8,7); ell(15,-34,8,7); c.fillStyle=INK; circ(-13,-33,3,true,false); circ(13,-33,3,true,false);
  c.lineWidth=3.5; c.beginPath(); c.moveTo(-26,-46); c.lineTo(-7,-40); c.moveTo(26,-46); c.lineTo(7,-40); c.stroke(); c.lineWidth=3;
  if(talk){ c.fillStyle='#5a1a1a'; ell(0,-13,14,7); c.fillStyle='#fff'; c.fillRect(-10,-18,20,3); } else { c.fillStyle='#fff'; c.beginPath(); c.moveTo(-17,-17); c.quadraticCurveTo(0,-3,17,-17); c.closePath(); c.fill(); c.stroke(); c.beginPath(); for(var t=-12;t<=12;t+=6){ c.moveTo(t,-15); c.lineTo(t,-9+Math.abs(t)*0.25); } c.stroke(); }
  if(o.cheese){ c.fillStyle='#FFD23F'; c.beginPath(); c.moveTo(-20,-52); c.lineTo(22,-52); c.lineTo(-6,-78); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#E5B800'; circ(0,-60,3.5,true,false); circ(-9,-57,2.2,true,false); }
  if(o.card){ c.save(); c.translate(52,-60); c.rotate(-0.2); c.fillStyle=GOLD; c.shadowColor=GOLD; c.shadowBlur=20; rr(-22,-30,44,60,4); c.restore(); }
  c.restore();
}
function littleF(x,T,talk,o){
  o=o||{}; c.save(); c.translate(x,GY); var wob=o.wind?Math.sin(T*24)*2:0; c.rotate((rnd(Math.floor(T*6)+81)-.5)*0.05+(o.angry?Math.sin(T*30)*0.04:0));
  c.strokeStyle=INK; c.lineWidth=3; c.lineJoin='round'; c.fillStyle='#555'; rr(-28,-14,18,14,3); rr(10,-14,18,14,3);
  c.fillStyle=o.angry?'#E8412C':'#7FB3D5'; rr(-40,-102+wob,80,88,12);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-22,-126+wob); c.lineTo(22,-126+wob); c.lineTo(12,-102+wob); c.lineTo(-12,-102+wob); c.closePath(); c.fill(); c.stroke();
  c.save(); c.translate(-44,-62+wob); c.rotate(T*(o.wind?14:2)); c.fillStyle='#E8B25A'; c.fillRect(-14,-3,14,6); c.strokeRect(-14,-3,14,6); ell(-18,-7,5,8); ell(-18,7,5,8); c.restore();
  c.fillStyle='#10301F'; rr(-28,-94+wob,56,30,6);
  if(o.angry){ c.fillStyle='#FFB3A8'; c.save(); c.translate(-12,-82+wob); c.rotate(0.35); c.fillRect(-6,-2,12,4); c.restore(); c.save(); c.translate(12,-82+wob); c.rotate(-0.35); c.fillRect(-6,-2,12,4); c.restore(); c.fillRect(-8,talk?-74+wob:-72+wob,16,talk?6:2); }
  else if(o.named){ c.fillStyle='#5CFF8A'; circ(-10,-82+wob,4.5,true,false); circ(10,-82+wob,4.5,true,false); if(talk) c.fillRect(-7,-74+wob,14,6); else { c.strokeStyle='#5CFF8A'; c.lineWidth=2.5; c.beginPath(); c.arc(0,-76+wob,7,0.2,Math.PI-0.2); c.stroke(); c.strokeStyle=INK; c.lineWidth=3; } }
  else { c.fillStyle='#2c5a3c'; c.fillRect(-14,-80+wob,28,2); }
  c.fillStyle=o.named?'#FFF3C4':'#DDE2E8'; rr(-47,-58+wob,94,26,5); if(o.named) txt('f(x) = x + 4',0,-45+wob,'600 13px "IBM Plex Mono",monospace',INK);
  c.restore();
}
function lfHopper(x){ return {x:x,y:GY-126}; }
function machBig(k,x,T,talk,o){
  o=o||{}; var col=k==='machf'?'#E8743B':'#2BB3A3', dk=k==='machf'?'#B85A2B':'#1E8579', br=Math.sin(T*3+(k==='machf'?0:1.3))*3;
  c.save(); c.translate(x+(o.dx||0),GY+(o.dy||0)); c.strokeStyle=INK; c.lineWidth=3.5; c.lineJoin='round';
  c.fillStyle='#444'; rr(-52,-30,36,30,5); rr(16,-30,36,30,5);
  c.fillStyle=dk;
  if(o.flex){ rr(-106,-240,34,90,14); rr(72,-240,34,90,14); circ(-89,-246,24); circ(89,-246,24); }
  else if(o.hug){ rr(-40,-190,120,30,12); }
  else { rr(-98,-196+br,30,126,12); rr(68,-196+br,30,126,12); c.fillStyle='#555'; circ(-83,-66+br,15); circ(83,-66+br,15); }
  c.fillStyle=col; rr(-72,-234+br,144,204,18);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-36,-266+br); c.lineTo(36,-266+br); c.lineTo(22,-234+br); c.lineTo(-22,-234+br); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#10301F'; rr(-48,-216+br,96,48,10);
  var ec=o.named?'#5CFF8A':'#FFB347'; c.fillStyle=ec;
  if(o.named&&!o.flex){ circ(-20,-194+br,6,true,false); circ(20,-194+br,6,true,false); } else { c.save(); c.translate(-20,-198+br); c.rotate(0.3); c.fillRect(-11,-3,22,6); c.restore(); c.save(); c.translate(20,-198+br); c.rotate(-0.3); c.fillRect(-11,-3,22,6); c.restore(); }
  if(talk) c.fillRect(-16,-184+br,32,9); else c.fillRect(-16,-180+br,32,3);
  c.fillStyle=o.named?'#FFF3C4':'#D9D2C6'; rr(-64,-150+br,128,40,6);
  if(o.named){ if(o.glow){ c.save(); c.shadowColor=GOLD; c.shadowBlur=20; c.fillStyle='rgba(255,210,63,.4)'; rr(-64,-150+br,128,40,6,true,false); c.restore(); } txt(k==='machf'?'f(x) = 3x − 1':'g(x) = 10 − x',0,-130+br,'600 13px "IBM Plex Mono",monospace',INK); }
  else { c.fillStyle='rgba(255,143,184,.6)'; ell(-18,-130+br,30,8,true,false); ell(24,-128+br,20,6,true,false); }
  if(o.helmet){ c.save(); c.translate(0,-266+br); c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,0,26,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#fff'; c.fillRect(-4,-26,8,26); c.restore(); }
  c.restore();
}
function machHopper(x){ return {x:x,y:GY-266}; }
function eraseBall(x,T,o,tm){
  o=o||{}; c.save(); c.translate(x,0); c.strokeStyle=INK; c.lineWidth=3;
  var s=o.deflate==null?1:o.deflate;
  if(s>0.02){ c.save(); c.translate(0,GY-120); c.scale(s,s); c.rotate(o.spin||0);
    c.fillStyle='#FF8FB8'; circ(0,0,66); c.fillStyle='rgba(255,255,255,.35)'; ell(-24,-26,18,10,true,false);
    txt('ERASE-O-MATIC',0,-36,'14px "Luckiest Guy",sans-serif','#8A1F4B');
    c.fillStyle='#2A2A30'; rr(-40,-14,80,44,6); var col=o.ok?'#5CFF8A':(o.wrong?'#FF5B5B':(tm<=5&&Math.floor(T*6)%2?'#FF5B5B':'#FFE14D'));
    txt('0:'+String(Math.max(0,Math.ceil(tm))).padStart(2,'0'),0,2,'600 18px "IBM Plex Mono",monospace',col);
    for(var k=0;k<5;k++){ c.fillStyle='#D9DDE3'; rr(-34+k*14,18,10,8,2,true,false); }
    c.restore(); }
  c.restore();
}
function lockZoom(o,tm,T){
  c.save(); c.translate(600,30); c.fillStyle='#2A2A30'; c.strokeStyle=INK; c.lineWidth=4; rr(0,0,330,170,14); c.fillStyle='#0F2A1C'; rr(14,14,302,110,8);
  var col=o.ok?'#5CFF8A':(o.wrong?'#FF5B5B':'#5CFF8A');
  txt('f(x) = 2x + 1',165,38,'600 20px "IBM Plex Mono",monospace','#5CFF8A');
  if(o.ok){ txt('f(5) = 2 × 5 + 1 = 11 ✓',165,72,'600 18px "IBM Plex Mono",monospace','#FFFFFF'); }
  else if(o.wrong){ txt('f(11) = 2 × 11 + 1 = 23',165,72,'600 18px "IBM Plex Mono",monospace','#FF5B5B'); txt('NOT 11!',165,100,'18px "Luckiest Guy",sans-serif','#FF5B5B'); }
  else { txt('f( ? ) = 11',165,72,'600 22px "IBM Plex Mono",monospace','#FFE14D'); txt('ENTER THE INPUT',165,102,'14px "Luckiest Guy",sans-serif','#8BE6A8'); }
  var tc=tm<=5?'#FF5B5B':'#FFE14D'; txt('0:'+String(Math.max(0,Math.ceil(tm))).padStart(2,'0'),60,148,'600 24px "IBM Plex Mono",monospace',tc);
  for(var k=0;k<5;k++){ c.fillStyle='#D9DDE3'; c.strokeStyle=INK; c.lineWidth=2; rr(128+k*38,134,30,26,4); txt(String(k===4?5:k+1),143+k*38,147,'600 14px "IBM Plex Mono",monospace',INK); }
  c.restore();
}
function panel(x,y,lines,o){
  o=o||{}; c.save(); c.font='600 26px "IBM Plex Mono",monospace'; var w=0; lines.forEach(function(l){ w=Math.max(w,c.measureText(l).width); }); w+=44; var h=lines.length*38+22;
  c.translate(x,y); if(o.sc) c.scale(o.sc,o.sc); c.globalAlpha=o.alpha==null?1:o.alpha;
  c.fillStyle='#1E1A2A'; c.strokeStyle=GOLD; c.lineWidth=4; c.shadowColor='rgba(255,210,63,.6)'; c.shadowBlur=18; rr(-w/2,0,w,h,12); c.shadowBlur=0;
  lines.forEach(function(l,i){ txt(l,0,30+i*38,'600 26px "IBM Plex Mono",monospace',GOLD); });
  c.restore();
}
function goldText(s,x,y,size,o){ o=o||{}; c.save(); c.translate(x,y); if(o.rot) c.rotate(o.rot); if(o.sc!=null) c.scale(o.sc,o.sc); c.globalAlpha=o.alpha==null?1:o.alpha; c.font='600 '+size+'px "IBM Plex Mono",monospace'; c.textAlign='center'; c.textBaseline='middle'; if(!o.noPlate){ var tw=c.measureText(s).width; c.fillStyle='rgba(20,14,28,.72)'; rr(-tw/2-14,-size*0.72,tw+28,size*1.44,size*0.4,true,false); } c.shadowColor=GOLD; c.shadowBlur=22; c.lineWidth=5; c.strokeStyle='#5a3d00'; c.strokeText(s,0,0); c.fillStyle=GOLD; c.fillText(s,0,0); c.restore(); }
function miniGrid(x,y,w,h,xr,yr,o){
  o=o||{}; c.save(); c.translate(x,y); c.fillStyle='rgba(20,16,30,.85)'; c.strokeStyle=GOLD; c.lineWidth=3; rr(0,0,w,h,10);
  var px=function(v){ return 24+(v-xr[0])/(xr[1]-xr[0])*(w-40); }, py=function(v){ return h-22-(v-yr[0])/(yr[1]-yr[0])*(h-40); };
  c.strokeStyle='rgba(255,210,63,.18)'; c.lineWidth=1; for(var i=xr[0];i<=xr[1];i++){ c.beginPath(); c.moveTo(px(i),py(yr[0])); c.lineTo(px(i),py(yr[1])); c.stroke(); } for(var j=yr[0];j<=yr[1];j++){ c.beginPath(); c.moveTo(px(xr[0]),py(j)); c.lineTo(px(xr[1]),py(j)); c.stroke(); }
  c.strokeStyle='rgba(255,210,63,.7)'; c.lineWidth=2; c.beginPath(); c.moveTo(px(Math.max(0,xr[0])),py(yr[0])); c.lineTo(px(Math.max(0,xr[0])),py(yr[1])); c.moveTo(px(xr[0]),py(0)); c.lineTo(px(xr[1]),py(0)); c.stroke();
  (o.dots||[]).forEach(function(d){ var k=d[2]==null?1:d[2]; if(k<=0) return; c.save(); c.fillStyle='#FFFFFF'; c.shadowColor=GOLD; c.shadowBlur=18; circ(px(d[0]),py(d[1]),7*k,true,false); c.restore(); txt('('+d[0]+', '+d[1]+')',px(d[0])+(d[0]<0?38:-36),py(d[1])-16,'600 13px "IBM Plex Mono",monospace',GOLD); });
  c.restore(); return {px:function(v){return x+px(v);},py:function(v){return y+py(v);}};
}

/* ---------- sets ---------- */
function bg(st,T,F){
  var sc=st.scene; c.lineWidth=3; c.strokeStyle=INK;
  if(sc==='class'){
    c.fillStyle='#9CC5A1'; c.fillRect(0,-40,W,H+80); c.fillStyle='#8FB894'; c.fillRect(0,300,W,H);
    c.fillStyle='#8A5A34'; rr(172,62,340,176,6); c.fillStyle='#2F4F3F'; rr(184,74,316,152,4);
    if(st.board==='names'){ txt('Who took the',342,120,'32px "Patrick Hand",cursive','#F4F4EC'); txt('NAMES?',342,170,'44px "Patrick Hand",cursive','#FFE27A'); }
    c.fillStyle=st.tod==='night'?'#10204A':'#BFE3F2'; rr(560,60,110,100,4); c.strokeStyle=INK; c.beginPath(); c.moveTo(615,60); c.lineTo(615,160); c.moveTo(560,110); c.lineTo(670,110); c.stroke();
    if(st.tod==='night'){ c.fillStyle='#F4F1D0'; circ(645,85,14,true,false); c.fillStyle='#10204A'; circ(651,81,12,true,false); } else { c.fillStyle='#FFD34D'; circ(590,85,12,true,false); }
    c.fillStyle='#FFF3C4'; rr(700,60,170,62,4); txt('EVERY INPUT GIVES',785,82,'13px "Luckiest Guy",sans-serif','#2E6DA4'); txt('EXACTLY ONE OUTPUT.',785,102,'13px "Luckiest Guy",sans-serif','#C0392B');
    // bookshelf (secret door) at left
    var sw=F.shelfOpen||0; c.save(); c.fillStyle='#1A1410'; rr(28,GY-236,92,222,2); c.translate(28,0); c.scale(1-sw*0.85,1); c.fillStyle='#7A5230'; rr(0,GY-236,92,222,4); for(var sh=0;sh<4;sh++){ var yy=GY-226+sh*54; c.fillStyle='#5E3E22'; c.fillRect(4,yy+40,84,6); for(var bk=0;bk<5;bk++){ c.fillStyle=['#C0392B','#2E6DA4','#27AE60','#F1C40F','#8E44AD'][(bk+sh)%5]; rr(8+bk*16,yy+8,12,32,2); } } c.restore();
    // fish tank
    c.fillStyle='#6B4F35'; rr(880,GY-110,70,96,3); c.fillStyle='rgba(120,200,240,.7)'; rr(876,GY-172,78,62,4); c.fillStyle='#FF8C1A'; ell(914+Math.sin(T*1.2)*14,GY-140,10,6,true,false); c.beginPath(); c.moveTo(924+Math.sin(T*1.2)*14,GY-140); c.lineTo(932+Math.sin(T*1.2)*14,GY-146); c.lineTo(932+Math.sin(T*1.2)*14,GY-134); c.closePath(); c.fill(); c.fillStyle=INK; circ(908+Math.sin(T*1.2)*14,GY-142,1.5,true,false);
    if(!F.lidOff) { c.fillStyle='#555'; rr(872,GY-178,86,8,2); }
    // marcus's chair
    c.fillStyle='#2F7FD1'; rr(300,GY-78,60,10,3); c.fillStyle='#9AA1AC'; c.fillRect(306,GY-68,5,54); c.fillRect(349,GY-68,5,54); c.fillStyle='#2F7FD1'; rr(300,GY-130,10,52,3);
    c.fillStyle='#C9A27E'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    if(st.tokens){ [['7',470,GY-6],['900',600,GY-4],['2.5',180,GY-2],['−40',680,GY-6],['12',400,GY-2],['13',860,GY-4]].forEach(function(tk){ token(tk[1],tk[2],tk[0],'#8E5BD6',0.6); }); }
    if(F.million){ token(330,GY-86,'1,000,000','#D12F2F',0.6); }
  } else if(sc==='hall'){
    var night=st.tod==='night';
    c.fillStyle=night?'#221828':'#3A2838'; c.fillRect(0,-40,W,H+80);
    for(var col=0;col<6;col++){ var x0=40+col*155; c.fillStyle='#4A2F24'; rr(x0,-20,130,GY-10,2); for(var r=0;r<7;r++){ var y0=10+r*58; c.fillStyle='#2A1A14'; c.fillRect(x0+6,y0,118,46); for(var cd=0;cd<7;cd++){ var gl=0.5+0.5*Math.sin(T*2+col*3+r*1.7+cd); c.fillStyle='rgba(255,236,170,'+(0.16+0.22*gl)+')'; c.fillRect(x0+10+cd*16,y0+8,11,34); } c.fillStyle='#5E3E2E'; c.fillRect(x0,y0+46,130,8); } }
    var g=c.createRadialGradient(480,300,40,480,300,560); g.addColorStop(0,'rgba(255,190,90,'+(night?0.16:0.26)+')'); g.addColorStop(1,'rgba(0,0,0,'+(night?0.4:0.18)+')'); c.fillStyle=g; c.fillRect(0,-40,W,H+80);
    c.fillStyle='#4A3B45'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=2; for(var fx2=0;fx2<W;fx2+=90){ c.beginPath(); c.moveTo(fx2,GY-14); c.lineTo(fx2-30,H+40); c.stroke(); } c.strokeStyle=INK; c.lineWidth=3;
    [70,890].forEach(function(cx,i){ candle(cx,GY-14,T,i); });
    if(st.candles){ for(var k=0;k<8;k++){ var a=k/8*Math.PI*2; var on=F.candleK==null||F.candleK>k/8; candle(480+Math.cos(a)*200,GY+6+Math.sin(a)*22,T,k+5,0.7,!on); } }
    if(F.cardPile){ for(var q=0;q<18;q++){ c.save(); c.translate(F.cardPile.x+(rnd(q)-.5)*120,GY-8-rnd(q+4)*14); c.rotate(rnd(q*3)*2-1); c.fillStyle='#FFF3C4'; c.strokeStyle=INK; c.lineWidth=1.5; rr(-10,-7,20,14,2); c.restore(); } }
  } else if(sc==='news'){
    var gg=c.createLinearGradient(0,0,0,H); gg.addColorStop(0,'#1F4E79'); gg.addColorStop(1,'#123150'); c.fillStyle=gg; c.fillRect(0,-40,W,H+80);
    c.strokeStyle='rgba(255,255,255,.08)'; c.lineWidth=2; for(var lx=0;lx<W;lx+=40){ c.beginPath(); c.moveTo(lx,-40); c.lineTo(lx+200,H); c.stroke(); } c.strokeStyle=INK; c.lineWidth=3;
    c.fillStyle='#C0392B'; rr(40,40,190,56,6); txt('SFN NEWS',135,69,'30px "Luckiest Guy",sans-serif','#fff');
    // monitor with the town clock
    c.fillStyle='#111'; rr(600,50,320,220,10); c.save(); c.beginPath(); c.rect(612,62,296,196); c.clip(); c.fillStyle='#F6C28B'; c.fillRect(612,62,296,196); c.fillStyle='#E0A874'; c.fillRect(612,200,296,60);
    c.fillStyle='#B9876A'; rr(720,90,90,170,4); c.fillStyle='#fff'; circ(765,130,30); c.beginPath(); c.moveTo(765,130); c.lineTo(765,108); c.moveTo(765,130); c.lineTo(785,136); c.stroke();
    if(st.newsClock==='dryer'){ c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=3; for(var w2=0;w2<5;w2++){ var ph=(T*2+w2*0.2)%1; c.beginPath(); c.moveTo(800+ph*100,120+w2*12); c.quadraticCurveTo(820+ph*100,110+w2*12,840+ph*100,120+w2*12); c.stroke(); } c.strokeStyle=INK; c.lineWidth=3; for(var hp=0;hp<3;hp++){ var ph2=(T*0.6+hp*0.33)%1; c.save(); c.translate(820+ph2*120,210-ph2*40); c.rotate(ph2*5); c.fillStyle='#8B5A2B'; ell(0,0,10,6,true,false); c.restore(); } }
    else { for(var ts=0;ts<3;ts++){ var ph3=(T*0.7+ts*0.33)%1; c.save(); c.translate(765+Math.sin(ts*2)*60*ph3,90-ph3*120+ph3*ph3*260); c.rotate(ph3*6); c.fillStyle='#E8B25A'; c.strokeStyle=INK; c.lineWidth=2; rr(-12,-12,24,24,5); c.fillStyle='#F6E1B0'; rr(-8,-8,16,16,3,true,false); c.restore(); } }
    var bx=650+((T*140)%220); c.fillStyle='rgba(255,143,184,.9)'; rr(bx,220,26,16,4,true,false); c.restore();
    c.fillStyle='#C0392B'; rr(612,236,120,22,0,true,false); txt('LIVE: TOWN SQ.',672,247,'12px "Luckiest Guy",sans-serif','#fff');
    c.fillStyle='#16324F'; c.fillRect(0,GY-14,W,H);
  } else if(sc==='street'){
    c.fillStyle='#9FD8F0'; c.fillRect(0,-40,W,H+80); c.fillStyle='#FFD34D'; circ(880,70,34);
    [['BAKERY','#F4B6C2',20],['HARDWARE','#F7D794',330],['POST','#A8D8B9',640]].forEach(function(s2){ c.fillStyle=s2[1]; rr(s2[2],110,290,GY-124,4); c.fillStyle='#fff'; rr(s2[2]+30,150,90,90,3); rr(s2[2]+170,150,90,90,3); c.fillStyle='#6B4F35'; rr(s2[2]+120,280,50,GY-294,3); c.fillStyle='#C0392B'; rr(s2[2]+50,118,190,28,4); txt(s2[0],s2[2]+145,133,'18px "Luckiest Guy",sans-serif','#fff'); });
    c.fillStyle='#BDB2A0'; c.fillRect(0,GY-14,W,H-GY+60); c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    if(F.binUp){ c.fillStyle='#3E8E5A'; rr(530,GY-90,56,76,5); c.fillStyle='#2F6F46'; rr(524,GY-98,68,14,4); } else { c.fillStyle='#3E8E5A'; c.beginPath(); c.moveTo(510,GY-14); c.lineTo(610,GY-14); c.lineTo(600,GY-30); c.lineTo(520,GY-28); c.closePath(); c.fill(); c.stroke(); }
  } else if(sc==='play'){
    c.fillStyle='#A7DDF2'; c.fillRect(0,-40,W,H+80); c.fillStyle='#FFD34D'; circ(90,70,30);
    c.fillStyle='#7CC47F'; c.fillRect(0,300,W,H); c.strokeStyle='#8B5A2B'; c.lineWidth=6; c.beginPath(); c.moveTo(560,GY-14); c.lineTo(600,210); c.lineTo(640,GY-14); c.moveTo(600,210); c.lineTo(900,210); c.moveTo(860,GY-14); c.lineTo(900,210); c.lineTo(940,GY-14); c.stroke();
    c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(680,210); c.lineTo(680,330); c.moveTo(720,210); c.lineTo(720,330); c.stroke(); c.fillStyle='#E23B2E'; rr(670,330,60,10,3);
    c.fillStyle='#E8D39A'; c.fillRect(0,GY-14,W,H-GY+60); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    c.fillStyle='#D9534F'; ell(760,GY-12,110,18); c.fillStyle='#F0AD4E'; ell(760,GY-22,100,14); c.fillStyle='#777'; c.fillRect(756,GY-60,8,40); c.strokeRect(756,GY-60,8,40);
  } else if(sc==='square'){
    var late=st.tod==='late';
    var gs=c.createLinearGradient(0,0,0,GY); if(late){ gs.addColorStop(0,'#1B1F4A'); gs.addColorStop(1,'#5A4A8A'); } else { gs.addColorStop(0,'#5B3F8C'); gs.addColorStop(0.6,'#E8845A'); gs.addColorStop(1,'#F6C28B'); } c.fillStyle=gs; c.fillRect(0,-40,W,H+80);
    if(late){ for(var sI=0;sI<40;sI++){ c.fillStyle='rgba(255,255,255,'+(0.4+0.5*rnd(sI+Math.floor(T*2)))+')'; c.fillRect(rnd(sI)*W,rnd(sI+9)*260,2,2); } }
    c.fillStyle=late?'#2C2A4A':'#6B4A6E'; [[0,220,160],[140,250,120],[250,200,110],[780,230,180]].forEach(function(bd){ rr(bd[0],bd[1],bd[2],GY-bd[1],2,true,false); });
    c.fillStyle=late?'#34325A':'#7E5A7E'; rr(360,120,90,GY-120,3,true,false); c.fillStyle='#F4F1D0'; circ(405,170,26,true,false); c.strokeStyle=INK; c.beginPath(); c.moveTo(405,170); c.lineTo(405,152); c.moveTo(405,170); c.lineTo(418,176); c.stroke();
    c.fillStyle='#C8BCA8'; c.fillRect(0,GY-14,W,H-GY+60); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
    if(st.fountain!==false){ var fx0=660; c.fillStyle='#9AA7B0'; rr(fx0-90,GY-70,180,56,8); c.fillStyle='#6EC1E4'; rr(fx0-80,GY-66,160,14,4,true,false); c.fillStyle='#9AA7B0'; rr(fx0-18,GY-170,36,100,6); c.fillStyle='#8A97A0'; ell(fx0,GY-172,50,12); c.strokeStyle='rgba(200,235,255,.9)'; c.lineWidth=3; for(var fw=0;fw<4;fw++){ var ph4=(T*1.5+fw*0.25)%1; c.beginPath(); c.moveTo(fx0,GY-180); c.quadraticCurveTo(fx0+(fw%2?1:-1)*60*ph4,GY-230,fx0+(fw%2?1:-1)*80*ph4,GY-176+ph4*100); c.stroke(); } c.strokeStyle=INK; c.lineWidth=3; }
    c.fillStyle='#555'; rr(860,GY-18,70,10,2); c.strokeStyle='#222'; for(var dg=0;dg<5;dg++){ c.beginPath(); c.moveTo(866+dg*13,GY-18); c.lineTo(866+dg*13,GY-8); c.stroke(); }
  } else if(sc==='vault'){
    c.fillStyle='#0C0A12'; c.fillRect(0,-40,W,H+80); c.strokeStyle='rgba(120,100,140,.15)'; c.lineWidth=2; for(var vy=0;vy<GY;vy+=40){ for(var vx=((vy/40)%2)*50;vx<W;vx+=100){ c.strokeRect(vx,vy,100,40); } }
    c.fillStyle='#3A3444'; circ(800,260,170); c.fillStyle='#2A2533'; circ(800,260,140); c.strokeStyle=INK; c.lineWidth=4; circ(800,260,170,false,true); c.fillStyle='rgba(255,236,170,.25)'; c.beginPath(); c.moveTo(640,110); c.lineTo(660,110); c.lineTo(660,420); c.lineTo(640,420); c.closePath(); c.fill();
    c.fillStyle='#1A1620'; c.fillRect(0,GY-14,W,H); c.fillStyle='rgba(255,143,184,.8)'; for(var cr=0;cr<14;cr++) circ(420+cr*16,GY-10+Math.sin(cr)*3,2.5,true,false);
    if(!F.dark) candle(120,GY-14,T,3);
  }
}
function candle(x,y,T,k,s,off){ s=s||1; c.save(); c.translate(x,y); c.scale(s,s); c.fillStyle='#FFF6D6'; c.strokeStyle=INK; c.lineWidth=2.5; rr(-8,-46,16,46,3); if(!off){ var fl=Math.sin(T*18+k)*2; c.save(); c.fillStyle='rgba(255,200,90,.25)'; circ(0,-62,26,true,false); c.fillStyle='#FFB02E'; c.beginPath(); c.ellipse(fl*0.5,-58,6,12,0,0,Math.PI*2); c.fill(); c.fillStyle='#FFF1A8'; c.beginPath(); c.ellipse(fl*0.5,-55,3,6,0,0,Math.PI*2); c.fill(); c.restore(); } else { c.strokeStyle='rgba(200,200,200,.6)'; c.beginPath(); c.moveTo(0,-48); c.quadraticCurveTo(6,-60,0,-72); c.stroke(); } c.restore(); }
function bgFront(st,T,F){
  if(st.scene==='news'){ c.save(); c.fillStyle='#8B6A48'; c.strokeStyle=INK; c.lineWidth=3; rr(240,GY-66,480,90,8); c.fillStyle='#C0392B'; rr(320,GY-54,320,26,4); txt('SANDY FLATS NEWS',480,GY-41,'17px "Luckiest Guy",sans-serif','#fff'); c.fillStyle='#fff'; rr(560,GY-80,70,16,3); c.restore();
    c.save(); c.fillStyle='#000'; c.fillRect(0,GY+2,W,40); c.fillStyle='#FFD23F'; c.fillRect(0,GY+2,140,40); txt('BREAKING',70,GY+22,'18px "Luckiest Guy",sans-serif',INK); var msg='MACHINES FORGET NAMES  •  CLOCK NOW TOASTER  •  CHANCE OF RAIN: 0%  •  '; c.save(); c.beginPath(); c.rect(140,GY+2,W,40); c.clip(); txt(msg+msg,140+((-T*80)%900)+900*0.5,GY+22,'16px "Luckiest Guy",sans-serif','#fff','left'); c.restore(); c.restore();
    if(st.caller){ c.save(); c.translate(60,110); c.rotate(-0.03); c.fillStyle='#111'; c.strokeStyle=INK; c.lineWidth=3; rr(0,0,230,170,12); c.fillStyle='#FFFFFF'; rr(12,12,206,120,4); c.fillStyle='#FFD23F'; [[40,40],[90,70],[150,45],[180,100],[60,105],[120,110]].forEach(function(d){ ell(d[0]+12,d[1]+12,8,6,true,false); circ(d[0]+19,d[1]+5,4,true,false); }); c.strokeStyle='#9EC9E8'; c.lineWidth=2; for(var r=0;r<7;r++){ c.beginPath(); c.moveTo(20+r*30,12); c.lineTo(20+r*30,132); c.stroke(); } txt('CALLER: SANDY FLATS',115,150,'15px "Luckiest Guy",sans-serif','#FFE14D'); c.restore(); }
  }
}

/* ---------- effects ---------- */
function posOf(F,k){ if(k==='zero') return {x:F.zx,y:GY-40}; if(F.pos[k]) return {x:F.pos[k].x,y:GY-150}; if(F.pp[k]) return {x:F.pp[k].x,y:F.pp[k].y||GY-150}; return {x:480,y:300}; }
function arc(a,b2,u,h){ return {x:lerp(a.x,b2.x,u),y:lerp(a.y,b2.y,u)-Math.sin(Math.PI*u)*(h==null?120:h)}; }
var FX={
  snore:{post:function(f,q,F){ var m=F.pp.mux; if(!m) return; for(var i=0;i<3;i++){ var ph=((q*0.6)+i/3)%1; c.save(); c.globalAlpha=1-ph; txt('z',m.x+40+ph*40,GY-250-ph*80,(20+ph*16)+'px "Luckiest Guy",sans-serif','#DDE7FF'); c.restore(); } }},
  eraserDrop:{pre:function(f,q){ return q<1.0?{hide:{eraser:true}}:{}; },post:function(f,q,F){ if(q<0||q>=1.0) return; var m=F.pp.mux; var u=clamp(q/0.6); var y=lerp(-80,220,u*u); eraserC(m.x,y,F.T,false,{squash:q>0.6&&q<0.9?0.6*(1-(q-0.6)/0.3):0}); if(q>0.55&&q<0.95) burst(m.x+90,160,'BOING',0.45,'#FFD1EE'); }},
  scrub:{pre:function(f,q){ var k=clamp((q-0.2)/1.6); return {hide:{eraser:true},muxPlate:1-k}; },post:function(f,q,F){ var m=F.pp.mux; var k=clamp((q-0.2)/1.6); var ex=m.x-60+160*k*0.9+Math.sin(q*30)*14; eraserC(ex,GY-40,F.T,false,{sc:0.7,rot:Math.sin(q*30)*0.3}); for(var i=0;i<8;i++){ var ph=(q*1.5+i/8)%1; c.fillStyle='rgba(255,143,184,'+(1-ph)+')'; circ(ex+(i-4)*6,GY-30+ph*30,3,true,false); } if(q>0.2&&q<1.9&&Math.floor(q*4)%2===0) burst(m.x-40,GY-110,'SCRUB',0.45,'#FFD1EE'); }},
  popcorn:{pre:function(f,q){ return {lidOff:q>2.25,muxShake:q<2.6?Math.sin(q*40)*3:0}; },post:function(f,q,F){ var m=F.pp.mux; var o={x:m.x+137,y:GY-66}; var tgts=[[380,120,'7'],[160,200,'900'],[520,60,'2.5'],[260,300,'12'],[60,110,'−40'],[905,GY-180,'13']];
    tgts.forEach(function(tg,i){ var st=0.2+i*0.35, u=clamp((q-st)/0.6); if(q<st) return; var P=arc(o,{x:tg[0],y:tg[1]},u,i===5?60:160); if(u<1) token(P.x,P.y,tg[2],'#8E5BD6',0.7); else if(q-st<1.4){ token(tg[0],tg[1]+(q-st-0.6)*200,tg[2],'#8E5BD6',0.7); if(q-st<0.9) burst(tg[0],tg[1]-40,i===5?'SMASH':'PING',0.4,'#FFF3C4'); } });
    if(q>2.25&&q<3.4){ var u2=clamp((q-2.25)/1); c.save(); c.translate(915+u2*60,GY-178-Math.sin(Math.PI*u2)*90+u2*u2*120); c.rotate(u2*5); c.fillStyle='#555'; c.strokeStyle=INK; c.lineWidth=2; rr(-43,-4,86,8,2); c.restore(); } }},
  eraserOut:{post:function(f,q,F){ if(q<0||q>1.6) return; var m=F.pv.props.mux||{x:720}; var a={x:m.x,y:220}, b1={x:615,y:110}; var u=clamp(q/1.2); var P=arc(a,b1,u,140); eraserC(P.x,P.y,F.T,false,{sc:1-u*0.5,rot:u*6}); }},
  million:{pre:function(f,q){ return q>2.6?{million:true}:{}; },post:function(f,q,F){ if(q<0||q>2.6) return; var u=clamp(q/2.6); token(330+Math.sin(q*3)*60*(1-u),lerp(-30,GY-86,u),'1,000,000','#D12F2F',0.6); }},
  hiccup:{post:function(f,q,F){ if(q<0||q>1.2) return; var m=F.pp.mux; var u=clamp(q/0.9); var P=arc({x:m.x+137,y:GY-66},{x:m.x+200,y:GY-10},u,60); token(P.x,P.y,'57','#8E5BD6',0.6); if(q<0.5) burst(m.x+170,GY-150,'HIC',0.4,'#FFFFFF'); }},
  shelfFall:{pre:function(f,q){ var o={shelfOpen:q<0?0:(q<0.3?q/0.3:(q<1.6?1:clamp(1-(q-1.6)/0.4)))}; if(q>0.3) o.hide={marcus:true}; return o; },post:function(f,q,F){ if(q<0.25||q>1.5) return; var u=clamp((q-0.25)/0.9); c.save(); c.beginPath(); c.rect(28,GY-236,92,222); c.clip(); kid('marcus',74,lerp(GY,GY+300,u*u),-1,false,'shock',false,F.T,{rot:u*3}); c.restore(); burst(170,GY-250,'WHOOPS',0.55,'#FFFFFF'); }},
  tumble:{pre:function(f,q){ var d={}; [['one',0.2],['priya',0.5],['gusC',0.8],['zero',1.1]].forEach(function(e){ var u=clamp((q-e[1])/0.45); d[e[0]]=u>=1?0:-(1-u*u)*520; }); return {drop:d,cardPile:{x:560}}; },post:function(f,q,F){ [['one',0.65,160],['priya',0.95,300],['gusC',1.25,410],['zero',1.55,230]].forEach(function(e){ if(q>e[1]&&q<e[1]+0.45) burst(e[2],GY-40,'THUD',0.4,'#FFF3C4'); }); }},
  effieHop:{pre:function(f,q){ return {effieX:q<0.9?lerp(930,770,clamp(q/0.9)):null,effieHop:q<0.9}; }},
  windup:{pre:function(f,q){ return {lfX:lerp(1010,690,ease(clamp(q/1.6))),lfWind:true}; }},
  nameClang:{pre:function(f,q){ return {lfNamed:q>1.15}; },post:function(f,q,F){ if(q<0) return; var e=F.pp.effie||{x:770,y:238}; var lf=F.pp.littlef; if(q<1.15){ var k=clamp(q/0.5); c.save(); c.translate(e.x-40,e.y-60); c.fillStyle='#FFF3C4'; c.strokeStyle=GOLD; c.lineWidth=3; c.shadowColor=GOLD; c.shadowBlur=20*k; rr(-60,-18,120,36,6); c.restore(); if(q>0.5){ var u=clamp((q-0.5)/0.65); var P=arc({x:e.x-40,y:e.y-60},{x:lf.x,y:GY-45},u,80); goldText('f(x) = x + 4',P.x,P.y,18); } else goldText('f(x) = x + 4',e.x-40,e.y-60,18,{alpha:k}); } else if(q<1.9){ burst(lf.x+80,GY-150,'CLANG!',0.6,'#FFF3C4'); c.save(); c.strokeStyle='rgba(255,210,63,'+(1-(q-1.15)/0.75)+')'; c.lineWidth=4; circ(lf.x,GY-45,(q-1.15)*160,false,true); c.restore(); } }},
  notation:{post:function(f,q,F){ var k=clamp((q+0.001)/0.4); c.save(); c.globalAlpha=k; c.fillStyle='rgba(20,16,30,.9)'; c.strokeStyle=GOLD; c.lineWidth=4; rr(270,30,420,150,14);
    if(!f.ex){ txt('f',360,92,'600 64px "IBM Plex Mono",monospace',GOLD); txt('(',420,92,'600 64px "IBM Plex Mono",monospace','#FFFFFF'); txt('x',480,92,'600 64px "IBM Plex Mono",monospace','#8BE6A8'); txt(')',540,92,'600 64px "IBM Plex Mono",monospace','#FFFFFF');
      if(q>0.9) txt('the name',360,150,'20px "Patrick Hand",cursive',GOLD); if(q>2.0){ txt('the slot',600,70,'20px "Patrick Hand",cursive','#FFFFFF'); c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(580,78); c.lineTo(548,86); c.stroke(); } if(q>3.2) txt('whatever goes in',480,150,'20px "Patrick Hand",cursive','#8BE6A8'); }
    else { txt('f(3)',400,92,'600 60px "IBM Plex Mono",monospace',GOLD); txt('=',490,92,'600 44px "IBM Plex Mono",monospace','#fff'); txt('put 3 into f',590,92,'26px "Patrick Hand",cursive','#8BE6A8'); txt('NOT "f times 3"',480,150,'18px "Luckiest Guy",sans-serif','#FF8A7A'); }
    c.restore(); }},
  tokenIn:{post:function(f,q,F){ if(q<0||q>0.9) return; var a=posOf(F,f.from); var tg=f.to==='littlef'?lfHopper(F.pp.littlef.x):muxHopper(F.pp.mux.x); var P=arc(a,tg,clamp(q/0.8),120); token(P.x,P.y,f.label,'#8E5BD6',0.8); }},
  steam:{pre:function(f,q){ return q>0?{lfAngry:true}:{}; },post:function(f,q,F){ if(q<0) return; var lf=F.pp.littlef; for(var i=0;i<6;i++){ var ph=(q*1.2+i/6)%1; c.save(); c.globalAlpha=0.8*(1-ph); c.fillStyle='#F2F2F2'; c.strokeStyle=INK; c.lineWidth=2; var sd=i%2?1:-1; circ(lf.x+sd*(46+ph*30),GY-80-ph*110,8+ph*14); c.restore(); } if(q>0&&q<1.3) burst(lf.x-10,GY-230,'TWEEEE!',0.55,'#FFFFFF'); }},
  gavel:{pre:function(f,q){ var o={}; if(q>0.35&&q<0.8) o.shake=Math.sin(q*80)*8*(1-(q-0.35)/0.45); if(q>0.35&&q<1.1) o.helmetRot=(q-0.35)*14; return o; },post:function(f,q,F){ if(q<0) return; var u=clamp(q/0.35), y=lerp(-260,GY-150,u*u); var sx=470;
    c.save(); c.translate(sx,y); c.fillStyle='#8B5A2B'; c.strokeStyle=INK; c.lineWidth=4; rr(-18,-220,36,160,6); c.fillStyle='#6B4226'; rr(-190,-70,380,90,10); c.fillStyle='#F7F3E3'; rr(-176,-58,352,66,6); txt('f(3) ≠ f × 3',0,-25,'600 40px "IBM Plex Mono",monospace','#B3261E'); c.restore();
    if(q>0.35){ var k=q-0.35; c.save(); c.strokeStyle='rgba(255,255,255,'+clamp(1-k/0.8)+')'; c.lineWidth=6; ell(sx,GY-10,60+k*500,12+k*60,false,true); c.restore(); if(k<1.0) burst(sx+250,GY-260,'BOOM!',0.9,'#FFE14D'); for(var i=0;i<10;i++){ var a=rnd(i)*Math.PI, sp=200+rnd(i+3)*200; c.fillStyle='#E8D6B0'; c.strokeStyle=INK; c.lineWidth=2; circ(sx+Math.cos(a)*sp*k*(i%2?1:-1),GY-20-Math.sin(a)*sp*k+400*k*k,6,true,true); } } }},
  tokenOut:{post:function(f,q,F){ if(q<0||q>1.4) return; var lf=F.pp.littlef; var tg=posOf(F,f.bonk); tg={x:tg.x+10,y:GY-190}; var u=clamp(q/0.6); if(u<1){ var P=arc({x:lf.x+40,y:GY-40},tg,u,140); token(P.x,P.y,f.label,'#27AE60',0.9); } else { token(tg.x+(q-0.6)*80,tg.y+(q-0.6)*(q-0.6)*300,f.label,'#27AE60',0.9); if(q<1.0) burst(tg.x+50,tg.y-60,'BONK',0.5,'#FFFFFF'); } }},
  eqPanel:{post:function(f,q,F){ var k=clamp((q+0.001)/0.3); if(q<-5) k=1; panel(480,28,f.lines,{alpha:k,sc:0.85+0.15*ease(k)}); }},
  candleRing:{pre:function(f,q){ return {candleK:clamp(q/1.2)}; }},
  gold3:{post:function(f,q,F){ var st=f.stage; var k=q<-5?1:clamp(q/0.4);
    if(st===0){ goldText('f(3) = 7',560,140,44,{alpha:k,sc:0.6+0.4*ease(k)}); }
    if(st===1){ if(q>-5&&q<0.8){ var u=clamp(q/0.8); c.save(); c.translate(560,140); c.scale(1-Math.sin(Math.PI*u)*0.6,1); goldText(u<0.5?'f(3) = 7':'(3, 7)',0,0,44); c.restore(); if(u>0.3&&u<0.9) burst(700,90,'FOLD',0.45,'#FFF3C4'); } else goldText('(3, 7)',560,140,48); }
    if(st===2){ var G=miniGrid(640,30,280,250,[0,8],[0,9],{dots:[[3,7,q>0.95?1:0]]}); if(q<0.95){ var u2=clamp(q/0.95); var P=arc({x:560,y:140},{x:G.px(3),y:G.py(7)},u2,60); goldText('(3, 7)',P.x,P.y,30,{sc:1-u2*0.5}); } else { var r=(q-0.95); c.save(); c.strokeStyle='rgba(255,210,63,'+clamp(1-r/1.2)+')'; c.lineWidth=6; circ(G.px(3),G.py(7),20+r*260,false,true); c.restore(); if(r<0.9) burst(G.px(3)-120,G.py(7)-10,'KA-CHUNK',0.55,'#FFF3C4'); } }
    if(st===3){ goldText('f(3) = 7',200,90,30); goldText('(3, 7)',450,90,30); txt('→',325,90,'600 30px "IBM Plex Mono",monospace',GOLD); txt('→',565,90,'600 30px "IBM Plex Mono",monospace',GOLD); var G2=miniGrid(620,20,200,150,[0,8],[0,9],{dots:[[3,7]]}); txt('sentence',200,130,'20px "Patrick Hand",cursive','#FFF3C4'); txt('pair',450,130,'20px "Patrick Hand",cursive','#FFF3C4'); txt('point',720,186,'20px "Patrick Hand",cursive','#FFF3C4'); }
  }},
  wrongPair:{post:function(f,q,F){ if(q<0||q>1.8) return; goldText('(7, 3)?',560,210,34,{alpha:1}); c.save(); c.strokeStyle='#FF5B5B'; c.lineWidth=6; c.beginPath(); c.moveTo(480,190); c.lineTo(640,230); c.moveTo(640,190); c.lineTo(480,230); c.stroke(); c.restore(); }},
  stompIn:{pre:function(f,q){ var o={binUp:q<1.1}; var u=ease(clamp(q/2.2)); o.mfDX=lerp(420,0,u); o.mgDX=lerp(300,0,u); o.shake=(Math.abs(Math.sin(q*6.28/0.5))<0.2&&q<2.4)?4:0; o.stompY=-Math.abs(Math.sin(q*Math.PI*2))*10; return o; },post:function(f,q,F){ if(q>1.1&&q<1.8) burst(560,GY-140,'CRUNCH',0.6,'#FFFFFF'); for(var i=0;i<4;i++){ var t0=0.2+i*0.5; if(q>t0&&q<t0+0.3) burst(700+(i%2)*120,GY-300,'STOMP',0.45,'#FFF3C4'); } }},
  chestBump:{pre:function(f,q){ var b=q>0&&q<0.5?Math.sin(q/0.5*Math.PI)*30:0; return f.who==='machf'?{mfDX:b}:{mgDX:-b}; },post:function(f,q,F){ if(q>0.2&&q<0.8) burst(735,GY-280,'BUMP',0.5,'#FFFFFF'); }},
  thwipCards:{pre:function(f,q){ return {mfNamed:q>0.55,mgNamed:q>0.9}; },post:function(f,q,F){ var e={x:F.zx,y:GY-120}; [['machf',0.1,'f(x) = 3x − 1'],['machg',0.45,'g(x) = 10 − x']].forEach(function(cd){ var u=clamp((q-cd[1])/0.45); if(q<cd[1]) return; var m=F.pp[cd[0]]; if(u<1){ var P=arc(e,{x:m.x,y:GY-130},u,90); c.save(); c.translate(P.x,P.y); c.rotate(u*8); c.fillStyle='#FFF3C4'; c.strokeStyle=GOLD; c.lineWidth=3; rr(-30,-10,60,20,4); c.restore(); } else if(q-cd[1]<1.1) burst(m.x+110,GY-200,'THWIP',0.45,'#FFF3C4'); }); }},
  burstAt:{post:function(f,q,F){ if(q<0||q>0.8) return; var p=posOf(F,f.who); burst(p.x+40,GY-210,f.label,0.55,'#FFF3C4'); }},
  flick:{post:function(f,q,F){ if(q<0||q>1.2) return; var a=posOf(F,'gusC'); [['machf',0],['machg',0.25]].forEach(function(e){ var u=clamp((q-e[1])/0.7); if(q<e[1]||u>=1) return; var P=arc({x:a.x+20,y:GY-100},machHopper(F.pp[e[0]].x),u,160); token(P.x,P.y,f.label,'#8E5BD6',0.7); }); }},
  scoreboard:{post:function(f,q,F){ var drop=f.row===0?clamp((q)/0.7):1; if(q<-5) drop=1; var y=lerp(-220,24,ease(drop)); c.save(); c.translate(250,y);
    c.strokeStyle='#555'; c.lineWidth=4; c.beginPath(); c.moveTo(60,-200); c.lineTo(60,0); c.moveTo(400,-200); c.lineTo(400,0); c.stroke();
    c.fillStyle='#1B1A22'; c.strokeStyle=INK; c.lineWidth=4; rr(0,0,460,f.row===1?190:130,12); c.fillStyle='#C0392B'; rr(0,0,460,34,12); txt('MACHINE f',115,17,'18px "Luckiest Guy",sans-serif','#fff'); txt('MACHINE g',345,17,'18px "Luckiest Guy",sans-serif','#fff'); c.strokeStyle='#444'; c.beginPath(); c.moveTo(230,34); c.lineTo(230,f.row===1?190:130); c.stroke();
    var rows=[['f(2) = 3 × 2 − 1 = 5','g(2) = 10 − 2 = 8','g'],['f(4) = 3 × 4 − 1 = 11','g(4) = 10 − 4 = 6','f']];
    for(var r=0;r<=f.row;r++){ var R=rows[r], ry=70+r*62, show=(r<f.row)||q<-5||q>(f.row===0?1.0:0.4); if(!show) continue; var win=(r<f.row)||q<-5||q>(f.row===0?1.9:1.2);
      [0,1].forEach(function(side){ var isW=win&&((R[2]==='f')===(side===0)); if(isW){ c.save(); c.fillStyle='rgba(255,210,63,.25)'; c.shadowColor=GOLD; c.shadowBlur=16; rr(8+side*230,ry-24,214,48,8,true,false); c.restore(); } txt(R[side],115+side*230,ry,'600 17px "IBM Plex Mono",monospace',isW?GOLD:'#FFFFFF'); }); }
    c.restore(); var tb=f.row===0?1.9:1.2; if(q>tb&&q<tb+1.0) burst(480,y+240,'DING DING!',0.6,'#FFE14D'); }},
  flex:{pre:function(f,q){ return f.who==='machf'?{mfFlex:q>0}:{mgFlex:q>0}; }},
  helmetSwipe:{pre:function(f,q){ return {machfHelmet:q>0.7}; },post:function(f,q,F){ if(q<0||q>0.7) return; var a=posOf(F,'marcus'), m=F.pp.machf; var P=arc({x:a.x,y:GY-190},{x:m.x,y:GY-270},clamp(q/0.7),100); c.save(); c.translate(P.x,P.y); c.rotate(q*10); c.fillStyle='#E23B2E'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.arc(0,0,30,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.restore(); if(q<0.5) burst(a.x+60,GY-250,'YOINK',0.5,'#FFFFFF'); }},
  hug:{pre:function(f,q){ return {hug:q>0.4&&q<2.6,mfNamed:true,mgNamed:true,glow:q>0.55,machfHelmet:q<1.6,marcusNoHelmet:q<2.3}; },post:function(f,q,F){ if(q>0.5&&q<1.3) burst(745,GY-310,'CLANG',0.6,'#FFF3C4'); if(q>0.55){ c.save(); c.strokeStyle='rgba(255,210,63,'+clamp(1-(q-0.55)/1.2)+')'; c.lineWidth=5; circ(745,GY-130,(q-0.55)*260,false,true); c.restore(); }
    if(q>1.6&&q<2.3){ var a=posOf(F,'marcus'), m=F.pp.machf; var P=arc({x:m.x,y:GY-270},{x:a.x,y:GY-185},clamp((q-1.6)/0.7),80); c.save(); c.translate(P.x,P.y); c.fillStyle='#E23B2E'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.arc(0,0,30,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.restore(); } }},
  wrongIn:{post:function(f,q,F){ if(q>0.6&&q<1.8) burst(470,120,'BZZZT',0.7,'#FF8A7A'); }},
  undoChain:{post:function(f,q,F){ if(q<0) return; var items=['11','− 1','10','÷ 2','5'], ts=[0,1.3,2.0,2.8,3.4]; c.save(); c.font='600 26px "IBM Plex Mono",monospace'; var x=90; for(var i=0;i<items.length;i++){ if(q<ts[i]) break; var op=i%2===1; var w=c.measureText(items[i]).width+30; c.fillStyle=op?'#2E6DA4':(i===4?GOLD:'#FFFDF6'); c.strokeStyle=INK; c.lineWidth=3; rr(x,40,w,48,op?24:10); txt(items[i],x+w/2,64,'600 26px "IBM Plex Mono",monospace',op?'#fff':INK); x+=w; if(i<items.length-1&&q>ts[i+1]){ txt('←',x+18,64,'600 26px "IBM Plex Mono",monospace','#fff'); x+=36; } } c.restore(); if(q>0.2) txt('UNDO: last thing done, first thing undone',330,112,'20px "Patrick Hand",cursive','#1B1A22'); }},
  zeroDive:{pre:function(f,q){ return {hide:{zero:true}}; },post:function(f,q,F){ var a={x:F.zx,y:GY-36}, b1={x:760,y:GY-110}; var u=clamp(q/0.9); var P=arc(a,b1,u,140); zero(P.x,P.y+36,u*8,false,F.T,{mask:true},'shock'); if(q>0.85&&q<1.6) burst(830,GY-230,'BEEP',0.5,'#CFFFE0'); }},
  deflate:{pre:function(f,q){ var u=clamp(q/1.2); return {ballDeflate:q<0?1:1-u*0.95,ballSpin:q>0?Math.sin(q*14)*0.4:0,ballDX:q>0?Math.sin(q*9)*40*u:0,ballDY:q>0?-Math.sin(Math.PI*u)*120:0}; },post:function(f,q,F){ if(q>0.1&&q<1.3) burst(640,GY-260,'PFFFFBBT',0.6,'#FFD1EE'); if(q>1.25){ var k=q-1.25; for(var i=0;i<30;i++){ var a=rnd(i)*6.28, sp=60+rnd(i+2)*160; c.fillStyle=['#FF8FB8','#FFD1EE','#E86A98'][i%3]; c.fillRect(760+Math.cos(a)*sp*k,GY-240+Math.sin(a)*sp*k+80*k*k,7,5); } } }},
  priyaLook:{post:function(f,q,F){ if(q<0) return; var p=F.pos.priya; if(!p) return; burst(p.x+30,GY-230,'...',0.45,'#FFFFFF'); }},
  eraserPounce:{pre:function(f,q){ return {hide:{eraser:true},oneBlankNow:q>1.9}; },post:function(f,q,F){ var o=F.pos.one||{x:360}; var a={x:660,y:300}, b1={x:o.x+10,y:GY-110}; if(q<0.8){ var P=arc(a,b1,clamp(q/0.8),160); eraserC(P.x,P.y,F.T,false,{rot:q*8}); } else if(q<2.0){ eraserC(b1.x+Math.sin(q*30)*12,b1.y+14,F.T,false,{sc:0.55,rot:Math.sin(q*30)*0.3}); if(Math.floor(q*4)%2===0) burst(b1.x+80,GY-230,'SCRUB',0.45,'#FFD1EE'); for(var i=0;i<6;i++){ var ph=(q*1.5+i/6)%1; c.fillStyle='rgba(255,143,184,'+(1-ph)+')'; circ(b1.x+(i-3)*6,b1.y+20+ph*40,3,true,false); } } else { var P2=arc(b1,{x:660,y:300},clamp((q-2.0)/0.8),120); eraserC(P2.x,P2.y,F.T,false,{}); } }},
  wander:{pre:function(f,q){ return {oneDX:Math.sin(q*1.8)*24,oneDizzy:true}; }},
  fwoomOne:{pre:function(f,q){ return {flare:q>0&&q<2.4?Math.sin(clamp(q/0.4)*Math.PI/2)*(1-clamp((q-1.6)/0.8)):0}; },post:function(f,q,F){ var o=F.pos.one; if(!o||q<0) return; var k=clamp(q/0.4); goldText('o(x) = 1 × x',o.x+10,GY-230,24,{alpha:clamp(1-(q-2.2)/0.6)}); goldText('o(7) = 7',o.x+10,GY-200,24,{alpha:clamp(1-(q-2.2)/0.6)}); if(q<1.0) burst(o.x+130,GY-280,'FWOOM',0.6,'#FFF3C4'); c.save(); c.strokeStyle='rgba(255,210,63,'+clamp(1-q/1.4)+')'; c.lineWidth=6; circ(o.x,GY-94,q*200,false,true); c.restore(); }},
  slamName:{post:function(f,q,F){ var g=F.pp.glitch; if(!g) return; var k=clamp(q/0.15); goldText(f.txt,g.x,GY-230,34,{sc:q<-5?1:lerp(3,1,k)}); var G=miniGrid(700,40,230,200,[0,6],[0,10],{dots:[[4,9,q>0.4||q<-5?1:0]]}); if(q>0.4&&q<1.2) burst(G.px(4)-90,G.py(9)+30,'KA-CHUNK',0.5,'#FFF3C4'); if(q>0.1&&q<0.8) burst(g.x-100,GY-280,'SLAM',0.55,'#FFF3C4'); }},
  samDots:{post:function(f,q,F){ if(q<0&&q>-5) return; var G=miniGrid(60,30,300,220,[-4,4],[0,10],{dots:[[3,9],[-3,9]]}); c.save(); c.strokeStyle=GOLD; c.lineWidth=3; txt('3 → 9',640,70,'600 26px "IBM Plex Mono",monospace',GOLD); txt('−3 → 9',640,110,'600 26px "IBM Plex Mono",monospace',GOLD); txt('two inputs, one output: FINE',640,150,'20px "Patrick Hand",cursive','#FFF3C4'); c.restore(); if(q>0&&q<0.8) burst(420,160,'KA-CHUNK',0.5,'#FFF3C4'); }},
  combo:{post:function(f,q,F){ var s=f.stage; var z={x:F.zx,y:GY-150}; goldText('m(2) = 5',260,70,34,{alpha:s>0?1:clamp(q/0.3)}); if(s>=1){ txt('→',400,70,'600 34px "IBM Plex Mono",monospace',GOLD); goldText('(2, 5)',510,70,34,{alpha:s>1?1:clamp(q/0.3)}); } if(s>=2){ txt('→',620,70,'600 34px "IBM Plex Mono",monospace',GOLD); var G=miniGrid(640,20,170,130,[0,4],[0,6],{dots:[[2,5,clamp(q/0.4)]]}); } }},
  beam:{pre:function(f,q){ return {muxShake:q>1.0&&q<1.5?Math.sin(q*60)*6:0,muxGold:q>1.0,muxBlank:q<1.0,muxCheese:q<1.8}; },post:function(f,q,F){ var m=F.pp.mux; var pts=[[260,70],[510,70],[725,90],[m.x,GY-30]]; var k=clamp(q/1.0); goldText('m(2) = 5',260,70,34); goldText('(2, 5)',510,70,34); miniGrid(640,20,170,130,[0,4],[0,6],{dots:[[2,5]]});
    c.save(); c.strokeStyle=GOLD; c.shadowColor=GOLD; c.shadowBlur=24; c.lineWidth=10; c.lineCap='round'; c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); var total=3, seg=k*total; for(var i=1;i<=3;i++){ var u=clamp(seg-(i-1)); if(u<=0) break; c.lineTo(lerp(pts[i-1][0],pts[i][0],u),lerp(pts[i-1][1],pts[i][1],u)); } c.stroke(); c.restore();
    if(q>1.0&&q<2.0) burst(m.x-150,GY-260,'BOOM!',1.0,'#FFE14D'); if(q>1.0){ c.save(); c.strokeStyle='rgba(255,210,63,'+clamp(1-(q-1)/1.2)+')'; c.lineWidth=8; circ(m.x,GY-120,(q-1)*400,false,true); c.restore(); goldText('m(2) = 4 × 2 − 3 = 5',m.x-120,GY-320,22,{alpha:clamp((q-1.1)/0.3)}); }
    if(q>1.8){ var u2=clamp((q-1.8)/1.2); var P=arc({x:m.x-72,y:GY-265},{x:1010,y:GY-200},u2,200); c.save(); c.translate(P.x,P.y); c.rotate(u2*9); c.fillStyle='#FFD23F'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(-22,12); c.lineTo(24,12); c.lineTo(-6,-22); c.closePath(); c.fill(); c.stroke(); c.restore(); } }},
  goldWave:{pre:function(f,q){ return {eraserSmall:q>1.2}; },post:function(f,q,F){ if(q<0) return; c.save(); c.strokeStyle='rgba(255,210,63,'+clamp(1-q/2.2)+')'; c.shadowColor=GOLD; c.shadowBlur=20; c.lineWidth=14; circ(120,GY-100,q*520,false,true); c.restore(); if(q>1.1&&q<2.0) burst(760,160,'SHRINK',0.55,'#FFD1EE'); }},
  drain:{post:function(f,q,F){ var a={x:660,y:300}, b1={x:895,y:GY-14}; if(q<1.3){ var u=clamp(q/1.3); var P=arc(a,b1,u,u<0.5?120:60); eraserC(P.x,P.y,F.T,false,{small:true,cheese:true,rot:u*8}); } if(q>1.3&&q<2.1) burst(895,GY-120,'PLINK',0.45,'#FFFFFF'); }},
  zeroIn:{pre:function(f,q){ var o={}; if(q>-5){ o.hide={zero:q<2.8}; o.muxScreen=q>1.7?'−3':null; } else o.muxScreen='−3'; return o; },post:function(f,q,F){ if(q<-5) return; var m=F.pp.mux; var hp=muxHopper(m.x); if(q<0.9){ var P=arc({x:F.zx,y:GY-36},hp,clamp(q/0.9),150); zero(P.x,P.y+36,q*8,false,F.T,{mask:true},null); } if(q>0.9&&q<1.6&&Math.floor(q*8)%2===0) burst(m.x+100,GY-300,'WHIRR',0.45,'#FFF3C4'); if(q>2.1&&q<2.8){ var P2=arc({x:m.x+137,y:GY-66},{x:F.zx,y:GY-36},clamp((q-2.1)/0.7),90); zero(P2.x,P2.y+36,q*6,false,F.T,{mask:true},null); } }},
  oneIn:{pre:function(f,q){ var o={hide:{}}; if(q>0.2&&q<2.4) o.hide.one=true; o.muxScreen=q>1.8?'1':'−3'; return o; },post:function(f,q,F){ var m=F.pp.mux; var o=F.pos.one||{x:390}; var hp=muxHopper(m.x); if(q>0.2&&q<1.0){ var P=arc({x:o.x,y:GY},{x:hp.x,y:hp.y+30},clamp((q-0.2)/0.8),120); hero(P.x,P.y,1,false,null,F.T,{}); } if(q>1.0&&q<1.8){ c.save(); c.beginPath(); c.rect(0,-40,W,GY-250+40); c.clip(); hero(hp.x,hp.y+30+(q-1.0)*200,1,false,null,F.T,{}); c.restore(); } if(q>1.8&&q<2.4){ var P2=arc({x:m.x+137,y:GY},{x:o.x,y:GY},clamp((q-1.8)/0.6),80); hero(P2.x,P2.y,1,false,null,F.T,{}); }
    if(q>1.8){ c.save(); txt('−3',m.x-40,GY-310,'600 30px "IBM Plex Mono",monospace',GOLD); txt('1',m.x+60,GY-310,'600 30px "IBM Plex Mono",monospace',GOLD); c.strokeStyle=GOLD; c.lineWidth=3; c.beginPath(); c.moveTo(m.x-14,GY-312); c.quadraticCurveTo(m.x+10,GY-345,m.x+40,GY-312); c.stroke(); txt('+4',m.x+12,GY-352,'600 22px "IBM Plex Mono",monospace',GOLD); c.restore(); } }},
  pointEach:{post:function(f,q,F){ if(q<0||q>1.6) return; var o=F.pos.one; if(!o) return; c.save(); c.strokeStyle='#FFE14D'; c.lineWidth=5; c.lineCap='round'; c.beginPath(); c.moveTo(F.zx+30,GY-90); c.lineTo(o.x-60,GY-120); c.moveTo(o.x-40,GY-150); c.lineTo(F.zx+40,GY-120); c.stroke(); c.restore(); }},
  fileCard:{post:function(f,q,F){ if(q<0||q>2.4) return; var e=F.pp.effie||{x:790,y:238}; var u=clamp(q/0.8); c.save(); c.translate(lerp(e.x-30,e.x+50,u),e.y-40); c.fillStyle='#FFF3C4'; c.strokeStyle=GOLD; c.lineWidth=3; c.shadowColor=GOLD; c.shadowBlur=14; rr(-30,-12,60,24,4); c.restore(); txt('DOUG',lerp(e.x-30,e.x+50,u),e.y-40,'600 14px "IBM Plex Mono",monospace',INK); }},
  puff:{pre:function(f,q){ return {dougPuff:q>0&&q<1.6}; }},
  crack:{post:function(f,q,F){ crackDraw(1,F.t,true); }},
  chainCard:{post:function(f,q,F){ var k=q<-5?1:clamp(q/0.8); c.save(); c.globalAlpha=k; c.translate(480,230); c.scale(0.7+0.3*ease(k),0.7+0.3*ease(k)); c.fillStyle='#2A2030'; c.strokeStyle=GOLD; c.lineWidth=5; c.shadowColor=GOLD; c.shadowBlur=30; rr(-200,-110,400,220,12); c.shadowBlur=0; goldText('THE CHAIN',0,-40,50); ['WORDS','RULE','TABLE','GRAPH'].forEach(function(wd,i){ var x=-150+i*100; c.strokeStyle='rgba(255,210,63,'+(0.5+0.5*Math.sin(F.t*3+i))+')'; c.lineWidth=4; ell(x,40,34,20,false,true); txt(wd,x,40,'600 13px "IBM Plex Mono",monospace',GOLD); }); c.restore(); }},
  candlesOut:{pre:function(f,q){ return {dark:q>0.4}; },post:function(f,q,F){ c.save(); c.fillStyle='rgba(0,0,0,'+clamp(q/1.2)+')'; c.fillRect(0,-40,W,H+80); c.restore(); }}
};
function crackDraw(r,t,mid){
  var ox=mid?320:0, oy=mid?20:0;
  var segs=[[[150,110],[165,100],[165,215]],[[245,140],[295,140]],[[270,118],[270,122]],[[270,160],[270,164]],[[360,112],[335,125],[330,180],[355,210],[385,200],[392,140],[372,112],[360,112]]];
  c.save(); c.translate(ox,oy); c.strokeStyle='#C9C9D6'; c.lineWidth=5; c.lineCap='round'; c.shadowColor='rgba(200,200,220,.8)'; c.shadowBlur=14;
  segs.forEach(function(s,si){ c.beginPath(); c.moveTo(s[0][0],s[0][1]); for(var i=1;i<s.length;i++){ var a=s[i-1], b=s[i]; for(var k=1;k<=4;k++){ var u=k/4; c.lineTo(lerp(a[0],b[0],u)+(k<4?(rnd(si*31+i*7+k+Math.floor(t*6))-.5)*8:0),lerp(a[1],b[1],u)+(k<4?(rnd(si*17+i*9+k+Math.floor(t*6))-.5)*8:0)); } } c.stroke(); });
  c.restore();
}
function title(b,p,T){
  c.fillStyle='#1A1220'; c.fillRect(0,-40,W,H+80);
  for(var i=0;i<60;i++){ var gl=0.4+0.6*Math.sin(T*2+i); c.fillStyle='rgba(255,236,170,'+(0.12*gl)+')'; c.fillRect(rnd(i)*W,rnd(i+7)*H,14,30); }
  var wob=(rnd(Math.floor(T*6))-.5)*0.03, sc=clamp(p/0.35);
  if(b.over){ c.save(); c.globalAlpha=clamp(p/0.4); txt(b.over,W/2,160,'24px "Luckiest Guy",sans-serif','#E8C872'); c.restore(); }
  c.save(); c.translate(W/2,260); c.rotate(wob); c.scale(0.6+0.4*ease(sc),0.6+0.4*ease(sc));
  c.font=(b.title.length>12?'84px':'104px')+' "Luckiest Guy",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle=INK; c.fillText(b.title,6,8); c.fillStyle=GOLD; c.fillText(b.title,0,0);
  c.restore();
  if(b.title==='NAME THAT MACHINE'&&p>1.2){ c.save(); c.globalAlpha=clamp((p-1.2)/0.5); txt('f(x)',W/2,350,'600 40px "IBM Plex Mono",monospace','#F2EEE6'); c.restore(); }
}

/* ---------- render ---------- */
function idxAt(t){ for(var i=BEATS.length-1;i>=0;i--){ if(t>=BEATS[i].start) return i; } return 0; }
var capEl=document.getElementById('cap'), lastCap='';
function setCap(b){ var h=''; if(b&&b.t){ var n=NAMES[b.s]||[b.s.toUpperCase(),'#fff']; h='<b style="color:'+n[1]+'">'+n[0]+'</b>'+b.t.replace(/&/g,'&amp;').replace(/</g,'&lt;'); } if(h!==lastCap){ capEl.innerHTML=h; lastCap=h; } }
var SPK={machine:['mux'],everyone:['priya','zero','one','effie'],all:['priya','marcus','zero','one'],duo:['zero','one'],fg:['machf','machg'],gus:['gusC'],pigeon:['doug']};
function render(t){
  var i=idxAt(t), b=BEATS[i], p=(t-b.start)*(b.ts||1), T=Math.floor(t*12)/12, pq=Math.floor(p*12)/12;
  c.setTransform(dpr,0,0,dpr,0,0);
  if(b.title){ title(b,pq,T); c.globalAlpha=1; c.drawImage(tex,0,0,W,H); setCap(null); return; }
  setCap(b);
  var st=b.state, pv=b.prev, sp=b.s;
  var tw=Math.min(1.2,b.d*0.5), u=ease(clamp(pq/tw));
  var mouthOpen=false;
  if(b.aud){ var fi=Math.floor(p*12); mouthOpen=fi<b.aud.e.length&&b.aud.e.charAt(fi)==='1'; } else if(b.t){ mouthOpen=(p<b.d-0.35)&&Math.floor(p*8)%2===0; }
  var opt={hide:{}};
  (b.fx||[]).forEach(function(f){ var d=FX[f.n]; if(d&&d.pre){ var o=d.pre(f,p-(f.at||0)); if(o){ var hd=Object.assign({},opt.hide,o.hide||{}); Object.assign(opt,o); opt.hide=hd; } } });
  var pos={};
  for(var k in st.cast){ var tgt=st.cast[k].x, from=b.scene?tgt:(pv.cast[k]?pv.cast[k].x:(tgt>480?W+90:-90)); if(k==='doug'&&!pv.cast.doug) from=tgt; pos[k]={x:lerp(from,tgt,u),f:st.cast[k].f,walk:(u<1&&Math.abs(from-tgt)>1)}; }
  var pp={};
  for(var pk in st.props){ var P=st.props[pk]; var Q=(!b.scene&&pv.props[pk])?pv.props[pk]:P; pp[pk]=Object.assign({},P,{x:lerp(Q.x!=null?Q.x:P.x,P.x,u),y:(P.y!=null?lerp(Q.y!=null?Q.y:P.y,P.y,u):null)}); }
  if(pos.one&&opt.oneDX) pos.one.x+=opt.oneDX;
  var zFrom=b.scene?st.z.x:pv.z.x; var zx=lerp(zFrom,st.z.x,u), zrot=(zx-zFrom)/30;
  var talk=function(k){ if(!mouthOpen) return false; if(sp===k) return true; var l=SPK[sp]; return !!(l&&l.indexOf(k)>=0); };
  var F={pos:pos,pp:pp,zx:zx,z:st.z,T:T,t:t,pv:pv,st:st,shelfOpen:opt.shelfOpen,lidOff:opt.lidOff||(st.scene==='class'&&st.tokens),million:opt.million||(st.scene==='class'&&st.tokens),binUp:opt.binUp,candleK:opt.candleK,cardPile:opt.cardPile||(st.marcusDown?{x:560}:null),dark:opt.dark};
  c.save(); c.translate((opt.shake||0),-24);
  bg(st,t,F);
  // background machines (scaled)
  ['glitch','sam'].forEach(function(key){ var q=pp[key]; if(!q||opt.hide[key]) return; var s=q.sc||1, sw=q.sway?Math.sin(t*1.6+(key==='sam'?1:0))*0.05:0; c.save(); c.translate(q.x,GY); c.rotate(sw); c.scale(s,s); c.translate(-q.x,-GY); if(key==='glitch') glitch(q.x,T,talk('glitch'),q.fixed?1:0,{}); else sam(q.x,T,talk('sam'),{sad:q.sway}); c.restore(); });
  if(pp.mux&&!opt.hide.mux){ var mq=pp.mux; mux3(mq.x,t,talk('mux'),{sleep:mq.sleep,bad:opt.muxGold?false:mq.bad,blank:opt.muxBlank!=null?opt.muxBlank:mq.blank,gold:opt.muxGold||mq.gold,cheese:opt.muxCheese!=null?opt.muxCheese:mq.cheese,plate:opt.muxPlate,shake:opt.muxShake||0,screen:opt.muxScreen}); }
  if(pp.littlef&&!opt.hide.littlef){ var lq=pp.littlef; var lx=opt.lfX!=null?opt.lfX:lq.x; pp.littlef.x=lx; littleF(lx,T,talk('littlef'),{named:opt.lfNamed!=null?opt.lfNamed:lq.named,angry:opt.lfAngry,wind:opt.lfWind}); }
  ['machf','machg'].forEach(function(key){ var q=pp[key]; if(!q) return; var dx=key==='machf'?(opt.mfDX||0):(opt.mgDX||0); var named=key==='machf'?(opt.mfNamed!=null?opt.mfNamed:q.named):(opt.mgNamed!=null?opt.mgNamed:q.named); var hl=key==='machf'&&(opt.machfHelmet!=null?opt.machfHelmet:st.machfHelmet); machBig(key,q.x,T,talk(key),{dx:dx,dy:opt.stompY||0,f:key==='machf'?1:-1,named:named,flex:key==='machf'?opt.mfFlex:opt.mgFlex,hug:opt.hug,glow:opt.glow,helmet:hl}); });
  if(pp.ball){ var bq=pp.ball; var tm=lerp(bq.t0,bq.t1,clamp(p/b.d)); c.save(); c.translate(opt.ballDX||0,opt.ballDY||0); eraseBall(bq.x,T,{ok:bq.ok,wrong:bq.wrong,deflate:opt.ballDeflate,spin:opt.ballSpin},tm); c.restore(); F.ballTm=tm; }
  var keys=Object.keys(pos).sort(function(a,b2){ return pos[a].x-pos[b2].x; });
  keys.forEach(function(k){ if(opt.hide[k]) return; var q=pos[k]; var mood=(b.mood&&b.mood[k])||null; var dy=(opt.drop&&opt.drop[k])||0;
    if(k==='one') hero(q.x,GY+dy,q.f,talk('one'),mood,T,{capePull:opt.capePull||0,blank:(st.oneBlank||opt.oneBlankNow)&&!(opt.flare>0),dizzy:opt.oneDizzy,flare:opt.flare||0});
    else if(k==='doug') pigeon(q.x,GY,q.f,T,talk('doug'),{duck:true,puff:opt.dougPuff});
    else if(k==='marcus'&&st.marcusDown){ kid('marcus',q.x,GY-8,1,talk('marcus'),mood,false,T,{rot:-1.45}); }
    else kid(k,q.x,GY+dy,q.f,talk(k),mood,q.walk,T,{helmetBack:k==='marcus'&&st.helmetBack,helmetRot:k==='marcus'?opt.helmetRot:0,noHelmet:k==='marcus'&&(opt.marcusNoHelmet!=null?opt.marcusNoHelmet:st.marcusNoHelmet),look:k==='priya'&&b.fx&&b.fx.some(function(f){return f.n==='priyaLook';})?4:0,sc:k==='anchor'?1.25:1,mug:k==='dunmore'&&st.scene!=='hall',candle:k==='dunmore'&&st.scene==='hall'});
    if(st.dougOn===k){ var sc2=CH[k].s; pigeon(q.x+46*sc2*q.f,GY+dy-70*sc2,q.f,T,talk('doug'),{duck:true,sc:0.7,puff:opt.dougPuff}); }
  });
  if(st.z.v&&!opt.hide.zero){ var zdy=(opt.drop&&opt.drop.zero)||0; zero(zx,GY+zdy,zrot,talk('zero'),T,st.z,(b.mood&&b.mood.zero)||null); if(pp.effie&&pp.effie.onZero) effie(zx,GY-76+zdy,T,talk('effie'),{sc:0.9}); }
  if(pp.effie&&!pp.effie.onZero&&!opt.hide.effie){ var ex=opt.effieX!=null?opt.effieX:pp.effie.x; effie(ex,pp.effie.y,T,talk('effie'),{sc:1.25,hop:opt.effieHop,f:-1}); }
  if(pp.eraser&&!opt.hide.eraser){ var eq=pp.eraser; eraserC(eq.x,eq.y,T,talk('eraser'),{cheese:eq.cheese,small:eq.small||opt.eraserSmall,bow:eq.bow,card:eq.bow}); }
  bgFront(st,T,F);
  (b.fx||[]).forEach(function(f){ var d=FX[f.n]; if(d&&d.post) d.post(f,p-(f.at||0),F); });
  if(pp.ball&&pp.ball.zoom) lockZoom(pp.ball,F.ballTm,T);
  c.restore();
  if(st.scene==='class'&&st.tod==='night'){ c.fillStyle='rgba(16,24,64,.5)'; c.fillRect(0,0,W,H); var mg=c.createRadialGradient(615,90,10,600,300,380); mg.addColorStop(0,'rgba(220,230,255,.18)'); mg.addColorStop(1,'rgba(220,230,255,0)'); c.fillStyle=mg; c.fillRect(0,0,W,H); }
  c.globalAlpha=1; c.drawImage(tex,0,0,W,H);
  var g=c.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*0.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.28)'); c.fillStyle=g; c.fillRect(0,0,W,H);
}

/* ================= ZERO 2 (rewrite): the Great Machine Fair ================= */
CH.gus={skin:'#FFDBAC',shirt:'#F5C518',pants:'#4A6B3A',s:.84,seed:11};
NAMES.narrator=['NARRATOR','#C8C3D6']; NAMES.max=['MAXIMUS MILLION','#FFD23F']; NAMES.mach=['FAIR MACHINE','#FFB38A'];
var TEDDY=['#C98B55','#F4B6C2','#9ED0F0','#B9E4A0','#FFE08A','#D8B4F8'];
function teddy(x,y,s,col,rot){ c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(s,s); c.fillStyle=col; c.strokeStyle=INK; c.lineWidth=2; circ(-10,-14,6); circ(10,-14,6); circ(0,0,15); c.fillStyle=INK; circ(-5,-2,1.8,true,false); circ(5,-2,1.8,true,false); c.fillStyle='rgba(0,0,0,.25)'; ell(0,5,5,3,true,false); c.restore(); }
function hat(x,y,s,rot){ c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(s,s); c.fillStyle='#F5C518'; c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(-40,4); c.quadraticCurveTo(0,-8,44,6); c.quadraticCurveTo(10,16,-40,4); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(0,-2,26,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function fairBG(T,F){
  c.fillStyle='#9FD8F0'; c.fillRect(0,-40,W,H+80); c.fillStyle='#FFD34D'; circ(880,70,32);
  c.save(); c.translate(480,210); c.rotate(T*0.15); c.strokeStyle='#8A93A3'; c.lineWidth=4; circ(0,0,150,false,true); for(var i=0;i<8;i++){ var a=i*Math.PI/4; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(a)*150,Math.sin(a)*150); c.stroke(); c.save(); c.translate(Math.cos(a)*150,Math.sin(a)*150); c.rotate(-T*0.15); c.fillStyle=TEDDY[i%6]; c.strokeStyle=INK; c.lineWidth=2; rr(-16,0,32,22,5); c.restore(); } c.restore(); c.strokeStyle='#8A93A3'; c.lineWidth=6; c.beginPath(); c.moveTo(420,GY-14); c.lineTo(480,210); c.lineTo(540,GY-14); c.stroke();
  [[60,'#E8412C'],[860,'#2E6DA4']].forEach(function(tt){ var x=tt[0]; c.strokeStyle=INK; c.lineWidth=3; for(var s=0;s<6;s++){ c.fillStyle=s%2?'#FFFFFF':tt[1]; c.beginPath(); c.moveTo(x-90+s*30,GY-14); c.lineTo(x-90+s*30+30,GY-14); c.lineTo(x,GY-200); c.closePath(); c.fill(); c.stroke(); } c.fillStyle=tt[1]; c.beginPath(); c.moveTo(x,GY-200); c.lineTo(x,GY-240); c.lineTo(x+30,GY-228); c.lineTo(x,GY-218); c.fill(); c.stroke(); });
  c.fillStyle='#E8D39A'; c.fillRect(0,GY-14,W,H); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
  for(var r=0;r<2;r++){ c.strokeStyle='#555'; c.lineWidth=2; c.beginPath(); c.moveTo(-20,40+r*30); c.quadraticCurveTo(480,90+r*30,980,40+r*30); c.stroke(); for(var fl=0;fl<16;fl++){ var fx=fl*64+r*32, fy=40+r*30+Math.sin(fl/15*Math.PI)*48; c.fillStyle=['#E8412C','#FFD23F','#3FA66B','#2E6DA4'][(fl+r)%4]; c.beginPath(); c.moveTo(fx-12,fy); c.lineTo(fx+12,fy); c.lineTo(fx,fy+22); c.closePath(); c.fill(); c.stroke(); } }
  if(F.banner!=null){ var by=lerp(-80,120,ease(clamp(F.banner))); c.save(); c.fillStyle='#C0392B'; c.strokeStyle=INK; c.lineWidth=4; rr(200,by-30,560,64,10); txt('THE GREAT MACHINE FAIR',480,by+2,'34px "Luckiest Guy",sans-serif','#FFE14D'); c.restore(); }
}
function lockedMini(x,T){ c.save(); c.translate(x,GY); c.strokeStyle=INK; c.lineWidth=2.5; c.fillStyle='#A9AFB7'; rr(-30,-90,60,76,6); c.fillStyle='#10301F'; rr(-20,-80,40,24,4); txt('?',0,-68,'18px "Luckiest Guy",sans-serif','#5CFF8A'); c.fillStyle='#FFD23F'; rr(-8,-44,16,14,3); c.restore(); }
function maxim(x,T,talk,o){
  o=o||{}; c.save(); c.translate(x+(o.shake||0),0); c.strokeStyle=INK; c.lineWidth=4; c.lineJoin='round';
  c.fillStyle='#8E1B3A'; rr(-160,70,320,GY-84,18);
  for(var i=0;i<14;i++){ var on=Math.floor(T*4+i)%2===0&&!o.sleep; c.fillStyle=on?'#FFE14D':'#6A5A30'; circ(-150+i*23,78,5,true,false); circ(-150+i*23,GY-22,5,true,false); }
  c.fillStyle='#FFD23F'; c.beginPath(); c.moveTo(-90,72); c.lineTo(-100,20); c.lineTo(-55,46); c.lineTo(0,6); c.lineTo(55,46); c.lineTo(100,20); c.lineTo(90,72); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#E8412C'; circ(0,36,8); c.fillStyle='#2E6DA4'; circ(-58,56,6); circ(58,56,6);
  c.fillStyle='#10301F'; rr(-110,92,220,74,12);
  if(o.sleep){ c.strokeStyle='#5CFF8A'; c.lineWidth=4; c.beginPath(); c.moveTo(-60,128); c.lineTo(-24,128); c.moveTo(24,128); c.lineTo(60,128); c.stroke(); }
  else { c.fillStyle='#5CFF8A'; if(o.humble){ c.fillRect(-60,124,34,6); c.fillRect(26,124,34,6); } else { c.save(); c.translate(-42,120); c.rotate(0.25); c.fillRect(-20,-5,40,10); c.restore(); c.save(); c.translate(42,120); c.rotate(-0.25); c.fillRect(-20,-5,40,10); c.restore(); } if(talk) c.fillRect(-26,142,52,12); else c.fillRect(-26,148,52,4); }
  c.fillStyle='#1B1A22'; rr(-120,172,240,34,6); txt(o.screen||'MAXIMUS MILLION',0,190,o.screen?'600 22px "IBM Plex Mono",monospace':'18px "Luckiest Guy",sans-serif',o.screen?'#FFE14D':'#FFD23F');
  var gx0=-130, gy0=214, gw=260, gh=GY-14-120-gy0;
  c.save(); c.beginPath(); c.rect(gx0,gy0,gw,gh); c.clip(); c.fillStyle='#CFE9F5'; c.fillRect(gx0,gy0,gw,gh);
  var pile=o.open?0:1; for(var k=0;k<34;k++){ var tx=gx0+14+rnd(k)*(gw-28), ty=gy0+gh-12-rnd(k+9)*70*pile-(k%3)*10; teddy(tx,ty,0.9,TEDDY[k%6],rnd(k*3)-.5); }
  if(o.hatIn) hat(gx0+170,gy0+gh-80,0.6,0.3);
  if(o.gusIn){ kid('gus',-40,gy0+gh-18,1,o.gusTalk,null,false,T,{sc:0.8}); hat(-40,gy0+gh-134,0.46,-0.1); }
  c.strokeStyle='#8A93A3'; c.lineWidth=3; c.beginPath(); c.moveTo(60,gy0); c.lineTo(60,gy0+50+Math.sin(T*1.5)*10); c.stroke(); c.fillStyle='#A9AFB7'; c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(48,gy0+52+Math.sin(T*1.5)*10); c.lineTo(60,gy0+44+Math.sin(T*1.5)*10); c.lineTo(72,gy0+52+Math.sin(T*1.5)*10); c.lineTo(66,gy0+70+Math.sin(T*1.5)*10); c.moveTo(48,gy0+52+Math.sin(T*1.5)*10); c.lineTo(54,gy0+70+Math.sin(T*1.5)*10); c.stroke();
  c.restore();
  c.strokeStyle=INK; c.lineWidth=4; if(!o.open){ c.fillStyle='rgba(255,255,255,.18)'; rr(gx0,gy0,gw,gh,4); c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(gx0+20,gy0+10); c.lineTo(gx0+50,gy0+10); c.lineTo(gx0+20,gy0+60); c.closePath(); c.fill(); } else { c.save(); c.translate(gx0,gy0); c.scale(0.18,1); c.fillStyle='rgba(200,230,245,.7)'; rr(-gw,0,gw,gh,4); c.restore(); rr(gx0,gy0,gw,gh,4,false,true); }
  c.fillStyle='#5A0F24'; rr(20,GY-100,100,70,8); c.fillStyle='#1B1A22'; rr(34,GY-90,72,50,6); txt('PRIZES',70,GY-110,'14px "Luckiest Guy",sans-serif','#FFE14D');
  if(o.locked){ c.fillStyle='#FFD23F'; c.strokeStyle=INK; c.lineWidth=2.5; rr(58,GY-74,24,20,3); c.beginPath(); c.arc(70,GY-76,8,Math.PI,0); c.stroke(); }
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-210,GY-270); c.lineTo(-150,GY-270); c.lineTo(-160,GY-236); c.lineTo(-200,GY-236); c.closePath(); c.fill(); c.stroke(); txt('IN',-180,GY-256,'16px "Luckiest Guy",sans-serif',INK); c.fillStyle='#8E1B3A'; rr(-196,GY-236,36,30,4);
  c.restore();
}
function maxHopper(x){ return {x:x-180,y:GY-276}; }
function fairMachine(x,T,talk,o){ o=o||{}; c.save(); c.translate(x+(o.shake||0),0); c.strokeStyle=INK; c.lineWidth=3.5; c.lineJoin='round';
  c.fillStyle='#555'; rr(-70,GY-26,34,26,4); rr(36,GY-26,34,26,4);
  c.fillStyle=o.col||'#E8743B'; rr(-100,GY-280,200,258,16); c.fillStyle='#FFF3C4'; rr(-90,GY-316,180,40,8); txt(o.label||'MACHINE',0,GY-296,'20px "Luckiest Guy",sans-serif',INK);
  c.fillStyle='#B8B8B8'; c.beginPath(); c.moveTo(-40,GY-350); c.lineTo(40,GY-350); c.lineTo(26,GY-316); c.lineTo(-26,GY-316); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#10301F'; rr(-76,GY-256,152,70,10); if(o.screen) txt(o.screen,0,GY-221,'600 30px "IBM Plex Mono",monospace',o.screen==='OPEN!'?'#FFE14D':'#5CFF8A'); else { c.fillStyle='#5CFF8A'; circ(-24,GY-226,7,true,false); circ(24,GY-226,7,true,false); if(talk) c.fillRect(-16,GY-210,32,8); else c.fillRect(-16,GY-206,32,3); }
  c.fillStyle='#10301F'; rr(-60,GY-170,120,60,8); txt('?',0,GY-140,'40px "Luckiest Guy",sans-serif','#FFE14D');
  c.fillStyle='#333'; rr(-40,GY-90,80,40,6); for(var i=0;i<4;i++){ var on=Math.floor(T*3+i)%2===0; c.fillStyle=on?'#FFE14D':'#6A5A30'; circ(-60+i*40,GY-36,6,true,false); }
  c.restore(); }
function fairHopper(x){ return {x:x,y:GY-350}; }

/* ---------- sets ---------- */
var bgF3z=bg;
bg=function(st,T,F){
  if(st.scene==='fair'||st.scene==='maxi'||st.scene==='booth'){ fairBG(T,F); if(st.scene==='fair'){ lockedMini(150,T); lockedMini(820,T); } if(st.scene==='booth'){ lockedMini(560,T); lockedMini(900,T); } return; }
  if(st.scene==='news'){ var nm=st.newsMode; var gg=c.createLinearGradient(0,0,0,H); gg.addColorStop(0,'#1F4E79'); gg.addColorStop(1,'#123150'); c.fillStyle=gg; c.fillRect(0,-40,W,H+80); c.fillStyle='#C0392B'; c.strokeStyle=INK; c.lineWidth=3; rr(40,40,190,56,6); txt('SFN NEWS',135,69,'30px "Luckiest Guy",sans-serif','#fff'); c.fillStyle='#16324F'; c.fillRect(0,GY-14,W,H); c.save(); c.fillStyle='#111'; rr(600,50,320,220,10,true,false); c.beginPath(); c.rect(612,62,296,196); c.clip(); c.fillStyle='#9FD8F0'; c.fillRect(612,62,296,196); c.fillStyle='#E8D39A'; c.fillRect(612,210,296,48);
    if(nm==='fair'){ c.strokeStyle='#8A93A3'; c.lineWidth=3; circ(700,140,50,false,true); for(var i=0;i<5;i++){ c.save(); c.translate(640+i*56,0); c.fillStyle='#A9AFB7'; c.strokeStyle=INK; c.lineWidth=2; rr(-16,170,32,40,4); txt('?',0,186,'14px "Luckiest Guy",sans-serif','#10301F'); c.restore(); } c.fillStyle='#8E1B3A'; rr(840,110,56,100,6,true,false); c.fillStyle='#FFD23F'; c.beginPath(); c.moveTo(840,110); c.lineTo(850,90); c.lineTo(868,104); c.lineTo(886,90); c.lineTo(896,110); c.closePath(); c.fill(); }
    else { c.fillStyle='#FFD23F'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(740,120); c.lineTo(780,120); c.lineTo(772,160); c.lineTo(748,160); c.closePath(); c.fill(); c.stroke(); rr(744,160,32,10,2); zero(690,215,0,false,T,{mask:false},null); c.save(); c.translate(840,210); c.scale(0.5,0.5); hero(0,0,-1,false,null,T,{}); c.restore(); for(var t2=0;t2<10;t2++){ teddy(620+rnd(t2)*280,70+((T*40+rnd(t2+4)*200)%200),0.6,TEDDY[t2%6],t2); } }
    c.restore(); c.fillStyle='#C0392B'; rr(612,236,120,22,0,true,false); txt('LIVE: THE FAIR',672,247,'12px "Luckiest Guy",sans-serif','#fff'); return; }
  bgF3z(st,T,F);
};

/* ---------- effects ---------- */
function tokenArc(a,b2,u,label,col){ var P=arc(a,b2,u,130); token(P.x,P.y,label,col||'#8E5BD6',0.8); }
FX={
  fairArrive:{pre:function(f,q){ return {banner:clamp(q/0.8)}; },post:function(f,q,F){ if(q<0) return; for(var i=0;i<24;i++){ var x=rnd(i)*W, y=-20+((q*180*(0.7+rnd(i+2)*0.6)+rnd(i*3)*300)%560); c.fillStyle=['#E8412C','#FFD23F','#3FA66B','#2E6DA4','#FF6FCF'][i%5]; c.fillRect(x,y,8,5); } }},
  heroLand:{pre:function(f,q){ return q<0.9?{hide:{one:true}}:{}; },post:function(f,q,F){ if(q>=0.9) return; var o=F.pos.one; if(!o) return; var u=clamp(q/0.9); hero(o.x,lerp(-120,GY,u*u),o.f,false,null,F.T,{}); if(q>0.7) burst(o.x,GY-40,'THUD',0.5,'#FFF3C4'); }},
  heroLeave:{pre:function(f,q){ return {hide:{one:true}}; },post:function(f,q,F){ var o=F.pv.cast.one; if(!o) return; var u=clamp(q/0.9); if(q<0){ hero(o.x,GY,o.f,false,null,F.T,{}); return; } hero(o.x+u*80,GY-u*u*600,o.f,false,null,F.T,{}); }},
  pose:{post:function(f,q,F){ var p=F.pos.one; if(!p) return; var k=clamp(q/0.3)*clamp(1-(q-2.2)/0.5); c.save(); c.globalAlpha=0.35*k; c.fillStyle='#FFE97A'; for(var i=0;i<16;i++){ var a=i*Math.PI/8+q*0.3; c.beginPath(); c.moveTo(p.x,GY-100); c.lineTo(p.x+Math.cos(a)*700,GY-100+Math.sin(a)*700); c.lineTo(p.x+Math.cos(a+0.12)*700,GY-100+Math.sin(a+0.12)*700); c.closePath(); c.fill(); } c.restore(); }},
  maxWake:{pre:function(f,q){ return {maxSleep:q<0.5,maxShake:q>0.5&&q<1.2?Math.sin(q*60)*4:0}; }},
  coatBlow:{pre:function(f,q){ return {noHat:q>0.2,hatIn:q>1.3}; },post:function(f,q,F){ if(q<0.2||q>1.3) return; var g=F.pos.gus; var mx=F.pp.max.x; var u=clamp((q-0.2)/1.1); var P=arc({x:g.x,y:GY-150},{x:mx+70,y:GY-70},u,160); hat(P.x,P.y,0.6,u*8); c.save(); c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=3; for(var i=0;i<4;i++){ c.beginPath(); c.moveTo(g.x-80+i*30,GY-220+i*12); c.quadraticCurveTo(g.x+60,GY-240+i*12,g.x+200,GY-220+i*12); c.stroke(); } c.restore(); if(q<0.9) burst(g.x+80,GY-280,'WHOOSH',0.5,'#FFFFFF'); }},
  gusClimb:{pre:function(f,q){ return {noHat:true,hatIn:true,locked:q>2.2,gusInNow:q>2.2}; },post:function(f,q,F){ var mx=F.pp.max.x; var g0=F.pv.cast.gus?F.pv.cast.gus.x:300; if(q<1.5){ var u=clamp(q/1.4); kid('gus',lerp(g0,mx+70,u),GY,1,false,null,true,F.T,{}); } else if(q<2.2){ var v=clamp((q-1.5)/0.6); c.save(); c.beginPath(); c.rect(mx+20,GY-100,100,70); c.clip(); kid('gus',mx+70,GY+v*150,1,false,null,false,F.T,{sc:0.9}); c.restore(); } if(q>2.2&&q<3.0) burst(mx+150,GY-150,'CLICK',0.5,'#FFFFFF'); }},
  tokenIn:{post:function(f,q,F){ if(q<0||q>0.9) return; var a=posOf(F,f.from); var tg=f.to==='max'?maxHopper(F.pp.max.x):fairHopper(F.pp.ring.x); tokenArc(a,tg,clamp(q/0.8),f.label,'#8E5BD6'); }},
  jumpIn:{pre:function(f,q){ var o={hide:{}}; o.hide[f.who]=q<2.8; o.mScreen=q<1.8?'...':(f.fast?null:f.out); if(f.fast) o.mScreen=q<1.1?'...':undefined; return o; },post:function(f,q,F){ var m=F.pp[f.m]; var hp=f.m==='max'?maxHopper(m.x):fairHopper(m.x); var start=f.who==='zero'?{x:F.zx,y:GY-40}:{x:F.pos.one.x,y:GY-90}; var dur=f.fast?0.6:0.9;
    if(q<dur){ var P=arc(start,hp,clamp(q/dur),150); if(f.who==='zero') zero(P.x,P.y+36,q*10,false,F.T,{mask:false},null); else { c.save(); c.translate(P.x,P.y+90); c.scale(0.8,0.8); hero(0,0,1,false,'shock',F.T,{}); c.restore(); } if(q>dur*0.7) burst(hp.x,hp.y-60,f.who==='zero'?'CANNONBALL!':'HEROIC LEAP!',0.45,'#FFF3C4'); }
    if(q>2.1&&q<2.8){ var P2=arc({x:m.x+(f.m==='max'?70:0),y:GY-60},start,clamp((q-2.1)/0.7),90); if(f.who==='zero') zero(P2.x,P2.y+36,q*6,false,F.T,{mask:false},null); else { c.save(); c.translate(P2.x,P2.y+90); c.scale(0.9,0.9); hero(0,0,1,false,null,F.T,{}); c.restore(); } }
    if(q>dur&&q<1.8&&Math.floor(q*6)%2===0) burst(m.x+120,GY-360,'WHIRR',0.4,'#FFFFFF'); }},
  stepPanel:{post:function(f,q,F){ var k=q<-5?1:clamp(q/0.3); var lines=['0 → '+f.a,'1 → '+f.b2,'step: '+(f.b2-f.a>0?'+':'')+(f.b2-f.a)]; if(f.rule&&(q<-5||q>(f.ruleAt||0))) lines.push('RULE: '+f.rule); panel(250,20,lines,{alpha:k}); }},
  prize:{post:function(f,q,F){ if(q<0||q>2) return; var m=F.pp[f.m]; var u=clamp(q/0.8); teddy(m.x+lerp(0,90,u),GY-60-Math.sin(Math.PI*u)*140+u*40,1.4,TEDDY[2],u*5); if(q<1.2) burst(m.x-120,GY-360,'DING DING!',0.55,'#FFE14D'); for(var i=0;i<20;i++){ var a=rnd(i)*6.28, sp=80+rnd(i+2)*140; c.fillStyle=['#E8412C','#FFD23F','#3FA66B','#2E6DA4'][i%4]; c.fillRect(m.x+Math.cos(a)*sp*q,GY-200+Math.sin(a)*sp*q+120*q*q,7,5); } }},
  swapBooth:{pre:function(f,q){ var u=clamp(q/0.8); return {ringDX:q<0.4?u*2*600:(1-u)*600}; }},
  startStepCard:{post:function(f,q,F){ if(q<0) return; c.save(); c.globalAlpha=clamp(q/0.3); c.fillStyle='rgba(20,16,30,.9)'; c.strokeStyle=GOLD; c.lineWidth=4; rr(220,24,520,110,14); zero(330,120,0,false,F.T,{mask:false},null); txt('→ the START',450,82,'24px "Luckiest Guy",sans-serif',GOLD); c.save(); c.translate(590,126); c.scale(0.45,0.45); hero(0,0,1,false,null,F.T,{}); c.restore(); txt('→ the STEP',680,82,'24px "Luckiest Guy",sans-serif',GOLD); c.restore(); }},
  predict:{post:function(f,q,F){ var s=f.stage, k=q<-5?1:clamp(q/0.3); var lines=['start: 100']; if(s>=1) lines.push('4 steps × 25 = 100'); if(s>=2) lines.push('100 + 100 = 200'); if(s>=3) lines.push('✓ 4 → 200'); panel(260,20,lines,{alpha:1}); }},
  avalanche:{pre:function(f,q){ return {maxOpen:q>0.3,hide:{gus:true}}; },post:function(f,q,F){ var mx=F.pp.max.x; if(q<0.3) return; var u=q-0.3; for(var i=0;i<40;i++){ var st2=rnd(i)*0.8; if(u<st2) continue; var v=u-st2; var x=mx-120+rnd(i+3)*240-v*(120+rnd(i+5)*300), y=Math.min(GY-20,GY-200+v*v*400-rnd(i+7)*40); teddy(x,y,1.0,TEDDY[i%6],v*4+i); } var gu=clamp((u-0.4)/1.8); kid('gus',lerp(mx-40,560,gu),Math.min(GY,GY-120+gu*gu*120),-1,false,null,false,F.T,{rot:Math.sin(gu*6)*0.2}); hat(lerp(mx-40,560,gu),Math.min(GY,GY-120+gu*gu*120)-150,0.95,0); if(u<1.2) burst(mx,GY-380,'TEDDY-LANCHE!',0.7,'#FFE14D'); }},
  teddyRain:{post:function(f,q,F){ for(var i=0;i<22;i++){ var x=rnd(i)*W, y=-40+((q*120*(0.6+rnd(i+2)*0.6)+rnd(i*5)*500)%560); teddy(x,y,0.8,TEDDY[i%6],q*2+i); } }},
  millionCheck:{post:function(f,q,F){ var k=q<-5?1:clamp(q/0.4); panel(470,20,['25 × 1,000,000 + 100','= 25,000,100  ✓','same rule, any input'],{alpha:k}); }},
  shockMarcus:{pre:function(f,q){ return {marcusShock:true}; }}
};

/* ---------- render ---------- */
var SPK={all:['priya','marcus','zero','one'],duo:['zero','one'],max:['max'],mach:['ring']};
function render(t){
  var i=idxAt(t), b=BEATS[i], p=(t-b.start)*(b.ts||1), T=Math.floor(t*12)/12, pq=Math.floor(p*12)/12;
  c.setTransform(dpr,0,0,dpr,0,0);
  if(b.title){ title(b,pq,T); c.globalAlpha=1; c.drawImage(tex,0,0,W,H); setCap(null); return; }
  setCap(b);
  var st=b.state, pv=b.prev, sp=b.s;
  var tw=Math.min(1.2,b.d*0.5), u=ease(clamp(pq/tw));
  var mouthOpen=false;
  if(b.aud){ var fi=Math.floor(p*12); mouthOpen=fi<b.aud.e.length&&b.aud.e.charAt(fi)==='1'; } else if(b.t){ mouthOpen=(p<b.d-0.35)&&Math.floor(p*8)%2===0; }
  var opt={hide:{}};
  (b.fx||[]).forEach(function(f){ var d=FX[f.n]; if(d&&d.pre){ var o=d.pre(f,p-(f.at||0)); if(o){ var hd=Object.assign({},opt.hide,o.hide||{}); Object.assign(opt,o); opt.hide=hd; } } });
  var pos={};
  for(var k in st.cast){ var tgt=st.cast[k].x, from=b.scene?tgt:(pv.cast[k]?pv.cast[k].x:(tgt>480?W+90:-90)); pos[k]={x:lerp(from,tgt,u),f:st.cast[k].f,walk:(u<1&&Math.abs(from-tgt)>1)}; }
  var pp={}; for(var pk in st.props){ var PR=st.props[pk]; pp[pk]=Object.assign({},PR); }
  var zFrom=b.scene?st.z.x:pv.z.x; var zx=lerp(zFrom,st.z.x,u), zrot=(zx-zFrom)/30;
  var talk=function(k){ if(!mouthOpen) return false; if(sp===k) return true; var l=SPK[sp]; return !!(l&&l.indexOf(k)>=0); };
  var F={pos:pos,pp:pp,zx:zx,z:st.z,T:T,t:t,pv:pv,st:st,banner:opt.banner};
  c.save(); c.translate(0,-24);
  bg(st,t,F);
  if(pp.max){ maxim(pp.max.x,t,talk('max'),{sleep:opt.maxSleep,shake:opt.maxShake||0,screen:opt.mScreen!==undefined?opt.mScreen:pp.max.screen,gusIn:(st.gusIn||opt.gusInNow)&&!opt.maxOpen,gusTalk:sp==='gus'&&mouthOpen,hatIn:opt.hatIn&&!opt.gusInNow,open:opt.maxOpen||st.maxOpen,locked:(st.gusIn||opt.locked)&&!(opt.maxOpen||st.maxOpen),humble:(b.t||'').indexOf('small and quiet')>=0}); }
  if(pp.ring){ var rs=opt.mScreen!==undefined?opt.mScreen:pp.ring.screen; fairMachine(pp.ring.x+(opt.ringDX||0),t,talk('ring'),{label:pp.ring.label,col:pp.ring.col,screen:rs}); }
  var keys=Object.keys(pos).sort(function(a,b2){ return pos[a].x-pos[b2].x; });
  keys.forEach(function(k){ if(opt.hide[k]) return; var q=pos[k];
    if(k==='one') hero(q.x,GY,q.f,talk('one'),null,T,{});
    else { kid(k,q.x,GY,q.f,talk(k),(k==='marcus'&&opt.marcusShock)?'shock':null,q.walk,T,{}); if(k==='gus'&&!opt.noHat) hat(q.x+4*q.f,GY-150,0.95,q.f*0.05); }
  });
  if(st.z.v&&!opt.hide.zero) zero(zx,GY,zrot,talk('zero'),T,st.z,null);
  bgFront(st,T,F);
  (b.fx||[]).forEach(function(f){ var d=FX[f.n]; if(d&&d.post) d.post(f,p-(f.at||0),F); });
  c.restore();
  c.globalAlpha=1; c.drawImage(tex,0,0,W,H);
  var g=c.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*0.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.24)'); c.fillStyle=g; c.fillRect(0,0,W,H);
}
function title(b,p,T){
  var small=b.small; c.fillStyle=small?'#2A1530':'#3A1030'; c.fillRect(0,-40,W,H+80);
  for(var i=0;i<30;i++){ c.fillStyle=Math.floor(T*4+i)%2?'#FFE14D':'#6A5A30'; circ(40+i*30,40,5,true,false); circ(40+i*30,H-40,5,true,false); }
  var wob=(rnd(Math.floor(T*6))-.5)*0.03, sc=clamp(p/0.35);
  c.save(); c.translate(W/2,small?230:240); c.rotate(wob); c.scale(0.6+0.4*ease(sc),0.6+0.4*ease(sc));
  c.font='104px "Luckiest Guy",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle=INK; c.fillText(b.title,6,8); c.fillStyle='#FFD23F'; c.fillText(b.title,0,0); c.restore();
  if(b.sub){ c.save(); c.globalAlpha=clamp((p-0.3)/0.4); txt(b.sub,W/2,small?320:340,'44px "Luckiest Guy",sans-serif','#F2EEE6'); c.restore(); }
}

function bgFront(st,T,F){ if(st.scene!=='news') return; c.save(); c.fillStyle='#8B6A48'; c.strokeStyle=INK; c.lineWidth=3; rr(240,GY-66,480,90,8); c.fillStyle='#C0392B'; rr(320,GY-54,320,26,4); txt('SANDY FLATS NEWS',480,GY-41,'17px "Luckiest Guy",sans-serif','#fff'); c.restore(); }
/* from graphland */
function loopChar(x,y,T,talk,opts){
  opts=opts||{}; c.save(); c.translate(x,y); c.rotate(opts.spin||0); c.scale(opts.sc||1,opts.sc||1);
  c.lineWidth=18; c.strokeStyle=INK; ell(0,0,42,42,false,true); c.lineWidth=12; c.strokeStyle=opts.cracked?'#C26A9E':'#FF6FCF'; ell(0,0,42,42,false,true);
  c.restore(); c.save(); c.translate(x,y); c.lineWidth=2.2; c.strokeStyle=INK;
  c.fillStyle='#fff'; ell(-9,-6,7,8); ell(9,-6,7,8); c.fillStyle=INK; circ(-7,-5,2.6,true,false); circ(11,-5,2.6,true,false);
  if(talk){ c.fillStyle='#5a1a1a'; ell(0,12,9,6); } else { c.beginPath(); c.arc(0,6,11,0.2,Math.PI-0.2); c.stroke(); }
  if(opts.cracked){ c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(-30,-20); c.lineTo(-18,-8); c.lineTo(-26,4); c.moveTo(28,18); c.lineTo(16,10); c.stroke(); }
  c.restore();
}
/* from graphland */
function vlineChar(x,T,talk,opts){
  opts=opts||{}; var h=opts.kneel?210:H+60, top=opts.kneel?GY-210:-40;
  c.save(); c.globalAlpha=opts.alpha==null?1:opts.alpha;
  var gr=c.createLinearGradient(x-30,0,x+30,0); gr.addColorStop(0,'rgba(220,240,255,0)'); gr.addColorStop(0.5,'rgba(235,248,255,.95)'); gr.addColorStop(1,'rgba(220,240,255,0)');
  c.fillStyle=gr; c.fillRect(x-30,top,60,h);
  c.fillStyle='#F4FAFF'; c.fillRect(x-5,top,10,h);
  var fy=opts.kneel?GY-180:120;
  c.fillStyle='#0B1220'; rr(x-26,fy-14,52,28,8,true,false);
  c.fillStyle='#8FD3FF'; c.fillRect(x-17,fy-4,11,4); c.fillRect(x+6,fy-4,11,4);
  if(talk){ c.fillRect(x-8,fy+6,16,4); }
  c.restore();
}
/* from glitch */
function vending(v,x,T,talk,opts){
  opts=opts||{}; var top=GY-272, sx=(v.shake?(rnd(Math.floor(T*20))-.5)*5:0)+(opts.shake||0);
  c.save(); c.translate(x+sx,0); c.lineWidth=3; c.strokeStyle=INK;
  c.fillStyle='#C8372D'; rr(-78,top,156,264,10);
  c.fillStyle='#BFE3F2'; rr(-66,top+14,100,176,6);
  var cols=['#F5C518','#2FA86B','#E86A2C','#7C5CD6','#E23B6E','#3FA7E0'];
  for(var r=0;r<4;r++){ c.strokeStyle='rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(-64,top+54+r*40); c.lineTo(32,top+54+r*40); c.stroke(); for(var s=0;s<3;s++){ c.fillStyle=cols[(r*3+s)%6]; c.strokeStyle=INK; rr(-58+s*30,top+26+r*40,22,26,4); } }
  txt('B4',-17,top+200,'12px "Luckiest Guy",sans-serif','rgba(0,0,0,.4)');
  c.strokeStyle=INK;
  if(v.broken){ c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(-20,top+60); c.lineTo(-50,top+30); c.moveTo(-20,top+60); c.lineTo(20,top+20); c.moveTo(-20,top+60); c.lineTo(-40,top+150); c.moveTo(-20,top+60); c.lineTo(28,top+120); c.stroke(); c.lineWidth=3; c.strokeStyle=INK; }
  c.fillStyle='#10301F'; rr(40,top+18,30,18,3); txt(opts.price||'1.50',55,top+27,'600 10px "IBM Plex Mono",monospace',opts.price&&opts.price!=='1.50'?'#FF5B5B':'#5CFF8A');
  for(var i=0;i<3;i++){ for(var j=0;j<2;j++){ var lit=opts.press&&i===1&&j===1; c.fillStyle=lit?'#FFE14D':'#E8E8E8'; rr(42+j*14,top+46+i*14,11,11,2); } }
  c.fillStyle='#333'; rr(46,top+104,18,26,3); c.fillStyle='#111'; c.fillRect(53,top+108,4,18);
  c.fillStyle='#2A1512'; rr(-66,GY-66,100,34,6);
  c.fillStyle='#8B2A22'; rr(-78,GY-10,156,8,2,true,false);
  c.restore();
}
/* from glitch */
function crispsBag(x,y){ c.save(); c.translate(x,y); c.fillStyle='#F5C518'; c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(-18,-14); c.lineTo(18,-14); c.lineTo(16,14); c.lineTo(-16,14); c.closePath(); c.fill(); c.stroke(); txt('CRISPS',0,1,'9px "Luckiest Guy",sans-serif','#C0392B'); c.restore(); }
/* from onealone */
function gridMap(x0,y0,x1,y1,gxr,gyr){ var sx=(x1-x0)/(gxr[1]-gxr[0]), sy=(y1-y0)/(gyr[1]-gyr[0]); return {x:function(v){ return x0+(v-gxr[0])*sx; }, y:function(v){ return y1-(v-gyr[0])*sy; }, sx:sx, sy:sy, gxr:gxr, gyr:gyr, x0:x0,y0:y0,x1:x1,y1:y1}; }
/* from onealone */
function drawPlane(G,o){
  o=o||{}; c.save(); c.lineWidth=1;
  for(var i=G.gxr[0];i<=G.gxr[1];i++){ c.strokeStyle=o.minor||'rgba(92,200,255,.16)'; c.beginPath(); c.moveTo(G.x(i),G.y(G.gyr[0])); c.lineTo(G.x(i),G.y(G.gyr[1])); c.stroke(); }
  var ys=o.ystep||1; for(var j=Math.ceil(G.gyr[0]/ys)*ys;j<=G.gyr[1];j+=ys){ c.strokeStyle=(j%(o.ymajor||5)===0)?(o.major||'rgba(92,200,255,.30)'):(o.minor||'rgba(92,200,255,.12)'); c.beginPath(); c.moveTo(G.x(G.gxr[0]),G.y(j)); c.lineTo(G.x(G.gxr[1]),G.y(j)); c.stroke(); }
  c.strokeStyle=o.axis||'#5CC8FF'; c.lineWidth=3; c.beginPath();
  if(G.gxr[0]<=0&&G.gxr[1]>=0){ c.moveTo(G.x(0),G.y(G.gyr[0])); c.lineTo(G.x(0),G.y(G.gyr[1])); }
  if(G.gyr[0]<=0&&G.gyr[1]>=0){ c.moveTo(G.x(G.gxr[0]),G.y(0)); c.lineTo(G.x(G.gxr[1]),G.y(0)); }
  c.stroke();
  var lab=o.label||'#9BDCFF', f='600 13px "IBM Plex Mono",monospace', xs=o.xlab||1;
  for(var a=G.gxr[0];a<=G.gxr[1];a+=xs){ if(a===0&&!o.zeroX) continue; txt(String(a).replace('-','−'),G.x(a),G.y(Math.max(G.gyr[0],0))+14,f,lab); }
  var yl=o.ylab||5; for(var bq=Math.ceil(G.gyr[0]/yl)*yl;bq<=G.gyr[1];bq+=yl){ if(bq===0) continue; txt(String(bq).replace('-','−'),G.x(Math.max(G.gxr[0],0))-16,G.y(bq),f,lab,'right'); }
  if(o.xname) txt(o.xname,G.x(G.gxr[1])-4,G.y(Math.max(G.gyr[0],0))+30,'600 13px "IBM Plex Mono",monospace',lab,'right');
  if(o.yname) txt(o.yname,G.x(Math.max(G.gxr[0],0))+8,G.y(G.gyr[1])+2,'600 13px "IBM Plex Mono",monospace',lab,'left');
  c.restore();
}
/* from onealone */
function glowDot(x,y,r,col,T,k){ k=k==null?1:k; if(k<=0) return; c.save(); c.shadowColor=col; c.shadowBlur=18+4*Math.sin(T*5+x); c.fillStyle=col; circ(x,y,r*k,true,false); c.shadowBlur=0; c.strokeStyle=INK; c.lineWidth=2; circ(x,y,r*k,false,true); c.restore(); }
/* from onealone */
function tag(s,x,y,col,al){ c.save(); c.globalAlpha=al==null?1:al; c.font='600 18px "IBM Plex Mono",monospace'; var w=c.measureText(s).width+18; c.fillStyle='rgba(14,16,30,.85)'; c.strokeStyle=col||GOLD; c.lineWidth=2; rr(x-w/2,y-15,w,30,8); txt(s,x,y+1,'600 18px "IBM Plex Mono",monospace',col||GOLD); c.restore(); }
/* from onealone */
function slopeTri(G,ax,ay,run,rise,col,k,o){ o=o||{}; k=k==null?1:k; if(k<=0) return; var x0=G.x(ax), y0=G.y(ay), x1=G.x(ax+run), y1=G.y(ay+rise);
  var kr=clamp(k*2), kv=clamp(k*2-1);
  c.save(); c.lineWidth=o.lw||4; c.strokeStyle=col; c.lineCap='round'; if(o.dash) c.setLineDash([10,7]);
  c.fillStyle=o.fill||'rgba(255,210,63,.10)'; if(k>=1&&!o.noFill){ c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y0); c.lineTo(x1,y1); c.closePath(); c.fill(); }
  c.beginPath(); c.moveTo(x0,y0); c.lineTo(lerp(x0,x1,kr),y0); c.stroke();
  if(kv>0){ c.beginPath(); c.moveTo(x1,y0); c.lineTo(x1,lerp(y0,y1,kv)); c.stroke(); }
  if(k>=1){ c.globalAlpha=0.8; c.beginPath(); c.moveTo(x0,y0); c.lineTo(x1,y1); c.stroke(); c.globalAlpha=1; }
  c.setLineDash([]);
  if(k>=1&&!o.noLabels){ var f='600 16px "IBM Plex Mono",monospace';
    var rl=o.runLabel||('run '+String(run).replace('-','−')), sl=o.riseLabel||('rise '+String(rise).replace('-','−'));
    txt(rl,(x0+x1)/2,y0+(rise>=0?(o.ldy||18):-14),f,col); txt(sl,x1+(run>=0?10:-10),(y0+y1)/2,f,col,run>=0?'left':'right'); }
  c.restore(); }
/* from onealone */
function nightSky(T){ var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070A18'); g.addColorStop(1,'#16203A'); c.fillStyle=g; c.fillRect(0,0,W,H); for(var i=0;i<60;i++){ c.fillStyle='rgba(255,255,255,'+(0.15+0.5*rnd(i+3)*(0.7+0.3*Math.sin(T*2+i)))+')'; circ(rnd(i)*W,rnd(i+9)*H*0.7,1+rnd(i+4)*1.5,true,false); } }
/* from onealone */
function ruler(x,y,T){ c.save(); c.translate(x,y); c.strokeStyle=INK; c.lineWidth=2.5; c.fillStyle='#E8C98A'; for(var i=0;i<4;i++){ rr(i*14,-i*14-14,14,14+i*14,1); } c.restore(); }
/* from onealone */
function lantern(x,y,T,on){ c.save(); c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(x,y-26); c.lineTo(x,y-34); c.stroke(); if(on){ var g=c.createRadialGradient(x,y,4,x,y,90); g.addColorStop(0,'rgba(255,220,120,.45)'); g.addColorStop(1,'rgba(255,220,120,0)'); c.fillStyle=g; circ(x,y,90,true,false); } c.fillStyle='#3A3A44'; rr(x-11,y-26,22,6,2); c.fillStyle=on?'#FFE58A':'#8A7F5A'; rr(x-9,y-20,18,24,3); c.fillStyle='#3A3A44'; rr(x-11,y+4,22,6,2); c.restore(); }
/* from linearorliar */
function steadyM(x,T,talk){ c.save(); c.translate(x,GY-60); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#8FB8C9'; rr(-50,-150,100,140,12); c.fillStyle='#10301F'; rr(-36,-136,72,40,8); c.fillStyle='#5CFF8A'; circ(-14,-118,5,true,false); circ(14,-118,5,true,false); if(talk) c.fillRect(-12,-106,24,6); else c.fillRect(-12,-104,24,2); txt('STEADY',0,-70,'14px "Luckiest Guy",sans-serif','rgba(0,0,0,.55)'); c.restore(); }
/* from linearorliar */
function linnyM(x,T,talk){ c.save(); c.translate(x,GY-60); c.rotate(Math.sin(T*3)*0.03); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B48AE0'; c.beginPath(); c.moveTo(-40,-10); c.lineTo(-30,-190); c.quadraticCurveTo(0,-214,30,-190); c.lineTo(40,-10); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#F7F3FF'; rr(-24,-176,48,30,10); c.fillStyle=INK; circ(-9,-161,3.5,true,false); circ(9,-161,3.5,true,false); if(talk){ c.fillStyle='#5a1a1a'; ell(0,-146,8,5); }
  c.save(); c.rotate(-0.5); c.fillStyle='#FFD23F'; rr(-60,-60,120,22,4); txt('LINEAR',0,-49,'14px "Luckiest Guy",sans-serif','#7A3EAE'); c.restore(); c.restore(); }
/* from linearorliar */
function stamp(s,x,y,col,k){ if(k<=0) return; c.save(); c.translate(x,y); c.rotate(-0.12); var sc=lerp(1.8,1,ease(clamp(k))); c.scale(sc,sc); c.globalAlpha=clamp(k*2); c.font='28px "Luckiest Guy",sans-serif'; var w=c.measureText(s).width+30; c.strokeStyle=col; c.lineWidth=4; rr(-w/2,-24,w,48,8,false,true); txt(s,0,2,'28px "Luckiest Guy",sans-serif',col); c.restore(); }
/* from linearorliar */
function card(x,y,w,h,title){ c.save(); c.fillStyle='#FFFDF3'; c.strokeStyle=INK; c.lineWidth=3; rr(x,y,w,h,8); c.fillStyle='#C0392B'; rr(x,y,w,30,8,true,false); c.fillRect(x,y+18,w,12); txt(title,x+w/2,y+16,'17px "Luckiest Guy",sans-serif','#FFFFFF'); c.restore(); }
/* from linearorliar */
function tableCard(x,y,xs,ys,o){ o=o||{}; var w=60+xs.length*62, h=150; card(x,y,w,h,o.title||'CASE FILE');
  txt('x',x+30,y+64,'600 20px "IBM Plex Mono",monospace',INK); txt('y',x+30,y+108,'600 20px "IBM Plex Mono",monospace',INK);
  xs.forEach(function(v,i){ txt(String(v),x+80+i*62,y+64,'600 22px "IBM Plex Mono",monospace',INK); txt(String(ys[i]),x+80+i*62,y+108,'600 22px "IBM Plex Mono",monospace',INK); });
  if(o.gaps) o.gaps.forEach(function(g,i){ txt(g,x+111+i*62,y+42,'600 14px "IBM Plex Mono",monospace','#2E6DA4'); });
  if(o.jumps) o.jumps.forEach(function(g,i){ txt(g,x+111+i*62,y+134,'600 14px "IBM Plex Mono",monospace','#E8412C'); });
  return {w:w,h:h}; }
/* from linearorliar */
function graphCard(x,y,w,h,xr,yr,pts,o){ o=o||{}; card(x,y,w,h,o.title||'CASE FILE'); var G=gridMap(x+30,y+44,x+w-16,y+h-24,xr,yr);
  c.save(); c.strokeStyle='rgba(46,109,164,.25)'; c.lineWidth=1; for(var i=xr[0];i<=xr[1];i++){ c.beginPath(); c.moveTo(G.x(i),G.y(yr[0])); c.lineTo(G.x(i),G.y(yr[1])); c.stroke(); } for(var j=yr[0];j<=yr[1];j+=(o.ys||1)){ c.beginPath(); c.moveTo(G.x(xr[0]),G.y(j)); c.lineTo(G.x(xr[1]),G.y(j)); c.stroke(); }
  c.strokeStyle=INK; c.lineWidth=2; c.beginPath(); c.moveTo(G.x(xr[0]),G.y(0)); c.lineTo(G.x(xr[1]),G.y(0)); c.moveTo(G.x(0),G.y(yr[0])); c.lineTo(G.x(0),G.y(yr[1])); c.stroke();
  if(o.ruler){ c.strokeStyle='#2E6DA4'; c.lineWidth=3; c.setLineDash([8,6]); c.beginPath(); c.moveTo(G.x(o.ruler[0][0]),G.y(o.ruler[0][1])); c.lineTo(G.x(o.ruler[1][0]),G.y(o.ruler[1][1])); c.stroke(); c.setLineDash([]); glowDot(G.x(o.ruler[1][0]),G.y(o.ruler[1][1]),5,'#5CC8FF',0); }
  if(o.flat!=null){ c.strokeStyle='#2F8F4E'; c.lineWidth=4; c.beginPath(); c.moveTo(G.x(xr[0]),G.y(o.flat)); c.lineTo(G.x(xr[1]),G.y(o.flat)); c.stroke(); }
  (pts||[]).forEach(function(p){ c.fillStyle='#E8412C'; circ(G.x(p[0]),G.y(p[1]),5,true,false); if(o.lab) txt('('+String(p[0]).replace('-','−')+', '+p[1]+')',G.x(p[0])+(p[0]>0?6:-6),G.y(p[1])-12,'600 12px "IBM Plex Mono",monospace',INK,p[0]>0?'left':'right'); });
  c.restore(); }
/* from linearorliar */
function podium(x){ c.save(); c.fillStyle='#8A5A34'; c.strokeStyle=INK; c.lineWidth=3; rr(x-60,GY-62,120,48,6); c.restore(); }
/* from doors */
function val(x,y,sc,talk,T,o){ o=o||{}; c.save(); c.translate(x,y); c.scale(sc*(o.f||1),sc); c.rotate((rnd(Math.floor(T*6)+83)-.5)*0.04+(o.rot||0)); c.strokeStyle=INK; c.lineWidth=3.5; c.lineJoin='round';
  // V body standing on its own point
  c.fillStyle='#FF6FB5'; c.beginPath(); c.moveTo(0,0); c.lineTo(-62,-128); c.lineTo(-30,-128); c.lineTo(0,-50); c.lineTo(30,-128); c.lineTo(62,-128); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#E0479A'; c.beginPath(); c.moveTo(0,-10); c.lineTo(-10,-30); c.lineTo(10,-30); c.closePath(); c.fill();
  // arm on hip
  c.strokeStyle=INK; c.lineWidth=9; c.beginPath(); c.moveTo(44,-96); c.quadraticCurveTo(78,-92,66,-64); c.lineTo(38,-70); c.stroke(); c.strokeStyle='#FF6FB5'; c.lineWidth=5; c.stroke();
  c.strokeStyle=INK; c.lineWidth=9; c.beginPath(); c.moveTo(-44,-96); c.lineTo(-74,-70+(o.kick?-30:0)); c.stroke(); c.strokeStyle='#FF6FB5'; c.lineWidth=5; c.stroke(); c.strokeStyle=INK; c.lineWidth=3.5;
  // screen head
  c.fillStyle='#1B1A22'; rr(-46,-186,92,56,10); c.fillStyle='#10301F'; rr(-40,-180,80,44,7,true,false);
  if(o.screen){ txt(o.screen,0,-158,'600 '+(o.screen.length>6?13:17)+'px "IBM Plex Mono",monospace',o.screenCol||'#5CFF8A'); }
  else { if(!o.noGlasses){ c.fillStyle='#050505'; c.beginPath(); c.moveTo(-34,-170); c.lineTo(-4,-170); c.lineTo(-8,-152); c.lineTo(-30,-152); c.closePath(); c.fill(); c.beginPath(); c.moveTo(4,-170); c.lineTo(34,-170); c.lineTo(30,-152); c.lineTo(8,-152); c.closePath(); c.fill(); c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=2; c.beginPath(); c.moveTo(-26,-166); c.lineTo(-18,-160); c.moveTo(12,-166); c.lineTo(20,-160); c.stroke(); c.strokeStyle='#5CFF8A'; c.beginPath(); c.moveTo(-4,-166); c.lineTo(4,-166); c.stroke(); }
    else { c.fillStyle='#5CFF8A'; circ(-14,-162,4,true,false); circ(14,-162,4,true,false); }
    if(talk){ c.fillStyle='#5CFF8A'; ell(0,-143,8,3.5,true,false); } else { c.strokeStyle='#5CFF8A'; c.lineWidth=2; c.beginPath(); c.moveTo(-8,-145); c.quadraticCurveTo(2,-140,10,-147); c.stroke(); } }
  c.restore(); }
/* from doors */
function recipMachine(cx,T,o){ o=o||{}; var door=o.door||0; c.save(); c.translate(cx+(o.shake||0),0); c.strokeStyle=INK; c.lineWidth=4;
  c.fillStyle=o.night?'#4A4438':(o.dawn?'#B8A38A':'#A89A80'); rr(-200,70,400,GY-84,14); c.fillStyle='rgba(0,0,0,.12)'; for(var i=0;i<16;i++) rr(-190+rnd(i)*360,90+rnd(i+4)*300,30+rnd(i+6)*50,4,2,true,false);
  // screen face
  c.fillStyle='#2B2A26'; rr(-96,86,192,84,10); c.fillStyle='#10301F'; rr(-86,94,172,68,6,true,false);
  if(o.screen){ txt(o.screen,0,o.screen2?118:128,'600 20px "IBM Plex Mono",monospace',o.screenCol||'#7CF2A2'); if(o.screen2) txt(o.screen2,0,146,'600 16px "IBM Plex Mono",monospace',o.screenCol2||o.screenCol||'#7CF2A2'); }
  else if(!o.sleep){ var ex=o.look||0; c.fillStyle='#7CF2A2'; rr(-50+ex,112,26,10,3,true,false); rr(24+ex,112,26,10,3,true,false); if(o.talk){ rr(-16,140,32,6+Math.abs(Math.sin(T*20))*4,2,true,false); } else { c.fillRect(-20,142,40,3); } }
  else { c.fillStyle='#7CF2A2'; c.fillRect(-46,118,24,3); c.fillRect(22,118,24,3); }
  // door
  var dW=140, dTop=GY-210, half=door*70/2*1, open=Math.min(70,door*35);
  c.fillStyle='#1A140C'; rr(-70,dTop,140,196,4,true,false); if(door>0){ var gw=Math.min(140,door*70); c.save(); var gg=c.createRadialGradient(0,GY-110,10,0,GY-110,120); gg.addColorStop(0,'rgba(255,220,120,.95)'); gg.addColorStop(1,'rgba(255,190,60,.15)'); c.fillStyle=gg; c.fillRect(-gw/2,dTop,gw,196); c.restore(); }
  var gw2=Math.min(140,door*70); c.fillStyle=o.night?'#5A5244':'#968871'; c.strokeStyle=INK; c.lineWidth=3; if(!o.sealed){ rr(-70,dTop,70-gw2/2,196,2); rr(gw2/2,dTop,70-gw2/2,196,2); } else { c.fillStyle=o.night?'#4A4438':'#A89A80'; c.fillRect(-72,dTop,144,198); }
  // crack
  c.save(); c.strokeStyle=o.crackGlow?'#FFD86B':INK; if(o.crackGlow){ c.shadowColor='#FFD23F'; c.shadowBlur=18+Math.sin(T*4)*6; } c.lineWidth=o.crackGlow?5:3; c.beginPath(); c.moveTo(0,70); c.lineTo(-10,dTop-40); c.lineTo(8,dTop-10); c.lineTo(-4,dTop); if(o.sealed){ c.lineTo(6,GY-100); c.lineTo(-2,GY-14); } c.stroke(); c.restore();
  // hopper
  c.fillStyle='#7E7666'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(196,150); c.lineTo(256,130); c.lineTo(246,170); c.lineTo(200,180); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#F3E6C4'; rr(-180,90,70,44,4); txt('1 ÷ x',-145,112,'600 15px "IBM Plex Mono",monospace',INK);
  // sand burying the base
  c.fillStyle=o.night?'#3A3326':(o.dawn?'#E2C08E':'#D9B27A'); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(-260,GY-14); c.quadraticCurveTo(-220,GY-120,-150,GY-60); c.lineTo(-150,GY-14); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(260,GY-14); c.quadraticCurveTo(230,GY-130,150,GY-70); c.lineTo(150,GY-14); c.closePath(); c.fill(); c.stroke();
  c.restore(); }
/* from doors */
function undef(x,T,talk,o){ o=o||{}; var h=o.fold!=null?(1-o.fold):1; c.save(); c.translate(x,GY); c.scale(h<1?Math.max(0.05,h):1,1);
  var jit=function(k){ return (rnd(Math.floor(T*14)+k)-.5)*8; };
  var pts=[[-22,0],[-30,-120],[-60,-180],[-44,-250],[-20,-300],[0,-340],[22,-298],[46,-248],[60,-176],[32,-118],[24,0]];
  c.beginPath(); pts.forEach(function(p,i){ var px=p[0]+jit(i), py=p[1]+jit(i+30); if(i) c.lineTo(px,py); else c.moveTo(px,py); }); c.closePath();
  c.fillStyle='rgba(10,10,16,.92)'; c.fill(); c.save(); c.strokeStyle='#D8D8E6'; c.shadowColor='rgba(220,220,240,.9)'; c.shadowBlur=18; c.lineWidth=3.5; c.stroke(); c.restore();
  for(var i=0;i<50;i++){ c.fillStyle='rgba(200,200,220,'+(0.5*rnd(i+Math.floor(T*16)))+')'; c.fillRect(-40+rnd(i*3+Math.floor(T*16))*80,-320+rnd(i*7)*310,2,2); }
  c.save(); c.shadowColor='#FFFFFF'; c.shadowBlur=16; c.fillStyle='#F4F4FF'; c.fillRect(-18+jit(90),-268,10,4); c.fillRect(8+jit(91),-268,10,4); if(talk){ c.fillRect(-10,-246,20,3+Math.abs(jit(92))*0.4); } c.restore();
  c.save(); c.strokeStyle='#E8E8F4'; c.shadowColor='#fff'; c.shadowBlur=10; c.lineWidth=3; c.beginPath(); c.moveTo(-26,-200); c.lineTo(-26,-150); c.moveTo(-10,-176); c.lineTo(10,-176); c.stroke(); c.fillStyle='#E8E8F4'; circ(0,-188,2.5,true,false); circ(0,-164,2.5,true,false); c.beginPath(); c.ellipse(26,-176,9,14,0,0,Math.PI*2); c.stroke(); c.restore();
  if(o.reach){ c.save(); c.strokeStyle='#D8D8E6'; c.lineWidth=4; c.shadowColor='#fff'; c.shadowBlur=12; c.beginPath(); c.moveTo(-40,-200); c.lineTo(-90+jit(5),-196+jit(6)); c.lineTo(-120+jit(7),-190); c.stroke(); c.restore(); }
  if(o.holding){ linkAt(-70,-190,'WORDS',T,{grey:o.grey,rot:0.3}); }
  c.restore(); }
/* from onealone: the Surveyor */
CH.surveyor={skin:'#C99B74',shirt:'#6B5B3E',pants:'#3E3A30',s:1.12,seed:41,kind:'surveyor'};
var OA_EXTRAS={
  surveyor:function(x,y,f,T,talk,o){ var sp=CH.surveyor; c.save(); c.translate(x,y); c.scale(sp.s*f,sp.s); c.rotate((rnd(Math.floor(T*6)+sp.seed)-.5)*0.045); c.strokeStyle=INK; c.lineWidth=2.4;
    c.fillStyle='#E9E4DA'; c.beginPath(); c.moveTo(-14,-108); c.quadraticCurveTo(6,-118,26,-108); c.quadraticCurveTo(6,-112,-14,-108); c.fill(); c.stroke();
    c.fillStyle='#E9E4DA'; ell(-40,-128,7,12); ell(44,-128,7,12);
    c.fillStyle='#5B4A30'; ell(0,-160,78,13); c.beginPath(); c.moveTo(-40,-162); c.quadraticCurveTo(-36,-206,4,-206); c.quadraticCurveTo(42,-206,42,-162); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#8E2F2F'; c.fillRect(-39,-172,80,8);
    c.restore(); lantern(x+48*f*sp.s,y-60,T,o.lamp!==false); },
  rita:function(x,y,f,T,talk,o){ var sp=CH.rita; c.save(); c.translate(x,y); c.scale(sp.s*f,sp.s); c.rotate((rnd(Math.floor(T*6)+sp.seed)-.5)*0.045); c.strokeStyle=INK; c.lineWidth=2.4;
    c.fillStyle='#3B2414'; c.beginPath(); c.arc(0,-130,47,Math.PI*1.02,Math.PI*1.98); c.closePath(); c.fill(); c.stroke();
    c.save(); c.translate(-44,-120); c.rotate(0.5+Math.sin(T*6)*0.15); c.fillStyle='#3B2414'; ell(0,22,10,26); c.restore();
    c.fillStyle='#E8412C'; c.beginPath(); c.arc(0,-150,40,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#E8412C'; rr(0,-156,62,10,4);
    c.fillStyle='#FFF3C4'; rr(-22,-70,44,16,3); txt('RITA',0,-62,'12px "Luckiest Guy",sans-serif','#E8412C'); c.restore(); }
};
function surveyor(x,y,f,T,talk,o){ kid('surveyor',x,y,f,talk,(o&&o.mood)||null,false,T,o||{}); OA_EXTRAS.surveyor(x,y,f,T,talk,o||{}); }
/* from fasterthan: Rental Rita and the rides */
CH.rita={skin:'#E0AC69',shirt:'#E8412C',pants:'#2D3A5A',s:1.0,seed:47,kind:'rita'};
function rita(x,y,f,T,talk,o){ kid('rita',x,y,f,talk,(o&&o.mood)||null,false,T,o||{}); OA_EXTRAS.rita(x,y,f,T,talk,o||{}); }
function taxiCar(x,y,T,who){ c.save(); c.translate(x,y); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#FFD23F'; rr(-70,-56,140,40,10); c.beginPath(); c.moveTo(-40,-56); c.lineTo(-24,-86); c.lineTo(30,-86); c.lineTo(46,-56); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#BDE3F7'; rr(-30,-80,26,22,3); rr(4,-80,30,22,3); c.fillStyle=INK; rr(-16,-98,32,12,3); txt('TAXI',0,-91,'10px "Luckiest Guy",sans-serif','#FFD23F'); circ(-42,-14,14); circ(42,-14,14); c.fillStyle='#999'; circ(-42,-14,6,true,false); circ(42,-14,6,true,false);
  if(who){ c.fillStyle='#F1C27D'; circ(19,-68,10); c.fillStyle='#E23B2E'; c.beginPath(); c.arc(19,-70,11,Math.PI,0); c.fill(); }
  c.restore(); }
function scooterR(x,y,T){ c.save(); c.translate(x,y); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#3FA66B'; rr(-44,-30,88,12,4); c.beginPath(); c.moveTo(34,-30); c.lineTo(44,-92); c.stroke(); c.beginPath(); c.moveTo(34,-92); c.lineTo(56,-92); c.stroke(); c.fillStyle='#333'; circ(-34,-12,12); circ(38,-12,12);
  c.fillStyle='#C68642'; circ(14,-70,13); c.fillStyle='#1d1d1d'; c.beginPath(); c.arc(14,-72,14,Math.PI,0); c.fill(); c.strokeStyle='#F6E7C1'; c.lineWidth=9; c.beginPath(); c.moveTo(-14,-34); c.lineTo(-14,-70); c.stroke(); c.restore(); }
function tandem(x,y,T){ c.save(); c.translate(x,y); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='none'; var sp=T*10;
  [-50,50].forEach(function(wx){ c.beginPath(); c.arc(wx,-22,22,0,Math.PI*2); c.stroke(); c.beginPath(); c.moveTo(wx+Math.cos(sp)*20,-22+Math.sin(sp)*20); c.lineTo(wx-Math.cos(sp)*20,-22-Math.sin(sp)*20); c.stroke(); });
  c.strokeStyle='#5CC8FF'; c.lineWidth=5; c.beginPath(); c.moveTo(-50,-22); c.lineTo(-20,-60); c.lineTo(30,-60); c.lineTo(50,-22); c.moveTo(-20,-60); c.lineTo(0,-22); c.lineTo(30,-60); c.stroke();
  c.restore(); c.save(); c.translate(x+22,y-48); c.scale(0.42,0.42); hero(0,0,1,false,null,T,{}); c.restore(); zero(x-28,y-44,0,false,T,{mask:true},null); }
return {c:c,dpr:dpr,W:W,H:H,GY:GY,INK:INK,GOLD:GOLD,CH:CH,NAMES:NAMES,tex:tex,TEDDY:TEDDY,
 clamp:clamp,lerp:lerp,ease:ease,rnd:rnd,rr:rr,circ:circ,ell:ell,star:star,txt:txt,burst:burst,token:token,readout:readout,arc:arc,
 kid:kid,hero:hero,zero:zero,pigeon:pigeon,mux3:mux3,effie:effie,sam:sam,glitch:glitch,littleF:littleF,machBig:machBig,eraserC:eraserC,
 panel:panel,goldText:goldText,miniGrid:miniGrid,bg:bg,candle:candle,
 teddy:teddy,hat:hat,fairBG:fairBG,lockedMini:lockedMini,maxim:maxim,fairMachine:fairMachine,loopChar:loopChar,vlineChar:vlineChar,vending:vending,crispsBag:crispsBag,gridMap:gridMap,drawPlane:drawPlane,glowDot:glowDot,tag:tag,slopeTri:slopeTri,nightSky:nightSky,ruler:ruler,lantern:lantern,steadyM:steadyM,linnyM:linnyM,stamp:stamp,card:card,tableCard:tableCard,graphCard:graphCard,podium:podium,val:val,recipMachine:recipMachine,undef:undef,surveyor:surveyor,rita:rita,taxiCar:taxiCar,scooterR:scooterR,tandem:tandem,
 reset:function(){ c.setTransform(dpr,0,0,dpr,0,0); c.globalAlpha=1; },
 grain:function(){ c.globalAlpha=1; c.drawImage(tex,0,0,W,H); var g=c.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*0.95); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.24)'); c.fillStyle=g; c.fillRect(0,0,W,H); }
};
};
