/* ===== Karapatan Cards — Game Engine ===== */

/* ---------- Home / setup state (persists between matches) ---------- */
var homeSettings = {
  mode: 'multiplayer',      // 'multiplayer' | 'solo'
  mpMode: 'passplay',       // 'passplay' | 'local' — only relevant when mode === 'multiplayer'
  length: 'standard',       // 'quick' | 'standard' | 'challenge'
  teamCount: 2,
  aiDifficulty: 'medium',
  learningAids: true
};

var TEAM_POOL = [
  { name: "Team Mabini",    dot: "#D2574B" },
  { name: "Team Bonifacio", dot: "#7FA684" },
  { name: "Team Rizal",     dot: "#7B4FE0" },
  { name: "Team Silang",    dot: "#4E8FA6" }
];

/* ---------- Live match / round state ---------- */
var state = "splash";
var match = null;
var currentCard = null;
var chosenIndex = null;
var answerLocked = false; // guards against a choice firing twice for the same card
                          // (e.g. countdown timeout + a click landing at the same moment,
                          // or a stray/late tap landing on the next card's button after re-render)
var timerVal = 30;
var timerHandle = null;
var retryMode = false;
var retryUsed = false;
var prevScores = {};
var paused = false;
var cameFromPause = null;
var aiTimeout = null;

/* ---------- Input guard against mistimed/"ghost" clicks ----------
   Root cause of the recurring "auto-selected answer on the next card"
   bug: it was never a state-management problem (chosenIndex/answerLocked
   were already reset correctly on every new card). It's a WebView timing
   issue — a tap's click event can resolve its target *after* the
   handler that fired it has already swapped screenEl.innerHTML for the
   next card, so the click lands on whatever new button now occupies
   that screen position instead of the button the user actually saw.
   Fix: any handler that can be reached from a screen transition ignores
   input for a short window right after a new screen renders. AI-driven
   auto-picks use longer delays (>=600ms) so they're never affected. */
var lastRenderAt = 0;
var INPUT_GUARD_MS = 350;
function withinInputGuard(source){
  const blocked = Date.now() - lastRenderAt < INPUT_GUARD_MS;
  if(blocked) console.warn('[input-guard] Ignored a call to', source, '— arrived', Date.now() - lastRenderAt, 'ms after the last render (likely a stray tap carried over from the previous screen).');
  return blocked;
}

/* ---------- DOM refs (bound after DOMContentLoaded) ---------- */
var screenEl, controlsEl, pauseBtnEl, pauseOverlayEl, pauseSubEl,
    langOverlayEl, langListEl, langPickerTitleEl, langPickerSubEl,
    howtoOverlayEl, splashEl,
    sfxToggleBtnEl, sfxVolumeSliderEl, musicToggleBtnEl, musicVolumeSliderEl;

document.addEventListener('DOMContentLoaded', () => {
  screenEl = document.getElementById('screen');
  controlsEl = document.getElementById('controls');
  pauseBtnEl = document.getElementById('pauseBtn');
  pauseOverlayEl = document.getElementById('pauseOverlay');
  pauseSubEl = document.getElementById('pauseSub');
  sfxToggleBtnEl = document.getElementById('sfxToggleBtn');
  sfxVolumeSliderEl = document.getElementById('sfxVolumeSlider');
  musicToggleBtnEl = document.getElementById('musicToggleBtn');
  musicVolumeSliderEl = document.getElementById('musicVolumeSlider');
  langOverlayEl = document.getElementById('langOverlay');
  langListEl = document.getElementById('langList');
  langPickerTitleEl = document.getElementById('langPickerTitle');
  langPickerSubEl = document.getElementById('langPickerSub');
  howtoOverlayEl = document.getElementById('howtoOverlay');
  splashEl = document.getElementById('splash');

  document.body.addEventListener('pointerdown', () => AudioEngine.unlock(), { once: true });

  setTimeout(hideSplash, 2200);
  splashEl.addEventListener('click', hideSplash);

  render();
});

function hideSplash(){
  if(!splashEl || splashEl.classList.contains('hide')) return;
  splashEl.classList.add('hide');
  AudioEngine.unlock();
  if(state === 'splash') goto('home');
}

