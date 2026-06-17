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
    super(scene, x, y, TEX.BUTTON);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setOrigin(0.5, 1); // sits flush on the ground
    this.body.setSize(this.width, this.height);
    this.setTint(0x4caf50); // green = Earthgirl mechanic
    this.setDepth(3);

    this.latch = opts.latch ?? false;
    this.onChange = opts.onChange ?? (() => {});
    this.activeState = false;
    this.latched = false;
    this._touched = false;
    this._grace = 0; // short hold-over so the overlap can't flicker the switch

    // Glowing rune above the pad.
    this.glow = scene.add
      .rectangle(x, y - 10, 34, 22, 0x66bb6a, 0)
      .setStrokeStyle(2, 0x9cffb0, 0)
      .setDepth(2);
    this.rune = scene.add
      .text(x, y - 11, '⟐', { fontFamily: 'monospace', fontSize: '15px', color: '#1b5e20' })
      .setOrigin(0.5)
      .setDepth(4);
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
    this.glow.setStrokeStyle(2, 0x9cffb0, on ? 1 : 0);
    this.glow.setFillStyle(0x66bb6a, on ? 0.3 : 0);
    this.setTint(on ? 0x9cffb0 : 0x4caf50);
    this.rune.setColor(on ? '#0b3d0b' : '#1b5e20');
  }
}
