/* ===========================================================
   FLAPPY MODI — UI Management
=========================================================== */

// DOM element references (global)
window.homeBestScoreEl, window.homeCoinsEl, window.homeMelodiesEl, window.homeHitsEl;
window.homeSystumChargesEl, window.homeVandeChargesEl, window.homePappuChargesEl;
window.themeListEl, window.vehicleListEl, window.songListEl, window.storeListEl;

// UI rendering functions (global)
window.renderPickers = function() {
  window.homeBestScoreEl.textContent = save.bestScore;
  window.homeCoinsEl.textContent = save.coins;
  window.homeMelodiesEl.textContent = save.melodies;
  window.homeHitsEl.textContent = save.hits;
  const skillCharges = save.skillCharges || {};
  window.homeSystumChargesEl.textContent = skillCharges.systumHack || 0;
  window.homeVandeChargesEl.textContent = skillCharges.vandeBoost || 0;
  window.homePappuChargesEl.textContent = skillCharges.pappuHamza || 0;

  // Themes
  window.themeListEl.innerHTML = "";
  THEMES.forEach(t => {
    const owned = save.unlockedThemes.includes(t.id);
    const selected = save.selectedTheme === t.id;
    const card = document.createElement("div");
    card.className = "pick-card" + (owned ? " owned" : "") + (selected ? " selected" : "");
    const previewClass = window.getThemePreviewClass(t.id);
    const previewObjects = window.getThemePreviewObjects(t.id);
    card.innerHTML = `
      <div class="lock-badge">🔒</div>
      <div class="pick-thumb theme-swatch ${previewClass}">
        <div class="scene-art" aria-hidden="true">${previewObjects.map(object => `<span class="scene-object ${object}"></span>`).join("")}</div>
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

  const renderProductCard = (item) => {
    const isSkill = !!item.skillKey;
    const isRoulettePack = !!item.rouletteMode;
    const owned = !isSkill && !isRoulettePack && save.ownedStoreItems.includes(item.id);
    const charges = isSkill ? (save.skillCharges[item.skillKey] || 0) : 0;
    const balance = save[item.currency];
    const description = item.skillKey === "systumHack"
      ? "15 seconds: invulnerability and 2×/3× pipe coins and melody pickups"
      : item.skillKey === "vandeBoost"
        ? "10 seconds: 6s auto-float, then descend; tap to take control · 4×/3×/2× speed"
        : item.skillKey === "pappuHamza"
          ? "10 seconds: auto-fires at pipes and cockroaches, burning pests and clearing the path"
        : isSkill
          ? "Active game skill"
          : isRoulettePack
          ? "Spin for melodies and Systum, Vande, and Pappu skill charges"
          : "Collectible store item";
    const card = document.createElement("div");
    card.className = "store-card";
    card.innerHTML = `
      <div class="store-card-icon"><img src="${item.image}" alt="${item.name}" /></div>
      <div class="store-card-info">
        <div class="store-card-name">${item.name}</div>
        <div class="store-card-desc">${description}${isSkill ? ` · Charges: ${charges}` : ""}</div>
      </div>
      <button class="store-buy-btn" ${owned || balance < item.price ? "disabled" : ""}>
        ${item.currency === "melodies"
          ? '<img class="store-currency-icon" src="images/melody .png" alt="Melodies" />'
          : '<span class="coin-dot"></span>'}
        ${owned ? "Owned" : item.price}
      </button>
    `;

    card.querySelector(".store-buy-btn").addEventListener("click", async () => {
      if (!isSkill && save.ownedStoreItems.includes(item.id)) return;
      if (save[item.currency] < item.price) {
        window.flashInsufficientCoins();
        return;
      }

      save[item.currency] -= item.price;
      if (isRoulettePack) {
        window.playPurchase();
        await window.saveGameState();
        window.renderPickers();
        window.showRoulette(item.rouletteMode);
        return;
      }

      if (isSkill) {
        save.skillCharges[item.skillKey] = (save.skillCharges[item.skillKey] || 0) + 1;
      } else {
        save.ownedStoreItems.push(item.id);
      }
      window.playPurchase();
      await window.saveGameState();
      window.renderPickers();
    });

    window.storeListEl.appendChild(card);
  };

  const melodyStoreProducts = [];
  const normalStoreProducts = [];
  window.STORE_PRODUCTS.forEach(item => {
    if (item.rouletteMode === "namo" || item.name.toLowerCase().includes("melody")) {
      melodyStoreProducts.push(item);
    } else {
      normalStoreProducts.push(item);
    }
  });

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

  normalStoreProducts.forEach(renderProductCard);

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

  melodyStoreProducts.forEach(renderProductCard);
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
  window.renderThemeScene(
    document.getElementById("tap-to-start-scene"),
    themeId
  );
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
window.rouletteMode = "melody";
window.showRoulette = function(mode = "melody") {
  window.rouletteMode = mode;
  const isNamoRoulette = mode === "namo";
  document.getElementById("roulette-title").textContent = isNamoRoulette ? "Melody NAMO Edition!" : "Melody Pack!";
  document.getElementById("roulette-hint").textContent = isNamoRoulette
    ? "Spin to win melodies and skill charges!"
    : "Tap to spin and win melodies!";
  window.rouletteOverlay.classList.remove("hidden");
  window.spinBtn.disabled = false;
  window.spinBtn.textContent = "SPIN!";
  window.buildRouletteTrack();
  window.rouletteTrack.style.transition = "none";
  window.rouletteTrack.style.transform = "translateX(0)";
  window.spinBtn.style.display = "flex";
  window.closeRouletteBtn.style.display = "none";
}

window.hideRoulette = function() {
  window.rouletteOverlay.classList.add("hidden");
  window.stopAnimationSound();
}

window.buildRouletteTrack = function() {
  window.rouletteTrack.innerHTML = "";
  const prizes = window.rouletteMode === "namo" ? NAMO_ROULETTE_PRIZES : ROULETTE_PRIZES;
  
  // Create a single horizontal row with prizes repeated for infinity scroll
  const rowEl = document.createElement("div");
  rowEl.className = "roulette-row";
  
  // Repeat prizes multiple times for smooth infinite scroll effect
  const repetitions = 10;
  for (let r = 0; r < repetitions; r++) {
    prizes.forEach(prize => {
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
  const prizes = window.rouletteMode === "namo" ? NAMO_ROULETTE_PRIZES : ROULETTE_PRIZES;
  window.spinBtn.disabled = true;
  window.spinBtn.textContent = "Spinning...";
  window.spinBtn.style.display = "none";

  // Determine winning prize
  const rand = Math.random();
  let cumulative = 0;
  let winningPrize = prizes[0];
  for (const prize of prizes) {
    cumulative += prize.chance;
    if (rand <= cumulative) {
      winningPrize = prize;
      break;
    }
  }

  const prizeIndex = prizes.indexOf(winningPrize);
  const prizeWidth = 120; // Width of each prize card
  const numPrizes = prizes.length;
  const containerWidth = window.rouletteTrack.parentElement.offsetWidth;
  
  // Calculate center position (where the hand pointer is)
  const centerOffset = (containerWidth - prizeWidth) / 2;
  
  // Calculate target position for winning prize to be centered
  // The track moves left by finalX, so prize's left edge lands at (prizeIndex * prizeWidth - finalX).
  // For the prize center to align with the pointer (containerWidth / 2):
  //   prizeIndex * prizeWidth - finalX + prizeWidth / 2 = containerWidth / 2
  //   finalX = prizeIndex * prizeWidth - (containerWidth - prizeWidth) / 2
  // So we SUBTRACT centerOffset, not add it.
  const targetPosition = (prizeIndex * prizeWidth) - centerOffset;
  
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
  } else if (prize.type === "bundle") {
    save.melodies += prize.melodies;
    Object.entries(prize.skills).forEach(([skillKey, amount]) => {
      save.skillCharges[skillKey] = (save.skillCharges[skillKey] || 0) + amount;
    });
  }
  await window.saveGameState();
  window.renderPickers();
  
  // Show styled prize notification instead of alert
  setTimeout(() => {
    const notification = document.getElementById("prize-notification");
    const rewardEl = document.getElementById("prize-reward");
    
    if (notification && rewardEl) {
      rewardEl.classList.remove("bundle-reward");
      // Set reward text with icon
      if (prize.type === "melody") {
        rewardEl.innerHTML = `<img src="images/melody .png" alt="melody" />${prize.reward} Melodies`;
      } else if (prize.type === "coin") {
        rewardEl.innerHTML = `<img src="images/coin.png" alt="coin" />${prize.reward} Coins`;
      } else if (prize.type === "bundle") {
        const skillRewards = [
          ["systumHack", "Systum Hack", "images/system hack.png"],
          ["vandeBoost", "Vande Boost", "images/vande boost.png"],
          ["pappuHamza", "Pappu Hamza", "images/pappu hamza.png"],
        ];
        rewardEl.classList.add("bundle-reward");
        rewardEl.innerHTML = `
          <div class="bundle-reward-row"><img src="images/melody .png" alt="" />${prize.melodies} Melodies</div>
          ${skillRewards.map(([key, name, image]) =>
            `<div class="bundle-reward-row"><img src="${image}" alt="" />${name} ×${prize.skills[key]}</div>`
          ).join("")}
        `;
      }
      
      // Show notification
      notification.classList.remove("hidden");
      
      // Add event listener to close button
      const closeBtn = document.getElementById("prize-close-btn");
      if (closeBtn) {
        closeBtn.onclick = () => {
          window.playTap();
          notification.classList.add("hidden");
        };
      }
    }
  }, 300);
}
