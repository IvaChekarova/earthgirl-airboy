// A floor button (pressure plate). While at least one player overlaps it, the
// button stays pressed and fires its `onChange` callback. Levels use this to
// drive moving platforms, open gates, etc.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Button extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {(pressed:boolean)=>void} [onChange]
   */
  constructor(scene, x, y, onChange = () => {}) {
    super(scene, x, y, TEX.BUTTON);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.onChange = onChange;
    this.pressed = false;

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setOrigin(0.5, 1); // sit flush on the ground
    this.body.setSize(this.width, this.height);
    this.setDepth(3);

    // Tracks whether a player is touching the button this frame, plus a short
    // "grace" so a single-frame gap in the overlap doesn't make it flicker.
    this._touchedThisFrame = false;
    this._grace = 0;
  }

  /** Called from the scene's overlap callback whenever a player is on it. */
  markTouched() {
    this._touchedThisFrame = true;
  }

  /**
   * Resolve the pressed state once per frame (call at end of scene update).
   * Stays pressed for a few frames after the last touch to avoid blinking.
   */
  refresh() {
    if (this._touchedThisFrame) this._grace = 5;
    else if (this._grace > 0) this._grace -= 1;

    const nowPressed = this._touchedThisFrame || this._grace > 0;
    if (nowPressed !== this.pressed) {
      this.pressed = nowPressed;
      this.setTexture(nowPressed ? TEX.BUTTON_PRESSED : TEX.BUTTON);
      this.onChange(nowPressed);
    }
    this._touchedThisFrame = false;
  }
}
