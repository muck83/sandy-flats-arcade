var DUR=__DUR__;
__WORLD__
var EP=(function(){
/* ===== Switchback Film 1: End Minus Start ===== */
var SB=window.SwitchbackWorld({c:c,W:W,H:H,GY:GY,INK:INK,GOLD:GOLD,CH:CH,NAMES:NAMES,clamp:clamp,lerp:lerp,ease:ease,rnd:rnd,rr:rr,circ:circ,ell:ell,txt:txt,burst:burst,
  gridMap:gridMap,drawPlane:drawPlane,slopeTri:slopeTri,glowDot:glowDot,tag:tag,panel:panel});
function fxQ(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=F.p-(f.at||0); }); return r; }
function fxOf(F,name){ var r=null; (F.b.fx||[]).forEach(function(f){ if(f.n===name) r=f; }); return r; }
function on(q){ return q!=null&&q>=0; }
// where the lift is this frame: riding a "lift" effect, or parked at st.lift
function liftAt(F){ var f=fxOf(F,'lift'), q=fxQ(F,'lift'); if(!f) return F.st.lift; if(q<0) return f.from; var u=clamp(q/(f.dur||1.4)); return lerp(f.from,f.to,f.ok===false?u*u:ease(u)); }
// a thing newly set on this beat grows in; one carried over from the last beat is already there
function grown(F,key,delay){ return F.pv[key]&&JSON.stringify(F.pv[key])===JSON.stringify(F.st[key])&&!F.b.scene?1:(F.p-(delay||0))/0.35; }
function flyer(x,y,T,note){ c.save(); c.translate(x,y); pigeon(0,0,-1,T,false,{sc:1.3}); c.strokeStyle=INK; c.lineWidth=2.2; c.fillStyle='#7F868F'; c.save(); c.translate(2,-26); c.rotate(Math.sin(T*26)*0.9-0.3); ell(0,-14,9,18); c.restore(); c.restore(); if(note) tag(note,x+6,y-64,GOLD); }
var EP={
 meta:{id:'endminusstart',title:'End Minus Start',kicker:'Switchback · Film 1',accent:'#FFD23F'},
 extras:SB.extras,
 SCENES:{
  base:{bg:function(F){ var st=F.st, sf=fxOf(F,'signflip'), q=fxQ(F,'signflip'), sv=st.sign, sk=1;
      if(sf&&on(q)){ var u=clamp(q/0.5); sk=Math.abs(Math.cos(u*Math.PI)); if(u>=0.5) sv=sf.to; } else if(sf) sv=F.pv.sign!=null&&!F.b.scene?F.pv.sign:st.sign;
      var eq=fxQ(F,'eat'); SB.base(st,F.T,{sign:sv,signK:sk,chew:on(eq),paper:on(eq)&&eq<1.3?1-eq/1.3:0});
      if(st.eotm) SB.eotm(480,196,1.7); },
    front:function(F){ var st=F.st, eq=fxQ(F,'eat'), sq=fxQ(F,'stamp');
      if(on(eq)&&eq<1.1&&st.keith) burst(st.keith[0]-60,GY-150,'CHOMP',0.5,'#FFFFFF');
      if(st.report) SB.report(st.report,grown(F,'report',fxOf(F,'signflip')?1.2:0),sq==null?(F.pv.report&&!F.b.scene?1:0):sq);
      if(st.helmet) SB.helmet(st.helmet,grown(F,'helmet')); }},
  shaft:{bg:function(F){ var st=F.st, cf=fxOf(F,'count'), cq=fxQ(F,'count'), hot=null;
      if(cf&&on(cq)){ var n=Math.min(Math.abs(cf.to-cf.from),Math.floor(cq/(cf.step||0.5))+1); hot=cf.from+(cf.to<cf.from?-n:n); }
      SB.shaft(st,F.T,liftAt(F),{hot:hot}); },
    front:function(F){ var f=fxOf(F,'lift'), q=fxQ(F,'lift'); if(f&&f.ok===false&&q>(f.dur||1.4)*0.75&&q<(f.dur||1.4)+1.2) burst(SB.SHX+10,60,'TWANG!',0.62,'#FF7A6B');
      if(f&&f.ok!==false&&q>(f.dur||1.4)&&q<(f.dur||1.4)+0.8) burst(SB.SHX+120,SB.shaftY(f.to)-30,'DING!',0.42,'#7CF2A2'); }},
  profile:{bg:function(F){ SB.profile(F.st,F.T,{grow:function(id){ var q=fxQ(F,'grow_'+id); return q==null?1:clamp(q/0.9); }}); },
    front:function(F){ if(F.st.helmet) SB.helmet(F.st.helmet,grown(F,'helmet')); }},
  log:{bg:function(F){ SB.log(F.st,F.T,{}); }},
  pen:{bg:function(F){ SB.pen(F.T); },
    front:function(F){ SB.penFront(F.T,{keith:F.st.keith}); var q=fxQ(F,'goats'); if(on(q)&&q<1.0){ burst(430,250,'BAA!',0.7,'#FFFFFF'); for(var i=0;i<8;i++){ c.fillStyle='rgba(240,235,220,'+(0.7-q*0.7)+')'; circ(430+(rnd(i)-.5)*260*(0.4+q),GY-20-rnd(i+4)*90*q,14+rnd(i+8)*16,true,false); } } }},
  news:{bg:function(F){ newsSet(F); }, front:function(F){ newsFront(F); }}
 },
 FX:{
  // the gondola rides a span of the line; a wrong slope throws it clear
  ride:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.6, u=ease(clamp(q/dur)), a=SB.gp(f.from), b=SB.gp(f.to), x=lerp(a[0],b[0],u), y=lerp(a[1],b[1],u);
      SB.gondola(x,y,F.T,0,0.8); if(q>dur&&q<dur+0.9) burst(b[0]+10,b[1]-60,f.yes||'ARRIVED!',0.42,'#7CF2A2'); }},
  launch:{draw:function(f,q,F){ if(q<0) return; var dur=f.dur||1.3, u=clamp(q/dur); if(u<1){ c.save(); c.translate(lerp(520,-80,u),lerp(430,-120,u*u)); c.rotate(-u*7); SB.gondola(0,-30,F.T,0,1.1); c.restore(); } if(q>0.2&&q<1.5) burst(360,150,'WHOOPS!',0.7,'#FF7A6B'); }},
  // Doug carries the answer
  fly:{draw:function(f,q,F){ if(q<0||q>2.2) return; var u=clamp(q/2.0); flyer(lerp(840,SB.SHX+90,ease(u)),lerp(360,150,ease(u))-Math.sin(u*Math.PI)*90,F.T,f.note); }}
 },
 BEATS:__BEATS__
};
EP.BEATS.forEach(function(b,i){ b.d=DUR[i]; });
return EP;
})();
