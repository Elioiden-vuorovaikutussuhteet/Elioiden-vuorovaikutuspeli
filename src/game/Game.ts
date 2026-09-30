import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import MenuScene from "./scenes/MenuScene";
import TutorialScene from "./scenes/TutorialScene";

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent,
    backgroundColor: "#f9f980",
    scene: [GameScene, MenuScene, TutorialScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
  });
}
