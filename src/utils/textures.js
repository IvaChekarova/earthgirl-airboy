// Runtime texture generation from the official individual PNG references in
// src/assets/references. Gameplay objects keep their existing Arcade bodies;
// these textures are visual replacements only.

import airboySpritesheetUrl from '../assets/references/airboy-spritesheet.png';
import airBtnUrl from '../assets/references/airbtn.png';
import airDoorUrl from '../assets/references/airdoor.png';
import boxUrl from '../assets/references/box.png';
import bridgeUrl from '../assets/references/bridge.png';
import cloudUrl from '../assets/references/cloud.png';
import earthBtnUrl from '../assets/references/earthbtn.png';
import earthDoorUrl from '../assets/references/earthdoor.png';
import earthgirlSpritesheetUrl from '../assets/references/earthgirl-spritesheet.png';
import gateUrl from '../assets/references/gate.png';
import gemsUrl from '../assets/references/gems.png';
import lavaUrl from '../assets/references/lava.png';
import liftUrl from '../assets/references/lift.png';
import pillarUrl from '../assets/references/pillar.png';
import specialEarthBtnUrl from '../assets/references/specialearthbtn.png';
import platformUrl from '../assets/references/platform.png';
import wallUrl from '../assets/references/wall.png';
import windGeneratorUrl from '../assets/references/windgenerator.png';

export const REF = {
  AIRBOY: 'ref-airboy',
  AIRBOY_SPRITESHEET: 'ref-airboy-spritesheet',
  AIR_BUTTON: 'ref-airbtn',
  AIR_DOOR: 'ref-airdoor',
  BOX: 'ref-box',
  BRIDGE: 'ref-bridge',
  CLOUD: 'ref-cloud',
  EARTH_BUTTON: 'ref-earthbtn',
  EARTH_SWITCH: 'ref-specialearthbtn',
  EARTH_DOOR: 'ref-earthdoor',
  EARTHGIRL: 'ref-earthgirl',
  EARTHGIRL_SPRITESHEET: 'ref-earthgirl-spritesheet',
  GATE: 'ref-gate',
  GEMS: 'ref-gems',
  LAVA: 'ref-lava',
  LIFT: 'ref-lift',
  PILLAR: 'ref-pillar',
  PLATFORM: 'ref-platform',
  WALL: 'ref-wall',
  WIND_GENERATOR: 'ref-windgenerator'
};

const REF_URLS = {
  [REF.AIRBOY]: airboySpritesheetUrl,
  [REF.AIRBOY_SPRITESHEET]: airboySpritesheetUrl,
  [REF.AIR_BUTTON]: airBtnUrl,
  [REF.AIR_DOOR]: airDoorUrl,
  [REF.BOX]: boxUrl,
  [REF.BRIDGE]: bridgeUrl,
  [REF.CLOUD]: cloudUrl,
  [REF.EARTH_BUTTON]: earthBtnUrl,
  [REF.EARTH_SWITCH]: specialEarthBtnUrl,
  [REF.EARTH_DOOR]: earthDoorUrl,
  [REF.EARTHGIRL]: earthgirlSpritesheetUrl,
  [REF.EARTHGIRL_SPRITESHEET]: earthgirlSpritesheetUrl,
  [REF.GATE]: gateUrl,
  [REF.GEMS]: gemsUrl,
  [REF.LAVA]: lavaUrl,
  [REF.LIFT]: liftUrl,
  [REF.PILLAR]: pillarUrl,
  [REF.PLATFORM]: platformUrl,
  [REF.WALL]: wallUrl,
  [REF.WIND_GENERATOR]: windGeneratorUrl
};

export function preloadReferenceAssets(scene) {
  Object.entries(REF_URLS).forEach(([key, url]) => {
    if (!scene.textures.exists(key)) scene.load.image(key, url);
  });
}

// Backwards-compatible name used by the scenes.
export const preloadDesignScheme = preloadReferenceAssets;

function makeCanvasTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, width, height);
  draw(ctx, width, height);
  texture.refresh();
}

function backgroundLike(r, g, b, a, mode = 'neutral') {
  if (a < 18) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  if (mode === 'darkOnly') {
    return r < 42 && g < 42 && b < 42;
  }
  if (mode === 'checker') {
    return saturation < 18 && r > 205 && g > 205 && b > 205;
  }
  // Official references use transparent, dark, or gray studio backgrounds.
  return saturation < 32 || (r < 42 && g < 42 && b < 42);
}

