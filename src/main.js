// Entry point. Vite loads this from index.html.
// It simply boots Phaser with the shared configuration.

import Phaser from 'phaser';
import { phaserConfig } from './config/gameConfig.js';

// eslint-disable-next-line no-new
const game = new Phaser.Game(phaserConfig);

// Expose for quick debugging from the browser console (optional).
window.__EARTHGIRL_AIRBOY__ = game;

export default game;
