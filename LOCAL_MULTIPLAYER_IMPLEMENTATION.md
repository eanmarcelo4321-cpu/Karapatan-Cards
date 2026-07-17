# Local Multiplayer — Implementation Notes

This implements "Local Play" end to end, on top of the existing
`www/js/net-protocol.js` (unchanged — used as-is, per the original
requirement). Organized by phase, matching the request:

## Phase 1 — Transport + manual IP (foundation)
- `www/js/net-transport.js` — new. Defines `createHostTransport()` and
  `createClientTransport()`, matching the `{send, broadcast, onMessage,
  onPeerLeave}` shape `net-protocol.js` expects.
- **Important correction vs. the original brief:** a WebView (which is all
  this app is, client-side) can open *outgoing* WebSocket connections but
  cannot open a *listening* socket. So "Phase 1, JS-based if supported"
  isn't achievable for the **host** side — only the **client** side is
  pure JS (`new WebSocket(...)`, no native code). Hosting has always
  needed the native plugin, even for the manual-IP first pass. This
  matches what `LOCAL_MULTIPLAYER_DESIGN.md` (included with the upload)
  already concluded in section 1 — I followed that rather than re-deriving
  it. Practical effect: Join works today in a plain desktop browser
  against a phone that's hosting; Host requires the native build.
- Manual IP entry UI is in `www/js/local-play-ui.js` (`localJoin` screen) —
  works today, no discovery needed.

## Phase 2 — Native plugin (Android + iOS)
Both platforms implement the same JS-facing API
(`startServer/stopServer/send/broadcast/getLocalIP/startAdvertising/
stopAdvertising/startDiscovery/stopDiscovery`), called from
`net-transport.js`.

- **Android** — `android/app/src/main/java/org/karapatan/cards/localmultiplayer/`
  - `MiniWebSocketServer.java` — hand-rolled RFC 6455 WebSocket server
    (`ServerSocket` + one thread per connection). No external dependency
    was added (no `Java-WebSocket` library), so nothing needs to resolve
    from Maven on first build.
  - `LocalMultiplayerPlugin.java` — the Capacitor plugin: server lifecycle,
    local IP via `NetworkInterface`, and NSD (`NsdManager`) advertising +
    discovery.
  - `MainActivity.java` — registers the plugin.
  - `AndroidManifest.xml` — added `ACCESS_WIFI_STATE`,
    `ACCESS_NETWORK_STATE`, `CHANGE_WIFI_MULTICAST_STATE`, and
    `NEARBY_WIFI_DEVICES` (Android 13+, for reliable NSD on some OEM
    builds — the app doesn't request it at runtime yet; see Known gaps).

- **iOS** — `ios/App/App/LocalMultiplayer/`
  - `MiniWebSocketServer.swift` — hand-rolled RFC 6455 server on
    `Network.framework` (`NWListener`/`NWConnection`), SHA-1 via
    `CryptoKit`. No CocoaPods dependency added.
  - `LocalMultiplayerPlugin.swift` + `LocalMultiplayerPlugin.m` — the
    plugin (`.m` uses the `CAP_PLUGIN` macro, which is how Capacitor
    registers locally-defined Swift plugins — see
    https://capacitorjs.com/docs/plugins/ios#export-to-capacitor). IP via
    `getifaddrs`; advertising/discovery via classic `NetService`/
    `NetServiceBrowser` (Bonjour).
  - `Info.plist` — added `NSLocalNetworkUsageDescription` and
    `NSBonjourServices` (`_karapatan._tcp.`), required for the local
    network permission prompt on iOS 14+.

## Phase 3 — UI (Host / Join / Lobby / networked play)
- `www/js/local-play-ui.js` — new `LP` module, wired into `game.js`'s
  existing `state`/`goto()`/`render()` pattern with six new states:
  `localMenu`, `localHost`, `localJoin`, `localLobby`, `localGame`,
  `localResults`. Reuses existing CSS classes (`situation-card`,
  `choice-card`, `scoreboard-row`, etc.) so it matches the app's visual
  language; a few small additions in `css/style.css` (`.lp-input`, a
  `:disabled` button state).
- Entry point: a "Local Play — no internet needed" button on the home
  screen, under the existing mode picker.
- Host screen shows IP:port (manual fallback) and starts Bonjour/NSD
  advertising automatically (auto-discovery). Join screen lists
  auto-discovered hosts when available and always offers manual entry.
- Lobby: team list, ready state, team naming (client), Start Game
  (host, enabled only once `net-protocol.js`'s own `allReady()` is true).
- Gameplay: driven entirely by `STATE_SYNC`/`ROUND_RESULT`/`GAME_END` —
  the host device is a facilitator/spectator (it doesn't join as a team
  itself, matching "Host = server, Joiners = clients" from the brief);
  only the phone whose team is active gets live answer buttons, everyone
  else sees a "waiting for Team X" state.

## Known gaps / what I couldn't verify here
- **No build/emulator in this environment** — I can't run `./gradlew
  assembleDebug` or open Xcode here (no Android SDK, no Mac, no network
  access in this sandbox), so none of this has been compiled or run on a
  device. I did syntax-check every JS file with `node --check` and
  brace-balance-checked the native files, but a real Android
  Studio/Xcode build is the next step before testing between two phones.
- **NEARBY_WIFI_DEVICES runtime request** isn't implemented — the
  manifest permission is declared, but Android 13+ may need it granted at
  runtime for NSD to reliably see other hosts on some devices. Manual IP
  entry doesn't depend on this and works regardless.
- **No reconnect-by-device-ID** — `net-protocol.js`'s `allowReconnect`
  marks a slot `connected:false` on drop, but nothing yet re-attaches a
  returning device to its old slot (section 9 of the design doc). A
  disconnected client currently has to rejoin as a new team.
- **No live per-question timer UI** in networked play (the single-device
  game has one; `settings.timerSeconds` exists in the protocol but
  nothing enforces or displays a countdown yet) — scoped out to keep this
  deliverable to a reasonable size.
- **Settings panel isn't built** — hosts currently start with
  `NetProtocol.DEFAULT_SETTINGS` as-is; the 10-field settings panel from
  `LOCAL_MULTIPLAYER_DESIGN.md` section 5 is a natural next addition (it
  maps directly onto `hostSession.settings`).
