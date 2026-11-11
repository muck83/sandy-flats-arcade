/* Switchback: the shared world of the Switchback films and their arcade games.
   SwitchbackWorld(E) takes the cut-paper drawing kit (the film engine's helpers, or SFEngine's return value in a game)
   and returns the mountain's sets, props and new cast. The canonical numbers are in cinema-src/switchback/BIBLE.md. */
window.SwitchbackWorld = function (E) {
var c=E.c, W=E.W, H=E.H, GY=E.GY, INK=E.INK, GOLD=E.GOLD||'#FFD23F';
var clamp=E.clamp, lerp=E.lerp, ease=E.ease, rnd=E.rnd, rr=E.rr, circ=E.circ, ell=E.ell, txt=E.txt, burst=E.burst;
var MONO='"IBM Plex Mono",monospace', HAND='"Patrick Hand",sans-serif', DISP='"Luckiest Guy",sans-serif';
function neg(n){ return String(n).replace('-','−'); }

/* ---------- new cast ---------- */
E.CH.ines={skin:'#D9A066',shirt:'#2F5D50',pants:'#2B2B33',s:1.12,seed:53};
E.CH.tavi={skin:'#A9744F',shirt:'#E8862C',pants:'#4A4F5E',s:.92,seed:61};
if(E.NAMES){ E.NAMES.ines=['INES, STATION MASTER','#8FE0C0']; E.NAMES.tavi=['TAVI','#FFB36B']; E.NAMES.pigeon=['DOUG, SAFETY INSPECTOR','#C8C8C8']; }
function onKid(k,x,y,f,T,fn){ var sp=E.CH[k]; c.save(); c.translate(x,y); c.scale(sp.s*f,sp.s); c.rotate((rnd(Math.floor(T*6)+sp.seed)-.5)*0.045); c.strokeStyle=INK; c.lineWidth=2.4; c.lineJoin='round'; fn(); c.restore(); }
var extras={
  // Ines: grey bun, station master's cap, a pencil behind the ear
  ines:function(x,y,f,T){ onKid('ines',x,y,f,T,function(){
    c.fillStyle='#8C8C96'; circ(-44,-150,15); c.beginPath(); c.arc(0,-126,47,Math.PI*1.04,Math.PI*1.96); c.quadraticCurveTo(0,-158,-45,-132); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='#22324A'; c.beginPath(); c.moveTo(-40,-158); c.quadraticCurveTo(0,-200,40,-158); c.closePath(); c.fill(); c.stroke(); rr(-44,-164,88,12,4); rr(6,-158,54,8,4);
    c.fillStyle=GOLD; rr(-10,-182,20,12,3);
    c.fillStyle='#FFFFFF'; rr(-22,-72,22,14,2); c.strokeStyle='#2F5D50'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-18,-67); c.lineTo(-4,-67); c.moveTo(-18,-63); c.lineTo(-8,-63); c.stroke(); }); },
  // Tavi: cropped hair, goggles pushed up, a spanner in the back pocket
  tavi:function(x,y,f,T){ onKid('tavi',x,y,f,T,function(){
    c.fillStyle='#231815'; c.beginPath(); c.arc(0,-126,47,Math.PI*1.02,Math.PI*1.98); c.quadraticCurveTo(22,-150,0,-154); c.quadraticCurveTo(-26,-150,-46,-128); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle='#5A4634'; c.lineWidth=5; c.beginPath(); c.arc(0,-128,48,Math.PI*1.12,Math.PI*1.88); c.stroke(); c.strokeStyle=INK; c.lineWidth=2.4;
    c.fillStyle='#9BDCFF'; circ(-14,-162,10); circ(12,-164,10);
    c.fillStyle='#4A4F5E'; rr(-27,-60,54,40,4); c.fillStyle='#C9C9C9'; rr(-34,-40,7,30,3); circ(-30,-42,7); }); }
};

