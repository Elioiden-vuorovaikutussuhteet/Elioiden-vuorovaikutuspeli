import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { arrowButtonUIConfig, type ArrowButtonUIConfig } from "../config";

export default class ArrowButton extends BaseButtonSprite {
  private selected = false;
  private config: ArrowButtonUIConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: ArrowButtonUIConfig = arrowButtonUIConfig,
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

  protected override handlePointerOut(): void {
    this.setAlpha(
      this.selected ? this.config.selectedAlpha : this.config.defaultAlpha,
    );
  }

  public setSelected(selected: boolean): void {
    this.selected = selected;
    this.setAlpha(
      selected ? this.config.selectedAlpha : this.config.defaultAlpha,
    );
  }
}
