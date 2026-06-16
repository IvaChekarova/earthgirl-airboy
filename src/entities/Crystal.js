// Collectible crystal. Each crystal belongs to an element ("earth" or "air")
// and can only be collected by the matching character. It bobs gently and
// spins to draw the eye.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Crystal extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {'earth'|'air'} element
   */
  constructor(scene, x, y, element = 'earth') {
    const texture = element === 'air' ? TEX.CRYSTAL_AIR : TEX.CRYSTAL_EARTH;
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;
    this.collected = false;

    // Crystals float — turn off gravity for them.
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(5);

    // Gentle bobbing animation.
    this.baseY = y;
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Slow spin (scaleX wobble fakes rotation for the diamond shape).
    scene.tweens.add({
      targets: this,
      scaleX: 0.4,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Mark as collected and play a quick pop before removal.
   * @returns {boolean} true if this call actually collected the crystal.
   */
  collect() {
    if (this.collected) return false;
    this.collected = true;

    this.spawnBurst();

    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 180,
      ease: 'Back.easeIn',
      onComplete: () => this.destroy()
    });

    return true;
  }

  /** A small sparkle burst in the crystal's colour when picked up. */
  spawnBurst() {
    const tint = this.element === 'air' ? 0x64b5f6 : 0x66bb6a;
    const emitter = this.scene.add.particles(this.x, this.y, TEX.PIXEL, {
      lifespan: 420,
      speed: { min: 40, max: 130 },
      angle: { min: 0, max: 360 },
      scale: { start: 5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint,
      emitting: false
    });
    emitter.setDepth(8);
    emitter.explode(14);
    this.scene.time.delayedCall(500, () => emitter.destroy());
  }
}
