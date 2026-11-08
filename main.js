/* ===========================================================
   FLAPPY MODI — Main Game Logic
=========================================================== */

// Game state (global)
window.state = "ready";
window.bird = null; window.pipes = []; window.cockroaches = []; window.melons = []; window.melodies = []; window.particles = [];
window.score = 0;
window.elapsed = 0;
window.pipeTimer = 0;
window.cockroachTimer = 0;
window.melonTimer = 0;
window.melodyTimer = 0;
window.melodiesThisRun = 0;
window.lastTime = 0;
window.groundOffset = 0;
window.rafId = null;
window.currentVehicleImg = null;
window.respawnCount = 0;
window.cockroachSoundToggle = false;
window.respawnTimerId = null;
window.respawnTimeLeft = 5;
window.systumHackTimer = 0;
window.systumHackMultiplier = 1;
window.systumBonusCoins = 0;
window.vandeBoostTimer = 0;
window.vandePipesRemaining = 0;
window.vandeBoostFloatY = 0;
window.vandeBoostManualControl = false;
window.pappuHamzaTimer = 0;
window.pappuFireCooldown = 0;
window.pappuProjectiles = [];
window.pappuEffects = [];

// DOM element references (global)
window.app = null; window.homeScreen = null; window.gameScreen = null; window.themeScreen = null; window.vehicleScreen = null; window.songScreen = null; window.storeScreen = null;
window.canvas = null; window.ctx = null;
window.playBtn = null; window.menuThemesBtn = null; window.menuVehiclesBtn = null; window.menuSongsBtn = null; window.menuStoreBtn = null;
window.pauseBtn = null; window.resumeBtn = null; window.pauseHomeBtn = null; window.goHomeBtn = null; window.retryBtn = null;
window.respawnBtn = null; window.noRespawnBtn = null;
window.spinBtn = null; window.closeRouletteBtn = null;
window.rouletteOverlay = null; window.rouletteTrack = null;
window.respawnOverlay = null; window.gameoverOverlay = null; window.pauseOverlay = null; window.getReadyOverlay = null;
window.hudScoreEl = null; window.hudHitsEl = null; window.hudMelodiesEl = null;
window.systumSkillBtn = null; window.systumSkillStatusEl = null;
window.vandeSkillBtn = null; window.vandeSkillStatusEl = null;
window.pappuSkillBtn = null; window.pappuSkillStatusEl = null;
window.goScoreEl = null; window.goBestEl = null; window.goCoinsEl = null; window.goMelodiesEl = null;
window.respawnCostText = null;
window.allScreens = null;

// Tips & Settings UI (global)
window.tipsBtn = null; window.settingsBtn = null;
window.tipsOverlay = null; window.tipsCloseBtn = null;
window.settingsOverlay = null; window.settingsCloseBtn = null;
window.sfxVolumeInput = null; window.bgmVolumeInput = null;

// Volume settings persistence
window.SETTINGS_KEY = "flappyModiSettings_v1";
window.audioSettings = (function() {
  try {
    const raw = localStorage.getItem(window.SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        sfx: typeof parsed.sfx === "number" ? parsed.sfx : 0.8,
        bgm: typeof parsed.bgm === "number" ? parsed.bgm : 0.88,
        randomSongs: parsed.randomSongs === true,
      };
    }
  } catch (e) { /* ignore */ }
  return { sfx: 0.8, bgm: 0.88, randomSongs: false };
})();

window.saveAudioSettings = function() {
  try { localStorage.setItem(window.SETTINGS_KEY, JSON.stringify(window.audioSettings)); }
  catch (e) { /* ignore */ }
}

// Base volumes for each audio element (multiplied by user's setting)
window.SFX_AUDIO_IDS = [
  ["audioJump", 0.7], ["audioGameover", 0.8], ["audioStart", 0.8],
  ["audioMelody", 0.9], ["audioFahhh", 0.9], ["audioTap", 0.7], ["audioPurchase", 0.8],
  ["audioOoh", 0.85], ["audioKya", 0.9], ["audioRewards", 0.8],
  ["audioWhaKyaSceneHai", 0.9], ["audioGiveUp", 0.8],
];
window.BGM_AUDIO_IDS = [
  ["audioBgm", window.BGM_BASE_VOLUME], ["audioHomeBg", 0.9], ["audioPreview", 0.5], ["audioAnimation", 0.7],
];

window.applyAudioVolumes = function() {
  window.SFX_AUDIO_IDS.forEach(([key, base]) => {
    const el = window[key];
    if (el) el.volume = base * window.audioSettings.sfx;
  });
  [window.audioPappuBurn, ...(window.audioPappuPipeSounds || [])].forEach(el => {
    if (el) el.volume = 0.85 * window.audioSettings.sfx;
  });
  window.BGM_AUDIO_IDS.forEach(([key, base]) => {
    const el = window[key];
    if (!el) return;
    if (key === "audioBgm") {
      window.applyBgmVolume();
    } else {
      el.volume = base * window.audioSettings.bgm;
    }
  });
}

// Image cache (global)
window.imageCache = {};

window.loadImage = function(src) {
  if (window.imageCache[src]) return window.imageCache[src];
  const img = new Image();
  img.src = src;
  img.onload = function() {
    console.log("Image loaded:", src, "size:", img.width, "x", img.height);
  };
  img.onerror = function() {
    console.error("Failed to load image:", src);
  };
  window.imageCache[src] = img;
  return img;
}

// Preload images (after DOM is ready in init)
// Images will be loaded in init() function

// Save system (global) - Now using async Capacitor-native storage
// Note: window.save is initialized asynchronously in loadSavedPlayerData()
// The old sync functions are kept as fallbacks for compatibility
window.defaultSave = function() {
  return {
    bestScore: 0, coins: 0, melodies: 0, hits: 2,
    ownedStoreItems: [],
    skillCharges: { systumHack: 1, vandeBoost: 1, pappuHamza: 1 },
    unlockedThemes: ["day"], unlockedVehicles: ["flappy1"],
    selectedTheme: "day", selectedVehicle: "flappy1", selectedSong: "udta",
  };
}

// Legacy sync functions (kept for backward compatibility)
window.loadSave = function() {
  try {
    const raw = localStorage.getItem(window.STORAGE_KEY);
    if (!raw) return window.defaultSave();
    const parsed = JSON.parse(raw);
    return { ...window.defaultSave(), ...parsed };
  } catch (e) { return window.defaultSave(); }
}

