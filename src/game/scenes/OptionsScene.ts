import Phaser from "phaser";
import InfoButton from "../entities/infobutton";
import SettingsButton from "../entities/settingsbutton";
import {
  optionsSceneConfig,
  type OptionsSceneConfig,
} from "../config/sceneConfig";

export default class OptionsScene extends Phaser.Scene {
  private config: OptionsSceneConfig;

  constructor(config?: OptionsSceneConfig) {
    const resolvedConfig =
      config && "widthRatio" in config ? config : optionsSceneConfig;
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
    
    const infoLeftMargin = this.config.infoButton.leftOffset
    const infoBottomOffset = this.config.infoButton.bottomOffset

    const infoButton = new InfoButton(
      this,
      menuX + infoLeftMargin,
      menuY + infoBottomOffset,
    );

    infoButton.on("infoButtonClicked", () => {
      this.scene.stop(this.config.scenes.settings);
      this.scene.launch(this.config.scenes.tutorial);
    });

    const settingsLeftMargin = this.config.settingsButton.leftOffset
    const settingsBottomOffset = this.config.settingsButton.bottomOffset

    const settingsButton = new SettingsButton(
      this,
      menuX + settingsLeftMargin,
      menuY + settingsBottomOffset,
    );

    settingsButton.on("pointerdown", () => {
      this.scene.stop(this.config.scenes.tutorial);
      this.scene.launch(this.config.scenes.settings);
    });

    this.events.once("shutdown", () => {
      this.scene.stop(this.config.scenes.tutorial);
      this.scene.stop(this.config.scenes.settings);
    });
  }
}