// A tiny global event bus used to communicate between the gameplay scenes and
// the parallel UIScene without tightly coupling them. Level scenes emit; the
// UIScene listens.
//
// Usage:
//   import { gameEvents, EVENTS } from '../utils/events.js';
//   gameEvents.emit(EVENTS.CRYSTAL_COLLECTED, { collected, total });

import Phaser from 'phaser';

export const EVENTS = {
  LEVEL_STARTED: 'level-started',
  CRYSTAL_COLLECTED: 'crystal-collected',
  PLAYER_AT_DOOR: 'player-at-door',
  LEVEL_COMPLETE: 'level-complete',
  SHOW_MESSAGE: 'show-message',
  SHOW_INTRO: 'show-intro',

  // Navigation requests emitted by the UI (win screen / HUD buttons) and
  // handled by the active level scene, which owns scene transitions.
  NAV_RESTART: 'nav-restart',
  NAV_NEXT: 'nav-next',
  NAV_MENU: 'nav-menu'
};

// A single shared EventEmitter instance for the whole app.
export const gameEvents = new Phaser.Events.EventEmitter();
