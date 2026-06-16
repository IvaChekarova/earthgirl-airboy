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
   * Visually mark the door as ready — only happens once the matching character
   * has collected ALL of their crystals. A pulsing glow draws the eye.
   */
  setReady(ready) {
    if (this.open === ready) return;
    this.open = ready;

    const color = this.element === 'air' ? 0x64b5f6 : 0x81c784;
    this.setAlpha(ready ? 1 : 0.6);

    if (ready) {
      this.glow.setStrokeStyle(3, color, 1);
      // Gentle pulse so "the door is open now" is obvious.
      this.glowTween = this.scene.tweens.add({
        targets: this.glow,
        alpha: { from: 1, to: 0.25 },
        scale: { from: 1, to: 1.12 },
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      if (this.glowTween) {
        this.glowTween.stop();
        this.glowTween = null;
      }
      this.glow.setStrokeStyle(3, color, 0).setAlpha(1).setScale(1);
    }
  }

  destroy(fromScene) {
    if (this.glowTween) this.glowTween.stop();
    if (this.glow) this.glow.destroy();
    super.destroy(fromScene);
  }
}
