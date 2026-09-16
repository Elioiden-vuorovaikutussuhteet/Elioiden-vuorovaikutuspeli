import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import MenuScene from './scenes/MenuScene';

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent,
    backgroundColor: '#adadac',
    scene: [GameScene, MenuScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
  });
}