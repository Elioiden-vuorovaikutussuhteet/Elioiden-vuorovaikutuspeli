import Phaser from "phaser";
import { organisms } from './organisms'

export default class Organism extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, type = "acacia") {

        const organismData = organisms.find((item) => item.id === type);

        super(scene, x, y, organismData.texture);

        scene.add.existing(this);
    }

    update() {
    }
}
