// LEVEL 2 — "Wind Passage"  (PLACEHOLDER / WORK IN PROGRESS)
//
// This is a stub for a teammate to flesh out. It uses the same BaseLevelScene
// machinery as Level 1 so it is already playable in a minimal form: collect one
// crystal each and reach the doors. Replace `buildLevel()` with the real design.

import BaseLevelScene from './BaseLevelScene.js';

export default class Level2Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level2Scene', number: 2, name: 'Wind Passage', next: 'Level3Scene' });
    this.LEVEL_WIDTH = 960;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    const H = this.LEVEL_HEIGHT;

    this.earthSpawn = { x: 80, y: H - 90 };
    this.airSpawn = { x: 140, y: H - 90 };

    this.addGround();
    this.addPlatform(360, H - 140, 160, 24);
    this.addPlatform(600, H - 220, 160, 24);

    this.addCrystal(360, H - 175, 'earth');
    this.addCrystal(600, H - 255, 'air');

    this.addDoor(820, H - 52, 'earth');
    this.addDoor(880, H - 52, 'air');

    this._wipBanner();
  }

  _wipBanner() {
    this.add
      .text(this.LEVEL_WIDTH / 2, 60, 'LEVEL 2 — Wind Passage\n(work in progress)', {
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
