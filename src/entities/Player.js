// Shared base class for both playable characters. Earthgirl and Airboy only
// differ in their texture, control keys and a label, so all the movement and
// physics logic lives here to avoid duplication.

import Phaser from 'phaser';
import { PLAYER } from '../config/gameConfig.js';
import { playSfx, SFX } from '../utils/audio.js';

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

    // Animation state. `animPrefix` ('eg' | 'ab') is set by the subclass.
    this.animPrefix = 'eg';
    this._wasOnGround = true;
    this._landTimer = 0;

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
      playSfx(this.scene, SFX.JUMP);
    }

    // Visuals only — never touches the physics body.
    this.updateAnimation(onGround);

    // Keep the floating name tag glued to the character.
    this.nameTag.setPosition(this.x, this.y - PLAYER.HEIGHT * 0.7);
  }

  /**
   * Pick the idle / walk / jump / land animation from the current state, plus a
   * squash-and-stretch via SCALE. Scale is purely cosmetic in Arcade physics —
   * the collision body (set via setSize) is unaffected, so gameplay is identical.
   */
  updateAnimation(onGround) {
    const p = this.animPrefix;
    const vy = this.body.velocity.y;
    const moving = Math.abs(this.body.velocity.x) > 12;
    const delta = this.scene.game.loop.delta;

    // Landing pulse when we just touched down.
    if (onGround && !this._wasOnGround) this._landTimer = 150;
    this._wasOnGround = onGround;
    if (this._landTimer > 0) this._landTimer -= delta;

    if (this._landTimer > 0) this.play(`${p}-land`, true);
    else if (!onGround) this.play(`${p}-jump`, true);
    else if (moving) this.play(`${p}-walk`, true);
    else this.play(`${p}-idle`, true);

    // Target squash/stretch.
    let tsx = 1;
    let tsy = 1;
    if (this._landTimer > 0) {
      tsx = 1.18;
      tsy = 0.82; // squash on landing
    } else if (!onGround) {
      if (vy < -40) {
        tsx = 0.88;
        tsy = 1.14; // stretch while rising
      } else if (vy > 40) {
        tsx = 0.95;
        tsy = 1.06; // gentle stretch while falling
      }
    }
    this.scaleX = Phaser.Math.Linear(this.scaleX, tsx, 0.3);
    this.scaleY = Phaser.Math.Linear(this.scaleY, tsy, 0.3);
  }

  destroy(fromScene) {
    if (this.nameTag) this.nameTag.destroy();
    super.destroy(fromScene);
  }
}
