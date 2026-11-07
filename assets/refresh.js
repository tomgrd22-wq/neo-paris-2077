/* NEO-PARIS 2077 — bouton « actualiser / vider le cache » (refresh.js).
   1) vide les caches du navigateur pour le site, 2) re-télécharge scripts/styles/modèles 3D,
   3) recharge la page avec un paramètre unique (_r) qui force une version neuve du HTML.
   Ce paramètre est ensuite propagé aux liens et aux pages intégrées, pour que les pages suivantes soient neuves aussi.
   Ne touche à aucune donnée de jeu (inventaire, progression, connexion…). */
(function(){
'use strict';
if(window.__npRefresh)return;window.__npRefresh=1;
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
function bust(){try{return localStorage.getItem('np_bust')||'';}catch(e){return '';}}
window.npBust=bust;
function withBust(href,v){
  try{var u=new URL(href,location.href);if(u.origin!==location.origin||!/\.html?$|\/$/.test(u.pathname))return href;
    u.searchParams.set('_r',v);return u.href;}catch(e){return href;}
}
/* propage le paramètre aux liens internes (y compris ceux créés plus tard par les pages) */
function patchLinks(root){
  var v=bust();if(!v)return;
  Array.prototype.forEach.call((root||document).querySelectorAll('a[href]'),function(a){
    var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(javascript|mailto|tel):/i.test(h))return;
    var n=withBust(h,v);if(n!==a.href)a.setAttribute('href',n);
  });
}
async function hard(btn){
  btn.classList.add('spin');btn.title='Actualisation…';
  var now=String(Date.now());try{localStorage.setItem('np_bust',now);}catch(e){}
  try{
    if(window.caches){var ks=await caches.keys();await Promise.all(ks.map(function(k){return caches.delete(k);}));}
    if(navigator.serviceWorker){var rg=await navigator.serviceWorker.getRegistrations();await Promise.all(rg.map(function(r){return r.unregister();}));}
  }catch(e){}
  /* fichiers utilisés par la page + tous les scripts/styles/modèles du site (liste à jour, jamais en cache) */
  var urls={};
  try{performance.getEntriesByType('resource').forEach(function(r){if(r.name.indexOf(location.origin)===0)urls[r.name]=1;});}catch(e){}
  Array.prototype.forEach.call(document.querySelectorAll('script[src],link[rel=stylesheet][href]'),function(n){urls[n.src||n.href]=1;});
  try{
    var base=document.querySelector('script[src*="refresh.js"]');var root=base?new URL('.',base.src).href:location.origin+'/';
    var list=await (await fetch(root+'manifest.json?t='+now,{cache:'no-store'})).json();
    list.forEach(function(p){urls[new URL('../'+p,root).href]=1;});
  }catch(e){}
  try{await Promise.all(Object.keys(urls).map(function(u){return fetch(u,{cache:'reload'}).catch(function(){});}));}catch(e){}
  location.replace(withBust(location.href,now));
}
ready(function(){
  var st=document.createElement('style');
  st.textContent='#np-refresh{position:fixed;left:12px;bottom:12px;z-index:99999;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(8,8,16,.82);color:#cfd8ff;font:700 17px/32px sans-serif;text-align:center;cursor:pointer;opacity:.5;transition:opacity .2s,transform .2s;padding:0;-webkit-tap-highlight-color:transparent}#np-refresh:hover,#np-refresh:focus{opacity:1;transform:scale(1.08);outline:none}#np-refresh.spin{opacity:1;animation:npspin .8s linear infinite}@keyframes npspin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
  var b=document.createElement('button');b.id='np-refresh';b.type='button';b.textContent='⟳';
  b.title='Vider le cache et actualiser la page (tes données de jeu sont conservées)';b.setAttribute('aria-label','Vider le cache et actualiser');
  b.onclick=function(){hard(b);};document.body.appendChild(b);
  if(bust()){patchLinks();var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(patchLinks,80);}).observe(document.body,{childList:true,subtree:true});}
});
})();
