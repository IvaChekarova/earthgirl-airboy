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
    const width = opts.width ?? 200;
    this.setDisplaySize(width, 20);
    this.setDepth(3);
    this.setVisible(false);

    const art = scene.getTempleArt ? scene.getTempleArt() : { moving: TEX.MOVING_PLATFORM };
    // How far below the (static) collision position the visual sits. Bridges
    // pass a small value so the plank's top lines up with the walk surface and
    // covers the lava; the gate keeps the default.
    this._visualOffsetY = opts.visualOffsetY ?? 10;
    this.shadow = scene.add
      .tileSprite(opts.x, opts.activeY + 18, width + 18, 18, TEX.SHADOW)
      .setDepth(1)
      .setAlpha(0.5);
    // Bridges use the dedicated bridge artwork; other solids (e.g. the gate)
    // fall back to the moving-platform texture. The visual width/height are
    // tunable so a bridge can span its whole lava pool and be made thicker.
    const visualWidth = opts.visualWidth ?? Math.round(width * (opts.visualWidthFactor ?? 0.9));
    const visualHeight = opts.visualHeight ?? 24;
    this.visual = scene.add
      .image(opts.x, (startActive ? opts.activeY : opts.parkedY) + this._visualOffsetY, opts.texture ?? art.moving)
      .setDisplaySize(visualWidth, visualHeight)
      .setDepth(3);

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

  setTint(...args) {
    super.setTint(...args);
    return this;
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
      targets: this.visual,
      y: (value ? this.activeY : this.parkedY) + this._visualOffsetY,
      duration: this.duration,
      ease: 'Sine.easeInOut'
    });
    return this;
  }

  destroy(fromScene) {
    if (this.visual) this.visual.destroy();
    if (this.shadow) this.shadow.destroy();
    super.destroy(fromScene);
  }
}
