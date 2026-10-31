/* ===========================================================
   FLAPPY MODI — Theme Decorations
=========================================================== */

// Theme decoration management (global)
window.themeDecorations = [];
window.decorTime = 0;

// Theme preview class mapping for CSS-drawn previews
window.getThemePreviewClass = function(themeId) {
  const map = {
    day: "preview-day",
    night: "preview-night",
    desert: "preview-desert",
    ocean: "preview-ocean",
    diwali: "preview-diwali",
    independence: "preview-independence"
  };
  return map[themeId] || "";
}

window.getThemePreviewObjects = function(themeId) {
  const map = {
    day: ["scene-sun", "scene-cloud cloud-one", "scene-cloud cloud-two", "scene-hill hill-far", "scene-hill hill-near", "scene-grass grass-one", "scene-grass grass-two", "scene-bird bird-one", "scene-bird bird-two"],
    night: ["scene-moon", "scene-star star-one", "scene-star star-two", "scene-star star-three", "scene-star star-four", "scene-star star-five", "scene-hill hill-far", "scene-hill hill-near", "scene-pine pine-one", "scene-pine pine-two", "scene-pine pine-three"],
    desert: ["scene-sun", "scene-dune dune-far", "scene-dune dune-near", "scene-pyramid pyramid-one", "scene-pyramid pyramid-two", "scene-cactus cactus-one", "scene-cactus cactus-two"],
    ocean: ["scene-light light-one", "scene-light light-two", "scene-fish fish-one", "scene-fish fish-two", "scene-bubble bubble-one", "scene-bubble bubble-two", "scene-bubble bubble-three", "scene-seabed", "scene-seaweed weed-one", "scene-seaweed weed-two", "scene-seaweed weed-three"],
    diwali: ["scene-firework firework-one", "scene-firework firework-two", "scene-firework firework-three", "scene-garland", "scene-diya diya-one", "scene-diya diya-two", "scene-diya diya-three", "scene-city"],
    independence: ["scene-cloud cloud-one", "scene-cloud cloud-two", "scene-monument", "scene-flag flag-one", "scene-flag flag-two", "scene-flag flag-three", "scene-field"],
  };
  return map[themeId] || [];
}

