import Phaser from "phaser";
import Organism from "../entities/organism";
import InfoButton from "../entities/infobutton"
import { getRelation } from "../RelationsService";

export default class GameScene extends Phaser.Scene {

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private organisms: Organism[] = [];
  private interactions: {from: string; to: string}[] = [];
  private selectedOrganism: Organism | null = null;
  private permanentArrows!: Phaser.GameObjects.Graphics;
  private previewArrow!: Phaser.GameObjects.Graphics;
  private arrowColor = true
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

    // Create arrow if it doesnt exist yet
    if (!this.interactions.some(
      interaction =>
      interaction.from === first.organismData.id &&
      interaction.to === second.organismData.id

    )) {
      // relation is positive = green(0x064f15), bad = red(0xed0924)
      if (relation === 1){
      this.drawArrow(this.permanentArrows, first.x, first.y, this.input.activePointer.x, this.input.activePointer.y, 0x064f15,4);
      } else if (relation === -1){
      this.drawArrow(this.permanentArrows, first.x, first.y, this.input.activePointer.x, this.input.activePointer.y, 0xed0924,4);
      }
      this.interactions.push({
      from: first.organismData.id,
      to: second.organismData.id
      })}

    this.previewArrow.clear();

    console.log(first.organismData.id, first.x, first.y);
    console.log(second.organismData.id, second.x, second.y);

    this.selectedOrganism = null;
  }

  private createOrganism(x: number, y: number, type: string) {
    const organism = new Organism(this, x, y, type);

    organism.on("organismSelected", this.getStartEndOrganisms, this);

    this.organisms.push(organism);

    this.uiCamera.ignore(organism);
    this.uiCamera.ignore(organism.nameText);

    return organism;
  }
  
  private drawArrow(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number,color: number,thickness: number){

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

    graphics.lineStyle(thickness, color);
    graphics.fillStyle(color, 1);
   
    graphics.lineBetween(x1, y1, x2-15*udx, y2-15*udy);
    graphics.fillTriangle(x2, y2, x3, y3, x4, y4);
  }
  
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("acacia_sprite", "bullhornacacia.png");
    this.load.image("amf_sprite", "amf.png");
    this.load.image("infobutton_sprite", "altinfo.png");
  }

  create() {
    const cam = this.cameras.main;
    const screenW = cam.width;
    const screenH = cam.height;

    cam.setBounds(-screenW, -screenH, screenW * 3, screenH * 3);
    cam.scrollX = 0;
    cam.scrollY = 0;
    
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    //Mouse wheel zoom event
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      const zoomChange = dy > 0 ? -0.1 : 0.1;
      cam.zoom = Phaser.Math.Clamp(cam.zoom + zoomChange, 0.5, 2.0);
    });

    this.uiCamera = this.cameras.add(0, 0, screenW, screenH);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    this.permanentArrows = this.add.graphics();
    this.previewArrow = this.add.graphics();
    this.permanentArrows.setDepth(100);
    this.previewArrow.setDepth(100);

    //Eventlistener for: If players clicks on empty space, preview arrow disappears
    this.input.on("pointerdown", (_pointer: Phaser.Input.Pointer,currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length === 0) {
      this.selectedOrganism = null;
      this.previewArrow.clear();
      }
    });
    
    this.scene.launch("MenuScene");
    const infobutton = new InfoButton(this, 40, 40);
    
    // Make main camera ignore the button so it stays fixed
    cam.ignore(infobutton);

    infobutton.on("infoButtonClicked", () => {
      this.scene.launch("TutorialScene");
    });


    this.createOrganism(centerX, centerY - 200, "acacia");

    this.events.once("menuClosed", () => {
      this.time.delayedCall(3000, () => {
        this.createOrganism(centerX, centerY + 200, "amf");
      });
    });
  }

  update() {
    //This creates preview arrow when you click an organism
    // arrowcolor true/false is a placeholder that tells which button player pressed in UI
    if (this.selectedOrganism !== null && this.arrowColor === false) {
      this.previewArrow.clear();

      this.drawArrow(
          this.previewArrow,
          this.selectedOrganism.x,
          this.selectedOrganism.y,
          this.input.activePointer.x,
          this.input.activePointer.y,
          0xed0924,
          2
        );
    }

    if (this.selectedOrganism !== null && this.arrowColor === true) {
        this.previewArrow.clear();
    
        this.drawArrow(
            this.previewArrow,
            this.selectedOrganism.x,
            this.selectedOrganism.y,
            this.input.activePointer.x,
            this.input.activePointer.y,
            0x064f15,
            2
        );
    const cam = this.cameras.main;
    const speed = 10;

    if (this.cursors.left.isDown) {
      cam.scrollX -= speed;
    } else if (this.cursors.right.isDown) {
      cam.scrollX += speed;
    }

    if (this.cursors.up.isDown) {
      cam.scrollY -= speed;
    } else if (this.cursors.down.isDown) {
      cam.scrollY += speed;
    }
  }
}
}