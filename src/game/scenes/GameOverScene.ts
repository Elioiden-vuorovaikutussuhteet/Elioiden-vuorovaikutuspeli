import Phaser from "phaser";
import {
  gameOverSceneConfig,
  type GameOverSceneConfig,
} from "../config/sceneConfig";

export default class GameOverScene extends Phaser.Scene {
  private config: GameOverSceneConfig;

  constructor(config?: GameOverSceneConfig) {
    const resolvedConfig =
      config && "restartSceneKey" in config ? config : gameOverSceneConfig;
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

    const { titleText, retryButton } = this.config;

    this.add
      .text(centerX, centerY + titleText.offsetY, titleText.label, {
        fontFamily: titleText.fontFamily,
        fontSize: titleText.fontSize,
        fontStyle: titleText.fontStyle,
        color: titleText.color,
      })
      .setOrigin(titleText.origin);

    const againButton = this.add
      .zone(centerX, centerY + retryButton.offsetY, width, height)
      .setInteractive();

    this.add
      .text(centerX, centerY + retryButton.offsetY, retryButton.label, {
        fontFamily: retryButton.fontFamily,
        fontSize: retryButton.fontSize,
        fontStyle: retryButton.fontStyle,
        color: retryButton.color,
      })
      .setOrigin(retryButton.origin);

    againButton.on("pointerdown", () => {
      this.scene.stop();
      for (const sceneKey of this.config.scenesToStop) {
        this.scene.stop(sceneKey);
      }
      this.scene.start(this.config.restartSceneKey);
    });
  }
}