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
    super(scene, x, y, TEX.GATE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(width, height);
    this.body.setSize(this.displayWidth, this.displayHeight);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(2);
    this.setVisible(false);

    this.visual = scene.add
      .image(x, y, TEX.GATE)
      .setDisplaySize(Math.max(14, width - 6), height)
      .setDepth(2);
    this.closedY = y;
    this.openY = y - height - 20;
    this._tween = null;

    this.isOpen = false;
  }

  setTint(...args) {
    super.setTint(...args);
    if (this.visual) this.visual.setTint(...args);
    return this;
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.body.enable = false;
    if (this._tween) this._tween.stop();
    this._tween = this.scene.tweens.add({
      targets: this.visual,
      y: this.openY,
      duration: 520,
      ease: 'Sine.easeInOut'
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.body.enable = true;
    if (this._tween) this._tween.stop();
    this._tween = this.scene.tweens.add({
      targets: this.visual,
      y: this.closedY,
      duration: 360,
      ease: 'Sine.easeInOut'
    });
  }

  destroy(fromScene) {
    if (this._tween) this._tween.stop();
    if (this.visual) this.visual.destroy();
    super.destroy(fromScene);
  }
}
