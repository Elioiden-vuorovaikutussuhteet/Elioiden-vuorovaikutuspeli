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
    const centerX = width / 2;

    const background = this.add.graphics();
    const border = this.add.graphics();

    const { text } = this.config;
    const fontSize = Math.min(width * text.fontSizeRatio, text.maxFontSize);

    const topPadding = 18;
    const sectionGap = 10;
    const horizontalPadding = 48;
    const bottomReserved = this.config.closeButton.bottomOffset + 32;
    const maxAllowedWrapWidth = Math.max(width * 0.9 - horizontalPadding, 160);

    const titleText = this.add
      .text(centerX, 0, this.popupData.title, {
        fontFamily: text.fontFamily,
        fontSize: `${fontSize}px`,
        fontStyle: text.title.fontStyle,
        color: text.title.color,
        wordWrap: {
          width: maxAllowedWrapWidth,
        },
        align: text.align,
      })
      .setOrigin(text.originX, text.originY);

    let wrapWidth = Math.min(
      Math.max(titleText.width, Math.min(width * 0.35, 360)),
      maxAllowedWrapWidth,
    );

    const descriptionText = this.add
      .text(centerX, 0, this.popupData.description, {
        fontFamily: text.fontFamily,
        fontSize: `${fontSize}px`,
        fontStyle: text.description.fontStyle,
        color: text.color,
        wordWrap: {
          width: wrapWidth,
        },
        align: text.align,
      })
      .setOrigin(text.originX, text.originY);

    const maxTargetDescriptionHeight = Math.ceil(fontSize * 1.4 * 3);

    while (
      descriptionText.height > maxTargetDescriptionHeight &&
      wrapWidth < maxAllowedWrapWidth
    ) {
      wrapWidth = Math.min(wrapWidth + 60, maxAllowedWrapWidth);
      descriptionText.setWordWrapWidth(wrapWidth);
    }

    const textObjects = [titleText, descriptionText];
    const maxContentWidth = Math.max(
      ...textObjects.map((obj) => obj.width),
      160,
    );
    const menuWidth = Math.min(
      maxContentWidth + horizontalPadding,
      width * 0.94,
    );
    const totalTextHeight =
      titleText.height + sectionGap + descriptionText.height;
    const menuHeight = topPadding + totalTextHeight + bottomReserved;

    const bottomMargin = height * this.config.rightMarginRatio;
    const menuX = (width - menuWidth) / 2;
    const menuY = height - menuHeight - bottomMargin;

    titleText.setY(menuY + topPadding);
    descriptionText.setY(menuY + topPadding + titleText.height + sectionGap);

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
