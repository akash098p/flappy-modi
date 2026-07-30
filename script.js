/* ===========================================================
   FLAPPY MODI — game engine
=========================================================== */
(() => {
  "use strict";

  /* ---------------- Config ---------------- */
  const STORAGE_KEY = "flappyModiSave_v1";

  // Easy configuration - add new themes, vehicles, and songs here
  const CONFIG = {
    themes: [
      { id: "day",      name: "Day",      cost: 0,   swatch: "linear-gradient(180deg,#7ed6ff,#ffe9a8)" },
      { id: "night",    name: "Night",    cost: 15,  swatch: "linear-gradient(180deg,#0d1b3e,#3a3f7a)" },
      { id: "desert",   name: "Desert",   cost: 25,  swatch: "linear-gradient(180deg,#ffd58a,#ff9a56)" },
      { id: "ocean",    name: "Ocean",    cost: 45,  swatch: "linear-gradient(180deg,#bdf0ff,#4fb8d6)" },
      { id: "diwali",   name: "Diwali",   cost: 55, swatch: "linear-gradient(180deg,#1a0a2e,#ff6b35)" },
      { id: "independence", name: "Independence Day", cost: 65, swatch: "linear-gradient(180deg,#ff9933,#ffffff,#138808)" },
    ],
    vehicles: [
      { id: "flappy1", name: "Wing", cost: 0,   img: "images/flappy1.png" },
      { id: "flappy2", name: "Helicopter",  cost: 15,  img: "images/flappy2.png" },
      { id: "flappy3", name: "Car",    cost: 30, img: "images/flappy3.png" },
      { id: "flappy4", name: "Scooty",    cost: 45, img: "images/flappy4.png" },
      { id: "flappy5", name: "Tejas",    cost: 60, img: "images/flappy5.png" },
    ],
    songs: [
      { id: "udta",     name: "Udta Hi Phiru",        src: "audio/Udta-Hi-Phiru.mp3" },
      { id: "chura",    name: "Chura Ke Dil Mera",     src: "audio/Chura-Ke-Dil-Mera.mp3" },
      { id: "dope",     name: "Dope Shope",            src: "audio/Dope-Shope.mp3" },
      { id: "gaddiyan", name: "Gaddiyan Uchiya Rakhiya", src: "audio/Gaddiyan-Uchiya-Rakhiya.mp3" },
      { id: "blue",     name: "Blue Eyes",             src: "audio/Blue-Eyes.mp3" },
    ],
    game: {
      GRAVITY: 1500,
      FLAP_VELOCITY: -430,
      MAX_FALL_SPEED: 700,
      PIPE_GAP: 190,
      PIPE_WIDTH: 78,
      PIPE_INTERVAL: 1.5,
      PIPE_SPEED: 165,
      GROUND_HEIGHT_RATIO: 0.12,
      BIRD_SIZE: 44,
      COCKROACH_INTERVAL_MIN: 5.0,
      COCKROACH_INTERVAL_MAX: 8.0,
      MELON_INTERVAL_MIN: 4.5,
      MELON_INTERVAL_MAX: 8,
      MELODY_INTERVAL_MIN: 10,
      MELODY_INTERVAL_MAX: 22,
      MELODY_SIZE: 40,
      MELODY_SPEED: 150,
      COINS_PER_POINT: 1,
    },
    store: {
      HIT_COST: 5,
      MELODY_PACK_COST: 50,
    },
    roulette: [
      { id: 1, label: "2 Melodies",  icon: "images/melody .png", reward: 2,  type: "melody", chance: 0.34 },
      { id: 2, label: "4 Melodies",  icon: "images/melody .png", reward: 4,  type: "melody", chance: 0.19 },
      { id: 3, label: "5 Melodies",  icon: "images/melody .png", reward: 5,  type: "melody", chance: 0.14 },
      { id: 4, label: "20 Coins",    icon: "images/hit.png",     reward: 20, type: "coin",   chance: 0.20 },
      { id: 5, label: "10 Melodies", icon: "images/melody .png", reward: 10, type: "melody", chance: 0.08 },
      { id: 6, label: "15 Melodies", icon: "images/melody .png", reward: 15, type: "melody", chance: 0.05 },
    ]
  };

  // Shorthand references for easier use
  const THEMES = CONFIG.themes;
  const VEHICLES = CONFIG.vehicles;
  const SONGS = CONFIG.songs;
  const GAME_CONFIG = CONFIG.game;
  const STORE_ITEMS = CONFIG.store;
  const ROULETTE_PRIZES = CONFIG.roulette;
  
  const GRAVITY = GAME_CONFIG.GRAVITY;
  const FLAP_VELOCITY = GAME_CONFIG.FLAP_VELOCITY;
  const MAX_FALL_SPEED = GAME_CONFIG.MAX_FALL_SPEED;
  const PIPE_GAP = GAME_CONFIG.PIPE_GAP;
  const PIPE_WIDTH = GAME_CONFIG.PIPE_WIDTH;
  const PIPE_INTERVAL = GAME_CONFIG.PIPE_INTERVAL;
  const PIPE_SPEED = GAME_CONFIG.PIPE_SPEED;
  const GROUND_HEIGHT_RATIO = GAME_CONFIG.GROUND_HEIGHT_RATIO;
  const BIRD_SIZE = GAME_CONFIG.BIRD_SIZE;
  const COCKROACH_INTERVAL_MIN = GAME_CONFIG.COCKROACH_INTERVAL_MIN;
  const COCKROACH_INTERVAL_MAX = GAME_CONFIG.COCKROACH_INTERVAL_MAX;
  const MELON_INTERVAL_MIN = GAME_CONFIG.MELON_INTERVAL_MIN;
  const MELON_INTERVAL_MAX = GAME_CONFIG.MELON_INTERVAL_MAX;
  const MELODY_INTERVAL_MIN = GAME_CONFIG.MELODY_INTERVAL_MIN;
  const MELODY_INTERVAL_MAX = GAME_CONFIG.MELODY_INTERVAL_MAX;
  const MELODY_SIZE = GAME_CONFIG.MELODY_SIZE;
  const MELODY_SPEED = GAME_CONFIG.MELODY_SPEED;
  const COINS_PER_POINT = GAME_CONFIG.COINS_PER_POINT;
  const HIT_COST = STORE_ITEMS.HIT_COST;
  const MELODY_PACK_COST = STORE_ITEMS.MELODY_PACK_COST;

  /* ---------------- Save data ---------------- */
  function defaultSave() {
    return {
      bestScore: 0,
      coins: 0,
      melodies: 0,
      hits: 0,
      unlockedThemes: ["day"],
      unlockedVehicles: ["flappy1"],
      selectedTheme: "day",
      selectedVehicle: "flappy1",
      selectedSong: "udta",
    };
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      return { ...defaultSave(), ...parsed };
    } catch (e) {
      return defaultSave();
    }
  }

  function saveSave(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore quota errors */ }
  }

  let save = loadSave();

  /* ---------------- DOM refs ---------------- */
  const app = document.getElementById("app");
  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const themeScreen = document.getElementById("theme-screen");
  const vehicleScreen = document.getElementById("vehicle-screen");
  const songScreen = document.getElementById("song-screen");
  const storeScreen = document.getElementById("store-screen");

  const playBtn = document.getElementById("play-btn");
  const homeBestScoreEl = document.getElementById("home-best-score");
  const homeCoinsEl = document.getElementById("home-coins");
  const homeMelodiesEl = document.getElementById("home-melodies");
  const homeHitsEl = document.getElementById("home-hits");
  const themeListEl = document.getElementById("theme-list");
  const vehicleListEl = document.getElementById("vehicle-list");
  const songListEl = document.getElementById("song-list");
  const storeListEl = document.getElementById("store-list");

  const menuThemesBtn = document.getElementById("menu-themes-btn");
  const menuVehiclesBtn = document.getElementById("menu-vehicles-btn");
  const menuSongsBtn = document.getElementById("menu-songs-btn");
  const menuStoreBtn = document.getElementById("menu-store-btn");

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const hudScoreEl = document.getElementById("hud-score");
  const hudHitsEl = document.getElementById("hud-hits");
  const hudMelodiesEl = document.getElementById("hud-melodies");
  const pauseBtn = document.getElementById("pause-btn");

  const getReadyOverlay = document.getElementById("get-ready-overlay");
  const pauseOverlay = document.getElementById("pause-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const respawnOverlay = document.getElementById("respawn-overlay");
  const respawnCostText = document.getElementById("respawn-cost-text");
  const respawnBtn = document.getElementById("respawn-btn");
  const noRespawnBtn = document.getElementById("no-respawn-btn");

  const resumeBtn = document.getElementById("resume-btn");
  const pauseHomeBtn = document.getElementById("pause-home-btn");
  const retryBtn = document.getElementById("retry-btn");
  const goHomeBtn = document.getElementById("go-home-btn");

  const goScoreEl = document.getElementById("go-score");
  const goBestEl = document.getElementById("go-best");
  const goCoinsEl = document.getElementById("go-coins");
  const goMelodiesEl = document.getElementById("go-melodies");

  /* ---------------- Audio ---------------- */
  const audioJump = document.getElementById("audio-jump");
  const audioBgm = document.getElementById("audio-bgm");
  const audioGameover = document.getElementById("audio-gameover");
  const audioStart = document.getElementById("audio-start");
  const audioMelody = document.getElementById("audio-melody");
  const audioHomeBg = document.getElementById("audio-homebg");
  const audioTap = document.getElementById("audio-tap");
  const audioPurchase = document.getElementById("audio-purchase");
  const audioPreview = document.getElementById("audio-preview");
  const audioOoh = document.getElementById("audio-ooh");
  const audioKya = document.getElementById("audio-kya");
  const audioAnimation = document.getElementById("audio-animation");
  const audioRewards = document.getElementById("audio-rewards");
  audioBgm.volume = 0.88;
  audioJump.volume = 0.7;
  audioGameover.volume = 0.8;
  audioStart.volume = 0.8;
  audioMelody.volume = 0.9;
  audioHomeBg.volume = 0.9;
  audioTap.volume = 0.7;
  audioPurchase.volume = 0.8;
  audioPreview.volume = 0.5;
  audioOoh.volume = 0.85;
  audioKya.volume = 0.9;
  audioAnimation.volume = 0.7;
  audioRewards.volume = 0.8;

  function playSound(el) {
    try {
      el.currentTime = 0;
      el.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playTap() { playSound(audioTap); }
  function playPurchase() { playSound(audioPurchase); }

  // Game background music — uses the selected song
  function playBgm() {
    try {
      const song = SONGS.find(s => s.id === save.selectedSong) || SONGS[0];
      audioBgm.src = song.src;
      audioBgm.currentTime = 0;
      audioBgm.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }
  function stopBgm() {
    audioBgm.pause();
  }

  // Home background music — plays on home & sub-screens
  function playHomeBg() {
    try {
      audioHomeBg.currentTime = 0;
      audioHomeBg.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }
  function stopHomeBg() {
    audioHomeBg.pause();
  }

  // Song preview — plays a snippet, stops on second tap or when selecting
  let previewingSongId = null;
  function stopPreview() {
    if (previewingSongId) {
      audioPreview.pause();
      previewingSongId = null;
      // update UI: remove "playing" state from all preview buttons
      document.querySelectorAll(".song-preview-btn.playing").forEach(b => {
        b.classList.remove("playing");
        b.textContent = "▶";
      });
      // resume home background music now that preview is done
      playHomeBg();
    }
  }
  function togglePreview(songId) {
    const song = SONGS.find(s => s.id === songId);
    if (!song) return;
    if (previewingSongId === songId) {
      // same song tapped again → stop
      stopPreview();
      return;
    }
    stopPreview();
    // stop home bg so two sounds don't play together
    stopHomeBg();
    audioPreview.src = song.src;
    audioPreview.currentTime = 0;
    audioPreview.play().catch(() => {});
    previewingSongId = songId;
    // update UI
    const btn = document.querySelector(`.song-preview-btn[data-song="${songId}"]`);
    if (btn) {
      btn.classList.add("playing");
      btn.textContent = "■";
    }
  }
  // Stop preview when the preview audio ends naturally
  audioPreview.addEventListener("ended", stopPreview);

  /* ---------------- Image preload ---------------- */
  const imageCache = {};
  function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
  }
  VEHICLES.forEach(v => loadImage(v.img));
  loadImage("images/cockroach.png");
  loadImage("images/meloni1.png");
  loadImage("images/meloni2.png");
  loadImage("images/meloni3.png");
  loadImage("images/meloni4.png");
  loadImage("images/melody .png");
  loadImage("images/hit.png");
  loadImage("images/logo.png");

  /* ===========================================================
     HOME SCREEN — stats & pickers
  =========================================================== */
  function renderPickers() {
    homeBestScoreEl.textContent = save.bestScore;
    homeCoinsEl.textContent = save.coins;
    homeMelodiesEl.textContent = save.melodies;
    homeHitsEl.textContent = save.hits;

    // Themes
    themeListEl.innerHTML = "";
    THEMES.forEach(t => {
      const owned = save.unlockedThemes.includes(t.id);
      const selected = save.selectedTheme === t.id;
      const card = document.createElement("div");
      card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
      card.innerHTML = `
        <div class="lock-badge">🔒</div>
        <div class="pick-thumb theme-swatch" style="background:${t.swatch}">
          <div class="decorations"></div>
        </div>
        <div class="pick-name">${t.name}</div>
        ${owned ? "" : `<div class="pick-cost"><span class="coin-dot"></span>${t.cost}</div>`}
      `;
      card.addEventListener("click", () => selectOrUnlock("theme", t));
      themeListEl.appendChild(card);
    });

    // Vehicles
    vehicleListEl.innerHTML = "";
    VEHICLES.forEach(v => {
      const owned = save.unlockedVehicles.includes(v.id);
      const selected = save.selectedVehicle === v.id;
      const card = document.createElement("div");
      card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
      card.innerHTML = `
        <div class="lock-badge">🔒</div>
        <div class="pick-thumb">
          <div class="decorations"></div>
          <img src="${v.img}" alt="${v.name}" />
        </div>
        <div class="pick-name">${v.name}</div>
        ${owned ? "" : `<div class="pick-cost"><span class="coin-dot"></span>${v.cost}</div>`}
      `;
      card.addEventListener("click", () => selectOrUnlock("vehicle", v));
      vehicleListEl.appendChild(card);
    });

    // Songs
    renderSongs();
    // Store
    renderStore();
  }

  function renderStore() {
    storeListEl.innerHTML = "";
    
    // Hit item
    const hitCard = document.createElement("div");
    hitCard.className = "store-card";
    const canAffordHit = save.coins >= HIT_COST;
    hitCard.innerHTML = `
      <div class="store-card-icon"><img src="images/hit.png" alt="hit" /></div>
      <div class="store-card-info">
        <div class="store-card-name">1 Hit</div>
        <div class="store-card-desc">Protects from cockroach collision. You have: ${save.hits}</div>
      </div>
      <button class="store-buy-btn" ${canAffordHit ? "" : "disabled"}>
        <span class="coin-dot"></span>${HIT_COST}
      </button>
    `;
    const hitBuyBtn = hitCard.querySelector(".store-buy-btn");
    hitBuyBtn.addEventListener("click", () => {
      if (save.coins >= HIT_COST) {
        save.coins -= HIT_COST;
        save.hits++;
        playPurchase();
        saveSave(save);
        renderPickers();
      } else {
        flashInsufficientCoins();
      }
    });
    storeListEl.appendChild(hitCard);

    // Melody Pack item
    const packCard = document.createElement("div");
    packCard.className = "store-card";
    const canAffordPack = save.coins >= MELODY_PACK_COST;
    packCard.innerHTML = `
      <div class="store-card-icon"><img src="images/melody pack.png" alt="melody pack" /></div>
      <div class="store-card-info">
        <div class="store-card-name">Melody Pack</div>
        <div class="store-card-desc">Spin the roulette and win melodies!</div>
      </div>
      <button class="store-buy-btn" ${canAffordPack ? "" : "disabled"}>
        <span class="coin-dot"></span>${MELODY_PACK_COST}
      </button>
    `;
    const packBuyBtn = packCard.querySelector(".store-buy-btn");
    packBuyBtn.addEventListener("click", () => {
      if (save.coins >= MELODY_PACK_COST) {
        save.coins -= MELODY_PACK_COST;
        saveSave(save);
        playPurchase();
        renderPickers();
        showRoulette();
      } else {
        flashInsufficientCoins();
      }
    });
    storeListEl.appendChild(packCard);
  }

  function renderSongs() {
    songListEl.innerHTML = "";
    SONGS.forEach(s => {
      const selected = save.selectedSong === s.id;
      const card = document.createElement("div");
      card.className = "song-card" + (selected ? " selected" : "");
      card.innerHTML = `
        <button class="song-preview-btn" data-song="${s.id}">▶</button>
        <div class="song-info">
          <div class="song-name">${s.name}</div>
          <div class="song-status">${selected ? "✓ Selected" : "Tap to select"}</div>
        </div>
      `;
      // Preview button
      const previewBtn = card.querySelector(".song-preview-btn");
      previewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playTap();
        togglePreview(s.id);
      });
      // Select song on card tap
      card.addEventListener("click", () => {
        playTap();
        stopPreview();
        save.selectedSong = s.id;
        saveSave(save);
        renderSongs();
      });
      songListEl.appendChild(card);
    });
  }

  function selectOrUnlock(kind, item) {
    const unlockedKey = kind === "theme" ? "unlockedThemes" : "unlockedVehicles";
    const selectedKey = kind === "theme" ? "selectedTheme" : "selectedVehicle";
    const owned = save[unlockedKey].includes(item.id);

    if (owned) {
      save[selectedKey] = item.id;
      if (kind === "theme") applyTheme(item.id);
      playTap();
    } else {
      if (save.coins >= item.cost) {
        save.coins -= item.cost;
        save[unlockedKey].push(item.id);
        save[selectedKey] = item.id;
        if (kind === "theme") applyTheme(item.id);
        playPurchase();
      } else {
        flashInsufficientCoins(item);
        return;
      }
    }
    saveSave(save);
    renderPickers();
  }

  // Theme-specific decorations
  let themeDecorations = [];
  let decorTime = 0;
  
  function buildThemeDecorations() {
    const theme = app.getAttribute("data-theme");
    themeDecorations = [];
    
    if (theme === "day") {
      // One sun (fixed position)
      themeDecorations.push({
        type: "sun",
        x: W * 0.8,
        y: H * 0.15,
        s: 1.2
      });
      // Multiple clouds (moving)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "cloud",
          x: Math.random() * W,
          y: rand(H * 0.1, H * 0.35),
          s: rand(0.8, 1.3),
          speed: rand(8, 15)
        });
      }
      // Birds (moving)
      for (let i = 0; i < 3; i++) {
        themeDecorations.push({
          type: "bird",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.4),
          s: rand(0.6, 1.0),
          speed: rand(30, 50),
          wingPhase: Math.random() * Math.PI * 2
        });
      }
    } else if (theme === "night") {
      // One moon (fixed position)
      themeDecorations.push({
        type: "moon",
        x: W * 0.75,
        y: H * 0.15,
        s: 1.0
      });
      // Stars (twinkling)
      for (let i = 0; i < 30; i++) {
        themeDecorations.push({
          type: "star",
          x: Math.random() * W,
          y: rand(H * 0.05, H * 0.5),
          s: rand(0.5, 1.2),
          twinkle: Math.random() * Math.PI * 2
        });
      }
      // Clouds (moving slowly)
      for (let i = 0; i < 2; i++) {
        themeDecorations.push({
          type: "cloud",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.4),
          s: rand(0.7, 1.0),
          speed: rand(3, 6)
        });
      }
      // Owl (occasional)
      if (Math.random() > 0.5) {
        themeDecorations.push({
          type: "owl",
          x: W * 0.2,
          y: H * 0.3,
          s: 0.8,
          speed: 15
        });
      }
    } else if (theme === "desert") {
      // Pyramids (fixed, in background)
      themeDecorations.push({
        type: "pyramid",
        x: W * 0.15,
        y: H * 0.75,
        s: 1.5
      });
      themeDecorations.push({
        type: "pyramid",
        x: W * 0.85,
        y: H * 0.78,
        s: 1.2
      });
      // Cactus on ground (fixed positions)
      for (let i = 0; i < 3; i++) {
        themeDecorations.push({
          type: "cactus",
          x: rand(W * 0.1, W * 0.9),
          y: H * 0.82,
          s: rand(0.8, 1.2)
        });
      }
    } else if (theme === "ocean") {
      // Fish (moving)
      for (let i = 0; i < 5; i++) {
        themeDecorations.push({
          type: "fish",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.7),
          s: rand(0.7, 1.2),
          speed: rand(20, 40),
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      // Seaweed (swaying)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "seaweed",
          x: rand(W * 0.05, W * 0.95),
          y: H * 0.85,
          s: rand(0.8, 1.3),
          sway: Math.random() * Math.PI * 2
        });
      }
      // Bubbles (rising)
      for (let i = 0; i < 6; i++) {
        themeDecorations.push({
          type: "bubble",
          x: Math.random() * W,
          y: rand(H * 0.5, H * 0.9),
          s: rand(0.5, 1.0),
          speed: rand(10, 20)
        });
      }
    } else if (theme === "diwali") {
      // Diyas (moving)
      for (let i = 0; i < 5; i++) {
        themeDecorations.push({
          type: "diya",
          x: Math.random() * W,
          y: rand(H * 0.3, H * 0.7),
          s: rand(0.8, 1.2),
          speed: rand(10, 20)
        });
      }
    } else if (theme === "independence") {
      // Flags (moving)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "flag",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.6),
          s: rand(0.8, 1.2),
          speed: rand(15, 25)
        });
      }
    }
  }
  
  buildThemeDecorations();
  window.addEventListener("resize", buildThemeDecorations);
  
  // Rebuild decorations when theme changes
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        buildThemeDecorations();
      }
    });
  });
  themeObserver.observe(app, { attributes: true });
  
  function flashInsufficientCoins() {
    homeCoinsEl.parentElement.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "ease-out" }
    );
  }

  function applyTheme(themeId) {
    app.setAttribute("data-theme", themeId);
  }

  applyTheme(save.selectedTheme);
  renderPickers();

  /* ===========================================================
     SCREEN NAVIGATION
  =========================================================== */
  // All screens that can be shown
  const allScreens = [homeScreen, gameScreen, themeScreen, vehicleScreen, songScreen, storeScreen];

  function showScreen(name) {
    allScreens.forEach(s => s.classList.remove("active"));
    if (name === "home") homeScreen.classList.add("active");
    else if (name === "game") gameScreen.classList.add("active");
    else if (name === "themes") themeScreen.classList.add("active");
    else if (name === "vehicles") vehicleScreen.classList.add("active");
    else if (name === "songs") songScreen.classList.add("active");
    else if (name === "store") storeScreen.classList.add("active");
  }

  // Menu buttons → navigate to sub-screens
  menuThemesBtn.addEventListener("click", () => {
    playTap();
    stopPreview();
    showScreen("themes");
  });
  menuVehiclesBtn.addEventListener("click", () => {
    playTap();
    stopPreview();
    showScreen("vehicles");
  });
  menuSongsBtn.addEventListener("click", () => {
    playTap();
    stopPreview();
    showScreen("songs");
  });
  menuStoreBtn.addEventListener("click", () => {
    playTap();
    stopPreview();
    renderStore();
    showScreen("store");
  });

  // Back buttons → return to home
  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playTap();
      stopPreview();
      renderPickers(); // refresh stats in case coins changed
      showScreen("home");
    });
  });

  playBtn.addEventListener("click", () => {
    playTap();
    playSound(audioStart);
    stopHomeBg();
    stopPreview();
    startNewGame();
  });

  /* ===========================================================
     CANVAS SIZING
  =========================================================== */
  let W = 0, H = 0, DPR = 1;
  function resizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    groundH = H * GROUND_HEIGHT_RATIO;
  }
  let groundH = 0;
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  /* ===========================================================
     GAME STATE
  =========================================================== */
  let state = "ready"; // ready | playing | paused | gameover | respawning
  let bird, pipes, cockroaches, melons, melodies, particles;
  let score = 0;
  let elapsed = 0;
  let pipeTimer = 0;
  let cockroachTimer = 0;
  let melonTimer = 0;
  let melodyTimer = 0;
  let melodiesThisRun = 0;
  let lastTime = 0;
  let groundOffset = 0;
  let rafId = null;
  let currentVehicleImg = null;
  let respawnCount = 0;
  let cockroachSoundToggle = false; // Alternate between two sounds

  function updateHud() {
    hudHitsEl.textContent = save.hits;
    hudMelodiesEl.textContent = save.melodies;
  }

  // Respawn cost: 1st=1, 2nd=2, 3rd=4, 4th=8... (doubles each time)
  function getRespawnCost() {
    return Math.pow(2, respawnCount);
  }

  function startNewGame() {
    currentVehicleImg = loadImage(
      VEHICLES.find(v => v.id === save.selectedVehicle)?.img || VEHICLES[0].img
    );

    bird = {
      x: W * 0.28,
      y: H * 0.42,
      vy: 0,
      rotation: 0,
      size: Math.max(50, Math.min(80, W * 0.14)),
    };
    pipes = [];
    cockroaches = [];
    melons = [];
    melodies = [];
    particles = [];
    score = 0;
    elapsed = 0;
    pipeTimer = 0;
    cockroachTimer = rand(COCKROACH_INTERVAL_MIN, COCKROACH_INTERVAL_MAX);
    melonTimer = rand(MELON_INTERVAL_MIN, MELON_INTERVAL_MAX);
    melodyTimer = rand(MELODY_INTERVAL_MIN, MELODY_INTERVAL_MAX);
    melodiesThisRun = 0;
    respawnCount = 0;
    groundOffset = 0;

    state = "ready";
    hudScoreEl.textContent = "0";
    updateHud();
    getReadyOverlay.classList.remove("hidden");
    pauseOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");
    respawnOverlay.classList.add("hidden");

    showScreen("game");
    lastTime = performance.now();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  /* ---------------- Input ---------------- */
  // Flap/start input is bound at the document level (not just the canvas)
  // so it works no matter what element sits on top on a given device/browser.
  // Buttons and overlay controls are excluded via isInteractiveTarget,
  // so this never steals taps meant for real UI buttons.

  function isInteractiveTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      "button, .btn-primary, .btn-secondary, .pick-card, .song-card, .menu-btn, .back-btn, .store-buy-btn, #pause-btn"
    );
  }

  function startGameIfNeeded() {
    if (state === "ready") {
      state = "playing";
      getReadyOverlay.classList.add("hidden");
      playBgm();
    }
  }

  function flap() {
    if (state !== "playing" && state !== "ready") return;
    bird.vy = FLAP_VELOCITY;
    playSound(audioJump);
  }

  function onInputStart(e) {
    // Only handle input while the game screen is actually showing.
    if (!gameScreen.classList.contains("active")) return;
    // Don't hijack taps on real UI controls (pause button, overlay buttons, etc).
    if (isInteractiveTarget(e.target)) return;
    // Ignore input while paused or after game over — those have their own buttons.
    if (state === "paused" || state === "gameover" || state === "respawning") return;

    if (e && typeof e.preventDefault === "function") e.preventDefault();

    startGameIfNeeded();
    flap();
  }

  // Keyboard (desktop)
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") {
      onInputStart(e);
    }
  });

  // Pointer events (covers mouse, touch, and stylus on modern browsers)
  document.addEventListener("pointerdown", onInputStart, { passive: false });

  // Fallbacks for older/inconsistent mobile browsers that don't fire pointer events reliably
  document.addEventListener("touchstart", onInputStart, { passive: false });
  document.addEventListener("mousedown", onInputStart);

  pauseBtn.addEventListener("click", () => {
    if (state !== "playing") return;
    playTap();
    state = "paused";
    pauseOverlay.classList.remove("hidden");
    audioBgm.pause();
  });
  resumeBtn.addEventListener("click", () => {
    playTap();
    state = "playing";
    pauseOverlay.classList.add("hidden");
    lastTime = performance.now();
    audioBgm.play().catch(() => {});
  });
  pauseHomeBtn.addEventListener("click", () => {
    playTap();
    stopBgm();
    goHome();
  });
  goHomeBtn.addEventListener("click", () => {
    playTap();
    goHome();
  });
  retryBtn.addEventListener("click", () => {
    playTap();
    playSound(audioStart);
    startNewGame();
  });

  // Respawn overlay buttons
  respawnBtn.addEventListener("click", () => {
    playTap();
    doRespawn();
  });
  noRespawnBtn.addEventListener("click", () => {
    playTap();
    respawnOverlay.classList.add("hidden");
    // Proceed to actual game over screen
    state = "gameover";
    gameoverOverlay.classList.remove("hidden");
  });

  function doRespawn() {
    const cost = getRespawnCost();
    if (save.melodies < cost) {
      flashInsufficientCoins();
      return;
    }
    save.melodies -= cost;
    respawnCount++;
    saveSave(save);
    updateHud();

    bird.x = W * 0.28;
    bird.y = H * 0.42;
    bird.vy = 0;
    bird.rotation = 0;

    cockroaches = cockroaches.filter(c => c.x < bird.x - 200 || c.x > bird.x + 300);
    pipes = pipes.filter(p => p.x < bird.x - 200 || p.x > bird.x + 300);

    respawnOverlay.classList.add("hidden");
    state = "playing";
    lastTime = performance.now();
    audioBgm.play().catch(() => {});
  }

  function showRespawnOverlay() {
    const cost = getRespawnCost();
    const canRespawn = save.melodies >= cost;
    if (canRespawn) {
      respawnCostText.textContent = `Respawn for ${cost} melody${cost > 1 ? "s" : ""}? (You have ${save.melodies})`;
      respawnBtn.disabled = false;
      respawnBtn.textContent = "Respawn";
    } else {
      respawnCostText.textContent = `You need ${cost} melodies to respawn but you have only ${save.melodies}. Not enough melodies!`;
      respawnBtn.disabled = true;
      respawnBtn.textContent = "Not enough";
    }
    respawnOverlay.classList.remove("hidden");
    state = "respawning";
  }

  function goHome() {
    state = "ready";
    if (rafId) cancelAnimationFrame(rafId);
    stopBgm();
    renderPickers();
    showScreen("home");
    playHomeBg();
  }

  /* ===========================================================
     ROULETTE SYSTEM
  =========================================================== */
  const rouletteOverlay = document.getElementById("roulette-overlay");
  const rouletteTrack = document.getElementById("roulette-track");
  const spinBtn = document.getElementById("spin-btn");
  const closeRouletteBtn = document.getElementById("close-roulette-btn");

  function showRoulette() {
    rouletteOverlay.classList.remove("hidden");
    spinBtn.disabled = false;
    spinBtn.textContent = "SPIN!";
    buildRouletteTrack();
    // Reset track position
    rouletteTrack.style.transition = "none";
    rouletteTrack.style.transform = "translateX(0)";
    // Show spin button, hide close button initially
    spinBtn.style.display = "flex";
    closeRouletteBtn.style.display = "none";
  }

  function hideRoulette() {
    rouletteOverlay.classList.add("hidden");
    stopAnimationSound();
  }

  function buildRouletteTrack() {
    rouletteTrack.innerHTML = "";
    ROULETTE_PRIZES.forEach(prize => {
      const prizeEl = document.createElement("div");
      prizeEl.className = "roulette-prize";
      prizeEl.innerHTML = `
        <div class="roulette-prize-icon"><img src="${prize.icon}" alt="${prize.label}" /></div>
        <div class="roulette-prize-text">${prize.label}</div>
      `;
      rouletteTrack.appendChild(prizeEl);
    });
    rouletteTrack.style.transform = "translateX(0)";
  }

  function spinRoulette() {
    if (spinBtn.disabled) return;
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning...";
    // Hide spin button during animation
    spinBtn.style.display = "none";

    // Determine winning prize based on probability
    const rand = Math.random();
    let cumulative = 0;
    let winningPrize = ROULETTE_PRIZES[0];
    for (const prize of ROULETTE_PRIZES) {
      cumulative += prize.chance;
      if (rand <= cumulative) {
        winningPrize = prize;
        break;
      }
    }

    // Calculate spin distance
    const prizeIndex = ROULETTE_PRIZES.indexOf(winningPrize);
    const prizeWidth = 120; // width of each prize slot
    const trackWidth = ROULETTE_PRIZES.length * prizeWidth;
    const containerWidth = rouletteTrack.parentElement.offsetWidth;
    const maxScroll = trackWidth - containerWidth;
    
    // Random starting offset within the prize area (center of prize)
    const prizeOffset = (prizeWidth - containerWidth) / 2;
    const fullRotations = 3; // 3 full rotations
    const targetX = -(prizeIndex * prizeWidth + prizeOffset + fullRotations * trackWidth);
    
    // Ensure we don't scroll past the end
    const finalX = Math.max(targetX, -maxScroll - prizeWidth);
    
    // Start animation sound
    playAnimationSound();

    // Apply spin animation with custom easing (fast start, slow end)
    rouletteTrack.style.transition = "transform 3s cubic-bezier(0.15, 0.8, 0.3, 1)";
    rouletteTrack.style.transform = `translateX(${finalX}px)`;

    // After animation completes
    setTimeout(() => {
      stopAnimationSound();
      awardPrize(winningPrize);
      // Show close button instead of allowing another spin
      closeRouletteBtn.style.display = "flex";
      closeRouletteBtn.textContent = "Close & Return to Store";
    }, 3000);
  }

  function awardPrize(prize) {
    playRewardSound();
    
    if (prize.type === "melody") {
      save.melodies += prize.reward;
    } else if (prize.type === "coin") {
      save.coins += prize.reward;
    }
    
    saveSave(save);
    renderPickers();

    // Show reward notification
    setTimeout(() => {
      alert(`🎉 You won ${prize.label}!`);
    }, 300);
  }

  function playAnimationSound() {
    try {
      audioAnimation.currentTime = 0;
      audioAnimation.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function stopAnimationSound() {
    try {
      audioAnimation.pause();
      audioAnimation.currentTime = 0;
    } catch (e) { /* ignore */ }
  }

  function playRewardSound() {
    try {
      audioRewards.currentTime = 0;
      audioRewards.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  spinBtn.addEventListener("click", spinRoulette);
  
  closeRouletteBtn.addEventListener("click", () => {
    stopAnimationSound();
    hideRoulette();
    showScreen("store");
  });

  // Prevent closing roulette by clicking overlay background
  rouletteOverlay.addEventListener("click", (e) => {
    if (e.target === rouletteOverlay) {
      e.stopPropagation();
    }
  });

  /* ===========================================================
     ENTITIES
  =========================================================== */
  function spawnPipePair() {
    const margin = H * 0.12;
    const availableH = H - groundH - margin * 2 - PIPE_GAP;
    const gapTop = margin + Math.random() * Math.max(40, availableH);
    pipes.push({
      x: W + PIPE_WIDTH,
      gapTop,
      gapBottom: gapTop + PIPE_GAP,
      passed: false,
    });
  }

  function spawnCockroach() {
    // Cockroach flies from one side to the other at a random height in the upper-mid band
    const fromLeft = Math.random() < 0.5;
    const y = rand(H * 0.15, H * 0.55);
    cockroaches.push({
      x: fromLeft ? -80 : W + 80,
      y,
      vx: (fromLeft ? 1 : -1) * rand(140, 210),
      size: 46,
      bob: Math.random() * Math.PI * 2,
      flip: !fromLeft,
    });
  }

  function spawnMelon() {
    // Melon: drifts from top, pauses near mid-screen, then returns up and disappears (never collides)
    const melonImages = ["images/meloni1.png", "images/meloni2.png", "images/meloni3.png", "images/meloni4.png"];
    const imgKey = melonImages[Math.floor(Math.random() * melonImages.length)];
    melons.push({
      x: rand(W * 0.15, W * 0.85),
      y: -80,
      phase: "down", // down -> hold -> up
      timer: 0,
      holdDuration: rand(0.6, 1.2),
      targetY: rand(H * 0.28, H * 0.5),
      speed: rand(160, 220),
      size: 54,
      img: imgKey,
      opacity: 0,
    });
  }

  function spawnMelody() {
    // Rare collectible melody (diamond): scrolls left like pipes, collectible for +1 melody
    const y = rand(H * 0.18, H * 0.62);
    melodies.push({
      x: W + MELODY_SIZE,
      y,
      size: MELODY_SIZE,
      bob: Math.random() * Math.PI * 2,
      collected: false,
    });
  }

  /* ===========================================================
     UPDATE
  =========================================================== */
  function update(dt) {
    elapsed += dt;

    // ground scroll
    groundOffset -= PIPE_SPEED * dt;
    if (groundOffset < -64) groundOffset += 64;

    if (state !== "playing") return;

    // bird physics
    bird.vy += GRAVITY * dt;
    bird.vy = Math.min(bird.vy, MAX_FALL_SPEED);
    bird.y += bird.vy * dt;
    bird.rotation = Math.max(-0.5, Math.min(1.1, bird.vy / 500));

    // ceiling clamp
    if (bird.y < bird.size * 0.4) {
      bird.y = bird.size * 0.4;
      bird.vy = 0;
    }

    // ground collision
    if (bird.y + bird.size * 0.5 > H - groundH) {
      bird.y = H - groundH - bird.size * 0.5;
      return endGame();
    }

    // pipes
    const speed = PIPE_SPEED + Math.min(score * 2.5, 90);
    pipeTimer += dt;
    if (pipeTimer >= PIPE_INTERVAL) {
      pipeTimer = 0;
      spawnPipePair();
    }
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= speed * dt;
      if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
        p.passed = true;
        score++;
        hudScoreEl.textContent = score;
        spawnCoinBurst();
      }
      if (p.x < -PIPE_WIDTH - 10) pipes.splice(i, 1);

      // collision (bird bounding circle vs pipe rects)
      if (circleRectCollision(bird, {
        x: p.x, y: 0, w: PIPE_WIDTH, h: p.gapTop
      }) || circleRectCollision(bird, {
        x: p.x, y: p.gapBottom, w: PIPE_WIDTH, h: (H - groundH) - p.gapBottom
      })) {
        return endGame();
      }
    }

    // cockroaches
    cockroachTimer -= dt;
    if (cockroachTimer <= 0) {
      spawnCockroach();
      cockroachTimer = rand(COCKROACH_INTERVAL_MIN, COCKROACH_INTERVAL_MAX);
    }
    for (let i = cockroaches.length - 1; i >= 0; i--) {
      const c = cockroaches[i];
      c.x += c.vx * dt;
      c.bob += dt * 6;
      if (c.x < -120 || c.x > W + 120) {
        cockroaches.splice(i, 1);
        continue;
      }
      const cy = c.y + Math.sin(c.bob) * 8;
      if (circleCircleCollision(bird, { x: c.x, y: cy, r: c.size * 0.34 })) {
        // Cockroach collision!
        
        if (save.hits > 0) {
          // Use a Hit — consume one, remove the cockroach, continue playing
          save.hits--;
          saveSave(save);
          updateHud();
          cockroaches.splice(i, 1);
          bird.vy = -200;
          
          // Alternate between two sounds when hit is used
          if (cockroachSoundToggle) {
            playSound(audioKya);
          } else {
            playSound(audioOoh);
          }
          cockroachSoundToggle = !cockroachSoundToggle;
          continue;
        } else {
          // No hits — end game with game over sound only
          return endGame();
        }
      }
    }

    // melons — decorative, never collide
    melonTimer -= dt;
    if (melonTimer <= 0) {
      spawnMelon();
      melonTimer = rand(MELON_INTERVAL_MIN, MELON_INTERVAL_MAX);
    }
    for (let i = melons.length - 1; i >= 0; i--) {
      const m = melons[i];
      m.timer += dt;
      if (m.phase === "down") {
        m.opacity = Math.min(1, m.opacity + dt * 3);
        m.y += (m.targetY - m.y) * Math.min(1, dt * 2.2) + m.speed * dt * 0.4;
        if (Math.abs(m.y - m.targetY) < 6 || m.y >= m.targetY) {
          m.y = m.targetY;
          m.phase = "hold";
          m.timer = 0;
        }
      } else if (m.phase === "hold") {
        if (m.timer >= m.holdDuration) {
          m.phase = "up";
        }
      } else if (m.phase === "up") {
        m.y -= m.speed * dt;
        m.opacity = Math.max(0, m.opacity - dt * 1.3);
        if (m.y < -100 || m.opacity <= 0) {
          melons.splice(i, 1);
        }
      }
    }

    // melodies — rare collectible diamonds
    melodyTimer -= dt;
    if (melodyTimer <= 0) {
      spawnMelody();
      melodyTimer = rand(MELODY_INTERVAL_MIN, MELODY_INTERVAL_MAX);
    }
    for (let i = melodies.length - 1; i >= 0; i--) {
      const m = melodies[i];
      m.x -= speed * dt;
      m.bob += dt * 4;
      if (m.x < -MELODY_SIZE - 10) {
        melodies.splice(i, 1);
        continue;
      }
      // collection check (bird bounding circle vs melody circle)
      if (!m.collected && circleCircleCollision(bird, { x: m.x, y: m.y, r: m.size * 0.42 })) {
        m.collected = true;
        melodiesThisRun++;
        save.melodies++;
        saveSave(save);
        updateHud();
        playSound(audioMelody);
        spawnMelodyBurst(m.x, m.y);
        melodies.splice(i, 1);
      }
    }

    // particles (coin burst)
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 400 * dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }
  }

  function spawnMelodyBurst(x, y) {
    // cyan sparkle burst when a melody is collected
    for (let i = 0; i < 8; i++) {
      particles.push({
        x, y,
        vx: rand(-120, 120), vy: rand(-200, -40),
        life: 0.6, maxLife: 0.6,
        color: "melody",
      });
    }
  }

  function spawnCoinBurst() {
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: bird.x, y: bird.y,
        vx: rand(-60, 60), vy: rand(-160, -60),
        life: 0.5, maxLife: 0.5,
      });
    }
  }

  function circleRectCollision(circle, rect) {
    const r = circle.size * 0.36;
    const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy < r * r;
  }
  function circleCircleCollision(a, b) {
    const r = a.size * 0.36 + b.r;
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy < r * r;
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function computeCoinsEarned(finalScore) {
    return Math.max(0, Math.floor(finalScore * COINS_PER_POINT));
  }

  function endGame() {
    if (state === "gameover" || state === "respawning") {
      // If already respawning, just proceed to actual game over
    }
    stopBgm();
    playSound(audioGameover);

    const earned = computeCoinsEarned(score);
    save.coins += earned;
    if (score > save.bestScore) save.bestScore = score;
    saveSave(save);

    goScoreEl.textContent = score;
    goBestEl.textContent = save.bestScore;
    goCoinsEl.textContent = earned;
    goMelodiesEl.textContent = melodiesThisRun;

    // Show respawn overlay first (player can choose to respawn or give up)
    // Only show if this is the first time ending (not coming from "Give Up")
    if (state !== "gameover") {
      state = "respawning";
      showRespawnOverlay();
    } else {
      gameoverOverlay.classList.remove("hidden");
    }
  }

  /* ===========================================================
     RENDER
  =========================================================== */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    updateAndDrawDecorations(1/60);
    drawMelons();
    drawPipes();
    drawCockroaches();
    drawMelodies();
    drawGround();
    drawBird();
    drawParticles();
  }

  function buildThemeDecorations() {
    const theme = app.getAttribute("data-theme");
    themeDecorations = [];
    
    if (theme === "day") {
      // One sun (fixed position)
      themeDecorations.push({
        type: "sun",
        x: W * 0.8,
        y: H * 0.15,
        s: 1.2
      });
      // Multiple clouds (moving)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "cloud",
          x: Math.random() * W,
          y: rand(H * 0.1, H * 0.35),
          s: rand(0.8, 1.3),
          speed: rand(8, 15)
        });
      }
      // Birds (moving)
      for (let i = 0; i < 3; i++) {
        themeDecorations.push({
          type: "bird",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.4),
          s: rand(0.6, 1.0),
          speed: rand(30, 50),
          wingPhase: Math.random() * Math.PI * 2
        });
      }
    } else if (theme === "night") {
      // One moon (fixed position)
      themeDecorations.push({
        type: "moon",
        x: W * 0.75,
        y: H * 0.15,
        s: 1.0
      });
      // Stars (twinkling)
      for (let i = 0; i < 30; i++) {
        themeDecorations.push({
          type: "star",
          x: Math.random() * W,
          y: rand(H * 0.05, H * 0.5),
          s: rand(0.5, 1.2),
          twinkle: Math.random() * Math.PI * 2
        });
      }
      // Clouds (moving slowly)
      for (let i = 0; i < 2; i++) {
        themeDecorations.push({
          type: "cloud",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.4),
          s: rand(0.7, 1.0),
          speed: rand(3, 6)
        });
      }
      // Owl (occasional)
      if (Math.random() > 0.5) {
        themeDecorations.push({
          type: "owl",
          x: W * 0.2,
          y: H * 0.3,
          s: 0.8,
          speed: 15
        });
      }
    } else if (theme === "desert") {
      // Pyramids (fixed, in background)
      themeDecorations.push({
        type: "pyramid",
        x: W * 0.15,
        y: H * 0.75,
        s: 1.5
      });
      themeDecorations.push({
        type: "pyramid",
        x: W * 0.85,
        y: H * 0.78,
        s: 1.2
      });
      // Cactus on ground (fixed positions)
      for (let i = 0; i < 3; i++) {
        themeDecorations.push({
          type: "cactus",
          x: rand(W * 0.1, W * 0.9),
          y: H * 0.82,
          s: rand(0.8, 1.2)
        });
      }
    } else if (theme === "ocean") {
      // Fish (moving)
      for (let i = 0; i < 5; i++) {
        themeDecorations.push({
          type: "fish",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.7),
          s: rand(0.7, 1.2),
          speed: rand(20, 40),
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      // Seaweed (swaying)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "seaweed",
          x: rand(W * 0.05, W * 0.95),
          y: H * 0.85,
          s: rand(0.8, 1.3),
          sway: Math.random() * Math.PI * 2
        });
      }
      // Bubbles (rising)
      for (let i = 0; i < 6; i++) {
        themeDecorations.push({
          type: "bubble",
          x: Math.random() * W,
          y: rand(H * 0.5, H * 0.9),
          s: rand(0.5, 1.0),
          speed: rand(10, 20)
        });
      }
    } else if (theme === "diwali") {
      // Diyas (moving)
      for (let i = 0; i < 5; i++) {
        themeDecorations.push({
          type: "diya",
          x: Math.random() * W,
          y: rand(H * 0.3, H * 0.7),
          s: rand(0.8, 1.2),
          speed: rand(10, 20)
        });
      }
    } else if (theme === "independence") {
      // Flags (moving)
      for (let i = 0; i < 4; i++) {
        themeDecorations.push({
          type: "flag",
          x: Math.random() * W,
          y: rand(H * 0.2, H * 0.6),
          s: rand(0.8, 1.2),
          speed: rand(15, 25)
        });
      }
    }
  }
  
  buildThemeDecorations();
  window.addEventListener("resize", buildThemeDecorations);
  
  // Rebuild decorations when theme changes
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        buildThemeDecorations();
      }
    });
  });
  themeObserver.observe(app, { attributes: true });
  
  function updateAndDrawDecorations(dt) {
    const theme = app.getAttribute("data-theme");
    decorTime += dt;
    
    ctx.save();
    ctx.globalAlpha = 0.9;
    
    themeDecorations.forEach(d => {
      // Update positions
      if (d.type === "cloud" || d.type === "bird" || d.type === "owl") {
        d.x -= d.speed * dt;
        if (d.x < -100) d.x = W + 100;
      } else if (d.type === "fish") {
        d.x += d.speed * d.direction * dt;
        if (d.x > W + 50) d.direction = -1;
        if (d.x < -50) d.direction = 1;
      } else if (d.type === "bubble") {
        d.y -= d.speed * dt;
        if (d.y < H * 0.2) {
          d.y = H * 0.9;
          d.x = Math.random() * W;
        }
      } else if (d.type === "seaweed") {
        d.sway += dt * 2;
      }
      
      // Draw based on type
      if (d.type === "sun") {
        drawSun(d.x, d.y, d.s);
      } else if (d.type === "moon") {
        drawMoon(d.x, d.y, d.s);
      } else if (d.type === "cloud") {
        ctx.fillStyle = getCss("--cloud");
        drawCloud(d.x, d.y, 26 * d.s);
      } else if (d.type === "star") {
        drawStar(d.x, d.y, d.s, d.twinkle);
      } else if (d.type === "bird") {
        drawBird(d.x, d.y, d.s, d.wingPhase);
      } else if (d.type === "owl") {
        drawOwl(d.x, d.y, d.s);
      } else if (d.type === "cactus") {
        drawCactus(d.x, d.y, d.s);
      } else if (d.type === "pyramid") {
        drawPyramid(d.x, d.y, d.s);
      } else if (d.type === "fish") {
        drawFish(d.x, d.y, d.s, d.direction);
      } else if (d.type === "seaweed") {
        drawSeaweed(d.x, d.y, d.s, d.sway);
      } else if (d.type === "bubble") {
        drawBubble(d.x, d.y, d.s);
      } else if (d.type === "diya") {
        drawDiwaliDecor(d.x, d.y, d.s);
      } else if (d.type === "flag") {
        drawIndependenceDecor(d.x, d.y, d.s);
      }
    });
    
    ctx.restore();
  }
  
  function drawSun(x, y, s) {
    const sunRadius = 18 * s;
    ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
    ctx.shadowBlur = 30 * s;
    ctx.fillStyle = "#ffdd00";
    ctx.beginPath();
    ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  function drawMoon(x, y, s) {
    const moonRadius = 15 * s;
    ctx.shadowColor = "rgba(255, 255, 200, 0.9)";
    ctx.shadowBlur = 20 * s;
    ctx.fillStyle = "#ffffe0";
    ctx.beginPath();
    ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  function drawStar(x, y, s, twinkle) {
    const alpha = 0.5 + 0.5 * Math.sin(decorTime * 3 + twinkle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.9;
  }
  
  function drawBird(x, y, s, wingPhase) {
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2 * s;
    const wingY = Math.sin(decorTime * 10 + wingPhase) * 3 * s;
    ctx.beginPath();
    ctx.moveTo(x - 5 * s, y + wingY);
    ctx.quadraticCurveTo(x, y - 2 * s, x + 5 * s, y + wingY);
    ctx.stroke();
  }
  
  function drawOwl(x, y, s) {
    // Body
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.ellipse(x, y, 8 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(x - 3 * s, y - 2 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 3 * s, y - 2 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x - 3 * s, y - 2 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 3 * s, y - 2 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawCactus(x, y, s) {
    ctx.fillStyle = "#2d5a27";
    const cactusHeight = 30 * s;
    const cactusWidth = 10 * s;
    ctx.fillRect(x - cactusWidth / 2, y - cactusHeight / 2, cactusWidth, cactusHeight);
    // Arms
    ctx.fillRect(x - cactusWidth / 2 - 8 * s, y - cactusHeight / 2 + 6 * s, 8 * s, 4 * s);
    ctx.fillRect(x - cactusWidth / 2 - 8 * s, y - cactusHeight / 2 - 4 * s, 4 * s, 10 * s);
    ctx.fillRect(x + cactusWidth / 2, y - cactusHeight / 2 + 10 * s, 8 * s, 4 * s);
    ctx.fillRect(x + cactusWidth / 2 + 4 * s, y - cactusHeight / 2 + 2 * s, 4 * s, 12 * s);
  }
  
  function drawPyramid(x, y, s) {
    ctx.fillStyle = "#d4a76a";
    ctx.beginPath();
    ctx.moveTo(x, y - 60 * s);
    ctx.lineTo(x + 50 * s, y);
    ctx.lineTo(x - 50 * s, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2 * s;
    ctx.stroke();
  }
  
  function drawFish(x, y, s, direction) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction, 1);
    
    const fishSize = 12 * s;
    // Body
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.ellipse(0, 0, fishSize, fishSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-fishSize, 0);
    ctx.lineTo(-fishSize - 6 * s, -5 * s);
    ctx.lineTo(-fishSize - 6 * s, 5 * s);
    ctx.closePath();
    ctx.fill();
    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(4 * s, -1 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(5 * s, -1 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
    // Fin
    ctx.fillStyle = "#ff5252";
    ctx.beginPath();
    ctx.moveTo(0, -fishSize * 0.5);
    ctx.lineTo(-2 * s, -fishSize * 0.9);
    ctx.lineTo(2 * s, -fishSize * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  function drawSeaweed(x, y, s, sway) {
    ctx.strokeStyle = "#228b22";
    ctx.lineWidth = 4 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    const swayOffset = Math.sin(decorTime * 2 + sway) * 10 * s;
    ctx.quadraticCurveTo(x + swayOffset, y - 20 * s, x + swayOffset * 1.5, y - 40 * s);
    ctx.stroke();
  }
  
  function drawBubble(x, y, s) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(x, y, 4 * s, 0, Math.PI * 2);
    ctx.stroke();
    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(x - 1.5 * s, y - 1.5 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawDiwaliDecor(x, y, s) {
    // Glowing effect
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.shadowBlur = 15 * s;
    // Diya (lamp) body
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.ellipse(x, y, 12 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flame
    ctx.shadowColor = "rgba(255, 255, 100, 0.9)";
    ctx.shadowBlur = 20 * s;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.ellipse(x, y - 8 * s, 4 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Reset shadow
    ctx.shadowBlur = 0;
  }
  
  function drawIndependenceDecor(x, y, s) {
    // Draw Indian flag with Ashoka Chakra
    const flagWidth = 30 * s;
    const flagHeight = 20 * s;
    const flagX = x - flagWidth / 2;
    const flagY = y - flagHeight / 2;
    
    // Flag pole
    ctx.strokeStyle = "#8b4513";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - flagWidth / 2, y + flagHeight / 2);
    ctx.lineTo(x - flagWidth / 2, y - flagHeight / 2 - 10 * s);
    ctx.stroke();
    
    // Saffron stripe (top)
    ctx.fillStyle = "#ff9933";
    ctx.fillRect(flagX, flagY, flagWidth, flagHeight / 3);
    
    // White stripe (middle)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(flagX, flagY + flagHeight / 3, flagWidth, flagHeight / 3);
    
    // Green stripe (bottom)
    ctx.fillStyle = "#138808";
    ctx.fillRect(flagX, flagY + 2 * flagHeight / 3, flagWidth, flagHeight / 3);
    
    // Ashoka Chakra (blue wheel in center)
    const chakraX = x;
    const chakraY = y;
    const chakraRadius = 5 * s;
    
    // Blue circle
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(chakraX, chakraY, chakraRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Spokes (24 spokes)
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      ctx.beginPath();
      ctx.moveTo(chakraX, chakraY);
      ctx.lineTo(
        chakraX + Math.cos(angle) * chakraRadius,
        chakraY + Math.sin(angle) * chakraRadius
      );
      ctx.stroke();
    }
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(chakraX, chakraY, chakraRadius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
    ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, 0, Math.PI * 2);
    ctx.arc(x - s * 0.55, y + s * 0.15, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawDayDecor(x, y, s) {
    // Draw sun with rays
    const sunRadius = 15 * s;
    
    // Sun glow
    ctx.shadowColor = "rgba(255, 255, 0, 0.6)";
    ctx.shadowBlur = 20 * s;
    
    // Sun body
    ctx.fillStyle = "#ffdd00";
    ctx.beginPath();
    ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffdd00";
    ctx.lineWidth = 2 * s;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(angle) * (sunRadius + 3 * s),
        y + Math.sin(angle) * (sunRadius + 3 * s)
      );
      ctx.lineTo(
        x + Math.cos(angle) * (sunRadius + 8 * s),
        y + Math.sin(angle) * (sunRadius + 8 * s)
      );
      ctx.stroke();
    }
  }
  
  function drawNightDecor(x, y, s) {
    // Draw moon with crater details
    const moonRadius = 12 * s;
    
    // Moon glow
    ctx.shadowColor = "rgba(255, 255, 200, 0.8)";
    ctx.shadowBlur = 15 * s;
    
    // Moon body
    ctx.fillStyle = "#ffffe0";
    ctx.beginPath();
    ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Craters
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(200, 200, 180, 0.5)";
    ctx.beginPath();
    ctx.arc(x - 3 * s, y - 2 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 4 * s, y + 3 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 1 * s, y + 4 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawDesertDecor(x, y, s) {
    // Draw cactus
    const cactusHeight = 25 * s;
    const cactusWidth = 8 * s;
    
    // Main stem
    ctx.fillStyle = "#2d5a27";
    ctx.fillRect(x - cactusWidth / 2, y - cactusHeight / 2, cactusWidth, cactusHeight);
    
    // Left arm
    ctx.fillRect(x - cactusWidth / 2 - 6 * s, y - cactusHeight / 2 + 5 * s, 6 * s, 3 * s);
    ctx.fillRect(x - cactusWidth / 2 - 6 * s, y - cactusHeight / 2 - 3 * s, 3 * s, 8 * s);
    
    // Right arm
    ctx.fillRect(x + cactusWidth / 2, y - cactusHeight / 2 + 8 * s, 6 * s, 3 * s);
    ctx.fillRect(x + cactusWidth / 2 + 3 * s, y - cactusHeight / 2 + 2 * s, 3 * s, 9 * s);
    
    // Spines (small dots)
    ctx.fillStyle = "#1a3a17";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x - cactusWidth / 2 + 2 * s, y - cactusHeight / 2 + 5 * s + i * 4 * s, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + cactusWidth / 2 - 2 * s, y - cactusHeight / 2 + 5 * s + i * 4 * s, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function drawOceanDecor(x, y, s) {
    // Draw fish
    const fishSize = 10 * s;
    
    // Fish body
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.ellipse(x, y, fishSize, fishSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(x - fishSize, y);
    ctx.lineTo(x - fishSize - 5 * s, y - 4 * s);
    ctx.lineTo(x - fishSize - 5 * s, y + 4 * s);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x + 3 * s, y - 1 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x + 3.5 * s, y - 1 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Fin
    ctx.fillStyle = "#ff5252";
    ctx.beginPath();
    ctx.moveTo(x, y - fishSize * 0.5);
    ctx.lineTo(x - 2 * s, y - fishSize * 0.9);
    ctx.lineTo(x + 2 * s, y - fishSize * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  function getCss(varName) {
    return getComputedStyle(app).getPropertyValue(varName).trim();
  }

  function drawPipes() {
    const c1 = getCss("--pipe-1"), c2 = getCss("--pipe-2");
    pipes.forEach(p => {
      // top pipe
      drawPipeSegment(p.x, 0, PIPE_WIDTH, p.gapTop, c1, c2, true);
      // bottom pipe
      drawPipeSegment(p.x, p.gapBottom, PIPE_WIDTH, (H - groundH) - p.gapBottom, c1, c2, false);
    });
  }

  function drawPipeSegment(x, y, w, h, c1, c2, isTop) {
    if (h <= 0) return;
    ctx.save();
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, c2);
    grad.addColorStop(0.5, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    // lip
    const lipH = 22;
    const lipY = isTop ? y + h - lipH : y;
    ctx.fillRect(x - 6, lipY, w + 12, lipH);
    ctx.strokeRect(x - 6, lipY, w + 12, lipH);
    ctx.restore();
  }

  function drawGround() {
    const g1 = getCss("--ground-1"), g2 = getCss("--ground-2");
    const y = H - groundH;
    ctx.fillStyle = g1;
    ctx.fillRect(0, y, W, groundH);
    ctx.fillStyle = g2;
    ctx.save();
    ctx.beginPath();
    for (let x = groundOffset; x < W + 64; x += 32) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 16, y + groundH * 0.5);
      ctx.lineTo(x + 32, y);
    }
    ctx.fill();
    ctx.restore();
    // top edge highlight
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(0, y, W, 5);
  }

  function drawBird() {
    if (!currentVehicleImg) return;
    const s = bird.size;
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    if (currentVehicleImg.complete && currentVehicleImg.naturalWidth > 0) {
      ctx.drawImage(currentVehicleImg, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = "#ff7a1a";
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCockroaches() {
    const img = imageCache["images/cockroach.png"];
    cockroaches.forEach(c => {
      const cy = c.y + Math.sin(c.bob) * 8;
      ctx.save();
      ctx.translate(c.x, cy);
      const dir = c.vx < 0 ? -1 : 1;
      ctx.scale(dir, 1);
      ctx.rotate(Math.sin(c.bob) * 0.08);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -c.size / 2, -c.size / 2, c.size, c.size * (img.naturalHeight / img.naturalWidth));
      } else {
        ctx.fillStyle = "#5a3a1a";
        ctx.beginPath();
        ctx.ellipse(0, 0, c.size / 2, c.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawMelons() {
    melons.forEach(m => {
      const img = imageCache[m.img];
      ctx.save();
      ctx.globalAlpha = m.opacity;
      ctx.translate(m.x, m.y);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -m.size / 2, -m.size / 2, m.size, m.size);
      } else {
        ctx.fillStyle = "#9ed36a";
        ctx.beginPath();
        ctx.arc(0, 0, m.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawMelodies() {
    const img = imageCache["images/melody .png"];
    melodies.forEach(m => {
      const cy = m.y + Math.sin(m.bob) * 6;
      ctx.save();
      ctx.translate(m.x, cy);
      // gentle glow to make the rare item stand out
      ctx.shadowColor = "rgba(43,184,230,0.9)";
      ctx.shadowBlur = 16;
      if (img && img.complete && img.naturalWidth > 0) {
        const ratio = img.naturalHeight / img.naturalWidth;
        ctx.drawImage(img, -m.size / 2, -m.size / 2, m.size, m.size * ratio);
      } else {
        // fallback diamond shape
        ctx.fillStyle = "#2bb8e6";
        ctx.beginPath();
        ctx.moveTo(0, -m.size / 2);
        ctx.lineTo(m.size / 2, 0);
        ctx.lineTo(0, m.size / 2);
        ctx.lineTo(-m.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0a5d7d";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      if (p.color === "melody") {
        ctx.fillStyle = "#7fefff";
        ctx.strokeStyle = "#0a5d7d";
      } else {
        ctx.fillStyle = "#ffcc33";
        ctx.strokeStyle = "#8a5f00";
      }
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ===========================================================
     MAIN LOOP
  =========================================================== */
  function loop(ts) {
    const dt = Math.min(0.033, (ts - lastTime) / 1000 || 0);
    lastTime = ts;
    if (state === "playing" || state === "ready") {
      update(dt);
    } else if (state !== "paused" && state !== "respawning") {
      update(dt);
    }
    draw();
    if (state !== "gameover" || gameoverJustEnded()) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function gameoverJustEnded() {
    // allow a couple more frames to render final state, then keep loop alive but paused visually
    return true; // loop keeps running lightly; update() no-ops physics when not "playing"
  }

  /* Prevent page scroll/bounce on mobile, but only while the game screen
     is active — otherwise this blocks scrolling the theme/vehicle pickers
     on the home screen. */
  document.addEventListener("touchmove", (e) => {
    if (gameScreen.classList.contains("active")) {
      e.preventDefault();
    }
  }, { passive: false });

  /* Start home background music on first user interaction (browsers block
     autoplay until the user interacts with the page). */
  function startHomeBgOnFirstInteraction() {
    playHomeBg();
    document.removeEventListener("pointerdown", startHomeBgOnFirstInteraction);
    document.removeEventListener("keydown", startHomeBgOnFirstInteraction);
    document.removeEventListener("touchstart", startHomeBgOnFirstInteraction);
  }
  document.addEventListener("pointerdown", startHomeBgOnFirstInteraction, { once: true });
  document.addEventListener("keydown", startHomeBgOnFirstInteraction, { once: true });
  document.addEventListener("touchstart", startHomeBgOnFirstInteraction, { once: true });

})();