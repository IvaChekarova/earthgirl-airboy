// Central place for tunable game constants and the Phaser game configuration.
// Keeping these here lets all three students tweak balance without hunting
// through scene code.

import Phaser from 'phaser';
import MenuScene from '../scenes/MenuScene.js';
import Level1Scene from '../scenes/Level1Scene.js';
import Level2Scene from '../scenes/Level2Scene.js';
import Level3Scene from '../scenes/Level3Scene.js';
import UIScene from '../scenes/UIScene.js';

// ---------------------------------------------------------------------------
// Gameplay tuning constants (shared by all entities/scenes)
// ---------------------------------------------------------------------------
export const GAME = {
  WIDTH: 960,
  HEIGHT: 540,
  GRAVITY: 980,
  BACKGROUND: '#1d2233'
};

export const PLAYER = {
  SPEED: 220,
  JUMP_VELOCITY: -470,
  WIDTH: 28,
  HEIGHT: 40,
  // On-screen height both characters are scaled to render at, so Earthgirl and
  // Airboy look the same size regardless of their differing source frames.
  DISPLAY_HEIGHT: 92
};

// Brand colours used to generate placeholder sprites (see utils/textures.js).
export const COLORS = {
  EARTHGIRL: 0x4caf50, // green
  AIRBOY: 0x42a5f5, // blue
  CRYSTAL: 0xffd54f, // gold
  CRYSTAL_EARTH: 0x66bb6a,
  CRYSTAL_AIR: 0x64b5f6,
  DOOR_EARTH: 0x2e7d32,
  DOOR_AIR: 0x1565c0,
  BUTTON: 0xe57373,
  BUTTON_PRESSED: 0x8d6e63,
  PLATFORM: 0x37474f,
  MOVING_PLATFORM: 0x8e24aa,
  GROUND: 0x263238
};

// Scene order: the boot scene is the menu, UIScene runs in parallel on top.
export const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  backgroundColor: GAME.BACKGROUND,
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME.GRAVITY },
      debug: false
    }
  },
  scene: [MenuScene, Level1Scene, Level2Scene, Level3Scene, UIScene]
};
