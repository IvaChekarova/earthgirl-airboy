// Shared base class for both playable characters. Earthgirl and Airboy only
// differ in their texture, control keys and a label, so all the movement and
// physics logic lives here to avoid duplication.

import Phaser from 'phaser';
import { PLAYER } from '../config/gameConfig.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture   generated placeholder texture key
   * @param {object} controls  map of Phaser key objects { left, right, up }
   * @param {string} label     "Earthgirl" | "Airboy"
   */
  constructor(scene, x, y, texture, controls, label) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.label = label;
    this.controls = controls;

    // Physics body setup.
    this.setCollideWorldBounds(true);
    this.body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    this.setDragX(1200);
    this.setMaxVelocity(PLAYER.SPEED, 1200);

    // Gameplay state.
    this.atDoor = false;

    // A small name tag that floats above the character.
    this.nameTag = scene.add
      .text(x, y - PLAYER.HEIGHT, label, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 1)
      .setDepth(20);
  }

  /**
   * Called every frame by the scene's update loop.
   */
  update() {
    const { left, right, up } = this.controls;
    const onGround = this.body.blocked.down || this.body.touching.down;

    // Horizontal movement.
    if (left.isDown) {
      this.setVelocityX(-PLAYER.SPEED);
      this.setFlipX(true);
    } else if (right.isDown) {
      this.setVelocityX(PLAYER.SPEED);
      this.setFlipX(false);
    }

    // Jump — only when standing on something.
    if (Phaser.Input.Keyboard.JustDown(up) && onGround) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
    }

    // Keep the floating name tag glued to the character.
    this.nameTag.setPosition(this.x, this.y - PLAYER.HEIGHT * 0.7);
  }

  destroy(fromScene) {
    if (this.nameTag) this.nameTag.destroy();
    super.destroy(fromScene);
  }
}
