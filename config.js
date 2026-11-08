/* ===========================================================
   FLAPPY MODI — Configuration
   Easy to add new themes, vehicles, and songs here
=========================================================== */

// Theme definitions - just add new theme objects here
window.THEMES = [
  { id: "day",      name: "Day",      cost: 0,   swatch: "linear-gradient(180deg,#7ed6ff,#ffe9a8)" },
  { id: "night",    name: "Night",    cost: 20,  swatch: "linear-gradient(180deg,#0d1b3e,#3a3f7a)" },
  { id: "desert",   name: "Desert",   cost: 30,  swatch: "linear-gradient(180deg,#ffd58a,#ff9a56)" },
  { id: "ocean",    name: "Ocean",    cost: 40,  swatch: "linear-gradient(180deg,#bdf0ff,#4fb8d6)" },
  { id: "diwali",   name: "Diwali",   cost: 50,  swatch: "linear-gradient(180deg,#1a0a2e,#ff6b35)" },
  { id: "independence", name: "Independence Day", cost: 60, swatch: "linear-gradient(180deg,#ff9933,#ffffff,#138808)" },
];

// Vehicle definitions - just add new vehicle objects here
window.VEHICLES = [
  { id: "flappy1", name: "Wing", cost: 0,   img: "images/flappy1.png" },
  { id: "flappy2", name: "Helicopter",  cost: 15,  img: "images/flappy2.png" },
  { id: "flappy3", name: "Car",    cost: 30, img: "images/flappy3.png" },
  { id: "flappy4", name: "Scooty",    cost: 40, img: "images/flappy4.png" },
  { id: "flappy5", name: "Plane",    cost: 50, img: "images/flappy5.png" },
  { id: "flappy6", name: "Tejas",    cost: 60, img: "images/flappy6.png" },
];

// Song definitions - just add new song objects here
window.SONGS = [
  { id: "udta",     name: "Udta Hi Phiru",        src: "audio/Udta-Hi-Phiru.mp3" },
  { id: "chura",    name: "Chura Ke Dil Mera",     src: "audio/Chura-Ke-Dil-Mera.mp3" },
  { id: "dope",     name: "Dope Shope",            src: "audio/Dope-Shope.mp3" },
  { id: "gaddiyan", name: "Gaddiyan Uchiya Rakhiya", src: "audio/Gaddiyan-Uchiya-Rakhiya.mp3" },
  { id: "blue",     name: "Blue Eyes",             src: "audio/Blue-Eyes.mp3" },
  { id: "gehra",     name: "Gehra Hua",             src: "audio/Gehra hua.mp3" },
  { id: "pagli",    name: "Pagli Dekhawa Agarbatti", src: "audio/Pagli_dekhawe_agarbatti.mp3" },
  { id: "naam",     name: "Naam Chale",             src: "audio/Naam_Chale.mp3" },
  { id: "heroine",  name: "Heroine",             src: "audio/HEROINE_ft._Modi.mp3" },
];

// Game constants
window.GAME_CONFIG = {
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
  SYSTUM_HACK_DURATION: 15,
  VANDE_BOOST_DURATION: 10,
  VANDE_BOOST_FLOAT_DURATION: 6,
  VANDE_BOOST_SPEED_PHASES: [
    { duration: 5, multiplier: 4 },
    { duration: 3, multiplier: 3 },
    { duration: 2, multiplier: 2 },
  ],
  PAPPU_HAMZA_DURATION: 10,
  PAPPU_HAMZA_FIRE_INTERVAL: 0.32,
  PAPPU_HAMZA_PROJECTILE_SPEED: 680,
  PAPPU_HAMZA_PROJECTILE_SIZE: 40,
  PAPPU_HAMZA_PIPE_TARGET_DISTANCE: 150,
  PAPPU_HAMZA_COCKROACH_BURN_DURATION: 0.8,
  VANDE_BOOST_PIPES_MIN: 5,
  VANDE_BOOST_PIPES_MAX: 8,
};

// Store items
window.STORE_ITEMS = {
  HIT_COST: 5,
  MELODY_PACK_COST: 50,
};

window.STORE_PRODUCTS = [
  { id: "systum-hack", name: "Systum Hack", image: "images/system hack.png", price: 5, currency: "melodies", skillKey: "systumHack" },
  { id: "vande-boost", name: "Vande Boost", image: "images/vande boost.png", price: 10, currency: "melodies", skillKey: "vandeBoost" },
  { id: "pappu-hamza", name: "Pappu Hamza", image: "images/pappu hamza.png", price: 15, currency: "melodies", skillKey: "pappuHamza" },
  { id: "melody-namo-edition", name: "Melody NAMO Edition", image: "images/melody pack namo edition.png", price: 100, currency: "coins", rouletteMode: "namo" },
];

