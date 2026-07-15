/* ===== Karapatan Cards — Local Multiplayer Protocol =====
   Transport-agnostic. This module defines the message schema and the
   host-authoritative state machine (lobby -> in-game -> results).
   It does NOT open sockets itself — it expects a `transport` object
   with: { send(peerId, msg), broadcast(msg), onMessage(cb), onPeerLeave(cb) }
   which is provided by a native plugin (see LAN_MULTIPLAYER.md, section 3).

   Both the host and every client load this same file. HostSession runs
   only on the host device; ClientSession runs only on client devices.
   All game-affecting decisions are made by HostSession — clients only
   render whatever state the host broadcasts and send back intents. */

const NetProtocol = (function(){

  const MSG = {
    // client -> host
    JOIN_REQUEST:   'join_request',   // { teamName }
    SET_TEAM_NAME:  'set_team_name',  // { teamName }
    SET_READY:      'set_ready',      // { ready: bool }
    SUBMIT_ANSWER:  'submit_answer',  // { cardId, choiceIndex, clientTimestamp }
    LEAVE:          'leave',          // {}

    // host -> client(s)
    LOBBY_STATE:    'lobby_state',    // { teams: [...], settings, hostId }
    JOIN_ACCEPTED:  'join_accepted',  // { peerId, assignedTeamIndex }
    JOIN_REJECTED:  'join_rejected',  // { reason }
    KICKED:         'kicked',         // { reason }
    GAME_START:     'game_start',     // { deckMeta, settings }
    STATE_SYNC:     'state_sync',     // full authoritative match state (see buildSyncPayload)
    ROUND_RESULT:   'round_result',   // { cardId, chosenIndex, correctIndex, pointsAwarded, scores }
    GAME_END:       'game_end',       // { winnerTeamId, reason, finalScores }
    PING:           'ping',
    PONG:           'pong'
  };

  const DEFAULT_SETTINGS = {
    maxTeams: 4,
    timerSeconds: 30,          // per-question timer; 0 = untimed
    rounds: 20,                // total cards in the match ("deck size")
    difficulty: 'mixed',       // 'easy' | 'medium' | 'hard' | 'mixed'
    category: 'all',           // category filter, or 'all'
    pointsCorrect: 2,
    pointsPartial: 1,
    stealRuleEnabled: true,    // wrong answer -> next team can steal 1 pt
    randomizeChoiceOrder: true,
    timeBetweenRounds: 4,      // seconds shown on the "results -> next round" transition
    targetScore: 15,           // early win condition
    allowReconnect: true
  };

  /* ---------------- HOST ---------------- */
  function createHostSession(transport, opts){
    opts = opts || {};
    const settings = Object.assign({}, DEFAULT_SETTINGS, opts.settings);
    const state = {
      phase: 'lobby',           // 'lobby' | 'countdown' | 'in_game' | 'results'
      teams: [],                // { peerId, teamName, ready, connected, score, dot }
      settings,
      deck: [],
      cardIndex: 0,
      currentTeamIndex: 0,
      currentCard: null,
      pendingAnswers: {},       // peerId -> { choiceIndex, timestamp } for this round
      stealActive: false
    };
    const TEAM_DOTS = ["#D2574B", "#7FA684", "#D9A441", "#4E8FA6"];
    const listeners = {};

    function emit(evt, payload){ (listeners[evt]||[]).forEach(fn => fn(payload)); }
    function on(evt, fn){ (listeners[evt] = listeners[evt]||[]).push(fn); return () => {}; }

    function broadcastLobby(){
      transport.broadcast({ type: MSG.LOBBY_STATE, teams: state.teams, settings: state.settings });
      emit('lobbyChanged', state);
    }

    function handleJoinRequest(peerId, msg){
      if(state.phase !== 'lobby'){
        transport.send(peerId, { type: MSG.JOIN_REJECTED, reason: 'game_in_progress' });
        return;
      }
      if(state.teams.length >= settings.maxTeams){
        transport.send(peerId, { type: MSG.JOIN_REJECTED, reason: 'lobby_full' });
        return;
      }
      const idx = state.teams.length;
      state.teams.push({
        peerId,
        teamName: (msg.teamName || `Team ${idx+1}`).slice(0, 20),
        ready: false,
        connected: true,
        score: 0,
        dot: TEAM_DOTS[idx % TEAM_DOTS.length]
      });
      transport.send(peerId, { type: MSG.JOIN_ACCEPTED, peerId, assignedTeamIndex: idx });
      broadcastLobby();
    }

    function handleSetTeamName(peerId, msg){
      const team = state.teams.find(t => t.peerId === peerId);
      if(!team) return;
      team.teamName = (msg.teamName || team.teamName).slice(0, 20);
      broadcastLobby();
    }

    function handleSetReady(peerId, msg){
      const team = state.teams.find(t => t.peerId === peerId);
      if(!team) return;
      team.ready = !!msg.ready;
      broadcastLobby();
    }

    function allReady(){
      return state.teams.length >= 2 && state.teams.every(t => t.ready && t.connected);
    }

    function kickTeam(peerId, reason){
      state.teams = state.teams.filter(t => t.peerId !== peerId);
      transport.send(peerId, { type: MSG.KICKED, reason: reason || 'removed_by_host' });
      broadcastLobby();
    }

    function handleDisconnect(peerId){
      const team = state.teams.find(t => t.peerId === peerId);
      if(!team) return;
      if(state.phase === 'lobby'){
        state.teams = state.teams.filter(t => t.peerId !== peerId);
        broadcastLobby();
      } else if(settings.allowReconnect){
        team.connected = false; // keep score/slot, allow rejoin (see reconnect note in doc)
        emit('teamDisconnected', team);
      } else {
        state.teams = state.teams.filter(t => t.peerId !== peerId);
      }
    }

    function startGame(deck){
      state.deck = deck.slice(0, settings.rounds);
      state.cardIndex = 0;
      state.currentTeamIndex = 0;
      transport.broadcast({ type: MSG.GAME_START, deckMeta: { size: state.deck.length }, settings });
      nextRound();
    }

    function shuffle(arr){
      const a = arr.slice();
      for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
      return a;
    }

    function nextRound(){
      if(state.cardIndex >= state.deck.length) return endGame();
      const raw = state.deck[state.cardIndex++];
      const choices = settings.randomizeChoiceOrder ? shuffle(raw.choices) : raw.choices.slice();
      state.currentCard = Object.assign({}, raw, { choices });
      state.pendingAnswers = {};
      state.phase = 'in_game';
      transport.broadcast({ type: MSG.STATE_SYNC, payload: buildSyncPayload() });
    }

    function buildSyncPayload(){
      return {
        phase: state.phase,
        teams: state.teams,
        currentTeamIndex: state.currentTeamIndex,
        card: state.currentCard,           // choices include text+pts; client is trusted display-only,
                                            // since this is LAN/offline play (no anti-cheat needed)
        cardsLeft: state.deck.length - state.cardIndex,
        stealActive: state.stealActive
      };
    }

    function handleSubmitAnswer(peerId, msg){
      const activeTeam = state.teams[state.currentTeamIndex];
      if(!activeTeam || activeTeam.peerId !== peerId) return; // not this team's turn — ignore
      if(state.pendingAnswers[peerId]) return; // already answered this round
      state.pendingAnswers[peerId] = { choiceIndex: msg.choiceIndex, ts: Date.now() };
      resolveRound(msg.choiceIndex);
    }

    function resolveRound(choiceIndex){
      const team = state.teams[state.currentTeamIndex];
      const card = state.currentCard;
      let pts = choiceIndex === null ? 0 : card.choices[choiceIndex].pts;
      if(state.stealActive) pts = Math.min(pts, 1);
      team.score += pts;

      transport.broadcast({
        type: MSG.ROUND_RESULT,
        cardId: card.id,
        chosenIndex: choiceIndex,
        pointsAwarded: pts,
        scores: state.teams.map(t => ({ peerId: t.peerId, score: t.score }))
      });

      if(team.score >= settings.targetScore) return endGame(team);

      if(pts === 0 && settings.stealRuleEnabled && !state.stealActive){
        state.stealActive = true;
      } else {
        state.stealActive = false;
      }
      advanceTeam();
      setTimeout(nextRound, settings.timeBetweenRounds * 1000);
    }

    function advanceTeam(){
      state.currentTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
    }

    function endGame(forcedWinner){
      const winner = forcedWinner || state.teams.reduce((a,b) => b.score > a.score ? b : a);
      state.phase = 'results';
      transport.broadcast({
        type: MSG.GAME_END,
        winnerTeamId: winner.peerId,
        finalScores: state.teams.map(t => ({ peerId: t.peerId, teamName: t.teamName, score: t.score }))
      });
    }

    transport.onMessage((peerId, msg) => {
      switch(msg.type){
        case MSG.JOIN_REQUEST:  return handleJoinRequest(peerId, msg);
        case MSG.SET_TEAM_NAME: return handleSetTeamName(peerId, msg);
        case MSG.SET_READY:     return handleSetReady(peerId, msg);
        case MSG.SUBMIT_ANSWER: return handleSubmitAnswer(peerId, msg);
        case MSG.LEAVE:         return handleDisconnect(peerId);
        case MSG.PING:          return transport.send(peerId, { type: MSG.PONG });
      }
    });
    transport.onPeerLeave(peerId => handleDisconnect(peerId));

    return { state, on, kickTeam, allReady, startGame, settings };
  }

  /* ---------------- CLIENT ---------------- */
  function createClientSession(transport){
    const listeners = {};
    function emit(evt, payload){ (listeners[evt]||[]).forEach(fn => fn(payload)); }
    function on(evt, fn){ (listeners[evt] = listeners[evt]||[]).push(fn); }

    transport.onMessage((_hostId, msg) => {
      switch(msg.type){
        case MSG.LOBBY_STATE:   return emit('lobby', msg);
        case MSG.JOIN_ACCEPTED: return emit('joined', msg);
        case MSG.JOIN_REJECTED: return emit('rejected', msg);
        case MSG.KICKED:        return emit('kicked', msg);
        case MSG.GAME_START:    return emit('gameStart', msg);
        case MSG.STATE_SYNC:    return emit('sync', msg.payload);
        case MSG.ROUND_RESULT:  return emit('roundResult', msg);
        case MSG.GAME_END:      return emit('gameEnd', msg);
      }
    });

    function join(teamName){ transport.broadcast({ type: MSG.JOIN_REQUEST, teamName }); }
    function setTeamName(teamName){ transport.broadcast({ type: MSG.SET_TEAM_NAME, teamName }); }
    function setReady(ready){ transport.broadcast({ type: MSG.SET_READY, ready }); }
    function submitAnswer(choiceIndex){ transport.broadcast({ type: MSG.SUBMIT_ANSWER, choiceIndex, clientTimestamp: Date.now() }); }
    function leave(){ transport.broadcast({ type: MSG.LEAVE }); }

    return { on, join, setTeamName, setReady, submitAnswer, leave };
  }

  return { MSG, DEFAULT_SETTINGS, createHostSession, createClientSession };
})();