/* ---------- Keith ---------- */
function goat(x,y,f,T,o){ o=o||{}; var s=o.sc||1; c.save(); c.translate(x,y); c.scale(f*s,s); c.strokeStyle=INK; c.lineWidth=2.6; c.lineJoin='round'; c.lineCap='round';
  var col=o.col||'#F1ECDD', bob=Math.sin(T*3+x)*1.5;
  c.fillStyle='#CFC8B4'; rr(-30,-30,9,30,3); rr(-16,-28,9,28,3); rr(12,-30,9,30,3); rr(24,-28,9,28,3); c.fillStyle=INK; rr(-31,-5,11,6,2); rr(-17,-5,11,6,2); rr(11,-5,11,6,2); rr(23,-5,11,6,2);
  c.fillStyle=col; ell(0,-44+bob,42,24); c.beginPath(); c.moveTo(-40,-50+bob); c.lineTo(-54,-60+bob); c.lineTo(-42,-42+bob); c.closePath(); c.fill(); c.stroke();
  c.save(); c.translate(40,-70+bob); c.rotate(o.chew?Math.sin(T*10)*0.06:0);
  c.fillStyle='#B9AE96'; c.beginPath(); c.moveTo(-6,-18); c.quadraticCurveTo(-22,-40,-2,-48); c.quadraticCurveTo(-10,-34,2,-20); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(6,-18); c.quadraticCurveTo(0,-42,20,-44); c.quadraticCurveTo(8,-34,12,-18); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=col; c.beginPath(); c.moveTo(-14,-18); c.lineTo(14,-20); c.lineTo(30,6); c.quadraticCurveTo(28,18,16,16); c.lineTo(-10,6); c.closePath(); c.fill(); c.stroke();
  c.fillStyle=col; c.beginPath(); c.moveTo(-14,-16); c.lineTo(-30,-8); c.lineTo(-12,-6); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFE9A8'; ell(4,-8,7,6); c.fillStyle=INK; rr(0,-10,8,3.4,1,true,false);
  c.fillStyle='#E7B7B0'; ell(24,8,5,3.5);
  var jaw=o.chew?Math.abs(Math.sin(T*10))*5:0; c.fillStyle=col; c.beginPath(); c.moveTo(4,10); c.lineTo(22,15+jaw); c.lineTo(8,18+jaw); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#E9E4D4'; c.beginPath(); c.moveTo(6,17+jaw); c.lineTo(10,34+jaw); c.lineTo(14,18+jaw); c.closePath(); c.fill(); c.stroke();
  if(o.paper){ c.fillStyle='#FFFDF6'; c.save(); c.translate(26,14+jaw); c.rotate(0.5+Math.sin(T*10)*0.1); rr(0,-8,20*o.paper,16,2); c.restore(); }
  c.restore();
  if(o.badge!==false){ c.strokeStyle='#2E6DA4'; c.lineWidth=2.5; c.beginPath(); c.moveTo(30,-58+bob); c.lineTo(24,-34+bob); c.stroke(); c.strokeStyle=INK; c.lineWidth=2; c.fillStyle='#FFFFFF'; rr(13,-36+bob,22,16,2); c.fillStyle='#2E6DA4'; c.fillRect(15,-34+bob,18,4); c.save(); c.scale(f,1); txt('KEITH',f*24,-25+bob,'600 5px '+MONO,INK); c.restore(); }
  c.restore(); }
function goatFace(x,y,s){ c.save(); c.translate(x,y); c.scale(s,s); c.strokeStyle=INK; c.lineWidth=2.4; c.lineJoin='round';
  c.fillStyle='#B9AE96'; c.beginPath(); c.moveTo(-10,-20); c.quadraticCurveTo(-30,-44,-8,-50); c.quadraticCurveTo(-16,-34,-2,-22); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(10,-20); c.quadraticCurveTo(30,-44,8,-50); c.quadraticCurveTo(16,-34,2,-22); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#F1ECDD'; c.beginPath(); c.moveTo(-18,-22); c.lineTo(18,-22); c.lineTo(12,16); c.quadraticCurveTo(0,24,-12,16); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-18,-18); c.lineTo(-34,-12); c.lineTo(-17,-8); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(18,-18); c.lineTo(34,-12); c.lineTo(17,-8); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFE9A8'; ell(-8,-8,5.5,5); ell(8,-8,5.5,5); c.fillStyle=INK; rr(-11,-10,6,3,1,true,false); rr(5,-10,6,3,1,true,false);
  c.fillStyle='#E7B7B0'; ell(0,10,6,4); c.fillStyle='#E9E4D4'; c.beginPath(); c.moveTo(-4,20); c.lineTo(0,34); c.lineTo(4,20); c.closePath(); c.fill(); c.stroke(); c.restore(); }

