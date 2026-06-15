// Base class for every playable level. Subclasses implement `buildLevel()` to
// place platforms, crystals, doors, buttons and moving platforms, and declare
// metadata (level number, name, next level key, player spawn points).
//
// All the shared machinery — texture generation, player creation, camera setup,
// collision wiring, crystal counting and the win condition — lives here so the
// three students can each own one level file without copying boilerplate.

import Phaser from 'phaser';
import { generatePlaceholderTextures, TEX } from '../utils/textures.js';
import { gameEvents, EVENTS } from '../utils/events.js';
import Earthgirl from '../entities/Earthgirl.js';
import Airboy from '../entities/Airboy.js';
import Crystal from '../entities/Crystal.js';
import Door from '../entities/Door.js';
import Button from '../entities/Button.js';
import MovingPlatform from '../entities/MovingPlatform.js';

export default class BaseLevelScene extends Phaser.Scene {
  /**
   * @param {object} meta
   * @param {string} meta.key        scene key
   * @param {number} meta.number     level number (1-3)
   * @param {string} meta.name       display name ("Earth Gate")
   * @param {string|null} meta.next  next scene key, or null if last
   */
  constructor(meta) {
    super(meta.key);
    this.meta = meta;
  }

  create() {
    const { width, height } = this.scale;
    this.levelWidth = this.LEVEL_WIDTH ?? width;
    this.levelHeight = this.LEVEL_HEIGHT ?? height;
    this.completed = false;

    // 1. Placeholder textures (no external assets needed).
    generatePlaceholderTextures(this);

    // 2. Physics groups shared by every level.
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.earthCrystals = this.physics.add.group({ allowGravity: false });
    this.airCrystals = this.physics.add.group({ allowGravity: false });
    this.buttons = [];
    this.doors = {};

    // Track how many crystals each character still needs.
    this.crystalTotals = { earth: 0, air: 0 };
    this.crystalCollected = { earth: 0, air: 0 };

    // 3. World + camera bounds.
    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);

    // 4. Subclass builds the actual layout (sets spawn points too).
    this.buildLevel();

    // 5. Players. Subclass must define earthSpawn / airSpawn.
    this.earthgirl = new Earthgirl(this, this.earthSpawn.x, this.earthSpawn.y);
    this.airboy = new Airboy(this, this.airSpawn.x, this.airSpawn.y);
    this.players = [this.earthgirl, this.airboy];

    this.setupCollisions();
    this.setupCamera();

    // 6. Launch / refresh the UI overlay and announce the level.
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
    gameEvents.emit(EVENTS.LEVEL_STARTED, {
      number: this.meta.number,
      name: this.meta.name,
      totals: { ...this.crystalTotals }
    });
    this.emitCrystalUpdate();

    // Restart / menu hotkeys available in every level.
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  // -------------------------------------------------------------------------
  // Builder helpers used by subclasses
  // -------------------------------------------------------------------------

  /** Add a static platform. Width/height default to a single tile. */
  addPlatform(x, y, width = 120, height = 24, texture = TEX.PLATFORM) {
    const plat = this.platforms.create(x, y, texture);
    plat.setDisplaySize(width, height);
    plat.refreshBody();
    return plat;
  }

  /** Convenience: a full-width ground strip along the bottom. */
  addGround(y = this.levelHeight - 20, width = this.levelWidth) {
    return this.addPlatform(width / 2, y, width, 40, TEX.GROUND);
  }

  addCrystal(x, y, element) {
    const crystal = new Crystal(this, x, y, element);
    if (element === 'air') this.airCrystals.add(crystal);
    else this.earthCrystals.add(crystal);
    this.crystalTotals[element] += 1;
    return crystal;
  }

  addDoor(x, y, element) {
    const door = new Door(this, x, y, element);
    this.doors[element] = door;
    return door;
  }

  addButton(x, y, onChange) {
    const button = new Button(this, x, y, onChange);
    this.buttons.push(button);
    return button;
  }

