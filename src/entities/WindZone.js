// WindZone — a vertical air stream that lifts a character upward while they
// overlap it. Only the character the scene wires up (Airboy) is affected; the
// scene simply doesn't register an overlap for Earthgirl, so she is never
// lifted.
//
// Visually it is a soft, edge-faded column of airflow that scrolls upward (so
// it reads as moving air, not a solid box) with a wind generator at its base
// and a few drifting particles. The visual reach can be extended upward once a
// blocker in the shaft (e.g. the gate) is lifted — see setVisualTop.

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

    // Shaft geometry. The airflow VISUAL lives between `bottom` and `currentTop`
    // and can grow upward; the physics body (this Zone) never changes.
    this.zoneX = x;
    this.zoneWidth = width;
    this.bottom = y + height / 2;
    this.baseTop = y - height / 2;
    this.currentTop = this.baseTop;

    // --- Visuals ---------------------------------------------------------
    // Wind generator standing on the ground at the base of the shaft. Its base
    // is anchored a little below the floor surface so it reads as planted on the
    // ground, and it keeps the art's wide ~2:1 ratio (a vent, not a tower).
    const genWidth = Math.max(width + 6, 76);
    this.generator = scene.add
      .image(x, this.bottom + 28, TEX.WIND_GENERATOR)
      .setOrigin(0.5, 1)
      .setDisplaySize(genWidth, Math.round(genWidth * 0.5))
      .setDepth(2);

    // Flowing airflow column: a soft, edge-faded stream scrolled upward so it
    // looks like moving air rather than a bordered rectangle.
    this.column = scene.add
      .tileSprite(x, (this.bottom + this.currentTop) / 2, width + 8, this.bottom - this.currentTop, TEX.WIND_STREAM)
      .setDepth(1);
    scene.tweens.add({
      targets: this.column,
      tilePositionY: 256, // scroll the streaks upward forever
      duration: 1400,
      repeat: -1,
      ease: 'Linear'
    });

    // Upward-drifting particles for extra life near the base.
    this.emitter = scene.add
      .particles(x, this.bottom - 6, TEX.PIXEL, {
        x: { min: -width / 2 + 4, max: width / 2 - 4 },
        lifespan: 1500,
        speedY: { min: -150, max: -80 },
        speedX: { min: -10, max: 10 },
        scale: { start: 3, end: 0 },
        alpha: { start: 0.45, end: 0 },
        tint: [0xb3e5fc, 0xe1f5fe],
        frequency: 60,
        quantity: 1
      })
      .setDepth(1);
  }

  /** Push the given player straight up. Called each frame while overlapping. */
  applyTo(player) {
    player.setVelocityY(-this.strength);
  }

  /**
   * Extend (or restore) how far up the airflow VISUAL reaches. Physics is
   * unchanged — this only makes the wind look like it keeps flowing upward once
   * a blocker (e.g. the gate) is lifted out of the shaft. Pass `baseTop` to
   * restore the original (blocked) reach.
   */
  setVisualTop(topY) {
    this.currentTop = topY;
    this.scene.tweens.add({
      targets: this.column,
      height: this.bottom - topY,
      y: (this.bottom + topY) / 2,
      duration: 320,
      ease: 'Sine.easeInOut'
    });
    return this;
  }

  destroy(fromScene) {
    this.generator?.destroy();
    this.column?.destroy();
    this.emitter?.destroy();
    super.destroy(fromScene);
  }
}
