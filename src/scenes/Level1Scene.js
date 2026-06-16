// LEVEL 1 — "Earth Gate"  (fully playable)
//
// Controls:  Earthgirl = WASD,  Airboy = Arrow keys.
//
// The co-op puzzle (each character is useless without the other):
//
//   1. EARTHGIRL stands on Button A on the left  ──► opens the GATE.
//   2. AIRBOY walks through the open gate to the right side
//        and stands on Button B                  ──► raises a LIFT on the left.
//   3. EARTHGIRL rides the lift up to her exit ledge (it only rises while
//        Airboy holds Button B), steps onto solid ground and collects her
//        last crystal.
//   4. AIRBOY climbs the steps to his own exit ledge.
//   5. With all crystals collected, BOTH stand in their exit gates  ──► WIN.
//
// Earthgirl can only collect the 3 GREEN crystals, Airboy only the 3 BLUE ones
// (enforced by BaseLevelScene's per-element overlap wiring).

import BaseLevelScene from './BaseLevelScene.js';
import { TEX } from '../utils/textures.js';

export default class Level1Scene extends BaseLevelScene {
  constructor() {
    super({
      key: 'Level1Scene',
      number: 1,
      name: 'Earth Gate',
      next: 'Level2Scene',
      intro:
        'Earthgirl opens the gate. Airboy powers the lift.\n' +
        'Collect all crystals and reach both exits.'
    });
    // The whole level fits in a single 960×540 screen — no camera scrolling.
    this.LEVEL_WIDTH = 960;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    const H = this.LEVEL_HEIGHT; // 540; ground surface sits at y = 500

    // --- Spawn points (read by BaseLevelScene after buildLevel) ------------
    this.earthSpawn = { x: 60, y: H - 100 };
    this.airSpawn = { x: 115, y: H - 100 };

    // --- Static geometry ---------------------------------------------------
    // The floor is split by a small danger pit in the middle. Surface y ≈ 500.
    this.addPlatform(180, 520, 360, 40, TEX.GROUND); // left floor:  x 0 … 360
    this.addPlatform(690, 520, 540, 40, TEX.GROUND); // right floor: x 420 … 960

    // The pit is a pool of water in a 60px-wide gap (x 360 … 420). Falling in
    // respawns ONLY the character who fell — the other player keeps playing.
    // Surface sits at the floor line (y ≈ 500).
    this.addHazard(390, 532, 60, 64, 'water');

    // Earthgirl's high exit ledge (left). Only reachable via the lift.
    this.addPlatform(110, 190, 190, 24); // left 15 … right 205, top 178

    // Airboy's climb to his exit ledge (right).
    this.addPlatform(680, 420, 120, 24); // step,  top 408
    this.addPlatform(850, 330, 180, 24); // ledge, top 318 (left 760 … 940)

    // --- The GATE: blocks the corridor until Button A opens it -------------
    const gate = this.addGate(460, H - 140, 28, 200); // sits on the floor

    // --- The LIFT: rises for Earthgirl only while Button B is held ---------
    // Flush against the exit ledge's right edge (x 205) so she can step across.
    const lift = this.addMovingPlatform({
      x: 260,
      y: H - 70, // start near the floor (top ≈ 460)
      width: 110,
      toX: 260,
      toY: 188, // rises until its top (≈178) meets the ledge
      speed: 130, // max speed; the lift eases in/out for a smooth, readable ride
      mode: 'lift'
    });

    // --- Buttons -----------------------------------------------------------
    // Button A (left of the gate): Earthgirl holds it to open the gate.
    this.addButton(160, H - 40, (pressed) => (pressed ? gate.open() : gate.close()));

    // Button B (right of the gate): Airboy holds it to raise Earthgirl's lift.
    this.addButton(560, H - 40, (pressed) => lift.engage(pressed));

    // --- Crystals: 3 green (earth) + 3 blue (air) --------------------------
    // Green — all on Earthgirl's side, spread along her route up the lift.
    this.addCrystal(130, H - 64, 'earth'); // floor, before (left of) the lift
    this.addCrystal(260, 330, 'earth'); //    on the lift's upward path
    this.addCrystal(150, 150, 'earth'); //    on the high exit ledge

    // Blue — on Airboy's side; all three are beyond the gate.
    this.addCrystal(600, H - 64, 'air'); // floor beyond the gate
    this.addCrystal(720, H - 64, 'air'); // floor beyond the gate
    this.addCrystal(800, 290, 'air'); //    on the high exit ledge

    // --- Exit gates (one per character) ------------------------------------
    this.addDoor(90, 146, 'earth'); //  on Earthgirl's ledge
    this.addDoor(890, 286, 'air'); //   on Airboy's ledge

    this.addHints();
  }

  /** World-space labels so first-time players know what each object does. */
  addHints() {
    // A coloured badge keyed to the character that uses it.
    const badge = (x, y, text, bg) =>
      this.add
        .text(x, y, text, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#0b0f1a',
          backgroundColor: bg,
          padding: { x: 6, y: 4 },
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(6);

    // Plain caption (no background) for neutral signs.
    const caption = (x, y, text, color = '#cfd8e6') =>
      this.add
        .text(x, y, text, { fontFamily: 'monospace', fontSize: '11px', color, align: 'center' })
        .setOrigin(0.5)
        .setDepth(6);

    const GREEN = '#a5d6a7';
    const BLUE = '#90caf9';

    // Button labels (the main request).
    badge(160, 446, 'BUTTON A\nEarthgirl → open gate', GREEN);
    badge(560, 446, 'BUTTON B\nAirboy → raise lift', BLUE);

    // Supporting captions.
    caption(460, 250, 'GATE', '#ffe0a0');
    caption(260, 300, '▲ lift', BLUE);
    caption(390, 470, 'WATER', '#90caf9');
    badge(90, 120, 'Earthgirl exit', GREEN);
    badge(890, 250, 'Airboy exit', BLUE);
  }
}
