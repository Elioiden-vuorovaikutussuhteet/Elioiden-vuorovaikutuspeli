import Phaser from "phaser";
import Organism from "../entities/organism";

export default class GameScene extends Phaser.Scene {
  private organisms: Organism[] = [];

  private selectedOrganism: Organism | null = null;

  private getStartEndOrganisms(organism: Organism) {
    if (this.selectedOrganism === null) {
      this.selectedOrganism = organism;
      return;
    }

    const first = this.selectedOrganism;
    const second = organism;
  
    // Create arrow here
    console.log(first.organismData.id, organism.x, organism.y);
    console.log(second.organismData.id, organism.x, organism.y);

    this.selectedOrganism = null;
  }

  private createOrganism(x: number, y: number, type: string) {
    const organism = new Organism(this, x, y, type);
  
    organism.on("organismSelected", this.getStartEndOrganisms, this);
  
    this.organisms.push(organism);
  
    return organism;
  }
  
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

    this.createOrganism(centerX, centerY - 200, "acacia");

    this.events.once("menuClosed", () => {
      this.time.delayedCall(3000, () => {
        this.createOrganism(centerX, centerY + 200, "amf");
      });
    });
  }

  update() {}
}
