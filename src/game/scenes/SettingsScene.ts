import Phaser from "phaser";
import CloseButton from "../entities/closebutton";
import PulseButton from "../entities/pulsebutton";
import {
  optionsSceneConfig,
  settingsSceneConfig,
  type SettingsSceneConfig,
} from "../config/sceneConfig";
import {
  getPulseSpeed,
  setPulseSpeed,
  type PulseSpeed,
} from "../services/PulseSpeedService";

export default class SettingsScene extends Phaser.Scene {
  private config: SettingsSceneConfig;

  constructor(config?: SettingsSceneConfig) {
    const resolvedConfig =
      config && "widthRatio" in config ? config : settingsSceneConfig;
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

    const optionsHeight = Math.min(
      height * optionsSceneConfig.heightRatio,
      optionsSceneConfig.maxHeight,
    );
    const optionsY =
      (height - optionsHeight) / optionsSceneConfig.topOffsetDivisor;
    const minTopY = optionsY + optionsHeight + 20;
    const bottomMargin = 20;

    const menuWidth = Math.min(
      width * this.config.widthRatio,
      this.config.maxWidth,
    );
    const menuHeight = Math.max(
      0,
      Math.min(
        height * this.config.heightRatio,
        this.config.maxHeight,
        height - minTopY - bottomMargin,
      ),
    );

    const leftMargin = width * this.config.leftMarginRatio;
    const menuX = leftMargin / 2;
    const menuY = Math.max(
      minTopY,
      (height - menuHeight) / this.config.topOffsetDivisor,
    );

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

    const { xRatios, topOffsetRatio, slotFillRatio, labels, labelText, event } =
      this.config.pulseButtons;
    const buttonY = menuY + menuHeight * topOffsetRatio;

    const buttons: Record<PulseSpeed, PulseButton> = {
      slow: new PulseButton(this, menuX + menuWidth * xRatios.slow, buttonY),
      normal: new PulseButton(
        this,
        menuX + menuWidth * xRatios.normal,
        buttonY,
      ),
      fast: new PulseButton(this, menuX + menuWidth * xRatios.fast, buttonY),
    };

    const slotWidth = menuWidth / 3;
    const labelFontSize = Math.min(
      width * labelText.fontSizeRatio,
      labelText.maxFontSize,
    );

    (Object.keys(buttons) as PulseSpeed[]).forEach((speed) => {
      const btn = buttons[speed];
      const scale = Math.min(1, (slotWidth * slotFillRatio) / btn.width);
      btn.setScale(scale);
      this.add
        .text(
          btn.x,
          btn.y + btn.displayHeight / 2 + labelText.gap,
          labels[speed],
          {
            fontFamily: labelText.fontFamily,
            fontSize: `${labelFontSize}px`,
            fontStyle: labelText.fontStyle,
            color: labelText.color,
            align: "center",
          },
        )
        .setOrigin(0.5, 0);
    });

    const select = (speed: PulseSpeed) => {
      setPulseSpeed(speed);
      (Object.keys(buttons) as PulseSpeed[]).forEach((key) => {
        if (key === speed) buttons[key].setSelected();
        else buttons[key].clearTint();
      });
    };

    (Object.keys(buttons) as PulseSpeed[]).forEach((speed) => {
      buttons[speed].on(event, () => select(speed));
    });

    select(getPulseSpeed());
  }
}
