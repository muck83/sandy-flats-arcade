var DUR=__DUR__;
var EP=(function(){
/* ===== Rewind 3: The Moment Before ===== */
var G=gridMap(70,34,600,452,[0,8],[-2,15]);
function at(p){ return [G.x(p[0]),G.y(p[1])]; }
function fxQ(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=F.p-(f.at||0); }); return r; }
function fxOf(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=f; }); return r; }
var TEAM=['#FFA23A','#C99BFF','#FF7A6B','#F6E7C1'];
// the Rewinder in flight: a brass capsule with the team at the portholes
function pod(x,y,T,rot,sc){ c.save(); c.translate(x,y); c.rotate(rot||0); c.scale(sc||1,sc||1); c.strokeStyle=INK; c.lineWidth=3;
  c.fillStyle='#8A5A1E'; c.beginPath(); c.moveTo(-44,-8); c.lineTo(-62,-22); c.lineTo(-62,22); c.lineTo(-44,8); c.closePath(); c.fill(); c.stroke();
  c.fillStyle='#C9982E'; rr(-46,-24,92,48,20); c.fillStyle='rgba(255,255,255,.25)'; rr(-38,-20,60,8,4,true,false);
  TEAM.forEach(function(col,i){ var px=-27+i*18; c.fillStyle=INK; circ(px,2,7.5); c.fillStyle=col; circ(px,2,5,true,false); });
  c.fillStyle='#EDE3C8'; circ(14,-24,8); c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.moveTo(14,-24); c.lineTo(14+Math.cos(T*7)*6,-24+Math.sin(T*7)*6); c.stroke();
  for(var i=0;i<4;i++){ c.fillStyle='rgba(155,220,255,'+(0.6-i*0.14)+')'; circ(-70-i*12+Math.sin(T*20+i)*2,(rnd(i+Math.floor(T*12))-.5)*10,5-i,true,false); }
  c.restore(); }
// the Rewinder parked in the classroom: a cabinet with a slope dial
function rewinder(x,T,o){ o=o||{}; c.save(); c.translate(x,GY); c.strokeStyle=INK; c.lineWidth=3.5;
  c.fillStyle='#B07A2A'; rr(-80,-250,160,236,14); c.fillStyle='#8A5A1E'; rr(-80,-30,160,16,4);
  c.fillStyle='#14182A'; rr(-62,-232,124,70,8); txt('SLOPE',0,-214,'15px "Luckiest Guy",sans-serif','#9BDCFF');
  txt(o.dial||'?',0,-184,'600 30px "IBM Plex Mono",monospace',o.dialCol||'#FFD23F');
  c.fillStyle='#EDE3C8'; circ(0,-110,34); c.strokeStyle=INK; c.lineWidth=3; circ(0,-110,34,false,true);
  for(var k=0;k<9;k++){ var a=Math.PI*0.75+k*Math.PI*1.5/8; c.beginPath(); c.moveTo(Math.cos(a)*24,-110+Math.sin(a)*24); c.lineTo(Math.cos(a)*31,-110+Math.sin(a)*31); c.stroke(); }
  var na=Math.PI*0.75+(o.on?(0.5+0.5*Math.sin(T*3)):0.15)*Math.PI*1.5; c.strokeStyle='#C0392B'; c.lineWidth=4; c.beginPath(); c.moveTo(0,-110); c.lineTo(Math.cos(na)*26,-110+Math.sin(na)*26); c.stroke();
  for(var j=0;j<3;j++){ var on=o.on&&Math.floor(T*4+j)%3===0; c.fillStyle=on?['#FF5B5B','#FFD23F','#5CFF8A'][j]:'#4A3A2A'; c.strokeStyle=INK; c.lineWidth=2; circ(-40+j*40,-56,8); }
  c.fillStyle='#C9C9C9'; c.strokeStyle=INK; c.lineWidth=3; rr(78,-150,10,60,4); c.fillStyle='#C0392B'; circ(83,o.lever?-92:-152,11);
  txt('THE REWINDER',0,-262,'16px "Luckiest Guy",sans-serif','#FFD23F');
  if(o.on){ c.globalAlpha=0.35+0.2*Math.sin(T*8); c.strokeStyle='#9BDCFF'; c.lineWidth=6; rr(-86,-256,172,248,16,false,true); c.globalAlpha=1; }
  c.restore(); }
