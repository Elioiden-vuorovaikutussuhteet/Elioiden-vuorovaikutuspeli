import Phaser from "phaser";
import CloseButton from "../entities/closebutton";
import {
  tutorialSceneConfig,
  type TutorialSceneConfig,
} from "../config/sceneConfig";

export default class TutorialScene extends Phaser.Scene {
  private config: TutorialSceneConfig;

  constructor(config?: TutorialSceneConfig) {
    const resolvedConfig =
      config && "widthRatio" in config ? config : tutorialSceneConfig;
    super(resolvedConfig.key);
    this.config = resolvedConfig;
  }

  preload() {
    this.load.setPath(this.config.assetsPath);
    for (const image of this.config.images) {
      this.load.image(image.key, image.file);
    }
  }

  create() {
    const { width, height } = this.cameras.main;

    const menuWidth = Math.min(
      width * this.config.widthRatio,
      this.config.maxWidth,
    );
    const menuHeight = Math.min(
      height * this.config.heightRatio,
      this.config.maxHeight,
    );

    const leftMargin = width * this.config.leftMarginRatio;
    const menuX = leftMargin / 2;
    const menuY = (height - menuHeight) / this.config.topOffsetDivisor;

    const background = this.add.graphics();
    background.fillStyle(
      this.config.backgroundColor,
      this.config.backgroundAlpha,
    );
    background.fillRoundedRect(
      menuX,
      menuY,
      menuWidth,
      menuHeight,
      this.config.cornerRadius,
    );

    const border = this.add.graphics();
    border.lineStyle(
      this.config.borderWidth,
      this.config.borderColor,
      this.config.borderAlpha,
    );
    border.strokeRoundedRect(
      menuX,
      menuY,
      menuWidth,
      menuHeight,
      this.config.cornerRadius,
    );

    const fontSize = Math.min(
      width * this.config.text.fontSizeRatio,
      this.config.text.maxFontSize,
    );

    this.add
      .text(
        menuX + menuWidth / 2,
        menuY + menuHeight * this.config.text.topOffsetRatio,
        this.config.text.content,
        {
          fontFamily: this.config.text.fontFamily,
          fontSize: `${fontSize}px`,
          fontStyle: this.config.text.fontStyle,
          color: this.config.text.color,
          wordWrap: {
            width: menuWidth * this.config.text.wordWrapWidthRatio,
          },
          align: this.config.text.align,
        },
      )
      .setOrigin(this.config.text.originX, this.config.text.originY);

    const closeButton = new CloseButton(
      this,
      menuX + menuWidth / 2,
      menuY + menuHeight - this.config.closeButton.bottomOffset,
    );

    closeButton.on(this.config.closeButton.event, () => {
      this.scene.stop();
    });
  }
}