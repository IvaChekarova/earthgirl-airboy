// Main menu: title, Start Game button and a toggleable Instructions panel.

import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig.js';
import { generatePlaceholderTextures, preloadReferenceAssets, TEX } from '../utils/textures.js';
import { generateCharacterTextures, preloadCharacterReference } from '../utils/characterTextures.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    preloadReferenceAssets(this);
    preloadCharacterReference(this);
  }

  create() {
    const { width, height } = this.scale;
    generatePlaceholderTextures(this);
    generateCharacterTextures(this);

    // Clean up any UI overlay left over from a previous play session.
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');

    // Ancient temple background.
    this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);
    this.add.tileSprite(width / 2, height / 2, width, height, TEX.WALL_MOSS).setAlpha(1);
    this.add.tileSprite(width / 2, height - 34, width, 68, TEX.GROUND_EARTH).setAlpha(0.95);

    // Two character chips beside the title for flavour.
    this.add.image(width / 2 - 200, height / 2 - 96, 'eg-idle-0').setScale(1.4);
    this.add.image(width / 2 + 200, height / 2 - 96, 'ab-idle-0').setScale(1.4);

    // Title.
    this.add
      .text(width / 2, height / 2 - 130, 'EARTHGIRL & AIRBOY', {
        fontFamily: 'monospace',
        fontSize: '46px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 86, 'A cooperative puzzle platformer', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#8fa0c0'
      })
      .setOrigin(0.5);

    // Buttons.
    this.makeButton(width / 2, height / 2 + 0, 'START GAME', COLORS.EARTHGIRL, () => {
      this.scene.start('Level1Scene');
    });

    this.makeButton(width / 2, height / 2 + 64, 'INSTRUCTIONS', COLORS.AIRBOY, () => {
      this.toggleInstructions();
    });

    // --- TEMPORARY: quick level jump for testing (remove before release) ----
    this.buildLevelSelect(width, height / 2 + 128);

    this.add
      .text(width / 2, height - 35, 'In-game:  R = restart level    ESC = menu', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#6b7a99'
      })
      .setOrigin(0.5);

    this.buildInstructionsPanel(width, height);
  }

  /** Create a simple rounded rectangle button with hover + click feedback. */
  makeButton(x, y, label, color, onClick) {
    const w = 260;
    const h = 48;
    const container = this.add.container(x, y);

    const bg = this.add.tileSprite(0, 0, w, h, TEX.PLATFORM_EARTH).setTint(color);
    const rim = this.add.rectangle(0, 0, w, h, 0x000000, 0).setStrokeStyle(2, 0xb6e86a, 0.75);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#0b0f1a'
      })
      .setOrigin(0.5);

    container.add([bg, rim, text]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.setScale(1.05);
      rim.setScale(1.05);
      this.input.setDefaultCursor('pointer');
    });
    container.on('pointerout', () => {
      bg.setScale(1);
      rim.setScale(1);
      this.input.setDefaultCursor('default');
    });
    container.on('pointerdown', () => {
      bg.setScale(0.96);
      rim.setScale(0.96);
    });
    container.on('pointerup', () => {
      bg.setScale(1.05);
      rim.setScale(1.05);
      onClick();
    });

    return container;
  }

  /**
   * TEMPORARY testing aid — a row of small "Level N" buttons that jump straight
   * into a level. Remove this method and its call before release.
   */
  buildLevelSelect(width, y) {
    const levels = ['Level1Scene', 'Level2Scene', 'Level3Scene'];

    this.add
      .text(width / 2, y - 22, 'TEST — jump to level:', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffb74d'
      })
      .setOrigin(0.5);

    const size = 38;
    const gap = 14;
    const totalWidth = levels.length * size + (levels.length - 1) * gap;
    let cx = width / 2 - totalWidth / 2 + size / 2;

    levels.forEach((key, i) => {
      const container = this.add.container(cx, y + 6);
      const bg = this.add.rectangle(0, 0, size, size, 0x1d2233).setStrokeStyle(2, 0xffb74d, 0.85);
      const label = this.add
        .text(0, 0, String(i + 1), {
          fontFamily: 'monospace',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#ffe0b2'
        })
        .setOrigin(0.5);

      container.add([bg, label]);
      container.setSize(size, size);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size),
        Phaser.Geom.Rectangle.Contains
      );
      container.on('pointerover', () => {
        bg.setFillStyle(0x2a3350);
        this.input.setDefaultCursor('pointer');
      });
      container.on('pointerout', () => {
        bg.setFillStyle(0x1d2233);
        this.input.setDefaultCursor('default');
      });
      container.on('pointerup', () => this.scene.start(key));

      cx += size + gap;
    });
  }

  buildInstructionsPanel(width, height) {
    const panel = this.add.container(width / 2, height / 2 + 10).setVisible(false);

    const bg = this.add.tileSprite(0, 0, 560, 320, TEX.WALL_MOSS).setAlpha(0.96);
    const frame = this.add.rectangle(0, 0, 560, 320, 0x000000, 0).setStrokeStyle(3, 0x92d45a, 0.9);

    const title = this.add
      .text(0, -128, 'HOW TO PLAY', {
        fontFamily: 'monospace',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffd54f'
      })
      .setOrigin(0.5);

    const body = this.add
      .text(
        0,
        4,
        [
          'GOAL',
          '  Collect every crystal and get each character',
          '  to their matching exit door at the same time.',
          '',
          'EARTHGIRL (green)   move: A / D    jump: W',
          'AIRBOY    (blue)    move: < / >    jump: ^',
          '',
          'Green crystals are for Earthgirl, blue for Airboy.',
          'Cooperate: stand on buttons to move platforms!',
          '',
          'R = restart level     ESC = back to menu'
        ].join('\n'),
        {
          fontFamily: 'monospace',
          fontSize: '15px',
          color: '#d7e0f0',
          align: 'left',
          lineSpacing: 4
        }
      )
      .setOrigin(0.5, 0.5);

    const hint = this.add
      .text(0, 138, '[ click Instructions again to close ]', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#6b7a99'
      })
      .setOrigin(0.5);

    panel.add([bg, frame, title, body, hint]);
    panel.setDepth(100);
    this.instructionsPanel = panel;
  }

  toggleInstructions() {
    this.instructionsPanel.setVisible(!this.instructionsPanel.visible);
  }
}
