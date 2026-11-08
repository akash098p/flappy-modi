/* ===========================================================
   FLAPPY MODI — Audio Management
=========================================================== */

// Audio elements (global)
window.audioJump = document.getElementById("audio-jump");
window.audioBgm = document.getElementById("audio-bgm");
window.audioGameover = document.getElementById("audio-gameover");
window.audioStart = document.getElementById("audio-start");
window.audioMelody = document.getElementById("audio-melody");
window.audioFahhh = document.getElementById("audio-fahhh");
window.audioHomeBg = document.getElementById("audio-homebg");
window.audioTap = document.getElementById("audio-tap");
window.audioPurchase = document.getElementById("audio-purchase");
window.audioPreview = document.getElementById("audio-preview");
window.audioOoh = document.getElementById("audio-ooh");
window.audioKya = document.getElementById("audio-kya");
window.audioAnimation = document.getElementById("audio-animation");
window.audioRewards = document.getElementById("audio-rewards");
window.audioWhaKyaSceneHai = document.getElementById("audio-wha-kya-scene-hai");
window.audioGiveUp = document.getElementById("audio-give-up");
window.audioWahModijiWah = document.getElementById("audio-wah-modiji-wah");
window.audioPappuBurn = document.getElementById("audio-pappu-burn");
window.audioPappuPipeSounds = [
  document.getElementById("audio-pappu-pipe-khatam"),
  document.getElementById("audio-pappu-pipe-tata"),
  document.getElementById("audio-pappu-pipe-goodbye"),
  document.getElementById("audio-pappu-pipe-gaya"),
];
window.pappuPipeSoundIndex = 0;
window.pappuPipeSoundQueue = [];

window.playNextPappuPipeSound = function() {
  const sound = window.pappuPipeSoundQueue[0];
  if (!sound) return;
  sound.onended = () => {
    if (window.pappuPipeSoundQueue[0] !== sound) return;
    sound.onended = null;
    window.pappuPipeSoundQueue.shift();
    window.playNextPappuPipeSound();
  };
  window.playSound(sound);
}

// Volume settings
window.BGM_BASE_VOLUME = 0.88;
window.audioBgm.volume = window.BGM_BASE_VOLUME;
window.audioJump.volume = 0.7;
window.audioGameover.volume = 0.8;
window.audioStart.volume = 0.8;
window.audioMelody.volume = 0.9;
window.audioFahhh.volume = 0.9;
window.audioHomeBg.volume = 0.9;
window.audioWahModijiWah.volume = 0.9;
window.audioTap.volume = 0.7;
window.audioPurchase.volume = 0.8;
window.audioPreview.volume = 0.5;
window.audioOoh.volume = 0.85;
window.audioKya.volume = 0.9;
window.audioAnimation.volume = 0.7;
window.audioRewards.volume = 0.8;
window.audioWhaKyaSceneHai.volume = 0.9;
window.audioGiveUp.volume = 0.8;
if (window.audioPappuBurn) window.audioPappuBurn.volume = 0.85;
window.audioPappuPipeSounds.forEach(sound => {
  if (sound) sound.volume = 0.85;
});

window.playPappuPipeAttackSound = function() {
  const sound = window.audioPappuPipeSounds[window.pappuPipeSoundIndex];
  window.pappuPipeSoundIndex = (window.pappuPipeSoundIndex + 1) % window.audioPappuPipeSounds.length;
  if (!sound) return;
  window.pappuPipeSoundQueue.push(sound);
  if (window.pappuPipeSoundQueue.length === 1) window.playNextPappuPipeSound();
}

window.activeDuckingCount = 0;
const DUCKED_BGM_VOLUME = 0.20;
window.applyBgmVolume = function() {
  const setting = window.audioSettings ? window.audioSettings.bgm : 1;
  const duckingScale = window.activeDuckingCount > 0
    ? DUCKED_BGM_VOLUME / window.BGM_BASE_VOLUME
    : 1;
  window.audioBgm.volume = window.BGM_BASE_VOLUME * setting * duckingScale;
}

// Play sound helper (global)
window.playSound = function(el) {
  try {
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});

    // Audio Ducking: Lower BGM volume when key in-game sound effects play
    if (
      el === window.audioWahModijiWah ||
      el === window.audioWhaKyaSceneHai ||
      el === window.audioOoh ||
      el === window.audioMelody ||
      el === window.audioPappuBurn ||
      window.audioPappuPipeSounds.includes(el)
    ) {
      if (el._duckCleanup) {
        el._duckCleanup();
      }

      window.activeDuckingCount++;
      window.applyBgmVolume();

      const restoreVolume = () => {
        if (el._duckCleanup) {
          el.removeEventListener("ended", el._duckCleanup);
          if (el._duckTimeout) {
            clearTimeout(el._duckTimeout);
            el._duckTimeout = null;
          }
          el._duckCleanup = null;
          window.activeDuckingCount = Math.max(0, window.activeDuckingCount - 1);
          window.applyBgmVolume();
        }
      };

      el._duckCleanup = restoreVolume;
      el.addEventListener("ended", restoreVolume, { once: true });

      const durationMs = (el.duration && !isNaN(el.duration) && el.duration > 0) ? (el.duration * 1000 + 200) : 3500;
      el._duckTimeout = setTimeout(restoreVolume, durationMs);
    }
  } catch (e) { /* ignore */ }
}

window.playTap = function() { window.playSound(window.audioTap); }
window.playPurchase = function() { window.playSound(window.audioPurchase); }

window.introAudioPlayed = false;
window.playIntroAudioSequence = function() {
  if (window.introAudioPlayed) return;
  window.introAudioPlayed = true;

  try {
    window.audioHomeBg.pause();
    window.audioHomeBg.currentTime = 0;

    if (!window.audioFahhh) return window.playHomeBg();

    window.audioFahhh.onended = function() {
      window.audioFahhh.onended = null;
      window.playHomeBg();
    };

    window.audioFahhh.currentTime = 0;
    window.audioFahhh.play().catch(() => window.playHomeBg());
  } catch (e) {
    window.playHomeBg();
  }
}

window.randomSongQueue = [];
window.currentBgmSongId = null;

window.shuffleSongs = function() {
  const shuffled = [...window.SONGS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.length > 1 && shuffled[0].id === window.currentBgmSongId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

window.playNextBgmSong = function() {
  let song;
  if (window.audioSettings.randomSongs) {
    if (!window.randomSongQueue.length) window.randomSongQueue = window.shuffleSongs();
    song = window.randomSongQueue.shift();
  } else {
    song = window.SONGS.find(item => item.id === window.save.selectedSong) || window.SONGS[0];
  }
  if (!song) return;
  window.currentBgmSongId = song.id;
  window.audioBgm.src = song.src;
  window.audioBgm.currentTime = 0;
  window.applyBgmVolume();
  window.audioBgm.play().catch(() => {});
}

// Game music repeats the selected track or advances through a shuffled playlist.
window.playBgm = function() {
  window.randomSongQueue = window.audioSettings.randomSongs ? window.shuffleSongs() : [];
  window.playNextBgmSong();
}

window.audioBgm.addEventListener("ended", () => {
  if (window.state === "playing") window.playNextBgmSong();
});

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
