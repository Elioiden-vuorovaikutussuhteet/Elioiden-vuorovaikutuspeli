import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
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
      .text(centerX, centerY, "Start Game", {
        fontFamily: "monospace",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const menuButton = this.add
      .zone(centerX, centerY, menuWidth, menuHeight)
      .setInteractive();

    menuButton.on("pointerdown", () => {
      this.scene.stop();
      this.scene.get("GameScene").events.emit("menuClosed");
    });
  }
}
