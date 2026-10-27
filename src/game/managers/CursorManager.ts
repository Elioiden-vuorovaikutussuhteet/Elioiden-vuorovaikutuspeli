import Phaser from "phaser";
import cursorbutton from "../entities/cursorbutton";


export default class CursorManager {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createCursorButton(centerY: number): void {
    const cursorButton = new cursorbutton(
      this.scene,
      60,
      centerY + 150,
      "cursor",
    );

    this.scene.cameras.main.ignore(cursorButton);

  }
}