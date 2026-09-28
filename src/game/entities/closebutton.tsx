import Phaser from "phaser";

export default class CloseButton extends Phaser.GameObjects.Sprite {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "close_button_sprite");
        this.setScale(0.25);
        this.setInteractive();
        this.on("pointerdown", () => {
            this.emit("closeButtonClicked", this);
        });

        this.on("pointerover", () => {
            this.setTint(0x777777);
        });

        this.on("pointerout", () => {
            this.clearTint();
        });

        scene.add.existing(this);
    }
}
