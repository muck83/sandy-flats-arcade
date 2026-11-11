var DUR=__DUR__;
__WORLD__
var EP=(function(){
/* ===== Under the Pond, Film 0: Application Accepted ===== */
var SB=window.SwitchbackWorld({c:c,W:W,H:H,GY:GY,INK:INK,GOLD:GOLD,CH:CH,NAMES:NAMES,clamp:clamp,lerp:lerp,ease:ease,rnd:rnd,rr:rr,circ:circ,ell:ell,txt:txt,burst:burst,
  gridMap:gridMap,drawPlane:drawPlane,slopeTri:slopeTri,glowDot:glowDot,tag:tag,panel:panel});
NAMES.voice=['THE VOICE','#9BDCFF']; NAMES.pigeon=['DOUG','#C8C8C8'];
function fxQ(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=F.p-(f.at||0); }); return r; }
function fxOf(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=f; }); return r; }
function on(q){ return q!=null&&q>=0; }
function grown(F,key){ return F.pv[key]&&!F.b.scene?1:F.p/0.35; }
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
var EP={
 meta:{id:'applicationaccepted',title:'Application Accepted',kicker:'Under the Pond · Film 0',accent:'#9BDCFF'},
 extras:SB.extras,
 SCENES:{
  pond:{bg:function(F){ var st=F.st, T=F.T, w=water(F), dusk=!!st.dusk;
      var g=c.createLinearGradient(0,0,0,300); g.addColorStop(0,dusk?'#5B4A7A':'#8FC4EA'); g.addColorStop(1,dusk?'#F0A66B':'#D6ECF7'); c.fillStyle=g; c.fillRect(0,0,W,H);
      c.fillStyle=dusk?'#4E6B4A':'#7FB069'; c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,300); c.quadraticCurveTo(240,262,480,292); c.quadraticCurveTo(720,318,W,280); c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill(); c.stroke();
      c.fillStyle=dusk?'#3B4656':'#B5503C'; for(var b=0;b<4;b++){ rr(60+b*70,214-(b%2)*18,54,80+(b%2)*18,3); } c.fillStyle=dusk?'#2E3644':'#7A2F22'; c.beginPath(); c.moveTo(250,232); c.lineTo(300,196); c.lineTo(350,232); c.closePath(); c.fill(); c.stroke();
      c.fillStyle='#6B5137'; rr(PX-6,250,12,60,2); c.fillStyle='#FFF3C4'; rr(PX-120,214,240,46,6); txt('THE DUCK POND',PX,238,'26px "Luckiest Guy",sans-serif',INK);
      c.fillStyle='#7A6248'; ell(PX,PY,RX,RY);
      if(w>0.02){ c.fillStyle='#5DA9D6'; var k=0.22+0.78*w; ell(PX,PY+(1-w)*8,RX*k,RY*k); c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; if(w<1){ for(var s=0;s<3;s++){ c.beginPath(); c.arc(PX,PY+6,(30+s*40)*k,T*6+s,T*6+s+1.6); c.stroke(); } } }
      if(w<0.6){ var hk=ease((0.6-w)/0.6); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#07080F'; ell(PX,PY+8,150*hk,42*hk); }
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
      if(st.dusk){ c.fillStyle='rgba(50,30,80,.22)'; c.fillRect(0,0,W,H); }
      if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet')); }},
  bottom:{bg:function(F){ var st=F.st, T=F.T;
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070913'); g.addColorStop(1,'#1B2136'); c.fillStyle=g; c.fillRect(0,0,W,H);
      for(var i=0;i<34;i++){ c.fillStyle='rgba(120,135,170,'+(0.05+0.05*rnd(i+2))+')'; ell(rnd(i)*W,rnd(i+5)*GY,20+rnd(i+9)*50,8+rnd(i+3)*16,true,false); }
      var la=st.lightUp?0.22:0.09; c.save(); c.fillStyle='rgba(214,236,247,'+la+')'; c.beginPath(); c.moveTo(420,0); c.lineTo(540,0); c.lineTo(640,GY); c.lineTo(250,GY); c.closePath(); c.fill(); c.fillStyle=st.lightUp?'#F2FAFF':'#BFE0F2'; c.shadowColor='#D6ECF7'; c.shadowBlur=st.lightUp?40:22; ell(480,6,58,14,true,false); c.restore();
      c.fillStyle='#12172A'; c.fillRect(0,GY-14,W,H); c.strokeStyle='rgba(155,220,255,.3)'; c.lineWidth=2; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
      if(st.door){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#3B4458'; rr(742,GY-250,150,236,8); c.fillStyle='#232A3D'; rr(758,GY-200,118,186,4); c.fillStyle='#8A8FA0'; circ(862,GY-104,7);
        for(var l=0;l<4;l++){ c.fillStyle='#FFB02E'; c.shadowColor='#FFB02E'; c.shadowBlur=6+6*Math.abs(Math.sin(T*3+l)); circ(776+l*27,GY-226,8); } c.shadowBlur=0; txt('FLOOR 1',817,GY-270,'18px "Luckiest Guy",sans-serif','#9BDCFF'); c.restore(); }
      SB.goat(205,GY,1,T,{sc:0.92,badge:false,col:'#E6DDC8'}); SB.goat(125,GY+4,1,T+3,{sc:0.8,badge:false}); SB.goat(640,GY,-1,T+5,{sc:1,chew:true});
      if(st.eyes){ var bl=((T+1)%2.6)<0.12; c.fillStyle='#fff'; if(!bl){ ell(390,GY-128,12,14,true,false); ell(416,GY-128,12,14,true,false); c.fillStyle=INK; circ(395,GY-126,3.6,true,false); circ(421,GY-126,3.6,true,false); } }
      if(st.banner) tag(st.banner,480,60,'#9BDCFF');
    },
    front:function(F){ var q=fxQ(F,'bleat'); if(on(q)&&q<1.0) burst(640,GY-150,'MEH.',0.5,'#FFFFFF'); var bq=fxQ(F,'bonk'); if(on(bq)&&bq<0.7) burst(400,GY-250,'BONK',0.5,'#FFE14D'); }}
 },
 FX:{
  drain:{hide:function(){ return {marcus:true}; },draw:function(){}},
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
