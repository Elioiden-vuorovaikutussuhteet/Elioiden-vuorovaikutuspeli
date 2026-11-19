import type Organism from "../entities/organism";
import type { RandomEventEffect } from "../data/RandomEvents";

export default class RandomEventEffects {

public applyEffect(
  organisms: Organism[],
  effect: RandomEventEffect,
): void {
  switch (effect.type) {
    case "damage":
      for (const organism of organisms) {
        organism.changeHealth(-effect.amount);
      }
      break;
      //this is one target heal for upcoming carcass
    case "heal":
      for (const organism of organisms) {
        organism.changeHealth(effect.amount);
      }
      break;

    case "healAll":
      for (const organism of organisms) {
        organism.changeHealth(effect.amount);
      }
      break;
  }
}
}
