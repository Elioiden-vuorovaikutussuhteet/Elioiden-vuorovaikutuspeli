import Phaser  from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import InteractionManager from "./InteractionManager";
import ConnectionManager from "./ConnectionManager";
import OrganismManager from "./OrganismManager";

// arrow related code, drawing of arrows, arrow buttons arrowChecker is old getStartEndOrganisms
export default class ArrowManager {
    private scene: Phaser.Scene;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;

    private interactionManager!: InteractionManager;
    private connectionManager!: ConnectionManager;
    private organismManager!: OrganismManager;

    private permanentArrows!: Phaser.GameObjects.Graphics;
    private previewArrow!: Phaser.GameObjects.Graphics;
    private arrowColorValue: boolean = true;
    private selectedOrganism: Organism | null = null;
    private interactions: Connection[];

    private antsSpawned = false;
    private sapotaSpawned = false;

    constructor(
        scene: Phaser.Scene,
        uiCamera: Phaser.Cameras.Scene2D.Camera,
        interactionManager: InteractionManager,
        connectionManager: ConnectionManager,
        organismManager: OrganismManager,
        interactions: Connection[],

    ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    
    this.permanentArrows = this.scene.add.graphics();
    this.previewArrow = this.scene.add.graphics();

    this.permanentArrows.setDepth(100);
    this.previewArrow.setDepth(100);

    this.uiCamera.ignore(this.permanentArrows);
    this.uiCamera.ignore(this.previewArrow);

    this.interactionManager = interactionManager;
    this.connectionManager = connectionManager;
    this.organismManager = organismManager;

    this.interactions = interactions;
    }

    public arrowChecker(organism: Organism) {
        if (this.selectedOrganism === null) {
          this.selectedOrganism = organism;
          return;
        }

        const first = this.selectedOrganism;
        const second = organism;
        const relationData = getRelation(first.organismData.id, second.organismData.id);
        const relation = relationData["value"];
        const multiplier = relationData["mult"];

        const arrowColorValue = this.getArrowColorValue();

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
          if (relation === 1 && arrowColorValue === true) {
            this.drawArrow(
              this.getPermanentArrows(),
              first.x,
              first.y,
              this.scene.input.activePointer.worldX,
              this.scene.input.activePointer.worldY,
              0x064f15,
              4,
            );
            this.interactions.push({
              from: first.organismData.id,
              to: second.organismData.id,
            });
            second.changeHealth(relation, multiplier, first.HP);
            this.interactionManager.interactionPulse(second, relation,);
          } else if (relation === -1 && arrowColorValue === false) {
            this.drawArrow(
              this.getPermanentArrows(),
              first.x,
              first.y,
              this.scene.input.activePointer.worldX,
              this.scene.input.activePointer.worldY,
              0xed0924,
              4,
            );
            this.interactions.push({
              from: first.organismData.id,
              to: second.organismData.id,
            });
            second.changeHealth(relation, multiplier, first.HP);
            this.interactionManager.interactionPulse(second, relation);
          }
        }

        this.clearPreview();

        console.log(first.organismData.id, first.x, first.y, relation);
        console.log(second.organismData.id, second.x, second.y, relation);

        const allRelationsCorrect = this.connectionManager.checkConnections();

        if (allRelationsCorrect && !this.antsSpawned) {
          this.antsSpawned = true;
          this.organismManager.createOrganism(600, 500, "ants");
        } else if (allRelationsCorrect && !this.sapotaSpawned) {
          this.sapotaSpawned = true;
          this.organismManager.createOrganism(1300, 500, "sapota");
        }

        this.selectedOrganism = null;
      }

    public drawArrow(
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

    
    
    public createArrowButtons(centerY: number){
        const greenButton = new ArrowButtons(this.scene, 60, centerY - 50, "greenbutton");
        const redButton = new ArrowButtons(this.scene, 60, centerY + 50, "redbutton");
        
        this.scene.cameras.main.ignore(greenButton);
        this.scene.cameras.main.ignore(redButton);  

        greenButton.on("arrowButtonClicked", () => {
            this.arrowColorValue = true;
            console.log(this.arrowColorValue);
        });
        
        redButton.on("arrowButtonClicked", () => {
            this.arrowColorValue = false;
            console.log(this.arrowColorValue);
        });     
    }
    
    public getArrowColorValue() {
        return this.arrowColorValue;
    }

    public clearPreview() {
        this.previewArrow.clear();
    }

    public getPermanentArrows() {
        return this.permanentArrows;
    }
        
    public update() {
        this.previewArrow.clear();

          if (this.selectedOrganism === null) {
            return;
        }

          const color = this.arrowColorValue
            ? 0x064f15
            : 0xed0924;

          this.drawArrow(
            this.previewArrow,
            this.selectedOrganism.x,
            this.selectedOrganism.y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY,
            color,
            2,
        );
    }
    
}