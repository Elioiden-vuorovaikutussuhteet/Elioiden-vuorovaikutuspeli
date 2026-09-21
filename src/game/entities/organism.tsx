import Phaser from "phaser";
import { organisms } from "../data/organisms";

export function getOrganismData(type: string) {
    const data = organisms.find((item) => item.id === type);
    // Get the specific organisms data from organisms.ts based on the type used in constructor
    
    if (!data) {
        throw new Error(`Organism type "${type}" not found`);
    }
    
    return data;
}

export default class Organism extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, type = "acacia") {
    const organismData = getOrganismData(type);

    super(scene, x, y, organismData.texture);

    this.setScale(organismData.default_scale);

    scene.add.existing(this);
    scene.add
      .text(x, y + this.displayHeight / 2 + 20, organismData.name, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);
  }

  update() {}
}
