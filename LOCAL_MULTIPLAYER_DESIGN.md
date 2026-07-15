# Local Multiplayer — Design & Implementation Plan

## 0. Feature name
**"Local Play"** (menu label: **Local Play — no internet needed**).
Avoid "LAN Mode" (too technical for a civics-education app's audience) and
"Hotspot Mode" (too narrow — it also works on shared Wi-Fi with no hotspot
involved). "Local Play" reads clearly next to your existing "Pass & Play"
and "Solo vs AI" cards on the home screen.

---

## 1. Why this can't be pure JavaScript-in-the-WebView

Karapatan Cards today is 100% client-side JS running inside a Capacitor
WebView (no Node process, no build step beyond `cap sync`). A WebView can
open **outgoing** connections (`fetch`, `WebSocket` client) but it **cannot
open a listening socket** — so "host a game with no internet" requires one
small native piece:

| Role | Needs a native plugin? | Why |
|---|---|---|
| Host | **Yes** | Must run a listening server (WebSocket or raw TCP) other phones can dial into. |
| Client | No | `new WebSocket('ws://<host-ip>:<port>')` works fine from plain JS in the WebView. |

Recommended plugin: a small custom Capacitor plugin (~150 lines native code
per platform) exposing 3 methods to JS:
- `startServer(port)` → starts a WebSocket server (Android: `Java-WebSocket`
  or `NanoWSD`; iOS: `Network.framework` `NWListener` + a minimal WS framing
  lib, or `CocoaAsyncSocket`).
- `send(peerId, json)` / `broadcast(json)`
- `stopServer()`
Events surface back to JS via Capacitor's plugin event bridge:
`onPeerConnected`, `onPeerDisconnected`, `onMessage`.

This is the only native work required. Everything else (lobby, settings,
sync logic, UI) is plain JS and is already scaffolded in
`www/js/net-protocol.js`.

**Why WebSocket over WebRTC:** WebRTC data channels need a signaling
exchange (SDP offer/answer) before a connection exists, which normally
happens through an internet server. On a phone hotspot there's no such
server, so you'd have to hand-roll signaling via QR code/manual paste —
extra complexity for zero benefit, since you're on the same LAN segment
anyway and don't need NAT traversal. A raw WebSocket server on the host is
simpler, more debuggable, and is exactly what the client side already
supports for free.

---

## 2. Discovery: how a client finds the host

Ship two methods, ranked by convenience:

1. **Auto-discovery (preferred):** host advertises itself via **mDNS/NSD**
   — Android `NsdManager`, iOS `Bonjour` (`NWBrowser`/`NetServiceBrowser`) —
   under a custom service type, e.g. `_karapatan._tcp`. Clients browse for
   that service type and list any hosts found, no typing required. This
   also needs a small native shim (most Capacitor NSD community plugins
   cover this, or add it to the same custom plugin as the socket server).
2. **Manual fallback (always available, ship this first):** host displays
   its LAN IP + port as text **and as a QR code** (use a lightweight JS QR
   generator — no native code needed for the *host* to draw a QR, only the
   *client* needs camera access via `@capacitor/camera` or a JS
   barcode-detection lib to scan it). Client can also just type the IP.

Practical rollout order: ship **manual IP/QR entry in v1** (zero extra
native surface beyond the socket plugin), add **NSD auto-discovery in v2**
once the socket plugin is proven stable.

To get the host's own LAN IP to display, you need a small native call too
(`WifiManager` on Android, `getifaddrs` on iOS) — bundle it into the same
plugin.

---

## 3. Host → Lobby → Game → Results flow

```
HOST DEVICE                              CLIENT DEVICE
─────────────                            ─────────────
Tap "Local Play"
  → "Host Game"
  → native plugin starts WS server
  → show IP:port + QR + "enable hotspot?" tip
                                          Tap "Local Play" → "Join Game"
                                          → auto-discovery list OR
                                            manual IP entry / QR scan
                                          → WebSocket connect to host
                                          → send JOIN_REQUEST {teamName}
  → HostSession.handleJoinRequest
  → adds team, broadcasts LOBBY_STATE ──→ receives JOIN_ACCEPTED + LOBBY_STATE
  → lobby list updates on host screen     → shows lobby: all teams, ready state
                                          → player edits team name → SET_TEAM_NAME
                                          → player taps Ready → SET_READY{true}
  → lobby list updates for everyone ←──── (host re-broadcasts on every change)
  → host adjusts settings panel
    (settings re-broadcast on every
     change, so clients see them live)
  → "Start Game" button enables only
    when allReady() is true (2–4 teams,
    all ready, all connected)
Tap "Start Game"
  → builds deck per settings
  → HostSession.startGame(deck)
  → broadcasts GAME_START, then
    STATE_SYNC each round          ──→   renders draw/card/reveal screens
                                          driven entirely by STATE_SYNC +
                                          ROUND_RESULT messages
  → only the phone whose team is
    "up" enables the answer buttons;
    everyone else sees a read-only
    "waiting for Team X" view
                                          → active team taps an answer
                                            → SUBMIT_ANSWER{choiceIndex}
  → HostSession.resolveRound()
  → broadcasts ROUND_RESULT + new
    STATE_SYNC after the pause     ──→   all clients show reveal, then next round
  → repeats until target score /
    deck exhausted → GAME_END      ──→   all clients show results screen
```

Key architectural rule: **the host is the only authority.** Clients never
compute scores or decide correctness locally — they render whatever the
host sends and only ever *propose* actions (`SUBMIT_ANSWER`, `SET_READY`,
etc.). This avoids desync bugs and matches what `net-protocol.js` already
implements (`createHostSession` / `createClientSession`).

---

## 4. Lobby system

- Each connected phone is a **team slot** (`state.teams` in
  `net-protocol.js`), holding: `teamName`, `ready`, `connected`, `score`,
  a `dot` color auto-assigned in join order (reuses your existing
  `TEAM_POOL` color palette).
- **Team naming: recommendation below (section 6).**
- Ready button toggles `SET_READY`; the host's **Start Game** button is
  disabled until `allReady()` returns true (≥2 teams, all ready, all
  connected — implemented in the module).
- Host can tap-and-hold (or a kebab menu) on any team row to **Kick**,
  which sends `KICKED` to that phone and removes the slot; that client
  should show a plain "You were removed from the lobby by the host" screen
  and return to the Local Play menu.

---

## 5. Host settings panel — recommended fields

You asked for 8–12; here are 10, each with a solid, tested-feeling default
(matches your existing `timerForDifficulty` / `target` conventions):

| # | Setting | Type | Default | Notes |
|---|---|---|---|---|
| 1 | Max teams | stepper 2–4 | 4 | Locks lobby size |
| 2 | Timer per question | stepper (0/15/20/30/45s) | 30s | 0 = untimed |
| 3 | Number of rounds (deck size) | 10 / 20 / 30 | 20 | Reuses `buildDeck` sizing |
| 4 | Difficulty mix | Easy / Medium / Hard / Mixed | Mixed | Filters `CARD_POOL` |
| 5 | Category filter | dropdown of categories in `data.js`, or "All" | All | Nice for classroom use (teacher picks one topic) |
| 6 | Points: correct / partial | 2/1 (fixed) or editable | 2 / 1 | Keep editable but capped 1–5 to avoid absurd values |
| 7 | Steal rule | on/off | on | Matches existing single-device rule |
| 8 | Randomize choice order | on/off | on | See section 7 — should default on |
| 9 | Time between rounds | 3 / 5 / 8s | 4s | Breather + lets phones catch up on the sync |
| 10 | Target score (early win) | stepper 10–25 | 15 | Matches existing `match.target` |

Two more worth adding if you want the full 12:
11. **Allow reconnect within X seconds** (on/off) — see disconnection
    handling below.
12. **Lock teams after start** (on/off) — if off, a disconnected slot can
    be claimed by a new device joining mid-game (useful for classroom
    settings where a phone dies); if on, that slot just sits paused.

All of this maps directly onto `DEFAULT_SETTINGS` in `net-protocol.js` —
the settings panel is just a form that calls
`Object.assign(hostSession.settings, changes)` and re-broadcasts.

---

## 6. Naming system decision

**Recommendation: Team Naming Only (your Option A)** — each device sets
its own custom team name, full text input, no per-player names underneath.

Why: this game is explicitly team-based (2–4 teams sharing one card at a
time), not individual-player-based. Adding per-player names inside a team
adds a UI layer (who's "on" this team right now?) that this game doesn't
need — a team is just "whoever's holding the phone." If you later want
classroom rosters, you can extend a team's `teamName` field into a small
member list without changing the network protocol at all (it's already a
free-text field per peer).

---

## 7. Fixing the predictable answer pattern

Confirmed bug in the current build: `renderCard()` always rendered
`currentCard.choices` in the order they're written in `data.js`, and that
order is never shuffled — only card *order* (`buildDeck`) was randomized,
not *choice* order. Card 1 and Card 2, for example, both list the correct
answer first ("Yes...", pts:2 as index 0), so a player can learn "the
first option is usually right" within a few turns.

**Fix implemented (already patched into `game.js`):**

```js
function shuffledCard(card){
  return Object.assign({}, card, { choices: shuffle(card.choices) });
}

function drawCard(){
  ...
  match.currentOriginalCard = match.deck[match.cardIndex];   // untouched original
  currentCard = shuffledCard(match.currentOriginalCard);      // fresh shuffle every draw
  ...
}

function retryCard(){
  ...
  currentCard = shuffledCard(match.currentOriginalCard);      // reshuffled on retry too
  ...
}
```

Why this design:
- `CARD_POOL`/`match.deck` are **never mutated** — `shuffledCard` returns a
  copy, so the underlying data stays deterministic and re-playable.
- Reshuffling happens **every time a card is drawn or retried**, not once
  per app load, so there's no session-level bias either.
- Works identically for 2-choice (Yes/No) and 3-choice (MCQ) cards — it's
  just `shuffle()` on whatever length the `choices` array has.
- The AI opponent (`ai.js`) already resolves its pick by scanning
  `card.choices` for the target `pts` value and returning that *index* —
  it was already shuffle-safe and needed no changes.
- Same fix applies 1:1 to the LAN multiplayer path: `net-protocol.js`'s
  `nextRound()` calls the identical shuffle before broadcasting the card,
  guarded by the `randomizeChoiceOrder` setting.

---

## 8. Pass-and-play improvements (implemented)

Added a new **handoff screen** between one team's turn ending and the next
team's turn starting (local pass-and-play only — skipped entirely for
Solo vs AI and for AI turns in general):

- `goToNextTurn()` replaces the old direct `goto('draw')` calls after
  `nextTeam()`. It checks: human team next + multiplayer mode → show
  handoff; otherwise go straight to draw (AI doesn't need to "pass a
  phone").
- The handoff screen shows the next team's color + name big, a short
  "make sure no one else can see the screen" reminder, and requires a
  tap on **"We're Ready"** before the next card is drawn — this both
  clears the previous reveal off-screen and gives a clear, deliberate
  turn boundary instead of an instant cut.
- Active-team color indicator added in two places: a colored dot next to
  the turn label on the draw screen, and a colored top border + dot on
  the situation-card screen, so at a glance (even mid-argument at the
  table) everyone can see whose turn it is without reading text.

---

## 9. Disconnection / reconnect handling

- **In lobby:** a dropped connection just removes that team slot
  (`handleDisconnect` in `net-protocol.js`), lobby re-broadcasts.
- **Mid-game (recommended default, `allowReconnect: true`):** the slot is
  marked `connected:false` but **keeps its score and turn position**. The
  host shows a small "Team X disconnected — waiting to reconnect" banner
  instead of ending the match. If the same device reconnects (matched by
  a persisted device ID stored in `localStorage`/Capacitor Preferences),
  it's re-attached to its slot. If `allowReconnect` is off, or the setting
  "Lock teams after start" is off, the slot can be freed for a new joiner.
- **Host disconnects / app is killed:** unavoidable single point of
  failure of an authoritative-host model — surface this plainly ("Host
  left the game") rather than trying to migrate hosting, which is not
  worth the complexity for a party/classroom game.

---

## 10. Extra improvements worth considering

**Multiplayer experience**
- "Waiting for Team X" screen on non-active phones during their turn, so
  idle players aren't staring at a stale card.
- Post-round mini recap broadcast to all phones (who answered what),
  since in Local Play the other teams can't see the active phone's screen
  the way pass-and-play players can.

**Fairness / replayability**
- Weighted-avoid-repeat card selection across sessions (track recently
  seen card IDs in Preferences, deprioritize them for N matches).
- True per-draw shuffling (section 7) already removes detectable
  positional bias over a full match — no extra anti-streak logic needed.
- A simple **classroom/teacher mode**: category filter (already in
  settings) + a post-match CSV/export of scores per team for the
  facilitator.

**Performance / reliability**
- Keep `STATE_SYNC` payloads small (already true — cards are tiny JSON);
  never send the full `CARD_POOL` over the wire, only the current card.
- Heartbeat (`PING`/`PONG`, already stubbed in the protocol) every ~5s so
  the host can detect a silently-dead Wi-Fi socket instead of waiting for
  a TCP timeout.
- Keep the WebSocket server single-threaded/event-driven (both
  Java-WebSocket and NWListener are) — no locking needed since
  `HostSession` processes one message at a time.

---

## 11. File map

| File | Status |
|---|---|
| `www/js/net-protocol.js` | **New — implemented.** Message schema, `HostSession`, `ClientSession`. Transport-agnostic. |
| `www/js/game.js` | **Patched.** Choice-order randomization fix, handoff screen, active-team color indicators. |
| `www/js/translations.js` | **Patched.** Added `handoffTitle/handoffSub/handoffBtn` (EN + FIL). |
| `www/css/style.css` | **Patched.** Handoff pulse animation. |
| *(new, not yet built)* native socket + NSD plugin | Required before Local Play can run on-device — see sections 1–2. |
| *(new, not yet built)* `local-play-ui.js` + lobby/settings screens | UI layer that wires `HostSession`/`ClientSession` into `screenEl.innerHTML` renders, following the same pattern as `renderHome`/`renderDraw` in `game.js`. |