function removeEdgeBackground(canvas, mode = 'neutral') {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const img = ctx.getImageData(0, 0, width, height);
  const { data } = img;
  const seen = new Uint8Array(width * height);
  const stack = [];

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (seen[idx]) return;
    const p = idx * 4;
    if (!backgroundLike(data[p], data[p + 1], data[p + 2], data[p + 3], mode)) return;
    seen[idx] = 1;
    stack.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (stack.length) {
    const idx = stack.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    data[idx * 4 + 3] = 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  ctx.putImageData(img, 0, 0);
}

function trimCanvas(canvas, padding = 2) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return canvas;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

function sourceCanvas(scene, refKey, crop = null, opts = {}) {
  if (!scene.textures.exists(refKey)) return null;
  const source = scene.textures.get(refKey).getSourceImage();
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.w ?? source.width;
  const sh = crop?.h ?? source.height;
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  canvas.getContext('2d').drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  if (opts.removeBg !== false) removeEdgeBackground(canvas, opts.bgMode);
  return opts.trim === false ? canvas : trimCanvas(canvas, opts.padding ?? 2);
}

export function makeAssetTexture(scene, key, refKey, width, height, opts = {}) {
  if (scene.textures.exists(key)) return;
  const src = sourceCanvas(scene, refKey, opts.crop, opts);
  if (!src) return;

  makeCanvasTexture(scene, key, width, height, (ctx, w, h) => {
    const scale = opts.cover
      ? Math.max(w / src.width, h / src.height)
      : Math.min((w * (opts.fillX ?? 1)) / src.width, (h * (opts.fillY ?? 1)) / src.height);
    const dw = Math.round(src.width * scale);
    const dh = Math.round(src.height * scale);
    const dx = Math.round((w - dw) / 2 + (opts.offsetX ?? 0));
    const dy = Math.round((h - dh) / 2 + (opts.offsetY ?? 0));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, dx, dy, dw, dh);
  });
}

export const TEX = {
  EARTHGIRL: 'tex-earthgirl',
  AIRBOY: 'tex-airboy',
  CRYSTAL_EARTH: 'tex-crystal-earth',
  CRYSTAL_AIR: 'tex-crystal-air',
  DOOR_EARTH: 'tex-door-earth',
  DOOR_AIR: 'tex-door-air',
  BUTTON: 'tex-button',
  BUTTON_PRESSED: 'tex-button-pressed',
  BUTTON_EARTH: 'tex-button-earth',
  BUTTON_AIR: 'tex-button-air',
  PLATFORM: 'tex-platform-earth',
  GROUND: 'tex-ground-earth',
  PLATFORM_EARTH: 'tex-platform-earth',
  GROUND_EARTH: 'tex-ground-earth',
  PLATFORM_WIND: 'tex-platform-wind',
  GROUND_WIND: 'tex-ground-wind',
  PLATFORM_ROOT: 'tex-platform-root',
  GROUND_ROOT: 'tex-ground-root',
  MOVING_PLATFORM: 'tex-moving-platform',
  MOVING_PLATFORM_WIND: 'tex-moving-platform-wind',
  GATE: 'tex-gate',
  EARTH_BRIDGE: 'tex-earth-bridge',
  WALL_NORMAL: 'tex-wall-normal',
  WALL_CORNER: 'tex-wall-corner',
  WALL_EDGE: 'tex-wall-edge',
  WALL_BROKEN: 'tex-wall-broken',
  WALL_MOSS: 'tex-wall-moss',
  WALL_WIND: 'tex-wall-wind',
  PILLAR: 'tex-stone-pillar',
  BOX: 'tex-stone-box',
  CLOUD: 'tex-cloud',
  EARTH_SWITCH: 'tex-earth-switch',
  LAVA: 'tex-lava',
  WIND_GENERATOR: 'tex-windgenerator',
  WIND_STREAM: 'tex-wind-stream',
  SHADOW: 'tex-soft-shadow',
  PIXEL: 'tex-pixel'
};

export function getTempleTextures(theme = 'earth') {
  if (theme === 'wind') {
    return {
      platform: TEX.PLATFORM_WIND,
      ground: TEX.GROUND_WIND,
      moving: TEX.MOVING_PLATFORM_WIND,
      wall: TEX.WALL_WIND
    };
  }
  if (theme === 'root') {
    return {
      platform: TEX.PLATFORM_ROOT,
      ground: TEX.GROUND_ROOT,
      moving: TEX.MOVING_PLATFORM,
      wall: TEX.WALL_MOSS
    };
  }
  return {
    platform: TEX.PLATFORM_EARTH,
    ground: TEX.GROUND_EARTH,
    moving: TEX.MOVING_PLATFORM,
    wall: TEX.WALL_NORMAL
  };
}

