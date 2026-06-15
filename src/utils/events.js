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
  SHOW_MESSAGE: 'show-message'
};

// A single shared EventEmitter instance for the whole app.
export const gameEvents = new Phaser.Events.EventEmitter();
