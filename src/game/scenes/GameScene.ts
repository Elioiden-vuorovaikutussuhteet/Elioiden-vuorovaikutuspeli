import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {

  constructor() {
    super("GameScene");
  }

  preload() {}

  create() {
    this.scene.launch("MenuScene");
    this.time.delayedCall(5000, () => {
      console.log("5 seconds passed!");
    });
    this.bullhornacacia = this.add.image(512, 384, 'bullhornacacia');
  }

  update() {}
}
