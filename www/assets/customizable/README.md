# Karapatan Cards — Customizable Visual Assets

All files below are real PNG files living in the app's actual project
folder — not embedded in CSS, JS, or base64. Replace any file with your own
edited version using the exact same filename, and it takes effect
immediately with no code changes.

**Location in the project:** `www/assets/customizable/`

---

## 1. `background.png`
- **Path:** `www/assets/customizable/background.png`
- **Dimensions:** 1080 × 1920px (portrait)
- **What it controls:** The home screen's background artwork — currently a
  very faint (~10% opacity) Statue of Liberty silhouette positioned
  lower-center, with an even fainter scales-of-justice motif in the upper
  right.
- **How it's referenced:** `www/css/style.css`, via `.home-bg` — a plain
  CSS `background-image` pointing at this exact file path. The subtlety is
  **baked directly into the PNG's own pixels** (not applied via a separate
  CSS opacity trick), so what you see when you open this file in an image
  editor is exactly what appears in the app — no hidden transparency
  surprises.
- **To replace:** Edit or redraw this file, export as PNG at the same
  filename, done. Keep the artwork subtle enough to sit behind white cards
  and navy text without hurting readability (see note below).

## 2. `statue-of-liberty.png`
- **Path:** `www/assets/customizable/statue-of-liberty.png`
- **Dimensions:** 600 × 1200px
- **What it is:** The Statue of Liberty element alone, transparent
  background, full opacity/full color — the "raw" source art. This exact
  artwork is what's embedded (faded down) inside `background.png`.
- **Status:** Provided as a standalone, reusable asset in case you want to
  reposition, resize, recolor, or recompose it differently than the current
  `background.png` layout. It isn't independently referenced by any code
  right now — it exists so you have the clean source art to work from.

## 3. `law-decoration.png`
- **Path:** `www/assets/customizable/law-decoration.png`
- **Dimensions:** 400 × 400px
- **What it is:** A simple scales-of-justice motif, transparent background.
  Same status as above — this is the clean source art for the faint motif
  already baked into the top-right of `background.png`. Not independently
  referenced by code yet, provided as reusable raw material.

## 4. `lady-liberty-guide.png`
- **Path:** `www/assets/customizable/lady-liberty-guide.png`
- **Dimensions:** 600 × 680px, transparent background
- **What it controls:** The friendly chibi character shown at the top of
  the "How to Play" popup — big head, simple smiling face, torch and
  tablet, full color (not faded like the background art, since this one is
  meant to be clearly visible in the foreground).
- **How it's referenced:** `www/index.html`, inside the `howtoOverlay`
  block, as a plain `<img src="assets/customizable/lady-liberty-guide.png">`.
- **To replace:** Same as above — edit, export as PNG, same filename.
- **Animation:** How to Play is currently a static popup with no video/motion
  — so no `lady-liberty-guide.mp4` was needed. If you want an animated
  version later, add `lady-liberty-guide.mp4` to this same folder and tell
  me — wiring in a `<video>` element is a small, separate code change.

---

## Honest limitations, stated plainly

1. **These illustrations are placeholder-quality**, hand-built from simple
   vector shapes in this environment (no access to real illustration
   software or a professional artist). They're clean, recognizable, and
   functional — but a real designer will produce noticeably better art.
   This asset structure is specifically designed to make swapping in that
   better art a pure drag-and-drop replacement.

2. **Typography:** section 13 of your brief asked for a distinctive
   classical/legal display font. I don't have internet access in this
   environment, so I could not download and bundle an actual custom font
   file (e.g. a Google Font like Cinzel or Playfair Display). What's
   implemented instead is a **system font fallback stack**
   (`Georgia, 'Times New Roman', 'Noto Serif', serif`) applied to the title
   and the Latin maxim — every phone already has one of these installed, so
   it works fully offline with zero extra files, and does read as more
   classical/serif than the previous rounded sans-serif title. If you want
   a specific downloaded custom font instead, send me the actual font file
   (`.ttf` or `.woff2`) and I'll wire it in via `@font-face` — that's a
   quick follow-up once you have the file.

## Readability safeguard already in place
`background.png`'s artwork sits at very low opacity specifically so it
never competes with text or buttons — and since the mode cards have a
solid white background, the artwork is fully hidden anywhere a card
overlaps it, only showing in empty margin space. If you redraw this file
with bolder/darker artwork, keep that same principle in mind (or lower the
opacity of your new art directly in your image editor before exporting).
