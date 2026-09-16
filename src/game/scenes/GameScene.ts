import Phaser from "phaser";
import Organism from "../entities/organism"

export default class GameScene extends Phaser.Scene {

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image('acacia_sprite', 'bullhornacacia.png');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.scene.launch("MenuScene");
    this.time.delayedCall(5000, () => {
      console.log("5 seconds passed!");
    });
    this.bullhornacacia = new Organism(this, 800, 500, "acacia")
  }

  update() {}
}
