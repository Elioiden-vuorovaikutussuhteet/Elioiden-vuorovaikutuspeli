import Phaser from "phaser";
import CloseButton from "../entities/closebutton";
import { popupTexts,type PopupText } from "../data/popupTexts";


interface PopupData {
    textId: string;
}


export default class PopupScene extends Phaser.Scene {

    private popupData!: PopupText;

    constructor() {
        super("PopupScene");
    }

    init(data: PopupData) {
       this.popupData = popupTexts[data.textId];
    }


    preload() {
        this.load.setPath("assets");
        this.load.image("close_button_sprite", "closebutton.png");
    }

    create() {
        const { width, height } = this.cameras.main;

        const menuWidth = Math.min(width * 0.3, 450);
        const menuHeight = Math.min(height * 0.7, 600);

        const rightMargin = width * 0.05;

        const menuX = width - menuWidth - rightMargin;
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

        if (!this.popupData) {
            console.error("Popup text not found");
            this.scene.stop();
            return;
        }

        const border = this.add.graphics();
        border.lineStyle(8, 0xffffff, 1);
        border.strokeRoundedRect(
            menuX,
            menuY,
            menuWidth,
            menuHeight,
            30,
        );


        this.add.text(
            menuX + menuWidth / 2,
            menuY + menuHeight * 0.15,
            this.popupData.description,
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
