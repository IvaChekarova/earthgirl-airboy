// LEVEL 2 — "Wind Passage"  (one screen, 960x540, no scrolling)
//
// Controls:  Earthgirl = WASD,  Airboy = Arrow keys.
//
// MECHANICS
//   • Wind zones lift ONLY Airboy (Earthgirl is never registered, so the wind
//     never moves her).
//   • Bridges are platforms parked ABOVE a lava pit. While their button is held
//     they slide DOWN to cover the pit; released, they slide back UP.
//   • The gate is a solid bar parked in Wind 2's shaft. While CLOSED it blocks
//     the airflow (Airboy can't rise past it). Button B slides it straight UP to
//     the very top, clearing the passage (it latches open).
//   • Each character collects only their own crystals; a door lights up once its
//     owner has all three.
//   • Lava resets ONLY the character who touches it.
//
// PUZZLE FLOW (each step is enabled by the previous one)
//   1. Both start bottom-left.
//   2. Airboy rides WIND 1 up to platform PA  →  presses BUTTON A.
//   3. BUTTON A lowers BRIDGE 1 over LAVA 1.
//   4. Earthgirl crosses Bridge 1 to the middle floor  →  presses BUTTON B.
//   5. BUTTON B raises the GATE, clearing WIND 2.
//   6. Airboy drops back down, rides WIND 2 up to platform PC  →  presses BUTTON C.
//   7. BUTTON C lowers BRIDGE 2 over LAVA 2.
//   8. Earthgirl crosses Bridge 2 to her exit. Airboy steps to his exit.
//   9. Win when both stand in their own doors with all crystals collected.
//
// Buttons are pressure plates (position based), so a character can be PARKED on
// a plate while the other moves — the puzzle is solvable solo or co-op.

import BaseLevelScene from './BaseLevelScene.js';
import { TEX } from '../utils/textures.js';
import WindZone from '../entities/WindZone.js';
import MovingBridge from '../entities/MovingBridge.js';

