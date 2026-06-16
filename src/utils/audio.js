// Sound-effect placeholder hooks.
//
// The game ships without audio assets, so `playSfx` is a safe no-op until real
// sounds are added. To enable a sound, drop a file in src/assets/audio/ and load
// it in a scene's preload(), e.g.:
//
//   preload() {
//     this.load.audio(SFX.JUMP, 'src/assets/audio/jump.mp3');
//   }
//
// Once a clip with the matching key is in the cache, every existing
// `playSfx(scene, SFX.JUMP)` call below will start playing it automatically —
// no other code changes required.

export const SFX = {
  JUMP: 'sfx-jump',
  CRYSTAL: 'sfx-crystal',
  BUTTON: 'sfx-button',
  GATE: 'sfx-gate',
  WIN: 'sfx-win'
};

/**
 * Play a sound effect if its asset has been loaded; otherwise do nothing.
 * @param {Phaser.Scene} scene
 * @param {string} key  one of SFX.*
 * @param {object} [config]  optional Phaser sound config (volume, rate, …)
 */
export function playSfx(scene, key, config) {
  if (!scene || !scene.sound) return;
  // Only play when a real clip is present, so the placeholder stays silent.
  if (scene.cache.audio.exists(key)) {
    scene.sound.play(key, config);
  }
}
