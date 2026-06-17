// Entry point. Vite loads this from index.html. The normal route boots Phaser;
// /presentation renders a project showcase page using the same bundled assets.

import Phaser from 'phaser';
import { phaserConfig } from './config/gameConfig.js';
import { renderPresentation } from './presentation.js';

let game = null;

if (window.location.pathname.replace(/\/$/, '') === '/presentation') {
  renderPresentation();
} else {
  // eslint-disable-next-line no-new
  game = new Phaser.Game(phaserConfig);

  // Expose for quick debugging from the browser console (optional).
  window.__EARTHGIRL_AIRBOY__ = game;
}

export default game;