/* ---------- backdrop ---------- */
function sky(T,top,bot){ var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,top||'#6FAEE0'); g.addColorStop(1,bot||'#DDEBF4'); c.fillStyle=g; c.fillRect(0,0,W,H);
  for(var i=0;i<4;i++){ var x=((rnd(i+2)*W+T*(5+i*3))%(W+260))-130, y=46+rnd(i+7)*110; c.fillStyle='rgba(255,255,255,.8)'; ell(x,y,60,16,true,false); ell(x+34,y-10,40,14,true,false); ell(x-36,y-6,34,12,true,false); } }
function peak(px,py,w,base,col,snow){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.lineJoin='round'; c.fillStyle=col; c.beginPath(); c.moveTo(px-w,base); c.lineTo(px,py); c.lineTo(px+w,base); c.closePath(); c.fill(); c.stroke();
  if(snow!==false){ var k=0.26, sy=py+(base-py)*k; c.fillStyle='#FFFFFF'; c.beginPath(); c.moveTo(px-w*k,sy); c.lineTo(px,py); c.lineTo(px+w*k,sy); c.lineTo(px+w*k*0.45,sy-10); c.lineTo(px,sy+6); c.lineTo(px-w*k*0.5,sy-8); c.closePath(); c.fill(); c.stroke(); } c.restore(); }
function range(base){ base=base||GY-14; peak(140,150,230,base,'#8E9BB5'); peak(820,120,260,base,'#8E9BB5'); peak(470,60,300,base,'#6F7E9C'); peak(300,230,170,base,'#7C9A78',false); peak(690,250,190,base,'#7C9A78',false); }
function ground(col,line){ c.fillStyle=col||'#8A7B66'; c.fillRect(0,GY-14,W,H); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
  if(line!==false){ c.save(); c.strokeStyle='rgba(0,0,0,.18)'; c.lineWidth=2; for(var x=40;x<W;x+=90){ c.beginPath(); c.moveTo(x,GY-14); c.lineTo(x-20,H); c.stroke(); } c.restore(); } }

// underground: dark rock, a floor, no sky (the Under the Pond films)
function cave(T,noFloor){ var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#070913'); g.addColorStop(1,'#1B2136'); c.fillStyle=g; c.fillRect(0,0,W,H);
  for(var i=0;i<34;i++){ c.fillStyle='rgba(120,135,170,'+(0.05+0.05*rnd(i+2))+')'; ell(rnd(i)*W,rnd(i+5)*GY,20+rnd(i+9)*50,8+rnd(i+3)*16,true,false); }
  if(!noFloor){ c.fillStyle='#12172A'; c.fillRect(0,GY-14,W,H); c.strokeStyle='rgba(155,220,255,.3)'; c.lineWidth=2; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke(); } }
