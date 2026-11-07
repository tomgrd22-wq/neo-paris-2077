/* ═════ CLÉ DE MOON : un joueur tiré au hasard reçoit une alerte plein écran, saisit le code de Moon et obtient un code retour à lui transmettre ═════ */
(function(){
if(window.__npKey)return;window.__npKey=1;
var path=location.pathname;
if(!/\/personnages\//.test(path)||/moon-piratage|tamuro-viseur-3d/.test(path))return;
var TM={CAM:['cam','📹','Caméra de rue'],POR:['porte','🚪','Porte blindée'],DRO:['drone','🛸','Drone de sécurité'],TER:['term','💻','Terminal Arasaka'],SER:['serv','🗄','Serveur central corpo'],PNJ:['pnj','🧠','Cyberware ennemi']};
var pm=path.match(/(tamuro|kiki|keiyo|fury)/),ME=pm&&pm[1];if(!ME)return;
function norm(c){return String(c||'').trim().toLowerCase().replace(/\s+/g,'_');}
function sessionCode(){try{var i=JSON.parse(localStorage.getItem('np_ident'));if(i&&i.code)return i.code;}catch(e){}try{if(window.sCode)return norm(window.sCode);}catch(e){}return '';}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h;}
function ack(sc,code){return ('0000'+(hash(sc+'|ack|'+code)%1679616).toString(36)).slice(-4).toUpperCase();}
function mqttReady(f){if(typeof mqtt!=='undefined')return f();var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/mqtt/dist/mqtt.min.js';s.onload=f;document.head.appendChild(s);}
function used(){try{return JSON.parse(localStorage.getItem('np_key_used')||'[]');}catch(e){return [];}}
function ev(txt){var c=sessionCode();if(!c)return;mqttReady(function(){try{var m=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'ky'+Date.now(),clean:true});m.on('connect',function(){m.publish('spectre_tools_v1_'+c+'/ev',JSON.stringify({t:Date.now(),role:ME,txt:txt}),{qos:0},function(){setTimeout(function(){m.end();},400);});});}catch(e){}});}
var st=document.createElement('style');st.textContent='@keyframes mkp{0%,100%{box-shadow:inset 0 0 80px rgba(0,204,255,.45)}50%{box-shadow:inset 0 0 160px rgba(255,32,64,.6)}}#mk-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(2,6,12,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;font-family:"Share Tech Mono",monospace;padding:20px;animation:mkp 1.2s infinite;cursor:pointer}#mk-ov h1{font:900 clamp(26px,7vw,60px) Orbitron,monospace;letter-spacing:6px;color:#00ccff;margin:0 0 14px;text-shadow:0 0 30px #00ccff}#mk-ov p{font-size:clamp(13px,3.2vw,20px);letter-spacing:3px;margin:6px 0;color:rgba(255,255,255,.8)}#mk-ov .big{margin-top:26px;border:2px solid #ff2040;color:#ff2040;padding:14px 30px;font:700 clamp(14px,3.6vw,22px) Orbitron,monospace;letter-spacing:4px;border-radius:8px}#mk-ov input{width:min(380px,90vw);box-sizing:border-box;background:#0c0c18;color:#fff;border:2px solid #00ccff;border-radius:6px;padding:14px;font:700 20px "Share Tech Mono",monospace;letter-spacing:3px;text-transform:uppercase;text-align:center;margin:16px 0}#mk-ov button{background:transparent;border:2px solid #00ccff;color:#00ccff;border-radius:6px;padding:12px 22px;font:700 14px Orbitron,monospace;letter-spacing:3px;cursor:pointer;margin:4px}#mk-ov .ack{font:900 clamp(40px,12vw,90px) Orbitron,monospace;letter-spacing:10px;color:#00ff88;text-shadow:0 0 30px #00ff88;margin:20px 0;user-select:all}';
document.head.appendChild(st);
function beep(){try{var a=new (window.AudioContext||window.webkitAudioContext)(),n=0,iv=setInterval(function(){var o=a.createOscillator(),g=a.createGain();o.frequency.value=n%2?660:990;g.gain.value=.08;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.18);if(++n>7)clearInterval(iv);},260);}catch(e){}}
function pend(){try{return JSON.parse(localStorage.getItem('np_moonkey')||'null');}catch(e){return null;}}
function ov(h){var o=document.getElementById('mk-ov');if(!o){o=document.createElement('div');o.id='mk-ov';document.body.appendChild(o);}o.style.cursor='default';o.innerHTML=h;return o;}
function alertScreen(){
  var p=pend();if(!p)return;var o=ov('<h1>⚠ APPEL DE MOON ⚠</h1><p>MOON A PIRATÉ : '+p.name.toUpperCase()+'</p><p>ELLE A BESOIN DE TOI</p><div class="big">TOUCHE POUR RÉPONDRE</div>');
  o.style.cursor='pointer';o.onclick=function(){o.onclick=null;codeScreen();};beep();
}
function codeScreen(msg){
  var p=pend();ov('<h1>🔑 CODE DE MOON</h1><p>Entre le code d\'accès que Moon te donne</p><input id="mk-in" placeholder="MN-XXX-000-000" autocomplete="off"><div><button onclick="__mkCheck()">VALIDER</button></div><div id="mk-err" style="color:#ff4060;min-height:22px;margin-top:8px">'+(msg||'')+'</div>');
}
window.__mkCheck=function(){
  var p=pend(),c=document.getElementById('mk-in').value.trim().toUpperCase(),m=c.match(/^MN-([A-Z]{3})-([0-9A-Z]{3})-([0-9A-Z]{3})$/),sc=sessionCode();
  if(!m||!TM[m[1]])return codeScreen('✖ Format invalide.');
  if(!sc)return codeScreen('✖ Session inconnue.');
  var chk=('000'+(hash(sc+'|'+TM[m[1]][0]+'|'+m[2])%46656).toString(36)).slice(-3).toUpperCase();
  if(chk!==m[3])return codeScreen('✖ Code falsifié ou d\'une autre session.');
  if(p&&TM[m[1]][0]!==p.target)return codeScreen('✖ Ce code ne correspond pas à la cible piratée.');
  var age=(Math.floor(Date.now()/60000)%46656-parseInt(m[2],36)+46656)%46656;if(age>240)return codeScreen('✖ Code expiré.');
  var a=ack(sc,c);ev('a validé le code de Moon ('+c+') — code retour : '+a);
  localStorage.setItem('np_moonkey','done');
  var o=ov('<h1>✔ ACCÈS VALIDÉ</h1><p>TRANSMETS CE CODE À MOON</p><div class="ack">'+a+'</div><div><button onclick="document.getElementById(\'mk-ov\').remove()">FERMER</button></div>');
};
var started=false;
function listen(){
  var sc=sessionCode();if(!sc||started)return;started=true;
  mqttReady(function(){try{
    var m=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:'kl'+Date.now()+Math.random().toString(36).slice(2,5),clean:true,reconnectPeriod:5000});
    m.on('connect',function(){m.subscribe('spectre_tools_v1_'+sc+'/mj');});
    m.on('message',function(t,b){var d;try{d=JSON.parse(b.toString());}catch(e){return;}
      if(!d||d.type!=='moonKey'||d.to!==ME)return;
      try{if(window.role==='mj')return;}catch(e){}
      try{if(localStorage.getItem('np_moonkey_n')===String(d.nonce))return;localStorage.setItem('np_moonkey_n',String(d.nonce));}catch(e){}
      localStorage.setItem('np_moonkey',JSON.stringify({target:d.target,name:d.name}));alertScreen();});
  }catch(e){}});
}
function boot(){
  var iv=setInterval(function(){
    if(sessionCode()){clearInterval(iv);listen();var p=pend();if(p&&p!=='done'&&typeof p==='object')alertScreen();}
  },1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
