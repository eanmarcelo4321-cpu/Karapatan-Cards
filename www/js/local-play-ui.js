/* ===== Karapatan Cards — Local Play UI =====
   Wires net-protocol.js (HostSession/ClientSession — source of truth for
   all state) to net-transport.js (sockets) and renders screens into the
   same #screen element game.js uses, via the `LP` namespace.

   Screens (state machine values used with game.js's goto()):
     localMenu   -> Host / Join picker
     localHost   -> hosting: shows IP, "waiting for players"
     localJoin   -> manual IP entry (+ auto-discovered hosts if available)
     localLobby  -> shared by host + clients: team list, team name, ready
     localGame   -> networked round play, driven by STATE_SYNC/ROUND_RESULT
     localResults-> GAME_END screen

   All user-facing strings come from translations.js's `localPlay` block
   (via `lp()` below), same as the rest of the app — nothing here is
   hardcoded English, so the language switcher covers this UI too. */

var LP = (function(){

  const LETTERS = ['A', 'B', 'C'];

  // Friendly, throwaway name for this hosting session — shown instead of
  // the host's raw IP address, both in the discovery list and on the
  // hosting screen itself. Regenerated fresh every time hosting starts;
  // it identifies the GAME, never the device or its owner.
  const NAME_ADJ = ["Matapang", "Masigla", "Tapat", "Malakas", "Masaya", "Matalino", "Mabilis", "Buoyant"];
  const NAME_NOUN = ["Agila", "Falcon", "Tigre", "Bantay", "Diwata", "Sundalo", "Kalabaw", "Ipo-Ipo"];
  function generateGameName(){
    const a = NAME_ADJ[Math.floor(Math.random() * NAME_ADJ.length)];
    const n = NAME_NOUN[Math.floor(Math.random() * NAME_NOUN.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${a} ${n} #${num}`;
  }

  function lp(){ return T().localPlay; }
  function diffLabel(difficulty){
    const t = T();
    const key = 'diff' + difficulty[0].toUpperCase() + difficulty.slice(1);
    return t[key] || difficulty;
  }

  let role = null;          // 'host' | 'client'
  let hostSession = null;   // net-protocol.js HostSession (host only)
  let clientSession = null; // net-protocol.js ClientSession (client only)
  let transport = null;
  let myPeerId = null;      // client's own peerId, set on JOIN_ACCEPTED
  let hostIp = null, hostPort = null;
  let hostGameName = null, hostCode = null;
  let discoveredHosts = [];
  let discoveryHandle = null;
  let joinError = null;
  let hostError = null;
  let lastLobby = null;     // latest LOBBY_STATE payload
  let lastSync = null;      // latest STATE_SYNC payload
  let lastRoundResult = null;
  let lastGameEnd = null;
  let teamNameDraft = '';
  let chosenIndex = null;
  let answered = false;
  let connecting = false;
  let lastManualIp = '';

  /* ---------------- Deck building (host only) ----------------
     Reuses the exact same CARD_POOL/shuffle already in game.js so the
     card pool and shuffle-per-draw fix (see LOCAL_MULTIPLAYER_DESIGN.md
     section 7) behave identically to pass-and-play. */
  function buildNetDeck(settings){
    let pool = CARD_POOL.slice();
    if(settings.difficulty !== 'mixed'){
      pool = pool.filter(c => c.difficulty === settings.difficulty);
    }
    if(settings.category !== 'all'){
      pool = pool.filter(c => c.category === settings.category);
    }
    if(pool.length < settings.rounds) pool = CARD_POOL.slice(); // fallback: filter too narrow
    return shuffle(pool).slice(0, settings.rounds);
  }

  /* ================= ENTRY / CLEANUP ================= */
  function openMenu(){
    resetSession();
    goto('localMenu');
  }

  function resetSession(){
    if(hostSession){ try { hostSession = null; } catch(e){} }
    if(clientSession && transport){ try { clientSession.leave(); } catch(e){} }
    if(transport){
      if(role === 'host') transport.stop().catch(()=>{});
      else if(role === 'client') transport.disconnect();
    }
    if(discoveryHandle){ discoveryHandle.stop(); discoveryHandle = null; }
    role = null; transport = null; clientSession = null; myPeerId = null;
    hostIp = null; hostPort = null; hostGameName = null; hostCode = null;
    discoveredHosts = []; joinError = null; hostError = null;
    lastLobby = null; lastSync = null; lastRoundResult = null; lastGameEnd = null;
    chosenIndex = null; answered = false; teamNameDraft = ''; connecting = false;
  }

  function leaveToHome(){
    resetSession();
    goto('multiplayerMenu'); // Local Play is now reached via the Multiplayer Menu, so back returns there
  }

  /* ================= MENU SCREEN ================= */
  function renderMenu(){
    const s = lp();
    screenEl.innerHTML = `
      <div class="screen-body">
        <div class="section-title">${s.title}</div>
        <div style="font-size:12px;color:#8a9a94;margin:-4px 0 14px;">
          ${s.subtitle}
        </div>
        <div class="mode-grid">
          <div class="mode-card" onclick="LP.beginHost()">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
            <div class="mc-title">${s.hostCardTitle}</div>
            <div class="mc-sub">${s.hostCardSub}</div>
          </div>
          <div class="mode-card" onclick="LP.beginJoin()">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>
            <div class="mc-title">${s.joinCardTitle}</div>
            <div class="mc-sub">${s.joinCardSub}</div>
          </div>
        </div>
        ${!LP_NET.hasNativeHosting() ? `<div class="toast info">${s.noNativeToast}</div>` : ''}
        <div class="grow"></div>
        <button class="btn btn-outline" onclick="LP.leaveToHome()">${s.backToHomeBtn}</button>
      </div>
    `;
    setControls('');
  }

  /* ================= HOST FLOW ================= */
  async function beginHost(){
    if(!LP_NET.hasNativeHosting()){
      hostError = lp().hostErrorNoNative;
      goto('localHost');
      return;
    }
    hostError = null;
    goto('localHost'); // show "starting..." immediately
    role = 'host';
    transport = LP_NET.createHostTransport();
    hostGameName = generateGameName();
    try {
      const { ip, port } = await transport.start(LP_NET.DEFAULT_PORT, hostGameName);
      hostIp = ip; hostPort = port;
      hostCode = LP_NET.encodeAddress(ip, port);
      hostSession = NetProtocol.createHostSession(transport, { settings: {} });
      hostSession.on('lobbyChanged', (st) => { lastLobby = { teams: st.teams, settings: st.settings }; if(state === 'localLobby') renderLobby(); });
      render();
    } catch(e){
      hostError = lp().hostErrorStartFailed(e && e.message);
      role = null; transport = null;
      render();
    }
  }

  function renderHost(){
    const s = lp();
    if(hostError){
      screenEl.innerHTML = `
        <div class="screen-body">
          <div class="section-title">${s.hostCardTitle}</div>
          <div class="toast">${hostError}</div>
          <div class="grow"></div>
          <button class="btn btn-outline" onclick="LP.openMenu()">${s.backBtn}</button>
        </div>`;
      setControls('');
      return;
    }
    if(!hostIp){
      screenEl.innerHTML = `<div class="screen-body" style="justify-content:center;align-items:center;"><div class="section-title">${s.startingServer}</div></div>`;
      setControls('');
      return;
    }
    const teams = (lastLobby && lastLobby.teams) || [];
    screenEl.innerHTML = `
      <div class="screen-body">
        <div class="section-title">${s.hostingTitle}</div>
        <div class="answer-card" style="text-align:center;">
          <div class="handoff-dot" style="background:var(--gold);width:14px;height:14px;margin:0 auto 10px;"></div>
          <div style="font-size:11px;color:#8a9a94;">${s.yourGameLabel}</div>
          <div style="font-size:20px;font-weight:800;color:var(--navy);margin:4px 0 10px;">${hostGameName || ''}</div>
          <div style="font-size:11px;color:#8a9a94;">${s.hostCodeLabel}</div>
          <div style="font-size:20px;font-weight:800;color:var(--navy);letter-spacing:2px;margin:6px 0;font-family:monospace;">${hostCode || '…'}</div>
          <div style="font-size:11px;color:#8a9a94;">${LP_NET.hasNativeHosting() ? s.hostWifiNoteDiscovery : s.hostWifiNote}</div>
        </div>
        <div class="section-title" style="margin-top:14px;">${s.playersLabel(teams.length)}</div>
        ${teams.length === 0 ? `<div class="toast info">${s.waitingForPlayers}</div>` : teams.map(tm => `
          <div class="team-row"><span><span class="team-dot" style="background:${tm.dot}"></span>${tm.teamName}${!tm.connected ? s.disconnectedTag : ''}</span><span style="color:${tm.ready?'var(--sage)':'#c2c2c2'};font-weight:800;">${tm.ready?s.readyTag:s.waitingTag}</span></div>
        `).join('')}
        <div class="grow"></div>
        <button class="btn btn-outline" style="margin-bottom:8px;" onclick="LP.openMenu()">${s.cancelHostingBtn}</button>
        <button class="btn btn-primary" onclick="LP.enterHostLobby()">${s.continueToLobbyBtn}</button>
      </div>
    `;
    setControls('');
  }

  function enterHostLobby(){ goto('localLobby'); }

  /* ================= JOIN FLOW ================= */
  function beginJoin(){
    joinError = null;
    discoveredHosts = [];
    goto('localJoin');
    if(LP_NET.hasNativeHosting()){
      LP_NET.startDiscovery(
        (ev) => { if(!discoveredHosts.find(h => h.ip === ev.ip && h.port === ev.port)){ discoveredHosts.push(ev); if(state==='localJoin') renderJoin(); } },
        (ev) => { discoveredHosts = discoveredHosts.filter(h => !(h.ip === ev.ip && h.port === ev.port)); if(state==='localJoin') renderJoin(); }
      ).then(h => { if(h) discoveryHandle = h; });
    }
  }

  function renderJoin(){
    const s = lp();
    screenEl.innerHTML = `
      <div class="screen-body">
        <div class="section-title">${s.joinTitle}</div>
        ${discoveredHosts.length ? `
          <div style="font-size:11px;color:#8a9a94;margin-bottom:6px;">${s.foundNearbyLabel}</div>
          ${discoveredHosts.map(h => `
            <div class="team-row" style="cursor:pointer;" onclick="LP.connectTo('${h.ip}', ${h.port})">
              <span>${h.name || s.defaultHostName}</span>
              <span style="color:var(--sage);font-weight:800;">${s.joinTag}</span>
            </div>`).join('')}
          <div style="font-size:11px;color:#8a9a94;margin:12px 0 6px;">${s.manualEntryLabel}</div>
        ` : `<div style="font-size:12px;color:#8a9a94;margin-bottom:10px;">${s.manualEntryHelp}</div>`}
        <input class="lp-input" id="lpIpInput" placeholder="${s.ipPlaceholder}" value="${lastManualIp||''}" autocapitalize="characters" autocorrect="off" spellcheck="false" style="text-transform:uppercase;letter-spacing:1px;">
        ${joinError ? `<div class="toast" style="margin-top:10px;">${joinError}</div>` : ''}
        <div class="grow"></div>
        <button class="btn btn-outline" style="margin-bottom:8px;" onclick="LP.openMenu()">${s.backBtn}</button>
        <button class="btn btn-primary" ${connecting?'disabled':''} onclick="LP.submitManualIp()">${connecting ? s.connectingBtn : s.connectBtn}</button>
      </div>
    `;
    setControls('');
  }

  function submitManualIp(){
    const el = document.getElementById('lpIpInput');
    const raw = (el && el.value || '').trim();
    if(!raw){ joinError = lp().errEnterIp; renderJoin(); return; }
    lastManualIp = raw;
    if(raw.includes('.')){
      // Looks like a literal IP (power-user / debugging fallback) — still
      // supported, just no longer the primary flow shown in the UI.
      let ip = raw, port = LP_NET.DEFAULT_PORT;
      if(raw.includes(':')){ const parts = raw.split(':'); ip = parts[0]; port = parseInt(parts[1], 10) || LP_NET.DEFAULT_PORT; }
      connectTo(ip, port);
      return;
    }
    const decoded = LP_NET.decodeAddress(raw);
    if(!decoded){ joinError = lp().errInvalidCode; renderJoin(); return; }
    connectTo(decoded.ip, decoded.port);
  }

  async function connectTo(ip, port){
    joinError = null;
    connecting = true;
    renderJoin();
    role = 'client';
    transport = LP_NET.createClientTransport();
    try {
      await transport.connect(ip, port);
      hostIp = ip; hostPort = port;
      clientSession = NetProtocol.createClientSession(transport);
      wireClientSession();
      transport.onPeerLeave(() => {
        if(state === 'localLobby' || state === 'localGame'){
          joinError = lp().errLostConnection;
          resetSession();
          goto('localMenu');
        }
      });
      clientSession.join(defaultTeamName());
      goto('localLobby');
    } catch(e){
      joinError = lp().errConnectFailed;
      connecting = false;
      role = null; transport = null;
      renderJoin();
    }
  }

  function defaultTeamName(){
    const n = TEAM_POOL[Math.floor(Math.random() * TEAM_POOL.length)].name;
    return n;
  }

  function wireClientSession(){
    clientSession.on('lobby', (msg) => { lastLobby = { teams: msg.teams, settings: msg.settings }; connecting = false; if(state === 'localLobby') renderLobby(); });
    clientSession.on('joined', (msg) => { myPeerId = msg.peerId; });
    clientSession.on('rejected', (msg) => {
      const s = lp();
      joinError = msg.reason === 'lobby_full' ? s.errLobbyFull : msg.reason === 'game_in_progress' ? s.errGameInProgress : s.errJoinRejected;
      connecting = false;
      resetSession();
      goto('localJoin');
    });
    clientSession.on('kicked', () => {
      joinError = lp().errKicked;
      resetSession();
      goto('localMenu');
    });
    clientSession.on('gameStart', () => { chosenIndex = null; goto('localGame'); });
    clientSession.on('sync', (payload) => { lastSync = payload; chosenIndex = null; answered = false; if(state === 'localGame') renderGame(); });
    clientSession.on('roundResult', (msg) => { lastRoundResult = msg; if(state === 'localGame') renderGame(); });
    clientSession.on('gameEnd', (msg) => { lastGameEnd = msg; goto('localResults'); });
  }

  /* ================= LOBBY SCREEN (host + client) ================= */
  function renderLobby(){
    const s = lp();
    const teams = (lastLobby && lastLobby.teams) || [];
    const settings = (lastLobby && lastLobby.settings) || NetProtocol.DEFAULT_SETTINGS;
    const myTeam = role === 'host' ? null : teams.find(t => t.peerId === myPeerId);
    const canStart = role === 'host' && hostSession && hostSession.allReady();

    screenEl.innerHTML = `
      <div class="screen-body">
        <div class="section-title">${s.lobbyTitle}</div>
        <div style="font-size:11px;color:#8a9a94;margin:-4px 0 10px;">${s.lobbySettingsLine(settings.rounds, settings.targetScore, settings.timerSeconds)}</div>
        ${teams.map(tm => `
          <div class="team-row">
            <span><span class="team-dot" style="background:${tm.dot}"></span>${tm.teamName}${!tm.connected ? s.disconnectedTag : ''}</span>
            <span style="color:${tm.ready?'var(--sage)':'#c2c2c2'};font-weight:800;">${tm.ready?s.readyTag:s.waitingTag}</span>
          </div>
        `).join('') || `<div class="toast info">${s.waitingForPlayers}</div>`}

        ${role === 'client' ? `
          <div class="section-title" style="margin-top:14px;">${s.yourTeamNameLabel}</div>
          <input class="lp-input" id="lpTeamNameInput" maxlength="20" value="${myTeam ? myTeam.teamName : teamNameDraft}" placeholder="${s.teamNamePlaceholder}">
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="LP.submitTeamName()">${s.updateNameBtn}</button>
          <button class="btn ${myTeam && myTeam.ready ? 'btn-outline' : 'btn-primary'}" style="margin-top:10px;" onclick="LP.toggleReady()">${myTeam && myTeam.ready ? s.notReadyBtn : s.readyUpBtn}</button>
        ` : ''}

        ${role === 'host' ? `
          <div style="font-size:11px;color:#8a9a94;margin-top:12px;">${teams.length < 2 ? s.needTwoTeams : canStart ? s.allTeamsReady : s.waitingAllReady}</div>
        ` : ''}

        <div class="grow"></div>
        <button class="btn btn-outline" style="margin-bottom:8px;" onclick="LP.leaveSession()">${role==='host' ? s.endLobbyBtn : s.leaveBtn}</button>
        ${role === 'host' ? `<button class="btn btn-primary" ${canStart?'':'disabled'} onclick="LP.startHostGame()">${s.startGameBtn}</button>` : ''}
      </div>
    `;
    setControls('');
  }

  function submitTeamName(){
    const el = document.getElementById('lpTeamNameInput');
    const name = (el && el.value || '').trim();
    if(!name) return;
    teamNameDraft = name;
    if(role === 'client' && clientSession) clientSession.setTeamName(name);
  }

  function toggleReady(){
    if(role !== 'client' || !clientSession) return;
    const teams = (lastLobby && lastLobby.teams) || [];
    const myTeam = teams.find(t => t.peerId === myPeerId);
    clientSession.setReady(!(myTeam && myTeam.ready));
  }

  function startHostGame(){
    if(role !== 'host' || !hostSession || !hostSession.allReady()) return;
    const deck = buildNetDeck(hostSession.settings);
    chosenIndex = null;
    hostSession.startGame(deck);
    goto('localGame');
  }

  function leaveSession(){
    resetSession();
    goto('localMenu');
  }

  /* ================= NETWORKED GAMEPLAY ================= */
  function renderGame(){
    if(role === 'host') renderGameHost();
    else renderGameClient();
  }

  // The host's own device is also team-agnostic display: it shows exactly
  // what STATE_SYNC says (it's just also the authority computing it), kept
  // in sync via HostSession's internal `state` + the lobbyChanged/broadcast
  // it already emits to itself as team 0's transport target isn't needed —
  // the host reads hostSession.state directly instead of round-tripping
  // messages to itself.
  function renderGameHost(){
    const s = hostSession.state;
    if(s.phase === 'results') return; // GAME_END already broadcast; host follows same results screen
    if(!s.currentCard){
      screenEl.innerHTML = `<div class="screen-body" style="justify-content:center;align-items:center;"><div class="section-title">${lp().dealingLabel}</div></div>`;
      setControls('');
      return;
    }
    renderRoundScreen({
      phase: s.phase, teams: s.teams, currentTeamIndex: s.currentTeamIndex,
      card: s.currentCard, cardsLeft: s.deck.length - s.cardIndex, stealActive: s.stealActive
    }, true);
  }

  function renderGameClient(){
    if(!lastSync){
      screenEl.innerHTML = `<div class="screen-body" style="justify-content:center;align-items:center;"><div class="section-title">${lp().loadingLabel}</div></div>`;
      setControls('');
      return;
    }
    renderRoundScreen(lastSync, false);
  }

  function renderRoundScreen(sync, isHost){
    const s = lp();
    const t = T();
    const activeTeam = sync.teams[sync.currentTeamIndex];
    const myTeam = isHost ? null : sync.teams.find(t => t.peerId === myPeerId);
    const isMyTurn = !isHost && myTeam && myTeam.peerId === activeTeam.peerId;
    const card = sync.card;
    const twoCls = card.choices.length === 2 ? 'two' : '';

    // Round-result reveal takes priority for a few seconds after a submit
    if(lastRoundResult && lastRoundResult.cardId === card.id){
      const r = lastRoundResult;
      const chosen = card.choices[r.chosenIndex];
      screenEl.innerHTML = `
        <div class="screen-body">
          <div class="choice-list flat ${twoCls}" style="margin-top:6px;margin-bottom:12px;">
            ${card.choices.map((c, i) => {
              let cls = 'dim';
              let mark = '';
              if(r.chosenIndex === i){ cls = c.pts===2?'correct':c.pts===1?'partial':'wrong'; mark = `<span class="choice-mark" style="background:${c.pts===2?'var(--sage)':c.pts===1?'var(--gold)':'var(--coral)'};">${c.pts===2?'✓':c.pts===1?'~':'✗'}</span>`; }
              else if(c.pts === 2){ cls = 'correct dim'; }
              return `<div class="choice-card ${cls}">
                <span class="idx idx-tl">${LETTERS[i]}<i>♦</i></span><span class="idx idx-br">${LETTERS[i]}<i>♦</i></span>
                ${mark}<span class="choice-text">${c.text}</span></div>`;
            }).join('')}
          </div>
          <div class="answer-card">
            <div class="answer-tag" style="background:${chosen&&chosen.pts===2?'var(--sage)':chosen&&chosen.pts===1?'var(--gold)':'var(--coral)'};">${s.pointsAwardedLabel(r.pointsAwarded, activeTeam.teamName)}</div>
            <div class="answer-text">${card.answer}</div>
            <div class="legal-basis"><strong>${t.legalBasisLabel}</strong> ${card.legal}</div>
          </div>
          <div style="font-size:11px;color:#8a9a94;text-align:center;margin-top:10px;">${s.nextCardSoon}</div>
        </div>
      `;
      setControls('');
      return;
    }

    screenEl.innerHTML = `
      <div class="screen-body" style="border-top:4px solid ${activeTeam.dot};padding-top:10px;">
        <div class="card-topline">
          <div class="card-label"><span class="team-dot" style="background:${activeTeam.dot};"></span>${s.turnLabel(activeTeam.teamName)}</div>
          <div class="badge-row"><span class="badge diff-${card.difficulty}">${diffLabel(card.difficulty)}</span></div>
        </div>
        <div class="situation-card"><div class="scenario">${card.scenario}</div></div>
        <div style="font-size:11px;color:#8a9a94;text-align:center;margin:6px 0;">${s.cardsLeftLabel(sync.cardsLeft)}</div>
        ${sync.stealActive ? `<div class="toast">${s.stealToast}</div>` : ''}
        ${isMyTurn && !answered ? `
          <div class="choice-list ${twoCls}">
            ${card.choices.map((c, i) => `
              <button class="choice-card" onclick="LP.submitAnswer(${i})">
                <span class="idx idx-tl">${LETTERS[i]}<i>♦</i></span><span class="idx idx-br">${LETTERS[i]}<i>♦</i></span>
                <span class="choice-text">${c.text}</span></button>`).join('')}
          </div>
        ` : `
          <div class="toast info" style="margin-top:16px;">${isMyTurn ? s.answerSubmittedToast : s.waitingForTeam(activeTeam.teamName)}</div>
        `}
      </div>
    `;
    setControls(isHost ? `<button class="btn btn-outline btn-sm" onclick="LP.leaveSession()">${s.endGameBtn}</button>` : '');
  }

  function submitAnswer(index){
    if(role !== 'client' || !clientSession || answered) return;
    chosenIndex = index;
    answered = true;
    clientSession.submitAnswer(index);
    if(state === 'localGame') renderGame();
  }

  /* ================= RESULTS SCREEN ================= */
  function renderResults(){
    const s = lp();
    const g = lastGameEnd;
    if(!g){ goto('localMenu'); return; }
    const sorted = [...g.finalScores].sort((a,b) => b.score - a.score);
    const winner = sorted[0];
    screenEl.innerHTML = `
      <div class="screen-body">
        <div class="win-title">${s.winsTitle(winner.teamName)}</div>
        <div class="app-header" style="margin-top:6px;">${s.finalScoresTitle}</div>
        ${sorted.map(tm => `
          <div class="scoreboard-row ${tm===winner?'leader':''}">
            <span class="name">${tm.teamName}</span><span class="pts">${s.ptsSuffix(tm.score)}</span>
          </div>`).join('')}
        <div class="grow"></div>
        <button class="btn btn-primary" onclick="LP.leaveSession()">${s.backToLocalPlayBtn}</button>
      </div>
    `;
    setControls('');
  }

  return {
    openMenu, renderMenu,
    beginHost, renderHost, enterHostLobby,
    beginJoin, renderJoin, submitManualIp, connectTo,
    renderLobby, submitTeamName, toggleReady, startHostGame,
    renderGame, submitAnswer,
    renderResults,
    leaveSession, leaveToHome
  };
})();
