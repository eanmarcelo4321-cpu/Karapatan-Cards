/* ===== Karapatan Cards — Community (Discord) panel =====
   Opens an invitation panel from the Home screen or the Pause menu.
   Opening/closing the panel never changes game state, the current
   screen, or the pause state; it is just an overlay on top. */
var communityOverlayEl = null;

function openCommunityPanel(){
  if(!communityOverlayEl) communityOverlayEl = document.getElementById('communityOverlay');
  if(!communityOverlayEl) return;
  var c = (typeof T === 'function' && T().community) || {};
  document.getElementById('communityTitle').textContent = c.title || 'Join the Karapatan Cards Community!';
  document.getElementById('communityBody').textContent = c.body || 'Connect with other players, discuss human rights and Philippine laws, share your thoughts about the game, and stay updated on Karapatan Cards.';
  document.getElementById('communityJoinLabel').textContent = c.join || 'Join Discord';
  document.getElementById('communityCloseBtn').textContent = c.close || 'Close';
  communityOverlayEl.classList.add('open');
}

function closeCommunityPanel(){
  if(!communityOverlayEl) communityOverlayEl = document.getElementById('communityOverlay');
  if(communityOverlayEl) communityOverlayEl.classList.remove('open');
}

/* Opens the invite using the platform's external-link handling.
   Android/iOS (Capacitor): a _blank navigation is handed to the system,
   which opens the Discord app when installed (discord.com/invite links
   are app links) and otherwise the browser. A Capacitor Browser plugin
   is used instead if one is ever installed. */
function joinDiscord(){
  var url = window.APP_CONFIG && window.APP_CONFIG.DISCORD_INVITE_URL;
  if(!url) return;
  try{
    var cap = window.Capacitor;
    if(cap && cap.Plugins && cap.Plugins.Browser && cap.Plugins.Browser.open){
      cap.Plugins.Browser.open({ url: url });
    } else {
      var w = window.open(url, '_blank', 'noopener');
      if(!w) window.location.href = url;
    }
  }catch(e){
    window.location.href = url;
  }
}
