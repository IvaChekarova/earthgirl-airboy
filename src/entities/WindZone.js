// WindZone — a vertical air stream that lifts a character upward while they
// overlap it. Only the character the scene wires up (Airboy) is affected; the
// scene simply doesn't register an overlap for Earthgirl, so she is never
// lifted.
//
// Visually it is a translucent light-blue column with a few brighter "stream"
// lines and small particles drifting upward.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class WindZone extends Phaser.GameObjects.Zone {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x       centre x
   * @param {number} y       centre y
   * @param {number} width
   * @param {number} height
   * @param {object} [opts]
   * @param {number} [opts.strength]  upward speed (px/s) applied while inside
   */
  constructor(scene, x, y, width, height, opts = {}) {
    super(scene, x, y, width, height);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body, used for overlap only

    this.strength = opts.strength ?? 320;

    // --- Visuals ---------------------------------------------------------
    this.column = scene.add
      .rectangle(x, y, width, height, 0x64b5f6, 0.16)
      .setStrokeStyle(2, 0x90caf9, 0.45)
      .setDepth(1);

    // A few vertical stream lines that gently pulse.
    this.streams = [];
    const lines = Math.max(2, Math.floor(width / 24));
    for (let i = 0; i < lines; i += 1) {
      const sx = x - width / 2 + (i + 0.5) * (width / lines);
      const line = scene.add
        .rectangle(sx, y, 3, height * 0.92, 0xb3e5fc, 0.3)
        .setDepth(1);
      scene.tweens.add({
        targets: line,
        alpha: 0.08,
        duration: 600 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.streams.push(line);
    }

    // Upward-drifting particles for a sense of movement.
    this.emitter = scene.add
      .particles(x, y + height / 2 - 4, TEX.PIXEL, {
        x: { min: -width / 2 + 4, max: width / 2 - 4 },
        lifespan: 1300,
        speedY: { min: -170, max: -90 },
        speedX: { min: -12, max: 12 },
        scale: { start: 3, end: 0 },
        alpha: { start: 0.5, end: 0 },
        tint: 0xb3e5fc,
        frequency: 80,
        quantity: 1
      })
      .setDepth(1);
  }

  /** Push the given player straight up. Called each frame while overlapping. */
  applyTo(player) {
    player.setVelocityY(-this.strength);
  }

  destroy(fromScene) {
    this.column?.destroy();
    this.streams?.forEach((s) => s.destroy());
    this.emitter?.destroy();
    super.destroy(fromScene);
  }
}
