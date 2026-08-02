/* ===========================================================
   FLAPPY MODI — UI Management
=========================================================== */

// DOM element references (global)
window.homeBestScoreEl, window.homeCoinsEl, window.homeMelodiesEl, window.homeHitsEl;
window.themeListEl, window.vehicleListEl, window.songListEl, window.storeListEl;

// UI rendering functions (global)
window.renderPickers = function() {
  window.homeBestScoreEl.textContent = save.bestScore;
  window.homeCoinsEl.textContent = save.coins;
  window.homeMelodiesEl.textContent = save.melodies;
  window.homeHitsEl.textContent = save.hits;

  // Themes
  window.themeListEl.innerHTML = "";
  THEMES.forEach(t => {
    const owned = save.unlockedThemes.includes(t.id);
    const selected = save.selectedTheme === t.id;
    const card = document.createElement("div");
    card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
    const previewClass = window.getThemePreviewClass(t.id);
    card.innerHTML = `
      <div class="lock-badge">🔒</div>
      <div class="pick-thumb theme-swatch ${previewClass}" style="background:${t.swatch}">
        <div class="decorations"></div>
      </div>
      <div class="pick-name">${t.name}</div>
      ${owned ? "" : `<div class="pick-cost"><span class="coin-dot"></span>${t.cost}</div>`}
    `;
    card.addEventListener("click", () => window.selectOrUnlock("theme", t));
    window.themeListEl.appendChild(card);
  });

  // Vehicles
  window.vehicleListEl.innerHTML = "";
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
    card.addEventListener("click", () => window.selectOrUnlock("vehicle", v));
    window.vehicleListEl.appendChild(card);
  });

  // Songs
  window.renderSongs();
  // Store
  window.renderStore();
}

window.renderStore = function() {
  window.storeListEl.innerHTML = "";
  
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
  hitBuyBtn.addEventListener("click", async () => {
    if (save.coins >= HIT_COST) {
      save.coins -= HIT_COST;
      save.hits++;
      window.playPurchase();
      await window.saveGameState();
      window.renderPickers();
    } else {
      window.flashInsufficientCoins();
    }
  });
  window.storeListEl.appendChild(hitCard);

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
  packBuyBtn.addEventListener("click", async () => {
    if (save.coins >= MELODY_PACK_COST) {
      save.coins -= MELODY_PACK_COST;
      await window.saveGameState();
      window.playPurchase();
      window.renderPickers();
      window.showRoulette();
    } else {
      window.flashInsufficientCoins();
    }
  });
  window.storeListEl.appendChild(packCard);
}

window.renderSongs = function() {
  window.songListEl.innerHTML = "";
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
    const previewBtn = card.querySelector(".song-preview-btn");
    previewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.playTap();
      window.togglePreview(s.id);
    });
    card.addEventListener("click", async () => {
      window.playTap();
      window.stopPreview();
      save.selectedSong = s.id;
      await window.saveGameState();
      window.renderSongs();
    });
    window.songListEl.appendChild(card);
  });
}

window.selectOrUnlock = async function(kind, item) {
  const unlockedKey = kind === "theme" ? "unlockedThemes" : "unlockedVehicles";
  const selectedKey = kind === "theme" ? "selectedTheme" : "selectedVehicle";
  const owned = save[unlockedKey].includes(item.id);

  if (owned) {
    save[selectedKey] = item.id;
    if (kind === "theme") window.applyTheme(item.id);
    window.playTap();
  } else {
    if (save.coins >= item.cost) {
      save.coins -= item.cost;
      save[unlockedKey].push(item.id);
      save[selectedKey] = item.id;
      if (kind === "theme") window.applyTheme(item.id);
      window.playPurchase();
    } else {
      window.flashInsufficientCoins(item);
      return;
    }
  }
  await window.saveGameState();
  window.renderPickers();
}

window.flashInsufficientCoins = function() {
  window.homeCoinsEl.parentElement.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "ease-out" }
  );
}

window.applyTheme = function(themeId) {
  app.setAttribute("data-theme", themeId);
}

// Screen navigation (global)
window.showScreen = function(name) {
  allScreens.forEach(s => s.classList.remove("active"));
  if (name === "home") homeScreen.classList.add("active");
  else if (name === "game") gameScreen.classList.add("active");
  else if (name === "themes") themeScreen.classList.add("active");
  else if (name === "vehicles") vehicleScreen.classList.add("active");
  else if (name === "songs") songScreen.classList.add("active");
  else if (name === "store") storeScreen.classList.add("active");
}