window.saveSave = function(data) {
  try { localStorage.setItem(window.STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { /* ignore */ }
}

// Async save function using Capacitor Preferences
window.saveGameState = async function() {
  if (!window.save) return;
  await window.saveAllGameData();
};

// Initialize save as empty object - will be populated by loadSavedPlayerData()
window.save = {};

// HUD update (global)
window.updateHud = function() {
  window.hudHitsEl.textContent = window.save.hits;
  window.hudMelodiesEl.textContent = window.save.melodies;
}

// Respawn cost calculation (global)
window.getRespawnCost = function() {
  return Math.pow(2, window.respawnCount);
}

window.getVandeBoostSpeedMultiplier = function() {
  if (window.vandeBoostTimer <= 0) return 1;
  let elapsed = window.GAME_CONFIG.VANDE_BOOST_DURATION - window.vandeBoostTimer;
  for (const phase of window.GAME_CONFIG.VANDE_BOOST_SPEED_PHASES) {
    if (elapsed < phase.duration) return phase.multiplier;
    elapsed -= phase.duration;
  }
  return window.GAME_CONFIG.VANDE_BOOST_SPEED_PHASES.slice(-1)[0].multiplier;
}

window.activatePappuHamza = function() {
  const charges = window.save.skillCharges;
  if (window.state !== "playing" || window.pappuHamzaTimer > 0 || !charges || charges.pappuHamza < 1) return;
  charges.pappuHamza--;
  window.pappuHamzaTimer = window.GAME_CONFIG.PAPPU_HAMZA_DURATION;
  window.pappuFireCooldown = 0;
  window.saveGameState();
  window.playPurchase();
  window.updateSkillButtons();
}

window.spawnPappuImpact = function(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = window.rand(70, 190);
    window.pappuEffects.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: window.rand(0.24, 0.48),
      maxLife: 0.48,
      size: window.rand(2, 5),
    });
  }
}

window.createPappuPipePieces = function(pipe) {
  const floorY = window.H - window.groundH;
  const pieces = [];
  [[0, pipe.gapTop, true], [pipe.gapBottom, floorY - pipe.gapBottom, false]].forEach(([segmentY, height, isTop]) => {
    if (height <= 0) return;
    const pieceHeight = Math.max(42, Math.min(88, height / 5));
    for (let sourceY = 0; sourceY < height; sourceY += pieceHeight) {
      const sourceHeight = Math.min(pieceHeight, height - sourceY);
      pieces.push({
        isTop,
        sourceY,
        sourceHeight,
        x: pipe.x,
        y: segmentY + sourceY,
        vx: window.rand(-48, 48),
        vy: window.rand(-12, 72),
        rotation: 0,
        spin: window.rand(-1.5, 1.5),
      });
    }
  });
  return pieces;
}

window.updatePappuHamza = function(dt) {
  if (window.pappuHamzaTimer > 0) {
    window.pappuFireCooldown -= dt;
    if (window.pappuFireCooldown <= 0 && window.bird) {
      const targets = [];
      window.pipes.forEach(pipe => {
        if (pipe.destruction || pipe.pappuTargeted || pipe.x + window.PIPE_WIDTH < window.bird.x) return;
        const upperY = pipe.gapTop / 2;
        const lowerY = pipe.gapBottom + (window.H - window.groundH - pipe.gapBottom) / 2;
        const targetY = Math.abs(window.bird.y - upperY) <= Math.abs(window.bird.y - lowerY) ? upperY : lowerY;
        targets.push({ target: pipe, type: "pipe", x: pipe.x + window.PIPE_WIDTH / 2, y: targetY });
      });
      window.cockroaches.forEach(cockroach => {
        if (cockroach.burning || cockroach.pappuTargeted || cockroach.x < window.bird.x - cockroach.size) return;
        targets.push({
          target: cockroach,
          type: "cockroach",
          x: cockroach.x,
          y: cockroach.y + Math.sin(cockroach.bob) * 8,
        });
      });
      targets.sort((a, b) => {
        const distanceA = Math.hypot(a.x - window.bird.x, a.y - window.bird.y);
        const distanceB = Math.hypot(b.x - window.bird.x, b.y - window.bird.y);
        return distanceA - distanceB;
      });
      const target = targets[0];
      if (target) {
        target.target.pappuTargeted = true;
        window.pappuProjectiles.push({
          x: window.bird.x + window.bird.size * 0.28,
          y: window.bird.y,
          target: target.target,
          type: target.type,
          rotation: 0,
          life: 0,
          size: window.GAME_CONFIG.PAPPU_HAMZA_PROJECTILE_SIZE,
        });
        window.pappuFireCooldown = window.GAME_CONFIG.PAPPU_HAMZA_FIRE_INTERVAL;
      } else {
        window.pappuFireCooldown = 0.1;
      }
    }
  }

  for (let i = window.pappuProjectiles.length - 1; i >= 0; i--) {
    const projectile = window.pappuProjectiles[i];
    const target = projectile.target;
    projectile.life = (projectile.life || 0) + dt;
    const targetStillExists = projectile.type === "pipe"
      ? window.pipes.includes(target)
      : window.cockroaches.includes(target);
    if (!target || !targetStillExists || projectile.life > 2.5 || (projectile.type === "pipe" ? target.destruction : target.burning)) {
      if (target && targetStillExists && !target.destruction && !target.burning) target.pappuTargeted = false;
      window.pappuProjectiles.splice(i, 1);
      continue;
    }
    const targetX = projectile.type === "pipe" ? target.x + window.PIPE_WIDTH / 2 : target.x;
    const targetY = projectile.type === "pipe"
      ? (Math.abs(window.bird.y - target.gapTop / 2) <= Math.abs(window.bird.y - (target.gapBottom + (window.H - window.groundH - target.gapBottom) / 2))
        ? target.gapTop / 2
        : target.gapBottom + (window.H - window.groundH - target.gapBottom) / 2)
      : target.y + Math.sin(target.bob) * 8;
    const dx = targetX - projectile.x;
    const dy = targetY - projectile.y;
    const distance = Math.hypot(dx, dy);
    projectile.rotation = Math.atan2(dy, dx);
    const travel = window.GAME_CONFIG.PAPPU_HAMZA_PROJECTILE_SPEED * dt;
    if (distance <= travel + (projectile.type === "pipe" ? window.PIPE_WIDTH * 0.35 : target.size * 0.35)) {
      if (projectile.type === "pipe") {
        target.destruction = {
          elapsed: 0,
          pieces: window.createPappuPipePieces(target),
        };
        window.playPappuPipeAttackSound();
      } else {
        target.burning = { elapsed: 0 };
        window.playSound(window.audioPappuBurn);
      }
      if (projectile.type === "cockroach") window.spawnPappuImpact(targetX, targetY);
      window.pappuProjectiles.splice(i, 1);
      continue;
    }
    projectile.x += dx / distance * travel;
    projectile.y += dy / distance * travel;
  }

  for (let i = window.pappuEffects.length - 1; i >= 0; i--) {
    const effect = window.pappuEffects[i];
    effect.life -= dt;
    effect.x += effect.vx * dt;
    effect.y += effect.vy * dt;
    effect.vx *= Math.max(0, 1 - dt * 2);
    effect.vy *= Math.max(0, 1 - dt * 2);
    if (effect.life <= 0) window.pappuEffects.splice(i, 1);
  }
}