export default class Level2Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level2Scene', number: 2, name: 'Wind Passage', next: 'Level3Scene' });
    this.LEVEL_WIDTH = 960;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    this.windZones = [];
    this.solids = []; // bridges + gate (all moving solid platforms)
    this.hazards = [];

    // --- Spawns (bottom-left) ---------------------------------------------
    this.earthSpawn = { x: 55, y: 460 };
    this.airSpawn = { x: 110, y: 460 };

    // --- Floors (top surface y = 500). Two unjumpable lava pits split them --
    this.addPlatform(165, 520, 330, 40, TEX.GROUND); // F_start  x   0 … 330
    this.addPlatform(605, 520, 100, 40, TEX.GROUND); // F_mid    x 555 … 655
    this.addPlatform(920, 520, 80, 40, TEX.GROUND); //  F_exit   x 880 … 960

    // Lava pits — 225px wide, wider than any possible jump, so the bridges are
    // genuinely required. Touching one respawns only that character.
    this.addLava(442, 225); // LAVA 1  x 330 … 555
    this.addLava(767, 225); // LAVA 2  x 655 … 880

    // --- Airboy's platforms (reached only by the winds) -------------------
    // PA is a dead-end: nothing sits above it, so Airboy can only press Button A
    // and drop back down. It is low enough that he cannot jump from it to PC.
    this.addPlatform(180, 362, 140, 24); // PA  x 110 … 250, top 350 (Button A) — clear of Wind 1
    this.addPlatform(445, 212, 200, 24); // PC  x 345 … 545, top 200 (Button C + exit)

    // --- Wind zones (Airboy only) -----------------------------------------
    // Wind 2 stops BELOW the gate (top 230) so its airflow never reaches the
    // platform — Airboy is never grabbed by the wind once he is standing on PC.
    this.addWind(55, 415, 60, 170, 300); //  WIND 1  x 25 … 85  → up to PA
    this.addWind(290, 365, 70, 270, 380); // WIND 2  x 255 … 325, y 230 … 500 → PC

    // --- Moving solids: 2 bridges (park UP, press = DOWN) + 1 gate ---------
    // Bridge: solid DOWN over the lava (activeY 510), parked UP (parkedY 360).
    const bridge1 = this.addSolid({ x: 442, activeY: 510, parkedY: 360, width: 235 });
    const bridge2 = this.addSolid({ x: 767, activeY: 510, parkedY: 360, width: 235 });
    // Gate: sits at PLATFORM level (activeY 215) as the lid of Wind 2's shaft —
    // floating, touching nothing, and capping the airflow. Button B slides it UP
    // and OUT of the way (parkedY 60). It is HELD: released → it drops back.
    const gate = this.addSolid({ x: 290, activeY: 215, parkedY: 60, width: 80, startActive: true });
    gate.setTint(0xff7043);

    // --- Buttons (commented with exactly what each one controls) ----------
    // BUTTON A (Airboy, on PA): hold to lower Bridge 1 over Lava 1.
    this.addButton(180, 350, (pressed) => bridge1.setActive(pressed));
    // BUTTON B (Earthgirl, middle floor): HOLD to lift the gate clearing Wind 2.
    // Releasing it drops the gate back down.
    this.addButton(605, 500, (pressed) => gate.setActive(!pressed));
    // BUTTON C (Airboy, on PC): hold to lower Bridge 2 over Lava 2.
    this.addButton(400, 200, (pressed) => bridge2.setActive(pressed));

    // --- Crystals: GREEN trace Earthgirl's floor route, BLUE trace Airboy's --
    this.addCrystal(60, 466, 'earth'); //  g1  start floor
    this.addCrystal(570, 466, 'earth'); // g2  middle floor (Button B area)
    this.addCrystal(645, 466, 'earth'); // g3  middle floor, by Lava 2

    this.addCrystal(55, 330, 'air'); //    b1  inside Wind 1 (collected while rising)
    this.addCrystal(215, 327, 'air'); //   b2  on PA   (Button A platform)
    this.addCrystal(450, 175, 'air'); //   b3  on PC   (Button C platform)

    // --- Exit doors stand on plain solid floors (no helper zones) ----------
    this.addDoor(925, 468, 'earth'); // on F_exit (reached via Bridge 2)
    this.addDoor(500, 168, 'air'); //   on PC    (reached via Wind 2)

    this.addLabels();
    this.showIntro(
      'Airboy rides the wind up to the buttons.\n' +
        'Each button lowers a bridge for Earthgirl — or lifts the gate. Work together!'
    );
  }

  // -------------------------------------------------------------------------
  // Builder helpers
  // -------------------------------------------------------------------------

  addWind(x, y, width, height, strength) {
    const zone = new WindZone(this, x, y, width, height, { strength });
    this.windZones.push(zone);
    return zone;
  }

  /** A moving solid platform (used for both bridges and the gate). */
  addSolid(opts) {
    const solid = new MovingBridge(this, opts);
    this.solids.push(solid);
    return solid;
  }

  /**
   * Animated lava pool + an overlap sensor for the per-character reset. The
   * visual fills the gap from the ground line down; the SENSOR starts a little
   * lower (y 522) so a deployed bridge — whose walk surface is at the ground
   * line (y 500) — can be stood on safely. You only die by actually falling in.
   */
  addLava(x, width) {
    const top = 500; // ground surface line
    const bottom = 562; // a touch below the floor

    this.add.rectangle(x, (top + bottom) / 2, width, bottom - top, 0xb71c1c, 0.7).setDepth(1);
    const surface = this.add.rectangle(x, top + 4, width, 6, 0xff7043, 0.95).setDepth(1);
    this.tweens.add({
      targets: surface,
      alpha: 0.5,
      y: top + 2,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const sensorTop = 522; // below the bridge/ground walk surface
    const zone = this.add.zone(x, (sensorTop + bottom) / 2, width, bottom - sensorTop);
    this.physics.add.existing(zone, true);
    this.hazards.push(zone);
    return zone;
  }

  // -------------------------------------------------------------------------
  // Collisions — extend the base wiring
  // -------------------------------------------------------------------------

  setupCollisions() {
    super.setupCollisions();

    this.players.forEach((player) => {
      // Bridges and the gate are solid for both characters.
      this.solids.forEach((solid) => this.physics.add.collider(player, solid));
      // Lava resets only the character who touches it.
      this.hazards.forEach((zone) =>
        this.physics.add.overlap(player, zone, () => this.respawnPlayer(player))
      );
    });

    // Wind only affects Airboy.
    this.windZones.forEach((zone) => {
      this.physics.add.overlap(this.airboy, zone, () => zone.applyTo(this.airboy));
    });
  }

  /** Send a single character back to its spawn (keeps its collected crystals). */
  respawnPlayer(player) {
    if (player._respawning) return;
    player._respawning = true;

    player.setVelocity(0, 0);
    const spawn = player === this.airboy ? this.airSpawn : this.earthSpawn;
    player.setPosition(spawn.x, spawn.y);

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

  // -------------------------------------------------------------------------
  // Presentation
  // -------------------------------------------------------------------------

  addLabels() {
    const caption = (x, y, text, color = '#cfd8e6') =>
      this.add
        .text(x, y, text, { fontFamily: 'monospace', fontSize: '10px', color, align: 'center' })
        .setOrigin(0.5)
        .setDepth(6);

    caption(55, 472, '↑ WIND 1', '#90caf9');
    caption(290, 478, '↑ WIND 2', '#90caf9');
    caption(290, 190, 'gate', '#ff8a80');
    caption(442, 478, 'LAVA', '#ffab91');
    caption(767, 478, 'LAVA', '#ffab91');
    caption(180, 338, 'A: lower bridge 1', '#90caf9');
    caption(605, 478, 'B: hold to lift gate', '#a5d6a7');
    caption(400, 188, 'C: lower bridge 2', '#90caf9');
    caption(925, 436, 'Earthgirl exit', '#a5d6a7');
    caption(500, 136, 'Airboy exit', '#90caf9');
  }

  showIntro(text) {
    const { width, height } = this.scale;
    const panel = this.add.container(0, 0).setDepth(60).setScrollFactor(0);

    const dim = this.add.rectangle(0, 0, width, height, 0x05070f, 0.55).setOrigin(0);
    const box = this.add
      .rectangle(width / 2, 110, 680, 100, 0x121a2e, 0.97)
      .setStrokeStyle(2, 0x64b5f6, 0.9);
    const body = this.add
      .text(width / 2, 100, text, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#eef3fb',
        align: 'center',
        wordWrap: { width: 620 },
        lineSpacing: 6
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(width / 2, 148, 'press any key or click to start', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8fa0c0'
      })
      .setOrigin(0.5);

    panel.add([dim, box, body, hint]);

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      this.tweens.add({ targets: panel, alpha: 0, duration: 250, onComplete: () => panel.destroy() });
    };
    this.input.keyboard.once('keydown', close);
    this.input.once('pointerdown', close);
    this.time.delayedCall(6000, close);
  }
}
