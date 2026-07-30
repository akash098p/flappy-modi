/* ===========================================================
   FLAPPY MODI — Game Entities (Pipes, Cockroaches, Melons, etc.)
=========================================================== */

// Entity spawning functions (global)
window.spawnPipePair = function() {
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

window.spawnCockroach = function() {
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

window.spawnMelon = function() {
  const melonImages = ["images/meloni1.png", "images/meloni2.png", "images/meloni3.png", "images/meloni4.png"];
  const imgKey = melonImages[Math.floor(Math.random() * melonImages.length)];
  melons.push({
    x: rand(W * 0.15, W * 0.85),
    y: -80,
    phase: "down",
    timer: 0,
    holdDuration: rand(0.6, 1.2),
    targetY: rand(H * 0.28, H * 0.5),
    speed: rand(160, 220),
    size: 54,
    img: imgKey,
    opacity: 0,
  });
}

window.spawnMelody = function() {
  const y = rand(H * 0.18, H * 0.62);
  melodies.push({
    x: W + MELODY_SIZE,
    y,
    size: MELODY_SIZE,
    bob: Math.random() * Math.PI * 2,
    collected: false,
  });
}

window.spawnMelodyBurst = function(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x, y,
      vx: rand(-120, 120), vy: rand(-200, -40),
      life: 0.6, maxLife: 0.6,
      color: "melody",
    });
  }
}

window.spawnCoinBurst = function() {
  for (let i = 0; i < 4; i++) {
    particles.push({
      x: bird.x, y: bird.y,
      vx: rand(-60, 60), vy: rand(-160, -60),
      life: 0.5, maxLife: 0.5,
    });
  }
}

// Drawing functions for entities (global)
window.drawPipes = function() {
  const c1 = getCss("--pipe-1"), c2 = getCss("--pipe-2");
  pipes.forEach(p => {
    drawPipeSegment(p.x, 0, PIPE_WIDTH, p.gapTop, c1, c2, true);
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
  const lipH = 22;
  const lipY = isTop ? y + h - lipH : y;
  ctx.fillRect(x - 6, lipY, w + 12, lipH);
  ctx.strokeRect(x - 6, lipY, w + 12, lipH);
  ctx.restore();
}

window.drawCockroaches = function() {
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

window.drawMelons = function() {
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

window.drawMelodies = function() {
  const img = imageCache["images/melody .png"];
  melodies.forEach(m => {
    const cy = m.y + Math.sin(m.bob) * 6;
    ctx.save();
    ctx.translate(m.x, cy);
    ctx.shadowColor = "rgba(43,184,230,0.9)";
    ctx.shadowBlur = 16;
    if (img && img.complete && img.naturalWidth > 0) {
      const ratio = img.naturalHeight / img.naturalWidth;
      ctx.drawImage(img, -m.size / 2, -m.size / 2, m.size, m.size * ratio);
    } else {
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

window.drawParticles = function() {
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

// Drawing functions for ground and bird (global)
window.drawGround = function() {
  const g1 = window.getCss("--ground-1"), g2 = window.getCss("--ground-2");
  const y = window.H - window.groundH;
  ctx.fillStyle = g1;
  ctx.fillRect(0, y, window.W, window.groundH);
  ctx.fillStyle = g2;
  ctx.save();
  ctx.beginPath();
  for (let x = window.groundOffset; x < window.W + 64; x += 32) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16, y + window.groundH * 0.5);
    ctx.lineTo(x + 32, y);
  }
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, y, window.W, 5);
}

window.drawBird = function() {
  if (!window.bird) return;
  
  const s = window.bird.size;
  
  ctx.save();
  ctx.translate(window.bird.x, window.bird.y);
  ctx.rotate(window.bird.rotation);
  
  // Draw the vehicle image
  if (window.currentVehicleImg && window.currentVehicleImg.complete && window.currentVehicleImg.naturalWidth > 0) {
    console.log("Drawing image:", window.currentVehicleImg.src, "at", window.bird.x, window.bird.y, "size:", s);
    ctx.drawImage(window.currentVehicleImg, -s / 2, -s / 2, s, s);
  } else {
    console.log("Drawing fallback, image ready:", window.currentVehicleImg ? window.currentVehicleImg.complete : "null");
    // Fallback: draw a visible bird shape
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();
}

// CSS helper (global)
window.getCss = function(varName) {
  return getComputedStyle(window.app).getPropertyValue(varName).trim();
}

// Collision detection helpers (global)
window.circleRectCollision = function(circle, rect) {
  const r = circle.size * 0.36;
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < r * r;
}

window.circleCircleCollision = function(a, b) {
  const r = a.size * 0.36 + b.r;
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy < r * r;
}

window.clamp = function(v, min, max) { return Math.max(min, Math.min(max, v)); }