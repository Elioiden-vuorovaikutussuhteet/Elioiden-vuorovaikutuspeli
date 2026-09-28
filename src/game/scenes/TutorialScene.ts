import Phaser from "phaser";
import CloseButton from "../entities/closebutton";

export default class TutorialScene extends Phaser.Scene {
    constructor() {
        super("TutorialScene");
    }
    preload() {
        this.load.setPath("assets");
        this.load.image("close_button_sprite", "closebutton.png");
    }

    create() {
        const centerX = this.cameras.main.centerX / 3;
        const centerY = this.cameras.main.centerY;

        const menuWidth = 300;
        const menuHeight = 500;

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

        const text = `
        Select whether you want
        to draw a positive
        or a negative relation
        by clicking on
        the corresponding icon
        and then choosing your
        starting and end organism.`;

        this.add
        .text((centerX - menuWidth / 2) - 70, centerY / 2, text, {
            fontFamily: "monospace",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#ffffff",
        })
        .setOrigin(0.0);

        const closebutton = new CloseButton(this, centerX, centerY + 200)
        closebutton.on("closeButtonClicked", () => {
            this.scene.stop();
        });
    }
};
