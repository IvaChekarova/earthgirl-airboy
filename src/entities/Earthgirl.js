// Earthgirl — the green character controlled with WASD.

import Player from './Player.js';
import { TEX } from '../utils/textures.js';

export default class Earthgirl extends Player {
  constructor(scene, x, y) {
    // Build the WASD control map from the scene's keyboard plugin.
    const keyboard = scene.input.keyboard;
    const controls = {
      left: keyboard.addKey('A'),
      right: keyboard.addKey('D'),
      up: keyboard.addKey('W')
    };

    super(scene, x, y, TEX.EARTHGIRL, controls, 'Earthgirl');

    // Tag so collision callbacks can tell who is who.
    this.element = 'earth';
  }
}
