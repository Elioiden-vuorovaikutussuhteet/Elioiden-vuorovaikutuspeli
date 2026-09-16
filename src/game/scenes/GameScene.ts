import Phaser from "phaser";
import Organism from "../entities/organism"

export default class GameScene extends Phaser.Scene {
  private organisms: Organism[] = [];

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
    this.organisms.push(
      new Organism(this, centerX, centerY, "acacia")
    );
  }

  update() {}
}
