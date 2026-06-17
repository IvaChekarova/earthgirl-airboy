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
    this.setDepth(6);

    this.label = label;
    this.controls = controls;

    // Render both characters at the same on-screen height even though their
    // source frames differ (Earthgirl 64px, Airboy 72px). Squash/stretch
    // multiplies this base scale rather than overriding it.
    this.baseScale = PLAYER.DISPLAY_HEIGHT / this.height;
    this.setScale(this.baseScale);

    // Physics body setup. Arcade scales the body by the sprite scale, so we
    // size it in *source* pixels (divided by baseScale) to keep the collision
    // body exactly PLAYER.WIDTH x PLAYER.HEIGHT in world units. Offsets are
    // likewise in source pixels: centre horizontally, and sit the body at the
    // sprite's feet (which render near the frame bottom) so the character
    // stands on platforms instead of sinking through them.
    this.setCollideWorldBounds(true);

    const bodyW = PLAYER.WIDTH / this.baseScale;
    const bodyH = PLAYER.HEIGHT / this.baseScale;
    const footOverlap = 6;

    this.body.setSize(bodyW, bodyH, false);
    this.body.setOffset(
      (this.width - bodyW) / 2,
      (PLAYER.DISPLAY_HEIGHT - PLAYER.HEIGHT - footOverlap) / this.baseScale
    );

    this.setDragX(1200);
    this.setMaxVelocity(PLAYER.SPEED, 1200);

    // Gameplay state.
    this.atDoor = false;

    // Animation state. `animPrefix` ('eg' | 'ab') is set by the subclass.
    this.animPrefix = 'eg';
    this._wasOnGround = true;
    this._landTimer = 0;

    this.nameTag = null;
    this.stepSound = null;
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

    // Audio only — does not affect movement, physics or gameplay.
    this.updateStepSound(onGround);

    if (this.nameTag) this.nameTag.setPosition(this.x, this.y - PLAYER.HEIGHT * 0.7);
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
    else if (!onGround) this.play(vy > 40 ? `${p}-fall` : `${p}-jump`, true);
    else if (moving) this.play(`${p}-walk`, true);
    else this.play(`${p}-idle`, true);

    // Target squash/stretch.
    let tsx = 1;
    let tsy = 1;

    if (this._landTimer > 0) {
      tsx = 1.18;
      tsy = 0.82;
    } else if (!onGround) {
      if (vy < -40) {
        tsx = 0.88;
        tsy = 1.14;
      } else if (vy > 40) {
        tsx = 0.95;
        tsy = 1.06;
      }
    }

    this.scaleX = Phaser.Math.Linear(this.scaleX, tsx * this.baseScale, 0.3);
    this.scaleY = Phaser.Math.Linear(this.scaleY, tsy * this.baseScale, 0.3);
  }

  updateStepSound(onGround) {
    if (!this.scene.cache.audio.exists(SFX.STEPS)) return;

    const movingOnGround = onGround && Math.abs(this.body.velocity.x) > 12;

    if (!this.stepSound) {
      this.stepSound = this.scene.sound.add(SFX.STEPS, {
        loop: true,
        volume: 0.18
      });
    }

    if (movingOnGround) {
      if (!this.stepSound.isPlaying) {
        this.stepSound.play();
      }
    } else {
      this.stopStepSound();
    }
  }

  stopStepSound() {
    if (this.stepSound && this.stepSound.isPlaying) {
      this.stepSound.stop();
    }
  }

  destroy(fromScene) {
    this.stopStepSound();

    if (this.stepSound) {
      this.stepSound.destroy();
      this.stepSound = null;
    }

    if (this.nameTag) this.nameTag.destroy();

    super.destroy(fromScene);
  }
}