// a laid line y = m x + b: two glowing rails and sleepers, clipped to the grid
function railPts(m,b,x0,x1){ var a=[], N=60; for(var i=0;i<=N;i++){ var x=lerp(x0,x1,i/N), y=m*x+b; if(y>=G.gyr[0]-0.01&&y<=G.gyr[1]+0.01) a.push([x,y]); } return a; }
function rail(m,b,x0,x1,col,k,o){ o=o||{}; var pts=railPts(m,b,x0,x0+(x1-x0)*(k==null?1:k)); if(pts.length<2) return; var p0=at(pts[0]), p1=at(pts[pts.length-1]), ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]), nx=-Math.sin(ang)*5, ny=Math.cos(ang)*5;
  c.save(); c.lineCap='round'; var len=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]); c.strokeStyle='rgba(120,90,60,.9)'; c.lineWidth=3; for(var d=8;d<len;d+=16){ var u=d/len, x=lerp(p0[0],p1[0],u), y=lerp(p0[1],p1[1],u); c.beginPath(); c.moveTo(x-nx*1.7,y-ny*1.7); c.lineTo(x+nx*1.7,y+ny*1.7); c.stroke(); }
  c.shadowColor=col; c.shadowBlur=o.glow==null?10:o.glow; c.strokeStyle=col; c.lineWidth=3; [1,-1].forEach(function(sg){ c.beginPath(); c.moveTo(p0[0]+nx*sg,p0[1]+ny*sg); c.lineTo(p1[0]+nx*sg,p1[1]+ny*sg); c.stroke(); }); c.restore();
  if(o.label&&(k==null||k>=1)) tag(o.label,p1[0]+(o.ldx||-60),p1[1]+(o.ldy||-26),col); return p1; }
