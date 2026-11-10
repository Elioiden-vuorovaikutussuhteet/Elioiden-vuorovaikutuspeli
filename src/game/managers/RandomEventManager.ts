import Phaser from "phaser";
import type Organism from "../entities/organism";





export default class RandomEventManager {


     public startRandomEvents(_scene: Phaser.Scene,organisms: Organism[]): void{
        this.triggerRandomEvent(organisms);
    }

    public triggerRandomEvent(_organisms: Organism[]): void {
        void _organisms;

        console.log("RANDOM EVENT STARTED")
        //choose crandom event, select viable random target, apply event

    }

    }

    