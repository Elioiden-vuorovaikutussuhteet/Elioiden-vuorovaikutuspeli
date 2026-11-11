import Phaser from "phaser";
import CloseButton from "../entities/closebutton";
import { popupTexts, type PopupText } from "../data/popupTexts";
import { popupSceneConfig, type PopupSceneConfig } from "../config/sceneConfig";

interface PopupData {
  textId: string;
}

export default class PopupScene extends Phaser.Scene {
  private popupData!: PopupText;
  private config: PopupSceneConfig;

  constructor(config?: PopupSceneConfig) {
    const resolvedConfig =
      config && "rightMarginRatio" in config ? config : popupSceneConfig;
    super(resolvedConfig.key);
    this.config = resolvedConfig;
  }

  init(data: PopupData) {
    this.popupData = popupTexts[data.textId];
  }

  preload() {
    this.load.setPath(this.config.assetsPath);
    for (const image of this.config.images) {
      this.load.image(image.key, image.file);
    }
  }

  create() {
    if (!this.popupData) {
      console.error("Popup text not found");
      this.scene.stop();
      return;
    }

    const { width, height } = this.cameras.main;

    const menuWidth = Math.min(
      width * this.config.widthRatio,
      this.config.maxWidth,
    );
    const menuHeight = Math.min(
      height * this.config.heightRatio,
      this.config.maxHeight,
    );

    const bottomMargin = height * this.config.rightMarginRatio;
    const menuX = (width - menuWidth) / 2;
    const menuY = height - menuHeight - bottomMargin;

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

    const { text } = this.config;
    const fontSize = Math.min(width * text.fontSizeRatio, text.maxFontSize);
    const centerX = menuX + menuWidth / 2;

    const sections = [
      { content: this.popupData.title, style: text.title },
      { content: `${this.popupData.relation} relation`, style: text.relation },
      { content: this.popupData.description, style: text.description },
    ];

    for (const section of sections) {
      this.add
        .text(
          centerX,
          menuY + menuHeight * section.style.topOffsetRatio,
          section.content,
          {
            fontFamily: text.fontFamily,
            fontSize: `${fontSize}px`,
            fontStyle: section.style.fontStyle,
            color: text.color,
            wordWrap: {
              width: menuWidth * text.wordWrapWidthRatio,
            },
            align: text.align,
          },
        )
        .setOrigin(text.originX, text.originY);
    }

    const closeButton = new CloseButton(
      this,
      centerX,
      menuY + menuHeight - this.config.closeButton.bottomOffset,
    );

    closeButton.on(this.config.closeButton.event, () => {
      this.scene.stop();
    });
  }
}
