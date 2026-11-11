import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";

export default class CursorButton extends BaseButtonSprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, "cursorButtonClicked", 0.05);
  }
}