// a mine cart: o.rust for one that has stood for years
function cart(x,y,T,rot,sc,o){ o=o||{}; c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(sc||1,sc||1); c.strokeStyle=INK; c.lineWidth=3; c.lineJoin='round';
  c.fillStyle=o.rust?'#7A4A2E':'#C9982E'; c.beginPath(); c.moveTo(-30,-40); c.lineTo(30,-40); c.lineTo(24,-10); c.lineTo(-24,-10); c.closePath(); c.fill(); c.stroke(); c.fillStyle=o.rust?'#5A3420':'#8A5A1E'; rr(-32,-44,64,8,3);
  c.fillStyle=o.rust?'#4A4038':'#4A4F5E'; circ(-15,-6,8); circ(15,-6,8); c.fillStyle=o.rust?'#6B5A4A':'#C9C9C9'; circ(-15,-6,3,true,false); circ(15,-6,3,true,false);
  if(o.rust){ c.strokeStyle='rgba(230,230,240,.5)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(-30,-44); c.lineTo(-44,-70); c.moveTo(-30,-44); c.lineTo(-10,-74); c.moveTo(-40,-62); c.lineTo(-16,-64); c.stroke(); }
  c.restore(); }

/* ---------- the Base (Level 0) ---------- */
// "Days since last incident": o.k squashes the number tile while Doug flips it
function sign(x,y,n,o){ o=o||{}; c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#6B5137'; rr(x-7,y+80,14,GY-y-94,3);
  c.fillStyle='#FFF3C4'; rr(x-132,y,264,88,8); c.fillStyle='#C0392B'; rr(x-132,y,264,14,6);
  txt('DAYS SINCE',x-36,y+36,'22px '+DISP,INK); txt('LAST INCIDENT',x-36,y+64,'22px '+DISP,'#C0392B');
  c.save(); c.translate(x+88,y+50); c.scale(1,o.k==null?1:Math.max(0.06,o.k)); c.fillStyle='#1E1A2A'; rr(-34,-30,68,60,6); txt(n==null?'':neg(n),0,2,'600 40px '+MONO,GOLD); c.restore(); c.restore(); }
function desk(x){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#8A5A34'; rr(x-70,GY-60,140,12,3); c.fillStyle='#6B4426'; rr(x-62,GY-48,124,34,2); rr(x-62,GY-14,10,14,2); rr(x+52,GY-14,10,14,2);
  c.fillStyle='#FFF3C4'; rr(x-52,GY-42,104,22,3); txt('SAFETY INSPECTOR',x,GY-31,'10px '+DISP,INK); c.restore(); }
function eotm(x,y,s){ c.save(); c.translate(x,y); c.scale(s,s); c.strokeStyle=INK; c.lineWidth=3/s+1; c.fillStyle='#C9982E'; rr(-66,-70,132,140,6); c.fillStyle='#FFFDF6'; rr(-56,-60,112,120,3);
  txt('EMPLOYEE',0,-46,'13px '+DISP,INK); txt('OF THE MONTH',0,-31,'13px '+DISP,'#C0392B'); c.fillStyle='#BFE3EE'; rr(-34,-20,68,60,3); goatFace(0,14,0.8); txt('KEITH',0,51,'600 12px '+MONO,INK); c.restore(); }
function chalk(x,y,w,lines){ c.save(); c.fillStyle='#1E3A2C'; c.strokeStyle='#8A5A34'; c.lineWidth=9; rr(x,y,w,26+lines.length*36,6); lines.forEach(function(l,i){ txt(l,x+w/2,y+32+i*36,'600 25px '+HAND,'#F2EEE6'); }); c.restore(); }
function hut(T){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B5503C'; rr(-20,GY-200,150,186,4); c.fillStyle='#7A2F22'; c.beginPath(); c.moveTo(-30,GY-196); c.lineTo(60,GY-250); c.lineTo(150,GY-196); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#FFF3C4'; rr(8,GY-180,112,26,4); txt('LEVEL 0',64,GY-166,'17px '+DISP,INK); c.fillStyle='#3B4656'; rr(30,GY-130,60,116,3); c.fillStyle='#9BDCFF'; rr(40,GY-120,40,36,2);
  c.fillStyle='#4A4F5E'; circ(128,GY-232,18); c.save(); c.translate(128,GY-232); c.rotate(T*1.5); c.beginPath(); c.moveTo(-16,0); c.lineTo(16,0); c.moveTo(0,-16); c.lineTo(0,16); c.stroke(); c.restore();
  c.strokeStyle='#2B2B33'; c.lineWidth=3; c.beginPath(); c.moveTo(128,GY-250); c.lineTo(W+20,40); c.stroke(); c.restore(); }
function base(st,T,o){ o=o||{}; sky(T); range(); hut(T); ground('#9C8B72');
  if(st.board) chalk(470,36,290,st.board); else eotm(585,196,0.62);
  sign(300,150,o.sign!==undefined?o.sign:st.sign,{k:o.signK}); desk(820);
  if(st.keith) goat(st.keith[0],GY,st.keith[1],T,{chew:o.chew,paper:o.paper}); }
// the incident report: k grows it in, sk stamps it
function report(rep,k,sk){ if(!rep||k<=0) return; k=ease(clamp(k)); c.save(); c.translate(480,236); c.rotate(-0.03); c.scale(0.5+0.5*k,0.5+0.5*k); c.globalAlpha=k;
  c.fillStyle='rgba(0,0,0,.28)'; rr(-204,-126,420,270,6,true,false); c.fillStyle='#FFFDF6'; c.strokeStyle=INK; c.lineWidth=3; rr(-210,-134,420,268,6);
  c.fillStyle='#C0392B'; rr(-210,-134,420,46,6); txt('INCIDENT REPORT',0,-110,'26px '+DISP,'#FFFFFF');
  txt('Cause:',-190,-58,'600 18px '+MONO,'#6B6B76','left');
  var cause=rep.cause||'', L=[cause]; if(cause.length>22){ var m=cause.lastIndexOf(' ',22); if(m<0) m=cause.indexOf(' '); if(m>0) L=[cause.slice(0,m),cause.slice(m+1)]; }
  L.forEach(function(l,i){ txt(l,0,-18+i*40,'600 36px '+HAND,'#1F3C88'); }); c.strokeStyle='#C9C3B0'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-190,4); c.lineTo(190,4); c.moveTo(-190,44); c.lineTo(190,44); c.stroke();
  txt('Filed by:',-190,92,'600 18px '+MONO,'#6B6B76','left'); txt(rep.by||'D. Pigeon',-60,90,'600 30px '+HAND,'#1F3C88','left');
  if(rep.count) txt(rep.count,124,90,'30px '+DISP,'#C0392B');
  c.strokeStyle='#6E7580'; c.lineWidth=2.5; (rep.prints===false?[]:[[166,-52],[186,-40]]).forEach(function(p){ c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(p[0],p[1]-12); c.moveTo(p[0],p[1]-4); c.lineTo(p[0]-7,p[1]-12); c.moveTo(p[0],p[1]-4); c.lineTo(p[0]+7,p[1]-12); c.stroke(); });
  if(sk>0){ var u=clamp(sk/0.25); c.save(); c.translate(132,88); c.rotate(-0.2); c.scale(2.2-1.2*u,2.2-1.2*u); c.globalAlpha=0.85*u; c.strokeStyle='#C0392B'; c.lineWidth=4; rr(-58,-22,116,44,6,false,true); txt('FILED',0,2,'30px '+DISP,'#C0392B'); c.restore(); }
  c.restore(); }
