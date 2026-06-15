// Main menu: title, Start Game button and a toggleable Instructions panel.

import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig.js';
import { generatePlaceholderTextures, TEX } from '../utils/textures.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    generatePlaceholderTextures(this);

    // Clean up any UI overlay left over from a previous play session.
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');

    // Background.
    this.add.rectangle(0, 0, width, height, 0x141a2b).setOrigin(0);
    this.add.rectangle(0, height - 70, width, 70, 0x0e1322).setOrigin(0);

    // Two character chips beside the title for flavour.
    this.add.image(width / 2 - 200, height / 2 - 96, TEX.EARTHGIRL).setScale(1.4);
    this.add.image(width / 2 + 200, height / 2 - 96, TEX.AIRBOY).setScale(1.4);

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

    const bg = this.add.rectangle(0, 0, w, h, color, 0.9).setStrokeStyle(2, 0xffffff, 0.5);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#0b0f1a'
      })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      bg.setScale(1.05);
      this.input.setDefaultCursor('pointer');
    });
    container.on('pointerout', () => {
      bg.setScale(1);
      this.input.setDefaultCursor('default');
    });
    container.on('pointerdown', () => bg.setScale(0.96));
    container.on('pointerup', () => {
      bg.setScale(1.05);
      onClick();
    });

    return container;
  }

  buildInstructionsPanel(width, height) {
    const panel = this.add.container(width / 2, height / 2 + 10).setVisible(false);

    const bg = this.add
      .rectangle(0, 0, 560, 320, 0x0b1020, 0.97)
      .setStrokeStyle(2, 0x4caf50, 0.8);

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

    panel.add([bg, title, body, hint]);
    panel.setDepth(100);
    this.instructionsPanel = panel;
  }

  toggleInstructions() {
    this.instructionsPanel.setVisible(!this.instructionsPanel.visible);
  }
}
