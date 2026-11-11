import Phaser from "phaser";
import Button from "./button";

export default class CursorButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, "cursorButtonClicked", 0.05);
  }
}