window.updateSkillButtons = function() {
  if (!window.systumSkillBtn || !window.vandeSkillBtn || !window.pappuSkillBtn) return;
  const charges = window.save.skillCharges || {};
  const systumActive = window.systumHackTimer > 0;
  const vandeActive = window.vandeBoostTimer > 0;
  const pappuActive = window.pappuHamzaTimer > 0;
  const systumStatus = systumActive
    ? `${Math.ceil(window.systumHackTimer)}s`
    : `×${charges.systumHack || 0}`;
  const vandeStatus = vandeActive
    ? `${Math.ceil(window.vandeBoostTimer)}s`
    : `×${charges.vandeBoost || 0}`;
  const pappuStatus = pappuActive
    ? `${Math.ceil(window.pappuHamzaTimer)}s`
    : `×${charges.pappuHamza || 0}`;
  if (window.systumSkillStatusEl.textContent !== systumStatus) window.systumSkillStatusEl.textContent = systumStatus;
  if (window.vandeSkillStatusEl.textContent !== vandeStatus) window.vandeSkillStatusEl.textContent = vandeStatus;
  if (window.pappuSkillStatusEl.textContent !== pappuStatus) window.pappuSkillStatusEl.textContent = pappuStatus;
  const systumDisabled = window.state !== "playing" || (!systumActive && !(charges.systumHack > 0));
  const vandeDisabled = window.state !== "playing" || (!vandeActive && !(charges.vandeBoost > 0));
  const pappuDisabled = window.state !== "playing" || (!pappuActive && !(charges.pappuHamza > 0));
  if (window.systumSkillBtn.disabled !== systumDisabled) window.systumSkillBtn.disabled = systumDisabled;
  if (window.vandeSkillBtn.disabled !== vandeDisabled) window.vandeSkillBtn.disabled = vandeDisabled;
  if (window.pappuSkillBtn.disabled !== pappuDisabled) window.pappuSkillBtn.disabled = pappuDisabled;
}

window.activateSystumHack = function() {
  const charges = window.save.skillCharges;
  if (window.state !== "playing" || window.systumHackTimer > 0 || !charges || charges.systumHack < 1) return;
  charges.systumHack--;
  window.systumHackMultiplier = Math.random() < 0.5 ? 2 : 3;
  window.systumHackTimer = window.GAME_CONFIG.SYSTUM_HACK_DURATION;
  window.saveGameState();
  window.playPurchase();
  window.updateSkillButtons();
}

window.activateVandeBoost = function() {
  const charges = window.save.skillCharges;
  if (window.state !== "playing" || window.vandeBoostTimer > 0 || !charges || charges.vandeBoost < 1) return;
  charges.vandeBoost--;
  window.vandeBoostTimer = window.GAME_CONFIG.VANDE_BOOST_DURATION;
  window.vandeBoostFloatY = window.bird.y;
  window.vandeBoostManualControl = false;
  window.bird.vy = 0;
  window.vandePipesRemaining = Math.floor(window.rand(
    window.GAME_CONFIG.VANDE_BOOST_PIPES_MIN,
    window.GAME_CONFIG.VANDE_BOOST_PIPES_MAX + 1
  ));
  window.saveGameState();
  window.playPurchase();
  window.updateSkillButtons();
}

// Start new game (global)
window.startNewGame = function() {
  const vehicleData = window.VEHICLES.find(v => v.id === window.save.selectedVehicle) || window.VEHICLES[0];
  
  window.currentVehicleImg = window.loadImage(vehicleData.img);

  window.bird = {
    x: window.W * 0.28, 
    y: window.H * 0.4,
    vy: 0, 
    rotation: 0,
    shieldTimer: 0,
    size: Math.max(50, Math.min(80, window.W * 0.14)),
  };
  window.pipes = []; window.cockroaches = []; window.melons = []; window.melodies = []; window.particles = [];
  window.score = 0; window.elapsed = 0; window.pipeTimer = 0;
  window.cockroachTimer = window.rand(window.COCKROACH_INTERVAL_MIN, window.COCKROACH_INTERVAL_MAX);
  window.melonTimer = window.rand(window.MELON_INTERVAL_MIN, window.MELON_INTERVAL_MAX);
  window.melodyTimer = window.rand(window.MELODY_INTERVAL_MIN, window.MELODY_INTERVAL_MAX);
  window.melodiesThisRun = 0; window.respawnCount = 0; window.groundOffset = 0;
  window.systumHackTimer = 0; window.systumHackMultiplier = 1; window.systumBonusCoins = 0;
  window.vandeBoostTimer = 0; window.vandePipesRemaining = 0;
  window.vandeBoostFloatY = 0;
  window.vandeBoostManualControl = false;
  window.pappuHamzaTimer = 0; window.pappuFireCooldown = 0;
  window.pappuProjectiles = []; window.pappuEffects = [];

  window.state = "ready";
  window.hudScoreEl.textContent = "0";
  window.updateHud();
  window.getReadyOverlay.classList.remove("hidden");
  window.pauseOverlay.classList.add("hidden");
  window.gameoverOverlay.classList.add("hidden");
  window.respawnOverlay.classList.add("hidden");

  window.showScreen("game");
  window.lastTime = performance.now();
  if (window.rafId !== null) {
    cancelAnimationFrame(window.rafId);
    window.rafId = null;
  }
  window.startGameLoop();
}

// Random number helper (global)
window.rand = function(min, max) { return min + Math.random() * (max - min); }

// Input handling (global)
window.isInteractiveTarget = function(target) {
  if (!target || !target.closest) return false;
  return !!target.closest(
    "button, .btn-primary, .btn-secondary, .pick-card, .song-card, .menu-btn, .back-btn, .store-buy-btn, #pause-btn"
  );
}

window.startGameIfNeeded = function() {
  if (window.state === "ready") {
    window.state = "playing";
    window.getReadyOverlay.classList.add("hidden");
    window.playBgm();
  }
}

window.flap = function() {
  if (window.state !== "playing" && window.state !== "ready") return;
  if (window.vandeBoostTimer > 0) {
    if (window.vandeBoostTimer <= window.GAME_CONFIG.VANDE_BOOST_DURATION - window.GAME_CONFIG.VANDE_BOOST_FLOAT_DURATION + 1e-6) {
      window.vandeBoostManualControl = true;
      window.bird.vy = window.FLAP_VELOCITY;
    } else {
      const minY = window.bird.size * 0.4;
      window.vandeBoostFloatY = Math.max(minY, window.vandeBoostFloatY - window.bird.size * 0.55);
      window.bird.vy = 0;
    }
    window.playSound(window.audioJump);
    return;
  }
  window.bird.vy = window.FLAP_VELOCITY;
  window.playSound(window.audioJump);
}

window.onInputStart = function(e) {
  if (!window.gameScreen.classList.contains("active")) return;
  if (window.isInteractiveTarget(e.target)) return;
  if (window.state === "paused" || window.state === "gameover" || window.state === "respawning") return;
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  window.startGameIfNeeded();
  window.flap();
}

