// MovingBridge — a solid platform that toggles between an ACTIVE state (solid,
// walkable) and a PARKED state (intangible). Used for the lava bridges and the
// wind gate.
//
//   • Bridge:  active = DOWN at ground level (walkable), parked = UP out of reach.
//   • Gate:    active = DOWN in the shaft (blocks wind),  parked = UP at the top.
//
// Implementation notes (why this is robust):
//   • The physics body is STATIC and fixed at the active position — exactly like
//     the floor tiles, so collision "just works" and you can stand on it. A
//     static body never moves, so it can never carry a rider or jitter.
//   • Activation flips `body.enable` IMMEDIATELY (not on tween-complete), so even
//     if the controlling button flickers, the bridge is solid the moment it is
//     pressed. Only the SPRITE is tweened, for the visual slide.
//   • De-activating disables collision instantly — if someone is standing on it
//     over the lava they simply fall in (the intended consequence).

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class MovingBridge extends Phaser.Physics.Arcade.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x
   * @param {number} opts.activeY      y where the (static) body lives & is solid
   * @param {number} opts.parkedY      y the sprite slides to when intangible
   * @param {number} [opts.width]
   * @param {boolean} [opts.startActive]
   * @param {number} [opts.duration]
   */
  constructor(scene, opts) {
    const startActive = opts.startActive ?? false;
    super(scene, opts.x, opts.activeY, TEX.MOVING_PLATFORM);

    scene.add.existing(this);
    this.setDisplaySize(opts.width ?? 200, this.height);
    this.setDepth(3);
    this.setTint(0x7e57c2);

    // Static body, sized + fixed at the ACTIVE position. It never moves.
    scene.physics.add.existing(this, true);
    this.body.updateFromGameObject();

    this.activeY = opts.activeY;
    this.parkedY = opts.parkedY;
    this.duration = opts.duration ?? 250;
    this.isActive = startActive;
    this._tween = null;

    if (!startActive) {
      this.body.enable = false;
      this.y = this.parkedY; // park the sprite (body stays put, just disabled)
    }
  }

  /** true → solid at activeY (slides down); false → intangible (slides to parkedY). */
  setActive(value) {
    value = !!value;
    if (value === this.isActive) return this;
    this.isActive = value;
    if (this._tween) {
      this._tween.stop();
      this._tween = null;
    }

    // Flip collision immediately so it is reliable; the tween is visual only.
    this.body.enable = value;
    this._tween = this.scene.tweens.add({
      targets: this,
      y: value ? this.activeY : this.parkedY,
      duration: this.duration,
      ease: 'Sine.easeInOut'
    });
    return this;
  }
}