// Marcus's helmet, close up: the season's anchor chart
function helmet(lines,k){ if(!lines||k<=0) return; k=ease(clamp(k)); c.save(); c.globalAlpha=k; c.fillStyle='rgba(10,12,24,.55)'; c.fillRect(0,0,W,H); c.translate(480,300); c.scale(0.7+0.3*k,0.7+0.3*k); c.strokeStyle=INK; c.lineWidth=5;
  c.fillStyle='#E23B2E'; c.beginPath(); c.arc(0,0,250,Math.PI,Math.PI*2); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#B32A20'; rr(-270,-6,540,34,10);
  c.fillStyle='rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(-120,-150,60,30,-0.6,0,Math.PI*2); c.fill();
  lines.forEach(function(l,i){ c.save(); c.translate(0,-170+i*52); c.rotate((rnd(i+3)-.5)*0.05); txt(l,0,0,'600 '+(l.length>24?30:38)+'px '+HAND,'#FFFFFF'); c.restore(); });
  txt('MARCUS\'S HELMET',0,-272,'22px '+DISP,GOLD); c.restore(); }

/* ---------- the shaft lift: a vertical number line, -5 to 5 ---------- */
var SHX=230; function shaftY(v){ return 250-v*40; }
function shaft(st,T,lift,o){ o=o||{}; if(o.cave) cave(T); else { sky(T); range(); ground('#9C8B72'); }
  c.save(); c.strokeStyle=INK; c.lineWidth=3;
  c.fillStyle=o.cave?'#2A3350':'#BFE0F2'; rr(60,24,360,226,8); c.fillStyle=o.cave?'#161B2E':'#6B5137'; rr(60,250,360,214,8); c.fillStyle=o.cave?'#3B4458':'#7C9A78'; c.fillRect(62,244,356,10);
  for(var i=0;i<26;i++){ c.fillStyle='rgba(0,0,0,.14)'; ell(80+rnd(i)*320,270+rnd(i+5)*180,8+rnd(i+9)*10,4,true,false); }
  c.fillStyle='#2B2B33'; rr(SHX-34,shaftY(5)-26,68,shaftY(-5)-shaftY(5)+52,6); c.fillStyle='#14182A'; c.fillRect(SHX-26,shaftY(5)-20,52,shaftY(-5)-shaftY(5)+40);
  c.strokeStyle='#8A8FA0'; c.lineWidth=2; c.beginPath(); c.moveTo(SHX,shaftY(5)-20); c.lineTo(SHX,shaftY(-5)+20); c.stroke();
  for(var v=-5;v<=5;v++){ var y=shaftY(v), z=v===0; c.strokeStyle=z?GOLD:'#F2EEE6'; c.lineWidth=z?4:2; c.beginPath(); c.moveTo(SHX-48,y); c.lineTo(SHX-34,y); c.stroke();
    var hot=o.hot!=null&&o.hot===v; if(hot){ c.save(); c.fillStyle=GOLD; c.strokeStyle=INK; c.lineWidth=2.5; rr(SHX-104,y-15,50,30,8); c.globalAlpha=0.45; c.fillRect(SHX-26,y-17,52,34); c.restore(); }
    txt(neg(v),SHX-(hot?79:60),y+1,'600 '+(hot?22:19)+'px '+MONO,hot?INK:((v<0||o.cave)?'#F2EEE6':'#1E1A2A'),hot?'center':'right'); }
  var LB=o.labels||{'5':'LOOKOUT','0':'LEVEL 0','-5':'MINE FLOOR'}; Object.keys(LB).forEach(function(lk){ var lv=+lk; txt(LB[lk],SHX+50,shaftY(lv)-(lv===0?12:0),'15px '+DISP,(o.cave||lv<0)?'#F2EEE6':'#1E1A2A','left'); });
  if(st.mark!=null){ var my=shaftY(st.mark), pu=0.6+0.4*Math.sin(T*6); c.save(); c.globalAlpha=pu; c.fillStyle=GOLD; c.strokeStyle=INK; c.lineWidth=2.5; c.beginPath(); c.moveTo(SHX+38,my); c.lineTo(SHX+58,my-11); c.lineTo(SHX+58,my+11); c.closePath(); c.fill(); c.stroke(); c.restore(); if(E.tag) E.tag('GO TO '+neg(st.mark),SHX+118,my,GOLD); }
  if(lift!=null) cabin(SHX,shaftY(lift),T);
  c.restore();
  if(st.panel&&E.panel) E.panel(st.panelX||700,st.panelY||30,st.panel,{sc:st.panelSc||0.8}); }
