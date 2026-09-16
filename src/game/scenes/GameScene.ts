import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image('bullhornacacia', 'bullhornacacia.png');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.scene.launch("MenuScene");
    this.time.delayedCall(5000, () => {
      console.log("5 seconds passed!");
    });
    this.bullhornacacia = this.add.image(centerX, centerY, 'bullhornacacia');
    this.bullhornacacia.setScale(1.5);
  }

  update() {}
}
