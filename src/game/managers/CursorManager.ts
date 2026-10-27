import Phaser from "phaser";
import cursorbutton from "../entities/cursorbutton";
import ArrowManager from "./ArrowManager";


export default class CursorManager {
  private readonly scene: Phaser.Scene;
  private readonly arrowManager: ArrowManager;

  constructor(scene: Phaser.Scene, arrowManager: ArrowManager) {
    this.scene = scene;
    this.arrowManager = arrowManager;
  }

  public createCursorButton(centerY: number): void {
    const cursorButton = new cursorbutton(
      this.scene,
      60,
      centerY + 150,
      "cursor",
    );

    this.scene.cameras.main.ignore(cursorButton);

    cursorButton.on("cursorButtonClicked", () => {
      this.arrowManager.setCursorMode(true);
    });
  }
}