import Phaser from "phaser";
import BaseButtonContainer from "./basebuttoncontainer";

export default class HintButton extends BaseButtonContainer {
  constructor(scene: Phaser.Scene, x: number, y: number){
    super(scene, x, y, "hintButtonClicked", 130, 36, 10);

    const background = scene.add.graphics();
    const drawBackground = (alpha: number) => {
      background.clear();
      background.fillStyle(0x000000, alpha);
      background.fillRoundedRect(
        -this.buttonWidth / 2,
        -this.buttonHeight / 2,
        this.buttonWidth,
        this.buttonHeight,
        this.cornerRadius,
      );
    };
    drawBackground(0.7);

    const border = scene.add.graphics();
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      this.cornerRadius,
    );

    const text = scene.add
      .text(0, 0, "Hint 100", {
        fontFamily: "monospace",
        fontSize: "15px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    const coin = scene.add.image(0, 0, "coin").setOrigin(0, 0.5).setScale(0.4);

    const gap = 6;
    const totalWidth = (text.width ?? 72) + gap + (coin.displayWidth ?? 19);
    const startX = -totalWidth / 2;

    text.setX(startX);
    coin.setX(startX + (text.width ?? 72) + gap);

    this.add([background, border, text, coin]);

    this.on("pointerover", () => {
      drawBackground(0.9);
    });

    this.on("pointerout", () => {
      drawBackground(0.7);
    });
  }
}
