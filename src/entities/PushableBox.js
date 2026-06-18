// PushableBox — a stone block that rests on the floor and can be shoved sideways
// by a character walking into it (Arcade "pushable" body). In Level 3 Airboy
// pushes it off the right ledge so it drops into the lava pit and becomes a
// stepping stone for Earthgirl.
//
// To keep the puzzle reliable, the box SETTLES into a fixed resting spot the
// moment it is pushed over the pit: it snaps to the pit centre, gravity and
// pushing are switched off, and it becomes a solid, immovable platform whose top
// pokes out above the lava — exactly the stepping stone the level needs.

import Phaser from 'phaser';
import { TEX } from '../utils/textures.js';

export default class PushableBox extends Phaser.Physics.Arcade.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y           centre y while resting on the floor
   * @param {object} opts
   * @param {number} [opts.width]
   * @param {number} [opts.height]
   * @param {number} [opts.settleX]       x it slides to once over the pit
   * @param {number} [opts.settleTop]     top y once settled (pokes out of lava)
   * @param {number} [opts.settleTriggerX] push it past this x to settle it
   */
  constructor(scene, x, y, opts = {}) {
    const width = opts.width ?? 72;
    const height = opts.height ?? 54;
    const centerY = opts.floorY ? opts.floorY - height / 2 : y;
    super(scene, x, centerY, TEX.BOX);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(width, height);
    this.setDepth(5);

    // Physics body. Arcade scales the body by the sprite's display scale, so we
    // size it in *source* (frame) pixels — `this.width`/`this.height` — and let
    // that scaling bring it to the intended world size. (Passing display pixels
    // here would get scaled a second time, leaving a body ~half the sprite.)
    // Offset it so the sprite overhangs the body by `footOverlap` world px at the
    // bottom: the body rests on the floor while the sprite sinks into the ground,
    // so the box reads as planted instead of perched — matching the heroes' feet.
    const footOverlap = 6;
    const bodyW = Math.round(this.width * 0.88);
    const bodyH = Math.round(this.height - footOverlap / this.scaleY);
    this.body.setSize(bodyW, bodyH, false);
    this.body.setOffset((this.width - bodyW) / 2, 0);

    this.body.setCollideWorldBounds(true);
    this.body.pushable = true; // characters can shove it
    this.setDragX(900); // stops sliding once it is no longer being pushed
    this.setMaxVelocity(260, 1200);

    this.settled = false;
    this._settling = false;
    this.settleX = opts.settleX ?? x;
    this.settleTop = opts.settleTop ?? y;
    this.settleTriggerX = opts.settleTriggerX ?? -Infinity;
  }

  /**
   * Called each frame by the scene. Once the box is pushed past the pit edge it
   * smoothly SLIDES to the middle of the lava pool and drops into its resting
   * spot, then locks as a solid stepping stone.
   */
  trySettle() {
    if (this.settled) return;

    if (!this._settling) {
      if (this.x > this.settleTriggerX) return;
      this._settling = true;
      this.body.setAllowGravity(false);
      this.body.pushable = false;
      this._targetY = this.settleTop + this.displayHeight / 2;
    }

    const dx = this.settleX - this.x;
    const dy = this._targetY - this.y;
    if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) {
      this.setVelocity(0, 0);
      this.setPosition(this.settleX, this._targetY);
      this.body.setImmovable(true);
      this.body.updateFromGameObject();
      this.settled = true;
      return;
    }
    // Ease toward the centre (proportional speed, clamped by maxVelocity).
    this.setVelocity(dx * 4, dy * 4);
  }
}
