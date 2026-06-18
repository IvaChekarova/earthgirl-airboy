// Base class for every playable level. Subclasses implement `buildLevel()` to
// place platforms, crystals, doors, buttons and moving platforms, and declare
// metadata (level number, name, next level key, player spawn points).
//
// All the shared machinery — texture generation, player creation, camera setup,
// collision wiring, crystal counting and the win condition — lives here so the
// three students can each own one level file without copying boilerplate.

import Phaser from 'phaser';
import { generatePlaceholderTextures, getTempleTextures, preloadReferenceAssets, TEX } from '../utils/textures.js';
import {
  generateCharacterTextures,
  preloadCharacterReference,
  registerCharacterAnimations
} from '../utils/characterTextures.js';
import { gameEvents, EVENTS } from '../utils/events.js';
import { MUSIC, SFX, preloadAudio, playMusic, playSfx, stopMusic, sfxDuration } from '../utils/audio.js';
import Earthgirl from '../entities/Earthgirl.js';
import Airboy from '../entities/Airboy.js';
import Crystal from '../entities/Crystal.js';
import Door from '../entities/Door.js';
import Button from '../entities/Button.js';
import Gate from '../entities/Gate.js';
import MovingPlatform from '../entities/MovingPlatform.js';

export default class BaseLevelScene extends Phaser.Scene {
  constructor(meta) {
    super(meta.key);
    this.meta = meta;
  }

  preload() {
    preloadReferenceAssets(this);
    preloadCharacterReference(this);
    preloadAudio(this);
  }

  create() {
    const { width, height } = this.scale;
    this.levelWidth = this.LEVEL_WIDTH ?? width;
    this.levelHeight = this.LEVEL_HEIGHT ?? height;
    this.completed = false;

    // Audio only — level music starts here and menu music stops if it was playing.
    stopMusic(this, MUSIC.MENU);
    playMusic(this, MUSIC.LEVEL, { volume: 0.28 });

    generatePlaceholderTextures(this);
    generateCharacterTextures(this);
    registerCharacterAnimations(this);

    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.earthCrystals = this.physics.add.group({ allowGravity: false });
    this.airCrystals = this.physics.add.group({ allowGravity: false });
    this.buttons = [];
    this.gateList = [];
    this.hazards = [];
    this.doors = {};

    this.crystalTotals = { earth: 0, air: 0 };
    this.crystalCollected = { earth: 0, air: 0 };

    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.addTempleBackdrop();

    this.buildLevel();

    this.earthgirl = new Earthgirl(this, this.earthSpawn.x, this.earthSpawn.y);
    this.airboy = new Airboy(this, this.airSpawn.x, this.airSpawn.y);

    this.earthgirl.spawnPoint = { ...this.earthSpawn };
    this.airboy.spawnPoint = { ...this.airSpawn };
    this.players = [this.earthgirl, this.airboy];

    this.setupCollisions();
    this.setupCamera();

    // 6. Launch / refresh the UI overlay and announce the correct level.
    const levelData = {
      key: this.meta.key,
      number: this.meta.number,
      name: this.meta.name,
      next: this.meta.next,
      totals: { ...this.crystalTotals }
    };

    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene', levelData);
    } else {
      gameEvents.emit(EVENTS.LEVEL_STARTED, levelData);
    }

