import menuMusicUrl from '../assets/audio/menu-music.mp3';
import backgroundMusicUrl from '../assets/audio/background-music.mp3';

import jumpUrl from '../assets/audio/jump.mp3';
import stepsUrl from '../assets/audio/steps.mp3';
import buttonUrl from '../assets/audio/button.mp3';
import crystalUrl from '../assets/audio/crystal.mp3';
import gateUrl from '../assets/audio/gate.mp3';
import winUrl from '../assets/audio/win.mp3';
import damageUrl from '../assets/audio/damage.mp3';
import doorUrl from '../assets/audio/door.mp3';

export const MUSIC = {
  MENU: 'music-menu',
  LEVEL: 'music-level'
};

export const SFX = {
  JUMP: 'sfx-jump',
  STEPS: 'sfx-steps',
  CRYSTAL: 'sfx-crystal',
  BUTTON: 'sfx-button',
  GATE: 'sfx-gate',
  WIN: 'sfx-win',
  DAMAGE: 'sfx-damage',
  DOOR: 'sfx-door'
};

const AUDIO_FILES = {
  [MUSIC.MENU]: menuMusicUrl,
  [MUSIC.LEVEL]: backgroundMusicUrl,

  [SFX.JUMP]: jumpUrl,
  [SFX.STEPS]: stepsUrl,
  [SFX.BUTTON]: buttonUrl,
  [SFX.CRYSTAL]: crystalUrl,
  [SFX.GATE]: gateUrl,
  [SFX.WIN]: winUrl,
  [SFX.DAMAGE]: damageUrl,
  [SFX.DOOR]: doorUrl
};

export function preloadAudio(scene) {
  if (!scene || !scene.load || !scene.cache) return;

  Object.entries(AUDIO_FILES).forEach(([key, url]) => {
    if (!scene.cache.audio.exists(key)) {
      scene.load.audio(key, url);
    }
  });
}

// Some source clips run several seconds and drone on long after the action that
// triggered them. Cap how long these one-shots play (ms). A call may override
// with its own `duration`; anything not listed plays to its natural end.
const SFX_MAX_MS = {
  [SFX.DOOR]: 1200,
  [SFX.GATE]: 900
};

// How long `playSfx` will actually let `key` sound for (ms): the cap if one is
// set, otherwise the clip's natural length (with a sensible fallback).
export function sfxDuration(scene, key) {
  if (SFX_MAX_MS[key]) return SFX_MAX_MS[key];
  const buffer = scene?.cache?.audio?.get?.(key);
  const seconds = typeof buffer?.duration === 'number' ? buffer.duration : null;
  return seconds ? Math.round(seconds * 1000) : 1000;
}

export function playSfx(scene, key, config = {}) {
  if (!scene || !scene.sound || !scene.cache) return;
  if (!scene.cache.audio.exists(key)) return;

  const { duration, ...soundConfig } = config;
  const cap = duration ?? SFX_MAX_MS[key];
  const opts = { volume: 0.6, ...soundConfig };

  // No cap → fire-and-forget one-shot (auto-cleaned by Phaser).
  if (!cap) {
    scene.sound.play(key, opts);
    return;
  }

  // Capped → own the instance so we can stop it early, fading out over the last
  // moments so the cut isn't an audible click.
  const sound = scene.sound.add(key, opts);
  sound.play();

  const fade = 140;
  scene.time.delayedCall(Math.max(0, cap - fade), () => {
    if (!sound.isPlaying) return;
    scene.tweens.add({
      targets: sound,
      volume: 0,
      duration: fade,
      onComplete: () => sound.stop()
    });
  });

  sound.once('stop', () => sound.destroy());
  sound.once('complete', () => sound.destroy());
}

export function playMusic(scene, key, config = {}) {
  if (!scene || !scene.sound || !scene.cache) return null;
  if (!scene.cache.audio.exists(key)) return null;

  const existingMusic = scene.sound.get(key);

  if (existingMusic) {
    if (!existingMusic.isPlaying) {
      existingMusic.play({
        loop: true,
        volume: 0.35,
        ...config
      });
    }

    return existingMusic;
  }

  const music = scene.sound.add(key, {
    loop: true,
    volume: 0.35,
    ...config
  });

  music.play();
  return music;
}

export function stopMusic(scene, key) {
  if (!scene || !scene.sound) return;

  const music = scene.sound.get(key);

  if (music && music.isPlaying) {
    music.stop();
  }
}