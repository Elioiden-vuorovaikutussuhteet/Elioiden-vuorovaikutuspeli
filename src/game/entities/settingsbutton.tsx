import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { settingsButtonUIConfig, type SettingsButtonUIConfig } from "../config";

export default class SettingsButton extends BaseButtonSprite {
  private config: SettingsButtonUIConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: SettingsButtonUIConfig = settingsButtonUIConfig,
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