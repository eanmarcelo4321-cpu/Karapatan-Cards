/* ===== Karapatan Cards — AI Opponent =====
   Simulates a realistic (imperfect) opponent. Each difficulty has a
   weighted probability of landing on the fully-correct (2pt), partial
   (1pt), or wrong (0pt) choice, so the AI doesn't play like a perfect
   oracle even on "Hard". */
var AIOpponent = (function(){
  const PROFILES = {
    easy:   { 2: 0.42, 1: 0.30, 0: 0.28 },
    medium: { 2: 0.66, 1: 0.22, 0: 0.12 },
    hard:   { 2: 0.85, 1: 0.10, 0: 0.05 }
  };

  function weightedPick(weights){
    const total = Object.values(weights).reduce((a,b) => a+b, 0);
    let r = Math.random() * total;
    for(const key of Object.keys(weights)){
      r -= weights[key];
      if(r <= 0) return Number(key);
    }
    return Number(Object.keys(weights)[0]);
  }

  // Returns the index into card.choices that the AI "selects".
  function chooseIndex(card, difficulty){
    const profile = PROFILES[difficulty] || PROFILES.medium;
    const availablePts = [...new Set(card.choices.map(c => c.pts))];
    // Renormalize the profile to only the pts values actually present (identification cards have no "1").
    const weights = {};
    availablePts.forEach(p => { weights[p] = profile[p] !== undefined ? profile[p] : 0.1; });
    const targetPts = weightedPick(weights);
    const matches = card.choices.map((c,i) => ({c,i})).filter(x => x.c.pts === targetPts);
    const pick = matches.length ? matches[Math.floor(Math.random()*matches.length)] : {i: Math.floor(Math.random()*card.choices.length)};
    return pick.i;
  }

  // Simulated "thinking" delay in ms, scaled a bit by difficulty (harder = a touch faster/decisive).
  function thinkTime(difficulty){
    const ranges = { easy: [1800, 3600], medium: [1400, 2800], hard: [1000, 2200] };
    const [lo,hi] = ranges[difficulty] || ranges.medium;
    return lo + Math.random() * (hi - lo);
  }

  return { chooseIndex, thinkTime, PROFILES };
})();
