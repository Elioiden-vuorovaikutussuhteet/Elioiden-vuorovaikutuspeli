import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const menuWidth = 400;
    const menuHeight = 200;

    const backround = this.add.graphics();
    backround.fillStyle(0x000000, 0.7);
    backround.fillRoundedRect(
      centerX - menuWidth / 2,
      centerY - menuHeight / 2,
      menuWidth,
      menuHeight,
      30,
    );

    const border = this.add.graphics();
    border.lineStyle(8, 0xffffff, 1);
    border.strokeRoundedRect(
      centerX - menuWidth / 2,
      centerY - menuHeight / 2,
      menuWidth,
      menuHeight,
      30,
    );

    this.add
      .text(centerX, centerY - 30, "GAME OVER", {
        fontFamily: "monospace",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const againButton = this.add
      .zone(centerX, centerY + 30, menuWidth, menuHeight)
      .setInteractive();

    this.add
      .text(centerX, centerY + 30, "Try again", {
        fontFamily: "monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#fffff0",
      })
      .setOrigin(0.5);

    againButton.on("pointerdown", () => {
      this.scene.stop();
      this.scene.stop("PopupScene");
      this.scene.start("GameScene")
    });
  }
}