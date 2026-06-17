// Earthgirl — the green plant-girl, controlled with WASD.

import Player from './Player.js';

export default class Earthgirl extends Player {
  constructor(scene, x, y) {
    // Build the WASD control map from the scene's keyboard plugin.
    const keyboard = scene.input.keyboard;
    const controls = {
      left: keyboard.addKey('A'),
      right: keyboard.addKey('D'),
      up: keyboard.addKey('W')
    };

    super(scene, x, y, 'eg-idle-0', controls, 'Earthgirl');

    // Tag so collision callbacks can tell who is who.
    this.element = 'earth';
    this.animPrefix = 'eg';
    this.play('eg-idle');
  }
}
