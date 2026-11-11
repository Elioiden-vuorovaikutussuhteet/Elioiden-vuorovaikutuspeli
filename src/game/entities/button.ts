import Phaser from "phaser";

export default class Button extends Phaser.GameObjects.Sprite {
    private eventName: string;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        eventName: string,
        scale: number,
    ) {
        super(scene, x, y, texture);
        this.eventName = eventName;
        this.setScale(scale);
        this.setInteractive();
        this.setScrollFactor(0);

        this.on("pointerover", this.handlePointerOver, this);
        this.on("pointerout", this.handlePointerOut, this);
        this.on("pointerdown", this.handlePointerDown, this);
        
        scene.add.existing(this);
    }

    protected handlePointerOver(): void {
        this.setAlpha(0.8);
    }

    protected handlePointerOut(): void {
        this.setAlpha(1);
    }
    
    private handlePointerDown(): void {
        this.emit(this.eventName, this)
        
    }
}
