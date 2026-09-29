import Phaser from "phaser";
import Organism from "../entities/organism";
import { getRelation } from "../RelationsService";

export default class GameScene extends Phaser.Scene {
  private organisms: Organism[] = [];
  private interactions: {from: string; to: string}[] = [];
  private selectedOrganism: Organism | null = null;
  private permanentArrowsGreen!: Phaser.GameObjects.Graphics;
  private previewArrowGreen!: Phaser.GameObjects.Graphics;
  private permanentArrowsRed!: Phaser.GameObjects.Graphics;
  private previewArrowRed!: Phaser.GameObjects.Graphics;
  private arrowColor = false
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

    // Create arrow here if it doesnt exist yet & relation is right
    if (relation === 1 && !this.interactions.some(
      interaction =>
      interaction.from === first.organismData.id &&
      interaction.to === second.organismData.id

    )) {
    this.drawArrow(
    this.permanentArrowsGreen,
    first.x,
    first.y,
    this.input.activePointer.x,
    this.input.activePointer.y,
    );
    this.interactions.push({
    from: first.organismData.id,
    to: second.organismData.id
    })
    }
    this.previewArrowGreen.clear();

    console.log(first.organismData.id, first.x, first.y);
    console.log(second.organismData.id, second.x, second.y);

    this.selectedOrganism = null;
  }

  private createOrganism(x: number, y: number, type: string) {
    const organism = new Organism(this, x, y, type);
  
    organism.on("organismSelected", this.getStartEndOrganisms, this);
  
    this.organisms.push(organism);
  
    return organism;
  }
  
  private drawArrow(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number){

    const dx = x2 - x1;
    const dy = y2 - y1;

    const lineLength = Math.sqrt(dx * dx + dy * dy);

    // Line unit vector
    const udx = dx / lineLength;
    const udy = dy / lineLength;

    // Perpendicular unit vector
    const pdx = -udy;
    const pdy = udx;

    // Arrowhead base vertices
    const x3 = x2 - 20 * udx + 15 * pdx;
    const y3 = y2 - 20 * udy + 15 * pdy;
    const x4 = x2 - 20 * udx - 15 * pdx;
    const y4 = y2 - 20 * udy - 15 * pdy;
   
    graphics.lineBetween(x1, y1, x2-15*udx, y2-15*udy);
    graphics.fillStyle(0x064f15, 1);
    graphics.fillTriangle(x2, y2, x3, y3, x4, y4);
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
    
    this.permanentArrowsGreen = this.add.graphics();
    this.permanentArrowsGreen.lineStyle(4, 0x064f15);
    this.previewArrowGreen = this.add.graphics();
    this.previewArrowGreen.lineStyle(4, 0x064f15);
    this.permanentArrowsRed = this.add.graphics();
    this.permanentArrowsRed.lineStyle(4, 0xe00000);
    this.previewArrowRed = this.add.graphics();
    this.previewArrowRed.lineStyle(4, 0xe00000);
  
    this.scene.launch("MenuScene");

    this.createOrganism(centerX, centerY - 200, "acacia");

    this.events.once("menuClosed", () => {
      this.time.delayedCall(3000, () => {
        this.createOrganism(centerX, centerY + 200, "amf");
      });
    });
  }

  update() {
    //This creates preview arrow when you click an organism
    if (this.selectedOrganism !== null && this.arrowColor === true) {
        this.previewArrowGreen.clear();

        this.drawArrow(
            this.previewArrowGreen,
            this.selectedOrganism.x,
            this.selectedOrganism.y,
            this.input.activePointer.x,
            this.input.activePointer.y,
        );
    }

    if (this.selectedOrganism !== null && this.arrowColor === false) {
        this.previewArrowGreen.clear();

        this.drawArrow(
            this.previewArrowRed,
            this.selectedOrganism.x,
            this.selectedOrganism.y,
            this.input.activePointer.x,
            this.input.activePointer.y,
        );
    }
  }
}
