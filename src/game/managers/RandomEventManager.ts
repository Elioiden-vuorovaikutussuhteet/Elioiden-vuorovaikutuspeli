import type Organism from "../entities/organism";
import { randomEvents } from "../data/RandomEvents";
import type { RandomEventData } from "../data/RandomEvents";
import RandomEventEffects from "./RandomEventEffectsManager";
import type Phaser from "phaser";
import type ArrowManager from "./ArrowManager";

export default class RandomEventManager {

  private effects = new RandomEventEffects();
  private randomEventTimer?: Phaser.Time.TimerEvent;
  // table of organisms given to isnt being updated for now

  public startRandomEvents(
    _scene: Phaser.Scene,
    organisms: Organism[],
    arrowManager: ArrowManager,
  ): void {

      if (this.randomEventTimer) {
    return;
  }
  
  
  this.randomEventTimer = _scene.time.addEvent({
    delay: 10000,
    callback: () => {
      this.triggerRandomEvent(organisms,arrowManager);
    },
    loop: true,
  });
  }

  public stopRandomEvents(): void {
  this.randomEventTimer?.remove();
  this.randomEventTimer = undefined;
}

  public triggerRandomEvent(organisms: Organism[], arrowManager: ArrowManager,): void {

    const event = this.selectEvent();

    if (!event) {
      return;
    }

    const targetPool = organisms.filter((organism) =>
      event.affectedOrganisms.includes(organism.organismData.id),
    );

    if (targetPool.length === 0) {
      return;
    }
    //if event type causes healAll targetpool is whole list, otherwise choose random target
    const targets =
    event.effect.type === "healAll" ? targetPool : [targetPool[Math.floor(Math.random() * targetPool.length)]];

    // healthchange parameter is damaging if type is "damage", otherwise heal
    const healthChange =
    event.effect.type === "damage"
    ? -event.effect.amount
    : event.effect.amount;


    this.effects.applyEffect(targets, event.effect);


    arrowManager.playRandomEventPulses(
    targets.map((organism) => organism.organismData.id),
    healthChange,
  );


    console.log(
      "RANDOM EVENT HAPPENED",
      `${event.name} happened`,
    );
  }

// Weighted random selection is used to select random event
private selectEvent(): RandomEventData {

  const totalChance = randomEvents.reduce(
    (sum, event) => sum + event.chance,
    0,
  );

  let random = Math.random() * totalChance;

  for (const event of randomEvents) {
    random -= event.chance;

    if (random < 0) {
      return event;
    }
  }

  return randomEvents[randomEvents.length - 1];
}
}