# Answer Choice Quality — Guidelines & Linter

## The problem, confirmed
Running `tools/content-lint.js` against the current 100-card deck:

```
Checked 100 cards. 60 flagged.
```

Every one of the 60 multiple-choice cards has the correct answer as the
single longest option — a player can win by picking "whichever answer is
longest" without reading the scenario. This document explains how to fix
that, card by card, without weakening or changing what each card actually
teaches about the law.

**Important boundary:** this app cites specific statutes (RA 9231, PD
603, the Labor Code, etc.) as the reason an answer is correct. Rewriting
wrong-answer wording is safe (it's fiction — a plausible bad choice).
Rewriting the *correct* answer's substance is not something to do
mechanically, since it must still accurately reflect the cited law. The
two worked examples below only rebalance length and add realistic
distractor detail — the legal claim in each `answer`/`legal` field is
unchanged from the original.

---

## How to use the linter

```bash
node tools/content-lint.js
```

Run it after every content edit. It reports, per card:
- Correct answer is the single longest (or shortest) choice
- Any choice whose length deviates >35% from that card's average
- Giveaway absolute language in a wrong answer ("immediately", "ignore",
  "without asking") — these read as author padding, not real distractors
- Near-duplicate choices wasting a slot

It exits non-zero if anything fails, so it can be added as a required
step in the GitHub Actions build if you want the build to block on
newly-introduced giveaway patterns.

---

## The rewrite method (apply this to each flagged card)

For a 3-choice card, the failing pattern is almost always: **one bad
answer (short, dismissive), one "partial credit" answer (medium), one
correct answer (long, detailed, hedged with "and", "because", legal
terms).** Fix by giving all three the same *shape*:

1. **Same length band.** Target all three choices within ~15–20 characters
   of each other. Long answers get trimmed of hedging clauses; short ones
   get a plausible-sounding justification added (not padding — an actual
   reason someone might believe it).
2. **Real distractors, not absurd ones.** Replace "quit immediately
   without saying anything" (nobody actually does this) with something a
   real person would plausibly do that's *wrong for a specific, statable
   reason* — a common misconception, not a strawman.
3. **Apply at least one trick pattern per card** from the list below —
   don't rely on length-balancing alone, since a careful reader should
   still have to think, not just notice all three are now the same size.

### Trick patterns, applied to this content domain

| Pattern | How it looks in a Karapatan Cards MCQ |
|---|---|
| Subtle differences | Two choices both mention "report to DOLE" — one says report only if it happens *again*, the other says report *immediately regardless* of frequency. Only one matches what the law actually requires. |
| Partially correct | An answer that's right for adults but wrong for minors (or right under one law but not the one that applies here) — tests whether the player caught the age/context detail in the scenario. |
| Common misconception | "Parental consent makes any work arrangement legal" — a genuinely common belief, but incomplete without the hours/hazard/schooling conditions. |
| Reversed logic | Occasionally phrase the scenario as "Which of these is NOT a valid basis for eviction?" — tests recognition of the exception, not the rule. |
| Overthinking trap | Put the simple, correct action ("document it and file with DOLE") next to a longer, more legalistic-sounding but subtly wrong option — so "sounds most technical" stops being a proxy for "correct." |
| Close numerical variation | For cards involving hours/ages/amounts, vary a wrong choice by one number (e.g. "minors 15+" vs "minors 16+") so the reader must recall the actual threshold. |

---

## Worked example 1 — Card #3 (Child Rights, medium)

**Before** (linter flags: correct answer longest; choice 3 is +35% over
average; choices 1 & 2 use giveaway absolute language):

```
1. "Quit immediately without saying anything to the employer." (0 pts)
2. "Just skip the exams to keep the job, then complain about it later." (1 pt)
3. "Remind the employer that education takes priority by law, and report
    to DOLE if the employer refuses." (2 pts)
```

**After** (same correct legal claim, balanced length, subtler distractors):

```
1. "Skip the exams this one time, then bring it up with DOLE afterward." (0 pts)
   — plausible misconception: "handle it after," not realizing the
   schooling interference itself is the actionable violation.
2. "Ask a co-worker to cover the shift instead of asking the employer directly." (1 pt)
   — a real, partial-credit instinct (avoid confrontation) but doesn't
   address the underlying rights violation or create any record of it.
3. "Tell the employer school comes first by law, and file with DOLE if refused." (2 pts)
   — same legal content as the original correct answer, just tightened.
```
All three now sit within a similar length band (roughly 70–80 characters),
and none contains giveaway absolute language.

## Worked example 2 — Card #13 (Labor Rights, medium)

**Before:**
```
1. "Resign immediately without documenting anything or filing a complaint." (0 pts)
2. "Accept the excuse again and stay quiet to avoid conflict." (1 pt)
3. "Keep a written log of hours worked and file a complaint with DOLE if
    the employer keeps delaying payment." (2 pts)
```

**After:**
```
1. "Bring it up verbally with the employer again next payday." (0 pts)
   — sounds proactive, but repeating the same unrecorded verbal request
   is what already failed twice; a real misconception that "asking again"
   counts as action.
2. "Mention it to a co-worker and wait to see if it happens a fourth time." (1 pt)
   — partial credit: recognizes a pattern, but still takes no documented
   action.
3. "Log the hours worked in writing and file with DOLE if delays continue." (2 pts)
   — same legal content as original, tightened to match length.
```

---

## Rolling out the rest

The remaining ~58 flagged cards follow the same three-step method above.
Recommended workflow:
1. Run `node tools/content-lint.js`, take the next flagged card ID.
2. Open `www/js/data.js`, find that card by `id`.
3. Rewrite its `choices[].text` using the method above — **do not touch
   `answer` or `legal`** unless you're independently verifying the
   citation, since those are the source-of-truth legal claims.
4. Re-run the linter — it should stop flagging that card ID.
5. Repeat until `0 flagged`.

This is intentionally a manual, one-card-at-a-time process rather than a
bulk automated rewrite, because each fix needs a human to judge "is this
distractor still a realistic thing someone would believe" — that
judgment call is exactly what keeps the trick questions fair instead of
just confusing.