// Roulette prizes
window.ROULETTE_PRIZES = [
  { id: 1, label: "3 Melodies",  icon: "images/melody .png", reward: 3,  type: "melody", chance: 0.34 },
  { id: 2, label: "5 Melodies",  icon: "images/melody .png", reward: 5,  type: "melody", chance: 0.19 },
  { id: 3, label: "7 Melodies",  icon: "images/melody .png", reward: 7,  type: "melody", chance: 0.14 },
  { id: 4, label: "10 Melodies", icon: "images/melody .png", reward: 10, type: "melody", chance: 0.20 },
  { id: 5, label: "15 Melodies", icon: "images/melody .png", reward: 15, type: "melody", chance: 0.08 },
  { id: 6, label: "20 Melodies", icon: "images/melody .png", reward: 20, type: "melody", chance: 0.05 },
];

window.NAMO_ROULETTE_PRIZES = [
  { id: 1, label: "5 Melodies + 1 Each Skill", icon: "images/melody new1.png", type: "bundle", melodies: 5, skills: { systumHack: 1, vandeBoost: 1, pappuHamza: 1 }, chance: 0.2 },
  { id: 2, label: "10 Melodies + 2/2/1 Skills", icon: "images/melody new2.png", type: "bundle", melodies: 10, skills: { systumHack: 2, vandeBoost: 2, pappuHamza: 1 }, chance: 0.2 },
  { id: 3, label: "10 Melodies + 4/3/2 Skills", icon: "images/melody new1.png", type: "bundle", melodies: 10, skills: { systumHack: 4, vandeBoost: 3, pappuHamza: 2 }, chance: 0.2 },
  { id: 4, label: "15 Melodies + 5/4/3 Skills", icon: "images/melody new2.png", type: "bundle", melodies: 15, skills: { systumHack: 5, vandeBoost: 4, pappuHamza: 3 }, chance: 0.2 },
  { id: 5, label: "15 Melodies + 5 Each Skill", icon: "images/melody pack namo edition.png", type: "bundle", melodies: 15, skills: { systumHack: 5, vandeBoost: 5, pappuHamza: 5 }, chance: 0.2 },
];

// Default save data
window.getDefaultSave = function() {
  return {
    bestScore: 0,
    coins: 0,
    melodies: 0,
    hits: 2,
    ownedStoreItems: [],
    skillCharges: { systumHack: 1, vandeBoost: 1, pappuHamza: 1 },
    unlockedThemes: ["day"],
    unlockedVehicles: ["flappy1"],
    selectedTheme: "day",
    selectedVehicle: "flappy1",
    selectedSong: "udta",
  };
}

// Storage key
window.STORAGE_KEY = "flappyModiSave_v1";

// ===========================================================
// CAPACITOR NATIVE STORAGE WRAPPER
// Provides async storage with Capacitor Preferences fallback to localStorage
// ===========================================================

// Detect if Capacitor is available
window.isCapacitorAvailable = function() {
  return typeof window.Capacitor !== "undefined" && 
         window.Capacitor.Plugins && 
         window.Capacitor.Plugins.Preferences;
};

