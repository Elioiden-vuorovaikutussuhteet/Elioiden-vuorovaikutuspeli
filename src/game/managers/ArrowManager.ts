import Phaser  from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";

// arrow related code, drawing of arrows, arrow buttons
export default class ArrowManager {
    private scene: Phaser.Scene;
    private uiCamera: Phaser.Cameras.Scene2D.Camera;
    private permanentArrows!: Phaser.GameObjects.Graphics;
    private previewArrow!: Phaser.GameObjects.Graphics;
    private arrowColorValue: boolean = true;

    constructor(scene: Phaser.Scene, uiCamera: Phaser.Cameras.Scene2D.Camera,) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    
    this.permanentArrows = this.scene.add.graphics();
    this.previewArrow = this.scene.add.graphics();

    this.permanentArrows.setDepth(100);
    this.previewArrow.setDepth(100);

    this.uiCamera.ignore(this.permanentArrows);
    this.uiCamera.ignore(this.previewArrow);
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
        
    public update(selectedOrganism: Organism | null) {
        this.previewArrow.clear();

          if (selectedOrganism === null) {
            return;
        }

          const color = this.arrowColorValue
            ? 0x064f15
            : 0xed0924;

          this.drawArrow(
            this.previewArrow,
            selectedOrganism.x,
            selectedOrganism.y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY,
            color,
            2,
        );
    }
    
}