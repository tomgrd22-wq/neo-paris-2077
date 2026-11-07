/* ═════ CLÉ DE PIRATAGE DE MOON : n'importe quel joueur peut saisir un code reçu de Moon pour ACTIVER / DÉSACTIVER la cible ═════ */
(function(){
if(window.__npKey)return;window.__npKey=1;
var path=location.pathname;
if(!/\/personnages\//.test(path)||/moon-piratage|tamuro-viseur-3d/.test(path))return;
var TM={CAM:['cam','📹','Caméra de rue'],POR:['porte','🚪','Porte blindée'],DRO:['drone','🛸','Drone de sécurité'],TER:['term','💻','Terminal Arasaka'],SER:['serv','🗄','Serveur central corpo'],PNJ:['pnj','🧠','Cyberware ennemi']};
function norm(c){return String(c||'').trim().toLowerCase().replace(/\s+/g,'_');}
function ident(){try{return JSON.parse(localStorage.getItem('np_ident'))||{};}catch(e){return {};}}
function sessionCode(){var i=ident();if(i.code)return i.code;try{if(window.sCode)return norm(window.sCode);}catch(e){}return '';}
function myRole(){var m=path.match(/(tamuro|kiki|keiyo|hunter|fury)/);return (m&&m[1])||ident().role||'joueur';}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h;}
function used(){try{return JSON.parse(localStorage.getItem('np_key_used')||'[]');}catch(e){return [];}}
function ev(txt){
  var code=sessionCode();if(!code)return;
  var send=function(){try{var c=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'ky'+Date.now(),clean:true,connectTimeout:8000});
    c.on('connect',function(){c.publish('spectre_tools_v1_'+code+'/ev',JSON.stringify({t:Date.now(),role:myRole(),txt:txt}),{qos:0},function(){setTimeout(function(){c.end();},400);});});}catch(e){}};
  if(typeof mqtt!=='undefined')send();else{var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js';s.onload=send;document.head.appendChild(s);}
}
var st=document.createElement('style');st.textContent='#mk-fab{position:fixed;left:12px;bottom:12px;z-index:8500;background:rgba(0,12,16,.92);border:1px solid #00ccff;color:#00ccff;border-radius:20px;padding:8px 12px;font:10px Orbitron,monospace;letter-spacing:2px;cursor:pointer}#mk-pan{position:fixed;left:12px;bottom:56px;z-index:8500;width:min(330px,92vw);background:#06101a;border:1px solid #00ccff;border-radius:10px;padding:14px;display:none;color:#ddd;font:11px "Share Tech Mono",monospace}#mk-pan.on{display:block}#mk-pan h3{margin:0 0 8px;font:11px Orbitron,monospace;letter-spacing:3px;color:#00ccff}#mk-pan input{width:100%;box-sizing:border-box;background:#0c0c18;color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:4px;padding:8px;font:13px "Share Tech Mono",monospace;letter-spacing:2px;text-transform:uppercase}#mk-pan button{background:transparent;border:1px solid var(--c,#00ccff);color:var(--c,#00ccff);border-radius:4px;padding:8px 10px;margin:6px 6px 0 0;font:10px Orbitron,monospace;letter-spacing:2px;cursor:pointer}';
document.head.appendChild(st);
var fab=document.createElement('button');fab.id='mk-fab';fab.textContent='🔑 CODE MOON';
var pan=document.createElement('div');pan.id='mk-pan';
pan.innerHTML='<h3>CLÉ DE PIRATAGE</h3><div style="opacity:.6;margin-bottom:8px">Entre le code que Moon t\'a transmis pour activer ou désactiver sa cible.</div><input id="mk-in" placeholder="MN-XXX-000-000"><button onclick="__mkCheck()">VÉRIFIER</button><div id="mk-out" style="margin-top:10px;line-height:1.6"></div>';
fab.onclick=function(){pan.classList.toggle('on');};
document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(fab);document.body.appendChild(pan);});
if(document.body){document.body.appendChild(fab);document.body.appendChild(pan);}
window.__mkCheck=function(){
  var o=document.getElementById('mk-out'),c=document.getElementById('mk-in').value.trim().toUpperCase(),m=c.match(/^MN-([A-Z]{3})-([0-9A-Z]{3})-([0-9A-Z]{3})$/);
  if(!m||!TM[m[1]]){o.innerHTML='<span style="color:#ff4060">✖ Format invalide.</span>';return;}
  var sc=sessionCode();if(!sc){o.innerHTML='<span style="color:#ff4060">✖ Session inconnue (ouvre l\'outil avec ton code de session).</span>';return;}
  var chk=('000'+(hash(sc+'|'+TM[m[1]][0]+'|'+m[2])%46656).toString(36)).slice(-3).toUpperCase();
  if(chk!==m[3]){o.innerHTML='<span style="color:#ff4060">✖ Code falsifié ou d\'une autre session.</span>';return;}
  var now=Math.floor(Date.now()/60000)%46656,age=(now-parseInt(m[2],36)+46656)%46656;
  if(age>240){o.innerHTML='<span style="color:#ff6080">✖ Code expiré (plus de 4 h).</span>';return;}
  if(used().indexOf(c)>=0){o.innerHTML='<span style="color:#ff6080">✖ Code déjà utilisé.</span>';return;}
  var t=TM[m[1]];
  o.innerHTML='<span style="color:#00ff88">✔ ACCÈS AUTORISÉ</span><br>'+t[1]+' <b>'+t[2]+'</b><br>Que veux-tu faire ?<br><button style="--c:#00ff88" onclick="__mkDo(\''+c+'\',\''+m[1]+'\',1)">ACTIVER</button><button style="--c:#ff4060" onclick="__mkDo(\''+c+'\',\''+m[1]+'\',0)">DÉSACTIVER</button>';
};
window.__mkDo=function(c,k,on){
  var t=TM[k],l=used();l.push(c);try{localStorage.setItem('np_key_used',JSON.stringify(l.slice(-40)));}catch(e){}
  ev('utilise la clé de Moon ('+c+') : '+(on?'ACTIVE':'DÉSACTIVE')+' — '+t[2]);
  document.getElementById('mk-out').innerHTML='<span style="color:'+(on?'#00ff88':'#ff4060')+'">✔ '+t[2]+' : '+(on?'ACTIVÉ':'DÉSACTIVÉ')+'.</span><br><span style="opacity:.6">Le MJ a été prévenu.</span>';
  document.getElementById('mk-in').value='';
};
})();