// Game update loop (global)
window.update = function(dt) {
  window.elapsed += dt;
  const groundSpeedMultiplier = window.getVandeBoostSpeedMultiplier();
  window.groundOffset -= window.PIPE_SPEED * groundSpeedMultiplier * dt;
  if (window.groundOffset < -64) window.groundOffset += 64;

  window.updateSkillButtons();
  if (window.state !== "playing") return;

  if (window.systumHackTimer > 0) {
    window.systumHackTimer = Math.max(0, window.systumHackTimer - dt);
    if (window.systumHackTimer === 0) window.systumHackMultiplier = 1;
  }
  if (window.vandeBoostTimer > 0) {
    window.vandeBoostTimer = Math.max(0, window.vandeBoostTimer - dt);
    if (window.vandeBoostTimer === 0) window.vandePipesRemaining = 0;
  }
  if (window.pappuHamzaTimer > 0) {
    window.pappuHamzaTimer = Math.max(0, window.pappuHamzaTimer - dt);
  }
  window.updatePappuHamza(dt);

  // Bird physics
  if (window.state === "playing") {
    const boostElapsed = window.GAME_CONFIG.VANDE_BOOST_DURATION - window.vandeBoostTimer;
    const boostFloating = window.vandeBoostTimer > 0 && !window.vandeBoostManualControl;
    if (boostFloating && boostElapsed < window.GAME_CONFIG.VANDE_BOOST_FLOAT_DURATION) {
      const floatOffset = Math.sin(window.elapsed * 2.4) * Math.min(8, window.bird.size * 0.1);
      const minY = window.bird.size * 0.4;
      const maxY = window.H - window.groundH - window.bird.size * 0.5;
      window.bird.y += (Math.max(minY, Math.min(maxY, window.vandeBoostFloatY + floatOffset)) - window.bird.y) * Math.min(1, dt * 8);
      window.bird.vy = 0;
      window.bird.rotation = Math.sin(window.elapsed * 2.4) * 0.04;
    } else if (boostFloating) {
      const descentDuration = window.GAME_CONFIG.VANDE_BOOST_DURATION - window.GAME_CONFIG.VANDE_BOOST_FLOAT_DURATION;
      const descentProgress = Math.min(1, (boostElapsed - window.GAME_CONFIG.VANDE_BOOST_FLOAT_DURATION) / descentDuration);
      const easedProgress = descentProgress * descentProgress * (3 - 2 * descentProgress);
      const minY = window.bird.size * 0.4;
      const maxY = window.H - window.groundH - window.bird.size * 2;
      const startY = Math.max(minY, Math.min(maxY, window.vandeBoostFloatY));
      const endY = window.H - window.groundH - window.bird.size * 1.5;
      window.bird.y = startY + (endY - startY) * easedProgress;
      window.bird.vy = 0;
      window.bird.rotation = Math.min(0.5, easedProgress * 0.5);
    } else {
      window.bird.vy += window.GRAVITY * dt;
      window.bird.vy = Math.min(window.bird.vy, window.MAX_FALL_SPEED);
      window.bird.y += window.bird.vy * dt;
      window.bird.rotation = Math.max(-0.5, Math.min(1.1, window.bird.vy / 500));
    }
    window.bird.shieldTimer = Math.max(0, window.bird.shieldTimer - dt);
  }

  if (window.bird.y < window.bird.size * 0.4) { window.bird.y = window.bird.size * 0.4; window.bird.vy = 0; }
  if (window.bird.y + window.bird.size * 0.5 > window.H - window.groundH) {
    window.bird.y = window.H - window.groundH - window.bird.size * 0.5;
    return window.endGame();
  }

  // Pipes
  const boostActive = window.vandeBoostTimer > 0;
  const skillInvulnerable = boostActive || window.systumHackTimer > 0 || window.pappuHamzaTimer > 0;
  const surgeActive = boostActive;
  const speed = (window.PIPE_SPEED + Math.min(window.score * 2.5, 90)) *
    (surgeActive ? window.getVandeBoostSpeedMultiplier() : 1);
  window.pipeTimer += dt;
  const pipeInterval = window.PIPE_INTERVAL / (surgeActive ? window.getVandeBoostSpeedMultiplier() : 1);
  if (window.pipeTimer >= pipeInterval) { window.pipeTimer = 0; window.spawnPipePair(); }
  for (let i = window.pipes.length - 1; i >= 0; i--) {
    const p = window.pipes[i];
    if (p.destruction) {
      p.destruction.elapsed += dt;
      p.destruction.pieces.forEach(piece => {
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.vy += 900 * dt;
        piece.rotation += piece.spin * dt;
      });
      p.x -= speed * dt;
      if (p.destruction.elapsed >= window.GAME_CONFIG.PAPPU_HAMZA_PIPE_FALL_DURATION || p.x < -window.PIPE_WIDTH - 10) {
        window.pipes.splice(i, 1);
      }
      continue;
    }
    p.x -= speed * dt;
    if (!p.passed && p.x + window.PIPE_WIDTH < window.bird.x) {
      p.passed = true; window.score++; window.hudScoreEl.textContent = window.score; window.spawnCoinBurst();
      if (window.systumHackTimer > 0) {
        window.systumBonusCoins += Math.floor(window.COINS_PER_POINT) * (window.systumHackMultiplier - 1);
      }
      if (boostActive && window.vandePipesRemaining > 0) window.vandePipesRemaining--;
      if (window.score > 0 && window.score % 50 === 0) {
        window.playSound(window.audioWahModijiWah);
        window.spawnCoinBurst();
        window.spawnLotusRain();
      }
    }
    if (p.x < -window.PIPE_WIDTH - 10) window.pipes.splice(i, 1);
    if (!skillInvulnerable && (
      window.circleRectCollision(window.bird, { x: p.x, y: 0, w: window.PIPE_WIDTH, h: p.gapTop }) ||
      window.circleRectCollision(window.bird, { x: p.x, y: p.gapBottom, w: window.PIPE_WIDTH, h: (window.H - window.groundH) - p.gapBottom })
    )) {
      return window.endGame();
    }
  }

  // Cockroaches
  window.cockroachTimer -= dt;
  if (window.cockroachTimer <= 0) { window.spawnCockroach(); window.cockroachTimer = window.rand(window.COCKROACH_INTERVAL_MIN, window.COCKROACH_INTERVAL_MAX); }
  for (let i = window.cockroaches.length - 1; i >= 0; i--) {
    const c = window.cockroaches[i];
    if (c.burning) {
      c.burning.elapsed += dt;
      if (c.burning.elapsed >= window.GAME_CONFIG.PAPPU_HAMZA_COCKROACH_BURN_DURATION) {
        window.cockroaches.splice(i, 1);
      }
      continue;
    }
    c.x += c.vx * dt; c.bob += dt * 6;
    if (c.x < -120 || c.x > window.W + 120) { window.cockroaches.splice(i, 1); continue; }
    const cy = c.y + Math.sin(c.bob) * 8;
    if (window.circleCircleCollision(window.bird, { x: c.x, y: cy, r: c.size * 0.34 })) {
      if (window.pappuHamzaTimer > 0) {
        c.burning = { elapsed: 0 };
        window.playSound(window.audioPappuBurn);
        window.spawnPappuImpact(c.x, cy);
        continue;
      }
      if (skillInvulnerable) {
        window.cockroaches.splice(i, 1);
        continue;
      }
      if (window.save.hits > 0) {
        window.save.hits--;
        window.saveGameState();
        window.updateHud();
        window.cockroaches.splice(i, 1);
        window.bird.shieldTimer = 1.2;
        if (c.vx < 0) window.bird.vy = -200;
        window.playSound(window.audioOoh);
        continue;
      } else { return window.endGame("cockroach"); }
    }
  }

  // Melons
  window.melonTimer -= dt;
  if (window.melonTimer <= 0) { window.spawnMelon(); window.melonTimer = window.rand(window.MELON_INTERVAL_MIN, window.MELON_INTERVAL_MAX); }
  for (let i = window.melons.length - 1; i >= 0; i--) {
    const m = window.melons[i];
    m.timer += dt;
    if (m.phase === "down") {
      m.opacity = Math.min(1, m.opacity + dt * 3);
      m.y += (m.targetY - m.y) * Math.min(1, dt * 2.2) + m.speed * dt * 0.4;
      if (Math.abs(m.y - m.targetY) < 6 || m.y >= m.targetY) {
        m.y = m.targetY; m.phase = "hold"; m.timer = 0;
      }
    } else if (m.phase === "hold") {
      if (m.timer >= m.holdDuration) m.phase = "up";
    } else if (m.phase === "up") {
      m.y -= m.speed * dt;
      m.opacity = Math.max(0, m.opacity - dt * 1.3);
      if (m.y < -100 || m.opacity <= 0) window.melons.splice(i, 1);
    }
  }

  // Melodies
  window.melodyTimer -= dt;
  if (window.melodyTimer <= 0) { window.spawnMelody(); window.melodyTimer = window.rand(window.MELODY_INTERVAL_MIN, window.MELODY_INTERVAL_MAX); }
  for (let i = window.melodies.length - 1; i >= 0; i--) {
    const m = window.melodies[i];
    m.x -= speed * dt; m.bob += dt * 4;
    if (m.x < -window.MELODY_SIZE - 10) { window.melodies.splice(i, 1); continue; }
    if (!m.collected && window.circleCircleCollision(window.bird, { x: m.x, y: m.y, r: m.size * 0.42 })) {
      const melodyReward = window.systumHackTimer > 0 ? window.systumHackMultiplier : 1;
      m.collected = true; window.melodiesThisRun += melodyReward; window.save.melodies += melodyReward;
      window.saveGameState();
      window.updateHud(); window.playSound(window.audioMelody);
      window.spawnMelodyBurst(m.x, m.y); window.melodies.splice(i, 1);
    }
  }

  // Particles
  for (let i = window.particles.length - 1; i >= 0; i--) {
    const pt = window.particles[i];
    pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
    pt.vy += (pt.color === "lotus" ? 18 : 400) * dt;
    if (pt.color === "lotus") pt.angle += pt.rotationSpeed * dt;
    if (pt.life <= 0 || (pt.color === "lotus" && pt.y >= window.H - window.groundH - pt.size)) {
      window.particles.splice(i, 1);
    }
  }
}