    this.emitCrystalUpdate();

    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-ESC', () => this.goToMenu());

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
    stopMusic(this, MUSIC.LEVEL);
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
  }

  getTempleTheme() {
    if (this.meta.number === 2) return 'wind';
    if (this.meta.number === 3) return 'root';
    return 'earth';
  }

  getTempleArt() {
    return getTempleTextures(this.getTempleTheme());
  }

  addTempleBackdrop() {
    const art = this.getTempleArt();

    this.add.rectangle(0, 0, this.levelWidth, this.levelHeight, 0x111111, 1).setOrigin(0).setDepth(-20);

    this.add
      .tileSprite(this.levelWidth / 2, this.levelHeight / 2, this.levelWidth, this.levelHeight, art.wall)
      .setDepth(-19)
      .setAlpha(1);
  }

  addPlatform(x, y, width = 120, height = 24, texture = TEX.PLATFORM) {
    const art = this.getTempleArt();
    const visualTexture = texture === TEX.GROUND ? art.ground : art.platform;
    const visualWidth = width;
    const visualHeight = texture === TEX.GROUND ? 30 : 26;
    const surfaceY = y - height / 2;
    const visualY = surfaceY + visualHeight / 2;

    const plat = this.platforms.create(x, y, TEX.PIXEL);
    plat.setDisplaySize(width, height);
    plat.refreshBody();
    plat.setVisible(false);

    if (texture !== TEX.GROUND) {
      plat.shadow = this.add
        .tileSprite(x, y + height / 2 + 8, width + 18, 18, TEX.SHADOW)
        .setDepth(0)
        .setAlpha(0.55);
    }

    plat.visual = this.add
      .image(x, visualY, visualTexture)
      .setDisplaySize(visualWidth, visualHeight)
      .setDepth(1);

    return plat;
  }

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

  addButton(x, y, onChange, texture = TEX.BUTTON) {
    const button = new Button(this, x, y, onChange, texture);
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

  addHazard(x, y, width, height) {
    const visual = this.makeLavaVisual(x, y, width, height);

    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    zone.hazardVisual = visual;
    this.hazards.push(zone);

    return zone;
  }

  makeLavaVisual(x, y, width, height) {
    const c = this.add.container(x, y).setDepth(1);
    const visualWidth = width;
    const visualHeight = Math.max(24, Math.round(height * 0.62));
    const visualOffsetY = -height / 2 + visualHeight / 2;

    const body = this.add.tileSprite(0, visualOffsetY, visualWidth, visualHeight, TEX.LAVA);
    const glow = this.add.rectangle(0, visualOffsetY - visualHeight / 2 + 8, visualWidth, 8, 0xffc400, 0.24);

    c.add([body, glow]);

    this.tweens.add({
      targets: body,
      tilePositionX: 96,
      duration: 1800,
      repeat: -1,
      ease: 'Linear'
    });

    this.tweens.add({
      targets: glow,
      alpha: 0.55,
      y: glow.y - 2,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const emitter = this.add
      .particles(x, y + visualOffsetY - visualHeight / 2 + 8, TEX.PIXEL, {
        x: { min: -visualWidth / 2 + 4, max: visualWidth / 2 - 4 },
        lifespan: 650,
        speedY: { min: -35, max: -10 },
        speedX: { min: -10, max: 10 },
        scale: { start: 3, end: 0 },
        alpha: { start: 0.75, end: 0 },
        tint: [0xffc400, 0xff6d00, 0xff2a00],
        frequency: 180,
        quantity: 1
      })
      .setDepth(2);

    c.lavaEmitter = emitter;

    return c;
  }

  setupCollisions() {
    this.players.forEach((player) => {
      this.physics.add.collider(player, this.platforms);
      this.physics.add.collider(player, this.movingPlatforms);

      this.gateList.forEach((gate) => this.physics.add.collider(player, gate));
    });

    this.physics.add.overlap(this.earthgirl, this.earthCrystals, this.handleCrystal, null, this);
    this.physics.add.overlap(this.airboy, this.airCrystals, this.handleCrystal, null, this);

    this.buttons.forEach((button) => {
      this.players.forEach((player) => {
        this.physics.add.overlap(player, button, () => button.markTouched());
      });
    });

    this.hazards.forEach((zone) => {
      this.players.forEach((player) => {
        this.physics.add.overlap(player, zone, () => this.respawnPlayer(player));
      });
    });
  }

  respawnPlayer(player) {
    if (player._respawning) return;
    player._respawning = true;

    playSfx(this, SFX.DAMAGE, { volume: 0.65 });

    player.stopStepSound?.();
    player.setVelocity(0, 0);
    player.setPosition(player.spawnPoint.x, player.spawnPoint.y);

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
    const zoom = Math.min(1, this.scale.width / this.levelWidth, this.scale.height / this.levelHeight);

    cam.setZoom(zoom);
    cam.centerOn(this.levelWidth / 2, this.levelHeight / 2);
  }

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
        earth: { got: this.crystalCollected.earth, total: this.crystalTotals.earth },
        air: { got: this.crystalCollected.air, total: this.crystalTotals.air }
      }
    });
  }

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
      const wasAtDoor = player.atDoor;

      const atDoor =
        ready &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          player.getBounds(),
          door.getBounds()
        );

      player.atDoor = atDoor;
      door.setOccupied(atDoor);

      if (atDoor && !wasAtDoor) {
        playSfx(this, SFX.DOOR, { volume: 0.55 });
      }

      if (!atDoor) bothSatisfied = false;
    });

    if (this.completed) return;

    if (bothSatisfied) {
      // Both are home: don't finish on contact. Wait for the door sound to play
      // out, and only complete if they BOTH stay put until it finishes.
      if (!this._sealTimer) {
        this._sealTimer = this.time.delayedCall(sfxDuration(this, SFX.DOOR), () => {
          this._sealTimer = null;
          if (!this.completed && this.bothAtDoors()) this.completeLevel();
        });
      }
    } else if (this._sealTimer) {
      // Someone stepped out before the sound finished — abort the win.
      this._sealTimer.remove();
      this._sealTimer = null;
    }
  }

  /** True only while each hero is standing in its own (ready) door. */
  bothAtDoors() {
    return ['earth', 'air'].every((element) => {
      const door = this.doors[element];
      if (!door) return true;
      const player = element === 'air' ? this.airboy : this.earthgirl;
      return player.atDoor;
    });
  }

  completeLevel() {
    this.completed = true;

    this.players.forEach((p) => {
      p.stopStepSound?.();
      p.setVelocity(0, 0);
      p.body.setAllowGravity(false);
      p.setActive(false);
    });

    playSfx(this, SFX.WIN);
    this.cameras.main.flash(400, 255, 255, 255);

    gameEvents.emit(EVENTS.LEVEL_COMPLETE, {
      key: this.meta.key,
      number: this.meta.number,
      name: this.meta.name,
      next: this.meta.next
    });
  }

  update() {
    if (this.completed) return;

    this.players.forEach((player) => player.update());
    this.buttons.forEach((button) => button.refresh());

    this.checkDoors();
  }
}