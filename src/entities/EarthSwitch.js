// EarthSwitch — an ancient rune that ONLY Earthgirl can activate. Airboy walking
// over it does nothing; the scene wires an overlap for Earthgirl alone (see
// Level3Scene.setupCollisions). This is the signature mechanic of Level 3: the
// temple obeys Earthgirl, so she is the puzzle-shaper while Airboy travels the
// structures she raises.
//
// Two modes:
//   • hold  — active only while Earthgirl stands on it (release → off).
//   • latch — once Earthgirl touches it, it stays active forever.
//
// It glows green and shows a rune symbol when active for clear feedback.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class EarthSwitch extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y     ground line the switch sits on
   * @param {object} [opts]
   * @param {boolean} [opts.latch]
   * @param {(active:boolean)=>void} [opts.onChange]
   */
  constructor(scene, x, y, opts = {}) {
    super(scene, x, y, TEX.EARTH_SWITCH);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setOrigin(0.5, 1); // sits flush on the ground
    this.setVisible(false);
    this.body.setSize(48, 18);
    this.setDepth(3);
    // The special earth-rune plate (only Earthgirl can use it). The glowing leaf
    // is part of the art, so no separate rune is drawn.
    // Sit the plate flush on the ground (bottom anchored just into the floor so
    // there is never a gap beneath it).
    this.visual = scene.add
      .image(x, y + 8, TEX.EARTH_SWITCH)
      .setOrigin(0.5, 1)
      .setDisplaySize(58, 22)
      .setDepth(3)
      .setTint(0x9fc4a3); // dim until activated

    this.latch = opts.latch ?? false;
    this.onChange = opts.onChange ?? (() => {});
    this.activeState = false;
    this.latched = false;
    this._touched = false;
    this._grace = 0; // short hold-over so the overlap can't flicker the switch
  }

  /** Called by the scene's Earthgirl-only overlap each frame she stands on it. */
  markTouched() {
    this._touched = true;
  }

  /** Resolve activation once per frame (scene calls this in update). */
  refresh() {
    if (this._touched) this._grace = 5;
    else if (this._grace > 0) this._grace -= 1;
    const touched = this._touched || this._grace > 0;

    const want = this.latch ? this.latched || touched : touched;
    if (want !== this.activeState) {
      this.activeState = want;
      if (want && this.latch) this.latched = true;
      this.setVisualActive(want);
      this.onChange(want);
    }
    this._touched = false;
  }

  setVisualActive(on) {
    // Brighten and press the plate down a touch when active.
    if (on) this.visual.clearTint();
    else this.visual.setTint(0x9fc4a3);
    this.visual.setDisplaySize(58, on ? 19 : 22);
  }

  destroy(fromScene) {
    if (this.visual) this.visual.destroy();
    super.destroy(fromScene);
  }
}
