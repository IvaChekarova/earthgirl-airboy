// Airboy — the blue character controlled with the Arrow keys.

import Phaser from 'phaser';
import Player from './Player.js';
import { TEX } from '../utils/textures.js';

export default class Airboy extends Player {
  constructor(scene, x, y) {
    const keyboard = scene.input.keyboard;
    const controls = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    };

    super(scene, x, y, TEX.AIRBOY, controls, 'Airboy');

    this.element = 'air';
  }
}
