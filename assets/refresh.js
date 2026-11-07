/* NEO-PARIS 2077 — bouton « actualiser / vider le cache » (refresh.js).
   Efface le cache du navigateur pour le site, re-télécharge les fichiers utilisés par la page, puis recharge.
   Ne touche à aucune donnée de jeu (inventaire, progression, connexion…). */
(function(){
'use strict';
if(window.__npRefresh)return;window.__npRefresh=1;
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
async function hard(btn){
  btn.classList.add('spin');btn.title='Actualisation…';
  try{
    if(window.caches){var ks=await caches.keys();await Promise.all(ks.map(function(k){return caches.delete(k);}));}
    if(navigator.serviceWorker){var rg=await navigator.serviceWorker.getRegistrations();await Promise.all(rg.map(function(r){return r.unregister();}));}
  }catch(e){}
  /* re-télécharge la page et tout ce qu'elle a chargé (scripts, styles, modèles 3D, images…) en ignorant le cache */
  var urls={};urls[location.href]=1;
  try{performance.getEntriesByType('resource').forEach(function(r){if(r.name.indexOf(location.origin)===0)urls[r.name]=1;});}catch(e){}
  Array.prototype.forEach.call(document.querySelectorAll('script[src],link[rel=stylesheet][href]'),function(n){urls[n.src||n.href]=1;});
  try{await Promise.all(Object.keys(urls).map(function(u){return fetch(u,{cache:'reload'}).catch(function(){});}));}catch(e){}
  location.reload();
}
ready(function(){
  var st=document.createElement('style');
  st.textContent='#np-refresh{position:fixed;left:12px;bottom:12px;z-index:99999;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(8,8,16,.82);color:#cfd8ff;font:700 17px/32px sans-serif;text-align:center;cursor:pointer;opacity:.5;transition:opacity .2s,transform .2s;padding:0;-webkit-tap-highlight-color:transparent}#np-refresh:hover,#np-refresh:focus{opacity:1;transform:scale(1.08);outline:none}#np-refresh.spin{opacity:1;animation:npspin .8s linear infinite}@keyframes npspin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
  var b=document.createElement('button');b.id='np-refresh';b.type='button';b.textContent='⟳';
  b.title='Vider le cache et actualiser la page (tes données de jeu sont conservées)';b.setAttribute('aria-label','Vider le cache et actualiser');
  b.onclick=function(){hard(b);};document.body.appendChild(b);
});
})();
