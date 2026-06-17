// StoneWall — a heavy stone slab that blocks a passage. It starts CLOSED (solid)
// and a button slides it slowly DOWN into the ground to open. It is tall enough
// that it cannot be jumped over, so the only way past is to open it.
//
// Implementation: a static body fixed at the CLOSED position. Opening disables
// the body instantly (passable) and slides the sprite down out of sight; closing
// slides it back and re-enables the body on arrival. Drawn behind the floor
// (depth -1) so the slab hides as it sinks below ground.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class StoneWall extends Phaser.Physics.Arcade.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} opts
   * @param {number} opts.x
   * @param {number} opts.topY      top of the wall (small y = tall wall)
   * @param {number} [opts.bottomY] base of the wall (default floor line 500)
   * @param {number} [opts.width]
   */
  constructor(scene, opts) {
    const bottomY = opts.bottomY ?? 500;
    const height = bottomY - opts.topY;
    const closedY = opts.topY + height / 2;

    super(scene, opts.x, closedY, TEX.PLATFORM);

    scene.add.existing(this);
    this.setDisplaySize(opts.width ?? 32, height);
    this.setTint(0x5d4037); // heavy dark stone
    this.setDepth(-1);

    scene.physics.add.existing(this, true); // static body at the closed position
    this.body.updateFromGameObject();

    this.closedY = closedY;
    this.openY = closedY + height + 8; // fully below the floor
    this.duration = opts.duration ?? 900; // heavy → slow
    this.isOpen = false;
    this._tween = null;
    // starts closed: body enabled, sprite at closedY
  }

  setOpen(value) {
    value = !!value;
    if (value === this.isOpen) return this;
    this.isOpen = value;
    if (this._tween) this._tween.stop();

    if (value) {
      this.body.enable = false; // passable the moment it starts opening
      this._tween = this.scene.tweens.add({
        targets: this,
        y: this.openY,
        duration: this.duration,
        ease: 'Sine.easeInOut'
      });
    } else {
      this._tween = this.scene.tweens.add({
        targets: this,
        y: this.closedY,
        duration: this.duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.body.enable = true;
        }
      });
    }
    return this;
  }
}
