// EarthBridge — a root-and-stone pathway that grows across a hazard when an
// EarthSwitch forms it. Per the brief: it grows smoothly and becomes solid only
// once FULLY formed.
//
// Implementation: the static body is fixed at the full span; the sprite grows
// from its left edge (scaleX 0 → 1). Collision is enabled on completion. Once
// formed it stays (these are latched in the puzzle), so both heroes can cross.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class EarthBridge extends Phaser.Physics.Arcade.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x       LEFT edge of the bridge
   * @param {number} opts.y       centre y (its top should match the floor line)
   * @param {number} opts.width   full span
   * @param {number} [opts.height]
   */
  constructor(scene, opts) {
    super(scene, opts.x, opts.y, TEX.EARTH_BRIDGE);

    scene.add.existing(this);
    this.setOrigin(0, 0.5); // grow rightward from the left edge
    this.setDisplaySize(opts.width, opts.height ?? 18);
    this.setDepth(3); // clearly above the lava
    this.setVisible(false);

    this.shadow = scene.add
      .tileSprite(opts.x, opts.y + 13, opts.width + 16, 14, TEX.SHADOW)
      .setOrigin(0, 0.5)
      .setDepth(1)
      .setAlpha(0.45);
    this.visual = scene.add
      .tileSprite(opts.x, opts.y, opts.width, opts.height ?? 22, TEX.EARTH_BRIDGE)
      .setOrigin(0, 0.5)
      .setDepth(3);

    scene.physics.add.existing(this, true); // static body spanning the full bridge
    this.body.updateFromGameObject();

    this.fullScaleX = this.scaleX;
    this.duration = opts.duration ?? 600;
    this.isFormed = false;
    this._tween = null;

    // Start un-formed: no collision, zero width.
    this.body.enable = false;
    this.scaleX = 0;
    this.visual.scaleX = 0;
    this.shadow.scaleX = 0;
  }

  /** true → grow into place (solid once full); false → retract (intangible). */
  setFormed(value) {
    value = !!value;
    if (value === this.isFormed) return this;
    this.isFormed = value;
    if (this._tween) this._tween.stop();

    // Toggle collision immediately (reliable); the grow/shrink is visual only.
    this.body.enable = value;
    this.scaleX = value ? this.fullScaleX : 0;
    this._tween = this.scene.tweens.add({
      targets: [this.visual, this.shadow],
      scaleX: value ? 1 : 0,
      duration: value ? this.duration : this.duration * 0.7,
      ease: value ? 'Quad.easeOut' : 'Quad.easeIn'
    });
    return this;
  }

  destroy(fromScene) {
    if (this.visual) this.visual.destroy();
    if (this.shadow) this.shadow.destroy();
    super.destroy(fromScene);
  }
}
