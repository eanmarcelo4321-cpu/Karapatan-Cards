# Karapatan Cards — Customizable Visual Assets

All files below are real PNG files living in the app's actual project
folder — not embedded in CSS, JS, or base64. Replace any file with an
edited version using the exact same filename, and it takes effect
immediately with no code changes required.

**Location in the project:** `www/assets/customizable/`

---

## 1. `background.png` — ✅ current version, full-screen cover
- **Path:** `www/assets/customizable/background.png`
- **Dimensions:** 704 × 1520px (aspect ratio ≈ 1:2.16 — close to a real
  phone screen shape, designed for edge-to-edge coverage)
- **What it controls:** The home screen background — sun/stars/clouds
  header, an ornate light-purple banner (designed as the title zone),
  Lady Justice with scales, florals, Philippine map, an open book on an
  ionic column, and the "Constitutional Parchment" scroll.
- **Display mode:** `background-size: cover` (fills the entire screen,
  no letterboxing) with `background-position: center top` — this crops
  only 0–7% off the very bottom on most phones, keeping the distinctive
  sun/stars header fully intact. This is a genuine improvement over the
  previous version: that one needed `contain` (with visible side margins)
  because its aspect ratio was much taller/narrower; this one is properly
  proportioned for true full-bleed coverage.

### Layout alignment
The designer's artwork includes a light banner zone (~20% down) clearly
intended for the title, and mocked-up "Multiplayer"/"Solo vs AI" labels
(~45–50% down) showing where the mode-select cards should sit. I adjusted
the app's internal spacing (`game.js`, the flex spacer above the title
block) so the real title and the real interactive cards now land in those
same zones — verified with an actual rendered composite before shipping,
not just eyeballed. If future artwork changes those zones' position, this
spacer value (currently `flex:0.4` on the top spacer) is the one number to
retune to match.

## 2. `lady-liberty-guide.png` — ✅ your real artwork
- **Path:** `www/assets/customizable/lady-liberty-guide.png`
- 862 × 991px, transparent PNG. The chibi character in the "How to Play"
  popup. (Note: originally sent with an opaque black background — I
  extracted the transparent version via chroma-key. Future exports:
  export directly with transparency if your tool supports it.)

## 3. `statue-of-liberty.png` / `law-decoration.png` — unused placeholders
Still my original rough placeholder art, not referenced by any code.
Safe to ignore or delete.

---

## Typography note (unchanged)
Title and Latin maxim use a system-font fallback stack (`Georgia, 'Times
New Roman', 'Noto Serif', serif`) — no internet access in this environment
to download a custom font file. Send an actual `.ttf`/`.woff2` file
whenever you have one and it can be wired in via `@font-face`.
