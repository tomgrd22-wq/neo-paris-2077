/* NEO-PARIS 2077 — animations partagées (fx.js). Décoratif uniquement ; ne touche ni aux données ni à la logique des pages. */
(function(){
'use strict';
if(window.__fx)return;window.__fx=1;
try{var _cs=document.currentScript;if(_cs&&_cs.src&&!window.__npRefresh){var _r=document.createElement('script');_r.src=_cs.src.replace(/fx\.js(\?.*)?$/,'refresh.js');_r.defer=true;document.head.appendChild(_r);var _k=document.createElement('script');_k.src=_cs.src.replace(/fx\.js(\?.*)?$/,'cle-moon.js');_k.defer=true;document.head.appendChild(_k);}}catch(e){}
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
var path=location.pathname;
/* pages fonctionnelles : version légère (pas de fond animé, pas d'apparitions) */
var LIGHT=/\/(missions|activites|personnages|outils-session)\//.test(path);
var q=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}

ready(function(){
  /* ── fond : aurore + particules reliées + halo qui suit la souris ── */
  if(!reduce&&!LIGHT){
    var au=document.createElement('div');au.className='fx-aurora';document.body.appendChild(au);
    var weak=(navigator.hardwareConcurrency||4)<=2;
    if(!weak){
      var cv=document.createElement('canvas');cv.id='fx-canvas';document.body.appendChild(cv);
      var x=cv.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,1.5),P=[],N=0,mx=-999,my=-999,last=0,run=true;
      var COLS=['255,32,64','255,51,204','0,204,255','0,255,136','255,170,0'];
      function size(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);N=Math.max(24,Math.min(60,Math.round(W*H/32000)));
        while(P.length<N)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,c:COLS[Math.floor(Math.random()*COLS.length)],r:Math.random()*1.6+.6});P.length=N;}
      size();addEventListener('resize',size);
      addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;},{passive:true});
      function frame(t){
        if(!run){return;}
        requestAnimationFrame(frame);
        if(t-last<33)return;last=t;
        x.clearRect(0,0,W,H);
        for(var i=0;i<N;i++){
          var a=P[i];a.x+=a.vx;a.y+=a.vy;
          if(a.x<-10)a.x=W+10;else if(a.x>W+10)a.x=-10;if(a.y<-10)a.y=H+10;else if(a.y>H+10)a.y=-10;
          var dx=a.x-mx,dy=a.y-my,d2=dx*dx+dy*dy;
          if(d2<14000){var f=(1-d2/14000)*.5;a.x+=dx*f*.02;a.y+=dy*f*.02;}
          x.beginPath();x.fillStyle='rgba('+a.c+',.85)';x.arc(a.x,a.y,a.r,0,6.283);x.fill();
          for(var j=i+1;j<N;j++){var b=P[j],ex=a.x-b.x,ey=a.y-b.y,dd=ex*ex+ey*ey;
            if(dd<12000){x.strokeStyle='rgba('+a.c+','+(0.22*(1-dd/12000)).toFixed(3)+')';x.lineWidth=.8;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}}
        }
      }
      document.addEventListener('visibilitychange',function(){if(document.hidden){run=false;}else if(!run){run=true;requestAnimationFrame(frame);}});
      requestAnimationFrame(frame);
    }
    if(fine){
      var gl=document.createElement('div');gl.className='fx-glow';document.body.appendChild(gl);
      var gx=0,gy=0,tx=innerWidth/2,ty=innerHeight/3,pend=false;
      addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!pend){pend=true;requestAnimationFrame(mv);}},{passive:true});
      function mv(){pend=false;gx+=(tx-gx)*.18;gy+=(ty-gy)*.18;gl.style.transform='translate3d('+gx+'px,'+gy+'px,0)';if(Math.abs(tx-gx)>1||Math.abs(ty-gy)>1){pend=true;requestAnimationFrame(mv);}}
    }
  }

  /* ── barre de progression de lecture ── */
  if(!reduce&&!LIGHT){
    var pb=document.createElement('div');pb.className='fx-progress';document.body.appendChild(pb);
    var tk=false;
    function pr(){tk=false;var h=document.documentElement.scrollHeight-innerHeight;pb.style.transform='scaleX('+(h>40?Math.min(1,scrollY/h):0)+')';}
    addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(pr);}},{passive:true});pr();
  }

  /* ── titres : glitch occasionnel ── */
  if(!reduce){q('.hero-title,.ltitle,.brand,.boot-logo').forEach(function(e){e.classList.add('fx-glitch');});}

  /* ── apparitions au défilement (avec temporisation anti-répétition sur les re-rendus) ── */
  var SEL='a.g,a.rank,.card,.pickcard,.personal-card,.lockctrl-row,.section-title,.doc h2,.doc blockquote,.doc table,.hero,.authbox,.note';
  if(!reduce&&!LIGHT&&'IntersectionObserver' in window){
    var lastBurst=0,io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('fx-in');io.unobserve(en.target);}});
    },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
    function reveal(nodes,instant){
      nodes.forEach(function(n,i){
        if(n.__fx)return;n.__fx=1;
        if(instant){return;}
        n.classList.add('fx-reveal');n.style.setProperty('--fx-d',Math.min(i,14)*0.05+'s');io.observe(n);
      });
    }
    function scan(root){
      var now=Date.now(),instant=now-lastBurst<6000&&lastBurst!==0;
      var list=q(SEL,root||document);
      if(!list.length)return;
      if(!instant)lastBurst=now;
      reveal(list,instant);
    }
    scan();
    var mo=new MutationObserver(function(ms){
      var add=false;ms.forEach(function(m){if(m.addedNodes.length)add=true;});
      if(add){clearTimeout(mo.__t);mo.__t=setTimeout(function(){scan();},60);}
    });
    mo.observe(document.body,{childList:true,subtree:true});
    /* filet de sécurité : jamais de contenu bloqué invisible */
    setTimeout(function(){q('.fx-reveal:not(.fx-in)').forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight*1.2)e.classList.add('fx-in');});},2500);
  }

  /* ── cartes : reflet qui suit le curseur + légère inclinaison 3D ── */
  if(fine&&!reduce){
    var CS='.card,.pickcard,.personal-card,a.g,a.rank';
    document.addEventListener('pointermove',function(e){
      var c=e.target.closest&&e.target.closest(CS);if(!c)return;
      var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      c.style.setProperty('--fx-x',(px*100).toFixed(1)+'%');c.style.setProperty('--fx-y',(py*100).toFixed(1)+'%');
      if(!LIGHT){c.style.transform='perspective(700px) rotateX('+((.5-py)*6).toFixed(2)+'deg) rotateY('+((px-.5)*8).toFixed(2)+'deg) translateY(-2px)';}
    },{passive:true});
    document.addEventListener('pointerout',function(e){
      var c=e.target.closest&&e.target.closest(CS);if(c&&!c.contains(e.relatedTarget))c.style.transform='';
    },{passive:true});
  }

  /* ── ondulation au clic sur les boutons ── */
  if(!reduce){
    document.addEventListener('pointerdown',function(e){
      var b=e.target.closest&&e.target.closest('.authbox-btn,.lock-open-btn,.big,.mg-btn,.btn,.tbtn,.lockctrl-btn,.authbox-tab,.lbtn,.back-btn');
      if(!b||b.disabled)return;
      var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2;
      var sp=document.createElement('span');sp.className='fx-rip';
      sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
      var cs=getComputedStyle(b);if(cs.position==='static')b.style.position='relative';
      b.classList.add('fx-rippling');b.appendChild(sp);
      setTimeout(function(){sp.remove();},650);
    },{passive:true});
  }

  /* ── fondu à la sortie vers une autre page du site ── */
  if(!reduce){
    document.addEventListener('click',function(e){
      if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      var a=e.target.closest&&e.target.closest('a[href]');
      if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
      var h=a.getAttribute('href');
      if(!h||h.charAt(0)==='#'||/^(javascript|mailto|tel):/i.test(h)||a.origin!==location.origin)return;
      if(a.pathname===location.pathname&&a.search===location.search)return;
      e.preventDefault();document.body.classList.add('fx-leave');
      setTimeout(function(){location.href=a.href;},170);
    });
    addEventListener('pageshow',function(ev){if(ev.persisted)document.body.classList.remove('fx-leave');});
  }
});
})();
