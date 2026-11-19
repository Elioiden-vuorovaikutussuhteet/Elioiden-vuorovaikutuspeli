import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { infoButtonUIConfig, type InfoButtonUIConfig } from "../config";

export default class InfoButton extends BaseButtonSprite {
  private config: InfoButtonUIConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: InfoButtonUIConfig = infoButtonUIConfig,
  ) {
    super(
      scene,
      x,
      y,
      config.texture,
      config.clickEvent,
      config.scale,
      config.hoverAlpha,
      config.defaultAlpha,
    );
    this.config = config;
  }

  protected override handlePointerOver(): void {
    this.setTint(this.config.hoverTint);
  }

  protected override handlePointerOut(): void {
    this.clearTint();
  }
}