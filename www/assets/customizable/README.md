# Karapatan Cards — Customizable Visual Assets

All files below are real PNG files living in the app's actual project
folder — not embedded in CSS, JS, or base64. Replace any file with an
edited version using the exact same filename, and it takes effect
immediately with no code changes required.

**Location in the project:** `www/assets/customizable/`

---

## 1. `background.png` — ✅ your real artwork, current version
- **Path:** `www/assets/customizable/background.png`
- **Dimensions:** 592 × 1824px, tall "poster" format with its own
  decorative border already built into the art (art-deco corner brackets,
  full frame)
- **What it controls:** The home screen background — the Philippine
  sun-and-stars motif, Lady Justice with sword and scales, the Philippine
  map, clouds, an open book on an ionic column, and a "Constitutional
  Placement" scroll, all in the app's purple/lavender palette.
- **How it's displayed:** `background-size: contain` (shows the *entire*
  illustration, no cropping) rather than `cover`. This matters because the
  image is unusually tall/narrow — `cover` would have cropped roughly 39%
  off the top, cutting off the sun/stars motif entirely. Since this
  artwork is a complete, self-framed poster, `contain` (with some empty
  margin on the left/right) is the correct fit.

### Two bugs fixed along the way, worth knowing about
1. **Relative path bug:** the CSS file lives at `www/css/style.css`, and
   `url()` paths inside a CSS file resolve relative to the *CSS file's own
   location*, not `index.html`. The path had to be
   `../assets/customizable/background.png` (stepping up out of `css/`
   first), not `assets/customizable/background.png`. If you ever add more
   background-referencing CSS rules yourself, remember this — it's an easy
   mistake to repeat.
2. **Legibility over a busy image:** this artwork is much more detailed
   than a typical subtle background wash, so plain text sitting directly
   on top of it (especially over the sun-rays area, and over the
   scroll/scales area near the bottom) was genuinely harder to read. Fix:
   the title/maxim text now sits on a semi-transparent frosted-white
   backdrop (`.home-title-block`), and the "How to Play" button — which
   used to be fully transparent/outline-only — now has a mostly-solid
   white fill (`.home-howto-btn-solid`) so the artwork doesn't show
   distractingly through its text. Both were verified with an actual
   rendered mockup before shipping, not just assumed.

## 2. `lady-liberty-guide.png` — ✅ your real artwork
- **Path:** `www/assets/customizable/lady-liberty-guide.png`
- **Dimensions:** 862 × 991px, transparent PNG
- **What it controls:** The chibi character at the top of the "How to
  Play" popup.
- Note: the file as originally sent had a solid opaque black background
  (no alpha channel) — I extracted the character via a feathered
  chroma-key and installed the transparent result under this filename.
  For future re-exports, export directly with a transparent background if
  your tool supports it — cleaner than needing this extraction step.

## 3. `statue-of-liberty.png` — still my rough placeholder
- **Path:** `www/assets/customizable/statue-of-liberty.png`
- 600 × 1200px. Not referenced by any code — raw standalone source art
  only, left over from the first placeholder version.

## 4. `law-decoration.png` — still my rough placeholder
- **Path:** `www/assets/customizable/law-decoration.png`
- 400 × 400px. Same status as above — unused placeholder, safe to ignore
  or delete if you don't need it.

---

## Typography note (unchanged)
Title and Latin maxim use a system-font fallback stack (`Georgia, 'Times
New Roman', 'Noto Serif', serif`) — no internet access in this environment
to download a custom font file. Send an actual `.ttf`/`.woff2` file
whenever you have one and it can be wired in via `@font-face`.
