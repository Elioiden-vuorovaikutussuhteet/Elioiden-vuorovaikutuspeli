import Phaser from "phaser";

export default class BaseButtonContainer extends Phaser.GameObjects.Container {
    private eventName: string;
    protected buttonWidth: number;
    protected buttonHeight: number;
    protected cornerRadius: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        eventName: string,
        buttonWidth: number,
        buttonHeight: number,
        cornerRadius: number,
    ) {
        super(scene, x, y);

        this.eventName = eventName;
        this.buttonWidth = buttonWidth;
        this.buttonHeight = buttonHeight;
        this.cornerRadius = cornerRadius

        this.setSize(buttonWidth, buttonHeight);
        this.setInteractive({ useHandCursor: true });
        this.setScrollFactor(0);

        this.on("pointerdown", this.handlePointerDown, this);

        scene.add.existing(this);
    }

    private handlePointerDown(): void {
        this.emit(this.eventName, this);
    }
}
