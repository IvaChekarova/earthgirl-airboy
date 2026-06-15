// A platform that slides between two points. It can either move continuously
// (patrol) or only while "active" (e.g. driven by a Button). Players ride it
// because Arcade physics carries bodies that rest on a moving immovable body
// when `moves` is handled via velocity.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x        start x
   * @param {number} opts.y        start y
   * @param {number} [opts.width]  display width (defaults to texture width)
   * @param {number} opts.toX      patrol target x
   * @param {number} opts.toY      patrol target y
   * @param {number} [opts.speed]  pixels / second
   * @param {boolean} [opts.auto]  if true, patrols continuously
   */
  constructor(scene, opts) {
    super(scene, opts.x, opts.y, TEX.MOVING_PLATFORM);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (opts.width) this.setDisplaySize(opts.width, this.height);
    this.body.setSize(this.displayWidth, this.displayHeight);

    // Immovable so players stand on it; gravity off so it floats.
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(2);

    this.start = new Phaser.Math.Vector2(opts.x, opts.y);
    this.end = new Phaser.Math.Vector2(opts.toX, opts.toY);
    this.speed = opts.speed ?? 70;
    this.active = opts.auto ?? true;
    this._target = this.end;
  }

  /** Toggle movement on/off (used by Button-driven platforms). */
  setActive(value) {
    this.active = value;
    if (!value) this.body.setVelocity(0, 0);
    return this;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active) {
      this.body.setVelocity(0, 0);
      return;
    }

    const target = this._target;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    // Close enough — snap and flip direction.
    if (dist < 4) {
      this.body.reset(target.x, target.y);
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this._target = target === this.end ? this.start : this.end;
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
  }
}