// Game end (global)
window.endGame = function(cause) {
  window.stopBgm();
  if (cause === "cockroach") {
    window.playSound(window.audioKya);
  } else {
    window.playSound(window.audioGameover);
  }

  if (window.state !== "gameover") {
    window.state = "respawning";
    window.showRespawnOverlay();
  } else {
    window.finalizeGameOver();
  }
}

// Calculate total coins (base + milestone bonus) (global)
window.calculateCoins = function(score) {
  const baseCoins = Math.max(0, Math.floor(score * window.COINS_PER_POINT));
  let bonusCoins = 0;
  const milestones = Math.floor(score / 50);
  for (let i = 1; i <= milestones; i++) {
    const milestoneBonus = Math.min(i * 10, 100);
    bonusCoins += milestoneBonus;
  }
  return baseCoins + bonusCoins;
};

window.finalizeGameOver = function() {
  const earned = window.calculateCoins(window.score) + window.systumBonusCoins;
  window.save.coins += earned;
  if (window.score > window.save.bestScore) window.save.bestScore = window.score;
  window.saveGameState();
  window.updateHud();

  window.goScoreEl.textContent = window.score;
  window.goBestEl.textContent = window.save.bestScore;
  window.goCoinsEl.textContent = earned;
  window.goMelodiesEl.textContent = window.melodiesThisRun;

  window.state = "gameover";
  window.gameoverOverlay.classList.remove("hidden");
}

// Respawn (global)
window.doRespawn = function() {
  const cost = window.getRespawnCost();
  if (window.save.melodies < cost) { window.flashInsufficientCoins(); return; }
  window.save.melodies -= cost; window.respawnCount++;
  window.saveGameState();
  window.updateHud();
  window.bird.x = window.W * 0.28; window.bird.y = window.H * 0.42; window.bird.vy = 0; window.bird.rotation = 0;
  window.cockroaches = window.cockroaches.filter(c => c.x < window.bird.x - 200 || c.x > window.bird.x + 300);
  window.pipes = window.pipes.filter(p => p.x < window.bird.x - 200 || p.x > window.bird.x + 300);
  window.respawnOverlay.classList.add("hidden");
  window.state = "playing";
  window.lastTime = performance.now();
  window.playSound(window.audioWhaKyaSceneHai);
  window.audioBgm.play().catch(() => {});
  window.startGameLoop();
}

window.showRespawnOverlay = function() {
  const cost = window.getRespawnCost();
  const canRespawn = window.save.melodies >= cost;
  if (canRespawn) {
    window.respawnCostText.textContent = `Respawn for ${cost} melody${cost > 1 ? "s" : ""}? (You have ${window.save.melodies})`;
    window.respawnBtn.disabled = false; window.respawnBtn.textContent = "Respawn";
  } else {
    window.respawnCostText.textContent = `You need ${cost} melodies to respawn but you have only ${window.save.melodies}. Not enough melodies!`;
    window.respawnBtn.disabled = true; window.respawnBtn.textContent = "Not enough";
  }
  window.respawnOverlay.classList.remove("hidden");
  window.state = "respawning";
  window.startRespawnTimer();
}

window.startRespawnTimer = function() {
  window.clearRespawnTimer();
  window.respawnTimeLeft = 5;
  window.respawnTimerTextEl.textContent = "5";
  window.respawnTimerEl.classList.remove("hidden");
  window.respawnTimerEl.style.animation = "none";
  void window.respawnTimerEl.offsetWidth;
  window.respawnTimerEl.style.animation = "";
  window.respawnTimerId = setInterval(() => {
    window.respawnTimeLeft--;
    window.respawnTimerTextEl.textContent = String(window.respawnTimeLeft);
    if (window.respawnTimeLeft <= 0) {
      window.clearRespawnTimer();
      window.respawnOverlay.classList.add("hidden");
      window.finalizeGameOver();
    }
  }, 1000);
}

window.clearRespawnTimer = function() {
  if (window.respawnTimerId) { clearInterval(window.respawnTimerId); window.respawnTimerId = null; }
}