export function generatePlaceholderTextures(scene) {
  makeAssetTexture(scene, TEX.PLATFORM_EARTH, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.GROUND_EARTH, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.PLATFORM_WIND, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.GROUND_WIND, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.PLATFORM_ROOT, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.GROUND_ROOT, REF.PLATFORM, 128, 52, { cover: true });
  makeAssetTexture(scene, TEX.MOVING_PLATFORM, REF.LIFT, 128, 42, {
    crop: { x: 150, y: 265, w: 1410, h: 395 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.1
  });
  makeAssetTexture(scene, TEX.MOVING_PLATFORM_WIND, REF.LIFT, 128, 42, {
    crop: { x: 150, y: 265, w: 1410, h: 395 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.1
  });
  makeAssetTexture(scene, TEX.GATE, REF.GATE, 42, 180, {
    crop: { x: 53, y: 26, w: 620, h: 2126 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.02
  });
  makeAssetTexture(scene, TEX.EARTH_BRIDGE, REF.BRIDGE, 192, 44);
  makeAssetTexture(scene, TEX.WALL_NORMAL, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  makeAssetTexture(scene, TEX.WALL_CORNER, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  makeAssetTexture(scene, TEX.WALL_EDGE, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  makeAssetTexture(scene, TEX.WALL_BROKEN, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  makeAssetTexture(scene, TEX.WALL_MOSS, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  makeAssetTexture(scene, TEX.WALL_WIND, REF.WALL, 128, 85, { removeBg: false, trim: false, cover: true });
  // Pillar art is a tall stone column; box art is a square stone block. Both are
  // drawn as scaled images (not tiled), so the frame just needs to match the
  // art's aspect to avoid transparent padding.
  // bgMode 'darkOnly' so only the black backdrop is removed — the default mode
  // would strip the low-saturation grey stone too, leaving just the ivy. Frame
  // ratios match each art's real content (pillar 0.75:1, box 1.33:1) so there is
  // no transparent padding that would make them float above the ground.
  makeAssetTexture(scene, TEX.PILLAR, REF.PILLAR, 72, 96, {
    crop: { x: 258, y: 79, w: 428, h: 1534 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.02
  });
  makeAssetTexture(scene, TEX.BOX, REF.BOX, 80, 60, {
    crop: { x: 123, y: 143, w: 1003, h: 961 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.02
  });
  makeAssetTexture(scene, TEX.EARTH_SWITCH, REF.EARTH_SWITCH, 96, 36, {
    crop: { x: 316, y: 183, w: 1192, h: 525 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.08
  });
  makeAssetTexture(scene, TEX.CLOUD, REF.CLOUD, 120, 60, {
    crop: { x: 345, y: 253, w: 846, h: 451 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.05
  });
  makeAssetTexture(scene, TEX.DOOR_EARTH, REF.EARTH_DOOR, 58, 76, {
    crop: { x: 388, y: 160, w: 760, h: 760 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.0
  });
  makeAssetTexture(scene, TEX.DOOR_AIR, REF.AIR_DOOR, 58, 76, {
    crop: { x: 416, y: 158, w: 742, h: 745 },
    bgMode: 'darkOnly',
    padding: 0,
    fillY: 1.0
  });
  makeAssetTexture(scene, TEX.BUTTON, REF.EARTH_BUTTON, 64, 24, { cover: true });
  makeAssetTexture(scene, TEX.BUTTON_PRESSED, REF.EARTH_BUTTON, 64, 18, { cover: true });
  makeAssetTexture(scene, TEX.BUTTON_EARTH, REF.EARTH_BUTTON, 64, 24, { cover: true });
  makeAssetTexture(scene, TEX.BUTTON_AIR, REF.AIR_BUTTON, 64, 24, { cover: true });
  makeAssetTexture(scene, TEX.CRYSTAL_EARTH, REF.GEMS, 36, 42, { crop: { x: 45, y: 175, w: 720, h: 625 } });
  makeAssetTexture(scene, TEX.CRYSTAL_AIR, REF.GEMS, 36, 42, { crop: { x: 775, y: 175, w: 720, h: 625 } });
  makeAssetTexture(scene, TEX.LAVA, REF.LAVA, 192, 38, { crop: { x: 240, y: 350, w: 1050, h: 310 }, fillY: 1.2 });
  // The generator art is a wide ~2:1 vent; keep the frame that ratio so there is
  // no transparent padding (which would otherwise leave a gap under it).
  makeAssetTexture(scene, TEX.WIND_GENERATOR, REF.WIND_GENERATOR, 96, 50);

  makeCanvasTexture(scene, TEX.PIXEL, 1, 1, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);
  });
  // A soft, edge-faded column of vertical streaks. Used as a vertically
  // scrolling tileSprite so the wind reads as flowing air, not a solid box.
  makeCanvasTexture(scene, TEX.WIND_STREAM, 64, 128, (ctx, w, h) => {
    // Horizontal falloff: transparent at the sides, soft in the middle.
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(179,229,252,0)');
    grad.addColorStop(0.5, 'rgba(179,229,252,0.20)');
    grad.addColorStop(1, 'rgba(179,229,252,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // A few brighter streaks with gaps, so scrolling them looks like gusts.
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    const streaks = [
      [16, 0.16, 8, 70],
      [30, 0.3, 40, 122],
      [40, 0.14, 0, 54],
      [50, 0.22, 60, 118]
    ];
    streaks.forEach(([sx, a, y0, y1]) => {
      ctx.strokeStyle = `rgba(225,245,254,${a})`;
      ctx.beginPath();
      ctx.moveTo(sx, y0);
      ctx.lineTo(sx, y1);
      ctx.stroke();
    });
  });
  makeCanvasTexture(scene, TEX.SHADOW, 96, 18, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.26)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
}
