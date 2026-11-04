import Phaser from "phaser";
import type { RandomEventData } from "../data/RandomEvents";
import type Organism from "../entities/organism";





export default class RandomEventManager {


     public startRandomEvents(scene: Phaser.Scene,organisms: Organism[]): void{
        // Timers or other triggers can be later added here
        this.triggerRandomEvent(organisms);
    }

    public triggerRandomEvent(organisms: Organism[]): void {


        //choose crandom event, select viable random target, apply event

    }

}