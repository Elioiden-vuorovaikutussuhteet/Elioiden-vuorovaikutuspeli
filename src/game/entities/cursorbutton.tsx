import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { cursorButtonUIConfig, type CursorButtonUIConfig } from "../config";

export default class CursorButton extends BaseButtonSprite {
  private selected = false;
  private config: CursorButtonUIConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: CursorButtonUIConfig = cursorButtonUIConfig,
  ) {
    super(
      scene,
      x,
      y,
      texture,
      config.clickEvent,
      config.scale,
      config.hoverAlpha,
      config.defaultAlpha,
    );
    this.config = config;
  }

  protected override handlePointerOver(): void {
    this.setTint(
      this.selected ? this.config.selectedTint : this.config.hoverTint,
    );
  }

  protected override handlePointerOut(): void {
    if (this.selected) {
      this.setTint(this.config.selectedTint);
    } else {
      this.clearTint();
    }
  }

  public setSelected(selected: boolean): void {
    this.selected = selected;
    if (selected) {
      this.setTint(this.config.selectedTint);
    } else {
      this.clearTint();
    }
  }
}
