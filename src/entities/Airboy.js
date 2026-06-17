// Airboy — the blue character controlled with the Arrow keys.

import Phaser from 'phaser';
import Player from './Player.js';

export default class Airboy extends Player {
  constructor(scene, x, y) {
    const keyboard = scene.input.keyboard;
    const controls = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    };

    super(scene, x, y, 'ab-idle-0', controls, 'Airboy');

    this.element = 'air';
    this.animPrefix = 'ab';
    this.play('ab-idle');
  }
}