/* ================= Utility ================= */
function shuffle(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function timerForDifficulty(diff){
  return diff === 'easy' ? 20 : diff === 'hard' ? 45 : 30;
}

/* Returns a copy of a card with its choice order shuffled, so the correct
   answer's on-screen position is randomized every time it's drawn/retried.
   The original CARD_POOL entry (and match.deck) is never mutated. */
function shuffledCard(card){
  return Object.assign({}, card, { choices: shuffle(card.choices) });
}

function buildDeck(length){
  let pool = CARD_POOL.slice();
  if(length === 'challenge'){
    const easy = shuffle(pool.filter(c => c.difficulty === 'easy')).slice(0, 4);
    const rest = pool.filter(c => c.difficulty !== 'easy');
    pool = rest.concat(easy);
  }
  const n = length === 'quick' ? 10 : 20;
  return shuffle(pool).slice(0, n);
}

/* ================= Render dispatcher ================= */
function render(){
  lastRenderAt = Date.now();
  clearInterval(timerHandle);
  clearTimeout(aiTimeout);
  if(state === "splash") return;
  if(state === "home") renderHome();
  else if(state === "multiplayerMenu") renderMultiplayerMenu();
  else if(state === "passPlaySetup") renderPassPlaySetup();
  else if(state === "soloSetup") renderSoloSetup();
  else if(state === "handoff") renderHandoff();
  else if(state === "card") renderCard();
  else if(state === "reveal") renderReveal();
  else if(state === "score") renderScore();
  else if(state === "matchEnd") renderMatchEnd();
  else if(state === "localMenu") LP.renderMenu();
  else if(state === "localHost") LP.renderHost();
  else if(state === "localJoin") LP.renderJoin();
  else if(state === "localLobby") LP.renderLobby();
  else if(state === "localGame") LP.renderGame();
  else if(state === "localResults") LP.renderResults();
  pauseOverlayEl.classList.remove('open');
  paused = false;
  pauseBtnEl.style.display = (state === "card" || state === "reveal") ? "flex" : "none";
}

function goto(next){ state = next; render(); }
function setControls(html){ controlsEl.innerHTML = html; }

/* ================= HOME SCREEN ================= */
function renderHome(){
  const t = T();
  const h = t.home;
  // Last word of a string gets italic emphasis, as in the design reference
  const emLast = (str) => { const i = str.lastIndexOf(' '); return i < 0 ? str : `${str.slice(0, i)} <em>${str.slice(i + 1)}</em>`; };
  const ico = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const soundIcon = AudioEngine.isOn()
    ? ico(`<path d="M11 5 6 9H3v6h3l5 4V5Z" fill="#fff"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6a8 8 0 0 1 0 12"/>`)
    : ico(`<path d="M11 5 6 9H3v6h3l5 4V5Z" fill="#fff"/><path d="m16 9 5 6M21 9l-5 6"/>`);
  const musicIcon = AudioEngine.Music.isOn()
    ? ico(`<path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="3" fill="#fff"/><circle cx="17.5" cy="16" r="3" fill="#fff"/>`)
    : ico(`<path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="3" fill="#fff"/><circle cx="17.5" cy="16" r="3" fill="#fff"/><path d="M3 3l18 18"/>`);
  const helpIcon = ico(`<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.7 2.3-2.7 4"/><circle cx="12" cy="17.6" r="0.6" fill="#fff"/>`);
  const communityLabel = (t.community && t.community.homeBtn) || 'Join our Community';

  const peopleArt = `
    <svg class="hm-art" viewBox="0 0 70 56" aria-hidden="true">
      <g stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">
        <circle cx="16" cy="12" r="7.5" fill="#FD7718"/>
        <path d="M3 38c0-10 6-15 13-15s13 5 13 15Z" fill="#FD7718"/>
        <circle cx="54" cy="12" r="7.5" fill="#8855D8"/>
        <path d="M41 38c0-10 6-15 13-15s13 5 13 15Z" fill="#8855D8"/>
        <circle cx="35" cy="26" r="8" fill="#05B3B4"/>
        <path d="M20 52c0-11 7-16 15-16s15 5 15 16Z" fill="#05B3B4"/>
      </g>
    </svg>`;
  const aiArt = `
    <svg class="hm-art" viewBox="0 0 70 56" aria-hidden="true">
      <rect x="3" y="3" width="36" height="36" rx="6" fill="#05B3B4" stroke="#fff" stroke-width="2.5"/>
      <g stroke="#FD7718" stroke-width="2" stroke-linecap="round"><path d="M10 3V0M18 3V0M26 3V0M3 11H0M3 19H0M3 27H0"/></g>
      <rect x="22" y="18" width="40" height="36" rx="6" fill="#8855D8" stroke="#fff" stroke-width="2.5"/>
      <g stroke="#FD7718" stroke-width="2" stroke-linecap="round"><path d="M30 54v-3M38 54v-3M46 54v-3M54 54v-3M62 28h3M62 36h3M62 44h3M30 18v3M38 18v3M46 18v3M54 18v3"/></g>
      <rect x="29" y="25" width="26" height="22" rx="3" fill="none" stroke="#FD7718" stroke-width="1.8"/>
      <text x="42" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="15" fill="#FD7718">AI</text>
    </svg>`;
  const handshake = `<svg class="hm-hs" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>`;

  screenEl.innerHTML = `
    <div class="screen-body home-body home-bg hm-root">
      <div class="hm-top">
        <button class="hm-circle" onclick="toggleSound()" aria-label="Sound effects">${soundIcon}</button>
        <button class="hm-circle" onclick="toggleMusic()" aria-label="Music">${musicIcon}</button>
        <button class="hm-circle" onclick="openHowTo()" aria-label="${h.howToPlay}">${helpIcon}</button>
        <span class="grow"></span>
        <button class="hm-lang" onclick="openLangPicker()"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>${langNames[currentLang]}</button>
      </div>

      <div class="grow hm-gap-top"></div>

      <div class="hm-title">
        <div class="hm-dots"><i style="background:#05B3B4"></i><i style="background:#8855D8"></i><i style="background:#FD7718"></i></div>
        <div class="hm-logo">${emLast('Karapatan Cards')}</div>
        <div class="hm-latin">Ignorantia legis non excusat</div>
        <div class="hm-eng">Ignorance of the law excuses no one</div>
      </div>

      <div class="hm-label">${emLast(h.modeTitle)}</div>

      <div class="hm-cards">
        <div class="hm-card" onclick="goto('multiplayerMenu')">
          ${peopleArt}
          <div class="hm-card-title">${h.modeMultiplayer}</div>
          <div class="hm-card-sub">${h.modeMultiplayerSub}</div>
        </div>
        <div class="hm-card" onclick="goto('soloSetup')">
          ${aiArt}
          <div class="hm-card-title">${h.modeSolo}</div>
          <div class="hm-card-sub">${h.modeSoloSub}</div>
        </div>
      </div>

      <div class="grow hm-gap-bottom"></div>

      <button class="hm-community" onclick="openCommunityPanel()">${handshake}<span>${communityLabel}</span></button>
      <div class="hm-strip"></div>
    </div>
  `;
  setControls('');
}

/* ================= MULTIPLAYER MENU (Pass & Play / Local Play) ================= */
function renderMultiplayerMenu(){
  const t = T();
  const h = t.home;
  homeSettings.mode = 'multiplayer';
  screenEl.innerHTML = `
    <button class="back-btn" onclick="goto('home')" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg></button>
    <div class="screen-body" style="padding-top:44px;">
      <div class="section-title">${h.modeMultiplayer}</div>
      <div class="mode-grid" style="flex-direction:column;">
        <div class="mode-card" onclick="goto('passPlaySetup')">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="2.5"/><circle cx="17" cy="8" r="2.5"/><path d="M4 18c0-2.5 1.5-4 3-4s3 1.5 3 4M14 18c0-2.5 1.5-4 3-4s3 1.5 3 4"/><path d="M9 14h6"/></svg>
          <div class="mc-title">${h.passPlayCardTitle}</div>
          <div class="mc-sub">${h.passPlayCardSub}</div>
        </div>
        <div class="mode-card" style="margin-top:10px;" onclick="LP.openMenu()">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="var(--navy)"/></svg>
          <div class="mc-title">${h.localPlayTitle}</div>
          <div class="mc-sub">${h.localPlaySub}</div>
        </div>
      </div>
    </div>
  `;
  setControls('');
}

/* ================= PASS & PLAY SETUP (includes Match Length) ================= */
function renderPassPlaySetup(){
  const t = T();
  const h = t.home;
  screenEl.innerHTML = `
    <button class="back-btn" onclick="goto('multiplayerMenu')" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg></button>
    <div class="screen-body" style="padding-top:44px;">
      <div class="section-title">${h.teamsTitle}</div>
      <div class="stepper" style="margin-bottom:10px;">
        <button onclick="stepTeamCount(-1)">−</button>
        <span class="val">${homeSettings.teamCount}</span>
        <button onclick="stepTeamCount(1)">+</button>
      </div>
      ${TEAM_POOL.slice(0, homeSettings.teamCount).map(tm => `
        <div class="team-row"><span><span class="team-dot" style="background:${tm.dot}"></span>${tm.name}</span><span style="color:#8A8FA8;font-size:12px;">${t.ready}</span></div>
      `).join('')}

      <div class="section-title">${h.lengthTitle}</div>
      <div class="pill-row" style="margin-bottom:6px;">
        <div class="pill ${homeSettings.length==='quick'?'active':''}" onclick="setLength('quick')">${h.quick}<span class="pill-sub">${h.quickSub}</span></div>
        <div class="pill ${homeSettings.length==='standard'?'active':''}" onclick="setLength('standard')">${h.standard}<span class="pill-sub">${h.standardSub}</span></div>
        <div class="pill ${homeSettings.length==='challenge'?'active':''}" onclick="setLength('challenge')">${h.challenge}<span class="pill-sub">${h.challengeSub}</span></div>
      </div>

      <div class="grow"></div>
      <button class="btn btn-outline" style="margin-bottom:8px;" onclick="openHowTo()">${h.howToPlay}</button>
      <button class="btn btn-primary" onclick="homeSettings.mode='multiplayer';startMatch()">${h.startGame}</button>
    </div>
  `;
  setControls('');
}

/* ================= SOLO VS AI SETUP ================= */
function renderSoloSetup(){
  const t = T();
  const h = t.home;
  screenEl.innerHTML = `
    <button class="back-btn" onclick="goto('home')" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m15 18-6-6 6-6"/></svg></button>
    <div class="screen-body" style="padding-top:44px;">
      <div class="section-title">${h.aiDifficultyTitle}</div>
      <div class="pill-row" style="margin-bottom:10px;">
        <div class="pill ${homeSettings.aiDifficulty==='easy'?'active':''}" onclick="setAiDifficulty('easy')">${h.easy}</div>
        <div class="pill ${homeSettings.aiDifficulty==='medium'?'active':''}" onclick="setAiDifficulty('medium')">${h.medium}</div>
        <div class="pill ${homeSettings.aiDifficulty==='hard'?'active':''}" onclick="setAiDifficulty('hard')">${h.hard}</div>
      </div>
      <div class="team-row" style="cursor:pointer;" onclick="toggleLearningAids()">
        <span>${h.learningToggleTitle}</span>
        <span style="color:${homeSettings.learningAids?'var(--sage)':'#C4C6D6'};font-weight:800;">${homeSettings.learningAids ? '●  ON' : '○  OFF'}</span>
      </div>
      <div style="font-size:10.5px;color:#8A8FA8;margin:2px 2px 10px;line-height:1.4;">${h.learningToggleSub}</div>

      <div class="section-title">${h.lengthTitle}</div>
      <div class="pill-row" style="margin-bottom:6px;">
        <div class="pill ${homeSettings.length==='quick'?'active':''}" onclick="setLength('quick')">${h.quick}<span class="pill-sub">${h.quickSub}</span></div>
        <div class="pill ${homeSettings.length==='standard'?'active':''}" onclick="setLength('standard')">${h.standard}<span class="pill-sub">${h.standardSub}</span></div>
        <div class="pill ${homeSettings.length==='challenge'?'active':''}" onclick="setLength('challenge')">${h.challenge}<span class="pill-sub">${h.challengeSub}</span></div>
      </div>

      <div class="grow"></div>
      <button class="btn btn-outline" style="margin-bottom:8px;" onclick="openHowTo()">${h.howToPlay}</button>
      <button class="btn btn-primary" onclick="homeSettings.mode='solo';startMatch()">${h.startGame}</button>
    </div>
  `;
  setControls('');
}

function setHomeMode(m){ homeSettings.mode = m; renderHome(); }
function setMpMode(m){ homeSettings.mpMode = m; renderHome(); }
function setLength(l){ homeSettings.length = l; render(); }
function setAiDifficulty(d){ homeSettings.aiDifficulty = d; render(); }
function toggleLearningAids(){ homeSettings.learningAids = !homeSettings.learningAids; render(); }
function stepTeamCount(delta){
  homeSettings.teamCount = Math.max(2, Math.min(4, homeSettings.teamCount + delta));
  render();
}
function toggleSound(){
  AudioEngine.toggle();
  if(state === 'home') renderHome();
}
function toggleMusic(){
  AudioEngine.Music.toggle();
  if(state === 'home') renderHome();
}

function openHowTo(){
  const t = T();
  howtoOverlayEl.querySelector('.pause-title').textContent = t.howToTitle;
  howtoOverlayEl.querySelector('.pause-sub').textContent = t.howToBody;
  howtoOverlayEl.querySelector('.btn-primary').textContent = t.closeBtn;
  howtoOverlayEl.classList.add('open');
}
function closeHowTo(){ howtoOverlayEl.classList.remove('open'); }

/* ================= START MATCH ================= */
function startMatch(){
  const deck = buildDeck(homeSettings.length);
  let teams;
  if(homeSettings.mode === 'solo'){
    teams = [
      { name: "You", dot: "#D2574B", score: 0, isAI: false },
      { name: "AI Opponent", dot: "#4E8FA6", score: 0, isAI: true, aiDifficulty: homeSettings.aiDifficulty }
    ];
  } else {
    teams = TEAM_POOL.slice(0, homeSettings.teamCount).map(tm => ({ ...tm, score: 0, isAI: false }));
  }
  match = {
    mode: homeSettings.mode,
    length: homeSettings.length,
    deck,
    cardIndex: 0,
    teams,
    currentTeam: 0,
    target: homeSettings.length === 'quick' ? 8 : 15,
    stealActive: false,
    suddenDeath: false,
    suddenDeathTeams: [],
    suddenPool: shuffle(CARD_POOL.filter(c => !deck.find(d => d.id === c.id))),
    learningAids: homeSettings.mode === 'solo' && homeSettings.learningAids,
    pendingScore: 0,
    stats: {}
  };
  teams.forEach(tm => { match.stats[tm.name] = { attempts: 0, correct: 0 }; });
  prevScores = {};
  cameFromPause = null;
  drawCard();
}

/* ================= HANDOFF SCREEN (pass-and-play transition) ================= */
/* Shown only in local multiplayer, between one human team's turn ending and
   the next human team's turn starting. It (a) blanks the previous team's
   answer off screen so it can't be seen while the phone is being passed,
   and (b) makes it unambiguous whose turn is starting next. */
function renderHandoff(){
  const t = T();
  const team = match.teams[match.currentTeam];
  screenEl.innerHTML = `
    <div class="screen-body" style="justify-content:center;align-items:center;text-align:center;">
      <div class="handoff-dot" style="background:${team.dot};width:64px;height:64px;border-radius:50%;margin-bottom:18px;"></div>
      <div style="font-size:13px;color:#8A8FA8;margin-bottom:4px;">${t.handoffTitle}</div>
      <div style="font-size:26px;font-weight:800;color:var(--navy);margin-bottom:10px;">${team.name}</div>
      <div style="font-size:12px;color:#8A8FA8;max-width:220px;margin-bottom:26px;">${t.handoffSub}</div>
      <button class="btn btn-primary" onclick="drawCard()">${t.handoffBtn}</button>
    </div>
  `;
  setControls('');
}


function drawCard(){
  if(withinInputGuard('drawCard')) return;
  if(match.cardIndex >= match.deck.length){
    // Safety net: extend the deck if a draw is requested with nothing queued
    const extra = match.suddenPool.length ? match.suddenPool.pop() : shuffle(CARD_POOL)[0];
    match.deck.push(extra);
  }
  match.currentOriginalCard = match.deck[match.cardIndex];
  currentCard = shuffledCard(match.currentOriginalCard);
  match.cardIndex++;
  timerVal = timerForDifficulty(currentCard.difficulty);
  chosenIndex = null;
  answerLocked = false;
  retryMode = false;
  retryUsed = false;
  AudioEngine.playDraw();
  goto('card');
}

/* ================= CARD SCREEN ================= */

function renderCard(){
  const t = T();
  const team = match.teams[match.currentTeam];
  const letters = ["A", "B", "C"];
  const twoCls = currentCard.choices.length === 2 ? 'two' : '';
  const opponents = match.teams.filter((tm, i) => i !== match.currentTeam);

  selectedChoice = null;
  screenEl.innerHTML = `
    <div class="screen-body" style="border-top:4px solid ${team.dot};padding-top:32px;">
      ${match.suddenDeath ? `<div class="toast danger" style="margin-bottom:8px;">${t.suddenDeathToast}</div>` : ''}
      ${match.stealActive ? `<div class="toast" style="margin-bottom:8px;">${t.stealToast}</div>` : ''}

      <div class="game-header-bar">
        <div class="turn-pill"><span class="team-dot" style="background:${team.dot};"></span>${team.isAI ? t.aiTurnLabel(team.name) : t.turnLabel(team.name)}</div>
        ${opponents.length ? `
          <div class="opponents-row compact">
            ${opponents.map(tm => `<span class="opp-chip"><span class="team-dot" style="background:${tm.dot};"></span>${tm.name}</span>`).join('')}
          </div>` : ''}
      </div>

      <div class="card-topline">
        <div class="card-label">${t.situationCardLabel}</div>
        <div class="badge-row">
          <span class="badge diff-${currentCard.difficulty}">${t["diff" + currentCard.difficulty[0].toUpperCase() + currentCard.difficulty.slice(1)]}</span>
          <span class="badge cat">${currentCard.category}</span>
        </div>
      </div>
      <div class="situation-card portrait">
        <div class="sc-head"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><line x1="5" y1="6" x2="19" y2="6"/><path d="M5 6 2 13a3 3 0 0 0 6 0Z"/><path d="M19 6l-3 7a3 3 0 0 0 6 0Z"/></svg><span>${t.situationCardLabel}</span></div>
        <div class="scenario">${currentCard.scenario}</div>
        <div class="sc-foot"><span class="sc-rule"></span><i>♦</i><span class="sc-rule"></span></div>
      </div>
      <div class="timer-wrap"><span class="timer" id="timerNum">${timerVal}s</span></div>
      <div class="timer-track"><div class="timer-fill" id="timerFill" style="width:100%;"></div></div>
      ${team.isAI ? `<div class="ai-indicator"><span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>&nbsp;${t.aiTurnLabel(team.name)}</div>` : ''}
      ${team.isAI ? '' : `<div class="hand-action"><div class="hand-hint" id="handHint">${t.inspectHint||''}</div><button class="btn btn-primary hand-confirm" id="handConfirm" onclick="confirmChoice()">${t.submitAnswer||'Submit this answer'}</button></div>`}
      <div class="choice-list hand-fan ${twoCls}">
        ${currentCard.choices.map((c, i) => `
          <button class="choice-card ${team.isAI ? 'disabled' : ''}" onclick="selectChoice(${i})">
            <span class="choice-tab">${letters[i]}<i>♦</i><span class="choice-expand" role="button" aria-label="Expand" data-i="${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span></span>
            <span class="choice-text">${c.text}</span>
          </button>`).join("")}
      </div>
    </div>
  `;
  startTimer();
  setControls('');

  if(team.isAI){
    const idx = AIOpponent.chooseIndex(currentCard, team.aiDifficulty);
    const delay = Math.min(AIOpponent.thinkTime(team.aiDifficulty), (timerVal - 1) * 1000);
    aiTimeout = setTimeout(() => { if(state === 'card') pickChoice(idx); }, Math.max(600, delay));
  }
}

/* Tap an answer card -> it lifts and enlarges (readable); tap it again,
   or press Submit, to lock it in. Submission itself is unchanged. */
var selectedChoice = null;
function selectChoice(i){
  if(answerLocked) return;
  if(selectedChoice === i) return;
  selectedChoice = i;
  document.querySelectorAll('.choice-list .choice-card').forEach(function(el, idx){
    el.classList.toggle('lifted', idx === i);
  });
  var list = document.querySelector('.choice-list'); if(list) list.classList.add('has-lift');
  var h = document.getElementById('handHint'), b = document.getElementById('handConfirm');
  if(h) h.style.display = 'none';
  if(b) b.classList.add('show');
}
function confirmChoice(){
  if(selectedChoice === null) return;
  var i = selectedChoice;
  selectedChoice = null;
  pickChoice(i);
}

function startTimer(){
  clearInterval(timerHandle);
  const fill = document.getElementById('timerFill');
  const num = document.getElementById('timerNum');
  const urgentAt = Math.min(10, Math.round(timerVal / 3));
  if(num) num.classList.toggle('urgent', timerVal <= urgentAt && timerVal > 0);
  const initial = timerVal;
  if(fill) fill.style.width = "100%";
  timerHandle = setInterval(() => {
    timerVal--;
    const f = document.getElementById('timerFill');
    const n = document.getElementById('timerNum');
    if(n){ n.textContent = timerVal + "s"; n.classList.toggle('urgent', timerVal <= urgentAt && timerVal > 0); }
    if(f){ f.style.width = Math.max(0, (timerVal / initial) * 100) + "%"; f.classList.toggle('urgent', timerVal <= urgentAt && timerVal > 0); }
    if(timerVal <= 0){ clearInterval(timerHandle); pickChoice(null); }
  }, 1000);
}

function pickChoice(index){
  if(withinInputGuard('pickChoice')) return;
  if(answerLocked) return; // already resolved for this card — ignore late/duplicate triggers
  answerLocked = true;
  clearInterval(timerHandle);
  clearTimeout(aiTimeout);
  chosenIndex = index;
  if(index !== null){
    // Briefly highlight the chosen card (lift + glow) and dim the others
    // before transitioning, so the player clearly sees what they picked.
    const cards = document.querySelectorAll('.choice-list .choice-card');
    cards.forEach((el, i) => el.classList.add(i === index ? 'selected' : 'dim'));
    setTimeout(() => { goto('reveal'); }, 420);
  } else {
    goto('reveal');
  }
}

/* ================= REVEAL SCREEN ================= */
function recordStat(team, rawPts){
  const s = match.stats[team.name];
  s.attempts++;
  if(rawPts === 2) s.correct++;
}

function renderReveal(){
  const t = T();
  const team = match.teams[match.currentTeam];
  const letters = ["A", "B", "C"];
  const rawPts = chosenIndex === null ? 0 : currentCard.choices[chosenIndex].pts;
  let pts = rawPts;
  if(match.stealActive) pts = Math.min(pts, 1);

  if(!retryMode){
    match.pendingScore = pts;
    recordStat(team, rawPts);
  }

  if(rawPts === 2) AudioEngine.playCorrect();
  else if(rawPts === 1) AudioEngine.playPartial();
  else AudioEngine.playWrong();

  const resultLabel = chosenIndex === null
    ? t.resultTimesUp
    : rawPts === 2 ? t.resultFullyCorrect : rawPts === 1 ? t.resultRightIdea : t.resultNotQuite;

  const canRetry = match.learningAids && !team.isAI && rawPts < 2 && !retryUsed;
  const twoCls = currentCard.choices.length === 2 ? 'two' : '';

  screenEl.innerHTML = `
    <div class="screen-body">
      <div class="choice-list flat ${twoCls}" style="margin-top:36px;margin-bottom:12px;">
        ${currentCard.choices.map((c, i) => {
          let cls = "dim";
          let mark = "";
          if(chosenIndex === i){
            cls = c.pts === 2 ? "correct" : c.pts === 1 ? "partial" : "wrong";
            mark = `<span class="choice-mark" style="background:${c.pts===2?'var(--sage)':c.pts===1?'var(--gold)':'var(--coral)'};">${c.pts===2?'✓':c.pts===1?'~':'✗'}</span>`;
          } else if(c.pts === 2){
            cls = "correct dim";
          }
          return `<div class="choice-card ${cls}">
                    <span class="choice-tab">${letters[i]}<i>♦</i></span>
                    ${mark}
                    <span class="choice-text">${c.text}</span>
                  </div>`;
        }).join("")}
      </div>
      <div class="answer-card${rawPts===0 && chosenIndex!==null ? ' shake' : ''}">
        <div class="answer-tag" style="background:${rawPts===2?'var(--sage)':rawPts===1?'var(--gold)':'var(--coral)'};">${resultLabel}</div>
        <div class="answer-text">${currentCard.answer}</div>
        <div class="legal-basis"><strong>${t.legalBasisLabel}</strong> ${currentCard.legal}</div>
      </div>
      <div style="font-size:11.5px;color:#5B6280;text-align:center;margin:10px 0 2px;">${t.earnsText(team.name, match.pendingScore)}</div>
      ${match.stealActive ? `<div class="toast">${t.stealToast}</div>` : ''}
      ${retryMode ? `<div class="toast info">Practice attempt — your original score for this turn stays the same.</div>` : ''}
      <div class="sticky-cta">
        ${canRetry ? `<button class="btn btn-outline" onclick="retryCard()">${t.tryAgainBtn}</button>` : ''}
        <button class="btn btn-primary" onclick="continueAfterReveal()">${t.continueBtn}</button>
      </div>
    </div>
    </div>
  `;
  setControls('');
  if(rawPts === 2) burstConfetti();

  if(team.isAI){
    aiTimeout = setTimeout(() => { if(state === 'reveal') continueAfterReveal(); }, 1700);
  }
}

function retryCard(){
  if(withinInputGuard('retryCard')) return;
  retryMode = true;
  retryUsed = true;
  chosenIndex = null;
  answerLocked = false;
  currentCard = shuffledCard(match.currentOriginalCard);
  timerVal = timerForDifficulty(currentCard.difficulty);
  goto('card');
}

function continueAfterReveal(){
  if(withinInputGuard('continueAfterReveal')) return;
  clearTimeout(aiTimeout);
  match.lastDiscarded = currentCard;
  applyScore(match.pendingScore);
}

function burstConfetti(){
  const phone = document.querySelector('.phone');
  if(!phone) return;
  const colors = ['#7B4FE0', '#7FA684', '#FFFFFF', '#D2574B', '#C9AEFA'];
  for(let i = 0; i < 18; i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = (8 + Math.random() * 84) + '%';
    p.style.top = (26 + Math.random() * 8) + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 180) + 'ms';
    phone.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

/* ================= SCORING / WIN CONDITIONS ================= */
/* Decides whether the next team needs a "pass the phone" handoff screen
   (local pass-and-play, human team up next) or can go straight to the
   draw screen (solo mode / AI's turn). */
function goToNextTurn(){
  const team = match.teams[match.currentTeam];
  if(match.mode === 'multiplayer' && !team.isAI) goto('handoff');
  else drawCard();
}

function nextTeam(){ match.currentTeam = (match.currentTeam + 1) % match.teams.length; }

function applyScore(pts){
  const team = match.teams[match.currentTeam];
  team.score += pts;

  if(match.suddenDeath){
    if(pts === 2) return endMatch(team, 'sudden');
    advanceSuddenDeath();
    return;
  }

  if(team.score >= match.target) return endMatch(team, 'target');

  if(pts === 0 && !match.stealActive){
    match.stealActive = true;
    nextTeam();
    chosenIndex = null;
    goToNextTurn();
    return;
  }
  match.stealActive = false;

  if(match.cardIndex >= match.deck.length) return handleDeckExhausted();

  nextTeam();
  goToNextTurn();
}

function handleDeckExhausted(){
  const max = Math.max(...match.teams.map(t => t.score));
  const leaders = match.teams.filter(t => t.score === max);
  if(leaders.length === 1) return endMatch(leaders[0], 'cards');

  match.suddenDeath = true;
  match.suddenDeathTeams = leaders;
  match.currentTeam = match.teams.indexOf(leaders[0]);
  if(match.suddenPool.length) match.deck.push(match.suddenPool.pop());
  chosenIndex = null;
  goToNextTurn();
}

function advanceSuddenDeath(){
  const teams = match.suddenDeathTeams;
  const idx = teams.indexOf(match.teams[match.currentTeam]);
  const next = teams[(idx + 1) % teams.length];
  match.currentTeam = match.teams.indexOf(next);
  if(match.cardIndex >= match.deck.length && match.suddenPool.length){
    match.deck.push(match.suddenPool.pop());
  }
  chosenIndex = null;
  goToNextTurn();
}

function endMatch(winnerTeam, reason){
  match.winner = winnerTeam;
  match.winReason = reason;
  AudioEngine.playWin();
  goto('matchEnd');
}

/* ================= SCOREBOARD (mid-match) ================= */
function renderScore(){
  const t = T();
  const sorted = [...match.teams].sort((a, b) => b.score - a.score);
  const topScore = sorted[0].score;
  const tied = sorted.filter(tm => tm.score === topScore).length > 1;
  screenEl.innerHTML = `
    <div class="screen-body">
      <div class="app-header">${t.scoreboardTitle}</div>
      <div class="target-note">Target: ${match.target} pts &nbsp;•&nbsp; Cards Left: ${match.deck.length - match.cardIndex} / ${match.deck.length}</div>
      ${sorted.map((tm, i) => `
        <div class="scoreboard-row ${i===0 && topScore>0 && !tied ? 'leader' : ''}">
          <span class="name">${i===0 && topScore>0 && !tied ? '<svg class="menu-icon crown" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1" stroke-linejoin="round"><path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/></svg>' : ''}<span class="team-dot" style="background:${tm.dot}"></span>${tm.name}${tm.isAI ? ' 🤖' : ''}</span>
          <span class="pts" id="pts-${tm.name.replace(/\s+/g,'')}">${prevScores[tm.name] || 0} pts</span>
        </div>`).join("")}
      <div style="font-size:11.5px;color:#5B6280;text-align:center;margin-top:4px;">${t.upNext(match.teams[match.currentTeam].name)}</div>
      <div class="grow"></div>
      <button class="btn btn-primary" onclick="backFromScoreboard()">${t.backToGameBtn}</button>
    </div>
  `;
  setControls(`<button class="btn btn-outline" style="width:auto;padding:10px 18px;display:inline-flex;align-items:center;gap:6px;" onclick="quitToHome()"><svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>${t.quitGameBtn}</button>`);
  match.teams.forEach(tm => {
    const el = document.getElementById('pts-' + tm.name.replace(/\s+/g,''));
    animateNumber(el, prevScores[tm.name] || 0, tm.score);
    prevScores[tm.name] = tm.score;
  });
}

function animateNumber(el, from, to){
  if(!el || from === to){ if(el) el.textContent = to + " pts"; return; }
  const duration = 500;
  const start = performance.now();
  function step(now){
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (to - from) * eased);
    el.textContent = val + " pts";
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ================= MATCH END SCREEN ================= */
function renderMatchEnd(){
  const t = T();
  const sorted = [...match.teams].sort((a, b) => b.score - a.score);
  const winner = match.winner;
  const subText = match.winReason === 'target' ? t.winSubTarget(match.target)
    : match.winReason === 'sudden' ? t.winSubSudden
    : t.winSubCards;

  const humanTeams = match.teams.filter(tm => !tm.isAI);
  const statBlocks = match.mode === 'solo' ? (() => {
    const s = match.stats["You"];
    const acc = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
    return `
      <div class="stat-row">
        <div class="stat-box"><div class="num">${match.teams[0].score}</div><div class="lbl">${t.scoreLabel}</div></div>
        <div class="stat-box"><div class="num">${acc}%</div><div class="lbl">${t.accuracyLabel}</div></div>
        <div class="stat-box"><div class="num">${s.attempts}</div><div class="lbl">${t.attemptsLabel}</div></div>
      </div>`;
  })() : '';

  screenEl.innerHTML = `
    <div class="screen-body">
      <div class="win-trophy"><svg viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold-soft)" stroke-width="0.5"><path d="M7 4h10v3a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" fill="none" stroke="var(--gold)" stroke-width="1.6" stroke-linecap="round"/><rect x="10" y="15" width="4" height="3" fill="var(--gold)"/><rect x="7" y="19" width="10" height="2.4" rx="1" fill="var(--gold)"/></svg></div>
      <div class="win-title">${t.winTitle(winner.name)}</div>
      <div class="win-sub">${subText}</div>
      ${statBlocks}
      <div class="app-header" style="margin-top:6px;">${t.scoreboardTitle}</div>
      ${sorted.map(tm => `
        <div class="scoreboard-row ${tm===winner?'leader':''}">
          <span class="name">${tm===winner ? '<svg class="menu-icon crown" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" stroke-width="1" stroke-linejoin="round"><path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/></svg>' : ''}<span class="team-dot" style="background:${tm.dot}"></span>${tm.name}${tm.isAI ? ' 🤖' : ''}</span>
          <span class="pts">${tm.score} pts</span>
        </div>`).join("")}
      <div class="grow"></div>
      <button class="btn btn-outline" style="margin-bottom:8px;" onclick="goto('home')">${t.homeBtn}</button>
      <button class="btn btn-primary" onclick="startMatch()">${t.playAgainBtn}</button>
    </div>
  `;
  setControls('');
  burstConfetti();
}

/* ================= PAUSE / QUIT ================= */
function quitToHome(){
  clearInterval(timerHandle);
  clearTimeout(aiTimeout);
  match = null;
  goto('home');
}

function openPause(){
  const t = T();
  paused = true;
  clearInterval(timerHandle);
  clearTimeout(aiTimeout);
  const team = match.teams[match.currentTeam];
  const subText = state === "card" ? t.timerOnHold(timerVal) : t.turnOnHold(team.name);
  pauseSubEl.textContent = subText;
  pauseOverlayEl.classList.add('open');
  var pcl = document.getElementById('pauseCommunityLabel');
  if(pcl) pcl.textContent = (t.community||{}).pauseBtn || 'Join Our Community';
  syncPauseAudioUI();
}

function syncPauseAudioUI(){
  if(sfxToggleBtnEl){
    sfxToggleBtnEl.textContent = AudioEngine.isOn() ? 'ON' : 'OFF';
    sfxToggleBtnEl.classList.toggle('is-off', !AudioEngine.isOn());
  }
  if(sfxVolumeSliderEl) sfxVolumeSliderEl.value = Math.round(AudioEngine.getSfxVolume() * 100);
  if(musicToggleBtnEl){
    musicToggleBtnEl.textContent = AudioEngine.Music.isOn() ? 'ON' : 'OFF';
    musicToggleBtnEl.classList.toggle('is-off', !AudioEngine.Music.isOn());
  }
  if(musicVolumeSliderEl) musicVolumeSliderEl.value = Math.round(AudioEngine.Music.getVolume() * 100);
}

function toggleSfxFromPause(){ AudioEngine.toggle(); syncPauseAudioUI(); }
function toggleMusicFromPause(){ AudioEngine.Music.toggle(); syncPauseAudioUI(); }
function onSfxVolumeInput(v){ AudioEngine.setSfxVolume(v/100); }
function onMusicVolumeInput(v){ AudioEngine.Music.setVolume(v/100); }

function closePause(){
  paused = false;
  pauseOverlayEl.classList.remove('open');
  if(state === "card" && timerVal > 0){
    const team = match.teams[match.currentTeam];
    startTimer();
    if(team.isAI){
      const idx = AIOpponent.chooseIndex(currentCard, team.aiDifficulty);
      const delay = Math.min(AIOpponent.thinkTime(team.aiDifficulty), (timerVal - 1) * 1000);
      aiTimeout = setTimeout(() => { if(state === 'card') pickChoice(idx); }, Math.max(600, delay));
    }
  }
}

function pauseGoScoreboard(){
  paused = false;
  pauseOverlayEl.classList.remove('open');
  cameFromPause = (state === "card" || state === "reveal") ? state : null;
  goto('score');
}

function backFromScoreboard(){
  if(cameFromPause === "card" || cameFromPause === "reveal"){
    const from = cameFromPause;
    cameFromPause = null;
    goto(from);
  } else {
    goto('card');
  }
}

function pauseQuit(){
  paused = false;
  pauseOverlayEl.classList.remove('open');
  quitToHome();
}

/* ================= LANGUAGE PICKER ================= */
function openLangPicker(){
  const t = T();
  langPickerTitleEl.textContent = t.langPickerTitle;
  langPickerSubEl.textContent = t.langPickerSub;
  langListEl.innerHTML = Object.keys(langNames).map(code => `
    <button class="btn ${code===currentLang ? 'btn-primary' : 'btn-outline'} pause-item" onclick="selectLang('${code}')">${langNames[code]}</button>
  `).join("");
  langOverlayEl.classList.add('open');
}
function closeLangPicker(){ langOverlayEl.classList.remove('open'); }
function selectLang(code){
  currentLang = code;
  closeLangPicker();
  render();
}
