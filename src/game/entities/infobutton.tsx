import Phaser from "phaser";
import BaseButtonSprite from "./basebuttonsprite";

export default class InfoButton extends BaseButtonSprite {
    constructor (scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "infobutton_sprite", "infoButtonClicked", 0.05);
    }

    protected override handlePointerOver(): void {
            this.setTint(0x777777);
    };

    protected override handlePointerOut(): void {
        this.clearTint();
    }
}
