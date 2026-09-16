import Phaser from "phaser";
import { organisms } from './organisms'

export default class Organism extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, type = "acacia") {

        const organismData = organisms.find((item) => item.id === type);
        // Get the specific organisms data from organisms.ts based on the type used in constructor
        
        if (!organismData) {
            throw new Error(`Organism type "${type}" not found`);
        }

        super(scene, x, y, organismData.texture);

        this.setScale(organismData.default_scale);

        scene.add.existing(this);
    }

    update() {
    }
}
