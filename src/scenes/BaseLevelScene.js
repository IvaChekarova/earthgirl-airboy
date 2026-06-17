// Base class for every playable level. Subclasses implement `buildLevel()` to
// place platforms, crystals, doors, buttons and moving platforms, and declare
// metadata (level number, name, next level key, player spawn points).
//
// All the shared machinery — texture generation, player creation, camera setup,
// collision wiring, crystal counting and the win condition — lives here so the
// three students can each own one level file without copying boilerplate.

import Phaser from 'phaser';
import { generatePlaceholderTextures, TEX } from '../utils/textures.js';
import {
  generateCharacterTextures,
  preloadCharacterReference,
  registerCharacterAnimations
} from '../utils/characterTextures.js';
import { gameEvents, EVENTS } from '../utils/events.js';
import { playSfx, SFX } from '../utils/audio.js';
import Earthgirl from '../entities/Earthgirl.js';
import Airboy from '../entities/Airboy.js';
import Crystal from '../entities/Crystal.js';
import Door from '../entities/Door.js';
import Button from '../entities/Button.js';
import Gate from '../entities/Gate.js';
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

  preload() {
    preloadCharacterReference(this);
  }

  create() {
    const { width, height } = this.scale;
    this.levelWidth = this.LEVEL_WIDTH ?? width;
    this.levelHeight = this.LEVEL_HEIGHT ?? height;
    this.completed = false;

    // 1. Runtime textures and reference-image character crops.
    generatePlaceholderTextures(this);
    generateCharacterTextures(this);
    registerCharacterAnimations(this);

    // 2. Physics groups shared by every level.
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.earthCrystals = this.physics.add.group({ allowGravity: false });
    this.airCrystals = this.physics.add.group({ allowGravity: false });
    this.buttons = [];
    this.gateList = [];
    this.hazards = [];
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
    // Remember where each character starts so a hazard can respawn just them.
    this.earthgirl.spawnPoint = { ...this.earthSpawn };
    this.airboy.spawnPoint = { ...this.airSpawn };
    this.players = [this.earthgirl, this.airboy];

    this.setupCollisions();
    this.setupCamera();

    // 6. Launch / refresh the UI overlay and announce the level.
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
    gameEvents.emit(EVENTS.LEVEL_STARTED, {
      key: this.meta.key,
      number: this.meta.number,
      name: this.meta.name,
      next: this.meta.next,
      totals: { ...this.crystalTotals }
    });
    this.emitCrystalUpdate();

    // Optional one-time instruction overlay (set `intro` in the level's meta).
    if (this.meta.intro) {
      gameEvents.emit(EVENTS.SHOW_INTRO, this.meta.intro);
    }

    // Restart / menu hotkeys available in every level.
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-ESC', () => this.goToMenu());

    // Navigation requests from the UI (win screen / HUD buttons). The active
    // level owns scene transitions, so the UI just emits and we react here.
    this.navHandlers = {
      [EVENTS.NAV_RESTART]: () => this.scene.restart(),
      [EVENTS.NAV_NEXT]: () => this.goToNext(),
      [EVENTS.NAV_MENU]: () => this.goToMenu()
    };
    Object.entries(this.navHandlers).forEach(([evt, fn]) => gameEvents.on(evt, fn));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      Object.entries(this.navHandlers).forEach(([evt, fn]) => gameEvents.off(evt, fn));
    });
  }

  goToNext() {
    if (this.meta.next) this.scene.start(this.meta.next);
    else this.goToMenu();
  }

  goToMenu() {
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
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

  addGate(x, y, width = 24, height = 160) {
    const gate = new Gate(this, x, y, width, height);
    this.gateList.push(gate);
    return gate;
  }

  addMovingPlatform(opts) {
    const platform = new MovingPlatform(this, opts);
    this.movingPlatforms.add(platform);
    return platform;
  }

  /**
   * A danger zone. Whichever character touches it respawns at their own spawn
   * point — the rest of the level (and the other player's progress) is left
   * untouched. `type` selects the visual ('water' by default).
   */
  addHazard(x, y, width, height, type = 'water') {
    const visual =
      type === 'water'
        ? this.makeWaterVisual(x, y, width, height)
        : this.add.rectangle(x, y, width, height, 0xc62828, 0.55).setStrokeStyle(2, 0xff8a80, 0.8).setDepth(1);

    // Invisible static sensor body used for the overlap test.
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    zone.hazardVisual = visual;
    this.hazards.push(zone);
    return zone;
  }

  /** Animated water: deep body, a rippling surface line and drifting glints. */
  makeWaterVisual(x, y, width, height) {
    const c = this.add.container(x, y).setDepth(1);

    const body = this.add.rectangle(0, 0, width, height, 0x1565c0, 0.55);
    const deep = this.add.rectangle(0, height * 0.18, width, height * 0.64, 0x0d47a1, 0.45);
    const surface = this.add.rectangle(0, -height / 2 + 4, width, 6, 0x64b5f6, 0.9);
    c.add([body, deep, surface]);

    // Gentle bobbing / shimmer of the surface so it reads as moving water.
    this.tweens.add({
      targets: surface,
      y: surface.y - 2,
      alpha: 0.55,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // A couple of small highlights drifting across the surface.
    for (let i = 0; i < 2; i += 1) {
      const glint = this.add.rectangle(
        Phaser.Math.Between(-width / 2 + 8, width / 2 - 8),
        -height / 2 + 9,
        9,
        2,
        0xe3f2fd,
        0.7
      );
      c.add(glint);
      this.tweens.add({
        targets: glint,
        x: glint.x + Phaser.Math.Between(-12, 12),
        alpha: 0.2,
        duration: 1100 + i * 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    return c;
  }

  // -------------------------------------------------------------------------
  // Collisions & camera
  // -------------------------------------------------------------------------

  setupCollisions() {
    this.players.forEach((player) => {
      this.physics.add.collider(player, this.platforms);
      this.physics.add.collider(player, this.movingPlatforms);
      // Closed gates block passage; an opened gate disables its body so the
      // collider simply lets the character through.
      this.gateList.forEach((gate) => this.physics.add.collider(player, gate));
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

    // Hazards: touching one respawns only the offending character.
    this.hazards.forEach((zone) => {
      this.players.forEach((player) => {
        this.physics.add.overlap(player, zone, () => this.respawnPlayer(player));
      });
    });

    // Doors: track overlap each frame via the update loop (see checkDoors()).
  }

  /** Send a single character back to its spawn point (keeps its crystals). */
  respawnPlayer(player) {
    if (player._respawning) return;
    player._respawning = true;

    player.setVelocity(0, 0);
    player.setPosition(player.spawnPoint.x, player.spawnPoint.y);

    // Quick blink so the player notices what happened.
    this.tweens.add({
      targets: player,
      alpha: { from: 0.2, to: 1 },
      duration: 250,
      onComplete: () => {
        player.setAlpha(1);
        player._respawning = false;
      }
    });
  }

  setupCamera() {
    const cam = this.cameras.main;

    // Show the WHOLE level at once — no scrolling. If the level is larger than
    // the viewport we zoom out to fit it; we never zoom in past 1:1.
    const zoom = Math.min(1, this.scale.width / this.levelWidth, this.scale.height / this.levelHeight);
    cam.setZoom(zoom);
    cam.centerOn(this.levelWidth / 2, this.levelHeight / 2);
  }

  // -------------------------------------------------------------------------
  // Crystal / door logic
  // -------------------------------------------------------------------------

  handleCrystal(player, crystal) {
    if (crystal.collect()) {
      this.crystalCollected[crystal.element] += 1;
      playSfx(this, SFX.CRYSTAL);
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

    // Celebratory flash, then let the UI show the win screen. The player
    // chooses Next / Restart / Menu there (handled via NAV_* events).
    playSfx(this, SFX.WIN);
    this.cameras.main.flash(400, 255, 255, 255);
    gameEvents.emit(EVENTS.LEVEL_COMPLETE, {
      key: this.meta.key,
      number: this.meta.number,
      name: this.meta.name,
      next: this.meta.next
    });
  }

  // -------------------------------------------------------------------------
  // Main loop
  // -------------------------------------------------------------------------

  update() {
    if (this.completed) return;

    this.players.forEach((player) => player.update());

    // Resolve button states once per frame.
    this.buttons.forEach((button) => button.refresh());

    this.checkDoors();
  }
}
