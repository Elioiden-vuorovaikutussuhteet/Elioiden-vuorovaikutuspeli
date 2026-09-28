import Phaser from "phaser";
import Organism from "../entities/organism";
import { getRelation } from "../RelationsService";

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
    const relation = getRelation(
      first.organismData.id,
      second.organismData.id
    );
  
    if (first.organismData.id === second.organismData.id) {
      return;
    }

    // Create arrow here
    console.log(first.organismData.id, first.x, first.y, relation);
    console.log(second.organismData.id, second.x, second.y, relation);

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
