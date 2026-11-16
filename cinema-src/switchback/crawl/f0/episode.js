var DUR=__DUR__;
__WORLD__
var EP=(function(){
/* ===== Under the Pond, Film 0: Application Accepted (draft 6: the chase) ===== */
var SB=window.SwitchbackWorld({c:c,W:W,H:H,GY:GY,INK:INK,GOLD:GOLD,CH:CH,NAMES:NAMES,clamp:clamp,lerp:lerp,ease:ease,rnd:rnd,rr:rr,circ:circ,ell:ell,txt:txt,burst:burst,
  gridMap:gridMap,drawPlane:drawPlane,slopeTri:slopeTri,glowDot:glowDot,tag:tag,panel:panel});
NAMES.voice=['THE VOICE','#9BDCFF']; NAMES.pigeon=['DOUG','#C8C8C8'];
function fxQ(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=F.p-(f.at||0); }); return r; }
function fxOf(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=f; }); return r; }
function on(q){ return q!=null&&q>=0; }
function grown(F,key){ return F.pv[key]&&!F.b.scene?1:F.p/0.35; }
function prog(F){ return clamp(F.p/Math.max(0.01,F.b.d)); }
function tween(F,key,def){ var v=F.st[key]==null?def:F.st[key], w=F.pv[key]; if(F.b.scene||w==null) return v; return lerp(w,v,ease(prog(F))); }
function shake(F,amt){ var k=Math.floor(F.t*30); c.translate((rnd(k)-.5)*amt,(rnd(k+9)-.5)*amt); }

/* ---------- sound: ticks, hooves and thuds, made in the browser ---------- */
var AC=null, lastT=0, fired={};
function live(){ return typeof playing!=='undefined'&&playing&&typeof soundOn!=='undefined'&&soundOn; }
function snd(kind,hi){ if(!live()) return; try{
  if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume();
  var t0=AC.currentTime, g=AC.createGain(); g.connect(AC.destination);
  if(kind==='tick'){ var o=AC.createOscillator(); o.type='square'; o.frequency.value=hi?2200:1500; o.connect(g); g.gain.setValueAtTime(hi?0.09:0.05,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.05); o.start(t0); o.stop(t0+0.06); }
  else if(kind==='thud'){ var o2=AC.createOscillator(); o2.type='sine'; o2.frequency.setValueAtTime(hi?60:110,t0); o2.frequency.exponentialRampToValueAtTime(35,t0+0.35); o2.connect(g); g.gain.setValueAtTime(hi?0.7:0.35,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.45); o2.start(t0); o2.stop(t0+0.5); }
  else if(kind==='hoof'){ var n=AC.createBuffer(1,AC.sampleRate*0.06,AC.sampleRate), d=n.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length); var src=AC.createBufferSource(); src.buffer=n; var lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=hi?520:300; src.connect(lp); lp.connect(g); g.gain.value=hi?0.22:0.12; src.start(t0); }
} catch(e){} }
function once(F,name,q,kind,hi){ if(F.t<lastT-0.2) fired={}; var k=F.b.start+':'+name; if(on(q)&&q<0.25&&!fired[k]){ fired[k]=1; snd(kind,hi); } }

/* ---------- the clock: story seconds, eased between the values the beats give it ---------- */
var lastSec=null;
function clockVal(F){ var ck=F.st.clock; if(!ck) return null; var i=EP.BEATS.indexOf(F.b), nb=EP.BEATS[i+1], v=ck[1];
  if(!ck[2]&&nb&&nb.state&&nb.state.clock&&nb.state.clock[0]===ck[0]) v=lerp(ck[1],nb.state.clock[1],prog(F)); return v; }
