# Karapatan Cards — Native App Project

This is a complete, ready-to-build **Capacitor** project. Capacitor wraps your
web app (in `www/`) in a real native shell, so it installs, runs, and is
submittable to the App Store / Play Store like any other app — no browser
address bar, works fully offline, has its own icon.

## What's new in this version
The single-file demo has been rebuilt into a full game on top of the same
visual language and mechanics you had (situation cards, timer, steal rule,
pause menu, scoreboard):

- **100-card pool** (`www/js/data.js`), tagged by category, difficulty
  (easy/medium/hard) and type (identification / mcq / roleplay), each with an
  explanation and legal basis. Every match deals 20 unique cards at random
  (10 for Quick mode), no repeats.
- **Match system**: first team to the target score wins immediately;
  otherwise the highest score wins when the deck runs out; a tie triggers a
  **sudden-death** round using bonus cards from the unused pool.
- **Solo vs AI ("Learning Mode")**: play against a computer opponent with
  Easy/Medium/Hard difficulty (it answers imperfectly, not like an oracle).
  Wrong answers can be retried for practice without affecting your score, and
  the end screen shows your accuracy %.
- **Multiplayer** pass-and-play for 2–4 local teams, unchanged in spirit from
  the original two-team demo.
- **Splash screen**, a synthesized **audio system** (correct/wrong/win chimes
  + ambient pad, Web Audio only — no bundled audio files — with an on/off
  toggle), a new app icon, and a cleaner mode/length picker on the home
  screen.
- Code is now split into modules — `js/data.js`, `js/translations.js`,
  `js/audio.js`, `js/ai.js`, `js/game.js`, `css/style.css` — instead of one
  1,300-line HTML file, so it's easier to extend.

**Language note:** the original had 4 fully-translated languages, each with
only 6 demo cards. Writing accurate legal/educational content for 100 cards
in 4 languages was out of scope for this pass, so the language switcher now
covers **English and Filipino** for all menus/UI, while the 100-card pool's
scenario/answer/legal text is in **English only**. The `www/js/data.js`
schema is straightforward to extend with a `translations` field per card if
you want to add Bisaya/Kapampangan content later — happy to help with that
as a follow-up.

## What I could not do here
I don't have a Mac (required for iOS builds) or the Android SDK/emulator in
this sandbox, and I can't hold or use your Apple/Google developer accounts.
So I can't produce a final signed `.ipa`/`.aab` file or upload it for you.
I also regenerated the source `resources/icon.png` / `icon.svg` but did not
regenerate every native mipmap/asset size — run `npx capacitor-assets
generate` (see "Icons & splash screen" below) to push the new icon into
`android/` and `ios/`.

## Before you build: change the app ID
Open `capacitor.config.json` and change `"appId": "org.karapatan.cards"` to
your own reverse-domain identifier (e.g. `org.yourorg.karapatancards`). This
must be unique — do this **before** your first build on each platform.

Also regenerate icons/splash from the new `resources/icon.svg` — see "Icons
& splash screen" below.

---

## Fastest way to get an installable .apk (no local setup)
This project includes a GitHub Actions workflow (`.github/workflows/build-apk.yml`)
that builds a debug APK for you automatically on GitHub's servers — you don't
need Android Studio, a Mac, or anything installed locally.

1. Create a new repository on [github.com](https://github.com) (public or
   private, either works) and push this whole folder to it:
   ```
   cd karapatan-app
   git init
   git add .
   git commit -m "Karapatan Cards app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. On GitHub, open your repo's **Actions** tab. A "Build Android APK" run
   will already be in progress (it triggers automatically on push). Wait
   for the green checkmark (a couple minutes).
3. Click into that run, scroll to **Artifacts**, and download
   `karapatan-cards-debug-apk` — that's a zip containing `app-debug.apk`.
4. Transfer the `.apk` to an Android phone (email it to yourself, Google
   Drive, USB, etc.) and tap it to install. Android will warn about
   "installing from unknown sources" the first time — that's expected for
   an app not yet on the Play Store; tap through to allow it.

This gives you a real, installable APK you can hand to testers today. It's
a **debug build**, not signed for the Play Store — for that, follow the
"Android — build & test" section below to generate a signed release bundle
in Android Studio instead.

**Note:** since this update replaced `www/index.html` (single file) with a
proper `www/` folder (`index.html` + `css/` + `js/`), the very first build
after pulling this update should run `npx cap sync` locally once (or just
push to GitHub — the Actions workflow runs `npm install`/`npx cap sync` for
you) so Android/iOS pick up the new file layout.

## Android — build & test (Windows/Mac/Linux)

1. Install [Android Studio](https://developer.android.com/studio) (free).
2. In a terminal, from this project folder: `npm install`
3. `npx cap sync android` — copies the new `www/` into the native project.
4. `npx cap open android` — opens the `android/` folder in Android Studio.
5. Let Gradle sync finish, then press the ▶ Run button with a device/emulator
   selected. The app installs and launches.
6. **To publish to Google Play:** Build > Generate Signed Bundle / APK,
   create a keystore (keep it safe — you need the same one for every future
   update), and follow Android Studio's prompts to produce an `.aab` file.
   Upload that to your [Google Play Console](https://play.google.com/console)
   listing (one-time $25 registration fee).

## iOS — build & test (Mac only, requires Xcode)

1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the Mac App Store (free).
2. In Terminal, from this project folder: `npm install`
3. `npx cap sync ios` — copies the new `www/` into the native project.
4. `npx cap open ios` — opens `ios/App/App.xcworkspace` in Xcode.
5. In Xcode, select your Team under Signing & Capabilities (needs a free or
   paid Apple ID) and a simulator or your plugged-in iPhone, then press ▶.
6. **To publish to the App Store:** you need an Apple Developer Program
   membership ($99/year). In Xcode: Product > Archive, then use the
   Organizer window to upload to App Store Connect, where you create the
   listing and submit for review.

## Making changes to the game itself
The app now lives in **`www/`**:
- `www/index.html` — screen shell, overlays (pause/language/how-to-play)
- `www/js/data.js` — the 100-card pool
- `www/js/translations.js` — UI strings (English/Filipino)
- `www/js/audio.js` — synthesized sound effects + ambient loop
- `www/js/ai.js` — AI opponent difficulty logic
- `www/js/game.js` — state machine, match rules, screens
- `www/css/style.css` — all styling/animation

Edit what you need, then run:

```
npx cap sync
```

This copies your changes into both the `android/` and `ios/` projects. Then
rebuild in Android Studio / Xcode as above.

## Icons & splash screen
A new source icon is already in `resources/icon.svg` / `resources/icon.png`
(1024×1024). To push it into both native projects:
1. Install the icon generator: `npm install -D @capacitor/assets`
2. Run `npx capacitor-assets generate`, then `npx cap sync`.
Full guide: https://capacitorjs.com/docs/guides/splash-screens-and-icons

## Offline support
The app loads no external fonts, audio files, or CDN resources — all sound
is synthesized in-browser with the Web Audio API — so it works with zero
internet connection out of the box.

## Project structure
```
www/index.html          ← app shell (screens, overlays)
www/css/style.css       ← styling & animation
www/js/data.js          ← 100-card pool
www/js/translations.js  ← UI strings (EN/FIL)
www/js/audio.js         ← sound engine (synthesized, no audio files)
www/js/ai.js            ← AI opponent logic
www/js/game.js          ← game state machine & match rules
capacitor.config.json   ← app ID, name, colors
resources/              ← source icon/splash for native asset generation
android/                ← native Android Studio project
ios/                    ← native Xcode project
package.json            ← Capacitor CLI dependency
```
