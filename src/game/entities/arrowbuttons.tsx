import Phaser from "phaser";

export default class ArrowButton extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, button: string){
        super(scene, x, y, button);

        this.setScale(0.1);

        this.setInteractive();
        this.setScrollFactor(0);

        this.on("pointerover", () => {
            this.setAlpha(0.8);
        });

        this.on("pointerout", () => {
            this.setAlpha(1);
        });
        this.on("pointerdown", () =>{
            this.emit("arrowButtonClicked", this);
        });

        scene.add.existing(this);
    }
}