import referenceUrl from '../assets/references/earthgirl-airboy-reference.png';

const REFERENCE_KEY = 'earthgirl-airboy-reference';
const W = 64;
const H = 64;

const CROPS = {
  airboy: { x: 0, y: 20, w: 635, h: 1020 },
  earthgirl: { x: 575, y: 120, w: 790, h: 910 }
};

const FRAME_KEYS = {
  eg: ['eg-idle-0', 'eg-idle-1', 'eg-walk-0', 'eg-walk-1', 'eg-walk-2', 'eg-walk-3', 'eg-jump', 'eg-land'],
  ab: ['ab-idle-0', 'ab-idle-1', 'ab-walk-0', 'ab-walk-1', 'ab-walk-2', 'ab-walk-3', 'ab-jump', 'ab-land']
};

export function preloadCharacterReference(scene) {
  if (!scene.textures.exists(REFERENCE_KEY)) {
    scene.load.image(REFERENCE_KEY, referenceUrl);
  }
}

function isCheckerPixel(r, g, b, a) {
  if (a < 20) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 5 && r >= 218 && g >= 218 && b >= 218;
}

function removeEdgeCheckerboard(canvas) {
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
    if (!isCheckerPixel(data[p], data[p + 1], data[p + 2], data[p + 3])) return;
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
    const p = idx * 4;
    data[p + 3] = 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  ctx.putImageData(img, 0, 0);
}

function makeCropCanvas(source, crop) {
  const canvas = document.createElement('canvas');
  canvas.width = crop.w;
  canvas.height = crop.h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  removeEdgeCheckerboard(canvas);

  return canvas;
}

function writeTexture(scene, key, cropCanvas) {
  if (scene.textures.exists(key)) scene.textures.remove(key);

  const texture = scene.textures.createCanvas(key, W, H);
  const ctx = texture.getContext();
  const scale = Math.min(W / cropCanvas.width, H / cropCanvas.height);
  const dw = Math.round(cropCanvas.width * scale);
  const dh = Math.round(cropCanvas.height * scale);
  const dx = Math.round((W - dw) / 2);
  const dy = Math.round(H - dh);

  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cropCanvas, dx, dy, dw, dh);
  texture.refresh();
}

export function generateCharacterTextures(scene) {
  if (scene.textures.exists('eg-idle-0') && scene.textures.exists('ab-idle-0')) return;
  if (!scene.textures.exists(REFERENCE_KEY)) return;

  const source = scene.textures.get(REFERENCE_KEY).getSourceImage();
  const earthgirl = makeCropCanvas(source, CROPS.earthgirl);
  const airboy = makeCropCanvas(source, CROPS.airboy);

  FRAME_KEYS.eg.forEach((key) => writeTexture(scene, key, earthgirl));
  FRAME_KEYS.ab.forEach((key) => writeTexture(scene, key, airboy));
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
  add('eg-land', ['eg-land'], 1, 0);

  add('ab-idle', ['ab-idle-0', 'ab-idle-1'], 3);
  add('ab-walk', ['ab-walk-0', 'ab-walk-1', 'ab-walk-2', 'ab-walk-3'], 8);
  add('ab-jump', ['ab-jump'], 1, 0);
  add('ab-land', ['ab-land'], 1, 0);
}
