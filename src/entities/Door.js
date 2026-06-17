// Exit door. Each door is tied to one character via its element. A door is
// "satisfied" when its matching player is overlapping it AND that player has
// collected all of their crystals. The level completes when both doors are
// satisfied at the same time.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class Door extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {'earth'|'air'} element
   */
  constructor(scene, x, y, element = 'earth') {
    const texture = element === 'air' ? TEX.DOOR_AIR : TEX.DOOR_EARTH;
    const displayWidth = 62;
    const displayHeight = 84;
    const bottomY = y + displayHeight / 2 + 10;
    super(scene, x, bottomY, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;
    this.open = false;
    this.occupied = false;
    this.setOrigin(0.5, 1);
    this.setDisplaySize(displayWidth, displayHeight);

    // Doors are static-ish: they sit in the air without falling.
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(44, 68);
    this.body.setOffset((this.width - 44) / 2, this.height - 68);
    this.setDepth(2);

    const color = element === 'air' ? 0x64b5f6 : 0x81c784;
    this.readyDot = scene.add
      .circle(x, bottomY - displayHeight - 9, 6, 0x111111, 0.75)
      .setStrokeStyle(2, color, 0.9)
      .setDepth(4);
  }

  /**
   * Visually mark the door as ready — only happens once the matching character
   * has collected ALL of their crystals. A pulsing glow draws the eye.
   */
  setReady(ready) {
    if (this.open === ready) return;
    this.open = ready;

    const color = this.element === 'air' ? 0x64b5f6 : 0x81c784;
    this.setAlpha(ready ? 1 : 0.6);

    if (ready) {
      this.readyDot.setFillStyle(color, 1);
    } else {
      this.readyDot.setFillStyle(0x111111, 0.75);
      this.setOccupied(false);
    }
  }

  setOccupied(occupied) {
    this.occupied = !!occupied && this.open;
  }

  destroy(fromScene) {
    if (this.readyDot) this.readyDot.destroy();
    super.destroy(fromScene);
  }
}
