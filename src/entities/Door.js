// Exit door. Each door is tied to one character via its element. A door is
// "satisfied" when its matching player is overlapping it AND that player has
// collected all of their crystals. The level completes when both doors are
// satisfied at the same time.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Door extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {'earth'|'air'} element
   */
  constructor(scene, x, y, element = 'earth') {
    const texture = element === 'air' ? TEX.DOOR_AIR : TEX.DOOR_EARTH;
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;
    this.open = false;

    // Doors are static-ish: they sit in the air without falling.
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(2);

    // A glowing frame that lights up when the door becomes available.
    this.glow = scene.add
      .rectangle(x, y, this.width + 8, this.height + 8)
      .setStrokeStyle(3, element === 'air' ? 0x64b5f6 : 0x81c784, 0)
      .setDepth(1);
  }

  /**
   * Visually mark the door as ready (all crystals collected for this element).
   */
  setReady(ready) {
    if (this.open === ready) return;
    this.open = ready;
    this.glow.setStrokeStyle(3, this.element === 'air' ? 0x64b5f6 : 0x81c784, ready ? 1 : 0);
    this.setAlpha(ready ? 1 : 0.65);
  }

  destroy(fromScene) {
    if (this.glow) this.glow.destroy();
    super.destroy(fromScene);
  }
}