function hud(F){ var st=F.st, T=F.T, v=clockVal(F);
  if(v!=null){ var s=Math.max(0,Math.ceil(v-0.001)), hot=s<=5, pulse=hot?0.5+0.5*Math.abs(Math.sin(F.t*Math.PI*2)):0;
    c.save(); c.translate(820,64); c.scale(1+pulse*0.06,1+pulse*0.06); c.fillStyle='rgba(10,8,14,.88)'; c.strokeStyle=hot?'#FF4B3E':'#FFD23F'; c.lineWidth=3; rr(-112,-48,224,96,12);
    txt(st.clock[0],0,-26,'600 15px "IBM Plex Mono",monospace',hot?'#FF8C80':'#FFE9A8');
    c.save(); if(hot){ c.shadowColor='#FF2A1A'; c.shadowBlur=18*pulse; } txt('0:'+String(s).padStart(2,'0'),0,16,'52px "Luckiest Guy",sans-serif',hot?'#FF4B3E':'#FFFFFF'); c.restore(); c.restore();
    if(s!==lastSec&&lastSec!=null&&!st.clock[2]) snd('tick',hot); lastSec=s; } else lastSec=null;
  if(st.goats){ c.save(); c.fillStyle='rgba(10,8,14,.85)'; c.strokeStyle='#FF4B3E'; c.lineWidth=3; rr(24,24,190,58,10); SB.goatFace(62,54,0.5); txt('GOATS: '+st.goats,138,55,'26px "Luckiest Guy",sans-serif','#FF8C80'); c.restore(); }
  if(st.freeze){ var fq=F.p; c.save(); c.fillStyle='rgba(30,26,40,.38)'; c.fillRect(0,0,W,H); if(fq<0.15){ c.fillStyle='rgba(255,255,255,'+(0.7*(1-fq/0.15))+')'; c.fillRect(0,0,W,H); }
    c.strokeStyle='#FFFFFF'; c.lineWidth=6; [[30,30,1,1],[930,30,-1,1],[30,510,1,-1],[930,510,-1,-1]].forEach(function(k){ c.beginPath(); c.moveTo(k[0],k[1]+k[3]*50); c.lineTo(k[0],k[1]); c.lineTo(k[0]+k[2]*50,k[1]); c.stroke(); }); c.restore(); }
  lastT=F.t; }

/* ---------- monsters ---------- */
// an angry goat: a staff goat with no badge, galloping, eyes lit red
function madGoat(x,y,f,T,s,i){ var bob=-Math.abs(Math.sin(T*14+i*1.7))*14*s; SB.goat(x,y+bob,f,T+i,{sc:s,badge:false,col:i%3?'#E6DDC8':'#F1ECDD'});
  var ex=x+f*s*44, ey=y+bob+s*(-78); c.save(); c.fillStyle='#FF2A1A'; c.shadowColor='#FF2A1A'; c.shadowBlur=14; ell(ex,ey,6*s,4.5*s,true,false); c.restore();
  c.save(); c.strokeStyle=INK; c.lineWidth=3*s; c.beginPath(); c.moveTo(ex-8*s*f,ey-10*s); c.lineTo(ex+6*s*f,ey-5*s); c.stroke(); c.restore(); }
function dust(x,y,T,n){ for(var i=0;i<n;i++){ var a=(T*2+rnd(i))%1; c.fillStyle='rgba(200,170,150,'+(0.35*(1-a))+')'; circ(x-a*120-rnd(i+3)*40,y-6-a*30-rnd(i+5)*20,10+a*26,true,false); } }
function flyDoug(x,y,T,sc){ c.save(); c.translate(x,y+Math.sin(T*10)*6); pigeon(0,0,1,T,false,{sc:sc||1.2}); c.strokeStyle=INK; c.lineWidth=2.2; c.fillStyle='#7F868F'; c.save(); c.translate(-2,-26); c.rotate(Math.sin(T*26)*0.9-0.3); ell(0,-14,9,18); c.restore(); c.restore(); }
// the Swapper: only ever a shadow, two lamp eyes and claws
function swapperShadow(x,y,s,T,al){ c.save(); c.globalAlpha=al; c.translate(x,y); c.scale(s,s); c.fillStyle='#05040A';
  c.beginPath(); c.moveTo(-120,60); c.quadraticCurveTo(-140,-60,-60,-110); c.lineTo(-90,-190); c.lineTo(-30,-130); c.quadraticCurveTo(0,-145,30,-130); c.lineTo(90,-190); c.lineTo(60,-110); c.quadraticCurveTo(140,-60,120,60); c.closePath(); c.fill();
  c.fillStyle='#FFD23F'; c.shadowColor='#FFD23F'; c.shadowBlur=24; var bl=((T+0.4)%3)<0.12; if(!bl){ ell(-36,-70,14,7,true,false); ell(36,-70,14,7,true,false); } c.shadowBlur=0;
  c.fillStyle='#05040A'; for(var k=0;k<3;k++){ c.beginPath(); c.moveTo(110+k*14,0); c.lineTo(160+k*18,-40+k*16); c.lineTo(122+k*14,8); c.closePath(); c.fill(); }
  c.restore(); }

