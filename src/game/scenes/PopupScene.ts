import Phaser from "phaser";

export default class TutorialScene extends Phaser.Scene {
    constructor() {
        super("PopupScene");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("close_button_sprite", "closebutton.png");
    }

    create() {
        const { width, height } = this.cameras.main;

        const menuWidth = Math.min(width * 0.3, 450);
        const menuHeight = Math.min(height * 0.7, 600);

        const leftMargin = width * 0.05;

        const menuX = leftMargin / 2;
        const menuY = (height - menuHeight) / 4;

        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.7);
        background.fillRoundedRect(
            menuX,
            menuY,
            menuWidth,
            menuHeight,
            30,
        );

        const border = this.add.graphics();
        border.lineStyle(8, 0xffffff, 1);
        border.strokeRoundedRect(
            menuX,
            menuY,
            menuWidth,
            menuHeight,
            30,
        );

        const text = `
Select whether you want
to draw a positive
or a negative relation
by clicking on
the corresponding icon
and then choosing your
starting and end organism.
        `.trim();

        this.add.text(
            menuX + menuWidth / 2,
            menuY + menuHeight * 0.15,
            text,
            {
                fontFamily: "monospace",
                fontSize: `${Math.min(width * 0.015, 25)}px`,
                fontStyle: "bold",
                color: "#ffffff",
                wordWrap: {
                    width: menuWidth * 0.8,
                },
                align: "center",
            },
        ).setOrigin(0.5, 0);

        const closeButton = new CloseButton(
            this,
            menuX + menuWidth / 2,
            menuY + menuHeight - 50,
        );

        closeButton.on("closeButtonClicked", () => {
            this.scene.stop();
        });
    }
}