window.goHome = function() {
  window.state = "ready";
  if (window.rafId !== null) {
    cancelAnimationFrame(window.rafId);
    window.rafId = null;
  }
  window.stopBgm();
  window.renderPickers();
  window.showScreen("home");
  window.playHomeBg();
}

// Main render loop (global)
window.draw = function(dt = 0) {
  window.ctx.clearRect(0, 0, window.W, window.H);
  window.updateAndDrawDecorations(dt);
  window.drawMelons(); window.drawPipes(); window.drawCockroaches(); window.drawMelodies();
  window.drawGround();
  window.drawHitShield();
  
  // Draw bird directly (not via function call to avoid scope issues)
  if (window.bird) {
    const s = window.bird.size;
    const skillEndingSoon = [window.systumHackTimer, window.vandeBoostTimer, window.pappuHamzaTimer]
      .some(timer => timer > 0 && timer <= 3);
    window.ctx.save();
    window.ctx.translate(window.bird.x, window.bird.y);
    window.ctx.rotate(window.bird.rotation);
    if (skillEndingSoon && Math.floor(window.elapsed * 8) % 2 !== 0) {
      window.ctx.globalAlpha = 0.3;
    }
    if (window.currentVehicleImg && window.currentVehicleImg.complete && window.currentVehicleImg.naturalWidth > 0) {
      window.ctx.drawImage(window.currentVehicleImg, -s / 2, -s / 2, s, s);
    } else {
      window.ctx.fillStyle = "#ff7a1a";
      window.ctx.beginPath();
      window.ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      window.ctx.fill();
    }
    window.ctx.restore();
  }
  window.drawPappuEffects();
  window.drawParticles();
}

window.startGameLoop = function() {
  if (window.rafId !== null || !window.gameScreen.classList.contains("active")) return;
  window.lastTime = performance.now();
  window.rafId = requestAnimationFrame(window.loop);
}

window.loop = function(ts) {
  window.rafId = null;
  if (!window.gameScreen.classList.contains("active")) return;
  const dt = Math.min(0.033, (ts - window.lastTime) / 1000 || 0);
  window.lastTime = ts;
  const active = window.state === "playing" || window.state === "ready";
  if (active) window.update(dt);
  window.draw(active ? dt : 0);
  if (window.state === "playing" || window.state === "ready") {
    window.rafId = requestAnimationFrame(window.loop);
  }
}

// Canvas setup (global)
window.W = 0; window.H = 0; window.DPR = 1; window.groundH = 0;
window.resizeCanvas = function() {
  const maxDpr = window.app && window.app.getAttribute("data-theme") === "diwali" ? 1.25 : 2;
  window.DPR = Math.min(window.devicePixelRatio || 1, maxDpr);
  window.W = window.innerWidth; window.H = window.innerHeight;
  window.canvas.width = Math.floor(window.W * window.DPR);
  window.canvas.height = Math.floor(window.H * window.DPR);
  window.canvas.style.width = window.W + "px";
  window.canvas.style.height = window.H + "px";
  window.ctx.setTransform(window.DPR, 0, 0, window.DPR, 0, 0);
  window.groundH = window.H * window.GROUND_HEIGHT_RATIO;
}