/* ---------- the pond ---------- */
var PX=590, PY=432, RX=330, RY=90;
var DUCKS=[[440,412],[560,458],[690,404],[790,452],[870,418]], MUD=[[330,446],[440,392],[720,390],[810,458],[880,420]];   // on the water; on the mud once it has drained
function duck(x,y,T,f,o){ o=o||{}; c.save(); c.translate(x,y+(o.still?0:Math.sin(T*4+x)*3)); c.scale(f||1,1); c.strokeStyle=INK; c.lineWidth=2; c.fillStyle='#FFFFFF'; ell(0,0,16,10); circ(12,-11,7);
  c.fillStyle='#FF8C1A'; c.beginPath(); c.moveTo(18,-12); c.lineTo(27,-10); c.lineTo(18,-8); c.closePath(); c.fill(); c.fillStyle=INK; circ(14,-13,o.wide?2.8:1.6,true,false);
  if(o.wide){ c.strokeStyle=INK; c.lineWidth=1.5; c.beginPath(); c.moveTo(9,-19); c.lineTo(17,-18); c.stroke(); }
  if(o.badge){ c.strokeStyle='#2E6DA4'; c.lineWidth=2; c.beginPath(); c.moveTo(8,-5); c.lineTo(6,6); c.stroke(); c.strokeStyle=INK; c.lineWidth=1.5; c.fillStyle='#FFFFFF'; rr(0,5,13,10,2); c.fillStyle='#2E6DA4'; c.fillRect(1.5,6.5,10,3); }
  c.restore(); }
