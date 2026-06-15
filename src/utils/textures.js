// Generates simple coloured-rectangle textures at runtime so the game runs
// immediately without any external image assets. Each scene calls
// `generatePlaceholderTextures(scene)` once in `create()`.
//
// Textures are only created the first time they are requested (Phaser keeps
// them in a global TextureManager), so calling this from every scene is cheap.

import { COLORS, PLAYER } from '../config/gameConfig.js';

/**
 * Draw a filled, outlined rounded rectangle into a generated texture.
 */
function makeRectTexture(scene, key, width, height, fillColor, options = {}) {
  if (scene.textures.exists(key)) return;

  const {
    radius = 6,
    border = 0x000000,
    borderAlpha = 0.25,
    borderWidth = 2
  } = options;

  const g = scene.add.graphics();
  g.fillStyle(fillColor, 1);
  g.fillRoundedRect(0, 0, width, height, radius);

  if (borderWidth > 0) {
    g.lineStyle(borderWidth, border, borderAlpha);
    g.strokeRoundedRect(1, 1, width - 2, height - 2, radius);
  }

  g.generateTexture(key, width, height);
  g.destroy();
}

/**
 * Draw a diamond / crystal shape into a generated texture.
 */
function makeCrystalTexture(scene, key, size, fillColor) {
  if (scene.textures.exists(key)) return;

  const g = scene.add.graphics();
  const half = size / 2;

  g.fillStyle(fillColor, 1);
  g.beginPath();
  g.moveTo(half, 0);
  g.lineTo(size, half);
  g.lineTo(half, size);
  g.lineTo(0, half);
  g.closePath();
  g.fillPath();

  // Inner highlight for a bit of sparkle.
  g.fillStyle(0xffffff, 0.35);
  g.beginPath();
  g.moveTo(half, size * 0.12);
  g.lineTo(size * 0.7, half);
  g.lineTo(half, size * 0.55);
  g.lineTo(size * 0.3, half);
  g.closePath();
  g.fillPath();

  g.generateTexture(key, size, size);
  g.destroy();
}

/**
 * Texture keys used across the project. Import from here to avoid typos.
 */
export const TEX = {
  EARTHGIRL: 'tex-earthgirl',
  AIRBOY: 'tex-airboy',
  CRYSTAL_EARTH: 'tex-crystal-earth',
  CRYSTAL_AIR: 'tex-crystal-air',
  DOOR_EARTH: 'tex-door-earth',
  DOOR_AIR: 'tex-door-air',
  BUTTON: 'tex-button',
  BUTTON_PRESSED: 'tex-button-pressed',
  PLATFORM: 'tex-platform',
  GROUND: 'tex-ground',
  MOVING_PLATFORM: 'tex-moving-platform',
  PIXEL: 'tex-pixel'
};

export function generatePlaceholderTextures(scene) {
  // Players
  makeRectTexture(scene, TEX.EARTHGIRL, PLAYER.WIDTH, PLAYER.HEIGHT, COLORS.EARTHGIRL, { radius: 8 });
  makeRectTexture(scene, TEX.AIRBOY, PLAYER.WIDTH, PLAYER.HEIGHT, COLORS.AIRBOY, { radius: 8 });

  // Crystals
  makeCrystalTexture(scene, TEX.CRYSTAL_EARTH, 26, COLORS.CRYSTAL_EARTH);
  makeCrystalTexture(scene, TEX.CRYSTAL_AIR, 26, COLORS.CRYSTAL_AIR);

  // Doors
  makeRectTexture(scene, TEX.DOOR_EARTH, 44, 64, COLORS.DOOR_EARTH, { radius: 4 });
  makeRectTexture(scene, TEX.DOOR_AIR, 44, 64, COLORS.DOOR_AIR, { radius: 4 });

  // Buttons
  makeRectTexture(scene, TEX.BUTTON, 48, 14, COLORS.BUTTON, { radius: 4 });
  makeRectTexture(scene, TEX.BUTTON_PRESSED, 48, 8, COLORS.BUTTON_PRESSED, { radius: 3 });

  // Platforms (tiled by setting display size on the sprite)
  makeRectTexture(scene, TEX.PLATFORM, 64, 24, COLORS.PLATFORM, { radius: 4 });
  makeRectTexture(scene, TEX.GROUND, 64, 40, COLORS.GROUND, { radius: 0, borderWidth: 0 });
  makeRectTexture(scene, TEX.MOVING_PLATFORM, 96, 20, COLORS.MOVING_PLATFORM, { radius: 4 });

  // 1x1 white pixel (handy for particles / tints)
  makeRectTexture(scene, TEX.PIXEL, 1, 1, 0xffffff, { radius: 0, borderWidth: 0 });
}
