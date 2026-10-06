import Phaser from "phaser";
import Organism from "../entities/organism";
import ArrowButtons from "../entities/arrowbuttons";
import InfoButton from "../entities/infobutton";
import { getRelation } from "../RelationsService";
import { relations } from "../data/relations";
import type { organismsRelations } from "../data/relations";

export default class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private uiCamera!: Phaser.Cameras.Scene2D.Camera;

  private organisms: Organism[] = [];
  private interactions: { from: string; to: string }[] = [];
  private rightConnections: { from: string; to: string }[] = [];
  private selectedOrganism: Organism | null = null;
  private permanentArrows!: Phaser.GameObjects.Graphics;
  private previewArrow!: Phaser.GameObjects.Graphics;
  private arrowColorValue: boolean = true;
  private organismMap = new Map<string, Organism>();
  private antsSpawned = false;
  private sapotaSpawned = false;


  private async interactionPulse(startingOrganism: Organism, initialRelation: number) {
    const visited = new Set<string>();
    const queue: { id: string; pulse: number }[] = [];
  
    visited.add(startingOrganism.organismData.id);
    queue.push({
      id: startingOrganism.organismData.id,
      pulse: initialRelation,
    });
  
    while (queue.length > 0) {
      const current = queue.shift();
  
      if (!current) {
        continue;
      }
  
      const neighbours = this.interactions
        .filter((relation) => relation.from === current.id)
        .map((relation) => relation.to);
  
      for (const element of neighbours) {
        if (!visited.has(element)) {
          const relationData = getRelation(current.id, element);
          const edgeRelation = relationData.value;
          const edgeMultiplier = relationData.mult;
  
          const newPulse = current.pulse * edgeRelation;
  
          visited.add(element);
          queue.push({
            id: element,
            pulse: newPulse,
          });
  
          const nodeOrganism = this.organismMap.get(current.id)!;
          const neighbourOrganism = this.organismMap.get(element)!;
  
          if (!nodeOrganism || !neighbourOrganism) {
            continue;
          }
  
          await new Promise(resolve => setTimeout(resolve, 100));
  
          neighbourOrganism.changeHealth(newPulse, edgeMultiplier, nodeOrganism.HP);
        }
      }
    }
  }

  private getStartEndOrganisms(organism: Organism) {
    if (this.selectedOrganism === null) {
      this.selectedOrganism = organism;
      return;
    }

    const first = this.selectedOrganism;
    const second = organism;
    const relationData = getRelation(first.organismData.id, second.organismData.id);
    const relation = relationData["value"];
    const multiplier = relationData["mult"];

    if (first.organismData.id === second.organismData.id) {
      return;
    }

    // Create arrow if it doesnt exist yet
    if (
      !this.interactions.some(
        (interaction) =>
          interaction.from === first.organismData.id &&
          interaction.to === second.organismData.id,
      )
    ) {
      // relation is positive = green(0x064f15), bad = red(0xed0924)
      if (relation === 1 && this.arrowColorValue === true) {
        this.drawArrow(
          this.permanentArrows,
          first.x,
          first.y,
          this.input.activePointer.worldX,
          this.input.activePointer.worldY,
          0x064f15,
          4,
        );
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });
        second.changeHealth(relation, multiplier, first.HP);
        this.interactionPulse(second, relation);
      } else if (relation === -1 && this.arrowColorValue === false) {
        this.drawArrow(
          this.permanentArrows,
          first.x,
          first.y,
          this.input.activePointer.worldX,
          this.input.activePointer.worldY,
          0xed0924,
          4,
        );
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });
        second.changeHealth(relation, multiplier, first.HP);
        this.interactionPulse(second, relation);
      }
    }

    this.previewArrow.clear();

    console.log(first.organismData.id, first.x, first.y, relation);
    console.log(second.organismData.id, second.x, second.y, relation);

    const allRelationsCorrect = this.checkConnections();

    if (allRelationsCorrect && !this.antsSpawned) {
      this.antsSpawned = true;
      this.createOrganism(600, 500, "ants");
    } else if (allRelationsCorrect && !this.sapotaSpawned) {
      this.sapotaSpawned = true;
      this.createOrganism(1300, 500, "sapota");
    }

    this.selectedOrganism = null;
  }

  private createOrganism(x: number, y: number, type: string) {
    const organism = new Organism(this, x, y, type);

    organism.on("organismSelected", this.getStartEndOrganisms, this);

    this.organisms.push(organism);
    this.organismMap.set(organism.organismData.id, organism);
    this.createRightConnections();
    this.uiCamera.ignore(organism);
    this.uiCamera.ignore(organism.nameText);

    return organism;
  }
  //This is ran everytime organism is added
  private createRightConnections() {
    this.rightConnections = [];
    const ids = this.organisms.map((organism) => organism.organismData.id);
    for (const organism of this.organisms) {
      const sourceRelations: organismsRelations[] = relations.filter(
        (relation) => relation.source === organism.organismData.id,
      );
      //(source = { source: "tree", target: "shroom" })
      for (const relation of sourceRelations) {
      
        if (ids.some((x) => x === relation.target)) {
          this.rightConnections.push({
            from: relation.source,
            to: relation.target,
          });
        }
      }
    }
  }

  private checkConnections() {
    //if every right connection is found in current interactions list returns true else false
    console.log(
      this.rightConnections.every((connection) =>
        this.interactions.includes(connection),
      ),
    );
    if (
      this.rightConnections.length === this.interactions.length &&
      this.rightConnections.every((x) =>
        this.interactions.some((y) => x.from === y.from && x.to === y.to),
      )
    ) {
      return true;
    } else {
      return false;
    }
  }
  private drawArrow(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
    thickness: number,
  ) {
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

    this.uiCamera.ignore(this.previewArrow);
    this.uiCamera.ignore(this.permanentArrows);

    graphics.lineStyle(thickness, color);
    graphics.fillStyle(color, 1);

    graphics.lineBetween(x1, y1, x2 - 15 * udx, y2 - 15 * udy);
    graphics.fillTriangle(x2, y2, x3, y3, x4, y4);
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
    this.load.image("ants_sprite", "ants.png");
    this.load.image("sapota_sprite", "sapota.png");
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
    this.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _over: Phaser.GameObjects.GameObject[],
        _dx: number,
        dy: number,
      ) => {
        const zoomChange = dy > 0 ? -0.1 : 0.1;
        cam.zoom = Phaser.Math.Clamp(cam.zoom + zoomChange, 0.5, 2.0);
      },
    );

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
    this.input.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        currentlyOver: Phaser.GameObjects.GameObject[],
      ) => {
        if (currentlyOver.length === 0) {
          this.selectedOrganism = null;
          this.previewArrow.clear();
        }
      },
    );

    this.scene.launch("MenuScene");
    const infobutton = new InfoButton(this, 40, 40);

    const greenButton = new ArrowButtons(this, 60, centerY - 50, "greenbutton");
    const redButton = new ArrowButtons(this, 60, centerY + 50, "redbutton");

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
    });
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
    //This creates preview arrow when you click an organism
    // arrowcolor true/false is a placeholder that tells which button player pressed in UI
    if (this.selectedOrganism !== null && this.arrowColorValue === false) {
      this.previewArrow.clear();

      this.drawArrow(
        this.previewArrow,
        this.selectedOrganism.x,
        this.selectedOrganism.y,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
        0xed0924,
        2,
      );
    }

    if (this.selectedOrganism !== null && this.arrowColorValue === true) {
      this.previewArrow.clear();

      this.drawArrow(
        this.previewArrow,
        this.selectedOrganism.x,
        this.selectedOrganism.y,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
        0x064f15,
        2,
      );
    }
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
