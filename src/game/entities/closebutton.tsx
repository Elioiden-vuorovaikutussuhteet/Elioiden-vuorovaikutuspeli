import Phaser from "phaser";
import Button from "./button";

export default class CloseButton extends Button {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "close_button_sprite", "closeButtonClicked", 0.2);
    }

    protected override handlePointerOver(): void {
        this.setTint(0x777777);
    };

    protected override handlePointerOut(): void {
        this.clearTint();
    };
}
