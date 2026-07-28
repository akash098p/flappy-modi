/* ===========================================================
   FLAPPY MODI — game engine
=========================================================== */
(() => {
  "use strict";

  /* ---------------- Config ---------------- */
  const STORAGE_KEY = "flappyModiSave_v1";

  const THEMES = [
    { id: "day",      name: "Day",      cost: 0,   swatch: "linear-gradient(180deg,#7ed6ff,#ffe9a8)" },
    { id: "night",    name: "Night",    cost: 15,  swatch: "linear-gradient(180deg,#0d1b3e,#3a3f7a)" },
    { id: "desert",   name: "Desert",   cost: 25,  swatch: "linear-gradient(180deg,#ffd58a,#ff9a56)" },
    { id: "ocean",    name: "Ocean",    cost: 45,  swatch: "linear-gradient(180deg,#bdf0ff,#4fb8d6)" },
    { id: "festival", name: "Festival", cost: 55, swatch: "linear-gradient(180deg,#ff8fb1,#ffd36e)" },
  ];

  const VEHICLES = [
    { id: "flappy1", name: "Wing", cost: 0,   img: "images/flappy1.png" },
    { id: "flappy2", name: "Helicopter",  cost: 20,  img: "images/flappy2.png" },
    { id: "flappy3", name: "Tejas",    cost: 50, img: "images/flappy3.png" },
  ];

  const GRAVITY = 1500;         // px/s^2
  const FLAP_VELOCITY = -430;   // px/s
  const MAX_FALL_SPEED = 700;
  const PIPE_GAP = 190;
  const PIPE_WIDTH = 78;
  const PIPE_INTERVAL = 1.5;    // seconds between pipes
  const PIPE_SPEED = 165;       // px/s (scales slightly with score)
  const GROUND_HEIGHT_RATIO = 0.12;
  const BIRD_SIZE = 44;
  const COCKROACH_INTERVAL_MIN = 3.2;
  const COCKROACH_INTERVAL_MAX = 5.5;
  const MELON_INTERVAL_MIN = 4.5;
  const MELON_INTERVAL_MAX = 8;
  const COINS_PER_POINT = 1; // coins earned = score at game over (see computeCoinsEarned)

  /* ---------------- Save data ---------------- */
  function defaultSave() {
    return {
      bestScore: 0,
      coins: 0,
      unlockedThemes: ["day"],
      unlockedVehicles: ["flappy1"],
      selectedTheme: "day",
      selectedVehicle: "flappy1",
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

  const playBtn = document.getElementById("play-btn");
  const homeBestScoreEl = document.getElementById("home-best-score");
  const homeCoinsEl = document.getElementById("home-coins");
  const themeListEl = document.getElementById("theme-list");
  const vehicleListEl = document.getElementById("vehicle-list");

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const hudScoreEl = document.getElementById("hud-score");
  const pauseBtn = document.getElementById("pause-btn");

  const getReadyOverlay = document.getElementById("get-ready-overlay");
  const pauseOverlay = document.getElementById("pause-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");

  const resumeBtn = document.getElementById("resume-btn");
  const pauseHomeBtn = document.getElementById("pause-home-btn");
  const retryBtn = document.getElementById("retry-btn");
  const goHomeBtn = document.getElementById("go-home-btn");

  const goScoreEl = document.getElementById("go-score");
  const goBestEl = document.getElementById("go-best");
  const goCoinsEl = document.getElementById("go-coins");

  /* ---------------- Audio ---------------- */
  const audioJump = document.getElementById("audio-jump");
  const audioBgm = document.getElementById("audio-bgm");
  const audioGameover = document.getElementById("audio-gameover");
  const audioStart = document.getElementById("audio-start");
  audioBgm.volume = 0.45;
  audioJump.volume = 0.8;
  audioGameover.volume = 0.8;
  audioStart.volume = 0.8;

  function playSound(el) {
    try {
      el.currentTime = 0;
      el.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playBgm() {
    try {
      audioBgm.currentTime = 0;
      audioBgm.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }
  function stopBgm() {
    audioBgm.pause();
  }

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
  loadImage("images/logo.png");

  /* ===========================================================
     HOME SCREEN — pickers
  =========================================================== */
  function renderPickers() {
    homeBestScoreEl.textContent = save.bestScore;
    homeCoinsEl.textContent = save.coins;

    themeListEl.innerHTML = "";
    THEMES.forEach(t => {
      const owned = save.unlockedThemes.includes(t.id);
      const selected = save.selectedTheme === t.id;
      const card = document.createElement("div");
      card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
      card.innerHTML = `
        <div class="lock-badge">🔒</div>
        <div class="pick-thumb theme-swatch" style="background:${t.swatch}"></div>
        <div class="pick-name">${t.name}</div>
        ${owned ? "" : `<div class="pick-cost"><span class="coin-dot"></span>${t.cost}</div>`}
      `;
      card.addEventListener("click", () => selectOrUnlock("theme", t));
      themeListEl.appendChild(card);
    });

    vehicleListEl.innerHTML = "";
    VEHICLES.forEach(v => {
      const owned = save.unlockedVehicles.includes(v.id);
      const selected = save.selectedVehicle === v.id;
      const card = document.createElement("div");
      card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
      card.innerHTML = `
        <div class="lock-badge">🔒</div>
        <div class="pick-thumb"><img src="${v.img}" alt="${v.name}" /></div>
        <div class="pick-name">${v.name}</div>
        ${owned ? "" : `<div class="pick-cost"><span class="coin-dot"></span>${v.cost}</div>`}
      `;
      card.addEventListener("click", () => selectOrUnlock("vehicle", v));
      vehicleListEl.appendChild(card);
    });
  }

  function selectOrUnlock(kind, item) {
    const unlockedKey = kind === "theme" ? "unlockedThemes" : "unlockedVehicles";
    const selectedKey = kind === "theme" ? "selectedTheme" : "selectedVehicle";
    const owned = save[unlockedKey].includes(item.id);

    if (owned) {
      save[selectedKey] = item.id;
      if (kind === "theme") applyTheme(item.id);
    } else {
      if (save.coins >= item.cost) {
        save.coins -= item.cost;
        save[unlockedKey].push(item.id);
        save[selectedKey] = item.id;
        if (kind === "theme") applyTheme(item.id);
      } else {
        flashInsufficientCoins(item);
        return;
      }
    }
    saveSave(save);
    renderPickers();
  }

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
  function showScreen(name) {
    homeScreen.classList.toggle("active", name === "home");
    gameScreen.classList.toggle("active", name === "game");
  }

  playBtn.addEventListener("click", () => {
    playSound(audioStart);
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
  let state = "ready"; // ready | playing | paused | gameover
  let bird, pipes, cockroaches, melons, particles;
  let score = 0;
  let elapsed = 0;
  let pipeTimer = 0;
  let cockroachTimer = 0;
  let melonTimer = 0;
  let lastTime = 0;
  let groundOffset = 0;
  let rafId = null;
  let currentVehicleImg = null;

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
    particles = [];
    score = 0;
    elapsed = 0;
    pipeTimer = 0;
    cockroachTimer = rand(COCKROACH_INTERVAL_MIN, COCKROACH_INTERVAL_MAX);
    melonTimer = rand(MELON_INTERVAL_MIN, MELON_INTERVAL_MAX);
    groundOffset = 0;

    state = "ready";
    hudScoreEl.textContent = "0";
    getReadyOverlay.classList.remove("hidden");
    pauseOverlay.classList.add("hidden");
    gameoverOverlay.classList.add("hidden");

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
      "button, .btn-primary, .btn-secondary, .pick-card, #pause-btn"
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
    if (state === "paused" || state === "gameover") return;

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
    state = "paused";
    pauseOverlay.classList.remove("hidden");
    audioBgm.pause();
  });
  resumeBtn.addEventListener("click", () => {
    state = "playing";
    pauseOverlay.classList.add("hidden");
    lastTime = performance.now();
    audioBgm.play().catch(() => {});
  });
  pauseHomeBtn.addEventListener("click", () => {
    stopBgm();
    goHome();
  });
  goHomeBtn.addEventListener("click", () => {
    goHome();
  });
  retryBtn.addEventListener("click", () => {
    playSound(audioStart);
    startNewGame();
  });

  function goHome() {
    state = "ready";
    if (rafId) cancelAnimationFrame(rafId);
    stopBgm();
    renderPickers();
    showScreen("home");
  }

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
    const imgKey = Math.random() < 0.5 ? "images/meloni1.png" : "images/meloni2.png";
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
        return endGame();
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
    if (state === "gameover") return;
    state = "gameover";
    stopBgm();
    playSound(audioGameover);

    const earned = computeCoinsEarned(score);
    save.coins += earned;
    if (score > save.bestScore) save.bestScore = score;
    saveSave(save);

    goScoreEl.textContent = score;
    goBestEl.textContent = save.bestScore;
    goCoinsEl.textContent = earned;
    gameoverOverlay.classList.remove("hidden");
  }

  /* ===========================================================
     RENDER
  =========================================================== */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSkyDecor();
    drawMelons();
    drawPipes();
    drawCockroaches();
    drawGround();
    drawBird();
    drawParticles();
  }

  // simple theme-aware cloud/star decor, precomputed per resize
  let decorSeeds = [];
  function buildDecor() {
    decorSeeds = [];
    for (let i = 0; i < 6; i++) {
      decorSeeds.push({
        x: Math.random() * W,
        y: rand(H * 0.06, H * 0.4),
        s: rand(0.6, 1.4),
        speed: rand(6, 16),
      });
    }
  }
  buildDecor();
  window.addEventListener("resize", buildDecor);

  function drawSkyDecor() {
    const theme = app.getAttribute("data-theme");
    ctx.save();
    ctx.globalAlpha = 0.9;
    decorSeeds.forEach(d => {
      d.x -= d.speed * (1 / 60);
      if (d.x < -60) d.x = W + 60;
      if (theme === "night") {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2 * d.s, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = getCss("--cloud");
        drawCloud(d.x, d.y, 26 * d.s);
      }
    });
    ctx.restore();
  }

  function drawCloud(x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
    ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, 0, Math.PI * 2);
    ctx.arc(x - s * 0.55, y + s * 0.15, s * 0.4, 0, Math.PI * 2);
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

  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = "#ffcc33";
      ctx.strokeStyle = "#8a5f00";
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
    } else if (state !== "paused") {
      update(dt); // keep ground/decor subtly moving is fine even on gameover=false; but stop after gameover
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

})();
