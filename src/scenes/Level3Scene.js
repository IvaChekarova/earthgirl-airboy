// LEVEL 3 — "Root Chamber"  (Earthgirl's level, one screen 960x540)
//
// Controls:  Earthgirl = WASD,  Airboy = Arrow keys.
//
// SIGNATURE MECHANIC: EARTH SWITCHES (green runes) that ONLY Earthgirl can
// activate. They command the temple — raising stone pillars and growing earth
// bridges. Airboy cannot touch them; he presses the shared buttons.
//
// EVERY control is HELD: the structure it moves snaps back the instant the
// button/switch is released. That means the hero on a control cannot use the
// structure it makes — the OTHER hero does. So the level is a leapfrog: each
// hero, in turn, holds a control while the other advances to the next stable
// platform (where they then hold the next control). Park one character on a
// plate, move the other — classic co-op.
//
// PUZZLE FLOW (a strict A→B→C→D→E leapfrog, each step lands the mover safely):
//   A  SWITCH A (Earthgirl held) → raises PILLAR P1 → AIRBOY climbs it onto the
//        upper ledge UP1 and drops past Wall W1.
//   B  BUTTON B (Airboy held, past W1) → opens WALL W1 → EARTHGIRL walks through
//        to the mid floor.
//   C  SWITCH C (Earthgirl held) → grows EARTH BRIDGE EB1 over the lava →
//        AIRBOY crosses to the right floor.
//   D  BUTTON D (Airboy held) → raises stepping PILLAR P-mid in the lava →
//        EARTHGIRL hops across to the right floor.
//   E  SWITCH E (Earthgirl held) → raises PILLAR P2 → AIRBOY climbs to his air
//        door. Earthgirl then walks to her earth door on the floor.
//   Win: every crystal collected and each hero standing in their own door.
//
// Reusable classes do the work (EarthSwitch / StonePillar / EarthBridge /
// StoneWall); this file is layout + which control drives what.

import BaseLevelScene from './BaseLevelScene.js';
import { TEX } from '../utils/textures.js';
import EarthSwitch from '../entities/EarthSwitch.js';
import StonePillar from '../entities/StonePillar.js';
import EarthBridge from '../entities/EarthBridge.js';
import StoneWall from '../entities/StoneWall.js';

export default class Level3Scene extends BaseLevelScene {
  constructor() {
    super({ key: 'Level3Scene', number: 3, name: 'Root Chamber', next: null });
    this.LEVEL_WIDTH = 960;
    this.LEVEL_HEIGHT = 540;
  }

  buildLevel() {
    // Level-3 collections, wired in setupCollisions / update below.
    this.solids = []; // pillars, bridges, walls (toggle their own collision)
    this.pillars = []; // moving pillars, driven each frame by tick()
    this.earthSwitches = [];
    this.hazards = [];

    // --- Spawns (bottom-left, clear of Switch A) --------------------------
    this.earthSpawn = { x: 40, y: 460 };
    this.airSpawn = { x: 80, y: 460 };

    // --- Floor: left floor, central lava, right floor ---------------------
    this.addPlatform(210, 520, 420, 40, TEX.GROUND); // F_left   x   0 … 420
    this.addPlatform(770, 520, 380, 40, TEX.GROUND); // F_right  x 580 … 960
    this.addLava(500, 160); //                          LAVA pit  x 420 … 580

    // Airboy's upper ledge (over Wall W1) and his exit platform (over the floor).
    this.addPlatform(330, 332, 150, 24); // UP1  x 255 … 405, top 320 (above W1)
    this.addPlatform(700, 332, 140, 24); // AP   x 630 … 770, top 320 (air door)

    // --- Temple structures (each driven by a HELD control) ----------------
    const pillar1 = this.addStonePillar({ x: 210, height: 90 }); //         P1  → top 410
    const wall1 = this.addStoneWall({ x: 290, topY: 355 }); //              W1  (blocks floor)
    const bridge1 = this.addEarthBridge({ x: 420, y: 509, width: 160 }); // EB1 across the lava
    // Stepping stone in the lava — parks BELOW the surface so it can't be used
    // until Airboy raises it with Button D.
    const pMid = this.addStonePillar({ x: 500, height: 60, width: 60, parkedTop: 545 });
    const pillar2 = this.addStonePillar({ x: 820, height: 90 }); //         P2  → top 410 (clear of Switch E)

    // --- Earth Switches (EARTHGIRL ONLY, all HELD → snap back on release) --
    // A: raises P1 so Airboy can climb up and over Wall W1.
    this.addEarthSwitch(130, 500, { onChange: (on) => pillar1.setRaised(on) });
    // C: grows the earth bridge so Airboy can cross the lava.
    this.addEarthSwitch(360, 500, { onChange: (on) => bridge1.setFormed(on) });
    // E: raises the final pillar so Airboy can climb to his air door.
    this.addEarthSwitch(900, 500, { onChange: (on) => pillar2.setRaised(on) });

    // --- Shared buttons (AIRBOY's role, all HELD → snap back on release) ---
    // B: lives UP on the ledge — Airboy climbs the pillar, then holds it here to
    //    open Wall W1 so Earthgirl can walk through below.
    this.addButton(350, 320, (pressed) => wall1.setOpen(pressed), TEX.BUTTON_AIR);
    // D: raises the stepping pillar so Earthgirl can hop across the lava.
    // (kept clear to the right of the earth-exit door)
    this.addButton(740, 500, (pressed) => pMid.setRaised(pressed), TEX.BUTTON_AIR);

    // --- Crystals: GREEN on Earthgirl's route, BLUE on Airboy's -----------
    this.addCrystal(110, 466, 'earth'); // g1  start floor
    this.addCrystal(340, 466, 'earth'); // g2  mid floor (past Wall 1)
    this.addCrystal(860, 466, 'earth'); // g3  right floor (by Switch E)

    this.addCrystal(290, 297, 'air'); //   b1  on the upper ledge UP1
    this.addCrystal(620, 466, 'air'); //   b2  right floor (after the bridge)
    this.addCrystal(680, 297, 'air'); //   b3  on the air-door platform AP

    // --- Exit doors: earth on the floor, air up on platform AP ------------
    this.addDoor(640, 468, 'earth'); // floor, right side
    this.addDoor(700, 288, 'air'); //   on AP (only reachable after Switch E)

  }

