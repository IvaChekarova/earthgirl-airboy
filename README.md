# Earthgirl & Airboy 🌱💨

A 2D **cooperative puzzle platformer** built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).
Two players share one keyboard and must work together to collect crystals and
reach their matching exit doors. Inspired by *Fireboy & Watergirl* — but its own
thing.

> The game runs **immediately** with no external art or audio: every sprite is a
> coloured placeholder generated at runtime.

---

## 🎮 Controls

| Character            | Move Left | Move Right | Jump |
| ------------------- | :-------: | :--------: | :--: |
| **Earthgirl** (green) | `A`       | `D`        | `W`  |
| **Airboy** (blue)     | `←`       | `→`        | `↑`  |

In-game keys:

- `R` — restart the current level
- `Esc` — return to the main menu

**Goal:** Earthgirl collects the **green** crystals, Airboy collects the **blue**
crystals. Once a character has all of their crystals, their door lights up. The
level is complete when **both** characters stand in their open doors at the same
time. Stand on **buttons** to activate **moving platforms** and help each other
reach high places.

---

## 🚀 Getting Started

Requirements: **Node.js 18+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173)
npm run dev
```

That's it — Level 1 is fully playable straight away.

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

---

## 📁 Project Structure

```
earthgirl-airboy/
├── public/                 # static files copied as-is into the build
├── index.html              # Vite entry HTML (mounts the Phaser canvas)
├── vite.config.js          # Vite configuration
├── package.json
├── README.md
└── src/
    ├── main.js             # boots Phaser with the shared config
    ├── config/
    │   └── gameConfig.js    # tuning constants + Phaser game config
    ├── scenes/
    │   ├── MenuScene.js      # title screen, Start + Instructions
    │   ├── BaseLevelScene.js # shared level logic (players, camera, win check)
    │   ├── Level1Scene.js    # "Earth Gate"   — fully playable
    │   ├── Level2Scene.js    # "Wind Passage" — placeholder / WIP
    │   ├── Level3Scene.js    # "Balance Chamber" — placeholder / WIP
    │   └── UIScene.js        # HUD overlay (crystal counter, level name)
    ├── entities/
    │   ├── Player.js         # shared movement/physics base class
    │   ├── Earthgirl.js      # WASD character
    │   ├── Airboy.js         # arrow-key character
    │   ├── Crystal.js        # collectible (earth/air)
    │   ├── Door.js           # exit door (earth/air)
    │   ├── Button.js         # pressure plate
    │   └── MovingPlatform.js # patrolling / button-driven platform
    ├── utils/
    │   ├── textures.js       # runtime placeholder-texture generator
    │   └── events.js         # global event bus (gameplay → UI)
    └── assets/
        ├── images/           # (empty — drop PNGs here later)
        ├── audio/            # (empty — drop sounds here later)
        └── sprites/          # (empty — drop sprite sheets here later)
```

---

## 🧩 How the Code Fits Together

- **`gameConfig.js`** holds every tunable number (gravity, speed, colours) and
  the Phaser config, so balancing never means digging through scene code.
- **`BaseLevelScene`** does all the heavy lifting: it generates textures, spawns
  the two players, wires up collisions, follows both players with the camera,
  counts crystals, and checks the win condition. Each level only implements
  `buildLevel()` to place platforms, crystals, doors and buttons.
- **`UIScene`** runs *in parallel* and listens to a small **event bus**
  (`utils/events.js`). Gameplay code never reaches into the UI — it just emits
  events like `CRYSTAL_COLLECTED`.

This separation is what makes the project easy to split between teammates.

---

## 👥 Suggested Team Split (3 students)

| Student | Owns                                   | Files |
| ------- | -------------------------------------- | ----- |
| **A**   | Core systems & menu                    | `BaseLevelScene.js`, `MenuScene.js`, `UIScene.js`, `entities/Player.js` |
| **B**   | Entities & Level 1                     | `entities/*`, `Level1Scene.js` |
| **C**   | Levels 2 & 3 design                    | `Level2Scene.js`, `Level3Scene.js` |

Because levels share `BaseLevelScene`, students B and C can build new levels by
copying Level 1's `buildLevel()` and rearranging objects — no engine code needed.

---

## 🛠️ Adding a New Level

1. Create `src/scenes/Level4Scene.js` extending `BaseLevelScene`.
2. In the constructor call `super({ key, number, name, next })`.
3. Implement `buildLevel()`:
   - set `this.earthSpawn` and `this.airSpawn`,
   - call `this.addGround()`, `this.addPlatform(...)`,
   - add `this.addCrystal(x, y, 'earth'|'air')`,
   - add `this.addDoor(x, y, 'earth'|'air')` (one per element),
   - optionally `this.addButton(...)` and `this.addMovingPlatform(...)`.
4. Register the scene in `src/config/gameConfig.js` (`scene: [...]`).
5. Point the previous level's `next` to your new scene key.

---

## 📦 Tech Stack

- **JavaScript (ES6 modules)**
- **Phaser 3** (Arcade physics)
- **Vite** (dev server + build)

## 📄 License

MIT — free to use for learning and coursework.