window.renderThemeScene = function(container, themeId) {
  if (!container) return;
  const previewClass = window.getThemePreviewClass(themeId);
  const sceneArt = container.querySelector(".scene-art");
  if (!sceneArt) return;

  container.className = `theme-swatch ${previewClass}`;
  sceneArt.innerHTML = window.getThemePreviewObjects(themeId)
    .map(object => `<span class="scene-object ${object}"></span>`)
    .join("");
}

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
    window.themeDecorations.push(
      { type: "owl", x: W * 0.2, y: rand(H * 0.12, H * 0.42), s: 0.95, speed: 12 },
      { type: "owl", x: W * 0.62, y: rand(H * 0.55, H * 0.78), s: 0.8, speed: 10 }
    );
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "bat", x: Math.random() * W, y: rand(H * 0.12, H * 0.78),
        s: rand(0.45, 0.7), speed: rand(8, 16), wingPhase: Math.random() * Math.PI * 2
      });
    }
  } else if (theme === "desert") {
    window.themeDecorations.push({ type: "sun", x: W * 0.85, y: H * 0.12, s: 1.3 });
    window.themeDecorations.push({
      type: "dune", x: W * 0.32, y: H * 0.76,
      s: 1.1, speed: 4
    });
    window.themeDecorations.push({
      type: "dune", x: W * 0.88, y: H * 0.81,
      s: 0.8, speed: 3
    });
    window.themeDecorations.push({
      type: "pyramid", x: W * 0.15, y: H * 0.7,
      s: 1.15, speed: 6
    });
    window.themeDecorations.push({
      type: "pyramid", x: W * 0.75, y: H * 0.76,
      s: 0.8, speed: 5
    });
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
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "desertRock", x: W * (0.18 + i * 0.31), y: H * (0.83 + (i % 2) * 0.015),
        s: rand(0.65, 1.0), speed: rand(5, 8)
      });
    }
    for (let i = 0; i < 2; i++) {
      window.themeDecorations.push({
        type: "desertShrub", x: W * (0.42 + i * 0.4), y: H * 0.84,
        s: rand(0.7, 0.95), speed: rand(5, 8)
      });
    }
  } else if (theme === "ocean") {
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "fish", x: Math.random() * W, y: rand(H * 0.2, H * 0.7),
        s: rand(0.7, 0.9), speed: rand(15, 30), direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    for (let i = 0; i < 7; i++) {
      window.themeDecorations.push({
        type: "seaweed", x: rand(W * 0.04, W * 0.96), y: H * 0.87,
        s: rand(0.75, 1.15), sway: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "bubble", x: Math.random() * W, y: rand(H * 0.5, H * 0.9),
        s: rand(0.35, 0.65), speed: rand(8, 15)
      });
    }
    for (let i = 0; i < 2; i++) {
      window.themeDecorations.push({
        type: "jellyfish", x: rand(W * 0.12, W * 0.88), y: rand(H * 0.2, H * 0.65),
        s: rand(0.45, 0.6), sway: Math.random() * Math.PI * 2
      });
    }
  } else if (theme === "diwali") {
    window.themeDecorations.push({
      type: "diwaliGarland", x: W * 0.5, y: H * 0.055,
      s: Math.min(W / 280, 1.35)
    });
    const diyaCount = 5;
    const diyaBaseY = H - (window.groundH || H * 0.12) - 20;
    for (let i = 0; i < diyaCount; i++) {
      const x = W * (i + 1) / (diyaCount + 1);
      window.themeDecorations.push({
        type: "diya", x, y: H * 0.16,
        s: 1.15, sway: Math.random() * Math.PI * 2, anchored: true
      });
      window.themeDecorations.push({
        type: "diya", x, y: diyaBaseY,
        s: 1.15, sway: Math.random() * Math.PI * 2, anchored: true
      });
    }
    window.themeDecorations.push(
      { type: "diwaliRangoli", x: W * 0.1, y: diyaBaseY - 7, s: 1.25 },
      { type: "diwaliRangoli", x: W * 0.9, y: diyaBaseY - 7, s: 1.25 }
    );
    const fireworkColors = ["#ffd166", "#ff6b8a", "#75e6da", "#c5a3ff"];
    for (let i = 0; i < 4; i++) {
      window.themeDecorations.push({
        type: "diwaliFirework",
        x: rand(W * 0.12, W * 0.88),
        y: rand(H * 0.2, H * 0.62),
        s: rand(0.75, 1.15),
        period: rand(3.5, 6),
        phase: Math.random() * 6,
        style: i % 3,
        color: fireworkColors[i]
      });
    }
  } else if (theme === "independence") {
    window.themeDecorations.push({
      type: "independenceBunting", x: W * 0.5, y: H * 0.07,
      s: Math.min(W / 360, 1.15)
    });
    const flagHeightBands = [
      [0.13, 0.3],
      [0.38, 0.56],
      [0.64, 0.8]
    ];
    for (let i = 0; i < 3; i++) {
      const [minHeight, maxHeight] = flagHeightBands[i % flagHeightBands.length];
      window.themeDecorations.push({
        type: "flag", x: Math.random() * W, y: rand(H * minHeight, H * maxHeight),
        s: rand(0.85, 1.1), speed: rand(8, 14), sway: Math.random() * Math.PI * 2,
        opacity: 0.48
      });
    }
    for (let i = 0; i < 2; i++) {
      window.themeDecorations.push({
        type: "kite", x: rand(W * 0.18, W * 0.82), y: rand(H * 0.2, H * 0.55),
        s: rand(0.75, 1.0), speed: rand(5, 9), sway: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < 3; i++) {
      window.themeDecorations.push({
        type: "cloud", x: Math.random() * W, y: rand(H * 0.12, H * 0.42),
        s: rand(0.8, 1.15), speed: rand(4, 8)
      });
    }
  }
}

window.updateAndDrawDecorations = function(dt) {
  window.decorTime += dt;
  ctx.save();
  ctx.globalAlpha = 0.9;
  
  window.themeDecorations.forEach(d => {
    if (d.type === "cloud" || d.type === "bird" || d.type === "owl" || d.type === "bat") {
      d.x -= d.speed * dt;
      if (d.x < -100) d.x = W + 100;
      if (d.type === "bat") d.wingPhase += dt * 9;
    } else if (d.type === "fish") {
      d.x += d.speed * d.direction * dt;
      if (d.x > W + 50) d.direction = -1;
      if (d.x < -50) d.direction = 1;
    } else if (d.type === "bubble") {
      d.y -= d.speed * dt;
      if (d.y < H * 0.2) { d.y = H * 0.9; d.x = Math.random() * W; }
    } else if (d.type === "seaweed") {
      d.sway += dt * 2;
    } else if (d.type === "jellyfish") {
      d.sway += dt;
    } else if (d.type === "diya") {
      if (!d.sway) d.sway = Math.random() * Math.PI * 2;
      d.sway += dt * 3;
      if (!d.anchored) {
        d.y -= d.speed * 0.3 * dt;
        d.x += Math.sin(d.sway) * 0.5;
        if (d.y < H * 0.15) { d.y = H * 0.7; d.x = Math.random() * W; }
      }
    } else if (d.type === "flag") {
      if (!d.sway) d.sway = Math.random() * Math.PI * 2;
      d.sway += dt * 4;
      d.x += d.speed * dt;
      if (d.x > W + 50) d.x = -50;
    } else if (d.type === "kite") {
      d.sway += dt * 1.5;
      d.x += d.speed * dt;
      d.y += Math.sin(d.sway) * dt * 5;
      if (d.x > W + 45) d.x = -45;
    } else if (d.type === "pyramid" || d.type === "cactus" ||
               d.type === "dune" || d.type === "desertRock" || d.type === "desertShrub") {
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
      case "bat": window.drawBat(d.x, d.y, d.s, d.wingPhase); break;
      case "cactus": window.drawCactus(d.x, d.y, d.s); break;
      case "pyramid": window.drawPyramid(d.x, d.y, d.s); break;
      case "dune": window.drawDune(d.x, d.y, d.s); break;
      case "desertRock": window.drawDesertRock(d.x, d.y, d.s); break;
      case "desertShrub": window.drawDesertShrub(d.x, d.y, d.s); break;
      case "fish": window.drawFish(d.x, d.y, d.s, d.direction); break;
      case "seaweed": window.drawSeaweed(d.x, d.y, d.s, d.sway); break;
      case "bubble": window.drawBubble(d.x, d.y, d.s); break;
      case "jellyfish": window.drawJellyfish(d.x, d.y, d.s, d.sway); break;
      case "diya": window.drawDiwaliDecor(d.x, d.y, d.s, d.sway); break;
      case "diwaliGarland": window.drawDiwaliGarland(d.x, d.y, d.s); break;
      case "diwaliRangoli": window.drawDiwaliRangoli(d.x, d.y, d.s); break;
      case "diwaliFirework": window.drawDiwaliFirework(d); break;
      case "flag":
        ctx.save();
        ctx.globalAlpha *= d.opacity;
        window.drawIndependenceDecor(d.x, d.y, d.s, d.sway);
        ctx.restore();
        break;
      case "independenceBunting": window.drawIndependenceBunting(d.x, d.y, d.s); break;
      case "kite": window.drawIndependenceKite(d.x, d.y, d.s, d.sway); break;
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
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const body = ctx.createLinearGradient(-12, -14, 12, 16);
  body.addColorStop(0, "#a9784b");
  body.addColorStop(0.55, "#765039");
  body.addColorStop(1, "#49382f");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-12, -7);
  ctx.lineTo(-15, -16);
  ctx.quadraticCurveTo(-8, -14, -5, -12);
  ctx.quadraticCurveTo(0, -16, 5, -12);
  ctx.lineTo(15, -16);
  ctx.lineTo(12, -6);
  ctx.quadraticCurveTo(17, 7, 10, 15);
  ctx.quadraticCurveTo(0, 21, -10, 15);
  ctx.quadraticCurveTo(-17, 7, -12, -7);
  ctx.fill();

  ctx.fillStyle = "rgba(45, 31, 25, 0.32)";
  ctx.beginPath();
  ctx.ellipse(-10, 2, 4, 9, -0.45, 0, Math.PI * 2);
  ctx.ellipse(10, 2, 4, 9, 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d1b28a";
  ctx.beginPath();
  ctx.ellipse(-5.3, -3, 6, 6.5, 0, 0, Math.PI * 2);
  ctx.ellipse(5.3, -3, 6, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const eyeX of [-5.3, 5.3]) {
    ctx.fillStyle = "#e7c56e";
    ctx.beginPath();
    ctx.arc(eyeX, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#171614";
    ctx.beginPath();
    ctx.arc(eyeX, -3, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeX - 0.6, -3.8, 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#d9943d";
  ctx.beginPath();
  ctx.moveTo(-2, 1);
  ctx.lineTo(2, 1);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#d9b36b";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (const footX of [-5, 5]) {
    ctx.beginPath();
    ctx.moveTo(footX, 15);
    ctx.lineTo(footX, 18);
    ctx.lineTo(footX - 2, 19);
    ctx.moveTo(footX, 18);
    ctx.lineTo(footX + 2, 19);
    ctx.stroke();
  }

  ctx.strokeStyle = "#604632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-19, 20);
  ctx.quadraticCurveTo(0, 17, 19, 20);
  ctx.stroke();
  ctx.restore();
}

window.drawBat = function(x, y, s, wingPhase) {
  const flap = Math.sin(wingPhase) * 5 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#25253d";

  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-10, -12 - flap, -20, -8 - flap);
  ctx.lineTo(-17, -2);
  ctx.lineTo(-13, -4);
  ctx.lineTo(-11, 2);
  ctx.lineTo(-7, -1);
  ctx.quadraticCurveTo(-4, 3, 0, 3);
  ctx.quadraticCurveTo(4, 3, 7, -1);
  ctx.lineTo(11, 2);
  ctx.lineTo(13, -4);
  ctx.lineTo(17, -2);
  ctx.lineTo(20, -8 - flap);
  ctx.quadraticCurveTo(10, -12 - flap, 2, -2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(190, 202, 230, 0.8)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.lineTo(-3, -7);
  ctx.lineTo(0, -4);
  ctx.moveTo(2, -3);
  ctx.lineTo(3, -7);
  ctx.lineTo(0, -4);
  ctx.fill();
  ctx.restore();
}

window.drawCactus = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const cactus = ctx.createLinearGradient(-11, 0, 11, 0);
  cactus.addColorStop(0, "#386b3b");
  cactus.addColorStop(0.45, "#6d9a50");
  cactus.addColorStop(1, "#315b36");
  ctx.fillStyle = cactus;
  ctx.strokeStyle = "#315b36";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(-7, -37);
  ctx.quadraticCurveTo(-7, -43, 0, -43);
  ctx.quadraticCurveTo(7, -43, 7, -37);
  ctx.lineTo(7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-7, -19);
  ctx.lineTo(-14, -19);
  ctx.quadraticCurveTo(-18, -19, -18, -24);
  ctx.lineTo(-18, -30);
  ctx.quadraticCurveTo(-18, -34, -22, -34);
  ctx.quadraticCurveTo(-26, -34, -26, -30);
  ctx.moveTo(-18, -27);
  ctx.lineTo(-18, -14);
  ctx.quadraticCurveTo(-18, -10, -14, -10);
  ctx.lineTo(-7, -10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(7, -13);
  ctx.lineTo(14, -13);
  ctx.quadraticCurveTo(18, -13, 18, -17);
  ctx.lineTo(18, -24);
  ctx.quadraticCurveTo(18, -28, 22, -28);
  ctx.quadraticCurveTo(26, -28, 26, -24);
  ctx.moveTo(18, -21);
  ctx.lineTo(18, -7);
  ctx.quadraticCurveTo(18, -3, 14, -3);
  ctx.lineTo(7, -3);
  ctx.stroke();

  ctx.strokeStyle = "rgba(224, 218, 155, 0.75)";
  ctx.lineWidth = 0.8;
  for (const spineY of [-36, -29, -22, -15, -8]) {
    ctx.beginPath();
    ctx.moveTo(-2, spineY);
    ctx.lineTo(-4, spineY - 2);
    ctx.moveTo(2, spineY + 2);
    ctx.lineTo(4, spineY);
    ctx.stroke();
  }
  ctx.restore();
}

window.drawPyramid = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const sand = ctx.createLinearGradient(-52, -62, 52, 0);
  sand.addColorStop(0, "#f2cb83");
  sand.addColorStop(1, "#c58a4d");
  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(52, 0);
  ctx.lineTo(-52, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#a96f43";
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(52, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(52, 0);
  ctx.lineTo(-52, 0);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = "rgba(129, 83, 49, 0.45)";
  ctx.lineWidth = 1.2;
  for (let row = 1; row <= 5; row++) {
    const rowY = -62 + row * 10.3;
    const halfWidth = row * 8.6;
    ctx.beginPath();
    ctx.moveTo(-halfWidth, rowY);
    ctx.lineTo(halfWidth, rowY);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 224, 160, 0.38)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -51);
  ctx.lineTo(-43, -5);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

window.drawDune = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(211, 151, 87, 0.42)";
  ctx.beginPath();
  ctx.moveTo(-190, 18);
  ctx.quadraticCurveTo(-112, -5, -70, -35);
  ctx.quadraticCurveTo(-20, -66, 30, -42);
  ctx.quadraticCurveTo(78, -18, 110, -31);
  ctx.quadraticCurveTo(150, -43, 190, -4);
  ctx.lineTo(190, 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 225, 168, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-130, -8);
  ctx.quadraticCurveTo(-66, -45, -15, -50);
  ctx.quadraticCurveTo(20, -53, 45, -39);
  ctx.stroke();
  ctx.restore();
}

window.drawDesertRock = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#9c6846";
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-12, -8);
  ctx.lineTo(-5, -12);
  ctx.lineTo(1, -8);
  ctx.lineTo(8, -10);
  ctx.lineTo(15, -3);
  ctx.lineTo(13, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(235, 184, 116, 0.65)";
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.lineTo(-5, -11);
  ctx.lineTo(1, -7);
  ctx.lineTo(-3, -5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

window.drawDesertShrub = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = "#78613b";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2, -11);
  ctx.moveTo(-1, -5);
  ctx.lineTo(-9, -10);
  ctx.moveTo(-1, -7);
  ctx.lineTo(8, -13);
  ctx.moveTo(-2, -10);
  ctx.lineTo(-6, -17);
  ctx.moveTo(4, -10);
  ctx.lineTo(5, -18);
  ctx.stroke();
  ctx.fillStyle = "#987b48";
  for (const [dotX, dotY] of [[-9, -10], [8, -13], [-6, -17], [5, -18]]) {
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

window.drawFish = function(x, y, s, direction) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction, 1);
  const fishSize = 12 * s;
  const bodyGradient = ctx.createLinearGradient(0, -fishSize * 0.6, 0, fishSize * 0.6);
  bodyGradient.addColorStop(0, "#f7b76b");
  bodyGradient.addColorStop(0.55, "#e99154");
  bodyGradient.addColorStop(1, "#bd684b");
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-fishSize * 0.72, 0);
  ctx.quadraticCurveTo(-fishSize * 0.3, -fishSize * 0.75, fishSize * 0.55, -fishSize * 0.48);
  ctx.quadraticCurveTo(fishSize * 1.2, -fishSize * 0.18, fishSize, 0);
  ctx.quadraticCurveTo(fishSize * 0.6, fishSize * 0.55, -fishSize * 0.25, fishSize * 0.48);
  ctx.quadraticCurveTo(-fishSize * 0.65, fishSize * 0.35, -fishSize * 0.72, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-fishSize * 0.65, 0);
  ctx.lineTo(-fishSize - 6 * s, -5 * s);
  ctx.lineTo(-fishSize - 6 * s, 5 * s);
  ctx.closePath();
  ctx.fillStyle = "#d77c50";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2 * s, -fishSize * 0.42);
  ctx.quadraticCurveTo(2 * s, -fishSize * 1.0, 7 * s, -fishSize * 0.36);
  ctx.closePath();
  ctx.fillStyle = "#d77c50";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2 * s, fishSize * 0.34);
  ctx.quadraticCurveTo(3 * s, fishSize * 0.9, 7 * s, fishSize * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 73, 55, 0.45)";
  ctx.lineWidth = Math.max(0.6, s);
  ctx.beginPath();
  ctx.arc(fishSize * 0.48, 0, fishSize * 0.36, -0.75, 0.75);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 226, 178, 0.55)";
  ctx.lineWidth = Math.max(0.5, s * 0.7);
  ctx.beginPath();
  ctx.moveTo(-fishSize * 0.2, -fishSize * 0.35);
  ctx.quadraticCurveTo(fishSize * 0.4, -fishSize * 0.58, fishSize * 0.78, -fishSize * 0.22);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(fishSize * 0.72, -1 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(fishSize * 0.78, -1 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

window.drawSeaweed = function(x, y, s, sway) {
  ctx.lineCap = "round";
  const colors = ["#258b59", "#36a66a", "#197653"];
  for (let blade = -1; blade <= 1; blade++) {
    const lean = blade * 9 * s;
    const height = (36 + (blade === 0 ? 14 : 0)) * s;
    const swayOffset = Math.sin(window.decorTime * 2 + sway + blade) * 8 * s;
    ctx.strokeStyle = colors[blade + 1];
    ctx.lineWidth = (2.5 - Math.abs(blade) * 0.45) * s;
    ctx.beginPath();
    ctx.moveTo(x + blade * 2 * s, y);
    ctx.quadraticCurveTo(x + lean + swayOffset * 0.45, y - height * 0.55, x + lean + swayOffset, y - height);
    ctx.stroke();
  }
}

window.drawJellyfish = function(x, y, s, sway) {
  const bob = Math.sin(window.decorTime * 1.4 + sway) * 3 * s;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = "rgba(190, 133, 190, 0.48)";
  ctx.beginPath();
  ctx.moveTo(-8 * s, 0);
  ctx.quadraticCurveTo(-8 * s, -13 * s, 0, -14 * s);
  ctx.quadraticCurveTo(8 * s, -13 * s, 8 * s, 0);
  ctx.quadraticCurveTo(4 * s, 4 * s, 0, 0);
  ctx.quadraticCurveTo(-4 * s, 4 * s, -8 * s, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(154, 105, 165, 0.55)";
  ctx.lineWidth = 1.2 * s;
  for (let tentacle = -1; tentacle <= 1; tentacle++) {
    const offset = tentacle * 4 * s;
    const drift = Math.sin(window.decorTime * 2 + sway + tentacle) * 2 * s;
    ctx.beginPath();
    ctx.moveTo(offset, 1 * s);
    ctx.quadraticCurveTo(offset + drift, 7 * s, offset - drift, 12 * s);
    ctx.stroke();
  }
  ctx.restore();
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
  const flicker = Math.sin(sway || 0) * 1.5;
  const flameHeight = 9 + flicker;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.shadowColor = "rgba(255, 139, 34, 0.85)";
  ctx.shadowBlur = 16;
  const bowl = ctx.createLinearGradient(0, -5, 0, 9);
  bowl.addColorStop(0, "#ffcb68");
  bowl.addColorStop(0.35, "#e87832");
  bowl.addColorStop(1, "#9d342b");
  ctx.fillStyle = bowl;
  ctx.beginPath();
  ctx.moveTo(-16, -1);
  ctx.quadraticCurveTo(-13, 9, 0, 9);
  ctx.quadraticCurveTo(13, 9, 16, -1);
  ctx.quadraticCurveTo(0, 4, -16, -1);
  ctx.fill();
  ctx.strokeStyle = "#ffe09a";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, -1, 15, 3, 0, 0, Math.PI);
  ctx.stroke();
  ctx.shadowColor = "rgba(255, 189, 48, 0.95)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ff7138";
  ctx.beginPath();
  ctx.moveTo(0, -4 + flicker);
  ctx.bezierCurveTo(-7, -11, -1, -17 - flameHeight * 0.3, 1, -21 - flicker);
  ctx.bezierCurveTo(9, -12, 5, -8, 0, -4 + flicker);
  ctx.fill();
  ctx.fillStyle = "#fff4a8";
  ctx.beginPath();
  ctx.moveTo(0, -5 + flicker);
  ctx.bezierCurveTo(-3, -11, 0, -15, 1, -17 - flicker);
  ctx.bezierCurveTo(4, -12, 3, -8, 0, -5 + flicker);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

window.drawDiwaliGarland = function(x, y, s) {
  const width = Math.max(100, W * 0.94);
  const halfWidth = width / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#e7a84c";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-halfWidth, -4 * s);
  ctx.quadraticCurveTo(-halfWidth * 0.5, 19 * s, 0, 9 * s);
  ctx.quadraticCurveTo(halfWidth * 0.5, 19 * s, halfWidth, -4 * s);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 226, 159, 0.55)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(-halfWidth, 1 * s);
  ctx.quadraticCurveTo(0, 25 * s, halfWidth, 1 * s);
  ctx.stroke();

  const colors = ["#ffd166", "#ff6b8a", "#fff0b0", "#69e0d0", "#bd9aff"];
  for (let i = 0; i < 17; i++) {
    const t = i / 16;
    const lightX = -halfWidth + width * t;
    const lightY = -4 * s + 13 * s * 4 * t * (1 - t);
    ctx.strokeStyle = "#e7a84c";
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(lightX, lightY);
    ctx.lineTo(lightX, lightY + 5 * s);
    ctx.stroke();
    ctx.fillStyle = colors[i % colors.length];
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 12 * s;
    ctx.beginPath();
    ctx.arc(lightX, lightY + 7 * s, 3.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

window.drawDiwaliRangoli = function(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.shadowColor = "rgba(255, 196, 86, 0.5)";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "rgba(255, 227, 167, 0.8)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  const colors = ["#ffca55", "#f06572", "#72d3c2", "#fff0bd"];
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 6);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(0, -17, 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = "rgba(255, 239, 190, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffd86b";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

window.drawDiwaliFirework = function(firework) {
  const cycle = (window.decorTime + firework.phase) % firework.period;
  const progress = cycle / firework.period;
  if (progress < 0.18 || progress > 0.62) return;

  const burst = (progress - 0.18) / 0.44;
  const radius = Math.min(W * 0.13, 48) * firework.s * (0.25 + burst * 0.75);
  const alpha = (1 - burst) * 0.58;
  const rays = firework.style === 1 ? 18 : firework.style === 2 ? 12 : 24;
  const baseAngle = firework.style * 0.2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.strokeStyle = firework.color;
  ctx.fillStyle = firework.color;
  ctx.shadowColor = firework.color;
  ctx.shadowBlur = 9;

  for (let i = 0; i < rays; i++) {
    const angle = baseAngle + i * Math.PI * 2 / rays;
    const rayLength = radius * (firework.style === 2 && i % 2 === 0 ? 0.62 : 1);
    const tailRadius = radius * 0.4;
    const endRadius = firework.style === 1
      ? Math.min(rayLength + radius * burst * 0.3, radius * 1.2)
      : rayLength;
    const startX = firework.x + Math.cos(angle) * tailRadius;
    const startY = firework.y + Math.sin(angle) * tailRadius;
    const endX = firework.x + Math.cos(angle) * endRadius;
    const endY = firework.y + Math.sin(angle) * endRadius;
    ctx.lineWidth = firework.style === 2 ? 1 : 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (firework.style === 1) {
      ctx.quadraticCurveTo(
        (startX + endX) / 2 + Math.sin(angle) * radius * 0.15,
        (startY + endY) / 2 + radius * 0.12,
        endX,
        endY
      );
    } else {
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(endX, endY, firework.style === 2 ? 1.8 : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(firework.x, firework.y, Math.max(1, 2.5 * (1 - burst)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

window.drawIndependenceDecor = function(x, y, s, sway) {
  const flagWidth = 42 * s, flagHeight = 28 * s;
  const flagLeft = -flagWidth / 2;
  const wave = Math.sin(sway || 0);
  const flagX = flagLeft + flagWidth * 0.52;
  const flagY = Math.sin((sway || 0) + 1.5) * 1.2 * s;
  const clothSegments = 12;

  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "#75543a";
  ctx.lineWidth = 1.8 * s;
  ctx.beginPath();
  ctx.moveTo(flagLeft, -flagHeight * 0.72);
  ctx.lineTo(flagLeft, flagHeight * 0.82);
  ctx.stroke();
  ctx.fillStyle = "#d6b781";
  ctx.beginPath();
  ctx.arc(flagLeft, -flagHeight * 0.72, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  const drawClothBand = (band, color) => {
    ctx.beginPath();
    for (let i = 0; i <= clothSegments; i++) {
      const t = i / clothSegments;
      const px = flagLeft + flagWidth * t;
      const py = -flagHeight / 2 + band * flagHeight / 3 +
        Math.sin(t * Math.PI * 1.25 + sway) * 3.2 * s * t;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = clothSegments; i >= 0; i--) {
      const t = i / clothSegments;
      const px = flagLeft + flagWidth * t;
      const py = -flagHeight / 2 + (band + 1) * flagHeight / 3 +
        Math.sin(t * Math.PI * 1.25 + sway) * 3.2 * s * t;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(flagLeft, -flagHeight / 2 - 1, flagWidth + 2, flagHeight + 8 * s);
  ctx.clip();
  drawClothBand(0, "#ff9933");
  drawClothBand(1, "#fffaf0");
  drawClothBand(2, "#138808");

  ctx.globalAlpha = 0.14;
  const fold = ctx.createLinearGradient(flagLeft, 0, flagLeft + flagWidth, 0);
  fold.addColorStop(0, "#ffffff");
  fold.addColorStop(0.35, "#ffffff");
  fold.addColorStop(0.52, "#172338");
  fold.addColorStop(0.72, "#ffffff");
  fold.addColorStop(1, "#172338");
  ctx.fillStyle = fold;
  ctx.fillRect(flagLeft, -flagHeight / 2, flagWidth, flagHeight);
  ctx.globalAlpha = 1;

  const chakraY = flagY;
  const chakraRadius = 4.2 * s;
  ctx.strokeStyle = "#174b91";
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.arc(flagX, chakraY, chakraRadius, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI / 12;
    ctx.beginPath();
    ctx.moveTo(flagX, chakraY);
    ctx.lineTo(flagX + Math.cos(angle) * chakraRadius, chakraY + Math.sin(angle) * chakraRadius);
    ctx.stroke();
  }
  ctx.fillStyle = "#174b91";
  ctx.beginPath();
  ctx.arc(flagX, chakraY, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = `rgba(255, 247, 220, ${0.18 + Math.abs(wave) * 0.12})`;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(flagLeft + 5 * s, -flagHeight * 0.38);
  ctx.quadraticCurveTo(flagLeft + flagWidth * 0.62, -flagHeight * 0.2 + flagY, flagLeft + flagWidth - 2 * s, -flagHeight * 0.08 + flagY);
  ctx.stroke();
  ctx.restore();
}

window.drawIndependenceBunting = function(x, y, s) {
  const width = Math.min(W * 0.92, 520);
  const halfWidth = width / 2;
  const colors = ["#ff9933", "#fffaf0", "#138808"];
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(91, 67, 42, 0.65)";
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(-halfWidth, -5 * s);
  ctx.quadraticCurveTo(0, 15 * s, halfWidth, -5 * s);
  ctx.stroke();

  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const pennantX = -halfWidth + width * t;
    const pennantY = -5 * s + 20 * s * 4 * t * (1 - t);
    const pennantSize = 9 * s;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(pennantX - pennantSize * 0.55, pennantY);
    ctx.lineTo(pennantX + pennantSize * 0.55, pennantY);
    ctx.lineTo(pennantX, pennantY + pennantSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 0.7 * s;
    ctx.stroke();
  }
  ctx.restore();
}

window.drawIndependenceKite = function(x, y, s, sway) {
  const drift = Math.sin(sway) * 3 * s;
  ctx.save();
  ctx.translate(x, y + drift);
  ctx.rotate(Math.PI / 4 + Math.sin(sway) * 0.08);
  const size = 12 * s;
  ctx.fillStyle = "#ff9933";
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.72, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.72, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fffaf0";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(size * 0.48, 0);
  ctx.lineTo(0, size * 0.35);
  ctx.lineTo(-size * 0.48, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#138808";
  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.lineTo(size * 0.48, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.48, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(71, 66, 75, 0.65)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.quadraticCurveTo(5 * s, size + 8 * s, -2 * s, size + 14 * s);
  ctx.quadraticCurveTo(-7 * s, size + 20 * s, 0, size + 25 * s);
  ctx.stroke();
  ctx.restore();
}

window.drawCloud = function(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
  ctx.arc(x + s * 0.55, y + s * 0.1, s * 0.45, 0, Math.PI * 2);
  ctx.arc(x - s * 0.55, y + s * 0.15, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
}
