import Phaser from "phaser";

export default class CloseButton extends Phaser.GameObjects.Sprite {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "close_button_sprite");
        this.setScale(0.3);
        this.setInteractive();
        // this.enableFilters();
        this.on("pointerdown", () => {
            this.emit("closeButtonClicked", this);
        });
        scene.add.existing(this);
    }
}
