import Phaser from "phaser";

export default class CloseButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, label = "Close") {
    super(scene, x, y);

    const buttonWidth = 90;
    const buttonHeight = 32;
    const cornerRadius = 10;

    const background = scene.add.graphics();
    const drawBackground = (alpha: number) => {
      background.clear();
      background.fillStyle(0x000000, alpha);
      background.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius,
      );
    };
    drawBackground(0.7);

    const border = scene.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      cornerRadius,
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

    this.setSize(buttonWidth, buttonHeight);
    this.setInteractive({ useHandCursor: true });

    this.on("pointerdown", () => {
      this.emit("closeButtonClicked", this);
    });

    this.on("pointerover", () => {
      drawBackground(0.9);
      text.setColor("#cccccc");
    });

    this.on("pointerout", () => {
      drawBackground(0.7);
      text.setColor("#ffffff");
    });

    scene.add.existing(this);
  }
}
