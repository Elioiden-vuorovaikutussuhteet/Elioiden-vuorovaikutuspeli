import Phaser from "phaser";
import { menuSceneConfig, type MenuSceneConfig } from "../config/sceneConfig";

export default class MenuScene extends Phaser.Scene {
  private config: MenuSceneConfig;

  constructor(config?: MenuSceneConfig) {
    const resolvedConfig =
      config && "targetSceneKey" in config ? config : menuSceneConfig;
    super(resolvedConfig.key);
    this.config = resolvedConfig;
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const { width, height, cornerRadius } = this.config;
    const x = centerX - width / 2;
    const y = centerY - height / 2;

    const background = this.add.graphics();
    background.fillStyle(
      this.config.backgroundColor,
      this.config.backgroundAlpha,
    );
    background.fillRoundedRect(x, y, width, height, cornerRadius);

    const border = this.add.graphics();
    border.lineStyle(
      this.config.borderWidth,
      this.config.borderColor,
      this.config.borderAlpha,
    );
    border.strokeRoundedRect(x, y, width, height, cornerRadius);

    this.add
      .text(centerX, centerY, this.config.text.label, {
        fontFamily: this.config.text.fontFamily,
        fontSize: this.config.text.fontSize,
        fontStyle: this.config.text.fontStyle,
        color: this.config.text.color,
      })
      .setOrigin(this.config.text.origin);

    const menuButton = this.add
      .zone(centerX, centerY, width, height)
      .setInteractive();

    menuButton.on("pointerdown", () => {
      this.scene.stop();
      this.scene
        .get(this.config.targetSceneKey)
        .events.emit(this.config.closeEvent);
    });
  }
}