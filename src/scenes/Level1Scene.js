// LEVEL 1 — "Earth Gate"
// Fully playable. A gentle introduction: a few platforms, two crystals per
// character, a button that activates a moving lift, and the two exit doors.
//
// Co-op hook: the button is on the lower-left ledge. Whoever stands on it
// activates the purple lift on the right so the other character can climb to
// reach the upper crystals and doors.

import BaseLevelScene from './BaseLevelScene.js';

export default class Level1Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level1Scene', number: 1, name: 'Earth Gate', next: 'Level2Scene' });
    this.LEVEL_WIDTH = 1280;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    const W = this.LEVEL_WIDTH;
    const H = this.LEVEL_HEIGHT;

    // Spawn points (read by BaseLevelScene after buildLevel()).
    this.earthSpawn = { x: 80, y: H - 90 };
    this.airSpawn = { x: 150, y: H - 90 };

    // Ground.
    this.addGround();

    // Stepping platforms across the level.
    this.addPlatform(300, H - 120, 180, 24);
    this.addPlatform(520, H - 210, 160, 24);
    this.addPlatform(760, H - 150, 160, 24);
    this.addPlatform(980, H - 250, 200, 24);

    // A high ledge on the left holding the button.
    this.addPlatform(180, H - 230, 140, 24);

    // Button on the left ledge → activates the lift on the right.
    const lift = this.addMovingPlatform({
      x: 1130,
      y: H - 110,
      width: 110,
      toX: 1130,
      toY: H - 300,
      speed: 80,
      auto: false
    });
    this.addButton(180, H - 230 - 12, (pressed) => lift.setActive(pressed));

    // Crystals — earth (green) low, air (blue) require the lift / platforms.
    this.addCrystal(300, H - 150, 'earth');
    this.addCrystal(760, H - 185, 'earth');
    this.addCrystal(520, H - 245, 'air');
    this.addCrystal(980, H - 285, 'air');

    // Exit doors on the top-right platform.
    this.addDoor(1040, H - 282, 'earth');
    this.addDoor(1130, H - 332, 'air');
  }
}