// a landing pad; a fake one crumbles away
function pad(p,col,T,fake,q){ var s=at(p); c.save(); if(fake&&q!=null&&q>0){ c.translate(0,q*q*300); c.rotate(q*0.6); c.globalAlpha=clamp(1-q); } c.fillStyle=col; c.strokeStyle=INK; c.lineWidth=2.5; rr(s[0]-20,s[1]-4,40,9,4); c.shadowColor=col; c.shadowBlur=12; circ(s[0],s[1]-6,4,true,false); c.restore(); }
function rain(T,n,a){ c.save(); c.strokeStyle='rgba(180,210,255,'+(a||0.35)+')'; c.lineWidth=1.5; for(var i=0;i<(n||60);i++){ var x=rnd(i)*W, y=((rnd(i+3)*H+T*520*(0.8+rnd(i+7)*0.4))%(H+40))-20; c.beginPath(); c.moveTo(x,y); c.lineTo(x-4,y+16); c.stroke(); } c.restore(); }
function duck(x,y,T,f){ c.save(); c.translate(x,y+Math.sin(T*4+x)*3); c.scale(f||1,1); c.strokeStyle=INK; c.lineWidth=2; c.fillStyle='#FFFFFF'; ell(0,0,16,10); circ(12,-11,7); c.fillStyle='#FF8C1A'; c.beginPath(); c.moveTo(18,-12); c.lineTo(27,-10); c.lineTo(18,-8); c.closePath(); c.fill(); c.fillStyle=INK; circ(14,-13,1.6,true,false); c.restore(); }
var EP={
 meta:{id:'momentbefore',title:'The Moment Before',kicker:'The Undefined Saga · Rewind 3',blurb:'To reach the second before the freeze, the team solves for the exact input: last thing done, first thing undone.',note:'Captions stay on. Before the way back appears, say what to undo first.',accent:'#FFE14D'},
 extras:EXTRAS,
 SCENES:{
  class:{bg:function(F){ var st=F.st, T=F.T;
      c.fillStyle='#3A4760'; c.fillRect(0,0,W,H); c.fillStyle='#2C3346'; c.fillRect(0,GY-14,W,H);
      c.strokeStyle=INK; c.lineWidth=3; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
      // the chalkboard
      c.save(); c.fillStyle='#1E3A2C'; c.strokeStyle='#8A5A34'; c.lineWidth=10; rr(40,50,380,200,6); (st.board||[]).forEach(function(l,i){ txt(l,230,96+i*42,'600 26px "Patrick Hand",sans-serif','#F2EEE6'); }); c.restore();
      // the window, and the rain that hasn't stopped
      c.save(); c.fillStyle='#5E6E86'; c.strokeStyle='#8A5A34'; c.lineWidth=8; rr(580,48,330,190,4); c.save(); c.beginPath(); c.rect(584,52,322,182); c.clip(); c.fillStyle='#46536B'; c.fillRect(584,52,322,182);
      for(var i=0;i<40;i++){ var x=584+rnd(i)*322, y=52+((rnd(i+9)*182+T*380)%182); c.strokeStyle='rgba(200,225,255,.55)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,y+12); c.stroke(); } c.restore();
      c.strokeStyle='#8A5A34'; c.lineWidth=5; c.beginPath(); c.moveTo(745,52); c.lineTo(745,234); c.moveTo(584,143); c.lineTo(906,143); c.stroke(); c.restore();
      if(st.day) tag('DAY '+st.day+' OF THE RAIN',745,26,'#9BDCFF');
      if(st.frost){ var fk=fxQ(F,'frost'), fa=fk==null?1:clamp(fk/1.6); c.save(); c.globalAlpha=fa; c.fillStyle='rgba(235,245,255,.35)'; rr(600,70,290,150,8,true,false); txt(st.frost,745,150,'38px "Patrick Hand",sans-serif','#FFFFFF'); c.restore(); }
      if(st.machine) rewinder(st.machineX||520,T,{dial:st.dial,on:st.on,lever:st.lever,dialCol:st.dialCol});
    },
    front:function(F){ if(F.st.vhs) vhs(F.T,1); if(F.st.crack){ var ck=fxQ(F,'crack'), cl=ck==null?1:clamp(ck/1.2); c.save(); c.strokeStyle='rgba(255,255,255,.95)'; c.shadowColor='#9BDCFF'; c.shadowBlur=8; c.lineWidth=3.5; c.beginPath(); var pts=[[808,GY-150],[796,GY-122],[812,GY-96],[800,GY-66],[814,GY-40]]; c.moveTo(pts[0][0],pts[0][1]); for(var ci=1;ci<pts.length;ci++){ if(ci/(pts.length-1)>cl) break; c.lineTo(pts[ci][0],pts[ci][1]); } c.stroke(); c.restore(); } }},
  tgrid:{bg:function(F){ var st=F.st, T=F.T;
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#160C2E'); g.addColorStop(1,'#0B1A33'); c.fillStyle=g; c.fillRect(0,0,W,H);
      // the time stream, swirling past
      c.save(); for(var i=0;i<26;i++){ var r=40+i*26, a=T*(0.15+i*0.01)+i; c.strokeStyle='rgba(155,220,255,'+(0.05+0.03*Math.sin(T+i))+')'; c.lineWidth=2; c.beginPath(); c.arc(330,240,r,a,a+1.2); c.stroke(); } c.restore();
      c.fillStyle='#0E1426'; c.fillRect(0,GY-14,W,H); c.strokeStyle='rgba(155,220,255,.35)'; c.lineWidth=2; c.beginPath(); c.moveTo(0,GY-14); c.lineTo(W,GY-14); c.stroke();
      c.fillStyle='rgba(8,10,24,.6)'; rr(G.x0-36,G.y0-16,G.x1-G.x0+62,G.y1-G.y0+44,12,true,false);
      var fade=st.gone?clamp(1-(F.p/2.2)):1; c.save(); c.globalAlpha=fade; drawPlane(G,{ylab:2,xlab:1,axis:'#C99BFF',minor:'rgba(201,155,255,.14)',major:'rgba(201,155,255,.30)',label:'#E3CCFF',ymajor:2}); c.restore();
      txt('THE TIME GRID',G.x(4),G.y0-2,'16px "Luckiest Guy",sans-serif','#E3CCFF');
      if(st.line){ var l=st.line, a=at(l[0]), b=at(l[1]); c.save(); c.globalAlpha=fade; c.strokeStyle=l[2]||'rgba(255,210,63,.55)'; c.lineWidth=3; c.setLineDash([6,8]); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.restore(); }
      if(st.decoy){ var fl=fxQ(F,'static')!=null&&fxQ(F,'static')>=0?(rnd(Math.floor(F.t*14))>0.5?0.45:1):1, d0=at([0,12]), d1=at([6,0]); c.save(); c.globalAlpha=fl; c.strokeStyle='#A9A9B8'; c.lineWidth=3; c.setLineDash([4,6]); c.beginPath(); c.moveTo(d0[0],d0[1]); c.lineTo(d1[0],d1[1]); c.stroke(); c.setLineDash([]); glowDot(d0[0],d0[1],9,'#A9A9B8',T); glowDot(d1[0],d1[1],9,'#A9A9B8',T); if(st.decoyTags){ tag('(0, 12)',d0[0]+52,d0[1],'#C8C8D4'); tag('(6, 0)',d1[0]+8,d1[1]-28,'#C8C8D4'); } c.restore(); }
      (st.tris||[]).forEach(function(tr){ var k=1, q=fxQ(F,'grow_'+tr.id); if(q!=null) k=clamp(q/0.9); slopeTri(G,tr.from[0],tr.from[1],tr.run,tr.rise,tr.col||GOLD,k,tr.o||{}); });
      (st.pts||[]).forEach(function(p){ var s=at(p); c.save(); c.globalAlpha=fade; glowDot(s[0],s[1],10,p[3]||GOLD,T); if(p[2]) tag(p[2],s[0]+(p[4]||0),s[1]-28,p[3]||GOLD); c.restore(); });
      if(st.panel) panel(st.panelX||790,st.panelY||40,st.panel,{sc:st.panelSc||0.78});
    }},
  // the void: the Time Grid with the ground gone and fog below; lines are laid as track
  void:{bg:function(F){ var st=F.st, T=F.T;
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0A0A14'); g.addColorStop(1,'#141026'); c.fillStyle=g; c.fillRect(0,0,W,H);
      c.fillStyle='rgba(8,10,24,.6)'; rr(G.x0-36,G.y0-16,G.x1-G.x0+62,G.y1-G.y0+44,12,true,false);
      drawPlane(G,{ylab:2,xlab:1,axis:'#7CF2A2',minor:'rgba(124,242,162,.10)',major:'rgba(124,242,162,.24)',label:'#B8F7CC',ymajor:2,xname:'x',yname:'y'});
      txt('NO GROUND. LAY YOUR OWN.',G.x(4),G.y0-2,'16px "Luckiest Guy",sans-serif','#B8F7CC');
      if(st.home){ var hp=at(st.home); c.save(); c.shadowColor='#FFE14D'; c.shadowBlur=30+10*Math.sin(T*3); c.fillStyle='#FFE14D'; circ(hp[0],hp[1],13,true,false); c.restore(); tag(st.homeTag||'HOME',hp[0]-6,hp[1]-34,'#FFE14D'); }
      (st.rails||[]).forEach(function(r){ var q=r.id?fxQ(F,'lay_'+r.id):null, k=q==null?1:clamp(q/(r.dur||1.8)); rail(r.m,r.b,r.x0,r.x1,r.col||'#7CF2A2',k,{label:r.label,ldx:r.ldx,ldy:r.ldy}); });
      (st.steps||[]).forEach(function(sp){ var q=fxQ(F,'steps_'+sp.id); for(var i=0;i<sp.n;i++){ var kk=q==null?1:clamp((q-i*0.45)/0.45); if(kk<=0) continue; slopeTri(G,sp.x0+i*sp.run,sp.y0+i*sp.rise,sp.run,sp.rise,sp.col||'#FFD23F',kk,{noFill:true,lw:3,runLabel:sp.rl||String(sp.run),riseLabel:sp.ql||String(sp.rise).replace('-','−')}); } });
      (st.pads||[]).forEach(function(pd){ var q=pd[3]?fxQ(F,'crumble'):null; pad([pd[0],pd[1]],pd[3]?'#C8C8D4':'#7CF2A2',T,pd[3],q==null?null:clamp(q/1.2)); if(pd[2]) tag(pd[2],at(pd)[0]+(pd[4]||56),at(pd)[1]-2,pd[3]?'#C8C8D4':'#7CF2A2'); });
      (st.pts||[]).forEach(function(p){ var s2=at(p); glowDot(s2[0],s2[1],9,p[3]||GOLD,T); if(p[2]) tag(p[2],s2[0]+(p[4]||0),s2[1]-28,p[3]||GOLD); });
      if(st.panel) panel(st.panelX||790,st.panelY||40,st.panel,{sc:st.panelSc||0.78});
    },
    front:function(F){ var T=F.T; c.save(); for(var i=0;i<16;i++){ var x=((rnd(i)*W*1.4+T*(14+rnd(i+2)*20))%(W+300))-150, y=GY-10-rnd(i+5)*70; c.fillStyle='rgba(180,170,220,'+(0.10+0.08*rnd(i+9))+')'; ell(x,y,110+rnd(i)*80,26+rnd(i+1)*14,true,false); } c.restore(); }},
  // a lock on the way to the moment: the equation as a machine chain, x -> op1 -> op2 -> result, and the way back underneath
  lock:{bg:function(F){ var st=F.st, T=F.T, ch=st.chain;
      var g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,'#101A3A'); g.addColorStop(1,'#1E1030'); c.fillStyle=g; c.fillRect(0,0,W,H);
      for(var i=0;i<5;i++){ c.save(); c.translate(80+i*210,500+(i%2)*30); c.rotate(T*(i%2?0.3:-0.3)); c.strokeStyle='rgba(155,220,255,.08)'; c.lineWidth=10; circ(0,0,70,false,true); for(var k=0;k<10;k++){ c.rotate(Math.PI/5); c.fillStyle='rgba(155,220,255,.08)'; c.fillRect(-8,-86,16,20); } c.restore(); }
      if(st.eq){ c.save(); var big=st.solved?'#7CF2A2':'#FFE14D'; txt(st.eq,W/2,58,'44px "Luckiest Guy",sans-serif',big); c.restore(); }
      if(st.lockTag) tag(st.lockTag,W/2,100,'#9BDCFF');
      if(!ch) return;
      var X=[250,425,600,780], Y=200, YB=330;
      function box(x,y,s,col,on){ c.save(); c.globalAlpha=on==null?1:on; c.fillStyle='rgba(14,16,30,.9)'; c.strokeStyle=col; c.lineWidth=3; rr(x-62,y-30,124,60,12); txt(s,x,y+2,'600 28px "IBM Plex Mono",monospace',col); c.restore(); }
      function arrow(x0,x1,y,col,k){ if(k<=0) return; var xe=lerp(x0,x1,clamp(k)); c.save(); c.strokeStyle=col; c.lineWidth=4; c.beginPath(); c.moveTo(x0,y); c.lineTo(xe,y); c.stroke(); if(k>=1){ var d=x1>x0?1:-1; c.fillStyle=col; c.beginPath(); c.moveTo(x1,y); c.lineTo(x1-d*14,y-9); c.lineTo(x1-d*14,y+9); c.closePath(); c.fill(); } c.restore(); }
      // forwards: what the machine did to the input
      txt('WHAT HAPPENED',190,Y-56,'16px "Luckiest Guy",sans-serif','#FFD23F','left');
      box(X[0],Y,st.xval!=null?String(st.xval):'x',st.xval!=null?'#7CF2A2':'#FFFFFF'); box(X[1],Y,ch.ops[0],'#FFD23F'); box(X[2],Y,ch.ops[1],'#FFD23F'); box(X[3],Y,String(ch.out),'#FFFFFF');
      for(var a=0;a<3;a++) arrow(X[a]+64,X[a+1]-64,Y,'#FFD23F',1);
      // backwards: last thing done, first thing undone
      var nb=st.back||0, q=fxQ(F,'back'), kk=q==null?nb:Math.min(nb,(st.backFrom||0)+clamp(q/0.9)*(nb-(st.backFrom||0)));
      if(nb>0||st.wrong){ txt(st.wrong?'MARCUS\'S WAY BACK':'THE WAY BACK',190,YB-56,'16px "Luckiest Guy",sans-serif',st.wrong?'#FF7A6B':'#7CF2A2','left'); }
      if(st.wrong){ box(X[3],YB,String(ch.out),'#FFFFFF'); arrow(X[3]-64,X[1]+64,YB,'#FF7A6B',1); box(X[1],YB,ch.inv[0],'#FF7A6B'); txt('first?!',X[1],YB+48,'600 18px "IBM Plex Mono",monospace','#FF7A6B'); if(st.wrongVal) box(X[0],YB,st.wrongVal,'#FF7A6B'); return; }
      if(nb>0) box(X[3],YB,String(ch.out),'#FFFFFF');
      var col='#7CF2A2';
      if(kk>0){ arrow(X[3]-64,X[2]+64,YB,col,kk); if(kk>=1){ box(X[2],YB,ch.inv[1],col); txt('= '+ch.mid,X[2],YB+50,'600 22px "IBM Plex Mono",monospace',col); } }
      if(kk>1){ arrow(X[2]-64,X[1]+64,YB,col,kk-1); if(kk>=2){ box(X[1],YB,ch.inv[0],col); txt('= '+ch.ans,X[1],YB+50,'600 22px "IBM Plex Mono",monospace',col); } }
      if(kk>2){ arrow(X[1]-64,X[0]+64,YB,col,kk-2); if(kk>=3) box(X[0],YB,'x = '+ch.ans,col); }
      if(st.panel) panel(st.panelX||800,st.panelY||16,st.panel,{sc:st.panelSc||0.6});
    }},
  pond:{bg:function(F){ var T=F.T; c.fillStyle='#8FA3B8'; c.fillRect(0,0,W,H); c.fillStyle='#6E8A5A'; c.fillRect(0,300,W,H);
      c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#5DA9D6'; ell(480,420,380,110); c.restore();
      for(var i=0;i<5;i++) duck(150+i*150,400+(i%2)*26,T,i%2?-1:1);
      txt('THE DUCK POND',480,270,'26px "Luckiest Guy",sans-serif','#FFD23F'); rain(T,50,0.3); },
    front:function(F){ var T=F.T; c.save(); c.beginPath(); c.ellipse(480,420,380,110,0,0,Math.PI*2); c.clip(); c.fillStyle='rgba(93,169,214,.82)'; c.fillRect(0,438+Math.sin(T*3)*3,W,H); c.restore();
      var q=fxQ(F,'splash'); if(q!=null&&q>=0&&q<0.8){ burst(300,340,'SPLOSH!',0.6,'#9BDCFF'); } }},
  lunch:{bg:function(F){ var T=F.T; c.fillStyle='#E9D9B8'; c.fillRect(0,0,W,H); c.fillStyle='#C9B48A'; c.fillRect(0,GY-14,W,H);
      c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B98B57'; rr(470,330,330,22,6); rr(500,352,16,104,4); rr(752,352,16,104,4);
      c.save(); c.filter='sepia(1) saturate(1.4)'; kid(F.st.past||'marcus',690,GY,-1,F.st.past==='dunmore'&&Math.sin(T*4)>0,null,false,T,{}); c.restore(); if(F.st.past==='dunmore'){ c.save(); c.translate(760,GY); c.rotate(Math.sin(T*3)*0.2); c.strokeStyle='#8A5A1E'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(-10,-170); c.stroke(); c.fillStyle='#D9C9A3'; rr(-26,-8,36,14,4,true,false); c.restore(); txt('♪',640,180+Math.sin(T*5)*8,'40px serif','#8A5A1E'); }
      c.fillStyle='#FFFFFF'; rr(575,300,40,30,6); c.fillStyle='#7A4A2A'; rr(579,296,32,10,4); txt('PUDDING',595,320,'9px "Luckiest Guy",sans-serif','#7A4A2A');
      tag(F.st.when||'YESTERDAY · 12:30',740,60,'#8A5A1E');
      c.fillStyle='rgba(120,80,30,.12)'; c.fillRect(0,0,W,H); },
    front:function(F){ var q=fxQ(F,'gulp'); if(q!=null&&q>=0&&q<0.9) burst(650,250,'GULP',0.45,'#FFFFFF'); }},
  tomorrow:{bg:function(F){ var T=F.T; c.fillStyle='#1C2533'; c.fillRect(0,0,W,H); c.fillStyle='#3B4656'; for(var b=0;b<6;b++) rr(40+b*160,170-((b*37)%60),120,300,4,true,false);
      c.save(); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#C9C9C9'; rr(700,140,10,320,3); c.fillStyle='#F2EEE6'; rr(640,120,140,46,6); txt('TOMORROW',710,144,'22px "Luckiest Guy",sans-serif','#C0392B'); c.restore();
      rain(T,140,0.55); },
    front:function(F){ var T=F.T; c.save(); c.fillStyle='rgba(60,110,160,.72)'; c.beginPath(); c.moveTo(0,GY-70); for(var x=0;x<=W;x+=20) c.lineTo(x,GY-70+Math.sin(T*3+x/40)*6); c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill(); c.restore();
      c.save(); c.translate(260,GY-78+Math.sin(T*2)*4); c.rotate(0.08); c.strokeStyle=INK; c.lineWidth=3; c.fillStyle='#B98B57'; rr(-60,-10,120,16,4); c.restore(); }},
  night:{bg:function(F){ var st=F.st, T=F.T; c.fillStyle='#05060C'; c.fillRect(0,0,W,H);
      for(var i=0;i<60;i++){ c.fillStyle='rgba(200,220,255,'+(0.2+0.5*rnd(i+Math.floor(T*4)))+')'; c.fillRect(rnd(i)*W,rnd(i+5)*H*0.8,2,2); }
      var k=st.dark?clamp(1-F.p/2):1; c.save(); c.globalAlpha=0.25*k; c.strokeStyle='#9BDCFF'; for(var gx=0;gx<W;gx+=48){ c.beginPath(); c.moveTo(gx,GY-160); c.lineTo(gx,GY-14); c.stroke(); } for(var gy=GY-160;gy<=GY-14;gy+=36){ c.beginPath(); c.moveTo(0,gy); c.lineTo(W,gy); c.stroke(); } c.restore();
      c.fillStyle='rgba(14,18,36,'+(0.9*k)+')'; c.fillRect(0,GY-14,W,H);
      if(st.bubble){ c.save(); c.translate(690,140); c.rotate(-0.04); c.fillStyle='rgba(240,244,255,.92)'; c.strokeStyle=INK; c.lineWidth=3; rr(-150,-40,300,80,24); c.beginPath(); c.moveTo(-30,38); c.lineTo(-56,82); c.lineTo(4,38); c.closePath(); c.fill(); c.stroke();
        txt(st.bubble,0,2,'30px "Luckiest Guy",sans-serif','#2E6DA4'); c.strokeStyle='rgba(30,30,40,.5)'; c.lineWidth=2; c.beginPath(); c.moveTo(70,-38); c.lineTo(84,-6); c.lineTo(76,10); c.lineTo(92,38); c.stroke(); c.restore(); }
      if(st.r){ c.save(); c.globalAlpha=0.5+0.5*Math.sin(F.p*3); txt('…r…',690,250,'italic 26px "Patrick Hand",sans-serif','#9BDCFF'); c.restore(); }
    },
    front:function(F){ for(var i=0;i<24;i++){ c.fillStyle='rgba(220,235,255,'+(0.35*rnd(i+3))+')'; circ(rnd(i*7)*W,(rnd(i*3)*H+F.T*20)%H,2,true,false); } }},
  news:{bg:function(F){ newsSet(F); if(F.st.inset==='rain'){ c.save(); c.fillStyle='#0d1b2a'; c.strokeStyle=INK; c.lineWidth=3; rr(640,70,280,180,10); c.save(); c.beginPath(); c.rect(643,73,274,174); c.clip(); c.fillStyle='#46536B'; c.fillRect(643,73,274,174); for(var i=0;i<30;i++){ var x=643+rnd(i)*274, y=73+((rnd(i+4)*174+F.T*380)%174); c.strokeStyle='rgba(200,225,255,.6)'; c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,y+12); c.stroke(); } c.restore(); txt('LIVE: OUTSIDE',780,236,'16px "Luckiest Guy",sans-serif','#FFD23F'); c.restore(); } },
    front:function(F){ newsFront(F); }}
 },
 FX:{
  // the Rewinder rides a line from one moment to another; a wrong slope sends it off the grid
  ride:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.8, u=ease(clamp(q/dur)), a=at(f.from), b=at(f.to), x=lerp(a[0],b[0],u), y=lerp(a[1],b[1],u), rot=Math.atan2(b[1]-a[1],b[0]-a[0]);
      c.save(); c.strokeStyle=f.ok===false?'rgba(255,120,107,.7)':'rgba(255,210,63,.8)'; c.lineWidth=4; c.setLineDash([2,8]); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(x,y); c.stroke(); c.restore();
      if(f.ok===false&&q>dur){ var v=q-dur; pod(x+v*90,y+v*v*420,F.T,rot+v*6,0.8); if(v<0.9) burst(x+30,y-50,f.oops||'WHOOPS!',0.5,'#FF7A6B'); return; }
      pod(x,y,F.T,rot,0.8); if(f.ok!==false&&q>dur&&q<dur+0.8) burst(b[0],b[1]-44,f.yes||'LANDED!',0.45,'#7CF2A2'); }},
  // the cart rides a wrong line off its end and falls into the fog
  fall:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.4, u=ease(clamp(q/dur)), a=at(f.from), b=at(f.to), x=lerp(a[0],b[0],u), y=lerp(a[1],b[1],u), rot=Math.atan2(b[1]-a[1],b[0]-a[0]);
      if(q<=dur){ pod(x,y,F.T,rot,0.7); return; } var v=q-dur; pod(b[0]+v*60,b[1]+v*v*500,F.T,rot+v*5,0.7); if(v<1) burst(b[0]+20,b[1]-50,'AAAAAH!',0.5,'#FF7A6B'); }},
  vhs:{draw:function(f,q,F){ if(q<0||q>(f.dur||1.2)) return; vhs(F.T,1); }},
  lever:{draw:function(f,q,F){ if(q<0||q>0.7) return; burst(600,GY-170,'CLUNK',0.4,'#FFFFFF'); }},
  morph:{draw:function(f,q,F){ if(q<0) return; var k=1+4*ease(clamp(q/1.4)); slopeTri(G,1,2,1*k,2*k,'#FF8FD1',1,{dash:true,noLabels:true,noFill:true,lw:3}); }},
  backArrow:{draw:function(f,q,F){ if(q<0) return; var k=clamp(q/1.0), s=at([6,12]), e=at([2,4]); c.save(); c.strokeStyle='#FF8FD1'; c.lineWidth=4; c.beginPath(); c.moveTo(s[0],s[1]); c.lineTo(lerp(s[0],e[0],k),lerp(s[1],e[1],k)); c.stroke(); c.restore(); }},
  static:{draw:function(f,q,F){ if(q<0||q>1.4) return; c.save(); c.globalAlpha=0.3; for(var i=0;i<40;i++){ c.fillStyle='rgba(200,200,220,'+rnd(i+Math.floor(F.t*20))+')'; c.fillRect(G.x(0)+rnd(i*3+Math.floor(F.t*20))*(G.x(7)-G.x(0)),G.y(13)+rnd(i*7+Math.floor(F.t*20))*(G.y(0)-G.y(13)),18,2); } c.restore(); }}
 },
 BEATS:__BEATS__
};
function vhs(T,a){ c.save(); c.globalAlpha=0.5*(a==null?1:a); for(var i=0;i<14;i++){ c.fillStyle='rgba(255,255,255,'+(0.2+0.4*rnd(i+Math.floor(T*24)))+')'; c.fillRect(0,rnd(i*5+Math.floor(T*24))*H,W,2+rnd(i)*4); } c.restore(); txt('◀◀ REWINDING',W-150,40,'22px "Luckiest Guy",sans-serif','#FFFFFF'); }
EP.BEATS.forEach(function(b,i){ b.d=DUR[i]; });
return EP;
})();
