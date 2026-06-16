// Gate — a blocking wall that opens when a button is pressed. While closed its
// body collides with players; opening disables the body (so characters pass
// through) and fades it out. Reused across levels.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Gate extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {'earth'|'air'} [element]  tints the gate to match a character
   */
  constructor(scene, x, y, width, height, element = 'air') {
    super(scene, x, y, TEX.PLATFORM);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(width, height);
    this.body.setSize(this.displayWidth, this.displayHeight);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(2);
    this.setTint(element === 'air' ? 0x1565c0 : 0x2e7d32);

    this.isOpen = false;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.body.enable = false;
    this.scene.tweens.add({ targets: this, alpha: 0.15, duration: 200 });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.body.enable = true;
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 200 });
  }
}
