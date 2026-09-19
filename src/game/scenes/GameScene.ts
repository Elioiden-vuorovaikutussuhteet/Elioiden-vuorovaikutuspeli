import Phaser from "phaser";
import Organism from "../entities/organism";

export default class GameScene extends Phaser.Scene {
  private organisms: Organism[] = [];

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("acacia_sprite", "bullhornacacia.png");
    this.load.image("amf_sprite", "amf.png");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.scene.launch("MenuScene");

    this.organisms.push(new Organism(this, centerX, centerY - 200, "acacia"));

    this.events.once("menuClosed", () => {
      this.time.delayedCall(3000, () => {
        this.organisms.push(new Organism(this, centerX, centerY + 200, "amf"));
      });
    });
  }

  update() {}
}
