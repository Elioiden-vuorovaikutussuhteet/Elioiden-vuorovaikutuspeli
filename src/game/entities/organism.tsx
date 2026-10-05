import Phaser from "phaser";
import { organisms } from "../data/organisms";
import type { OrganismData } from "../data/organisms";

export function getOrganismData(type: string) {
    const data = organisms.find((item) => item.id === type);
    // Get the specific organisms data from organisms.ts based on the type used in constructor
    
    if (!data) {
        throw new Error(`Organism type "${type}" not found`);
    }
    
    return data;
}

export default class Organism extends Phaser.GameObjects.Sprite {
  public readonly organismData: OrganismData;

  public readonly nameText: Phaser.GameObjects.Text;

  public HP = 100;

  private baseScale = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, type = "acacia") {
    super(scene, x, y, getOrganismData(type).texture);
    
    const organismData = getOrganismData(type);

    this.organismData = organismData;

    this.baseScale = organismData.default_scale;
    
    this.setScale(organismData.default_scale);

    this.setInteractive();

    this.enableFilters();

    this.on("pointerdown", () => {
      this.emit("organismSelected", this);
    });

    const glow = this.filters!.internal.addGlow(
      0xffffff,
      5,
      0,
      1,
      false,
      10,
      10
    );
    
    glow.active = false;
    
    this.on("pointerover", () => {
      glow.active = true;
    });
    
    this.on("pointerout", () => {
      glow.active = false;
    });

    scene.add.existing(this);

    this.nameText = scene.add
      .text(x, y + this.displayHeight / 2 + 20, organismData.name, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#000000",
        align: "center",
      })
      .setOrigin(0.5);

  }

  public changeScale() {
    const newScale = this.baseScale * (this.HP / 100)
    this.setScale(newScale)
  }

  public changeHealth(relation: number, multiplier: number, originOrgHealth: number) {
    const newHP = this.HP + (relation*(this.HP * multiplier * (originOrgHealth / 100)));
    this.HP = newHP;
    this.changeScale();
  }
  update() {}
}