// Roulette functions (global)
window.showRoulette = function() {
  window.rouletteOverlay.classList.remove("hidden");
  window.spinBtn.disabled = false;
  window.spinBtn.textContent = "SPIN!";
  window.buildRouletteTrack();
  window.rouletteTrack.style.transition = "none";
  window.rouletteTrack.style.transform = "translateY(0)";
  window.spinBtn.style.display = "flex";
  window.closeRouletteBtn.style.display = "none";
}

window.hideRoulette = function() {
  window.rouletteOverlay.classList.add("hidden");
  window.stopAnimationSound();
}

window.buildRouletteTrack = function() {
  window.rouletteTrack.innerHTML = "";
  
  // Create a single horizontal row with prizes repeated for infinity scroll
  const rowEl = document.createElement("div");
  rowEl.className = "roulette-row";
  
  // Repeat prizes multiple times for smooth infinite scroll effect
  const repetitions = 10;
  for (let r = 0; r < repetitions; r++) {
    ROULETTE_PRIZES.forEach(prize => {
      const prizeEl = document.createElement("div");
      prizeEl.className = "roulette-prize";
      prizeEl.innerHTML = `
        <div class="roulette-prize-icon"><img src="${prize.icon}" alt="${prize.label}" /></div>
        <div class="roulette-prize-text">${prize.label}</div>
      `;
      rowEl.appendChild(prizeEl);
    });
  }
  
  window.rouletteTrack.appendChild(rowEl);
  
  // Reset position to start
  window.rouletteTrack.style.transition = "none";
  window.rouletteTrack.style.transform = "translateX(0)";
}

window.spinRoulette = function() {
  if (window.spinBtn.disabled) return;
  window.spinBtn.disabled = true;
  window.spinBtn.textContent = "Spinning...";
  window.spinBtn.style.display = "none";

  // Determine winning prize
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

  const prizeIndex = ROULETTE_PRIZES.indexOf(winningPrize);
  const prizeWidth = 120; // Width of each prize card
  const numPrizes = ROULETTE_PRIZES.length;
  const containerWidth = window.rouletteTrack.parentElement.offsetWidth;
  
  // Calculate center position (where the hand pointer is)
  const centerOffset = (containerWidth - prizeWidth) / 2;
  
  // Calculate target position for winning prize to be centered
  const targetPosition = (prizeIndex * prizeWidth) + centerOffset;
  
  // Add multiple full rotations for dramatic effect (infinity scroll)
  const fullRotations = 8;
  const totalDistance = (fullRotations * numPrizes * prizeWidth) + targetPosition;
  
  // Add slight randomness for realism
  const randomOffset = (Math.random() - 0.5) * (prizeWidth * 0.4);
  const finalX = totalDistance + randomOffset;

  // Play spinning sound
  window.playAnimationSound();
  
  // Use smooth easing for realistic spin - 5 seconds total
  // Fast start, gradual slowdown
  window.rouletteTrack.style.transition = "transform 5s cubic-bezier(0.15, 0.8, 0.25, 1)";
  window.rouletteTrack.style.transform = `translateX(-${finalX}px)`;

  // Stop sound and show prize after animation completes
  setTimeout(() => {
    window.stopAnimationSound();
    window.awardPrize(winningPrize);
    window.closeRouletteBtn.style.display = "flex";
    window.closeRouletteBtn.textContent = "Close & Return to Store";
  }, 5000);
}

window.awardPrize = async function(prize) {
  window.playRewardSound();
  if (prize.type === "melody") {
    save.melodies += prize.reward;
  } else if (prize.type === "coin") {
    save.coins += prize.reward;
  }
  await window.saveGameState();
  window.renderPickers();
  
  // Show styled prize notification instead of alert
  setTimeout(() => {
    const notification = document.getElementById("prize-notification");
    const rewardEl = document.getElementById("prize-reward");
    
    if (notification && rewardEl) {
      // Set reward text with icon
      if (prize.type === "melody") {
        rewardEl.innerHTML = `<img src="images/melody .png" alt="melody" />${prize.reward} Melodies`;
      } else if (prize.type === "coin") {
        rewardEl.innerHTML = `<span class="coin-dot" style="width:24px;height:24px;display:inline-block;border-radius:50%;background:radial-gradient(circle at 35% 30%, #fff6c9, #ffcc33 60%, #c98f00 100%);border:2px solid var(--ink);vertical-align:middle;margin-right:8px;box-shadow:0 2px 0 var(--ink);"></span>${prize.reward} Coins`;
      }
      
      // Show notification
      notification.classList.remove("hidden");
      
      // Add event listener to close button
      const closeBtn = document.getElementById("prize-close-btn");
      if (closeBtn) {
        closeBtn.onclick = () => {
          notification.classList.add("hidden");
        };
      }
    }
  }, 300);
}
