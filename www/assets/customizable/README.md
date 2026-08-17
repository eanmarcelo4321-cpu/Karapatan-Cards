# Karapatan Cards — Customizable Visual Assets

**Status: your designer's real artwork is now installed and live** — this
is no longer the placeholder version. Both `background.png` and
`lady-liberty-guide.png` below are the actual illustrated assets you sent
back, wired into the app with zero code changes required (exactly the
workflow this was built for).

All files are real PNGs living in the app's actual project folder — not
embedded in CSS, JS, or base64. Replace any file with an edited version
using the exact same filename, and it takes effect immediately.

**Location in the project:** `www/assets/customizable/`

---

## 1. `background.png` — ✅ now your real artwork
- **Path:** `www/assets/customizable/background.png`
- **Dimensions:** 375 × 666px, transparent PNG
- **What it controls:** The home screen background — your illustrated
  Lady Justice (scales, blindfold, sword) on a soft purple gradient with
  subtle wave shapes and sparkle accents.
- **Note:** one small fix on my end — the file you sent was named
  `backround.png` (missing a "k"); I saved it into the project as
  `background.png` since that's the exact filename the code references.
  If you send future updates, either filename spelling arriving from you
  is fine — I'll always place it at the correct path.

## 2. `lady-liberty-guide.png` — ✅ now your real artwork (with one fix)
- **Path:** `www/assets/customizable/lady-liberty-guide.png`
- **Dimensions:** 862 × 991px, transparent PNG
- **What it controls:** The chibi character shown at the top of the
  "How to Play" popup.
- **A real technical issue I fixed:** the file you sent had a **solid
  opaque black background baked into the image** (no transparency
  channel at all) — as delivered, it would have shown as an ugly black
  rectangle behind the character inside the light-colored tutorial popup.
  I extracted the character from the black background using a feathered
  chroma-key (verified visually — clean edges, no color fringing) and
  saved the transparent result under the same filename. **If your
  designer re-exports this in the future, please export with a
  transparent background directly** (in most design tools: "Export as
  PNG" with the background layer hidden/deleted, not filled black) —
  that avoids this extraction step being needed at all and preserves
  more of the original edge quality.

## 3. `statue-of-liberty.png` — still my placeholder
- **Path:** `www/assets/customizable/statue-of-liberty.png`
- **Dimensions:** 600 × 1200px
- Not yet replaced. This is the standalone raw statue art (same simple
  vector style as my first `background.png` attempt) — not currently
  referenced by any code, provided as reusable source material only.

## 4. `law-decoration.png` — still my placeholder
- **Path:** `www/assets/customizable/law-decoration.png`
- **Dimensions:** 400 × 400px
- Same status as above — a simple scales-of-justice motif, not
  independently referenced by code, provided as reusable source material.

---

## Typography note (unchanged from before)
Still using the system-font fallback stack (`Georgia, 'Times New Roman',
'Noto Serif', serif`) for the title and Latin maxim — I have no internet
access in this environment to download a custom font file. Send me an
actual `.ttf`/`.woff2` file whenever you have one and I'll wire it in via
`@font-face`.

