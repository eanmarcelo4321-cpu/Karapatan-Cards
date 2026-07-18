#!/usr/bin/env node
/* ===== Karapatan Cards — Answer Choice Quality Linter =====
   Scans www/js/data.js and flags every card that has a detectable
   "giveaway" pattern a player could exploit without reading the
   scenario carefully — the exact problems described in the trick-
   question request:

     1. Correct answer is the single longest choice (length tell)
     2. Correct answer is the single shortest choice (reverse tell)
     3. Choice lengths vary wildly (easy to eyeball the odd one out)
     4. A choice contains giveaway absolute language ("always","never",
        "immediately", "without", "just ignore") that reads as
        obviously-wrong padding rather than a real distractor
     5. Two choices are near-duplicates of each other (wastes a slot
        instead of adding a real distractor)

   This does NOT rewrite content — it only reports problems, since
   fixing wording requires someone who can verify each answer against
   the actual law being cited. Run it after every content edit:

       node tools/content-lint.js

   Exit code is non-zero if any card fails, so it can also be wired
   into CI (e.g. as a step before the Android build) if you want the
   build to fail on newly-introduced giveaway patterns. */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'www', 'js', 'data.js');
const src = fs.readFileSync(dataPath, 'utf8');

// data.js defines `var CARD_POOL = [...]` as a plain global — eval it in
// an isolated scope rather than parsing JS ourselves.
const sandbox = {};
new Function('sandbox', src + '\nsandbox.CARD_POOL = CARD_POOL;')(sandbox);
const CARD_POOL = sandbox.CARD_POOL;

if(!Array.isArray(CARD_POOL)){
  console.error('Could not find CARD_POOL in data.js — aborting.');
  process.exit(2);
}

const LENGTH_TOLERANCE = 0.35; // a choice more than 35% longer/shorter than the average is flagged
const TELL_GAP = 0.15; // longest choice must beat the 2nd-longest by >15% to count as an exploitable "tell" — a 1-2 char difference isn't something a player can eyeball
const GIVEAWAY_WORDS = [
  /\bignore\b/i, /\bnever\b/i, /\balways\b/i, /\bimmediately\b/i,
  /\bno matter what\b/i, /\bpublicly shame/i
];

let failCount = 0;
const reports = [];

CARD_POOL.forEach(card => {
  const issues = [];
  const choices = card.choices || [];
  const lens = choices.map(c => c.text.length);
  const avgLen = lens.reduce((a,b)=>a+b,0) / lens.length;
  const correctIdx = choices.findIndex(c => c.pts === Math.max(...choices.map(x=>x.pts)));
  const maxLen = Math.max(...lens);
  const minLen = Math.min(...lens);
  const maxIsUnique = lens.filter(l => l === maxLen).length === 1;
  const minIsUnique = lens.filter(l => l === minLen).length === 1;

  if(choices.length >= 3){
    const sorted = [...lens].sort((a,b) => b-a);
    const gap = sorted[0] > 0 ? (sorted[0] - sorted[1]) / sorted[0] : 0;
    if(maxIsUnique && lens[correctIdx] === maxLen && gap > TELL_GAP){
      issues.push(`Correct answer is the LONGEST choice by a wide margin (${Math.round(gap*100)}% longer than the next-longest choice) — a real length tell.`);
    }
    if(minIsUnique && lens[correctIdx] === minLen){
      const gapMin = sorted[sorted.length-1] > 0 ? (sorted[sorted.length-2] - sorted[sorted.length-1]) / sorted[sorted.length-2] : 0;
      if(gapMin > TELL_GAP) issues.push('Correct answer is the SHORTEST choice by a wide margin (reverse length tell — still a tell).');
    }
    lens.forEach((l, i) => {
      if(Math.abs(l - avgLen) / avgLen > LENGTH_TOLERANCE){
        issues.push(`Choice ${i+1} length (${l} chars) deviates >${Math.round(LENGTH_TOLERANCE*100)}% from the card's average (${Math.round(avgLen)} chars).`);
      }
    });
  }

  choices.forEach((c, i) => {
    if(c.pts !== choices[correctIdx].pts){ // only flag wrong-answer choices as "giveaway padding"
      GIVEAWAY_WORDS.forEach(rx => {
        if(rx.test(c.text)) issues.push(`Choice ${i+1} ("${c.text.slice(0,40)}...") uses giveaway absolute language (${rx}) that signals "obviously wrong" rather than a real distractor.`);
      });
    }
  });

  for(let i = 0; i < choices.length; i++){
    for(let j = i+1; j < choices.length; j++){
      const a = choices[i].text.toLowerCase(), b = choices[j].text.toLowerCase();
      const shared = a.split(' ').filter(w => b.includes(w)).length;
      if(shared / Math.max(a.split(' ').length, 1) > 0.7){
        issues.push(`Choices ${i+1} and ${j+1} are near-duplicates — wastes a distractor slot.`);
      }
    }
  }

  if(issues.length){
    failCount++;
    reports.push({ id: card.id, category: card.category, difficulty: card.difficulty, issues });
  }
});

console.log(`\nChecked ${CARD_POOL.length} cards. ${failCount} flagged.\n`);
reports.forEach(r => {
  console.log(`── Card #${r.id} [${r.category} / ${r.difficulty}] ──`);
  r.issues.forEach(i => console.log('   • ' + i));
});

if(failCount > 0){
  console.log(`\n${failCount} card(s) need rework before they meet the no-giveaway standard. See CONTENT_GUIDELINES.md for how to fix each pattern.`);
  process.exit(1);
} else {
  console.log('All cards pass.');
  process.exit(0);
}
