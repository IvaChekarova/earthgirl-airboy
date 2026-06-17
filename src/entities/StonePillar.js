// StonePillar — a rocky column that rises out of the ground when an EarthSwitch
// raises it, and sinks back when released. It is a genuine MOVING platform:
// a dynamic, immovable, gravity-free body driven by velocity (like Level 1's
// lift). So it is ALWAYS solid (never pass-through), it PUSHES/CARRIES a rider
// up as it rises, and a rider rides it back down.
//
// It is built from a Rectangle (not a scaled texture) so its physics body is
// sized EXACTLY to width×height — a scaled sprite mis-sizes/offsets the body,
// which previously left an invisible body floating in the air.
//
// Parked, it hides below the surface (`parkedTop`, default below the floor) so
// the lowered pillar never blocks walking. The scene drives it each frame via
// tick(delta).

import Phaser from 'phaser';

export default class StonePillar extends Phaser.GameObjects.Rectangle {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x
   * @param {number} [opts.groundY]    floor surface (default 500)
   * @param {number} [opts.height]     raised height
   * @param {number} [opts.width]
   * @param {number} [opts.parkedTop]  top y when parked (default below the floor)
   * @param {number} [opts.speed]      rise/sink speed px/s
   */
  constructor(scene, opts) {
    const groundY = opts.groundY ?? 500;
    const height = opts.height ?? 100;
    const width = opts.width ?? 44;
    const parkedTop = opts.parkedTop ?? groundY + 50;

    const parkedY = parkedTop + height / 2; // centre when hidden/down
    const raisedY = groundY - height / 2; // centre when fully up (top = groundY - height)

    super(scene, opts.x, parkedY, width, height, 0x8d6e63);
    scene.add.existing(this);
    scene.physics.add.existing(this); // body sized exactly to the rectangle

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setVelocity(0, 0);
    this.setStrokeStyle(2, 0x5d4037);
    this.setDepth(-1);

    this.raisedY = raisedY;
    this.parkedY = parkedY;
    this.speed = opts.speed ?? 200;
    this.targetY = parkedY;
    this.isRaised = false;
    this._moving = false; // only true while travelling to a new target
  }

  /** true → drive up to the raised position; false → drive back down. */
  setRaised(value) {
    value = !!value;
    if (value === this.isRaised) return this;
    this.isRaised = value;
    this.targetY = value ? this.raisedY : this.parkedY;
    this._moving = true;
    return this;
  }

  /** Called every frame by the scene — drives toward the target, then STOPS and
   *  leaves the body completely alone (so a rider stays grounded and can jump,
   *  and the pillar never micro-bounces). */
  tick(delta) {
    if (!this._moving) return;

    const dy = this.targetY - this.y;
    if (Math.abs(dy) <= 2) {
      this.body.setVelocityY(0);
      this._moving = false; // settled — don't touch the body again
      return;
    }

    const dt = (delta || 16.67) / 1000;
    this.body.setVelocityY(Phaser.Math.Clamp(dy / dt, -this.speed, this.speed));
  }
}
