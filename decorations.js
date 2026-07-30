/* ===========================================================
   FLAPPY MODI — Theme Decorations
=========================================================== */

// Theme decoration management (global)
window.themeDecorations = [];
window.decorTime = 0;

window.buildThemeDecorations = function() {
  const theme = app.getAttribute("data-theme");
  window.themeDecorations = [];
  
  if (theme === "day") {
    window.themeDecorations.push({ type: "sun", x: W * 0.8, y: H * 0.15, s: 1.2 });
    for (let i = 0; i < 4; i++) {
      window.themeDecorations.push({
        type: "cloud", x: Math.random() * W, y: rand(H * 0.1, H * 0.35),
        s: rand(0.8, 1.3), speed: rand(8, 15)
      });
    }
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "bird", x: Math.random() * W, y: rand(H * 0.2, H * 0.4),
        s: rand(0.6, 1.0), speed: rand(30, 50), wingPhase: Math.random() * Math.PI * 2
      });
    }
  } else if (theme === "night") {
    window.themeDecorations.push({ type: "moon", x: W * 0.75, y: H * 0.15, s: 1.0 });
    for (let i = 0; i < 30; i++) {
      window.themeDecorations.push({
        type: "star", x: Math.random() * W, y: rand(H * 0.05, H * 0.5),
        s: rand(0.5, 1.2), twinkle: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 2; i++) {
      window.themeDecorations.push({
        type: "cloud", x: Math.random() * W, y: rand(H * 0.2, H * 0.4),
        s: rand(0.7, 1.0), speed: rand(3, 6)
      });
    }
    if (Math.random() > 0.5) {
      window.themeDecorations.push({ type: "owl", x: W * 0.2, y: H * 0.3, s: 0.8, speed: 15 });
    }
  } else if (theme === "desert") {
    window.themeDecorations.push({ type: "sun", x: W * 0.85, y: H * 0.12, s: 1.3 });
    // Pyramids - spaced far apart at different positions
    window.themeDecorations.push({
      type: "pyramid", x: W * 0.15, y: H * 0.7,
      s: 1.5, speed: 6
    });
    window.themeDecorations.push({
      type: "pyramid", x: W * 0.75, y: H * 0.76,
      s: 1.0, speed: 5
    });
    // Cactus - spaced out across the screen
    window.themeDecorations.push({
      type: "cactus", x: W * 0.3, y: H * 0.82,
      s: 0.9, speed: 8
    });
    window.themeDecorations.push({
      type: "cactus", x: W * 0.55, y: H * 0.83,
      s: 1.1, speed: 7
    });
    window.themeDecorations.push({
      type: "cactus", x: W * 0.9, y: H * 0.81,
      s: 0.8, speed: 9
    });
  } else if (theme === "ocean") {
    for (let i = 0; i < 5; i++) {
      window.themeDecorations.push({
        type: "fish", x: Math.random() * W, y: rand(H * 0.2, H * 0.7),
        s: rand(0.7, 1.2), speed: rand(20, 40), direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    for (let i = 0; i < 4; i++) {
      window.themeDecorations.push({
        type: "seaweed", x: rand(W * 0.05, W * 0.95), y: H * 0.85,
        s: rand(0.8, 1.3), sway: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 6; i++) {
      window.themeDecorations.push({
        type: "bubble", x: Math.random() * W, y: rand(H * 0.5, H * 0.9),
        s: rand(0.5, 1.0), speed: rand(10, 20)
      });
    }
  } else if (theme === "diwali") {
    for (let i = 0; i < 5; i++) {
      window.themeDecorations.push({
        type: "diya", x: Math.random() * W, y: rand(H * 0.3, H * 0.7),
        s: rand(0.8, 1.2), speed: rand(10, 20)
      });
    }
  } else if (theme === "independence") {
    for (let i = 0; i < 4; i++) {
      window.themeDecorations.push({
        type: "flag", x: Math.random() * W, y: rand(H * 0.2, H * 0.6),
        s: rand(0.8, 1.2), speed: rand(15, 25)
      });
    }
  }
}

window.updateAndDrawDecorations = function(dt) {
  window.decorTime += dt;
  ctx.save();
  ctx.globalAlpha = 0.9;
  
  window.themeDecorations.forEach(d => {
    if (d.type === "cloud" || d.type === "bird" || d.type === "owl") {
      d.x -= d.speed * dt;
      if (d.x < -100) d.x = W + 100;
    } else if (d.type === "fish") {
      d.x += d.speed * d.direction * dt;
      if (d.x > W + 50) d.direction = -1;
      if (d.x < -50) d.direction = 1;
    } else if (d.type === "bubble") {
      d.y -= d.speed * dt;
      if (d.y < H * 0.2) { d.y = H * 0.9; d.x = Math.random() * W; }
    } else if (d.type === "seaweed") {
      d.sway += dt * 2;
    } else if (d.type === "diya") {
      // Diyas float upward and sway
      if (!d.sway) d.sway = Math.random() * Math.PI * 2;
      d.sway += dt * 3;
      d.y -= d.speed * 0.3 * dt;
      d.x += Math.sin(d.sway) * 0.5;
      if (d.y < H * 0.15) { d.y = H * 0.7; d.x = Math.random() * W; }
    } else if (d.type === "flag") {
      // Flags wave
      if (!d.sway) d.sway = Math.random() * Math.PI * 2;
      d.sway += dt * 4;
      d.x += d.speed * 0.2 * dt;
      if (d.x > W + 50) d.x = -50;
    } else if (d.type === "pyramid" || d.type === "cactus") {
      // Slow movement as flappy moves forward
      d.x -= d.speed * dt;
      if (d.x < -150) d.x = W + 100;
    }
    
    switch(d.type) {
      case "sun": window.drawSun(d.x, d.y, d.s); break;
      case "moon": window.drawMoon(d.x, d.y, d.s); break;
      case "cloud": 
        ctx.fillStyle = getCss("--cloud");
        window.drawCloud(d.x, d.y, 26 * d.s);
        break;
      case "star": window.drawStar(d.x, d.y, d.s, d.twinkle); break;
      case "bird": window.drawBird(d.x, d.y, d.s, d.wingPhase); break;
      case "owl": window.drawOwl(d.x, d.y, d.s); break;
      case "cactus": window.drawCactus(d.x, d.y, d.s); break;
      case "pyramid": window.drawPyramid(d.x, d.y, d.s); break;
      case "fish": window.drawFish(d.x, d.y, d.s, d.direction); break;
      case "seaweed": window.drawSeaweed(d.x, d.y, d.s, d.sway); break;
      case "bubble": window.drawBubble(d.x, d.y, d.s); break;
      case "diya": window.drawDiwaliDecor(d.x, d.y, d.s, d.sway); break;
      case "flag": window.drawIndependenceDecor(d.x, d.y, d.s, d.sway); break;
    }
  });
  
  ctx.restore();
}

// Decoration drawing functions (global)
window.drawSun = function(x, y, s) {
  const sunRadius = 18 * s;
  ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
  ctx.shadowBlur = 30 * s;
  ctx.fillStyle = "#ffdd00";
  ctx.beginPath();
  ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

window.drawMoon = function(x, y, s) {
  const moonRadius = 15 * s;
  ctx.shadowColor = "rgba(255, 255, 200, 0.9)";
  ctx.shadowBlur = 20 * s;
  ctx.fillStyle = "#ffffe0";
  ctx.beginPath();
  ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

window.drawStar = function(x, y, s, twinkle) {
  const alpha = 0.5 + 0.5 * Math.sin(window.decorTime * 3 + twinkle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, 2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9;
}

window.drawBird = function(x, y, s, wingPhase) {
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2 * s;
  const wingY = Math.sin(window.decorTime * 10 + wingPhase) * 3 * s;
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, y + wingY);
  ctx.quadraticCurveTo(x, y - 2 * s, x + 5 * s, y + wingY);
  ctx.stroke();
}

window.drawOwl = function(x, y, s) {
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.ellipse(x, y, 8 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(x - 3 * s, y - 2 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 3 * s, y - 2 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - 3 * s, y - 2 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 3 * s, y - 2 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

window.drawCactus = function(x, y, s) {
  ctx.fillStyle = "#2d5a27";
  const cactusHeight = 30 * s, cactusWidth = 10 * s;
  ctx.fillRect(x - cactusWidth / 2, y - cactusHeight / 2, cactusWidth, cactusHeight);
  ctx.fillRect(x - cactusWidth / 2 - 8 * s, y - cactusHeight / 2 + 6 * s, 8 * s, 4 * s);
  ctx.fillRect(x - cactusWidth / 2 - 8 * s, y - cactusHeight / 2 - 4 * s, 4 * s, 10 * s);
  ctx.fillRect(x + cactusWidth / 2, y - cactusHeight / 2 + 10 * s, 8 * s, 4 * s);
  ctx.fillRect(x + cactusWidth / 2 + 4 * s, y - cactusHeight / 2 + 2 * s, 4 * s, 12 * s);
}

window.drawPyramid = function(x, y, s) {
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

window.drawFish = function(x, y, s, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  const fishSize = 12 * s;
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.ellipse(0, 0, fishSize, fishSize * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-fishSize, 0);
  ctx.lineTo(-fishSize - 6 * s, -5 * s);
  ctx.lineTo(-fishSize - 6 * s, 5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(4 * s, -1 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(5 * s, -1 * s, 1.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff5252";
  ctx.beginPath();
  ctx.moveTo(0, -fishSize * 0.5);
  ctx.lineTo(-2 * s, -fishSize * 0.9);
  ctx.lineTo(2 * s, -fishSize * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

window.drawSeaweed = function(x, y, s, sway) {
  ctx.strokeStyle = "#228b22";
  ctx.lineWidth = 4 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  const swayOffset = Math.sin(window.decorTime * 2 + sway) * 10 * s;
  ctx.quadraticCurveTo(x + swayOffset, y - 20 * s, x + swayOffset * 1.5, y - 40 * s);
  ctx.stroke();
}

window.drawBubble = function(x, y, s) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(x, y, 4 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(x - 1.5 * s, y - 1.5 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

window.drawDiwaliDecor = function(x, y, s, sway) {
  // Animate flame flicker
  const flicker = Math.sin(sway || 0) * 2;
  const flameHeight = 8 * s + flicker;
  
  ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
  ctx.shadowBlur = 15 * s;
  ctx.fillStyle = "#ff6b35";
  ctx.beginPath();
  ctx.ellipse(x, y, 12 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "rgba(255, 255, 100, 0.9)";
  ctx.shadowBlur = 20 * s;
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.ellipse(x, y - 8 * s + Math.sin(sway || 0) * 2, 4 * s, flameHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

window.drawIndependenceDecor = function(x, y, s, sway) {
  const flagWidth = 30 * s, flagHeight = 20 * s;
  const waveOffset = Math.sin(sway || 0) * 3 * s;
  const flagX = x - flagWidth / 2, flagY = y - flagHeight / 2 + waveOffset;
  ctx.strokeStyle = "#8b4513";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(x - flagWidth / 2, y + flagHeight / 2);
  ctx.lineTo(x - flagWidth / 2, y - flagHeight / 2 - 10 * s);
  ctx.stroke();
  ctx.fillStyle = "#ff9933";
  ctx.fillRect(flagX, flagY, flagWidth, flagHeight / 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(flagX, flagY + flagHeight / 3, flagWidth, flagHeight / 3);
  ctx.fillStyle = "#138808";
  ctx.fillRect(flagX, flagY + 2 * flagHeight / 3, flagWidth, flagHeight / 3);
  const chakraX = x, chakraY = y + waveOffset, chakraRadius = 5 * s;
  ctx.strokeStyle = "#0000ff";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(chakraX, chakraY, chakraRadius, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    ctx.beginPath();
    ctx.moveTo(chakraX, chakraY);
    ctx.lineTo(chakraX + Math.cos(angle) * chakraRadius, chakraY + Math.sin(angle) * chakraRadius);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(chakraX, chakraY, chakraRadius * 0.3, 0, Math.PI * 2);
  ctx.stroke();
}

window.drawCloud = function(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x - s * 0.55, y + s * 0.15, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
}