function pudding(x,y){ c.save(); c.strokeStyle=INK; c.lineWidth=2.5; c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(x-17,y-28); c.lineTo(x+17,y-28); c.lineTo(x+12,y); c.lineTo(x-12,y); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#7A4A2A'; rr(x-18,y-33,36,9,4); txt('PUDDING',x,y-14,'7px "Luckiest Guy",sans-serif','#7A4A2A'); c.strokeStyle='#C9C9C9'; c.lineWidth=3; c.beginPath(); c.moveTo(x+26,y); c.lineTo(x+40,y-22); c.stroke(); c.fillStyle='#C9C9C9'; c.strokeStyle=INK; c.lineWidth=1.5; ell(x+42,y-25,5,7); c.restore(); }
function helmetProp(x,y,rot,sc){ c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(sc||1,sc||1); c.strokeStyle=INK; c.lineWidth=2.8; c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,0,49,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.fillStyle='#fff'; c.fillRect(-6,-48,12,48); c.beginPath(); c.arc(0,0,49,Math.PI,Math.PI*2); c.closePath(); c.stroke(); c.restore(); }
function water(F){ var f=fxOf(F,'drain'), q=fxQ(F,'drain'); if(f&&on(q)) return 1-ease(clamp(q/(f.dur||2.4))); if(f) return 1; return F.st.water==null?1:F.st.water; }
function pondPath(){ c.beginPath(); c.rect(0,0,W,PY); c.ellipse(PX,PY,RX,RY,0,0,Math.PI*2); }

/* ---------- the tunnel ---------- */
var DOOR_X=846;
function doorGap(F){ if(F.st.slam) return 0; var v=clockVal(F); return v==null?250:250*clamp(v/9); }

/* ---------- the pen: forty goats in the dark ---------- */
var PEN=[]; for(var pi=0;pi<40;pi++){ var row=rnd(pi*3+1); PEN.push([30+rnd(pi*3)*900, GY-150-row*150, rnd(pi*3+2)<0.5?1:-1, 0.45+0.35*(1-row)]); }
PEN.sort(function(a,b){ return a[1]-b[1]; });
var ENTRANTS=[['01','FLOOR 4'],['02','FLOOR 3'],['03','FLOOR 3'],['04','FLOOR 2'],['05','FLOOR 2'],['06','FLOOR 2'],['07','FLOOR 2'],['08','FLOOR 1'],['09','FLOOR 1'],['10','FLOOR 1'],['11','FLOOR 1'],['12','ARRIVING']];

var EP={
 meta:{id:'applicationaccepted',title:'Application Accepted',kicker:'Under the Pond · Film 0',accent:'#9BDCFF'},
 extras:SB.extras,
 SCENES:{
  tunnel:{bg:function(F){ var st=F.st, T=F.T, sc=F.t*720; c.save(); shake(F,st.freeze?0:5);
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1A0608'); g.addColorStop(0.6,'#3A0E10'); g.addColorStop(1,'#140608'); c.fillStyle=g; c.fillRect(-20,-20,W+40,H+40);
      for(var r=0;r<26;r++){ var bx=((r*137-sc*0.35)%(W+200)+W+200)%(W+200)-100; c.fillStyle='rgba(120,40,40,'+(0.12+0.1*rnd(r))+')'; ell(bx,60+rnd(r+4)*300,40+rnd(r+2)*60,14+rnd(r+6)*20,true,false); }
      for(var b=0;b<6;b++){ var x=((b*240-sc)%(W+240)+W+240)%(W+240)-120; c.fillStyle='#4A2A1A'; c.strokeStyle=INK; c.lineWidth=3; rr(x-12,40,24,GY-40,3); rr(x-70,30,140,22,3);
        c.save(); c.fillStyle='#FF3B2E'; c.shadowColor='#FF3B2E'; c.shadowBlur=26; circ(x,76,9,true,false); c.restore(); }
      c.fillStyle='#22100C'; c.fillRect(-20,GY-6,W+40,H); c.strokeStyle='#6A3A2A'; c.lineWidth=4; c.beginPath(); c.moveTo(-20,GY+16); c.lineTo(W+20,GY+16); c.moveTo(-20,GY+40); c.lineTo(W+20,GY+40); c.stroke();
      c.strokeStyle='#3A2018'; c.lineWidth=8; for(var s=0;s<14;s++){ var sx=((s*80-sc)%(W+80)+W+80)%(W+80)-40; c.beginPath(); c.moveTo(sx,GY+8); c.lineTo(sx-14,GY+50); c.stroke(); }
      if(st.door){ var gap=doorGap(F); c.fillStyle='#120A0A'; c.fillRect(DOOR_X,GY-250,120,250); c.save(); c.fillStyle='#FFE9C2'; c.globalAlpha=0.5; c.fillRect(DOOR_X,GY-gap,120,gap); c.restore();
        c.strokeStyle=INK; c.lineWidth=4; c.fillStyle='#5A5F70'; rr(DOOR_X-20,GY-290,20,290,3); c.fillStyle='#4A4F5E'; rr(DOOR_X,GY-250-(250-gap)+(250-gap),120,250-gap,2);
        c.fillStyle='#3B3F4C'; for(var h=0;h<(250-gap)/30;h++) c.fillRect(DOOR_X+6,GY-gap-24-h*30,108,4);
        c.fillStyle='#FFB02E'; for(var l=0;l<4;l++){ c.fillStyle='#3A3A44'; circ(DOOR_X+20+l*26,GY-272,8); }
        c.save(); c.beginPath(); c.rect(DOOR_X,GY-gap-14,120,14); c.clip(); for(var z=0;z<8;z++){ c.fillStyle=z%2?INK:'#FFD23F'; c.beginPath(); c.moveTo(DOOR_X+z*20-14,GY-gap); c.lineTo(DOOR_X+z*20,GY-gap-14); c.lineTo(DOOR_X+z*20+20,GY-gap-14); c.lineTo(DOOR_X+z*20+6,GY-gap); c.closePath(); c.fill(); } c.restore(); }
      var hx=tween(F,'herd',-80), esc=fxQ(F,'escape');
      for(var i=11;i>=0;i--){ var row=i%3, gx=hx-Math.floor(i/3)*120-row*40, gy=GY+4+row*10-(2-row)*14; if(gx<-120) continue; madGoat(gx,gy,1,T,1.15+row*0.1,i); }
      dust(hx,GY+10,F.t,8);
      c.restore(); },
    front:function(F){ var st=F.st, T=F.T; c.save(); shake(F,st.freeze?0:5);
      var df=st.dougFly; if(df&&!on(fxQ(F,'escape'))) flyDoug(df[0],df[1],T,1.2);
      if(!st.freeze){ c.strokeStyle='rgba(255,220,200,.25)'; c.lineWidth=3; for(var i=0;i<10;i++){ var y=60+rnd(i+Math.floor(F.t*8))*380, x=rnd(i*7+Math.floor(F.t*8))*W; c.beginPath(); c.moveTo(x,y); c.lineTo(x-90,y); c.stroke(); } }
      var k=Math.floor(F.t*7); if(k!==EP._hk&&!st.freeze){ EP._hk=k; snd('hoof',k%2); }
      c.restore(); hud(F); }},
  hall:{bg:function(F){ var st=F.st, T=F.T, tq=fxQ(F,'thud'); c.save(); if(on(tq)&&tq<0.4) shake(F,14*(1-tq/0.4));
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0B0D18'); g.addColorStop(1,'#1D2236'); c.fillStyle=g; c.fillRect(-20,-20,W+40,H+40);
      for(var r=0;r<5;r++) for(var k=0;k<9;k++){ c.fillStyle='rgba(90,100,140,'+(0.08+0.06*rnd(r*9+k))+')'; rr(k*112+(r%2)*56-40,40+r*80,104,72,4,true,false); }
      c.fillStyle='#12172A'; c.fillRect(-20,GY-14,W+40,H);
      // the goat door, behind them, dented from the far side
      c.strokeStyle=INK; c.lineWidth=4; c.fillStyle='#4A4F5E'; rr(20,GY-264,150,250,4); c.fillStyle='#3B3F4C'; for(var h=0;h<8;h++) c.fillRect(26,GY-256+h*30,138,4);
      var dents=(st.dents||0)+(on(tq)?1:0); for(var d=0;d<Math.min(dents,4);d++){ c.fillStyle='rgba(20,20,30,.6)'; ell(70+d*24,GY-150+(d%2)*40,16,12,true,false); }
      // the next door, START and END above it, light under it
      var sw=fxOf(F,'swap'), sq=fxQ(F,'swap'), su=sw&&on(sq)?clamp(sq/(sw.dur||2.6)):(st.swapper?1:0);
      c.fillStyle='#2A3044'; rr(720,GY-270,190,256,6); c.fillStyle='#1A1F30'; rr(736,GY-252,158,238,4);
      c.save(); c.beginPath(); c.rect(748,GY-244,134,112); c.clip(); c.fillStyle='#FFF1C9'; c.fillRect(748,GY-244,134,112);
        if(sw&&on(sq)&&su<1){ swapperShadow(lerp(600,1040,su),GY-100,0.95,T,1); } c.restore();
      c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.rect(748,GY-244,134,112); c.moveTo(793,GY-244); c.lineTo(793,GY-132); c.moveTo(837,GY-244); c.lineTo(837,GY-132); c.stroke();
      c.save(); c.fillStyle='#FFE9A8'; c.globalAlpha=0.8; c.fillRect(736,GY-22,158,8); c.restore();
      if(sw&&on(sq)&&su<1){ c.fillStyle='#05040A'; var fx2=lerp(700,960,su); c.fillRect(fx2-30,GY-22,26,8); c.fillRect(fx2+20,GY-22,26,8); }
      [['START',0],['END',1]].forEach(function(sg){ var a=sg[1]?lerp(870,770,su):lerp(770,870,su), y=GY-300-Math.sin(su*Math.PI)*(sg[1]?40:-10);
        c.save(); c.translate(a,y); c.rotate(Math.sin(su*Math.PI*2)*0.3); c.fillStyle=sg[1]?'#FF8C80':'#8FE0A0'; c.strokeStyle=INK; c.lineWidth=3; rr(-46,-16,92,32,6); txt(sg[0],0,2,'20px "Luckiest Guy",sans-serif',INK); c.restore(); });
      c.restore(); },
    front:function(F){ var tq=fxQ(F,'thud'), nq=fxQ(F,'tiny'), sq=fxQ(F,'swap');
      once(F,'thud',tq,'thud',1); once(F,'tiny',nq,'thud',0);
      if(on(tq)&&tq<0.8) burst(110,GY-200,'THUD!',0.75,'#FFFFFF'); if(on(nq)&&nq<0.7) burst(120,GY-120,'thud.',0.32,'#FFFFFF');
      if(on(sq)&&sq>0.4&&sq<1.5) burst(640,GY-170,'SCRRRK',0.5,'#FFD23F');
      hud(F); }},
  pond:{bg:function(F){ var st=F.st, T=F.T, w=water(F), dusk=!!st.dusk;
      var g=c.createLinearGradient(0,0,0,300); g.addColorStop(0,dusk?'#5B4A7A':'#8FC4EA'); g.addColorStop(1,dusk?'#F0A66B':'#D6ECF7'); c.fillStyle=g; c.fillRect(0,0,W,H);
      c.fillStyle=dusk?'#4E6B4A':'#7FB069'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,300); c.quadraticCurveTo(240,262,480,292); c.quadraticCurveTo(720,318,W,280); c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill(); c.stroke();
      c.fillStyle=dusk?'#3B4656':'#B5503C'; for(var b=0;b<4;b++){ rr(60+b*70,214-(b%2)*18,54,80+(b%2)*18,3); } c.fillStyle=dusk?'#2E3644':'#7A2F22'; c.beginPath(); c.moveTo(250,232); c.lineTo(300,196); c.lineTo(350,232); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#6B5137'; rr(PX-6,250,12,60,2); c.fillStyle='#FFF3C4'; rr(PX-120,214,240,46,6); txt('THE DUCK POND',PX,238,'26px "Luckiest Guy",sans-serif',INK);
      c.fillStyle='#7A6248'; ell(PX,PY,RX,RY);
      if(w>0.02){ c.fillStyle='#5DA9D6'; var k=0.22+0.78*w; ell(PX,PY+(1-w)*8,RX*k,RY*k); c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; if(w<1){ for(var s=0;s<3;s++){ c.beginPath(); c.arc(PX,PY+6,(30+s*40)*k,T*6+s,T*6+s+1.6); c.stroke(); } } }
      if(w<0.6){ var hk=ease((0.6-w)/0.6), zq=fxQ(F,'seal'); if(st.sealed) hk=0; else if(on(zq)) hk*=1-ease(clamp(zq/0.3));
        if(hk>0.01){ c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#07080F'; ell(PX,PY+8,150*hk,42*hk); } }
      DUCKS.forEach(function(d,i){ var look=!!st.ducksLook, m=MUD[i], k=ease(clamp((0.7-w)/0.5)); duck(lerp(d[0],m[0],k),lerp(d[1],m[1],k),T+i,look?-1:(i%2?-1:1),{wide:look,still:w<0.5}); });
      pudding(58,GY-4);
      if(st.helmetMud){ var hq=fxQ(F,'drain'), show=hq==null||hq>1.8; if(show) helmetProp(430,470,0.35+Math.sin(T*3)*0.06,0.9); }
      if(st.badgeDuck){ var p=F.p, dx=lerp(-40,128,ease(clamp(p/1.4))), df=p<1.5?1:(p<2.0?-1:(p<2.5?1:(p<3.0?-1:1))); duck(dx,GY-4,p<1.4?T:0,df,{wide:p>1.5&&p<3.0,still:p>=1.4,badge:p>3.1}); if(p>3.1&&p<3.9) burst(170,GY-70,'STAFF',0.4,'#FFFFFF'); }
      if(st.panel) panel(790,30,st.panel,{sc:0.72});
      if(st.banner) tag(st.banner,480,60,'#9BDCFF');
    },
    front:function(F){ var st=F.st, T=F.T, w=water(F), f=fxOf(F,'drain'), q=fxQ(F,'drain');
      if(f&&on(q)){ var u=clamp(q/(f.dur||2.4)); c.save(); pondPath(); c.clip(); kid('marcus',430,GY+70+ease(u)*330,1,false,'shock',false,T,{rot:Math.sin(u*14)*0.12}); c.restore(); if(u>0.15&&u<0.75) burst(600,330,'GLUG',0.6,'#9BDCFF'); }
      var inPond=st.cast.marcus&&st.cast.marcus[2]&&st.cast.marcus[2].dy;
      if((inPond||(f&&on(q)))&&w>0.25){ c.save(); c.beginPath(); c.ellipse(PX,PY,RX,RY,0,0,Math.PI*2); c.clip(); c.fillStyle='rgba(93,169,214,.85)'; c.fillRect(0,444+(1-w)*70+Math.sin(T*3)*3,W,H); c.restore(); }
      var sq=fxQ(F,'splosh'); if(on(sq)&&sq<0.9) burst(430,330,'SPLOSH!',0.62,'#9BDCFF');
      var zq=fxQ(F,'seal'); once(F,'seal',zq,'thud',0); if(on(zq)&&zq<0.8) burst(PX,PY-40,'SHLUP!',0.55,'#9BDCFF');
      if(st.dusk){ c.fillStyle='rgba(50,30,80,.22)'; c.fillRect(0,0,W,H); }
      if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet'));
      hud(F); }},
  pen:{bg:function(F){ var st=F.st, T=F.T, gq=fxQ(F,'gate'); c.save(); if(on(gq)&&gq<0.5) shake(F,10);
      c.fillStyle='#06070D'; c.fillRect(-20,-20,W+40,H+40);
      c.strokeStyle='#2A2232'; c.lineWidth=10; for(var p=0;p<10;p++){ c.beginPath(); c.moveTo(p*104+20,120); c.lineTo(p*104+20,GY); c.stroke(); } c.lineWidth=7; c.beginPath(); c.moveTo(0,150); c.lineTo(W,150); c.moveTo(0,260); c.lineTo(W,260); c.stroke();
      var n=Math.round(tween(F,'eyes',0)), rush=on(gq)?ease(clamp(gq/1.2)):0;
      PEN.forEach(function(g,i){ if(i>=n) return; SB.goat(g[0]+rush*600*g[3],g[1],g[2],T+i,{sc:g[3],badge:false,col:'#2A2530'}); });
      c.fillStyle='rgba(4,5,10,.72)'; c.fillRect(-20,-20,W+40,H+40);
      PEN.forEach(function(g,i){ if(i>=n) return; var bl=((T*0.7+rnd(i))%2.2)<0.1; if(bl) return; var ex=g[0]+rush*600*g[3]+g[2]*g[3]*44, ey=g[1]-g[3]*78;
        c.save(); c.fillStyle='#FF2A1A'; c.shadowColor='#FF2A1A'; c.shadowBlur=12; ell(ex,ey,5*g[3]+1,3.6*g[3]+1,true,false); ell(ex-g[2]*12*g[3],ey,5*g[3]+1,3.6*g[3]+1,true,false); c.restore(); });
      c.save(); c.fillStyle='rgba(214,236,247,.13)'; c.beginPath(); c.moveTo(340,0); c.lineTo(460,0); c.lineTo(560,GY); c.lineTo(240,GY); c.closePath(); c.fill(); c.restore();
      c.fillStyle='#10131F'; c.fillRect(-20,GY-14,W+40,H);
      if(st.keith){ var kx=st.keith[0], kf=st.keith[1]; SB.goat(kx,GY,kf,T,{}); c.save(); c.fillStyle='#C9CDD6'; c.strokeStyle=INK; c.lineWidth=2; rr(kx+kf*68-6,GY-66,16,9,3); c.restore();
        var wq=fxQ(F,'whistle'); if(on(wq)&&wq<1.0) burst(kx+kf*120,GY-150,'FWEEET!',0.55,'#FFFFFF'); }
      if(st.board){ var fq=fxQ(F,'flip'), flipped=st.remains||(on(fq)&&fq>0.25);
        c.save(); c.translate(650,24); c.fillStyle='rgba(12,14,26,.92)'; c.strokeStyle='#9BDCFF'; c.lineWidth=3; rr(0,0,290,340,10);
        txt('ENTRANTS THIS CYCLE: 12',145,22,'600 15px "IBM Plex Mono",monospace','#9BDCFF');
        ENTRANTS.forEach(function(e,i){ var y=52+i*23.5, isEl=i===10, isMe=i===11, lab=e[1], col='#D6ECF7';
          if(isEl&&flipped){ lab='REMAINS'; col='#FF4B3E'; } if(isEl&&on(fq)&&fq<0.5){ c.save(); c.globalAlpha=0.5+0.5*Math.sin(fq*40); } if(isMe){ col='#FFD23F'; lab='MARCUS'; }
          txt(e[0],32,y,'600 16px "IBM Plex Mono",monospace',col); txt(lab,170,y,'600 16px "IBM Plex Mono",monospace',col); if(isEl&&on(fq)&&fq<0.5) c.restore(); });
        c.restore(); once(F,'flip',fq==null?null:fq-0.25,'thud',0); }
      c.restore(); },
    front:function(F){ var q=fxQ(F,'bleat'); if(on(q)&&q<1.0) burst(640,GY-150,'MEH.',0.5,'#FFFFFF');
      var bq=fxQ(F,'bonk'); if(on(bq)&&bq<0.7) burst(400,GY-250,'BONK',0.5,'#FFE14D');
      var eq=fxQ(F,'bleats'); if(on(eq)){ if(eq>0.3&&eq<1.2) burst(200,140,'MEH.',0.45,'#FF8C80'); if(eq>0.7&&eq<1.6) burst(780,220,'MEHHH.',0.5,'#FF8C80'); }
      var gq=fxQ(F,'gate'); once(F,'gate',gq,'thud',1); if(on(gq)&&gq<0.8) burst(860,GY-200,'CLANG!',0.6,'#FFE14D');
      hud(F); }},
  bottom:{bg:function(F){ var st=F.st, T=F.T;
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070913'); g.addColorStop(1,'#1B2136'); c.fillStyle=g; c.fillRect(0,0,W,H);
      for(var i=0;i<34;i++){ c.fillStyle='rgba(120,135,170,'+(0.05+0.05*rnd(i+2))+')'; ell(rnd(i)*W,rnd(i+5)*GY,20+rnd(i+9)*50,8+rnd(i+3)*16,true,false); }
      c.save(); c.fillStyle='rgba(214,236,247,.09)'; c.beginPath(); c.moveTo(420,0); c.lineTo(540,0); c.lineTo(640,GY); c.lineTo(250,GY); c.closePath(); c.fill(); c.restore();
      c.fillStyle='#12172A'; c.fillRect(0,GY-14,W,H); c.strokeStyle='rgba(155,220,255,.3)'; c.lineWidth=2; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
      if(st.scratch){ var k=Math.floor(F.t*2.2), jig=(rnd(k)<0.35)?(rnd(k+1)-.5)*8:0; c.save(); c.translate(jig,0); c.strokeStyle=INK; c.lineWidth=4; c.fillStyle='#4A4F5E'; rr(20,GY-264,150,250,4); c.fillStyle='#3B3F4C'; for(var h=0;h<8;h++) c.fillRect(26,GY-256+h*30,138,4);
        for(var d=0;d<4;d++){ c.fillStyle='rgba(20,20,30,.6)'; ell(70+d*24,GY-150+(d%2)*40,16,12,true,false); } c.restore();
        c.save(); c.fillStyle='#FF2A1A'; c.shadowColor='#FF2A1A'; c.shadowBlur=10; for(var e=0;e<3;e++){ if(((T+e)%1.7)<0.12) continue; ell(50+e*40,GY-8,4,2.5,true,false); ell(62+e*40,GY-8,4,2.5,true,false); } c.restore(); }
      if(st.door){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#3B4458'; rr(742,GY-250,150,236,8); c.fillStyle='#232A3D'; rr(758,GY-200,118,186,4); c.fillStyle='#8A8FA0'; circ(862,GY-104,7);
        for(var l=0;l<4;l++){ c.fillStyle='#FFB02E'; c.shadowColor='#FFB02E'; c.shadowBlur=6+6*Math.abs(Math.sin(T*3+l)); circ(776+l*27,GY-226,8); } c.shadowBlur=0; txt('FLOOR 1',817,GY-270,'18px "Luckiest Guy",sans-serif','#9BDCFF'); c.restore(); }
      if(st.banner) tag(st.banner,480,60,'#9BDCFF');
    },
    front:function(F){ var st=F.st; if(st.scratch){ var k=Math.floor(F.t*1.3); if(rnd(k)<0.5&&(F.t*1.3-k)<0.5) burst(95,GY-290,rnd(k+2)<0.5?'SCRATCH':'MEH.',0.38,'#FF8C80'); } hud(F); }}
 },
 FX:{
  drain:{hide:function(){ return {marcus:true}; },draw:function(){}},
  // Marcus drops out of the dark onto the goats
  land:{hide:function(f,q){ return q<0.5?{marcus:true}:null; },draw:function(f,q,F){ if(q<0||q>=0.5) return; var u=q/0.5; kid('marcus',400,GY-6-(1-u*u)*520,1,false,'shock',false,F.T,{rot:u*0.6}); }},
  // under the door at 0:01
  escape:{hide:function(){ return {marcus:true}; },draw:function(f,q,F){ if(q<0) return; var u=clamp(q/(f.dur||1.6)), x=lerp(560,1000,ease(u));
      c.save(); c.beginPath(); c.rect(0,0,DOOR_X,H); c.clip(); kid('marcus',x,GY-4,1,false,'shock',u<0.25,F.T,{rot:u<0.25?0.1:-1.35}); flyDoug(lerp(600,1000,ease(u)),lerp(250,GY-30,clamp(u*2)),F.T,1.1); c.restore();
      if(u>0.3&&u<0.7) burst(700,GY-160,'DUCK!',0.5,'#FFE14D'); }},
  // Doug picks up the helmet and drops into the hole
  dive:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.9, u=clamp(q/dur), x, y, sc=1;
      if(u<0.3){ var a=u/0.3; x=lerp(110,430,ease(a)); y=lerp(GY,454,ease(a))-Math.sin(a*Math.PI)*40; }
      else if(u<0.75){ var b=(u-0.3)/0.45; x=lerp(430,PX,ease(b)); y=lerp(454,PY-30,ease(b))-Math.sin(b*Math.PI)*120; }
      else { var d=(u-0.75)/0.25; x=PX; y=lerp(PY-30,PY+40,d*d); sc=1-d*0.85; }
      if(u>=1) return; c.save(); c.translate(x,y); c.scale(sc,sc); if(u>=0.3) helmetProp(10,-34,0.2,0.6); pigeon(0,0,1,F.T,false,{sc:1.2}); if(u>=0.3&&u<0.75){ c.strokeStyle=INK; c.lineWidth=2.2; c.fillStyle='#7F868F'; c.save(); c.translate(-2,-26); c.rotate(Math.sin(F.T*26)*0.9-0.3); ell(0,-14,9,18); c.restore(); } c.restore(); }}
 },
 BEATS:__BEATS__
};
EP.BEATS.forEach(function(b,i){ b.d=DUR[i]; });
return EP;
})();
