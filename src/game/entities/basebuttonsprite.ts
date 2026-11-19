import Phaser from "phaser";
import { cursorButtonUIConfig } from "../config";

export default class BaseButtonSprite extends Phaser.GameObjects.Sprite {
  private eventName: string;
  protected hoverAlpha: number;
  protected defaultAlpha: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    eventName: string,
    scale: number,
    hoverAlpha = cursorButtonUIConfig.hoverAlpha,
    defaultAlpha = cursorButtonUIConfig.defaultAlpha,
  ) {
    super(scene, x, y, texture);
    this.eventName = eventName;
    this.hoverAlpha = hoverAlpha;
    this.defaultAlpha = defaultAlpha;

    this.setScale(scale);
    this.setInteractive();
    this.setScrollFactor(0);

    this.on("pointerover", this.handlePointerOver, this);
    this.on("pointerout", this.handlePointerOut, this);
    this.on("pointerdown", this.handlePointerDown, this);

    scene.add.existing(this);
  }

  protected handlePointerOver(): void {
    this.setAlpha(this.hoverAlpha);
  }

  protected handlePointerOut(): void {
    this.setAlpha(this.defaultAlpha);
  }

  private handlePointerDown(): void {
    this.emit(this.eventName, this);
  }
}