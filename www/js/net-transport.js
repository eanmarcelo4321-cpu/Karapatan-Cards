/* ===== Karapatan Cards — Local Multiplayer Transport =====
   Implements the `transport` interface net-protocol.js expects:
     { send(peerId, msg), broadcast(msg), onMessage(cb), onPeerLeave(cb) }

   Two implementations:
   - HostTransport  — wraps the native "LocalMultiplayer" Capacitor plugin,
     which runs an actual listening WebSocket server (a WebView cannot open
     a listening socket itself, see LOCAL_MULTIPLAYER_DESIGN.md section 1).
   - ClientTransport — plain browser `WebSocket`, works in any WebView/browser
     with no native code, dials out to the host's ws://ip:port.

   PHASE 1 (manual IP) and PHASE 2 (native plugin) both live here: the
   client side of Phase 1 is complete as-is (pure JS WebSocket client).
   The host side needs the native plugin from PHASE 1 onward too — there is
   no pure-JS way to accept incoming connections in a WebView, so
   HostTransport always talks to the native plugin. Manual IP entry
   (Phase 1) and auto-discovery (Phase 2) both ultimately produce an
   ip:port that ClientTransport dials the same way. */

var LP_NET = (function(){

  const DEFAULT_PORT = 8787;
  const SERVICE_TYPE = '_karapatan._tcp';

  function getPlugin(){
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalMultiplayer) || null;
  }

  function hasNativeHosting(){
    return !!getPlugin();
  }

  /* ---------------- HOST TRANSPORT (native plugin) ---------------- */
  function createHostTransport(){
    const Plugin = getPlugin();
    const messageListeners = [];
    const leaveListeners = [];
    let listenerHandles = [];
    let started = false;

    async function start(port){
      if(!Plugin) throw new Error('native_plugin_unavailable');
      const res = await Plugin.startServer({ port: port || DEFAULT_PORT });
      started = true;

      listenerHandles.push(await Plugin.addListener('message', (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch(e){ return; }
        messageListeners.forEach(fn => fn(ev.peerId, msg));
      }));
      listenerHandles.push(await Plugin.addListener('peerDisconnected', (ev) => {
        leaveListeners.forEach(fn => fn(ev.peerId));
      }));

      // Best-effort local-network advertising so joiners can auto-discover
      // this host (Phase 2). Failure here (e.g. NSD unsupported) is not
      // fatal — manual IP entry (Phase 1) still works.
      try { await Plugin.startAdvertising({ serviceType: SERVICE_TYPE, port: res.port }); }
      catch(e){ /* discovery is a nicety, not a requirement */ }

      return { ip: res.ip, port: res.port };
    }

    async function stop(){
      if(!Plugin || !started) return;
      try { await Plugin.stopAdvertising(); } catch(e){}
      try { await Plugin.stopServer(); } catch(e){}
      listenerHandles.forEach(h => { try { h.remove(); } catch(e){} });
      listenerHandles = [];
      started = false;
    }

    function send(peerId, msg){
      if(!Plugin) return;
      Plugin.send({ peerId, data: JSON.stringify(msg) });
    }

    function broadcast(msg){
      if(!Plugin) return;
      Plugin.broadcast({ data: JSON.stringify(msg) });
    }

    function onMessage(cb){ messageListeners.push(cb); }
    function onPeerLeave(cb){ leaveListeners.push(cb); }

    return { start, stop, send, broadcast, onMessage, onPeerLeave };
  }

  /* ---------------- CLIENT TRANSPORT (browser WebSocket) ---------------- */
  function createClientTransport(){
    let ws = null;
    const messageListeners = [];
    const leaveListeners = [];

    function connect(ip, port){
      return new Promise((resolve, reject) => {
        let settled = false;
        try {
          ws = new WebSocket(`ws://${ip}:${port || DEFAULT_PORT}`);
        } catch(e){ reject(e); return; }

        const connectTimeout = setTimeout(() => {
          if(!settled){ settled = true; try{ ws.close(); }catch(e){} reject(new Error('timeout')); }
        }, 8000);

        ws.onopen = () => { if(!settled){ settled = true; clearTimeout(connectTimeout); resolve(); } };
        ws.onerror = () => { if(!settled){ settled = true; clearTimeout(connectTimeout); reject(new Error('connection_failed')); } };
        ws.onclose = () => { leaveListeners.forEach(fn => fn('host')); };
        ws.onmessage = (ev) => {
          let msg;
          try { msg = JSON.parse(ev.data); } catch(e){ return; }
          messageListeners.forEach(fn => fn('host', msg));
        };
      });
    }

    function disconnect(){
      if(ws){ try { ws.close(); } catch(e){} ws = null; }
    }

    // A client only ever has one peer (the host), so send() and
    // broadcast() are equivalent here — net-protocol.js's ClientSession
    // calls transport.broadcast() for every outgoing message.
    function sendToHost(msg){
      if(ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    }

    function onMessage(cb){ messageListeners.push(cb); }
    function onPeerLeave(cb){ leaveListeners.push(cb); }

    return {
      connect,
      disconnect,
      send: (_peerId, msg) => sendToHost(msg),
      broadcast: (msg) => sendToHost(msg),
      onMessage,
      onPeerLeave,
      isOpen: () => !!ws && ws.readyState === WebSocket.OPEN
    };
  }

  /* ---------------- DISCOVERY (Phase 2, best-effort) ---------------- */
  function startDiscovery(onHostFound, onHostLost){
    const Plugin = getPlugin();
    if(!Plugin) return Promise.resolve(false);
    const handles = [];
    return Promise.all([
      Plugin.addListener('hostFound', (ev) => onHostFound(ev)),
      Plugin.addListener('hostLost', (ev) => onHostLost && onHostLost(ev))
    ]).then((hs) => {
      handles.push(...hs);
      return Plugin.startDiscovery({ serviceType: SERVICE_TYPE })
        .then(() => ({ stop: () => { Plugin.stopDiscovery().catch(()=>{}); handles.forEach(h=>h.remove()); } }))
        .catch(() => { handles.forEach(h=>h.remove()); return false; });
    }).catch(() => false);
  }

  async function getLocalIP(){
    const Plugin = getPlugin();
    if(!Plugin) return null;
    try { const r = await Plugin.getLocalIP(); return r.ip; } catch(e){ return null; }
  }

  return {
    DEFAULT_PORT,
    hasNativeHosting,
    createHostTransport,
    createClientTransport,
    startDiscovery,
    getLocalIP
  };
})();
