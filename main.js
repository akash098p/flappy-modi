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
      };
    }
  } catch (e) { /* ignore */ }
  return { sfx: 0.8, bgm: 0.88 };
})();

window.saveAudioSettings = function() {
  try { localStorage.setItem(window.SETTINGS_KEY, JSON.stringify(window.audioSettings)); }
  catch (e) { /* ignore */ }
}

// Base volumes for each audio element (multiplied by user's setting)
window.SFX_AUDIO_IDS = [
  ["audioJump", 0.7], ["audioGameover", 0.8], ["audioStart", 0.8],
  ["audioMelody", 0.9], ["audioTap", 0.7], ["audioPurchase", 0.8],
  ["audioOoh", 0.85], ["audioKya", 0.9], ["audioRewards", 0.8],
];
window.BGM_AUDIO_IDS = [
  ["audioBgm", 0.88], ["audioHomeBg", 0.9], ["audioPreview", 0.5], ["audioAnimation", 0.7],
];

window.applyAudioVolumes = function() {
  window.SFX_AUDIO_IDS.forEach(([key, base]) => {
    const el = window[key];
    if (el) el.volume = base * window.audioSettings.sfx;
  });
  window.BGM_AUDIO_IDS.forEach(([key, base]) => {
    const el = window[key];
    if (el) el.volume = base * window.audioSettings.bgm;
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

// Save system (global)
window.defaultSave = function() {
  return {
    bestScore: 0, coins: 0, melodies: 0, hits: 2,
    unlockedThemes: ["day"], unlockedVehicles: ["flappy1"],
    selectedTheme: "day", selectedVehicle: "flappy1", selectedSong: "udta",
  };
}

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

window.save = window.loadSave();

// HUD update (global)
window.updateHud = function() {
  window.hudHitsEl.textContent = window.save.hits;
  window.hudMelodiesEl.textContent = window.save.melodies;
}

// Respawn cost calculation (global)
window.getRespawnCost = function() {
  return Math.pow(2, window.respawnCount);
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
    size: Math.max(50, Math.min(80, window.W * 0.14)),
  };
  window.pipes = []; window.cockroaches = []; window.melons = []; window.melodies = []; window.particles = [];
  window.score = 0; window.elapsed = 0; window.pipeTimer = 0;
  window.cockroachTimer = window.rand(window.COCKROACH_INTERVAL_MIN, window.COCKROACH_INTERVAL_MAX);
  window.melonTimer = window.rand(window.MELON_INTERVAL_MIN, window.MELON_INTERVAL_MAX);
  window.melodyTimer = window.rand(window.MELODY_INTERVAL_MIN, window.MELODY_INTERVAL_MAX);
  window.melodiesThisRun = 0; window.respawnCount = 0; window.groundOffset = 0;

  window.state = "ready";
  window.hudScoreEl.textContent = "0";
  window.updateHud();
  window.getReadyOverlay.classList.remove("hidden");
  window.pauseOverlay.classList.add("hidden");
  window.gameoverOverlay.classList.add("hidden");
  window.respawnOverlay.classList.add("hidden");

  window.showScreen("game");
  window.lastTime = performance.now();
  if (window.rafId) cancelAnimationFrame(window.rafId);
  window.rafId = requestAnimationFrame(window.loop);
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
  window.groundOffset -= window.PIPE_SPEED * dt;
  if (window.groundOffset < -64) window.groundOffset += 64;

  if (window.state !== "playing") return;

  // Bird physics
  if (window.state === "playing") {
    window.bird.vy += window.GRAVITY * dt;
    window.bird.vy = Math.min(window.bird.vy, window.MAX_FALL_SPEED);
    window.bird.y += window.bird.vy * dt;
    window.bird.rotation = Math.max(-0.5, Math.min(1.1, window.bird.vy / 500));
  }

  if (window.bird.y < window.bird.size * 0.4) { window.bird.y = window.bird.size * 0.4; window.bird.vy = 0; }
  if (window.bird.y + window.bird.size * 0.5 > window.H - window.groundH) {
    window.bird.y = window.H - window.groundH - window.bird.size * 0.5;
    return window.endGame();
  }

  // Pipes
  const speed = window.PIPE_SPEED + Math.min(window.score * 2.5, 90);
  window.pipeTimer += dt;
  if (window.pipeTimer >= window.PIPE_INTERVAL) { window.pipeTimer = 0; window.spawnPipePair(); }
  for (let i = window.pipes.length - 1; i >= 0; i--) {
    const p = window.pipes[i];
    p.x -= speed * dt;
    if (!p.passed && p.x + window.PIPE_WIDTH < window.bird.x) {
      p.passed = true; window.score++; window.hudScoreEl.textContent = window.score; window.spawnCoinBurst();
    }
    if (p.x < -window.PIPE_WIDTH - 10) window.pipes.splice(i, 1);
    if (window.circleRectCollision(window.bird, { x: p.x, y: 0, w: window.PIPE_WIDTH, h: p.gapTop }) ||
        window.circleRectCollision(window.bird, { x: p.x, y: p.gapBottom, w: window.PIPE_WIDTH, h: (window.H - window.groundH) - p.gapBottom })) {
      return window.endGame();
    }
  }

  // Cockroaches
  window.cockroachTimer -= dt;
  if (window.cockroachTimer <= 0) { window.spawnCockroach(); window.cockroachTimer = window.rand(window.COCKROACH_INTERVAL_MIN, window.COCKROACH_INTERVAL_MAX); }
  for (let i = window.cockroaches.length - 1; i >= 0; i--) {
    const c = window.cockroaches[i];
    c.x += c.vx * dt; c.bob += dt * 6;
    if (c.x < -120 || c.x > window.W + 120) { window.cockroaches.splice(i, 1); continue; }
    const cy = c.y + Math.sin(c.bob) * 8;
    if (window.circleCircleCollision(window.bird, { x: c.x, y: cy, r: c.size * 0.34 })) {
      if (window.save.hits > 0) {
        window.save.hits--; window.saveSave(window.save); window.updateHud();
        window.cockroaches.splice(i, 1); window.bird.vy = -200;
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
      m.collected = true; window.melodiesThisRun++; window.save.melodies++;
      window.saveSave(window.save); window.updateHud(); window.playSound(window.audioMelody);
      window.spawnMelodyBurst(m.x, m.y); window.melodies.splice(i, 1);
    }
  }

  // Particles
  for (let i = window.particles.length - 1; i >= 0; i--) {
    const pt = window.particles[i];
    pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 400 * dt;
    if (pt.life <= 0) window.particles.splice(i, 1);
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
  const earned = Math.max(0, Math.floor(window.score * window.COINS_PER_POINT));
  window.save.coins += earned;
  if (window.score > window.save.bestScore) window.save.bestScore = window.score;
  window.saveSave(window.save);

  window.goScoreEl.textContent = window.score;
  window.goBestEl.textContent = window.save.bestScore;
  window.goCoinsEl.textContent = earned;
  window.goMelodiesEl.textContent = window.melodiesThisRun;

  if (window.state !== "gameover") {
    window.state = "respawning";
    window.showRespawnOverlay();
  } else {
    window.gameoverOverlay.classList.remove("hidden");
  }
}

// Respawn (global)
window.doRespawn = function() {
  const cost = window.getRespawnCost();
  if (window.save.melodies < cost) { window.flashInsufficientCoins(); return; }
  window.save.melodies -= cost; window.respawnCount++;
  window.saveSave(window.save); window.updateHud();
  window.bird.x = window.W * 0.28; window.bird.y = window.H * 0.42; window.bird.vy = 0; window.bird.rotation = 0;
  window.cockroaches = window.cockroaches.filter(c => c.x < window.bird.x - 200 || c.x > window.bird.x + 300);
  window.pipes = window.pipes.filter(p => p.x < window.bird.x - 200 || p.x > window.bird.x + 300);
  window.respawnOverlay.classList.add("hidden");
  window.state = "playing";
  window.lastTime = performance.now();
  window.audioBgm.play().catch(() => {});
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
}

window.goHome = function() {
  window.state = "ready";
  if (window.rafId) cancelAnimationFrame(window.rafId);
  window.stopBgm();
  window.renderPickers();
  window.showScreen("home");
  window.playHomeBg();
}

// Main render loop (global)
window.draw = function() {
  window.ctx.clearRect(0, 0, window.W, window.H);
  window.updateAndDrawDecorations(1/60);
  window.drawMelons(); window.drawPipes(); window.drawCockroaches(); window.drawMelodies();
  window.drawGround();
  
  // Draw bird directly (not via function call to avoid scope issues)
  if (window.bird) {
    const s = window.bird.size;
    window.ctx.save();
    window.ctx.translate(window.bird.x, window.bird.y);
    window.ctx.rotate(window.bird.rotation);
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
  
  window.drawParticles();
}

window.loop = function(ts) {
  const dt = Math.min(0.033, (ts - window.lastTime) / 1000 || 0);
  window.lastTime = ts;
  if (window.state === "playing" || window.state === "ready") window.update(dt);
  else if (window.state !== "paused" && window.state !== "respawning") window.update(dt);
  window.draw();
  if (window.state !== "gameover" || window.gameoverJustEnded()) {
    window.rafId = requestAnimationFrame(window.loop);
  }
}

window.gameoverJustEnded = function() { return true; }

// Canvas setup (global)
window.W = 0; window.H = 0; window.DPR = 1; window.groundH = 0;
window.resizeCanvas = function() {
  window.DPR = Math.min(window.devicePixelRatio || 1, 2.5);
  window.W = window.innerWidth; window.H = window.innerHeight;
  window.canvas.width = Math.floor(window.W * window.DPR);
  window.canvas.height = Math.floor(window.H * window.DPR);
  window.canvas.style.width = window.W + "px";
  window.canvas.style.height = window.H + "px";
  window.ctx.setTransform(window.DPR, 0, 0, window.DPR, 0, 0);
  window.groundH = window.H * window.GROUND_HEIGHT_RATIO;
}

// Initialize (global)
window.init = function() {
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

  // Tips & Settings UI (global)
  window.tipsBtn = document.getElementById("tips-btn");
  window.settingsBtn = document.getElementById("settings-btn");
  window.tipsOverlay = document.getElementById("tips-overlay");
  window.tipsCloseBtn = document.getElementById("tips-close-btn");
  window.settingsOverlay = document.getElementById("settings-overlay");
  window.settingsCloseBtn = document.getElementById("settings-close-btn");
  window.sfxVolumeInput = document.getElementById("sfx-volume");
  window.bgmVolumeInput = document.getElementById("bgm-volume");

  // Apply saved audio volume settings
  window.sfxVolumeInput.value = window.audioSettings.sfx;
  window.bgmVolumeInput.value = window.audioSettings.bgm;
  window.applyAudioVolumes();

  window.resizeCanvas();
  window.addEventListener("resize", window.resizeCanvas);

  // Event listeners
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") window.onInputStart(e);
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
  window.resumeBtn.addEventListener("click", () => {
    window.playTap(); window.state = "playing";
    window.pauseOverlay.classList.add("hidden");
    window.lastTime = performance.now();
    window.audioBgm.play().catch(() => {});
  });
  window.pauseHomeBtn.addEventListener("click", () => { window.playTap(); window.stopBgm(); window.goHome(); });
  window.goHomeBtn.addEventListener("click", () => { window.playTap(); window.goHome(); });
  window.retryBtn.addEventListener("click", () => { window.playTap(); window.playSound(window.audioStart); window.startNewGame(); });

  window.respawnBtn.addEventListener("click", () => { window.playTap(); window.doRespawn(); });
  window.noRespawnBtn.addEventListener("click", () => {
    window.playTap();
    window.respawnOverlay.classList.add("hidden");
    window.state = "gameover";
    window.gameoverOverlay.classList.remove("hidden");
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

  window.spinBtn.addEventListener("click", window.spinRoulette);
  window.closeRouletteBtn.addEventListener("click", () => { window.stopAnimationSound(); window.hideRoulette(); window.showScreen("store"); });
  window.rouletteOverlay.addEventListener("click", (e) => { if (e.target === window.rouletteOverlay) e.stopPropagation(); });

  // Theme observer
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") window.buildThemeDecorations();
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
  window.loadImage("images/meloni1.png");
  window.loadImage("images/meloni2.png");
  window.loadImage("images/meloni3.png");
  window.loadImage("images/meloni4.png");
  window.loadImage("images/melody .png");
  window.loadImage("images/hit.png");
  window.loadImage("images/logo.png");

  // Start home bg on first interaction
  function startHomeBgOnFirstInteraction() {
    window.playHomeBg();
    document.removeEventListener("pointerdown", startHomeBgOnFirstInteraction);
    document.removeEventListener("keydown", startHomeBgOnFirstInteraction);
    document.removeEventListener("touchstart", startHomeBgOnFirstInteraction);
  }
  document.addEventListener("pointerdown", startHomeBgOnFirstInteraction, { once: true });
  document.addEventListener("keydown", startHomeBgOnFirstInteraction, { once: true });
  document.addEventListener("touchstart", startHomeBgOnFirstInteraction, { once: true });

  // Initialize game
  window.buildThemeDecorations();
  window.addEventListener("resize", window.buildThemeDecorations);
  window.applyTheme(window.save.selectedTheme);
  window.renderPickers();
}

// Start the game when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.init);
} else {
  window.init();
}
