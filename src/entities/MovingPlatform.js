// A platform that slides between two points. It supports two modes:
//
//   'patrol' — bounces back and forth continuously (yoyo). Used for ambient
//              moving platforms. Runs as soon as it is `engaged` (auto by
//              default).
//   'lift'   — rises toward `end` while engaged and sinks back to `start` when
//              released. Driven by a Button so one character can raise a
//              platform for the other.
//
// It extends Arcade.Sprite (not Image) so Phaser adds it to the update list and
// actually calls preUpdate every frame.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x        start x
   * @param {number} opts.y        start y
   * @param {number} [opts.width]  display width (defaults to texture width)
   * @param {number} opts.toX      target x
   * @param {number} opts.toY      target y
   * @param {number} [opts.speed]  pixels / second
   * @param {'patrol'|'lift'} [opts.mode]
   * @param {boolean} [opts.auto]  patrol mode: start moving immediately
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

    this.mode = opts.mode ?? 'patrol';
    this.speed = opts.speed ?? 70;
    this.start = new Phaser.Math.Vector2(opts.x, opts.y);
    this.end = new Phaser.Math.Vector2(opts.toX, opts.toY);

    // Patrol platforms auto-run; lifts wait until a button engages them.
    this.engaged = opts.auto ?? this.mode === 'patrol';
    this._patrolTarget = this.end;
  }

  /** Turn the platform on/off (Button callbacks use this). */
  engage(value) {
    this.engaged = !!value;
    return this;
  }

  _moveToward(target, speed = this.speed) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  _snapTo(target) {
    this.body.reset(target.x, target.y);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.mode === 'lift') {
      // Move toward `end` while engaged, otherwise sink back to `start`.
      const target = this.engaged ? this.end : this.start;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
      if (dist < 2) {
        this._snapTo(target);
        return;
      }
      // Ease out near the ends so the lift glides to a stop instead of jerking —
      // smoother and easier to read. Speed scales with remaining distance and is
      // clamped to a comfortable range.
      const speed = Phaser.Math.Clamp(dist * 2.4, 35, this.speed);
      this._moveToward(target, speed);
      return;
    }

    // patrol mode
    if (!this.engaged) {
      this.body.setVelocity(0, 0);
      return;
    }
    const target = this._patrolTarget;
    if (Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) < 4) {
      this._snapTo(target);
      this._patrolTarget = target === this.end ? this.start : this.end;
      return;
    }
    this._moveToward(target);
  }
}
