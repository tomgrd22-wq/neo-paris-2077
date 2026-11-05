/* ═════ SUIVI EN DIRECT DES OUTILS DE PERSONNAGE (MQTT) ═════
   Joueur : NPTools.player({getState:fn, onCmd:fn}) puis NPTools.pub() / NPTools.event('texte')
   MJ     : NPTools.mj({onState:fn(role,data), onEvent:fn(ev), onStatus:fn(bool)}), NPTools.send(role,type,data) */
(function(){
var BROKER='wss://broker.emqx.io:8084/mqtt',ROLES=['tamuro','kiki','keiyo','hunter','fury'];
var code='',role='',mc=null,ready=false,cfg={},events=[],timer=null,base='',statusFn=null,queue=[];
function ident(){
  var p=new URLSearchParams(location.search);
  var c=(p.get('code')||'').trim().toLowerCase().replace(/\s+/g,'_'),r=(p.get('role')||'').trim();
  if(c.length>=3){try{localStorage.setItem('np_ident',JSON.stringify({code:c,role:r||(JSON.parse(localStorage.getItem('np_ident')||'{}').role)}));}catch(e){}return {code:c,role:r};}
  try{var v=JSON.parse(localStorage.getItem('np_ident'));if(v&&v.code)return v;}catch(e){}
  return null;
}
function connect(onopen){
  if(typeof mqtt==='undefined'){return;}
  mc=mqtt.connect(BROKER,{clientId:'tl'+Date.now()+Math.random().toString(36).slice(2,6),clean:true,connectTimeout:8000,reconnectPeriod:4000});
  mc.on('connect',function(){ready=true;if(statusFn)statusFn(true);onopen();queue.splice(0).forEach(function(f){f();});});
  mc.on('close',function(){ready=false;if(statusFn)statusFn(false);});
  mc.on('error',function(){});
}
function put(topic,obj,retain){
  var f=function(){try{mc.publish(topic,JSON.stringify(obj),{qos:0,retain:!!retain});}catch(e){}};
  if(ready)f();else queue.push(f);
}
/* ── joueur ── */
function player(c){
  cfg=c||{};var id=ident();if(!id||!id.code){return false;}
  code=id.code;role=cfg.role||id.role;base='spectre_tools_v1_'+code;
  try{events=JSON.parse(localStorage.getItem('np_tev_'+role)||'[]');}catch(e){events=[];}
  connect(function(){
    mc.subscribe(base+'/mj');
    pub();
  });
  if(!mc)return false;
  mc.on('message',function(t,m){
    if(t!==base+'/mj')return;var d;try{d=JSON.parse(m.toString());}catch(e){return;}
    if(!d||(d.to&&d.to!==role&&d.to!=='all'))return;
    if(d.type==='req'){pub();return;}
    if(cfg.onCmd){try{cfg.onCmd(d);}catch(e){}}
  });
  clearInterval(timer);timer=setInterval(pub,20000);
  return true;
}
function pub(){
  if(!mc||!cfg.getState)return;
  var s;try{s=cfg.getState();}catch(e){return;}
  put(base+'/p/'+role,{role:role,t:Date.now(),state:s,events:events.slice(-40)},true);
}
function event(txt){
  var ev={t:Date.now(),role:role,txt:String(txt)};
  events.push(ev);if(events.length>60)events.shift();
  try{localStorage.setItem('np_tev_'+role,JSON.stringify(events));}catch(e){}
  put(base+'/ev',ev,false);
  pub();
}
/* ── MJ ── */
function mj(c){
  cfg=c||{};var id=ident();if(!id||!id.code)return false;
  code=id.code;base='spectre_tools_v1_'+code;statusFn=cfg.onStatus;
  connect(function(){
    mc.subscribe(base+'/p/+');mc.subscribe(base+'/ev');
    put(base+'/mj',{type:'req',to:'all'},false);
  });
  if(!mc)return false;
  mc.on('message',function(t,m){
    var d;try{d=JSON.parse(m.toString());}catch(e){return;}
    if(t===base+'/ev'){if(cfg.onEvent)cfg.onEvent(d);return;}
    var mt=t.match(/\/p\/(\w+)$/);if(mt&&cfg.onState)cfg.onState(mt[1],d);
  });
  setInterval(function(){put(base+'/mj',{type:'req',to:'all'},false);},45000);
  return true;
}
function send(to,type,data){var d=data||{};d.to=to;d.type=type;d.n=Date.now()+Math.random();put(base+'/mj',d,false);}
window.NPTools={player:player,pub:pub,event:event,mj:mj,send:send,code:function(){return code;},ROLES:ROLES};
})();
