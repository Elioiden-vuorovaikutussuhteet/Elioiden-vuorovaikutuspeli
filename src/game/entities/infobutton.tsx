import Phaser from "phaser";

export default class InfoButton extends Phaser.GameObjects.Sprite {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "infobutton_sprite");
        this.setScale(0.15);
        this.setInteractive();
        this.setScrollFactor(0);
        this.on("pointerdown", () => {
            this.emit("infoButtonClicked", this);
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
