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
  const fromLeft = Math.random() < 0.30;
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

window.spawnLotusRain = function() {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const size = rand(16, 24);
    particles.push({
      x: rand(0, W),
      y: rand(0, H * 0.2),
      vx: rand(-W * 0.025, W * 0.025),
      vy: rand(H * 0.32, H * 0.42),
      life: 3,
      maxLife: 3,
      size,
      angle: rand(-0.3, 0.3),
      rotationSpeed: rand(-1.3, 1.3),
      color: "lotus",
    });
  }
}

function getCachedPipeSegment(pipe, drawSegment, theme, w, h, c1, c2, isTop) {
  const cacheKey = [theme, w, window.H, window.groundH, window.DPR, c1, c2].join("|");
  if (!pipe.renderCache || pipe.renderCache.key !== cacheKey) {
    pipe.renderCache = { key: cacheKey, top: null, bottom: null };
  }

  const side = isTop ? "top" : "bottom";
  let sprite = pipe.renderCache[side];
  if (!sprite || sprite.height !== h) {
    const paddingX = 12;
    const paddingY = 10;
    const scale = window.DPR || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil((w + paddingX * 2) * scale);
    canvas.height = Math.ceil((h + paddingY * 2) * scale);
    const spriteCtx = canvas.getContext("2d");
    spriteCtx.setTransform(scale, 0, 0, scale, 0, 0);

    const gameCtx = window.ctx;
    try {
      window.ctx = spriteCtx;
      drawSegment(paddingX, paddingY, w, h, c1, c2, isTop);
    } finally {
      window.ctx = gameCtx;
    }

    sprite = pipe.renderCache[side] = {
      canvas,
      height: h,
      paddingX,
      paddingY,
      width: w + paddingX * 2,
      spriteHeight: h + paddingY * 2,
    };
  }

  return sprite;
}

function drawCachedPipeSegment(pipe, drawSegment, theme, x, y, w, h, c1, c2, isTop) {
  const sprite = getCachedPipeSegment(pipe, drawSegment, theme, w, h, c1, c2, isTop);
  window.ctx.drawImage(sprite.canvas, x - sprite.paddingX, y - sprite.paddingY, sprite.width, sprite.spriteHeight);
}

// Drawing functions for entities (global)
window.drawPipes = function() {
  const theme = window.app.getAttribute("data-theme");
  const isDiwali = theme === "diwali";
  const isIndependence = theme === "independence";
  const isDesert = theme === "desert";
  const isOcean = theme === "ocean";
  const isDay = theme === "day";
  const isNight = theme === "night";
  const c1 = getCss("--pipe-1"), c2 = getCss("--pipe-2");
  pipes.forEach(p => {
    const drawSegment = isDiwali
      ? drawDiwaliPipeSegment
      : isIndependence
        ? drawIndependencePipeSegment
        : isDesert
          ? drawEgyptianPipeSegment
          : isOcean
            ? drawOceanPipeSegment
            : isDay
              ? drawDayPipeSegment
              : isNight
                ? drawNightPipeSegment
                : drawPipeSegment;
    if (!p.destruction) {
      drawCachedPipeSegment(p, drawSegment, theme, p.x, 0, PIPE_WIDTH, p.gapTop, c1, c2, true);
      drawCachedPipeSegment(p, drawSegment, theme, p.x, p.gapBottom, PIPE_WIDTH, (H - groundH) - p.gapBottom, c1, c2, false);
      return;
    }

    const floorY = H - groundH;
    const drawBrokenSegment = (y, h, isTop) => {
      if (h <= 0) return;
      const sprite = getCachedPipeSegment(p, drawSegment, theme, PIPE_WIDTH, h, c1, c2, isTop);
      for (const piece of p.destruction.pieces) {
        if (piece.isTop !== isTop || piece.sourceY >= h) continue;
        const pieceHeight = Math.min(piece.sourceHeight, h - piece.sourceY);
        const scale = window.DPR || 1;
        const topPadding = piece.sourceY === 0 ? sprite.paddingY : 0;
        const bottomPadding = piece.sourceY + piece.sourceHeight >= h
          ? sprite.canvas.height / scale - (sprite.paddingY + h)
          : 0;
        const sourceY = (sprite.paddingY + piece.sourceY - topPadding) * scale;
        const sourceHeight = (pieceHeight + topPadding + bottomPadding) * scale;
        const drawWidth = sprite.width;
        const drawHeight = pieceHeight + topPadding + bottomPadding;
        const drawY = piece.y - topPadding;
        ctx.save();
        ctx.translate(piece.x + PIPE_WIDTH / 2, drawY + drawHeight / 2);
        ctx.rotate(piece.rotation);
        ctx.drawImage(
          sprite.canvas,
          0, sourceY, sprite.canvas.width, sourceHeight,
          -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
        );
        ctx.restore();
      }
    };
    drawBrokenSegment(0, p.gapTop, true);
    drawBrokenSegment(p.gapBottom, floorY - p.gapBottom, false);
  });
}

function drawDiwaliPipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const gold = ctx.createLinearGradient(x, 0, x + w, 0);
  gold.addColorStop(0, "#8f4315");
  gold.addColorStop(0.12, "#d18b2c");
  gold.addColorStop(0.28, "#ffdf83");
  gold.addColorStop(0.48, "#b86a1d");
  gold.addColorStop(0.68, "#f5c45d");
  gold.addColorStop(0.88, "#a95719");
  gold.addColorStop(1, "#713313");
  ctx.fillStyle = gold;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const shadow = ctx.createLinearGradient(x, 0, x + w, 0);
  shadow.addColorStop(0, "rgba(60, 25, 8, 0.45)");
  shadow.addColorStop(0.18, "rgba(255, 238, 170, 0.2)");
  shadow.addColorStop(0.5, "rgba(255, 239, 177, 0.28)");
  shadow.addColorStop(0.82, "rgba(82, 34, 10, 0.22)");
  shadow.addColorStop(1, "rgba(45, 19, 7, 0.5)");
  ctx.fillStyle = shadow;
  ctx.fillRect(x, y, w, h);

  const shaftTop = y + Math.min(34, h * 0.18);
  const shaftBottom = y + h - Math.min(34, h * 0.18);
  for (let flute = 0; flute < 5; flute++) {
    const fluteX = x + w * (0.12 + flute * 0.19);
    const fluteWidth = w * 0.12;
    const fluteHeight = Math.max(0, shaftBottom - shaftTop);
    ctx.fillStyle = "rgba(91, 39, 9, 0.3)";
    ctx.beginPath();
    ctx.ellipse(fluteX, shaftTop + fluteHeight / 2, fluteWidth / 2, fluteHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const fluteHighlight = ctx.createLinearGradient(fluteX - fluteWidth / 2, 0, fluteX + fluteWidth / 2, 0);
    fluteHighlight.addColorStop(0, "rgba(145, 74, 16, 0.3)");
    fluteHighlight.addColorStop(0.35, "rgba(255, 230, 151, 0.85)");
    fluteHighlight.addColorStop(0.72, "rgba(255, 202, 83, 0.55)");
    fluteHighlight.addColorStop(1, "rgba(105, 46, 10, 0.38)");
    ctx.fillStyle = fluteHighlight;
    ctx.beginPath();
    ctx.ellipse(fluteX, shaftTop + fluteHeight / 2, fluteWidth * 0.34, fluteHeight / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let motifY = shaftTop + 28; motifY < shaftBottom - 12; motifY += 76) {
    const cx = x + w / 2;
    drawDiwaliLotus(cx, motifY, 0.75);
  }
  ctx.restore();

  const border = ctx.createLinearGradient(x, 0, x + w, 0);
  border.addColorStop(0, "#713313");
  border.addColorStop(0.2, "#f7d375");
  border.addColorStop(0.5, "#a35419");
  border.addColorStop(0.8, "#f5cf72");
  border.addColorStop(1, "#713313");
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y, w - 3, h);

  const lipH = Math.min(28, Math.max(20, h));
  const lipY = isTop ? y + h - lipH : y;
  const lipX = x - 9;
  const lipW = w + 18;
  const lipGradient = ctx.createLinearGradient(lipX, 0, lipX + lipW, 0);
  lipGradient.addColorStop(0, "#713313");
  lipGradient.addColorStop(0.12, "#dfa33e");
  lipGradient.addColorStop(0.28, "#fff0a5");
  lipGradient.addColorStop(0.5, "#a85118");
  lipGradient.addColorStop(0.72, "#f6d06d");
  lipGradient.addColorStop(0.9, "#c27723");
  lipGradient.addColorStop(1, "#713313");
  ctx.fillStyle = lipGradient;
  ctx.fillRect(lipX, lipY, lipW, lipH);

  ctx.strokeStyle = "#713313";
  ctx.lineWidth = 2;
  ctx.strokeRect(lipX, lipY, lipW, lipH);
  ctx.strokeStyle = "rgba(255, 239, 177, 0.9)";
  ctx.lineWidth = 2;
  const trimY = isTop ? lipY + 3 : lipY + lipH - 3;
  ctx.beginPath();
  ctx.moveTo(lipX + 3, trimY);
  ctx.lineTo(lipX + lipW - 3, trimY);
  ctx.stroke();

  const secondTrimY = isTop ? lipY + 7 : lipY + lipH - 7;
  ctx.strokeStyle = "rgba(91, 39, 12, 0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lipX + 3, secondTrimY);
  ctx.lineTo(lipX + lipW - 3, secondTrimY);
  ctx.stroke();

  const ornamentY = lipY + lipH / 2;
  for (let ornamentX = lipX + 8; ornamentX <= lipX + lipW - 8; ornamentX += 12) {
    ctx.fillStyle = "#8b4314";
    ctx.beginPath();
    ctx.ellipse(ornamentX, ornamentY, 2.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe19a";
    ctx.beginPath();
    ctx.arc(ornamentX, ornamentY, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const collarY = isTop ? lipY - 4 : lipY + lipH;
  ctx.fillStyle = "#f3ca69";
  ctx.fillRect(x - 3, collarY, w + 6, 4);
  ctx.strokeStyle = "#874316";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 3, collarY, w + 6, 4);
  ctx.restore();
}

function drawDiwaliLotus(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(103, 44, 9, 0.72)";
  ctx.strokeStyle = "rgba(255, 224, 145, 0.92)";
  ctx.lineWidth = 0.8;
  for (let petal = -2; petal <= 2; petal++) {
    ctx.save();
    ctx.translate(petal * 3.2, 0);
    ctx.rotate(petal * 0.18);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(-3.2, 0, 0, -6);
    ctx.quadraticCurveTo(3.2, 0, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = "#ffe7a2";
  ctx.beginPath();
  ctx.moveTo(-9, 6);
  ctx.quadraticCurveTo(0, 9, 9, 6);
  ctx.stroke();
  ctx.restore();
}

function drawEgyptianPipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const sandstone = ctx.createLinearGradient(x, 0, x + w, 0);
  sandstone.addColorStop(0, "#a85d32");
  sandstone.addColorStop(0.12, "#d9945b");
  sandstone.addColorStop(0.34, "#f5d6a0");
  sandstone.addColorStop(0.55, "#fff0c8");
  sandstone.addColorStop(0.76, "#e4b979");
  sandstone.addColorStop(1, "#98502c");
  ctx.fillStyle = sandstone;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const shaftCap = Math.min(42, h * 0.22);
  const shaftTop = isTop ? y + shaftCap : y + 5;
  const shaftBottom = isTop ? y + h - 4 : y + h - shaftCap;
  const shaftHeight = Math.max(0, shaftBottom - shaftTop);
  const centerX = x + w / 2;
  const inset = Math.min(w * 0.14, 11);

  const shaft = ctx.createLinearGradient(x + inset, 0, x + w - inset, 0);
  shaft.addColorStop(0, "#d49a62");
  shaft.addColorStop(0.2, "#f7e1b5");
  shaft.addColorStop(0.52, "#fff2d6");
  shaft.addColorStop(0.82, "#efd09b");
  shaft.addColorStop(1, "#c2824c");
  ctx.fillStyle = shaft;
  ctx.beginPath();
  if (isTop) {
    ctx.moveTo(x + 2, shaftTop);
    ctx.lineTo(x + w - 2, shaftTop);
    ctx.lineTo(x + w - inset, shaftBottom);
    ctx.lineTo(x + inset, shaftBottom);
  } else {
    ctx.moveTo(x + inset, shaftTop);
    ctx.lineTo(x + w - inset, shaftTop);
    ctx.lineTo(x + w - 2, shaftBottom);
    ctx.lineTo(x + 2, shaftBottom);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(139, 77, 42, 0.55)";
  ctx.lineWidth = 0.9;
  for (let side = 0; side < 2; side++) {
    const borderX = side === 0 ? x + inset + 3 : x + w - inset - 3;
    ctx.beginPath();
    ctx.moveTo(borderX, shaftTop + 5);
    ctx.lineTo(borderX, shaftBottom - 5);
    ctx.stroke();
  }

  const glyphs = ["ankh", "eye", "bird", "sun", "wave", "lotus"];
  const glyphScale = Math.min(1, w / 66);
  const glyphRows = Math.floor(shaftHeight / 38);
  for (let row = 0; row < glyphRows; row++) {
    const symbolY = shaftTop + 19 + row * 38;
    const symbolX = centerX + (row % 2 === 0 ? -9 : 9);
    const type = glyphs[row % glyphs.length];

    ctx.strokeStyle = "rgba(131, 72, 39, 0.52)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(symbolX - 7 * glyphScale, symbolY - 12 * glyphScale, 14 * glyphScale, 24 * glyphScale);
    ctx.strokeStyle = "rgba(255, 242, 207, 0.65)";
    ctx.beginPath();
    ctx.moveTo(symbolX - 5 * glyphScale, symbolY - 10 * glyphScale);
    ctx.lineTo(symbolX + 5 * glyphScale, symbolY - 10 * glyphScale);
    ctx.stroke();

    ctx.save();
    ctx.translate(symbolX, symbolY);
    ctx.scale(glyphScale, glyphScale);
    ctx.strokeStyle = "rgba(133, 74, 40, 0.72)";
    ctx.fillStyle = "rgba(176, 112, 62, 0.16)";
    ctx.lineWidth = 1.15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (type === "ankh") {
      ctx.ellipse(0, -5, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.moveTo(0, -1);
      ctx.lineTo(0, 8);
      ctx.moveTo(-4, 2);
      ctx.lineTo(4, 2);
      ctx.moveTo(-3, 8);
      ctx.lineTo(3, 8);
      ctx.stroke();
    } else if (type === "eye") {
      ctx.moveTo(-5, 0);
      ctx.quadraticCurveTo(0, -5, 5, 0);
      ctx.quadraticCurveTo(0, 5, -5, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2, 3);
      ctx.quadraticCurveTo(2, 6, 4, 8);
      ctx.stroke();
    } else if (type === "bird") {
      ctx.moveTo(-5, 0);
      ctx.quadraticCurveTo(-3, -4, 0, -1);
      ctx.quadraticCurveTo(3, -5, 5, -1);
      ctx.lineTo(2, 2);
      ctx.lineTo(0, 1);
      ctx.lineTo(-2, 3);
      ctx.closePath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, 7);
      ctx.stroke();
    } else if (type === "sun") {
      ctx.arc(0, -2, 3, Math.PI, 0);
      ctx.moveTo(-5, 2);
      ctx.lineTo(5, 2);
      ctx.moveTo(-4, 5);
      ctx.lineTo(4, 5);
      ctx.moveTo(-3, 8);
      ctx.lineTo(3, 8);
      ctx.stroke();
    } else if (type === "wave") {
      ctx.moveTo(-5, -3);
      ctx.quadraticCurveTo(-2, -6, 0, -3);
      ctx.quadraticCurveTo(2, 0, 5, -3);
      ctx.moveTo(-5, 2);
      ctx.quadraticCurveTo(-2, -1, 0, 2);
      ctx.quadraticCurveTo(2, 5, 5, 2);
      ctx.moveTo(-4, 7);
      ctx.lineTo(4, 7);
      ctx.stroke();
    } else {
      ctx.moveTo(0, 7);
      ctx.quadraticCurveTo(-7, 3, -4, -1);
      ctx.quadraticCurveTo(-2, -4, 0, -7);
      ctx.quadraticCurveTo(2, -4, 4, -1);
      ctx.quadraticCurveTo(7, 3, 0, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 6);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "#2c4774";
    ctx.beginPath();
    ctx.moveTo(centerX, symbolY + 15 * glyphScale);
    ctx.lineTo(centerX + 2.5 * glyphScale, symbolY + 18 * glyphScale);
    ctx.lineTo(centerX, symbolY + 21 * glyphScale);
    ctx.lineTo(centerX - 2.5 * glyphScale, symbolY + 18 * glyphScale);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const bandHeight = Math.min(42, Math.max(22, h * 0.17));
  const bandY = isTop ? y + h - bandHeight : y;
  const capX = x - 10;
  const capW = w + 20;
  const capGradient = ctx.createLinearGradient(0, bandY, 0, bandY + bandHeight);
  capGradient.addColorStop(0, "#ffe4a0");
  capGradient.addColorStop(0.22, "#e6a84e");
  capGradient.addColorStop(0.5, "#b76835");
  capGradient.addColorStop(0.78, "#e5a84b");
  capGradient.addColorStop(1, "#9d502b");
  ctx.fillStyle = capGradient;
  ctx.fillRect(capX, bandY, capW, bandHeight);
  ctx.strokeStyle = "#794126";
  ctx.lineWidth = 2;
  ctx.strokeRect(capX, bandY, capW, bandHeight);

  const friezeTop = isTop ? bandY : bandY + bandHeight - Math.min(14, bandHeight * 0.35);
  const friezeBottom = isTop ? bandY + Math.min(14, bandHeight * 0.35) : bandY + bandHeight;
  const friezeHeight = Math.max(0, friezeBottom - friezeTop);
  if (friezeHeight > 0) {
    ctx.fillStyle = "#182f60";
    ctx.fillRect(capX + 1, friezeTop, capW - 2, friezeHeight);
    const motifCount = Math.max(3, Math.floor(capW / 13));
    for (let motif = 0; motif < motifCount; motif++) {
      const motifX = capX + (motif + 0.5) * capW / motifCount;
      ctx.fillStyle = motif % 2 ? "#f5c55e" : "#51c5ba";
      ctx.beginPath();
      ctx.moveTo(motifX - 3, friezeTop);
      ctx.lineTo(motifX + 3, friezeTop);
      ctx.lineTo(motifX, friezeBottom);
      ctx.closePath();
      ctx.fill();
    }
  }

  const flatTop = isTop ? friezeBottom : bandY;
  const flatBottom = isTop ? bandY + bandHeight : friezeTop;
  const flatHeight = flatBottom - flatTop;
  if (flatHeight > 6) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(capX + 1, flatTop, capW - 2, flatHeight);
    ctx.clip();

    const tileCount = Math.max(2, Math.floor(capW / 22));
    const tileWidth = capW / tileCount;
    const motifY = flatTop + flatHeight / 2;
    ctx.strokeStyle = "rgba(112, 59, 31, 0.62)";
    ctx.lineWidth = 0.8;
    for (let tile = 0; tile <= tileCount; tile++) {
      const tileX = capX + tile * tileWidth;
      ctx.beginPath();
      ctx.moveTo(tileX, flatTop + 2);
      ctx.lineTo(tileX, flatBottom - 2);
      ctx.stroke();
    }

    for (let tile = 0; tile < tileCount; tile++) {
      const motifX = capX + (tile + 0.5) * tileWidth;
      const halfWidth = Math.min(3.2, tileWidth * 0.18);
      const halfHeight = Math.min(5, flatHeight * 0.26);
      ctx.fillStyle = tile % 2 === 0 ? "#315078" : "#236c69";
      ctx.strokeStyle = "#ffe4a0";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(motifX, motifY - halfHeight);
      ctx.lineTo(motifX + halfWidth, motifY);
      ctx.lineTo(motifX, motifY + halfHeight);
      ctx.lineTo(motifX - halfWidth, motifY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.strokeStyle = "#ffe4a0";
  ctx.lineWidth = 2;
  const trimY = isTop ? bandY + bandHeight - 3 : bandY + 3;
  ctx.beginPath();
  ctx.moveTo(capX + 2, trimY);
  ctx.lineTo(capX + capW - 2, trimY);
  ctx.stroke();

  const collarHeight = 7;
  const collarY = isTop ? bandY - collarHeight : bandY + bandHeight;
  ctx.fillStyle = "#f4d28d";
  ctx.fillRect(x - 5, collarY, w + 10, collarHeight);
  ctx.strokeStyle = "#91502e";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 5, collarY, w + 10, collarHeight);
  ctx.restore();
}

function drawOceanPipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const stone = ctx.createLinearGradient(x, 0, x + w, 0);
  stone.addColorStop(0, "#174b50");
  stone.addColorStop(0.13, "#367f7c");
  stone.addColorStop(0.32, "#85c7b5");
  stone.addColorStop(0.5, "#b7dfc9");
  stone.addColorStop(0.72, "#6aa69a");
  stone.addColorStop(0.9, "#326e70");
  stone.addColorStop(1, "#173f4c");
  ctx.fillStyle = stone;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const capH = Math.min(h, 42, Math.max(12, h * 0.2));
  const shaftTop = isTop ? y + 3 : y + capH;
  const shaftBottom = isTop ? y + h - capH : y + h - 3;
  const shaftHeight = Math.max(0, shaftBottom - shaftTop);

  const face = ctx.createLinearGradient(x, 0, x + w, 0);
  face.addColorStop(0, "rgba(14, 58, 68, 0.42)");
  face.addColorStop(0.2, "rgba(190, 228, 205, 0.2)");
  face.addColorStop(0.48, "rgba(220, 241, 213, 0.4)");
  face.addColorStop(0.76, "rgba(52, 124, 120, 0.18)");
  face.addColorStop(1, "rgba(10, 52, 66, 0.5)");
  ctx.fillStyle = face;
  ctx.fillRect(x, y, w, h);

  const fluteCount = 5;
  const fluteWidth = w * 0.13;
  for (let flute = 0; flute < fluteCount; flute++) {
    const fluteX = x + w * (0.12 + flute * 0.19);
    const left = fluteX - fluteWidth / 2;
    const right = fluteX + fluteWidth / 2;
    ctx.fillStyle = "rgba(12, 57, 64, 0.42)";
    ctx.beginPath();
    ctx.moveTo(left, shaftTop + 5);
    ctx.quadraticCurveTo(fluteX, shaftTop - 2, right, shaftTop + 5);
    ctx.lineTo(right, shaftBottom - 5);
    ctx.quadraticCurveTo(fluteX, shaftBottom + 2, left, shaftBottom - 5);
    ctx.closePath();
    ctx.fill();

    const fluteLight = ctx.createLinearGradient(left, 0, right, 0);
    fluteLight.addColorStop(0, "rgba(36, 105, 107, 0.25)");
    fluteLight.addColorStop(0.35, "rgba(218, 241, 214, 0.78)");
    fluteLight.addColorStop(0.72, "rgba(142, 204, 184, 0.52)");
    fluteLight.addColorStop(1, "rgba(18, 75, 82, 0.35)");
    ctx.fillStyle = fluteLight;
    ctx.beginPath();
    ctx.moveTo(left + 2, shaftTop + 6);
    ctx.quadraticCurveTo(fluteX, shaftTop + 1, right - 2, shaftTop + 6);
    ctx.lineTo(right - 2, shaftBottom - 6);
    ctx.quadraticCurveTo(fluteX, shaftBottom - 1, left + 2, shaftBottom - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(225, 245, 215, 0.68)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + 3, shaftTop + 8);
    ctx.lineTo(left + 3, shaftBottom - 8);
    ctx.stroke();
  }

  const growthY = isTop ? shaftTop + 8 : shaftBottom - 8;
  const growthDirection = isTop ? 1 : -1;
  for (let vine = 0; vine < 2; vine++) {
    const vineX = x + w * (vine === 0 ? 0.08 : 0.92);
    const side = vine === 0 ? 1 : -1;
    const vineLength = Math.min(shaftHeight * 0.72, h * 0.42);
    ctx.strokeStyle = vine === 0 ? "#286f58" : "#357c62";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(vineX, growthY);
    ctx.bezierCurveTo(
      vineX + side * 8, growthY + growthDirection * vineLength * 0.3,
      vineX - side * 5, growthY + growthDirection * vineLength * 0.68,
      vineX + side * 3, growthY + growthDirection * vineLength
    );
    ctx.stroke();
    const leafCount = Math.max(2, Math.floor(vineLength / 18));
    for (let leaf = 0; leaf < leafCount; leaf++) {
      const leafY = growthY + growthDirection * (7 + leaf * Math.min(17, vineLength / leafCount));
      const leafX = vineX + side * (leaf % 2 === 0 ? 3 : -1);
      ctx.fillStyle = leaf % 2 ? "#79a85f" : "#3e8b65";
      ctx.beginPath();
      ctx.ellipse(leafX + side * 4, leafY, 2.5, 5, side * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let barnacleY = shaftTop + 22; barnacleY < shaftBottom - 10; barnacleY += 56) {
    const side = Math.floor((barnacleY - shaftTop) / 56) % 2 === 0 ? 1 : -1;
    const barnacleX = x + w * (side === 1 ? 0.22 : 0.78);
    ctx.fillStyle = "rgba(225, 214, 166, 0.7)";
    ctx.beginPath();
    ctx.arc(barnacleX, barnacleY, 2.5, 0, Math.PI * 2);
    ctx.arc(barnacleX + side * 4, barnacleY + 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(47, 105, 99, 0.65)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(barnacleX, barnacleY, 3.2, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(229, 241, 204, 0.32)";
  ctx.lineWidth = 1;
  for (let crack = 0; crack < 2; crack++) {
    const crackX = x + w * (0.36 + crack * 0.29);
    const crackY = shaftTop + shaftHeight * (0.3 + crack * 0.25);
    ctx.beginPath();
    ctx.moveTo(crackX, crackY);
    ctx.lineTo(crackX - 2, crackY + 4);
    ctx.lineTo(crackX + 1, crackY + 7);
    ctx.lineTo(crackX - 1, crackY + 10);
    ctx.stroke();
  }
  ctx.restore();

  const capPositions = isTop ? [y + h - capH] : [y];
  for (const capY of capPositions) {
    const facesGap = isTop ? capY > y : capY === y;
    const capX = x - 9;
    const capW = w + 18;
    const cap = ctx.createLinearGradient(0, capY, 0, capY + capH);
    cap.addColorStop(0, "#c2d8b8");
    cap.addColorStop(0.18, "#75aa9a");
    cap.addColorStop(0.48, "#327978");
    cap.addColorStop(0.78, "#498d83");
    cap.addColorStop(1, "#1c5863");
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.moveTo(capX, capY + capH * 0.18);
    ctx.quadraticCurveTo(capX, capY, capX + 8, capY);
    ctx.lineTo(capX + capW - 8, capY);
    ctx.quadraticCurveTo(capX + capW, capY, capX + capW, capY + capH * 0.18);
    ctx.lineTo(capX + capW, capY + capH * 0.78);
    ctx.quadraticCurveTo(capX + capW, capY + capH, capX + capW - 8, capY + capH);
    ctx.lineTo(capX + 8, capY + capH);
    ctx.quadraticCurveTo(capX, capY + capH, capX, capY + capH * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#174b50";
    ctx.lineWidth = 2;
    ctx.stroke();

    const trimA = facesGap ? capY + 4 : capY + capH - 4;
    const trimB = facesGap ? capY + 9 : capY + capH - 9;
    ctx.strokeStyle = "rgba(212, 236, 201, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(capX + 3, trimA);
    ctx.lineTo(capX + capW - 3, trimA);
    ctx.stroke();
    ctx.strokeStyle = "rgba(19, 70, 76, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(capX + 3, trimB);
    ctx.lineTo(capX + capW - 3, trimB);
    ctx.stroke();

    const reliefY = capY + capH / 2;
    const reliefRadius = Math.min(6, capH * 0.14);
    for (let reliefX = capX + 10; reliefX < capX + capW - 7; reliefX += 18) {
      drawOceanShellRelief(reliefX, reliefY, reliefRadius);
    }

    const capitalY = facesGap ? capY + capH - 2 : capY + 2;
    for (const side of [-1, 1]) {
      const reliefX = x + w / 2 + side * w * 0.36;
      drawOceanCoralRelief(reliefX, capitalY, 0.7);
    }
    const edgeY = facesGap ? capY + 2 : capY + capH - 2;
    ctx.strokeStyle = "rgba(224, 245, 218, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(capX + 5, edgeY);
    ctx.quadraticCurveTo(x + w / 2, edgeY + (facesGap ? -6 : 6), capX + capW - 5, edgeY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOceanShellRelief(x, y, size) {
  ctx.save();
  ctx.fillStyle = "rgba(17, 69, 74, 0.65)";
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.45);
  ctx.quadraticCurveTo(x - size, y - size, x, y - size);
  ctx.quadraticCurveTo(x + size, y - size, x + size, y + size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c5d5ad";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.72, y + size * 0.28);
  ctx.quadraticCurveTo(x - size * 0.72, y - size * 0.65, x, y - size * 0.65);
  ctx.quadraticCurveTo(x + size * 0.72, y - size * 0.65, x + size * 0.72, y + size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(37, 91, 87, 0.8)";
  ctx.lineWidth = 0.7;
  for (let rib = -1; rib <= 1; rib++) {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.quadraticCurveTo(x + rib * size * 0.5, y, x + rib * size * 0.65, y + size * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawOceanCoralRelief(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(23, 73, 72, 0.78)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(0, -2);
  ctx.lineTo(-5, -8);
  ctx.moveTo(0, -2);
  ctx.lineTo(5, -9);
  ctx.moveTo(0, 2);
  ctx.lineTo(-7, -1);
  ctx.stroke();
  ctx.strokeStyle = "rgba(176, 202, 143, 0.9)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-1, 7);
  ctx.lineTo(-1, -2);
  ctx.lineTo(-6, -8);
  ctx.moveTo(-1, -2);
  ctx.lineTo(4, -9);
  ctx.moveTo(-1, 2);
  ctx.lineTo(-7, -1);
  ctx.stroke();
  ctx.restore();
}

function drawIndependencePipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const stone = ctx.createLinearGradient(x, 0, x + w, 0);
  stone.addColorStop(0, "#79503d");
  stone.addColorStop(0.1, "#c89d79");
  stone.addColorStop(0.24, "#f7e2c4");
  stone.addColorStop(0.48, "#fff3dc");
  stone.addColorStop(0.68, "#dfbd98");
  stone.addColorStop(0.9, "#ad7958");
  stone.addColorStop(1, "#694431");
  ctx.fillStyle = stone;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const innerHeight = Math.min(48, h * 0.24);
  const shaftTop = isTop ? y : y + innerHeight;
  const shaftBottom = isTop ? y + h - innerHeight : y + h;
  const shaftHeight = Math.max(0, shaftBottom - shaftTop);
  const fluteCount = 5;
  const fluteWidth = w / (fluteCount * 1.55);
  for (let flute = 0; flute < fluteCount; flute++) {
    const fluteX = x + w * (0.12 + flute * 0.19);
    const fluteLeft = fluteX - fluteWidth / 2;
    const fluteRight = fluteX + fluteWidth / 2;
    const fluteRadius = fluteWidth / 2;
    ctx.fillStyle = "rgba(111, 69, 46, 0.2)";
    ctx.beginPath();
    ctx.moveTo(fluteLeft, shaftTop + fluteRadius);
    ctx.quadraticCurveTo(fluteLeft, shaftTop, fluteX, shaftTop);
    ctx.quadraticCurveTo(fluteRight, shaftTop, fluteRight, shaftTop + fluteRadius);
    ctx.lineTo(fluteRight, shaftBottom - fluteRadius);
    ctx.quadraticCurveTo(fluteRight, shaftBottom, fluteX, shaftBottom);
    ctx.quadraticCurveTo(fluteLeft, shaftBottom, fluteLeft, shaftBottom - fluteRadius);
    ctx.closePath();
    ctx.fill();

    const highlight = ctx.createLinearGradient(fluteLeft, 0, fluteRight, 0);
    highlight.addColorStop(0, "rgba(126, 78, 51, 0.45)");
    highlight.addColorStop(0.28, "rgba(255, 250, 232, 0.8)");
    highlight.addColorStop(0.7, "rgba(255, 250, 232, 0.32)");
    highlight.addColorStop(1, "rgba(113, 67, 45, 0.52)");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.moveTo(fluteLeft + 1, shaftTop + fluteRadius);
    ctx.quadraticCurveTo(fluteLeft + 1, shaftTop + 1, fluteX, shaftTop + 1);
    ctx.quadraticCurveTo(fluteRight - 1, shaftTop + 1, fluteRight - 1, shaftTop + fluteRadius);
    ctx.lineTo(fluteRight - 1, shaftBottom - fluteRadius);
    ctx.quadraticCurveTo(fluteRight - 1, shaftBottom - 1, fluteX, shaftBottom - 1);
    ctx.quadraticCurveTo(fluteLeft + 1, shaftBottom - 1, fluteLeft + 1, shaftBottom - fluteRadius);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(120, 76, 53, 0.48)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(fluteLeft, shaftTop + fluteRadius);
    ctx.lineTo(fluteLeft, shaftBottom - fluteRadius);
    ctx.stroke();
  }
  ctx.restore();

  const drawMolding = (centerY, height, extension, accent) => {
    const left = x - extension;
    const right = x + w + extension;
    const middle = x + w / 2;
    const top = centerY - height / 2;
    const bottom = centerY + height / 2;
    const molding = ctx.createLinearGradient(left, 0, right, 0);
    molding.addColorStop(0, "#77503d");
    molding.addColorStop(0.14, "#c99b73");
    molding.addColorStop(0.32, "#f8e4c4");
    molding.addColorStop(0.52, "#fff4df");
    molding.addColorStop(0.78, "#d4ad86");
    molding.addColorStop(1, "#744a36");
    ctx.fillStyle = molding;
    ctx.strokeStyle = "#684432";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(left, bottom - height * 0.22);
    ctx.quadraticCurveTo(left, top + height * 0.12, left + extension * 0.5, top + height * 0.08);
    ctx.lineTo(right - extension * 0.5, top + height * 0.08);
    ctx.quadraticCurveTo(right, top + height * 0.12, right, bottom - height * 0.22);
    ctx.quadraticCurveTo(right, bottom, right - extension * 0.55, bottom);
    ctx.lineTo(left + extension * 0.55, bottom);
    ctx.quadraticCurveTo(left, bottom, left, bottom - height * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 250, 230, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(left + 3, top + height * 0.25);
    ctx.quadraticCurveTo(middle, top + height * 0.05, right - 3, top + height * 0.25);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + 3, bottom - 2);
    ctx.lineTo(right - 3, bottom - 2);
    ctx.stroke();
  };

  const innerCenter = isTop ? y + h - innerHeight / 2 : y + innerHeight / 2;
  drawMolding(innerCenter, innerHeight, 10, "#138808");

  const capitalCenter = innerCenter;
  const capitalScale = Math.min(1, innerHeight / 44);
  const curlY = capitalCenter + (isTop ? 2 : -2);
  ctx.fillStyle = "rgba(149, 103, 72, 0.26)";
  ctx.beginPath();
  ctx.ellipse(x + w * 0.27, curlY, 9 * capitalScale, 8 * capitalScale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.73, curlY, 9 * capitalScale, 8 * capitalScale, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const curlX of [x + w * 0.27, x + w * 0.73]) {
    ctx.strokeStyle = "#815b42";
    ctx.lineWidth = 2 * capitalScale;
    ctx.beginPath();
    ctx.arc(curlX, curlY, 6 * capitalScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 249, 226, 0.95)";
    ctx.lineWidth = 1 * capitalScale;
    ctx.beginPath();
    ctx.arc(curlX, curlY, 3.8 * capitalScale, 0.2, Math.PI * 1.8);
    ctx.stroke();
  }

  ctx.strokeStyle = "#9c7658";
  ctx.lineWidth = 1.4;
  for (let leaf = -2; leaf <= 2; leaf++) {
    const leafX = x + w / 2 + leaf * 7;
    const leafY = capitalCenter + (isTop ? 11 : -11);
    ctx.fillStyle = leaf % 2 ? "#e4c7a2" : "#f2dcc0";
    ctx.beginPath();
    ctx.ellipse(leafX, leafY, 3, 7 * capitalScale, leaf * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(94, 60, 42, 0.76)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 2, shaftTop + 1);
  ctx.lineTo(x + 2, shaftBottom - 1);
  ctx.moveTo(x + w - 2, shaftTop + 1);
  ctx.lineTo(x + w - 2, shaftBottom - 1);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 248, 229, 0.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 4, shaftTop + 3);
  ctx.lineTo(x + 4, shaftBottom - 3);
  ctx.moveTo(x + w - 4, shaftTop + 3);
  ctx.lineTo(x + w - 4, shaftBottom - 3);
  ctx.stroke();
  ctx.restore();
}

function drawDayPipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const stone = ctx.createLinearGradient(x, 0, x + w, 0);
  stone.addColorStop(0, "#b9795e");
  stone.addColorStop(0.12, "#e4b996");
  stone.addColorStop(0.32, "#fff0d6");
  stone.addColorStop(0.52, "#fff8e9");
  stone.addColorStop(0.76, "#e8c19d");
  stone.addColorStop(0.92, "#c58d6f");
  stone.addColorStop(1, "#9d634e");
  ctx.fillStyle = stone;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const endH = Math.min(42, h, Math.max(12, h * 0.18));
  const shaftTop = isTop ? y + 3 : y + endH;
  const shaftBottom = isTop ? y + h - endH : y + h - 3;
  const shaftHeight = Math.max(0, shaftBottom - shaftTop);

  ctx.fillStyle = "rgba(255, 246, 224, 0.48)";
  ctx.fillRect(x + 4, shaftTop, w - 8, shaftHeight);
  for (let flute = 0; flute < 5; flute++) {
    const fluteX = x + w * (0.12 + flute * 0.19);
    const fluteW = Math.max(2, w * 0.12);
    const fluteY = shaftTop + 3;
    const fluteH = Math.max(0, shaftHeight - 6);
    ctx.fillStyle = "rgba(150, 88, 66, 0.18)";
    ctx.beginPath();
    ctx.ellipse(fluteX, fluteY + fluteH / 2, fluteW / 2, fluteH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const highlight = ctx.createLinearGradient(fluteX - fluteW / 2, 0, fluteX + fluteW / 2, 0);
    highlight.addColorStop(0, "rgba(255, 248, 226, 0.12)");
    highlight.addColorStop(0.42, "rgba(255, 255, 244, 0.8)");
    highlight.addColorStop(1, "rgba(178, 113, 84, 0.18)");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.ellipse(fluteX, fluteY + fluteH / 2, fluteW * 0.28, Math.max(0, fluteH / 2 - 1), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (shaftHeight > 30) {
    const inlayW = Math.max(2, w * 0.045);
    const inlay = ctx.createLinearGradient(x + w / 2 - inlayW, 0, x + w / 2 + inlayW, 0);
    inlay.addColorStop(0, "rgba(184, 128, 163, 0)");
    inlay.addColorStop(0.5, "rgba(184, 128, 163, 0.52)");
    inlay.addColorStop(1, "rgba(184, 128, 163, 0)");
    ctx.fillStyle = inlay;
    ctx.fillRect(x + w / 2 - inlayW, shaftTop + 5, inlayW * 2, shaftHeight - 10);
  }
  ctx.restore();

  const capY = isTop ? y + h - endH : y;
  const capX = x - 8;
  const capW = w + 16;
  const bandCount = 4;
  for (let band = 0; band < bandCount; band++) {
    const bandT = band / (bandCount - 1);
    const bandY = capY + bandT * endH;
    const bandH = endH / bandCount + 1;
    const widthT = isTop ? bandT : 1 - bandT;
    const inset = 2 + (1 - widthT) * 5;
    const left = capX + inset;
    const right = capX + capW - inset;
    const bevel = ctx.createLinearGradient(left, bandY, right, bandY + bandH);
    bevel.addColorStop(0, "#ba8065");
    bevel.addColorStop(0.18, "#f5d6b1");
    bevel.addColorStop(0.48, "#fff4df");
    bevel.addColorStop(0.82, "#dfb18e");
    bevel.addColorStop(1, "#a96f58");
    ctx.fillStyle = bevel;
    ctx.fillRect(left, bandY, right - left, bandH);
    ctx.strokeStyle = band === 1 || band === 2 ? "rgba(168, 111, 91, 0.58)" : "rgba(255, 248, 228, 0.82)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + 1, bandY + bandH - 1);
    ctx.lineTo(right - 1, bandY + bandH - 1);
    ctx.stroke();
  }

  const frontY = isTop ? capY + endH - 2 : capY + 2;
  const frontW = isTop ? capW - 4 : capW - 12;
  const frontX = x + w / 2 - frontW / 2;
  ctx.fillStyle = "#d9a987";
  ctx.fillRect(frontX, frontY, frontW, 4);
  ctx.fillStyle = "rgba(255, 246, 223, 0.92)";
  ctx.fillRect(frontX + 2, frontY, frontW - 4, 1);
  ctx.restore();
}

function drawNightPipeSegment(x, y, w, h, c1, c2, isTop) {
  if (h <= 0) return;
  ctx.save();

  const stone = ctx.createLinearGradient(x, 0, x + w, 0);
  stone.addColorStop(0, "#26384d");
  stone.addColorStop(0.1, "#526d87");
  stone.addColorStop(0.28, "#91a7bb");
  stone.addColorStop(0.48, "#bac8d2");
  stone.addColorStop(0.7, "#758ba1");
  stone.addColorStop(0.9, "#40566e");
  stone.addColorStop(1, "#1c2d42");
  ctx.fillStyle = stone;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const capitalH = Math.min(42, h, Math.max(12, h * 0.18));
  const shaftTop = isTop ? y + 2 : y + capitalH;
  const shaftBottom = isTop ? y + h - capitalH : y + h - 2;
  const shaftH = Math.max(0, shaftBottom - shaftTop);
  const shaftLeft = x + w * 0.1;
  const shaftRight = x + w * 0.9;

  const shaft = ctx.createLinearGradient(shaftLeft, 0, shaftRight, 0);
  shaft.addColorStop(0, "#31465d");
  shaft.addColorStop(0.2, "#7e96ac");
  shaft.addColorStop(0.5, "#a9bac8");
  shaft.addColorStop(0.78, "#748ba1");
  shaft.addColorStop(1, "#2a3e55");
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(shaftLeft, shaftTop);
  ctx.lineTo(shaftRight, shaftTop);
  ctx.lineTo(x + w * 0.82, shaftBottom);
  ctx.lineTo(x + w * 0.18, shaftBottom);
  ctx.closePath();
  ctx.fill();

  const fluteCount = 5;
  for (let flute = 0; flute < fluteCount; flute++) {
    const fluteX = x + w * (0.18 + flute * 0.16);
    const inset = fluteX < x + w / 2 ? 1 : -1;
    ctx.strokeStyle = "rgba(25, 42, 61, 0.68)";
    ctx.lineWidth = Math.max(1.5, w * 0.035);
    ctx.beginPath();
    ctx.moveTo(fluteX, shaftTop + 4);
    ctx.lineTo(fluteX + inset, shaftBottom - 4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(224, 235, 239, 0.66)";
    ctx.lineWidth = Math.max(1, w * 0.018);
    ctx.beginPath();
    ctx.moveTo(fluteX + 2, shaftTop + 5);
    ctx.lineTo(fluteX + 3 + inset, shaftBottom - 5);
    ctx.stroke();
  }

  const neckY = isTop ? y + h - capitalH : y + capitalH - 5;
  const neckH = Math.min(9, capitalH * 0.28);
  const neckGradient = ctx.createLinearGradient(x, 0, x + w, 0);
  neckGradient.addColorStop(0, "#24384e");
  neckGradient.addColorStop(0.22, "#8298ad");
  neckGradient.addColorStop(0.5, "#c2ccd2");
  neckGradient.addColorStop(0.78, "#71879b");
  neckGradient.addColorStop(1, "#26394e");
  ctx.fillStyle = neckGradient;
  ctx.fillRect(x + 2, neckY, w - 4, neckH);
  ctx.fillStyle = "rgba(22, 38, 56, 0.72)";
  ctx.fillRect(x + 2, neckY + neckH - 2, w - 4, 2);
  ctx.restore();

  const capY = isTop ? y + h - capitalH : y;
  const capX = x - 10;
  const capW = w + 20;
  const steps = [
    { inset: 0, offset: 0.02, height: 0.17 },
    { inset: 4, offset: 0.2, height: 0.16 },
    { inset: 7, offset: 0.38, height: 0.15 },
    { inset: 5, offset: 0.55, height: 0.2 },
    { inset: 2, offset: 0.78, height: 0.18 },
  ];
  for (const step of steps) {
    const stepY = capY + capitalH * step.offset;
    const stepH = capitalH * step.height;
    const left = capX + step.inset;
    const right = capX + capW - step.inset;
    const band = ctx.createLinearGradient(left, stepY, right, stepY + stepH);
    band.addColorStop(0, "#26394f");
    band.addColorStop(0.14, "#637b93");
    band.addColorStop(0.34, "#b1bfca");
    band.addColorStop(0.52, "#d0d8dd");
    band.addColorStop(0.76, "#7d93a7");
    band.addColorStop(1, "#26384d");
    ctx.fillStyle = band;
    ctx.fillRect(left, stepY, right - left, stepH);
    ctx.strokeStyle = "rgba(20, 35, 52, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(left, stepY, right - left, stepH);
    ctx.strokeStyle = "rgba(226, 235, 238, 0.72)";
    ctx.beginPath();
    ctx.moveTo(left + 2, stepY + 1);
    ctx.lineTo(right - 2, stepY + 1);
    ctx.stroke();
  }

  const capitalCenterY = capY + capitalH * 0.48;
  const ornamentRadius = Math.min(5, capitalH * 0.13);
  ctx.strokeStyle = "rgba(25, 42, 60, 0.82)";
  ctx.lineWidth = 1.4;
  for (const side of [-1, 1]) {
    const ornamentX = x + w / 2 + side * w * 0.34;
    ctx.beginPath();
    ctx.arc(ornamentX, capitalCenterY, ornamentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ornamentX, capitalCenterY, ornamentRadius * 0.48, 0, Math.PI * 2);
    ctx.stroke();
  }

  const trimY = isTop ? capY + capitalH - 3 : capY + 3;
  ctx.fillStyle = "#26394f";
  ctx.fillRect(capX + 3, trimY, capW - 6, 3);
  ctx.fillStyle = "rgba(221, 232, 236, 0.88)";
  ctx.fillRect(capX + 5, trimY, capW - 10, 1);
  ctx.restore();
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

window.drawPappuEffects = function() {
  const projectileImage = imageCache["images/attack.png"];
  window.pappuProjectiles.forEach(projectile => {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.rotation);
    ctx.shadowColor = "#ff7a18";
    ctx.shadowBlur = 16;
    if (projectileImage && projectileImage.complete && projectileImage.naturalWidth > 0) {
      ctx.drawImage(projectileImage, -projectile.size / 2, -projectile.size / 2, projectile.size, projectile.size);
    } else {
      ctx.fillStyle = "#ff9d26";
      ctx.beginPath();
      ctx.moveTo(projectile.size * 0.55, 0);
      ctx.lineTo(-projectile.size * 0.35, -projectile.size * 0.28);
      ctx.lineTo(-projectile.size * 0.18, 0);
      ctx.lineTo(-projectile.size * 0.35, projectile.size * 0.28);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  window.cockroaches.forEach(cockroach => {
    if (!cockroach.burning) return;
    const progress = cockroach.burning.elapsed / window.GAME_CONFIG.PAPPU_HAMZA_COCKROACH_BURN_DURATION;
    const cy = cockroach.y + Math.sin(cockroach.bob) * 8;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.translate(cockroach.x, cy);
    ctx.shadowColor = "#ff4b12";
    ctx.shadowBlur = 18;
    for (let flame = 0; flame < 5; flame++) {
      const x = (flame - 2) * cockroach.size * 0.17;
      const flicker = Math.sin(window.elapsed * 24 + flame * 2) * 3;
      ctx.fillStyle = flame % 2 ? "#ff741e" : "#ffd34e";
      ctx.beginPath();
      ctx.moveTo(x - 5, 9);
      ctx.quadraticCurveTo(x - 9, -2 - flicker, x, -cockroach.size * 0.45 - flicker);
      ctx.quadraticCurveTo(x + 10, -3, x + 5, 9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  window.pappuEffects.forEach(effect => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, effect.life / effect.maxLife);
    ctx.fillStyle = "#ffb52e";
    ctx.shadowColor = "#ff4b12";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

window.drawHitShield = function() {
  const bird = window.bird;
  if (!bird) return;

  const skillTimers = [window.systumHackTimer, window.vandeBoostTimer, window.pappuHamzaTimer].filter(timer => timer > 0);
  const skillActive = skillTimers.length > 0;
  const vandeActive = window.vandeBoostTimer > 0;
  const pappuActive = window.pappuHamzaTimer > 0;
  const hitShieldActive = bird.shieldTimer > 0;
  if (!skillActive && !hitShieldActive) return;

  const skillPalettes = {
    day: {
      systum: { main: "#ff9933", light: "#ffe0b2" },
      vande: { main: "#be185d", light: "#f9a8d4" },
      pappu: { main: "#b91c1c", light: "#fecaca" },
    },
    night: {
      systum: { main: "#facc15", light: "#fef08a" },
      vande: { main: "#22d3ee", light: "#cffafe" },
      pappu: { main: "#f472b6", light: "#fce7f3" },
    },
    desert: {
      systum: { main: "#1d4ed8", light: "#bfdbfe" },
      vande: { main: "#6b21a8", light: "#e9d5ff" },
      pappu: { main: "#065f46", light: "#a7f3d0" },
    },
    ocean: {
      systum: { main: "#ff9933", light: "#ffe0b2" },
      vande: { main: "#6d28d9", light: "#ddd6fe" },
      pappu: { main: "#be123c", light: "#fda4af" },
    },
    diwali: {
      systum: { main: "#22d3ee", light: "#cffafe" },
      vande: { main: "#f472b6", light: "#fce7f3" },
      pappu: { main: "#a3e635", light: "#ecfccb" },
    },
    independence: {
      systum: { main: "#7e22ce", light: "#e9d5ff" },
      vande: { main: "#be123c", light: "#fda4af" },
      pappu: { main: "#1d4ed8", light: "#bfdbfe" },
    },
  };
  const themeId = window.app ? window.app.getAttribute("data-theme") : "day";
  const skillPalette = skillPalettes[themeId] || skillPalettes.day;
  const skillOutlineColor = ["day", "desert", "ocean"].includes(themeId)
    ? "rgba(255, 255, 255, 0.96)"
    : "rgba(15, 23, 42, 0.88)";
  const systumColors = skillActive
    ? skillPalette.systum
    : { main: "#ff9933", light: "#ffe8b7" };
  const withAlpha = (hex, alpha) => {
    const color = parseInt(hex.slice(1), 16);
    return `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, ${alpha})`;
  };

  const warning = skillTimers.some(timer => timer <= 3);
  const blinkVisible = !warning || Math.floor(window.elapsed * 8) % 2 === 0;
  const fade = skillActive ? (blinkVisible ? 1 : 0.18) : Math.min(1, bird.shieldTimer / 0.3);
  const pulse = 1 + Math.sin(window.elapsed * (skillActive ? 9 : 14)) * (skillActive ? 0.07 : 0.04);
  const radius = bird.size * 0.48 * pulse;

  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.globalAlpha = fade;
  if (skillActive) {
    const shieldRadius = bird.size * 0.96 * pulse;
    if (vandeActive) {
      const colors = skillPalette.vande;
      const rocketPulse = 1 + Math.sin(window.elapsed * 18) * 0.045;
      const rocketRadius = bird.size * 1.02 * rocketPulse;
      const glow = ctx.createRadialGradient(0, 0, bird.size * 0.16, 0, 0, rocketRadius * 1.35);
      glow.addColorStop(0, withAlpha(colors.light, 0.2));
      glow.addColorStop(0.65, withAlpha(colors.main, 0.13));
      glow.addColorStop(1, withAlpha(colors.main, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(0, 0, rocketRadius * 1.24, rocketRadius * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let trail = 0; trail < 5; trail++) {
        const progress = (window.elapsed * 5 + trail * 0.2) % 1;
        const startX = -rocketRadius * (0.25 + progress * 1.2);
        const startY = (trail - 2) * rocketRadius * 0.16 + Math.sin(window.elapsed * 24 + trail) * 2;
        ctx.globalAlpha = fade * (1 - progress) * 0.8;
        ctx.strokeStyle = trail % 2 === 0 ? colors.main : colors.light;
        ctx.lineWidth = 1.5 + (1 - progress) * 2;
        ctx.shadowColor = colors.main;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(startX - rocketRadius * (0.18 + progress * 0.35), startY);
        ctx.lineTo(startX, startY);
        ctx.stroke();
      }
      ctx.globalAlpha = fade;
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.moveTo(rocketRadius * 1.2, 0);
      ctx.lineTo(rocketRadius * 0.42, -rocketRadius * 0.58);
      ctx.lineTo(rocketRadius * 0.12, -rocketRadius * 0.42);
      ctx.lineTo(-rocketRadius * 0.72, -rocketRadius * 0.5);
      ctx.lineTo(-rocketRadius * 0.55, -rocketRadius * 0.12);
      ctx.lineTo(-rocketRadius * 0.92, 0);
      ctx.lineTo(-rocketRadius * 0.55, rocketRadius * 0.12);
      ctx.lineTo(-rocketRadius * 0.72, rocketRadius * 0.5);
      ctx.lineTo(rocketRadius * 0.12, rocketRadius * 0.42);
      ctx.lineTo(rocketRadius * 0.42, rocketRadius * 0.58);
      ctx.closePath();
      const rocketShield = ctx.createLinearGradient(-rocketRadius, 0, rocketRadius, 0);
      rocketShield.addColorStop(0, withAlpha(colors.main, 0.12));
      rocketShield.addColorStop(0.62, withAlpha(colors.main, 0.18));
      rocketShield.addColorStop(1, withAlpha(colors.light, 0.32));
      ctx.fillStyle = rocketShield;
      ctx.strokeStyle = skillOutlineColor;
      ctx.lineWidth = 5;
      ctx.shadowColor = colors.main;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = colors.light;
      ctx.lineWidth = 2.4;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }

    if (pappuActive) {
      const colors = skillPalette.pappu;
      const pappuPulse = 1 + Math.sin(window.elapsed * 13) * 0.08;
      const pappuRadius = bird.size * 1.02 * pappuPulse;
      const glow = ctx.createRadialGradient(0, 0, bird.size * 0.18, 0, 0, pappuRadius * 1.2);
      glow.addColorStop(0, withAlpha(colors.light, 0.2));
      glow.addColorStop(0.68, withAlpha(colors.main, 0.14));
      glow.addColorStop(1, withAlpha(colors.main, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(0, 0, pappuRadius, pappuRadius * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(window.elapsed * 1.8);
      ctx.beginPath();
      for (let point = 0; point < 12; point++) {
        const angle = point * Math.PI / 6;
        const pointRadius = pappuRadius * (point % 2 === 0 ? 1 : 0.88);
        const x = Math.cos(angle) * pointRadius;
        const y = Math.sin(angle) * pointRadius * 1.08;
        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = skillOutlineColor;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = colors.light;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = colors.main;
      ctx.shadowBlur = 17;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.rotate(-window.elapsed * 2.6);
      ctx.setLineDash([5, 9]);
      ctx.lineDashOffset = -window.elapsed * 20;
      ctx.strokeStyle = colors.light;
      ctx.lineWidth = 2;
      ctx.shadowColor = colors.main;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, pappuRadius * 0.82, pappuRadius * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      for (let spark = 0; spark < 6; spark++) {
        const angle = spark * Math.PI / 3;
        const x = Math.cos(angle) * pappuRadius * 0.82;
        const y = Math.sin(angle) * pappuRadius * 0.9;
        ctx.fillStyle = spark % 2 === 0 ? "#ffffff" : colors.light;
        ctx.beginPath();
        ctx.arc(x, y, 2.6 + Math.sin(window.elapsed * 12 + spark) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
      return;
    }

    const shell = ctx.createRadialGradient(
      -bird.size * 0.2, -bird.size * 0.28, bird.size * 0.08,
      0, 0, shieldRadius * 1.2
    );
    shell.addColorStop(0, withAlpha(systumColors.light, 0.2));
    shell.addColorStop(0.58, withAlpha(systumColors.main, 0.1));
    shell.addColorStop(0.9, withAlpha(systumColors.main, 0.2));
    shell.addColorStop(1, withAlpha(systumColors.main, 0));
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.ellipse(0, 0, shieldRadius, shieldRadius * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -shieldRadius);
    ctx.bezierCurveTo(shieldRadius * 0.7, -shieldRadius * 0.96, shieldRadius * 1.05, -shieldRadius * 0.48, shieldRadius, 0);
    ctx.bezierCurveTo(shieldRadius * 0.96, shieldRadius * 0.62, shieldRadius * 0.4, shieldRadius * 1.05, 0, shieldRadius * 1.12);
    ctx.bezierCurveTo(-shieldRadius * 0.4, shieldRadius * 1.05, -shieldRadius * 0.96, shieldRadius * 0.62, -shieldRadius, 0);
    ctx.bezierCurveTo(-shieldRadius * 1.05, -shieldRadius * 0.48, -shieldRadius * 0.7, -shieldRadius * 0.96, 0, -shieldRadius);
    ctx.closePath();
    const edge = ctx.createLinearGradient(-shieldRadius, -shieldRadius, shieldRadius, shieldRadius);
    edge.addColorStop(0, systumColors.light);
    edge.addColorStop(0.48, systumColors.main);
    edge.addColorStop(1, systumColors.light);
    ctx.strokeStyle = skillOutlineColor;
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = systumColors.main;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.strokeStyle = withAlpha(systumColors.light, 0.72);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, shieldRadius * 0.84, shieldRadius * 0.96, 0, -0.75, 0.75);
    ctx.ellipse(0, 0, shieldRadius * 0.84, shieldRadius * 0.96, 0, Math.PI - 0.75, Math.PI + 0.75);
    ctx.stroke();

    for (let node = 0; node < 4; node++) {
      const angle = window.elapsed * 0.8 + node * Math.PI / 2;
      const nodeX = Math.cos(angle) * shieldRadius * 0.92;
      const nodeY = Math.sin(angle) * shieldRadius * 1.02;
      ctx.fillStyle = systumColors.light;
      ctx.shadowColor = systumColors.main;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  const glow = ctx.createRadialGradient(0, 0, bird.size * 0.18, 0, 0, bird.size * 0.9 * pulse);
  glow.addColorStop(0, "rgba(255, 153, 51, 0.02)");
  glow.addColorStop(0.72, "rgba(255, 153, 51, 0.12)");
  glow.addColorStop(1, "rgba(255, 153, 51, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, bird.size * 0.9 * pulse, 0, Math.PI * 2);
  ctx.fill();

  const drawPetalRing = (count, offset, length, width, opacity) => {
    for (let petal = 0; petal < count; petal++) {
      ctx.save();
      ctx.rotate((petal + offset) * Math.PI * 2 / count);
      ctx.translate(0, -radius);
      const gradient = ctx.createLinearGradient(0, 0, 0, -length);
      gradient.addColorStop(0, withAlpha(systumColors.main, opacity * 0.48));
      gradient.addColorStop(0.55, withAlpha(systumColors.main, opacity));
      gradient.addColorStop(1, withAlpha(systumColors.light, opacity * 0.82));
      ctx.fillStyle = gradient;
      ctx.strokeStyle = withAlpha(systumColors.main, opacity * 0.9);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.48, 0);
      ctx.bezierCurveTo(-width * 0.66, -length * 0.4, -width * 0.28, -length * 0.88, 0, -length);
      ctx.bezierCurveTo(width * 0.28, -length * 0.88, width * 0.66, -length * 0.4, width * 0.48, 0);
      ctx.quadraticCurveTo(0, width * 0.18, -width * 0.48, 0);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = withAlpha(systumColors.light, opacity * 0.82);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -width * 0.04);
      ctx.quadraticCurveTo(width * 0.04, -length * 0.48, 0, -length * 0.86);
      ctx.stroke();
      ctx.restore();
    }
  };

  drawPetalRing(10, 0, bird.size * (skillActive ? 0.58 : 0.48) * pulse, bird.size * 0.28 * pulse, skillActive ? 0.68 : 0.38);
  drawPetalRing(8, 0.5, bird.size * (skillActive ? 0.42 : 0.34) * pulse, bird.size * 0.2 * pulse, skillActive ? 0.76 : 0.52);

  const centerGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, bird.size * 0.3);
  centerGlow.addColorStop(0, withAlpha(systumColors.light, 0.28));
  centerGlow.addColorStop(1, withAlpha(systumColors.main, 0));
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, bird.size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
    if (p.color === "lotus") {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(p.size / 24, p.size / 24);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.2;

      ctx.strokeStyle = "#286b37";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.quadraticCurveTo(0, 12, 0, 18);
      ctx.moveTo(0, 13);
      ctx.quadraticCurveTo(-5, 8, -11, 10);
      ctx.quadraticCurveTo(-8, 15, 0, 15);
      ctx.moveTo(0, 13);
      ctx.quadraticCurveTo(5, 8, 11, 10);
      ctx.quadraticCurveTo(8, 15, 0, 15);
      ctx.stroke();
      ctx.fillStyle = "#4a9b45";
      ctx.beginPath();
      ctx.moveTo(-1, 13);
      ctx.quadraticCurveTo(-6, 8, -11, 10);
      ctx.quadraticCurveTo(-8, 15, 0, 15);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1, 13);
      ctx.quadraticCurveTo(6, 8, 11, 10);
      ctx.quadraticCurveTo(8, 15, 0, 15);
      ctx.closePath();
      ctx.fill();

      const petals = [
        { start: [-4, 8], controls: [[-13, 0], [-9, -14]], tip: [0, -22], end: [9, -14], close: [4, 8], color: "#f28a21" },
        { start: [-3, 8], controls: [[-18, 5], [-21, -7]], tip: [-13, -17], end: [-5, -6], close: [0, 8], color: "#ffad43" },
        { start: [3, 8], controls: [[18, 5], [21, -7]], tip: [13, -17], end: [5, -6], close: [0, 8], color: "#ffad43" },
        { start: [-12, 8], controls: [[-23, 6], [-24, -2]], tip: [-19, -11], end: [-9, -3], close: [-6, 8], color: "#e97816" },
        { start: [12, 8], controls: [[23, 6], [24, -2]], tip: [19, -11], end: [9, -3], close: [6, 8], color: "#e97816" },
        { start: [-7, 8], controls: [[-12, 4], [-8, -3]], tip: [-4, -8], end: [0, -2], close: [0, 9], color: "#ffc15f" },
        { start: [7, 8], controls: [[12, 4], [8, -3]], tip: [4, -8], end: [0, -2], close: [0, 9], color: "#ffc15f" },
      ];
      petals.forEach(petal => {
        ctx.beginPath();
        ctx.moveTo(...petal.start);
        ctx.bezierCurveTo(...petal.controls[0], ...petal.controls[1], ...petal.tip);
        ctx.bezierCurveTo(...petal.controls[1], ...petal.controls[0], ...petal.end);
        ctx.quadraticCurveTo(...petal.close, ...petal.start);
        ctx.closePath();
        ctx.fillStyle = petal.color;
        ctx.strokeStyle = "rgba(130, 58, 13, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      });

      ctx.strokeStyle = "rgba(255, 232, 190, 0.95)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.quadraticCurveTo(-1, -6, 0, -19);
      ctx.moveTo(-9, 5);
      ctx.quadraticCurveTo(-14, -2, -19, -9);
      ctx.moveTo(9, 5);
      ctx.quadraticCurveTo(14, -2, 19, -9);
      ctx.stroke();
      ctx.restore();
      return;
    } else if (p.color === "melody") {
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