  // -------------------------------------------------------------------------
  // Builder helpers for the temple objects
  // -------------------------------------------------------------------------

  addEarthSwitch(x, y, opts) {
    const sw = new EarthSwitch(this, x, y, opts);
    this.earthSwitches.push(sw);
    return sw;
  }

  addStonePillar(opts) {
    const p = new StonePillar(this, opts);
    this.solids.push(p); // for player colliders
    this.pillars.push(p); // for per-frame movement
    return p;
  }

  addEarthBridge(opts) {
    const b = new EarthBridge(this, opts);
    this.solids.push(b);
    return b;
  }

  addStoneWall(opts) {
    const w = new StoneWall(this, opts);
    this.solids.push(w);
    return w;
  }

  /** Lava pit: visual fills from the ground line down; sensor sits a little
   *  lower so a formed bridge (surface at the ground line) is safe to walk on. */
  addLava(x, width) {
    // Surface sits a little below the ground line so a formed bridge (top at
    // the ground line, y 500) clearly reads as being ABOVE the lava.
    const top = 500;
    const bottom = 546;
    const lava = this.add.tileSprite(x, (top + bottom) / 2, width, bottom - top, TEX.LAVA).setDepth(0);
    const surface = this.add.rectangle(x, top + 4, width, 7, 0xffc400, 0.35).setDepth(0);
    this.tweens.add({
      targets: lava,
      tilePositionX: 96,
      duration: 1800,
      repeat: -1,
      ease: 'Linear'
    });
    this.tweens.add({
      targets: surface,
      alpha: 0.5,
      y: top + 2,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const sensorTop = 522;
    const sensorBottom = 562;
    const zone = this.add.zone(x, (sensorTop + sensorBottom) / 2, width, sensorBottom - sensorTop);
    this.physics.add.existing(zone, true);
    this.hazards.push(zone);
    return zone;
  }

  // -------------------------------------------------------------------------
  // Collisions & per-frame switch resolution
  // -------------------------------------------------------------------------

  setupCollisions() {
    super.setupCollisions();

    this.players.forEach((player) => {
      // Pillars/bridges/walls are solid only while their body is enabled.
      this.solids.forEach((solid) => this.physics.add.collider(player, solid));
      // Lava resets only the character who falls in.
      this.hazards.forEach((zone) =>
        this.physics.add.overlap(player, zone, () => this.respawnPlayer(player))
      );
    });

    // Earth Switches respond ONLY to Earthgirl — Airboy can never trigger them.
    this.earthSwitches.forEach((sw) => {
      this.physics.add.overlap(this.earthgirl, sw, () => sw.markTouched());
    });
  }

  update(time, delta) {
    super.update();
    if (this.completed) return;
    this.earthSwitches.forEach((sw) => sw.refresh());
    this.pillars.forEach((p) => p.tick(delta));
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

    caption(130, 478, 'A · hold (EG)', '#a5d6a7');
    caption(210, 470, 'pillar', '#bcaaa4');
    caption(290, 330, 'WALL', '#bcaaa4');
    caption(350, 300, 'B · hold (AB)', '#90caf9');
    caption(360, 478, 'C (EG)', '#a5d6a7');
    caption(500, 476, 'LAVA', '#ffab91');
    caption(740, 478, 'D · hold (AB)', '#90caf9');
    caption(900, 478, 'E (EG)', '#a5d6a7');
    caption(640, 430, 'earth exit', '#a5d6a7');
    caption(700, 300, 'air exit', '#90caf9');
  }

  showIntro(text) {
    const { width, height } = this.scale;
    const panel = this.add.container(0, 0).setDepth(60).setScrollFactor(0);

    const dim = this.add.rectangle(0, 0, width, height, 0x05070f, 0.55).setOrigin(0);
    const box = this.add
      .rectangle(width / 2, 110, 680, 100, 0x14210f, 0.97)
      .setStrokeStyle(2, 0x66bb6a, 0.9);
    const body = this.add
      .text(width / 2, 100, text, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#eef7ea',
        align: 'center',
        wordWrap: { width: 620 },
        lineSpacing: 6
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(width / 2, 150, 'press any key or click to start', {
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
