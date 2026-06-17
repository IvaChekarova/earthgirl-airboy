// Heads-up display + win screen. Runs in parallel on top of the active level.
// It listens to the global event bus for gameplay updates and emits NAV_*
// events back when the player presses a UI button. It never touches gameplay
// objects directly, keeping levels and UI decoupled.

import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig.js';
import { gameEvents, EVENTS } from '../utils/events.js';
import { TEX } from '../utils/textures.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    const { width } = this.scale;
    this.hasNext = false;

    // ---- Top HUD bar ----
    this.add.tileSprite(width / 2, 22, width, 44, TEX.WALL_MOSS).setAlpha(0.75).setScrollFactor(0);
    this.add.rectangle(0, 42, width, 3, 0x9bd44d, 0.65).setOrigin(0).setScrollFactor(0);

    this.levelText = this.add
      .text(16, 12, 'Level 1 — Earth Gate', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setScrollFactor(0);

    // Crystal counter (per character + total).
    this.add
      .image(width / 2 - 132, 22, 'tex-crystal-earth')
      .setScrollFactor(0)
      .setScale(0.7);
    this.earthCount = this.add
      .text(width / 2 - 116, 12, '0/0', { fontFamily: 'monospace', fontSize: '18px', color: '#a5d6a7' })
      .setScrollFactor(0);

    this.add
      .image(width / 2 - 16, 22, 'tex-crystal-air')
      .setScrollFactor(0)
      .setScale(0.7);
    this.airCount = this.add
      .text(width / 2, 12, '0/0', { fontFamily: 'monospace', fontSize: '18px', color: '#90caf9' })
      .setScrollFactor(0);

    this.totalText = this.add
      .text(width / 2 + 70, 12, 'Total 0/0', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffd54f'
      })
      .setScrollFactor(0);

    // Always-available Restart button on the HUD.
    this.restartButton = this.makeButton(
      width - 70,
      22,
      'RESTART',
      120,
      32,
      COLORS.BUTTON,
      () => gameEvents.emit(EVENTS.NAV_RESTART)
    );

    // Transient centre message (e.g. "Level 1 — Earth Gate").
    this.message = this.add
      .text(width / 2, 86, '', {
        fontFamily: 'monospace',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.buildWinScreen();
    this.bindEvents();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unbindEvents());
  }

  // -------------------------------------------------------------------------
  // Event wiring
  // -------------------------------------------------------------------------

  bindEvents() {
    this._onLevelStarted = (data) => {
      this.hasNext = !!data.next;
      this.levelText.setText(`Level ${data.number} — ${data.name}`);
      this.hideWinScreen();
      this.flashMessage(`Level ${data.number}\n${data.name}`, 1400);
    };

    this._onCrystal = (data) => {
      const e = data.perElement.earth;
      const a = data.perElement.air;
      this.earthCount.setText(`${e.got}/${e.total}`);
      this.airCount.setText(`${a.got}/${a.total}`);
      this.totalText.setText(`Total ${data.collected}/${data.total}`);
    };

    this._onComplete = (data) => {
      this.hasNext = !!data.next;
      this.showWinScreen(data);
    };

    this._onMessage = (text) => this.flashMessage(text, 1400);
    this._onIntro = (text) => this.showIntro(text);

    gameEvents.on(EVENTS.LEVEL_STARTED, this._onLevelStarted);
    gameEvents.on(EVENTS.CRYSTAL_COLLECTED, this._onCrystal);
    gameEvents.on(EVENTS.LEVEL_COMPLETE, this._onComplete);
    gameEvents.on(EVENTS.SHOW_MESSAGE, this._onMessage);
    gameEvents.on(EVENTS.SHOW_INTRO, this._onIntro);
  }

  unbindEvents() {
    gameEvents.off(EVENTS.LEVEL_STARTED, this._onLevelStarted);
    gameEvents.off(EVENTS.CRYSTAL_COLLECTED, this._onCrystal);
    gameEvents.off(EVENTS.LEVEL_COMPLETE, this._onComplete);
    gameEvents.off(EVENTS.SHOW_MESSAGE, this._onMessage);
    gameEvents.off(EVENTS.SHOW_INTRO, this._onIntro);
  }

  // -------------------------------------------------------------------------
  // Start-of-level instruction overlay
  // -------------------------------------------------------------------------

  showIntro(text) {
    const { width, height } = this.scale;
    this.hideIntro();

    const panel = this.add.container(0, 0).setDepth(90).setScrollFactor(0);
    const dim = this.add.rectangle(0, 0, width, height, 0x05070f, 0.6).setOrigin(0);
    const box = this.add.tileSprite(width / 2, height / 2, 560, 150, TEX.WALL_MOSS).setAlpha(0.98);
    const frame = this.add
      .rectangle(width / 2, height / 2, 560, 150, 0x000000, 0)
      .setStrokeStyle(3, 0xffd54f, 0.9);

    const body = this.add
      .text(width / 2, height / 2 - 14, text, {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#eef3fb',
        align: 'center',
        wordWrap: { width: 510 },
        lineSpacing: 6
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(width / 2, height / 2 + 52, 'click or press any key to start', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#8fa0c0'
      })
      .setOrigin(0.5);

    panel.add([dim, box, frame, body, hint]);
    this.introPanel = panel;

    // Dismiss on input, or auto-dismiss after a few seconds.
    const dismiss = () => this.hideIntro();
    this.input.keyboard.once('keydown', dismiss);
    this.input.once('pointerdown', dismiss);
    this.introTimer = this.time.delayedCall(7000, dismiss);
  }

  hideIntro() {
    if (this.introTimer) {
      this.introTimer.remove(false);
      this.introTimer = null;
    }
    if (this.introPanel) {
      const panel = this.introPanel;
      this.introPanel = null;
      this.tweens.add({
        targets: panel,
        alpha: 0,
        duration: 250,
        onComplete: () => panel.destroy()
      });
    }
  }

  // -------------------------------------------------------------------------
  // Win screen
  // -------------------------------------------------------------------------

  buildWinScreen() {
    const { width, height } = this.scale;
    this.winScreen = this.add.container(0, 0).setDepth(100).setScrollFactor(0).setVisible(false);

    const dim = this.add.rectangle(0, 0, width, height, 0x05070f, 0.78).setOrigin(0);
    const panel = this.add.tileSprite(width / 2, height / 2, 460, 280, TEX.WALL_MOSS).setAlpha(0.98);
    const frame = this.add
      .rectangle(width / 2, height / 2, 460, 280, 0x000000, 0)
      .setStrokeStyle(3, 0x7cfc9a, 0.9);

    this.winTitle = this.add
      .text(width / 2, height / 2 - 96, 'LEVEL COMPLETE!', {
        fontFamily: 'monospace',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#7cfc9a'
      })
      .setOrigin(0.5);

    this.winSubtitle = this.add
      .text(width / 2, height / 2 - 52, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#cfd8e6',
        align: 'center'
      })
      .setOrigin(0.5);

    this.winScreen.add([dim, panel, frame, this.winTitle, this.winSubtitle]);

    // Buttons are (re)built when the screen is shown, because the set depends
    // on whether a next level exists.
    this.winButtons = [];
  }

  showWinScreen(data) {
    const { width, height } = this.scale;

    // Clear any previous buttons.
    this.winButtons.forEach((b) => b.destroy());
    this.winButtons = [];

    this.winSubtitle.setText(
      data.next ? `"${data.name}" cleared — all crystals collected!` : 'You finished every level. Amazing teamwork!'
    );

    const actions = [];
    if (data.next) actions.push(['NEXT LEVEL', COLORS.EARTHGIRL, () => gameEvents.emit(EVENTS.NAV_NEXT)]);
    actions.push(['RESTART', COLORS.AIRBOY, () => gameEvents.emit(EVENTS.NAV_RESTART)]);
    actions.push(['MENU', COLORS.BUTTON, () => gameEvents.emit(EVENTS.NAV_MENU)]);

    // Lay the buttons out in a centred row.
    const bw = 150;
    const gap = 16;
    const totalW = actions.length * bw + (actions.length - 1) * gap;
    let x = width / 2 - totalW / 2 + bw / 2;
    const y = height / 2 + 70;

    actions.forEach(([label, color, onClick]) => {
      const btn = this.makeButton(x, y, label, bw, 44, color, onClick);
      this.winButtons.push(btn);
      this.winScreen.add(btn);
      x += bw + gap;
    });

    this.winScreen.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.winScreen, alpha: 1, duration: 300 });
  }

  hideWinScreen() {
    if (this.winScreen) this.winScreen.setVisible(false);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Build a reusable rectangular button as a container. */
  makeButton(x, y, label, w, h, color, onClick) {
    const container = this.add.container(x, y).setScrollFactor(0);
    const bg = this.add.tileSprite(0, 0, w, h, TEX.PLATFORM_EARTH).setTint(color);
    const rim = this.add.rectangle(0, 0, w, h, 0x000000, 0).setStrokeStyle(2, 0xf4e27a, 0.7);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'monospace',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#0b0f1a'
      })
      .setOrigin(0.5);

    container.add([bg, rim, text]);
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );

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
      bg.setScale(0.95);
      rim.setScale(0.95);
    });
    container.on('pointerup', () => {
      bg.setScale(1.05);
      rim.setScale(1.05);
      onClick();
    });

    return container;
  }

  flashMessage(text, duration = 1400, color = '#ffffff') {
    this.message.setText(text).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.message);
    this.tweens.add({
      targets: this.message,
      alpha: 0,
      delay: duration,
      duration: 500,
      ease: 'Quad.easeIn'
    });
  }
}
