# Midnight Drift

A browser-based drifting / street racing game inspired by **Tokyo Drift**, **Initial D**, **MF Ghost**, and **Midnight Club**.

Pure HTML5 Canvas + JavaScript. No frameworks, no build step. Works perfectly on **GitHub Pages**.

## Features

- **5 selectable cars** (AE86, RX-7, GT-R, Supra, Silvia S15) with different stats
- **3 tracks**: Akina Pass (touge), Shibuya Night (city), Yokohama Docks (wide)
- **Drift physics** + handbrake
- **Nitro boost** (Shift)
- **Better AI** opponents with different skill levels
- **Tire marks** & drift smoke
- **Mini-map**
- **Sound effects** (Web Audio API)
- **Lap timer** + personal bests per car/track (saved in browser)
- Fully responsive

## Controls

| Key | Action |
|-----|--------|
| **W** / **↑** | Accelerate |
| **S** / **↓** | Brake / Reverse |
| **A** / **←** | Steer left |
| **D** / **→** | Steer right |
| **Space** | Handbrake (Drift) |
| **Shift** | Nitro boost |
| **R** | Back to menu / Restart |

## How to play

1. Choose your car and track on the menu.
2. Click **START RACE**.
3. Complete the laps as fast as you can.
4. Use handbrake in corners for big drifts (Initial D style).
5. Save nitro for straights.

## Run locally

Just open `index.html` in any modern browser.

Or:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy on GitHub Pages

1. Create a new repository (e.g. `midnight-drift`).
2. Upload these 4 files to the root:
   - `index.html`
   - `style.css`
   - `game.js`
   - `README.md`
3. Go to **Settings → Pages**.
4. Source = **Deploy from a branch** → `main` → `/ (root)`.
5. After ~1 minute your game is live at:

   `https://YOUR_USERNAME.github.io/midnight-drift/`

## Cars

| Car | Style | Strength |
|-----|-------|----------|
| AE86 Trueno | Initial D legend | Balanced, classic feel |
| RX-7 FD | Rotary | Strong mid-range |
| Skyline GT-R | Godzilla | Highest top speed |
| Supra MK4 | Tokyo Drift | Powerful nitro |
| Silvia S15 | Drift king | Best handling & drift |

Enjoy the drift! 🏎️💨
