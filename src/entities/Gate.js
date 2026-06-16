// A blocking gate (a wall that opens). Unlike a Door (an exit), a Gate
// physically blocks the corridor until a Button opens it. While closed its
// static body collides with players; opening disables the body and fades it
// out so a character can walk through.

import Phaser from 'phaser';
import { playSfx, SFX } from '../utils/audio.js';

export default class Gate extends Phaser.GameObjects.Rectangle {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x      centre x
   * @param {number} y      centre y
   * @param {number} width
   * @param {number} height
   * @param {number} [color]
   */
  constructor(scene, x, y, width, height, color = 0x9c6b3c) {
    super(scene, x, y, width, height, color);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // `true` = static body

    this.isOpen = false;
    this.setStrokeStyle(3, 0xffe0a0, 0.6);
    this.setDepth(2);
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.body.enable = false;
    playSfx(this.scene, SFX.GATE);
    this.scene.tweens.add({ targets: this, alpha: 0.12, duration: 200 });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.body.enable = true;
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 200 });
  }
}