// Async setter - automatically handles JSON stringification
window.setGameValue = async function(key, value) {
  try {
    if (window.isCapacitorAvailable()) {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      await window.Capacitor.Plugins.Preferences.set({ key, value: stringValue });
    } else {
      // Fallback to localStorage for web browsers
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    }
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
    // Fallback to localStorage on error
    try {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (e) {
      console.error(`Fallback save also failed for ${key}:`, e);
    }
  }
};

// Async getter - automatically parses JSON objects/arrays and numbers
window.getGameValue = async function(key, defaultValue) {
  try {
    let stringValue;
    if (window.isCapacitorAvailable()) {
      const result = await window.Capacitor.Plugins.Preferences.get({ key });
      stringValue = result.value;
    } else {
      // Fallback to localStorage for web browsers
      stringValue = localStorage.getItem(key);
    }

    if (stringValue === null || stringValue === undefined) {
      return defaultValue;
    }

    // Try to parse as JSON (for objects, arrays, numbers)
    try {
      const parsed = JSON.parse(stringValue);
      return parsed;
    } catch (e) {
      // If parsing fails, return as string
      return stringValue;
    }
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    // Fallback to localStorage on error
    try {
      const stringValue = localStorage.getItem(key);
      if (stringValue === null || stringValue === undefined) {
        return defaultValue;
      }
      try {
        const parsed = JSON.parse(stringValue);
        return parsed;
      } catch (e) {
        return stringValue;
      }
    } catch (e) {
      console.error(`Fallback load also failed for ${key}:`, e);
      return defaultValue;
    }
  }
};

// Async function to load all saved player data
window.loadSavedPlayerData = async function() {
  const defaultData = window.getDefaultSave();
  let ownedStoreItems = await window.getGameValue("ownedStoreItems", defaultData.ownedStoreItems);
  const savedSkillCharges = await window.getGameValue("skillCharges", null);
  let skillCharges = savedSkillCharges && typeof savedSkillCharges === "object"
    ? { ...defaultData.skillCharges, ...savedSkillCharges }
    : { ...defaultData.skillCharges };

  if (savedSkillCharges === null) {
    window.STORE_PRODUCTS.forEach(item => {
      if (item.skillKey && ownedStoreItems.includes(item.id)) {
        skillCharges[item.skillKey] = Math.max(1, skillCharges[item.skillKey] || 0);
      }
    });
    ownedStoreItems = ownedStoreItems.filter(id =>
      !window.STORE_PRODUCTS.some(item => item.id === id && item.skillKey)
    );
  }
  
  // Load each value with defaults
  window.save = {
    bestScore: await window.getGameValue("bestScore", defaultData.bestScore),
    coins: await window.getGameValue("coins", defaultData.coins),
    melodies: await window.getGameValue("melodies", defaultData.melodies),
    hits: await window.getGameValue("hits", defaultData.hits),
    ownedStoreItems,
    skillCharges,
    unlockedThemes: await window.getGameValue("unlockedThemes", defaultData.unlockedThemes),
    unlockedVehicles: await window.getGameValue("unlockedVehicles", defaultData.unlockedVehicles),
    selectedTheme: await window.getGameValue("selectedTheme", defaultData.selectedTheme),
    selectedVehicle: await window.getGameValue("selectedVehicle", defaultData.selectedVehicle),
    selectedSong: await window.getGameValue("selectedSong", defaultData.selectedSong),
  };
  
  return window.save;
};

// Async function to save all player data
window.saveAllGameData = async function() {
  if (!window.save) return;
  
  await window.setGameValue("bestScore", window.save.bestScore);
  await window.setGameValue("coins", window.save.coins);
  await window.setGameValue("melodies", window.save.melodies);
  await window.setGameValue("hits", window.save.hits);
  await window.setGameValue("ownedStoreItems", window.save.ownedStoreItems);
  await window.setGameValue("skillCharges", window.save.skillCharges);
  await window.setGameValue("unlockedThemes", window.save.unlockedThemes);
  await window.setGameValue("unlockedVehicles", window.save.unlockedVehicles);
  await window.setGameValue("selectedTheme", window.save.selectedTheme);
  await window.setGameValue("selectedVehicle", window.save.selectedVehicle);
  await window.setGameValue("selectedSong", window.save.selectedSong);
};

// Game constants shorthand
window.GRAVITY = window.GAME_CONFIG.GRAVITY;
window.FLAP_VELOCITY = window.GAME_CONFIG.FLAP_VELOCITY;
window.MAX_FALL_SPEED = window.GAME_CONFIG.MAX_FALL_SPEED;
window.PIPE_GAP = window.GAME_CONFIG.PIPE_GAP;
window.PIPE_WIDTH = window.GAME_CONFIG.PIPE_WIDTH;
window.PIPE_INTERVAL = window.GAME_CONFIG.PIPE_INTERVAL;
window.PIPE_SPEED = window.GAME_CONFIG.PIPE_SPEED;
window.GROUND_HEIGHT_RATIO = window.GAME_CONFIG.GROUND_HEIGHT_RATIO;
window.BIRD_SIZE = window.GAME_CONFIG.BIRD_SIZE;
window.COCKROACH_INTERVAL_MIN = window.GAME_CONFIG.COCKROACH_INTERVAL_MIN;
window.COCKROACH_INTERVAL_MAX = window.GAME_CONFIG.COCKROACH_INTERVAL_MAX;
window.MELON_INTERVAL_MIN = window.GAME_CONFIG.MELON_INTERVAL_MIN;
window.MELON_INTERVAL_MAX = window.GAME_CONFIG.MELON_INTERVAL_MAX;
window.MELODY_INTERVAL_MIN = window.GAME_CONFIG.MELODY_INTERVAL_MIN;
window.MELODY_INTERVAL_MAX = window.GAME_CONFIG.MELODY_INTERVAL_MAX;
window.MELODY_SIZE = window.GAME_CONFIG.MELODY_SIZE;
window.MELODY_SPEED = window.GAME_CONFIG.MELODY_SPEED;
window.COINS_PER_POINT = window.GAME_CONFIG.COINS_PER_POINT;
window.HIT_COST = window.STORE_ITEMS.HIT_COST;
window.MELODY_PACK_COST = window.STORE_ITEMS.MELODY_PACK_COST;
