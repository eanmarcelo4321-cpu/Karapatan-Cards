# Karapatan Cards — Native App Project

This is a complete, ready-to-build **Capacitor** project. Capacitor wraps your
web app (in `www/index.html`) in a real native shell, so it installs, runs,
and is submittable to the App Store / Play Store like any other app — no
browser address bar, works fully offline, has its own icon.

The game logic, scoring, timer, pause menu, and all four languages
(English, Filipino, Bisaya, Kapampangan) are untouched from your original —
only the outer "phone mockup" demo chrome was removed so it now fills the
whole real screen.

## What I could not do here
I don't have a Mac (required for iOS builds) or the Android SDK/emulator in
this sandbox, and I can't hold or use your Apple/Google developer accounts.
So I can't produce a final signed `.ipa`/`.aab` file or upload it for you.
What's here is the full project, pre-scaffolded for both platforms, so
you (or a developer) can open it and build immediately.

## Before you build: change the app ID
Open `capacitor.config.json` and change `"appId": "org.karapatan.cards"` to
your own reverse-domain identifier (e.g. `org.yourorg.karapatancards`). This
must be unique — do this **before** your first build on each platform.

Also swap in real icons/splash screens — see "Icons & splash screen" below.

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

## Android — build & test (Windows/Mac/Linux)

1. Install [Android Studio](https://developer.android.com/studio) (free).
2. In a terminal, from this project folder: `npm install`
3. `npx cap open android` — this opens the `android/` folder in Android Studio.
4. Let Gradle sync finish, then press the ▶ Run button with a device/emulator
   selected. The app installs and launches.
5. **To publish to Google Play:** Build > Generate Signed Bundle / APK,
   create a keystore (keep it safe — you need the same one for every future
   update), and follow Android Studio's prompts to produce an `.aab` file.
   Upload that to your [Google Play Console](https://play.google.com/console)
   listing (one-time $25 registration fee).

## iOS — build & test (Mac only, requires Xcode)

1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the Mac App Store (free).
2. In Terminal, from this project folder: `npm install`
3. `npx cap open ios` — opens `ios/App/App.xcworkspace` in Xcode.
4. In Xcode, select your Team under Signing & Capabilities (needs a free or
   paid Apple ID) and a simulator or your plugged-in iPhone, then press ▶.
5. **To publish to the App Store:** you need an Apple Developer Program
   membership ($99/year). In Xcode: Product > Archive, then use the
   Organizer window to upload to App Store Connect, where you create the
   listing and submit for review.

## Making changes to the game itself
All game content and logic lives in **`www/index.html`** — the cards,
translations, scoring rules, everything. Edit that file, then run:

```
npx cap sync
```

This copies your changes into both the `android/` and `ios/` projects. Then
rebuild in Android Studio / Xcode as above.

## Icons & splash screen
Right now both platforms use Capacitor's default placeholder icon. To set
your own:
1. Make a 1024×1024 PNG logo (no transparency for iOS) and a simple square
   splash image.
2. Install the icon generator: `npm install -D @capacitor/assets`
3. Put your source images in a `resources/` folder as `icon.png` and
   `splash.png`.
4. Run `npx capacitor-assets generate`, then `npx cap sync`.
Full guide: https://capacitorjs.com/docs/guides/splash-screens-and-icons

## Offline support
The app already loads no external fonts or CDN resources, so it works with
zero internet connection out of the box — no extra setup needed.

## Project structure
```
www/index.html         ← the actual app (edit this for any content/logic changes)
capacitor.config.json  ← app ID, name, colors
android/                ← native Android Studio project
ios/                    ← native Xcode project
package.json            ← Capacitor CLI dependency
```
