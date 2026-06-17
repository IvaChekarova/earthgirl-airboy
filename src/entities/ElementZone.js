// ElementZone — a coloured barrier that only the matching character can pass
// through. A green (earth) zone blocks Airboy; a blue (air) zone blocks
// Earthgirl. The scene decides who is blocked by adding a collider *only* for
// the opposite-element player (see Level2Scene.setupCollisions); the matching
// character has no collider, so they walk straight through.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class ElementZone extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {'earth'|'air'} element  which character may pass
   */
  constructor(scene, x, y, width, height, element = 'earth') {
    super(scene, x, y, TEX.PLATFORM);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;

    this.setDisplaySize(width, height);
    this.body.setSize(this.displayWidth, this.displayHeight);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(1);
    this.setTint(element === 'air' ? 0x42a5f5 : 0x66bb6a);
    this.setAlpha(0.4);
  }

  /** True when the given player is the WRONG element and must be blocked. */
  blocks(player) {
    return player.element !== this.element;
  }
}