// Initialize (global) - Now async to load saved data from Capacitor
window.init = async function() {
  // Get DOM references after DOM is ready (MUST BE FIRST)
  window.app = document.getElementById("app");
  window.homeScreen = document.getElementById("home-screen");
  window.gameScreen = document.getElementById("game-screen");
  window.themeScreen = document.getElementById("theme-screen");
  window.vehicleScreen = document.getElementById("vehicle-screen");
  window.songScreen = document.getElementById("song-screen");
  window.storeScreen = document.getElementById("store-screen");
  window.canvas = document.getElementById("game-canvas");
  window.ctx = window.canvas.getContext("2d");
  
  // Set UI module DOM references FIRST
  window.homeBestScoreEl = document.getElementById("home-best-score");
  window.homeCoinsEl = document.getElementById("home-coins");
  window.homeMelodiesEl = document.getElementById("home-melodies");
  window.homeHitsEl = document.getElementById("home-hits");
  window.homeSystumChargesEl = document.getElementById("home-systum-charges");
  window.homeVandeChargesEl = document.getElementById("home-vande-charges");
  window.homePappuChargesEl = document.getElementById("home-pappu-charges");
  window.themeListEl = document.getElementById("theme-list");
  window.vehicleListEl = document.getElementById("vehicle-list");
  window.songListEl = document.getElementById("song-list");
  window.storeListEl = document.getElementById("store-list");
  
  // Set allScreens for navigation
  window.allScreens = [window.homeScreen, window.gameScreen, window.themeScreen, window.vehicleScreen, window.songScreen, window.storeScreen];
  
  // Now get the rest of the DOM references
  window.playBtn = document.getElementById("play-btn");
  window.menuThemesBtn = document.getElementById("menu-themes-btn");
  window.menuVehiclesBtn = document.getElementById("menu-vehicles-btn");
  window.menuSongsBtn = document.getElementById("menu-songs-btn");
  window.menuStoreBtn = document.getElementById("menu-store-btn");
  window.pauseBtn = document.getElementById("pause-btn");
  window.systumSkillBtn = document.getElementById("systum-skill-btn");
  window.systumSkillStatusEl = document.getElementById("systum-skill-status");
  window.vandeSkillBtn = document.getElementById("vande-skill-btn");
  window.vandeSkillStatusEl = document.getElementById("vande-skill-status");
  window.pappuSkillBtn = document.getElementById("pappu-skill-btn");
  window.pappuSkillStatusEl = document.getElementById("pappu-skill-status");
  window.resumeBtn = document.getElementById("resume-btn");
  window.pauseHomeBtn = document.getElementById("pause-home-btn");
  window.goHomeBtn = document.getElementById("go-home-btn");
  window.retryBtn = document.getElementById("retry-btn");
  window.respawnBtn = document.getElementById("respawn-btn");
  window.noRespawnBtn = document.getElementById("no-respawn-btn");
  window.spinBtn = document.getElementById("spin-btn");
  window.closeRouletteBtn = document.getElementById("close-roulette-btn");
  window.rouletteOverlay = document.getElementById("roulette-overlay");
  window.rouletteTrack = document.getElementById("roulette-track");
  window.respawnOverlay = document.getElementById("respawn-overlay");
  window.gameoverOverlay = document.getElementById("gameover-overlay");
  window.pauseOverlay = document.getElementById("pause-overlay");
  window.getReadyOverlay = document.getElementById("get-ready-overlay");
  window.hudScoreEl = document.getElementById("hud-score");
  window.hudHitsEl = document.getElementById("hud-hits");
  window.hudMelodiesEl = document.getElementById("hud-melodies");
  window.goScoreEl = document.getElementById("go-score");
  window.goBestEl = document.getElementById("go-best");
  window.goCoinsEl = document.getElementById("go-coins");
  window.goMelodiesEl = document.getElementById("go-melodies");
  window.respawnCostText = document.getElementById("respawn-cost-text");
  window.respawnTimerEl = document.getElementById("respawn-timer");
  window.respawnTimerTextEl = document.getElementById("respawn-timer-text");

  // Tips & Settings UI (global)
  window.tipsBtn = document.getElementById("tips-btn");
  window.settingsBtn = document.getElementById("settings-btn");
  window.tipsOverlay = document.getElementById("tips-overlay");
  window.tipsCloseBtn = document.getElementById("tips-close-btn");
  window.settingsOverlay = document.getElementById("settings-overlay");
  window.settingsCloseBtn = document.getElementById("settings-close-btn");
  window.sfxVolumeInput = document.getElementById("sfx-volume");
  window.bgmVolumeInput = document.getElementById("bgm-volume");
  window.randomSongsToggle = document.getElementById("random-songs-toggle");

  // Apply saved audio volume settings
  window.sfxVolumeInput.value = window.audioSettings.sfx;
  window.bgmVolumeInput.value = window.audioSettings.bgm;
  window.randomSongsToggle.checked = window.audioSettings.randomSongs;
  window.applyAudioVolumes();

  window.resizeCanvas();
  window.addEventListener("resize", window.resizeCanvas);

  // ===========================================================
  // LOAD SAVED PLAYER DATA ASYNCHRONOUSLY
  // ===========================================================
  await window.loadSavedPlayerData();
  
  // Update home screen with loaded data
  window.homeBestScoreEl.textContent = window.save.bestScore;
  window.homeCoinsEl.textContent = window.save.coins;
  window.homeMelodiesEl.textContent = window.save.melodies;
  window.homeHitsEl.textContent = window.save.hits;

  // ===========================================================
  // HARDWARE BACK BUTTON HANDLER (Capacitor)
  // ===========================================================
  if (window.isCapacitorAvailable() && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
      // If game is actively running, pause it
      if (window.state === "playing") {
        window.playTap();
        window.state = "paused";
        window.pauseOverlay.classList.remove("hidden");
        window.audioBgm.pause();
        return;
      }
      
      // If in shop or themes submenu, go back to home
      if (window.state !== "ready" && window.state !== "paused") {
        window.playTap();
        window.stopPreview();
        window.renderPickers();
        window.showScreen("home");
        return;
      }
      
      // If on main home title menu, implement double-tap to exit
      if (window.state === "ready" || window.state === "paused") {
        if (!window.backButtonTimer) {
          // First tap - show toast message
          window.backButtonTimer = setTimeout(() => {
            window.backButtonTimer = null;
          }, 2000);
          
          // Create toast notification
          const toast = document.createElement("div");
          toast.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px 40px;border-radius:10px;font-size:18px;z-index:9999;font-family:Arial,sans-serif;";
          toast.textContent = "Press back arrow again to exit Flappy Modi";
          document.body.appendChild(toast);
          
          setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
          }, 1500);
        } else {
          // Second tap within 2 seconds - exit app
          clearTimeout(window.backButtonTimer);
          window.backButtonTimer = null;
          window.Capacitor.Plugins.App.exitApp();
        }
      }
    });
  }

  // Event listeners
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") {
      window.onInputStart(e);
      return;
    }
    if (e.repeat || (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable='true']"))) return;
    if (!window.gameScreen.classList.contains("active") || window.state !== "playing") return;
    const skillActions = {
      Digit1: window.activateSystumHack,
      Numpad1: window.activateSystumHack,
      Digit2: window.activateVandeBoost,
      Numpad2: window.activateVandeBoost,
      Digit3: window.activatePappuHamza,
      Numpad3: window.activatePappuHamza,
    };
    const activateSkill = skillActions[e.code];
    if (activateSkill) {
      e.preventDefault();
      activateSkill();
    }
  });
  document.addEventListener("pointerdown", window.onInputStart, { passive: false });
  document.addEventListener("touchstart", window.onInputStart, { passive: false });
  document.addEventListener("mousedown", window.onInputStart);

  window.pauseBtn.addEventListener("click", () => {
    if (window.state !== "playing") return;
    window.playTap(); window.state = "paused";
    window.pauseOverlay.classList.remove("hidden");
    window.audioBgm.pause();
  });
  window.systumSkillBtn.addEventListener("click", window.activateSystumHack);
  window.vandeSkillBtn.addEventListener("click", window.activateVandeBoost);
  window.pappuSkillBtn.addEventListener("click", window.activatePappuHamza);
  window.resumeBtn.addEventListener("click", () => {
    window.playTap(); window.state = "playing";
    window.pauseOverlay.classList.add("hidden");
    window.audioBgm.play().catch(() => {});
    window.startGameLoop();
  });
  window.pauseHomeBtn.addEventListener("click", () => { window.playTap(); window.stopBgm(); window.goHome(); });
  window.goHomeBtn.addEventListener("click", () => { window.playTap(); window.goHome(); });
  window.retryBtn.addEventListener("click", () => { window.playTap(); window.playSound(window.audioStart); window.startNewGame(); });

  window.respawnBtn.addEventListener("click", () => { window.playTap(); window.clearRespawnTimer(); window.doRespawn(); });
  window.noRespawnBtn.addEventListener("click", () => {
    window.playTap(); window.clearRespawnTimer();
    window.playSound(window.audioGiveUp);
    window.respawnOverlay.classList.add("hidden");
    window.finalizeGameOver();
  });

  // Menu buttons
  window.menuThemesBtn.addEventListener("click", () => { window.playTap(); window.stopPreview(); window.showScreen("themes"); });
  window.menuVehiclesBtn.addEventListener("click", () => { window.playTap(); window.stopPreview(); window.showScreen("vehicles"); });
  window.menuSongsBtn.addEventListener("click", () => { window.playTap(); window.stopPreview(); window.showScreen("songs"); });
  window.menuStoreBtn.addEventListener("click", () => { window.playTap(); window.stopPreview(); window.renderStore(); window.showScreen("store"); });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.playTap(); window.stopPreview(); window.renderPickers(); window.showScreen("home");
    });
  });

  window.playBtn.addEventListener("click", () => {
    window.playTap(); window.playSound(window.audioStart); window.stopHomeBg(); window.stopPreview(); window.startNewGame();
  });

  // Tips overlay
  window.tipsBtn.addEventListener("click", () => {
    window.playTap(); window.stopPreview();
    window.tipsOverlay.classList.remove("hidden");
  });
  window.tipsCloseBtn.addEventListener("click", () => {
    window.playTap();
    window.tipsOverlay.classList.add("hidden");
  });
  window.tipsOverlay.addEventListener("click", (e) => {
    if (e.target === window.tipsOverlay) window.tipsOverlay.classList.add("hidden");
  });

  // Settings overlay
  window.settingsBtn.addEventListener("click", () => {
    window.playTap(); window.stopPreview();
    window.settingsOverlay.classList.remove("hidden");
  });
  window.settingsCloseBtn.addEventListener("click", () => {
    window.playTap();
    window.settingsOverlay.classList.add("hidden");
  });
  window.settingsOverlay.addEventListener("click", (e) => {
    if (e.target === window.settingsOverlay) window.settingsOverlay.classList.add("hidden");
  });

  // Volume sliders
  window.sfxVolumeInput.addEventListener("input", () => {
    window.audioSettings.sfx = parseFloat(window.sfxVolumeInput.value);
    window.saveAudioSettings();
    window.applyAudioVolumes();
    if (!window.sfxVolumeInput.dataset.touched) {
      window.sfxVolumeInput.dataset.touched = "1";
      window.playTap();
    }
  });
  window.bgmVolumeInput.addEventListener("input", () => {
    window.audioSettings.bgm = parseFloat(window.bgmVolumeInput.value);
    window.saveAudioSettings();
    window.applyAudioVolumes();
  });
  window.randomSongsToggle.addEventListener("change", () => {
    window.audioSettings.randomSongs = window.randomSongsToggle.checked;
    window.saveAudioSettings();
  });

  window.spinBtn.addEventListener("click", window.spinRoulette);
  window.closeRouletteBtn.addEventListener("click", () => { window.playTap(); window.stopAnimationSound(); window.hideRoulette(); window.showScreen("store"); });
  window.rouletteOverlay.addEventListener("click", (e) => { if (e.target === window.rouletteOverlay) e.stopPropagation(); });
  
  // Prize notification close button
  const prizeCloseBtn = document.getElementById("prize-close-btn");
  if (prizeCloseBtn) {
    prizeCloseBtn.addEventListener("click", () => {
      window.playTap();
      const notification = document.getElementById("prize-notification");
      if (notification) {
        notification.classList.add("hidden");
      }
      window.stopAnimationSound();
      window.hideRoulette();
      window.renderStore();
      window.showScreen("store");
    });
  }

  // Theme observer
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        window.resizeCanvas();
        window.buildThemeDecorations();
      }
    });
  });
  themeObserver.observe(window.app, { attributes: true });

  // Prevent scroll on game screen
  document.addEventListener("touchmove", (e) => {
    if (window.gameScreen.classList.contains("active")) e.preventDefault();
  }, { passive: false });

  // Preload images
  window.VEHICLES.forEach(v => window.loadImage(v.img));
  window.loadImage("images/cockroach.png");
  window.loadImage("images/attack.png");
  window.loadImage("images/meloni1.png");
  window.loadImage("images/meloni2.png");
  window.loadImage("images/meloni3.png");
  window.loadImage("images/meloni4.png");
  window.loadImage("images/melody .png");
  window.loadImage("images/hit.png");
  window.loadImage("images/logo.png");
  window.loadImage("images/intrologo.jpg");

  // Home bg will be started after intro video finishes (in finishIntro)
  // Do NOT start it on first interaction here - that would conflict with intro video

  // Initialize game
  window.buildThemeDecorations();
  window.addEventListener("resize", window.buildThemeDecorations);
  window.applyTheme(window.save.selectedTheme);
  window.renderPickers();
}

