// Cloud — a fluffy platform floating above the lava, drawn UPSIDE DOWN so its
// flat side faces up and a character can stand on it. Only Airboy is wired to
// collide with it (the scene registers the collider for him alone), and the
// instant he lands it collapses: it stays solid for a brief grace so he can hop
// off, then fades out for good (it does NOT come back). Because Earthgirl can
// never use it, Airboy must push the stone box into the lava to get her across.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Cloud extends Phaser.Physics.Arcade.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x          centre x
   * @param {number} topY       y of the flat walking surface
   * @param {object} [opts]
   * @param {number} [opts.width]
   * @param {number} [opts.height]
   * @param {number} [opts.solidTime]    ms it stays solid after first contact
   */
  constructor(scene, x, topY, opts = {}) {
    const width = opts.width ?? 120;
    const height = opts.height ?? 46;
    super(scene, x, topY + height / 2, TEX.CLOUD);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static platform

    this.setFlipY(true); // upside down → flat side up to stand on
    this.setDisplaySize(width, height);
    this.setDepth(2);
    this.setVisible(false);
    this.body.updateFromGameObject();

    this.visual = scene.add
      .image(x, topY + height / 2, TEX.CLOUD)
      .setFlipY(true)
      .setDisplaySize(width, height)
      .setDepth(2);
    this.floatTween = null;

    this.solidTime = opts.solidTime ?? 350;
    this._collapsing = false;
  }

  /** Called when Airboy steps on it: brief grace, then vanish for good. */
  collapse() {
    if (this._collapsing) return;
    this._collapsing = true;

    if (this.floatTween) this.floatTween.pause();
    this.scene.tweens.add({ targets: this.visual, alpha: 0.6, duration: this.solidTime });
    this.scene.time.delayedCall(this.solidTime, () => {
      this.body.enable = false; // intangible from now on
      this.scene.tweens.add({ targets: this.visual, alpha: 0, duration: 200 });
    });
  }

  destroy(fromScene) {
    if (this.floatTween) this.floatTween.stop();
    if (this.visual) this.visual.destroy();
    super.destroy(fromScene);
  }
}
