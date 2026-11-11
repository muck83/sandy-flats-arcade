var DUR=__DUR__;
__WORLD__
var EP=(function(){
/* ===== Under the Pond, Floor One (both parts share this file's scenes) ===== */
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
var EP={
 meta:{id:'endminusstart',title:'End Minus Start',kicker:'Under the Pond · Floor One, Part 1',accent:'#9BDCFF'},
 extras:SB.extras,
 SCENES:{
  control:{bg:function(F){ var st=F.st, T=F.T, cq=fxQ(F,'chalk'), cf=fxOf(F,'chalk'), pq=fxQ(F,'pull');
      SB.cave(T,true); c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(0,0,W,H);
      c.save(); c.fillStyle='#1E3A2C'; c.strokeStyle='#8A5A34'; c.lineWidth=10; rr(220,110,420,250,6);
      var k=cf?(on(cq)?clamp(cq/(cf.dur||1.6)):0):(st.chalk?1:0); c.save(); c.beginPath(); c.rect(230,120,400*k,120); c.clip(); txt('FLOOR 1',430,185,'74px "Luckiest Guy",sans-serif','#F2EEE6'); c.restore();
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
      if(!st.cover&&!st.page){ SB.log(st,T,{title:'EXERCISE BOOK',heads:['POST','HEIGHT'],dyName:'height'}); return; }
      SB.cave(T); c.save(); c.translate(350,250); c.rotate(-0.03); c.strokeStyle=INK; c.lineWidth=3;
      if(st.cover){ c.fillStyle='#2E6DA4'; rr(-230,-200,460,400,8); c.fillStyle='#1F4F7A'; rr(-230,-200,40,400,6); c.fillStyle='#FFFDF6'; rr(-150,-110,330,170,6);
        txt('SANDY FLATS SCHOOL',15,-80,'18px "Luckiest Guy",sans-serif','#22324A'); c.strokeStyle='#C9C3B0'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-130,-30); c.lineTo(160,-30); c.moveTo(-130,24); c.lineTo(160,24); c.stroke();
        txt('Name:',-130,-44,'600 14px "IBM Plex Mono",monospace','#6B6B76','left'); c.save(); c.globalAlpha=0.22; txt('~~~~~ ~~~~~~~',40,-46,'600 30px "Patrick Hand",sans-serif','#1F3C88'); c.restore();
        txt('Class of:',-130,10,'600 14px "IBM Plex Mono",monospace','#6B6B76','left'); txt('MR. DUNMORE',60,6,'600 30px "Patrick Hand",sans-serif','#1F3C88'); }
      else { c.fillStyle='#FFFDF6'; c.beginPath(); c.moveTo(-230,-200); c.lineTo(230,-200); c.lineTo(230,40); c.lineTo(196,62); c.lineTo(214,96); c.lineTo(170,120); c.lineTo(180,160); c.lineTo(120,170); c.lineTo(96,200); c.lineTo(-230,200); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle='#C9D4E6'; c.lineWidth=1.5; for(var ly=-150;ly<190;ly+=44){ c.beginPath(); c.moveTo(-210,ly+16); c.lineTo(ly>20?90:210,ly+16); c.stroke(); }
        ['If you are reading this,','do not trust','the'].forEach(function(l,i){ txt(l,-200,-150+i*88,'600 44px "Patrick Hand",sans-serif','#1F3C88','left'); }); }
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
  news:{bg:function(F){ newsSet(F); }, front:function(F){ newsFront(F); }}
 },
 FX:{
  // the cart rides a span; a wrong slope throws it
  ride:{draw:function(f,q,F){ var dur=f.dur||1.6, u=ease(clamp(q/dur)), a=at(f.from), b=at(f.to), x=lerp(a[0],b[0],u), y=lerp(a[1],b[1],u);
      SB.cart(x,y,F.T,Math.atan2(b[1]-a[1],b[0]-a[0])*0.6,0.8); if(q>dur&&q<dur+0.9) burst(b[0]+10,b[1]-80,f.yes||'DING!',0.42,'#7CF2A2'); }},
  launch:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.3, u=clamp(q/dur); if(u<1){ c.save(); c.translate(lerp(520,-80,u),lerp(430,-120,u*u)); c.rotate(-u*7); SB.cart(0,0,F.T,0,1.3); c.restore(); } if(q>0.2&&q<1.5) burst(360,150,'WHOOPS!',0.7,'#FF7A6B'); }}
 },
 BEATS:__BEATS__
};
EP.BEATS.forEach(function(b,i){ b.d=DUR[i]; });
return EP;
})();
