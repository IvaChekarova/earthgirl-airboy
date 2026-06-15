// LEVEL 3 — "Balance Chamber"  (PLACEHOLDER / WORK IN PROGRESS)
//
// Stub for a teammate. Minimal but playable; replace `buildLevel()` with the
// real "balance" puzzle (e.g. a see-saw platform driven by both characters).
// `next` is null, so completing it returns to the main menu.

import BaseLevelScene from './BaseLevelScene.js';

export default class Level3Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level3Scene', number: 3, name: 'Balance Chamber', next: null });
    this.LEVEL_WIDTH = 960;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    const H = this.LEVEL_HEIGHT;

    this.earthSpawn = { x: 80, y: H - 90 };
    this.airSpawn = { x: 140, y: H - 90 };

    this.addGround();
    this.addPlatform(480, H - 160, 220, 24);

    // A continuously patrolling platform to hint at the future puzzle.
    this.addMovingPlatform({
      x: 480,
      y: H - 280,
      width: 120,
      toX: 760,
      toY: H - 280,
      speed: 90,
      auto: true
    });

    this.addCrystal(480, H - 195, 'earth');
    this.addCrystal(700, H - 100, 'air');

    this.addDoor(820, H - 52, 'earth');
    this.addDoor(880, H - 52, 'air');

    this.add
      .text(this.LEVEL_WIDTH / 2, 60, 'LEVEL 3 — Balance Chamber\n(work in progress)', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffd54f',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);
  }
}
