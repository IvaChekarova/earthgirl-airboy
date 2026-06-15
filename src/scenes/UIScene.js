// Heads-up display that runs in parallel on top of the active level.
// It listens to the global event bus and never touches gameplay directly,
// which keeps the level scenes and the UI nicely decoupled.

import Phaser from 'phaser';
import { gameEvents, EVENTS } from '../utils/events.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    const { width } = this.scale;

    // Top bar background.
    this.add.rectangle(0, 0, width, 44, 0x000000, 0.35).setOrigin(0);

    this.levelText = this.add.text(16, 12, 'Level 1 — Earth Gate', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    });

    this.crystalText = this.add
      .text(width - 16, 12, 'Crystals: 0 / 0', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffd54f'
      })
      .setOrigin(1, 0);

    // Centre message used for "Level complete!" and tips.
    this.message = this.add
      .text(width / 2, 80, '', {
        fontFamily: 'monospace',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.bindEvents();

    // Remove listeners when this scene shuts down to avoid duplicates on
    // restart (the level scenes stop/launch the UI).
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unbindEvents());
  }

  bindEvents() {
    this._onLevelStarted = (data) => {
      this.levelText.setText(`Level ${data.number} — ${data.name}`);
      this.flashMessage(`Level ${data.number}\n${data.name}`, 1400);
    };

    this._onCrystal = (data) => {
      this.crystalText.setText(`Crystals: ${data.collected} / ${data.total}`);
    };

    this._onComplete = (data) => {
      const next = data.next ? 'Get ready for the next level…' : 'You finished the game!';
      this.flashMessage(`LEVEL COMPLETE!\n${next}`, 1600, '#7CFC9A');
    };

    this._onMessage = (text) => this.flashMessage(text, 1400);

    gameEvents.on(EVENTS.LEVEL_STARTED, this._onLevelStarted);
    gameEvents.on(EVENTS.CRYSTAL_COLLECTED, this._onCrystal);
    gameEvents.on(EVENTS.LEVEL_COMPLETE, this._onComplete);
    gameEvents.on(EVENTS.SHOW_MESSAGE, this._onMessage);
  }

  unbindEvents() {
    gameEvents.off(EVENTS.LEVEL_STARTED, this._onLevelStarted);
    gameEvents.off(EVENTS.CRYSTAL_COLLECTED, this._onCrystal);
    gameEvents.off(EVENTS.LEVEL_COMPLETE, this._onComplete);
    gameEvents.off(EVENTS.SHOW_MESSAGE, this._onMessage);
  }

  flashMessage(text, duration = 1400, color = '#ffffff') {
    this.message.setText(text).setColor(color).setAlpha(1).setScale(1);
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
