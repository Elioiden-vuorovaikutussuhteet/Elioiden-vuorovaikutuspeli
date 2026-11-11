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

    const menuHeight = Math.min(
      height * this.config.heightRatio,
      this.config.maxHeight,
    );
    const centerX = width / 2;

    const background = this.add.graphics();
    const border = this.add.graphics();

    const { text } = this.config;
    const fontSize = Math.min(width * text.fontSizeRatio, text.maxFontSize);

    const sections = [
      { content: this.popupData.title, style: text.title },
      { content: `${this.popupData.relation} relation`, style: text.relation },
      { content: this.popupData.description, style: text.description },
    ];

    const topPadding = 16;
    const sectionGap = 6;
    const bottomReserved = this.config.closeButton.bottomOffset + 24;
    const maxTextHeight = menuHeight - topPadding - bottomReserved;

    let wrapWidth =
      Math.min(width * this.config.widthRatio, this.config.maxWidth) *
      text.wordWrapWidthRatio;
    const maxAllowedWrapWidth = width * 0.9;

    const textObjects = sections.map((section) =>
      this.add
        .text(centerX, 0, section.content, {
          fontFamily: text.fontFamily,
          fontSize: `${fontSize}px`,
          fontStyle: section.style.fontStyle,
          color: text.color,
          wordWrap: {
            width: wrapWidth,
          },
          align: text.align,
        })
        .setOrigin(text.originX, text.originY),
    );

    const getTotalTextHeight = () =>
      textObjects.reduce((sum, obj) => sum + obj.height, 0) +
      sectionGap * (textObjects.length - 1);

    while (
      getTotalTextHeight() > maxTextHeight &&
      wrapWidth < maxAllowedWrapWidth
    ) {
      wrapWidth = Math.min(wrapWidth + 60, maxAllowedWrapWidth);
      for (const textObject of textObjects) {
        textObject.setWordWrapWidth(wrapWidth);
      }
    }

    const maxContentWidth = Math.max(
      ...textObjects.map((obj) => obj.width),
      160,
    );
    const horizontalPadding = 48;
    const menuWidth = maxContentWidth + horizontalPadding;

    const bottomMargin = height * this.config.rightMarginRatio;
    const menuX = (width - menuWidth) / 2;
    const menuY = height - menuHeight - bottomMargin;

    let currentOffsetY = topPadding;
    for (const textObject of textObjects) {
      textObject.setY(menuY + currentOffsetY);
      currentOffsetY += textObject.height + sectionGap;
    }

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
