/* ===== Karapatan Cards — answer card inspection =====
   Two ways to read an answer in full, neither of which submits it:
   - tap the expand icon on a card -> preview stays open until closed
   - press and hold a card          -> preview shows while held
   Inspecting never changes the selection or the game state. */
(function(){
  var HOLD_MS = 380, timer = null, startX = 0, startY = 0, suppressUntil = 0, overlay = null;

  function phone(){ return document.querySelector('.phone') || document.body; }
  function tr(){ return (typeof T === 'function' && T()) || {}; }

  function build(card, persist, idx){
    var letter = card.querySelector('.choice-tab'), text = card.querySelector('.choice-text');
    if(!text) return;
    hide();
    var t = tr();
    overlay = document.createElement('div');
    overlay.className = 'card-inspect' + (persist ? ' persist' : '');
    var tabHtml = letter ? letter.firstChild.textContent + '<i>♦</i>' : '';
    overlay.innerHTML = '<div class="ci-card"><div class="ci-tab">' + tabHtml + '</div><div class="ci-text"></div></div>' +
      (persist
        ? '<div class="ci-actions"><button class="btn btn-outline ci-close"></button><button class="btn btn-primary ci-select"></button></div>'
        : '<div class="ci-hint"></div>');
    overlay.querySelector('.ci-text').textContent = text.textContent;
    if(persist){
      overlay.querySelector('.ci-close').textContent = t.previewClose || 'Close';
      overlay.querySelector('.ci-select').textContent = t.previewSelect || 'Select this answer';
      overlay.querySelector('.ci-close').onclick = hide;
      overlay.querySelector('.ci-select').onclick = function(){
        if(typeof selectChoice === 'function') selectChoice(idx);
        hide();
      };
      overlay.addEventListener('click', function(e){ if(e.target === overlay) hide(); });
    } else {
      overlay.querySelector('.ci-hint').textContent = t.inspectRelease || 'Release to close';
    }
    phone().appendChild(overlay);
    requestAnimationFrame(function(){ overlay && overlay.classList.add('in'); });
  }
  function hide(){ if(overlay){ overlay.remove(); overlay = null; } }
  function cardIndex(card){ return Array.prototype.indexOf.call(card.parentNode.children, card); }

  function endHold(){
    clearTimeout(timer); timer = null;
    if(overlay && !overlay.classList.contains('persist')){ suppressUntil = Date.now() + 450; hide(); }
  }

  document.addEventListener('pointerdown', function(e){
    if(e.target.closest && e.target.closest('.choice-expand')) return;
    var card = e.target.closest && e.target.closest('.choice-list .choice-card');
    if(!card || card.classList.contains('disabled') || overlay) return;
    startX = e.clientX; startY = e.clientY;
    clearTimeout(timer);
    timer = setTimeout(function(){ timer = null; build(card, false); if(navigator.vibrate){ try{ navigator.vibrate(12); }catch(_){} } }, HOLD_MS);
  }, true);
  document.addEventListener('pointermove', function(e){
    if(timer && (Math.abs(e.clientX-startX) > 10 || Math.abs(e.clientY-startY) > 10)){ clearTimeout(timer); timer = null; }
  }, true);
  ['pointerup','pointercancel'].forEach(function(ev){ document.addEventListener(ev, endHold, true); });

  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target : e.target.parentNode;
    var exp = t.closest && t.closest('.choice-expand');
    if(exp){
      e.stopPropagation(); e.preventDefault();
      var card = exp.closest('.choice-card');
      build(card, true, cardIndex(card));
      return;
    }
    // a hold must never act as a tap on the card
    if(Date.now() < suppressUntil && t.closest && t.closest('.choice-card')){ e.stopPropagation(); e.preventDefault(); }
  }, true);
  document.addEventListener('contextmenu', function(e){
    if(e.target.closest && e.target.closest('.choice-card')) e.preventDefault();
  });
})();