window.introFinished = false;
window.skipBtnTimer = null;
window.introTimer = null;

// Intro video helpers (global)
window.finishIntro = function() {
  if (window.introFinished) return;
  window.introFinished = true;

  if (window.skipBtnTimer) {
    clearTimeout(window.skipBtnTimer);
    window.skipBtnTimer = null;
  }
  if (window.introTimer) {
    clearTimeout(window.introTimer);
    window.introTimer = null;
  }

  const loadingScreen = document.getElementById("loading-screen");
  const introVideo = document.getElementById("intro-video");
  const skipBtn = document.getElementById("skip-intro-btn");
  const homeScreen = document.getElementById("home-screen");
  
  if (introVideo) {
    introVideo.onended = null;
    introVideo.pause();
    introVideo.currentTime = 0;
    introVideo.classList.add("hidden");
  }

  if (skipBtn) {
    skipBtn.classList.add("hidden");
  }
  
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    // Reset pointer events in case it was disabled during intro
    loadingScreen.style.pointerEvents = "";
  }
  
  if (homeScreen) {
    homeScreen.classList.add("active");
  }
  
  // Play the short intro voice, then start the home background music
  window.playIntroAudioSequence();
  
  // Remove loading screen from DOM after animation completes
  setTimeout(() => {
    if (loadingScreen && loadingScreen.parentElement) {
      loadingScreen.style.display = "none";
    }
  }, 500);
}

window.skipIntro = function() {
  window.playTap();
  window.finishIntro();
}

// Start the game when DOM is ready - now async
async function startGame() {
  // Show loading screen initially
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.remove("hidden");
  }
  
  // Hide home screen initially until loaded
  window.homeScreen = document.getElementById("home-screen");
  if (window.homeScreen) {
    window.homeScreen.classList.remove("active");
  }
  
  try {
    await window.init();
    
    // Play intro video with sound
    const introVideo = document.getElementById("intro-video");
    const skipBtn = document.getElementById("skip-intro-btn");
    
    if (introVideo) {
      const tapToStartOverlay = document.getElementById("tap-to-start-overlay");
      const tapToStartBtn = document.getElementById("tap-to-start-btn");
      let introStarted = false;
      
      // Show the Tap to Start overlay first (video is hidden, no autoplay)
      if (tapToStartOverlay) tapToStartOverlay.classList.remove("hidden");
      
      // Start intro video WITH SOUND on "Tap to Start" button
      // (browser allows unmuted playback in response to a user gesture)
      const startIntroWithSound = () => {
        if (introStarted) return;
        introStarted = true;
        
        // Show the video (remove hidden class) and play with sound
        introVideo.classList.remove("hidden");
        introVideo.muted = false;
        introVideo.volume = 0.8;
        introVideo.currentTime = 0;
        introVideo.play().catch(() => {});

        introVideo.onended = () => {
          window.finishIntro();
        };

        // Hide the Tap to Start overlay
        if (tapToStartOverlay) tapToStartOverlay.classList.add("hidden");
        
        // Disable touch response in the intro page so tapping does NOT pause the video
        if (loadingScreen) {
          loadingScreen.style.pointerEvents = "none";
        }
        if (skipBtn) {
          skipBtn.style.pointerEvents = "auto";
        }
        
        // Show skip button after 4 seconds
        window.skipBtnTimer = setTimeout(() => {
          if (skipBtn && !window.introFinished) {
            skipBtn.classList.remove("hidden");
          }
        }, 4000);
        
        // Auto-finish intro after 10 seconds
        window.introTimer = setTimeout(() => {
          window.finishIntro();
        }, 10000);
      };
      
      if (tapToStartBtn) {
        tapToStartBtn.addEventListener("click", startIntroWithSound);
      }
      if (tapToStartOverlay) {
        tapToStartOverlay.addEventListener("click", startIntroWithSound);
      }
    }
    
    // Skip button click handler
    if (skipBtn) {
      skipBtn.addEventListener("click", window.skipIntro);
    }
    
  } catch (error) {
    console.error("Failed to initialize game:", error);
    window.finishIntro();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startGame);
} else {
  startGame();
}
