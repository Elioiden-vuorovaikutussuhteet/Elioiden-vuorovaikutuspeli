import Phaser from "phaser";
import Button from "./button";

export default class ArrowButton extends Button {
  private selected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, "arrowButtonClicked", 0.1);
  }

  protected override handlePointerOut(): void {
    this.setAlpha(this.selected ? 0.8 : 1);
  };

  public setSelected(selected: boolean): void {
    this.selected = selected;
    this.setAlpha(selected ? 0.8 : 1);
  }
}
