import Phaser from "phaser";
import BaseButtonContainer from "./basebuttoncontainer";

export default class CloseButton extends BaseButtonContainer {
  constructor(scene: Phaser.Scene, x: number, y: number, label = "Close") {
    super(scene, x, y, "closeButtonClicked", 90, 32, 10);

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
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      this.cornerRadius,
    );

    const text = scene.add
      .text(0, 0, label, {
        fontFamily: "monospace",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([background, border, text]);

    this.on("pointerover", () => {
      drawBackground(0.9);
      text.setColor("#cccccc");
    });

    this.on("pointerout", () => {
      drawBackground(0.7);
      text.setColor("#ffffff");
    });
  }
}
