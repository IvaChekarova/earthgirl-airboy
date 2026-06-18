// Main menu: title, Start Game button and a toggleable Instructions panel.

import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig.js';
import { generatePlaceholderTextures, preloadReferenceAssets, TEX } from '../utils/textures.js';
import { generateCharacterTextures, preloadCharacterReference } from '../utils/characterTextures.js';
import { MUSIC, SFX, preloadAudio, playMusic, playSfx, stopMusic } from '../utils/audio.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    preloadReferenceAssets(this);
    preloadCharacterReference(this);
    preloadAudio(this);
  }

  create() {
    const { width, height } = this.scale;

    generatePlaceholderTextures(this);
    generateCharacterTextures(this);

    // Clean up any UI overlay left over from a previous play session.
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');

    // Audio only — menu music starts here and level music stops if it was playing.
    stopMusic(this, MUSIC.LEVEL);
    playMusic(this, MUSIC.MENU, { volume: 0.35 });

    // ---------------------------------------------------------------------
    // Background
    // ---------------------------------------------------------------------
    this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);
    this.add.tileSprite(width / 2, height / 2, width, height, TEX.WALL_MOSS).setAlpha(1);
    this.add.tileSprite(width / 2, height - 34, width, 68, TEX.GROUND_EARTH).setAlpha(0.95);

    // Soft dark overlay for readability.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.26).setOrigin(0);

    // ---------------------------------------------------------------------
    // Title area
    // ---------------------------------------------------------------------
    this.add
      .text(width / 2, 92, 'EARTHGIRL & AIRBOY', {
        fontFamily: 'monospace',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 7
      })
      .setOrigin(0.5);

    // Heroes centred above the menu box, each right beside its matching door
    // (door scaled to the same height as the character).
    const rowY = 205;
    const eg = this.add.image(width / 2 - 55, rowY, 'eg-idle-0').setScale(1.32);
    const ab = this.add.image(width / 2 + 55, rowY, 'ab-idle-0').setScale(1.32);

    const earthDoor = this.add.image(0, rowY, TEX.DOOR_EARTH);
    earthDoor.setScale(eg.displayHeight / earthDoor.height);
    earthDoor.x = eg.x - eg.displayWidth / 2 - earthDoor.displayWidth / 2 - 6;

    const airDoor = this.add.image(0, rowY, TEX.DOOR_AIR);
    airDoor.setScale(ab.displayHeight / airDoor.height);
    airDoor.x = ab.x + ab.displayWidth / 2 + airDoor.displayWidth / 2 + 6;

    // ---------------------------------------------------------------------
    // Main menu panel
    // ---------------------------------------------------------------------
    const panelX = width / 2;
    const panelY = 355;
    const panelWidth = 410;
    const panelHeight = 200;

    this.add.rectangle(panelX + 6, panelY + 7, panelWidth, panelHeight, 0x000000, 0.34);
    this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x07111f, 0.82);
    this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x000000, 0)
      .setStrokeStyle(3, 0x9bd44d, 0.82);

    this.add
      .text(panelX, panelY - 74, 'MAIN MENU', {
        fontFamily: 'monospace',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5);

    this.makeButton(panelX, panelY - 24, 'START GAME', COLORS.EARTHGIRL, () => {
      this.scene.start('Level1Scene');
    });

    this.makeButton(panelX, panelY + 44, 'INSTRUCTIONS', COLORS.AIRBOY, () => {
      this.toggleInstructions();
    });

    this.add
      .text(width / 2, height - 28, 'In-game:  R = restart level    ESC = menu', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#cfd8e6',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5);

    this.buildInstructionsPanel(width, height);
  }

  // -------------------------------------------------------------------------
  // Buttons
  // -------------------------------------------------------------------------
  makeButton(x, y, label, color, onClick) {
    const w = 285;
    const h = 52;
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(5, 6, w, h, 0x000000, 0.42);
    const bg = this.add.rectangle(0, 0, w, h, color, 0.95);
    const rim = this.add.rectangle(0, 0, w, h, 0x000000, 0).setStrokeStyle(3, 0xe8f6b0, 0.95);
    const shine = this.add.rectangle(0, -h / 2 + 8, w - 18, 8, 0xffffff, 0.12);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5);

    container.add([shadow, bg, shine, rim, text]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.setAlpha(1);
      container.setScale(1.04);
      this.input.setDefaultCursor('pointer');
    });

    container.on('pointerout', () => {
      bg.setAlpha(0.95);
      container.setScale(1);
      this.input.setDefaultCursor('default');
    });

    container.on('pointerdown', () => {
      container.setScale(0.97);
    });

    container.on('pointerup', () => {
      container.setScale(1.04);
      playSfx(this, SFX.BUTTON, { volume: 0.5 });
      onClick();
    });

    return container;
  }

  makeSmallButton(x, y, label, onClick) {
    const w = 150;
    const h = 40;
    const container = this.add.container(x, y);

    const shadow = this.add.rectangle(4, 5, w, h, 0x000000, 0.4);
    const bg = this.add.rectangle(0, 0, w, h, 0x2d3f5f, 0.98);
    const rim = this.add.rectangle(0, 0, w, h, 0x000000, 0).setStrokeStyle(2, 0xffd54f, 0.9);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5);

    container.add([shadow, bg, rim, text]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.setFillStyle(0x395176);
      container.setScale(1.04);
      this.input.setDefaultCursor('pointer');
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x2d3f5f);
      container.setScale(1);
      this.input.setDefaultCursor('default');
    });

    container.on('pointerdown', () => {
      container.setScale(0.96);
    });

    container.on('pointerup', () => {
      container.setScale(1.04);
      playSfx(this, SFX.BUTTON, { volume: 0.5 });
      onClick();
    });

    return container;
  }

  // -------------------------------------------------------------------------
  // Instructions panel
  // -------------------------------------------------------------------------
  buildInstructionsPanel(width, height) {
    const panel = this.add.container(0, 0).setVisible(false);
    panel.setDepth(1000);

    const panelWidth = 760;
    const panelHeight = 470;
    const panelX = width / 2;
    const panelY = height / 2;
    const topY = panelY - panelHeight / 2;

    const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    const shadow = this.add.rectangle(panelX + 8, panelY + 9, panelWidth, panelHeight, 0x000000, 0.45);
    const box = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x07111f, 0.98);
    const frame = this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0x000000, 0)
      .setStrokeStyle(4, 0x9bd44d, 0.95);

    const title = this.add
      .text(panelX, topY + 42, 'HOW TO PLAY', {
        fontFamily: 'monospace',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffd54f',
        stroke: '#000000',
        strokeThickness: 5
      })
      .setOrigin(0.5);

    const divider = this.add.rectangle(panelX, topY + 80, panelWidth - 90, 2, 0x9bd44d, 0.7);

    const body = this.add
      .text(
        panelX,
        topY + 108,
        [
          'GOAL',
          'Collect every crystal and guide both characters',
          'to their matching exit doors at the same time.',
          '',
          'CONTROLS',
          'Earthgirl  - Move: A / D      Jump: W',
          'Airboy     - Move: Left / Right Arrow      Jump: Up Arrow',
          '',
          'GAMEPLAY',
          'Green crystals belong to Earthgirl.',
          'Blue crystals belong to Airboy.',
          'Use buttons to move platforms and open paths.',
          '',
          'SHORTCUTS',
          'R = restart level',
          'ESC = back to menu'
        ].join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 6,
          stroke: '#000000',
          strokeThickness: 2,
          wordWrap: { width: panelWidth - 110 }
        }
      )
      .setOrigin(0.5, 0);

    const closeButton = this.makeSmallButton(panelX, topY + panelHeight - 38, 'CLOSE', () => {
      this.toggleInstructions();
    });

    panel.add([dim, shadow, box, frame, title, divider, body, closeButton]);
    this.instructionsPanel = panel;
  }

  toggleInstructions() {
    this.instructionsPanel.setVisible(!this.instructionsPanel.visible);
  }
}