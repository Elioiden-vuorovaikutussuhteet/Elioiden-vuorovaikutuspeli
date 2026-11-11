import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";
import { cursorButtonUIConfig, type CursorButtonUIConfig } from "../config";

export default class CursorButton extends BaseButtonSprite {
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
  }
}