function cabin(x,y,T){ c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#E8B400'; rr(x-24,y-17,48,34,5); c.fillStyle='#9BDCFF'; rr(x-17,y-11,14,13,2); rr(x+3,y-11,14,13,2); c.fillStyle='#C0392B'; c.fillRect(x-22,y+8,44,5); c.restore(); }

/* ---------- the cable line: posts across, levels up ---------- */
var G=E.gridMap(86,52,620,440,[0,10],[-4,8]);
function gp(p){ return [G.x(p[0]),G.y(p[1])]; }
function gondola(x,y,T,rot,sc){ c.save(); c.translate(x,y); c.rotate((rot||0)*0.25+Math.sin(T*3)*0.05); c.scale(sc||1,sc||1); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#4A4F5E'; circ(0,0,5); c.beginPath(); c.moveTo(0,0); c.lineTo(0,16); c.stroke();
  c.fillStyle='#E23B2E'; rr(-26,16,52,36,8); c.fillStyle='#FFF3C4'; c.fillRect(-24,40,48,6); c.fillStyle='#BFE3EE'; rr(-19,22,16,14,2); rr(3,22,16,14,2); c.fillStyle='#E23B2E'; c.beginPath(); c.arc(11,34,6,Math.PI,Math.PI*2); c.fill(); c.restore(); }
// st.pts [[post, level, label, dx?, dy?]], st.span [i, j] (the span being measured), st.tris, st.car [post, level]; o.grow(id) -> 0..1
function profile(st,T,o){ o=o||{}; var GG=o.G||G; function gq(p){ return [GG.x(p[0]),GG.y(p[1])]; }
  if(o.cave) cave(T); else { var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1B2A4A'); g.addColorStop(1,'#31466B'); c.fillStyle=g; c.fillRect(0,0,W,H);
  peak(760,150,240,GY-14,'#3E557F'); peak(930,240,150,GY-14,'#4B6490',false); ground('#3B4458',false); }
  c.save(); c.translate(0,o.dy||0);
  c.fillStyle='rgba(8,10,24,.6)'; rr(GG.x0-46,GG.y0-22,GG.x1-GG.x0+70,GG.y1-GG.y0+56,12,true,false);
  E.drawPlane(GG,{ylab:2,xlab:1,ymajor:2,zeroX:true,xname:'POSTS',yname:o.yname||'LEVEL'});
  var pts=st.pts||[];
  if(pts.length>1&&st.cable!==false){ c.save(); c.strokeStyle='#C8CFDD'; c.lineWidth=3; c.beginPath(); pts.forEach(function(p,i){ var s=gq(p); if(i) c.lineTo(s[0],s[1]); else c.moveTo(s[0],s[1]); }); c.stroke(); c.restore(); }
  if(st.span&&pts[st.span[0]]&&pts[st.span[1]]){ var a=gq(pts[st.span[0]]), b=gq(pts[st.span[1]]); c.save(); c.strokeStyle=GOLD; c.lineWidth=6; c.shadowColor=GOLD; c.shadowBlur=14; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.restore(); }
  (st.tris||[]).forEach(function(tr){ var k=o.grow?o.grow(tr.id):1; E.slopeTri(GG,tr.from[0],tr.from[1],tr.run,tr.rise,tr.col||GOLD,k==null?1:k,tr.o||{}); });
  pts.forEach(function(p){ var s=gq(p); c.save(); c.strokeStyle='#8A8FA0'; c.lineWidth=3; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(s[0],s[1]+16); c.stroke(); c.restore(); E.glowDot(s[0],s[1],9,GOLD,T); if(p[2]) E.tag(p[2],s[0]+(p[3]||0),s[1]+(p[4]==null?-28:p[4]),GOLD); });
  if(st.car&&!o.noCar) { var cp=gq(st.car); if(o.cart) cart(cp[0],cp[1],T,0,0.8); else gondola(cp[0],cp[1],T,0,0.7); }
  c.restore();
  if(st.board){ c.save(); st.board.forEach(function(l,i){ E.tag(l,790,60+i*38,'#9BDCFF'); }); c.restore(); }
  if(st.panel&&E.panel) E.panel(st.panelX||790,st.panelY||30,st.panel,{sc:st.panelSc||0.66}); }

/* ---------- Ines's logbook ---------- */
// st.rows [[post, level]], st.steps shows the change between rows; o.hi = row index to highlight, o.heads = column names
function log(st,T,o){ o=o||{}; c.fillStyle='#3B2F2A'; c.fillRect(0,0,W,H); c.fillStyle='#4A3B33'; for(var i=0;i<9;i++) c.fillRect(0,i*64,W,3); ground('#2E2622',false);
  var rows=st.rows||[], x0=96, w=500, y0=40, h=420; c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#22324A'; rr(x0-16,y0-10,w+32,h+22,10); c.fillStyle='#FFFDF6'; rr(x0,y0,w,h,4);
  c.strokeStyle='#C9D4E6'; c.lineWidth=1.5; for(var ly=y0+118;ly<y0+h-10;ly+=31){ c.beginPath(); c.moveTo(x0+10,ly); c.lineTo(x0+w-10,ly); c.stroke(); }
  c.strokeStyle='#E8A0A0'; c.beginPath(); c.moveTo(x0+250,y0+56); c.lineTo(x0+250,y0+h-12); c.stroke();
  txt(o.title||'STATION LOG',x0+w/2,y0+30,'24px '+DISP,'#22324A'); var hd=o.heads||['POST','LEVEL']; txt(hd[0],x0+170,y0+80,'600 22px '+MONO,'#6B6B76'); txt(hd[1],x0+330,y0+80,'600 22px '+MONO,'#6B6B76');
  var step=Math.min(72,(h-130)/Math.max(1,rows.length));
  rows.forEach(function(r,i){ var y=y0+132+i*step; if(o.hi===i){ c.fillStyle='rgba(255,210,63,.35)'; rr(x0+100,y-24,300,48,8,true,false); }
    txt(r[0]==null?'?':neg(r[0]),x0+170,y,'600 44px '+HAND,'#1F3C88'); txt(r[1]==null?'?':neg(r[1]),x0+330,y,'600 44px '+HAND,r[1]==null?'#C0392B':'#1F3C88');
    if(st.steps&&i<rows.length-1){ var n=rows[i+1], ym=y+step/2, dx=n[0]-r[0], dy=n[1]-r[1];
      c.save(); c.strokeStyle='#C0392B'; c.lineWidth=2.5; c.beginPath(); c.arc(x0+118,ym,step/2-8,Math.PI*0.5,Math.PI*1.5); c.stroke(); c.beginPath(); c.arc(x0+382,ym,step/2-8,Math.PI*1.5,Math.PI*0.5); c.stroke(); c.restore();
      txt((dx>=0?'+':'')+neg(dx),x0+60,ym,'600 30px '+HAND,'#C0392B'); txt((dy>=0?'+':'')+neg(dy),x0+440,ym,'600 30px '+HAND,'#C0392B'); } });
  if(st.steps){ txt('posts',x0+60,y0+104,'600 15px '+MONO,'#C0392B'); txt(o.dyName||'levels',x0+440,y0+104,'600 15px '+MONO,'#C0392B'); }
  c.restore();
  if(st.panel&&E.panel) E.panel(st.panelX||790,st.panelY||30,st.panel,{sc:st.panelSc||0.72}); }

/* ---------- the goat pen ---------- */
var HERD=[[130,400,1,.9],[250,430,-1,1],[640,410,1,.95],[780,436,-1,1.05],[880,398,1,.85]];
function pen(T,o){ o=o||{}; if(o.cave) cave(T,true); else { sky(T); range(GY-150); } c.fillStyle=o.cave?'#2F4A3C':'#86B36A'; c.fillRect(0,GY-150,W,H); c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-150); c.lineTo(W,GY-150); c.stroke();
  for(var i=0;i<30;i++){ c.strokeStyle='rgba(40,90,40,.5)'; c.lineWidth=2; var x=rnd(i)*W, y=GY-130+rnd(i+4)*190; c.beginPath(); c.moveTo(x,y); c.lineTo(x+3,y-9); c.moveTo(x+5,y); c.lineTo(x+9,y-8); c.stroke(); }
  c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B98B57'; rr(0,GY-170,W,10,2); rr(0,GY-140,W,10,2); for(var p=30;p<W;p+=120) rr(p,GY-186,14,60,3);
  c.fillStyle='#FFF3C4'; rr(380,GY-250,200,54,6); txt('GOAT PEN',480,GY-222,'30px '+DISP,INK); c.fillStyle='#6B5137'; rr(473,GY-196,14,40,2);
  HERD.forEach(function(g,i){ goat(g[0],g[1],g[2],T+i,{sc:g[3],badge:false,col:i%2?'#E6DDC8':'#F1ECDD'}); }); }
function penFront(T,o){ o=o||{}; goat(330,GY+26,1,T+7,{sc:1.05,badge:false,chew:true}); goat(540,GY+30,-1,T+9,{sc:1.1,badge:false,col:'#E6DDC8'}); if(o.keith) goat(o.keith[0],GY+(o.keith[2]||0),o.keith[1],T,{chew:true});
  c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B98B57'; rr(0,GY+34,W,12,2); for(var p=70;p<W;p+=140) rr(p,GY+14,16,60,3); c.restore(); }

return { cave:cave, cart:cart, extras:extras, goat:goat, goatFace:goatFace, sky:sky, range:range, peak:peak, ground:ground, sign:sign, desk:desk, eotm:eotm, chalk:chalk, base:base, report:report, helmet:helmet,
  shaft:shaft, shaftY:shaftY, SHX:SHX, cabin:cabin, G:G, gp:gp, gondola:gondola, profile:profile, log:log, pen:pen, penFront:penFront, neg:neg };
};
