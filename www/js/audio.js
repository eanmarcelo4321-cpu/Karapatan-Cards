/* ===== Karapatan Cards — Audio Engine =====
   SFX are synthesized with the Web Audio API (no external files needed
   for those). Background music is a real looping audio file, run as a
   separate system with its own enabled/volume state so the player can
   control music and sound effects independently. */
var AudioEngine = (function(){
  let ctx = null;
  let masterGain = null;
  let enabled = localStorage.getItem('karapatan_sound') !== 'off';
  let sfxVolume = parseFloat(localStorage.getItem('karapatan_sfx_volume'));
  if(isNaN(sfxVolume)) sfxVolume = 1.0;
  let unlocked = false;

  function ensureCtx(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = sfxVolume;
      masterGain.connect(ctx.destination);
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function isOn(){ return enabled; }

  function setEnabled(v){
    enabled = v;
    localStorage.setItem('karapatan_sound', v ? 'on' : 'off');
  }

  function toggle(){ setEnabled(!enabled); return enabled; }

  function getSfxVolume(){ return sfxVolume; }
  function setSfxVolume(v){
    sfxVolume = Math.max(0, Math.min(1, v));
    localStorage.setItem('karapatan_sfx_volume', String(sfxVolume));
    if(masterGain) masterGain.gain.value = sfxVolume;
  }

  // Unlock audio on first user gesture (required on iOS/Android webviews)
  function unlock(){
    if(unlocked) return;
    const c = ensureCtx();
    if(!c) return;
    unlocked = true;
    Music.unlock();
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
    osc.connect(gain).connect(masterGain);
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

  /* ===== Background Music — real looping track, independent of SFX ===== */
  const Music = (function(){
    let el = null;
    let musicEnabled = localStorage.getItem('karapatan_music') !== 'off';
    let musicVolume = parseFloat(localStorage.getItem('karapatan_music_volume'));
    if(isNaN(musicVolume)) musicVolume = 0.5;

    function ensureEl(){
      if(!el){
        el = new Audio('assets/audio/background-music.mp3');
        el.loop = true;
        el.volume = musicVolume;
      }
      return el;
    }

    function isOn(){ return musicEnabled; }

    function setEnabled(v){
      musicEnabled = v;
      localStorage.setItem('karapatan_music', v ? 'on' : 'off');
      if(v) play(); else pause();
    }

    function toggle(){ setEnabled(!musicEnabled); return musicEnabled; }

    function getVolume(){ return musicVolume; }
    function setVolume(v){
      musicVolume = Math.max(0, Math.min(1, v));
      localStorage.setItem('karapatan_music_volume', String(musicVolume));
      if(el) el.volume = musicVolume;
    }

    function play(){
      const a = ensureEl();
      if(musicEnabled){
        a.play().catch(() => { /* blocked until a user gesture; unlock() retries */ });
      }
    }

    function pause(){
      if(el) el.pause();
    }

    // Called from AudioEngine.unlock() on the first user tap anywhere in the app
    function unlock(){
      if(musicEnabled) play();
    }

    return { isOn, setEnabled, toggle, getVolume, setVolume, play, pause, unlock };
  })();

  return {
    unlock, isOn, setEnabled, toggle, getSfxVolume, setSfxVolume,
    playClick, playCorrect, playPartial, playWrong, playWin, playDraw, playTick,
    Music
  };
})();
