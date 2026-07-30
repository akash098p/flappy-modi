
# Flappy Modi

<p align="center">
  
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/Canvas-FF6B6B?style=for-the-badge&logo=html5&logoColor=white)
![Mobile](https://img.shields.io/badge/Mobile-Responsive-green?style=for-the-badge&logo=mobile&logoColor=white)
</p>

A modern, arcade-style Flappy Bird clone featuring Indian themes, vehicles, and music. Built with vanilla JavaScript and HTML5 Canvas for smooth mobile gameplay.

## 🎮 Features

- **5 Unique Themes**: Day, Night, Desert, Ocean, and Festival themes with dynamic backgrounds
- **3 Vehicles**: Choose from Wing, Helicopter, and Tejas aircraft
- **5 Soundtracks**: Popular Indian songs as background music
- **Melody Collection**: Collect rare melodies during gameplay
- **Hit System**: Protect yourself from cockroach collisions
- **Melody Pack Roulette**: Spin to win melodies and coins
- **Responsive Design**: Optimized for mobile devices with touch controls
- **Persistent Progress**: Local storage saves your coins, melodies, and unlocks


## 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/c52897f4-067d-428e-aaaa-1f50d85ba1f5" width="45%">
  <img src="https://github.com/user-attachments/assets/f218a91f-0af8-46e8-a565-13650598e426" width="51%">
<br>
  <img src="https://github.com/user-attachments/assets/3699e764-9135-4fc5-9640-8c072b551542" width="48%">
  <img src="https://github.com/user-attachments/assets/88b4d2b7-a7b1-4fac-a675-d097d00fab15" width="48%">
<br>
  <img src="https://github.com/user-attachments/assets/50bdbe61-87db-4327-8a83-a153ad92143b" width="39%">
  <img src="https://github.com/user-attachments/assets/ed875a3c-c7bf-4f76-b3d5-78eb61beeae8" width="57%">

</p>

  Play the Game : https://akash098p.github.io/flappy-modi/

## 🎯 Gameplay

- **Tap or Press Space** to flap and navigate through pipes
- **Avoid pipes and cockroaches** to keep flying
- **Collect melodies** (diamond icons) for bonus points
- **Earn coins** based on your score
- **Buy hits** in the store to protect from cockroaches
- **Purchase melody packs** to spin the roulette and win prizes

## 🎨 Themes

| Theme | Cost | Description |
|-------|------|-------------|
| Day | Free | Classic bright sky with blue pipes |
| Night | 15 Coins | Dark atmosphere with purple accents |
| Desert | 25 Coins | Warm orange sunset vibes |
| Ocean | 45 Coins | Cool blue underwater theme |
| Festival | 55 Coins | Vibrant pink and yellow celebration |

## ✈️ Vehicles

| Vehicle | Cost | Description |
|---------|------|-------------|
| Wing | Free | Classic flappy bird style |
| Helicopter | 20 Coins | Rotor-based flying machine |
| Tejas | 50 Coins | Advanced jet aircraft |

## 🎵 Soundtracks

- Udta Hi Phiru
- Chura Ke Dil Mera
- Dope Shope
- Gaddiyan Uchiya Rakhiya
- Blue Eyes

## 🛒 Store Items

- **1 Hit** - 5 Coins: Protects from one cockroach collision
- **Melody Pack** - 50 Coins: Spin the roulette to win 2-15 melodies or 20 coins

## 🎰 Roulette Prizes

| Prize | Chance |
|-------|--------|
| 2 Melodies | 34% |
| 4 Melodies | 19% |
| 5 Melodies | 14% |
| 20 Coins | 20% |
| 10 Melodies | 8% |
| 15 Melodies | 5% |

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build process required - just open `index.html`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/akash098p/flappy-modi.git
```

2. Navigate to the project folder:
```bash
cd flappy-modi
```

3. Open `index.html` in your browser:
```bash
# Windows
start index.html

# Mac
open index.html

# Linux
xdg-open index.html
```

## 📱 Mobile Support

The game is optimized for mobile devices with:
- Touch controls (tap to flap)
- Responsive layout that adapts to screen size
- Safe area support for notched devices
- Smooth 60fps gameplay

## 🎮 Controls

- **Desktop**: Spacebar or mouse click
- **Mobile**: Tap anywhere on screen
- **Pause**: Click the pause button (II)

## 🛠️ Built With

- **HTML5 Canvas** - Rendering engine
- **Vanilla JavaScript** - Game logic and state management
- **CSS3** - UI styling and animations
- **Local Storage** - Progress persistence
- **Web Audio API** - Sound effects and music

## 📊 Game Mechanics

- **Gravity**: 1500 px/s²
- **Flap Velocity**: -430 px/s
- **Pipe Gap**: 190px
- **Pipe Speed**: 165 px/s (increases with score)
- **Cockroach Spawn**: Every 5-8 seconds
- **Melody Spawn**: Every 12-22 seconds

## 🎯 Scoring

- **+1 Coin** for each point scored
- **Melodies** collected during gameplay
- **Best Score** saved permanently

## 🔧 Development

### Project Structure

```
flappy-modi/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # Game engine and logic
├── audio/              # Sound effects and music
│   ├── jump.mp3
│   ├── gameover.mp3
│   ├── melody.mp3
│   └── ...
├── images/             # Game sprites and icons
│   ├── flappy1.png
│   ├── flappy2.png
│   ├── flappy3.png
│   ├── cockroach.png
│   └── ...
└── README.md
```

### Key Features Implementation

- **Game Loop**: RequestAnimationFrame for smooth 60fps
- **Collision Detection**: Circle-rect and circle-circle collision
- **Particle System**: Coin bursts and melody sparkles
- **State Management**: Ready, playing, paused, gameover, respawning
- **Audio System**: Layered audio with volume control
- **Save System**: JSON-based local storage

## 🎨 Design Philosophy

- **Bold Arcade Aesthetic**: Thick outlines and vibrant colors
- **Indian Theme**: Cultural elements and popular music
- **Mobile-First**: Designed for touchscreen gameplay
- **Accessibility**: High contrast and clear visual feedback
- **Performance**: Optimized for smooth gameplay on all devices

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

<h3>Akash Pramanik</h3>

<p>
  <strong>For questions or support: </strong>
<a href="https://instagram.com/akash.098p" target="_blank">
  <img src="https://img.shields.io/badge/akash.098p-E4405F?style=flat&logo=instagram&logoColor=white"/>
</a> 

<a href="mailto:akashpramanik098@gmail.com">
  <img src="https://img.shields.io/badge/akashpramanik422%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white"/>
</a>
</p>

---

**Note**: This is a fan-made game inspired by Flappy Bird. All music and sound effects are used for entertainment purposes only.
