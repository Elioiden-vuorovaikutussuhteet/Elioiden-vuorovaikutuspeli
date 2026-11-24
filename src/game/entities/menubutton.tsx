import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { menuButtonUIConfig, type MenuButtonUIConfig } from "../config";

export default class MenuButton extends BaseButtonSprite {
  // private config: MenuButtonUIConfig;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: MenuButtonUIConfig = menuButtonUIConfig,
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
    // this.config = config;
  }

    protected override handlePointerOver(): void {
    super.handlePointerOver();
    }

    protected override handlePointerOut(): void {
    super.handlePointerOut();
    }
}