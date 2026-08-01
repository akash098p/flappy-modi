/* ===========================================================
   FLAPPY MODI — Audio Management
=========================================================== */

// Audio elements (global)
window.audioJump = document.getElementById("audio-jump");
window.audioBgm = document.getElementById("audio-bgm");
window.audioGameover = document.getElementById("audio-gameover");
window.audioStart = document.getElementById("audio-start");
window.audioMelody = document.getElementById("audio-melody");
window.audioHomeBg = document.getElementById("audio-homebg");
window.audioTap = document.getElementById("audio-tap");
window.audioPurchase = document.getElementById("audio-purchase");
window.audioPreview = document.getElementById("audio-preview");
window.audioOoh = document.getElementById("audio-ooh");
window.audioKya = document.getElementById("audio-kya");
window.audioAnimation = document.getElementById("audio-animation");
window.audioRewards = document.getElementById("audio-rewards");

// Volume settings
window.audioBgm.volume = 0.88;
window.audioJump.volume = 0.7;
window.audioGameover.volume = 0.8;
window.audioStart.volume = 0.8;
window.audioMelody.volume = 0.9;
window.audioHomeBg.volume = 0.9;
window.audioTap.volume = 0.7;
window.audioPurchase.volume = 0.8;
window.audioPreview.volume = 0.5;
window.audioOoh.volume = 0.85;
window.audioKya.volume = 0.9;
window.audioAnimation.volume = 0.7;
window.audioRewards.volume = 0.8;

// Play sound helper (global)
window.playSound = function(el) {
  try {
    el.currentTime = 0;
    el.play().catch(() => {});
  } catch (e) { /* ignore */ }
}

window.playTap = function() { window.playSound(window.audioTap); }
window.playPurchase = function() { window.playSound(window.audioPurchase); }

// Game background music — uses the selected song (global)
window.playBgm = function() {
  try {
    const song = SONGS.find(s => s.id === save.selectedSong) || SONGS[0];
    window.audioBgm.src = song.src;
    window.audioBgm.currentTime = 0;
    window.audioBgm.play().catch(() => {});
  } catch (e) { /* ignore */ }
}

window.stopBgm = function() {
  window.audioBgm.pause();
}

// Home background music — plays on home & sub-screens (global)
window.playHomeBg = function() {
  try {
    window.audioHomeBg.currentTime = 0;
    window.audioHomeBg.play().catch(() => {});
  } catch (e) { /* ignore */ }
}

window.stopHomeBg = function() {
  window.audioHomeBg.pause();
}

// Song preview — plays a snippet, stops on second tap or when selecting (global)
window.previewingSongId = null;

window.stopPreview = function() {
  if (window.previewingSongId) {
    window.audioPreview.pause();
    window.previewingSongId = null;
    document.querySelectorAll(".song-preview-btn.playing").forEach(b => {
      b.classList.remove("playing");
      b.textContent = "▶";
    });
    window.playHomeBg();
  }
}

window.togglePreview = function(songId) {
  const song = SONGS.find(s => s.id === songId);
  if (!song) return;
  if (window.previewingSongId === songId) {
    window.stopPreview();
    return;
  }
  window.stopPreview();
  window.stopHomeBg();
  window.audioPreview.src = song.src;
  window.audioPreview.currentTime = 0;
  window.audioPreview.play().catch(() => {});
  window.previewingSongId = songId;
  const btn = document.querySelector(`.song-preview-btn[data-song="${songId}"]`);
  if (btn) {
    btn.classList.add("playing");
    btn.textContent = "■";
  }
}

// Stop preview when the preview audio ends naturally
window.audioPreview.addEventListener("ended", window.stopPreview);

// Roulette animation sounds (global)
window.playAnimationSound = function() {
  try {
    window.audioAnimation.currentTime = 0;
    window.audioAnimation.play().catch(() => {});
  } catch (e) { /* ignore */ }
}

window.stopAnimationSound = function() {
  try {
    window.audioAnimation.pause();
    window.audioAnimation.currentTime = 0;
  } catch (e) { /* ignore */ }
}

window.playRewardSound = function() {
  try {
    window.audioRewards.currentTime = 0;
    window.audioRewards.play().catch(() => {});
  } catch (e) { /* ignore */ }
}
