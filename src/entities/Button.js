// A floor button (pressure plate). While at least one player overlaps it, the
// button stays pressed and fires its `onChange` callback. Levels use this to
// drive moving platforms, open gates, etc.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';
import { playSfx, SFX } from '../utils/audio.js';

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

    // Tracks whether a player is touching the button this frame.
    this._touchedThisFrame = false;
  }

  /** Called from the scene's overlap callback whenever a player is on it. */
  markTouched() {
    this._touchedThisFrame = true;
  }

  /**
   * Resolve the pressed state once per frame (call at end of scene update).
   */
  refresh() {
    const nowPressed = this._touchedThisFrame;
    if (nowPressed !== this.pressed) {
      this.pressed = nowPressed;
      this.setTexture(nowPressed ? TEX.BUTTON_PRESSED : TEX.BUTTON);
      if (nowPressed) playSfx(this.scene, SFX.BUTTON);
      this.onChange(nowPressed);
    }
    this._touchedThisFrame = false;
  }
}
