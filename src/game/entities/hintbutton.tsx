import Phaser from "phaser";

export default class HintButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const buttonWidth = 80;
    const buttonHeight = 36;
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
    border.lineStyle(3, 0xffffff, 1);
    border.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      cornerRadius,
    );

    const text = scene.add
      .text(0, 0, "Hint", {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([background, border, text]);

    this.setSize(buttonWidth, buttonHeight);
    this.setInteractive({ useHandCursor: true });
    this.setScrollFactor(0);

    this.on("pointerdown", () => {
      this.emit("hintButtonClicked", this);
    });

    this.on("pointerover", () => {
      drawBackground(0.9);
    });

    this.on("pointerout", () => {
      drawBackground(0.7);
    });

    scene.add.existing(this);
  }
}
