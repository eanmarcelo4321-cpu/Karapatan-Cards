/* ===== Karapatan Cards — Audio Engine =====
   All sound is synthesized with the Web Audio API (no external audio
   files to fetch/bundle). Provides short SFX (correct/wrong/click/win)
   plus a soft ambient pad loop, with a persisted on/off toggle. */
var AudioEngine = (function(){
  let ctx = null;
  let ambientNodes = null;
  let enabled = localStorage.getItem('karapatan_sound') !== 'off';
  let unlocked = false;

  function ensureCtx(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function isOn(){ return enabled; }

  function setEnabled(v){
    enabled = v;
    localStorage.setItem('karapatan_sound', v ? 'on' : 'off');
    if(v) startAmbient(); else stopAmbient();
  }

  function toggle(){ setEnabled(!enabled); return enabled; }

  // Unlock audio on first user gesture (required on iOS/Android webviews)
  function unlock(){
    if(unlocked) return;
    const c = ensureCtx();
    if(!c) return;
    unlocked = true;
    if(enabled) startAmbient();
  }

  function tone(freq, start, dur, type, gainPeak, glideTo){
    const c = ensureCtx();
    if(!c || !enabled) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + start + dur);
    gain.gain.setValueAtTime(0.0001, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(gainPeak || 0.18, c.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.05);
  }

  function playClick(){ tone(720, 0, 0.06, 'square', 0.06); }

  function playCorrect(){
    if(!enabled) return;
    tone(523.25, 0, 0.16, 'triangle', 0.16);      // C5
    tone(659.25, 0.09, 0.16, 'triangle', 0.16);    // E5
    tone(783.99, 0.18, 0.28, 'triangle', 0.18);    // G5
  }

  function playPartial(){
    if(!enabled) return;
    tone(587.33, 0, 0.14, 'triangle', 0.14);
    tone(523.25, 0.1, 0.22, 'triangle', 0.12);
  }

  function playWrong(){
    if(!enabled) return;
    tone(196, 0, 0.28, 'sawtooth', 0.11, 110);
  }

  function playWin(){
    if(!enabled) return;
    const notes = [523.25,659.25,783.99,1046.5];
    notes.forEach((f,i) => tone(f, i*0.14, 0.3, 'triangle', 0.17));
  }

  function playDraw(){ tone(392, 0, 0.1, 'sine', 0.08); }
  function playTick(){ tone(880, 0, 0.03, 'square', 0.03); }

  let ambientTimer = null;
  function startAmbient(){
    const c = ensureCtx();
    if(!c || !enabled || ambientNodes) return;
    const master = c.createGain();
    master.gain.value = 0.05;
    master.connect(c.destination);

    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = 130.81; // C3
    o2.frequency.value = 196.00; // G3
    const g1 = c.createGain(), g2 = c.createGain();
    g1.gain.value = 0.5; g2.gain.value = 0.35;
    o1.connect(g1).connect(master);
    o2.connect(g2).connect(master);

    // slow filter-less LFO via gain wobble for a "breathing" pad feel
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();

    o1.start(); o2.start();
    ambientNodes = { master, o1, o2, lfo };
  }

  function stopAmbient(){
    if(!ambientNodes) return;
    try{
      ambientNodes.o1.stop(); ambientNodes.o2.stop(); ambientNodes.lfo.stop();
    }catch(e){}
    ambientNodes = null;
  }

  return {
    unlock, isOn, setEnabled, toggle,
    playClick, playCorrect, playPartial, playWrong, playWin, playDraw, playTick,
    startAmbient, stopAmbient
  };
})();
