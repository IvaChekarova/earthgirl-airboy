import { makeAssetTexture, preloadReferenceAssets, REF } from './textures.js';

const FRAME_W = 64;
const FRAME_H = 64;
const AB_FRAME_W = 72;
const AB_FRAME_H = 72;
const EG_CELL_W = 310;

const EG = {
  idle: { x: 0, y: 80, w: EG_CELL_W, h: 540 },
  walk1: { x: EG_CELL_W, y: 80, w: EG_CELL_W, h: 540 },
  walk2: { x: EG_CELL_W * 2, y: 80, w: EG_CELL_W, h: 540 },
  walk3: { x: EG_CELL_W * 3, y: 80, w: EG_CELL_W, h: 540 },
  jump: { x: EG_CELL_W * 4, y: 80, w: EG_CELL_W, h: 540 },
  fall: { x: EG_CELL_W * 5, y: 80, w: EG_CELL_W, h: 540 },
  land: { x: EG_CELL_W * 6, y: 80, w: 312, h: 540 }
};

const AB = {
  idle: { x: 10, y: 260, w: 230, h: 390 },
  walk1: { x: 285, y: 260, w: 230, h: 390 },
  walk2: { x: 560, y: 265, w: 230, h: 390 },
  walk3: { x: 810, y: 260, w: 250, h: 395 },
  jump: { x: 1070, y: 230, w: 260, h: 385 },
  fall: { x: 1315, y: 215, w: 220, h: 450 },
  land: { x: 1498, y: 385, w: 235, h: 275 }
};

export function preloadCharacterReference(scene) {
  preloadReferenceAssets(scene);
}

function makeFrame(scene, key, refKey, crop, opts = {}) {
  makeAssetTexture(scene, key, refKey, opts.width ?? FRAME_W, opts.height ?? FRAME_H, {
    crop,
    bgMode: opts.bgMode,
    fillX: opts.fillX ?? 0.95,
    fillY: opts.fillY ?? 0.97,
    offsetX: opts.offsetX ?? 0,
    offsetY: 5 + (opts.offsetY ?? 0)
  });
}

function makeAirboyFrame(scene, key, crop, opts = {}) {
  makeFrame(scene, key, REF.AIRBOY_SPRITESHEET, crop, {
    width: AB_FRAME_W,
    height: AB_FRAME_H,
    bgMode: 'darkOnly',
    fillX: opts.fillX ?? 1,
    fillY: opts.fillY ?? 1,
    offsetX: opts.offsetX ?? 0,
    offsetY: opts.offsetY ?? 4
  });
}

export function generateCharacterTextures(scene) {
  if (scene.textures.exists('eg-idle-0') && scene.textures.exists('ab-idle-0')) return;

  makeFrame(scene, 'eg-idle-0', REF.EARTHGIRL_SPRITESHEET, EG.idle);
  makeFrame(scene, 'eg-idle-1', REF.EARTHGIRL_SPRITESHEET, EG.idle, { offsetY: -1 });
  makeFrame(scene, 'eg-walk-0', REF.EARTHGIRL_SPRITESHEET, EG.walk1);
  makeFrame(scene, 'eg-walk-1', REF.EARTHGIRL_SPRITESHEET, EG.walk2);
  makeFrame(scene, 'eg-walk-2', REF.EARTHGIRL_SPRITESHEET, EG.walk3);
  makeFrame(scene, 'eg-walk-3', REF.EARTHGIRL_SPRITESHEET, EG.walk2, { offsetY: -1 });
  makeFrame(scene, 'eg-jump', REF.EARTHGIRL_SPRITESHEET, EG.jump);
  makeFrame(scene, 'eg-fall', REF.EARTHGIRL_SPRITESHEET, EG.fall);
  makeFrame(scene, 'eg-land', REF.EARTHGIRL_SPRITESHEET, EG.land);

  makeAirboyFrame(scene, 'ab-idle-0', AB.idle);
  makeAirboyFrame(scene, 'ab-idle-1', AB.idle, { offsetY: 4 });
  makeAirboyFrame(scene, 'ab-walk-0', AB.walk1);
  makeAirboyFrame(scene, 'ab-walk-1', AB.walk2);
  makeAirboyFrame(scene, 'ab-walk-2', AB.walk3);
  makeAirboyFrame(scene, 'ab-walk-3', AB.walk2, { offsetY: 4 });
  makeAirboyFrame(scene, 'ab-jump', AB.jump);
  makeAirboyFrame(scene, 'ab-fall', AB.fall);
  makeAirboyFrame(scene, 'ab-land', AB.land);
}

export function registerCharacterAnimations(scene) {
  const add = (key, keys, frameRate, repeat = -1) => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: keys.map((k) => ({ key: k })),
      frameRate,
      repeat
    });
  };

  add('eg-idle', ['eg-idle-0', 'eg-idle-1'], 2);
  add('eg-walk', ['eg-walk-0', 'eg-walk-1', 'eg-walk-2', 'eg-walk-3'], 10);
  add('eg-jump', ['eg-jump'], 1, 0);
  add('eg-fall', ['eg-fall'], 1, 0);
  add('eg-land', ['eg-land'], 1, 0);

  add('ab-idle', ['ab-idle-0', 'ab-idle-1'], 3);
  add('ab-walk', ['ab-walk-0', 'ab-walk-1', 'ab-walk-2', 'ab-walk-3'], 8);
  add('ab-jump', ['ab-jump'], 1, 0);
  add('ab-fall', ['ab-fall'], 1, 0);
  add('ab-land', ['ab-land'], 1, 0);
}
