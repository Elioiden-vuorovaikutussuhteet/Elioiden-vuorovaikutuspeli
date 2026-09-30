import Phaser from "phaser";
import Organism from "../entities/organism";
import ArrowButtons from "../entities/arrowbuttons";
import InfoButton from "../entities/infobutton"
import { getRelation } from "../RelationsService";

export default class GameScene extends Phaser.Scene {

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private organisms: Organism[] = [];

  private selectedOrganism: Organism | null = null;

  private arrowColorValue: boolean = true;

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

    this.uiCamera.ignore(organism);
    this.uiCamera.ignore(organism.nameText);

    return organism;
  }

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image("acacia_sprite", "bullhornacacia.png");
    this.load.image("amf_sprite", "amf.png");
    this.load.image("greenbutton", "greenbutton.png");
    this.load.image("redbutton", "redbutton.png");
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
    this.scene.launch("MenuScene");
    const infobutton = new InfoButton(this, 40, 40);

    const greenButton = new ArrowButtons(
      this, 60, centerY - 50, "greenbutton"
    );
    const redButton = new ArrowButtons(
      this, 60, centerY + 50, "redbutton"
    );

    
    // Make main camera ignore the button so it stays fixed
    cam.ignore(infobutton);
    cam.ignore(greenButton);
    cam.ignore(redButton);

    infobutton.on("infoButtonClicked", () => {
      this.scene.launch("TutorialScene");
    });

    greenButton.on("arrowButtonClicked", () => {
      this.arrowColorValue = true;
      console.log(this.arrowColorValue);
    })
    redButton.on("arrowButtonClicked", () => {
      this.arrowColorValue = false;
      console.log(this.arrowColorValue);
    });

    this.createOrganism(centerX, centerY - 200, "acacia");



    this.events.once("menuClosed", () => {
      this.time.delayedCall(3000, () => {
        this.createOrganism(centerX, centerY + 200, "amf");
      });
    });
  }

  update() {
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