  addMovingPlatform(opts) {
    const platform = new MovingPlatform(this, opts);
    this.movingPlatforms.add(platform);
    return platform;
  }

  // -------------------------------------------------------------------------
  // Collisions & camera
  // -------------------------------------------------------------------------

  setupCollisions() {
    this.players.forEach((player) => {
      this.physics.add.collider(player, this.platforms);
      this.physics.add.collider(player, this.movingPlatforms);
    });

    // Crystals: only the matching character can collect.
    this.physics.add.overlap(this.earthgirl, this.earthCrystals, this.handleCrystal, null, this);
    this.physics.add.overlap(this.airboy, this.airCrystals, this.handleCrystal, null, this);

    // Buttons: any player can press them.
    this.buttons.forEach((button) => {
      this.players.forEach((player) => {
        this.physics.add.overlap(player, button, () => button.markTouched());
      });
    });

    // Doors: track overlap each frame via the update loop (see checkDoors()).
  }

  setupCamera() {
    const cam = this.cameras.main;

    // Follow the midpoint of both players using an invisible tracking object.
    this.cameraFocus = new Phaser.Math.Vector2(
      (this.earthgirl.x + this.airboy.x) / 2,
      (this.earthgirl.y + this.airboy.y) / 2
    );
    cam.startFollow(this.cameraFocus, true, 0.08, 0.08);
    cam.setDeadzone(120, 80);
  }

  // -------------------------------------------------------------------------
  // Crystal / door logic
  // -------------------------------------------------------------------------

  handleCrystal(player, crystal) {
    if (crystal.collect()) {
      this.crystalCollected[crystal.element] += 1;
      this.emitCrystalUpdate();
    }
  }

  emitCrystalUpdate() {
    const collected = this.crystalCollected.earth + this.crystalCollected.air;
    const total = this.crystalTotals.earth + this.crystalTotals.air;
    gameEvents.emit(EVENTS.CRYSTAL_COLLECTED, {
      collected,
      total,
      perElement: {
        earth: { ...{ got: this.crystalCollected.earth, total: this.crystalTotals.earth } },
        air: { got: this.crystalCollected.air, total: this.crystalTotals.air }
      }
    });
  }

  /** Returns true when the given element has all its crystals. */
  elementReady(element) {
    return this.crystalCollected[element] >= this.crystalTotals[element];
  }

  checkDoors() {
    let bothSatisfied = true;

    ['earth', 'air'].forEach((element) => {
      const door = this.doors[element];
      if (!door) return;

      const ready = this.elementReady(element);
      door.setReady(ready);

      const player = element === 'air' ? this.airboy : this.earthgirl;
      const atDoor =
        ready &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          player.getBounds(),
          door.getBounds()
        );
      player.atDoor = atDoor;

      if (!atDoor) bothSatisfied = false;
    });

    if (bothSatisfied && !this.completed) {
      this.completeLevel();
    }
  }

  completeLevel() {
    this.completed = true;

    // Freeze the players.
    this.players.forEach((p) => {
      p.setVelocity(0, 0);
      p.body.setAllowGravity(false);
      p.setActive(false);
    });

    gameEvents.emit(EVENTS.LEVEL_COMPLETE, {
      number: this.meta.number,
      name: this.meta.name,
      next: this.meta.next
    });

    // Celebratory flash, then advance.
    this.cameras.main.flash(400, 255, 255, 255);
    this.time.delayedCall(1600, () => {
      if (this.meta.next) {
        this.scene.start(this.meta.next);
      } else {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
      }
    });
  }

  // -------------------------------------------------------------------------
  // Main loop
  // -------------------------------------------------------------------------

  update() {
    if (this.completed) return;

    this.players.forEach((player) => player.update());

    // Keep the camera focus on the players' midpoint.
    this.cameraFocus.set(
      (this.earthgirl.x + this.airboy.x) / 2,
      (this.earthgirl.y + this.airboy.y) / 2
    );

    // Resolve button states once per frame.
    this.buttons.forEach((button) => button.refresh());

    this.checkDoors();
  }
}
